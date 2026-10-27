import { CAMPUS_PLACES, PLACES_BY_ID } from '../data/campusPlaces';
import { distanceXZ, gpsToWorld, WorldXZ } from './projection';

export interface GraphNode {
  id: string;
  label: string;
  lat: number;
  lon: number;
  /** True GPS equirectangular world coordinate */
  worldPos: WorldXZ;
  /** Visual 3D walkway / front-door plaza coordinate (guaranteed outside all building footprints) */
  visualWalkPos: WorldXZ;
  type: 'entrance' | 'walkway';
  placeId?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  lengthM: number;
}

export interface CampusGraph {
  nodes: Record<string, GraphNode>;
  adjacency: Record<string, GraphEdge[]>;
  edges: GraphEdge[];
}

/**
 * Pushes any (x, z) point outside all 25 building 3D footprints (with a safety margin),
 * guaranteeing that walkway junctions and route polylines never clip through buildings.
 */
export function pushPointOutsideBuildings(pt: WorldXZ, marginM = 2.6): WorldXZ {
  let x = pt.x;
  let z = pt.z;

  for (let pass = 0; pass < 3; pass++) {
    for (const place of CAMPUS_PLACES) {
      const halfW = place.footprintSize.width * 0.5 + marginM;
      const halfD = place.footprintSize.depth * 0.5 + marginM;
      const dx = x - place.visualPos.x;
      const dz = z - place.visualPos.z;

      if (Math.abs(dx) < halfW && Math.abs(dz) < halfD) {
        const penX = halfW - Math.abs(dx);
        const penZ = halfD - Math.abs(dz);
        if (penX < penZ) {
          x = place.visualPos.x + (dx >= 0 ? halfW : -halfW);
        } else {
          z = place.visualPos.z + (dz >= 0 ? halfD : -halfD);
        }
      }
    }
  }

  return { x, z };
}

/**
 * Given a segment A -> B, checks if any intermediate point intersects a building footprint.
 * If it does, inserts an orthogonal corner waypoint outside that building so the path
 * walks cleanly around the building's exterior perimeter instead of cutting through it.
 */
export function detourSegmentAroundBuildings(a: WorldXZ, b: WorldXZ, marginM = 2.6): WorldXZ[] {
  const safeA = pushPointOutsideBuildings(a, marginM);
  const safeB = pushPointOutsideBuildings(b, marginM);

  let currentChain: WorldXZ[] = [safeA, safeB];

  for (let iter = 0; iter < 4; iter++) {
    const nextChain: WorldXZ[] = [currentChain[0]];
    let splitOccurred = false;

    for (let segIdx = 0; segIdx < currentChain.length - 1; segIdx++) {
      const p0 = currentChain[segIdx];
      const p1 = currentChain[segIdx + 1];
      const dist = distanceXZ(p0, p1);
      const samples = Math.max(2, Math.ceil(dist / 1.0));
      let hitBuilding: (typeof CAMPUS_PLACES)[number] | null = null;

      for (let s = 1; s < samples; s++) {
        const t = s / samples;
        const mx = p0.x + (p1.x - p0.x) * t;
        const mz = p0.z + (p1.z - p0.z) * t;

        for (const place of CAMPUS_PLACES) {
          const halfW = place.footprintSize.width * 0.5 + marginM - 0.2;
          const halfD = place.footprintSize.depth * 0.5 + marginM - 0.2;
          if (
            Math.abs(mx - place.visualPos.x) < halfW &&
            Math.abs(mz - place.visualPos.z) < halfD
          ) {
            hitBuilding = place;
            break;
          }
        }
        if (hitBuilding) break;
      }

      if (hitBuilding) {
        const hw = hitBuilding.footprintSize.width * 0.5 + marginM + 0.8;
        const hd = hitBuilding.footprintSize.depth * 0.5 + marginM + 0.8;
        const cx = hitBuilding.visualPos.x;
        const cz = hitBuilding.visualPos.z;
        const corners: WorldXZ[] = [
          { x: cx - hw, z: cz - hd },
          { x: cx + hw, z: cz - hd },
          { x: cx - hw, z: cz + hd },
          { x: cx + hw, z: cz + hd },
        ].map((c) => pushPointOutsideBuildings(c, marginM));

        // Pick the corner that minimizes total detour distance (p0 -> corner -> p1)
        let bestCorner = corners[0];
        let bestCost = Infinity;
        for (const c of corners) {
          const cost = distanceXZ(p0, c) + distanceXZ(c, p1);
          if (cost < bestCost) {
            bestCost = cost;
            bestCorner = c;
          }
        }
        nextChain.push(bestCorner, p1);
        splitOccurred = true;
      } else {
        nextChain.push(p1);
      }
    }

    currentChain = nextChain;
    if (!splitOccurred) break;
  }

  return currentChain;
}

