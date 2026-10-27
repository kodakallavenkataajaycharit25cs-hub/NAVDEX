import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { worldMotionRef } from '../store/worldMotionRef';
import { getTerrainElevation } from './terrainElevation';

interface InstancedPawTrailProps {
  pawTrailPoints: Array<{ x: number; z: number; heading: number; distFromStart: number }>;
  visible: boolean;
}

const MAX_PAW_PRINTS = 80;

/**
 * Renders up to 80 sculpted 3D Paw Prints (1 main palm pad + 3 toe beans per print)
 * along the active route using InstancedMesh, pulsing golden-amber ahead of the character.
 */
export const InstancedPawTrail: React.FC<InstancedPawTrailProps> = ({
  pawTrailPoints,
  visible,
}) => {
  const palmRef = useRef<THREE.InstancedMesh>(null);
  const toeLeftRef = useRef<THREE.InstancedMesh>(null);
  const toeMidRef = useRef<THREE.InstancedMesh>(null);
  const toeRightRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorUpcoming = useMemo(() => new THREE.Color('#F59E0B'), []);
  const colorFuture = useMemo(() => new THREE.Color('#5A4FE8'), []);
  const colorPassed = useMemo(() => new THREE.Color('#94A3B8'), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const palm = palmRef.current;
    const toeL = toeLeftRef.current;
    const toeM = toeMidRef.current;
    const toeR = toeRightRef.current;
    if (!palm || !toeL || !toeM || !toeR) return;

    if (!visible || pawTrailPoints.length === 0) {
      palm.count = 0;
      toeL.count = 0;
      toeM.count = 0;
      toeR.count = 0;
      return;
    }

    const t = clock.getElapsedTime();
    const count = Math.min(MAX_PAW_PRINTS, pawTrailPoints.length);
    palm.count = count;
    toeL.count = count;
    toeM.count = count;
    toeR.count = count;

    const walkedDist = worldMotionRef.walkDistAlongRoute;

    for (let i = 0; i < count; i++) {
      const pt = pawTrailPoints[i];
      const sideSign = i % 2 === 0 ? 1 : -1;
      const cosH = Math.cos(pt.heading);
      const sinH = Math.sin(pt.heading);

      // Forward vector = (sinH, cosH), Right perpendicular vector = (cosH, -sinH)
      const perpX = cosH * 0.55 * sideSign;
      const perpZ = -sinH * 0.55 * sideSign;

      const baseX = pt.x + perpX;
      const baseZ = pt.z + perpZ;

      const distAhead = pt.distFromStart - walkedDist;
      const isUpcoming = distAhead >= -1.5 && distAhead <= 22;
      const isPassed = distAhead < -1.5;
      const scale = isPassed
        ? 0.55
        : isUpcoming
          ? 1.05 + Math.sin(t * 5.5 - i * 0.5) * 0.14
          : 0.85;

      const baseElev = getTerrainElevation(baseX, baseZ);

      // 1. Main Palm Pad
      dummy.position.set(baseX, baseElev + 0.14, baseZ);
      dummy.rotation.set(0, pt.heading, 0);
      dummy.scale.set(scale * 1.1, scale * 0.35, scale * 0.95);
      dummy.updateMatrix();
      palm.setMatrixAt(i, dummy.matrix);

      // 2. Left Toe Bean (forward + left)
      const fwdL_X = sinH * (0.48 * scale) - cosH * (0.36 * scale);
      const fwdL_Z = cosH * (0.48 * scale) + sinH * (0.36 * scale);
      dummy.position.set(baseX + fwdL_X, baseElev + 0.15, baseZ + fwdL_Z);
      dummy.scale.set(scale * 0.42, scale * 0.3, scale * 0.52);
      dummy.updateMatrix();
      toeL.setMatrixAt(i, dummy.matrix);

      // 3. Center Toe Bean (further forward)
      const fwdM_X = sinH * (0.62 * scale);
      const fwdM_Z = cosH * (0.62 * scale);
      dummy.position.set(baseX + fwdM_X, baseElev + 0.15, baseZ + fwdM_Z);
      dummy.scale.set(scale * 0.44, scale * 0.3, scale * 0.55);
      dummy.updateMatrix();
      toeM.setMatrixAt(i, dummy.matrix);

      // 4. Right Toe Bean (forward + right)
      const fwdR_X = sinH * (0.48 * scale) + cosH * (0.36 * scale);
      const fwdR_Z = cosH * (0.48 * scale) - sinH * (0.36 * scale);
      dummy.position.set(baseX + fwdR_X, baseElev + 0.15, baseZ + fwdR_Z);
      dummy.scale.set(scale * 0.42, scale * 0.3, scale * 0.52);
      dummy.updateMatrix();
      toeR.setMatrixAt(i, dummy.matrix);

      if (isPassed) {
        tempColor.copy(colorPassed);
      } else if (isUpcoming) {
        tempColor.copy(colorUpcoming);
      } else {
        tempColor.lerpColors(colorUpcoming, colorFuture, 0.65);
      }

      palm.setColorAt(i, tempColor);
      toeL.setColorAt(i, tempColor);
      toeM.setColorAt(i, tempColor);
      toeR.setColorAt(i, tempColor);
    }

    palm.instanceMatrix.needsUpdate = true;
    toeL.instanceMatrix.needsUpdate = true;
    toeM.instanceMatrix.needsUpdate = true;
    toeR.instanceMatrix.needsUpdate = true;
    if (palm.instanceColor) palm.instanceColor.needsUpdate = true;
    if (toeL.instanceColor) toeL.instanceColor.needsUpdate = true;
    if (toeM.instanceColor) toeM.instanceColor.needsUpdate = true;
    if (toeR.instanceColor) toeR.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={palmRef} args={[undefined, undefined, MAX_PAW_PRINTS]} frustumCulled={false}>
        <sphereGeometry args={[0.42, 14, 10]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#F59E0B" emissiveIntensity={0.35} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={toeLRefHelper(toeLeftRef)} args={[undefined, undefined, MAX_PAW_PRINTS]} frustumCulled={false}>
        <sphereGeometry args={[0.38, 12, 10]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#F59E0B" emissiveIntensity={0.35} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={toeLRefHelper(toeMidRef)} args={[undefined, undefined, MAX_PAW_PRINTS]} frustumCulled={false}>
        <sphereGeometry args={[0.38, 12, 10]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#F59E0B" emissiveIntensity={0.35} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={toeLRefHelper(toeRightRef)} args={[undefined, undefined, MAX_PAW_PRINTS]} frustumCulled={false}>
        <sphereGeometry args={[0.38, 12, 10]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#F59E0B" emissiveIntensity={0.35} roughness={0.4} />
      </instancedMesh>
    </group>
  );
};

function toeLRefHelper(ref: React.RefObject<THREE.InstancedMesh>) {
  return ref;
}
