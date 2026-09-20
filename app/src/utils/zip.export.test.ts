import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { resolve } from 'ergogen/src/native/layout';
import { readStudio } from './studioSource';
import type { Results } from '../types/results';
import { createZip, exportAllConfigs, exportConfigsProgressively } from './zip';

const generated = vi.hoisted(() => {
  const results: Results = {};
  const failure: { next?: string } = {};
  return { results, failure };
});
vi.mock('file-saver', () => ({ saveAs: vi.fn() }));
vi.mock('../workers/workerFactory', () => ({
  createErgogenWorker: () => {
    const worker = {
      onmessage: (event: MessageEvent) => {
        void event;
      },
      onerror: null,
      terminate: vi.fn(),
      postMessage: () => {
        const error = generated.failure.next;
        delete generated.failure.next;
        queueMicrotask(() =>
          worker.onmessage(
            new MessageEvent('message', {
              data: error
                ? { type: 'error', error }
                : { type: 'success', results: generated.results },
            })
          )
        );
      },
    };
    return worker;
  },
  createJscadWorker: () => null,
}));

const fixture = (): Results => ({
  pcbs: { board: '(kicad_pcb)' },
  outlines: { board: { dxf: 'board-outline', svg: '<svg />' } },
  cases: { enclosure: { jscad: 'case-geometry' } },
  layout: { objects: {}, clusters: {}, layers: {}, units: {}, findings: [] },
});
const source = (studio: Record<string, unknown> = {}) =>
  JSON.stringify({
    schema: 'ergogen/v1',
    layout: {},
    meta: { studio },
  });
const archive = async () => {
  const saved = vi.mocked(saveAs).mock.calls.at(-1)?.[0];
  if (!(saved instanceof Blob)) throw new Error('Expected a ZIP Blob download');
  const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      reader.result instanceof ArrayBuffer
        ? resolve(reader.result)
        : reject(new Error('Expected ZIP bytes'));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(saved);
  });
  return JSZip.loadAsync(bytes);
};

beforeEach(() => {
  vi.clearAllMocks();
  generated.results = fixture();
  delete generated.failure.next;
});

const routes = ['direct', 'bulk', 'progressive'] as const;
const download = async (route: (typeof routes)[number], config: string) => {
  switch (route) {
    case 'direct':
      await createZip(generated.results, config, undefined, false, false, {});
      break;
    case 'bulk':
      await exportAllConfigs(
        [{ name: 'Project', config }],
        undefined,
        false,
        false,
        {}
      );
      break;
    case 'progressive':
      await exportConfigsProgressively(
        [{ name: 'Project', config }],
        undefined,
        false,
        false,
        false,
        () => {},
        () => false
      );
      break;
  }
  return archive();
};

for (const route of routes) {
  const prefix = route === 'direct' ? '' : 'Project/';
  describe(`${route} ZIP board readiness`, () => {
    it('exports valid PCB and outline content with independent case and config files', async () => {
      const zip = await download(route, source());
      expect(
        await zip.file(`${prefix}outputs/pcbs/board.kicad_pcb`)?.async('string')
      ).toBe('(kicad_pcb)');
      expect(
        await zip.file(`${prefix}outputs/outlines/board.dxf`)?.async('string')
      ).toBe('board-outline');
      expect(zip.file(`${prefix}config.yaml`)).not.toBeNull();
      expect(zip.file(`${prefix}outputs/cases/enclosure.jscad`)).not.toBeNull();
      expect(zip.file(`${prefix}error.txt`)).toBeNull();
    });
    for (const [field, value] of Object.entries({
      findings: ['Choose a controller'],
      electricalFindings: ['Review missing column net'],
      resizeSpacing: { keys: { conflicts: ['Switch clearance overlap'] } },
    })) {
      it(`omits PCB and board outlines for ${field} while preserving recovery artifacts`, async () => {
        const zip = await download(route, source({ [field]: value }));
        expect(zip.file(`${prefix}outputs/pcbs/board.kicad_pcb`)).toBeNull();
        expect(zip.file(`${prefix}outputs/outlines/board.dxf`)).toBeNull();
        expect(zip.file(`${prefix}outputs/outlines/board.svg`)).toBeNull();
        expect(zip.file(`${prefix}config.yaml`)).not.toBeNull();
        expect(
          zip.file(`${prefix}outputs/cases/enclosure.jscad`)
        ).not.toBeNull();
        expect(await zip.file(`${prefix}error.txt`)?.async('string')).toMatch(
          /PCB and outline export blocked[\s\S]*Resolve/
        );
      });
    }
    it('omits PCB output for generated layout errors', async () => {
      generated.results.layout?.findings.push({
        feature: 'layout',
        sourcePath: 'layout.objects.key',
        code: 'clearance',
        severity: 'error',
        message: 'Copper clearance violation',
      });
      const zip = await download(route, source());
      expect(zip.file(`${prefix}outputs/pcbs/board.kicad_pcb`)).toBeNull();
      expect(await zip.file(`${prefix}error.txt`)?.async('string')).toContain(
        'Copper clearance violation'
      );
    });
    it('audits raw matrix wiring without relying on saved findings', async () => {
      const config = JSON.stringify({
        schema: 'ergogen/v1',
        layout: {
          objects: {
            key: {
              kind: 'key',
              pcb: 'board',
              properties: { column_net: 'C0', row_net: 'R0' },
              footprints: {
                switch: {
                  what: 'mx',
                  params: { from: 'C0', to: 'CUSTOM_JUNCTION' },
                },
                studio_diode: {
                  what: 'diode',
                  params: { from: 'WRONG_JUNCTION', to: 'R0' },
                },
              },
            },
          },
        },
        pcbs: { board: {} },
      });
      generated.results.layout = resolve(readStudio(config));
      if (route === 'direct') delete generated.results.layout;
      const zip = await download(route, config);
      expect(zip.file(`${prefix}outputs/pcbs/board.kicad_pcb`)).toBeNull();
      expect(await zip.file(`${prefix}error.txt`)?.async('string')).toMatch(
        /WRONG_JUNCTION.*CUSTOM_JUNCTION/
      );
      expect(await zip.file(`${prefix}config.yaml`)?.async('string')).toBe(
        config
      );
    });
  });
}

