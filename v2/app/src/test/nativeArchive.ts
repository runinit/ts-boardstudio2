import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ArchiveReply } from '@boardstudio/v2-contracts';
import { spawnSync } from 'node:child_process';
import type { ArchiveTransport } from '../storage';

type NativeRequest = Parameters<ArchiveTransport['archive']>[0];

const root = fileURLToPath(new URL('../../../../', import.meta.url));
let built = false;

export function nativeArchiveTransport(): ArchiveTransport {
  return {
    async archive(input: NativeRequest) {
      const driver = process.env.BOARDSTUDIO_ARCHIVE_DRIVER ?? join(root, 'v2/core/target/debug/examples/archive_request');
      if (!built && !process.env.BOARDSTUDIO_ARCHIVE_DRIVER) {
        const build = spawnSync('cargo', ['build', '--manifest-path', 'v2/core/Cargo.toml', '--locked', '--example', 'archive_request'], { cwd: root, encoding: 'utf8' });
        if (build.error) throw build.error;
        if (build.status !== 0) throw new Error(build.stderr);
        built = true;
      }
      const temp = mkdtempSync(join(tmpdir(), 'boardstudio-archive-'));
      const output = join(temp, 'out');
      mkdirSync(output);
      const requestPath = join(temp, 'request.json');
      writeFileSync(requestPath, JSON.stringify(input.request));
      const inputs = input.buffers.map((bytes, index) => {
        const path = join(temp, `${index}.bin`);
        writeFileSync(path, bytes);
        return path;
      });
      try {
        const result = spawnSync(driver, [requestPath, output, ...inputs], { encoding: 'utf8' });
        if (result.error) throw result.error;
        if (result.status !== 0) throw new Error(result.stderr || `archive driver exited ${result.status}`);
        const reply = JSON.parse(result.stdout.trim()) as ArchiveReply;
        if (reply.kind === 'error') throw new Error(reply.message);
        const outputBytes = (index: number) => new Uint8Array(readFileSync(join(output, `${index}.bin`)));
        if (reply.kind === 'packed') return { kind: 'archive' as const, reply: { kind: 'packed' as const, bytes: outputBytes(0) } };
        return { kind: 'archive' as const, reply: { kind: 'unpacked' as const, projectJson: reply.projectJson, assets: reply.assets.map((asset) => ({ sha256: asset.sha256, bytes: outputBytes(asset.bufferIndex) })) } };
      } finally {
        rmSync(temp, { recursive: true, force: true });
      }
    },
  };
}
