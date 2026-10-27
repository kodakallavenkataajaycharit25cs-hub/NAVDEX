export interface LatLon {
  lat: number;
  lon: number;
}

export interface WorldXZ {
  x: number;
  z: number;
}

/**
 * Campus Center Origin (Bengaluru Campus — computed from the 25 block bounds)
 * Lat range: 12.8998579 (T1) to 12.9024889 (E1) -> ~293m N-S
 * Lon range: 77.5175464 (SIC) to 77.5190615 (PIV) -> ~164m E-W
 */
export const CAMPUS_ORIGIN: LatLon = {
  lat: 12.9011734,
  lon: 77.5183180,
};

export const METERS_PER_DEG_LAT = 110632;
export const METERS_PER_DEG_LON = 108410;

/**
 * Converts (lat, lon) into Three.js world metres (x = East+, z = South+)
 * relative to CAMPUS_ORIGIN.
 * Note: In Three.js right-handed space, +X is East and -Z is North (+Z is South).
 */
export function gpsToWorld(coord: LatLon, origin: LatLon = CAMPUS_ORIGIN): WorldXZ {
  const x = (coord.lon - origin.lon) * METERS_PER_DEG_LON;
  const z = -(coord.lat - origin.lat) * METERS_PER_DEG_LAT;
  return { x, z };
}

/**
 * Converts Three.js world metres (x, z) back to (lat, lon).
 */
export function worldToGps(pos: WorldXZ, origin: LatLon = CAMPUS_ORIGIN): LatLon {
  const lon = origin.lon + pos.x / METERS_PER_DEG_LON;
  const lat = origin.lat - pos.z / METERS_PER_DEG_LAT;
  return { lat, lon };
}

/**
 * Euclidean distance in metres on the local campus plane.
 */
export function distanceXZ(a: WorldXZ, b: WorldXZ): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.hypot(dx, dz);
}

/**
 * Haversine distance in metres between two GPS coordinates (for validation tests).
 */
export function haversineMeters(a: LatLon, b: LatLon): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
