---
name: Board Studio v2 — The Keyboard Lab
description: A compact visual workbench with neutral panels and distinct geometry colors.
colors:
  light-accent: '#0f62fe'
  light-accent-dark: '#0043ce'
  light-on-accent: '#ffffff'
  light-accent-secondary: '#673ab7'
  light-teal: '#673ab7'
  light-paper: '#f2f4f8'
  light-canvas: '#edf2f6'
  light-panel: '#ffffff'
  light-raised: '#dde1e6'
  light-surface-soft: '#edf5ff'
  light-surface-strong: '#c6c6c6'
  light-ink: '#161616'
  light-muted: '#393939'
  light-subtle: '#525252'
  light-rule: '#dde1e6'
  light-rule-strong: '#a8a8a8'
  light-selection-surface: '#d0e2ff'
  light-status-success: '#198038'
  light-status-success-surface: '#defbe6'
  light-status-warning: '#8a3800'
  light-status-warning-surface: '#fff1e8'
  light-status-error: '#a2191f'
  light-status-error-surface: '#fff1f1'
  light-grid-small: '#dce5eb'
  light-grid-large: '#bccdd9'
  light-geometry-outline: '#526b80'
  light-geometry-fill: '#c9e5df'
  light-geometry-fill-muted: '#dce8f5'
  light-geometry-key: '#396aa5'
  light-geometry-part: '#8050b5'
  light-geometry-label: '#263e54'
  light-geometry-body: '#e0eaf4'
  light-geometry-board: '#287d72'
  light-geometry-graphic: '#287d72'
  light-geometry-zone: '#d4e7e1'
  light-geometry-text: '#71429f'
  dark-accent: '#33b1ff'
  dark-accent-dark: '#78a9ff'
  dark-on-accent: '#161616'
  dark-accent-secondary: '#be95ff'
  dark-teal: '#3ddbd9'
  dark-paper: '#161616'
  dark-canvas: '#101b27'
  dark-panel: '#262626'
  dark-raised: '#393939'
  dark-surface-soft: '#262626'
  dark-surface-strong: '#525252'
  dark-ink: '#f2f4f8'
  dark-muted: '#dde1e6'
  dark-subtle: '#a8a8a8'
  dark-rule: '#393939'
  dark-rule-strong: '#525252'
  dark-selection-surface: '#393939'
  dark-status-success: '#42be65'
  dark-status-success-surface: '#042d15'
  dark-status-warning: '#ff832b'
  dark-status-warning-surface: '#3e1a00'
  dark-status-error: '#ff8389'
  dark-status-error-surface: '#491217'
  dark-grid-small: '#1a2b3b'
  dark-grid-large: '#30485d'
  dark-geometry-outline: '#829eb6'
  dark-geometry-fill: '#193f43'
  dark-geometry-fill-muted: '#263d56'
  dark-geometry-key: '#86b3e5'
  dark-geometry-part: '#be95ff'
  dark-geometry-label: '#dfebf7'
  dark-geometry-body: '#263b50'
  dark-geometry-board: '#61c9b5'
  dark-geometry-graphic: '#79cbb8'
  dark-geometry-zone: '#1b3b3b'
  dark-geometry-text: '#d0acef'
typography:
  preview-title:
    fontFamily: '''Aptos Display'', ''Segoe UI'', sans-serif'
    fontSize: 20px
    fontWeight: 600
  inspector-title:
    fontFamily: '''Aptos Display'', ''Segoe UI'', sans-serif'
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.025em
  section:
    fontFamily: '''Aptos'', ''Segoe UI'', sans-serif'
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: '''Aptos'', ''Segoe UI'', sans-serif'
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: '''tnum'' 1'
  field:
    fontFamily: '''Aptos'', ''Segoe UI'', sans-serif'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
  measurement:
    fontFamily: '''SFMono-Regular'', ''Cascadia Code'', Consolas, monospace'
    fontSize: 12px
    fontWeight: 400
  metadata:
    fontFamily: '''SFMono-Regular'', ''Cascadia Code'', Consolas, monospace'
    fontSize: 10px
    fontWeight: 400
rounded:
  field: 3px
  control: 4px
  menu: 5px
  flyout: 8px
  dock: 24px
spacing:
  compact: 4px
  inline: 8px
  field-gap: 12px
  panel-inset: 16px
  section-end: 20px
