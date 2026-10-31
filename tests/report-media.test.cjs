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

test('photo payload validation rejects oversized batches and files before requesting the API', async () => {
  const c = createServiceClient();
  const {appendPhotos, MAX_PHOTO_BYTES} = c.load('services/report-media');
  const file = {uri: 'file:///test.jpg', name: 'test.jpg', type: 'image/jpeg', size: 100};
  await assert.rejects(() => appendPhotos(new FormData(), [file,file,file,file]), /hasta 3/);
  await assert.rejects(() => appendPhotos(new FormData(), [{...file, size: MAX_PHOTO_BYTES + 1}]), /5 MB/);
});

test('appendPhotos sends actual JPEG bytes and filenames compatible with Expo fetch', async () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'report-upload-'));
  try {
    const uri = path.join(directory, 'photo.jpg');
    const bytes = Buffer.from([255, 216, 255, 224, 1, 2]);
    fs.writeFileSync(uri, bytes);
    const {appendPhotos} = createServiceClient().load('services/report-media');
    const form = new FormData();
    await appendPhotos(form, [{uri, name: 'evidence.jpg', type: 'image/jpeg', size: bytes.length}]);
    const file = form.get('photos');
    assert.ok(file instanceof Blob);
    assert.equal(file.name, 'evidence.jpg');
    assert.equal(file.type, 'image/jpeg');
    assert.deepEqual(Buffer.from(await file.arrayBuffer()), bytes);
    const request = new Request('http://localhost/upload', {method: 'POST', body: form});
    assert.match(request.headers.get('content-type'), /multipart\/form-data; boundary=/);
    assert.ok(Buffer.from(await request.arrayBuffer()).includes(bytes));
  } finally {fs.rmSync(directory, {recursive: true, force: true});}
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
