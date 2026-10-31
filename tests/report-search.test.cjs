const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createServiceClient} = require('./load-services.cjs');
const {matchesReportSearch} = createServiceClient().load('services/report-search');
const report = {type: 'arboles', category: 'arboles', ubication: 'Calle Juárez, Centro, Guadalajara'};

test('search matches displayed types and locations regardless of case or accents', () => {
  for (const query of ['', '  ', 'ÁRBOLES', 'parques', 'juarez', 'Centro Guadalajara', 'arboles juarez']) {
    assert.equal(matchesReportSearch(report, query), true, query);
  }
  assert.equal(matchesReportSearch(report, 'baches'), false);
  assert.equal(matchesReportSearch(report, 'arboles zapopan'), false);
});

test('search includes structured locations, display titles and legacy category labels', () => {
  const legacy = {type: 'corte-de-servicios', municipality: 'Zapopan', colonia: 'Las Águilas'};
  assert.equal(matchesReportSearch(legacy, 'alumbrado aguilas'), true);
  assert.equal(matchesReportSearch(legacy, 'zapopan'), true);

  const titled = {type: 'agua', title: '¡Otra vez sin agua!', ubication: 'Guadalajara'};
  assert.equal(matchesReportSearch(titled, 'otra vez'), true);
});

test('search includes description words and combines them with type and location', () => {
  const described = {...report, description: 'Una RÁMA caída bloquea la banqueta'};
  for (const query of ['rama', 'caida', 'BLOQUEA BANQUETA', 'arboles rama juarez']) {
    assert.equal(matchesReportSearch(described, query), true, query);
  }
  assert.equal(matchesReportSearch(described, 'rama zapopan'), false);
  assert.equal(matchesReportSearch(described, 'fuga'), false);
});

test('missing, empty and null descriptions preserve type and location matching', () => {
  for (const description of [undefined, null, '', '  ']) {
    const legacy = {...report, description};
    assert.equal(matchesReportSearch(legacy, 'arboles juarez'), true);
    assert.equal(matchesReportSearch(legacy, 'banqueta'), false);
  }
});
