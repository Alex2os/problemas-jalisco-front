const assert = require('node:assert/strict');
const fs = require('node:fs');
const {createServiceClient} = require('./load-services.cjs');
if (!process.env.JALISCO_TEST_PHOTO_PATH || !process.env.EXPO_PUBLIC_API_URL?.startsWith('http://127.0.0.1:')) throw new Error('Use the isolated database fixture.');
// Emulate only React Native's multipart file binding; actual service code, HTTP and storage remain real.
const NativeFormData = global.FormData;
global.FormData = class extends NativeFormData {
  append(name, value, filename) {
    if (value && typeof value === 'object' && value.uri) return super.append(name, new Blob([fs.readFileSync(value.uri)], {type: value.type}), value.name);
    return filename === undefined ? super.append(name, value) : super.append(name, value, filename);
  }
};
(async () => {
  const photo = {uri: process.env.JALISCO_TEST_PHOTO_PATH, name: 'photo.jpg', type: 'image/jpeg', size: fs.statSync(process.env.JALISCO_TEST_PHOTO_PATH).size};
  const storage = new Map();
  let client = createServiceClient({storage});
  const load = name => client.load('services/' + name);
  await load('register-user').RegisterUser('media_mobile', 'media-mobile@example.invalid', 'mobile-test-password');
  const login = await load('user-login').UserLogIn('media-mobile@example.invalid', 'mobile-test-password');
  storage.set('auth_token', login.token); load('session').setAuthSession(true);
  const created = await load('create-report').CreateReport('otros', 'Created with mobile photos', 20.6597, -103.3496, [photo,photo,photo]);
  const id = created.report_id;
  assert.ok(id); assert.equal(created.report.photos.length, 3);
  let report = await load('get-report-by-id').GetReportById(id, true);
  assert.equal(report.can_manage, true); assert.equal(report.status, 'reported');
  const url = load('report-media').photoUrl(report.photos[0].url);
  const imageResponse = await fetch(url); assert.equal(imageResponse.status, 200);
  assert.equal(imageResponse.headers.get('content-type'), 'image/jpeg');
  assert.ok((await imageResponse.arrayBuffer()).byteLength > 0);
  await load('report-media').UpdateReportStatus(id, 'resolved', report.status_version);
  await load('report-interactions').SetReportLike(id, true);
  const comment = await load('create-new-comment').CreateComment('New features preserve comments', id);
  client = createServiceClient({storage}); // App reopen, retaining only the real stored bearer token.
  report = await load('get-report-by-id').GetReportById(id);
  assert.equal(report.photos.length, 3); assert.equal(report.status, 'resolved'); assert.equal(report.status_version, 1);
  assert.equal(report.liked_by_me, true); assert.equal(report.comment_count, 1);
  const history = await load('report-media').GetStatusHistory(id, true);
  assert.equal(history.history[0].actor_id, login.user.id); assert.equal(history.history[0].previous_status, 'reported');
  const feed = await load('get-all-reports').GetAllReports(true);
  assert.equal(feed.find(item => item.id === id).status, 'resolved');
  assert.equal(feed.find(item => item.id === id).photos.length, 3);
  await load('report-media').RemoveReportPhoto(id, report.photos[0].id);
  await load('report-media').AddReportPhotos(id, [photo]);
  assert.equal((await load('get-report-by-id').GetReportById(id, true)).photos.length, 3);
  await load('create-new-comment').CreateComment('Photo changes preserve likes', id);
  await load('report-interactions').DeleteComment(id, comment.comment.id);
  const otherStorage = new Map();
  const other = createServiceClient({storage: otherStorage});
  await other.load('services/register-user').RegisterUser('media_other', 'media-other@example.invalid', 'mobile-test-password');
  const otherLogin = await other.load('services/user-login').UserLogIn('media-other@example.invalid', 'mobile-test-password');
  otherStorage.set('auth_token', otherLogin.token); other.load('services/session').setAuthSession(true);
  const viewed = await other.load('services/get-report-by-id').GetReportById(id, true); assert.equal(viewed.can_manage, false);
  await assert.rejects(other.load('services/report-media').UpdateReportStatus(id, 'still_present', viewed.status_version), error => error.status === 403);
  await assert.rejects(other.load('services/report-media').AddReportPhotos(id, [photo]), error => error.status === 403);
  await assert.rejects(other.load('services/report-media').RemoveReportPhoto(id, viewed.photos[0].id), error => error.status === 403);
  console.log('Mobile photo/status services → real HTTP → PostgreSQL/disk: create-three-photos, reopen, status/history, photo management, ownership and interactions verified.');
})().catch(error => {console.error('Mobile photo/status integration failed:', error.message); process.exitCode = 1;}).finally(() => {global.FormData = NativeFormData;});
