import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  children: React.ReactNode;
};

/** A nonmodal command panel: portaled so canvas and drawer clipping cannot hide it. */
export function CommandMenu({ id, label, icon, open, onOpenChange, triggerRef, children }: Props) {
  const ownTrigger = useRef<HTMLButtonElement>(null);
  const trigger = triggerRef ?? ownTrigger;
  const panel = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 8, top: 8 });
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const anchor = trigger.current?.getBoundingClientRect();
      const popup = panel.current?.getBoundingClientRect();
      if (!anchor || !popup) return;
      setPosition({
        left: Math.max(8, Math.min(anchor.left, window.innerWidth - popup.width - 8)),
        top: Math.max(8, Math.min(anchor.bottom + 6, window.innerHeight - popup.height - 8)),
      });
    };
    place();
    (panel.current?.querySelector<HTMLElement>('input[type=search]') ?? panel.current?.querySelector<HTMLElement>('input, button:not(:disabled), select'))?.focus();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [open, trigger]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !panel.current?.contains(event.target) && !trigger.current?.contains(event.target)) onOpenChange(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open, onOpenChange, trigger]);
  const close = () => { onOpenChange(false); trigger.current?.focus(); };
  return <>
    <button ref={trigger} className="wb-command-trigger" aria-expanded={open} aria-controls={id} onClick={() => onOpenChange(!open)}>{icon}<span>{label}</span><ToolIcon name="chevron" /></button>
    {open && createPortal(<div className="wb-command-panel" id={id} role="dialog" aria-label={label} ref={panel} style={position}
      onKeyDown={(event) => {
        if (event.key === 'Escape') { event.stopPropagation(); close(); }
      }} onClick={(event) => { if ((event.target as Element).closest('[data-close-menu]')) close(); }}>
      {children}
    </div>, document.body)}
  </>;
}

export function ToolIcon({ name }: { name: 'add' | 'select' | 'transform' | 'align' | 'snap' | 'chevron' | 'origin' | 'search' | 'warning' }) {
  const paths = {
    add: 'M10 3v14M3 10h14',
    select: 'M4 2v15l4-4 3 5 3-2-3-5 6-1Z',
    transform: 'M10 1v18M1 10h18M7 4l3-3 3 3M7 16l3 3 3-3M4 7l-3 3 3 3M16 7l3 3-3 3',
    align: 'M3 2v16M6 5h11M6 10h7M6 15h11',
    snap: 'M4 3v7a6 6 0 0 0 12 0V3h-4v7a2 2 0 0 1-4 0V3ZM4 7h4M12 7h4',
    chevron: 'm6 8 4 4 4-4',
    origin: 'M10 1v5M10 14v5M1 10h5M14 10h5M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12',
    search: 'M14 14l4 4M9 2a7 7 0 1 0 0 14A7 7 0 0 0 9 2',
    warning: 'M10 2 1 18h18ZM10 7v5M10 15v.1',
  };
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d={paths[name]} /></svg>;
}