components:
  button-primary:
    backgroundColor: '{colors.light-accent}'
    textColor: '{colors.light-on-accent}'
    rounded: '{rounded.control}'
    padding: 0 13px
  button-primary-hover:
    backgroundColor: '{colors.light-accent-dark}'
    textColor: '{colors.light-on-accent}'
  button-secondary:
    backgroundColor: transparent
    textColor: '{colors.light-ink}'
    rounded: '{rounded.control}'
    padding: 0 12px
  numeric-field:
    backgroundColor: '{colors.light-panel}'
    textColor: '{colors.light-ink}'
    rounded: '{rounded.field}'
    typography: '{typography.measurement}'
  stage-navigation:
    backgroundColor: '{colors.light-panel}'
    textColor: '{colors.light-muted}'
    height: 44px
  revision-tag:
    backgroundColor: transparent
    textColor: '{colors.light-subtle}'
    rounded: '{rounded.field}'
    padding: 2px 5px
    typography: '{typography.metadata}'
  inspector-section:
    backgroundColor: '{colors.light-panel}'
    textColor: '{colors.light-ink}'
    typography: '{typography.section}'
  catalog-row-selected:
    backgroundColor: '{colors.light-selection-surface}'
    textColor: '{colors.light-ink}'
    rounded: '{rounded.field}'
    padding: 7px 8px
    typography: '{typography.field}'
  preview-switch:
    backgroundColor: '{colors.light-panel}'
    textColor: '{colors.light-ink}'
    rounded: '{rounded.control}'
    padding: 7px 10px
  scope-dock:
    backgroundColor: '{colors.light-panel}'
    textColor: '{colors.light-muted}'
    rounded: '{rounded.dock}'
    padding: 5px
  button-primary-dark:
    backgroundColor: '{colors.dark-accent}'
    textColor: '{colors.dark-on-accent}'
    rounded: '{rounded.control}'
    padding: 0 13px
  button-primary-hover-dark:
    backgroundColor: '{colors.dark-accent-dark}'
    textColor: '{colors.dark-on-accent}'
  button-secondary-dark:
    backgroundColor: transparent
    textColor: '{colors.dark-ink}'
    rounded: '{rounded.control}'
    padding: 0 12px
  numeric-field-dark:
    backgroundColor: '{colors.dark-panel}'
    textColor: '{colors.dark-ink}'
    rounded: '{rounded.field}'
    typography: '{typography.measurement}'
  stage-navigation-dark:
    backgroundColor: '{colors.dark-panel}'
    textColor: '{colors.dark-muted}'
    height: 44px
  revision-tag-dark:
    backgroundColor: transparent
    textColor: '{colors.dark-subtle}'
    rounded: '{rounded.field}'
    padding: 2px 5px
    typography: '{typography.metadata}'
  inspector-section-dark:
    backgroundColor: '{colors.dark-panel}'
    textColor: '{colors.dark-ink}'
    typography: '{typography.section}'
  catalog-row-selected-dark:
    backgroundColor: '{colors.dark-selection-surface}'
    textColor: '{colors.dark-ink}'
    rounded: '{rounded.field}'
    padding: 7px 8px
    typography: '{typography.field}'
  preview-switch-dark:
    backgroundColor: '{colors.dark-panel}'
    textColor: '{colors.dark-ink}'
    rounded: '{rounded.control}'
    padding: 7px 10px
  scope-dock-dark:
    backgroundColor: '{colors.dark-panel}'
    textColor: '{colors.dark-muted}'
    rounded: '{rounded.dock}'
    padding: 5px
---

# Design System: Board Studio v2

## Overview

**Creative North Star: "The Keyboard Lab"**

The Keyboard Lab is an instrument-like workspace for exploring and refining keyboard designs. Compact neutral panels frame a dominant drawing surface. Color identifies actions, geometry, and state; labels and measurements carry the detail.

The working character is calm, precise, and restrained: small controls, aligned values, modest corners, and short state transitions. Catalog, canvas, and inspector share one workspace, with optional properties organized into disclosures. These descriptions record the incumbent interface, rather than proposing a new visual identity.

**Key Characteristics:**

- Neutral shell with a separately colored slate canvas.
- Action blue, Board teal, Pad violet, and dashed key boundaries.
- Compact fields and rule-separated inspector disclosures.
- Fixed canvas controls and independently scrolling side panels.
- Light and dark palettes with a persisted System option.

This document captures the working tree on 2026-09-24, based on revision
`17f9380`, including the current workspace and inspector edits. The main sources
are [workspace styles](app/src/ui/workbench.css),
[inspector styles](app/src/ui/inspector.css), and
[footprint workspace styles](app/src/ui/library-workspace.css).
Earlier desktop and narrow workspace captures support the layout description;
current source supplies the updated palette. Fresh browser inspection was blocked
by the KiCad module's missing `builtinGeometry` export during concurrent work.

## Colors

Role-led names describe the implemented palette. The frontmatter records separate
`light-*` and `dark-*` values; neither theme is a global inversion. Removing the
mode prefix from a color key gives its corresponding `--wb-` CSS token suffix.
Tokens in this document record the implementation; update the document and its
sidecar together when the implementation's palette changes.

### Primary

