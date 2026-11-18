// Types for public/models/manifest.json (written by tools/asset-pipeline/optimize.mjs)

export type Variant = 'raw' | 'opt' | 'lite';

export interface VariantInfo {
  variant: Variant;
  file: string;
  bytes: number;
  gzipBytes: number;
  tris: number;
  meshNodes: number;
  primitives: number;
  materials: number;
  uniqueNames: number;
}

export interface ManifestEntry {
  id: string;
  label: string;
  source: string;
  license: string;
  /** 'anatomis' = derived from anatomical data; 'skematis' = schematic illustration */
  accuracy: 'anatomis' | 'skematis';
  variants: VariantInfo[];
}

export async function loadManifest(): Promise<ManifestEntry[]> {
  const r = await fetch('/models/manifest.json', { cache: 'no-store' });
  if (!r.ok) throw new Error(`manifest.json tidak ditemukan (${r.status})`);
  return r.json();
}
