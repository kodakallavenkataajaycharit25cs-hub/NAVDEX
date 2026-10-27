import { GbaTileAtlas } from './gbaTileAtlas';

export const TILE_SIZE = 16;
export const MAP_WIDTH_TILES = 124;
export const MAP_HEIGHT_TILES = 144;

export const CAMPUS_TILE_ORIGIN_X = 78;
export const CAMPUS_TILE_ORIGIN_Y = 12;
export const METRES_PER_TILE = 2.0;

export function worldToTile(worldX: number, worldZ: number): { tx: number; ty: number; px: number; py: number } {
  const tx = Math.round(worldX / METRES_PER_TILE) + CAMPUS_TILE_ORIGIN_X;
  const ty = Math.round(worldZ / METRES_PER_TILE) + CAMPUS_TILE_ORIGIN_Y;
  return {
    tx,
    ty,
    px: tx * TILE_SIZE,
    py: ty * TILE_SIZE,
  };
}

export function pixelToWorld(px: number, py: number): { x: number; z: number } {
  const tx = px / TILE_SIZE;
  const ty = py / TILE_SIZE;
  const x = (tx - CAMPUS_TILE_ORIGIN_X) * METRES_PER_TILE;
  const z = (ty - CAMPUS_TILE_ORIGIN_Y) * METRES_PER_TILE;
  return { x, z };
}

export interface PixelBuildingDef {
  id: string;
  name: string;
  tagline: string;
  tx: number;
  ty: number;
  wTiles: number;
  hTiles: number;
  color: string;
  icon: string;
  entranceTx: number;
  entranceTy: number;
  roofStyle?: 'hip' | 'peaked' | 'flat';
}

