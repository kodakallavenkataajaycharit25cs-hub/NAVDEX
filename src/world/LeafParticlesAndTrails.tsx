import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { worldMotionRef } from '../store/worldMotionRef';

/**
 * Falling Leaves & Dynamic Footstep Leaf Trails (Trailmakers / Studio Ghibli style):
 * 1. Gentle falling leaves drifting, tumbling, and swirling in the breeze across the campus diorama.
 * 2. Dynamic swirl of spinning leaves kicking up behind the character & pet as they walk.
 */
export const LeafParticlesAndTrails: React.FC = () => {
  const leavesMeshRef = useRef<THREE.InstancedMesh>(null);
  const trailMeshRef = useRef<THREE.InstancedMesh>(null);

  // 1. Falling leaves system
  const LEAF_COUNT = 240;
  const leafData = useMemo(() => {
    const data: Array<{
      x: number;
      y: number;
      z: number;
      speedY: number;
      swaySpeed: number;
      swayRadius: number;
      rotSpeedX: number;
      rotSpeedY: number;
      rotSpeedZ: number;
      color: string;
      scale: number;
    }> = [];

    const leafColors = [
      '#F59E0B', // Golden Amber
      '#F43F5E', // Coral Rose
      '#10B981', // Spring Mint
      '#FB923C', // Sunburst Peach
      '#84CC16', // Fresh Lime
      '#EC4899', // Sakura Pink
      '#FBBF24', // Sunny Honey
      '#34D399', // Emerald Mint
    ];

    let seed = 777;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    for (let i = 0; i < LEAF_COUNT; i++) {
      data.push({
        x: (rand() - 0.5) * 230,
        y: 2 + rand() * 24,
        z: (rand() - 0.5) * 340,
        speedY: 0.75 + rand() * 1.4,
        swaySpeed: 1.2 + rand() * 2.2,
        swayRadius: 0.8 + rand() * 1.6,
        rotSpeedX: (rand() - 0.5) * 3.5,
        rotSpeedY: (rand() - 0.5) * 4.5,
        rotSpeedZ: (rand() - 0.5) * 3.5,
        color: leafColors[i % leafColors.length],
        scale: 0.26 + rand() * 0.28,
      });
    }
    return data;
  }, []);

  // 2. Dynamic leaf trail pool behind footsteps
  const TRAIL_COUNT = 80;
  const trailData = useMemo(() => {
    return Array.from({ length: TRAIL_COUNT }, () => ({
      x: 0,
      y: -10,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      rotSpeed: 0,
      life: 0,
      maxLife: 1,
      scale: 0.28,
      color: '#F59E0B',
    }));
  }, []);

  const trailIndexRef = useRef(0);
  const lastEmitTimeRef = useRef(0);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(), []);

  // Initialize colors on mount
  React.useLayoutEffect(() => {
    if (!leavesMeshRef.current || !trailMeshRef.current) return;
    leafData.forEach((leaf, i) => {
      colorObj.set(leaf.color);
      leavesMeshRef.current!.setColorAt(i, colorObj);
    });
    leavesMeshRef.current.instanceColor!.needsUpdate = true;

    const trailColors = ['#F59E0B', '#FB923C', '#10B981', '#F43F5E', '#A78BFA', '#84CC16', '#FBBF24'];
    trailData.forEach((_, i) => {
      colorObj.set(trailColors[i % trailColors.length]);
      trailMeshRef.current!.setColorAt(i, colorObj);
    });
    trailMeshRef.current.instanceColor!.needsUpdate = true;
  }, [leafData, trailData, colorObj]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const clampedDelta = Math.min(0.08, delta);

    // 1. Update falling leaves
    if (leavesMeshRef.current) {
      leafData.forEach((leaf, i) => {
        leaf.y -= leaf.speedY * clampedDelta;
        // Reset leaf to sky when reaching ground level
        if (leaf.y < 0.1) {
          leaf.y = 24 + Math.random() * 4;
        }

        const swayX = Math.sin(t * leaf.swaySpeed + i) * leaf.swayRadius;
        const swayZ = Math.cos(t * leaf.swaySpeed * 0.7 + i) * leaf.swayRadius;

        dummy.position.set(leaf.x + swayX, leaf.y, leaf.z + swayZ);
        dummy.rotation.set(
          t * leaf.rotSpeedX,
          t * leaf.rotSpeedY,
          t * leaf.rotSpeedZ
        );
        dummy.scale.set(leaf.scale, leaf.scale * 0.45, leaf.scale);
        dummy.updateMatrix();
        leavesMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      leavesMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Emit and update dynamic leaf trail behind footsteps
    const isMoving = worldMotionRef.charSpeedMps > 0.15;
    if (isMoving && t - lastEmitTimeRef.current > 0.045) {
      lastEmitTimeRef.current = t;

      // Burst 1: Behind character
      const idx1 = trailIndexRef.current;
      trailIndexRef.current = (trailIndexRef.current + 1) % TRAIL_COUNT;
      const p1 = trailData[idx1];
      const h = worldMotionRef.charHeading;
      const dist1 = 0.6 + Math.random() * 0.45;
      p1.x = worldMotionRef.charX - Math.sin(h) * dist1 + (Math.random() - 0.5) * 0.7;
      p1.y = 0.12 + Math.random() * 0.2;
      p1.z = worldMotionRef.charZ - Math.cos(h) * dist1 + (Math.random() - 0.5) * 0.7;
      p1.vx = (Math.random() - 0.5) * 1.2;
      p1.vy = 1.0 + Math.random() * 1.6;
      p1.vz = (Math.random() - 0.5) * 1.2;
      p1.rotSpeed = 6 + Math.random() * 10;
      p1.life = 0;
      p1.maxLife = 0.95 + Math.random() * 0.6;
      p1.scale = 0.32 + Math.random() * 0.25;

      // Burst 2: Near pet companion
      const idx2 = trailIndexRef.current;
      trailIndexRef.current = (trailIndexRef.current + 1) % TRAIL_COUNT;
      const p2 = trailData[idx2];
      p2.x = worldMotionRef.petX + (Math.random() - 0.5) * 0.8;
      p2.y = 0.14 + Math.random() * 0.2;
      p2.z = worldMotionRef.petZ + (Math.random() - 0.5) * 0.8;
      p2.vx = (Math.random() - 0.5) * 1.0;
      p2.vy = 0.9 + Math.random() * 1.4;
      p2.vz = (Math.random() - 0.5) * 1.0;
      p2.rotSpeed = 5 + Math.random() * 8;
      p2.life = 0;
      p2.maxLife = 0.85 + Math.random() * 0.5;
      p2.scale = 0.26 + Math.random() * 0.2;
    }

    if (trailMeshRef.current) {
      trailData.forEach((p, i) => {
        if (p.life < p.maxLife) {
          p.life += clampedDelta;
          p.x += p.vx * clampedDelta;
          p.y += p.vy * clampedDelta;
          p.z += p.vz * clampedDelta;
          p.vy -= 0.8 * clampedDelta; // gravity
          p.rotX += p.rotSpeed * clampedDelta;
          p.rotY += p.rotSpeed * 0.7 * clampedDelta;

          const progress = p.life / p.maxLife;
          const currentScale = p.scale * (1 - progress * 0.85);

          dummy.position.set(p.x, p.y, p.z);
          dummy.rotation.set(p.rotX, p.rotY, 0);
          dummy.scale.set(currentScale, currentScale * 0.45, currentScale);
        } else {
          dummy.position.set(0, -50, 0);
          dummy.scale.setScalar(0);
        }
        dummy.updateMatrix();
        trailMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      trailMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Falling Leaves Canopy */}
      <instancedMesh
        ref={leavesMeshRef}
        args={[undefined, undefined, LEAF_COUNT]}
        frustumCulled={false}
      >
        <planeGeometry args={[0.55, 0.4]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      {/* Dynamic Footstep Leaf Trails */}
      <instancedMesh
        ref={trailMeshRef}
        args={[undefined, undefined, TRAIL_COUNT]}
        frustumCulled={false}
      >
        <planeGeometry args={[0.48, 0.35]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.5}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
};
