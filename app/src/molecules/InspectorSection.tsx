import { useState, type ReactNode } from 'react';

const openState = new Map<string, boolean>();

export default function InspectorSection({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(() => openState.get(name) ?? false);
  return (
    <details
      open={open}
      onToggle={(event) => {
        const next = event.currentTarget.open;
        openState.set(name, next);
        setOpen(next);
      }}
    >
      <summary>{name}</summary>
      {children}
    </details>
  );
}
