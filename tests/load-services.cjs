const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Node tests do not run through Expo's .env loader.
process.env.EXPO_PUBLIC_API_URL ??= 'http://localhost:5140';

// Only native platform/secure-storage bindings are substituted. API services themselves are loaded unchanged.
function createServiceClient({storage = new Map(), api} = {}) {
  const modules = new Map();
  const root = path.resolve(__dirname, '..');
  const secureStore = {
    getItemAsync: async key => storage.get(key) || null,
    setItemAsync: async (key, value) => {storage.set(key, value);},
    deleteItemAsync: async key => {storage.delete(key);},
  };
  function load(filename) {
    const full = path.resolve(root, 'src', filename.endsWith('.ts') ? filename : filename + '.ts');
    if (api && full === path.join(root, 'src/services/api.ts')) return api;
    if (modules.has(full)) return modules.get(full).exports;
    const module = {exports: {}};
    modules.set(full, module);
    const code = ts.transpileModule(fs.readFileSync(full, 'utf8'), {
      compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
    }).outputText;
    new Function('require', 'module', 'exports', code)(request => {
      if (request === 'expo-file-system') return {File: class extends require('node:buffer').File {
        constructor(uri) {
          super([fs.readFileSync(uri.startsWith('file:') ? require('node:url').fileURLToPath(uri) : uri)], path.basename(uri), {type: 'image/jpeg'});
        }
      }};
      if (request === 'expo-secure-store') return secureStore;
      if (request === 'react-native') return {Platform: {OS: 'android'}};
      if (request.startsWith('.')) return load(path.resolve(path.dirname(full), request));
      return require(request);
    }, module, module.exports);
    return module.exports;
  }
  return {load, storage};
}
module.exports = {createServiceClient};
