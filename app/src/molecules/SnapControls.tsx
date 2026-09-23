import {
  ChevronsUp,
  CircleDot,
  Crosshair,
  Grid2X2,
  Magnet,
  ScanLine,
  X,
} from 'lucide-react';
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import styled from 'styled-components';
import { theme } from '../theme/theme';
import { UNIT_STEPS } from '../utils/designUnits';
import type { SnapOptions } from '../utils/layoutSnapping';

const Tool = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex: none;
  > button {
    background: transparent;
  }
  .snap-disclosure svg {
    transition: transform ${theme.workbench.stateMotion};
  }
  .snap-disclosure[aria-expanded='true'] svg {
    transform: rotate(180deg);
  }
  @media (prefers-reduced-motion: reduce) {
    .snap-disclosure svg {
      transition: none;
    }
  }
`;
const QuickGuides = styled.div`
  display: flex;
  button {
    padding: ${theme.spacing.xs};
    border: 0;
    border-radius: ${theme.cad.fieldRadius};
    background: ${theme.colors.backgroundLight};
  }
  button[aria-pressed='true'] {
    color: ${theme.colors.accent};
    background: ${theme.studio.selected};
  }
  @container canvas (height < ${theme.studio.shortRailHeight}) {
    display: flex;
    width: auto;
  }
`;
// Always mounted so the panel keeps its measured content height when toggled; it docks above the toolbar.
const Slide = styled.div<{ $open: boolean }>`
  position: absolute;
  bottom: calc(100% + ${theme.spacing.compact});
  left: 0;
  display: grid;
  width: ${theme.studio.toolOptionsWidth};
  grid-template-rows: ${({ $open }) => ($open ? '1fr' : '0fr')};
  > div {
    min-height: 0;
    overflow: hidden;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
const Panel = styled.div`
  position: static;
  padding: ${theme.spacing.sm};
  box-sizing: border-box;
  overflow: auto;
  overscroll-behavior: contain;
  background: ${theme.colors.backgroundLight};
  border-radius: ${theme.studio.dockRadius};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.studio.toolShadow};
  color: ${theme.colors.text};

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.sm};
  }
  .snap-steps {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.xs};
    margin-bottom: ${theme.spacing.sm};
  }
  input {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }
  .snap-guides {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin-bottom: ${theme.spacing.sm};
  }
  .snap-guides label {
    display: flex;
    align-items: center;
    min-height: ${theme.workbench.controlHeight};
    margin: 0;
  }
  .snap-field {
    display: grid;
    grid-template-columns: 1fr 6em;
    gap: ${theme.spacing.sm};
    align-items: center;
  }
  && button {
    min-height: ${theme.workbench.controlHeight};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: ${theme.cad.fieldRadius};
  }
  details {
    color: ${theme.colors.textDarker};
    font-size: ${theme.fontSizes.bodySmall};
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
  viewport,
}: {
  options: SnapOptions;
  onChange: (value: SnapOptions) => void;
  enabled: boolean;
  onEnabled: (value: boolean) => void;
  units: Record<string, number>;
  viewport?: RefObject<HTMLElement>;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const slide = useRef<HTMLDivElement | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const container = viewport?.current;
    const element = slide.current;
    const content = panel.current;
    const dock = element?.parentElement;
    if (!container || !element || !content || !dock) {
      return;
    }
    // The panel opens upward from the dock and scrolls inside the viewport.
    const measure = () => {
      const bounds = container.getBoundingClientRect();
      const anchor = dock.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(content).paddingTop);
      const width = Math.max(
        0,
        Math.min(
          parseFloat(theme.studio.toolOptionsWidth),
          bounds.right - anchor.left - gap
        )
      );
      element.style.width = `${width}px`;
      content.style.maxHeight = `${Math.max(0, anchor.top - bounds.top - gap * 3)}px`;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [open, viewport]);
  const close = () => {
    setOpen(false);
    setAdvancedOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };
  return (
    <Tool
      role="toolbar"
      aria-label="Snapping"
      onKeyDown={(event) => {
        if (open && event.key === 'Escape') {
          event.stopPropagation();
          event.preventDefault();
          close();
        }
      }}
    >
      <button
        aria-label="Snapping"
        aria-pressed={enabled}
        onClick={() => onEnabled(!enabled)}
        title="Toggle snapping · Alt temporarily bypasses"
      >
        <Magnet size={18} />
      </button>
      <QuickGuides aria-label="Snap guides">
        {(
          [
            ['grid', Grid2X2, 'Increment grid'],
            ['centers', Crosshair, 'Center guides'],
            ['origins', CircleDot, 'Footprint origins'],
            ['edges', ScanLine, 'Edge guides'],
          ] as const
        ).map(([kind, Icon, label]) => (
          <button
            key={kind}
            aria-label={label}
            title={label}
            aria-pressed={!!options[kind]}
            disabled={!enabled}
            onClick={() => onChange({ ...options, [kind]: !options[kind] })}
          >
            <Icon size={16} />
          </button>
        ))}
      </QuickGuides>
      <button
        ref={trigger}
        className="snap-disclosure"
        aria-label="Snapping settings"
        title="Snapping settings"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <ChevronsUp size={16} />
      </button>
      <Slide
        $open={open}
        aria-hidden={!open}
        ref={(element) => {
          slide.current = element;
          element?.toggleAttribute('inert', !open);
        }}
      >
        <div>
          <Panel
            ref={panel}
            id={id}
            role="region"
            aria-label="Snapping settings"
          >
            <header>
              <strong>Snapping</strong>
              <button
                aria-label={
                  advancedOpen
                    ? 'Show essential snapping controls'
                    : 'More snapping settings'
                }
                onClick={() => setAdvancedOpen((value) => !value)}
              >
                {advancedOpen ? 'Quick' : 'More'}
              </button>
              <button aria-label="Close snapping settings" onClick={close}>
                <X size={16} />
              </button>
            </header>
            <div
              className="snap-steps"
              role="group"
              aria-label="Snap increments"
            >
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
            </div>
            {advancedOpen && (
              <>
                <label className="snap-field">
                  Increment · mm
                  <input
                    aria-label="Custom snap increment"
                    type="number"
                    min="0"
                    step="0.1"
                    value={options.millimetres || ''}
                    placeholder="Units"
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (Number.isFinite(value) && value >= 0) {
                        onChange({ ...options, millimetres: value });
                      }
                    }}
                  />
                </label>
                <label className="snap-field">
                  Edge gap · mm
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
                <details>
                  <summary>Alt bypasses snapping · Help</summary>
                  <small>
                    Drop first, then choose Keep relationship to retain a center
                    alignment or edge offset.{' '}
                  </small>
                  <small>
                    1u = {units.u} mm · 1v = {units.v} mm. Alt bypasses
                    snapping.
                  </small>
                </details>
              </>
            )}
          </Panel>
        </div>
      </Slide>
    </Tool>
  );
}
