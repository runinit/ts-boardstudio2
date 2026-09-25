import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { cpus, tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = fileURLToPath(new URL('../', import.meta.url));
const baseline = JSON.parse(await readFile(new URL('../performance-baseline.json', import.meta.url), 'utf8'));
const allowance = 1.1;
const reports = [];
const browserPath = process.env.BOARDSTUDIO_CHROMIUM ?? '/usr/bin/chromium';

if (!cpus()[0]?.model.includes(baseline.hostCpu) || !existsSync(browserPath)) {
  throw new Error('Performance gate requires the baseline host and Chromium executable');
}

const temporary = await mkdtemp(join(tmpdir(), 'boardstudio-perf-'));

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

try {
  for (let index = 0; index < baseline.sessions; index += 1) {
    const reportPath = join(temporary, `session-${index + 1}.json`);
    const run = spawnSync('pnpm', ['exec', 'playwright', 'test', '--config', 'playwright.performance.config.ts', 'e2e/performance.spec.ts', '--workers=1'], {
      cwd: appDir,
      env: {
        ...process.env,
        BOARDSTUDIO_CHROMIUM: browserPath,
        BOARDSTUDIO_PERF_RESULT: reportPath,
        BOARDSTUDIO_PERF_EXPECTED_BROWSER: baseline.browserVersion,
      },
      stdio: 'inherit',
    });

    if (run.error || run.status !== 0) {
      throw run.error ?? new Error(`Performance session ${index + 1} failed`);
    }

    reports.push(JSON.parse(await readFile(reportPath, 'utf8')));
  }

  let failed = false;

  for (const [scenario, reference] of Object.entries(baseline.scenarios)) {
    const worker = median(reports.map((report) => report[scenario].worker.p95));
    const painted = median(reports.map((report) => report[scenario].painted.p95));
    const workerLimit = reference.workerP95 * allowance;
    const paintedLimit = reference.paintedP95 * allowance;
    const passed = worker <= workerLimit && painted <= paintedLimit;

    console.info(`${scenario}: worker ${worker.toFixed(1)} ms <= ${workerLimit.toFixed(1)} ms; painted ${painted.toFixed(1)} ms <= ${paintedLimit.toFixed(1)} ms — ${passed ? 'pass' : 'fail'}`);
    failed ||= !passed;
  }

  const interactions = spawnSync('pnpm', ['exec', 'playwright', 'test', '--config', 'playwright.performance.config.ts', 'e2e/pointer-performance.spec.ts', 'e2e/matrix-performance.spec.ts', 'e2e/outline-performance.spec.ts', '--workers=1'], {
    cwd: appDir,
    env: { ...process.env, BOARDSTUDIO_CHROMIUM: browserPath },
    stdio: 'inherit',
  });
  if (interactions.error) throw interactions.error;
  failed ||= interactions.status !== 0;

  if (failed) {
    process.exitCode = 1;
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
