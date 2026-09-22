import { CONTROLLERS } from './designSetup';
import {
  effectiveElectrical,
  inheritedBinding,
  matrixElectrical,
} from './assemblyElectrical';
import { getValue, readStudio, setValue } from './studioSource';

export function keyNets(
  source: string,
  id: string,
  data: ReturnType<typeof readStudio> = readStudio(source)
) {
  const item = data.layout.objects![id];
  const prefix = item.pcb && item.pcb !== 'main' ? `${item.pcb}_` : '';
  const managed = !!getValue(source, ['meta', 'studio', 'setup']);
  const standard = item.cluster === `${prefix}fingers` && managed;
  const peers = Object.values(data.layout.objects || {}).filter(
    (peer) => peer.kind === 'key' && peer.cluster === item.cluster
  );
  const net = (axis: 'column' | 'row', index: number) => {
    const property = `${axis}_net`;
    if (item.properties?.[property]) {
      return String(item.properties[property]);
    }
    const cell = item.cell?.[index];
    const peer =
      cell &&
      peers.find(
        (peer) => peer.cell?.[index] === cell && peer.properties?.[property]
      );
    if (peer) {
      return String(peer.properties![property]);
    }
    if (standard && cell && /^[cr]\d+$/.test(cell)) {
      return `${prefix}${cell.toUpperCase()}`;
    }
    if (cell) return `${item.cluster}_${cell}`;
    if (managed) {
      return `${item.cluster || id}_${axis === 'row' ? 'row' : `c${(item.index || 0) + 1}`}`;
    }
    return axis === 'column' ? `${id}_column` : `${item.cluster || id}_row`;
  };
  return { columnNet: net('column', 0), rowNet: net('row', 1) };
}

// Existing assignments reserve their pins. Only missing nets use unassigned GPIOs.
export function syncControllerNets(source: string): string {
  const data = readStudio(source);
  let result = source;
  const previous = (getValue(source, [
    'meta',
    'studio',
    'electricalFindings',
  ]) || []) as string[];
  const updateFindings = (input: string, messages: string[]) => {
    const findings = [
      ...previous.filter(
        (message) =>
          !message.includes(': no free GPIO for ') &&
          !message.includes(': matrix wiring ')
      ),
      ...messages,
    ];
    return JSON.stringify(previous) === JSON.stringify(findings)
      ? input
      : setValue(input, ['meta', 'studio', 'electricalFindings'], findings);
  };
  let effective: ReturnType<typeof effectiveElectrical>;
  try {
    effective = effectiveElectrical(source);
  } catch (error) {
    if (!(error instanceof Error) || error.name !== 'DesignError') throw error;
    return updateFindings(source, [
      `Project: matrix wiring cannot be resolved: ${error.message}`,
    ]);
  }
  const messages = matrixElectrical(effective).findings;
  for (const [id, item] of Object.entries(data.layout.objects || {})) {
    const binding = inheritedBinding(data, item, 'main');
    const controller = CONTROLLERS.find(
      (item) => item.provider === binding?.what
    );
    if (!binding || !controller) {
      continue;
    }
    const objects = effective.filter((object) => object.pcb === item.pcb);
    const params = { ...binding.params };
    const { nets } = matrixElectrical(objects);
    for (const object of objects) {
      if (object.properties?.role === 'led') {
        nets.add(`${item.pcb === 'main' ? '' : `${item.pcb}_`}LED_DATA`);
      }
    }
    for (const object of objects) {
      const required = object.properties?.required_nets;
      if (Array.isArray(required)) {
        for (const net of required) {
          if (typeof net === 'string') {
            nets.add(net);
          }
        }
      }
      // Older projects retain accessory nets from their actual footprint bindings.
      for (const binding of Object.values(object.footprints || {}) as {
        what?: string;
        params?: Record<string, unknown>;
      }[]) {
        if (
          !binding.what?.includes('encoder') &&
          !binding.what?.includes('trrs')
        ) {
          continue;
        }
        for (const net of Object.values(binding.params || {})) {
          if (typeof net === 'string' && /ENC_|SPLIT_DATA/.test(net)) {
            nets.add(net);
          }
        }
      }
    }
    const missing = Array.from(nets).filter(
      (net) => !controller.pins.some((pin) => params[pin] === net)
    );
    const free = controller.pins.filter((pin) => !params[pin]);
    for (const net of missing) {
      const pin = free.shift();
      if (pin) {
        params[pin] = net;
      } else {
        messages.push(
          `${item.pcb}: no free GPIO for ${net}. Review controller assignments.`
        );
      }
    }
    if (JSON.stringify(params) !== JSON.stringify(binding.params)) {
      result = setValue(
        result,
        ['layout', 'objects', id, 'footprints', 'main', 'params'],
        params
      );
    }
  }
  return updateFindings(result, messages);
}

// Setup recompilation must not shift existing pin assignments when matrix size changes.
export function keepControllerPins(before: string, source: string): string {
  const old = readStudio(before),
    next = readStudio(source);
  let result = source;
  for (const [id, item] of Object.entries(next.layout.objects || {})) {
    const binding = item.footprints?.main as
      | { what?: string; params: Record<string, unknown> }
      | undefined;
    const previous = old.layout.objects?.[id]?.footprints
      ?.main as typeof binding;
    const controller = CONTROLLERS.find(
      (controller) => controller.provider === binding?.what
    );
    if (
      !controller ||
      !binding ||
      !previous ||
      previous.what !== binding.what
    ) {
      continue;
    }
    const params = Object.fromEntries(
      Object.entries(binding.params).filter(
        ([pin]) => !controller.pins.includes(pin)
      )
    );
    for (const pin of controller.pins) {
      if (previous.params[pin] !== undefined) {
        params[pin] = previous.params[pin];
      }
    }
    result = setValue(
      result,
      ['layout', 'objects', id, 'footprints', 'main', 'params'],
      params
    );
  }
  return result;
}
