"""
Phase 0 asset spike: inspect a source anatomy file in Blender and export GLB.

Usage (headless):
  blender --background --factory-startup --python inspect_and_export.py -- \
      --input <file.fbx|file.glb> --report <report.json> [--export <out.glb>] \
      [--filter <regex applied to object name>]

What it does:
  1. Imports an FBX or GLB/GLTF file into an empty scene.
  2. Records per-mesh statistics (name, hierarchy path, vertex/triangle count,
     bounding box, materials) plus naming-convention diagnostics.
  3. Optionally exports the (optionally filtered) meshes to GLB without
     altering geometry, so loading cost can be measured in the browser.

It does NOT rename, decimate or merge anything; it is a measurement tool.
"""

import argparse
import json
import re
import sys
import time
from collections import Counter

import bpy
from mathutils import Vector


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True)
    p.add_argument("--report", required=True)
    p.add_argument("--export", default=None)
    p.add_argument("--filter", default=None,
                   help="Regex; only matching mesh objects are exported")
    return p.parse_args(argv)


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_file(path):
    t0 = time.time()
    lower = path.lower()
    if lower.endswith(".fbx"):
        bpy.ops.import_scene.fbx(filepath=path)
    elif lower.endswith(".glb") or lower.endswith(".gltf"):
        bpy.ops.import_scene.gltf(filepath=path)
    else:
        raise ValueError("Unsupported input: " + path)
    return time.time() - t0


def hierarchy_path(obj):
    parts = []
    cur = obj
    while cur is not None:
        parts.append(cur.name)
        cur = cur.parent
    return "/".join(reversed(parts))


def world_bbox(obj):
    corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    mn = [min(c[i] for c in corners) for i in range(3)]
    mx = [max(c[i] for c in corners) for i in range(3)]
    return mn, mx


SUFFIX_DUP = re.compile(r"\.\d{3}$")          # Blender duplicate suffix .001
SIDE = re.compile(r"(\.l|\.r|_l|_r| left| right|\(l\)|\(r\))$", re.I)
NON_ASCII = re.compile(r"[^\x00-\x7f]")


def main():
    args = parse_args()
    clear_scene()
    import_seconds = import_file(args.input)

    depsgraph = bpy.context.evaluated_depsgraph_get()
    meshes = []
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        ev = obj.evaluated_get(depsgraph)
        me = ev.to_mesh()
        me.calc_loop_triangles()
        tris = len(me.loop_triangles)
        verts = len(me.vertices)
        ev.to_mesh_clear()
        mn, mx = world_bbox(obj)
        meshes.append({
            "name": obj.name,
            "path": hierarchy_path(obj),
            "parent": obj.parent.name if obj.parent else None,
            "verts": verts,
            "tris": tris,
            "materials": [s.material.name for s in obj.material_slots if s.material],
            "bbox_min": [round(v, 4) for v in mn],
            "bbox_max": [round(v, 4) for v in mx],
            "dup_suffix": bool(SUFFIX_DUP.search(obj.name)),
            "has_side": bool(SIDE.search(SUFFIX_DUP.sub("", obj.name))),
            "non_ascii": bool(NON_ASCII.search(obj.name)),
            "modifiers": [m.type for m in obj.modifiers],
            "shared_mesh_users": obj.data.users,
        })

    others = Counter(o.type for o in bpy.context.scene.objects if o.type != "MESH")
    top_parents = Counter((m["path"].split("/")[0]) for m in meshes)
    second_level = Counter(
        "/".join(m["path"].split("/")[:2]) for m in meshes if m["path"].count("/") >= 1
    )
    total_tris = sum(m["tris"] for m in meshes)
    all_min = [min(m["bbox_min"][i] for m in meshes) for i in range(3)] if meshes else None
    all_max = [max(m["bbox_max"][i] for m in meshes) for i in range(3)] if meshes else None

    exported = None
    if args.export:
        bpy.ops.object.select_all(action="DESELECT")
        rx = re.compile(args.filter, re.I) if args.filter else None
        selected = 0
        for obj in bpy.context.scene.objects:
            if obj.type == "MESH" and (rx is None or rx.search(hierarchy_path(obj))):
                obj.select_set(True)
                selected += 1
        t0 = time.time()
        bpy.ops.export_scene.gltf(
            filepath=args.export,
            export_format="GLB",
            use_selection=args.filter is not None,
            export_apply=True,
            export_animations=False,
            export_extras=True,
        )
        exported = {"file": args.export, "selected_meshes": selected,
                    "seconds": round(time.time() - t0, 2)}

    report = {
        "input": args.input,
        "import_seconds": round(import_seconds, 2),
        "mesh_count": len(meshes),
        "total_tris": total_tris,
        "total_verts": sum(m["verts"] for m in meshes),
        "non_mesh_objects": dict(others),
        "scene_bbox_min": all_min,
        "scene_bbox_max": all_max,
        "naming": {
            "dup_suffix_count": sum(m["dup_suffix"] for m in meshes),
            "side_tag_count": sum(m["has_side"] for m in meshes),
            "non_ascii_count": sum(m["non_ascii"] for m in meshes),
            "unique_names": len(set(m["name"] for m in meshes)),
        },
        "top_level_groups": dict(top_parents.most_common(40)),
        "second_level_groups": dict(second_level.most_common(80)),
        "heaviest_meshes": sorted(
            ({"name": m["name"], "tris": m["tris"]} for m in meshes),
            key=lambda x: -x["tris"])[:25],
        "export": exported,
        "meshes": meshes,
    }
    with open(args.report, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=1)
    print("REPORT_WRITTEN", args.report, "meshes=", len(meshes), "tris=", total_tris)


if __name__ == "__main__":
    main()
