---
name: 'Board Studio CAD Drafting Console'
description: 'A compact graphite and blue workbench for keyboard design editing.'
colors:
  primary: '#326b85'
  primaryHover: '#3b7c99'
  accent: '#79b7d4'
  background: '#20252b'
  canvas: '#0a0d12'
  backgroundLight: '#282f37'
  backgroundLighter: '#343d47'
  border: '#424d59'
  borderHover: '#667788'
  buttonHover: '#35414d'
  fieldSurface: '#20262d'
  text: '#e1e8ee'
  textDark: '#c0ccd6'
  textDarker: '#a5b3c0'
  white: '#fff'
  selected: '#293f4d'
  grid: '#303942'
  key: '#c7d5de'
  outline: '#79b7d4'
  component: '#c3a96c'
  error: '#ff6d6d'
  warning: 'hsl(45, 100%, 90%)'
  warningDark: 'hsl(32, 79%, 40%)'
  info: 'hsl(206, 94%, 92%)'
  infoDark: 'hsl(206, 100%, 30%)'
  success: 'hsl(120, 73%, 92%)'
  successDark: 'hsl(120, 50%, 35%)'
typography:
  body:
    { fontFamily: "'Roboto', sans-serif", fontSize: '14px', lineHeight: 1.45 }
  title:
    { fontFamily: "'Roboto', sans-serif", fontSize: '18px', fontWeight: 700 }
  label: { fontFamily: "'Roboto', sans-serif", fontSize: '13px' }
  code:
    {
      fontFamily: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
    }
rounded: { field: '5px', tool: '8px', case: '8px', pill: '999px' }
spacing:
  { xs: '0.25rem', sm: '0.5rem', compact: '0.75rem', md: '1rem', lg: '1.5rem' }
components:
  button-primary:
    {
      backgroundColor: '{colors.primary}',
      textColor: '{colors.white}',
      rounded: '{rounded.field}',
      padding: '0.5rem 1rem',
      height: '36px',
    }
  button-neutral:
    {
      backgroundColor: '{colors.backgroundLight}',
      textColor: '{colors.text}',
      rounded: '{rounded.field}',
      padding: '0.5rem 1rem',
      height: '36px',
    }
  button-selected:
    {
      backgroundColor: '{colors.selected}',
      textColor: '{colors.text}',
      rounded: '{rounded.field}',
      padding: '0.5rem 1rem',
      height: '36px',
    }
  input-studio:
    {
      backgroundColor: '{colors.fieldSurface}',
      textColor: '{colors.text}',
      rounded: '{rounded.field}',
      padding: '0.5rem',
      height: '36px',
    }
  stage-nav: { textColor: '{colors.text}', padding: '0.5rem 1.5rem' }
  canvas-dock:
    {
      backgroundColor: '{colors.backgroundLight}',
      rounded: '{rounded.tool}',
      padding: '0.25rem',
    }
---

<!-- markdownlint-disable MD025 -->

# Design System: Board Studio CAD Drafting Console

## Stitch integration contract

The supplied `stitch_adaptive_responsive_design_system/code.html` and
`screen.png` are the visual authority. Their graphite palette and Roboto
controls override the blue-black/Anybody/Inter defaults in the supplied
DESIGN.md. This is an operating surface, not a static reproduction of its
sample keyboard, DRC result, firmware claim, or account avatar.

- Desktop uses one 48px project/stage header and a 40px contextual ribbon.
  The ribbon shows the actual project, selection, and inspector action.
  Navigation moves to a second row below 1050px; project actions retain their
  existing menu and touch targets.
