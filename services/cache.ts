// Session cache with keyed subscriptions; server responses remain the source of truth.
export function createCache() {
  const values = new Map<string, unknown>();
  const pending = new Map<string, Promise<unknown>>();
  const generations = new Map<string, number>();
  const listeners = new Map<string, Set<() => void>>();
  let revision = 0;
  function notify(key: string) {
    [...(listeners.get(key) || [])].forEach((listener) => listener());
  }
  function set<T>(key: string, value: T) {
    generations.set(key, (generations.get(key) || 0) + 1);
    pending.delete(key);
    if (!Object.is(values.get(key), value)) {
      values.set(key, value);
      notify(key);
    }
  }
  return {
    revision: () => revision,
    peek: <T>(key: string) => values.get(key) as T | undefined,
    set,
    subscribe(key: string, listener: () => void) {
      const group = listeners.get(key) || new Set<() => void>();
      group.add(listener);
      listeners.set(key, group);
      return () => {
        group.delete(listener);
        if (!group.size) listeners.delete(key);
      };
    },
    get<T>(key: string, loader: () => Promise<T>, refresh = false): Promise<T> {
      if (pending.has(key)) return pending.get(key) as Promise<T>;
      if (!refresh && values.has(key))
        return Promise.resolve(values.get(key) as T);
      const generation = generations.get(key) || 0;
      const request = Promise.resolve()
        .then(loader)
        .then((value) => {
          if ((generations.get(key) || 0) === generation) {
            values.set(key, value);
            notify(key);
          }
          return value;
        })
        .finally(() => {
          if (pending.get(key) === request) pending.delete(key);
        });
      pending.set(key, request);
      return request;
    },
    patch<T>(prefix: string, update: (value: T, key: string) => T) {
      for (const [key, value] of values)
        if (key.startsWith(prefix)) {
          const next = update(value as T, key);
          if (!Object.is(next, value)) set(key, next);
        }
    },
    invalidate(prefix: string, exact = false) {
      revision++;
      for (const key of new Set([...values.keys(), ...pending.keys()])) {
        if (exact ? key === prefix : key.startsWith(prefix)) {
          values.delete(key);
          pending.delete(key);
          generations.set(key, (generations.get(key) || 0) + 1);
          notify(key);
        }
      }
    },
  };
}
export const apiCache = createCache();
