/**
 * Shared Campus Terrain Elevation Module
 *
 * Defines the spatial coordinates, radius, and heights of all rolling grassy hill mounds
 * on campus and provides `getTerrainElevation(x, z)` so that:
 * 1. Walkway paths elevate up and over hills.
 * 2. Character and pet models walk on top of the raised mounds rather than inside them.
 * 3. Paw prints, stones, and resting leaves sit flush on the elevated terrain.
 */

export interface GrassyHillDef {
  x: number;
  z: number;
  r: number;
  h: number;
  color: string;
}

export const CAMPUS_GRASSY_HILLS: GrassyHillDef[] = [
  { x: 88, z: -138, r: 12, h: 2.5, color: '#3E9B4F' }, // North-East Meadow (east of Main Gate)
  { x: -68, z: -140, r: 11, h: 2.4, color: '#44B050' }, // North-West Grove (west of COE/E1)
  { x: 22, z: -98, r: 10, h: 2.2, color: '#3BA04A' }, // North Park (open lawn between Admin and C1)
  { x: -68, z: -10, r: 11, h: 2.3, color: '#46B352' }, // West Canal Bank (lush green meadow along stream)
  { x: -28, z: -16, r: 11, h: 2.4, color: '#3E9B4F' }, // Central Quad Meadow
  { x: 22, z: 10, r: 11, h: 2.3, color: '#44B050' }, // East Garden (open lawn between MBA and Audi)
  { x: 78, z: 92, r: 12, h: 2.5, color: '#3BA04A' }, // South-East Upper Meadow
  { x: 72, z: 136, r: 13, h: 2.6, color: '#4CB05B' }, // South-East Lower Park
  { x: -45, z: 95, r: 11, h: 2.4, color: '#44B050' }, // South-West Grove (open meadow north of S1)
  { x: -22, z: 105, r: 10, h: 2.2, color: '#3E9B4F' }, // South Temple Lawn
];

/**
 * Returns the ground elevation in world units (Y) at coordinate (x, z).
 * If the coordinate is within a grassy hill mound, returns the hemisphere elevation.
 */
export function getTerrainElevation(x: number, z: number): number {
  let maxElevation = 0;
  for (let i = 0; i < CAMPUS_GRASSY_HILLS.length; i++) {
    const h = CAMPUS_GRASSY_HILLS[i];
    const dx = x - h.x;
    const dz = z - h.z;
    const distSq = dx * dx + dz * dz;
    const rSq = h.r * h.r;
    if (distSq < rSq) {
      // Hemisphere elevation equation
      const elev = h.h * Math.sqrt(1 - distSq / rSq);
      if (elev > maxElevation) {
        maxElevation = elev;
      }
    }
  }
  return maxElevation;
}
