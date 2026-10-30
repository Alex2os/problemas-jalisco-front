const assert = require('node:assert/strict');
const {test} = require('node:test');
const {createServiceClient} = require('./load-services.cjs');
const flush = () => new Promise(resolve => setImmediate(resolve));
const report = {id: 12, type: 'otros', description: 'test', latitude: 20, longitude: -103, ubication: 'Jalisco', user_id: 1, username: 'test', created_at: null, like_count: 4, comment_count: 2, liked_by_me: false};
const stats = {report_id: 12, like_count: 5, comment_count: 2, liked_by_me: true};
function client(apiRequest) {
  const client = createServiceClient({api: {apiRequest}});
  const {apiCache} = client.load('services/cache');
  apiCache.set('entity:report:12', {...report});
  return {...client, cache: apiCache};
}

test('rapid taps share a request; counts change only after server confirmation', async () => {
  let resolve, calls = 0;
  const c = client(() => {calls++; return new Promise(done => {resolve = done;});});
  const {SetReportLike} = c.load('services/report-interactions');
  const first = SetReportLike(12, true);
  const second = SetReportLike(12, true);
  assert.equal(first, second);
  await flush();
  assert.equal(calls, 1);
  assert.equal(c.cache.peek('entity:report:12').like_count, 4);
  resolve({interactions: stats}); await first;
  assert.equal(c.cache.peek('entity:report:12').like_count, 5);
  assert.equal(c.cache.peek('entity:report:12').liked_by_me, true);
  assert.equal(c.cache.peek('like-pending:12'), false);
});

test('failed writes preserve confirmed values, clear pending state, and allow retry', async () => {
  let fail = true;
  const c = client(async () => {if (fail) throw new Error('offline'); return {interactions: stats};});
  const {SetReportLike} = c.load('services/report-interactions');
  await assert.rejects(SetReportLike(12, true), /offline/);
  assert.equal(c.cache.peek('entity:report:12').like_count, 4);
  assert.equal(c.cache.peek('like-pending:12'), false);
  fail = false; await SetReportLike(12, true);
  assert.equal(c.cache.peek('entity:report:12').liked_by_me, true);
});

test('like/comment writes serialize per report and update the same feed/detail snapshot', async () => {
  let finishLike;
  const methods = [];
  const c = client(async (url, options) => {
    methods.push(options.method);
    if (options.method === 'PUT') return new Promise(resolve => {finishLike = resolve;});
    assert.equal(JSON.parse(options.body).user_comment, 'new comment');
    return {comment: {id: 99}, interactions: {...stats, comment_count: 3}};
  });
  const like = c.load('services/report-interactions').SetReportLike(12, true);
  const comment = c.load('services/create-new-comment').CreateComment('  new comment  ', 12);
  await flush(); assert.deepEqual(methods, ['PUT']);
  finishLike({interactions: stats}); await Promise.all([like, comment]);
  assert.deepEqual(methods, ['PUT', 'POST']);
  assert.equal(c.cache.peek('entity:report:12').liked_by_me, true);
  assert.equal(c.cache.peek('entity:report:12').comment_count, 3);
});

test('queued actions do not execute as a different account and old responses do not restore its likes', async () => {
  let finishLike, calls = 0;
  const c = client(() => {calls++; return new Promise(resolve => {finishLike = resolve;});});
  const like = c.load('services/report-interactions').SetReportLike(12, true);
  const queued = c.load('services/create-new-comment').CreateComment('old account', 12).catch(error => error);
  await flush();
  c.load('services/session').setAuthSession(false);
  c.load('services/session').setAuthSession(true);
  finishLike({interactions: stats}); await like;
  assert.match((await queued).message, /sesión cambió/);
  assert.equal(calls, 1);
  assert.equal(c.cache.peek('entity:report:12').liked_by_me, false);
});

test('an older feed response cannot overwrite the confirmed interaction state', async () => {
  let finishFeed;
  const c = client(async (url) => url === '/reports' ? new Promise(resolve => {finishFeed = resolve;}) : {interactions: stats});
  const feed = c.load('services/get-all-reports').GetAllReports();
  await flush();
  await c.load('services/report-interactions').SetReportLike(12, true);
  finishFeed({reports: [{...report}]}); await feed;
  assert.equal(c.cache.peek('entity:report:12').liked_by_me, true);
  assert.equal(c.cache.peek('entity:report:12').like_count, 5);
});

test('comment deletion invalidates only the target conversation and applies server counts', async () => {
  const c = client(async (url, options) => {
    assert.equal(url, '/reports/12/comments/99'); assert.equal(options.method, 'DELETE');
    return {comment_id: 99, interactions: {...stats, comment_count: 1}};
  });
  c.cache.set('comments:12:50:first', {comments: []});
  c.cache.set('comments:123:50:first', {comments: ['unrelated']});
  await c.load('services/report-interactions').DeleteComment(12, 99);
  assert.equal(c.cache.peek('comments:12:50:first'), undefined);
  assert.deepEqual(c.cache.peek('comments:123:50:first').comments, ['unrelated']);
  assert.equal(c.cache.peek('entity:report:12').comment_count, 1);
});

test('API client rejects an in-flight personalized response after an account change', async () => {
  const originalFetch = global.fetch;
  let finish;
  global.fetch = () => new Promise(resolve => {finish = resolve;});
  try {
    const c = createServiceClient({storage: new Map([['auth_token', 'synthetic-test-token']])});
    const pending = c.load('services/api').apiRequest('/reports', {}, 'optional');
    await flush();
    c.load('services/session').setAuthSession(false);
    finish(new Response(JSON.stringify({reports: []}), {status: 200}));
    await assert.rejects(pending, error => error.status === 409);
  } finally {global.fetch = originalFetch;}
});

test('logged-out users cannot post comments and no unauthenticated request is sent', async () => {
  const originalFetch = global.fetch;
  let calls = 0;
  global.fetch = async () => { calls++; throw new Error('Unexpected request'); };
  try {
    const c = createServiceClient();
    await assert.rejects(
      c.load('services/create-new-comment').CreateComment('Test comment', 12),
      error => error.status === 401 && /Inicia sesión/.test(error.message),
    );
    assert.equal(calls, 0);
  } finally {
    global.fetch = originalFetch;
  }
});
