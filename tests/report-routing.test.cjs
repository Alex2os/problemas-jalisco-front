const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

test('Legacy report route /reports/[report_id] redirects to /reporte/[id] preserving params', () => {
  const code = fs.readFileSync('src/app/reports/[report_id].tsx', 'utf8');
  assert.ok(code.includes('Redirect'), 'Must import or use Redirect');
  assert.ok(code.includes('pathname: "/reporte/[id]"'), 'Must redirect to canonical path /reporte/[id]');
  assert.ok(code.includes('id: report_id'), 'Must map report_id to id parameter');
});

test('Internal report navigation uses canonical route /reporte/[id]', () => {
  const interactions = fs.readFileSync('src/features/reports/components/ReportInteractions.tsx', 'utf8');
  assert.ok(interactions.includes('/reporte/[id]'), 'ReportInteractions comments action must use canonical /reporte/[id]');
  assert.ok(!interactions.includes('/reports/[report_id]'), 'ReportInteractions must not reference /reports/[report_id]');

  const row = fs.readFileSync('src/features/reports/components/ReportRow.tsx', 'utf8');
  assert.ok(row.includes('/reporte/${report.id}'), 'ReportRow card tap must use canonical /reporte/${report.id}');
  assert.ok(!row.includes('/reports/${report.id}'), 'ReportRow must not reference /reports/${report.id}');
});

test('Canonical /reporte/[id] supports comments parameter auto-scroll', () => {
  const detail = fs.readFileSync('src/app/reporte/[id].tsx', 'utf8');
  assert.ok(detail.includes('comments'), 'Must parse comments query parameter');
  assert.ok(detail.includes('scrollViewRef'), 'Must have ScrollView reference for auto-scroll');
});

