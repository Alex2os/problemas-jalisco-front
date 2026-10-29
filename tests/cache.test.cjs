const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const source = ts.transpileModule(readFileSync('src/services/cache.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const context = { exports: {} };
vm.runInNewContext(source, context);
const { createCache } = context.exports;

test('navigation reuses reads, concurrent requests share a fetch, refresh fetches again', async () => {
  const cache = createCache();
  let calls = 0;
  const load = async () => ++calls;
  const first = cache.get('reports:all', load);
  assert.equal(first, cache.get('reports:all', load));
  assert.equal(await first, 1);
  assert.equal(await cache.get('reports:all', load), 1);
  assert.equal(await cache.get('reports:all', load, true), 2);
  cache.invalidate('reports:');
  assert.equal(await cache.get('reports:all', load), 3);
});

test('failed reads can retry and failed refresh retains previous data', async () => {
  const cache = createCache();
  const fail = async () => { throw new Error('offline'); };
  await assert.rejects(cache.get('report:1', fail), /offline/);
  assert.equal(await cache.get('report:1', async () => 1), 1);
  await assert.rejects(cache.get('report:1', fail, true), /offline/);
  assert.equal(await cache.get('report:1', async () => 2), 1);
});

test('a response started before a mutation cannot overwrite fresh cached data', async () => {
  const cache = createCache();
  let resolveOld;
  const old = cache.get('comments:1', () => new Promise(resolve => { resolveOld = resolve; }));
  await Promise.resolve();
  cache.invalidate('comments:1');
  assert.equal(await cache.get('comments:1', async () => 'new'), 'new');
  resolveOld('old');
  await old;
  assert.equal(await cache.get('comments:1', async () => 'unexpected'), 'new');
});
