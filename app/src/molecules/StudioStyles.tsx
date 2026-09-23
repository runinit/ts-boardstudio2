import styled, { keyframes } from 'styled-components';
import { theme } from '../theme/theme';

const paneEntry = keyframes`
  from { transform: translateX(8px); }
  to { transform: translateX(0); }
`;

export const StudioShell = styled.section`
  flex: 1;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: ${theme.colors.text};
  background: ${theme.colors.background};
  font-family: ${theme.fonts.body};
  font-size: ${theme.workbench.textSize};
  line-height: 1.45;
  overflow: hidden;
  color-scheme: dark;
  scrollbar-color: ${theme.colors.border} ${theme.colors.background};
  scrollbar-width: thin;
  ::selection {
    background: ${theme.studio.selected};
    color: ${theme.colors.text};
  }
  input,
  textarea {
    caret-color: ${theme.colors.accent};
  }
  input[type='number'] {
    font-variant-numeric: tabular-nums;
  }
  a {
    text-underline-offset: 3px;
  }
  button,
  input,
  select,
  textarea {
    font: inherit;
    color: inherit;
    background: ${theme.colors.backgroundLight};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.cad.fieldRadius};
    box-sizing: border-box;
  }
  button {
    min-height: ${theme.workbench.controlHeight};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
    cursor: pointer;
    transition:
      background-color ${theme.workbench.stateMotion},
      border-color ${theme.workbench.stateMotion};
  }
  button:hover:not(:disabled) {
    background: ${theme.colors.buttonHover};
    border-color: ${theme.workbench.borderHover};
  }
  button:disabled {
    opacity: 0.45;
    cursor: default;
  }
  button[aria-pressed='true'],
  button[aria-selected='true'] {
    color: ${theme.colors.text};
    border-color: ${theme.colors.accent};
    background: ${theme.studio.selected};
  }
  button[data-primary='true'] {
    background: ${theme.workbench.primary};
    border-color: ${theme.workbench.primary};
    color: ${theme.workbench.onPrimary};
  }
  button[data-primary='true']:hover:not(:disabled) {
    background: ${theme.workbench.primaryHover};
  }
  button:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 2px solid ${theme.colors.accent};
    outline-offset: 2px;
  }
  [data-object]:focus {
    outline: none;
  }
  [data-object]:focus-visible polygon {
    stroke: ${theme.colors.accent};
    stroke-width: 2px;
    stroke-dasharray: 4px 2px;
    vector-effect: non-scaling-stroke;
  }
  input,
  select,
  textarea {
    min-width: 0;
    max-width: 100%;
    padding: ${theme.spacing.sm};
    min-height: ${theme.workbench.controlHeight};
  }
  input[type='checkbox'] {
    min-height: auto;
    width: 18px;
    height: 18px;
  }
  summary {
    cursor: pointer;
    padding: ${theme.spacing.sm} 0;
    font-weight: 500;
  }
  @media (min-width: ${theme.studio.breakpoint}) {
    .studio-mobile-tools,
    .mobile-only {
      display: none;
    }
  }
  @media (max-width: ${theme.studio.breakpoint}) {
    button,
    input,
    select {
      min-height: ${theme.studio.touchSize};
    }
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
    }
  }
  .studio-code {
    flex: 1;
    min-height: 0;
    height: 100%;
  }
  h2 {
    font-size: ${theme.workbench.titleSize};
    margin: 0 0 ${theme.spacing.md};
  }
  h3 {
    font-size: ${theme.fontSizes.base};
    margin: ${theme.spacing.lg} 0 ${theme.spacing.md};
  }
  p {
    line-height: 1.45;
    color: ${theme.colors.textDark};
  }
  small {
    color: ${theme.colors.textDarker};
    line-height: 1.4;
  }
`;
export const StudioBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
  flex-shrink: 0;
  h1 {
    font-size: ${theme.workbench.titleSize};
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .grow {
    flex: 1;
  }
  @media (max-width: ${theme.studio.breakpoint}) {
    padding: ${theme.spacing.sm};
    .desktop {
      display: none;
    }
  }
`;
export const StageNav = styled.nav`
  display: flex;
  flex-shrink: 0;
  overflow-x: auto;
  align-self: stretch;
  button {
    border: 0;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    background: transparent;
    padding: ${theme.spacing.sm} ${theme.spacing.compact};
    white-space: nowrap;
  }
  .workspace-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    button {
      border-radius: ${theme.cad.fieldRadius};
      padding: ${theme.spacing.sm};
    }
  }
  button[aria-current='step'] {
    border-bottom-color: ${theme.colors.accent};
    color: ${theme.colors.accent};
  }
  @media (max-width: ${theme.studio.breakpoint}) {
    flex-wrap: wrap;
    .workspace-actions {
      width: 100%;
      border-top: 1px solid ${theme.colors.border};
      justify-content: flex-end;
      flex-wrap: wrap;
      button {
        flex-direction: row;
        flex: initial;
        font-size: ${theme.fontSizes.bodySmall};
      }
    }
    button {
      flex: 1;
      flex-direction: column;
      font-size: ${theme.fontSizes.sm};
      padding: ${theme.spacing.sm};
      gap: ${theme.spacing.xs};
    }
  }
  @media (max-width: ${theme.workbench.phoneBreakpoint}) {
    > button {
      flex-direction: row;
    }
    > button > svg {
      display: none;
    }
  }
