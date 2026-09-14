import { Trash2 } from 'lucide-react';
import { MatrixKeys, MatrixActions } from './StudioStyles';
import {
  addCell,
  matrixNames,
  removeObject,
  resizeCluster,
  StudioDoc,
} from '../utils/studioSource';
import type { StudioSelection } from './StudioCanvas';
import InspectorSection from './InspectorSection';

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
      <InspectorSection name="Row keys">
        <MatrixKeys aria-label="Row keys">
          {arrangement.columns?.map((column, index) => {
            const key = keys.find(
              ([, item]) =>
                item.cluster === cluster &&
                item.cell?.[0] === column &&
                item.cell?.[1] === row
            );
            return (
              <li key={column}>
                {key ? (
                  <>
                    <button
                      className="key-select"
                      onClick={() => select({ section: 'objects', id: key[0] })}
                    >
                      <span>Column {index + 1}</span>
                      <small>{key[1].label || key[0]}</small>
                    </button>
                    <button
                      className="key-remove"
                      title={`Remove ${key[0]}`}
                      aria-label={`Remove ${key[0]}`}
                      disabled={spec.locked || key[1].locked}
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
                    Add key in column {index + 1}
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
        </MatrixActions>
      </InspectorSection>
    </>
  );
}
