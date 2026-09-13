import type { LayoutGuide, LayoutReport } from 'ergogen/src/native';

const cache = new WeakMap<LayoutReport, ReturnType<typeof buildTargets>>();

function buildTargets(report: LayoutReport) {
  const centers = report.guides || {};
  const origins: Record<string, LayoutGuide> = {};
  for (const item of Object.values(report.objects)) {
    if (item.kind === 'anchor') {
      continue;
    }
    const id = `${item.id}.origin`;
    origins[id] = {
      id,
      label: `${item.label} origin`,
      position: item.position,
      matrix: item.matrix,
      pcb: item.pcb,
      members: [item.id],
      axes: ['x', 'y'],
    };
  }
  return { centers, origins, guides: { ...centers, ...origins } };
}

// Reports are revision snapshots; dropping one also releases its cached targets.
export function snapTargets(report: LayoutReport) {
  let targets = cache.get(report);
  if (!targets) {
    targets = buildTargets(report);
    cache.set(report, targets);
  }
  return targets;
}