`;
export const StudioHeader = styled(StudioBar)`
  min-height: ${theme.studio.headerHeight};
  padding-block: ${theme.spacing.xs};
  box-sizing: border-box;
  background: ${theme.colors.backgroundLight};
  h1 {
    flex: 0 1 auto;
    min-width: 0;
    max-width: ${theme.studio.projectWidth};
    font-size: ${theme.workbench.textSize};
    font-weight: ${theme.fontWeights.semiBold};
  }
  > nav {
    margin-right: auto;
  }
  > small {
    white-space: nowrap;
    font-size: ${theme.studio.metadataSize};
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${theme.colors.accent};
    }
  }
  .history-actions {
    display: flex;
    gap: 0;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.cad.fieldRadius};
    button {
      border: 0;
      background: transparent;
    }
  }
  button {
    padding: ${theme.spacing.sm};
  }
  .generate-label {
    display: inline;
    white-space: nowrap;
  }
  @media (max-width: ${theme.studio.breakpoint}) {
    flex-wrap: wrap;
    gap: ${theme.spacing.xs};
    h1 {
      flex: 1;
      font-size: ${theme.workbench.textSize};
    }
    > nav {
      order: 1;
      width: 100%;
      border-top: 1px solid ${theme.colors.border};
      margin-top: ${theme.spacing.xs};
    }
    .history-actions {
      display: none;
    }
    > button {
      padding: ${theme.spacing.sm};
    }
    .generate-label {
      display: none;
    }
  }
  @media (max-height: ${theme.studio.shortViewportHeight}) {
    > nav button {
      flex-direction: row;
    }
  }
`;
export const StudioContextBar = styled(StudioBar)`
  min-height: ${theme.studio.contextHeight};
  box-sizing: border-box;
  padding-block: ${theme.spacing.xs};
  background: ${theme.colors.ribbonSurface};
  font-size: ${theme.studio.metadataSize};
  .outline-controls,
  .outline-controls label {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    flex-wrap: wrap;
  }
  .outline-controls label {
    white-space: nowrap;
  }
  .selection-context {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${theme.colors.textDark};
  }
  button {
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
  }
  @media (max-width: ${theme.studio.breakpoint}) {
    flex-wrap: wrap;
    .outline-controls {
      order: 1;
      width: 100%;
      border-top: 1px solid ${theme.colors.border};
      padding-top: ${theme.spacing.xs};
    }
  }
  @media (max-height: ${theme.studio
      .shortViewportHeight}) and (min-width: ${theme.workbench
      .phoneBreakpoint}) {
    .outline-controls {
      order: 0;
      width: auto;
      border-top: 0;
      padding-top: 0;
    }
  }
