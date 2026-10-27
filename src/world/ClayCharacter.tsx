import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { TopStyle, UserCharacterProfile } from '../store/storage';
import { UIMode } from '../store/useCampusStore';
import { worldMotionRef } from '../store/worldMotionRef';
import { getTerrainElevation } from './terrainElevation';

useGLTF.preload('/models/Xbot.glb');

interface ClayCharacterProps {
  profile: UserCharacterProfile;
  uiMode: UIMode;
}

// Bone index groupings in Xbot.glb skeleton
const TORSO_BONES = new Set([1, 2, 3, 9, 33]); // Spine, Spine1, Spine2, LeftShoulder, RightShoulder
const UPPER_ARM_BONES = new Set([10, 34]); // LeftArm, RightArm
const FOREARM_BONES = new Set([11, 35]); // LeftForeArm, RightForeArm
const PANTS_BONES = new Set([0, 57, 58, 62, 63]); // Hips, Thighs, Calves
const SHOES_BONES = new Set([59, 60, 61, 64, 65, 66]); // Feet, Toes
const HEAD_BONES = new Set([4, 5, 6, 7, 8]); // Neck, Head

/**
 * Assigns vertex colors to skinned meshes so that:
 * - Upper torso and arms dynamically take `outfitColor` (Jacket / Hoodie / Shirt / T-Shirt)
 * - T-Shirts have short sleeves: upper arms are colored, while forearms and hands show bare skin!
 * - Lower body takes athletic dark slate `#1E293B` (Joggers / Pants)
 * - Feet take athletic white `#F8FAFC` (Sneakers / Shoes)
 * - Head, neck, and hands take `skinTone`
 *
 * This completely eliminates rigid geometry clipping through the body during animations!
 */
function applyVertexColors(
  mesh: THREE.SkinnedMesh,
  outfitColorHex: string,
  skinToneHex: string,
  topStyle: TopStyle = 'jacket'
) {
  const geom = mesh.geometry;
  if (!geom || !geom.attributes.position || !geom.attributes.skinIndex || !geom.attributes.skinWeight) return;

  const count = geom.attributes.position.count;
  const sIdx = geom.attributes.skinIndex;
  const sW = geom.attributes.skinWeight;
  const pos = geom.attributes.position;

  let colorAttr = geom.attributes.color as THREE.BufferAttribute;
  if (!colorAttr || colorAttr.count !== count) {
    colorAttr = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    geom.setAttribute('color', colorAttr);
  }

  const outfitC = new THREE.Color(outfitColorHex || '#159A74');
  const skinC = new THREE.Color(skinToneHex || '#E59866');
  const pantsC = new THREE.Color('#1E293B');
  const shoesC = new THREE.Color('#F8FAFC');

  // Specific styling palettes
  const whiteC = new THREE.Color('#FFFFFF');
  const silverC = new THREE.Color('#CBD5E1');
  const pouchC = outfitC.clone().multiplyScalar(0.72); // Darker fleece shade for hoodie kangaroo pouch
  const ribbedCuffC = new THREE.Color('#1E293B');

  const colors = colorAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    let maxW = -1;
    let domJ = 0;
    for (let k = 0; k < 4; k++) {
      const w = sW.getComponent(i, k);
      if (w > maxW) {
        maxW = w;
        domJ = sIdx.getComponent(i, k);
      }
    }

    let c = outfitC;
    if (domJ === 0) {
      // Hips & Pelvis:
      // The upper waist (vy > 0.96) is naturally covered by the top/jacket/hoodie/shirt hem!
      // The lower pelvis (vy <= 0.96) is the start of the athletic pants/joggers.
      c = vy > 0.96 ? outfitC : pantsC;
    } else if (domJ === 57 || domJ === 58 || domJ === 62 || domJ === 63) {
      c = pantsC; // Thighs, Calves
    } else if (SHOES_BONES.has(domJ)) {
      c = shoesC; // Athletic Runner Sneakers
    } else if (HEAD_BONES.has(domJ)) {
      c = skinC; // Head & Neck
    } else if (domJ === 12 || domJ === 36 || (domJ >= 13 && domJ <= 32) || (domJ >= 37 && domJ <= 56)) {
      c = skinC; // Hands & Fingers
    } else {
      // -----------------------------------------------------------
      // UPPER BODY TOPS (TORSO & ARMS): VIVID DISTINCT PATTERNS
      // -----------------------------------------------------------
      const isTorso = domJ === 1 || domJ === 2 || domJ === 3 || domJ === 9 || domJ === 33;

      if (topStyle === 'tshirt') {
        // =========================================================
        // 1. T-SHIRT: Short sleeves (forearms bare skin) + Crewneck
        // =========================================================
        if (FOREARM_BONES.has(domJ)) {
          c = skinC; // Bare skin forearms!
        } else if (isTorso && vy > 1.34 && Math.abs(vx) < 0.05) {
          c = whiteC; // Crewneck collar accent
        } else {
          c = outfitC; // T-Shirt torso & short sleeves
        }

      } else if (topStyle === 'jacket') {
        // =========================================================
        // 2. ZIP TRACK JACKET: Two-tone white yoke + silver center zipper
        // =========================================================
        const isCenterZipper = isTorso && vz > 0.022 && Math.abs(vx) < 0.016;
        const isUpperYoke = isTorso && vy > 1.28;
        const isSleeveStripe = (domJ === 10 || domJ === 34 || domJ === 11 || domJ === 35) && vy > 1.44;

        if (isCenterZipper) {
          c = silverC; // Metallic silver center zipper track!
        } else if (isUpperYoke || isSleeveStripe) {
          c = whiteC; // Two-tone crisp white athletic yoke across chest/shoulders & sleeves!
        } else {
          c = outfitC; // Primary jacket body color
        }

      } else if (topStyle === 'hoodie') {
        // =========================================================
        // 3. HOODIE: Kangaroo pouch pocket + ribbed waistband & cuffs
        // =========================================================
        const isKangarooPouch = isTorso && vz > 0.035 && vy >= 1.15 && vy <= 1.25 && Math.abs(vx) < 0.085;
        const isWristCuff = (domJ === 11 || domJ === 35) && (Math.abs(vx) > 0.43);
        const isHemBand = isTorso && vy < 1.18;

        if (isKangarooPouch) {
          c = pouchC; // Darker fleece kangaroo pouch on the belly!
        } else if (isWristCuff || isHemBand) {
          c = ribbedCuffC; // Ribbed cuffs and hem waistband
        } else {
          c = outfitC; // Soft campus fleece body
        }

      } else if (topStyle === 'shirt') {
        // =========================================================
        // 4. OXFORD SHIRT: Button placket + white collar + cuffs
        // =========================================================
        const isButtonPlacket = isTorso && vz > 0.035 && Math.abs(vx) < 0.02;
        const isWhiteCollar = isTorso && vy > 1.32 && Math.abs(vx) < 0.07;
        const isShirtCuff = (domJ === 11 || domJ === 35) && (Math.abs(vx) > 0.43);

        if (isButtonPlacket) {
          c = whiteC; // Crisp white vertical center button placket!
        } else if (isWhiteCollar) {
          c = whiteC; // Crisp folded white oxford collar!
        } else if (isShirtCuff) {
          c = whiteC; // Clean white shirt wrist cuffs!
        } else {
          c = outfitC; // Oxford shirt color
        }
      }
    }

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  colorAttr.needsUpdate = true;
}

