// Automated Phase 0 WebGL loading, BVH, picking & frame-time benchmark.
// Starts Vite in-process and drives Chrome via Playwright (Rule 8 compliant).

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const root = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const outReport = 'c:/Projects/antigravity/assets-src/reports/webgl_bench.json';

const server = await createServer({
  root,
  server: { host: '127.0.0.1', port: 5179 },
  logLevel: 'error',
});
await server.listen();
const baseUrl = 'http://127.0.0.1:5179';

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=d3d11'],
});

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="metrics-ready"]', { timeout: 30000 });

  const manifest = await page.evaluate(async () => {
    const r = await fetch('/models/manifest.json');
    return r.json();
  });

  const results = [];
  for (const entry of manifest) {
    for (const v of ['raw', 'opt', 'lite']) {
      // Run full 2.5s orbit bench on 'opt' and 'lite', and load+parse+BVH on 'raw'
      const runOrbit = v !== 'raw' || entry.id === 'za-skeletal-full' || entry.id === 'hra-heart';
      await page.evaluate(
        ({ id, variant, orbit }) => window.__selectAssetVariant?.(id, variant, orbit),
        { id: entry.id, variant: v, orbit: runOrbit },
      );

      // Wait until window.__spikeMetrics matches (entry.id, v) and bench finishes if requested
      const m = await page.waitForFunction(
        ({ id, variant, orbit }) => {
          const s = window.__spikeMetrics;
          if (!s || s.assetId !== id || s.variant !== variant) return null;
          if (orbit && !s.bench) return null;
          if (!orbit && s.drawCalls === 0) return null;
          return s;
        },
        { id: entry.id, variant: v, orbit: runOrbit },
        { timeout: 45000 },
      );
      const val = await m.jsonValue();
      results.push(val);
      console.log(
        `${val.assetId.padEnd(24)} ${val.variant.padEnd(5)} ${(val.bytes / 1e6).toFixed(2).padStart(6)}MB ` +
        `parse=${String(val.parseMs.toFixed(0)).padStart(4)}ms bvh=${String(val.bvhMs.toFixed(0)).padStart(4)}ms ` +
        `rc=${String(val.raycastMs.toFixed(2)).padStart(5)}ms ` +
        `meshes=${String(val.meshCount).padStart(4)} calls=${String(val.drawCalls).padStart(4)} ` +
        `dups=${String(val.duplicateNameCount).padStart(4)} ` +
        (val.bench ? `fps=${val.bench.avgFps.toFixed(1)} p95=${val.bench.p95FrameMs.toFixed(1)}ms` : ''),
      );
    }
  }

  writeFileSync(outReport, JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));
  console.log(`BENCH_REPORT_WRITTEN ${outReport}`);
} finally {
  await browser.close();
  await server.close();
}
