const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createServiceClient } = require('./load-services.cjs');
const report = { id: 42, type: 'agua', description: 'Fuga', latitude: 20.67, longitude: -103.35,
  ubication: 'Guadalajara', status: 'reported', status_version: 0, can_manage: true,
  created_at: '2026-10-29T12:00:00Z', user_id: 7, username: 'Alex',
  photos: [], like_count: 0, comment_count: 0, liked_by_me: false };
const draft = { category: 'agua', description: '  Fuga  ', latitude: 20.67, longitude: -103.35, photos: [] };
function client(apiRequest) {
  return createServiceClient({ api: { apiRequest, apiUrl: path => `http://api.test${path}` } });
}

test('empty server feeds stay empty and failures never become sample reports', async () => {
  const empty = client(async () => ({ reports: [] }));
  assert.deepEqual(await empty.load('services/GetAllReports').GetAllReports(), []);
  const unavailable = client(async () => { throw new Error('offline'); });
  await assert.rejects(unavailable.load('services/GetAllReports').GetAllReports(), /offline/);
  await assert.rejects(unavailable.load('services/GetReportById').GetReportById(999), /offline/);
  const malformed = client(async () => ({}));
  await assert.rejects(malformed.load('services/GetAllReports').GetAllReports(), /inválida/);
});

test('backend IDs, categories, authors, and photo URLs drive the UI', async () => {
  const c = client(async () => ({ report: { ...report, photos: [{ id: 2, url: '/reports/42/photos/2/content' }] } }));
  const result = await c.load('services/GetReportById').GetReportById(42);
  assert.equal(result.folio, '42');
  assert.equal(result.category, 'agua');
  assert.equal(result.username, 'Alex');
  assert.equal(result.photos[0].url, 'http://api.test/reports/42/photos/2/content');
});

test('current report store publishes to the API and shows only server-confirmed ownership and counts', async () => {
  let resolveCreate;
  const requests = [];
  const c = client(async (path, options, authenticated) => {
    requests.push(path);
    if (path === '/reports') return { reports: [] };
    if (path === '/reports/create') {
      assert.equal(authenticated, true);
      assert.deepEqual(JSON.parse(options.body), { type: 'agua', description: 'Fuga', latitude: 20.67, longitude: -103.35 });
      return new Promise(resolve => { resolveCreate = resolve; });
    }
    throw new Error(`Unexpected request: ${path}`);
  });
  const store = c.load('store/useReportsStore').useReportsStore;
  await store.getState().initialize();
  assert.deepEqual(store.getState().reports, []);
  const creation = store.getState().submitReport(draft);
  assert.equal(store.getState().reports.length, 0);
  resolveCreate({ report_id: 42, report });
  await creation;
  assert.equal(store.getState().reports[0].id, 42);
  assert.deepEqual(store.getState().userReportIds, [42]);
  const cache = c.load('services/cache').apiCache;
  cache.set('entity:report:42', { ...store.getState().reports[0], comment_count: 4, like_count: 3 });
  assert.equal(store.getState().reports[0].comment_count, 4);
  assert.equal(store.getState().reports[0].like_count, 3);
  c.load('services/session').setAuthSession(false);
  assert.equal(store.getState().reports.length, 0);
  await store.getState().refreshReports();
  assert.deepEqual(store.getState().userReportIds, []);
  assert.ok(requests.includes('/reports/create'));
});

test('failed report writes keep the server list unchanged; missing create details are fetched by real ID', async () => {
  const failed = client(async () => { throw new Error('server unavailable'); });
  const failedStore = failed.load('store/useReportsStore').useReportsStore;
  await assert.rejects(failedStore.getState().submitReport(draft), /server unavailable/);
  assert.equal(failedStore.getState().reports.length, 0);
  const c = client(async path => path === '/reports/create' ? { report_id: 42 } : { report });
  const store = c.load('store/useReportsStore').useReportsStore;
  const created = await store.getState().submitReport(draft);
  assert.equal(created.username, 'Alex');
  assert.equal(created.id, 42);
});

test('server rejection of a like leaves counts unchanged', async () => {
  const c = client(async path => {
    if (path === '/reports') return { reports: [report] };
    throw new Error('unauthorized');
  });
  const store = c.load('store/useReportsStore').useReportsStore;
  await store.getState().initialize();
  await assert.rejects(store.getState().toggleUpvote(42), /unauthorized/);
  assert.equal(store.getState().reports[0].like_count, 0);
  assert.equal(store.getState().reports[0].liked_by_me, false);
});

test('session identity restores from the server-issued token; expired tokens do not enable posting', async () => {
  const claims = { user_id: '7', username: 'José', user_email: 'jose@example.invalid', exp: Math.floor(Date.now()/1000) + 3600 };
  const token = 'header.' + Buffer.from(JSON.stringify(claims)).toString('base64url') + '.signature';
  const c = createServiceClient({ storage: new Map([['auth_token', token]]) });
  const session = c.load('services/session');
  assert.equal(await session.loadSession(), true);
  assert.equal(c.load('services/cache').apiCache.peek('session:user').username, 'José');
  claims.exp = 1;
  const expired = createServiceClient({ storage: new Map([['auth_token', 'header.' + Buffer.from(JSON.stringify(claims)).toString('base64url') + '.signature']]) });
  assert.equal(await expired.load('services/session').loadSession(), false);
  assert.equal(expired.storage.has('auth_token'), false);
});

test('account changes start a fresh feed and never reuse another account’s pending response', async () => {
  let finishOld;
  let calls = 0;
  const c = client(async () => {
    calls++;
    if (calls === 1) return { reports: [report] };
    if (calls === 2) return new Promise(resolve => { finishOld = resolve; });
    return { reports: [{ ...report, id: 55, user_id: 8, username: 'Other', can_manage: true }] };
  });
  const store = c.load('store/useReportsStore').useReportsStore;
  await store.getState().initialize();
  const old = store.getState().refreshReports();
  await new Promise(resolve => setImmediate(resolve));
  c.load('services/session').setAuthSession(true, { id: 8, username: 'Other', email: 'other@example.invalid' });
  await store.getState().refreshReports();
  finishOld({ reports: [report] });
  await old;
  assert.deepEqual(store.getState().reports.map(item => item.id), [55]);
  assert.deepEqual(store.getState().userReportIds, [55]);
});

test('a confirmed create remains successful if its follow-up detail request fails', async () => {
  const c = client(async path => {
    if (path === '/reports/create') return { report_id: 42 };
    if (path === '/reports') return { reports: [] };
    throw new Error('detail temporarily unavailable');
  });
  const store = c.load('store/useReportsStore').useReportsStore;
  const result = await store.getState().submitReport(draft);
  assert.equal(result.id, 42);
  assert.equal(result.folio, '42');
  assert.equal(store.getState().reports.length, 0);
});
