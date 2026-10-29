const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createServiceClient } = require('./load-services.cjs');
const { createAddressLookup } = createServiceClient().load('services/address-lookup');
const flush = () => new Promise(resolve => setImmediate(resolve));
const point = (latitude) => ({ latitude, longitude: -103.35 });
function setup(lookup) {
  const queued = new Map();
  const states = [];
  let id = 0;
  const controller = createAddressLookup({
    lookup, onChange: state => states.push(state),
    schedule: (callback, delay) => { assert.equal(delay, 350); queued.set(++id, callback); return id; },
    cancel: timer => queued.delete(timer),
  });
  return { controller, states, queued, run: () => { for (const [id, fn] of queued) { queued.delete(id); fn(); } } };
}

test('map movement immediately clears the old address and debounces rapid updates', async () => {
  const calls = [];
  const c = setup(async coordinates => { calls.push(coordinates); return [{ street: 'Juárez', streetNumber: '12', district: 'Centro', city: 'Guadalajara' }]; });
  c.controller.select(point(20.67));
  c.controller.select(point(20.68));
  c.controller.select(point(20.69));
  assert.equal(c.queued.size, 1);
  assert.equal(calls.length, 0);
  assert.equal(c.states.at(-1).status, 'loading');
  assert.equal(c.states.at(-1).address, '');
  c.run(); await flush();
  assert.deepEqual(calls, [point(20.69)]);
  assert.equal(c.states.at(-1).address, 'Juárez 12');
  assert.equal(c.states.at(-1).status, 'ready');
  c.controller.select(point(20.70));
  assert.equal(c.states.at(-1).address, '');
  assert.equal(c.states.at(-1).colonia, '');
  assert.equal(c.states.at(-1).municipality, '');
  c.controller.dispose();
});

test('a late result from an old pin cannot replace the latest street', async () => {
  const completions = [];
  const c = setup(() => new Promise(resolve => completions.push(resolve)));
  c.controller.select(point(20.67)); c.run();
  c.controller.select(point(20.68)); c.run();
  completions[1]([{ street: 'Nueva' }]); await flush();
  completions[0]([{ street: 'Anterior' }]); await flush();
  assert.equal(c.states.at(-1).address, 'Nueva');
  assert.equal(c.states.at(-1).latitude, 20.68);
});

test('empty lookups and failures stop loading and allow retry at the same point', async () => {
  let result = [];
  const c = setup(async () => { if (result instanceof Error) throw result; return result; });
  c.controller.select(point(20.67)); c.run(); await flush();
  assert.equal(c.states.at(-1).status, 'unavailable');
  result = new Error('offline');
  c.controller.select(point(20.67), true); c.run(); await flush();
  assert.equal(c.states.at(-1).status, 'error');
  assert.equal(c.states.at(-1).address, '');
  result = [{ street: 'Recuperada' }];
  c.controller.select(point(20.67), true); c.run(); await flush();
  assert.equal(c.states.at(-1).status, 'ready');
  assert.equal(c.states.at(-1).address, 'Recuperada');
});

test('navigation cancels scheduled work and ignores in-flight lookup results', async () => {
  let resolve;
  const c = setup(() => new Promise(done => { resolve = done; }));
  c.controller.select(point(20.67)); c.run();
  c.controller.dispose();
  resolve([{ street: 'Too late' }]); await flush();
  assert.equal(c.states.length, 1);
  const queued = setup(async () => []);
  queued.controller.select(point(20.68));
  queued.controller.dispose();
  assert.equal(queued.queued.size, 0);
});
