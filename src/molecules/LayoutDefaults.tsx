import { StudioField } from './StudioStyles';
import { KEY_SIZES } from '../utils/keySizes';
import { keyOptions, setKeyOptions, KeyOptions } from '../utils/keyOptions';
import { sizeSelection } from '../utils/studioSelection';
import type { LayoutReport } from 'ergogen/src/native';
import { readStudio } from '../utils/studioSource';

export default function LayoutDefaults({
  source,
  cluster = '',
  report,
  edit,
}: {
  source: string;
  cluster?: string;
  report?: LayoutReport;
  edit: (change: (source: string) => string) => void;
}) {
  const options = keyOptions(source, cluster);
  const matrix =
    !cluster ||
    readStudio(source).layout.clusters?.[cluster]?.arrangement?.type ===
      'columns';
  const patch = (values: Partial<KeyOptions>) =>
    edit((before) => setKeyOptions(before, values, cluster));
  return (
    <details>
      <summary>
        {cluster
          ? matrix
            ? 'Matrix defaults'
            : 'Cluster defaults'
          : 'Layout defaults'}
      </summary>
      <small>
        {cluster
          ? 'Used by new keys in this cluster.'
          : 'Used by new matrices and loose keys.'}
      </small>
      <StudioField>
        <span>Default key size</span>
        <select
          aria-label="Default key size"
          value={
            KEY_SIZES.find((p) => p.size.every((v, i) => v === options.size[i]))
              ?.id || ''
          }
          onChange={(event) => {
            const preset = KEY_SIZES.find((p) => p.id === event.target.value);
            if (preset) {
              patch({ size: preset.size });
            }
          }}
        >
          <option value="">Custom</option>
          {KEY_SIZES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </StudioField>
      {cluster && (
        <button
          onClick={() =>
            edit((before) => {
              const options = keyOptions(before, cluster),
                selection = { section: 'clusters' as const, id: cluster };
              return sizeSelection(
                before,
                selection,
                options.size,
                undefined,
                report
              );
            })
          }
        >
          Apply key size to {matrix ? 'matrix' : 'cluster'}
        </button>
      )}
    </details>
  );
}
