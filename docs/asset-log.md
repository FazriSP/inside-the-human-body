# Phase 0 Asset Spike Log — INSIDE THE HUMAN BODY

**Status:** Completed (Phase 0 Validation)  
**Target Audience:** Siswa SMA/SMK Indonesia (Kurikulum Merdeka Biologi Fase F)  
**MVP Systems Covered:** Sistem Rangka, Sistem Peredaran Darah, Sistem Pernapasan (+ Wilayah Tubuh)

---

## 1. Verified Open Asset Sources & Licenses

All candidate assets were downloaded directly from their official upstream repositories/CDNs and inspected for license compliance in a non-commercial, open educational project:

| Dataset | Official Upstream Source | Verified License | Attribution & Redistribution Requirements |
|---|---|---|---|
| **Z-Anatomy (PC-Version FBX Atlas)** | `https://github.com/LluisV/Z-Anatomy` (`PC-Version` branch, `Resources/Models/FBX/`) | **CC BY-SA 4.0 International** (built on **BodyParts3D**, **CC BY-SA 2.1 Japan**) | Requires credit to both *BodyParts3D (The Database Center for Life Science, CC BY-SA 2.1 JP)* and *Z-Anatomy (Gauthier Kervyn & Lluís Vinent Juanico, CC BY-SA 4.0)*. Derived 3D models (`public/models/za-*.glb`) must be distributed under **CC BY-SA 4.0**. |
| **HuBMAP Human Reference Atlas (HRA)** | `https://cdn.humanatlas.io/digital-objects/ref-organ/` & `https://apps.humanatlas.io/api/v1/reference-organs` | **CC BY 4.0 International** (confirmed in `heart-male-v1.3.purl.txt`: `"license": "https://creativecommons.org/licenses/by/4.0/"`, `"publisher": "HuBMAP"`) | Requires attribution to the *HuBMAP Consortium / Human Reference Atlas (Indiana University CNS, NIH Visible Human Male dataset)*. No ShareAlike restriction. |

---

## 2. Downloaded Source Inventory (`assets-src/`)

### 2.1 Z-Anatomy FBX Sources (`assets-src/z-anatomy/fbx/`)

| File | Size (Bytes) | Raw Meshes | Raw Triangles | World BBox (`min` → `max`, meters) | Notes |
|---|---:|---:|---:|---|---|
| `SkeletalSystem100.fbx` | 41,339,660 | 1,952 | 1,649,113 | `[-0.421, -0.220, -0.089]` → `[0.401, 0.220, 1.790]` | Contains 277 actual bones/cartilages/teeth (701,999 tris) + 705 muscle origin/insertion patches (931,484 tris) + 966 `.j`/`.i` label cubes (11,372 tris) + 4 helpers. |
| `CardioVascular41.fbx` | 64,889,388 | 717 | 1,575,424 | `[-0.401, -0.220, -0.089]` → `[0.401, 0.220, 1.790]` | Contains `Arterial system.g` (473 meshes, including `Heart.g` with 37 meshes) and `Venous system.g` (241 meshes), plus 41 `.j`/helper objects. |
| `VisceralSystem100.fbx` | 18,401,708 | 301 | 706,935 | `[-0.401, -0.220, -0.089]` → `[0.401, 0.220, 1.790]` | Packs 5 visceral systems into one file (`Digestive`, `Respiratory`, `Endocrine`, `Urinary`, `Genital`). `Respiratory system.g` has 36 real organ meshes (143,028 tris) + 46 `.j` cubes. |
| `Regions of human body100.fbx` | 4,433,260 | 301 | 136,132 | `[-0.415, -0.239, -0.089]` → `[0.401, 0.220, 1.790]` | Outer body surface already partitioned into anatomical regions (`head`, `neck`, `thorax`, `abdomen`, `back`, `upper limb`, `lower limb`, `perineum`). |
| `References100.fbx` | 316,844 | 54 | 7,958 | `[-0.401, -0.342, -0.089]` → `[0.401, 0.342, 1.790]` | Anatomical planes (sagittal, coronal, transverse) and directional reference lines. |

### 2.2 HuBMAP HRA GLB Sources (`assets-src/hubmap-hra/glb/`)

