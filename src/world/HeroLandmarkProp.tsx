import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { animate } from 'animejs';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HeroLandmarkType } from '../data/campusPlaces';

interface HeroLandmarkPropProps {
  type: HeroLandmarkType;
  roofY: number;
  isSelected: boolean;
}

export const HeroLandmarkProp: React.FC<HeroLandmarkPropProps> = ({
  type,
  roofY,
  isSelected,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const animPartRef = useRef<any>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    if (isSelected) {
      animate(groupRef.current.scale, {
        x: [1, 1.34, 1.18, 1.25],
        y: [1, 1.34, 1.18, 1.25],
        z: [1, 1.34, 1.18, 1.25],
        duration: 650,
        ease: 'outElastic(1, .5)',
      });
    } else {
      animate(groupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 350,
        ease: 'outQuad',
      });
    }
  }, [isSelected]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (!animPartRef.current) return;
    if (type === 'gear') {
      animPartRef.current.rotation.z = t * 0.65;
    } else if (type === 'book') {
      animPartRef.current.rotation.z = Math.sin(t * 2.1) * 0.16;
    } else if (type === 'briefcase') {
      animPartRef.current.position.y = Math.abs(Math.sin(t * 2.4)) * 0.45;
    } else if (type === 'flagpole') {
      animPartRef.current.rotation.y = Math.sin(t * 3.5) * 0.25;
    } else if (type === 'cup') {
      animPartRef.current.position.y = 2.6 + ((t * 0.9) % 1.4);
      const s = 1 - ((t * 0.9) % 1.4) * 0.45;
      animPartRef.current.scale.setScalar(Math.max(0.2, s));
    } else if (type === 'stage') {
      animPartRef.current.scale.x = 1 + Math.sin(t * 2.2) * 0.08;
    } else if (type === 'computer') {
      const mat = animPartRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 0.45 + Math.sin(t * 3.2) * 0.25;
      }
    }
  });

  if (type === 'none') return null;

  return (
    <group ref={groupRef} position={[0, roofY + 0.6, 0]}>
      {/* Small clay pedestal base */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[2.6, 2.9, 0.5, 20]} />
        <meshStandardMaterial color="#FFFDF9" roughness={0.85} />
      </mesh>

      {type === 'computer' && (
        <group position={[0, 1.9, 0]}>
          <RoundedBox args={[3.8, 2.8, 1.6]} radius={0.45} smoothness={3}>
            <meshStandardMaterial color="#FFFDF9" roughness={0.75} />
          </RoundedBox>
          <mesh ref={animPartRef} position={[0, 0.1, 0.82]}>
            <planeGeometry args={[2.8, 1.8]} />
            <meshStandardMaterial
              color="#5A4FE8"
              emissive="#7C72FF"
              emissiveIntensity={0.5}
              roughness={0.4}
            />
          </mesh>
          <RoundedBox args={[2.2, 0.4, 1.2]} position={[0, -1.6, 0.3]} radius={0.15}>
            <meshStandardMaterial color="#C9BFFF" roughness={0.8} />
          </RoundedBox>
        </group>
      )}

      {type === 'gear' && (
        <group position={[0, 2.3, 0]}>
          <mesh ref={animPartRef}>
            <torusGeometry args={[1.55, 0.55, 12, 8]} />
            <meshStandardMaterial color="#5A4FE8" roughness={0.65} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.7, 0.7, 0.8, 16]} />
            <meshStandardMaterial color="#FFE59A" roughness={0.75} />
          </mesh>
        </group>
      )}

      {type === 'book' && (
        <group position={[0, 1.4, 0]} ref={animPartRef}>
          <RoundedBox
            args={[2.4, 0.45, 3.0]}
            position={[-1.05, 0.2, 0]}
            rotation={[0, 0, 0.22]}
            radius={0.15}
          >
            <meshStandardMaterial color="#5A4FE8" roughness={0.75} />
          </RoundedBox>
          <RoundedBox
            args={[2.4, 0.45, 3.0]}
            position={[1.05, 0.2, 0]}
            rotation={[0, 0, -0.22]}
            radius={0.15}
          >
            <meshStandardMaterial color="#FF7E6B" roughness={0.75} />
          </RoundedBox>
          <RoundedBox
            args={[2.1, 0.35, 2.7]}
            position={[-0.95, 0.48, 0]}
            rotation={[0, 0, 0.18]}
            radius={0.1}
          >
            <meshStandardMaterial color="#FFFDF9" roughness={0.85} />
          </RoundedBox>
          <RoundedBox
            args={[2.1, 0.35, 2.7]}
            position={[0.95, 0.48, 0]}
            rotation={[0, 0, -0.18]}
            radius={0.1}
          >
            <meshStandardMaterial color="#FFFDF9" roughness={0.85} />
          </RoundedBox>
        </group>
      )}

      {type === 'briefcase' && (
        <group position={[0, 1.6, 0]}>
          <mesh ref={animPartRef}>
            <RoundedBox args={[3.4, 2.4, 1.3]} radius={0.35} smoothness={3}>
              <meshStandardMaterial color="#D97736" roughness={0.75} />
            </RoundedBox>
            <mesh position={[0, 1.45, 0]}>
              <torusGeometry args={[0.65, 0.18, 10, 16, Math.PI]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.5} />
            </mesh>
          </mesh>
        </group>
      )}

      {type === 'stage' && (
        <group position={[0, 1.8, 0]}>
          <RoundedBox args={[4.4, 2.8, 1.8]} radius={0.35}>
            <meshStandardMaterial color="#FFFDF9" roughness={0.8} />
          </RoundedBox>
          <mesh ref={animPartRef} position={[-1.4, 0.1, 0.92]}>
            <boxGeometry args={[1.2, 2.3, 0.25]} />
            <meshStandardMaterial color="#FF7E6B" roughness={0.7} />
          </mesh>
          <mesh position={[1.4, 0.1, 0.92]}>
            <boxGeometry args={[1.2, 2.3, 0.25]} />
            <meshStandardMaterial color="#FF7E6B" roughness={0.7} />
          </mesh>
        </group>
      )}

      {type === 'amphitheatre' && (
        <group position={[0, 0.9, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[2.8, 3.1, 0.55, 16, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#FFE59A" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.55, -0.2]}>
            <cylinderGeometry args={[2.0, 2.3, 0.55, 16, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#C9BFFF" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.1, -0.4]}>
            <cylinderGeometry args={[1.2, 1.5, 0.55, 16, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#BFE0FF" roughness={0.8} />
          </mesh>
        </group>
      )}

      {type === 'temple' && (
        <group position={[0, 1.8, 0]}>
          <mesh position={[0, 0.6, 0]}>
            <coneGeometry args={[2.2, 3.6, 8]} />
            <meshStandardMaterial color="#FFC9B0" roughness={0.75} />
          </mesh>
          <mesh position={[0, 2.6, 0]}>
            <sphereGeometry args={[0.45, 14, 14]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.4} />
          </mesh>
        </group>
      )}

      {type === 'arch' && (
        <group position={[0, 1.8, 0]}>
          <RoundedBox args={[1.1, 3.2, 1.1]} position={[-1.6, 0, 0]} radius={0.25}>
            <meshStandardMaterial color="#FFC9B0" roughness={0.8} />
          </RoundedBox>
          <RoundedBox args={[1.1, 3.2, 1.1]} position={[1.6, 0, 0]} radius={0.25}>
            <meshStandardMaterial color="#FFC9B0" roughness={0.8} />
          </RoundedBox>
          <RoundedBox args={[4.8, 1.1, 1.4]} position={[0, 1.6, 0]} radius={0.3}>
            <meshStandardMaterial color="#5A4FE8" roughness={0.75} />
          </RoundedBox>
        </group>
      )}

      {type === 'flagpole' && (
        <group position={[0, 0.5, 0]}>
          <mesh position={[0, 2.4, 0]}>
            <cylinderGeometry args={[0.16, 0.22, 4.8, 10]} />
            <meshStandardMaterial color="#FFFDF9" roughness={0.6} />
          </mesh>
          <mesh ref={animPartRef} position={[1.1, 4.1, 0]}>
            <boxGeometry args={[2.1, 1.2, 0.18]} />
            <meshStandardMaterial color="#FF7E6B" roughness={0.7} />
          </mesh>
        </group>
      )}

      {type === 'cup' && (
        <group position={[0, 1.3, 0]}>
          <mesh>
            <cylinderGeometry args={[1.35, 1.05, 2.1, 18]} />
            <meshStandardMaterial color="#FFFDF9" roughness={0.75} />
          </mesh>
          <mesh position={[1.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.55, 0.18, 10, 16, Math.PI]} />
            <meshStandardMaterial color="#FFE59A" roughness={0.75} />
          </mesh>
          <mesh ref={animPartRef} position={[0, 2.6, 0]}>
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshStandardMaterial color="#FFFDF9" transparent opacity={0.75} roughness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
};
