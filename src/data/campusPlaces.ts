import { gpsToWorld, LatLon, WorldXZ } from '../navigation/projection';

export type PlaceCategory =
  | 'engineering'
  | 'academic'
  | 'food'
  | 'admin'
  | 'junction';

export type HeroLandmarkType =
  | 'computer'
  | 'gear'
  | 'book'
  | 'briefcase'
  | 'stage'
  | 'amphitheatre'
  | 'temple'
  | 'arch'
  | 'flagpole'
  | 'cup'
  | 'none';

export interface CampusPlace {
  id: string;
  name: string;
  shortLabel: string;
  category: PlaceCategory;
  categoryLabel: string;
  roofColor: string;
  aliases: string[];
  description: string;
  entrance: LatLon;
  /** True equirectangular GPS position in metres (used for GPS distance/snapping/hysteresis) */
  worldPos: WorldXZ;
  /** Visual offset in metres applied in 3D rendering so dense clusters have clear separation */
  renderOffset: WorldXZ;
  /** Center of the 3D building footprint mesh = worldPos + renderOffset */
  visualPos: WorldXZ;
  /** Front-door plaza position in 3D world space (outside the building's +Z front wall) */
  entranceVisualPos: WorldXZ;
  footprintSize: { width: number; depth: number; height: number };
  rotationY: number;
  landmarkType: HeroLandmarkType;
  arrivalRadiusM: number;
}

interface RawPlaceSpec {
  id: string;
  name: string;
  shortLabel: string;
  category: PlaceCategory;
  categoryLabel: string;
  roofColor: string;
  aliases: string[];
  description: string;
  lat: number;
  lon: number;
  renderOffset: WorldXZ;
  footprintSize: { width: number; depth: number; height: number };
  rotationY?: number;
  landmarkType: HeroLandmarkType;
}

