const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createServiceClient} = require('./load-services.cjs');

test('required titles fail locally before sending a report write', async () => {
  let calls = 0;
  const client = createServiceClient({api: {apiRequest: async () => {calls++;}}});
  const create = client.load('services/create-report').CreateReport;
  for (const title of [undefined, null, '', '  ', 'x'.repeat(81), 'one\ntwo', 'title\n', '😀'.repeat(41)]) {
    await assert.rejects(create('agua', title, 'Description', 20.67, -103.35), /título/);
  }
  assert.equal(calls, 0);
});

test('JSON writes send a trimmed user title independent of the description', async () => {
  const client = createServiceClient({api: {apiRequest: async (path, options, auth) => {
    assert.equal(path, '/reports/create');
    assert.equal(auth, true);
    assert.deepEqual(JSON.parse(options.body), {
      type: 'agua', title: 'Fuga frente a la escuela', description: 'Desde ayer', latitude: 20.67, longitude: -103.35,
    });
    return {report_id: 42};
  }}});
  assert.equal((await client.load('services/create-report').CreateReport('agua', '  Fuga frente a la escuela  ', ' Desde ayer ', 20.67, -103.35)).report_id, 42);
});

test('multipart writes include the required title and await actual photo bytes', async () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'report-title-upload-'));
  try {
    const uri = path.join(directory, 'evidence.jpg');
    const bytes = Buffer.from([255, 216, 255, 224, 1, 2]);
    fs.writeFileSync(uri, bytes);
    const client = createServiceClient({api: {apiRequest: async (endpoint, options, auth) => {
      assert.equal(endpoint, '/reports/create-with-photos');
      assert.equal(auth, true);
      assert.ok(options.body instanceof FormData);
      assert.equal(options.body.get('title'), 'Bache frente a la escuela');
      assert.equal(options.body.get('description'), 'Desde ayer');
      const file = options.body.get('photos');
      assert.deepEqual(Buffer.from(await file.arrayBuffer()), bytes);
      return {report_id: 43};
    }}});
    const create = client.load('services/create-report').CreateReport;
    await create('baches', ' Bache frente a la escuela ', 'Desde ayer', 20.67, -103.35, [{uri, name: 'evidence.jpg', type: 'image/jpeg', size: bytes.length}]);
  } finally {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

test('draft titles reset with the rest of the unsubmitted form', async () => {
  const client = createServiceClient();
  const store = client.load('store/useDraftStore').useDraftStore;
  assert.equal(store.getState().title, '');
  store.getState().setTitle('Bache en la calle');
  assert.equal(store.getState().title, 'Bache en la calle');
  await store.getState().resetDraft();
  assert.equal(store.getState().title, '');
});
