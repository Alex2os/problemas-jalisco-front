const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('Legacy report route /reports/[report_id] redirects to /reporte/[id] preserving params', () => {
  const code = fs.readFileSync('src/app/reports/[report_id].tsx', 'utf8');
  assert.ok(code.includes('Redirect'), 'Must import or use Redirect');
  assert.ok(code.includes('pathname: "/reporte/[id]"'), 'Must redirect to canonical path /reporte/[id]');
  assert.ok(code.includes('id: report_id'), 'Must map report_id to id parameter');
});

test('Internal report navigation uses canonical route /reporte/[id]', () => {
  const list = fs.readFileSync('src/app/(tabs)/mis-reportes.tsx', 'utf8');
  assert.ok(list.includes('/reporte/${report.id}'), 'MisReportes card tap must use canonical /reporte/${report.id}');
  assert.ok(!list.includes('/reports/${report.id}'), 'MisReportes must not reference /reports/${report.id}');

  const map = fs.readFileSync('src/app/(tabs)/mapa.tsx', 'utf8');
  assert.ok(map.includes('/reporte/${r.id}'), 'Mapa marker tap must use canonical /reporte/${r.id}');
  assert.ok(!map.includes('/reports/${r.id}'), 'Mapa must not reference /reports/${r.id}');
});

test('Canonical /reporte/[id] supports comments parameter auto-scroll', () => {
  const detail = fs.readFileSync('src/app/reporte/[id].tsx', 'utf8');
  assert.ok(detail.includes('comments'), 'Must parse comments query parameter');
  assert.ok(detail.includes('scrollViewRef'), 'Must have ScrollView reference for auto-scroll');
});

