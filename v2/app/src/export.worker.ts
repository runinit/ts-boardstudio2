import type { Contour, ProjectDoc } from '@boardstudio/v2-contracts';
import { exportBoard, exportFootprintFile } from '@boardstudio/v2-kicad';
import { strToU8, zipSync } from 'fflate';

export type ExportRequest = {
  id: string;
  kind: 'project' | 'footprints' | 'kicad';
  document: ProjectDoc;
  boardId?: string;
  contours?: Contour[];
  paths: [string, string][];
  files: Record<string, Uint8Array>;
};
export type ExportReply =
  | { id: string; kind: 'file'; filename: string; bytes: Uint8Array; mediaType: string }
  | { id: string; kind: 'error'; message: string };

function build(request: ExportRequest): ExportReply {
  const paths = new Map(request.paths);
  const files = request.files;

  if (request.kind === 'project') {
    files['project.json'] = strToU8(JSON.stringify(request.document));
    return { id: request.id, kind: 'file', filename: `${request.document.name}.boardstudio`, bytes: zipSync(files), mediaType: 'application/zip' };
  }

  if (request.kind === 'footprints') {
    const boardUtilities: string[] = [];
    for (const definition of request.document.definitions) {
      let exported;
      try {
        exported = exportFootprintFile(definition, paths);
      } catch (error) {
        if (error instanceof Error && error.message.includes('emits board objects and must be exported on a board')) {
          boardUtilities.push(definition.name);
          continue;
        }
        throw error;
      }
      const path = `BoardStudio.pretty/${exported.filename}`;
      if (files[path]) {
        throw new Error(`Footprint filename repeats: ${exported.filename}`);
      }
      files[path] = strToU8(exported.content);
    }

    files['fp-lib-table'] = strToU8('(fp_lib_table (lib (name "BoardStudio") (type "KiCad") (uri "${KIPRJMOD}/BoardStudio.pretty") (options "") (descr "")))\n');
    if (boardUtilities.length) {
      files['BOARD-UTILITIES.txt'] = strToU8(`These generators emit board objects and are included when exporting a placed board:\n${boardUtilities.join('\n')}\n`);
    }
    return { id: request.id, kind: 'file', filename: `${request.document.name}-footprints.zip`, bytes: zipSync(files), mediaType: 'application/zip' };
  }

  const board = request.document.boards.find((entry) => entry.id === request.boardId);
  if (!board || !request.contours) {
    throw new Error('Select a resolved board before export');
  }
  const exported = exportBoard(request.document, board.id, request.contours, request.document.revision, paths);
  if (paths.size === 0) {
    return { id: request.id, kind: 'file', filename: exported.filename, bytes: strToU8(exported.content), mediaType: 'text/plain' };
  }

  files[exported.filename] = strToU8(exported.content);
  return { id: request.id, kind: 'file', filename: `${board.name}-kicad.zip`, bytes: zipSync(files), mediaType: 'application/zip' };
}

self.onmessage = (event: MessageEvent<ExportRequest>) => {
  try {
    const reply = build(event.data);
    self.postMessage(reply, reply.kind === 'file' ? [reply.bytes.buffer] : []);
  } catch (cause) {
    const reply: ExportReply = { id: event.data.id, kind: 'error', message: cause instanceof Error ? cause.message : String(cause) };
    self.postMessage(reply);
  }
};
