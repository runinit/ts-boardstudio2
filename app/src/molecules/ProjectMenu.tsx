import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Ellipsis } from 'lucide-react';
import styled from 'styled-components';
import { theme } from '../theme/theme';

const Actions = styled.div<{ $open: boolean }>`
  display: contents;
  && > button {
    display: none;
  }
  > div {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
  }
  @media (max-width: ${theme.studio.breakpoint}) {
    display: block;
    position: relative;
    && > button {
      display: inline-flex;
    }
    > div {
      display: ${({ $open }) => ($open ? 'flex' : 'none')};
      position: absolute;
      top: calc(100% + ${theme.spacing.sm});
      right: 0;
      z-index: ${theme.studio.popoverLayer + 1};
      flex-direction: column;
      align-items: stretch;
      width: min(
        ${theme.studio.toolOptionsWidth},
        calc(100vw - ${theme.spacing.lg})
      );
      max-height: calc(
        100dvh - ${theme.cad.headerHeight} - ${theme.spacing.lg}
      );
      overflow: auto;
      padding: ${theme.spacing.sm};
      background: ${theme.colors.backgroundLight};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.cad.fieldRadius};
      button {
        justify-content: flex-start;
      }
    }
  }
`;

// Keep project tools inline on desktop and reachable from one narrow-screen menu.
export default function ProjectMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) {
      return;
    }
    const dismiss = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !root.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);
  return (
    <Actions
      ref={root}
      $open={open}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !open) {
          return;
        }
        event.stopPropagation();
        setOpen(false);
        trigger.current?.focus();
      }}
    >
      <button
        ref={trigger}
        aria-label="Project actions"
        title="Project actions"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <Ellipsis size={20} />
      </button>
      <div
        id={id}
        onClickCapture={(event) => {
          // Native button clicks also cover Enter and Space activation.
          if ((event.target as Element).closest('button')) {
            setOpen(false);
            if (open) {
              trigger.current?.focus();
            }
          }
        }}
      >
        {children}
      </div>
    </Actions>
  );
}
