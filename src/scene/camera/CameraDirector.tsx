import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { useCameraStore } from '@/stores/cameraStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSceneStore } from '@/stores/sceneStore';

interface LiveJourneyPose {
  active: boolean;
  position: [number, number, number];
  target: [number, number, number];
}

const liveJourneyPose: LiveJourneyPose = {
  active: false,
  position: [0, 1.3, 0.45],
  target: [0, 1.29, 0],
};

export function setLiveJourneyCameraPose(
  active: boolean,
  position?: [number, number, number],
  target?: [number, number, number],
) {
  liveJourneyPose.active = active;
  if (position) liveJourneyPose.position = position;
  if (target) liveJourneyPose.target = target;
}

export function CameraDirector() {
  const controlsRef = useRef<CameraControls | null>(null);
  const userInteractingRef = useRef<boolean>(false);

  const mode = useCameraStore((s) => s.mode);
  const followCamera = useCameraStore((s) => s.journey.followCamera);
  const position = useCameraStore((s) => s.position);
  const target = useCameraStore((s) => s.target);
  const autoRotate = useCameraStore((s) => s.autoRotate);
  const transitionTick = useCameraStore((s) => s.transitionTick);
  const kurangiGerakan = useSettingsStore((s) => s.kurangiGerakan);
  const selectedStructureId = useSceneStore((s) => s.selectedStructureId);

  useEffect(() => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    void ctrl.setLookAt(
      position[0],
      position[1],
      position[2],
      target[0],
      target[1],
      target[2],
      !kurangiGerakan,
    );
  }, [position, target, transitionTick, kurangiGerakan]);

  useFrame((_, delta) => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;

    if (
      mode === 'journey' &&
      followCamera &&
      liveJourneyPose.active &&
      !userInteractingRef.current
    ) {
      const [px, py, pz] = liveJourneyPose.position;
      const [tx, ty, tz] = liveJourneyPose.target;
      void ctrl.setLookAt(px, py, pz, tx, ty, tz, false);
      return;
    }

    if (
      autoRotate &&
      !kurangiGerakan &&
      !selectedStructureId &&
      !userInteractingRef.current
    ) {
      ctrl.azimuthAngle += delta * 0.14;
    }
  });

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={0.14}
      maxDistance={4.2}
      dollySpeed={0.9}
      smoothTime={kurangiGerakan ? 0.01 : 0.34}
      onStart={() => {
        userInteractingRef.current = true;
      }}
      onEnd={() => {
        userInteractingRef.current = false;
      }}
    />
  );
}
