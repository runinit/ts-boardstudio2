import { useState } from 'react';
import DimensionField from './DimensionField';
import {
  dimension,
  dimensionValue,
  pitchUnits,
  ensurePitchUnits,
} from '../utils/designUnits';
import { targets } from '../utils/studioTargets';
import type { LayoutReport } from 'ergogen/src/native';
import styled from 'styled-components';
import { theme } from '../theme/theme';
import { StudioField } from './StudioStyles';
import type { StudioSelection } from './StudioCanvas';
import { KEY_SIZES } from '../utils/keySizes';
import {
  selectedKeys,
  sizeSelection,
  adjustSelection,
} from '../utils/studioSelection';
import { readStudio } from '../utils/studioSource';
import type { KeyAlignment } from '../utils/keyResize';
import InspectorSection from './InspectorSection';

const RelativeFields = styled.div<{ $compact?: boolean }>`
  display: grid;
  grid-template-columns: repeat(
    ${({ $compact }) => ($compact ? 3 : 2)},
    minmax(0, 1fr)
  );
  gap: ${theme.spacing.sm};
  margin: ${theme.spacing.sm} 0;
  label {
    grid-template-columns: minmax(0, 1fr);
    margin: 0;
  }
  input {
    width: 100%;
    font-family: ${theme.fonts.code};
    font-variant-numeric: tabular-nums;
  }
`;
const AdjustmentGroup = styled.fieldset<{ $compact?: boolean }>`
  border: 0;
  border-top: ${({ $compact }) =>
    $compact ? '0' : `1px solid ${theme.colors.border}`};
  padding: ${({ $compact }) => ($compact ? 0 : theme.spacing.md)} 0 0;
  margin: ${({ $compact }) => ($compact ? 0 : theme.spacing.lg)} 0 0;
  legend {
    padding-right: ${theme.spacing.sm};
    ${({ $compact }) =>
      $compact ? `font-size: ${theme.studio.metadataSize};` : ''}
  }
  ${({ $compact }) =>
    $compact &&
    `
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: ${theme.spacing.sm};
      min-width: 0;
      > label {
        grid-template-columns: minmax(0, 1fr);
        align-content: start;
        font-size: ${theme.studio.metadataSize};
      }
      > label select {
        width: 100%;
      }
      > details {
        grid-column: 1 / -1;
        border-top: 1px solid ${theme.colors.border};
      }
      input, select {
        background: ${theme.workbench.fieldSurface};
      }
      label, small {
        font-size: ${theme.studio.metadataSize};
      }
    `}
`;
type Props = {
  source: string;
  selection: StudioSelection;
  report?: LayoutReport;
  edit: (change: (source: string) => string) => void;
  compact?: boolean;
};
export default function SelectionControls({
  source,
  selection,
  report,
  edit,
  compact = false,
}: Props) {
  const [adjustment, setAdjustment] = useState(0);
  const [adjustError, setAdjustError] = useState('');
  const units = pitchUnits(source);
  const keys = selectedKeys(source, selection),
    data = readStudio(source);
  const item = data.layout.objects?.[keys[0]];
  const cluster =
    selection.section === 'clusters'
      ? selection.id
      : selection.cluster || item?.cluster;
  const locked =
    targets(selection).some((target) =>
      target.section === 'objects'
        ? report?.objects[target.id]?.locked ||
          data.layout.objects?.[target.id]?.locked
        : data.layout.clusters?.[target.cluster || target.id]?.locked
    ) ||
    !!data.layout.clusters?.[cluster || '']?.locked ||
    keys.some((id) => data.layout.objects?.[id]?.locked);
  const size = item?.envelopes?.keycap?.size ||
    data.parts?.[item?.part || '']?.envelopes?.keycap?.size || [18, 18];
  const alignment = (item?.properties?.key_alignment as KeyAlignment) || {
    x: 'auto',
    y: 'top',
  };
  const mixedSize = keys.some((id) => {
    const key = data.layout.objects![id];
    const other = key.envelopes?.keycap?.size ||
      data.parts?.[key.part || '']?.envelopes?.keycap?.size || [18, 18];
    return other.some((value, index) => value !== size[index]);
  });
  return (
    <AdjustmentGroup $compact={compact} disabled={locked}>
      <legend>Selection adjustments</legend>
      {!!keys.length && (
        <>
          <StudioField>
            <span>Key size</span>
            <select
              aria-label="Selection key size"
              value={
                (!mixedSize &&
                  KEY_SIZES.find((p) => p.size.every((v, i) => v === size[i]))
                    ?.id) ||
                ''
              }
              onChange={(event) => {
                const preset = KEY_SIZES.find(
                  (p) => p.id === event.target.value
                );
                if (preset) {
                  edit((before) =>
                    sizeSelection(
                      before,
                      selection,
                      preset.size,
                      undefined,
                      report
                    )
                  );
                }
              }}
            >
              <option value="">Custom / mixed</option>
              {KEY_SIZES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </StudioField>
          <StudioField>
            <span>Align X</span>
            <select
              aria-label="Horizontal alignment"
              value={alignment.x}
              onChange={(event) =>
                edit((before) =>
                  sizeSelection(
                    before,
                    selection,
                    undefined,
                    { x: event.target.value as KeyAlignment['x'] },
                    report
                  )
                )
              }
            >
              <option value="auto">Auto (make room)</option>
              <option value="left">Left</option>
              <option value="center">Centre</option>
              <option value="right">Right</option>
            </select>
          </StudioField>
          <StudioField>
            <span>Align Y</span>
            <select
              aria-label="Vertical alignment"
              value={alignment.y}
              onChange={(event) =>
                edit((before) =>
                  sizeSelection(
                    before,
                    selection,
                    undefined,
                    { y: event.target.value as KeyAlignment['y'] },
                    report
                  )
                )
              }
            >
              <option value="top">Top</option>
              <option value="center">Centre</option>
              <option value="bottom">Bottom</option>
            </select>
          </StudioField>
        </>
      )}
      <InspectorSection name="Relative adjustments" defaultOpen>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget,
              values = new FormData(form);
            try {
              const value = (name: string) =>
                dimension(
                  dimensionValue(String(values.get(name) || '0')),
                  units
                );
              edit((before) =>
                adjustSelection(
                  ensurePitchUnits(before),
                  selection,
                  [value('x'), value('y'), 0],
                  value('rotation'),
                  value('stagger')
                )
              );
              setAdjustment((count) => count + 1);
              setAdjustError('');
            } catch (reason) {
              setAdjustError(String(reason));
            }
          }}
        >
          <small>Relative to current placement, in the parent’s axes.</small>
          <RelativeFields $compact={compact}>
            {[
              'x',
              'y',
              'rotation',
              ...(selection.section === 'columns' ? ['stagger'] : []),
            ].map((name) => (
              <DimensionField
                key={`${name}-${adjustment}`}
                name={name}
                label={`Relative ${name}`}
                value={0}
                units={units}
                suffix={name === 'rotation' ? '°' : 'mm'}
                onCommit={() => {}}
              />
            ))}
          </RelativeFields>
          <button type="submit">Apply relative adjustment</button>
          {adjustError && <p role="alert">{adjustError}</p>}
        </form>
      </InspectorSection>
    </AdjustmentGroup>
  );
}
