import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CAMPUS_PLACES } from '../data/campusPlaces';
import {
  DEFAULT_CAMPUS_GRAPH,
  detourSegmentAroundBuildings,
} from '../navigation/campusGraph';
import { distanceXZ, WorldXZ } from '../navigation/projection';

/**
 * Computes minimum distance from point P to line segment A-B in XZ plane.
 */
function distToSegmentXZ(p: WorldXZ, a: WorldXZ, b: WorldXZ): number {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const lenSq = dx * dx + dz * dz;
  if (lenSq < 1e-6) return distanceXZ(p, a);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / lenSq));
  return Math.hypot(p.x - (a.x + t * dx), p.z - (a.z + t * dz));
}

/**
 * Generates multi-puff clay trees and warm campus street lamps that NEVER overlap
 * buildings, front-door plazas, or walkway roads.
 */
export const InstancedTrees: React.FC = () => {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const crownMainRef = useRef<THREE.InstancedMesh>(null);
  const crownLeftRef = useRef<THREE.InstancedMesh>(null);
  const crownRightRef = useRef<THREE.InstancedMesh>(null);
  const shadowRef = useRef<THREE.InstancedMesh>(null);

  const { trees, lamps } = useMemo(() => {
    // Collect all walkway segments so trees never spawn on roads!
    const walkwaySegs: Array<[WorldXZ, WorldXZ]> = [];
    for (const edge of DEFAULT_CAMPUS_GRAPH.edges) {
      const nA = DEFAULT_CAMPUS_GRAPH.nodes[edge.from];
      const nB = DEFAULT_CAMPUS_GRAPH.nodes[edge.to];
      if (!nA || !nB) continue;
      const chain = detourSegmentAroundBuildings(nA.visualWalkPos, nB.visualWalkPos, 2.0);
      for (let i = 0; i < chain.length - 1; i++) {
        walkwaySegs.push([chain[i], chain[i + 1]]);
      }
    }

    const isClearOfBuildingsAndRoads = (pt: WorldXZ, roadMargin = 5.2, bldgMargin = 13.5) => {
      for (const place of CAMPUS_PLACES) {
        const hw = place.footprintSize.width * 0.5 + bldgMargin * 0.65;
        const hd = place.footprintSize.depth * 0.5 + bldgMargin * 0.65;
        if (Math.abs(pt.x - place.visualPos.x) < hw && Math.abs(pt.z - place.visualPos.z) < hd) {
          return false;
        }
        if (distanceXZ(pt, place.entranceVisualPos) < 7.0) {
          return false;
        }
      }
      for (const [a, b] of walkwaySegs) {
        if (distToSegmentXZ(pt, a, b) < roadMargin) {
          return false;
        }
      }
      return true;
    };

    const treePts: Array<{ x: number; z: number; scale: number; tint: string }> = [];
    // Lush palette: cherry blossom lavenders + emerald greens + sunny golden honey
    const palette = [
      '#D582D2',
      '#E8A0E8',
      '#BE6CBD',
      '#FFAEC9',
      '#C084FC',
      '#34D399',
      '#4ADE80',
      '#10B981',
      '#FBBF24',
      '#F59E0B',
    ];

    let seed = 108;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    for (let i = 0; i < 480 && treePts.length < 110; i++) {
      const x = (rand() - 0.5) * 215;
      const z = (rand() - 0.5) * 320;
      if (!isClearOfBuildingsAndRoads({ x, z }, 5.2, 12.0)) continue;
      if (treePts.some((existing) => distanceXZ({ x, z }, existing) < 6.8)) continue;

      treePts.push({
        x,
        z,
        scale: 0.88 + rand() * 0.48,
        tint: palette[treePts.length % palette.length],
      });
    }

    // Place 24 warm street lamps neatly alongside the main walkway junctions
    const lampPts: Array<{ x: number; z: number }> = [];
    for (const node of Object.values(DEFAULT_CAMPUS_GRAPH.nodes)) {
      if (lampPts.length >= 24) break;
      const candidate = { x: node.visualWalkPos.x + 3.4, z: node.visualWalkPos.z + 2.2 };
      if (isClearOfBuildingsAndRoads(candidate, 2.3, 6.0)) {
        lampPts.push(candidate);
      }
    }

    return { trees: treePts, lamps: lampPts };
  }, []);

  useLayoutEffect(() => {
    if (
      !trunkRef.current ||
      !crownMainRef.current ||
      !crownLeftRef.current ||
      !crownRightRef.current ||
      !shadowRef.current
    ) {
      return;
    }

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    trees.forEach((tree, i) => {
      const s = tree.scale;
      // Ground shadow
      dummy.position.set(tree.x, 0.05, tree.z);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.setScalar(s * 2.1);
      dummy.updateMatrix();
      shadowRef.current!.setMatrixAt(i, dummy.matrix);

      // Trunk
      dummy.position.set(tree.x, 1.35 * s, tree.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      trunkRef.current!.setMatrixAt(i, dummy.matrix);

      // Main center foliage puff
      dummy.position.set(tree.x, 3.6 * s, tree.z);
      dummy.scale.set(s * 1.1, s * 1.15, s * 1.1);
      dummy.updateMatrix();
      crownMainRef.current!.setMatrixAt(i, dummy.matrix);
      crownMainRef.current!.setColorAt(i, color.set(tree.tint));

      // Left lower foliage puff
      dummy.position.set(tree.x - 0.95 * s, 2.95 * s, tree.z + 0.45 * s);
      dummy.scale.setScalar(s * 0.78);
      dummy.updateMatrix();
      crownLeftRef.current!.setMatrixAt(i, dummy.matrix);
      crownLeftRef.current!.setColorAt(i, color.set(tree.tint).offsetHSL(0, 0, -0.04));

      // Right upper foliage puff
      dummy.position.set(tree.x + 0.85 * s, 3.25 * s, tree.z - 0.45 * s);
      dummy.scale.setScalar(s * 0.82);
      dummy.updateMatrix();
      crownRightRef.current!.setMatrixAt(i, dummy.matrix);
      crownRightRef.current!.setColorAt(i, color.set(tree.tint).offsetHSL(0, 0, 0.05));
    });

    shadowRef.current.instanceMatrix.needsUpdate = true;
    trunkRef.current.instanceMatrix.needsUpdate = true;
    crownMainRef.current.instanceMatrix.needsUpdate = true;
    crownLeftRef.current.instanceMatrix.needsUpdate = true;
    crownRightRef.current.instanceMatrix.needsUpdate = true;
    if (crownMainRef.current.instanceColor) crownMainRef.current.instanceColor.needsUpdate = true;
    if (crownLeftRef.current.instanceColor) crownLeftRef.current.instanceColor.needsUpdate = true;
    if (crownRightRef.current.instanceColor) crownRightRef.current.instanceColor.needsUpdate = true;
  }, [trees]);

  return (
    <group>
      {/* Tree ground contact shadows */}
      <instancedMesh ref={shadowRef} args={[undefined, undefined, trees.length]} frustumCulled={false}>
        <circleGeometry args={[1.0, 16]} />
        <meshBasicMaterial color="#160C22" transparent opacity={0.28} depthWrite={false} />
      </instancedMesh>

      {/* Tree Trunks in Dark Cedar */}
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow frustumCulled={false}>
        <cylinderGeometry args={[0.32, 0.55, 2.7, 12]} />
        <meshStandardMaterial color="#3E222A" roughness={0.78} />
      </instancedMesh>

      {/* 3-Cluster Puffy Clay Foliage Crowns */}
      <instancedMesh ref={crownMainRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow frustumCulled={false}>
        <sphereGeometry args={[1.65, 20, 20]} />
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.52} clearcoat={0.3} clearcoatRoughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={crownLeftRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow frustumCulled={false}>
        <sphereGeometry args={[1.55, 18, 18]} />
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.52} clearcoat={0.3} clearcoatRoughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={crownRightRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow frustumCulled={false}>
        <sphereGeometry args={[1.55, 18, 18]} />
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.52} clearcoat={0.3} clearcoatRoughness={0.4} />
      </instancedMesh>

      {/* Stylized Campus Street Lamps along Walkways (Dark Plum Post + Warm Glowing Amber Lantern) */}
      {lamps.map((lamp, idx) => (
        <group key={`lamp-${idx}`} position={[lamp.x, 0, lamp.z]}>
          <mesh position={[0, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.18, 3.6, 10]} />
            <meshStandardMaterial color="#231535" roughness={0.45} />
          </mesh>
          <mesh position={[0, 3.7, 0]}>
            <sphereGeometry args={[0.42, 14, 14]} />
            <meshStandardMaterial
              color="#FFF7ED"
              emissive="#F59E0B"
              emissiveIntensity={1.2}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