- Canvas uses `studio.canvas` (#0a0d12). Chrome uses the existing graphite
  surfaces, draft blue, muted text, and 1px rules. The functional grid remains
  available, rendered quietly over the dark field.
- The left rail groups selection and pan controls vertically. Snap controls
  join the centered bottom view dock. Snap settings open above that dock and
  own their scrolling, never displacing the view controls.
- Inspector sections use quiet rules, compact headings, and recessed fields.
  The existing object browser, inspector drawer, and non-modal mobile selection
  tray retain their draft and focus behavior.
- Chrome uses 12px metadata, 14px controls, and 16px section titles. Measurements
  use the existing mono font stack and tabular numerals. Spacing uses 4/8/12/16/
  24px tokens; controls use 36px desktop and 44px touch targets; docks use 8px
  corners and the existing floating-tool shadow.
- The application shell owns viewport height; canvas, object browser, inspector,
  and selection tray each own their existing bounded scroll regions.
- At heights below 480px, stage icons and text sit side by side; landscape
  outline controls stay in the contextual row. The canvas shrinks to the visible
  space instead of creating a hidden, scrollable extension behind the header.

## Overview

<!-- markdownlint-disable MD036 -->

**Creative North Star: "The CAD drafting console"**

<!-- markdownlint-enable MD036 -->

This is a compact, practical workbench for keyboard designers. Cool graphite surfaces recede behind the drawing, while restrained blue marks the active stage, selection, focus, and primary generation actions. Roboto keeps controls workmanlike; aligned numeric fields make geometry readable at a glance.

The object browser, central geometry, and editable properties share one spatial model. Selection changes the inspector without replacing the canvas or losing an unfinished part draft. Bundled and custom parts stay distinct across Design, PCB, Case, and Export.

**Key Characteristics:**

- Graphite panels with blue selection and focus states.
- Docked browser and inspector around a dominant drawing field.
- Compact rectangular controls with numeric, tabular readouts.
- Touch-safe controls and reduced-motion support.

## Colors

Graphite provides the field and panel layers; cool blue carries action and selection. Key, outline, and component colors stay distinct inside geometry.

### Primary

- **Workbench blue** (#326b85): primary generation and commit actions.
- **Blue hover** (#3b7c99): primary hover state.
- **Draft blue** (#79b7d4): active stage, focus, selected geometry, and outlines.

### Secondary

- **Key blue-gray** (#c7d5de): key geometry.
- **Component brass** (#c3a96c): component geometry.

### Neutral

- **Graphite field** (#20252b): application and canvas background.
- **Graphite panel** (#282f37): controls, panes, and editor surfaces.
- **Graphite raised** (#343d47): higher contrast panel or hover surface.
- **Rule gray** (#424d59): borders and dividers.
- **Text** (#e1e8ee), **muted text** (#c0ccd6), **secondary text** (#a5b3c0): hierarchy.
- **Selection wash** (#293f4d) and **grid** (#303942): selected rows and canvas grid.

## Typography

**Display Font:** Roboto (with sans-serif fallback)

**Body Font:** Roboto (with sans-serif fallback)

**Label/Mono Font:** Source Code Pro, Menlo, Monaco, Consolas, Courier New, monospace for code surfaces.

**Character:** Neutral, compact, and technical. Numeric inputs use tabular numerals so changing values does not shift nearby controls.

### Hierarchy

- **Title** (700, 18px): project and pane headings.
- **Body** (400, 14px, 1.45): controls, descriptions, and editor copy.
- **Label** (400, 13px): numeric labels, helper text, and metadata.
- **Code** (monospace): source and configuration editing.

## Layout

The Inspector starts closed. Opening it on desktop reveals a 212px object browser, a flexible central canvas, and a 320px properties pane; closing it returns the canvas to full width. A compact project header and stage strip establish project context above it. Let panes own their scroll independently.

At 1050px and below, the Inspector becomes a right drawer, limited to the smaller of 90% width or 320px. Its fixed header names the selection type and key count, with Preview board and Close inspector above Browse objects and Edit properties. The active pane scrolls beneath it. Preview board reveals the canvas; Return to Inspector restores the draft, last field, selection, and scroll position. At 600px and below, drawers use full width and stage tabs show text alone. Selection quick actions use a separate bottom tray on phones: the canvas remains the primary surface, the tray is capped at 52dvh, and only the tray body scrolls. The tray is non-modal so canvas selection remains available, and its close button returns focus to the canvas action that opened it. Use the existing 0.25rem, 0.5rem, 1rem, and 1.5rem rhythm. Controls are 36px high; narrow layouts use 44px touch targets.

The embedded Design Setup flow stays reachable on mobile: setup, assembly, stack, and canvas are sequential sections in the same document. Assembly previews use 144px at rest and 320px when expanded.

## Elevation & Depth

Depth is restrained and structural. Tonal graphite layers and quiet rules define ordinary surfaces; shadows are reserved for floating canvas tools and metadata popovers.

### Shadow Vocabulary

- **Canvas tool** (`0 4px 20px #0005`): floating rail and zoom dock.
- **Metadata popover** (`0 4px 12px rgba(0, 0, 0, 0.4)`): development metadata only.

## Shapes

Use compact rectangular fields and buttons with a 5px radius. Canvas docks and case surfaces use 8px corners. Rules are 1px solid graphite borders. Stage tabs use no radius and a 2px blue bottom rule for the current step. Preserve visible focus outlines.

## Components

### Project Header and Stage Navigation

The desktop header keeps the project, Design, PCB, Case, Library, Export, undo/redo, and project actions in one row. The current stage uses blue text and a blue bottom rule. At narrow widths, stages occupy a second row, secondary project tools move into Project actions, and undo/redo join Inspector in the contextual ribbon.

### Object Browser and Part Library

The left dock catalogs objects, clusters, bundled parts, and editable custom parts. Rows are compact and left-aligned. Selected object rows use the selection wash; ownership remains distinguishable. Narrow layouts expose one labelled drawer at a time.

### Canvas and Tool Docks

The dark central field owns geometry and selection. Outline controls share the contextual ribbon; analysis messages remain above the canvas. The left rail groups object, column, row, matrix, pan, and delete actions. Phones and short landscape canvases use a horizontal rail. The centered bottom dock combines snapping and view controls, wrapping into two rows on phones. Pressed tools use selection wash and blue foreground. Icon-only controls retain accessible names.

One magnet toggles snapping. Inline guide toggles precede a chevron that opens a 272px settings surface above the dock. The settings own their scrolling and leave dock geometry stable. Essential unit increments are immediately available; More exposes custom millimetres, edge gap, and help. Short landscape windows compact the chrome and constrain the canvas to its visible bounds. Escape and Close return focus to the chevron; canvas clicks leave settings open. Closed controls are inert and values persist.

### Inspector and Model Editor

The Inspector opens only by explicit invocation; selecting a key does not open it. Escape and Close inspector restore focus. Selection updates properties without resetting the camera.

Common size, alignment, stagger, and splay controls remain visible. Key membership, matrix actions, relative adjustments, and advanced placement use named disclosure sections that remember their open state during the session.

Row and column membership uses aligned lists: the row or column number leads, the muted key name wraps within the remaining width, and a named removal icon stays in a fixed trailing column. Quiet horizontal rules separate entries. Matrix growth actions share a two-column group; Matrix size and pitch spans both columns in draft blue, and deletion sits separately in error red. Selection adjustments have a dividing rule and two-column relative fields.

Part editing uses a sticky header for save and selection context. Model transforms use numeric offset, rotation, and scale fields; unfinished text commits on blur or Enter. Errors and busy states remain beside their operation.

### Design Setup and Mechanical Stack

DesignSetupPanel groups board defaults, key assembly, and stackup. Add component owns controller and accessory placement. DimensionField uses quarter-unit and physical millimetre values with tabular numerals. SnapControls exposes unit steps, custom millimetres, grid, center, and edge guides; RelationshipPanel applies center alignment, center distance, and equal spacing as named constraints.

StackupPanel names each material layer and shows its independent fit status. “Fits gap” describes stack clearance only; cutting profiles and export readiness remain explicit Export concerns. Material, thickness, compression, inset, clearance, and cutouts remain editable per layer.

### Buttons and Fields

Primary buttons use workbench blue; neutral buttons use the panel surface; selected buttons use selection wash with a blue border. Fields use the recessed field surface, 5px radius, 1px rule, and 0.5rem padding. Focus uses a 2px blue outline with 2px offset. Disabled controls use 0.45 opacity.

### Status and Export Boundaries

The footer distinguishes current layout positions from generated 3D previews. Review actions name the finding count and use singular or plural labels. The findings panel explains that blockers prevent PCB and outline downloads, while case downloads have separate checks in Export. Each recovery action names its destination. A missing controller opens the component picker, or selects an existing controller. Pending or failed analysis never appears as an empty successful result.

Keep gap fit, cutting profile checks, and export readiness as separate labels and states. A named layer may fit the mechanical gap while its cutting outline is unresolved or its export is unavailable. Show the layer name and material in section and narrow-screen status rows.

## Design workflow revision

- The Design stage keeps the canvas dominant, but a selection exposes a compact
  contextual action popover for common edits: placement, rotation, size, delete,
  duplicate, and add key/row/column shortcuts. The popover is a tonal graphite
  surface with one blue primary action; it never becomes a second full inspector.
- Placement values in the Inspector use a compact two-column grid for position
  axes and rotation. It sits immediately below the selection heading; advanced
  constraints remain behind a disclosure.
- Snapping is represented by icon-labelled controls in the canvas dock. The
  first interaction exposes the essential snap modes inline; detailed options
  remain behind a secondary disclosure.
- The stage strip owns the first-class Part Library tab between Case and Export.
  Header actions are reserved for project-level actions and settings; duplicate
  key-assembly entry points are removed.
- Part Library sections are independently collapsible. Bundled/project
  footprints, custom footprints, and key assemblies remain visibly distinct.
  Key assemblies use the same preview surface as footprints, with a basic 1x1
  PCB silhouette and a restrained per-part color swatch.

## Reference extraction: assembly library and canvas dock

The supplied assembly-library reference confirms the visual direction rather
than introducing a new palette:

- Keep the graphite field, 1px rules, Roboto labels, and workbench blue
  selection wash already defined above.
- Use a 5px field radius for the canvas tool dock and its icon buttons. The
  dock is a compact rectangular control group, not a tall capsule or floating
  pill. Separate tool groups with tonal spacing and a quiet rule.
- The Library stage uses a fixed 260px catalog rail and a flexible editor
  surface. Assembly rows are compact, full-width buttons with a selected
  blue-gray wash, a one-line title, and a muted family/mounting subtitle.
- The selected assembly gets the main work area: a large 320px assembly editor
  preview above the placement controls. The catalog keeps a smaller preview
  and color swatches as orientation, while the center is the editing surface.
- Preview colors are semantic tokens: PCB outline blue, key blue-gray,
  component brass, and accent blue for optional RGB LEDs. They are controls,
  not decorative gradients.

## Do's and Don'ts

- Do keep the canvas dominant and open the Inspector only when requested.
- Do keep save, selection, and unsaved part context visible in sticky editor headers.
- Do use 36px controls on desktop and 44px targets at the 1050px breakpoint.
- Do use tabular numerals and commit numeric edits on blur or Enter.
- Do preserve separate key, outline, component, selection, and grid colors.
- Do respect `prefers-reduced-motion`.
- Do wrap long key names while keeping removal controls reachable.
- Do separate matrix actions from selection adjustments.
- Do expose frequent selection edits where the selection happens.
- Do keep library categories collapsible and preserve their open state while
  browsing.
- Don't replace the canvas when selection changes.
- Don't turn every surface into a floating card or add shadows to ordinary panels.
- Don't merge bundled and custom ownership into one catalog.
- Don't crowd narrow layouts with simultaneous inspectors.
- Don't retain duplicate header actions for the same setup workflow.
