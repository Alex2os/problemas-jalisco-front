import { getLocationSearchError, type LocationSearchResult } from "./search-locations";

export interface LocationSearchState {
  query: string;
  locations: LocationSearchResult[];
  status: "idle" | "loading" | "ready" | "error";
  error: string;
  validation: string;
}

export function createLocationSearch({ search, onChange }: {
  search: (query: string) => Promise<LocationSearchResult[]>;
  onChange: (state: LocationSearchState) => void;
}) {
  let state: LocationSearchState = { query: "", locations: [], status: "idle", error: "", validation: "" };
  let generation = 0;
  let pending: symbol | undefined;
  let disposed = false;
  const publish = (next: LocationSearchState) => { state = next; onChange(next); };
  return {
    setQuery(query: string) {
      if (disposed) return;
      generation++;
      pending = undefined;
      publish({ query, locations: [], status: "idle", error: "", validation: "" });
    },
    async submit() {
      if (disposed || pending) return;
      const validation = getLocationSearchError(state.query);
      if (validation) { publish({ ...state, validation }); return; }
      const query = state.query;
      const request = ++generation;
      const operation = Symbol();
      pending = operation;
      publish({ ...state, status: "loading", validation: "" });
      try {
        const locations = await search(query);
        if (disposed || request !== generation) return;
        publish({ ...state, locations, status: "ready", error: "" });
      } catch (failure) {
        if (disposed || request !== generation) return;
        publish({ ...state, status: "error", error: failure instanceof Error ? failure.message : "No se pudo buscar la ubicación. Intenta de nuevo." });
      } finally {
        if (pending === operation) pending = undefined;
      }
    },
    dispose() { disposed = true; generation++; pending = undefined; },
  };
}
