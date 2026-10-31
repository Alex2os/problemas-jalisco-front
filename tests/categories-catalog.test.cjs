const test = require('node:test');
const assert = require('node:assert/strict');
const { createServiceClient } = require('./load-services.cjs');

test('getOfficialCategories requests /reports/categories and returns normalized categories', async () => {
  const backendResponse = {
    message: 'Las categorías se obtuvieron con éxito.',
    categories: [
      { id: 'baches', name: 'Baches y vialidad', description: 'Pavimento dañado' },
      { id: 'alumbrado', name: 'Alumbrado público', description: 'Luminarias fundidas' },
    ],
  };

  const client = createServiceClient({
    api: {
      async apiRequest(path) {
        assert.equal(path, '/reports/categories');
        return backendResponse;
      },
    },
  });

  const { getOfficialCategories } = client.load('services/get-categories');
  const result = await getOfficialCategories(true);

  assert.equal(result.length, 2);
  assert.equal(result[0].id, 'baches');
  assert.equal(result[0].name, 'Baches y vialidad');
  assert.equal(result[1].id, 'alumbrado');
});

test('mergeBackendCategories maps remote categories and attaches visuals without legacy options', () => {
  const client = createServiceClient();
  const { mergeBackendCategories, LOCAL_FALLBACK_CATEGORIES, legacyCategoryIds } = client.load('constants/report-categories');

  const remote = [
    { id: 'baches', name: 'Baches y vialidad', description: 'Daños' },
    { id: 'otro', name: 'Otro problema', description: 'Varios' },
  ];

  const merged = mergeBackendCategories(remote);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].id, 'baches');
  assert.equal(merged[0].shortLabel, 'Baches');
  assert.ok(merged[0].color, 'Must attach brand/category color');
  assert.ok(merged[0].ionicon, 'Must attach ionicon');

  // Verify none of the legacy categories are in creation selection
  const legacyKeys = Object.keys(legacyCategoryIds);
  assert.ok(LOCAL_FALLBACK_CATEGORIES.every(c => !legacyKeys.includes(c.id)), 'Fallback cannot contain legacy ids');
  assert.ok(merged.every(c => !legacyKeys.includes(c.id)), 'Merged options cannot contain legacy ids');
});

test('categoryDefFor resolves historical/legacy categories for reading old reports', () => {
  const client = createServiceClient();
  const { categoryDefFor } = client.load('constants/report-categories');

  assert.equal(categoryDefFor('accidente').id, 'baches');
  assert.equal(categoryDefFor('bloqueo').id, 'otro');
  assert.equal(categoryDefFor('corte-de-servicios').id, 'alumbrado');
  assert.equal(categoryDefFor('transporte-publico').id, 'otro');
  assert.equal(categoryDefFor('robo-asalto').id, 'seguridad');
  assert.equal(categoryDefFor('otros').id, 'otro');
  assert.equal(categoryDefFor('baches').id, 'baches');
});

test('Creation draft sends only canonical category id as type', async () => {
  let submittedType = '';
  const client = createServiceClient({
    api: {
      async apiRequest(path, options) {
        if (path === '/reports/create') {
          const body = JSON.parse(options.body);
          submittedType = body.type;
          return { report_id: 99, report: { id: 99, folio: 'FOL-99', type: submittedType } };
        }
        return {};
      },
    },
  });

  const { useReportsStore } = client.load('store/useReportsStore');
  await useReportsStore.getState().submitReport({
    title: 'Poste caído',
    category: 'alumbrado',
    description: 'Poste caído',
    latitude: 20.67,
    longitude: -103.35,
    photos: [],
  });

  assert.equal(submittedType, 'alumbrado');
});


test('category cards retain compact subtitles when the API supplies longer explanations', () => {
  const {mergeBackendCategories, LOCAL_FALLBACK_CATEGORIES} = createServiceClient().load('constants/report-categories');
  const remote = LOCAL_FALLBACK_CATEGORIES.map(category => ({
    id: category.id, name: category.label, description: 'Una explicación larga del catálogo remoto con muchos ejemplos.',
  }));
  const merged = mergeBackendCategories(remote);
  assert.deepEqual(merged.map(category => category.description), LOCAL_FALLBACK_CATEGORIES.map(category => category.description));
  assert.equal(mergeBackendCategories([{id: 'future', name: 'Nueva categoría', description: 'Descripción nueva'}])[0].description, 'Descripción nueva');
});
