import { expect, test } from 'vitest';
import type { ElectricalPlan } from '@boardstudio/v2-contracts';
import { demoProject } from './demo';
import { existingConnectionReview, releaseReviewedConnections } from './electricalHandoff';

test('manual wiring review releases only the proposed conflicting pins and is immutable', () => {
  const document = demoProject();
  const original = structuredClone(document);
  const pin = document.nets[0].pins[0];
  const plan = {
    boardId: 'main-board',
    nets: [{ id: 'generated/electrical/main-board/new', name: 'New', pins: [pin] }],
    diagnostics: [{ code: 'manual-net-conflict', keyId: pin.partId, severity: 'error', message: 'Review manual net' }],
  } as ElectricalPlan;
  expect(existingConnectionReview(document, plan)).toEqual([{ id: 'row-0', name: 'ROW0', pins: [pin] }]);
  const updated = releaseReviewedConnections(document, plan);
  expect(updated.nets[0].pins).toEqual(document.nets[0].pins.slice(1));
  expect(updated.nets.slice(1)).toEqual(document.nets.slice(1));
  expect(document).toEqual(original);
});