| File | Version | Size (Bytes) | Meshes | Triangles | World BBox (`min` → `max`, meters) | Notes |
|---|---|---:|---:|---:|---|---|
| `3d-vh-m-heart.glb` | v1.3 | 4,071,772 | 14 | 164,107 | `[-0.043, -0.090, 0.423]` → `[0.081, 0.015, 0.529]` | 4 chambers + interventricular septum + 4 valves + 5 papillary muscles. Clean `VH_M_*` naming. |
| `3d-vh-m-lung.glb` | v1.4 | 10,942,332 | 58 | 224,762 | `[-0.125, -0.098, 0.386]` → `[0.134, 0.092, 0.615]` | 27 lung lobe/bronchopulmonary segment meshes + 31 tracheobronchial tree & bronchial cartilage meshes. |
| `3d-vh-m-trachea.glb` | v1.1 | 1,184,848 | 3 | 44,042 | `[-0.019, -0.054, 0.534]` → `[0.013, 0.013, 0.660]` | `VH_M_trachea`, `VH_M_tracheal_cartilage`, `VH_M_carina`. |
| `3d-vh-m-larynx.glb` | v1.1 | 335,576 | 7 | 13,238 | `[-0.028, -0.060, 0.628]` → `[0.025, -0.022, 0.700]` | Thyroid, cricoid, epiglottic, paired arytenoid & corniculate cartilages. |
| `3d-vh-m-blood-vasculature.glb` | v1.3 | 18,050,040 | 106 | 416,532 | `[-0.112, -0.097, -0.043]` → `[0.124, 0.091, 0.829]` | Covers major vessels + organ vasculature for 7 organs only (not full-body extremities). |
| `3d-vh-m-skin.glb` | v1.4 | 19,901,928 | 1 | 829,184 | `[-0.525, -0.158, -0.913]` → `[0.519, 0.168, 0.911]` | Single monolithic 829k-triangle mesh; includes external male genitalia (not suitable unedited for SMA/SMK default view). |

---

## 3. Key Technical Findings: Mesh Naming, Separation & Coordinate Alignment

### Finding 1 — Non-Anatomical Clutter in Raw Z-Anatomy FBX Files
Inspecting `SkeletalSystem100.fbx` in Blender (`tools/asset-pipeline/blender/inspect_and_export.py`) revealed why the raw file has **1,952 meshes** and **1.65M triangles**:
- **705 meshes (931,484 triangles — 56.5% of all triangles)** are muscle origin/insertion surface patches named with `.o*` / `.e*` suffixes (e.g., `Subscapularis muscle.or`, `Pectoralis minor muscle.e2r`).
- **966 meshes (11,372 triangles)** are 12-triangle Unity label-anchor cubes named with `.j` or `.i` suffixes (e.g., `Axial skeleton.j`, `Petrous part of temporal bone.i`).
- **4 objects** are cross-section planes and camera helpers (`Cross Section X/Y/Z.001`, `Take a picture`).
- **Filtering out `.o*`, `.e*`, `.j`, `.i`, and `tris <= 12`** leaves **277 pure bone, cartilage, and tooth meshes (701,999 triangles)** — cutting mesh count by **85.8%** and triangle count by **57.4%** while preserving every bone in the human body.

### Finding 2 — Multi-Material Primitive Splitting in GLTF/Three.js
In raw Z-Anatomy meshes, individual bones and body regions carry multiple Blender material slots. On GLB export, Blender splits each material slot into a separate GLTF `Primitive`, causing Three.js `GLTFLoader` to instantiate a `Group` with multiple child `Mesh` objects (`Fifth rib.r_1`, `Fifth rib.r_2`, ...):
- Without material-slot consolidation: `za-skeletal-full` spawned **575 Three.js meshes/draw calls** (with **434 duplicate names**), and `za-regions-skin` spawned **695 meshes/draw calls** (with **622 duplicate names**).
- After consolidating each structure to a single material slot in `tools/asset-pipeline/blender/export_za_subsets.py`: every structure exports as **1 Mesh = 1 Primitive = 1 Draw Call** (`277` in `za-skeletal-full`, `255` in `za-regions-skin`, `36` in `za-respiratory`, `189` in `za-cardiovascular-core`), with **0 empty names and 0 duplicate names**.

