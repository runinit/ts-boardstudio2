import type { ProjectDoc } from '@boardstudio/v2-contracts';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

const DB_NAME = 'boardstudio-v2';
const PROJECT_STORE = 'projects';
const ASSET_STORE = 'assets';
const ACTIVE_PROJECT_KEY = 'boardstudio-v2-active-project';
const MIB = 1024 * 1024;
const MAX_ARCHIVE_BYTES = 128 * MIB;
const MAX_PROJECT_BYTES = 8 * MIB;
const MAX_ASSET_BYTES = 64 * MIB;
const MAX_UNPACKED_BYTES = 256 * MIB;
const MAX_ARCHIVE_ENTRIES = 256;

export function activeProjectId(fallback: string): string {
  return localStorage.getItem(ACTIVE_PROJECT_KEY) ?? fallback;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(PROJECT_STORE, { keyPath: 'id' });
      request.result.createObjectStore(ASSET_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadProject(id: string): Promise<ProjectDoc | undefined> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const request = db.transaction(PROJECT_STORE).objectStore(PROJECT_STORE).get(id);

    request.onsuccess = () => {
      db.close();
      resolve(request.result as ProjectDoc | undefined);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function saveProject(doc: ProjectDoc): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PROJECT_STORE, 'readwrite');

    transaction.objectStore(PROJECT_STORE).put(doc);
    transaction.oncomplete = () => {
      localStorage.setItem(ACTIVE_PROJECT_KEY, doc.id);
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function saveAsset(sha256: string, bytes: Uint8Array): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ASSET_STORE, 'readwrite');

    transaction.objectStore(ASSET_STORE).put(bytes, sha256);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function loadAsset(sha256: string): Promise<Uint8Array | undefined> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const request = db.transaction(ASSET_STORE).objectStore(ASSET_STORE).get(sha256);

    request.onsuccess = () => {
      db.close();
      resolve(request.result as Uint8Array | undefined);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function packProject(doc: ProjectDoc): Promise<Uint8Array> {
  const entries: Record<string, Uint8Array> = {
    'project.json': strToU8(JSON.stringify(doc)),
  };

  for (const asset of doc.assets) {
    const bytes = await loadAsset(asset.sha256);

    if (!bytes) {
      throw new Error(`Missing asset: ${asset.name}`);
    }

    entries[`assets/${asset.sha256}`] = bytes;
  }

  return zipSync(entries);
}

export async function unpackProject(bytes: Uint8Array): Promise<ProjectDoc> {
  if (bytes.length > MAX_ARCHIVE_BYTES) {
    throw new Error('Project archive exceeds size limit');
  }

  let unpackedBytes = 0;
  let entries = 0;
  const files = unzipSync(bytes, { filter: (file) => {
    entries += 1;
    const limit = file.name === 'project.json' ? MAX_PROJECT_BYTES : MAX_ASSET_BYTES;
    const known = file.name === 'project.json' || /^assets\/[a-f0-9]{64}$/u.test(file.name);

    if (!known || entries > MAX_ARCHIVE_ENTRIES || !Number.isSafeInteger(file.originalSize)
      || file.originalSize < 0 || file.originalSize > limit) {
      throw new Error('Project archive exceeds size limit or contains an unknown entry');
    }

    unpackedBytes += file.originalSize;
    if (unpackedBytes > MAX_UNPACKED_BYTES) {
      throw new Error('Project archive exceeds size limit');
    }

    return true;
  } });
  const projectBytes = files['project.json'];

  if (!projectBytes) {
    throw new Error('Archive has no project.json');
  }

  const doc = JSON.parse(strFromU8(projectBytes)) as ProjectDoc;

  if (doc.format !== 'boardstudio/v2' || !Array.isArray(doc.parts) || !Array.isArray(doc.boards)) {
    throw new Error('Unsupported project format');
  }

  for (const asset of doc.assets) {
    const assetBytes = files[`assets/${asset.sha256}`];

    if (!assetBytes) {
      throw new Error(`Archive has no asset: ${asset.name}`);
    }

    const digest = await crypto.subtle.digest('SHA-256', new Uint8Array(assetBytes));
    const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');

    if (hex !== asset.sha256) {
      throw new Error(`Asset hash mismatch: ${asset.name}`);
    }

    await saveAsset(asset.sha256, assetBytes);
  }

  return doc;
}