/**
 * 16 Campus Spine & Corridor Walkway Junctions along the open avenues between buildings.
 */
const WALKWAY_JUNCTIONS: Array<{ id: string; label: string; lat: number; lon: number }> = [
  { id: 'W_NORTH_GATE', label: 'Main Gate Plaza', lat: 12.9022100, lon: 77.5188200 },
  { id: 'W_NORTH_MID', label: 'North Lawn Avenue', lat: 12.9022400, lon: 77.5184500 },
  { id: 'W_NW_CORNER', label: 'COE Courtyard', lat: 12.9022800, lon: 77.5181200 },
  { id: 'W_CANTEEN_NORTH', label: 'Canteen North Walk', lat: 12.9020800, lon: 77.5181200 },
  { id: 'W_CANTEEN_PLAZA', label: 'Canteen Courtyard', lat: 12.9018600, lon: 77.5181200 },
  { id: 'W_CSE_QUAD', label: 'CSE Front Quad', lat: 12.9017800, lon: 77.5179200 },
  { id: 'W_EAST_UPPER', label: 'Galileo Walk', lat: 12.9018200, lon: 77.5189500 },
  { id: 'W_EAST_MECH', label: 'Mechanical Avenue', lat: 12.9014800, lon: 77.5189200 },
  { id: 'W_EAST_AT', label: 'Amphitheatre Walk', lat: 12.9012200, lon: 77.5188200 },
  { id: 'W_EAST_MBA', label: 'MBA Courtyard', lat: 12.9009800, lon: 77.5188200 },
  { id: 'W_CENTRAL_NORTH', label: 'Central Lawn North', lat: 12.9014200, lon: 77.5183500 },
  { id: 'W_AUDI_PLAZA', label: 'Auditorium Forecourt', lat: 12.9006400, lon: 77.5182500 },
  { id: 'W_LIB_QUAD', label: 'Library Front Lawn', lat: 12.9007200, lon: 77.5178200 },
  { id: 'W_WEST_AVE', label: 'West Studio Walk', lat: 12.9005200, lon: 77.5176200 },
  { id: 'W_SOUTH_WEST', label: 'South-West Path', lat: 12.8999200, lon: 77.5177500 },
  { id: 'W_SOUTH_SPINE', label: 'Temple Garden Walk', lat: 12.8999200, lon: 77.5185200 },
];

/**
 * Notice: Buildings ONLY connect to Walkway Corridor nodes (`W_*`), and Walkway Corridor
 * nodes connect to each other along open avenues. No building-to-building edges!
 */
const BIDIRECTIONAL_LINKS: Array<[string, string]> = [
  // Main Walkway Spine Network (W_* <-> W_*)
  ['W_NORTH_GATE', 'W_NORTH_MID'],
  ['W_NORTH_MID', 'W_NW_CORNER'],
  ['W_NW_CORNER', 'W_CANTEEN_NORTH'],
  ['W_NORTH_MID', 'W_CANTEEN_NORTH'],
  ['W_CANTEEN_NORTH', 'W_CANTEEN_PLAZA'],
  ['W_CANTEEN_PLAZA', 'W_CSE_QUAD'],
  ['W_NORTH_GATE', 'W_EAST_UPPER'],
  ['W_EAST_UPPER', 'W_EAST_MECH'],
  ['W_EAST_MECH', 'W_EAST_AT'],
  ['W_EAST_AT', 'W_EAST_MBA'],
  ['W_CANTEEN_PLAZA', 'W_CENTRAL_NORTH'],
  ['W_EAST_MECH', 'W_CENTRAL_NORTH'],
  ['W_EAST_AT', 'W_CENTRAL_NORTH'],
  ['W_CENTRAL_NORTH', 'W_AUDI_PLAZA'],
  ['W_CENTRAL_NORTH', 'W_LIB_QUAD'],
  ['W_CSE_QUAD', 'W_LIB_QUAD'],
  ['W_LIB_QUAD', 'W_AUDI_PLAZA'],
  ['W_LIB_QUAD', 'W_WEST_AVE'],
  ['W_WEST_AVE', 'W_SOUTH_WEST'],
  ['W_SOUTH_WEST', 'W_SOUTH_SPINE'],
  ['W_AUDI_PLAZA', 'W_SOUTH_SPINE'],
  ['W_EAST_MBA', 'W_AUDI_PLAZA'],

  // Building Entrance Plazas -> Nearest Walkway Node(s)
  ['GATE', 'W_NORTH_GATE'],
  ['ADM', 'W_NORTH_GATE'],
  ['ADM', 'W_NORTH_MID'],
  ['E1', 'W_NW_CORNER'],
  ['COE', 'W_NW_CORNER'],
  ['C1', 'W_CANTEEN_NORTH'],
  ['C1', 'W_CANTEEN_PLAZA'],
  ['C2', 'W_CANTEEN_PLAZA'],
  ['C3', 'W_CANTEEN_PLAZA'],
  ['C3', 'W_CSE_QUAD'],
  ['CSE', 'W_CSE_QUAD'],
  ['PIV', 'W_EAST_UPPER'],
  ['GAL', 'W_EAST_UPPER'],
  ['X1', 'W_EAST_UPPER'],
  ['X1', 'W_EAST_MECH'],
  ['ME', 'W_EAST_MECH'],
  ['AT', 'W_EAST_AT'],
  ['MBA', 'W_EAST_MBA'],
  ['MBA', 'W_EAST_AT'],
  ['LIB', 'W_LIB_QUAD'],
  ['ARC', 'W_LIB_QUAD'],
  ['ARC', 'W_WEST_AVE'],
  ['AUDI', 'W_AUDI_PLAZA'],
  ['J3', 'W_AUDI_PLAZA'],
  ['J1', 'W_EAST_MBA'],
  ['J1', 'W_AUDI_PLAZA'],
  ['J2', 'W_AUDI_PLAZA'],
  ['J2', 'W_SOUTH_SPINE'],
  ['SIC', 'W_WEST_AVE'],
  ['SIC', 'W_SOUTH_WEST'],
  ['PU', 'W_AUDI_PLAZA'],
  ['PU', 'W_SOUTH_SPINE'],
  ['S1', 'W_SOUTH_WEST'],
  ['TEMP', 'W_SOUTH_SPINE'],
  ['T1', 'W_SOUTH_SPINE'],
];

