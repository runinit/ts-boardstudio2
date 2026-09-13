const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const deploymentPath = '/boardstudio/';
const read = (file) =>
  fs.readFileSync(path.join(__dirname, '../..', file), 'utf8');

function evaluate(file, modules, env = {}) {
  const code = ts.transpileModule(read(file), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const context = {
    exports: {},
    process: { env, cwd: () => path.join(__dirname, '../..') },
    require: (name) => modules[name],
  };
  vm.runInNewContext(code, context);
  return context.exports.default;
}

test('production assets and router share the Pages path', () => {
  const config = evaluate('vite.config.mts', {
    vite: { defineConfig: (config) => config, loadEnv: () => ({}) },
    '@vitejs/plugin-react': () => ({}),
    'vite-plugin-pwa': { VitePWA: () => ({}) },
  })({ mode: 'production' });

  assert.equal(config.base, deploymentPath);
  assert.equal(
    JSON.parse(config.define['process.env.PUBLIC_URL']),
    deploymentPath.slice(0, -1)
  );
});

test('legacy preview channel preserves its storage identity', () => {
  const config = evaluate(
    'vite.config.mts',
    {
      vite: { defineConfig: (config) => config, loadEnv: () => ({}) },
      '@vitejs/plugin-react': () => ({}),
      'vite-plugin-pwa': { VitePWA: () => ({}) },
    },
    { GITHUB_REPOSITORY: 'runinit/ergogen-gui-preview' }
  )({ mode: 'production' });
  assert.equal(config.base, deploymentPath);
  assert.equal(
    JSON.parse(config.define['process.env.REACT_APP_DEPLOYMENT_CHANNEL']),
    'preview'
  );
});

test('browser tests serve the production artifact without reusing a server', () => {
  const config = evaluate('playwright.config.ts', {
    '@playwright/test': {
      defineConfig: (config) => config,
      devices: { 'Desktop Chrome': {} },
    },
  });

  assert.equal(new URL(config.use.baseURL).pathname, deploymentPath);
  assert.match(config.webServer.command, /vite preview/);
  assert.equal(config.webServer.reuseExistingServer, false);
  assert.equal(config.webServer.url, config.use.baseURL);
});

test('configured asset and router base overrides remain supported', () => {
  const config = evaluate('vite.config.mts', {
    vite: { defineConfig: (config) => config, loadEnv: () => ({ VITE_PUBLIC_URL: '/custom' }) },
    '@vitejs/plugin-react': () => ({}),
    'vite-plugin-pwa': { VitePWA: () => ({}) },
  })({ mode: 'production' });
  assert.equal(config.base, '/custom/');
  assert.equal(JSON.parse(config.define['process.env.PUBLIC_URL']), '/custom');
});

test('production converts CommonJS workspace engine modules', () => {
  const config = evaluate('vite.config.mts', {
    vite: { defineConfig: (config) => config, loadEnv: () => ({}) },
    '@vitejs/plugin-react': () => ({}),
    'vite-plugin-pwa': { VitePWA: () => ({}) },
  })({ mode: 'production' });
  assert.ok(config.build.commonjsOptions.include.some((pattern) =>
    pattern.test('/checkout/boardstudio/engine/src/assert.js')
  ));
});
