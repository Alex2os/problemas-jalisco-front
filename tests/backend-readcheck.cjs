// Read-only smoke check for an explicitly configured running backend/database.
const assert = require('node:assert/strict');
const { createServiceClient } = require('./load-services.cjs');
if (!process.env.EXPO_PUBLIC_API_URL) throw new Error('Set EXPO_PUBLIC_API_URL to the running backend.');
(async () => {
  const client = createServiceClient();
  const store = client.load('store/useReportsStore').useReportsStore;
  await store.getState().initialize();
  assert.equal(store.getState().error, '');
  const reports = store.getState().reports;
  assert.deepEqual(store.getState().userReportIds, []);
  for (const report of reports) {
    assert.ok(Number.isSafeInteger(report.id) && report.id > 0);
    assert.equal(report.folio, String(report.id));
    assert.equal(report.can_manage, false);
  }
  if (reports.length) {
    const report = await client.load('services/GetReportById').GetReportById(reports[0].id, true);
    assert.equal(report.id, reports[0].id);
    assert.equal(typeof report.username, 'string');
    const comments = await client.load('services/GetCommentsByReportId').GetCommentsByReportId(report.id, true);
    assert.ok(Array.isArray(comments));
  }
  await assert.rejects(client.load('services/GetReportById').GetReportById(2147483647, true), error => error.status === 404);
  await assert.rejects(client.load('services/CreateNewComment').CreateComment('must not be sent', reports[0]?.id || 1), error => error.status === 401);
  console.log(JSON.stringify({ database_reports: reports.length, authenticated: false,
    verified: ['feed', 'current screen store', 'server IDs and permissions', 'details and comments', '404 without sample fallback', 'login required for posting'], writes: 0 }));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
