declare module 'node:fs/promises' {
  export function readFile(url: URL): Promise<Uint8Array>;
}
