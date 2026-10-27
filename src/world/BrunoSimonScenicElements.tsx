import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { isPointInsideAnyBuilding } from '../data/campusPlaces';
import { DEFAULT_CAMPUS_GRAPH } from '../navigation/campusGraph';
import { CAMPUS_GRASSY_HILLS, getTerrainElevation } from './terrainElevation';

/**
 * Animated River Flowing Wakes:
 * Crisp white foam streaks that scroll continuously downstream along the river current.
 */
const RiverFlowingWaves: React.FC = () => {
  const wakeCount = 12;
  const initialZ = useMemo(() => {
    return Array.from({ length: wakeCount }, (_, i) => (i / wakeCount) * 92 - 46);
  }, []);

  const wakesRef = useRef<Array<THREE.Mesh | null>>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    wakesRef.current.forEach((mesh, idx) => {
      if (!mesh) return;
      // Scroll downstream at realistic river flow velocity
      const speed = 7.5;
      const zPos = ((initialZ[idx] + t * speed) % 92) - 46;
      mesh.position.y = zPos;
      // Shimmer opacity with current turbulence
      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.52 + Math.sin(t * 3.4 + idx * 0.8) * 0.28;
      }
    });
  });

  return (
    <group position={[0, 0, 0.03]}>
      {initialZ.map((_, idx) => (
        <mesh
          key={`river-wake-${idx}`}
          ref={(el) => {
            wakesRef.current[idx] = el;
          }}
          position={[(idx % 2 === 0 ? -1 : 1) * (3.8 + (idx % 4) * 2.1), 0, 0]}
          rotation={[0, 0, (idx % 2 === 0 ? 0.14 : -0.14)]}
        >
          <planeGeometry args={[8.0 + (idx % 3) * 2.8, 0.65]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.65} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Bruno Simon / Léo Parpeix Scenic Diorama Elements:
 * Direct 1:1 recreation of the uploaded reference scene (`uploaded_media_1792409031942.png`):
 * 1. Curved electric river with cobalt blue water and animated glowing cyan shoreline foam.
 * 2. River island with lavender cherry-blossom trees and grass tufts.
 * 3. Glowing paper lantern with warm amber interior point-light glow.
 * 4. Retro CRT television station, gaming console, controller cords, and red cups on a low stool.
 * 5. Curving red-and-white racetrack curbs with rounded chamfers.
 * 6. Scattered floating confetti/leaf particles across the terrain.
 */
export const BrunoSimonScenicElements: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);
  const foamRef = useRef<THREE.Mesh>(null);
  const lanternLightRef = useRef<THREE.PointLight>(null);
  const tvScreenRef = useRef<THREE.Mesh>(null);

  // Generate confetti/leaf debris points scattered across the ground
  const confettiParticles = useMemo(() => {
    const pts: Array<{ x: number; y: number; z: number; rotX: number; rotY: number; color: string; scale: number }> = [];
    const colors = ['#FF6B8B', '#FFBE53', '#D288D6', '#67E8F9', '#A7F3D0'];
    let seed = 42;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let i = 0; i < 110; i++) {
      pts.push({
        x: -95 + (rand() - 0.5) * 55,
        y: 0.08 + rand() * 0.04,
        z: 15 + (rand() - 0.5) * 85,
        rotX: -Math.PI / 2 + (rand() - 0.5) * 0.2,
        rotY: rand() * Math.PI * 2,
        color: colors[i % colors.length],
        scale: 0.22 + rand() * 0.28,
      });
    }
    return pts;
  }, []);

  // Curve points for the red-and-white racetrack curb barrier
  const curbSegments = useMemo(() => {
    const segs: Array<{ x: number; z: number; angle: number; isRed: boolean }> = [];
    const radius = 22;
    const center = { x: -68, z: 42 };
    for (let i = 0; i < 14; i++) {
      const a = (i / 13) * Math.PI * 0.85 - 0.3;
      segs.push({
        x: center.x + Math.cos(a) * radius,
        z: center.z + Math.sin(a) * radius,
        angle: -a + Math.PI / 2,
        isRed: i % 2 === 0,
      });
    }
    return segs;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Animated 3D vertex wave displacement on River Surface
    if (waterRef.current) {
      const geom = waterRef.current.geometry;
      const pos = geom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getY(i);
        const w1 = Math.sin(u * 0.32 + t * 2.8 + v * 0.16) * 0.32;
        const w2 = Math.sin(v * 0.22 - t * 3.4) * 0.22;
        const w3 = Math.cos((u + v) * 0.38 + t * 4.2) * 0.14;
        pos.setZ(i, w1 + w2 + w3);
      }
      pos.needsUpdate = true;
      geom.computeVertexNormals();
    }

    // Soft pulsing foam along the river shore
    if (foamRef.current) {
      const mat = foamRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.72 + Math.sin(t * 2.8) * 0.16;
      }
    }
    // Cozy lantern flicker
    if (lanternLightRef.current) {
      lanternLightRef.current.intensity = 2.4 + Math.sin(t * 5.2) * 0.25;
    }
    // Retro TV screen glow pulse
    if (tvScreenRef.current) {
      const mat = tvScreenRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 0.85 + Math.sin(t * 3.6) * 0.15;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ==============================================================
          1. WINDING ELECTRIC RIVER & CRISP WHITE SHORELINE FOAM
          ============================================================== */}
      <group position={[-92, 0.03, 35]} rotation={[0, 0.24, 0]}>
        {/* River Bed Base with Dynamic 3D Waves (Vibrant Azure Turquoise) */}
        <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[28, 95, 32, 64]} />
          <meshPhysicalMaterial
            color="#0EA5E9"
            emissive="#0284C7"
            emissiveIntensity={0.22}
            roughness={0.08}
            clearcoat={1.0}
            clearcoatRoughness={0.04}
            transmission={0.32}
            ior={1.33}
          />
        </mesh>

        {/* Crisp White Shoreline Foam Edge (Left Bank) */}
        <mesh ref={foamRef} position={[-12.8, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 95]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.88} />
        </mesh>

        {/* Crisp White Shoreline Foam Edge (Right Bank) */}
        <mesh position={[12.8, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 95]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.88} />
        </mesh>

        {/* Dynamic Downstream Flowing White Foam Wakes */}
        <RiverFlowingWaves />
      </group>

      {/* ==============================================================
          2. RIVER ISLAND (SANCTUARY IN THE STREAM)
          ============================================================== */}
      <group position={[-90, 0.06, 32]}>
        {/* Island Earth Mound in Fresh Grass Green */}
        <RoundedBox args={[18, 0.45, 24]} radius={0.4} smoothness={4} receiveShadow>
          <meshPhysicalMaterial color="#3E9B4F" roughness={0.78} />
        </RoundedBox>

        {/* ==============================================================
            3. TWO LOW-POLY CHERRY-BLOSSOM / LAVENDER PUFF TREES
            ============================================================== */}
        <group position={[-3.5, 0.2, -4.5]}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.42, 2.8, 8]} />
            <meshStandardMaterial color="#351C24" roughness={0.8} />
          </mesh>
          {/* Main Lavender Canopy Puff */}
          <mesh position={[0, 3.4, 0]} castShadow>
            <sphereGeometry args={[1.7, 16, 16]} />
            <meshPhysicalMaterial color="#E8A0E8" roughness={0.55} clearcoat={0.25} />
          </mesh>
          <mesh position={[-0.9, 2.9, 0.4]} castShadow>
            <sphereGeometry args={[1.2, 14, 14]} />
            <meshPhysicalMaterial color="#D582D2" roughness={0.55} clearcoat={0.25} />
          </mesh>
          <mesh position={[0.8, 3.2, -0.4]} castShadow>
            <sphereGeometry args={[1.25, 14, 14]} />
            <meshPhysicalMaterial color="#FFAEC9" roughness={0.55} clearcoat={0.25} />
          </mesh>
        </group>

        <group position={[4.2, 0.2, 4.8]} scale={0.82}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.38, 2.8, 8]} />
            <meshStandardMaterial color="#351C24" roughness={0.8} />
          </mesh>
          <mesh position={[0, 3.2, 0]} castShadow>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshPhysicalMaterial color="#D582D2" roughness={0.55} clearcoat={0.25} />
          </mesh>
          <mesh position={[0.8, 2.7, 0.3]} castShadow>
            <sphereGeometry args={[1.1, 14, 14]} />
            <meshPhysicalMaterial color="#E8A0E8" roughness={0.55} clearcoat={0.25} />
          </mesh>
        </group>

        {/* Stylized Grass / Reeds Tufts */}
        {[-4, -2, 1, 3.5].map((gx, i) => (
          <group key={`reed-${i}`} position={[gx, 0.25, -2 + i * 2]}>
            <mesh rotation={[0, i * 0.8, 0.2]}>
              <coneGeometry args={[0.18, 0.9, 5]} />
              <meshStandardMaterial color="#A855F7" roughness={0.7} />
            </mesh>
            <mesh position={[0.2, 0, 0.1]} rotation={[0, i * 1.2, -0.2]}>
              <coneGeometry args={[0.15, 0.75, 5]} />
              <meshStandardMaterial color="#C084FC" roughness={0.7} />
            </mesh>
          </group>
        ))}

        {/* ==============================================================
            4. GLOWING JAPANESE PAPER LANTERN (Warm Amber Interior Light)
            ============================================================== */}
        <group position={[-4.5, 0.25, 2.5]}>
          {/* Wooden Roof Cap */}
          <RoundedBox args={[1.3, 0.22, 1.3]} position={[0, 1.25, 0]} radius={0.06}>
            <meshStandardMaterial color="#2B1810" roughness={0.7} />
          </RoundedBox>
          {/* Glowing Translucent Amber Paper Lattice Body */}
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[0.95, 0.95, 0.95]} />
            <meshStandardMaterial
              color="#F59E0B"
              emissive="#FBBF24"
              emissiveIntensity={1.4}
              roughness={0.25}
            />
          </mesh>
          {/* Wood Corner Frame Struts */}
          {[-0.45, 0.45].map((fx) =>
            [-0.45, 0.45].map((fz) => (
              <mesh key={`strut-${fx}-${fz}`} position={[fx, 0.65, fz]}>
                <boxGeometry args={[0.12, 1.0, 0.12]} />
                <meshStandardMaterial color="#2B1810" roughness={0.8} />
              </mesh>
            ))
          )}
          {/* Wooden Base Plinth */}
          <RoundedBox args={[1.35, 0.2, 1.35]} position={[0, 0.1, 0]} radius={0.06}>
            <meshStandardMaterial color="#2B1810" roughness={0.7} />
          </RoundedBox>
          {/* Authentic Warm Amber Point Light Casting Ambient Glow */}
          <pointLight
            ref={lanternLightRef}
            position={[0, 0.75, 0]}
            color="#F59E0B"
            intensity={2.8}
            distance={16}
            decay={2}
          />
        </group>

        {/* ==============================================================
            5. RETRO CRT TV GAMING STATION (Console, Table & Red Solo Cups)
            ============================================================== */}
        <group position={[1.5, 0.25, -0.8]} rotation={[0, -0.35, 0]}>
          {/* Low Wooden Stool / Table */}
          <RoundedBox args={[2.8, 0.45, 1.8]} position={[0, 0.22, 0]} radius={0.08}>
            <meshStandardMaterial color="#4A2810" roughness={0.75} />
          </RoundedBox>

          {/* Retro CRT Television Cabinet */}
          <group position={[-0.4, 1.35, 0]}>
            <RoundedBox args={[1.8, 1.5, 1.5]} radius={0.22} smoothness={4} castShadow>
              <meshPhysicalMaterial color="#1E2433" roughness={0.55} clearcoat={0.3} />
            </RoundedBox>
            {/* Glowing Phosphor Screen */}
            <mesh ref={tvScreenRef} position={[0, 0.08, 0.76]}>
              <planeGeometry args={[1.4, 1.1]} />
              <meshStandardMaterial
                color="#FBBF24"
                emissive="#F59E0B"
                emissiveIntensity={0.9}
                roughness={0.2}
              />
            </mesh>
            {/* Front Knobs & Channel Buttons */}
            <mesh position={[0.62, 0.2, 0.77]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.08, 12]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.6} />
            </mesh>
            <mesh position={[0.62, -0.15, 0.77]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.08, 12]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.6} />
            </mesh>
          </group>

          {/* Retro Game Console on the Table */}
          <group position={[0.85, 0.52, 0.15]} rotation={[0, 0.25, 0]}>
            <RoundedBox args={[0.75, 0.16, 0.65]} radius={0.04}>
              <meshStandardMaterial color="#CBD5E1" roughness={0.4} />
            </RoundedBox>
            {/* Cartridge Slot / Disc Lid */}
            <mesh position={[0, 0.09, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.6} />
            </mesh>
            {/* Game Controller Pad */}
            <mesh position={[0.15, -0.01, 0.42]}>
              <boxGeometry args={[0.34, 0.06, 0.18]} />
              <meshStandardMaterial color="#475569" roughness={0.5} />
            </mesh>
          </group>

          {/* Two Red Solo Party Cups on Top of the CRT TV */}
          <group position={[-0.7, 2.2, 0.1]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.12, 0.08, 0.32, 14]} />
              <meshPhysicalMaterial color="#EF4444" roughness={0.4} clearcoat={0.3} />
            </mesh>
            <mesh position={[0, 0.16, 0]}>
              <circleGeometry args={[0.11, 14]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>
          <group position={[-0.32, 2.2, 0.15]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.12, 0.08, 0.32, 14]} />
              <meshPhysicalMaterial color="#EF4444" roughness={0.4} clearcoat={0.3} />
            </mesh>
            <mesh position={[0, 0.16, 0]}>
              <circleGeometry args={[0.11, 14]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>
        </group>
      </group>

      {/* ==============================================================
          6. CURVING RED-AND-WHITE RACETRACK CURB BARRIER
          (Exact match to the perimeter track in the reference!)
          ============================================================== */}
      <group position={[0, 0.12, 0]}>
        {curbSegments.map((curb, i) => (
          <RoundedBox
            key={`curb-${i}`}
            args={[3.4, 0.65, 1.2]}
            position={[curb.x, 0.32, curb.z]}
            rotation={[0, curb.angle, 0]}
            radius={0.12}
            smoothness={3}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              color={curb.isRed ? '#EF4444' : '#F8FAFC'}
              roughness={0.48}
              clearcoat={0.25}
            />
          </RoundedBox>
        ))}
      </group>

      {/* ==============================================================
          7. SCATTERED FLOATING CONFETTI / LEAF PARTICLES
          ============================================================== */}
      <group>
        {confettiParticles.map((p, i) => (
          <mesh
            key={`confetti-${i}`}
            position={[p.x, p.y, p.z]}
            rotation={[p.rotX, p.rotY, 0]}
            scale={p.scale}
          >
            <planeGeometry args={[0.42, 0.42]} />
            <meshBasicMaterial color={p.color} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* ==============================================================
          8. ARCHED PEDESTRIAN BRIDGES WITH WATER FLOWING UNDERNEATH
          ============================================================== */}
      {/* Bridge 1: Spanning to the Scenic River Island */}
      <ArchedTimberBridge from={[-77, 26]} to={[-88, 29]} width={4.2} archHeight={1.4} />

      {/* Bridge 2: Spanning the northern river reach */}
      <ArchedTimberBridge from={[-80, 68]} to={[-104, 74]} width={4.4} archHeight={1.9} />

      {/* ==============================================================
          9. TACTILE LOW-POLY ROCKS & BOULDERS (Trailmakers style)
          ============================================================== */}
      <ScenicRocksAndBoulders />

      {/* ==============================================================
          10. SMALL ROLLING GRASSY HILLS / MOUNDS WITH CLUSTERED ROCKS
          ============================================================== */}
      <RollingGrassyHills />


      {/* ==============================================================
          12. ROCKS & PEBBLES SPREAD OUT ON AND AROUND THE PATHWAYS
          ============================================================== */}
      <PathwayPebblesAndStones />

      {/* ==============================================================
          13. FALLEN RESTING LEAVES SPREAD OUT ON AND AROUND PATHS
          ============================================================== */}
      <WalkwayRestingLeaves />
    </group>
  );
};

/**
 * Arched Timber Pedestrian Bridge with water visibly flowing underneath
 */
const ArchedTimberBridge: React.FC<{
  from: [number, number];
  to: [number, number];
  width?: number;
  archHeight?: number;
}> = ({ from, to, width = 4.2, archHeight = 1.45 }) => {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dx, dz);
  const midX = (from[0] + to[0]) * 0.5;
  const midZ = (from[1] + to[1]) * 0.5;

  const PLANK_COUNT = 16;
  const planks = useMemo(() => {
    return Array.from({ length: PLANK_COUNT }, (_, i) => {
      const u = (i + 0.5) / PLANK_COUNT;
      const relDist = (u - 0.5) * length;
      const y = archHeight * 4 * u * (1 - u) + 0.15;
      const slope = (archHeight * 4 * (1 - 2 * u)) / length;
      const tiltX = -Math.atan(slope);
      return { relDist, y, tiltX };
    });
  }, [length, archHeight]);

  return (
    <group position={[midX, 0, midZ]} rotation={[0, angle, 0]}>
      {/* Stone Abutments on each shore */}
      <mesh position={[0, 0.35, -length * 0.5 - 0.4]} receiveShadow castShadow>
        <boxGeometry args={[width + 0.8, 0.8, 1.4]} />
        <meshStandardMaterial color="#475569" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.35, length * 0.5 + 0.4]} receiveShadow castShadow>
        <boxGeometry args={[width + 0.8, 0.8, 1.4]} />
        <meshStandardMaterial color="#475569" roughness={0.85} />
      </mesh>

      {/* Arched Wood Deck Planks */}
      {planks.map((p, i) => (
        <group key={`plank-${i}`} position={[0, p.y, p.relDist]} rotation={[p.tiltX, 0, 0]}>
          <RoundedBox args={[width, 0.14, (length / PLANK_COUNT) * 0.95]} radius={0.03} castShadow receiveShadow>
            <meshStandardMaterial color={i % 2 === 0 ? '#8B5A2B' : '#78491F'} roughness={0.75} />
          </RoundedBox>
          {/* Left & Right Handrail Posts */}
          <mesh position={[-width * 0.48, 0.55, 0]} castShadow>
            <boxGeometry args={[0.12, 0.95, 0.12]} />
            <meshStandardMaterial color="#4A2810" roughness={0.7} />
          </mesh>
          <mesh position={[width * 0.48, 0.55, 0]} castShadow>
            <boxGeometry args={[0.12, 0.95, 0.12]} />
            <meshStandardMaterial color="#4A2810" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Continuous Curved Handrails (Left & Right) */}
      {[-width * 0.48, width * 0.48].map((sideX, sIdx) => (
        <group key={`rail-${sIdx}`} position={[sideX, 0, 0]}>
          {planks.slice(0, -1).map((p, i) => {
            const nextP = planks[i + 1];
            const segMidY = (p.y + nextP.y) * 0.5 + 1.05;
            const segMidZ = (p.relDist + nextP.relDist) * 0.5;
            const segLen = Math.hypot(nextP.relDist - p.relDist, nextP.y - p.y);
            const segTilt = Math.atan2(nextP.y - p.y, nextP.relDist - p.relDist);
            return (
              <mesh
                key={`rail-seg-${i}`}
                position={[0, segMidY, segMidZ]}
                rotation={[segTilt, 0, 0]}
                castShadow
              >
                <cylinderGeometry args={[0.07, 0.07, segLen * 1.04, 8]} />
                <meshStandardMaterial color="#4A2810" roughness={0.7} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Water flow and foam ripples visibly flowing underneath the bridge arch */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 1.1, length * 0.8]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.4} />
      </mesh>
      {[-0.3, 0, 0.3].map((offZ, idx) => (
        <mesh key={`flow-${idx}`} position={[0, 0.045, offZ * length]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width * 0.9, 0.4]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Tactile Low-Poly Rocks & Boulders (Trailmakers style)
 */
const ScenicRocksAndBoulders: React.FC = () => {
  const rocks = useMemo(
    () => [
      { x: -76, z: 22, s: 1.4, rot: [0.3, 0.8, 0.2], c: '#64748B' },
      { x: -74, z: 34, s: 1.1, rot: [0.1, 1.2, 0.5], c: '#475569' },
      { x: -105, z: 28, s: 1.6, rot: [0.4, 0.3, 0.9], c: '#78716C' },
      { x: -106, z: 42, s: 1.3, rot: [0.2, 2.1, 0.1], c: '#64748B' },
      { x: -84, z: 18, s: 0.9, rot: [0.5, 0.6, 0.4], c: '#94A3B8' },
      { x: -89, z: 46, s: 1.2, rot: [0.1, 1.5, 0.7], c: '#64748B' },
      { x: -76, z: 62, s: 1.5, rot: [0.6, 0.4, 0.2], c: '#475569' },
      { x: -107, z: 78, s: 1.7, rot: [0.3, 1.9, 0.4], c: '#78716C' },
      { x: 38, z: -55, s: 1.6, rot: [0.2, 0.7, 0.3], c: '#64748B' },
      { x: 42, z: -52, s: 1.1, rot: [0.5, 1.4, 0.1], c: '#94A3B8' },
      { x: -48, z: -85, s: 1.8, rot: [0.4, 0.5, 0.6], c: '#475569' },
      { x: -52, z: -88, s: 1.2, rot: [0.1, 2.3, 0.2], c: '#64748B' },
      { x: 68, z: 45, s: 1.5, rot: [0.3, 0.9, 0.5], c: '#78716C' },
      { x: -28, z: 75, s: 1.3, rot: [0.2, 1.1, 0.4], c: '#64748B' },
      { x: 22, z: 95, s: 1.7, rot: [0.5, 0.2, 0.8], c: '#475569' },
      { x: -82, z: -15, s: 1.4, rot: [0.3, 1.8, 0.2], c: '#94A3B8' },
      { x: 78, z: -25, s: 1.6, rot: [0.4, 0.4, 0.5], c: '#64748B' },
      { x: -18, z: -40, s: 1.2, rot: [0.1, 0.8, 0.3], c: '#78716C' },
    ],
    []
  );

  return (
    <group position={[0, 0, 0]}>
      {rocks.map((r, i) => (
        <mesh
          key={`rock-${i}`}
          position={[r.x, r.s * 0.45, r.z]}
          rotation={r.rot as any}
          scale={[r.s, r.s * 0.85, r.s]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1.0, 0]} />
          <meshStandardMaterial color={r.c} roughness={0.88} flatShading />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Small Rolling Grassy Hills / Mounds with Natural Rocks & Stones
 */
const RollingGrassyHills: React.FC = () => {
  const hills = CAMPUS_GRASSY_HILLS;

  // Clusters of natural stones and rocks situated on top and along the slopes of every hill mound
  const hillRocks = useMemo(() => {
    const list: Array<{ x: number; y: number; z: number; s: number; rot: [number, number, number]; c: string }> = [];
    const stoneColors = ['#64748B', '#475569', '#78716C', '#94A3B8', '#52525B', '#334155'];

    hills.forEach((h, hIdx) => {
      // 1. Summit rocks on crest of mound
      for (let c = 0; c < 2; c++) {
        const ang = c * 2.8 + hIdx * 1.1;
        const rad = 1.2 + c * 1.8;
        const rx = h.x + Math.cos(ang) * rad;
        const rz = h.z + Math.sin(ang) * rad;
        const dist = Math.hypot(rx - h.x, rz - h.z);
        const normDist = Math.min(0.95, dist / h.r);
        const surfaceY = h.h * Math.sqrt(1 - normDist * normDist);
        const s = 1.15 + ((c + hIdx) % 3) * 0.28;
        list.push({
          x: rx,
          y: surfaceY + s * 0.38,
          z: rz,
          s,
          rot: [0.2 * (c + 1), hIdx * 1.3 + c, 0.15],
          c: stoneColors[(hIdx + c) % stoneColors.length],
        });
      }

      // 2. Slope stones on gentle hillside
      for (let sIdx = 0; sIdx < 4; sIdx++) {
        const ang = (sIdx / 4) * Math.PI * 2 + hIdx * 0.8;
        const rad = h.r * (0.35 + (sIdx % 3) * 0.18);
        const rx = h.x + Math.cos(ang) * rad;
        const rz = h.z + Math.sin(ang) * rad;
        const dist = Math.hypot(rx - h.x, rz - h.z);
        const normDist = Math.min(0.95, dist / h.r);
        const surfaceY = h.h * Math.sqrt(1 - normDist * normDist);
        const s = 0.55 + ((sIdx + hIdx) % 4) * 0.2;
        list.push({
          x: rx,
          y: surfaceY + s * 0.38,
          z: rz,
          s,
          rot: [0.3 * (sIdx + 1), hIdx * 0.9 + sIdx, 0.2],
          c: stoneColors[(hIdx + sIdx + 1) % stoneColors.length],
        });
      }
    });

    return list;
  }, [hills]);

  return (
    <group position={[0, -0.05, 0]}>
      {hills.map((h, i) => (
        <mesh
          key={`hill-${i}`}
          position={[h.x, 0, h.z]}
          scale={[1, h.h / h.r, 1]}
          receiveShadow
        >
          <sphereGeometry args={[h.r, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshPhysicalMaterial color={h.color} roughness={0.82} clearcoat={0.06} />
        </mesh>
      ))}

      {/* Rocks and stones on the raised hill mounds */}
      {hillRocks.map((r, i) => (
        <mesh
          key={`hill-rock-${i}`}
          position={[r.x, r.y, r.z]}
          rotation={r.rot as any}
          scale={[r.s, r.s * 0.82, r.s]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1.0, 0]} />
          <meshStandardMaterial color={r.c} roughness={0.88} flatShading />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Pathway Pebbles & Stones spread out on and along the walkway margins
 */
const PathwayPebblesAndStones: React.FC = () => {
  const pebbles = useMemo(() => {
    const list: Array<{ x: number; y: number; z: number; s: number; rot: [number, number, number]; c: string }> = [];
    const pebbleColors = ['#475569', '#64748B', '#94A3B8', '#78716C', '#CBD5E1', '#334155'];

    DEFAULT_CAMPUS_GRAPH.edges.forEach((edge, eIdx) => {
      const nodeA = DEFAULT_CAMPUS_GRAPH.nodes[edge.from];
      const nodeB = DEFAULT_CAMPUS_GRAPH.nodes[edge.to];
      if (!nodeA || !nodeB) return;

      const dx = nodeB.visualWalkPos.x - nodeA.visualWalkPos.x;
      const dz = nodeB.visualWalkPos.z - nodeA.visualWalkPos.z;
      const len = Math.hypot(dx, dz);
      if (len < 5) return;

      const nx = -dz / len;
      const nz = dx / len;

      const count = Math.min(4, Math.floor(len / 12));
      for (let i = 1; i <= count; i++) {
        const u = i / (count + 1);
        const side = i % 2 === 0 ? 1 : -1;
        // Flanking path curbs (~2.1m to 2.7m from centerline)
        const offsetDist = 2.15 + (i % 3) * 0.28;
        const px = nodeA.visualWalkPos.x + dx * u + nx * side * offsetDist;
        const pz = nodeA.visualWalkPos.z + dz * u + nz * side * offsetDist;

        if (isPointInsideAnyBuilding({ x: px, z: pz }, 1.0)) continue;

        const s = 0.22 + ((eIdx + i) % 4) * 0.12;
        list.push({
          x: px,
          y: s * 0.42 + 0.05,
          z: pz,
          s,
          rot: [0.2 * i, eIdx * 0.6 + i, 0.15 * i],
          c: pebbleColors[(eIdx + i) % pebbleColors.length],
        });
      }
    });

    return list;
  }, []);

  return (
    <group>
      {pebbles.map((p, i) => (
        <mesh
          key={`path-peb-${i}`}
          position={[p.x, p.y, p.z]}
          rotation={p.rot as any}
          scale={[p.s, p.s * 0.75, p.s]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1.0, 0]} />
          <meshStandardMaterial color={p.c} roughness={0.88} flatShading />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Fallen Resting Leaves scattered on the walkways and flanking curbs
 */
const WalkwayRestingLeaves: React.FC = () => {
  const restingLeaves = useMemo(() => {
    const list: Array<{ x: number; y: number; z: number; rotX: number; rotY: number; color: string; scale: number }> = [];
    const colors = [
      '#F59E0B', // Golden Amber
      '#FB923C', // Sunburst Orange
      '#F43F5E', // Coral Rose
      '#EC4899', // Sakura Pink
      '#10B981', // Spring Mint
      '#FBBF24', // Sunny Gold
      '#E11D48', // Crimson Red
      '#84CC16', // Fresh Lime
    ];

    DEFAULT_CAMPUS_GRAPH.edges.forEach((edge, eIdx) => {
      const nodeA = DEFAULT_CAMPUS_GRAPH.nodes[edge.from];
      const nodeB = DEFAULT_CAMPUS_GRAPH.nodes[edge.to];
      if (!nodeA || !nodeB) return;

      const dx = nodeB.visualWalkPos.x - nodeA.visualWalkPos.x;
      const dz = nodeB.visualWalkPos.z - nodeA.visualWalkPos.z;
      const len = Math.hypot(dx, dz);
      if (len < 4) return;

      const nx = -dz / len;
      const nz = dx / len;

      const count = Math.min(5, Math.floor(len / 8));
      for (let i = 1; i <= count; i++) {
        const u = i / (count + 1);
        // Cross offset between -1.6m (on path) and +2.2m (on curb/border)
        const crossOffset = ((i * 17 + eIdx * 31) % 40) / 10 - 2.0;
        const lx = nodeA.visualWalkPos.x + dx * u + nx * crossOffset;
        const lz = nodeA.visualWalkPos.z + dz * u + nz * crossOffset;

        if (isPointInsideAnyBuilding({ x: lx, z: lz }, 0.5)) continue;

        // Path surface is at y=0.08-0.10, so y=0.12 sits directly atop pavement
        list.push({
          x: lx,
          y: 0.12 + ((i + eIdx) % 3) * 0.015,
          z: lz,
          rotX: -Math.PI / 2 + (((i * 7) % 5) - 2) * 0.06,
          rotY: i * 2.3 + eIdx * 1.7,
          color: colors[(eIdx * 3 + i) % colors.length],
          scale: 0.34 + ((i + eIdx) % 4) * 0.06,
        });
      }
    });

    return list;
  }, []);

  return (
    <group>
      {restingLeaves.map((leaf, i) => (
        <mesh
          key={`rest-leaf-${i}`}
          position={[leaf.x, leaf.y, leaf.z]}
          rotation={[leaf.rotX, leaf.rotY, 0]}
          scale={leaf.scale}
        >
          <planeGeometry args={[0.55, 0.42]} />
          <meshBasicMaterial color={leaf.color} side={THREE.DoubleSide} transparent opacity={0.92} />
        </mesh>
      ))}
    </group>
  );
};



