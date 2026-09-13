import { Magnet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '../theme/theme';
import { UNIT_STEPS } from '../utils/designUnits';
import type { SnapOptions } from '../utils/layoutSnapping';

const Bar = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  left: calc(${theme.studio.touchSize} + ${theme.spacing.lg});
  right: ${theme.spacing.md};
  width: fit-content;
  max-width: calc(
    100% - ${theme.studio.touchSize} - ${theme.spacing.lg} - ${theme.spacing.md}
  );
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs};
  border-radius: ${theme.studio.toolRadius};
  background: ${theme.colors.backgroundLight};
  box-shadow: ${theme.studio.toolShadow};
  button {
    padding: ${theme.spacing.sm};
    border-radius: ${theme.studio.pillRadius};
  }
  details {
    position: static;
  }
  details > div {
    position: absolute;
    right: 0;
    top: 100%;
    width: ${theme.studio.toolOptionsWidth};
    max-width: 100%;
    overflow-y: auto;
    box-sizing: border-box;
    padding: ${theme.spacing.md};
    background: ${theme.colors.backgroundLight};
    box-shadow: ${theme.studio.toolShadow};
    border-radius: ${theme.studio.toolRadius};
  }
  input {
    width: 100%;
  }
  input[type='checkbox'] {
    width: auto;
    margin-right: ${theme.spacing.sm};
  }
  label {
    display: block;
    margin-bottom: ${theme.spacing.sm};
  }
`;
export default function SnapControls({
  options,
  onChange,
  enabled,
  onEnabled,
  units,
}: {
  options: SnapOptions;
  onChange: (value: SnapOptions) => void;
  enabled: boolean;
  onEnabled: (value: boolean) => void;
  units: Record<string, number>;
}) {
  const bar = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [menuHeight, setMenuHeight] = useState<number>();
  useEffect(() => {
    const element = bar.current;
    const container = element?.offsetParent;
    if (!element || !container) {
      return;
    }
    // Reserve the camera controls when the toolbar wraps on narrow canvases.
    const measure = () => {
      if (!menu.current || !element.querySelector('details')?.open) {
        return;
      }
      const inset = Number.parseFloat(getComputedStyle(element).top);
      const reserved = Number.parseFloat(theme.studio.touchSize) + 2 * inset;
      setMenuHeight(
        Math.max(
          0,
          container.getBoundingClientRect().bottom -
            menu.current.getBoundingClientRect().top -
            reserved
        )
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(container);
    element.addEventListener('toggle', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      element.removeEventListener('toggle', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, []);
  return (
    <Bar ref={bar} role="toolbar" aria-label="Snapping">
      <button
        aria-label="Snapping"
        aria-pressed={enabled}
        onClick={() => onEnabled(!enabled)}
        title="Toggle snapping · Alt temporarily bypasses"
      >
        <Magnet size={16} />
        Snapping
      </button>
      {UNIT_STEPS.map((step, index) => (
        <button
          key={step}
          aria-label={`Snap increment ${step}u`}
          aria-pressed={!options.millimetres && options.step === step}
          disabled={!enabled}
          onClick={() => onChange({ ...options, step, millimetres: 0 })}
        >
          {['1', '½', '¼', '⅛'][index]}
          {units.u === units.v ? 'u' : 'u/v'}
        </button>
      ))}
      <details>
        <summary>Options</summary>
        <div ref={menu} style={{ maxHeight: menuHeight }}>
          {(['grid', 'centers', 'origins', 'edges'] as const).map((kind) => (
            <label key={kind}>
              <input
                type="checkbox"
                checked={!!options[kind]}
                onChange={(event) =>
                  onChange({ ...options, [kind]: event.target.checked })
                }
              />
              {kind === 'centers'
                ? 'Center guides'
                : kind === 'origins'
                  ? 'Footprint origins'
                  : kind === 'grid'
                    ? 'Increment grid'
                    : 'Edge guides'}
            </label>
          ))}
          <label>
            Custom increment · mm
            <input
              aria-label="Custom snap increment"
              type="number"
              min="0"
              step="0.1"
              value={options.millimetres || ''}
              placeholder="Use unit increment"
              onChange={(event) => {
                const value = Number(event.target.value);
                if (Number.isFinite(value) && value >= 0) {
                  onChange({ ...options, millimetres: value });
                }
              }}
            />
          </label>
          <label>
            Component edge gap · mm
            <input
              aria-label="Snap edge gap"
              type="number"
              min="0"
              step="0.5"
              value={options.gap}
              onChange={(event) => {
                const gap = Number(event.target.value);
                if (Number.isFinite(gap) && gap >= 0) {
                  onChange({ ...options, gap });
                }
              }}
            />
          </label>
          <small>
            Drop first, then choose Keep relationship to retain a center
            alignment or edge offset.{' '}
          </small>
          <small>
            1u = {units.u} mm · 1v = {units.v} mm. Alt bypasses snapping.
          </small>
        </div>
      </details>
    </Bar>
  );
}
