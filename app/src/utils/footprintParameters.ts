import type { FootprintParameters } from '../types/footprint';

export function extractParameters(
  params: Record<string, unknown>,
  source: string
): FootprintParameters {
  return Object.fromEntries(
    Object.entries(params).map(([key, spec]) => {
      const expanded =
        spec !== null &&
        typeof spec === 'object' &&
        !Array.isArray(spec) &&
        Object.keys(spec).length === 2 &&
        'type' in spec &&
        'value' in spec;
      const type = expanded
        ? String(spec.type)
        : Array.isArray(spec)
          ? 'array'
          : spec === undefined || spec === null
            ? 'net'
            : typeof spec;
      const value = expanded ? spec.value : (spec ?? '');
      return [
        key,
        {
          type,
          value,
          ...(key === 'side' &&
          type === 'string' &&
          ['F', 'B', 'F&B'].includes(String(value))
            ? {
                choices: /['"]F&B['"]/.test(source)
                  ? ['F', 'B', 'F&B']
                  : ['F', 'B'],
              }
            : {}),
        },
      ];
    })
  );
}

// Change declared defaults so Ergogen still applies placement parameters last.
export function parameterDefaults(
  source: string,
  values: Record<string, unknown>
) {
  if (!Object.keys(values).length) return source;
  return `${source}\n;module.exports = ((original) => {
    const params = {...original.params};
    const values = JSON.parse(${JSON.stringify(JSON.stringify(values))});
    for (const [key, value] of Object.entries(values)) {
      if (!Object.prototype.hasOwnProperty.call(params, key)) {
        throw new Error('Unknown footprint parameter: ' + key);
      }
      const spec = params[key];
      const expanded = spec && typeof spec === 'object' && !Array.isArray(spec)
        && Object.keys(spec).length === 2 && 'type' in spec && 'value' in spec;
      Object.defineProperty(params, key, {
        value: expanded ? {...spec, value}
          : spec === undefined || spec === null ? {type: 'net', value} : value,
        enumerable: true, writable: true, configurable: true
      });
    }
    return {...original, params};
  })(module.exports);\n`;
}
