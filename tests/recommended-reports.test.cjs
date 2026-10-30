const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createServiceClient} = require('./load-services.cjs');
const report = {id: 42, type: 'agua', photos: [], description: '', ubication: 'Guadalajara'};
const response = (overrides = {}) => ({reports: [report], recommendations: [{report_id: 42, reason: 'nearby', distance_km: 1.25}], has_more: true, next_offset: 20, ...overrides});
function client(apiRequest) {
  return createServiceClient({api: {apiRequest, apiUrl: path => `http://api.test${path}`}});
}

test('recommendations request optional authentication, pagination and paired location, and normalize reports', async () => {
  const c = client(async (path, options, auth) => {
    assert.equal(path, '/reports/recommended?limit=20&offset=0&latitude=20.67&longitude=-103.35');
    assert.equal(auth, 'optional');
    return response();
  });
  const page = await c.load('services/get-recommended-reports').GetRecommendedReports(0, {latitude: 20.67, longitude: -103.35});
  assert.equal(page.reports[0].category, 'agua');
  assert.equal(page.reports[0].folio, '42');
  assert.equal(page.next_offset, 20);
  assert.equal(c.load('services/cache').apiCache.peek('entity:report:42').id, 42);
});

test('guest pages work without location, including an empty final page', async () => {
  const c = client(async path => {
    assert.equal(path, '/reports/recommended?limit=20&offset=20');
    return response({reports: [], recommendations: [], has_more: false, next_offset: null});
  });
  assert.deepEqual((await c.load('services/get-recommended-reports').GetRecommendedReports(20)).reports, []);
});

test('malformed pages and nonadvancing cursors fail rather than looping or silently showing all reports', async () => {
  for (const data of [response({next_offset: 0}), response({reports: null}), response({recommendations: []}), response({has_more: false}), response({recommendations: [{report_id: 99, reason: 'recent', distance_km: null}]})]) {
    const c = client(async () => data);
    await assert.rejects(c.load('services/get-recommended-reports').GetRecommendedReports(), /inválida/);
  }
  const c = client(async () => {throw new Error('offline');});
  await assert.rejects(c.load('services/get-recommended-reports').GetRecommendedReports(), /offline/);
});

test('session changes clear cached personalized pages', async () => {
  let calls = 0;
  const c = client(async () => {calls++; return response();});
  const get = c.load('services/get-recommended-reports').GetRecommendedReports;
  await get(); await get();
  assert.equal(calls, 1);
  c.load('services/session').setAuthSession(false);
  await get();
  assert.equal(calls, 2);
});