### Finding 3 — Coordinate System Alignment Between Z-Anatomy and HuBMAP HRA
- Both datasets use **real-world meter scale (`1 unit = 1 m`)** and have nearly identical organ dimensions (Heart: `0.119 × 0.113 × 0.108 m` in Z-Anatomy vs `0.124 × 0.105 × 0.105 m` in HuBMAP HRA).
- All Z-Anatomy FBX files share an identical world origin (`Z = 0` at the soles of the feet, `Z = 1.706 m` at the skull vertex, heart centered at `Z ≈ 1.29 m`).
- All HuBMAP HRA Male GLBs share a pelvis-centered origin (`Z = -0.913 m` to `+0.911 m`, heart centered at `Z ≈ 0.48 m`, i.e., `ΔZ ≈ -0.814 m` relative to Z-Anatomy) and come from a different donor scan (Visible Human Male vs BodyParts3D).
- **Architectural Rule:** Use **Z-Anatomy** (`za-regions-skin`, `za-skeletal-full`, `za-cardiovascular-core`, `za-respiratory`) for **multi-system whole-body and regional exploration** so all layers register with zero spatial mismatch, and use **HuBMAP HRA** (`hra-heart`, `hra-lung`, `hra-trachea`, `hra-larynx`) for **isolated Detail Organ mode** (`/organ/:id`) where camera-fitted inspection of internal chambers, valves, and bronchopulmonary segments shines.

---

## 4. Optimization & WebGL Performance Benchmark (`webgl_bench.json`)

Each candidate GLB was processed with `tools/asset-pipeline/optimize.mjs` (`@gltf-transform` `dedup + weld + prune + quantize + meshopt` for `.opt.glb`, plus `MeshoptSimplifier` for `.lite.glb`) and benchmarked in `spike/asset-viewer` via Playwright + Chrome WebGL2 (`ANGLE D3D11`, 1280×800):

| Asset ID | Variant | File Size (MB) | Gzip Size (MB) | Meshes / Draw Calls | Triangles | Parse Time (ms) | BVH Build (ms) | Raycast Avg (ms) | Orbit FPS (Avg / P95 ms) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| **`za-skeletal-full`** | `raw` | 9.53 | 7.05 | 277 | 701,999 | 17 | 200 | 0.10 | 144.2 FPS (7.3 ms) |
| *(277 Bones & Cartilages)* | **`opt`** | **3.14** | **2.51** | **277** | **701,999** | **15** | **265** | **0.15** | **144.0 FPS (7.6 ms)** |
| | **`lite`** | **1.94** | **1.53** | **277** | **383,553** | **9** | **146** | **0.11** | **144.0 FPS (7.4 ms)** |
| **`za-cardiovascular-core`** | `raw` | 7.95 | 6.32 | 189 | 344,462 | 10 | 89 | 0.11 | — |
| *(Heart & Major Vessels)* | **`opt`** | **2.36** | **1.86** | **189** | **344,462** | **11** | **135** | **0.06** | **144.5 FPS (7.3 ms)** |
| | **`lite`** | **1.34** | **1.02** | **189** | **168,379** | **9** | **66** | **0.13** | **144.2 FPS (7.4 ms)** |
| **`za-respiratory`** | `raw` | 3.12 | 2.32 | 36 | 143,028 | 4 | 36 | 0.02 | — |
| *(Nose, Larynx, Trachea, Lungs)* | **`opt`** | **0.92** | **0.65** | **36** | **143,028** | **3** | **52** | **0.02** | **144.0 FPS (7.3 ms)** |
| | **`lite`** | **0.50** | **0.40** | **36** | **64,462** | **3** | **24** | **0.07** | **144.0 FPS (7.3 ms)** |
| **`za-regions-skin`** | `raw` | 3.55 | 1.65 | 255 | 133,713 | 11 | 37 | 0.09 | — |
| *(Body Regions Surface)* | **`opt`** | **0.81** | **0.56** | **255** | **133,713** | **9** | **51** | **0.17** | **144.1 FPS (7.3 ms)** |
| | **`lite`** | **0.64** | **0.42** | **255** | **90,966** | **10** | **37** | **0.10** | **144.0 FPS (7.2 ms)** |
| **`hra-heart`** | `raw` | 4.07 | 2.56 | 14 | 164,119 | 5 | 51 | 0.03 | 144.0 FPS (7.3 ms) |
| *(Detail Organ: Jantung)* | **`opt`** | **1.04** | **0.80** | **14** | **164,119** | **4** | **65** | **0.05** | **144.1 FPS (7.3 ms)** |
| | **`lite`** | **0.52** | **0.42** | **14** | **75,281** | **3** | **31** | **0.02** | **144.0 FPS (7.3 ms)** |
| **`hra-lung`** | `raw` | 10.94 | 5.08 | 58 | 224,765 | 10 | 69 | 0.04 | — |
| *(Detail Organ: Paru-paru)* | **`opt`** | **2.76** | **2.16** | **58** | **224,765** | **10** | **105** | **0.07** | **144.0 FPS (7.3 ms)** |
| | **`lite`** | **2.23** | **1.74** | **58** | **140,628** | **9** | **65** | **0.03** | **144.0 FPS (7.3 ms)** |
| **`hra-trachea`** | `raw` | 1.18 | 0.97 | 3 | 44,042 | 2 | 12 | 0.01 | — |
| *(Detail Organ: Trakea)* | **`opt`** | **0.29** | **0.23** | **3** | **44,042** | **1** | **17** | **0.01** | **144.0 FPS (7.3 ms)** |
| | **`lite`** | **0.14** | **0.12** | **3** | **20,103** | **1** | **9** | **0.01** | **144.0 FPS (7.3 ms)** |
| **`hra-larynx`** | `raw` | 0.34 | 0.24 | 7 | 13,238 | 1 | 4 | 0.01 | — |
| *(Detail Organ: Laring)* | **`opt`** | **0.10** | **0.08** | **7** | **13,238** | **1** | **6** | **0.01** | **144.1 FPS (7.3 ms)** |
| | **`lite`** | **0.07** | **0.06** | **7** | **8,228** | **1** | **4** | **0.01** | **144.0 FPS (7.3 ms)** |

