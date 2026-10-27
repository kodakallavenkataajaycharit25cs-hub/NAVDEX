import { PLACES_BY_ID } from '../data/campusPlaces';
import { pushPointOutsideBuildings } from '../navigation/campusGraph';
import { PetDistanceRingBuffer, PetMotionState } from '../world/petMotion';

export type LoginCharacterPose = 'tablet' | 'cover' | 'peek';

/**
 * Mutable 60fps Frame Ref (`worldMotionRef.ts`)
 * Read and written directly inside React Three Fiber `useFrame` callbacks
 * so 60Hz character/pet/camera motion and 3D login gestures trigger ZERO React re-renders.
 */
export interface WorldMotionState {
  charX: number;
  charZ: number;
  charHeading: number;
  charSpeedMps: number;
  walkDistAlongRoute: number;
  petX: number;
  petZ: number;
  petHeading: number;
  petState: PetMotionState;
  cameraTargetX: number;
  cameraTargetZ: number;
  ringBuffer: PetDistanceRingBuffer;
  loginPose: LoginCharacterPose;
  loginLookOffset: number;
}

const initialGatePlaza = pushPointOutsideBuildings(
  PLACES_BY_ID['GATE']?.entranceVisualPos ?? { x: 67.4, z: -116.6 },
  2.2
);

const ringBuffer = new PetDistanceRingBuffer(64, 0.25);
ringBuffer.reset(initialGatePlaza, 0);

export const worldMotionRef: WorldMotionState = {
  charX: initialGatePlaza.x,
  charZ: initialGatePlaza.z,
  charHeading: 0,
  charSpeedMps: 0,
  walkDistAlongRoute: 0,
  petX: initialGatePlaza.x + 2.8,
  petZ: initialGatePlaza.z + 0.6,
  petHeading: 0,
  petState: 'idle',
  cameraTargetX: initialGatePlaza.x,
  cameraTargetZ: initialGatePlaza.z,
  ringBuffer,
  loginPose: 'tablet',
  loginLookOffset: 0,
};

export function teleportCharacterInRef(x: number, z: number, heading = 0): void {
  const safe = pushPointOutsideBuildings({ x, z }, 2.2);
  worldMotionRef.charX = safe.x;
  worldMotionRef.charZ = safe.z;
  worldMotionRef.charHeading = heading;
  worldMotionRef.charSpeedMps = 0;
  worldMotionRef.walkDistAlongRoute = 0;
  const safePet = pushPointOutsideBuildings({ x: safe.x + 2.8, z: safe.z + 0.6 }, 1.8);
  worldMotionRef.petX = safePet.x;
  worldMotionRef.petZ = safePet.z;
  worldMotionRef.petHeading = heading;
  worldMotionRef.petState = 'idle';
  worldMotionRef.cameraTargetX = safe.x;
  worldMotionRef.cameraTargetZ = safe.z;
  worldMotionRef.ringBuffer.reset({ x: safe.x, z: safe.z }, heading);
}
