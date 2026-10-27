import { Html, MapControls, PerformanceMonitor, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { animate } from 'animejs';
import { Sparkles } from 'lucide-react';
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CAMPUS_PLACES, CampusPlace, PLACES_BY_ID } from '../data/campusPlaces';
import {
  DEFAULT_CAMPUS_GRAPH,
  detourSegmentAroundBuildings,
  findNearestPlaceId,
} from '../navigation/campusGraph';
import { distanceXZ } from '../navigation/projection';
import { useCampusStore } from '../store/useCampusStore';
import { worldMotionRef } from '../store/worldMotionRef';
import { BrunoSimonScenicElements } from './BrunoSimonScenicElements';
import { ClayCharacter } from './ClayCharacter';
import { ClayPet } from './ClayPet';
import { HeroLandmarkProp } from './HeroLandmarkProp';
import { InstancedPawTrail } from './InstancedPawTrail';
import { InstancedTrees } from './InstancedTrees';
import { LeafParticlesAndTrails } from './LeafParticlesAndTrails';
import { getTerrainElevation } from './terrainElevation';

/**
 * 3D Pedestal Stage for "CHOOSE YOUR STYLE" (`onboarding-avatar` & `onboarding-pet`):
 * Crisp WalkWin / Nintendo-inspired sunny daytime podium:
 * - Sleek circular white podium stage with beveled satin finish and warm drop shadow
 * - Vibrant WalkWin orange (#FF5B00) and golden amber concentric accent rings
 * - Open sunny daytime sky without any dark cyclorama wall
 */
const ChooseYourStylePedestal: React.FC<{ visible: boolean }> = ({ visible }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!visible || !groupRef.current) return;
    groupRef.current.position.set(worldMotionRef.charX + 0.9, 0.04, worldMotionRef.charZ + 0.2);
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.25;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* Soft Ground Contact Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[5.2, 48]} />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.18} depthWrite={false} />
      </mesh>

      {/* Raised Sleek White Studio Podium Platform */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[4.2, 4.4, 0.2, 64]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          roughness={0.35}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Outer WalkWin Energetic Orange Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <ringGeometry args={[3.8, 4.15, 64]} />
        <meshBasicMaterial color="#FF5B00" />
      </mesh>

      {/* Inner Golden Compass Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.215, 0]}>
        <ringGeometry args={[2.8, 2.95, 64]} />
        <meshBasicMaterial color="#FBBF24" transparent opacity={0.8} />
      </mesh>

      {/* Center Rotating Compass Motif */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
        <ringGeometry args={[0.9, 1.15, 48]} />
        <meshBasicMaterial color="#38BDF8" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.218, 0]}>
        <planeGeometry args={[5.6, 0.08]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.65} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.222, 0]}>
        <circleGeometry args={[0.85, 32]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
};

/**
 * Colorful Winding Topographic Contour Ribbons (Bruno Simon Sunset Tones)
 */
