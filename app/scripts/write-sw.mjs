import { createHash } from 'node:crypto';
import { readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../dist/', import.meta.url);

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const paths = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      paths.push(...(await files(path)));
      continue;
    }

    if (entry.name !== 'sw.js') {
      paths.push(path);
    }
  }

  return paths;
}

const rootPath = root.pathname;
const paths = (await files(rootPath))
  .filter((path) => !/boardstudio_renderer_wasm(?:_bg)?-[^/]+\.(?:js|wasm)$/u.test(path))
  .map((path) => `./${relative(rootPath, path)}`);
const version = createHash('sha256').update(JSON.stringify(paths)).digest('hex').slice(0, 12);
const source = `const CACHE = 'boardstudio-v2-${version}';
const FILES = ${JSON.stringify(['./', ...paths])};
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('boardstudio-v2-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok && /boardstudio_renderer_wasm(?:_bg)?-[^/]+\\.(?:js|wasm)$/u.test(new URL(event.request.url).pathname)) {
      return caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()).then(() => response));
    }
    return response;
  }).catch(() => event.request.mode === 'navigate' ? caches.match('./') : Response.error())));
});
`;

await writeFile(new URL('../dist/sw.js', import.meta.url), source);