`;
export const StudioBody = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  position: relative;
  overflow: hidden;
  &[data-sheet='inspector'] {
    grid-template-columns: ${theme.studio.treeWidth} minmax(0, 1fr) ${theme
        .studio.inspectorWidth};
    > main {
      grid-column: 2;
    }
  }
  @media (max-width: ${theme.studio.breakpoint}) {
    &[data-sheet='inspector'] {
      grid-template-columns: minmax(0, 1fr);
      > main {
        grid-column: 1;
      }
    }
  }
`;
export const StudioPane = styled.aside<{ $open: boolean; $preview?: boolean }>`
  display: ${(p) => (p.$open ? 'contents' : 'none')};
  .pane-header {
    display: none;
  }
  @media (max-width: ${theme.studio.breakpoint}) {
    display: ${(p) => (p.$open ? 'grid' : 'none')};
    grid-template-rows: auto minmax(0, 1fr);
    /* Keep the drawer laid out while peeking so drafts and scroll survive. */
    visibility: ${(p) => (p.$preview ? 'hidden' : 'visible')};
    position: absolute;
    inset: 0 0 0 auto;
    width: min(90%, ${theme.studio.inspectorWidth});
    overflow: hidden;
    background: ${theme.colors.backgroundLight};
    border-left: 1px solid ${theme.colors.border};
    z-index: ${theme.studio.popoverLayer};
    animation: ${paneEntry} ${theme.workbench.paneMotion};
    .pane-header {
      display: block;
      grid-row: 1;
      background: ${theme.colors.backgroundLight};
    }
    .studio-browser,
    .studio-properties {
      grid-column: 1;
      grid-row: 2;
    }
    .pane-top {
      display: flex;
      align-items: center;
      gap: ${theme.spacing.sm};
      padding: ${theme.spacing.xs} ${theme.spacing.sm};
    }
    .selection-summary {
      flex: 1;
      margin: 0;
      color: ${theme.colors.textDarker};
      overflow-wrap: anywhere;
      font-size: ${theme.fontSizes.bodySmall};
    }
    &[data-setup] .pane-tabs {
      display: none;
    }
    .preview-pane {
      flex-shrink: 0;
      padding: ${theme.spacing.sm};
      font-size: ${theme.fontSizes.bodySmall};
    }
    .pane-tabs {
      display: flex;
      gap: ${theme.spacing.xs};
      padding: ${theme.spacing.sm};
      border-bottom: 1px solid ${theme.colors.border};
    }
    .pane-tabs button {
      flex: 1;
      font-size: ${theme.fontSizes.bodySmall};
      padding: ${theme.spacing.sm};
    }
    &[data-pane='properties'] .studio-browser,
    &[data-pane='objects'] .studio-properties {
      display: none;
    }
    .close-pane {
      display: flex;
      flex-shrink: 0;
      width: ${theme.studio.touchSize};
      padding: ${theme.spacing.sm};
    }
  }
  @media (max-width: ${theme.workbench.phoneBreakpoint}) {
    width: 100%;
    border-left: 0;
  }
`;
export const StudioBrowser = styled.div`
  grid-column: 1;
  grid-row: 1;
  min-height: 0;
  overflow: auto;
  padding: ${theme.spacing.md};
  background: ${theme.colors.backgroundLight};
  border-right: 1px solid ${theme.colors.border};
  > details + details {
    margin-top: ${theme.spacing.md};
    border-top: 1px solid ${theme.colors.border};
  }
  @media (max-width: ${theme.studio.breakpoint}) {
    border-right: 0;
  }
`;
export const StudioProperties = styled.div`
  grid-column: 3;
  grid-row: 1;
  min-height: 0;
  overflow: auto;
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border-left: 1px solid ${theme.colors.border};
  h2 {
    overflow-wrap: anywhere;
    font-size: ${theme.studio.sectionSize};
  }
  > details,
  > details > summary {
    border-bottom: 1px solid ${theme.colors.border};
    margin-bottom: ${theme.spacing.md};
  }
  summary {
    color: ${theme.colors.textDark};
    font-size: ${theme.studio.metadataSize};
    font-weight: ${theme.fontWeights.semiBold};
  }
  input:not([type='checkbox']) {
    font-family: ${theme.fonts.code};
    font-variant-numeric: tabular-nums;
  }
  fieldset {
    min-width: 0;
  }
  legend {
    padding: 0;
    font-weight: ${theme.fontWeights.semiBold};
  }
  p,
  small {
    overflow-wrap: anywhere;
  }
  input,
  select,
  textarea {
    background: ${theme.workbench.fieldSurface};
  }
  @media (max-width: ${theme.studio.breakpoint}) {
    border-left: 0;
    border-top: 1px solid ${theme.colors.border};
  }
`;
export const StudioMain = styled.main`
  grid-column: 1;
  grid-row: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: auto;
  @media (max-width: ${theme.studio.breakpoint}) {
    grid-column: 1;
  }
`;