export interface CollisionBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const PIXEL_BUILDINGS: PixelBuildingDef[] = [
  // MAIN GATE
  {
    id: 'GATE',
    name: 'Campus Main Gate',
    tagline: 'Main security arch and arrival avenue',
    tx: 72,
    ty: 4,
    wTiles: 12,
    hTiles: 4,
    color: '#059669',
    icon: '⛩️',
    entranceTx: 78,
    entranceTy: 10,
    roofStyle: 'hip',
  },

  // CENTER BLOCKS (Admin, Gallery with nested Amphi, Audi, Library, SIC)
  {
    id: 'ADM',
    name: 'Admin Block',
    tagline: 'Central administration & admissions office',
    tx: 36,
    ty: 26,
    wTiles: 28,
    hTiles: 7,
    color: '#E11D48',
    icon: '🏛️',
    entranceTx: 50,
    entranceTy: 34,
    roofStyle: 'hip',
  },
  {
    id: 'GAL',
    name: 'Galileo Gallery Block',
    tagline: 'Design exhibition studios & art critique courtyard',
    tx: 32,
    ty: 39,
    wTiles: 36,
    hTiles: 18,
    color: '#0284C7',
    icon: '🎨',
    entranceTx: 50,
    entranceTy: 59,
    roofStyle: 'hip',
  },
  {
    id: 'AT',
    name: 'Open Amphitheatre',
    tagline: 'Tiered acoustic arena nested inside Gallery courtyard',
    tx: 42,
    ty: 44,
    wTiles: 16,
    hTiles: 9,
    color: '#7C3AED',
    icon: '🎭',
    entranceTx: 50,
    entranceTy: 54,
  },
  {
    id: 'AUDI',
    name: 'Main Auditorium',
    tagline: 'Grand symposium hall for keynotes & fests',
    tx: 50,
    ty: 68,
    wTiles: 18,
    hTiles: 11,
    color: '#D97706',
    icon: '🎙️',
    entranceTx: 59,
    entranceTy: 81,
    roofStyle: 'hip',
  },
  {
    id: 'LIB',
    name: 'Central Library',
    tagline: 'Quiet reading sanctuaries & digital research suites',
    tx: 44,
    ty: 92,
    wTiles: 26,
    hTiles: 12,
    color: '#4F46E5',
    icon: '📚',
    entranceTx: 57,
    entranceTy: 105,
    roofStyle: 'hip',
  },
  {
    id: 'SIC',
    name: 'Student Innovation Center (SIC)',
    tagline: 'Incubation maker space & robotics workspace',
    tx: 46,
    ty: 106,
    wTiles: 22,
    hTiles: 5,
    color: '#059669',
    icon: '💡',
    entranceTx: 57,
    entranceTy: 112,
    roofStyle: 'flat',
  },

  // LEFT COLUMN BLOCKS (ECE, COE, IT, CSE, CIVIL, AIML, HOSTEL, SCHOOL)
  {
    id: 'ECE',
    name: 'ECE Block',
    tagline: 'Electronics & Communication laboratories',
    tx: 10,
    ty: 12,
    wTiles: 11,
    hTiles: 8,
    color: '#EA580C',
    icon: '📡',
    entranceTx: 16,
    entranceTy: 21,
    roofStyle: 'peaked',
  },
  {
    id: 'COE',
    name: 'COE Block',
    tagline: 'Center of Excellence in High-Tech Research',
    tx: 10,
    ty: 24,
    wTiles: 11,
    hTiles: 9,
    color: '#2563EB',
    icon: '🔬',
    entranceTx: 16,
    entranceTy: 34,
    roofStyle: 'peaked',
  },
  {
    id: 'IT',
    name: 'IT Block',
    tagline: 'Information Technology & Cloud Systems wing',
    tx: 10,
    ty: 44,
    wTiles: 12,
    hTiles: 12,
    color: '#0284C7',
    icon: '💻',
    entranceTx: 16,
    entranceTy: 58,
    roofStyle: 'hip',
  },
  {
    id: 'CSE',
    name: 'CSE Block',
    tagline: 'Computer Science & Software Development labs',
    tx: 26,
    ty: 64,
    wTiles: 16,
    hTiles: 8,
    color: '#1D4ED8',
    icon: '🖥️',
    entranceTx: 34,
    entranceTy: 73,
    roofStyle: 'hip',
  },
  {
    id: 'CIVIL',
    name: 'Civil Engineering Block',
    tagline: 'Surveying, material mechanics & construction studio',
    tx: 28,
    ty: 78,
    wTiles: 12,
    hTiles: 11,
    color: '#D97706',
    icon: '📐',
    entranceTx: 34,
    entranceTy: 90,
    roofStyle: 'peaked',
  },
  {
    id: 'AIML',
    name: 'AI & Data Science Block',
    tagline: 'Neural network training & machine intelligence labs',
    tx: 28,
    ty: 94,
    wTiles: 12,
    hTiles: 11,
    color: '#7C3AED',
    icon: '🤖',
    entranceTx: 34,
    entranceTy: 106,
    roofStyle: 'hip',
  },
  {
    id: 'HOSTEL',
    name: 'Student Residence Hostel',
    tagline: 'Campus living dorms, rec room & student dining',
    tx: 8,
    ty: 98,
    wTiles: 14,
    hTiles: 9,
    color: '#BE123C',
    icon: '🏠',
    entranceTx: 15,
    entranceTy: 108,
    roofStyle: 'peaked',
  },
  {
    id: 'SCHOOL',
    name: 'Campus Model School',
    tagline: 'Experimental academy & school department',
    tx: 8,
    ty: 118,
    wTiles: 18,
    hTiles: 8,
    color: '#0D9488',
    icon: '🎒',
    entranceTx: 17,
    entranceTy: 127,
    roofStyle: 'hip',
  },

  // RIGHT COLUMN BLOCKS (MECH, MBA, PU, TEMPLE, GROUND)
  {
    id: 'ME',
    name: 'Mechanical Block',
    tagline: 'Workshops, CNC machining & thermal power labs',
    tx: 88,
    ty: 18,
    wTiles: 13,
    hTiles: 13,
    color: '#DC2626', // Pokémon Center Red!
    icon: '⚙️',
    entranceTx: 86,
    entranceTy: 25,
    roofStyle: 'hip',
  },
  {
    id: 'MBA',
    name: 'MBA Block',
    tagline: 'Management amphitheatre, finance & analytics',
    tx: 89,
    ty: 38,
    wTiles: 12,
    hTiles: 13,
    color: '#1E3A8A',
    icon: '💼',
    entranceTx: 87,
    entranceTy: 45,
    roofStyle: 'hip',
  },
  {
    id: 'PU',
    name: 'Pre-University Wing (PU)',
    tagline: 'Junior college lecture halls & science laboratories',
    tx: 90,
    ty: 60,
    wTiles: 12,
    hTiles: 15,
    color: '#4338CA',
    icon: '📖',
    entranceTx: 88,
    entranceTy: 68,
    roofStyle: 'peaked',
  },
  {
    id: 'TEMP',
    name: 'Campus Temple',
    tagline: 'Sacred stone shrine & peaceful meditation garden',
    tx: 98,
    ty: 82,
    wTiles: 13,
    hTiles: 12,
    color: '#C2410C',
    icon: '🛕',
    entranceTx: 96,
    entranceTy: 94,
    roofStyle: 'peaked',
  },
  {
    id: 'GROUND',
    name: 'Campus Sports Ground',
    tagline: 'Athletic track, soccer turf & cricket stadium',
    tx: 88,
    ty: 106,
    wTiles: 28,
    hTiles: 15,
    color: '#15803D',
    icon: '⚽',
    entranceTx: 96,
    entranceTy: 104,
  },
];

