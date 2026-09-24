import React, { useEffect, useRef, useState } from 'react';

type PanelMode = 'pinned' | 'autohide' | 'collapsed';
type PanelSide = 'left' | 'right';
type PanelSettings = { mode: PanelMode; width: number | null };
const limits = { left: { min: 200, max: 420 }, right: { min: 280, max: 480 } };

export function usePanelSettings(side: PanelSide) {
  const key = `boardstudio:v2:panel:${side}`;
  const [settings, setSettings] = useState<PanelSettings>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? 'null');
      return {
        mode: ['pinned', 'autohide', 'collapsed'].includes(saved?.mode) ? saved.mode : 'pinned',
        width: Number.isFinite(saved?.width) ? Math.max(limits[side].min, Math.min(limits[side].max, saved.width)) : null,
      };
    } catch { return { mode: 'pinned', width: null }; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(settings)); } catch { /* Preferences are optional offline storage. */ } }, [key, settings]);
  return { ...settings,
    setMode: (mode: PanelMode) => setSettings((current) => ({ ...current, mode })),
    setWidth: (width: number) => setSettings((current) => ({ ...current, width: Math.max(limits[side].min, Math.min(limits[side].max, width)) })),
  };
}

export function useCompactPanel(side: PanelSide) {
  const query = `(max-width: ${side === 'left' ? 980 : 820}px)`;
  const [compact, setCompact] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const media = matchMedia(query);
    const update = () => setCompact(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return compact;
}

type Props = {
  side: PanelSide;
  label: string;
  settings: ReturnType<typeof usePanelSettings>;
  compact: boolean;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function WorkspacePanel({ side, label, settings, compact, open, onClose, children }: Props) {
  const name = side === 'left' ? 'objects' : 'inspector';
  const id = side === 'left' ? 'wb-inventory' : 'wb-inspector';
  const panel = useRef<HTMLElement>(null);
  const rail = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const hovered = useRef(false);
  const resizing = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [measuredWidth, setMeasuredWidth] = useState<number>();
  const visible = compact ? open : settings.mode === 'pinned' || settings.mode === 'autohide' && revealed;
  const clearHide = () => { clearTimeout(timer.current); };
  const hideWhenIdle = () => {
    clearHide();
    timer.current = setTimeout(() => {
      if (!hovered.current && !resizing.current && !panel.current?.contains(document.activeElement) && document.activeElement !== rail.current) setRevealed(false);
    }, 280);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { if (panel.current) panel.current.inert = !visible; }, [visible]);
  useEffect(() => {
    if (!panel.current) return;
    // Reading bounds during render forces layout on every canvas preview.
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.borderBoxSize[0]?.inlineSize ?? entry.contentRect.width;
      if (width > 0) setMeasuredWidth(Math.round(width));
    });
    observer.observe(panel.current);
    return () => observer.disconnect();
  }, []);
  const collapse = () => {
    if (compact) onClose();
    else settings.setMode('collapsed');
    setRevealed(false);
    document.getElementById(`wb-${name}-toggle`)?.focus();
  };
  const resize = (width: number) => {
    const other = document.getElementById(side === 'left' ? 'wb-inspector' : 'wb-inventory');
    const otherWidth = other?.dataset.panelMode === 'pinned' && !other.inert ? other.getBoundingClientRect().width : 0;
    settings.setWidth(Math.min(width, innerWidth - otherWidth - 280));
  };
  return <>
    {!compact && settings.mode === 'autohide' && <button ref={rail} className={`wb-panel-rail is-${side}`} aria-label={`Show ${name}`} aria-expanded={revealed} aria-controls={id} title={`Show ${name}`}
      onPointerEnter={(event) => { if (event.pointerType !== 'touch') { clearHide(); setRevealed(true); } }}
      onPointerLeave={hideWhenIdle} onFocus={() => { clearHide(); setRevealed(true); }} onBlur={hideWhenIdle}
      onClick={() => setRevealed(true)}><PanelIcon side={side} /></button>}
    <aside ref={panel} id={id} className={`${side === 'left' ? 'wb-inventory' : 'wb-inspector'} wb-dock is-${side} ${visible ? 'is-open' : 'is-hidden'} ${compact ? 'is-compact' : ''}`} data-panel-mode={settings.mode} aria-label={label} aria-hidden={!visible}
      onPointerEnter={() => { hovered.current = true; clearHide(); }} onPointerLeave={() => { hovered.current = false; hideWhenIdle(); }}
      onFocusCapture={clearHide} onBlurCapture={hideWhenIdle}
      onKeyDown={(event) => { if (event.key === 'Escape' && (compact || settings.mode === 'autohide')) { event.stopPropagation(); if (compact) onClose(); setRevealed(false); document.getElementById(`wb-${name}-toggle`)?.focus(); } }}>
      <div className="wb-panel-actions">
        {!compact && <button aria-label={`Auto-hide ${name}`} aria-pressed={settings.mode === 'autohide'} title={settings.mode === 'autohide' ? `Pin ${name}` : `Auto-hide ${name}`} onClick={() => { setRevealed(true); settings.setMode(settings.mode === 'autohide' ? 'pinned' : 'autohide'); }}><PinIcon /></button>}
        <button aria-label={`Collapse ${name}`} title={`Collapse ${name}`} onClick={collapse}><PanelIcon side={side} collapse /></button>
      </div>
      {!compact && <div className={`wb-panel-resize is-${side}`} role="separator" aria-label={`Resize ${name}`} aria-orientation="vertical" tabIndex={0} aria-valuenow={measuredWidth ?? settings.width ?? (side === 'left' ? 260 : 360)} aria-valuemin={limits[side].min} aria-valuemax={limits[side].max}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
          event.preventDefault();
          const direction = (event.key === 'ArrowRight' ? 1 : -1) * (side === 'left' ? 1 : -1);
          resize((panel.current?.getBoundingClientRect().width ?? 300) + direction * 20);
        }}
        onPointerDown={(event) => { resizing.current = true; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) resize(side === 'left' ? event.clientX : innerWidth - event.clientX); }}
        onPointerUp={(event) => { resizing.current = false; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); hideWhenIdle(); }}
        onPointerCancel={() => { resizing.current = false; hideWhenIdle(); }} />}
      {children}
    </aside>
  </>;
}

export function PanelIcon({ side, collapse = false }: { side: PanelSide; collapse?: boolean }) {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 3h14v14H3Z" /><path d={side === 'left' ? 'M7 3v14' : 'M13 3v14'} />{collapse && <path d={side === 'left' ? 'm13 7-3 3 3 3' : 'm7 7 3 3-3 3'} />}</svg>;
}
const PinIcon = () => <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 3 6 0-1 5 3 3H5l3-3ZM10 11v7" /></svg>;
