import { installWorkerProbe } from './studioPerformanceWorker';
import { compileSetup, defaultSetup } from '../../src/utils/designSetup';
import { addCluster, addOutline } from '../../src/utils/studioSource';
import { expect, type Page } from '@playwright/test';
import { parse } from 'yaml';
import { CONFIG_LOCAL_STORAGE_KEY } from '../../src/context/constants';

type Probe = {
  start: number;
  visible: number;
  persisted: number;
  committed: number;
  polygon: string;
  tasks: { start: number; duration: number }[];
  armed: boolean;
  event: string;
  source: string;
  geometry: string;
};
declare global {
  interface Window {
    performanceProbe: Probe;
  }
}

export async function installProbe(page: Page, initial: string) {
  await installWorkerProbe(page);
  await page.addInitScript(
    ({ source, storageKey }) => {
      localStorage.setItem(storageKey, JSON.stringify(source));
      const saved = () => {
        const projects = JSON.parse(
          localStorage.getItem('ergogen:multi-config') || 'null'
        );
        return (
          projects?.configs?.find(
            (item: { id: string }) => item.id === projects.activeConfigId
          )?.config || JSON.parse(localStorage.getItem(storageKey) || '""')
        );
      };
      const geometry = () =>
        [
          ...document.querySelectorAll(
            '[aria-label="Interactive board layout"] [role="button"] polygon'
          ),
        ]
          .map(
            (node) =>
              `${node.parentElement?.getAttribute('transform')}:${node.getAttribute('points')}`
          )
          .join('|');
      const probe: Probe = {
        start: 0,
        visible: 0,
        persisted: 0,
        committed: 0,
        polygon: '',
        tasks: [],
        armed: false,
        event: '',
        source: '',
        geometry: '',
      };
      window.performanceProbe = probe;
      for (const name of ['keydown', 'click', 'pointermove'])
        document.addEventListener(
          name,
          (event) => {
            if (!probe.armed || probe.start || name !== probe.event) return;
            probe.start = event.timeStamp;
          },
          true
        );
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          probe.tasks.push({
            start: entry.startTime,
            duration: entry.duration,
          });
      }).observe({ type: 'longtask', buffered: true });
      const frame = () => {
        if (probe.armed && probe.start) {
          if (!probe.persisted && saved() !== probe.source)
            probe.persisted = performance.now();
          const polygon = [
            ...document.querySelectorAll(
              '[aria-label="Interactive board layout"] [role="button"] polygon'
            ),
          ]
            .map((node) => node.getAttribute('points'))
            .join('|');
          if (!probe.committed && polygon !== probe.polygon)
            probe.committed = performance.now();
          if (!probe.visible && geometry() !== probe.geometry)
            probe.visible = performance.now();
        }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    },
    { source: initial, storageKey: CONFIG_LOCAL_STORAGE_KEY }
  );
}

export const performanceFixture = (columns: number, rows: number) =>
  process.env.PERF_NATIVE_ROWS
    ? compileSetup({
        ...defaultSetup(),
        columns,
        rows,
        led: process.env.PERF_LED === '1',
      })
    : addOutline(
        addCluster(
          'schema: ergogen/v1\nlayout: {objects: {}}\npcbs: {main: {}}\n',
          'fingers',
          'columns',
          { columns, rows }
        )
      );

export function regionEvidence(before: string, after: string) {
  const names = (source: string) =>
    Object.keys(parse(source).designs?.regions || {}).sort();
  const original = names(before),
    current = names(after);
  expect(current).toEqual(original);
  return { before: original.length, after: current.length, ids: current };
}
