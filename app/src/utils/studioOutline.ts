import { OUTLINE_CLEARANCE, OUTLINE_FILLET } from './outlineDefaults';
import type { IModel, IPoint, IPathArc, IPathLine, IPathCircle } from 'makerjs';
import type { LayoutReport } from 'ergogen/src/native';
import type { DesignReport } from '../types/design';
import {
  addOutline,
  getValue,
  readStudio,
  removeValue,
  setValue,
} from './studioSource';

type Point = [number, number];
type OutlineSnapshot = {
  paths: Array<
    | { type: 'line'; origin: Point; end: Point }
    | {
        type: 'arc';
        center: Point;
        radius: number;
        startAngle: number;
        endAngle: number;
      }
    | { type: 'circle'; center: Point; radius: number }
  >;
};

function modelSnapshot(model: IModel): OutlineSnapshot {
  const paths: OutlineSnapshot['paths'] = [];
  const visit = (value: IModel, parent: Point): void => {
    const offset: Point = [
      parent[0] + (value.origin?.[0] || 0),
      parent[1] + (value.origin?.[1] || 0),
    ];
    const point = (p: IPoint): Point => [p[0] + offset[0], p[1] + offset[1]];
    for (const path of Object.values(value.paths || {})) {
      if (path.type === 'line') {
        paths.push({
          type: 'line',
          origin: point(path.origin),
          end: point((path as IPathLine).end),
        });
      } else if (path.type === 'arc') {
        const arc = path as IPathArc;
        paths.push({
          type: 'arc',
          center: point(arc.origin),
          radius: arc.radius,
          startAngle: arc.startAngle,
          endAngle: arc.endAngle,
        });
      } else if (path.type === 'circle') {
        paths.push({
          type: 'circle',
          center: point(path.origin),
          radius: (path as IPathCircle).radius,
        });
      } else {
        throw new Error(`Cannot freeze unsupported outline path: ${path.type}`);
      }
    }
    for (const child of Object.values(value.models || {})) {
      visit(child, offset);
    }
  };
  visit(model, [0, 0]);
  return { paths };
}

// Recognize only Studio's named selector recipes; arbitrary authored profiles are untouched.
function managed(source: string, board: string): string[] {
  const data = readStudio(source);
  const profile = data.pcbs?.[board]?.profile;
  if (!profile?.startsWith('profiles.')) {
    return [];
  }
  const profileId = profile.slice('profiles.'.length);
  const profileSpec = data.designs?.profiles?.[profileId];
  const from = profileSpec?.from;
  if (typeof from !== 'string' || !from.startsWith('boundaries.')) {
    return [];
  }
  const boundaryId = from.slice('boundaries.'.length);
  const boundary = data.designs?.boundaries?.[boundaryId] as
    | { from?: string | string[] }
    | undefined;
  const owned = getValue(source, [
    'meta',
    'studio',
    'outline',
    'managed',
    board,
  ]) as string[] | undefined;
  if (owned?.includes(profile) && owned.includes(from)) {
    const regions = Array.isArray(boundary?.from)
      ? boundary.from
      : [boundary?.from];
    return [
      ...regions.filter((ref): ref is string => typeof ref === 'string'),
      from,
      profile,
    ];
  }
  const legacy = boundary as
    | {
        clearance?: unknown;
        connected?: string;
        corners?: { fillet?: unknown };
      }
    | undefined;
  const knownRecipe =
    legacy?.clearance === OUTLINE_CLEARANCE &&
    legacy.connected === 'single' &&
    legacy.corners?.fillet === OUTLINE_FILLET &&
    Object.keys(profileSpec || {}).every((key) =>
      ['from', 'snapshot'].includes(key)
    );
  if (
    !knownRecipe &&
    (!(profileId === board || profileId.startsWith(`${board}_outline`)) ||
      !(boundaryId === board || boundaryId.startsWith(`${board}_edge`)))
  ) {
    return [];
  }
  const refs = Array.isArray(boundary?.from) ? boundary.from : [boundary?.from];
  if (
    !refs.length ||
    !refs.every((ref) => {
      if (typeof ref !== 'string' || !ref.startsWith('regions.')) {
        return false;
      }
      const region = data.designs?.regions?.[ref.slice('regions.'.length)] as
        | {
            select?: { pcb?: string; kind?: string; ids?: string[] };
            envelope?: string;
          }
        | undefined;
      return (
        region?.select?.pcb === board &&
        !!region.select.kind &&
        !!region.envelope
      );
    })
  ) {
    return [];
  }
  return [...(refs as string[]), from, profile];
}

export function hasManagedOutline(source: string): boolean {
  try {
    const data = readStudio(source);
    return Object.keys(data.pcbs || {}).some(
      (board) =>
        !data.pcbs?.[board]?.profile || managed(source, board).length > 0
    );
  } catch {
    return false;
  }
}

export function isOutlineAutomatic(source: string): boolean {
  try {
    return getValue(source, ['meta', 'studio', 'outline', 'auto']) !== false;
  } catch {
    return false;
  }
}
export function setOutlineAutomatic(source: string, auto: boolean): string {
  return setValue(source, ['meta', 'studio', 'outline', 'auto'], auto);
}

export function freezeOutline(
  source: string,
  board: string,
  snapshot: OutlineSnapshot
): string {
  const boundary = managed(source, board).find((ref) =>
    ref.startsWith('boundaries.')
  );
  return setOutlineAutomatic(
    boundary
      ? setValue(
          source,
          ['designs', ...boundary.split('.'), 'snapshot'],
          snapshot
        )
      : source,
    false
  );
}

// Freeze every owned contour, including intermediate features referenced by other recipes.
export function freezeOutlines(source: string, report: DesignReport): string {
  let result = source;
  for (const board of Object.keys(readStudio(source).pcbs || {})) {
    for (const ref of managed(source, board)) {
      const feature = report.features[ref];
      if (!feature) {
        throw new Error(
          `Outline ${ref} is unavailable. Retry outline before freezing.`
        );
      }
      result = setValue(
        result,
        ['designs', ...ref.split('.'), 'snapshot'],
        modelSnapshot(feature.model)
      );
    }
  }
  return setOutlineAutomatic(result, false);
}

export function prepareOutlines(source: string, report?: LayoutReport): string {
  let result = source;
  for (const board of Object.keys(readStudio(source).pcbs || {})) {
    const refs = managed(result, board);
    if (!refs.length && readStudio(result).pcbs?.[board]?.profile) {
      continue;
    }
    for (const ref of refs) {
      result = removeValue(result, ['designs', ...ref.split('.'), 'snapshot']);
    }
    result = addOutline(result, board, report, 'replace');
    result = setValue(
      result,
      ['meta', 'studio', 'outline', 'managed', board],
      managed(result, board)
    );
  }
  return result;
}

export function reconcileOutline(
  source: string,
  _board = 'main',
  report?: LayoutReport
): string {
  return isOutlineAutomatic(source) ? prepareOutlines(source, report) : source;
}
