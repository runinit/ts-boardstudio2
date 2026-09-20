import type JSZip from 'jszip';
import type { Results } from '../types/results';
import { sourceValue } from './sourceSnapshot';
import {
  effectiveElectrical,
  matrixElectrical,
  resolvedMatrixFindings,
} from './assemblyElectrical';

const messages = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];

function boardExportBlockers(source: string, results: Results): string[] {
  const blockers = (results.layout?.findings || [])
    .filter((finding) => finding.severity === 'error')
    .map((finding) => finding.message);
  try {
    let matrixAudited = false;
    if (results.layout) {
      blockers.push(...resolvedMatrixFindings(results.layout));
      matrixAudited = true;
    } else if (sourceValue(source, ['schema']) === 'ergogen/v1') {
      blockers.push(...matrixElectrical(effectiveElectrical(source)).findings);
      matrixAudited = true;
    }
    for (const field of ['findings', 'electricalFindings']) {
      blockers.push(
        ...messages(sourceValue(source, ['meta', 'studio', field])).filter(
          (message) =>
            !(
              matrixAudited &&
              field === 'electricalFindings' &&
              message.includes(': matrix wiring ')
            )
        )
      );
    }
    const resize = sourceValue(source, ['meta', 'studio', 'resizeSpacing']);
    if (resize && typeof resize === 'object') {
      for (const entry of Object.values(resize)) {
        if (entry && typeof entry === 'object' && 'conflicts' in entry) {
          blockers.push(...messages(entry.conflicts));
        }
      }
    }
  } catch (error) {
    blockers.push(
      `Repair project source: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  return Array.from(new Set(blockers));
}

export function guardBoardExports(
  folder: JSZip,
  source: string,
  results: Results
): Results {
  const blockers = boardExportBlockers(source, results);
  if (
    !blockers.length ||
    (!Object.keys(results.pcbs || {}).length &&
      !Object.keys(results.outlines || {}).length)
  ) {
    return results;
  }
  const independentSheets = new Set(
    Object.values(results.stackups || {}).flatMap((stack) =>
      Object.values(stack.layers)
        .filter((layer) => layer.status === 'ready')
        .map((layer) => layer.output)
    )
  );
  folder.file(
    'error.txt',
    `PCB and outline export blocked. Resolve these findings in the project before exporting:\n${blockers.map((message) => `- ${message}`).join('\n')}`
  );
  return {
    ...results,
    pcbs: {},
    outlines: Object.fromEntries(
      Object.entries(results.outlines || {}).filter(([name]) =>
        independentSheets.has(name)
      )
    ),
  };
}
