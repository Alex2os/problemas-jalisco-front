const assert = require('node:assert/strict');
const {test} = require('node:test');
const {createServiceClient} = require('./load-services.cjs');
const initial = {id: 23, photos: [], status: 'reported', status_version: 0, can_manage: true, liked_by_me: true, like_count: 2, comment_count: 1};

test('status writes use optimistic concurrency and publish one server snapshot for all screens', async () => {
  const c = createServiceClient({api: {apiRequest: async (path, options, authenticated) => {
    assert.equal(path, '/reports/23/status'); assert.equal(options.method, 'PUT'); assert.equal(authenticated, true);
    assert.deepEqual(JSON.parse(options.body), {status: 'resolved', expected_version: 0});
    return {report: {...initial, status: 'resolved', status_version: 1}};
  }}});
  const cache = c.load('services/cache').apiCache;
  cache.set('entity:report:23', initial); cache.set('reports:all', [initial]); cache.set('status-history:23:first', {});
  await c.load('services/report-media').UpdateReportStatus(23, 'resolved', 0);
  assert.equal(cache.peek('entity:report:23').status, 'resolved'); assert.equal(cache.peek('entity:report:23').liked_by_me, true);
  assert.equal(cache.peek('reports:all'), undefined); assert.equal(cache.peek('status-history:23:first'), undefined);
});

test('failed photo removal preserves confirmed photos and rejects the caller', async () => {
  const c = createServiceClient({api: {apiRequest: async () => {throw new Error('network interrupted');}}});
  const cache = c.load('services/cache').apiCache;
  const report = {...initial, photos: [{id: 7, url: '/reports/23/photos/7/content'}]};
  cache.set('entity:report:23', report);
  await assert.rejects(c.load('services/report-media').RemoveReportPhoto(23, 7), /network interrupted/);
  assert.deepEqual(cache.peek('entity:report:23').photos, report.photos);
});

test('photo payload validation rejects oversized batches and files before requesting the API', () => {
  const c = createServiceClient();
  const {appendPhotos, MAX_PHOTO_BYTES} = c.load('services/report-media');
  const file = {uri: 'file:///test.jpg', name: 'test.jpg', type: 'image/jpeg', size: 100};
  assert.throws(() => appendPhotos(new FormData(), [file,file,file,file]), /hasta 3/);
  assert.throws(() => appendPhotos(new FormData(), [{...file, size: MAX_PHOTO_BYTES + 1}]), /5 MB/);
});

test('appendPhotos appends native file descriptor objects with photos field name and unique names', () => {
  const c = createServiceClient();
  const {appendPhotos} = c.load('services/report-media');
  class MockFormData {
    constructor() { this.parts = []; }
    append(name, value) { this.parts.push({name, value}); }
  }
  const form = new MockFormData();
  const photos = [
    {uri: 'file:///photo1.jpg', name: 'photo1.jpg', type: 'image/jpeg', size: 1024},
    {uri: 'file:///photo2.jpg', name: '', type: 'image/jpeg', size: 2048},
  ];
  appendPhotos(form, photos);
  assert.equal(form.parts.length, 2);
  assert.equal(form.parts[0].name, 'photos');
  assert.deepEqual(form.parts[0].value, {uri: 'file:///photo1.jpg', name: 'photo1.jpg', type: 'image/jpeg'});
  assert.equal(form.parts[1].name, 'photos');
  assert.deepEqual(form.parts[1].value, {uri: 'file:///photo2.jpg', name: 'report-photo-2.jpg', type: 'image/jpeg'});
});

test('actual API client leaves multipart boundary to native fetch and sends authentication', async () => {
  const originalFetch = global.fetch;
  const c = createServiceClient({storage: new Map([['auth_token', 'test-token']])});
  global.fetch = async (_, options) => {
    assert.ok(options.body instanceof FormData); assert.equal(options.headers.has('Content-Type'), false);
    assert.equal(options.headers.get('Authorization'), 'Bearer test-token');
    return new Response(JSON.stringify({message: 'ok'}), {status: 200});
  };
  try {
    const form = new FormData(); form.append('description', 'test');
    await c.load('services/api').apiRequest('/reports/create-with-photos', {method: 'POST', body: form}, true);
  } finally {global.fetch = originalFetch;}
});
