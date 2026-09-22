import { useState, type ReactNode } from 'react';

const openState = new Map<string, boolean>();

export default function InspectorSection({
  name,
  children,
  defaultOpen = false,
}: {
  name: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(() => openState.get(name) ?? defaultOpen);
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
