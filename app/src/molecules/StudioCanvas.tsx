import { useSnapOptions } from '../hooks/useSnapOptions';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutReport } from 'ergogen/src/native';
import type { IModel } from 'makerjs';
import { layoutPolygon } from '../utils/layoutDrawing';
import { Drawing } from './CasePlanPreview';
import { theme } from '../theme/theme';
import CanvasTools from './CanvasTools';
import SnapControls from './SnapControls';
import { StudioViewport } from './StudioStyles';
import { snapLayout, type LayoutSnap } from '../utils/layoutSnapping';
import { snapFrame } from '../utils/snapFrame';
import { pitchUnits } from '../utils/designUnits';
import { layoutSpacing, hasSpacing } from '../utils/snapSpacing';
import { useLayoutAnalysis } from '../hooks/useCasePreview';
import { moveTargets, movingIds, attachmentReason } from '../utils/studioMove';
import {
  includesObject,
  targets,
  sameTarget,
  selectTargets,
  selectionMode,
  type StudioSelection,
} from '../utils/studioTargets';
export type { StudioSelection } from '../utils/studioTargets';
import { describeSelection } from '../utils/studioSelectionGeometry';
import type { StudioRule } from '../utils/studioSource';

type Box = { x: number; y: number; w: number; h: number };
const DRAG_THRESHOLD = 4,
  SNAP_PIXELS = 8,
  PAD = 14,
  MIN_SIZE = 40,
  ZOOM_STEP = 1.25,
  MIN_SCALE = 0.1,
  MAX_SCALE = 5,
  MOVE_TOLERANCE = 0.01,
  BOUNDARY_PAD = 2.5,
  BOUNDARY_RADIUS = 1.8,
  HANDLE = 1.2,
  GUIDE_LENGTH = 9;
