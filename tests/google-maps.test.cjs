const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createServiceClient} = require('./load-services.cjs');
const {googleMapsUrl} = createServiceClient().load('services/report-format');

test('Google Maps links preserve the report pin and correctly encode coordinates', () => {
  const url = new URL(googleMapsUrl(20.6767, -103.3472));
  assert.equal(url.origin, 'https://www.google.com');
  assert.equal(url.pathname, '/maps/search/');
  assert.equal(url.searchParams.get('api'), '1');
  assert.equal(url.searchParams.get('query'), '20.6767,-103.3472');
  assert.ok(url.search.includes('%2C'));
});

test('invalid coordinates cannot open a misleading map location', () => {
  for (const [latitude, longitude] of [[NaN, -103], [20, Infinity], [91, 0], [0, -181], [undefined, -103]]) {
    assert.throws(() => googleMapsUrl(latitude, longitude), /ubicación.*no es válida/);
  }
  assert.equal(new URL(googleMapsUrl(0, 0)).searchParams.get('query'), '0,0');
});
