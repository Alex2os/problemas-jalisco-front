const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createServiceClient} = require('./load-services.cjs');
const coordinates = {latitude: 20.67, longitude: -103.35};
const location = { ...coordinates, available: true, formatted_address: 'Morelos 10, Centro, Guadalajara',
  address: 'Morelos 10', street: 'Morelos', street_number: '10', colonia: 'Centro', municipality: 'Guadalajara' };
function service(respond) {
  return createServiceClient({api: {apiRequest: respond}}).load('services/get-location-address').GetLocationAddress;
}

test('manual coordinate lookup uses the authenticated backend and maps address components', async () => {
  const lookup = service(async (path, options, auth) => {
    assert.equal(path, '/locations/reverse?latitude=20.67&longitude=-103.35');
    assert.equal(auth, true);
    return {location};
  });
  assert.deepEqual(await lookup(coordinates), [{street: 'Morelos', streetNumber: '10', name: 'Morelos 10', district: 'Centro', city: 'Guadalajara'}]);
});

test('missing components and no-coverage results do not invent a street or municipality', async () => {
  const partial = {...location, address: null, street: null, street_number: null, colonia: null, municipality: null};
  assert.deepEqual(await service(async () => ({location: partial}))(coordinates), [{street: null, streetNumber: null, name: location.formatted_address, district: null, city: null}]);
  const missing = {...partial, available: false, formatted_address: null};
  assert.deepEqual(await service(async () => ({location: missing}))(coordinates), []);
});

test('mismatched or malformed responses fail instead of labeling the wrong pin', async () => {
  for (const value of [null, {...location, latitude: 21}, {...location, available: 'yes'}, {...location, street: 42}, {...location, formatted_address: ''}]) {
    await assert.rejects(service(async () => ({location: value}))(coordinates), /leer la dirección/);
  }
});

test('connection and authentication messages reach the lookup unchanged', async () => {
  for (const message of ['No pudimos conectar con el servidor.', 'Inicia sesión para continuar.', 'Demasiadas solicitudes. Intenta más tarde.']) {
    await assert.rejects(service(async () => {throw new Error(message);})(coordinates), error => error.message === message);
  }
});
