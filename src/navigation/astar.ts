import { PLACES_BY_ID } from '../data/campusPlaces';
import {
  CampusGraph,
  DEFAULT_CAMPUS_GRAPH,
  detourSegmentAroundBuildings,
  pushPointOutsideBuildings,
} from './campusGraph';
import { DirectionStep, generateDirections } from './directions';
import { distanceXZ, WorldXZ } from './projection';

export interface RouteResult {
  ok: boolean;
  reason?: 'INVALID_NODE' | 'NO_PATH';
  startPlaceId: string;
  destPlaceId: string;
  nodeIds: string[];
  /** Unshifted equirectangular GPS coordinates in metres (used for distance, ETA, hysteresis) */
  trueWaypoints: WorldXZ[];
  /** Collision-free 3D walkway waypoints terminating at front-door entrance plazas */
  visualWaypoints: WorldXZ[];
  /** Evenly spaced 3D points (every ~2.4m) for instanced paw-print rendering & character walk */
  pawTrailPoints: Array<{ x: number; z: number; heading: number; distFromStart: number }>;
  totalDistanceM: number;
  estimatedMinutes: number;
  estimatedSteps: number;
  directions: DirectionStep[];
}

const WALKING_SPEED_MPS = 1.35;
const STEP_LENGTH_M = 0.74;

/**
 * Subsamples a polyline at fixed distance intervals, detours segments around building corners,
 * and pushes every sample outside building footprints so the character never clips through walls.
 */
export function samplePolylineEvery(
  waypoints: WorldXZ[],
  spacingM = 2.4,
  avoidBuildings = true
): Array<{ x: number; z: number; heading: number; distFromStart: number }> {
  if (waypoints.length === 0) return [];
  if (waypoints.length === 1) {
    const safe = avoidBuildings
      ? pushPointOutsideBuildings(waypoints[0], 2.0)
      : waypoints[0];
    return [{ x: safe.x, z: safe.z, heading: 0, distFromStart: 0 }];
  }

  // First, expand each segment through detourSegmentAroundBuildings so paths go around corners
  const detouredWaypoints: WorldXZ[] = [
    avoidBuildings ? pushPointOutsideBuildings(waypoints[0], 2.0) : waypoints[0],
  ];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const chain = avoidBuildings
      ? detourSegmentAroundBuildings(waypoints[i], waypoints[i + 1], 2.2)
      : [waypoints[i], waypoints[i + 1]];
    for (let k = 1; k < chain.length; k++) {
      detouredWaypoints.push(chain[k]);
    }
  }

  // Subdivide and push any interior points outside building boxes
  const rawPts: WorldXZ[] = [];
  for (let i = 0; i < detouredWaypoints.length - 1; i++) {
    const a = detouredWaypoints[i];
    const b = detouredWaypoints[i + 1];
    const segLen = distanceXZ(a, b);
    const steps = Math.max(1, Math.ceil(segLen / 1.0));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const pt = {
        x: a.x + (b.x - a.x) * t,
        z: a.z + (b.z - a.z) * t,
      };
      rawPts.push(avoidBuildings ? pushPointOutsideBuildings(pt, 2.0) : pt);
    }
  }
  const lastWp = detouredWaypoints[detouredWaypoints.length - 1];
  rawPts.push(avoidBuildings ? pushPointOutsideBuildings(lastWp, 2.0) : { ...lastWp });

  // Resample the safe path at uniform `spacingM`
  const samples: Array<{ x: number; z: number; heading: number; distFromStart: number }> = [];
  let accumulated = 0;
  let nextSampleDist = 0;

  for (let i = 0; i < rawPts.length - 1; i++) {
    const a = rawPts[i];
    const b = rawPts[i + 1];
    const segLen = distanceXZ(a, b);
    if (segLen < 1e-4) continue;
    const heading = Math.atan2(b.x - a.x, b.z - a.z);

    while (nextSampleDist <= accumulated + segLen) {
      const t = (nextSampleDist - accumulated) / segLen;
      const rawSample = {
        x: a.x + (b.x - a.x) * t,
        z: a.z + (b.z - a.z) * t,
      };
      const safeSample = avoidBuildings
        ? pushPointOutsideBuildings(rawSample, 2.0)
        : rawSample;
      samples.push({
        x: safeSample.x,
        z: safeSample.z,
        heading,
        distFromStart: nextSampleDist,
      });
      nextSampleDist += spacingM;
    }
    accumulated += segLen;
  }

  const last = rawPts[rawPts.length - 1];
  const prev = rawPts[rawPts.length - 2];
  const finalHeading = Math.atan2(last.x - prev.x, last.z - prev.z);
  const lastSample = samples[samples.length - 1];
  if (!lastSample || Math.hypot(lastSample.x - last.x, lastSample.z - last.z) > 0.25) {
    const safeLast = avoidBuildings ? pushPointOutsideBuildings(last, 2.0) : last;
    samples.push({
      x: safeLast.x,
      z: safeLast.z,
      heading: finalHeading,
      distFromStart: accumulated,
    });
  }

  return samples;
}

