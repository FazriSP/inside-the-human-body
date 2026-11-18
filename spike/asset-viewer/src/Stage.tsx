import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box3, Color, Mesh, MeshStandardMaterial, Vector3, type Material } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { meshLabel, measureRaycast, type LoadResult } from './loader';

export interface BenchResult {
  frames: number;
  durationMs: number;
  avgFps: number;
  p95FrameMs: number;
  worstFrameMs: number;
  drawCalls: number;
  renderedTriangles: number;
  geometries: number;
  programs: number;
}

export interface GpuInfo {
  renderer: string;
  vendor: string;
  maxTextureSize: number;
}

const HOVER = new Color('#3fd0ff');
const SELECT = new Color('#ff7a59');

interface StageProps {
  result: LoadResult;
  selected: string | null;
  focusRequest: number;
  benchRequest: number;
  onPick: (name: string | null) => void;
  onHover: (name: string | null) => void;
  onBenchDone: (r: BenchResult) => void;
  onGpuInfo: (g: GpuInfo) => void;
  onRendererInfo: (calls: number, tris: number, raycastMs: number) => void;
}

/** Gives every mesh its own material instance so highlight does not leak to shared materials. */
function prepareMaterials(root: LoadResult['scene']) {
  root.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    const src = (Array.isArray(m.material) ? m.material[0] : m.material) as Material & { color?: Color };
    const mat = new MeshStandardMaterial({
      color: src?.color ? src.color.clone() : new Color('#d9c7b8'),
      roughness: 0.55,
      metalness: 0.0,
    });
    m.material = mat;
    m.userData.baseEmissive = new Color('#000000');
  });
}

function setEmissive(root: LoadResult['scene'], name: string | null, color: Color, clearOthers: Color | null) {
  root.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    const mat = m.material as MeshStandardMaterial;
    const isTarget = name !== null && meshLabel(m) === name;
    if (isTarget) mat.emissive.copy(color).multiplyScalar(0.55);
    else if (clearOthers && mat.emissive.equals(clearOthers.clone().multiplyScalar(0.55))) mat.emissive.set(0x000000);
  });
}

export function Stage(props: StageProps) {
  const { result, selected, focusRequest, benchRequest } = props;
  const { camera, gl } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const hovered = useRef<string | null>(null);
  const raycastMsRef = useRef<number>(0);

  // Prepare materials once per loaded scene.
  useMemo(() => prepareMaterials(result.scene), [result.scene]);

  // Report GPU info once.
  useEffect(() => {
    const ctx = gl.getContext();
    const ext = ctx.getExtension('WEBGL_debug_renderer_info');
    props.onGpuInfo({
      renderer: ext ? String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(ctx.getParameter(ctx.RENDERER)),
      vendor: ext ? String(ctx.getParameter(ext.UNMASKED_VENDOR_WEBGL)) : String(ctx.getParameter(ctx.VENDOR)),
      maxTextureSize: Number(ctx.getParameter(ctx.MAX_TEXTURE_SIZE)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl]);

  // Fit camera to the model on load (models keep real-world metre scale).
  useEffect(() => {
    const box = new Box3().setFromObject(result.scene);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3()).length();
    camera.near = size / 1000;
    camera.far = size * 20;
    camera.position.copy(center).add(new Vector3(0, size * 0.1, size * 1.2));
    camera.updateProjectionMatrix();
    controls.current?.target.copy(center);
    controls.current?.update();
    raycastMsRef.current = measureRaycast(result.scene, camera, 40);
  }, [result.scene, camera]);

  // Selection highlight + focus ("fly-to" test).
  useEffect(() => {
    result.scene.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh) (m.material as MeshStandardMaterial).emissive.set(0x000000);
    });
    if (selected) setEmissive(result.scene, selected, SELECT, null);
  }, [selected, result.scene]);

  useEffect(() => {
    if (!selected || focusRequest === 0) return;
    const box = new Box3();
    result.scene.traverse((o) => {
      if ((o as Mesh).isMesh && meshLabel(o) === selected) box.expandByObject(o);
    });
    if (box.isEmpty()) return;
    const c = box.getCenter(new Vector3());
    const d = Math.max(box.getSize(new Vector3()).length(), 0.02);
    const dir = camera.position.clone().sub(controls.current?.target ?? c).normalize();
    camera.position.copy(c).addScaledVector(dir, d * 1.8);
    controls.current?.target.copy(c);
    controls.current?.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequest]);

  // Benchmark: orbit 360 degrees over 6 s and record frame times.
  const bench = useRef<{ start: number; last: number; deltas: number[]; radius: number; y: number } | null>(null);
  useEffect(() => {
    if (benchRequest === 0) return;
    const t = controls.current?.target ?? new Vector3();
    const off = camera.position.clone().sub(t);
    bench.current = { start: performance.now(), last: performance.now(), deltas: [],
      radius: Math.hypot(off.x, off.z), y: off.y };
  }, [benchRequest, camera]);

  const infoTick = useRef(0);
  useFrame(() => {
    const now = performance.now();
    const b = bench.current;
    if (b) {
      b.deltas.push(now - b.last);
      b.last = now;
      const t = (now - b.start) / 2500;
      const target = controls.current?.target ?? new Vector3();
      const a = t * Math.PI * 2;
      camera.position.set(target.x + Math.sin(a) * b.radius, target.y + b.y, target.z + Math.cos(a) * b.radius);
      camera.lookAt(target);
      if (t >= 1) {
        const d = b.deltas.slice(5).sort((x, y) => x - y); // drop warm-up frames
        const sum = d.reduce((s, x) => s + x, 0);
        const info = gl.info;
        props.onBenchDone({
          frames: d.length,
          durationMs: now - b.start,
          avgFps: d.length / (sum / 1000),
          p95FrameMs: d[Math.floor(d.length * 0.95)] ?? 0,
          worstFrameMs: d[d.length - 1] ?? 0,
          drawCalls: info.render.calls,
          renderedTriangles: info.render.triangles,
          geometries: info.memory.geometries,
          programs: info.programs?.length ?? 0,
        });
        bench.current = null;
      }
    }
    if (++infoTick.current % 15 === 0) props.onRendererInfo(gl.info.render.calls, gl.info.render.triangles, raycastMsRef.current);
  });

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const name = meshLabel(e.object);
    if (hovered.current === name) return;
    if (hovered.current && hovered.current !== selected) setEmissive(result.scene, hovered.current, new Color(0), HOVER);
    hovered.current = name;
    if (name !== selected) setEmissive(result.scene, name, HOVER, null);
    props.onHover(name);
  };
  const onOut = () => {
    if (hovered.current && hovered.current !== selected) setEmissive(result.scene, hovered.current, new Color(0), HOVER);
    hovered.current = null;
    props.onHover(null);
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    props.onPick(meshLabel(e.object));
  };

  return (
    <>
      <color attach="background" args={['#070b14']} />
      <hemisphereLight args={['#dfe8ff', '#1b1320', 0.9]} />
      <directionalLight position={[2, 3, 2]} intensity={1.6} />
      <directionalLight position={[-2, 1, -2]} intensity={0.5} color="#8fb4ff" />
      <primitive object={result.scene} onPointerMove={onMove} onPointerOut={onOut} onClick={onClick}
        onPointerMissed={() => props.onPick(null)} />
      <OrbitControls ref={controls} makeDefault enableDamping />
    </>
  );
}
