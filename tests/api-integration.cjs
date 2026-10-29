// Invoked by the API's disposable-database integration suite, never by the ordinary unit-test glob.
const assert = require('node:assert/strict');
const {createServiceClient} = require('./load-services.cjs');
if (!process.env.JALISCO_TEST_REPORT_ID || !process.env.EXPO_PUBLIC_API_URL?.startsWith('http://127.0.0.1:')) throw new Error('Use the isolated API integration fixture.');
const reportId = Number(process.env.JALISCO_TEST_REPORT_ID);

(async () => {
  const storage = new Map();
  let client = createServiceClient({storage});
  const load = name => client.load('services/' + name);
  await load('RegisterUser').RegisterUser('mobile_user', 'mobile@example.invalid', 'mobile-test-password');
  const login = await load('UserLogIn').UserLogIn('mobile@example.invalid', 'mobile-test-password');
  storage.set('auth_token', login.token);
  load('session').setAuthSession(true);
  let report = await load('GetReportById').GetReportById(reportId, true);
  const initialLikes = report.like_count, initialComments = report.comment_count;
  assert.equal(report.liked_by_me, false);
  await load('GetAllReports').GetAllReports(true);
  const rapid = Array.from({length: 5}, () => load('ReportInteractions').SetReportLike(reportId, true));
  assert.ok(rapid.every(request => request === rapid[0])); await Promise.all(rapid);
  assert.equal(load('cache').apiCache.peek(`entity:report:${reportId}`).like_count, initialLikes + 1);
  const created = await load('CreateNewComment').CreateComment('  Posted through the actual mobile API client  ', reportId);
  assert.equal(created.comment.user_id, login.user.id);
  assert.equal(created.comment.can_delete, true);
  assert.ok(created.comment.created_at);
  assert.equal(created.interactions.comment_count, initialComments + 1);
  assert.equal(load('cache').apiCache.peek(`entity:report:${reportId}`).liked_by_me, true);

  // Fresh JS/module cache, retaining only the secure token: simulate the app reopening.
  client = createServiceClient({storage});
  report = await load('GetReportById').GetReportById(reportId);
  assert.equal(report.liked_by_me, true);
  assert.equal(report.like_count, initialLikes + 1);
  assert.equal(report.comment_count, initialComments + 1);
  const page = await load('GetCommentsByReportId').GetCommentsPage(reportId, true);
  assert.ok(page.comments.some(comment => comment.id === created.comment.id && comment.user_comment === 'Posted through the actual mobile API client'));
  assert.equal(page.interactions.liked_by_me, true);
  const feed = await load('GetAllReports').GetAllReports(true);
  assert.equal(feed.find(item => item.id === reportId).comment_count, report.comment_count);

  await load('ReportInteractions').DeleteComment(reportId, created.comment.id);
  await load('ReportInteractions').SetReportLike(reportId, false);
  client = createServiceClient({storage});
  report = await load('GetReportById').GetReportById(reportId);
  assert.equal(report.liked_by_me, false);
  assert.equal(report.like_count, initialLikes);
  assert.equal(report.comment_count, initialComments);
  assert.ok(!(await load('GetCommentsByReportId').GetCommentsPage(reportId, true)).comments.some(comment => comment.id === created.comment.id));

  // Exercise the store used by the actual map, report form, and profile screens.
  const store = client.load('store/useReportsStore').useReportsStore;
  await store.getState().initialize();
  const submitted = await store.getState().submitReport({
    category: 'agua', description: 'Created by the current report form store',
    latitude: 20.6597, longitude: -103.3496, photos: [],
  });
  const persisted = await load('GetReportById').GetReportById(submitted.id, true);
  assert.equal(persisted.user_id, login.user.id);
  assert.equal(persisted.username, login.user.username);
  assert.equal(persisted.folio, String(persisted.id));
  assert.ok(store.getState().userReportIds.includes(persisted.id));
  await store.getState().toggleUpvote(persisted.id);
  assert.equal(store.getState().reports.find(item => item.id === persisted.id).liked_by_me, true);
  await load('CreateNewComment').CreateComment('Shared with the current screen store', persisted.id);
  assert.equal(store.getState().reports.find(item => item.id === persisted.id).comment_count, 1);
  await load('ReportMedia').UpdateReportStatus(persisted.id, 'resolved', persisted.status_version);
  assert.equal(store.getState().reports.find(item => item.id === persisted.id).status, 'resolved');
  const reopened = createServiceClient({storage});
  const restoredStore = reopened.load('store/useReportsStore').useReportsStore;
  await restoredStore.getState().initialize();
  assert.ok(restoredStore.getState().userReportIds.includes(persisted.id));
  assert.equal(restoredStore.getState().reports.find(item => item.id === persisted.id).comment_count, 1);

  storage.delete('auth_token'); load('session').setAuthSession(false);
  await store.getState().refreshReports();
  assert.deepEqual(store.getState().userReportIds, []);
  report = await load('GetReportById').GetReportById(reportId);
  assert.equal(report.liked_by_me, false);
  await assert.rejects(load('ReportInteractions').SetReportLike(reportId, true), error => error.status === 401);
  console.log('Mobile API client → ASP.NET Core → PostgreSQL: like/comment/reopen/delete/unlike verified.');
})().catch(error => {console.error('Mobile API integration failed:', error.message); process.exitCode = 1;});