export const SOLID_COLLISION_BOXES: CollisionBox[] = [];

PIXEL_BUILDINGS.forEach((b) => {
  if (b.id === 'GROUND' || b.id === 'AT') return;

  const minX = b.tx * TILE_SIZE + 2;
  const minY = b.ty * TILE_SIZE + 4;
  const maxX = (b.tx + b.wTiles) * TILE_SIZE - 2;
  const maxY = (b.ty + b.hTiles) * TILE_SIZE - 2;
  SOLID_COLLISION_BOXES.push({ minX, minY, maxX, maxY });
});

export function isPositionBlocked(px: number, py: number, radius = 5): boolean {
  const margin = 16;
  if (
    px < margin ||
    px > MAP_WIDTH_TILES * TILE_SIZE - margin ||
    py < margin ||
    py > MAP_HEIGHT_TILES * TILE_SIZE - margin
  ) {
    return true;
  }

  for (const box of SOLID_COLLISION_BOXES) {
    if (
      px + radius > box.minX &&
      px - radius < box.maxX &&
      py + radius > box.minY &&
      py - radius < box.maxY
    ) {
      return true;
    }
  }

  return false;
}

export class PixelTilemapRenderer {
  private static cachedMapCanvas: HTMLCanvasElement | null = null;

  public static getMapCanvas(): HTMLCanvasElement {
    if (this.cachedMapCanvas) return this.cachedMapCanvas;

    const width = MAP_WIDTH_TILES * TILE_SIZE;
    const height = MAP_HEIGHT_TILES * TILE_SIZE;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // 1. Lush GBA Pokémon Emerald / FireRed grass
    this.drawGbaGrass(ctx, width, height);

    // 2. The Complete Junction Road Network
    this.drawJunctionRoadNetwork(ctx);

    // 3. Sports Ground & Athletic Stadium
    this.drawSportsGround(ctx);

    // 4. All Campus Buildings in authentic Pokémon GBA pixel styling
    this.drawAllCampusBuildings(ctx);

    // 5. Authentic Pokémon GBA bulbous pine trees (Image 1!), flower bushes & lamps
    this.drawEnvironmentAndTrees(ctx);

    this.cachedMapCanvas = canvas;
    return canvas;
  }

  private static drawGbaGrass(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Authentic Pokémon Emerald soft grass base
    ctx.fillStyle = '#78C850';
    ctx.fillRect(0, 0, width, height);

    // Stepped stipples
    ctx.fillStyle = '#68B840';
    for (let ty = 0; ty < MAP_HEIGHT_TILES; ty++) {
      for (let tx = 0; tx < MAP_WIDTH_TILES; tx++) {
        if ((tx + ty) % 2 === 0) {
          ctx.fillRect(tx * TILE_SIZE + 2, ty * TILE_SIZE + 2, 2, 2);
          ctx.fillRect(tx * TILE_SIZE + 10, ty * TILE_SIZE + 10, 2, 2);
        }
      }
    }

    // Grass blade tufts in sunlight green
    ctx.fillStyle = '#98E868';
    for (let i = 0; i < 700; i++) {
      const rx = (i * 47) % (width - 16);
      const ry = (i * 79) % (height - 16);
      ctx.fillRect(rx, ry, 1, 3);
      ctx.fillRect(rx + 1, ry - 1, 1, 3);
      ctx.fillRect(rx + 2, ry + 1, 1, 2);
    }
  }