export default function StudioCanvas({
  report,
  selection,
  onSelect,
  onMove,
  onDelete,
  stale,
  source,
  model,
  side,
  onSide,
  rules,
  injections,
  onKeepSnap,
  onPickTarget,
}: {
  onPickTarget?: (ref: string) => void;
  onKeepSnap?: (snap: LayoutSnap) => void;
  report?: LayoutReport;
  injections?: string[][];
  selection: StudioSelection;
  onSelect: (value: StudioSelection, panel?: 'inspect' | 'keep') => void;
  onMove: (
    selection: StudioSelection,
    delta: number[],
    source: string,
    candidate?: string
  ) => boolean | void;
  onDelete?: () => void;
  stale: boolean;
  source: string;
  model?: IModel;
  side: 'top' | 'side';
  onSide: (view: 'top' | 'side') => void;
  rules: Record<string, StudioRule>;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [tool, setTool] = useState('select');
  // Selection changes must not replace the tool chosen for the next click.
  const [scope, setScope] = useState(() =>
    ['columns', 'rows', 'clusters'].includes(selection.section)
      ? selection.section
      : 'keys'
  );
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const [snapping, setSnapping] = useState(true);
  const [snapOptions, setSnapOptions] = useSnapOptions();
  const [lastSnap, setLastSnap] = useState<
    (LayoutSnap & { source: string }) | null
  >(null);
  const pitchValues = useMemo(() => {
    try {
      return pitchUnits(source);
    } catch {
      return { u: 19, v: 19 };
    }
  }, [source]);
  const gap = snapOptions.gap;
  useEffect(() => {
    setLastSnap((current) => (current?.source === source ? current : null));
  }, [source]);
  const [committed, setCommitted] = useState<{
    source: string;
    report: LayoutReport;
  } | null>(null);
  const spacing = useMemo(() => {
    try {
      return report ? layoutSpacing(source, report) : {};
    } catch {
      return {};
    }
  }, [source, report]);
  useEffect(() => {
    if (committed && (source !== committed.source || !stale)) {
      setCommitted(null);
    }
  }, [source, stale, committed]);
  const items = Object.values(report?.objects || {}).filter(
    (item) => item.kind !== 'anchor'
  );
  const axis = side === 'top' ? 1 : 2;
  const fit = useMemo(() => {
    const points = items.flatMap((item) =>
      layoutPolygon(item, side)
        .split(' ')
        .filter(Boolean)
        .map((pair) => pair.split(',').map(Number))
    );
    const low = [0, 1].map((index) =>
      points.length ? Math.min(...points.map((p) => p[index])) : 0
    );
    const high = [0, 1].map((index) =>
      points.length ? Math.max(...points.map((p) => p[index])) : MIN_SIZE
    );
    return {
      x: low[0] - PAD,
      y: low[1] - PAD,
      w: Math.max(MIN_SIZE, high[0] - low[0]) + 2 * PAD,
      h: Math.max(MIN_SIZE, high[1] - low[1]) + 2 * PAD,
    };
    // Geometry updates keep the camera; Fit explicitly follows edited bounds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, side]);
  const [camera, setCamera] = useState<Box | null>(null);
  const objectIds = Object.keys(report?.objects || {})
    .sort()
    .join('|');
  useEffect(() => {
    setCamera(fitRef.current);
  }, [objectIds, side]);
  const box = camera || fit;
  const liveBox = useRef(box);
  liveBox.current = box;
  const fitRef = useRef(fit);
  fitRef.current = fit;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    box: Box;
    points: { x: number; y: number }[];
  } | null>(null);
  const [drag, setDrag] = useState<{
    selection: StudioSelection;
    start: number[];
    screen: number[];
    snap?: LayoutSnap;
    delta: number[];
    source: string;
    phase: 'moving' | 'released';
    checkSpacing?: boolean;
  } | null>(null);
  const [moveError, setMoveError] = useState('');
  const proposal = useMemo(() => {
    if (!drag || drag.phase !== 'released' || !report) {
      return { source: '', error: '' };
    }
    try {
      if (
        drag.checkSpacing &&
        !hasSpacing(
          report,
          movingIds(source, drag.selection, report),
          drag.delta,
          gap,
          spacing
        )
      ) {
        throw new Error(
          'Not enough room for the configured spacing. Move farther away or turn off snapping.'
        );
      }
      return {
        source: moveTargets(source, drag.selection, drag.delta, report),
        error: '',
      };
    } catch (error) {
      return { source: '', error: String(error) };
    }
  }, [drag, source, report, gap, spacing]);
  const candidate = proposal.source;
  const preview = useLayoutAnalysis(candidate, injections, !!candidate);
  const previewReady =
    !!candidate && !preview.stale && !preview.pending && !preview.error;
  const visible = previewReady
    ? preview.result?.layout || report
    : committed?.report || report;
  const drawn = Object.values(visible?.objects || {}).filter(
    (item) => item.kind !== 'anchor'
  );
  const outline = useMemo(() => {
    if (!visible) {
      return null;
    }
    try {
      return describeSelection(visible, selection, side, pitchValues);
    } catch {
      return null;
    }
  }, [visible, selection, side, pitchValues]);
  const outlineDelta = useMemo(
    () => (drag && !previewReady ? drag.delta : [0, 0, 0]),
    [drag, previewReady]
  );
  const outlineBox = useMemo(() => {
    if (!outline) {
      return null;
    }
    const x = outline.min.x - BOUNDARY_PAD,
      y = outline.min.y - BOUNDARY_PAD,
      w = outline.width + 2 * BOUNDARY_PAD,
      h = outline.height + 2 * BOUNDARY_PAD;
    return { x, y, w, h };
  }, [outline]);
  const dragSource = drag?.source,
    dragSelection = drag?.selection;
  const draggedIds = useMemo(() => {
    if (!dragSource || !dragSelection || !report) {
      return [];
    }
    try {
      return movingIds(dragSource, dragSelection, report);
    } catch {
      return Object.values(report.objects)
        .filter((item) => includesObject(dragSelection, item))
        .map((item) => item.id);
    }
  }, [dragSource, dragSelection, report]);
  useEffect(() => {
    if (!drag || drag.phase !== 'released') {
      return;
    }
    if (!candidate || preview.error) {
      setMoveError(
        proposal.error ||
          preview.error ||
          'The project changed. Retry the move.'
      );
      setDrag(null);
      return;
    }
    if (previewReady) {
      const checked = preview.result?.layout;
      const blocked = draggedIds.find((id) => {
        const before = report?.objects[id],
          after = checked?.objects[id];
        return (
          before &&
          (!after ||
            before.position.some(
              (value, axis) =>
                Math.abs(value + drag.delta[axis] - after.position[axis]) >
                MOVE_TOLERANCE
            ))
        );
      });
      if (!checked || blocked) {
        setMoveError(
          blocked
            ? `Placement constraints hold ${blocked}. Adjust its constraints before moving it.`
            : 'The moved layout could not be validated.'
        );
      } else if (
        onMove(drag.selection, drag.delta, drag.source, candidate) === false
      ) {
        setMoveError('The project changed during this move. Retry.');
      } else {
        // Keep the accepted pose visible until the main analysis catches up.
        setCommitted({ source: candidate, report: checked });
        setLastSnap(
          drag.snap && drag.snap.kind !== 'grid'
            ? { ...drag.snap, source: candidate }
            : null
        );
      }
      setDrag(null);
    } else if (
      onMove(drag.selection, drag.delta, source, candidate) === false
    ) {
      setMoveError('The project changed during this move. Retry.');
      setDrag(null);
    } else {
      // Immediate edits already have a synchronous draft pose; do not pin the old one.
      setCommitted(null);
      setLastSnap(
        drag.snap && drag.snap.kind !== 'grid'
          ? { ...drag.snap, source: candidate }
          : null
      );
      setDrag(null);
    }
  }, [
    drag,
    candidate,
    previewReady,
    preview.error,
    proposal.error,
    preview.result,
    draggedIds,
    report,
    onMove,
    source,
  ]);
  const convert = (x: number, y: number) => {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) {
      return [0, 0, 0];
    }
    const p = new DOMPoint(x, y).matrixTransform(matrix.inverse());
    return side === 'top' ? [p.x, -p.y, 0] : [p.x, 0, -p.y];
  };
  const zoom = (factor: number, px?: number, py?: number) => {
    const current = liveBox.current,
      base = fitRef.current;
    const scale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, (current.w / base.w) * factor)
    );
    const ratio = (scale * base.w) / current.w;
    const x = px ?? current.x + current.w / 2,
      y = py ?? current.y + current.h / 2;
    setCamera({
      x: x + (current.x - x) * ratio,
      y: y + (current.y - y) * ratio,
      w: current.w * ratio,
      h: current.h * ratio,
    });
  };
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  useEffect(() => {
    const node = svg.current;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const matrix = node?.getScreenCTM();
      if (!matrix) {
        return;
      }
      const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(
        matrix.inverse()
      );
      zoomRef.current(event.deltaY < 0 ? 1 / ZOOM_STEP : ZOOM_STEP, p.x, p.y);
    };
    node?.addEventListener('wheel', wheel, { passive: false });
    return () => node?.removeEventListener('wheel', wheel);
  }, []);
  const pick = (item: NonNullable<LayoutReport['objects'][string]>) => {
    const sameCluster =
      selection.section === 'clusters' && item.cluster === selection.id;
    const sameColumn =
      selection.section === 'columns' &&
      item.cluster === selection.cluster &&
      item.cell?.[0] === selection.id;
    const sameRow =
      selection.section === 'rows' &&
      item.cluster === selection.cluster &&
      item.cell?.[1] === selection.id;
    const next: StudioSelection =
      tool === 'move' && (sameCluster || sameColumn || sameRow)
        ? selection
        : scopeRef.current === 'columns' && item.cell && item.cluster
          ? {
              section: 'columns',
              cluster: item.cluster,
              id: item.cell[0],
            }
          : scopeRef.current === 'clusters' && item.cluster
            ? { section: 'clusters', id: item.cluster }
            : scopeRef.current === 'rows' && item.cell && item.cluster
              ? { section: 'rows', cluster: item.cluster, id: item.cell[1] }
              : { section: 'objects', id: item.id };
    return next;
  };
  const reset = () => {
    setCamera(fitRef.current);
    gesture.current = null;
    setDrag(null);
  };
  const startGesture = () => {
    gesture.current = {
      box: { ...liveBox.current },
      points: Array.from(pointers.current.values()),
    };
  };
  const end = (id: number, commit: 'commit' | 'cancel') => {
    if (
      drag &&
      commit === 'commit' &&
      pointers.current.size === 1 &&
      drag.delta.some((value) => Math.abs(value) > 0.001)
    ) {
      setDrag({ ...drag, phase: 'released' });
    } else {
      setDrag(null);
    }
    pointers.current.delete(id);
    gesture.current = null;
    if (pointers.current.size) {
      startGesture();
    }
  };
  return (
    <StudioViewport ref={viewport}>
      {lastSnap &&
        lastSnap.source === source &&
        (lastSnap.kind !== 'edge' || !attachmentReason(source, selection)) &&
        selection.section === 'objects' &&
        onKeepSnap &&
        lastSnap.moving === selection.id && (
          <div
            style={{
              position: 'absolute',
              bottom: theme.studio.dragStatusBottom,
              left: theme.spacing.md,
              zIndex: 1,
            }}
          >
            <button
              disabled={stale}
              onClick={() => {
                onKeepSnap(lastSnap);
                setLastSnap(null);
              }}
            >
              Keep relationship ·{' '}
              {lastSnap.kind === 'center'
                ? 'Center alignment'
                : lastSnap.kind === 'origin'
                  ? 'Origin alignment'
                  : 'Edge offset'}{' '}
              · {lastSnap.label.replace('Centered on ', '')}
            </button>
            <button
              aria-label="Dismiss relationship"
              onClick={() => setLastSnap(null)}
            >
              Dismiss
            </button>
          </div>
        )}
      <CanvasTools
        tool={tool}
        setTool={setTool}
        scope={scope}
        setScope={(next) => {
          scopeRef.current = next;
          setScope(next);
        }}
        side={side}
        setSide={onSide}
        reset={reset}
        zoom={(direction) =>
          zoom(direction === 'in' ? 1 / ZOOM_STEP : ZOOM_STEP)
        }
        scale={Math.round((fit.w / box.w) * 100)}
        snapTools={
          <SnapControls
            options={snapOptions}
            enabled={snapping}
            onEnabled={setSnapping}
            onChange={setSnapOptions}
            units={pitchValues}
            viewport={viewport}
          />
        }
        onDelete={selection.id && !stale ? onDelete : undefined}
      />
      {(drag || moveError) && (
        <div
          role="status"
          style={{
            position: 'absolute',
            bottom: theme.studio.dragStatusBottom,
            left: theme.spacing.sm,
            padding: theme.spacing.sm,
            background: theme.colors.background,
            pointerEvents: 'none',
          }}
        >
          {moveError ||
            (drag?.phase === 'released'
              ? 'Checking placement…'
              : drag?.snap
                ? drag.snap.label
                : 'Drag to move · Alt bypasses snap · Esc cancels')}
        </div>
      )}
      <svg
        ref={svg}
        aria-label="Interactive board layout"
        role="group"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            setDrag(null);
            setMoveError('');
          }
        }}
        viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
        style={{
          width: '100%',
          minHeight: 0,
          flex: 1,
          touchAction: 'none',
          cursor: tool === 'pan' ? 'grab' : drag ? 'grabbing' : 'default',
        }}
        onPointerDown={(event) => {
          if (event.button > 1 || drag?.phase === 'released') {
            return;
          }
          pointers.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
          });
          svg.current?.setPointerCapture(event.pointerId);
          if (pointers.current.size > 1) {
            setDrag(null);
            startGesture();
            return;
          }
          const id = (event.target as Element)
            .closest('[data-object]')
            ?.getAttribute('data-object');
          const item = id ? report?.objects[id] : undefined;
          if (item && tool !== 'pan' && event.button !== 1) {
            const picked = pick(item);
            const mode = selectionMode(event);
            const order = Array.from(
              new Map(
                items.map((value) => {
                  const target = pick(value);
                  return [JSON.stringify(target), target];
                })
              ).values()
            );
            const next =
              mode === 'replace' &&
              targets(selection).some((target) => sameTarget(target, picked))
                ? selection
                : selectTargets(selection, picked, mode, order);
            onSelect(next, 'keep');
            svg.current?.focus();
            if (mode !== 'replace') {
              return;
            }
            if (!item.locked) {
              setCamera({ ...liveBox.current });
              setDrag({
                selection: next,
                start: convert(event.clientX, event.clientY),
                screen: [event.clientX, event.clientY],
                delta: [0, 0, 0],
                source,
                phase: 'moving',
              });
              setMoveError('');
            }
            return;
          }
          if (tool === 'select' && event.button !== 1) {
            onSelect({ section: 'objects', id: '' }, 'keep');
          }
          startGesture();
        }}
        onPointerMove={(event) => {
          if (!pointers.current.has(event.pointerId)) {
            return;
          }
          pointers.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
          });
          if (drag?.phase === 'moving' && pointers.current.size === 1) {
            if (
              Math.hypot(
                event.clientX - drag.screen[0],
                event.clientY - drag.screen[1]
              ) < DRAG_THRESHOLD &&
              !drag.delta.some(Boolean)
            ) {
              return;
            }
            const next = convert(event.clientX, event.clientY);
            const delta = next.map((v, i) => v - drag.start[i]);
            const matrix = svg.current?.getScreenCTM();
            const tolerance =
              SNAP_PIXELS /
              Math.max(0.01, Math.hypot(matrix?.a || 1, matrix?.b || 0));
            const snap =
              snapping && !event.altKey && side === 'top' && report
                ? snapLayout(
                    report,
                    draggedIds,
                    delta,
                    { ...snapOptions, gap },
                    pitchValues,
                    tolerance,
                    spacing,
                    snapFrame(report, drag.selection).matrix,
                    drag.snap,
                    snapFrame(report, drag.selection).origin
                  )
                : undefined;
            setDrag({
              ...drag,
              delta: snap?.delta || delta,
              snap,
              checkSpacing: snapping && !event.altKey && side === 'top',
            });
            return;
          }
          const start = gesture.current,
            node = svg.current;
          if (!start || !node) {
            return;
          }
          const points = Array.from(pointers.current.values());
          const center = (p: { x: number; y: number }[]) => ({
            x: p.reduce((sum, v) => sum + v.x, 0) / p.length,
            y: p.reduce((sum, v) => sum + v.y, 0) / p.length,
          });
          const before = center(start.points),
            after = center(points);
          const distance = (p: { x: number; y: number }[]) =>
            p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 1;
          const ratio =
            points.length > 1 && start.points.length > 1
              ? distance(start.points) / Math.max(1, distance(points))
              : 1;
          const scale = Math.max(
            MIN_SCALE,
            Math.min(MAX_SCALE, (start.box.w / fit.w) * ratio)
          );
          const w = fit.w * scale,
            h = (start.box.h * w) / start.box.w;
          const rect = node.getBoundingClientRect(),
            units = Math.max(
              start.box.w / rect.width,
              start.box.h / rect.height
            );
          setCamera({
            x:
              start.box.x +
              (start.box.w - w) / 2 -
              (after.x - before.x) * units,
            y:
              start.box.y +
              (start.box.h - h) / 2 -
              (after.y - before.y) * units,
            w,
            h,
          });
        }}
        onPointerUp={(event) => end(event.pointerId, 'commit')}
        onPointerCancel={(event) => end(event.pointerId, 'cancel')}
      >
        <defs>
          <pattern
            id="studio-grid"
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 5 0 L 0 0 0 5"
              fill="none"
              stroke={theme.studio.grid}
              strokeWidth="0.12"
            />
          </pattern>
        </defs>
        <rect
          x={box.x}
          y={box.y}
          width={box.w}
          height={box.h}
          fill="url(#studio-grid)"
          opacity={theme.studio.gridOpacity}
        />
        {side === 'top' && model && (
          <g transform="scale(1,-1)" pointerEvents="none">
            <Drawing model={model} color={theme.studio.outline} />
          </g>
        )}
        {drawn.map((item) => {
          const active = includesObject(selection, item);
          const delta =
            drag && !previewReady && draggedIds.includes(item.id)
              ? drag.delta
              : [0, 0, 0];
          return (
            <g
              key={item.id}
              data-object={item.id}
              role="button"
              tabIndex={0}
              aria-label={`Select ${item.label}`}
              aria-describedby={
                item.cell ? `studio-${item.id}-cell` : undefined
              }
              aria-pressed={active}
              transform={`translate(${delta[0]},${-delta[axis]})`}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  const next = pick(item);
                  const order = items.map(pick);
                  const selected = selectTargets(
                    selection,
                    next,
                    selectionMode(event),
                    order
                  );
                  onSelect(selected, 'keep');
                }
                if (
                  !active ||
                  item.locked ||
                  !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
                    event.key
                  )
                ) {
                  return;
                }
                event.preventDefault();
                const delta = [0, 0, 0];
                delta[
                  event.key === 'ArrowLeft' || event.key === 'ArrowRight'
                    ? 0
                    : axis
                ] =
                  (event.key === 'ArrowLeft' || event.key === 'ArrowDown'
                    ? -1
                    : 1) *
                  (event.shiftKey ? 4 : 1) *
                  (snapOptions.millimetres ||
                    snapOptions.step *
                      pitchValues[
                        event.key === 'ArrowLeft' || event.key === 'ArrowRight'
                          ? 'u'
                          : 'v'
                      ]);
                setCamera({ ...liveBox.current });
                setDrag({
                  selection,
                  start: [0, 0, 0],
                  screen: [0, 0],
                  delta,
                  source,
                  phase: 'released',
                });
              }}
            >
              {item.cell && (
                <desc id={`studio-${item.id}-cell`}>
                  Column {item.cell[0]}, row {item.cell[1]}
                </desc>
              )}
              <polygon
                points={layoutPolygon(item, side)}
                fill={
                  active ? theme.studio.selection.fill : theme.colors.background
                }
                fillOpacity={active ? 0.15 : 0.65}
                stroke={
                  active
                    ? theme.studio.selection.stroke
                    : item.kind === 'key'
                      ? theme.studio.key
                      : theme.studio.component
                }
                strokeWidth={active ? 0.45 : 0.22}
              />
              {active && (
                <path
                  d={`M${item.position[0] - 0.8} ${-item.position[axis]}h1.6m-0.8 -0.8v1.6`}
                  stroke={theme.studio.selection.cross}
                  strokeWidth=".18"
                  fill="none"
                />
              )}
            </g>
          );
        })}
        {outline && outlineBox && (
          <g
            pointerEvents="none"
            role="img"
            aria-label="Selected area"
            transform={`translate(${outlineDelta[0]},${-outlineDelta[axis]})`}
          >
            <rect
              x={outlineBox.x}
              y={outlineBox.y}
              width={outlineBox.w}
              height={outlineBox.h}
              rx={BOUNDARY_RADIUS}
              fill="none"
              stroke={theme.studio.selection.guide}
              strokeWidth="0.22"
              strokeDasharray="1.1 0.8"
            />
            {[
              [outlineBox.x, outlineBox.y],
              [outlineBox.x + outlineBox.w, outlineBox.y],
              [outlineBox.x + outlineBox.w, outlineBox.y + outlineBox.h],
              [outlineBox.x, outlineBox.y + outlineBox.h],
            ].map(([cx, cy], index) => (
              <rect
                key={`handle-${index}`}
                x={cx - HANDLE / 2}
                y={cy - HANDLE / 2}
                width={HANDLE}
                height={HANDLE}
                fill={theme.colors.background}
                stroke={theme.studio.selection.handle}
                strokeWidth="0.16"
              />
            ))}
            {side === 'top' && outline.annotation && (
              <text
                x={outline.center.x}
                y={outlineBox.y - 1.6}
                fontSize="2.2"
                fill={theme.studio.selection.text}
                textAnchor="middle"
              >
                {outline.annotation}
              </text>
            )}
            {side === 'top' && outline.axis && (
              <line
                x1={outline.center.x}
                y1={outlineBox.y + outlineBox.h}
                x2={outline.center.x}
                y2={outlineBox.y + outlineBox.h + GUIDE_LENGTH}
                stroke={theme.studio.selection.guide}
                strokeWidth="0.12"
                strokeDasharray="0.6 0.6"
              />
            )}
          </g>
        )}
        {drag?.snap &&
          drag.snap.guides.map((guide, index) => (
            <line
              key={`snap-${index}`}
              x1={guide.a[0]}
              y1={-guide.a[1]}
              x2={guide.b[0]}
              y2={-guide.b[1]}
              stroke={theme.colors.accent}
              strokeWidth=".4"
              strokeDasharray="1 1"
              pointerEvents="none"
            />
          ))}
        {side === 'top' &&
          Object.values(visible?.guides || {})
            .filter((guide) => guide.id.endsWith('.center'))
            .map((guide) => (
              <path
                key={`center-${guide.id}`}
                d={`M${guide.position[0] - 0.8} ${-guide.position[1]}h1.6m-0.8 -0.8v1.6`}
                stroke={theme.studio.key}
                strokeWidth=".12"
                fill="none"
                opacity=".6"
                pointerEvents="none"
              />
            ))}
        {onPickTarget &&
          Object.values(visible?.guides || {}).map((guide) => (
            <g
              key={`pick-${guide.id}`}
              role="button"
              tabIndex={0}
              aria-label={`Align to ${guide.label}`}
              onClick={(event) => {
                event.stopPropagation();
                onPickTarget(guide.id);
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onPickTarget(guide.id);
                }
              }}
            >
              <circle
                cx={guide.position[0]}
                cy={-guide.position[1]}
                r="1.4"
                stroke={theme.colors.accent}
                fill={theme.colors.background}
              />
              {!guide.id.endsWith('.center') && (
                <>
                  <rect
                    x={guide.position[0] + 1}
                    y={-guide.position[1] - 6}
                    width={guide.label.split(' · ')[0].length * 1.5 + 3}
                    height="5"
                    rx=".5"
                    fill={theme.colors.backgroundLight}
                  />
                  <text
                    x={guide.position[0] + 2}
                    y={-guide.position[1] - 2.5}
                    fontSize="2.5"
                    fill={theme.colors.text}
                  >
                    {guide.label.split(' · ')[0]}
                  </text>
                </>
              )}
              <title>{guide.label}</title>
            </g>
          ))}
        {side === 'top' &&
          Object.entries(rules)
            .filter(([id, rule]) =>
              selection.section === 'constraints'
                ? selection.id === id
                : rule.refs.some(
                    (ref) =>
                      ref === selection.id ||
                      ref === `${selection.section}.${selection.id}` ||
                      ref === `${selection.id}.center`
                  )
            )
            .map(([id, rule]) => {
              const refs = rule.refs.map(
                (ref) =>
                  visible?.guides?.[ref] ||
                  (ref.startsWith('clusters.')
                    ? visible?.clusters[ref.slice(9)]
                    : visible?.objects[
                        ref.replace(/^objects\./, '').replace(/\.origin$/, '')
                      ])
              );
              if (!refs[0] || !refs[1]) {
                return null;
              }
              const [a, b] = refs as NonNullable<(typeof refs)[number]>[];
              return (
                <g
                  key={id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Edit relationship ${rule.label || id}`}
                  onClick={() => onSelect({ section: 'constraints', id })}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      onSelect({ section: 'constraints', id });
                    }
                  }}
                >
                  <line
                    x1={a.position[0]}
                    y1={-a.position[1]}
                    x2={b.position[0]}
                    y2={-b.position[1]}
                    stroke={theme.colors.accent}
                    strokeWidth=".3"
                    strokeDasharray="1 1"
                  />
                  <text
                    x={(a.position[0] + b.position[0]) / 2}
                    y={-(a.position[1] + b.position[1]) / 2 - 2}
                    fill={theme.colors.accent}
                    fontSize="2.5"
                    textAnchor="middle"
                  >
                    {rule.label || id}
                    {rule.value !== undefined ? ` = ${rule.value}` : ''}
                  </text>
                </g>
              );
            })}
      </svg>
    </StudioViewport>
  );
}
