import { describe, expect, it } from 'vitest';
import type {
  PartDefinition,
  ProjectDoc,
} from '@boardstudio/v2-contracts';
import {
  createMechanicalConfiguration,
  defaultPlateFoamThickness,
  inferSwitchFamily,
  initialSwitchFamily,
  materialForProcess,
} from './mechanicalPresets';

function documentWithSwitch(source = 'ceoloide/switch_mx', parameters: Record<string, unknown> = {}): ProjectDoc {
  return {
    boards: [{ id: 'board', name: 'Main', partIds: ['switch'], thickness: 1.2 }],
    parts: [{ id: 'switch', definitionId: 'switch-def', generatorParameters: parameters }],
    definitions: [{
      id: 'switch-def',
      name: 'Switch',
      kind: source.includes('hotswap') ? 'connector' : 'switch',
      generator: { source, version: '1', parameters: {} },
      courtyard: [],
      pads: [],
    }],
  } as unknown as ProjectDoc;
}

describe('mechanical generation defaults', () => {
  it('creates complete, synchronized process defaults without a 3D model', () => {
    const document = documentWithSwitch();
    const configuration = createMechanicalConfiguration(document, 'board');
    const byId = new Map(configuration.partProcesses?.map((process) => [process.partId, process]));

    expect(configuration.pcbThickness).toBe(1.2);
    expect(configuration.batteryHeight).toBe(0);
    expect(configuration.plateThickness).toBe(1.5);
    expect(configuration.plateToPcb).toBe(3.5);
    expect(configuration.plateFoamThickness).toBe(3);
    expect(byId.get('plate')).toMatchObject({ method: 'printed', material: 'PLA', thickness: 1.5 });
    expect(byId.get('plate-foam')).toMatchObject({ method: 'cut-sheet', material: 'EVA', thickness: 3 });
    expect(byId.get('bottom-foam')).toMatchObject({ method: 'cut-sheet', material: 'EVA', thickness: 2 });
    expect(byId.get('bottom')).toMatchObject({ method: 'printed', material: 'PLA', thickness: 3 });
  });

  it('selects material defaults for each current construction method', () => {
    for (const [method, material] of [['printed', 'PLA'], ['cnc', 'Aluminium'], ['cut-sheet', 'Acrylic'], ['pcb-fr4', 'FR-4']] as const) {
      expect(materialForProcess('plate', method)).toBe(material);
      expect(materialForProcess('plate-foam', method)).toBe('EVA');
    }
  });

  it('recognizes canonical switches and requires a family for combined imports', () => {
    expect(initialSwitchFamily(documentWithSwitch('ceoloide/switch_mx'), 'board')).toBe('mx');
    expect(initialSwitchFamily(documentWithSwitch('ceoloide/switch_choc_v1_v2', { choc_v1_support: true, choc_v2_support: false }), 'board')).toBe('choc-v1');

    const combined = {
      id: 'combined',
      name: 'Combined Choc',
      kind: 'switch',
      generator: {
        source: 'ceoloide/switch_choc_v1_v2',
        version: '1',
        parameters: { choc_v1_support: { value: true }, choc_v2_support: { value: true } },
      },
      courtyard: [],
      pads: [],
    } as unknown as PartDefinition;
    expect(inferSwitchFamily(combined)).toBeUndefined();
    expect(inferSwitchFamily(combined, { choc_v1_support: false, choc_v2_support: true })).toBe('choc-v2');
  });

  it('rounds plate foam down to 0.1 mm and caps it below 3 mm', () => {
    expect(defaultPlateFoamThickness(3.5)).toBe(3);
    expect(defaultPlateFoamThickness(1.87)).toBe(1.6);
    expect(defaultPlateFoamThickness(0.1)).toBe(0);
  });
});
