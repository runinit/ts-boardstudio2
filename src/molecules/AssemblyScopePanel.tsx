import { useState } from 'react';
import { type StudioSelection } from '../utils/studioTargets';
import { getValue, readStudio } from '../utils/studioSource';
import { type DesignSetup } from '../utils/designSetup';
import {
  applyScopeAssembly,
  hasAssemblyOverride,
  resetScopeAssembly,
  scopeAssembly,
  type AssemblyScope,
} from '../utils/assemblyScope';
import NewDesignWorkspace from './NewDesignWorkspace';
import { StudioField } from './StudioStyles';

export default function AssemblyScopePanel({
  source,
  ids,
  selection,
  onApply,
  onClose,
}: {
  source: string;
  ids: string[];
  selection: StudioSelection;
  onApply: (
    change: (source: string) => string,
    assets: Record<string, string>,
    injections?: string[][]
  ) => void;
  onClose: () => void;
}) {
  const [choices] = useState(() => {
    const data = readStudio(source),
      first =
        data.layout.objects?.[ids[0]] ||
        (selection.section === 'clusters' || selection.section === 'columns'
          ? {
              cluster: selection.cluster || selection.id,
              cell:
                selection.section === 'columns' ? [selection.id] : undefined,
            }
          : undefined);
    const result: { label: string; scope: AssemblyScope }[] = [
      { label: 'Board defaults', scope: { kind: 'board' } },
    ];
    if (
      first?.cluster &&
      ids.every((id) => data.layout.objects?.[id]?.cluster === first.cluster)
    ) {
      result.push({
        label: `Matrix · ${first.cluster}`,
        scope: { kind: 'matrix', cluster: first.cluster },
      });
      if (
        first.cell?.[0] &&
        ids.every(
          (id) => data.layout.objects?.[id]?.cell?.[0] === first.cell?.[0]
        )
      ) {
        result.push({
          label: `Column · ${first.cell[0]}`,
          scope: {
            kind: 'column',
            cluster: first.cluster,
            column: first.cell[0],
          },
        });
      }
    }
    if (ids.length) {
      result.push({
        label:
          ids.length === 1 ? `Key · ${ids[0]}` : `${ids.length} selected keys`,
        scope: { kind: 'keys', ids },
      });
    }
    return result;
  });
  const [index, setIndex] = useState(() => {
    const kind =
      selection.section === 'columns'
        ? 'column'
        : selection.section === 'clusters'
          ? 'matrix'
          : 'keys';
    return Math.max(
      0,
      choices.findIndex((choice) => choice.scope.kind === kind)
    );
  });
  const [error, setError] = useState('');
  const { scope } = choices[index];
  const initial = scopeAssembly(source, scope);
  const overridden = hasAssemblyOverride(source, scope);
  const controls = (
    <>
      <StudioField>
        <span>Assembly scope</span>
        <select
          aria-label="Assembly scope"
          value={index}
          onChange={(event) => {
            setIndex(Number(event.target.value));
            setError('');
          }}
        >
          {choices.map((choice, index) => (
            <option value={index} key={choice.label}>
              {choice.label}
            </option>
          ))}
        </select>
      </StudioField>
      <p>
        Board → matrix → column → key.{' '}
        {scope.kind === 'board'
          ? 'Changes update inherited keys and future keys.'
          : overridden
            ? 'This scope overrides its parent. More specific overrides are preserved.'
            : 'Inherited from its parent. Applying creates an override here.'}
      </p>
      {scope.kind !== 'board' && (
        <button
          disabled={!overridden}
          onClick={() => {
            try {
              onApply((before) => resetScopeAssembly(before, scope), {});
            } catch (reason) {
              setError(String(reason));
            }
          }}
        >
          Reset to inherited
        </button>
      )}
      {error && <p role="alert">{error}</p>}
    </>
  );
  return (
    <NewDesignWorkspace
      key={`${index}:${JSON.stringify(initial)}`}
      embedded
      mode="assembly"
      initial={initial}
      scopeControls={controls}
      applyLabel="Apply assembly"
      onCancel={onClose}
      onCreate={(sample, assets, injections) => {
        const setup = getValue(sample, [
          'meta',
          'studio',
          'setup',
        ]) as DesignSetup;
        onApply(
          (before) => applyScopeAssembly(before, scope, setup),
          assets,
          injections
        );
      }}
    />
  );
}
