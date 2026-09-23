# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Keyboard designers creating a board or continuing an existing project. They move
between layout, PCB, component, and case work while keeping their design editable.

## Product Purpose

Board Studio connects keyboard design and making in one workbench. A designer can
shape a layout, place parts, develop the PCB and case, then export the resulting
source and fabrication files without losing project context between tasks.

## Operating Context

The main workflow runs through Design, PCB, Case, and Export. The Part Library
supports footprint, pad, and 3D model work. Designers can start from a preset,
resume a saved board, or import a project. The same project remains available in
the visual workbench and source editor.

## Capabilities and Constraints

- Preserve existing project data, source expressions, stable identities, and
  editing history across visual and source changes.
- Keep generation, import, export, and editing available. Distinguish bundled
  parts from editable custom parts.
- Show analysis, generation, and export readiness as separate states. A preview
  or passing source check alone does not establish fabrication readiness.
- Keep the browser app, local Ergogen engine, and footprint package connected
  through the existing workspace.

## Brand Commitments

The product is named Board Studio. Its voice is compact, practical, and
restrained; controls describe the action or state they represent.

## Evidence on Hand

The repository contains working source, example projects, regression tests, and
desktop and mobile QA captures. Physical fit and fabrication readiness require
separate evidence.

## Product Principles

- Keep the project and selection in context across tasks.
- Make edits immediate, reversible, and clear about pending work or conflicts.
- Preserve authored source and the distinction between bundled and custom parts.
- Keep frequent actions close to the work while retaining detailed controls.
- Name the readiness of each output before a designer downloads it.
