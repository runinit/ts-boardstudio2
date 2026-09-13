import { render, screen, fireEvent } from '@testing-library/react';
import { parse } from 'yaml';
import StudioInspector from './StudioInspector';
import ClusterTree from './ClusterTree';
import { readStudio } from '../utils/studioSource';

const source = `schema: ergogen/v1
layout:
  clusters:
    matrix:
      arrangement: {type: columns, columns: [c1, c2], rows: [r1, r2]}
  objects:
    a: {kind: key, cluster: matrix, cell: [c1, r1], properties: {column_net: C1, row_net: R1}}
    b: {kind: key, cluster: matrix, cell: [c2, r2], locked: true}
`;
const selection = { section: 'rows' as const, cluster: 'matrix', id: 'r2' };

it('opens a named row from the matrix tree', () => {
  const choose = vi.fn();
  render(
    <ClusterTree
      data={readStudio(source)}
      selection={selection}
      choose={choose}
    />
  );
  fireEvent.click(screen.getByRole('treeitem', { name: 'Row 2 · r2' }));
  expect(choose).toHaveBeenCalledWith(selection, 'replace', expect.any(Array));
});

it('shows sparse row cells and disables removing locked keys', () => {
  render(
    <StudioInspector
      source={source}
      data={readStudio(source)}
      selection={selection}
      edit={() => {}}
      select={() => {}}
    />
  );
  expect(screen.getByRole('heading', { name: 'Row 2' })).toBeVisible();
  expect(
    screen.getByRole('button', { name: 'Add key in column 1' })
  ).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Remove b' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Delete row' })).toBeDisabled();
});

it('adds a row cell without changing existing nets or filling other holes', () => {
  let result = source;
  render(
    <StudioInspector
      source={source}
      data={readStudio(source)}
      selection={selection}
      edit={(change) => {
        result = change(result);
      }}
      select={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Add key in column 1' }));
  const config = parse(result);
  expect(config.layout.objects.matrix_c1_r2.cell).toEqual(['c1', 'r2']);
  expect(config.layout.objects.a.properties).toEqual({
    column_net: 'C1',
    row_net: 'R1',
  });
  expect(
    Object.values(config.layout.objects).some(
      (item) => (item as { cell?: string[] }).cell?.join() === 'c2,r1'
    )
  ).toBe(false);
});
