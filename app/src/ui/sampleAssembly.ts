import {
  emptyProject,
  type Contour,
  type PartDefinition,
  type ProjectDoc,
  type Vec2,
} from '@boardstudio/v2-contracts';
import { keycapOutline, libraryKeycap, previewPoint } from './libraryPreviewGeometry';

export function sampleAssembly(
  document: ProjectDoc,
  definition: PartDefinition,
  companions: { definition: PartDefinition; at: Vec2; rotation?: number; side?: 'front' | 'back' }[] = [],
  rotation = 0,
) {
  const project = emptyProject('sample-pcb', 'Sample PCB');
  project.revision = document.revision;
  project.assets = document.assets;
  const entries = [{ definition, at: { x: 0, y: 0 }, rotation, side: 'front' as const }, ...companions];
  project.definitions = [
    ...new Map(
      entries.map((entry) => [entry.definition.id, entry.definition]),
    ).values(),
  ];
  project.parts = entries.map((entry, i) => ({
    id: `sample-${i}`,
    definitionId: entry.definition.id,
    reference: `P${i + 1}`,
    // A library sample has no project wiring. Override saved terminal nets locally.
    generatorParameters: Object.fromEntries(Object.keys(entry.definition.terminals ?? {}).map(terminal => [terminal, ''])),
    pose: { at: entry.at, rotation: entry.rotation ?? 0 },
    side: entry.side ?? 'front',
  }));
  const points = entries.flatMap((entry) => {
    const keycap = libraryKeycap(entry.definition);
    const outline = [...entry.definition.courtyard, ...(keycap ? keycapOutline(keycap) : [])];
    const envelope = outline.length ? outline : [{ x: -10, y: -10 }, { x: 10, y: 10 }];
    return envelope.map(point => previewPoint(point, entry.at, entry.rotation));
  });
  const minX = Math.min(...points.map((p) => p.x)) - 3,
    maxX = Math.max(...points.map((p) => p.x)) + 3,
    minY = Math.min(...points.map((p) => p.y)) - 3,
    maxY = Math.max(...points.map((p) => p.y)) + 3;
  const contours: Contour[] = [
    {
      hole: false,
      points: [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY },
      ],
    },
  ];
  project.boards = [
    {
      id: 'sample-board',
      name: 'Sample PCB',
      outlineIds: [],
      partIds: project.parts.map((p) => p.id),
      netIds: [],
      thickness: 1.6,
    },
  ];
  return { project, contours };
}
