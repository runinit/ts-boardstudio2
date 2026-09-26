import { describe, expect, it } from 'vitest';
import type { MechanicalAssembly, MechanicalConfiguration } from '@boardstudio/v2-contracts';
import { criticalFitDrawing, mechanicalFabricationNotes } from './mechanicalFabricationNotes';

function fixture(): { assembly: MechanicalAssembly; config: MechanicalConfiguration } {
  const contours = [{ hole: false, points: [{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 30 }, { x: 0, y: 30 }] }];
  return {
    assembly: {
      gasketSupports: [], gasketTracks: [], generatedHardware: [],
      revision: 7, plateContours: contours, nominalPlateContours: contours, suggestedMounts: [], stack: [], diagnostics: [], generationBlocked: false,
      case: { revision: 7, bodies: [{ revision: 7, contours, body: {
        id: 'plate', name: 'Plate', boardId: 'board', kind: 'plate', thickness: 1.5, clearance: 0,
        mounts: [{ id: 'mount-1', kind: 'hole', at: { x: 4, y: 6 }, holeDiameter: 2.2 }],
      } }] },
    },
    config: {
      boardId: 'board', method: 'cnc', mount: 'rigid', integratedPlateFrame: false, mounts: [],
      plateThickness: 1.5, plateFoamThickness: 0, pcbThickness: 1.6, bottomFoamThickness: 0,
      batteryHeight: 0, bottomThickness: 2, plateToPcb: 3.5, wallThickness: 2, clearance: 0.2, profiles: [],
      hardware: [{ id: 'bolt-1', partId: 'plate', featureId: 'mount-1', designation: 'Socket screw',
        thread: 'M2 × 0.4', length: 8, quantity: 4, tolerance: '6g', notes: 'Use washer' }],
      criticalFits: [{ id: 'fit-1', partId: 'plate', label: 'Mount spacing', from: { x: 4, y: 6 }, to: { x: 7, y: 10 }, tolerance: '±0.05 mm' }],
    },
  };
}

describe('mechanical hardware and critical-fit exports', () => {
  it('records explicit hardware metadata and measured XY dimensions', () => {
    const { assembly, config } = fixture();
    const notes = mechanicalFabricationNotes(config, assembly);
    expect(notes).toContain('4 × Socket screw; thread M2 × 0.4; length 8 mm; part plate, mount mount-1; tolerance 6g; Use washer');
    expect(notes).toContain('Mount spacing: 5.000 mm, ±0.05 mm');
    expect(notes).toContain('threads are not modeled');
  });

  it('reports profile-derived plate spacing from the resolved stack', () => {
    const { assembly, config } = fixture();
    assembly.stack = [{ id: 'plate', z: 5, thickness: 1.5 }];
    expect(mechanicalFabricationNotes(config, assembly)).toContain('Plate-to-PCB distance: 5 mm');
  });

  it('draws hardware feature leaders and tolerance-bearing dimension arrows', () => {
    const { assembly, config } = fixture();
    const svg = criticalFitDrawing(assembly, config);
    expect(svg).toContain('data-hardware="bolt-1"');
    expect(svg).toContain('M 4 -6 L');
    expect(svg).toContain('4 × Socket screw; M2 × 0.4 × 8 mm');
    expect(svg).toContain('plate/mount-1; 6g');
    expect(svg).toContain('marker-start="url(#dimension-arrow)"');
    expect(svg).toContain('plate: Mount spacing — 5.000 mm ±0.05 mm');
    expect(svg).toContain('threads are not modeled');
  });

  it('escapes caller-supplied labels, hardware and attribute IDs as XML', () => {
    const { assembly, config } = fixture();
    config.hardware![0].designation = '<script>alert("hardware")</script> & insert';
    config.hardware![0].id = 'bolt" onload="alert(1)';
    config.criticalFits![0].label = '<critical> & "fit"';
    config.criticalFits![0].tolerance = "±0.1 'mm'";
    const svg = criticalFitDrawing(assembly, config);
    expect(svg).not.toContain('<script>');
    expect(svg).not.toContain(' onload="');
    expect(svg).toContain('&lt;script&gt;alert(&quot;hardware&quot;)&lt;/script&gt; &amp; insert');
    expect(svg).toContain('&lt;critical&gt; &amp; &quot;fit&quot;');
    expect(svg).toContain('&apos;mm&apos;');
  });

  it('rejects unresolved mounting features instead of silently dropping callouts', () => {
    const { assembly, config } = fixture();
    config.hardware![0].featureId = 'missing';
    expect(() => criticalFitDrawing(assembly, config)).toThrow('not linked');
  });

  it('rejects zero-length or nonfinite dimension geometry', () => {
    const { assembly, config } = fixture();
    config.criticalFits![0].to = config.criticalFits![0].from;
    expect(() => criticalFitDrawing(assembly, config)).toThrow('distinct');
    config.criticalFits![0].to = { x: Number.NaN, y: 1 };
    expect(() => criticalFitDrawing(assembly, config)).toThrow('Invalid critical-fit coordinates');
  });
});