export function buildDefaultCampusGraph(): CampusGraph {
  const nodes: Record<string, GraphNode> = {};
  const adjacency: Record<string, GraphEdge[]> = {};
  const edges: GraphEdge[] = [];

  for (const place of CAMPUS_PLACES) {
    const safeEntrance = pushPointOutsideBuildings(place.entranceVisualPos, 2.2);
    nodes[place.id] = {
      id: place.id,
      label: place.name,
      lat: place.entrance.lat,
      lon: place.entrance.lon,
      worldPos: place.worldPos,
      visualWalkPos: safeEntrance,
      type: 'entrance',
      placeId: place.id,
    };
    adjacency[place.id] = [];
  }

  for (const j of WALKWAY_JUNCTIONS) {
    const rawWorld = gpsToWorld({ lat: j.lat, lon: j.lon });
    const safeWalk = pushPointOutsideBuildings(rawWorld, 3.2);
    nodes[j.id] = {
      id: j.id,
      label: j.label,
      lat: j.lat,
      lon: j.lon,
      worldPos: rawWorld,
      visualWalkPos: safeWalk,
      type: 'walkway',
    };
    adjacency[j.id] = [];
  }

  const addBidirectional = (a: string, b: string) => {
    const nodeA = nodes[a];
    const nodeB = nodes[b];
    if (!nodeA || !nodeB) return;
    const lengthM = Math.max(1, Number(distanceXZ(nodeA.worldPos, nodeB.worldPos).toFixed(2)));
    const forward: GraphEdge = { from: a, to: b, lengthM };
    const backward: GraphEdge = { from: b, to: a, lengthM };
    adjacency[a].push(forward);
    adjacency[b].push(backward);
    edges.push(forward);
  };

  for (const [a, b] of BIDIRECTIONAL_LINKS) {
    addBidirectional(a, b);
  }

  return { nodes, adjacency, edges };
}

export const DEFAULT_CAMPUS_GRAPH: CampusGraph = buildDefaultCampusGraph();

/**
 * Finds the nearest place ID to a given world position.
 */
export function findNearestPlaceId(pos: WorldXZ): { placeId: string; distanceM: number } {
  let bestId = 'GATE';
  let bestDist = Infinity;
  for (const place of CAMPUS_PLACES) {
    const d = Math.min(
      distanceXZ(pos, place.worldPos),
      distanceXZ(pos, place.entranceVisualPos)
    );
    if (d < bestDist) {
      bestDist = d;
      bestId = place.id;
    }
  }
  return { placeId: bestId, distanceM: bestDist };
}

/**
 * Returns the nearest landmark place name within maxDistM of a world coordinate.
 */
export function findNearestLandmarkLabel(pos: WorldXZ, maxDistM = 38): string | null {
  let bestName: string | null = null;
  let bestDist = maxDistM;
  for (const place of CAMPUS_PLACES) {
    const d = distanceXZ(pos, place.worldPos);
    if (d <= bestDist) {
      bestDist = d;
      bestName = place.shortLabel;
    }
  }
  return bestName;
}