- **Action blue:** `accent` marks primary actions, active navigation, selected
  objects, and most inspector focus rings. `on-accent` is the paired foreground.
- **Action hover:** `accent-dark` is the existing hover token. Its name is legacy:
  it becomes lighter in the dark theme.
- **Selection surface:** `selection-surface` marks selected catalog and tree rows.
  Selection also has a border, heavier outline, or active navigation rule.

### Secondary

- **Secondary violet:** `accent-secondary` supplies secondary emphasis.
- **Auxiliary action color:** the legacy `teal` token is violet in light mode and
  turquoise in dark mode. Current consumers mix focus, add actions, readiness,
  and outline completion; it is not a safe universal semantic role.

### Tertiary

- **Board teal:** `geometry-board` outlines the board, `geometry-fill` fills it,
  and `geometry-graphic` draws footprint graphics.
- **Key blue:** `geometry-key` marks key boundaries and handles.
- **Pad violet:** `geometry-part` fills pads and draws copper traces and vias.
- **Geometry support:** `geometry-outline`, `geometry-body`, `geometry-label`,
  `geometry-text`, and `geometry-zone` keep boundaries, bodies, labels, and zones
  distinct. `geometry-fill-muted` supports inactive matrix cells.
- **Status colors:** `status-success`, `status-warning`, and `status-error` have
  separate surface tokens for filled backgrounds. Geometry keepouts and cutouts
  currently reuse the error color and retain dashed boundaries.

### Neutral

- **Slate canvas:** `canvas` is the 2D drawing and footprint-preview field.
  `grid-small` and `grid-large` form its quiet measurement grid.
- **Shell surfaces:** `paper`, `panel`, and `raised` distinguish the application,
  permanent panels, and raised or hovered areas. `surface-soft` and
  `surface-strong` provide additional interaction surfaces.
- **Content and rules:** `ink`, `muted`, and `subtle` form the text hierarchy;
  `rule` and `rule-strong` separate panels and outline controls.

**The Paired Foreground Rule.** Use each filled action with its designated foreground; ordinary content colors are not interchangeable with on-accent colors.

**The Geometry Role Rule.** Keep canvas, board, key, pad, and selection roles separate from shell surfaces and status roles.

### Known implementation exceptions

These are recorded defects or limitations, not patterns to reproduce:

- The outline-completion button pairs ordinary content with the auxiliary action
  fill: calculated text contrast is 2.47:1 in light mode and 1.55:1 in dark mode.
  Primary buttons use their paired foreground and pass the checked normal and
  hover combinations.
- Several status dots use background-surface tokens as foreground marks,
  producing approximately 1.0–1.1:1 contrast against panels. Finding severity
  variants share the same dot styling and lack explicit severity labels.
- Some 3D scene, material, and lighting colors remain literal values in
  [CasePreview](app/src/ui/CasePreview.tsx), independent of the CSS palette.
  A 3D background therefore differs from the 2D slate canvas.
- The existing palette is not a blanket contrast guarantee. Inspect real
  foreground/background pairs, opacity, focus states, and selected surfaces.

## Typography

The body stack is Aptos, Segoe UI, then sans-serif; headings begin with Aptos
Display. Font availability varies by machine, so these are fallback stacks,
not bundled-font guarantees. Measurements use SFMono-Regular, Cascadia Code,
Consolas, then monospace. Tabular numerals are enabled on the workbench root.

- Preview titles use the largest recurring heading (20px, weight 600).
- Inspector titles are compact (17px, weight 600, 1.3 line height).
- Body and disclosure headings share a base size (13px); weight separates them.
- Inspector labels and field content generally use 12px. Numeric field values
  use the mono stack and keep the unit at the trailing edge.
- Metadata commonly uses 10–11px. Older chrome includes 8–9px labels, especially
  at narrow widths; this is an observed density limitation, not a new minimum.

**The Measurement Rule.** Use the mono stack for coordinates, units, revisions, and code; use the body stack for instructions and field labels.

## Layout

The application owns the viewport height (100dvh). The header, stage strip,
workspace toolbar, and footer frame independently scrolling catalog and inspector
panels. The center expands to absorb available width.

| Width | Implemented arrangement |
| --- | --- |
| Above 1100px | 240px catalog, flexible center, 320px inspector |
| 1051–1100px | 250px catalog, flexible center, 294px inspector |
| 821–1050px | 220px catalog, flexible center, 260px inspector |
| 820px and below | Full-width workspace with catalog and inspector drawers |

The desktop project header is 58px and the stage strip is 44px. At 560px and
below they become 52px and 42px; stage icons stack above labels. The canvas
toolbar can wrap below 1160px. Drawers are capped at 310px or 88vw, with a scrim;
canvas controls hide while a drawer occupies their space.

