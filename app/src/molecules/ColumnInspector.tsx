import { Trash2 } from 'lucide-react';
import { useSnapOptions } from '../hooks/useSnapOptions';
import { StudioActions, MatrixKeys, MatrixActions } from './StudioStyles';
import {
  addCell,
  matrixNames,
  getValue,
  removeObject,
  resizeCluster,
  StudioDoc,
} from '../utils/studioSource';
import { setLayout } from '../utils/layoutSource';
import DimensionField from './DimensionField';
import {
  ensurePitchUnits,
  pitchUnits,
  type Dimension,
} from '../utils/designUnits';
import type { StudioSelection } from './StudioCanvas';
import InspectorSection from './InspectorSection';

export default function ColumnInspector({
  source,
  data,
  selection,
  edit,
  select,
}: {
  source: string;
  data: StudioDoc;
  selection: StudioSelection;
  edit: (change: (source: string) => string) => void;
  select: (value: StudioSelection) => void;
}) {
  const [snap] = useSnapOptions();
  const cluster = selection.cluster || '',
    column = selection.id;
  const spec = data.layout.clusters?.[cluster],
    arrangement = spec?.arrangement;
  if (!spec || !arrangement?.columns?.includes(column)) {
    return <p>Select a matrix column.</p>;
  }
  const patch = (path: (string | number)[], value: unknown) =>
    edit((before) =>
      setLayout(
        ensurePitchUnits(before),
        'clusters',
        cluster,
        ['arrangement', ...path],
        value
      )
    );
  const units = pitchUnits(source);
  const dimension = (
    label: string,
    path: (string | number)[],
    fallback: number
  ) => {
    const value =
      getValue(source, [
        'layout',
        'clusters',
        cluster,
        'arrangement',
        ...path,
      ]) ?? fallback;
    return (
      <DimensionField
        key={`${cluster}-${column}-${label}`}
        label={label}
        value={value as Dimension}
        units={units}
        disabled={spec.locked}
        suffix={path[0] === 'splay' ? '°' : 'mm'}
        step={
          path[0] === 'stagger'
            ? snap.millimetres || `${snap.step}v`
            : undefined
        }
        onCommit={(next) => {
          if (path[0] === 'offsets') {
            const offsets = (getValue(source, [
              'layout',
              'clusters',
              cluster,
              'arrangement',
              'offsets',
              column,
            ]) || [0, 0, 0]) as (number | string)[];
            patch(
              ['offsets', column],
              offsets.map((v, i) => (i === path[2] ? next : v))
            );
          } else {
            patch(path, next);
          }
        }}
      />
    );
  };
  return (
    <>
      <h2>Column {arrangement.columns.indexOf(column) + 1}</h2>
      <p>
        {cluster} · {column}. Changes affect every key in this column.
      </p>
      {dimension('Column stagger', ['stagger', column], 0)}
      <StudioActions aria-label="Stagger presets">
        {['0', '0.25v', '0.5v', 'v'].map((value) => (
          <button
            key={value}
            disabled={spec.locked}
            onClick={() => patch(['stagger', column], value)}
          >
            {value === 'v' ? '1' : value.replace('v', '')}{' '}
            {units.u === units.v ? 'u' : 'v'}
          </button>
        ))}
      </StudioActions>
      {dimension('Column splay', ['splay', column], 0)}
      <InspectorSection name="Additional offsets">
        {['X', 'Y', 'Z'].map((label, index) =>
          dimension(`Column offset ${label}`, ['offsets', column, index], 0)
        )}
      </InspectorSection>
      <p>
        Splay rotates the column about its first row. Individual key edits stay
        relative to the column.
      </p>
      <InspectorSection name="Column keys">
        <MatrixKeys aria-label="Column keys">
          {arrangement.rows?.map((row, index) => {
            const key = Object.entries(data.layout.objects || {}).find(
              ([, item]) =>
                item.cluster === cluster &&
                item.cell?.[0] === column &&
                item.cell?.[1] === row
            );
            return (
              <li key={row}>
                {key ? (
                  <>
                    <button
                      className="key-select"
                      onClick={() => select({ section: 'objects', id: key[0] })}
                    >
                      <span>Row {index + 1}</span>
                      <small>{key[1].label || key[0]}</small>
                    </button>
                    <button
                      className="key-remove"
                      title={`Remove ${key[0]}`}
                      aria-label={`Remove ${key[0]}`}
                      disabled={spec.locked}
                      onClick={() =>
                        edit((before) =>
                          removeObject(before, 'objects', key[0])
                        )
                      }
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <button
                    className="key-add"
                    disabled={spec.locked}
                    onClick={() =>
                      edit((before) => addCell(before, cluster, column, row))
                    }
                  >
                    Add key in row {index + 1}
                  </button>
                )}
              </li>
            );
          })}
        </MatrixKeys>
      </InspectorSection>
      <InspectorSection name="Matrix actions">
        <MatrixActions>
          <button
            disabled={spec.locked}
            onClick={() =>
              edit((before) =>
                resizeCluster(before, cluster, {
                  columns: matrixNames(
                    arrangement.columns!,
                    arrangement.columns!.length + 1,
                    'c'
                  ),
                })
              )
            }
          >
            Add column
          </button>
          <button
            disabled={spec.locked}
            onClick={() =>
              edit((before) =>
                resizeCluster(before, cluster, {
                  rows: matrixNames(
                    arrangement.rows || [],
                    (arrangement.rows?.length || 0) + 1,
                    'r'
                  ),
                })
              )
            }
          >
            Add row
          </button>
          <button
            className="matrix-settings"
            onClick={() => select({ section: 'clusters', id: cluster })}
          >
            Matrix size and pitch
          </button>
          <button
            className="matrix-delete"
            disabled={spec.locked || arrangement.columns.length === 1}
            onClick={() =>
              edit((before) =>
                resizeCluster(before, cluster, {
                  columns: arrangement.columns!.filter((id) => id !== column),
                })
              )
            }
          >
            Delete column
          </button>
        </MatrixActions>
      </InspectorSection>
    </>
  );
}
