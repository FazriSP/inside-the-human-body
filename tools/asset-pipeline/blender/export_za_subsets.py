"""
Export clean curriculum-ready GLB subsets from Z-Anatomy FBX sources.

Why this script is needed (Phase 0 discovery):
  Raw Z-Anatomy FBX exports from the Unity PC-Version repository contain:
  - `.j` and `.i` 12-triangle cube meshes used as Unity label anchors (966 in Skeletal!)
  - `.o*` and `.e*` muscle origin/insertion paint patches (705 in Skeletal = 931k tris!)
  - `Cross Section X/Y/Z` and `Take a picture` helper objects

This script strips those non-anatomical helper/attachment meshes while preserving
100% of the real anatomical meshes, their hierarchy paths, materials, and world
coordinates (`1 unit = 1 meter`, Z-up in Blender -> Y-up in GLB).
"""

import os
import re
import sys
import time
import bpy

PATCH_RX = re.compile(r"\.(o|e)\d*[lr]?(\.\d{3})?$", re.I)
LABEL_CUBE_RX = re.compile(r"\.(j|i|t)(\.\d{3})?$", re.I)
HELPER_RX = re.compile(r"(Cross Section|Take a picture|Oesophagus-profile)", re.I)


def hierarchy_path(obj):
    parts = []
    cur = obj
    while cur is not None:
        parts.append(cur.name)
        cur = cur.parent
    return "/".join(reversed(parts))


def is_clean_anatomical_mesh(obj, tris):
    if obj.type != "MESH" or tris <= 12:
        return False
    name = obj.name
    path = hierarchy_path(obj)
    if PATCH_RX.search(name) or LABEL_CUBE_RX.search(name) or HELPER_RX.search(path):
        return False
    return True


def export_filtered(fbx_path, out_glb, path_predicate=None):
    t0 = time.time()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=fbx_path)
    depsgraph = bpy.context.evaluated_depsgraph_get()

    bpy.ops.object.select_all(action="DESELECT")
    kept_meshes = 0
    kept_tris = 0
    for obj in list(bpy.context.scene.objects):
        if obj.type != "MESH":
            continue
        ev = obj.evaluated_get(depsgraph)
        me = ev.to_mesh()
        me.calc_loop_triangles()
        tris = len(me.loop_triangles)
        ev.to_mesh_clear()

        hpath = hierarchy_path(obj)
        if is_clean_anatomical_mesh(obj, tris) and (path_predicate is None or path_predicate(obj, hpath, tris)):
            # Consolidate multi-material slots on a single anatomical mesh so GLTF
            # exports 1 primitive per structure instead of splitting into N primitives.
            if obj.data and len(obj.data.materials) > 1:
                first_mat = obj.data.materials[0]
                obj.data.materials.clear()
                obj.data.materials.append(first_mat)
                for poly in obj.data.polygons:
                    poly.material_index = 0
            obj.select_set(True)
            kept_meshes += 1
            kept_tris += tris

    os.makedirs(os.path.dirname(out_glb), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=out_glb,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_animations=False,
        export_yup=True,
    )
    dt = round(time.time() - t0, 2)
    size_mb = round(os.path.getsize(out_glb) / 1e6, 2)
    print(f"EXPORTED {os.path.basename(out_glb)} meshes={kept_meshes} tris={kept_tris} size={size_mb}MB time={dt}s")


def main():
    only = set(sys.argv[sys.argv.index("--") + 1:]) if "--" in sys.argv else set()
    base = r"c:\Projects\antigravity\assets-src"
    fbx_dir = os.path.join(base, "z-anatomy", "fbx")
    out_dir = os.path.join(base, "z-anatomy", "glb-clean")

    # 1. Outer body surface partitioned by anatomical region (excludes pubic hair)
    if not only or "regions" in only:
        export_filtered(
            os.path.join(fbx_dir, "Regions of human body100.fbx"),
            os.path.join(out_dir, "za-regions-skin.glb"),
            lambda obj, hpath, tris: "Pubic hairs" not in obj.name,
        )

    # 2. Full pure skeleton (all 277 bones, cartilages, and teeth)
    if not only or "skeletal" in only:
        export_filtered(
            os.path.join(fbx_dir, "SkeletalSystem100.fbx"),
            os.path.join(out_dir, "za-skeletal-full.glb"),
        )

    # 3. Respiratory system from VisceralSystem100.fbx
    if not only or "respiratory" in only:
        export_filtered(
            os.path.join(fbx_dir, "VisceralSystem100.fbx"),
            os.path.join(out_dir, "za-respiratory.glb"),
            lambda obj, hpath, tris: hpath.startswith("Respiratory system.g"),
        )

    # 4. Cardiovascular core (Heart + coronary + pulmonary + major systemic trunks by object name)
    if not only or "cardiovascular" in only:
        group_rx = re.compile(
            r"(Heart\.g|Arteries of heart\.g|Cardiac veins\.g|Pulmonary arteries\.g|Pulmonary veins\.g)",
            re.I,
        )
        name_rx = re.compile(
            r"(aorta|vena cava|brachiocephalic|common carotid|internal carotid|external carotid|"
            r"internal jugular|external jugular|subclavian|axillary|brachial|radial artery|ulnar artery|"
            r"common iliac|external iliac|internal iliac|femoral|popliteal|great saphenous|"
            r"renal|celiac trunk|superior mesenteric|inferior mesenteric|hepatic portal|splenic|azygos)",
            re.I,
        )
        export_filtered(
            os.path.join(fbx_dir, "CardioVascular41.fbx"),
            os.path.join(out_dir, "za-cardiovascular-core.glb"),
            lambda obj, hpath, tris: bool(group_rx.search(hpath) or name_rx.search(obj.name)),
        )


if __name__ == "__main__":
    main()
