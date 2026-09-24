import { useState, type ReactNode } from 'react';

/** Native disclosure keeps optional controls keyboard-accessible without extra panel state. */
export function InspectorSection({ title, detail, defaultOpen = false, children }: {
  title: string; detail?: string; defaultOpen?: boolean; children: ReactNode;
}) {
  const [initialOpen] = useState(defaultOpen);
  return <details className="wb-inspector-section" open={initialOpen}>
    <summary><span>{title}</span>{detail && <small>{detail}</small>}</summary>
    <div className="wb-inspector-section-body">{children}</div>
  </details>;
}