const RAW_PLACES: RawPlaceSpec[] = [
  {
    id: 'GATE',
    name: 'Main Gate',
    shortLabel: 'Main Gate',
    category: 'admin',
    categoryLabel: 'Campus Entrance',
    roofColor: '#0E5E3A', // Lacoste Classic Court Green
    aliases: ['gate', 'main gate', 'entrance', 'entry', 'security'],
    description: 'The main north-east campus arch where every visit begins.',
    lat: 12.9022711,
    lon: 77.5188850,
    renderOffset: { x: 6, z: -4 },
    footprintSize: { width: 15, depth: 8, height: 8.5 },
    landmarkType: 'arch',
  },
  {
    id: 'ADM',
    name: 'Admin Block',
    shortLabel: 'Admin',
    category: 'admin',
    categoryLabel: 'Administration',
    roofColor: '#E05342', // Lacoste Chic Terracotta Coral
    aliases: ['admin block', 'admin', 'administration', 'office', 'principal'],
    description: 'Central administration offices, admissions desk, and campus flagpole.',
    lat: 12.9023831,
    lon: 77.5187190,
    renderOffset: { x: -10, z: -12 },
    footprintSize: { width: 18, depth: 12, height: 9 },
    landmarkType: 'flagpole',
  },
  {
    id: 'E1',
    name: 'E1 Block',
    shortLabel: 'E1 Block',
    category: 'engineering',
    categoryLabel: 'Engineering Block',
    roofColor: '#255AE6', // Bruno Simon Royal Cobalt Blue
    aliases: ['e1', 'e1 block', 'engineering 1'],
    description: 'North-west engineering lecture halls and foundational labs.',
    lat: 12.9024889,
    lon: 77.5181543,
    renderOffset: { x: -16, z: -14 },
    footprintSize: { width: 16, depth: 11, height: 8 },
    landmarkType: 'none',
  },
  {
    id: 'COE',
    name: 'COE Block',
    shortLabel: 'COE',
    category: 'engineering',
    categoryLabel: 'Center of Excellence',
    roofColor: '#3B82F6', // Luminous Electric Blue
    aliases: ['coe', 'coe block', 'center of excellence', 'research'],
    description: 'Center of Excellence housing robotics, AI research, and innovation labs.',
    lat: 12.9023767,
    lon: 77.5181238,
    renderOffset: { x: 14, z: -6 },
    footprintSize: { width: 16, depth: 11, height: 8 },
    landmarkType: 'none',
  },
  {
    id: 'C1',
    name: 'C1 Block (Canteen 1)',
    shortLabel: 'Canteen 1',
    category: 'food',
    categoryLabel: 'Food & Canteen',
    roofColor: '#F59E0B', // Warm Golden Ochre
    aliases: ['c1', 'canteen 1', 'food', 'coffee', 'snacks'],
    description: 'North lawn canteen serving hot filter coffee, dosas, and quick bites.',
    lat: 12.9021100,
    lon: 77.5181952,
    renderOffset: { x: 18, z: -10 },
    footprintSize: { width: 12, depth: 10, height: 6 },
    landmarkType: 'cup',
  },
  {
    id: 'C2',
    name: 'C2 Block (Canteen 2)',
    shortLabel: 'Canteen 2',
    category: 'food',
    categoryLabel: 'Food & Canteen',
    roofColor: '#FB923C', // Sunburst Tangerine
    aliases: ['c2', 'canteen 2', 'juice', 'bakery'],
    description: 'Fresh juice bar and bakery counter right beside the CSE plaza.',
    lat: 12.9019856,
    lon: 77.5180372,
    renderOffset: { x: 18, z: 8 },
    footprintSize: { width: 12, depth: 10, height: 6 },
    landmarkType: 'cup',
  },
  {
    id: 'C3',
    name: 'C3 Block (Canteen 3)',
    shortLabel: 'Canteen 3',
    category: 'food',
    categoryLabel: 'Food & Canteen',
    roofColor: '#F59E0B',
    aliases: ['c3', 'canteen 3', 'lunch', 'meals'],
    description: 'Student lunch pavilion and shaded outdoor seating courtyard.',
    lat: 12.9019416,
    lon: 77.5179425,
    renderOffset: { x: -4, z: 20 },
    footprintSize: { width: 12, depth: 10, height: 6 },
    landmarkType: 'cup',
  },
  {
    id: 'CSE',
    name: 'CSE Block',
    shortLabel: 'CSE',
    category: 'engineering',
    categoryLabel: 'Computer Science',
    roofColor: '#1D4ED8', // Deep Sapphire Blue
    aliases: ['cse', 'computer science', 'cs', 'coding', 'labs'],
    description: 'Department of Computer Science & Engineering, coding labs, and seminar rooms.',
    lat: 12.9019815,
    lon: 77.5179359,
    renderOffset: { x: -24, z: -6 },
    footprintSize: { width: 18, depth: 13, height: 9.5 },
    landmarkType: 'computer',
  },
  {
    id: 'PIV',
    name: 'PIV Block',
    shortLabel: 'PIV',
    category: 'engineering',
    categoryLabel: 'Engineering Annex',
    roofColor: '#255AE6',
    aliases: ['piv', 'piv block'],
    description: 'East-side project incubation and interdisciplinary workshop wing.',
    lat: 12.9019690,
    lon: 77.5190615,
    renderOffset: { x: 14, z: -12 },
    footprintSize: { width: 14, depth: 11, height: 7.5 },
    landmarkType: 'none',
  },
  {
    id: 'GAL',
    name: 'Galileo Block',
    shortLabel: 'Galileo',
    category: 'engineering',
    categoryLabel: 'Science & Exhibition',
    roofColor: '#3B82F6',
    aliases: ['gal', 'gallery', 'galileo', 'galileo block'],
    description: 'Galileo science studios, exhibition gallery, and design critique halls.',
    lat: 12.9019049,
    lon: 77.5190094,
    renderOffset: { x: 14, z: 10 },
    footprintSize: { width: 15, depth: 11, height: 8 },
    landmarkType: 'none',
  },
  {
    id: 'X1',
    name: 'X1 Block',
    shortLabel: 'X1 Block',
    category: 'engineering',
    categoryLabel: 'Academic Labs',
    roofColor: '#255AE6',
    aliases: ['x1', 'x1 block'],
    description: 'Central-east electronics and instrumentation laboratory complex.',
    lat: 12.9018409,
    lon: 77.5188799,
    renderOffset: { x: -14, z: -6 },
    footprintSize: { width: 15, depth: 11, height: 7.5 },
    landmarkType: 'none',
  },
  {
    id: 'ME',
    name: 'ME Block',
    shortLabel: 'ME Block',
    category: 'engineering',
    categoryLabel: 'Mechanical Engineering',
    roofColor: '#1E40AF',
    aliases: ['mech', 'mech block', 'mechanical', 'me', 'me block'],
    description: 'Mechanical Engineering CAD studios, thermal labs, and machine workshops.',
    lat: 12.9015525,
    lon: 77.5189999,
    renderOffset: { x: 12, z: 0 },
    footprintSize: { width: 18, depth: 13, height: 9 },
    landmarkType: 'gear',
  },
  {
    id: 'AT',
    name: 'AT Block (Amphitheatre)',
    shortLabel: 'Amphitheatre',
    category: 'academic',
    categoryLabel: 'Open-Air Theatre',
    roofColor: '#8B5CF6', // Royal Violet
    aliases: ['amphitheatre', 'theatre', 'at', 'at block', 'open air'],
    description: 'Stepped open-air amphitheatre for acoustic jams, club meets, and fests.',
    lat: 12.9013695,
    lon: 77.5188589,
    renderOffset: { x: -12, z: -4 },
    footprintSize: { width: 16, depth: 12, height: 6.5 },
    landmarkType: 'amphitheatre',
  },
  {
    id: 'MBA',
    name: 'MBA Block',
    shortLabel: 'MBA',
    category: 'academic',
    categoryLabel: 'Management Studies',
    roofColor: '#7C3AED',
    aliases: ['mba', 'mba block', 'management', 'business'],
    description: 'School of Management Studies, case-study amphitheatres, and pitch rooms.',
    lat: 12.9011607,
    lon: 77.5188885,
    renderOffset: { x: 12, z: 6 },
    footprintSize: { width: 17, depth: 12, height: 8.5 },
    landmarkType: 'briefcase',
  },
  {
    id: 'LIB',
    name: 'Library',
    shortLabel: 'Library',
    category: 'academic',
    categoryLabel: 'Central Library',
    roofColor: '#8B5CF6',
    aliases: ['lib', 'library', 'books', 'reading room', 'study'],
    description: 'Quiet multi-level central library, digital archives, and group study pods.',
    lat: 12.9008680,
    lon: 77.5177878,
    renderOffset: { x: 10, z: -8 },
    footprintSize: { width: 19, depth: 13, height: 9.5 },
    landmarkType: 'book',
  },
  {
    id: 'ARC',
    name: 'Architecture Block',
    shortLabel: 'Architecture',
    category: 'engineering',
    categoryLabel: 'School of Architecture',
    roofColor: '#0EA5E9', // Sky Blue
    aliases: ['architecture', 'arc', 'arch', 'design studio'],
    description: 'Drafting studios, model-making workshops, and courtyard critique spaces.',
    lat: 12.9008568,
    lon: 77.5175980,
    renderOffset: { x: -16, z: -8 },
    footprintSize: { width: 16, depth: 12, height: 8.5 },
    landmarkType: 'none',
  },
  {
    id: 'AUDI',
    name: 'Auditorium',
    shortLabel: 'Auditorium',
    category: 'academic',
    categoryLabel: 'Main Auditorium',
    roofColor: '#EC4899', // Electric Berry
    aliases: ['audi', 'auditorium', 'hall', 'stage', 'events'],
    description: 'Main campus auditorium hosting hackathons, keynotes, and cultural nights.',
    lat: 12.9007642,
    lon: 77.5182311,
    renderOffset: { x: -4, z: -8 },
    footprintSize: { width: 20, depth: 14, height: 10 },
    landmarkType: 'stage',
  },
  {
    id: 'J3',
    name: 'J3 Block (Junction 3)',
    shortLabel: 'Junction 3',
    category: 'junction',
    categoryLabel: 'Central Plaza Waypoint',
    roofColor: '#10B981', // Lacoste Tennis Court Mint
    aliases: ['j3', 'junction 3', 'plaza'],
    description: 'Central walkway plaza connecting the Auditorium, Library, and East spine.',
    lat: 12.9006912,
    lon: 77.5185133,
    renderOffset: { x: -8, z: 8 },
    footprintSize: { width: 11, depth: 9, height: 5.5 },
    landmarkType: 'none',
  },
  {
    id: 'J1',
    name: 'J1 Block (Junction 1)',
    shortLabel: 'Junction 1',
    category: 'junction',
    categoryLabel: 'East Spine Waypoint',
    roofColor: '#10B981',
    aliases: ['j1', 'junction 1'],
    description: 'East walkway junction leading south toward PU Block and the Temple.',
    lat: 12.9007084,
    lon: 77.5187950,
    renderOffset: { x: 14, z: -8 },
    footprintSize: { width: 11, depth: 9, height: 5.5 },
    landmarkType: 'none',
  },
  {
    id: 'J2',
    name: 'J2 Block (Junction 2)',
    shortLabel: 'Junction 2',
    category: 'junction',
    categoryLabel: 'South-East Crossway',
    roofColor: '#10B981',
    aliases: ['j2', 'junction 2'],
    description: 'Shaded walkway junction linking the central plaza to the south avenue.',
    lat: 12.9006508,
    lon: 77.5186843,
    renderOffset: { x: 8, z: 12 },
    footprintSize: { width: 11, depth: 9, height: 5.5 },
    landmarkType: 'none',
  },
  {
    id: 'SIC',
    name: 'SIC Block',
    shortLabel: 'SIC',
    category: 'academic',
    categoryLabel: 'Innovation & Incubation',
    roofColor: '#8B5CF6',
    aliases: ['sic', 'sic block', 'incubation', 'startup'],
    description: 'Student Innovation Center and maker space on the west avenue.',
    lat: 12.9005785,
    lon: 77.5175464,
    renderOffset: { x: -12, z: 6 },
    footprintSize: { width: 16, depth: 11, height: 8 },
    landmarkType: 'none',
  },
  {
    id: 'PU',
    name: 'PU Block',
    shortLabel: 'PU Block',
    category: 'academic',
    categoryLabel: 'Pre-University Wing',
    roofColor: '#6366F1', // Indigo Saffron
    aliases: ['pu', 'pu block', 'college'],
    description: 'South-east academic block with bright courtyard corridors.',
    lat: 12.9003920,
    lon: 77.5186389,
    renderOffset: { x: 10, z: 4 },
    footprintSize: { width: 16, depth: 11, height: 8 },
    landmarkType: 'none',
  },
  {
    id: 'S1',
    name: 'S1 Block',
    shortLabel: 'S1 Block',
    category: 'academic',
    categoryLabel: 'South-West Sciences',
    roofColor: '#8B5CF6',
    aliases: ['s1', 's1 block', 'science'],
    description: 'South-west basic sciences and seminar classrooms.',
    lat: 12.9000117,
    lon: 77.5176365,
    renderOffset: { x: -8, z: 0 },
    footprintSize: { width: 16, depth: 11, height: 8 },
    landmarkType: 'none',
  },
  {
    id: 'TEMP',
    name: 'Campus Temple',
    shortLabel: 'Temple',
    category: 'admin',
    categoryLabel: 'Shrine & Garden',
    roofColor: '#EA580C', // Warm Clay Terracotta
    aliases: ['temp', 'temple', 'shrine', 'prayer'],
    description: 'Peaceful stone-and-clay temple nestled in the south grove.',
    lat: 12.9000229,
    lon: 77.5185222,
    renderOffset: { x: 10, z: -8 },
    footprintSize: { width: 13, depth: 12, height: 9 },
    landmarkType: 'temple',
  },
  {
    id: 'T1',
    name: 'T1 Block',
    shortLabel: 'T1 Block',
    category: 'academic',
    categoryLabel: 'South Terminal Block',
    roofColor: '#7C3AED',
    aliases: ['t1', 't1 block', 'south block'],
    description: 'Southernmost academic studio block overlooking the temple garden.',
    lat: 12.8998579,
    lon: 77.5184509,
    renderOffset: { x: -10, z: 10 },
    footprintSize: { width: 16, depth: 11, height: 8 },
    landmarkType: 'none',
  },
];

