import { resolve } from 'ergogen/src/native/layout';
import { template } from 'ergogen/src/utils';
import type { LayoutReport, ResolvedObject } from 'ergogen/src/native';
import { readStudio, type StudioDoc, type StudioItem } from './studioSource';

type Binding = Readonly<Record<string, unknown>> & {
  readonly params?: Readonly<Record<string, unknown>>;
};
const mapping = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function electricalBinding(value: unknown): Binding {
  if (!mapping(value)) return {};
  return { ...value, params: mapping(value.params) ? value.params : undefined };
}

// Preserve authored templates and references when materializing inherited bindings.
export function inheritedBinding(
  data: StudioDoc,
  item: StudioItem,
  key: string
): Binding {
  const base = electricalBinding(
    data.parts?.[item.part || '']?.footprints?.[key]
  );
  const authored = item.footprints?.[key];
  const instance =
    typeof authored === 'string'
      ? { reference: authored }
      : electricalBinding(authored);
  return {
    ...base,
    ...instance,
    params: { ...base.params, ...electricalBinding(instance).params },
    ...(mapping(base.placement) ||
    ('placement' in instance && mapping(instance.placement))
      ? {
          placement: {
            ...(mapping(base.placement) ? base.placement : {}),
            ...('placement' in instance && mapping(instance.placement)
              ? instance.placement
              : {}),
          },
        }
      : {}),
  };
}

export function resolveElectricalValue(
  value: unknown,
  properties: Readonly<Record<string, unknown>>,
  name: string
): unknown {
  return typeof value === 'string'
    ? template(value, { ...properties, name, mirrored: false })
    : value;
}

export function effectiveElectrical(source: string) {
  return resolvedElectrical(resolve(readStudio(source)));
}

function resolvedElectrical(layout: LayoutReport) {
  return Object.values(layout.objects).map((item) => {
    const bindings =
      'footprints' in item && mapping(item.footprints) ? item.footprints : {};
    const footprints = Object.fromEntries(
      Object.entries(bindings).map(([key, value]) => {
        const binding = electricalBinding(value);
        return [
          key,
          {
            ...binding,
            params: Object.fromEntries(
              Object.entries(binding.params || {}).map(([pin, net]) => {
                const resolved: unknown = resolveElectricalValue(
                  net,
                  item.properties || {},
                  item.id
                );
                return [pin, resolved];
              })
            ),
          },
        ];
      })
    );
    return { ...item, footprints };
  });
}

type ElectricalObject = ReturnType<typeof effectiveElectrical>[number];
const netName = (value: unknown) =>
  typeof value === 'string' && value ? value : undefined;
const pin = (binding: Binding | undefined, name: string) =>
  netName(binding?.params?.[name]);
const property = (item: ResolvedObject, name: string) =>
  netName(item.properties?.[name]);

export function matrixElectrical(objects: readonly ElectricalObject[]) {
  const nets = new Set<string>();
  const findings: string[] = [];
  const compare = (
    item: ElectricalObject,
    terminal: string,
    actual: string | undefined,
    expected: string | undefined
  ) => {
    if (actual && expected && actual !== expected) {
      findings.push(
        `${item.pcb || 'main'}: matrix wiring ${item.id} ${terminal} uses ${actual}, expected ${expected}. Review explicit wiring and matrix properties.`
      );
    }
  };
  for (const item of objects) {
    if (item.kind !== 'key') {
      for (const net of [
        property(item, 'column_net'),
        property(item, 'row_net'),
      ]) {
        if (net) nets.add(net);
      }
      continue;
    }
    const sw = item.footprints.switch;
    const column = property(item, 'column_net');
    const row = property(item, 'row_net');
    const columnPin = pin(sw, 'from');
    const switchOut = pin(sw, 'to');
    const owned = objects.find(
      (candidate) =>
        candidate.properties?.owner === item.id &&
        candidate.properties?.role === 'diode'
    );
    const diode = owned?.footprints.main || item.footprints.studio_diode;
    const rowPin = diode ? pin(diode, 'to') : switchOut;
    for (const net of [columnPin || column, rowPin || row]) {
      if (net) nets.add(net);
    }
    compare(item, 'switch.from', columnPin, column);
    compare(item, diode ? 'diode.to' : 'switch.to', rowPin, row);
    if (diode) compare(item, 'diode.from', pin(diode, 'from'), switchOut);
  }
  return { nets, findings };
}

export function resolvedMatrixFindings(layout: LayoutReport): string[] {
  return matrixElectrical(resolvedElectrical(layout)).findings;
}