it('keeps valid projects in a bulk ZIP when another project has blockers', async () => {
  await exportAllConfigs(
    [
      { name: 'Blocked', config: source({ findings: ['Choose controller'] }) },
      { name: 'Valid', config: source() },
    ],
    undefined,
    false,
    false,
    {}
  );
  const zip = await archive();
  expect(zip.file('Blocked/outputs/pcbs/board.kicad_pcb')).toBeNull();
  expect(zip.file('Blocked/error.txt')).not.toBeNull();
  expect(zip.file('Valid/outputs/pcbs/board.kicad_pcb')).not.toBeNull();
  expect(zip.file('Valid/error.txt')).toBeNull();
});

it('allows config-only progressive export with unresolved findings', async () => {
  const config = source({ findings: ['Choose controller'] });
  await exportConfigsProgressively(
    [{ name: 'Project', config }],
    undefined,
    false,
    false,
    true,
    () => {},
    () => false
  );
  const zip = await archive();
  expect(await zip.file('Project.yaml')?.async('string')).toBe(config);
  expect(zip.file('error.txt')).toBeNull();
});

it('keeps independently ready material sheets when PCB export is blocked', async () => {
  generated.results.stackups = {
    stack: {
      pcb: 'board',
      layers: {
        foam: {
          material: 'foam',
          lower: 'pcb',
          upper: 'plate',
          thickness: 1,
          status: 'ready',
          output: 'foam',
        },
      },
    },
  };
  generated.results.outlines = {
    board: { dxf: 'board-outline' },
    foam: { dxf: 'foam-outline' },
  };
  const zip = await download(
    'direct',
    source({ electricalFindings: ['Review matrix wiring'] })
  );
  expect(zip.file('outputs/outlines/board.dxf')).toBeNull();
  expect(await zip.file('outputs/outlines/foam.dxf')?.async('string')).toBe(
    'foam-outline'
  );
});

it('keeps board outputs for warning-only layout findings', async () => {
  generated.results.layout?.findings.push({
    feature: 'layout',
    sourcePath: 'layout',
    code: 'review',
    severity: 'warning',
    message: 'Review dimensions',
  });
  const zip = await download('direct', source());
  expect(zip.file('outputs/pcbs/board.kicad_pcb')).not.toBeNull();
  expect(zip.file('error.txt')).toBeNull();
});

it('keeps per-project compilation errors and continues exporting valid projects', async () => {
  generated.failure.next = 'Unknown footprint selected';
  await exportAllConfigs(
    [
      { name: 'Broken', config: source() },
      { name: 'Valid', config: source() },
    ],
    undefined,
    false,
    false,
    {}
  );
  const zip = await archive();
  expect(await zip.file('Broken/error.txt')?.async('string')).toContain(
    'Compilation failed: Unknown footprint selected'
  );
  expect(zip.file('Broken/config.yaml')).not.toBeNull();
  expect(zip.file('Valid/outputs/pcbs/board.kicad_pcb')).not.toBeNull();
});

it('replaces stale generated matrix findings after a fresh clean wiring audit', async () => {
  const zip = await download(
    'direct',
    source({
      electricalFindings: [
        'board: matrix wiring key diode.from uses OLD, expected FIXED. Review explicit wiring and matrix properties.',
      ],
    })
  );
  expect(zip.file('outputs/pcbs/board.kicad_pcb')).not.toBeNull();
  expect(zip.file('error.txt')).toBeNull();
});
