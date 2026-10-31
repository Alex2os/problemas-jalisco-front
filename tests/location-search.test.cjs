const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createServiceClient} = require('./load-services.cjs');
const location = {name: 'Escuela Morelos', latitude: 20.67, longitude: -103.35,
  formatted_address: 'Escuela Morelos, Centro, Guadalajara', address: 'Morelos 10',
  street: 'Morelos', street_number: '10', colonia: 'Centro', municipality: 'Guadalajara'};
function setup(search) {
  const states = [];
  const controller = createServiceClient().load('services/location-search').createLocationSearch({search, onChange: state => states.push(state)});
  return {controller, states};
}

test('editing does not request autocomplete; explicit submission validates and deduplicates pending searches', async () => {
  let calls = 0, finish;
  const c = setup(() => {calls++; return new Promise(resolve => {finish = resolve;});});
  c.controller.setQuery('Ca');
  await c.controller.submit();
  assert.match(c.states.at(-1).validation, /3 caracteres/);
  assert.equal(calls, 0);
  c.controller.setQuery('Calle Morelos');
  assert.equal(calls, 0);
  const pending = c.controller.submit();
  await c.controller.submit();
  assert.equal(calls, 1);
  finish([location]); await pending;
  assert.equal(c.states.at(-1).status, 'ready');
  assert.deepEqual(c.states.at(-1).locations, [location]);
});

test('responses from an edited, cleared or older query cannot replace the current search', async () => {
  const finish = [];
  const c = setup(query => new Promise(resolve => finish.push({query, resolve})));
  c.controller.setQuery('Old query'); const old = c.controller.submit();
  c.controller.setQuery('New query'); const current = c.controller.submit();
  finish[1].resolve([location]); await current;
  finish[0].resolve([{...location, name: 'Old'}]); await old;
  assert.equal(c.states.at(-1).query, 'New query');
  assert.equal(c.states.at(-1).locations[0].name, location.name);
  c.controller.setQuery('Other query'); const other = c.controller.submit();
  c.controller.setQuery(''); finish[2].resolve([location]); await other;
  assert.equal(c.states.at(-1).status, 'idle');
  assert.deepEqual(c.states.at(-1).locations, []);
});

test('disposing for navigation or a session change ignores late success and failures', async () => {
  for (const fail of [false, true]) {
    let finish;
    const c = setup(() => new Promise((resolve, reject) => {finish = fail ? reject : resolve;}));
    c.controller.setQuery('Morelos'); const pending = c.controller.submit();
    c.controller.dispose(); const count = c.states.length;
    finish(fail ? new Error('late error') : [location]); await pending;
    assert.equal(c.states.length, count);
  }
});

test('failed refresh retains results and error while retrying, then clears the error on recovery', async () => {
  let response = [location];
  const c = setup(async () => {if (response instanceof Error) throw response; return response;});
  c.controller.setQuery('Morelos'); await c.controller.submit();
  response = new Error('Sin conexión'); await c.controller.submit();
  assert.equal(c.states.at(-1).error, 'Sin conexión');
  assert.deepEqual(c.states.at(-1).locations, [location]);
  response = [];
  const retry = c.controller.submit();
  assert.equal(c.states.at(-1).status, 'loading');
  assert.equal(c.states.at(-1).error, 'Sin conexión');
  await retry;
  assert.equal(c.states.at(-1).status, 'ready');
  assert.equal(c.states.at(-1).error, '');
  assert.deepEqual(c.states.at(-1).locations, []);
});

test('search service uses authenticated encoded requests and preserves partial fields without fabricating them', async () => {
  const partial = {...location, street: null, street_number: null, colonia: null, municipality: null};
  const client = createServiceClient({api: {apiRequest: async (path, options, auth) => {
    assert.equal(path, '/locations/search?query=Calle%20%26%20Morelos%20%23%C3%A1');
    assert.equal(auth, true);
    return {locations: [partial]};
  }}});
  assert.deepEqual(await client.load('services/search-locations').SearchLocations(' Calle   & Morelos #á '), [partial]);
});

test('search service distinguishes empty results from invalid responses and rejects invalid coordinates', async () => {
  const service = data => createServiceClient({api: {apiRequest: async () => data}}).load('services/search-locations').SearchLocations;
  assert.deepEqual(await service({locations: []})('Morelos'), []);
  for (const data of [{}, {locations: null}, {locations: [null]}, {locations: [{...location, latitude: NaN}]},
    {locations: [{...location, longitude: -105.69}]}, {locations: [{...location, name: ''}]},
    {locations: [{...location, municipality: undefined}]}, {locations: Array(6).fill(location)}]) {
    await assert.rejects(service(data)('Morelos'), /leer las ubicaciones/);
  }
});

test('invalid queries send no requests and backend failures keep their Spanish messages', async () => {
  let calls = 0;
  const client = createServiceClient({api: {apiRequest: async () => {calls++; throw new Error('Demasiadas solicitudes. Intenta más tarde.');}}});
  const search = client.load('services/search-locations').SearchLocations;
  for (const query of ['', '  ', ' a ', 'x'.repeat(201)]) await assert.rejects(search(query), /caracteres/);
  assert.equal(calls, 0);
  await assert.rejects(search('Morelos'), /Demasiadas solicitudes/);
  assert.equal(calls, 1);
});

test('address boundaries match the API including fractional values near longitude edges', () => {
  const {isInJaliscoBounds} = createServiceClient().load('services/get-location-address');
  assert.equal(isInJaliscoBounds(18.92, -105.68), true);
  assert.equal(isInJaliscoBounds(22.75, -101.50), true);
  assert.equal(isInJaliscoBounds(20, -105.681), false);
  assert.equal(isInJaliscoBounds(20, -101.499), false);
});

test('search errors do not write raw address queries to frontend diagnostics', async () => {
  const previousFetch = global.fetch, previousWarn = console.warn;
  const warnings = [];
  console.warn = (...args) => warnings.push(args);
  try {
    const client = createServiceClient({storage: new Map([['auth_token', 'test-token']])});
    const search = client.load('services/search-locations').SearchLocations;
    global.fetch = async () => {throw new Error('Private address in transport error');};
    await assert.rejects(search('Private address'), /conectar/);
    global.fetch = async () => new Response(JSON.stringify({message: 'No disponible', query: 'Private address'}), {status: 503});
    await assert.rejects(search('Private address'), /No disponible/);
    assert.deepEqual(warnings, []);
  } finally {global.fetch = previousFetch; console.warn = previousWarn;}
});
