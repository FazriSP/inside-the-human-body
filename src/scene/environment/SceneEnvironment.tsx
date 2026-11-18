import { useSettingsStore } from '@/stores/settingsStore';

export function SceneEnvironment() {
  const shadowsEnabled = useSettingsStore((s) => s.shadowsEnabled);

  return (
    <>
      <ambientLight intensity={0.55} color="#f8fafc" />
      <hemisphereLight args={['#ffffff', '#0f1f2e', 0.9]} />
      <directionalLight
        position={[2.2, 3.2, 2.4]}
        intensity={1.65}
        color="#ffffff"
        castShadow={shadowsEnabled}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-2.0, 1.6, -1.8]}
        intensity={0.55}
        color="#e2e8f0"
      />

      {/* Anatomical Floor Reference Grid (Z = 0m sole reference in Z-Anatomy metric space) */}
      <gridHelper
        args={[2.4, 24, '#134e4a', '#0c2938']}
        position={[0, 0, 0]}
      />
    </>
  );
}
