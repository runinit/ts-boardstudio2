import { describe, expect, it } from 'vitest';
import { demoProject } from './demo';
import { firmwareRequest } from './firmwareHandoff';
import type { ElectricalPlan } from '@boardstudio/v2-contracts';

const plan = (mode: 'matrix' | 'direct' = 'matrix'): ElectricalPlan => ({ instanceId:null, jumpers:[], moduleAliases:{}, peripheralTerminals:{}, mode, assignments: [{ keyId: 'm/r0c0', matrixId: 'm', row: 0, column: 0, rowPin: 'P21', columnPin: 'P20', locked: false, rowFirmwareGpio: mode === 'matrix' ? 'P0.31' : null, columnFirmwareGpio: mode === 'matrix' ? 'P0.29' : null, directGpio: mode === 'direct' ? 'P0.29' : null }], rowPins: mode === 'matrix' ? ['P21'] : [], columnPins: mode === 'matrix' ? ['P20'] : [], diagnostics: [], fingerprint: 'x', boardId: 'b', controllerPartId: 'mcu', revision: 1, controllerProfile: 'ceoloide/mcu_nice_nano', freePins: [], nets: [], diodeDirection: 'col2row', peripherals: [], peripheralPins: {} });

describe('firmware handoff conversion', () => {
  it('creates compact matrix and direct requests', () => {
    const matrix = firmwareRequest(demoProject(), plan()).request;
    expect(matrix.keys).toEqual([{ id: 'm/r0c0', row: 0, column: 0 }]);
    expect(matrix.rows[0].gpio).toBe('P0.31');
    expect(firmwareRequest(demoProject(), plan('direct')).request.direct_pins[0].gpio).toBe('P0.29');
  });
  it('blocks errors and unknown controllers', () => {
    const invalid = plan(); invalid.controllerProfile = null;
    expect(() => firmwareRequest(demoProject(), invalid)).toThrow(/controller profile/);
    const blocked = plan(); blocked.diagnostics = [{ code: 'x', severity: 'error', message: 'bad', keyId: null }];
    expect(() => firmwareRequest(demoProject(), blocked)).toThrow('bad');
  });
  it('requires a distinct right-hand split plan', () => {
    const doc = demoProject(); doc.hardware = { topology: 'split', transport: 'wireless', boards: [], instances: [], sharedConstruction: null };
    expect(() => firmwareRequest(doc, plan())).toThrow(/distinct peripheral/);
    const right = plan(); right.boardId = 'right';
    expect(firmwareRequest(doc, plan(), right).request.peripheral?.board_name).toBe('right');
  });
  it('blocks peripherals without a real firmware profile', () => {
    const value = plan(); value.peripherals = [{ partId: 'oled', source: 'ceoloide/display_ssd1306', kind: 'display-i2c', gpioTerminals: [['SDA', 'i2c/SDA']], fixedTerminals: [] }];
    expect(() => firmwareRequest(demoProject(), value)).toThrow(/display-i2c/);
  });
});
