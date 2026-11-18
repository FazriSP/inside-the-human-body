// Summarize a report JSON written by blender/inspect_and_export.py
// Usage: node summarize-report.mjs <report.json> [--names] [--group <prefix>]
import { readFileSync } from 'node:fs';

const [, , file, ...rest] = process.argv;
const r = JSON.parse(readFileSync(file, 'utf8'));
const showNames = rest.includes('--names');
const gi = rest.indexOf('--group');
const group = gi >= 0 ? rest[gi + 1] : null;

const fmt = (n) => n.toLocaleString('en-US');
console.log(`input:          ${r.input}`);
console.log(`import seconds: ${r.import_seconds}`);
console.log(`meshes:         ${fmt(r.mesh_count)}  (unique names ${fmt(r.naming.unique_names)})`);
console.log(`triangles:      ${fmt(r.total_tris)}   verts: ${fmt(r.total_verts)}`);
console.log(`non-mesh objs:  ${JSON.stringify(r.non_mesh_objects)}`);
console.log(`bbox:           ${JSON.stringify(r.scene_bbox_min)} -> ${JSON.stringify(r.scene_bbox_max)}`);
console.log(`naming:         ${JSON.stringify(r.naming)}`);
console.log(`top groups:     ${JSON.stringify(r.top_level_groups)}`);
console.log(`2nd groups:     ${JSON.stringify(r.second_level_groups)}`);
console.log(`heaviest:       ${r.heaviest_meshes.slice(0, 10).map((m) => `${m.name}(${fmt(m.tris)})`).join(', ')}`);
if (r.export) console.log(`export:         ${JSON.stringify(r.export)}`);
const mats = new Set(r.meshes.flatMap((m) => m.materials));
console.log(`materials:      ${mats.size} unique`);
if (showNames) {
  const list = group ? r.meshes.filter((m) => m.path.includes(group)) : r.meshes;
  for (const m of list) console.log(`  ${String(m.tris).padStart(8)}  ${m.path}`);
}
