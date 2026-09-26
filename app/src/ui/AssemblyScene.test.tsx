import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import type { MechanicalAssembly, PcbPreview } from '@boardstudio/v2-contracts';
import { AssemblyScene } from './AssemblyScene';

test('reports blocked CAD solids when geometry prevents generation', () => {
  const assembly = {
    case: { bodies: [{ body: { id: 'plate' } }, { body: { id: 'bottom' } }] },
    diagnostics: [{ severity: 'error' }],
    generationBlocked: true,
    revision: 2,
    stack: [],
  } as unknown as MechanicalAssembly;
  const board = { thickness: 1.6, models: [] } as unknown as PcbPreview;
  const markup = renderToStaticMarkup(
    <AssemblyScene board={board} models={[]} mechanical={assembly} colorScheme="dark" />,
  );

  expect(markup).toContain('Case solids blocked');
  expect(markup).not.toContain('Building generated solids');
});

test('reports generated solids when findings only block manufacturing', () => {
  const assembly = {
    case: { bodies: [{ body: { id: 'plate' } }] },
    diagnostics: [{ severity: 'error' }],
    generationBlocked: false,
    revision: 2,
    stack: [],
  } as unknown as MechanicalAssembly;
  const board = { thickness: 1.6, models: [] } as unknown as PcbPreview;
  const markup = renderToStaticMarkup(
    <AssemblyScene board={board} models={[]} bodies={[{ id: 'plate', name: 'Plate', mesh: { positions: new Float32Array(), normals: new Float32Array() } }]} mechanical={assembly} colorScheme="dark" />,
  );

  expect(markup).toContain('Generated CAD solids');
  expect(markup).toContain('manufacturing findings to review');
});