export const CAMPUS_PLACES: CampusPlace[] = RAW_PLACES.map((raw) => {
  const entrance = { lat: raw.lat, lon: raw.lon };
  const worldPos = gpsToWorld(entrance);
  const visualPos = {
    x: worldPos.x + raw.renderOffset.x,
    z: worldPos.z + raw.renderOffset.z,
  };
  // Place the front-door plaza 4.8m outside the front (+Z) wall of the building
  const entranceVisualPos = {
    x: visualPos.x,
    z: visualPos.z + raw.footprintSize.depth * 0.5 + 4.8,
  };

  return {
    id: raw.id,
    name: raw.name,
    shortLabel: raw.shortLabel,
    category: raw.category,
    categoryLabel: raw.categoryLabel,
    roofColor: raw.roofColor,
    aliases: raw.aliases,
    description: raw.description,
    entrance,
    worldPos,
    renderOffset: raw.renderOffset,
    visualPos,
    entranceVisualPos,
    footprintSize: raw.footprintSize,
    rotationY: raw.rotationY ?? 0,
    landmarkType: raw.landmarkType,
    arrivalRadiusM: 18,
  };
});

export const PLACES_BY_ID: Record<string, CampusPlace> = Object.fromEntries(
  CAMPUS_PLACES.map((p) => [p.id, p])
);

/**
 * Checks if a world (x, z) point lies inside any of the 25 building 3D footprints
 * (with an optional safety margin in metres).
 */
export function isPointInsideAnyBuilding(pt: WorldXZ, marginM = 1.5): CampusPlace | null {
  for (const place of CAMPUS_PLACES) {
    const halfW = place.footprintSize.width * 0.5 + marginM;
    const halfD = place.footprintSize.depth * 0.5 + marginM;
    if (
      Math.abs(pt.x - place.visualPos.x) < halfW &&
      Math.abs(pt.z - place.visualPos.z) < halfD
    ) {
      return place;
    }
  }
  return null;
}
