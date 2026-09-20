import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import FootprintCanvas from './FootprintCanvas';

it('keeps preview limitations available without covering the geometry by default', () => {
  // Given: the alignment inset's multi-footprint copper warning.
  const message =
    'Board tracks and vias are omitted when inspecting one of several footprints; their ownership is ambiguous.';
  // When: displaying the shared footprint preview.
  render(
    <FootprintCanvas
      info={{
        targets: [],
        pads: [],
        nets: [],
        models: [],
        graphics: [],
        diagnostics: [
          { code: 'unsupported-preview', severity: 'warning', message },
        ],
      }}
      models={[]}
      assets={{}}
      selected={-1}
      onSelect={() => {}}
      view="2d"
    />
  );
  // Then: the warning is discoverable, but its full overlay starts collapsed.
  const summary = screen.getByText('Preview limitations');
  expect(summary.tagName).toBe('SUMMARY');
  expect(summary.parentElement).not.toHaveAttribute('open');
  expect(screen.getByText(message)).not.toBeVisible();
  expect(
    screen.getByRole('img', { name: /Footprint pads and geometry/ })
  ).toBeVisible();
});