/**
 * Athletic Human Character Model (`ClayCharacter.tsx`)
 *
 * Fully-rigged athletic humanoid character with:
 * - Rigged humanoid skeleton (Xbot) with fluid walk, run, idle, and celebration animations
 * - Dynamic Tops (Jacket, Hoodie, T-Shirt, Shirt) colored by `profile.outfitColor` with zero clipping
 * - Distinct body silhouettes for Men (broad athletic frame) vs Women (slender waist, wider hips)
 * - Expressive anime-styled human faces (women almond winged eyes + coral smirk; men bold brows + teeth smile)
 * - 4 distinct hairstyles for Men and 4 for Women
 * - Removable athletic headwear (cap, beanie, sprout) with automatic hair clipping prevention
 */
export const ClayCharacter: React.FC<ClayCharacterProps> = ({ profile, uiMode }) => {
  const rootRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const activeActionRef = useRef<string>('idle');

  const { scene, animations } = useGLTF('/models/Xbot.glb');

  // Clone the skinned model once so instances do not corrupt bone hierarchies
  const clonedScene = useMemo(() => {
    return clone(scene);
  }, [scene]);

  // Strip '.scale' tracks from animation clips so custom body proportions (Men vs Women) are never overwritten by animations
  const sanitizedAnimations = useMemo(() => {
    return animations.map((clip) => {
      const clonedClip = clip.clone();
      clonedClip.tracks = clonedClip.tracks.filter((track) => !track.name.endsWith('.scale'));
      return clonedClip;
    });
  }, [animations]);

  // Connect Drei animations directly to the cloned skinned model
  const { actions } = useAnimations(sanitizedAnimations, clonedScene);

  // Dynamic physical material with vertexColors enabled for seamless tops, pants, shoes, and skin
  const charMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.44,
      metalness: 0.08,
      clearcoat: 0.18,
      clearcoatRoughness: 0.3,
    });
  }, []);

  // Bind material and apply vertex colors to both Beta_Surface and Beta_Joints
  useEffect(() => {
    clonedScene.traverse((child) => {
      const mesh = child as THREE.SkinnedMesh;
      if (mesh.isSkinnedMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material = charMaterial;
        applyVertexColors(mesh, profile.outfitColor, profile.skinTone, profile.topStyle);
      }
    });
  }, [clonedScene, charMaterial, profile.outfitColor, profile.skinTone, profile.topStyle]);

  // Ensure all bones retain standard humanoid 1.0 proportions (no T-Rex legs or pinched waist)
  useEffect(() => {
    clonedScene.traverse((child) => {
      const bone = child as THREE.Bone;
      if (bone.isBone) {
        bone.scale.set(1, 1, 1);
      }
    });
  }, [clonedScene]);

  // ==============================================================
  // ATTACH VISIBLE FACE FEATURES, HAIR & HEADWEAR TO HEAD BONE
  // ==============================================================
  useEffect(() => {
    const headBone = clonedScene.getObjectByName('mixamorigHead');
    if (!headBone) return;

    const removeGroup = (parent: THREE.Object3D | undefined, name: string) => {
      if (!parent) return;
      const prev = parent.getObjectByName(name);
      if (prev) parent.remove(prev);
    };

    removeGroup(headBone, 'navdex-face-features');
    removeGroup(headBone, 'navdex-hair');
    removeGroup(headBone, 'navdex-under-cap-hair');
    removeGroup(headBone, 'navdex-headwear');

    const hairColor = profile.hairColor || '#241C16';
    const outfitColor = profile.outfitColor || '#FFFFFF';
    const skinColor = profile.skinTone || '#E59866';

    // Rich physical hair material with specular clearcoat, sheen, and angel-ring highlight
    const hairColorObj = new THREE.Color(hairColor);
    const highlightColor = hairColorObj.clone().lerp(new THREE.Color('#FFFFFF'), 0.40);
    const darkHairTone = hairColorObj.clone().lerp(new THREE.Color('#000000'), 0.22);

    const hairMat = new THREE.MeshPhysicalMaterial({
      color: hairColor,
      roughness: 0.26,
      metalness: 0.06,
      clearcoat: 0.95,
      clearcoatRoughness: 0.10,
      sheen: 0.90,
      sheenColor: highlightColor,
      sheenRoughness: 0.20,
    });

    const hairHighlightMat = new THREE.MeshBasicMaterial({
      color: highlightColor,
      transparent: true,
      opacity: 0.45,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });

    const hairDarkMat = new THREE.MeshPhysicalMaterial({
      color: darkHairTone,
      roughness: 0.35,
      metalness: 0.04,
      clearcoat: 0.50,
      clearcoatRoughness: 0.20,
    });

    const skinMat = new THREE.MeshPhysicalMaterial({
      color: skinColor,
      roughness: 0.44,
    });

    const whiteMat = new THREE.MeshBasicMaterial({
      color: '#FFFFFF',
      polygonOffset: true,
      polygonOffsetFactor: -4,
    });
    const darkLashMat = new THREE.MeshBasicMaterial({
      color: '#18181B',
      polygonOffset: true,
      polygonOffsetFactor: -5,
    });
    const irisMat = new THREE.MeshBasicMaterial({
      color: '#5E2B0C',
      polygonOffset: true,
      polygonOffsetFactor: -4.5,
    });
    const pupilMat = new THREE.MeshBasicMaterial({
      color: '#090808',
      polygonOffset: true,
      polygonOffsetFactor: -4.8,
    });
    const browMat = new THREE.MeshBasicMaterial({
      color: hairColor,
      polygonOffset: true,
      polygonOffsetFactor: -4,
    });
    const mouthMat = new THREE.MeshBasicMaterial({
      color: '#991B1B',
      polygonOffset: true,
      polygonOffsetFactor: -4,
    });

    // -------------------------------------------------------------
    // 1. VISIBLE FACIAL FEATURES (Exact Coordinates on Face Surface)
    // -------------------------------------------------------------
    const isWomen = profile.avatarGender === 'women';
    const faceGroup = new THREE.Group();
    faceGroup.name = 'navdex-face-features';

    if (isWomen) {
      // =========================================================
      // WOMEN: Warm brown/hazel almond eyes with winged eyeliner,
      // softly arched brows, delicate button nose, sweet coral smirk
      // (Matches reference uploaded_media_4_1792420655442.png & uploaded_media_1_1792420655442.png)
      // =========================================================
      const womenIrisMat = new THREE.MeshBasicMaterial({
        color: '#6E3214',
        polygonOffset: true,
        polygonOffsetFactor: -4.5,
      });
      const pupilMat = new THREE.MeshBasicMaterial({
        color: '#0D0808',
        polygonOffset: true,
        polygonOffsetFactor: -4.8,
      });
      const womenMouthMat = new THREE.MeshBasicMaterial({
        color: '#D95D70', // Natural sweet coral-rose lip color
        polygonOffset: true,
        polygonOffsetFactor: -4,
      });

      [-3.24, 3.24].forEach((eyeX, idx) => {
        const isLeft = idx === 0;
        const eye = new THREE.Group();
        eye.position.set(eyeX, 9.85, 13.18);
        eye.rotation.set(0.08, isLeft ? -0.1 : 0.1, isLeft ? -0.06 : 0.06);

        // Sclera (Almond White Base)
        const sclera = new THREE.Mesh(new THREE.CircleGeometry(1.62, 24), whiteMat);
        sclera.scale.set(1.22, 0.96, 1);
        eye.add(sclera);

        // Luminous Hazel-Chestnut Iris
        const iris = new THREE.Mesh(new THREE.CircleGeometry(1.05, 20), womenIrisMat);
        iris.position.set(isLeft ? 0.16 : -0.16, 0, 0.02);
        iris.scale.set(1.0, 0.95, 1);
        eye.add(iris);

        // Pupil
        const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.52, 16), pupilMat);
        pupil.position.set(isLeft ? 0.16 : -0.16, 0, 0.03);
        eye.add(pupil);

        // Catchlights (Sparkles)
        const shine1 = new THREE.Mesh(new THREE.CircleGeometry(0.34, 10), whiteMat);
        shine1.position.set(isLeft ? -0.12 : -0.38, 0.36, 0.04);
        eye.add(shine1);

        const shine2 = new THREE.Mesh(new THREE.CircleGeometry(0.18, 8), whiteMat);
        shine2.position.set(isLeft ? 0.42 : 0.14, -0.3, 0.04);
        eye.add(shine2);

        // Winged Eyeliner Arch with outer cat-eye wing flick
        const lash = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 2.5, 4, 8), darkLashMat);
        lash.rotation.z = Math.PI / 2 + (isLeft ? -0.14 : 0.14);
        lash.position.set(0, 1.25, 0.03);
        eye.add(lash);

        // Outer Wing Flick
        const wing = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.9, 4, 8), darkLashMat);
        wing.position.set(isLeft ? -1.35 : 1.35, 1.38, 0.03);
        wing.rotation.z = Math.PI / 2 + (isLeft ? -0.55 : 0.55);
        eye.add(wing);

        faceGroup.add(eye);
      });

      // Gently Arched Feminine Eyebrows
      [-3.22, 3.22].forEach((browX, idx) => {
        const isLeft = idx === 0;
        const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 2.3, 4, 8), browMat);
        brow.position.set(browX, 12.35, 12.98);
        brow.rotation.set(0.05, isLeft ? -0.12 : 0.12, Math.PI / 2 + (isLeft ? -0.16 : 0.16));
        faceGroup.add(brow);
      });

      // Dainty Button Nose
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.52, 12, 12), skinMat);
      nose.position.set(0, 7.3, 13.92);
      nose.scale.set(0.85, 0.95, 0.8);
      faceGroup.add(nose);

      // Sweet Expressive Anime Smirk/Smile (Natural coral-rose with subtle confident smirk upturn)
      const mouth = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 2.2, 4, 8), womenMouthMat);
      mouth.position.set(0.12, 5.3, 13.80);
      mouth.rotation.set(0.06, 0, Math.PI / 2 + 0.08);
      faceGroup.add(mouth);

    } else {
      // =========================================================
      // MEN: Bold slanted masculine eyebrows, straight anime nose bridge,
      // confident open anime smile showing clean white upper teeth
      // (Matches reference uploaded_media_2_1792420655442.png & uploaded_media_3_1792420655442.png)
      // =========================================================
      const menIrisMat = new THREE.MeshBasicMaterial({
        color: '#382218',
        polygonOffset: true,
        polygonOffsetFactor: -4.5,
      });
      const pupilMat = new THREE.MeshBasicMaterial({
        color: '#080808',
        polygonOffset: true,
        polygonOffsetFactor: -4.8,
      });
      const mouthCavityMat = new THREE.MeshBasicMaterial({
        color: '#420A0E',
        polygonOffset: true,
        polygonOffsetFactor: -4,
      });
      const teethMat = new THREE.MeshBasicMaterial({
        color: '#FFFFFF',
        polygonOffset: true,
        polygonOffsetFactor: -4.6,
      });
      const tongueMat = new THREE.MeshBasicMaterial({
        color: '#E11D48',
        polygonOffset: true,
        polygonOffsetFactor: -4.4,
      });

      [-3.3, 3.3].forEach((eyeX, idx) => {
        const isLeft = idx === 0;
        const eye = new THREE.Group();
        eye.position.set(eyeX, 9.8, 13.15);
        eye.rotation.set(0.08, isLeft ? -0.1 : 0.1, isLeft ? -0.06 : 0.06);

        // Sclera Base
        const sclera = new THREE.Mesh(new THREE.CircleGeometry(1.65, 24), whiteMat);
        sclera.scale.set(1.24, 0.94, 1);
        eye.add(sclera);

        // Iris
        const iris = new THREE.Mesh(new THREE.CircleGeometry(1.05, 20), menIrisMat);
        iris.position.set(isLeft ? 0.18 : -0.18, 0, 0.02);
        iris.scale.set(1.0, 0.95, 1);
        eye.add(iris);

        // Pupil
        const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.56, 16), pupilMat);
        pupil.position.set(isLeft ? 0.18 : -0.18, 0, 0.03);
        eye.add(pupil);

        // Catchlight
        const shine1 = new THREE.Mesh(new THREE.CircleGeometry(0.36, 10), whiteMat);
        shine1.position.set(isLeft ? -0.1 : -0.4, 0.35, 0.04);
        eye.add(shine1);

        // Upper Strong Lid Contour
        const lash = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 2.5, 4, 8), darkLashMat);
        lash.rotation.z = Math.PI / 2 + (isLeft ? -0.12 : 0.12);
        lash.position.set(0, 1.25, 0.03);
        eye.add(lash);

        faceGroup.add(eye);
      });

      // Bold, Thick Masculine Eyebrows (Thick athletic anime brows)
      [-3.3, 3.3].forEach((browX, idx) => {
        const isLeft = idx === 0;
        const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 2.7, 4, 8), browMat);
        brow.position.set(browX, 12.35, 13.05);
        brow.rotation.set(0.06, isLeft ? -0.15 : 0.15, Math.PI / 2 + (isLeft ? -0.32 : 0.32));
        faceGroup.add(brow);
      });

      // Chiseled Anime Nose Bridge & Angular Tip
      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.44, 2.2, 4), skinMat);
      bridge.position.set(0, 8.1, 13.92);
      bridge.rotation.set(-0.16, Math.PI / 4, 0);
      faceGroup.add(bridge);

      const noseTip = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.95, 4), skinMat);
      noseTip.position.set(0, 7.15, 14.15);
      noseTip.rotation.set(Math.PI / 2, Math.PI / 4, 0);
      faceGroup.add(noseTip);

      // Chiseled Athletic Jaw Contour (Sharper V-taper masculine jawline)
      const jaw = new THREE.Mesh(new THREE.ConeGeometry(3.6, 3.0, 4), skinMat);
      jaw.position.set(0, 3.5, 10.6);
      jaw.rotation.set(0.45, Math.PI / 4, Math.PI);
      jaw.scale.set(1.4, 0.85, 1.15);
      faceGroup.add(jaw);

      // Open, Joyful Anime Smile with Clean White Upper Teeth
      const mouthCavity = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 2.2, 4, 8), mouthCavityMat);
      mouthCavity.position.set(0, 5.2, 13.76);
      mouthCavity.rotation.z = Math.PI / 2;
      faceGroup.add(mouthCavity);

      // Row of Crisp White Upper Teeth
      const teeth = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 1.85, 4, 8), teethMat);
      teeth.position.set(0, 5.48, 13.80);
      teeth.rotation.z = Math.PI / 2;
      faceGroup.add(teeth);

      // Lower Tongue Rose Accent
      const tongue = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 1.2, 4, 8), tongueMat);
      tongue.position.set(0, 4.82, 13.78);
      tongue.rotation.z = Math.PI / 2;
      faceGroup.add(tongue);
    }

    // Sculpted Left & Right Ears
    [-8.8, 8.8].forEach((earX, idx) => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(2.1, 14, 14), skinMat);
      ear.position.set(earX, 7.5, 0.5);
      ear.scale.set(0.44, 1.3, 0.9);
      ear.rotation.y = idx === 0 ? -0.22 : 0.22;
      faceGroup.add(ear);
    });

    headBone.add(faceGroup);

    // -------------------------------------------------------------
    // 2. DETAILED DISTINCT ANIME HAIR STYLES (Volume, Texture & Sheen)
    // -------------------------------------------------------------
    const hairGroup = new THREE.Group();
    hairGroup.name = 'navdex-hair';

    // Base Scalp Layer (Cleanly covers the cranium above forehead, crown, and nape)
    const scalpCap = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat
    );
    scalpCap.position.set(0, 15.8, 1.0);
    scalpCap.scale.set(9.6, 6.9, 13.1);
    scalpCap.castShadow = true;
    hairGroup.add(scalpCap);

    // Iconic Anime "Angel Ring" (Tenshi no Wa) highlight band helper
    const addAngelRing = (radius = 9.3, tube = 0.24, y = 20.8, z = 1.0) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 6, 28, Math.PI * 0.92),
        hairHighlightMat
      );
      ring.position.set(0, y, z);
      ring.rotation.x = Math.PI * 0.44;
      hairGroup.add(ring);
    };

    const style = profile.hairStyle || 'crop';

    if (style === 'crop' || style === 'curly') {
      // =========================================================
      // MEN 1: TEXTURED CROP (Modern Caesar / Textured Fringe)
      // =========================================================
      // Layered top crown volume with directional slant
      const crownTop = new THREE.Mesh(new THREE.SphereGeometry(1.0, 20, 20), hairMat);
      crownTop.position.set(0, 22.0, 2.4);
      crownTop.scale.set(8.4, 3.4, 8.0);
      crownTop.castShadow = true;
      hairGroup.add(crownTop);

      // Textured forward lock ridges
      [-3.5, 0.0, 3.5].forEach((rx) => {
        const ridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.75, 4.2, 4, 8), hairMat);
        ridge.position.set(rx, 22.8, 4.5);
        ridge.rotation.set(-0.45, 0, rx > 0 ? -0.1 : 0.1);
        ridge.castShadow = true;
        hairGroup.add(ridge);
      });

      // 7 Pointed Textured Fringe Locks cascading over the forehead
      const fringeLocks = [
        { x: -5.0, y: 16.4, z: 13.4, rotZ: 0.18, len: 2.4, rad: 0.75 },
        { x: -3.4, y: 16.8, z: 13.9, rotZ: 0.10, len: 2.7, rad: 0.85 },
        { x: -1.7, y: 17.2, z: 14.3, rotZ: 0.04, len: 3.0, rad: 0.90 },
        { x: 0.0, y: 17.4, z: 14.5, rotZ: 0.00, len: 3.1, rad: 0.95 },
        { x: 1.7, y: 17.2, z: 14.3, rotZ: -0.04, len: 3.0, rad: 0.90 },
        { x: 3.4, y: 16.8, z: 13.9, rotZ: -0.10, len: 2.7, rad: 0.85 },
        { x: 5.0, y: 16.4, z: 13.4, rotZ: -0.18, len: 2.4, rad: 0.75 },
      ];
      fringeLocks.forEach((fl) => {
        const lock = new THREE.Mesh(new THREE.ConeGeometry(fl.rad, fl.len, 5), hairMat);
        lock.position.set(fl.x, fl.y, fl.z);
        lock.rotation.set(-0.25, 0, fl.rotZ);
        lock.castShadow = true;
        hairGroup.add(lock);
      });

      // Cropped fade sides with clean sideburn tapers
      [-8.2, 8.2].forEach((sx, idx) => {
        const isLeft = idx === 0;
        const side = new THREE.Mesh(new THREE.SphereGeometry(1.0, 14, 14), hairDarkMat);
        side.position.set(sx, 15.2, 1.5);
        side.scale.set(1.5, 5.0, 8.4);
        hairGroup.add(side);

        const burn = new THREE.Mesh(new THREE.ConeGeometry(0.8, 3.8, 4), hairMat);
        burn.position.set(sx * 0.92, 10.8, 5.2);
        burn.rotation.set(-0.15, isLeft ? 0.2 : -0.2, isLeft ? -0.15 : 0.15);
        hairGroup.add(burn);
      });

      addAngelRing(8.8, 0.22, 21.6, 2.0);

    } else if (style === 'pompadour' || style === 'swoop') {
      // =========================================================
      // MEN 2: POMPADOUR FADE (Sculpted Quiff Swept Up & Back)
      // =========================================================
      // Dynamic arched quiff wave sweeping up and back
      const frontQuiff = new THREE.Mesh(new THREE.SphereGeometry(1.0, 22, 22), hairMat);
      frontQuiff.position.set(0, 23.8, 8.5);
      frontQuiff.rotation.x = -0.25;
      frontQuiff.scale.set(8.6, 4.6, 6.8);
      frontQuiff.castShadow = true;
      hairGroup.add(frontQuiff);

      // Swept wave roll crests
      const roll1 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 7.8, 14), hairMat);
      roll1.position.set(0, 24.6, 10.2);
      roll1.rotation.z = Math.PI / 2;
      roll1.rotation.x = 0.32;
      roll1.castShadow = true;
      hairGroup.add(roll1);

      const roll2 = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 6.8, 12), hairMat);
      roll2.position.set(0, 25.4, 7.0);
      roll2.rotation.z = Math.PI / 2;
      roll2.rotation.x = 0.15;
      hairGroup.add(roll2);

      // Swept crown volume flowing smoothly to back
      const crownSwoop = new THREE.Mesh(new THREE.SphereGeometry(1.0, 18, 18), hairMat);
      crownSwoop.position.set(0, 23.0, 1.2);
      crownSwoop.scale.set(8.4, 4.0, 8.8);
      crownSwoop.castShadow = true;
      hairGroup.add(crownSwoop);

      // Sleek tapered sides
      [-8.4, 8.4].forEach((sx, idx) => {
        const isLeft = idx === 0;
        const side = new THREE.Mesh(new THREE.SphereGeometry(1.0, 14, 14), hairDarkMat);
        side.position.set(sx, 15.5, 1.0);
        side.scale.set(1.5, 5.2, 9.0);
        hairGroup.add(side);

        const burn = new THREE.Mesh(new THREE.ConeGeometry(0.85, 4.2, 5), hairMat);
        burn.position.set(sx * 0.92, 10.8, 5.0);
        burn.rotation.set(-0.15, isLeft ? 0.2 : -0.2, isLeft ? -0.15 : 0.15);
        hairGroup.add(burn);
      });

      addAngelRing(9.0, 0.24, 22.8, 2.0);

    } else if (style === 'spiky') {
      // =========================================================
      // MEN 3: SHONEN ANIME ACTION SPIKES (Tousled Volumetric Spikes)
      // =========================================================
      // Core volume
      const topBase = new THREE.Mesh(new THREE.SphereGeometry(1.0, 18, 18), hairMat);
      topBase.position.set(0, 21.8, 1.8);
      topBase.scale.set(8.2, 3.4, 8.2);
      topBase.castShadow = true;
      hairGroup.add(topBase);

      // 11 Dynamic stylized shonen anime spikes pointing in multi-directional angles
      const animeSpikes = [
        // Front fringe spikes pointing forward-down over brow
        { pos: [0.0, 22.0, 12.2], rot: [-0.48, 0, 0], s: [1.4, 3.8, 1.4] },
        { pos: [-2.6, 21.4, 11.6], rot: [-0.42, 0.22, 0.32], s: [1.2, 3.4, 1.2] },
        { pos: [2.6, 21.4, 11.6], rot: [-0.42, -0.22, -0.32], s: [1.2, 3.4, 1.2] },

        // Towering central crown spikes
        { pos: [0.0, 26.2, 5.5], rot: [-0.15, 0, 0], s: [1.5, 5.2, 1.5] },
        { pos: [-2.2, 26.0, 2.8], rot: [0.08, 0.15, 0.24], s: [1.4, 4.8, 1.4] },
        { pos: [2.2, 26.0, 2.8], rot: [0.08, -0.15, -0.24], s: [1.4, 4.8, 1.4] },

        // Lateral flared side spikes
        { pos: [-4.8, 24.2, 6.2], rot: [-0.18, 0.35, 0.42], s: [1.3, 4.2, 1.3] },
        { pos: [4.8, 24.2, 6.2], rot: [-0.18, -0.35, -0.42], s: [1.3, 4.2, 1.3] },
        { pos: [-5.2, 23.5, 0.5], rot: [0.15, 0.4, 0.48], s: [1.3, 4.2, 1.3] },
        { pos: [5.2, 23.5, 0.5], rot: [0.15, -0.4, -0.48], s: [1.3, 4.2, 1.3] },

        // Rear flick spikes
        { pos: [0.0, 24.4, -3.2], rot: [0.45, 0, 0], s: [1.4, 4.4, 1.4] },
      ];

      animeSpikes.forEach((sp) => {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(1.0, 2.0, 5), hairMat);
        cone.position.set(sp.pos[0], sp.pos[1], sp.pos[2]);
        cone.rotation.set(sp.rot[0], sp.rot[1], sp.rot[2]);
        cone.scale.set(sp.s[0], sp.s[1], sp.s[2]);
        cone.castShadow = true;
        hairGroup.add(cone);
      });

      // Sideburns
      [-7.8, 7.8].forEach((sx, idx) => {
        const burn = new THREE.Mesh(new THREE.ConeGeometry(0.85, 4.0, 4), hairMat);
        burn.position.set(sx, 11.0, 5.0);
        burn.rotation.set(-0.15, idx === 0 ? 0.2 : -0.2, idx === 0 ? -0.15 : 0.15);
        hairGroup.add(burn);
      });

    } else if (style === 'buzz') {
      // =========================================================
      // MEN 4: BUZZ FADE (Clean Military Buzz Cut & Crisp Edge-Up)
      // =========================================================
      const buzzDome = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.58),
        hairDarkMat
      );
      buzzDome.position.set(0, 16.0, 1.1);
      buzzDome.scale.set(9.8, 7.2, 13.3);
      buzzDome.castShadow = true;
      hairGroup.add(buzzDome);

      // Barbershop Crisp Edge-Up Line
      const frontEdge = new THREE.Mesh(new THREE.BoxGeometry(7.5, 1.1, 1.6), hairMat);
      frontEdge.position.set(0, 15.6, 13.6);
      frontEdge.rotation.x = -0.12;
      hairGroup.add(frontEdge);

      [-5.5, 5.5].forEach((tx, idx) => {
        const edge = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.1, 2.0), hairMat);
        edge.position.set(tx, 15.2, 13.2);
        edge.rotation.y = idx === 0 ? -0.2 : 0.2;
        hairGroup.add(edge);
      });

      [-7.8, 7.8].forEach((sx, idx) => {
        const burn = new THREE.Mesh(new THREE.ConeGeometry(0.7, 3.2, 4), hairMat);
        burn.position.set(sx, 11.2, 5.2);
        burn.rotation.set(-0.15, idx === 0 ? 0.2 : -0.2, idx === 0 ? -0.15 : 0.15);
        hairGroup.add(burn);
      });

    } else if (style === 'bob') {
      // =========================================================
      // WOMEN 1: SHOULDER BOB (Classic Inward-Curved Bob & Bangs)
      // =========================================================
      // Top crown dome with soft center parting
      const bobCrown = new THREE.Mesh(new THREE.SphereGeometry(1.0, 24, 20), hairMat);
      bobCrown.position.set(0, 19.8, 1.5);
      bobCrown.scale.set(9.6, 5.2, 10.4);
      bobCrown.castShadow = true;
      hairGroup.add(bobCrown);

      // Curved Bangs across Forehead with Feathered Tips
      const bangs = new THREE.Mesh(new THREE.CylinderGeometry(7.6, 7.9, 3.4, 18, 1, false, -1.0, 2.0), hairMat);
      bangs.position.set(0, 16.4, 8.0);
      bangs.rotation.x = 0.24;
      bangs.castShadow = true;
      hairGroup.add(bangs);

      // Tapered fringe accent locks
      [-3.2, 0, 3.2].forEach((fx) => {
        const lock = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.2, 5), hairMat);
        lock.position.set(fx, 15.2, 13.6);
        lock.rotation.set(-0.25, 0, fx > 0 ? -0.08 : 0.08);
        hairGroup.add(lock);
      });

      // Side bobs curling inward around jawline and shoulders
      [-8.8, 8.8].forEach((bx, idx) => {
        const isLeft = idx === 0;
        const sideBob = new THREE.Mesh(new THREE.CapsuleGeometry(2.6, 7.8, 8, 16), hairMat);
        sideBob.position.set(bx, 10.0, 1.0);
        sideBob.rotation.z = isLeft ? -0.15 : 0.15;
        sideBob.rotation.y = isLeft ? 0.2 : -0.2;
        sideBob.scale.set(1.1, 1.0, 1.4);
        sideBob.castShadow = true;
        hairGroup.add(sideBob);

        // Inward bottom curl
        const tuck = new THREE.Mesh(new THREE.ConeGeometry(2.4, 3.6, 6), hairMat);
        tuck.position.set(bx * 0.88, 4.8, 2.4);
        tuck.rotation.set(0.3, isLeft ? 0.2 : -0.2, isLeft ? 0.25 : -0.25);
        tuck.castShadow = true;
        hairGroup.add(tuck);

        // Cheek-framing accent lock
        const cheekLock = new THREE.Mesh(new THREE.ConeGeometry(0.65, 4.5, 5), hairMat);
        cheekLock.position.set(bx * 0.95, 9.8, 9.5);
        cheekLock.rotation.set(0.18, isLeft ? -0.12 : 0.12, isLeft ? -0.15 : 0.15);
        hairGroup.add(cheekLock);
      });

      // Full back curtain falling to nape
      const backMantle = new THREE.Mesh(new THREE.CapsuleGeometry(4.2, 7.2, 8, 16), hairMat);
      backMantle.position.set(0, 9.8, -7.5);
      backMantle.scale.set(1.9, 1.0, 1.0);
      backMantle.castShadow = true;
      hairGroup.add(backMantle);

      addAngelRing(9.2, 0.24, 20.2, 1.2);

    } else if (style === 'ponytail') {
      // =========================================================
      // WOMEN 2: HIGH PONYTAIL (Swept Crown, Scrunchie & Bouncy Tail)
      // =========================================================
      // Sleek swept-back crown
      const ponyCrown = new THREE.Mesh(new THREE.SphereGeometry(1.0, 24, 20), hairMat);
      ponyCrown.position.set(0, 18.5, 0.5);
      ponyCrown.scale.set(9.4, 6.0, 11.2);
      ponyCrown.castShadow = true;
      hairGroup.add(ponyCrown);

      // Swept hair flow lines
      [-3.0, 3.0].forEach((sx) => {
        const sweep = new THREE.Mesh(new THREE.CapsuleGeometry(1.2, 6.5, 4, 8), hairMat);
        sweep.position.set(sx, 19.5, -2.5);
        sweep.rotation.set(-0.6, sx > 0 ? -0.2 : 0.2, 0);
        hairGroup.add(sweep);
      });

      // Colorful Scrunchie at base of high ponytail
      const scrunchieMat = new THREE.MeshStandardMaterial({
        color: outfitColor || '#FF5B00',
        roughness: 0.38,
      });
      const scrunchie = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.9, 8, 22), scrunchieMat);
      scrunchie.position.set(0, 21.6, -7.0);
      scrunchie.rotation.x = Math.PI / 4;
      hairGroup.add(scrunchie);

      // Long Bouncy Ponytail Tail arching back and cascading down with tapered tip
      const tailSegments = [
        { pos: [0, 23.2, -9.6], s: [2.8, 2.8, 3.2], rotX: -0.45 },
        { pos: [0, 21.0, -12.8], s: [2.6, 3.4, 2.8], rotX: -0.18 },
        { pos: [0, 16.5, -14.4], s: [2.4, 3.8, 2.5], rotX: 0.16 },
        { pos: [0, 11.8, -13.8], s: [2.0, 3.4, 2.2], rotX: 0.30 },
      ];
      tailSegments.forEach((ts) => {
        const seg = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 16), hairMat);
        seg.position.set(ts.pos[0], ts.pos[1], ts.pos[2]);
        seg.rotation.x = ts.rotX;
        seg.scale.set(ts.s[0], ts.s[1], ts.s[2]);
        seg.castShadow = true;
        hairGroup.add(seg);
      });

      // Pointed flick tip at tail end
      const tailTip = new THREE.Mesh(new THREE.ConeGeometry(1.8, 4.2, 6), hairMat);
      tailTip.position.set(0, 8.2, -12.5);
      tailTip.rotation.set(0.42, 0, 0);
      hairGroup.add(tailTip);

      // Face-framing side wisps
      [-6.8, 6.8].forEach((wx, idx) => {
        const wisp = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 4.8, 4, 8), hairMat);
        wisp.position.set(wx, 12.0, 12.5);
        wisp.rotation.z = idx === 0 ? 0.18 : -0.18;
        hairGroup.add(wisp);
      });

      addAngelRing(9.0, 0.24, 19.5, 0.8);

    } else if (style === 'wavy') {
      // =========================================================
      // WOMEN 3: WAVY FLOW (Long Romantic Cascading Waves)
      // =========================================================
      // Voluminous Crown with gentle side-part
      const wavyCrown = new THREE.Mesh(new THREE.SphereGeometry(1.0, 24, 20), hairMat);
      wavyCrown.position.set(0, 20.2, 1.2);
      wavyCrown.scale.set(9.8, 5.4, 11.0);
      wavyCrown.castShadow = true;
      hairGroup.add(wavyCrown);

      // Front swept bangs
      const bangs = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 16), hairMat);
      bangs.position.set(-2.5, 17.6, 13.8);
      bangs.rotation.z = -0.25;
      bangs.scale.set(5.6, 2.3, 2.6);
      hairGroup.add(bangs);

      // Cascading wave ripples down left and right shoulders
      [-8.8, 8.8].forEach((sideX, idx) => {
        const isLeft = idx === 0;
        const wave1 = new THREE.Mesh(new THREE.CapsuleGeometry(2.5, 5.4, 6, 14), hairMat);
        wave1.position.set(sideX, 12.5, 3.2);
        wave1.rotation.z = isLeft ? -0.15 : 0.15;
        wave1.rotation.y = isLeft ? 0.3 : -0.3;
        wave1.castShadow = true;
        hairGroup.add(wave1);

        const wave2 = new THREE.Mesh(new THREE.CapsuleGeometry(2.3, 5.8, 6, 14), hairMat);
        wave2.position.set(sideX * 0.95, 6.8, 4.5);
        wave2.rotation.z = isLeft ? 0.12 : -0.12;
        wave2.castShadow = true;
        hairGroup.add(wave2);

        const waveTip = new THREE.Mesh(new THREE.ConeGeometry(1.8, 3.4, 5), hairMat);
        waveTip.position.set(sideX * 0.92, 2.8, 4.8);
        waveTip.rotation.set(-0.2, 0, isLeft ? 0.2 : -0.2);
        hairGroup.add(waveTip);
      });

      // Flowing Back Waves
      const backWave = new THREE.Mesh(new THREE.CapsuleGeometry(4.6, 8.8, 8, 14), hairMat);
      backWave.position.set(0, 8.2, -8.0);
      backWave.scale.set(1.8, 1.0, 0.9);
      backWave.castShadow = true;
      hairGroup.add(backWave);

      addAngelRing(9.2, 0.24, 20.6, 1.0);

    } else if (style === 'buns' || style === 'puff') {
      // =========================================================
      // WOMEN 4: SPACE BUNS (Twin High Buns with Scrunchies & Wisps)
      // =========================================================
      const scrunchieMat = new THREE.MeshStandardMaterial({
        color: outfitColor || '#FF5B00',
        roughness: 0.45,
      });

      [-6.8, 6.8].forEach((bunX, idx) => {
        const isLeft = idx === 0;
        // Bun Scrunchie
        const scrunchie = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.75, 8, 20), scrunchieMat);
        scrunchie.position.set(bunX, 22.2, 1.2);
        scrunchie.rotation.x = Math.PI / 2 + (isLeft ? -0.2 : 0.2);
        hairGroup.add(scrunchie);

        // Volumetric Coiled Space Bun
        const bun = new THREE.Mesh(new THREE.SphereGeometry(4.4, 18, 18), hairMat);
        bun.position.set(bunX * 1.05, 24.5, 1.2);
        bun.castShadow = true;
        hairGroup.add(bun);

        // Cute apex wisp on top of bun
        const apexWisp = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.2, 4), hairMat);
        apexWisp.position.set(bunX * 1.05, 29.2, 1.2);
        apexWisp.rotation.z = isLeft ? 0.25 : -0.25;
        hairGroup.add(apexWisp);

        // Face-framing side tendril strand
        const tendril = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 5.2, 4, 8), hairMat);
        tendril.position.set(bunX * 1.18, 11.5, 12.8);
        tendril.rotation.z = isLeft ? 0.2 : -0.2;
        hairGroup.add(tendril);
      });

      addAngelRing(9.0, 0.22, 20.2, 1.2);
    }

    // When Cap or Beanie is worn, provide natural under-cap hair framing (sideburns, fringe & nape)
    // so the head looks stylish and natural, NEVER bald!
    const shouldShowFullHair = profile.hatStyle === 'none' || profile.hatStyle === 'sprout';
    if (shouldShowFullHair) {
      headBone.add(hairGroup);
    } else {
      const underCapHair = new THREE.Group();
      underCapHair.name = 'navdex-under-cap-hair';

      // 1. Natural Front Fringe / Wisps peeking from under the visor brim over the forehead
      const frontWisps = [
        { x: -3.8, y: 14.8, z: 12.8, rotZ: 0.22, s: [0.65, 2.6, 0.45] },
        { x: -1.6, y: 15.1, z: 13.2, rotZ: 0.08, s: [0.72, 2.8, 0.50] },
        { x: 0.8, y: 15.2, z: 13.3, rotZ: -0.06, s: [0.70, 2.7, 0.50] },
        { x: 3.2, y: 14.9, z: 12.9, rotZ: -0.18, s: [0.65, 2.5, 0.45] },
      ];
      frontWisps.forEach((w) => {
        const lock = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.4, 5), hairMat);
        lock.position.set(w.x, w.y, w.z);
        lock.rotation.set(-0.25, 0, w.rotZ);
        lock.scale.set(w.s[0], w.s[1], w.s[2]);
        underCapHair.add(lock);
      });

      // 2. Tapered Left & Right Sideburns hugging face in front of ears
      [-7.5, 7.5].forEach((sideX, idx) => {
        const isLeft = idx === 0;
        const burnMain = new THREE.Mesh(new THREE.ConeGeometry(0.9, 5.2, 5), hairMat);
        burnMain.position.set(sideX, 10.8, 4.8);
        burnMain.rotation.set(-0.15, isLeft ? 0.2 : -0.2, isLeft ? -0.14 : 0.14);
        underCapHair.add(burnMain);

        const burnAccent = new THREE.Mesh(new THREE.ConeGeometry(0.65, 3.8, 4), hairMat);
        burnAccent.position.set(sideX * 0.92, 12.4, 8.2);
        burnAccent.rotation.set(0.18, isLeft ? -0.15 : 0.15, isLeft ? -0.22 : 0.22);
        underCapHair.add(burnAccent);
      });

      // 3. Neat Nape & Neck Locks flowing out from the back of the cap
      const napeLocks = [
        { x: -3.2, y: 9.6, z: -7.5, rotZ: -0.1 },
        { x: 0.0, y: 9.2, z: -8.0, rotZ: 0.0 },
        { x: 3.2, y: 9.6, z: -7.5, rotZ: 0.1 },
      ];
      napeLocks.forEach((nl) => {
        const lock = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4.2, 5), hairMat);
        lock.position.set(nl.x, nl.y, nl.z);
        lock.rotation.set(0.4, 0, nl.rotZ);
        underCapHair.add(lock);
      });

      headBone.add(underCapHair);
    }

    // -------------------------------------------------------------
    // 3. HEADWEAR (Runner Cap, Beanie, Sprout)
    // -------------------------------------------------------------
    if (profile.hatStyle !== 'none') {
      const accessoryGroup = new THREE.Group();
      accessoryGroup.name = 'navdex-headwear';

      if (profile.hatStyle === 'cap') {
        const capMat = new THREE.MeshStandardMaterial({
          color: outfitColor,
          roughness: 0.45,
        });
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(1.0, 28, 22, 0, Math.PI * 2, 0, Math.PI * 0.54),
          capMat
        );
        dome.position.set(0, 17.2, 0.8);
        dome.scale.set(10.2, 6.8, 12.8);
        dome.castShadow = true;
        accessoryGroup.add(dome);

        // Sleek forward-curved visor with authentic athletic cap curvature
        const visor = new THREE.Mesh(
          new THREE.CylinderGeometry(8.2, 8.6, 0.65, 18, 1, false, -Math.PI * 0.32, Math.PI * 0.64),
          capMat
        );
        visor.position.set(0, 15.6, 7.8);
        visor.rotation.set(0.24, 0, 0);
        visor.scale.set(1.15, 1.0, 1.4);
        visor.castShadow = true;
        accessoryGroup.add(visor);

        // Top button accent
        const button = new THREE.Mesh(new THREE.SphereGeometry(1.0, 10, 10), capMat);
        button.position.set(0, 24.0, 0.8);
        accessoryGroup.add(button);
      } else if (profile.hatStyle === 'beanie') {
        const beanieMat = new THREE.MeshStandardMaterial({
          color: hairColor,
          roughness: 0.75,
        });
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(1.0, 22, 22, 0, Math.PI * 2, 0, Math.PI * 0.58),
          beanieMat
        );
        dome.position.set(0, 17.8, 0.8);
        dome.scale.set(10.4, 7.5, 13.0);
        dome.castShadow = true;
        accessoryGroup.add(dome);

        const cuff = new THREE.Mesh(new THREE.TorusGeometry(10.2, 1.6, 8, 24), beanieMat);
        cuff.rotation.x = Math.PI / 2;
        cuff.position.set(0, 15.8, 0.8);
        accessoryGroup.add(cuff);
      } else if (profile.hatStyle === 'sprout') {
        const stemMat = new THREE.MeshStandardMaterial({ color: '#10B981', roughness: 0.4 });
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 7, 8), stemMat);
        stem.position.set(0, 23.5, 1.2);
        accessoryGroup.add(stem);

        const leafMat = new THREE.MeshStandardMaterial({ color: '#34D399', roughness: 0.3 });
        const leafL = new THREE.Mesh(new THREE.SphereGeometry(2.4, 8, 8), leafMat);
        leafL.scale.set(1.5, 0.35, 0.9);
        leafL.position.set(-2.4, 27.0, 1.2);
        leafL.rotation.z = 0.35;
        accessoryGroup.add(leafL);

        const leafR = new THREE.Mesh(new THREE.SphereGeometry(2.4, 8, 8), leafMat);
        leafR.scale.set(1.5, 0.35, 0.9);
        leafR.position.set(2.4, 27.0, 1.2);
        leafR.rotation.z = -0.35;
        accessoryGroup.add(leafR);
      }

      headBone.add(accessoryGroup);
    }

    return () => {
      removeGroup(headBone, 'navdex-face-features');
      removeGroup(headBone, 'navdex-hair');
      removeGroup(headBone, 'navdex-under-cap-hair');
      removeGroup(headBone, 'navdex-headwear');
    };
  }, [
    clonedScene,
    profile.skinTone,
    profile.outfitColor,
    profile.hairStyle,
    profile.hairColor,
    profile.hatStyle,
    profile.avatarGender,
  ]);

  // Initial animation start (idle breathing stance)
  useEffect(() => {
    if (actions && actions.idle) {
      actions.idle.reset().fadeIn(0.15).play();
      activeActionRef.current = 'idle';
    }
  }, [actions]);

  // Frame update: Position, heading interpolation, animation state cross-fading, and shoulder breadth
  useFrame(() => {
    if (!rootRef.current) return;

    // Follow character world motion + climb over raised grassy hills
    const elevation = getTerrainElevation(worldMotionRef.charX, worldMotionRef.charZ);
    rootRef.current.position.set(worldMotionRef.charX, elevation, worldMotionRef.charZ);

    // Smooth rotational heading
    const currentY = rootRef.current.rotation.y;
    let diff = worldMotionRef.charHeading - currentY;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    rootRef.current.rotation.y = currentY + diff * 0.18;

    // Dynamic shoulder breadth: Men have broad athletic shoulders (+x / -x offset without deforming geometry)
    const isMen = profile.avatarGender !== 'women';
    const shoulderL = clonedScene.getObjectByName('mixamorigLeftShoulder') as THREE.Bone | undefined;
    const shoulderR = clonedScene.getObjectByName('mixamorigRightShoulder') as THREE.Bone | undefined;
    if (shoulderL && shoulderR) {
      shoulderL.position.x = isMen ? 6.2 : 4.57;
      shoulderR.position.x = isMen ? -6.2 : -4.57;
    }

    // Determine target animation state
    if (!actions) return;
    const speed = worldMotionRef.charSpeedMps;
    const isMoving = speed > 0.15;

    let targetAction = 'idle';
    if (uiMode === 'arrived') {
      targetAction = 'agree';
    } else if (isMoving) {
      targetAction = speed > 4.5 ? 'run' : 'walk';
    } else {
      targetAction = 'idle';
    }

    if (activeActionRef.current !== targetAction) {
      const prev = actions[activeActionRef.current];
      const next = actions[targetAction];
      if (prev && next) {
        prev.fadeOut(0.22);
        next.reset().fadeIn(0.22).play();
      } else if (next) {
        next.reset().fadeIn(0.22).play();
      }
      activeActionRef.current = targetAction;
    } else {
      const cur = actions[activeActionRef.current];
      if (cur && !cur.isRunning()) {
        cur.reset().play();
      }
    }

    // Adapt walk/run playback speed proportionally to actual walking velocity
    if (targetAction === 'walk' && actions.walk) {
      actions.walk.timeScale = Math.max(0.65, Math.min(1.85, speed / 2.2));
    } else if (targetAction === 'run' && actions.run) {
      actions.run.timeScale = Math.max(0.8, Math.min(2.1, speed / 4.8));
    }
  });

  // Stature: Men have a taller athletic build (2.22), Women have a graceful athletic build (2.02)
  const isWomen = profile.avatarGender === 'women';
  const charScale = isWomen ? 2.02 : 2.22;

  return (
    <group ref={rootRef}>
      {/* Soft Ground Contact Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[1.15, 24]} />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.28} depthWrite={false} />
      </mesh>

      {/* Modern Sky Blue Active Locator Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
        <ringGeometry args={[1.18, 1.36, 32]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.5} depthWrite={false} />
      </mesh>

      {/* Skinned Athletic Mannequin Mesh with Clothes, Hair, Face, and Shoes */}
      <group ref={modelRef} scale={charScale}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
};