  private static drawJunctionRoadNetwork(ctx: CanvasRenderingContext2D) {
    const pathBase = '#F8E8C0'; // Pokémon Emerald sandy paver
    const pathBorder = '#489830'; // Dark grass transition fringe
    const pathStipple = '#E0D0A0';

    const drawRoadSegment = (x1: number, y1: number, x2: number, y2: number, wPx: number) => {
      const minX = Math.min(x1, x2) - Math.floor(wPx / 2);
      const maxX = Math.max(x1, x2) + Math.floor(wPx / 2);
      const minY = Math.min(y1, y2) - Math.floor(wPx / 2);
      const maxY = Math.max(y1, y2) + Math.floor(wPx / 2);

      // Dark grass transition border
      ctx.fillStyle = pathBorder;
      ctx.fillRect(minX - 2, minY - 2, maxX - minX + 4, maxY - minY + 4);

      // Stepped tooth fringe along borders (Authentic GBA grass-to-path edge!)
      ctx.fillStyle = pathBorder;
      for (let x = minX; x <= maxX; x += 4) {
        ctx.fillRect(x, minY - 3, 2, 1);
        ctx.fillRect(x + 2, maxY + 2, 2, 1);
      }
      for (let y = minY; y <= maxY; y += 4) {
        ctx.fillRect(minX - 3, y, 1, 2);
        ctx.fillRect(maxX + 2, y + 2, 1, 2);
      }

      // Sand path fill
      ctx.fillStyle = pathBase;
      ctx.fillRect(minX, minY, maxX - minX, maxY - minY);

      // Paver stipples
      ctx.fillStyle = pathStipple;
      for (let y = minY + 4; y < maxY - 4; y += 12) {
        for (let x = minX + 4; x < maxX - 4; x += 14) {
          ctx.fillRect(x, y, 3, 2);
        }
      }
    };

    const drawPlazaSquare = (cx: number, cy: number, sizePx: number) => {
      ctx.fillStyle = pathBorder;
      ctx.fillRect(cx - sizePx / 2 - 2, cy - sizePx / 2 - 2, sizePx + 4, sizePx + 4);
      ctx.fillStyle = pathBase;
      ctx.fillRect(cx - sizePx / 2, cy - sizePx / 2, sizePx, sizePx);
    };

    // 1. MAIN GATE TO SOUTH AVENUE (X = 78 tiles)
    const gateAvenueX = 78 * TILE_SIZE;
    drawRoadSegment(gateAvenueX, 8 * TILE_SIZE, gateAvenueX, 74 * TILE_SIZE, 34);

    // 2. NORTH T-JUNCTION (Branch going WEST above Admin towards ECE)
    const northJunctionY = 17 * TILE_SIZE;
    const westCorridorX = 23 * TILE_SIZE;
    drawRoadSegment(westCorridorX, northJunctionY, gateAvenueX, northJunctionY, 30);
    drawPlazaSquare(gateAvenueX, northJunctionY, 38);

    // 3. WEST NORTH-SOUTH CORRIDOR
    drawRoadSegment(westCorridorX, northJunctionY, westCorridorX, 64 * TILE_SIZE, 30);
    drawPlazaSquare(westCorridorX, northJunctionY, 36);

    // Path into ECE
    drawRoadSegment(westCorridorX, 17 * TILE_SIZE, 16 * TILE_SIZE, 17 * TILE_SIZE, 24);

    // 4. DIAGONAL & CURVING ROADS PAST IT TO HOSTEL & CSE
    const hostelRoadX = 16 * TILE_SIZE;
    drawRoadSegment(westCorridorX, 62 * TILE_SIZE, hostelRoadX, 74 * TILE_SIZE, 28);
    drawRoadSegment(hostelRoadX, 74 * TILE_SIZE, hostelRoadX, 124 * TILE_SIZE, 28);

    const cseRoadX = 34 * TILE_SIZE;
    drawRoadSegment(westCorridorX, 62 * TILE_SIZE, cseRoadX, 73 * TILE_SIZE, 26);

    // 5. SOUTH PASSAGE
    const southRoadY = 124 * TILE_SIZE;
    drawRoadSegment(hostelRoadX, southRoadY, 58 * TILE_SIZE, southRoadY, 26);

    const midWestX = 42 * TILE_SIZE;
    drawRoadSegment(midWestX, southRoadY, midWestX, 72 * TILE_SIZE, 24);

    // 6. MAIN EAST ROAD: PAST GALLERY/MBA -> AUDI/PU -> AROUND TEMPLE -> GROUND
    drawRoadSegment(gateAvenueX, 72 * TILE_SIZE, 82 * TILE_SIZE, 86 * TILE_SIZE, 30);

    const templeJunctionX = 84 * TILE_SIZE;
    drawRoadSegment(82 * TILE_SIZE, 86 * TILE_SIZE, templeJunctionX, 104 * TILE_SIZE, 30);

    // Branch to Library / SIC entrance
    drawRoadSegment(templeJunctionX, 102 * TILE_SIZE, 57 * TILE_SIZE, 102 * TILE_SIZE, 26);

    // Branch to SPORTS GROUND
    const groundX = 96 * TILE_SIZE;
    drawRoadSegment(templeJunctionX, 102 * TILE_SIZE, groundX, 104 * TILE_SIZE, 30);

    // SIC to South Passage
    drawRoadSegment(57 * TILE_SIZE, 102 * TILE_SIZE, 57 * TILE_SIZE, southRoadY, 24);
  }

