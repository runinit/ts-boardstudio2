import { expect, test } from 'vitest';
import type { Finding, ProjectDoc } from '../../../contracts/src/index';
import { findingTarget, presentedFindings } from './findings';
const document = { boards: [{ id: 'b', name: 'Main', outlineIds: ['o'] }], outline: [{ id: 'o', kind: 'polygon' }], parts: [], matrices: [], caseBodies: [] } as unknown as ProjectDoc;
const warning: Finding = { id: 'outline:corners:fitted', severity: 'warning', scope: 'outline', message: 'Smaller corners', targetIds: ['o'] };
test('combines board wrappers while preserving navigation targets', () => {
 const items = presentedFindings([warning, { ...warning, id: 'board:b:feature:outline:corners:fitted', scope: 'pcb', targetIds: ['b', 'o'] }], document);
 expect(items).toHaveLength(1);
 expect(items[0].targetIds).toEqual(['o', 'b']);
 expect(findingTarget(items[0], document).label).toBe('Main · Outline');
});
test('keeps distinct geometry and puts errors first', () => {
 const items = presentedFindings([warning, { ...warning, targetIds: ['other'] }, { ...warning, id: 'error', severity: 'error' }], document);
 expect(items).toHaveLength(3);
 expect(items[0].severity).toBe('error');
 expect(findingTarget({ ...warning, targetIds: ['deleted'] }, document).label).toBeUndefined();
});

test('generated layer and mounting diagnostics resolve to the assembly geometry', () => {
 const assembly = { stack: [{ id: 'plate', z: 5, thickness: 1.5 }], case: { bodies: [{ body: { id: 'plate', mounts: [{ id: 'suspension' }] } }] } } as unknown as import('@boardstudio/v2-contracts').MechanicalAssembly;
 expect(findingTarget({ ...warning, targetIds: ['plate'] }, document, assembly).label).toBe('Generated · plate');
 expect(findingTarget({ ...warning, targetIds: ['suspension'] }, document, assembly).mechanicalLayer?.id).toBe('plate');
});
