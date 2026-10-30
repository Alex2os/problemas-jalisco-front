const assert = require('node:assert/strict');
const {test} = require('node:test');
const {createServiceClient} = require('./load-services.cjs');

async function withFetch(fetch, run) {
  const previous = global.fetch;
  global.fetch = fetch;
  try { await run(createServiceClient()); }
  finally { global.fetch = previous; }
}

test('native Error and browser TypeError failures show a Spanish connection message', async () => {
  for (const failure of [new Error('Network request failed'), new TypeError('Failed to fetch')]) {
    await withFetch(async () => { throw failure; }, async c => {
      const api = c.load('services/api');
      await assert.rejects(api.apiRequest('/reports'), error =>
        error instanceof api.ApiConnectionError && error.reason === 'network' && /conectar.*servidor/.test(error.message));
    });
  }
});

test('a connection lost while reading the response is handled as a transport failure', async () => {
  await withFetch(async () => ({text: async () => {throw new Error('connection closed');}}), async c => {
    await assert.rejects(c.load('services/api').apiRequest('/reports'), error => error.reason === 'network');
  });
});

test('timeouts have a distinct message and clear the request timer', async () => {
  const previousSet = global.setTimeout, previousClear = global.clearTimeout;
  let cleared = false;
  const timer = {};
  global.setTimeout = callback => {queueMicrotask(callback); return timer;};
  global.clearTimeout = value => {assert.equal(value, timer); cleared = true;};
  try {
    await withFetch(async (_, {signal}) => new Promise((_, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), {once: true});
    }), async c => {
      await assert.rejects(c.load('services/api').apiRequest('/reports'), error =>
        error.reason === 'timeout' && /tardando demasiado/.test(error.message));
    });
    assert.equal(cleared, true);
  } finally { global.setTimeout = previousSet; global.clearTimeout = previousClear; }
});

test('HTML service outages retain their HTTP status and show a useful fallback', async () => {
  await withFetch(async () => new Response('<html>upstream unavailable</html>', {status: 503}), async c => {
    const api = c.load('services/api');
    await assert.rejects(api.apiRequest('/reports'), error =>
      error instanceof api.ApiError && error.status === 503 && /no está disponible/.test(error.message));
  });
});

test('backend validation messages remain intact, and malformed successful responses do not become connection errors', async () => {
  await withFetch(async () => new Response(JSON.stringify({message: 'La descripción es muy larga.'}), {status: 400}), async c => {
    await assert.rejects(c.load('services/api').apiRequest('/reports'), error =>
      error.status === 400 && error.message === 'La descripción es muy larga.');
  });
  await withFetch(async () => new Response('not json', {status: 200}), async c => {
    await assert.rejects(c.load('services/api').apiRequest('/reports'), error =>
      error.name !== 'ApiConnectionError' && /leer la respuesta/.test(error.message));
  });
});

test('failed report writes are not retried or treated as logout and warn about uncertain completion', async () => {
  let requests = 0;
  await withFetch(async () => {requests++; throw new Error('Network request failed');}, async c => {
    c.storage.set('auth_token', 'existing-token');
    const api = c.load('services/api');
    await assert.rejects(api.apiRequest('/reports/create', {method: 'POST', body: '{}'}, true), error =>
      error.reason === 'network' && /Revisa tus reportes/.test(error.message));
    assert.equal(c.storage.get('auth_token'), 'existing-token');
    assert.equal(requests, 1);
  });
});
