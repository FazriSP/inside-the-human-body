// Phase 0 asset spike: produce optimized GLB variants and measure them.
//
// Usage: node optimize.mjs <jobs.json>
//   jobs.json: [{ "id": "hra-heart", "input": "path/to/in.glb", "label": "...",
//                 "source": "...", "license": "...", "simplifyRatio": 0.5 }]
//
// For every job it writes into <outDir> (default ../../spike/asset-viewer/public/models):
//   <id>.raw.glb        unchanged copy of the input (baseline)
//   <id>.opt.glb        dedup + weld + prune + quantize + meshopt (geometry kept)
//   <id>.lite.glb       as .opt but with meshoptimizer simplification (lossy)
// and a manifest.json with byte sizes (raw and gzip), triangles and mesh counts.
// Nothing is renamed; node names are preserved so picking can be tested.

import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, prune, quantize, simplify, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';

const [, , jobsFile, outArg] = process.argv;
const jobs = JSON.parse(readFileSync(jobsFile, 'utf8'));
const outDir = path.resolve(outArg ?? new URL('../../spike/asset-viewer/public/models', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
mkdirSync(outDir, { recursive: true });

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
await MeshoptSimplifier.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

function stats(doc) {
  let tris = 0, meshes = 0, prims = 0;
  const names = [];
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    meshes++;
    names.push(node.getName());
    for (const p of mesh.listPrimitives()) {
      prims++;
      const idx = p.getIndices();
      const pos = p.getAttribute('POSITION');
      tris += idx ? idx.getCount() / 3 : (pos ? pos.getCount() / 3 : 0);
    }
  }
  return { tris: Math.round(tris), meshNodes: meshes, primitives: prims,
           materials: doc.getRoot().listMaterials().length, uniqueNames: new Set(names).size };
}

function sizes(file) {
  const buf = readFileSync(file);
  return { bytes: statSync(file).size, gzipBytes: gzipSync(buf, { level: 9 }).length };
}

const manifest = [];
for (const job of jobs) {
  const t0 = Date.now();
  const rawOut = path.join(outDir, `${job.id}.raw.glb`);
  copyFileSync(job.input, rawOut);
  const rawDoc = await io.read(job.input);
  const variants = [{ variant: 'raw', file: path.basename(rawOut), ...sizes(rawOut), ...stats(rawDoc) }];

  // .opt: lossless-ish structural cleanup + quantization + meshopt compression
  const optDoc = await io.read(job.input);
  await optDoc.transform(dedup(), weld(), prune(), quantize(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  const optOut = path.join(outDir, `${job.id}.opt.glb`);
  await io.write(optOut, optDoc);
  variants.push({ variant: 'opt', file: path.basename(optOut), ...sizes(optOut), ...stats(optDoc) });

  // .lite: lossy simplification for the low-quality tier
  const liteDoc = await io.read(job.input);
  await liteDoc.transform(
    dedup(), weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: job.simplifyRatio ?? 0.5, error: job.simplifyError ?? 0.001 }),
    prune(), quantize(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );
  const liteOut = path.join(outDir, `${job.id}.lite.glb`);
  await io.write(liteOut, liteDoc);
  variants.push({ variant: 'lite', file: path.basename(liteOut), ...sizes(liteOut), ...stats(liteDoc) });

  manifest.push({ id: job.id, label: job.label, source: job.source, license: job.license,
                  accuracy: job.accuracy ?? 'anatomis', variants });
  console.log(`${job.id}: done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  for (const v of variants) {
    console.log(`   ${v.variant.padEnd(5)} ${(v.bytes / 1e6).toFixed(2).padStart(7)} MB  gzip ${(v.gzipBytes / 1e6).toFixed(2).padStart(7)} MB  tris ${String(v.tris).padStart(9)}  meshes ${v.meshNodes}  prims ${v.primitives}  mats ${v.materials}`);
  }
}

// Merge with an existing manifest so jobs can be run incrementally.
const manifestPath = path.join(outDir, 'manifest.json');
let existing = [];
try { existing = JSON.parse(readFileSync(manifestPath, 'utf8')); } catch { /* first run */ }
const byId = new Map(existing.map((m) => [m.id, m]));
for (const m of manifest) byId.set(m.id, m);
writeFileSync(manifestPath, JSON.stringify([...byId.values()], null, 2));
console.log(`manifest: ${manifestPath}`);