  private static drawSportsGround(ctx: CanvasRenderingContext2D) {
    const ground = PIXEL_BUILDINGS.find((b) => b.id === 'GROUND')!;
    const px = ground.tx * TILE_SIZE;
    const py = ground.ty * TILE_SIZE;
    const w = ground.wTiles * TILE_SIZE;
    const h = ground.hTiles * TILE_SIZE;

    // Clay Running Track
    ctx.fillStyle = '#C2410C';
    ctx.beginPath();
    ctx.roundRect(px, py, w, h, 20);
    ctx.fill();

    // White Track Lines
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(px + 4, py + 4, w - 8, h - 8, 16);
    ctx.stroke();

    // Inner Green Pitch
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.roundRect(px + 12, py + 12, w - 24, h - 24, 10);
    ctx.fill();

    // Soccer Lines
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeRect(px + 18, py + 18, w - 36, h - 36);
    ctx.beginPath();
    ctx.arc(px + w / 2, py + h / 2, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(px + w / 2, py + 18);
    ctx.lineTo(px + w / 2, py + h - 18);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPORTS GROUND', px + w / 2, py - 4);
  }

  private static drawAllCampusBuildings(ctx: CanvasRenderingContext2D) {
    PIXEL_BUILDINGS.forEach((b) => {
      if (b.id === 'GROUND' || b.id === 'AT') return;

      const px = b.tx * TILE_SIZE;
      const py = b.ty * TILE_SIZE;
      const w = b.wTiles * TILE_SIZE;
      const h = b.hTiles * TILE_SIZE;

      // Draw with authentic Pokémon GBA building architecture!
      GbaTileAtlas.drawPokemonBuilding(ctx, px, py, w, h, b.color, b.id, b.roofStyle || 'hip');

      // Specific Architectural Landmark Features
      if (b.id === 'ME') {
        // Brass Gear on Mechanical Block
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(px + 14, py + 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#B45309';
        ctx.beginPath();
        ctx.arc(px + 14, py + 8, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.id === 'ADM') {
        // Campus Flagpole
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(px + w / 2, py - 12, 2, 12);
        ctx.fillStyle = '#F97316';
        ctx.fillRect(px + w / 2 + 2, py - 12, 8, 4);
      } else if (b.id === 'TEMP') {
        // Temple Golden Spire
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(px + w / 2, py - 14);
        ctx.lineTo(px + w / 2 - 8, py);
        ctx.lineTo(px + w / 2 + 8, py);
        ctx.fill();
      }
    });

    // Special: AMPHITHEATRE (Nested inside GALLERY courtyard)
    const amphi = PIXEL_BUILDINGS.find((b) => b.id === 'AT')!;
    const ax = amphi.tx * TILE_SIZE + (amphi.wTiles * TILE_SIZE) / 2;
    const ay = amphi.ty * TILE_SIZE + (amphi.hTiles * TILE_SIZE) / 2;

    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.ellipse(ax, ay, 46, 32, 0, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.ellipse(ax, ay, 34, 22, 0, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#854D0E';
    ctx.fillRect(ax - 22, ay - 2, 44, 16);
    ctx.fillStyle = '#CA8A04';
    ctx.beginPath();
    ctx.arc(ax, ay + 6, 6, 0, Math.PI * 2);
    ctx.fill();

    const buntingCols = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899'];
    for (let lx = ax - 24; lx <= ax + 24; lx += 8) {
      ctx.fillStyle = buntingCols[Math.floor(Math.abs(lx) / 8) % buntingCols.length];
      ctx.fillRect(lx, ay + 16, 3, 3);
    }
  }

  /**
   * Environmental Trees & Scenery: Stamped with GbaTileAtlas sprites!
   */
  private static drawEnvironmentAndTrees(ctx: CanvasRenderingContext2D) {
    const pineTree = GbaTileAtlas.getPokemonPineTree();
    const oakTree = GbaTileAtlas.getPokemonOakTree();
    const bush = GbaTileAtlas.getFlowerBush();

    // 1. DENSE OVERLAPPING FOREST PERIMETER WALLS (Image 1 replica!)
    // Left outer border forest
    for (let ty = 6; ty <= 138; ty += 4) {
      ctx.drawImage(pineTree, 2 * TILE_SIZE, ty * TILE_SIZE);
      ctx.drawImage(pineTree, 5 * TILE_SIZE, (ty + 2) * TILE_SIZE);
    }

    // Right outer border forest
    for (let ty = 6; ty <= 138; ty += 4) {
      ctx.drawImage(pineTree, 117 * TILE_SIZE, ty * TILE_SIZE);
      ctx.drawImage(pineTree, 120 * TILE_SIZE, (ty + 2) * TILE_SIZE);
    }

    // Top outer border (flanking gate)
    for (let tx = 8; tx <= 68; tx += 4) {
      ctx.drawImage(pineTree, tx * TILE_SIZE, 4 * TILE_SIZE);
    }
    for (let tx = 86; tx <= 116; tx += 4) {
      ctx.drawImage(pineTree, tx * TILE_SIZE, 4 * TILE_SIZE);
    }

    // Bottom outer border
    for (let tx = 6; tx <= 118; tx += 4) {
      ctx.drawImage(pineTree, tx * TILE_SIZE, 136 * TILE_SIZE);
    }

    // 2. COURTYARD GROVES (Shading avenues & plazas)
    for (let tx = 38; tx <= 62; tx += 6) {
      ctx.drawImage(pineTree, tx * TILE_SIZE, 11 * TILE_SIZE);
    }

    for (let ty = 80; ty <= 104; ty += 8) {
      ctx.drawImage(pineTree, 20 * TILE_SIZE, ty * TILE_SIZE);
    }

    // Grove around Temple
    ctx.drawImage(pineTree, 94 * TILE_SIZE, 76 * TILE_SIZE);
    ctx.drawImage(pineTree, 112 * TILE_SIZE, 78 * TILE_SIZE);
    ctx.drawImage(pineTree, 112 * TILE_SIZE, 94 * TILE_SIZE);

    // 3. DECIDUOUS HERO OAK TREES (Image 1 center trees)
    ctx.drawImage(oakTree, 70 * TILE_SIZE, 82 * TILE_SIZE);
    ctx.drawImage(oakTree, 40 * TILE_SIZE, 78 * TILE_SIZE);
    ctx.drawImage(oakTree, 72 * TILE_SIZE, 100 * TILE_SIZE);

    // 4. FLOWER HEDGE BUSHES (With white blossoms lining paths from Image 1!)
    for (let x = 36 * TILE_SIZE; x <= 64 * TILE_SIZE; x += 16) {
      ctx.drawImage(bush, x, 22 * TILE_SIZE);
    }
    for (let y = 20 * TILE_SIZE; y <= 60 * TILE_SIZE; y += 16) {
      ctx.drawImage(bush, 72 * TILE_SIZE, y);
    }

    // 5. BOULDERS (From Image 1!)
    const boulders = [
      { x: 32, y: 18 },
      { x: 84, y: 14 },
      { x: 74, y: 64 },
      { x: 44, y: 88 },
      { x: 80, y: 94 },
    ];
    boulders.forEach((b) => {
      this.drawRockBoulder(ctx, b.x * TILE_SIZE, b.y * TILE_SIZE);
    });

    // 6. STREET LAMPS
    for (let y = 14 * TILE_SIZE; y <= 70 * TILE_SIZE; y += 14 * TILE_SIZE) {
      this.drawGbaStreetLamp(ctx, 74 * TILE_SIZE, y);
    }
  }

  public static drawRockBoulder(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = 'rgba(14, 40, 18, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + 4, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(x, y, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(x - 3, y - 2, 4, 2);
  }

  private static drawGbaStreetLamp(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
    ctx.beginPath();
    ctx.arc(x, y + 8, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x - 1, y - 6, 2, 16);
    ctx.fillRect(x - 3, y + 8, 6, 2);

    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(x - 2, y - 10, 4, 4);
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(x - 1, y - 9, 2, 2);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x - 3, y - 12, 6, 2);
  }
}
