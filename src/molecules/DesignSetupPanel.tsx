import { mergeSetupDraft } from '../utils/setupDraft';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '../theme/theme';
import { applyBoardDefaults, setupFromSource } from '../utils/boardDefaults';
import { compileSetup } from '../utils/designSetup';
import {
  pitchUnits,
  dimension,
  ensurePitchUnits,
  type Dimension,
} from '../utils/designUnits';
import { getValue, readStudio, setValue } from '../utils/studioSource';
import { loadComponentModel, setupModels } from '../utils/componentModels';
import { useCasePreview } from '../hooks/useCasePreview';
import { createZip } from '../utils/zip';
import { StudioActions, StudioField } from './StudioStyles';
import DimensionField from './DimensionField';
import NewDesignWorkspace from './NewDesignWorkspace';
import StackupPanel from './StackupPanel';

const Tabs = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
  padding: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.md};
  background: ${theme.colors.background};
  border-radius: ${theme.studio.toolRadius};
  button {
    padding: ${theme.spacing.sm};
    border-radius: ${theme.studio.pillRadius};
    flex: 1 1 auto;
    font-size: ${theme.fontSizes.bodySmall};
    white-space: nowrap;
  }
`;
const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  background: ${theme.colors.backgroundLight};
  padding-bottom: ${theme.spacing.sm};
  h2 {
    margin-top: 0;
  }
`;
export default function DesignSetupPanel({
  source,
  currentSource,
  injections,
  onApply,
  onClose,
}: {
  source: string;
  currentSource: () => string;
  injections?: string[][];
  onApply: (source: string, assets: Record<string, string>) => void;
  onClose: () => void;
}) {
  const base = useRef(source);
  const [sampleRequest, setSampleRequest] = useState(false);
  const [draft, setDraft] = useState(() => setupFromSource(source));
  const updateAssembly = useCallback(
    (value: ReturnType<typeof setupFromSource>) =>
      setDraft((current) => ({
        ...current,
        family: value.family,
        mounting: value.mounting,
        diode: value.diode,
        led: value.led,
        template: value.template,
      })),
    []
  );
  const [draftSource, setDraftSource] = useState(source);
  const [tab, setTab] = useState('Basics');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sampleAssets, setSampleAssets] = useState<Record<string, string>>({});
  const units = {
    ...pitchUnits(draftSource),
    u: draft.pitch,
    v: draft.pitchY ?? draft.pitch,
  };
  const sampleSource = useMemo(() => {
    try {
      return compileSetup(
        {
          ...draft,
          columns: 2,
          rows: 1,
          thumbs: 0,
          controller: '',
          encoder: false,
          reset: false,
          connection: 'wired',
        },
        pitchUnits(draftSource)
      );
    } catch {
      return '';
    }
  }, [draft, draftSource]);
  const sample = useCasePreview(sampleSource, injections, sampleAssets);
  const generateSample = sample.generate;
  useEffect(() => {
    if (sampleRequest) {
      generateSample();
      setSampleRequest(false);
    }
  }, [sampleRequest, generateSample]);
  const loadAssets = async () => {
    const entries = await Promise.all(
      setupModels(draft).map(loadComponentModel)
    );
    return Object.assign({}, ...entries.map((entry) => entry.assets)) as Record<
      string,
      string
    >;
  };
  const apply = async () => {
    setBusy(true);
    setError('');
    try {
      const assets = await loadAssets();
      onApply(
        mergeSetupDraft(
          base.current,
          applyBoardDefaults(draftSource, draft),
          currentSource()
        ),
        assets
      );
    } catch (reason) {
      setError(String(reason));
    } finally {
      setBusy(false);
    }
  };
  const pitch = (axis: 'pitch' | 'pitchY', value: Dimension) => {
    const expressions = [
      ...(draft.pitchExpressions || [draft.pitch, draft.pitchY ?? 'u']),
    ] as [Dimension, Dimension];
    expressions[axis === 'pitch' ? 0 : 1] = value;
    let candidate = ensurePitchUnits(draftSource);
    candidate = setValue(candidate, ['units', 'u'], expressions[0]);
    candidate = setValue(candidate, ['units', 'v'], expressions[1]);
    const resolved = pitchUnits(candidate);
    if (resolved.u <= 0 || resolved.v <= 0) {
      throw new Error('Spacing must be positive.');
    }
    setDraft({
      ...draft,
      pitch: resolved.u,
      pitchY: resolved.v,
      pitchExpressions: expressions,
    });
    setError('');
  };
  const cap = draft.keycap || (draft.family === 'mx' ? [18, 18] : [17.5, 16.5]);
  const [width, height] = cap.map((value) => dimension(value, units));
  const occupied =
    Object.keys(readStudio(source).layout.objects || {}).length > 0;
  return (
    <section aria-label="Design setup panel">
      <Header>
        <h2>Design setup</h2>
        <StudioActions>
          <button
            data-primary="true"
            disabled={busy}
            aria-busy={busy}
            onClick={() => void apply()}
          >
            Apply setup
          </button>
          <button disabled={busy} onClick={onClose}>
            Cancel
          </button>
        </StudioActions>
      </Header>
      <Tabs role="tablist" aria-label="Setup sections">
        {['Basics', 'Key assembly', 'Stackup'].map((name) => (
          <button
            role="tab"
            key={name}
            aria-selected={tab === name}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </Tabs>
      {error && <p role="alert">{error}</p>}
      {tab === 'Basics' && (
        <>
          <StudioField>
            <span>Name</span>
            <input
              aria-label="Design name"
              value={draft.name}
              onChange={(event) =>
                setDraft({ ...draft, name: event.target.value })
              }
            />
          </StudioField>
          <h3>Key spacing</h3>
          <svg
            viewBox={`-12 -14 ${draft.pitch + 24} ${Math.max(height + 15, 34)}`}
            role="img"
            aria-label="Key spacing preview"
            style={{ width: '100%', height: theme.studio.setupPreviewHeight }}
          >
            {[0, draft.pitch].map((x) => (
              <g key={x}>
                <rect
                  x={x - width / 2}
                  y={-height / 2}
                  width={width}
                  height={height}
                  fill={theme.studio.selected}
                  stroke={theme.studio.key}
                  strokeWidth=".2"
                />
                <circle cx={x} cy="0" r=".5" fill={theme.colors.accent} />
              </g>
            ))}
            <path
              d={`M0 11v4m0 -2h${draft.pitch}m0 -2v4`}
              stroke={theme.colors.accent}
              strokeWidth=".25"
              fill="none"
            />
            <text
              x={draft.pitch / 2}
              y="18"
              fontSize="2.5"
              textAnchor="middle"
              fill={theme.colors.text}
            >
              Pitch = {draft.pitch} mm
            </text>
          </svg>
          <small>Center-to-center spacing. Keycap size is separate.</small>
          <StudioActions>
            {[19.05, 19, 18].map((value) => (
              <button
                key={value}
                aria-pressed={draft.pitch === value && draft.pitchY === value}
                onClick={() =>
                  setDraft({
                    ...draft,
                    pitch: value,
                    pitchY: value,
                    pitchExpressions: [value, 'u'],
                  })
                }
              >
                {value} mm
              </button>
            ))}
            <button
              onClick={() =>
                setDraft({
                  ...draft,
                  pitch: 18,
                  pitchY: 17,
                  pitchExpressions: [18, 17],
                })
              }
            >
              18 × 17 mm
            </button>
          </StudioActions>
          <DimensionField
            label="Horizontal pitch"
            value={draft.pitchExpressions?.[0] ?? draft.pitch}
            units={units}
            onCommit={(value) => pitch('pitch', value)}
          />
          <DimensionField
            label="Vertical pitch"
            value={draft.pitchExpressions?.[1] ?? draft.pitchY ?? draft.pitch}
            units={units}
            onCommit={(value) => pitch('pitchY', value)}
          />
          <h3>Keycap dimensions</h3>
          {['Width', 'Height'].map((label, index) => (
            <DimensionField
              key={label}
              label={`Keycap ${label.toLowerCase()}`}
              value={cap[index]}
              units={units}
              onCommit={(value) => {
                if (dimension(value, units) <= 0) {
                  throw new Error('Keycap dimensions must be positive.');
                }
                setDraft({
                  ...draft,
                  keycap: cap.map((before, axis) =>
                    axis === index ? value : before
                  ) as [Dimension, Dimension],
                });
              }}
            />
          ))}
          <small>
            New keys use these dimensions. Edit existing key sizes in Layout.
          </small>
          <h3>Board topology</h3>
          <Tabs role="group" aria-label="Board topology">
            {(['single', 'mirrored', 'reversible'] as const).map((value) => (
              <button
                key={value}
                aria-pressed={draft.topology === value}
                onClick={() => setDraft({ ...draft, topology: value })}
              >
                {value === 'single'
                  ? 'Single'
                  : value === 'mirrored'
                    ? 'Mirrored pair'
                    : 'Reversible'}
              </button>
            ))}
          </Tabs>
          <p>
            {draft.topology === 'single'
              ? 'One board contains the layout.'
              : draft.topology === 'mirrored'
                ? 'A left board and a reflected right board share the key layout.'
                : 'One PCB supports alternate front/back population.'}
          </p>
          {occupied &&
            draft.topology !==
              getValue(source, ['meta', 'studio', 'setup', 'topology']) && (
              <p>
                A mirrored pair links the source clusters to a second PCB.
                Existing objects keep their identities.
              </p>
            )}
          <p>Add matrices, columns, keys, and hardware directly in Layout.</p>
        </>
      )}
      <div hidden={tab !== 'Key assembly'}>
        <NewDesignWorkspace
          embedded
          mode="assembly"
          initial={draft}
          scopeControls={
            <p>
              Board assembly defaults · inherited by matrices, columns and keys
              unless overridden.
            </p>
          }
          onDraft={updateAssembly}
          onCreate={() => {}}
          onCancel={() => {}}
        />
        <h3>Two-key PCB sample</h3>
        <small>
          Uses these footprints and nets. Sample keys are separate from your
          layout.
        </small>
        <StudioActions>
          <button
            disabled={sample.pending || !sampleSource}
            onClick={() => {
              void loadAssets()
                .then((assets) => {
                  setSampleAssets(assets);
                  setSampleRequest(true);
                })
                .catch((reason) => setError(String(reason)));
            }}
          >
            Generate sample
          </button>
          <button
            disabled={
              sample.stale ||
              sample.pending ||
              !sample.result?.pcbs ||
              !!sample.error
            }
            onClick={() => {
              if (sample.result) {
                void createZip(
                  sample.result,
                  sampleSource,
                  injections,
                  false,
                  false,
                  sampleAssets
                ).catch((reason) => setError(String(reason)));
              }
            }}
          >
            Download KiCad sample
          </button>
        </StudioActions>
        {sample.pending && <p role="status">Generating PCB sample…</p>}
        {!sample.stale && sample.result?.outlines && (
          <div aria-label="Generated PCB sample">
            {Object.entries(sample.result.outlines)
              .filter(([name, files]) => !name.startsWith('_') && files.svg)
              .slice(0, 1)
              .map(([name, files]) => (
                <img
                  key={name}
                  alt="Generated two-key PCB outline"
                  src={`data:image/svg+xml,${encodeURIComponent(files.svg!)}`}
                  style={{ width: '100%' }}
                />
              ))}
          </div>
        )}
        {sample.error && <p role="alert">{sample.error}</p>}
      </div>
      {tab === 'Stackup' && (
        <StackupPanel source={draftSource} onChange={setDraftSource} />
      )}
    </section>
  );
}
