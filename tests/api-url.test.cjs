const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createServiceClient } = require('./load-services.cjs');

test('requests preserve the configured localhost URL without Android host substitution', async () => {
  const originalUrl = process.env.EXPO_PUBLIC_API_URL;
  const originalFetch = global.fetch;
  try {
    process.env.EXPO_PUBLIC_API_URL = 'http://localhost:5140';
    global.fetch = async (url) => {
      assert.equal(url, 'http://localhost:5140/reports');
      return new Response(JSON.stringify({ reports: [] }), { status: 200 });
    };
    const client = createServiceClient();
    const api = client.load('services/api');
    assert.equal(api.apiUrl('/reports/1'), 'http://localhost:5140/reports/1');
    await api.apiRequest('/reports');
  } finally {
    process.env.EXPO_PUBLIC_API_URL = originalUrl;
    global.fetch = originalFetch;
  }
});