### Combined Whole-Body Budget (All 3 MVP Systems + Body Regions Simultaneously)
- **`opt` tier (Desktop / Lab PC / Mid-High Mobile):**
  - Total download across all 4 chunks (`za-regions-skin` + `za-skeletal-full` + `za-cardiovascular-core` + `za-respiratory`): **7.23 MB raw / 5.58 MB gzip** (down from **128.9 MB** of source FBX files — a **94.4% size reduction**).
  - Total triangles when all 4 layers are visible simultaneously: **1,323,202 triangles** across **757 draw calls**.
- **`lite` tier (Low-End Android):**
  - Total download across all 4 chunks: **4.42 MB raw / 3.37 MB gzip** (initial first-paint chunk can be just `za-regions-skin.lite.glb` at **0.42 MB gzip** or `za-skeletal-full.lite.glb` at **1.53 MB gzip**!).
  - Total triangles when all 4 layers are visible simultaneously: **707,360 triangles** (or **~160k–380k triangles** when viewing 1–2 active systems at a time).

---

## 5. Remaining Risks & Mitigations Entering Phase 1

1. **Draw-Call Overhead on Low-End Android (`757` draw calls if all 4 whole-body layers are visible simultaneously):**
   - *Mitigation:* Only load/display active layers by default, and for non-selected background layers (e.g., translucent skeletal context while inspecting the heart), batch or merge static meshes per system while keeping BVH raycast picking via triangle-range-to-structure lookup or lazy per-structure activation.
2. **English / TA2 Mesh Node Names in Z-Anatomy vs `VH_M_*` Names in HuBMAP HRA:**
   - *Mitigation:* Keep the canonical mesh node names inside the GLBs (`Fifth rib.r`, `Right atrium`, `VH_M_right_cardiac_atrium`) and map them via our Zod-validated TypeScript anatomy registry (`src/content/anatomy/`) to Indonesian names (`Tulang Rusuk Kelima Kanan`, `Serambi Kanan`), Latin names (`Costa V dextra`, `Atrium cordis dextrum`), system IDs, and region IDs.
3. **No Pre-Existing Organ Animations or Micro-Scale Cellular Meshes in Open Datasets:**
   - *Mitigation:* Use shader displacement / procedural motion for biological process simulations (heartbeat, lung expansion, blood flow particles) and procedural/authored stylized meshes for micro-scale scenes (alveolus gas exchange, red blood cells), explicitly badged in the UI as **"Ilustrasi Skematis"** vs **"Model Anatomis Terukur"**.
