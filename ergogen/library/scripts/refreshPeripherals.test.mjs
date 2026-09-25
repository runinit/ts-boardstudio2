import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const engine = require('../../engine/src/ergogen');
const sx = require('../../engine/src/templates/sexpr');
const children = (node, key) => node.filter(item => Array.isArray(item) && item[0] === key);
const child = (node, key) => children(node, key)[0] || [];
const text = sx.value;
let fixture = 0;
async function generate(file, params = {}, angle = 0) {
  engine.inject('footprint', 'refreshPeripheral', require(`../${file}.js`));
  const result = await engine.process({
    schema: 'ergogen/v1',
    layout: { objects: { component: { kind: 'component', pcb: 'main',
      footprints: { main: { what: 'refreshPeripheral', placement: { rotate: angle }, params } } } } },
    designs: { regions: { board: { shape: { size: [100, 100] } } },
      profiles: { board: { from: 'regions.board' } } },
    pcbs: { main: { profile: 'profiles.board' } },
  });
  if (process.env.PERIPHERAL_EVIDENCE_DIR) {
    writeFileSync(join(process.env.PERIPHERAL_EVIDENCE_DIR, `native-${++fixture}.kicad_pcb`), result.pcbs.main);
  }
  const board = sx.parse(result.pcbs.main, 'peripheral regression')[0];
  const footprint = children(board, 'footprint')[0];
  return { board, footprint, pads: children(footprint, 'pad') };
}
const net = pad => text(child(pad, 'net').at(-1) || '""');
function polygonContains(polygon, point) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > point[1]) !== (yj > point[1])
      && point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

test('drilled diode SMD pads require reversible mode and preserve both nets when enabled', async () => {
  for (const side of ['F', 'B']) {
    await assert.rejects(generate('diode_tht_sod123', {
      side, from: 'ANODE', to: 'CATHODE', include_thru_hole_smd_pads: true,
      reversible: false, include_tht: false,
    }), /include_thru_hole_smd_pads requires reversible/);
    for (const reversible of [false, true]) {
      const { pads } = await generate('diode_tht_sod123', {
        side, from: 'ANODE', to: 'CATHODE', reversible, include_tht: false,
        include_thru_hole_smd_pads: reversible,
      });
      assert.deepEqual(new Set(pads.map(net)), new Set(['ANODE', 'CATHODE']));
      assert.equal(pads.length, 2);
    }
  }
});

test('six generic pads have six independent defaults and permit explicit sharing', async () => {
  for (const side of ['F', 'B']) for (const mirror of [false, true]) {
    const params = { pads: 6, side, mirror, reverse: false };
    const { pads } = await generate('vendor/infused-kim/pads', params);
    assert.deepEqual(new Set(pads.map(net)), new Set(Array.from({ length: 6 }, (_, i) => `PAD_${i + 1}`)));
    const shared = await generate('vendor/infused-kim/pads', { ...params, net_6: 'PAD_5' });
    assert.equal(shared.pads.filter(pad => net(pad) === 'PAD_5').length, 2);
  }
});

test('SSD1306 ground width follows the GND jumper, including inverted jumper positions', async () => {
  for (const side of ['F', 'B']) for (const invert_jumpers_position of [false, true]) {
    const { board, pads } = await generate('display_ssd1306', {
      side, invert_jumpers_position, reversible: true, signal_trace_width: 0.21,
      gnd_trace_width: 0.61, SDA: 'DATA', SCL: 'CLOCK', VCC: 'POWER', GND: 'RETURN',
    });
    const tracks = children(board, 'segment');
    assert.equal(tracks.length, 8);
    for (const track of tracks) {
      const layer = text(child(track, 'layer')[1]);
      const x = Number(child(track, 'start')[1]);
      const globalPad = pads.find(pad => ['DATA', 'CLOCK', 'POWER', 'RETURN'].includes(net(pad))
        && Number(child(pad, 'at')[1]) === x && child(pad, 'layers').slice(1).map(text).includes(layer));
      assert.ok(globalPad);
      assert.equal(Number(child(track, 'width')[1]), net(globalPad) === 'RETURN' ? 0.61 : 0.21);
    }
  }
});

test('Gateron rejects overlapping reversible hotswap drills', async () => {
  for (const side of ['F', 'B']) for (const solder of [false, true]) {
    await assert.rejects(generate('switch_gateron_ks27_ks33', {
      side, solder, reversible: true, hotswap: true, from: 'INPUT', to: 'OUTPUT',
    }), /reversible hotswap.*overlapping.*drills/);
    const { pads } = await generate('switch_gateron_ks27_ks33', {
      side, solder, reversible: false, hotswap: true, from: 'INPUT', to: 'OUTPUT',
    });
    assert.deepEqual(new Set(pads.map(net).filter(Boolean)), new Set(['INPUT', 'OUTPUT']));
  }
});

test('Gateron custom reversible solder copper rotates with its drilled anchors', async () => {
  for (const side of ['F', 'B']) for (const angle of [0, 37, 90, 180]) {
    const { pads, footprint } = await generate('switch_gateron_ks27_ks33', {
      side, hotswap: false, solder: true, reversible: true,
      include_custom_solder_pads: true, from: 'INPUT', to: 'OUTPUT',
    }, angle);
    const custom = pads.filter(pad => pad[3] === 'custom');
    assert.equal(custom.length, 4);
    for (const pad of custom) {
      assert.equal(Number(child(pad, 'at')[3] || 0), Number(child(footprint, 'at')[3] || 0));
      assert.ok(['INPUT', 'OUTPUT'].includes(net(pad)));
      const polygon = children(child(child(child(pad, 'primitives'), 'gr_poly'), 'pts'), 'xy')
        .map(point => point.slice(1).map(Number));
      const anchor = child(pad, 'at').slice(1).map(Number);
      const relative = (Number(child(footprint, 'at')[3] || 0) - anchor[2]) * Math.PI / 180;
      const drills = pads.filter(hole => hole[2] === 'thru_hole' && net(hole) === net(pad));
      assert.equal(drills.length, 2);
      for (const hole of drills) {
        const at = child(hole, 'at').slice(1).map(Number);
        const dx = at[0] - anchor[0], dy = at[1] - anchor[1];
        assert.ok(polygonContains(polygon, [
          dx * Math.cos(relative) + dy * Math.sin(relative),
          -dx * Math.sin(relative) + dy * Math.cos(relative),
        ]), 'custom copper must contain both same-net drilled centers');
      }
    }
  }
});
