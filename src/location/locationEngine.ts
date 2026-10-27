import { CAMPUS_PLACES, PLACES_BY_ID } from '../data/campusPlaces';
import { CAMPUS_ORIGIN, distanceXZ, gpsToWorld, LatLon, WorldXZ } from '../navigation/projection';

export type LocationSource = 'gps' | 'demo' | 'manual';

export const GEOFENCE_RADIUS_M = 320;
export const CLUSTER_DISAMBIGUATION_RADIUS_M = 15;
export const ARRIVAL_ENTER_RADIUS_M = 18;
export const ARRIVAL_EXIT_RADIUS_M = 25;

export interface LocationSnapshot {
  worldPos: WorldXZ;
  nearestBlockId: string;
  nearestDistanceM: number;
  /** Populated when user is within 15m of >= 2 buildings (e.g., CSE/C2/C3, GAL/PIV, E1/COE) */
  clusterCandidates: string[];
  offCampus: boolean;
}

/**
 * Exponential Moving Average (EMA) low-pass filter for noisy mobile GPS coordinates.
 */
export function smoothWorldPosition(
  previous: WorldXZ | null,
  rawSample: WorldXZ,
  alpha = 0.35
): WorldXZ {
  if (!previous) return { ...rawSample };
  const clampedAlpha = Math.max(0.05, Math.min(1, alpha));
  return {
    x: previous.x + (rawSample.x - previous.x) * clampedAlpha,
    z: previous.z + (rawSample.z - previous.z) * clampedAlpha,
  };
}

/**
 * Checks whether a GPS coordinate is inside the 320m campus geofence.
 */
export function isWithinCampusGeofence(coord: LatLon): boolean {
  const pos = gpsToWorld(coord, CAMPUS_ORIGIN);
  const distFromCenter = Math.hypot(pos.x, pos.z);
  return distFromCenter <= GEOFENCE_RADIUS_M;
}

/**
 * Evaluates a world position against all 25 campus blocks, returning the nearest block
 * and any dense cluster candidates within 15m sorted by distance.
 */
export function evaluateCampusLocation(worldPos: WorldXZ): LocationSnapshot {
  const distFromCenter = Math.hypot(worldPos.x, worldPos.z);
  if (distFromCenter > GEOFENCE_RADIUS_M) {
    const gatePos = PLACES_BY_ID['GATE'].worldPos;
    return {
      worldPos: { ...gatePos },
      nearestBlockId: 'GATE',
      nearestDistanceM: 0,
      clusterCandidates: [],
      offCampus: true,
    };
  }

  const scored = CAMPUS_PLACES.map((place) => ({
    id: place.id,
    dist: distanceXZ(worldPos, place.worldPos),
  })).sort((a, b) => a.dist - b.dist);

  const nearest = scored[0];
  const nearbyCluster = scored
    .filter((item) => item.dist <= CLUSTER_DISAMBIGUATION_RADIUS_M)
    .map((item) => item.id);

  return {
    worldPos: { ...worldPos },
    nearestBlockId: nearest.id,
    nearestDistanceM: Number(nearest.dist.toFixed(2)),
    clusterCandidates: nearbyCluster.length >= 2 ? nearbyCluster.slice(0, 4) : [],
    offCampus: false,
  };
}

/**
 * Hysteresis arrival state machine:
 * - Enters 'arrived = true' when distance to destination entrance < 18m
 * - Stays latched 'arrived = true' until distance > 25m (prevents GPS flicker at 18.1m)
 */
export function evaluateArrivalHysteresis(
  currentlyArrived: boolean,
  currentWorldPos: WorldXZ,
  destPlaceId: string
): boolean {
  const dest = PLACES_BY_ID[destPlaceId];
  if (!dest) return false;
  const distToTrueEntrance = distanceXZ(currentWorldPos, dest.worldPos);

  if (!currentlyArrived) {
    return distToTrueEntrance <= ARRIVAL_ENTER_RADIUS_M;
  } else {
    return distToTrueEntrance <= ARRIVAL_EXIT_RADIUS_M;
  }
}