// Keep editor drafts mounted while another project view is active.
export const StudioLibrary = styled.div<{ $active: boolean }>`
  display: ${({ $active }) => ($active ? 'contents' : 'none')};
`;
export const StudioField = styled.label`
  display: grid;
  grid-template-columns: minmax(70px, 0.85fr) minmax(0, 1fr);
  align-items: center;
  gap: ${theme.spacing.sm};
  margin: ${theme.spacing.sm} 0;
  small {
    grid-column: 2;
  }
`;
export const StudioActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  margin: ${theme.spacing.sm} 0;
`;
export const TreeButton = styled.button`
  width: 100%;
  border-color: transparent !important;
  background: transparent !important;
  &[aria-pressed='true'],
  &[aria-selected='true'] {
    background: ${theme.studio.selected} !important;
    color: ${theme.colors.accent};
  }
  justify-content: flex-start !important;
  text-align: left;
  margin-bottom: ${theme.spacing.xs};
  span {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow-wrap: anywhere;
  }
`;
export const StudioStatus = styled.div`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  flex-shrink: 0;
  font-size: ${theme.studio.metadataSize};
  button {
    margin-left: auto;
  }
`;

// Keep membership rows aligned even with long, user-authored key names.
export const MatrixKeys = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    border-bottom: 1px solid ${theme.colors.border};
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.xs} 0;
  }
  button {
    border-color: transparent;
    background: transparent;
    padding: ${theme.spacing.sm};
  }
  .key-select {
    min-width: 0;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: ${theme.spacing.sm};
    text-align: left;
    overflow-wrap: anywhere;
  }
  .key-select span {
    white-space: nowrap;
  }
  .key-select small {
    font-size: ${theme.fontSizes.bodySmall};
  }
  .key-remove {
    width: ${theme.workbench.controlHeight};
    color: ${theme.colors.textDarker};
  }
  .key-remove:hover:not(:disabled) {
    color: ${theme.colors.error};
  }
  .key-add {
    grid-column: 1 / -1;
    justify-content: flex-start;
    color: ${theme.colors.accent};
  }
  @media (max-width: ${theme.studio.breakpoint}) {
    .key-remove {
      width: ${theme.studio.touchSize};
    }
  }
`;

// Matrix growth, navigation, and deletion have distinct positions and emphasis.
export const MatrixActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
  button {
    padding-inline: ${theme.spacing.sm};
  }
  .matrix-settings,
  .matrix-delete {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
  .matrix-settings {
    color: ${theme.colors.accent};
  }
  .matrix-delete {
    border-color: transparent;
    color: ${theme.colors.error};
    background: transparent;
  }
`;

// Anchor floating tools to the drawing, below normal-flow outline and status bars.
export const StudioViewport = styled.div`
  background: ${theme.studio.canvas};
  container: canvas / size;
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  isolation: isolate;
`;
