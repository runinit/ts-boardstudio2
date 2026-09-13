import { StudioActions } from './StudioStyles';
import {
  addCell,
  matrixNames,
  removeObject,
  resizeCluster,
  StudioDoc,
} from '../utils/studioSource';
import type { StudioSelection } from './StudioCanvas';

export default function RowInspector({
  data,
  selection,
  edit,
  select,
}: {
  data: StudioDoc;
  selection: StudioSelection;
  edit: (change: (source: string) => string) => void;
  select: (value: StudioSelection) => void;
}) {
  const cluster = selection.cluster || '',
    row = selection.id;
  const spec = data.layout.clusters?.[cluster],
    arrangement = spec?.arrangement;
  if (!spec || !arrangement?.rows?.includes(row)) {
    return <p>Select a matrix row.</p>;
  }
  const keys = Object.entries(data.layout.objects || {});
  return (
    <>
      <h2>Row {arrangement.rows.indexOf(row) + 1}</h2>
      <p>
        {cluster} · {row}. Changes affect every key in this row.
      </p>
      <h3>Keys</h3>
      {arrangement.columns?.map((column, index) => {
        const key = keys.find(
          ([, item]) =>
            item.cluster === cluster &&
            item.cell?.[0] === column &&
            item.cell?.[1] === row
        );
        return (
          <StudioActions key={column}>
            {key ? (
              <>
                <button
                  onClick={() => select({ section: 'objects', id: key[0] })}
                >
                  Column {index + 1} · {key[1].label || key[0]}
                </button>
                <button
                  aria-label={`Remove ${key[0]}`}
                  disabled={spec.locked || key[1].locked}
                  onClick={() =>
                    edit((before) => removeObject(before, 'objects', key[0]))
                  }
                >
                  Remove
                </button>
              </>
            ) : (
              <button
                disabled={spec.locked}
                onClick={() =>
                  edit((before) => addCell(before, cluster, column, row))
                }
              >
                Add key in column {index + 1}
              </button>
            )}
          </StudioActions>
        );
      })}
      <StudioActions>
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
          disabled={
            spec.locked ||
            arrangement.rows.length === 1 ||
            keys.some(
              ([, item]) =>
                item.cluster === cluster &&
                item.cell?.[1] === row &&
                item.locked
            )
          }
          onClick={() =>
            edit((before) =>
              resizeCluster(before, cluster, {
                rows: arrangement.rows!.filter((id) => id !== row),
              })
            )
          }
        >
          Delete row
        </button>
        <button onClick={() => select({ section: 'clusters', id: cluster })}>
          Matrix size and pitch
        </button>
      </StudioActions>
    </>
  );
}
