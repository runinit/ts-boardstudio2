#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = await import('/home/chris/projects/ts-boardstudio2/node_modules/.pnpm/playwright@1.59.1/node_modules/playwright/index.mjs');

function arg(name, fallback = undefined) {
  const i = process.argv.indexOf(name);
  return i < 0 ? fallback : process.argv[i + 1];
}

const htmlPath = path.resolve(arg('--html'));
const outDir = path.resolve(arg('--out-dir'));
const sourceLimit = Number(arg('--source-limit', '5'));
const sourceManifest = arg('--source-manifest');
await fs.mkdir(outDir, { recursive: true });

async function pngDimensions(file) {
  const header = await fs.readFile(file);
  if (header.length < 24 || header.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`Invalid PNG: ${file}`);
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

const browser = await chromium.launch({ headless: true });
const results = { htmlPath, captures: [], viewports: [], images: [], links: [], sourcePages: [] };

async function inspect(page, name, width, height) {
  await page.setViewportSize({ width, height });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    })));
    if (document.fonts?.ready) await document.fonts.ready;
  });
  const metrics = await page.evaluate(() => {
    const root = document.documentElement;
    const headings = [...document.querySelectorAll('h1, h2, h3, h4')].map((node) => ({
      tag: node.tagName,
      text: node.textContent.trim(),
      top: Math.round(node.getBoundingClientRect().top + window.scrollY),
    }));
    const images = [...document.images].map((image) => ({
      src: image.currentSrc || image.src,
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      renderedWidth: Math.round(image.getBoundingClientRect().width),
      renderedHeight: Math.round(image.getBoundingClientRect().height),
    }));
    const links = [...document.links].map((link) => ({
      text: link.textContent.trim().slice(0, 180), href: link.href, title: link.title || null,
    }));
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      documentWidth: root.scrollWidth,
      viewportWidth: root.clientWidth,
      documentHeight: root.scrollHeight,
      horizontalOverflow: root.scrollWidth > root.clientWidth + 1,
      headings, images, links,
    };
  });
  results.viewports.push({ name, ...metrics });
  results.images.push(...metrics.images.map((image) => ({ viewport: name, ...image })));
  results.links = metrics.links;
  const step = Math.max(200, height - 90);
  const count = Math.max(1, Math.ceil(metrics.documentHeight / step));
  const sectionDir = path.join(outDir, name);
  await fs.mkdir(sectionDir, { recursive: true });
  for (let i = 0; i < count; i += 1) {
    const target = Math.min(i * step, Math.max(0, metrics.documentHeight - height));
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), target);
    await page.waitForTimeout(60);
    const actualScrollY = await page.evaluate(() => Math.round(window.scrollY));
    const file = path.join(sectionDir, `section-${String(i + 1).padStart(3, '0')}.png`);
    await page.screenshot({ path: file, fullPage: false });
    const image = await pngDimensions(file);
    results.captures.push({ viewport: name, index: i + 1, scrollY: actualScrollY, path: file, viewportWidth: width, viewportHeight: height, imageWidth: image.width, imageHeight: image.height, width: image.width, height: image.height });
  }
  const fullPath = path.join(outDir, `${name}-full.png`);
  await page.screenshot({ path: fullPath, fullPage: true });
  const image = await pngDimensions(fullPath);
  results.captures.push({ viewport: name, index: 'full', path: fullPath, viewportWidth: width, viewportHeight: height, imageWidth: image.width, imageHeight: image.height, width: image.width, height: image.height });
}

const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await inspect(page, 'desktop', 1440, 1000);
await inspect(page, 'mobile', 390, 844);

const htmlText = await fs.readFile(htmlPath, 'utf8');
const sourcePath = htmlText.match(/<meta name="qa-source" content="([^"]+)">/)?.[1];
const sourceText = sourcePath ? await fs.readFile(sourcePath, 'utf8') : '';
const sourceBase = sourcePath ? pathToFileURL(`${path.dirname(sourcePath)}/`).href : '';
const definitions = Object.fromEntries([...sourceText.matchAll(/^\[(S\d+)\]:\s+(\S+)(?:\s+"([^"]*)")?\s*$/gm)].map((match) => [match[1], {
  href: new URL(match[2], sourceBase).href,
  title: match[3] || null,
}]));
const citationEntries = results.links.filter((link) => /^S\d+$/.test(link.text)).map((link) => {
  const expected = definitions[link.text];
  return {
    id: link.text,
    actual: { href: link.href, title: link.title },
    expected: expected || null,
    matches: Boolean(expected && link.href === expected.href && link.title === expected.title),
  };
});
results.citationAudit = {
  sourcePath,
  definitionCount: Object.keys(definitions).length,
  renderedCount: citationEntries.length,
  mismatches: citationEntries.filter((entry) => !entry.matches),
};

const external = [...new Set(results.links.map((item) => item.href).filter((href) => /^https?:\/\//.test(href)))].slice(0, sourceLimit);
for (let i = 0; i < external.length; i += 1) {
  const url = external[i];
  const sourcePage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const record = { index: i + 1, url, path: path.join(outDir, `source-${String(i + 1).padStart(2, '0')}.png`) };
  try {
    const response = await sourcePage.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sourcePage.waitForTimeout(400);
    await sourcePage.screenshot({ path: record.path, fullPage: true });
    const image = await pngDimensions(record.path);
    record.imageWidth = image.width;
    record.imageHeight = image.height;
    record.status = response?.status() ?? null;
    record.verdict = record.status !== null && record.status < 400 ? 'captured' : 'inaccessible';
  } catch (error) {
    record.verdict = 'inaccessible';
    record.error = String(error).slice(0, 500);
  } finally {
    await sourcePage.close();
  }
  results.sourcePages.push(record);
}
if (sourceManifest) {
  const prior = JSON.parse(await fs.readFile(path.resolve(sourceManifest), 'utf8'));
  results.sourcePages = (prior.sourcePages || []).map((record) => ({
    ...record,
    path: path.join(outDir, path.basename(record.path)),
  }));
}
await browser.close();

results.summary = {
  viewports: results.viewports.map(({ name, documentHeight, documentWidth, viewportWidth, horizontalOverflow, headings }) => ({
    name, documentHeight, documentWidth, viewportWidth, horizontalOverflow, headingCount: headings.length,
  })),
  brokenImages: results.images.filter((image) => !image.complete || image.naturalWidth === 0),
  externalLinks: external.length,
  capturedSources: results.sourcePages.filter((item) => item.verdict === 'captured').length,
  inaccessibleSources: results.sourcePages.filter((item) => item.verdict === 'inaccessible').length,
  citationDefinitionCount: results.citationAudit.definitionCount,
  citationRenderedCount: results.citationAudit.renderedCount,
  citationMismatches: results.citationAudit.mismatches.length,
};
await fs.writeFile(path.join(outDir, 'qa-results.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.summary, null, 2));