const WoodlandContourRibbons: React.FC = () => {
  const rings = useMemo(
    () => [
      { x: -45, z: -60, r: 34, color: '#F47280' }, // Coral Pink
      { x: 52, z: -40, r: 42, color: '#FBBF24' }, // Sunny Gold
      { x: -30, z: 45, r: 38, color: '#60A5FA' }, // Electric Blue
      { x: 45, z: 65, r: 32, color: '#A855F7' }, // Royal Violet
      { x: 0, z: -110, r: 28, color: '#34D399' }, // Soft Mint
    ],
    []
  );

  return (
    <group position={[0, 0.02, 0]}>
      {rings.map((ring, idx) => (
        <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[ring.x, 0, ring.z]}>
          <ringGeometry args={[ring.r, ring.r + 0.55, 64]} />
          <meshBasicMaterial color={ring.color} transparent opacity={0.65} />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Renders obstacle-free warm sandstone walkway avenues with raised dark plum stone curbs
 * and circular entrance courtyards at every building's front door (`place.entranceVisualPos`).
 */
const CampusWalkwayMesh: React.FC = () => {
  const segments = useMemo(() => {
    const out: Array<{
      id: string;
      midX: number;
      midY: number;
      midZ: number;
      len: number;
      angle: number;
      pitch: number;
    }> = [];

    DEFAULT_CAMPUS_GRAPH.edges.forEach((edge, idx) => {
      const nodeA = DEFAULT_CAMPUS_GRAPH.nodes[edge.from];
      const nodeB = DEFAULT_CAMPUS_GRAPH.nodes[edge.to];
      if (!nodeA || !nodeB) return;

      const chain = detourSegmentAroundBuildings(
        nodeA.visualWalkPos,
        nodeB.visualWalkPos,
        2.0
      );

      for (let i = 0; i < chain.length - 1; i++) {
        const a = chain[i];
        const b = chain[i + 1];
        const totalLen = distanceXZ(a, b);
        if (totalLen < 0.5) continue;

        const stepCount = Math.max(1, Math.ceil(totalLen / 2.0));

        for (let s = 0; s < stepCount; s++) {
          const u1 = s / stepCount;
          const u2 = (s + 1) / stepCount;

          const p1x = a.x + (b.x - a.x) * u1;
          const p1z = a.z + (b.z - a.z) * u1;
          const p2x = a.x + (b.x - a.x) * u2;
          const p2z = a.z + (b.z - a.z) * u2;

          const subLen = distanceXZ({ x: p1x, z: p1z }, { x: p2x, z: p2z });
          const mx = (p1x + p2x) * 0.5;
          const mz = (p1z + p2z) * 0.5;

          const y1 = getTerrainElevation(p1x, p1z);
          const y2 = getTerrainElevation(p2x, p2z);
          const my = (y1 + y2) * 0.5;

          const elevDiff = y2 - y1;
          const pitch = (y1 > 0.02 || y2 > 0.02) && subLen > 0.1 ? -Math.atan2(elevDiff, subLen) : 0;
          const angle = Math.atan2(b.x - a.x, b.z - a.z);

          out.push({
            id: `${edge.from}-${edge.to}-${idx}-${i}-${s}`,
            midX: mx,
            midY: my,
            midZ: mz,
            len: subLen + (stepCount > 1 ? 0.35 : 0),
            angle,
            pitch,
          });
        }
      }
    });
    return out;
  }, []);

  return (
    <group position={[0, 0.04, 0]}>
      {segments.map((seg) => (
        <group
          key={seg.id}
          position={[seg.midX, seg.midY, seg.midZ]}
          rotation={[seg.pitch, seg.angle, 0]}
        >
          {/* Raised Stone Curb (Dark Plum/Terracotta) */}
          <mesh position={[0, -0.01, 0]} receiveShadow>
            <boxGeometry args={[4.6, 0.12, seg.len + 2.2]} />
            <meshStandardMaterial color="#382046" roughness={0.85} />
          </mesh>
          {/* Pedestrian Pavement (Warm Polished Sandstone) */}
          <mesh position={[0, 0.03, 0]} receiveShadow>
            <boxGeometry args={[3.8, 0.12, seg.len + 1.8]} />
            <meshPhysicalMaterial
              color="#EFE6D5"
              roughness={0.65}
              clearcoat={0.15}
            />
          </mesh>
        </group>
      ))}

      {CAMPUS_PLACES.map((place) => {
        const apronLen =
          place.entranceVisualPos.z -
          (place.visualPos.z + place.footprintSize.depth * 0.5);
        const plazaY = getTerrainElevation(
          place.entranceVisualPos.x,
          place.entranceVisualPos.z
        );
        return (
          <group key={`plaza-${place.id}`} position={[0, plazaY, 0]}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[place.entranceVisualPos.x, 0.03, place.entranceVisualPos.z]}
              receiveShadow
            >
              <circleGeometry args={[4.4, 24]} />
              <meshStandardMaterial color="#382046" roughness={0.85} />
            </mesh>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[place.entranceVisualPos.x, 0.06, place.entranceVisualPos.z]}
              receiveShadow
            >
              <circleGeometry args={[3.8, 24]} />
              <meshPhysicalMaterial color="#EFE6D5" roughness={0.65} clearcoat={0.15} />
            </mesh>
            {apronLen > 0.5 && (
              <mesh
                position={[
                  place.entranceVisualPos.x,
                  0.05,
                  place.visualPos.z + place.footprintSize.depth * 0.5 + apronLen * 0.5,
                ]}
                receiveShadow
              >
                <boxGeometry args={[3.6, 0.1, apronLen + 1.5]} />
                <meshPhysicalMaterial color="#EFE6D5" roughness={0.65} clearcoat={0.15} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

function selectTopThreeSignposts(
  currentBlockId: string,
  selectedPlaceId: string | null
): CampusPlace[] {
  const chosenIds = new Set<string>();
  const result: CampusPlace[] = [];

  const pushIfValid = (id: string | null) => {
    if (!id || chosenIds.has(id) || result.length >= 3) return;
    const place = PLACES_BY_ID[id];
    if (place) {
      chosenIds.add(id);
      result.push(place);
    }
  };

  pushIfValid(selectedPlaceId);
  pushIfValid(currentBlockId);

  const focusPos =
    PLACES_BY_ID[selectedPlaceId ?? currentBlockId]?.visualPos ?? { x: 0, z: 0 };

  const sortedLandmarks = CAMPUS_PLACES.filter((p) => !chosenIds.has(p.id)).sort((a, b) => {
    const heroBonusA = a.landmarkType !== 'none' ? -25 : 0;
    const heroBonusB = b.landmarkType !== 'none' ? -25 : 0;
    const distA = distanceXZ(a.visualPos, focusPos) + heroBonusA;
    const distB = distanceXZ(b.visualPos, focusPos) + heroBonusB;
    return distA - distB;
  });

  for (const candidate of sortedLandmarks) {
    if (result.length >= 3) break;
    pushIfValid(candidate.id);
  }

  return result;
}

/**
 * 60fps Walk Simulator + Camera Controller
 */
const WorldSimulationAndCamera: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const lastSyncTimeRef = useRef(0);
  const cameraFlyUntilRef = useRef<number>(Infinity);

  const uiMode = useCampusStore((s) => s.uiMode);
  const selectedPlaceId = useCampusStore((s) => s.selectedPlaceId);
  const currentBlockId = useCampusStore((s) => s.currentBlockId);
  const activeRoute = useCampusStore((s) => s.activeRoute);
  const demoSpeed = useCampusStore((s) => s.demoSpeed);
  const syncWalkProgressFromFrame = useCampusStore((s) => s.syncWalkProgressFromFrame);
  const triggerArrival = useCampusStore((s) => s.triggerArrival);

  const studioSpinHeadingRef = useRef(0);
  const isStudioDraggingRef = useRef(false);
  const studioDragStartXRef = useRef(0);
  const studioStartHeadingRef = useRef(0);

  useEffect(() => {
    cameraFlyUntilRef.current = performance.now() + 1800;
  }, [currentBlockId, selectedPlaceId, uiMode]);

  // Allows 1-swipe 180° rotation of the avatar in the style studio
  useEffect(() => {
    if (uiMode !== 'onboarding-avatar' && uiMode !== 'onboarding-pet') return;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.clientY > window.innerHeight * 0.72) return;
      isStudioDraggingRef.current = true;
      studioDragStartXRef.current = e.clientX;
      studioStartHeadingRef.current = studioSpinHeadingRef.current;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isStudioDraggingRef.current) return;
      const dx = e.clientX - studioDragStartXRef.current;
      // Calibrated 1-swipe = 90° turn (~196px = 1.57 rad)
      const sensitivity = 0.008;
      studioSpinHeadingRef.current = studioStartHeadingRef.current + dx * sensitivity;
    };

    const handlePointerUp = () => {
      isStudioDraggingRef.current = false;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [uiMode]);

  useFrame(({ clock }, delta) => {
    const clampedDelta = Math.min(0.1, delta);
    const now = clock.getElapsedTime();

    if (uiMode === 'walk' && activeRoute && activeRoute.pawTrailPoints.length > 1) {
      const pts = activeRoute.pawTrailPoints;
      const totalRouteDist = pts[pts.length - 1].distFromStart;

      if (demoSpeed === 0) {
        worldMotionRef.charSpeedMps = 0;
      } else {
        const effectiveSpeedMps = demoSpeed === 4 ? 16.5 : 4.2;
        worldMotionRef.charSpeedMps = effectiveSpeedMps;
        worldMotionRef.walkDistAlongRoute = Math.min(
          totalRouteDist,
          worldMotionRef.walkDistAlongRoute + effectiveSpeedMps * clampedDelta
        );

        const d = worldMotionRef.walkDistAlongRoute;
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          if (d >= a.distFromStart && d <= b.distFromStart) {
            const span = Math.max(1e-4, b.distFromStart - a.distFromStart);
            const t = (d - a.distFromStart) / span;
            worldMotionRef.charX = a.x + (b.x - a.x) * t;
            worldMotionRef.charZ = a.z + (b.z - a.z) * t;
            worldMotionRef.charHeading = a.heading;
            worldMotionRef.ringBuffer.push(
              { x: worldMotionRef.charX, z: worldMotionRef.charZ },
              a.heading
            );
            break;
          }
        }

        if (now - lastSyncTimeRef.current >= 0.5) {
          lastSyncTimeRef.current = now;
          const nearest = findNearestPlaceId({
            x: worldMotionRef.charX,
            z: worldMotionRef.charZ,
          });
          syncWalkProgressFromFrame(d, nearest.placeId);
        }

        if (d >= totalRouteDist - 1.2) {
          worldMotionRef.charSpeedMps = 0;
          triggerArrival();
        }
      }
    } else {
      worldMotionRef.charSpeedMps = 0;
      if (uiMode === 'onboarding-avatar' || uiMode === 'onboarding-pet') {
        let diff = studioSpinHeadingRef.current - worldMotionRef.charHeading;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        worldMotionRef.charHeading += diff * 0.24;
      }
    }

    // Camera Mode Transitions
    if (uiMode === 'auth') {
      // Close-up 3D Bust Camera for Login Mode
      const cx = worldMotionRef.charX;
      const cz = worldMotionRef.charZ;
      const desiredCam = new THREE.Vector3(cx, 2.55, cz + 9.2);
      camera.position.lerp(desiredCam, 0.14);
      camera.lookAt(cx, 2.05, cz);
    } else if (uiMode === 'onboarding-avatar' || uiMode === 'onboarding-pet') {
      // "CHOOSE YOUR STYLE" Full-Body Pedestal Showcase Camera (Matches Pokémon GO Style Reference!)
      // Frames the full character + pet standing on the glowing pedestal in the top 72% of the screen
      const midX = worldMotionRef.charX + 0.85;
      const midZ = worldMotionRef.charZ;
      const desiredCam = new THREE.Vector3(midX, 2.65, midZ + 9.6);
      camera.position.lerp(desiredCam, 0.12);

      worldMotionRef.cameraTargetX += (midX - worldMotionRef.cameraTargetX) * 0.16;
      worldMotionRef.cameraTargetZ += (midZ - worldMotionRef.cameraTargetZ) * 0.16;
      camera.lookAt(worldMotionRef.cameraTargetX, 1.55, worldMotionRef.cameraTargetZ);
      if (controlsRef.current) {
        controlsRef.current.target.set(
          worldMotionRef.cameraTargetX,
          1.55,
          worldMotionRef.cameraTargetZ
        );
      }
    } else if (uiMode === 'walk') {
      // Over-the-Shoulder Walk Chase Camera
      const chaseDist = 22.5;
      const chaseHeight = 14.5;
      const rightOffset = 4.8;
      const sinH = Math.sin(worldMotionRef.charHeading);
      const cosH = Math.cos(worldMotionRef.charHeading);

      const camX = worldMotionRef.charX - sinH * chaseDist + cosH * rightOffset;
      const camZ = worldMotionRef.charZ - cosH * chaseDist - sinH * rightOffset;
      camera.position.lerp(new THREE.Vector3(camX, chaseHeight, camZ), 0.085);

      const lookAheadX = worldMotionRef.charX + sinH * 9.5 + cosH * 0.8;
      const lookAheadZ = worldMotionRef.charZ + cosH * 9.5 - sinH * 0.8;
      worldMotionRef.cameraTargetX += (lookAheadX - worldMotionRef.cameraTargetX) * 0.12;
      worldMotionRef.cameraTargetZ += (lookAheadZ - worldMotionRef.cameraTargetZ) * 0.12;
      camera.lookAt(worldMotionRef.cameraTargetX, 2.8, worldMotionRef.cameraTargetZ);
    } else {
      // Explore / Fly-to Diorama Mode
      const focusId = selectedPlaceId ?? currentBlockId;
      const focusPlace = PLACES_BY_ID[focusId];
      if (focusPlace) {
        const zBias = selectedPlaceId ? 8 : 5;
        const targetX = focusPlace.visualPos.x + 1.0;
        const targetZ = focusPlace.entranceVisualPos.z + zBias - 3;

        worldMotionRef.cameraTargetX += (targetX - worldMotionRef.cameraTargetX) * 0.09;
        worldMotionRef.cameraTargetZ += (targetZ - worldMotionRef.cameraTargetZ) * 0.09;

        if (controlsRef.current) {
          controlsRef.current.target.set(
            worldMotionRef.cameraTargetX,
            2.2,
            worldMotionRef.cameraTargetZ
          );
          controlsRef.current.update();
        }

        if (performance.now() < cameraFlyUntilRef.current) {
          const desiredCam = new THREE.Vector3(targetX + 14, 34, targetZ + 30);
          camera.position.lerp(desiredCam, 0.075);
        }
      }
    }
  });

  return (
    <MapControls
      ref={controlsRef}
      enabled={uiMode === 'explore' || uiMode === 'arrived'}
      enableDamping
      dampingFactor={0.12}
      rotateSpeed={1.35}
      panSpeed={1.8}
      zoomSpeed={1.5}
      minDistance={16}
      maxDistance={155}
      minPolarAngle={Math.PI / 6.0}
      maxPolarAngle={Math.PI / 2.7}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
    />
  );
};

/**
 * Animated 3D Campus Building with Anime.js Kinetic Bounce
 * Gives buildings a tactile squash-and-stretch elastic pop when selected.
 */
const CampusBuilding: React.FC<{
  place: CampusPlace;
  isSelected: boolean;
  isCurrent: boolean;
  onSelect: (id: string) => void;
}> = ({ place, isSelected, isCurrent, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { width, depth, height } = place.footprintSize;
  const halfD = depth * 0.5;
  const halfW = width * 0.5;

  useEffect(() => {
    if (isSelected && groupRef.current) {
      animate(groupRef.current.scale, {
        x: [1, 1.07, 0.96, 1.02, 1],
        y: [1, 0.88, 1.15, 0.98, 1],
        z: [1, 1.07, 0.96, 1.02, 1],
        duration: 720,
        ease: 'outElastic(1, .45)',
      });
    }
  }, [isSelected]);

  useFrame(({ clock }) => {
    if ((isSelected || isCurrent) && ringRef.current) {
      const t = clock.getElapsedTime();
      const pulse = 1.0 + Math.sin(t * 3.5) * 0.05;
      ringRef.current.scale.set(pulse, pulse, 1);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[place.visualPos.x, 0, place.visualPos.z]}
      rotation={[0, place.rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(place.id);
      }}
    >
      {(isSelected || isCurrent) && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, 0]}>
          <ringGeometry
            args={[
              Math.max(width, depth) * 0.56,
              Math.max(width, depth) * 0.65,
              32,
            ]}
          />
          <meshBasicMaterial
            color={isSelected ? '#F2C12E' : '#FFFFFF'}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}

      {/* Building Base Plinth (Dark Plum Stone) */}
      <RoundedBox
        args={[width + 0.8, 0.75, depth + 0.8]}
        position={[0, 0.38, 0]}
        radius={0.28}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial color="#261633" roughness={0.78} clearcoat={0.12} />
      </RoundedBox>

      {/* Main Porcelain/Stucco Body */}
      <RoundedBox
        args={[width, height, depth]}
        position={[0, height * 0.5 + 0.35, 0]}
        radius={0.75}
        smoothness={5}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={isSelected ? '#FFFFFF' : '#FFFBF2'}
          emissive="#FFEAD0"
          emissiveIntensity={0.06}
          roughness={0.52}
          clearcoat={0.25}
          clearcoatRoughness={0.4}
        />
      </RoundedBox>

      {/* Corner Architectural Pilasters (Lacoste Clean Bevel Finish) */}
      {[-halfW + 0.28, halfW - 0.28].map((cx, i) =>
        [-halfD + 0.28, halfD - 0.28].map((cz, j) => (
          <RoundedBox
            key={`pillar-${i}-${j}`}
            args={[0.65, height + 0.15, 0.65]}
            position={[cx, height * 0.5 + 0.35, cz]}
            radius={0.16}
            smoothness={3}
            castShadow
          >
            <meshPhysicalMaterial color="#EAE0D0" roughness={0.6} clearcoat={0.18} />
          </RoundedBox>
        ))
      )}

      {/* Decorative Mid-Story Cornice Trim */}
      <RoundedBox
        args={[width + 0.35, 0.28, depth + 0.35]}
        position={[0, height * 0.52, 0]}
        radius={0.1}
      >
        <meshStandardMaterial color="#EAE0D0" roughness={0.65} />
      </RoundedBox>

      {/* Upper Parapet Fascia */}
      <RoundedBox
        args={[width + 0.65, 0.45, depth + 0.65]}
        position={[0, height + 0.2, 0]}
        radius={0.18}
      >
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.45} clearcoat={0.25} />
      </RoundedBox>

      {/* Roof Cap with Saturated Lacoste / Bruno Simon Hue */}
      <RoundedBox
        args={[width + 1.25, 1.55, depth + 1.25]}
        position={[0, height + 0.92, 0]}
        radius={0.65}
        smoothness={5}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={place.roofColor}
          emissive={place.roofColor}
          emissiveIntensity={0.14}
          roughness={0.42}
          clearcoat={0.35}
          clearcoatRoughness={0.3}
        />
      </RoundedBox>

      {/* Rooftop Utility Accents (HVAC Chiller & Communication Mast with Blinking Beacon) */}
      <group position={[width * 0.22, height + 1.7, -depth * 0.2]}>
        {/* AC Chiller Unit */}
        <RoundedBox args={[2.2, 1.2, 1.8]} radius={0.15} castShadow>
          <meshPhysicalMaterial color="#CBD5E1" roughness={0.4} clearcoat={0.2} />
        </RoundedBox>
        {/* Fan Grill */}
        <mesh position={[0, 0.61, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.65, 16]} />
          <meshBasicMaterial color="#334155" />
        </mesh>
      </group>

      <group position={[-width * 0.25, height + 1.7, depth * 0.15]}>
        {/* Antenna Mast */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 2.4, 8]} />
          <meshStandardMaterial color="#64748B" metalness={0.7} />
        </mesh>
        {/* Blinking Red Aviation Beacon */}
        <mesh position={[0, 2.45, 0]}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color="#EF4444" emissive="#FF0000" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* Front Entrance Portal, Striped Awning & Windows */}
      <group position={[0, 0, halfD + 0.05]}>
        {/* Entrance Steps */}
        <RoundedBox args={[3.6, 0.35, 1.2]} position={[0, 0.18, 0.45]} radius={0.12} receiveShadow>
          <meshStandardMaterial color="#261633" roughness={0.8} />
        </RoundedBox>

        {/* Double Entrance Doorways with Brass Handles */}
        <RoundedBox args={[2.5, 3.0, 0.22]} position={[0, 1.6, -0.02]} radius={0.25}>
          <meshStandardMaterial color="#20122B" roughness={0.6} />
        </RoundedBox>
        <RoundedBox args={[2.1, 2.75, 0.28]} position={[0, 1.52, 0.02]} radius={0.2}>
          <meshPhysicalMaterial
            color="#3E2214"
            roughness={0.45}
            clearcoat={0.4}
          />
        </RoundedBox>
        {/* Brass Door Handles */}
        <mesh position={[-0.15, 1.45, 0.18]}>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.15, 1.45, 0.18]}>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Lacoste Chic Striped Awning Canopy */}
        <group position={[0, 3.35, 0.65]} rotation={[0.22, 0, 0]}>
          <RoundedBox args={[3.8, 0.42, 1.45]} radius={0.15} castShadow>
            <meshPhysicalMaterial color={place.roofColor} roughness={0.48} clearcoat={0.3} />
          </RoundedBox>
          {/* Awning White Accent Stripes */}
          {[-1.2, -0.4, 0.4, 1.2].map((ax, ai) => (
            <mesh key={`awn-str-${ai}`} position={[ax, 0.02, 0]}>
              <boxGeometry args={[0.35, 0.44, 1.48]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          ))}
          {/* Warm Doorway Lantern Hanging Below Awning */}
          <mesh position={[0, -0.32, 0.2]}>
            <sphereGeometry args={[0.2, 14, 14]} />
            <meshStandardMaterial
              color="#FFF7ED"
              emissive="#F59E0B"
              emissiveIntensity={1.3}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* Front Architectural Windows (Glowing Warm Interior Light) */}
        {[-width * 0.3, width * 0.3].map((wx, i) => (
          <React.Fragment key={`win-f-${i}`}>
            {/* Lower Window Bay */}
            <group position={[wx, height * 0.32, 0]}>
              <RoundedBox args={[2.0, 1.6, 0.24]} radius={0.16}>
                <meshStandardMaterial color="#20122B" roughness={0.7} />
              </RoundedBox>
              <mesh position={[0, 0, 0.13]}>
                <planeGeometry args={[1.7, 1.3]} />
                <meshPhysicalMaterial
                  color="#FFB74D"
                  emissive="#F59E0B"
                  emissiveIntensity={0.52}
                  roughness={0.15}
                  clearcoat={0.9}
                />
              </mesh>
            </group>
            {/* Upper Window Bay */}
            <group position={[wx, height * 0.72, 0]}>
              <RoundedBox args={[2.0, 1.6, 0.24]} radius={0.16}>
                <meshStandardMaterial color="#20122B" roughness={0.7} />
              </RoundedBox>
              <mesh position={[0, 0, 0.13]}>
                <planeGeometry args={[1.7, 1.3]} />
                <meshPhysicalMaterial
                  color="#FFB74D"
                  emissive="#F59E0B"
                  emissiveIntensity={0.52}
                  roughness={0.15}
                  clearcoat={0.9}
                />
              </mesh>
            </group>
          </React.Fragment>
        ))}
      </group>

      {/* Side Windows with Warm Glow */}
      {[-halfW - 0.04, halfW + 0.04].map((sx, sideIdx) => (
        <group key={`side-${sideIdx}`} position={[sx, 0, 0]}>
          <group position={[0, height * 0.68, -depth * 0.22]}>
            <RoundedBox args={[0.24, 1.6, 2.0]} radius={0.08}>
              <meshStandardMaterial color="#20122B" roughness={0.7} />
            </RoundedBox>
            <mesh
              position={[sideIdx === 0 ? -0.13 : 0.13, 0, 0]}
              rotation={[0, sideIdx === 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
            >
              <planeGeometry args={[1.7, 1.3]} />
              <meshPhysicalMaterial
                color="#FFB74D"
                emissive="#F59E0B"
                emissiveIntensity={0.5}
                roughness={0.15}
                clearcoat={0.9}
              />
            </mesh>
          </group>
          <group position={[0, height * 0.68, depth * 0.22]}>
            <RoundedBox args={[0.24, 1.6, 2.0]} radius={0.08}>
              <meshStandardMaterial color="#20122B" roughness={0.7} />
            </RoundedBox>
            <mesh
              position={[sideIdx === 0 ? -0.13 : 0.13, 0, 0]}
              rotation={[0, sideIdx === 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
            >
              <planeGeometry args={[1.7, 1.3]} />
              <meshPhysicalMaterial
                color="#FFB74D"
                emissive="#F59E0B"
                emissiveIntensity={0.5}
                roughness={0.15}
                clearcoat={0.9}
              />
            </mesh>
          </group>
        </group>
      ))}

      <HeroLandmarkProp
        type={place.landmarkType}
        roofY={height + 1.65}
        isSelected={isSelected}
      />
    </group>
  );
};

export const CampusWorldCanvas: React.FC = () => {
  const [dpr, setDpr] = useState<number>(1.5);

  const uiMode = useCampusStore((s) => s.uiMode);
  const profile = useCampusStore((s) => s.profile);
  const currentBlockId = useCampusStore((s) => s.currentBlockId);
  const selectedPlaceId = useCampusStore((s) => s.selectedPlaceId);
  const activeRoute = useCampusStore((s) => s.activeRoute);
  const demoSpeed = useCampusStore((s) => s.demoSpeed);
  const events = useCampusStore((s) => s.events);
  const selectDestination = useCampusStore((s) => s.selectDestination);
  const openEventDetail = useCampusStore((s) => s.openEventDetail);
  const webglLost = useCampusStore((s) => s.webglLost);
  const setWebglLost = useCampusStore((s) => s.setWebglLost);

  // Trailmakers / Bruno Simon Playground Fresh Turf Grid Texture
  const gridFloorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#44B050'; // Fresh vibrant grass
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#389B42'; // Subtle turf grid border
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 128, 128);
    ctx.fillStyle = '#2E8537';
    ctx.fillRect(62, 62, 4, 4);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(45, 65);
    return tex;
  }, []);

  const visibleSignposts = useMemo(
    () => selectTopThreeSignposts(currentBlockId, selectedPlaceId),
    [currentBlockId, selectedPlaceId]
  );

  const featuredLiveEvent = useMemo(
    () => events.find((e) => e.isLiveNow) ?? events[0],
    [events]
  );
  const featuredEventPlace = featuredLiveEvent
    ? PLACES_BY_ID[featuredLiveEvent.placeId]
    : null;

  const isStyleStudio = uiMode === 'onboarding-avatar' || uiMode === 'onboarding-pet';

  if (webglLost) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#38BDF8] p-6">
        <div className="max-w-sm rounded-3xl bg-[#FFFDF9] p-6 text-center shadow-pill border border-[#1D2440]/10">
          <h2 className="font-display text-xl font-bold text-[#1D2440]">
            3D Campus View Paused
          </h2>
          <p className="mt-2 text-sm text-[#525B7A]">
            Your browser paused the 3D diorama while switching tabs. Tap below to restore it.
          </p>
          <button
            type="button"
            onClick={() => setWebglLost(false)}
            className="mt-4 w-full rounded-full bg-[#5A4FE8] py-3 font-display font-semibold text-white shadow-cta"
          >
            Restore 3D View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 h-[100dvh] w-screen overflow-hidden"
      style={{
        background: isStyleStudio
          ? 'linear-gradient(180deg, #BAE6FD 0%, #E0F2FE 62%, #DCFCE7 100%)'
          : 'linear-gradient(180deg, #38BDF8 0%, #BAE6FD 52%, #F0FDF4 100%)',
      }}
    >
      <Canvas
        dpr={dpr}
        shadows="soft"
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.12 }}
        camera={{ position: [82, 42, -82], fov: 40, near: 1, far: 650 }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            setWebglLost(true);
          });
          canvas.addEventListener('webglcontextrestored', () => {
            setWebglLost(false);
          });
        }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1.0)}
          onIncline={() => setDpr(Math.min(1.75, window.devicePixelRatio || 1.5))}
        />

        {/* Trailmakers / Sunny Daytime Airy Fog */}
        <fog attach="fog" args={[isStyleStudio ? '#BAE6FD' : '#DDF4FF', 160, 450]} />

        {/* Crisp Sunny Daytime Lighting */}
        <ambientLight intensity={0.65} color="#F0FDF4" />
        <hemisphereLight args={['#BAE6FD', '#4ADE80', 0.78]} />

        {/* Bright Warm Sunlight */}
        <directionalLight
          castShadow
          position={[85, 130, 75]}
          intensity={1.55}
          color="#FFFDF5"
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-145}
          shadow-camera-right={145}
          shadow-camera-top={185}
          shadow-camera-bottom={-185}
          shadow-camera-near={10}
          shadow-camera-far={380}
          shadow-bias={-0.0004}
        />

        {/* Soft Sky Blue Secondary Fill */}
        <directionalLight position={[-65, 75, -55]} intensity={0.45} color="#E0F2FE" />

        {/* "CHOOSE YOUR STYLE" 3D Pedestal Stage (Active in onboarding-avatar & onboarding-pet) */}
        <ChooseYourStylePedestal visible={isStyleStudio} />

        {/* Campus World Diorama Island */}
        <group visible={!isStyleStudio && uiMode !== 'auth'}>
          {/* Fresh Green Turf Diorama Base with Tactile Grid */}
          <group position={[0, -1.6, 0]}>
            <RoundedBox args={[260, 3.2, 370]} radius={1.4} smoothness={4} receiveShadow>
              <meshPhysicalMaterial
                color="#44B050"
                map={gridFloorTexture}
                roughness={0.8}
                clearcoat={0.08}
              />
            </RoundedBox>
            <RoundedBox args={[266, 2.2, 376]} position={[0, -1.2, 0]} radius={1.1}>
              <meshStandardMaterial color="#2E7D38" roughness={0.9} />
            </RoundedBox>
          </group>

          {/* Falling Leaves & Dynamic Walking Leaf Trails */}
          <LeafParticlesAndTrails />

          {/* Trailmakers / Bruno Simon Scenic Elements (Turquoise River, Island, Lantern, TV, Curbs, Confetti) */}
          <BrunoSimonScenicElements />

          {/* Colorful Winding Topographic Trail Ribbons */}
          <WoodlandContourRibbons />

          {/* Obstacle-Free Walkways with Raised Stone Curbs & Front-Door Courtyards */}
          <CampusWalkwayMesh />

          {/* Multi-Puff Cherry-Blossom Trees & Campus Street Lamps */}
          <InstancedTrees />

          {/* 3D Sculpted 4-Bean Paw-Print Trail */}
          <InstancedPawTrail
            pawTrailPoints={activeRoute?.pawTrailPoints ?? []}
            visible={Boolean(activeRoute && (uiMode === 'walk' || selectedPlaceId))}
          />

          {/* All 25 Stylized Architectural Campus Buildings */}
          {CAMPUS_PLACES.map((place) => (
            <CampusBuilding
              key={place.id}
              place={place}
              isSelected={selectedPlaceId === place.id}
              isCurrent={currentBlockId === place.id}
              onSelect={selectDestination}
            />
          ))}
        </group>

        {/* Maximum 3 Spatial-Culled Signpost Pills */}
        {uiMode !== 'auth' &&
          !isStyleStudio &&
          visibleSignposts.map((place) => {
            const isSelected = selectedPlaceId === place.id;
            return (
              <Html
                key={`signpost-${place.id}`}
                position={[
                  place.visualPos.x,
                  place.footprintSize.height + (place.landmarkType !== 'none' ? 7.0 : 3.8),
                  place.visualPos.z,
                ]}
                center
                zIndexRange={[10, 0]}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectDestination(place.id);
                  }}
                  aria-label={`Inspect ${place.name}`}
                  className={`group flex min-h-[38px] items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 font-display text-xs font-semibold transition-transform active:scale-95 ${
                    isSelected
                      ? 'bg-[#222B1D] text-white shadow-cta scale-105'
                      : 'bg-[#FFFDF9] text-[#1D2440] shadow-pill border border-[#1D2440]/12 hover:scale-105'
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-[#1D2440]/20"
                    style={{ backgroundColor: place.roofColor }}
                  />
                  <span>{place.shortLabel}</span>
                </button>
              </Html>
            );
          })}

        {/* Single Featured Live Event Pin in 3D World */}
        {uiMode === 'explore' && featuredEventPlace && featuredLiveEvent && (
          <Html
            position={[
              featuredEventPlace.visualPos.x + 4,
              featuredEventPlace.footprintSize.height + 6.2,
              featuredEventPlace.visualPos.z - 2,
            ]}
            center
            zIndexRange={[12, 0]}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openEventDetail(featuredLiveEvent);
              }}
              aria-label={`Live event: ${featuredLiveEvent.title}`}
              className="flex min-h-[36px] items-center gap-1.5 whitespace-nowrap rounded-full bg-[#C8234B] px-3 py-1 font-display text-xs font-semibold text-white shadow-pill transition-transform hover:scale-105 active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>Live: {featuredLiveEvent.title}</span>
            </button>
          </Html>
        )}

        {/* Customizable 3D Athletic Human Character & Pet Companion */}
        <Suspense fallback={null}>
          <ClayCharacter profile={profile} uiMode={uiMode} />
        </Suspense>
        <ClayPet
          species={profile.petSpecies}
          uiMode={uiMode}
          demoSpeed={demoSpeed}
          pawTrailPoints={activeRoute?.pawTrailPoints ?? []}
        />

        {/* Camera & Walk Simulation Controller */}
        <WorldSimulationAndCamera />
      </Canvas>
    </div>
  );
};
