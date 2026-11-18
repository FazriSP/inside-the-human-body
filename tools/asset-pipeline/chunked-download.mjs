// Robust chunked downloader for flaky connections (HTTP Range requests).
// Usage: node chunked-download.mjs <url> <outFile> [chunkMB=4]
import { createWriteStream, existsSync, statSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const [, , url, out, chunkArg] = process.argv;
const CHUNK = (Number(chunkArg) || 4) * 1024 * 1024;

async function totalSize() {
  const r = await fetch(url, { headers: { Range: 'bytes=0-0' }, redirect: 'follow' });
  const cr = r.headers.get('content-range'); // bytes 0-0/12345
  await r.arrayBuffer();
  if (!cr) throw new Error('Server did not return Content-Range');
  return Number(cr.split('/')[1]);
}

const size = await totalSize();
let offset = existsSync(out) ? statSync(out).size : 0;
console.log(`total=${size} resume_from=${offset}`);
const ws = createWriteStream(out, { flags: 'a' });

while (offset < size) {
  const end = Math.min(offset + CHUNK, size) - 1;
  let ok = false;
  for (let attempt = 1; attempt <= 8 && !ok; attempt++) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 120_000);
      const r = await fetch(url, { headers: { Range: `bytes=${offset}-${end}` }, signal: ctrl.signal });
      const buf = Buffer.from(await r.arrayBuffer());
      clearTimeout(timer);
      if (r.status !== 206 || buf.length !== end - offset + 1) throw new Error(`status ${r.status} len ${buf.length}`);
      await new Promise((res, rej) => ws.write(buf, (e) => (e ? rej(e) : res())));
      ok = true;
    } catch (e) {
      console.log(`chunk ${offset}-${end} attempt ${attempt} failed: ${e.message}`);
      await sleep(2000 * attempt);
    }
  }
  if (!ok) { ws.end(); console.log('FAILED'); process.exit(1); }
  offset = end + 1;
  console.log(`progress ${((offset / size) * 100).toFixed(1)}%`);
}
ws.end();
console.log(`DONE ${out} ${size}`);