Recurring spacing uses compact 4px gaps, 8px inline separation, 12px field gaps,
16px inspector insets, and 20px section endings. These are extracted repeated
values rather than an enforced global spacing scale. Inspectors use 18px side
insets at 700px and below. Footprint workspace padding changes from 35px 38px
27px to 24px 18px 20px at that breakpoint.

**The Stationary Controls Rule.** Scope and snap controls remain anchored to the workspace while world geometry pans and zooms.

## Elevation & Depth

Persistent panels are flat and separated by fine rules and surface tone. Menus,
component flyouts, and mobile drawers use offset shadows to establish their
position above the workspace. Floating canvas hints and 3D controls have smaller
shadows. The existing save/live status halo is a legacy exception, not the
structural shadow vocabulary.

- Project menu: `0 8px 24px rgb(0 0 0 / 20%)`.
- Component flyout: `0 8px 24px rgb(0 0 0 / 24%)`.
- Mobile drawer: `0 14px 30px rgb(0 0 0 / 18%)`.
- Canvas hint: `0 4px 14px #24373312`.

**The Structural Shadow Rule.** Use tonal surfaces and fine rules for persistent panels; reserve offset shadows for transient overlays and floating controls.

## Shapes

Fields and rows have slight rounding (3px); action buttons use 4px. Menus use
5px and the component flyout uses 8px. Persistent workspace panels remain
rectangular. Canvas scope and snap docks are the deliberate rounded exception
(24px), with circular scope buttons (34px square).

Thin rules organize the dense controls. Selection makes the relevant boundary
stronger rather than changing the object's silhouette. Inline SVG icons use
consistent outline strokes; geometry uses actual editable and compiled shapes.

## Components

### Actions

Primary actions use Action blue with the paired foreground, 4px corners,
13px horizontal padding, and a 34px minimum height. The Parts placement action
fills the inspector width and has a 38px minimum height. Hover updates fill and
border over 160ms. Secondary actions are outlined, transparent, and more compact
(33px minimum height, 12px horizontal padding).

Keyboard focus is generally a 2px ring with 2px offset. The global ring uses the
legacy auxiliary token, while inspector controls use Action blue. Disabled
buttons are dimmed, commonly to 0.42 opacity; specific controls vary.

### Fields

Fields combine a label, editable value, and adjacent unit. Numeric fields use a
3px outline and 34px inspector minimum height. Ordinary name fields are 32px;
generator text fields use 7px 8px padding. Focus changes the field border and/or
adds a visible ring. Error text remains beside the operation that produced it.

### Stage navigation and preview switching

Stage tabs combine outline icons and labels. Active tabs use a 2px action-colored
bottom rule, stronger text, and weight 700. The Parts preview uses two small
outlined buttons with pressed state, switching between 2D footprint and 3D model.

### Catalog rows and metadata tags

Catalog rows use compact full-width buttons with 34px minimum height, 7px 8px
padding, and a name plus muted detail. Selection combines a tinted surface and
Action blue border. Revision tags are small outlined mono labels (10px) with
2px 5px padding; they are metadata rather than action chips.

### Inspector disclosures

The inspector starts with the selected object, description, and primary edit or
action. Optional groups use native disclosures with a drawn chevron, a quiet top
rule, and an optional trailing detail. Summary rows have a 46px minimum height
(48px at narrow widths); open content uses 12px gaps and 20px bottom padding.

**The Disclosure Rule.** Separate inspector sections with quiet rules and reveal optional settings in place, preserving the selected object as the editing context.

### Drawing and footprint workspace

Board outlines and component boundaries remain separate from the slate field.
Pads are filled violet; drill holes expose the canvas. Keycap and courtyard
boundaries remain dashed. Footprint labels and the dimension footer identify
what is shown. Missing or failed model previews use explicit text and a retry
or import action instead of a perpetual loading state.

### Motion and browser surfaces

Matrix hover changes fill and stroke over 120ms; primary actions transition over
160ms; mobile drawers move over 200ms with ease-out. Reduced-motion preference
shortens transitions and animations to 0.01ms. Inspector carets, scrollbars, text
selection, and focus rings use theme tokens. This is short state feedback, not
an entrance-animation system.

## Do's and Don'ts

### Do

- Do pair light or dark role tokens consistently within a surface.
- Do retain distinct board, key, pad, and selection treatments.
- Do keep measurement units adjacent to editable values.
- Do give each panel its own bounded scrolling region.
- Do preserve native disclosure controls, keyboard focus, and reduced-motion behavior.

### Don't

- Don't treat the original app's design document as v2's palette.
- Don't substitute shade or hue names for a control's actual role.
- Don't spread geometry colors across unrelated panel backgrounds.
- Don't copy the documented contrast and status-indicator defects into new components.
- Don't present a saved screenshot or this document as proof of current accessibility compliance.
