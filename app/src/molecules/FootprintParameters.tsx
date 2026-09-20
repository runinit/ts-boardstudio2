import { useCallback, useEffect, useId, useState } from 'react';
import type {
  FootprintParameter,
  FootprintParameters as Definitions,
} from '../types/footprint';

type Props = {
  readonly definitions: Definitions;
  readonly values: Readonly<Record<string, unknown>>;
  readonly onChange: (key: string, value: unknown) => void;
  readonly onValidity: (valid: boolean) => void;
};
const structured = ['array', 'object', 'anchor'];
function display(value: unknown) {
  return typeof value === 'object'
    ? JSON.stringify(value, null, 2)
    : String(value ?? '');
}
function parseValue(
  text: string,
  type: string
): { value: unknown; error: string } {
  if (type === 'number') {
    const value = Number(text);
    return {
      value,
      error:
        text.trim() && Number.isFinite(value) ? '' : 'Enter a finite number.',
    };
  }
  if (structured.includes(type)) {
    try {
      const value: unknown = JSON.parse(text);
      const valid =
        type === 'array'
          ? Array.isArray(value)
          : type === 'object'
            ? value !== null &&
              typeof value === 'object' &&
              !Array.isArray(value)
            : value !== null && typeof value === 'object';
      return {
        value,
        error: valid
          ? ''
          : `Enter a JSON ${type === 'anchor' ? 'object or array' : type}.`,
      };
    } catch (error) {
      return {
        value: undefined,
        error: error instanceof Error ? 'Enter valid JSON.' : String(error),
      };
    }
  }
  return { value: text, error: '' };
}
function Field({
  name,
  definition,
  value,
  onChange,
  onValidity,
}: {
  readonly name: string;
  readonly definition: FootprintParameter;
  readonly value: unknown;
  readonly onChange: Props['onChange'];
  readonly onValidity: (key: string, valid: boolean) => void;
}) {
  const id = useId();
  const serialized = display(value);
  const [text, setText] = useState(serialized);
  const [error, setError] = useState('');
  useEffect(() => {
    setText(serialized);
    setError('');
    onValidity(name, true);
  }, [serialized, name, onValidity]);
  const commit = () => {
    const parsed = parseValue(text, definition.type);
    setError(parsed.error);
    onValidity(name, !parsed.error);
    if (!parsed.error && display(parsed.value) !== display(value))
      onChange(name, parsed.value);
  };
  const known = ['boolean', 'string', 'number', 'net', ...structured].includes(
    definition.type
  );
  return (
    <label>
      {name}
      {definition.type === 'boolean' ? (
        <input
          aria-label={name}
          type="checkbox"
          checked={value === true}
          onChange={(event) => onChange(name, event.target.checked)}
        />
      ) : definition.choices ? (
        <select
          aria-label={name}
          value={String(value)}
          onChange={(event) => onChange(name, event.target.value)}
        >
          {definition.choices.map((choice) => (
            <option key={choice}>{choice}</option>
          ))}
        </select>
      ) : (
        <>
          {structured.includes(definition.type) ? (
            <textarea
              aria-label={name}
              rows={3}
              value={text}
              aria-invalid={!!error}
              aria-describedby={error ? id : undefined}
              onChange={(event) => {
                setText(event.target.value);
                const parsed = parseValue(event.target.value, definition.type);
                setError(parsed.error);
                onValidity(name, !parsed.error);
              }}
              onBlur={commit}
            />
          ) : (
            <input
              aria-label={name}
              type={definition.type === 'number' ? 'number' : 'text'}
              step={definition.type === 'number' ? 'any' : undefined}
              value={text}
              readOnly={!known}
              aria-invalid={!!error}
              aria-describedby={error ? id : undefined}
              onChange={(event) => {
                setText(event.target.value);
                const parsed = parseValue(event.target.value, definition.type);
                setError(parsed.error);
                onValidity(name, !parsed.error);
              }}
              onBlur={commit}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commit();
              }}
            />
          )}
          {error && (
            <small id={id} role="alert">
              {error}
            </small>
          )}
          {!known && (
            <small>
              Unsupported parameter type: {definition.type}. Edit the module
              source to change its definition.
            </small>
          )}
        </>
      )}
    </label>
  );
}
export function FootprintParameters({
  definitions,
  values,
  onChange,
  onValidity,
}: Props) {
  const [invalid, setInvalid] = useState<ReadonlySet<string>>(new Set());
  const validity = useCallback(
    (key: string, valid: boolean) =>
      setInvalid((previous) => {
        if (previous.has(key) === !valid) return previous;
        const next = new Set(previous);
        if (valid) next.delete(key);
        else next.add(key);
        return next;
      }),
    []
  );
  useEffect(
    () => onValidity(!Object.keys(definitions).some((key) => invalid.has(key))),
    [definitions, invalid, onValidity]
  );
  return (
    <fieldset>
      <legend>Footprint settings</legend>
      <p>
        Settings change the generated footprint and its saved defaults.
        Placement parameters can override them.
      </p>
      {Object.entries(definitions).map(([key, definition]) => (
        <Field
          key={key}
          name={key}
          definition={definition}
          value={values[key] ?? definition.value}
          onChange={onChange}
          onValidity={validity}
        />
      ))}
      {!Object.keys(definitions).length && (
        <p>This footprint has no configurable parameters.</p>
      )}
    </fieldset>
  );
}