/**
 * Pure TypeScript A* pathfinder over CampusGraph.
 */
export function findRoute(
  startId: string,
  destId: string,
  graph: CampusGraph = DEFAULT_CAMPUS_GRAPH
): RouteResult {
  const startNode = graph.nodes[startId];
  const destNode = graph.nodes[destId];

  if (!startNode || !destNode) {
    return {
      ok: false,
      reason: 'INVALID_NODE',
      startPlaceId: startId,
      destPlaceId: destId,
      nodeIds: [],
      trueWaypoints: [],
      visualWaypoints: [],
      pawTrailPoints: [],
      totalDistanceM: 0,
      estimatedMinutes: 0,
      estimatedSteps: 0,
      directions: [],
    };
  }

  if (startId === destId) {
    const visualPt = destNode.visualWalkPos;
    return {
      ok: true,
      startPlaceId: startId,
      destPlaceId: destId,
      nodeIds: [startId],
      trueWaypoints: [{ ...startNode.worldPos }],
      visualWaypoints: [{ ...visualPt }],
      pawTrailPoints: [{ x: visualPt.x, z: visualPt.z, heading: 0, distFromStart: 0 }],
      totalDistanceM: 0,
      estimatedMinutes: 0,
      estimatedSteps: 0,
      directions: [
        {
          instruction: `You are already at ${destNode.label}`,
          landmarkName: destNode.label,
          turnType: 'arrive',
          distanceM: 0,
          worldPos: startNode.worldPos,
        },
      ],
    };
  }

  const openSet = new Set<string>([startId]);
  const cameFrom: Record<string, string> = {};
  const gScore: Record<string, number> = { [startId]: 0 };
  const fScore: Record<string, number> = {
    [startId]: distanceXZ(startNode.worldPos, destNode.worldPos),
  };

  while (openSet.size > 0) {
    let currentId = '';
    let lowestF = Infinity;
    for (const id of openSet) {
      const f = fScore[id] ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        currentId = id;
      }
    }

    if (currentId === destId) {
      const nodeIds: string[] = [currentId];
      while (cameFrom[currentId]) {
        currentId = cameFrom[currentId];
        nodeIds.unshift(currentId);
      }

      const trueWaypoints = nodeIds.map((id) => ({ ...graph.nodes[id].worldPos }));
      // Visual waypoints follow the safe walkway nodes and terminate at the destination's front-door plaza
      const rawVisualWaypoints = nodeIds.map((id) => ({
        ...graph.nodes[id].visualWalkPos,
      }));
      const destPlace = PLACES_BY_ID[destId];
      if (destPlace && rawVisualWaypoints.length > 0) {
        rawVisualWaypoints[rawVisualWaypoints.length - 1] = pushPointOutsideBuildings(
          destPlace.entranceVisualPos,
          1.8
        );
      }

      const pawTrailPoints = samplePolylineEvery(rawVisualWaypoints, 2.4, true).slice(0, 80);
      const visualWaypoints = pawTrailPoints.map((p) => ({ x: p.x, z: p.z }));

      const totalDistanceM = Math.max(
        12,
        Math.round(distanceXZ(startNode.worldPos, destNode.worldPos) * 1.18)
      );
      const estimatedMinutes = Math.max(1, Math.round(totalDistanceM / (WALKING_SPEED_MPS * 60)));
      const estimatedSteps = Math.max(15, Math.round(totalDistanceM / STEP_LENGTH_M));
      const directions = generateDirections(nodeIds, graph);

      return {
        ok: true,
        startPlaceId: startId,
        destPlaceId: destId,
        nodeIds,
        trueWaypoints,
        visualWaypoints,
        pawTrailPoints,
        totalDistanceM,
        estimatedMinutes,
        estimatedSteps,
        directions,
      };
    }

    openSet.delete(currentId);
    const neighbors = graph.adjacency[currentId] ?? [];
    for (const edge of neighbors) {
      const tentativeG = (gScore[currentId] ?? Infinity) + edge.lengthM;
      if (tentativeG < (gScore[edge.to] ?? Infinity)) {
        cameFrom[edge.to] = currentId;
        gScore[edge.to] = tentativeG;
        const neighborNode = graph.nodes[edge.to];
        fScore[edge.to] =
          tentativeG + (neighborNode ? distanceXZ(neighborNode.worldPos, destNode.worldPos) : 0);
        openSet.add(edge.to);
      }
    }
  }

  return {
    ok: false,
    reason: 'NO_PATH',
    startPlaceId: startId,
    destPlaceId: destId,
    nodeIds: [],
    trueWaypoints: [],
    visualWaypoints: [],
    pawTrailPoints: [],
    totalDistanceM: 0,
    estimatedMinutes: 0,
    estimatedSteps: 0,
    directions: [],
  };
}
