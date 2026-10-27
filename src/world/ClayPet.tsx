import { Html, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { PetSpecies } from '../store/storage';
import { useCampusStore } from '../store/useCampusStore';
import { worldMotionRef } from '../store/worldMotionRef';
import { sampleRouteAhead } from './petMotion';
import { getTerrainElevation } from './terrainElevation';

interface ClayPetProps {
  species: PetSpecies;
  uiMode: string;
  demoSpeed: number;
  pawTrailPoints: Array<{ x: number; z: number; heading: number; distFromStart: number }>;
}

/**
 * Adorable Stylized Clay Companion (`ClayPet.tsx`)
 * - Reduced Glow: Eliminated harsh additive white halo spheres and blinding glare
 * - Tangible soft clay shading with gentle clearcoat and subtle ambient occlusion
 * - Expressive cute face with glossy black bead eyes, primary & secondary catchlights, and rosy blush
 * - Adorable species variations (Dog/Mint Melody with mini piano, Cat with violin, Bunny with star chime)
 * - Playful bobbing, ear wiggling, and joyful trailing behind the trainer
 */
export const ClayPet: React.FC<ClayPetProps> = ({
  species,
  uiMode,
  demoSpeed,
  pawTrailPoints,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const bodyGroupRef = useRef<THREE.Group>(null);
  const earsRef = useRef<THREE.Group>(null);
  const propGroupRef = useRef<THREE.Group>(null);
  const petName = useCampusStore((s) => s.profile.petName);

  useFrame(({ clock }) => {
    if (!rootRef.current || !bodyGroupRef.current) return;
    const t = clock.getElapsedTime();

    let targetX = worldMotionRef.petX;
    let targetZ = worldMotionRef.petZ;
    let targetHeading = worldMotionRef.petHeading;

    if (uiMode === 'walk' && pawTrailPoints.length > 1) {
      if (demoSpeed === 0) {
        worldMotionRef.petState = 'sit';
        const cosH = Math.cos(worldMotionRef.charHeading);
        const sinH = Math.sin(worldMotionRef.charHeading);
        targetX = worldMotionRef.charX + sinH * 2.2 + cosH * 1.9;
        targetZ = worldMotionRef.charZ + cosH * 2.2 - sinH * 1.9;
        targetHeading = Math.atan2(
          worldMotionRef.charX - worldMotionRef.petX,
          worldMotionRef.charZ - worldMotionRef.petZ
        );
      } else {
        worldMotionRef.petState = 'lead';
        const ahead = sampleRouteAhead(pawTrailPoints, worldMotionRef.walkDistAlongRoute, 4.2);
        const cosH = Math.cos(ahead.heading);
        const sinH = Math.sin(ahead.heading);
        targetX = ahead.x + cosH * 1.75;
        targetZ = ahead.z - sinH * 1.75;
        targetHeading = ahead.heading;
      }
    } else if (uiMode === 'arrived') {
      worldMotionRef.petState = 'celebrate';
      targetX = worldMotionRef.charX + 2.0;
      targetZ = worldMotionRef.charZ + 0.4;
      targetHeading = 0;
    } else if (uiMode === 'onboarding-avatar' || uiMode === 'onboarding-pet') {
      worldMotionRef.petState = uiMode === 'onboarding-pet' ? 'celebrate' : 'follow';
      targetX = worldMotionRef.charX + 1.85;
      targetZ = worldMotionRef.charZ + 0.35;
      targetHeading = -0.2;
    } else {
      worldMotionRef.petState = 'follow';
      const behind = worldMotionRef.ringBuffer.sampleBehind(2.2);
      targetX = behind.x;
      targetZ = behind.z;
      targetHeading = behind.heading;
    }

    worldMotionRef.petX += (targetX - worldMotionRef.petX) * 0.16;
    worldMotionRef.petZ += (targetZ - worldMotionRef.petZ) * 0.16;
    worldMotionRef.petHeading = targetHeading;

    const petElevation = getTerrainElevation(worldMotionRef.petX, worldMotionRef.petZ);
    rootRef.current.position.set(worldMotionRef.petX, petElevation, worldMotionRef.petZ);

    const currY = rootRef.current.rotation.y;
    let diff = targetHeading - currY;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    rootRef.current.rotation.y = currY + diff * 0.16;

    // Organic hopping & bounce animation
    if (worldMotionRef.petState === 'sit') {
      bodyGroupRef.current.position.y = 1.05 + Math.sin(t * 2.2) * 0.04;
      bodyGroupRef.current.rotation.z = Math.sin(t * 1.8) * 0.03;
    } else if (worldMotionRef.petState === 'celebrate') {
      bodyGroupRef.current.position.y = 1.15 + Math.abs(Math.sin(t * 7.0)) * 0.75;
      bodyGroupRef.current.rotation.z = Math.sin(t * 5.5) * 0.1;
    } else {
      const isMoving = worldMotionRef.charSpeedMps > 0.15;
      const hopFreq = isMoving ? 10.5 : 2.5;
      const hopAmp = isMoving ? 0.28 : 0.1;
      bodyGroupRef.current.position.y = 1.15 + Math.abs(Math.sin(t * hopFreq)) * hopAmp;
      bodyGroupRef.current.rotation.z = Math.sin(t * (hopFreq * 0.5)) * 0.05;
      bodyGroupRef.current.rotation.x = isMoving ? 0.08 : Math.sin(t * 1.8) * 0.02;
    }

    // Playful ear wiggle
    if (earsRef.current) {
      earsRef.current.rotation.z = Math.sin(t * 3.5) * 0.04;
    }

    // Gentle musical prop sway
    if (propGroupRef.current) {
      propGroupRef.current.rotation.z = -0.08 + Math.sin(t * 3.8) * 0.04;
      propGroupRef.current.position.y = -0.32 + Math.sin(t * 3.8) * 0.03;
    }
  });

  // Balanced pastel colors with tangible clay feel
  const bodyColor =
    species === 'dog' ? '#B2EAD8' : species === 'cat' ? '#F7C5DC' : '#BFDBFE';
  const accentColor =
    species === 'dog' ? '#2BB68D' : species === 'cat' ? '#E879A8' : '#3B82F6';
  const innerEarColor =
    species === 'dog' ? '#7FD1B9' : species === 'cat' ? '#F498BD' : '#93C5FD';
  const tagColor =
    species === 'dog' ? '#10B981' : species === 'cat' ? '#EC4899' : '#3B82F6';

  return (
    <group ref={rootRef} scale={0.72}>
      {/* Soft Ground Contact Shadow (Clean, non-glowing drop shadow) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[1.0, 24]} />
        <meshBasicMaterial color="#1D2440" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {/* Subtle Soft Locator Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[0.95, 1.12, 32]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Floating Pet Companion Name Pill */}
      {uiMode !== 'auth' && (
        <Html position={[0, 2.7, 0]} center zIndexRange={[8, 0]}>
          <div className="pointer-events-none flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#16202A]/90 px-3 py-0.5 font-display text-[11px] font-bold text-white shadow-pill border border-white/20">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: tagColor }}
            />
            <span>{petName}</span>
          </div>
        </Html>
      )}

      {/* ==============================================================
          PET COMPANION CLAY BODY, EARS, FACE & INSTRUMENT
         ============================================================== */}
      <group ref={bodyGroupRef} position={[0, 1.15, 0]}>
        {/* Luminous Inner Core Sphere (Warm glowing heart with 4-6 radius) */}
        <mesh scale={[0.62, 0.62, 0.62]}>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={3.6}
            roughness={0.15}
          />
        </mesh>
        {/* Soft Radiating Core Light (4-6 radius aura) */}
        <pointLight
          color={accentColor}
          intensity={2.2}
          distance={5.2}
          decay={1.8}
        />

        {/* Translucent Mochi Body with soft transmission & glazed clearcoat */}
        <mesh scale={[1.04, 0.95, 1.0]} castShadow receiveShadow>
          <sphereGeometry args={[0.92, 32, 32]} />
          <meshPhysicalMaterial
            color={bodyColor}
            roughness={0.16}
            transmission={0.68}
            thickness={0.8}
            ior={1.35}
            transparent
            opacity={0.88}
            clearcoat={0.75}
            clearcoatRoughness={0.15}
          />
        </mesh>

        {/* Soft Tummy Patch (Warm cream tint) */}
        <mesh position={[0, -0.15, 0.62]} scale={[0.85, 0.75, 0.42]}>
          <sphereGeometry args={[0.65, 20, 20]} />
          <meshPhysicalMaterial
            color="#FFFDF8"
            roughness={0.55}
            clearcoat={0.2}
          />
        </mesh>

        {/* Two Little Front Paws */}
        <mesh position={[-0.32, -0.65, 0.62]} scale={[1, 0.6, 1.2]} castShadow>
          <sphereGeometry args={[0.18, 14, 14]} />
          <meshPhysicalMaterial color={bodyColor} roughness={0.5} clearcoat={0.2} />
        </mesh>
        <mesh position={[0.32, -0.65, 0.62]} scale={[1, 0.6, 1.2]} castShadow>
          <sphereGeometry args={[0.18, 14, 14]} />
          <meshPhysicalMaterial color={bodyColor} roughness={0.5} clearcoat={0.2} />
        </mesh>

        {/* Cute Little Tail */}
        <mesh position={[0, -0.35, -0.88]} scale={[0.8, 0.8, 1.1]} castShadow>
          <sphereGeometry args={[0.22, 14, 14]} />
          <meshPhysicalMaterial color={accentColor} roughness={0.5} clearcoat={0.25} />
        </mesh>

        {/* Expressive Glossy Black Bead Eyes with Bright Catchlights (Clearly visible!) */}
        <group position={[-0.22, 0.08, 0.88]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshPhysicalMaterial color="#111827" roughness={0.15} clearcoat={0.9} />
          {/* Main White Specular Catchlight */}
          <mesh position={[-0.025, 0.03, 0.07]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.025, -0.02, 0.07]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>

        <group position={[0.22, 0.08, 0.88]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshPhysicalMaterial color="#111827" roughness={0.15} clearcoat={0.9} />
          <mesh position={[-0.025, 0.03, 0.07]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.025, -0.02, 0.07]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Rosy Pastel Blush Cheeks */}
        <mesh position={[-0.42, -0.05, 0.8]} scale={[1, 0.7, 0.5]}>
          <sphereGeometry args={[0.13, 14, 14]} />
          <meshBasicMaterial color="#F47280" transparent opacity={0.55} />
        </mesh>
        <mesh position={[0.42, -0.05, 0.8]} scale={[1, 0.7, 0.5]}>
          <sphereGeometry args={[0.13, 14, 14]} />
          <meshBasicMaterial color="#F47280" transparent opacity={0.55} />
        </mesh>

        {/* Cute Smile / Little Nose */}
        <mesh position={[0, 0.02, 0.94]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshBasicMaterial color="#1E293B" />
        </mesh>

        {/* Ears per Species */}
        <group ref={earsRef}>
          {species === 'bunny' ? (
            <>
              <group position={[-0.38, 0.84, 0]} rotation={[0, 0, 0.18]}>
                <mesh castShadow>
                  <capsuleGeometry args={[0.2, 0.5, 14, 18]} />
                  <meshPhysicalMaterial color={bodyColor} roughness={0.5} clearcoat={0.3} />
                </mesh>
                <mesh position={[0, 0, 0.14]} scale={[0.6, 0.7, 0.4]}>
                  <capsuleGeometry args={[0.18, 0.4, 10, 14]} />
                  <meshBasicMaterial color={innerEarColor} />
                </mesh>
              </group>
              <group position={[0.38, 0.84, 0]} rotation={[0, 0, -0.18]}>
                <mesh castShadow>
                  <capsuleGeometry args={[0.2, 0.5, 14, 18]} />
                  <meshPhysicalMaterial color={bodyColor} roughness={0.5} clearcoat={0.3} />
                </mesh>
                <mesh position={[0, 0, 0.14]} scale={[0.6, 0.7, 0.4]}>
                  <capsuleGeometry args={[0.18, 0.4, 10, 14]} />
                  <meshBasicMaterial color={innerEarColor} />
                </mesh>
              </group>
            </>
          ) : (
            /* Round Bear / Puppy Ears */
            <>
              <group position={[-0.54, 0.68, -0.02]} rotation={[0, 0, 0.22]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.38, 20, 20]} />
                  <meshPhysicalMaterial color={bodyColor} roughness={0.5} clearcoat={0.3} />
                </mesh>
                <mesh position={[-0.04, 0.02, 0.26]} scale={[0.65, 0.75, 0.35]}>
                  <sphereGeometry args={[0.28, 14, 14]} />
                  <meshBasicMaterial color={innerEarColor} />
                </mesh>
              </group>
              <group position={[0.54, 0.68, -0.02]} rotation={[0, 0, -0.22]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.38, 20, 20]} />
                  <meshPhysicalMaterial color={bodyColor} roughness={0.5} clearcoat={0.3} />
                </mesh>
                <mesh position={[0.04, 0.02, 0.26]} scale={[0.65, 0.75, 0.35]}>
                  <sphereGeometry args={[0.28, 14, 14]} />
                  <meshBasicMaterial color={innerEarColor} />
                </mesh>
              </group>
            </>
          )}
        </group>

        {/* Cute Musical Eighth-Note (`♪`) Head Antenna */}
        <group position={[0.14, 0.88, 0]} rotation={[0, 0, -0.22]}>
          <mesh position={[0, 0.24, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.5, 10]} />
            <meshStandardMaterial color={accentColor} roughness={0.4} />
          </mesh>
          <mesh position={[0.16, 0.38, 0]} rotation={[0, 0, -0.4]} scale={[1.2, 0.65, 0.28]}>
            <sphereGeometry args={[0.2, 14, 14]} />
            <meshStandardMaterial color={accentColor} roughness={0.4} />
          </mesh>
        </group>

        {/* Adorable Musical Instrument Held in Front */}
        <group ref={propGroupRef} position={[0, -0.32, 0.84]} rotation={[0.34, -0.1, -0.1]}>
          {species === 'cat' ? (
            /* Mini Wooden Violin */
            <group rotation={[0, 0, 0.42]}>
              <mesh scale={[0.85, 1.25, 0.35]} castShadow>
                <sphereGeometry args={[0.32, 16, 16]} />
                <meshPhysicalMaterial color="#A85832" roughness={0.45} clearcoat={0.4} />
              </mesh>
              <mesh position={[0, 0.48, 0]}>
                <boxGeometry args={[0.1, 0.54, 0.07]} />
                <meshStandardMaterial color="#4A2511" />
              </mesh>
              <mesh position={[0, 0.1, 0.12]}>
                <boxGeometry args={[0.07, 0.6, 0.02]} />
                <meshBasicMaterial color="#FDE68A" />
              </mesh>
            </group>
          ) : (
            /* Coral-Pink Mini Piano Keyboard with Clear White & Black Keys */
            <group>
              <RoundedBox args={[1.12, 0.2, 0.54]} radius={0.08} smoothness={4} castShadow>
                <meshPhysicalMaterial
                  color={species === 'bunny' ? '#FBBF24' : '#FF8FA3'}
                  roughness={0.45}
                  clearcoat={0.3}
                />
              </RoundedBox>
              {/* White Piano Keybed */}
              <RoundedBox
                args={[0.88, 0.07, 0.35]}
                position={[0, 0.09, -0.02]}
                radius={0.02}
              >
                <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
              </RoundedBox>
              {/* 7 Tiny Black Piano Sharp Keys */}
              {[-0.34, -0.23, -0.11, 0, 0.11, 0.23, 0.34].map((kx, idx) => (
                <mesh key={`key-${idx}`} position={[kx, 0.13, -0.06]}>
                  <boxGeometry args={[0.05, 0.03, 0.2]} />
                  <meshBasicMaterial color="#111827" />
                </mesh>
              ))}
            </group>
          )}
        </group>
      </group>
    </group>
  );
};
