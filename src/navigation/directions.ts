import { CampusGraph, DEFAULT_CAMPUS_GRAPH, findNearestLandmarkLabel } from './campusGraph';
import { distanceXZ, WorldXZ } from './projection';

export type TurnType = 'start' | 'straight' | 'left' | 'right' | 'arrive';

export interface DirectionStep {
  instruction: string;
  landmarkName: string;
  turnType: TurnType;
  distanceM: number;
  worldPos: WorldXZ;
}

/**
 * Computes signed angle delta in degrees (-180..+180) between incoming vector (a -> b)
 * and outgoing vector (b -> c) in Three.js XZ plane (+X = East, +Z = South).
 * Positive delta = clockwise turn (Right turn when facing forward).
 * Negative delta = counter-clockwise turn (Left turn when facing forward).
 */
export function computeTurnAngleDeg(a: WorldXZ, b: WorldXZ, c: WorldXZ): number {
  const inAngle = Math.atan2(b.x - a.x, -b.z - -a.z); // 0 = North, +PI/2 = East
  const outAngle = Math.atan2(c.x - b.x, -c.z - -b.z);
  let deltaRad = outAngle - inAngle;
  while (deltaRad > Math.PI) deltaRad -= 2 * Math.PI;
  while (deltaRad < -Math.PI) deltaRad += 2 * Math.PI;
  return (deltaRad * 180) / Math.PI;
}

/**
 * Generates student-friendly landmark turn instructions from an ordered list of graph node IDs.
 */
export function generateDirections(
  nodeIds: string[],
  graph: CampusGraph = DEFAULT_CAMPUS_GRAPH
): DirectionStep[] {
  if (nodeIds.length === 0) return [];
  const firstNode = graph.nodes[nodeIds[0]];
  const lastNode = graph.nodes[nodeIds[nodeIds.length - 1]];

  if (nodeIds.length === 1) {
    return [
      {
        instruction: `Arrive at ${firstNode?.label ?? nodeIds[0]}`,
        landmarkName: firstNode?.label ?? nodeIds[0],
        turnType: 'arrive',
        distanceM: 0,
        worldPos: firstNode?.worldPos ?? { x: 0, z: 0 },
      },
    ];
  }

  const steps: DirectionStep[] = [];
  const secondNode = graph.nodes[nodeIds[1]];
  const firstLegDist =
    firstNode && secondNode ? Math.round(distanceXZ(firstNode.worldPos, secondNode.worldPos)) : 0;

  steps.push({
    instruction: `Head out from ${firstNode?.label ?? nodeIds[0]}`,
    landmarkName: firstNode?.label ?? nodeIds[0],
    turnType: 'start',
    distanceM: firstLegDist,
    worldPos: firstNode.worldPos,
  });

  for (let i = 1; i < nodeIds.length - 1; i++) {
    const prev = graph.nodes[nodeIds[i - 1]];
    const curr = graph.nodes[nodeIds[i]];
    const next = graph.nodes[nodeIds[i + 1]];
    if (!prev || !curr || !next) continue;

    const deltaDeg = computeTurnAngleDeg(prev.worldPos, curr.worldPos, next.worldPos);
    const legDist = Math.round(distanceXZ(curr.worldPos, next.worldPos));
    const landmark = findNearestLandmarkLabel(curr.worldPos, 42) ?? curr.label;

    if (Math.abs(deltaDeg) < 25) {
      steps.push({
        instruction: `Continue past ${landmark}`,
        landmarkName: landmark,
        turnType: 'straight',
        distanceM: legDist,
        worldPos: curr.worldPos,
      });
    } else if (deltaDeg >= 25) {
      steps.push({
        instruction: `Turn right near ${landmark}`,
        landmarkName: landmark,
        turnType: 'right',
        distanceM: legDist,
        worldPos: curr.worldPos,
      });
    } else {
      steps.push({
        instruction: `Turn left near ${landmark}`,
        landmarkName: landmark,
        turnType: 'left',
        distanceM: legDist,
        worldPos: curr.worldPos,
      });
    }
  }

  steps.push({
    instruction: `Arrive at ${lastNode?.label ?? nodeIds[nodeIds.length - 1]}`,
    landmarkName: lastNode?.label ?? nodeIds[nodeIds.length - 1],
    turnType: 'arrive',
    distanceM: 0,
    worldPos: lastNode.worldPos,
  });

  return steps;
}
