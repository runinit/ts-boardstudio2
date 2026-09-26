import { useEffect, useRef, type ReactNode } from 'react';

/** Initial async results may open a section until the user chooses its state. */
export function InspectorSection({ title, detail, defaultOpen = false, children, className }: {
  title: string; detail?: string; defaultOpen?: boolean; children: ReactNode; className?: string;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  const initialOpen = useRef(defaultOpen);
  const chosen = useRef(false);
  useEffect(() => {
    if (!chosen.current && details.current) details.current.open = defaultOpen;
  }, [defaultOpen]);
  return <details ref={details} className={`wb-inspector-section${className ? ` ${className}` : ''}`} open={initialOpen.current}>
    <summary onClick={() => { chosen.current = true; }}><span>{title}</span>{detail && <small>{detail}</small>}</summary>
    <div className="wb-inspector-section-body">{children}</div>
  </details>;
}
