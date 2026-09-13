import { dimension, formatDimension, pitchUnits } from '../utils/designUnits';
import {
  editStackDimension,
  stackDimensions,
  type StackDimension,
} from '../utils/stackDimensions';
import DimensionField from './DimensionField';

export default function StackDimensions({
  source,
  board,
  assembly,
  onChange,
}: {
  source: string;
  board: string;
  assembly?: string;
  onChange: (source: string) => void;
}) {
  const values = stackDimensions(source, board, assembly),
    units = pitchUnits(source);
  const height = `(${values.pcbZ}) + (${values.pcb}) + (${values.gap})`;
  let resolved = 'Unresolved';
  try {
    resolved = `${formatDimension(dimension(height, units))} mm`;
  } catch {
    /* Keep invalid authored expressions editable. */
  }
  const field = (key: StackDimension, label: string) => (
    <DimensionField
      key={key}
      label={label}
      value={values[key]}
      units={units}
      help={
        {
          pcb: 'Finished circuit board thickness.',
          plate: 'Switch plate material thickness.',
          gap: 'Clear space above the PCB and below the plate.',
          pcbZ: 'Height above the assembly datum.',
        }[key]
      }
      onCommit={(value) =>
        onChange(editStackDimension(source, board, key, value, assembly))
      }
    />
  );
  return (
    <section aria-label="Stack dimensions">
      {field('pcb', 'PCB thickness')}
      {field('plate', 'Plate thickness')}
      {field('gap', 'PCB to plate gap')}
      {values.name && field('pcbZ', 'PCB underside height')}
      <p>
        <output aria-label="Plate underside height">
          Plate underside height: {resolved}
        </output>
        <br />
        <small>
          PCB underside + PCB thickness + gap
          {values.name
            ? ', from the assembly datum.'
            : ', relative to the PCB underside.'}
        </small>
      </p>
    </section>
  );
}
