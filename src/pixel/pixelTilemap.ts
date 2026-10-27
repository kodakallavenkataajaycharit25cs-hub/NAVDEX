export const TILE_SIZE = 16;
export const MAP_WIDTH_TILES = 124;
export const MAP_HEIGHT_TILES = 144;

export const CAMPUS_TILE_ORIGIN_X = 78; // Main gate alignment
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
}

export interface CollisionBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Campus Buildings Mapped 100% to User's Hand-Drawn Sketch & Junction Paths
 */
export const PIXEL_BUILDINGS: PixelBuildingDef[] = [
  // MAIN GATE (Top right-center entrance)
  {
    id: 'GATE',
    name: 'Campus Main Gate',
    tagline: 'Main security arch and primary campus arrival avenue',
    tx: 72,
    ty: 4,
    wTiles: 12,
    hTiles: 4,
    color: '#059669',
    icon: '⛩️',
    entranceTx: 78,
    entranceTy: 10,
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
  },

  // RIGHT COLUMN BLOCKS (MECH, MBA, PU, TEMPLE, GROUND)
  {
    id: 'ME',
    name: 'Mechanical Block',
    tagline: 'Machine tools, foundry & CAD/CAM studios',
    tx: 88,
    ty: 18,
    wTiles: 13,
    hTiles: 13,
    color: '#B45309',
    icon: '⚙️',
    entranceTx: 86,
    entranceTy: 25,
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

/**
 * Solid Collision Boxes (Character CANNOT walk inside these!)
 */
export const SOLID_COLLISION_BOXES: CollisionBox[] = [];

PIXEL_BUILDINGS.forEach((b) => {
  // Sports ground and nested Amphitheatre are walkable fields/plazas
  if (b.id === 'GROUND' || b.id === 'AT') return;

  const minX = b.tx * TILE_SIZE + 2;
  const minY = b.ty * TILE_SIZE + 4;
  const maxX = (b.tx + b.wTiles) * TILE_SIZE - 2;
  const maxY = (b.ty + b.hTiles) * TILE_SIZE - 2;
  SOLID_COLLISION_BOXES.push({ minX, minY, maxX, maxY });
});

export function isPositionBlocked(px: number, py: number, radius = 5): boolean {
  // 1. Campus Map Boundaries
  const margin = 16;
  if (
    px < margin ||
    px > MAP_WIDTH_TILES * TILE_SIZE - margin ||
    py < margin ||
    py > MAP_HEIGHT_TILES * TILE_SIZE - margin
  ) {
    return true;
  }

  // 2. Solid Building Boxes
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

    // 1. Base Pokémon GBA grass field
    this.drawGbaGrass(ctx, width, height);

    // 2. The Complete Pathway Network matching the user's junction sketch!
    this.drawJunctionRoadNetwork(ctx);

    // 3. Sports Ground & Athletic Stadium
    this.drawSportsGround(ctx);

    // 4. All Campus Buildings from user sketch
    this.drawAllCampusBuildings(ctx);

    // 5. Authentic Pokémon GBA bulbous pine trees (Image 1 inspired!), flower bushes, benches & lamps
    this.drawEnvironmentAndTrees(ctx);

    this.cachedMapCanvas = canvas;
    return canvas;
  }

  private static drawGbaGrass(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = '#80CE78';
    ctx.fillRect(0, 0, width, height);

    // GBA texture stipples
    ctx.fillStyle = '#72C26A';
    for (let ty = 0; ty < MAP_HEIGHT_TILES; ty++) {
      for (let tx = 0; tx < MAP_WIDTH_TILES; tx++) {
        if ((tx + ty) % 2 === 0) {
          ctx.fillRect(tx * TILE_SIZE + 2, ty * TILE_SIZE + 2, 2, 2);
          ctx.fillRect(tx * TILE_SIZE + 10, ty * TILE_SIZE + 10, 2, 2);
        }
      }
    }

    // Grass blade tufts
    ctx.fillStyle = '#9AE890';
    for (let i = 0; i < 700; i++) {
      const rx = (i * 47) % (width - 16);
      const ry = (i * 79) % (height - 16);
      ctx.fillRect(rx, ry, 1, 3);
      ctx.fillRect(rx + 1, ry - 1, 1, 3);
      ctx.fillRect(rx + 2, ry + 1, 1, 2);
    }
  }

  /**
   * The Complete Junction Road Network (Matching User's Arrowed Sketch Exactly!)
   *
   * Flow:
   * 1. MAIN GATE (top right-center, X=78) -> Main avenue goes DOWN between (Admin/Gallery) and (Mech/MBA).
   * 2. T-JUNCTION south of Gate: Horizontal branch heads WEST across top of Admin towards ECE (X=24).
   * 3. WEST ROAD: Runs SOUTH between (COE/IT) and (Admin/Gallery).
   * 4. Past IT (Y=60), branches down-left towards HOSTEL & SCHOOL, and east towards CSE.
   * 5. South road runs past School, turns north between (Civil/AIML) and (Library/Audi).
   * 6. Main East road passes Audi & PU, curves around Temple, branches to Library & Ground!
   */
  private static drawJunctionRoadNetwork(ctx: CanvasRenderingContext2D) {
    const pathBase = '#F4E8D0';
    const pathBorder = '#589E50';
    const pathStipple = '#E4D6BC';

    const drawRoadSegment = (x1: number, y1: number, x2: number, y2: number, wPx: number) => {
      const minX = Math.min(x1, x2) - wPx / 2;
      const maxX = Math.max(x1, x2) + wPx / 2;
      const minY = Math.min(y1, y2) - wPx / 2;
      const maxY = Math.max(y1, y2) + wPx / 2;

      ctx.fillStyle = pathBorder;
      ctx.fillRect(minX - 2, minY - 2, maxX - minX + 4, maxY - minY + 4);

      ctx.fillStyle = pathBase;
      ctx.fillRect(minX, minY, maxX - minX, maxY - minY);

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
    // Runs clean down between Admin (ends at X=64) and Mech (starts at X=88)!
    const gateAvenueX = 78 * TILE_SIZE;
    drawRoadSegment(gateAvenueX, 8 * TILE_SIZE, gateAvenueX, 74 * TILE_SIZE, 34);

    // 2. NORTH T-JUNCTION (Branch going WEST above Admin towards ECE)
    const northJunctionY = 17 * TILE_SIZE;
    const westCorridorX = 23 * TILE_SIZE;
    // Horizontal crossroad from gate avenue all the way to west corridor
    drawRoadSegment(westCorridorX, northJunctionY, gateAvenueX, northJunctionY, 30);
    drawPlazaSquare(gateAvenueX, northJunctionY, 38);

    // 3. WEST NORTH-SOUTH CORRIDOR (Between COE/IT on left and Admin/Gallery on right)
    drawRoadSegment(westCorridorX, northJunctionY, westCorridorX, 64 * TILE_SIZE, 30);
    drawPlazaSquare(westCorridorX, northJunctionY, 36);

    // Path leading into ECE entrance (north of COE)
    drawRoadSegment(westCorridorX, 17 * TILE_SIZE, 16 * TILE_SIZE, 17 * TILE_SIZE, 24);

    // 4. DIAGONAL / CURVING ROAD PAST IT TOWARDS HOSTEL & CSE
    // South of IT (Y=62), branch splits:
    // Left branch down towards HOSTEL & SCHOOL
    const hostelRoadX = 16 * TILE_SIZE;
    drawRoadSegment(westCorridorX, 62 * TILE_SIZE, hostelRoadX, 74 * TILE_SIZE, 28);
    drawRoadSegment(hostelRoadX, 74 * TILE_SIZE, hostelRoadX, 124 * TILE_SIZE, 28); // down to School

    // Right branch towards CSE
    const cseRoadX = 34 * TILE_SIZE;
    drawRoadSegment(westCorridorX, 62 * TILE_SIZE, cseRoadX, 73 * TILE_SIZE, 26);

    // 5. SOUTH PASSAGE (Past School -> SIC -> Library)
    const southRoadY = 124 * TILE_SIZE;
    drawRoadSegment(hostelRoadX, southRoadY, 58 * TILE_SIZE, southRoadY, 26);

    // Upward branch between (Civil/AIML) and (Library/Audi)
    const midWestX = 42 * TILE_SIZE;
    drawRoadSegment(midWestX, southRoadY, midWestX, 72 * TILE_SIZE, 24);

    // 6. MAIN EAST ROAD: PAST GALLERY/MBA -> AUDI/PU -> CURVING AROUND TEMPLE -> GROUND
    // Below Gallery (Y=62), avenue continues south between Audi (X=50..68) and PU (X=90..102)
    const audiJunctionY = 74 * TILE_SIZE;
    drawRoadSegment(gateAvenueX, 72 * TILE_SIZE, 82 * TILE_SIZE, 86 * TILE_SIZE, 30);

    // Curving path between Temple and Library
    const templeJunctionX = 84 * TILE_SIZE;
    const templeJunctionY = 88 * TILE_SIZE;
    drawRoadSegment(82 * TILE_SIZE, 86 * TILE_SIZE, templeJunctionX, 104 * TILE_SIZE, 30);

    // Branch to Library / SIC entrance
    drawRoadSegment(templeJunctionX, 102 * TILE_SIZE, 57 * TILE_SIZE, 102 * TILE_SIZE, 26);

    // Branch to SPORTS GROUND
    const groundX = 96 * TILE_SIZE;
    drawRoadSegment(templeJunctionX, 102 * TILE_SIZE, groundX, 104 * TILE_SIZE, 30);

    // Connection from SIC to South Passage
    drawRoadSegment(57 * TILE_SIZE, 102 * TILE_SIZE, 57 * TILE_SIZE, southRoadY, 24);
  }

  private static drawSportsGround(ctx: CanvasRenderingContext2D) {
    const ground = PIXEL_BUILDINGS.find((b) => b.id === 'GROUND')!;
    const px = ground.tx * TILE_SIZE;
    const py = ground.ty * TILE_SIZE;
    const w = ground.wTiles * TILE_SIZE;
    const h = ground.hTiles * TILE_SIZE;

    // Clay Running Track
    ctx.fillStyle = '#DC2626';
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

    // Soccer / Football Lines
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
      if (b.id === 'GROUND') return;

      const px = b.tx * TILE_SIZE;
      const py = b.ty * TILE_SIZE;
      const w = b.wTiles * TILE_SIZE;
      const h = b.hTiles * TILE_SIZE;

      // Cast Shadow
      ctx.fillStyle = 'rgba(16, 32, 16, 0.4)';
      ctx.fillRect(px - 2, py + h - 4, w + 4, 8);

      // Building Wall Facade
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(px, py + 14, w, h - 14);

      // Base plinth
      ctx.fillStyle = '#64748B';
      ctx.fillRect(px, py + h - 4, w, 4);

      // Roof
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.moveTo(px + 4, py);
      ctx.lineTo(px + w - 4, py);
      ctx.lineTo(px + w, py + 14);
      ctx.lineTo(px, py + 14);
      ctx.closePath();
      ctx.fill();

      // Roof Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(px + 6, py + 1, w - 12, 3);

      // Windows
      ctx.fillStyle = '#38BDF8';
      const windowCount = Math.floor(w / 18);
      for (let i = 0; i < windowCount; i++) {
        const wx = px + 8 + i * 18;
        if (wx + 10 < px + w - 6) {
          ctx.fillRect(wx, py + 20, 10, 8);
          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 1;
          ctx.strokeRect(wx, py + 20, 10, 8);
        }
      }

      // Entrance Door
      ctx.fillStyle = '#0284C7';
      const doorW = 16;
      const doorH = 14;
      const doorX = px + w / 2 - doorW / 2;
      const doorY = py + h - doorH;
      ctx.fillRect(doorX, doorY, doorW, doorH);
      ctx.fillStyle = '#BAE6FD';
      ctx.fillRect(doorX + 2, doorY + 2, 5, 6);
      ctx.fillRect(doorX + 9, doorY + 2, 5, 6);

      // Signboard
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(px + w / 2 - 22, py + 8, 44, 8);
      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 6px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.id, px + w / 2, py + 14);

      // Emblems
      if (b.id === 'ME') {
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(px + 12, py + 7, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.id === 'ADM') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(px + w / 2, py - 12, 2, 12);
        ctx.fillStyle = '#F97316';
        ctx.fillRect(px + w / 2 + 2, py - 12, 8, 4);
      } else if (b.id === 'TEMP') {
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(px + w / 2, py - 14);
        ctx.lineTo(px + w / 2 - 8, py);
        ctx.lineTo(px + w / 2 + 8, py);
        ctx.fill();
      }
    });

    // Special: AMPHITHEATRE (Nested in GALLERY Courtyard!)
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
   * Environmental Trees, Foliage, Bushes & Lamps
   * Renders the authentic Pokémon GBA bulbous scalloped pine trees from Image 1!
   */
  private static drawEnvironmentAndTrees(ctx: CanvasRenderingContext2D) {
    // 1. DENSE FOREST PERIMETER WALLS (Overlapping trees exactly like Image 1!)
    // Left outer border
    for (let ty = 8; ty <= 138; ty += 4) {
      this.drawGbaBulbousPineTree(ctx, 3 * TILE_SIZE, ty * TILE_SIZE);
      this.drawGbaBulbousPineTree(ctx, 6 * TILE_SIZE, (ty + 2) * TILE_SIZE);
    }

    // Right outer border
    for (let ty = 8; ty <= 138; ty += 4) {
      this.drawGbaBulbousPineTree(ctx, 118 * TILE_SIZE, ty * TILE_SIZE);
      this.drawGbaBulbousPineTree(ctx, 121 * TILE_SIZE, (ty + 2) * TILE_SIZE);
    }

    // Top outer border (flanking gate)
    for (let tx = 8; tx <= 68; tx += 4) {
      this.drawGbaBulbousPineTree(ctx, tx * TILE_SIZE, 6 * TILE_SIZE);
    }
    for (let tx = 86; tx <= 118; tx += 4) {
      this.drawGbaBulbousPineTree(ctx, tx * TILE_SIZE, 6 * TILE_SIZE);
    }

    // Bottom outer border
    for (let tx = 8; tx <= 118; tx += 4) {
      this.drawGbaBulbousPineTree(ctx, tx * TILE_SIZE, 138 * TILE_SIZE);
    }

    // 2. COURTYARD FOREST CLUSTERS (Shading avenues & plazas)
    // Between Admin and Gate
    for (let tx = 40; tx <= 62; tx += 6) {
      this.drawGbaBulbousPineTree(ctx, tx * TILE_SIZE, 12 * TILE_SIZE);
    }

    // Grove between West Avenue and Civil
    for (let ty = 80; ty <= 104; ty += 8) {
      this.drawGbaBulbousPineTree(ctx, 22 * TILE_SIZE, ty * TILE_SIZE);
    }

    // Grove around Temple
    this.drawGbaBulbousPineTree(ctx, 94 * TILE_SIZE, 78 * TILE_SIZE);
    this.drawGbaBulbousPineTree(ctx, 112 * TILE_SIZE, 80 * TILE_SIZE);
    this.drawGbaBulbousPineTree(ctx, 112 * TILE_SIZE, 96 * TILE_SIZE);

    // 3. DECIDUOUS HERO TREES (Image 1 inspired large round trees)
    this.drawGbaDeciduousTree(ctx, 72 * TILE_SIZE, 84 * TILE_SIZE);
    this.drawGbaDeciduousTree(ctx, 42 * TILE_SIZE, 80 * TILE_SIZE);
    this.drawGbaDeciduousTree(ctx, 74 * TILE_SIZE, 102 * TILE_SIZE);

    // 4. FLOWERING HEDGE BUSHES (With white blossoms lining paths from Image 1!)
    for (let x = 36 * TILE_SIZE; x <= 64 * TILE_SIZE; x += 16) {
      this.drawGbaFlowerBush(ctx, x, 22 * TILE_SIZE);
    }
    for (let y = 20 * TILE_SIZE; y <= 60 * TILE_SIZE; y += 16) {
      this.drawGbaFlowerBush(ctx, 73 * TILE_SIZE, y);
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
      this.drawGbaStreetLamp(ctx, 75 * TILE_SIZE, y);
    }
  }

  /**
   * ICONIC GBA POKÉMON BULBOUS PINE TREE (Image 1 replica!)
   * 3 overlapping bulbous tiers with scalloped lobe highlights
   */
  public static drawGbaBulbousPineTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Ground Shadow
    ctx.fillStyle = 'rgba(14, 40, 14, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + 14, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = '#684024';
    ctx.fillRect(x - 3, y + 4, 6, 12);
    ctx.fillStyle = '#482810';
    ctx.fillRect(x + 1, y + 4, 2, 12);

    // Tier 3: Bottom Tier
    this.drawBulbousTier(ctx, x, y + 3, 14, 8);

    // Tier 2: Middle Tier
    this.drawBulbousTier(ctx, x, y - 5, 11, 7);

    // Tier 1: Top Tier
    this.drawBulbousTier(ctx, x, y - 13, 8, 7);

    // Top tip
    ctx.fillStyle = '#9CE048';
    ctx.fillRect(x - 1, y - 21, 2, 3);
  }

  private static drawBulbousTier(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    rx: number,
    ry: number
  ) {
    ctx.fillStyle = '#0E3810';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx + 1, ry + 1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1C6018';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3A9424';
    ctx.beginPath();
    ctx.ellipse(cx - 1, cy - 2, rx - 1, ry - 1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#68C838';
    ctx.beginPath();
    ctx.arc(cx - rx * 0.45, cy - 2, rx * 0.4, 0, Math.PI * 2);
    ctx.arc(cx, cy - ry * 0.4, rx * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9CE850';
    ctx.fillRect(cx - rx * 0.5, cy - ry * 0.6, 3, 2);
    ctx.fillRect(cx - 1, cy - ry * 0.8, 4, 2);
  }

  public static drawGbaDeciduousTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = 'rgba(14, 40, 14, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + 16, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5A3818';
    ctx.fillRect(x - 4, y + 4, 8, 14);

    const lobes = [
      { dx: 0, dy: -12, r: 14 },
      { dx: -10, dy: -4, r: 12 },
      { dx: 10, dy: -4, r: 12 },
      { dx: -6, dy: 4, r: 11 },
      { dx: 6, dy: 4, r: 11 },
    ];

    ctx.fillStyle = '#0E3810';
    lobes.forEach((l) => {
      ctx.beginPath();
      ctx.arc(x + l.dx, y + l.dy, l.r + 1, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#1C6018';
    lobes.forEach((l) => {
      ctx.beginPath();
      ctx.arc(x + l.dx, y + l.dy, l.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#3A9424';
    lobes.forEach((l) => {
      ctx.beginPath();
      ctx.arc(x + l.dx - 1, y + l.dy - 2, l.r - 2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#72D83C';
    lobes.forEach((l) => {
      ctx.beginPath();
      ctx.arc(x + l.dx - 2, y + l.dy - 4, l.r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  public static drawGbaFlowerBush(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#0E3810';
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2E8B22';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5CC832';
    ctx.beginPath();
    ctx.arc(x - 2, y - 2, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 4, y - 3, 2, 2);
    ctx.fillRect(x + 2, y - 4, 2, 2);
    ctx.fillRect(x - 2, y + 2, 2, 2);
    ctx.fillRect(x + 3, y + 1, 2, 2);
    ctx.fillStyle = '#FDE047';
    ctx.fillRect(x - 3, y - 2, 1, 1);
    ctx.fillRect(x + 3, y - 3, 1, 1);
  }

  public static drawRockBoulder(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = 'rgba(14, 40, 14, 0.4)';
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
