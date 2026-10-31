const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createServiceClient } = require('./load-services.cjs');
const { ApiError } = createServiceClient().load('services/api');
const initial = {
  id: 23, type: 'baches', username: 'owner', user_id: 7,
  photos: [{ id: 7, url: '/reports/23/photos/7/content' }, { id: 8, url: '/reports/23/photos/8/content' }],
  status: 'reported', status_version: 0, can_manage: true, liked_by_me: true, like_count: 2, comment_count: 1,
};
const photo = { uri: require('node:url').pathToFileURL(__filename).href, name: 'new.jpg', type: 'image/jpeg', size: 100 };
function client(request) {
  return createServiceClient({ api: { ApiError, apiRequest: request, apiUrl: path => `http://api.test${path}` } });
}

test('editor saves status, staged deletions, and new photos through authenticated server operations', async () => {
  const calls = [];
  let report = structuredClone(initial);
  const c = client(async (path, options = {}, authenticated) => {
    calls.push([path, options.method || 'GET']);
    if (path === '/reports/23' && !options.method) return { report };
    assert.equal(authenticated, true);
    if (path === '/reports/23/status') {
      assert.deepEqual(JSON.parse(options.body), { status: 'resolved', expected_version: 0 });
      report = { ...report, status: 'resolved', status_version: 1 };
    } else if (path === '/reports/23/photos/7') {
      assert.equal(options.method, 'DELETE');
      report = { ...report, photos: report.photos.filter(item => item.id !== 7) };
    } else if (path === '/reports/23/photos') {
      assert.equal(options.method, 'POST');
      assert.ok(options.body instanceof FormData);
      report = { ...report, photos: [...report.photos, { id: 9, url: '/reports/23/photos/9/content' }] };
    } else throw new Error('Unexpected endpoint');
    return { report };
  });
  const result = await c.load('services/report-editing').SaveReportEdits({ report: initial, status: 'resuelto', removedPhotoIds: [7], photos: [photo] });
  assert.deepEqual(calls, [['/reports/23', 'GET'], ['/reports/23/status', 'PUT'], ['/reports/23/photos/7', 'DELETE'], ['/reports/23/photos', 'POST']]);
  assert.equal(result.status, 'resolved');
  assert.deepEqual(result.photos.map(item => item.id), [8, 9]);
  assert.equal(result.like_count, 2);
  assert.equal(result.comment_count, 1);
  assert.equal(c.load('services/cache').apiCache.peek('entity:report:23').status, 'resolved');
});

test('ownership is rechecked on the server and a non-owner cannot save any edits', async () => {
  const calls = [];
  const c = client(async path => { calls.push(path); return { report: { ...initial, can_manage: false } }; });
  await assert.rejects(c.load('services/report-editing').SaveReportEdits({ report: initial, removedPhotoIds: [7], photos: [], status: 'resuelto' }), error => error.status === 403);
  assert.deepEqual(calls, ['/reports/23']);
});

test('stale status versions stop the edit before any photos are removed', async () => {
  const calls = [];
  const c = client(async (path) => {
    calls.push(path);
    if (path === '/reports/23') return { report: { ...initial, status_version: 2 } };
    assert.equal(path, '/reports/23/status');
    throw new Error('El estado cambió. Actualiza el reporte.');
  });
  const { SaveReportEdits, ReportEditFailure } = c.load('services/report-editing');
  await assert.rejects(SaveReportEdits({ report: initial, removedPhotoIds: [7], photos: [photo], status: 'resuelto' }), error => error instanceof ReportEditFailure);
  assert.deepEqual(calls, ['/reports/23', '/reports/23/status']);
});

test('photo capacity is checked against fresh server data before making changes', async () => {
  let calls = 0;
  const c = client(async () => { calls++; return { report: { ...initial, photos: [...initial.photos, { id: 10, url: '/photo/10' }] } }; });
  await assert.rejects(c.load('services/report-editing').SaveReportEdits({ report: initial, removedPhotoIds: [], photos: [photo] }), /hasta 3/);
  assert.equal(calls, 1);
});

test('an uncertain upload requires reconciliation and never invents a saved photo', async () => {
  let report = structuredClone(initial);
  const c = client(async (path) => {
    if (path === '/reports/23') return { report };
    if (path === '/reports/23/status') { report = { ...report, status: 'resolved', status_version: 1 }; return { report }; }
    throw new Error('Connection interrupted');
  });
  const { SaveReportEdits, ReportEditFailure } = c.load('services/report-editing');
  await assert.rejects(SaveReportEdits({ report: initial, removedPhotoIds: [], photos: [photo], status: 'resuelto' }), error => error instanceof ReportEditFailure);
  const confirmed = c.load('services/cache').apiCache.peek('entity:report:23');
  assert.equal(confirmed.status, 'resolved');
  assert.deepEqual(confirmed.photos.map(item => item.id), [7, 8]);
});

test('a session change prevents later queued edit operations', async () => {
  const calls = [];
  let c;
  c = client(async path => {
    calls.push(path);
    if (path === '/reports/23') return { report: initial };
    assert.equal(path, '/reports/23/photos/7');
    c.load('services/session').setAuthSession(false);
    return { report: { ...initial, photos: [initial.photos[1]] } };
  });
  await assert.rejects(c.load('services/report-editing').SaveReportEdits({ report: initial, removedPhotoIds: [7], photos: [photo] }), /sesión cambió/);
  assert.deepEqual(calls, ['/reports/23', '/reports/23/photos/7']);
});
