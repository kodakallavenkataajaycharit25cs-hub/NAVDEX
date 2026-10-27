export const TILE_SIZE = 16;
export const MAP_WIDTH_TILES = 96;
export const MAP_HEIGHT_TILES = 120;

export const CAMPUS_TILE_ORIGIN_X = 48;
export const CAMPUS_TILE_ORIGIN_Y = 60;
export const METRES_PER_TILE = 2.0;

/**
 * Converts world metres (x, z) to pixel tile coordinates
 */
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

/**
 * Converts pixel world coordinates to world metres (x, z)
 */
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
  worldX: number;
  worldZ: number;
  entranceWorldX: number;
  entranceWorldZ: number;
  widthTiles: number;
  heightTiles: number;
  color: string;
  icon: string;
}

export const PIXEL_BUILDINGS: PixelBuildingDef[] = [
  {
    id: 'MECH',
    name: 'Mechanical Block',
    tagline: 'Industrial design lab & workshop hub',
    worldX: 30.6,
    worldZ: -2.3,
    entranceWorldX: 23,
    entranceWorldZ: -5,
    widthTiles: 6,
    heightTiles: 5,
    color: '#D97706',
    icon: '⚙️',
  },
  {
    id: 'GAL',
    name: 'Campus Gallery',
    tagline: 'Contemporary art exhibits & sculpture courtyard',
    worldX: 44.5,
    worldZ: -15.8,
    entranceWorldX: 39,
    entranceWorldZ: -17,
    widthTiles: 5,
    heightTiles: 4,
    color: '#EC4899',
    icon: '🎨',
  },
  {
    id: 'AMPHI',
    name: 'Open Amphitheatre',
    tagline: 'Tiered stone auditorium for fests & concerts',
    worldX: 3.8,
    worldZ: -30.9,
    entranceWorldX: 6,
    entranceWorldZ: -25,
    widthTiles: 6,
    heightTiles: 5,
    color: '#8B5CF6',
    icon: '🎭',
  },
  {
    id: 'MBA',
    name: 'MBA Block',
    tagline: 'Business auditorium & clocktower quad',
    worldX: 31.9,
    worldZ: -44.7,
    entranceWorldX: 24,
    entranceWorldZ: -43,
    widthTiles: 6,
    heightTiles: 5,
    color: '#2563EB',
    icon: '🏛️',
  },
  {
    id: 'GATE',
    name: 'Campus Main Gate',
    tagline: 'Grand security gateway & welcome arch',
    worldX: -0.1,
    worldZ: 47.9,
    entranceWorldX: 0,
    entranceWorldZ: 44,
    widthTiles: 5,
    heightTiles: 3,
    color: '#059669',
    icon: '⛩️',
  },
];

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

    // 1. Lush GBA Pokémon Emerald / FireRed style grass background
    this.drawGbaGrass(ctx, width, height);

    // 2. Stepped Pokémon-style sandy pathways & plazas
    this.drawGbaWalkways(ctx);

    // 3. Flower gardens with white picket fences
    this.drawFlowerGardens(ctx);

    // 4. Rectangular & natural water pond with ripple lines
    this.drawWaterPond(ctx);

    // 5. Distinctive GBA Pokémon-style Campus Buildings
    this.drawBuildings(ctx);

    // 6. Lush GBA Pine Tree clusters, border tree lines, fences & lamps
    this.drawEnvironmentProps(ctx);

    this.cachedMapCanvas = canvas;
    return canvas;
  }

  /**
   * Vibrant GBA Pokémon Emerald grass with subtle texture pixels
   */
  private static drawGbaGrass(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Base Pokémon Emerald soft mint grass
    ctx.fillStyle = '#8CD88C';
    ctx.fillRect(0, 0, width, height);

    // Subtle grass texture checker & stipples (authentic GBA tile texture)
    ctx.fillStyle = '#78C878';
    for (let ty = 0; ty < MAP_HEIGHT_TILES; ty++) {
      for (let tx = 0; tx < MAP_WIDTH_TILES; tx++) {
        const px = tx * TILE_SIZE;
        const py = ty * TILE_SIZE;
        // 2x2 stipple in alternating corners
        ctx.fillRect(px + 2, py + 2, 2, 2);
        ctx.fillRect(px + 10, py + 10, 2, 2);
      }
    }

    // Grass blade tufts in slightly brighter green
    ctx.fillStyle = '#A4E8A4';
    const rng = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 400; i++) {
      const rx = Math.floor(rng(i * 17) * (width - 16));
      const ry = Math.floor(rng(i * 31) * (height - 16));
      // 3-pixel blade of tall grass
      ctx.fillRect(rx, ry, 1, 3);
      ctx.fillRect(rx + 1, ry - 1, 1, 3);
      ctx.fillRect(rx + 2, ry + 1, 1, 2);
    }
  }

  /**
   * Authentic GBA Pokémon stepped pathways (sand/paver color with stepped green borders)
   */
  private static drawGbaWalkways(ctx: CanvasRenderingContext2D) {
    const pathBase = '#F0E4C8';
    const pathShade = '#E0D0B0';
    const pathBorder = '#68B068';

    // Helper to draw a path with stepped Pokémon-style edges
    const drawSteppedPath = (x1: number, y1: number, x2: number, y2: number, widthTiles: number) => {
      const minX = Math.min(x1, x2) - (widthTiles * TILE_SIZE) / 2;
      const maxX = Math.max(x1, x2) + (widthTiles * TILE_SIZE) / 2;
      const minY = Math.min(y1, y2) - (widthTiles * TILE_SIZE) / 2;
      const maxY = Math.max(y1, y2) + (widthTiles * TILE_SIZE) / 2;

      // Darker grass transition border
      ctx.fillStyle = pathBorder;
      ctx.fillRect(minX - 2, minY - 2, maxX - minX + 4, maxY - minY + 4);

      // Sand path fill
      ctx.fillStyle = pathBase;
      ctx.fillRect(minX, minY, maxX - minX, maxY - minY);

      // Subtle paver pebbles
      ctx.fillStyle = pathShade;
      for (let py = minY + 4; py < maxY - 4; py += 12) {
        for (let px = minX + 4; px < maxX - 4; px += 16) {
          ctx.fillRect(px, py, 3, 2);
          ctx.fillRect(px + 6, py + 4, 2, 2);
        }
      }
    };

    const spineX = CAMPUS_TILE_ORIGIN_X * TILE_SIZE;
    const gateY = worldToTile(0, 48).py;
    const northY = worldToTile(0, -52).py;

    // Central Main Spine (North-South Avenue)
    drawSteppedPath(spineX, gateY, spineX, northY, 3);

    // Lateral corridors to buildings
    const mech = worldToTile(30.6, -2.3);
    const gal = worldToTile(44.5, -15.8);
    const amphi = worldToTile(3.8, -30.9);
    const mba = worldToTile(31.9, -44.7);

    // Spine to Mech
    drawSteppedPath(spineX, mech.py, mech.px, mech.py, 2.5);

    // Mech to Gallery
    drawSteppedPath(mech.px, mech.py, gal.px, gal.py, 2);

    // Spine to Amphitheatre
    drawSteppedPath(spineX, amphi.py, amphi.px + 16, amphi.py, 3);

    // Spine to MBA
    drawSteppedPath(spineX, mba.py, mba.px, mba.py, 2.5);

    // Mech to MBA connector
    drawSteppedPath(mech.px, mech.py, mba.px, mba.py, 2);

    // Paved stone courtyards / plazas
    const drawPlaza = (cx: number, cy: number, w: number, h: number) => {
      ctx.fillStyle = pathBorder;
      ctx.fillRect(cx - w / 2 - 2, cy - h / 2 - 2, w + 4, h + 4);
      ctx.fillStyle = pathBase;
      ctx.fillRect(cx - w / 2, cy - h / 2, w, h);

      // Decorative cobblestone grid
      ctx.fillStyle = pathShade;
      for (let y = cy - h / 2 + 4; y < cy + h / 2 - 4; y += 8) {
        ctx.fillRect(cx - w / 2 + 2, y, w - 4, 1);
      }
      for (let x = cx - w / 2 + 4; x < cx + w / 2 - 4; x += 16) {
        ctx.fillRect(x, cy - h / 2 + 2, 1, h - 4);
      }
    };

    drawPlaza(spineX, mech.py, 56, 40);
    drawPlaza(spineX, amphi.py, 64, 48);
    drawPlaza(spineX, mba.py, 52, 36);
    drawPlaza(spineX, gateY - 24, 60, 40);
  }

  /**
   * Neat GBA Pokémon flower beds with white picket fences (Image 3 inspired!)
   */
  private static drawFlowerGardens(ctx: CanvasRenderingContext2D) {
    const gardenCoords = [
      { x: 14, y: 18, w: 48, h: 32 },
      { x: -20, y: 18, w: 48, h: 32 },
      { x: 18, y: -26, w: 44, h: 28 },
      { x: -16, y: -20, w: 40, h: 28 },
    ];

    gardenCoords.forEach((g) => {
      const tile = worldToTile(g.x, g.y);
      const px = tile.px;
      const py = tile.py;

      // Dark rich flower bed soil
      ctx.fillStyle = '#6B4226';
      ctx.fillRect(px, py, g.w, g.h);
      ctx.fillStyle = '#55331E';
      ctx.fillRect(px + 2, py + 2, g.w - 4, g.h - 4);

      // Rows of bright Pokémon flowers
      const flowerColors = ['#E53935', '#FDD835', '#1E88E5', '#FB8C00', '#EC407A'];
      let colorIdx = 0;
      for (let fy = py + 4; fy < py + g.h - 6; fy += 9) {
        for (let fx = px + 4; fx < px + g.w - 6; fx += 9) {
          const col = flowerColors[colorIdx % flowerColors.length];
          colorIdx++;

          // Green leaf
          ctx.fillStyle = '#43A047';
          ctx.fillRect(fx, fy + 2, 6, 4);

          // 4-petal flower head
          ctx.fillStyle = col;
          ctx.fillRect(fx + 1, fy, 4, 4);
          ctx.fillRect(fx, fy + 1, 6, 2);

          // Center yellow pistil
          ctx.fillStyle = '#FFF59D';
          ctx.fillRect(fx + 2, fy + 1, 2, 2);
        }
      }

      // White picket fence around flower bed
      this.drawPicketFenceRect(ctx, px - 2, py - 2, g.w + 4, g.h + 4);
    });
  }

  /**
   * Iconic GBA Pokémon rectangular water pond with ripples & stone rim (Image 3 inspired!)
   */
  private static drawWaterPond(ctx: CanvasRenderingContext2D) {
    const pondCenter = worldToTile(-14, -4);
    const px = pondCenter.px;
    const py = pondCenter.py;
    const w = 72;
    const h = 54;

    // Outer stone rim
    ctx.fillStyle = '#78909C';
    ctx.fillRect(px - 4, py - 4, w + 8, h + 8);
    ctx.fillStyle = '#90A4AE';
    ctx.fillRect(px - 2, py - 2, w + 4, h + 4);

    // Deep blue water
    ctx.fillStyle = '#1E5AA8';
    ctx.fillRect(px, py, w, h);

    // Water surface color
    ctx.fillStyle = '#2979FF';
    ctx.fillRect(px + 2, py + 2, w - 4, h - 4);

    // Crisp white ripple lines (like Image 3!)
    ctx.fillStyle = '#B3E5FC';
    for (let ry = py + 6; ry < py + h - 6; ry += 10) {
      ctx.fillRect(px + 8, ry, 18, 1);
      ctx.fillRect(px + 32, ry + 4, 24, 1);
    }

    // Wooden dock pier
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(px + w / 2 - 8, py - 4, 16, 12);
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(px + w / 2 - 8, py + 7, 16, 2);

    // Water lilies / pads
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(px + 10, py + 12, 6, 5);
    ctx.fillRect(px + 44, py + 30, 7, 5);
    // Pink blossom
    ctx.fillStyle = '#FF4081';
    ctx.fillRect(px + 12, py + 11, 3, 3);
  }

  /**
   * The 5 Main Buildings rendered in nostalgic GBA Pokémon aesthetic
   */
  private static drawBuildings(ctx: CanvasRenderingContext2D) {
    // 1. MECH — Pokémon Center inspired (curved red roof, white siding, Pokéball/Gear emblem)
    const mech = worldToTile(30.6, -2.3);
    this.drawMechCenter(ctx, mech.px - 40, mech.py - 34);

    // 2. GALLERY — Pokémon Mart / Glass Pavilion (slanted blue roof, art display windows)
    const gal = worldToTile(44.5, -15.8);
    this.drawGalleryPavilion(ctx, gal.px - 36, gal.py - 30);

    // 3. AMPHITHEATRE — Tiered stone arena with festival bunting lights
    const amphi = worldToTile(3.8, -30.9);
    this.drawAmphiArena(ctx, amphi.px - 44, amphi.py - 36);

    // 4. MBA BLOCK — Classical academic clocktower with brick pediment & pillars
    const mba = worldToTile(31.9, -44.7);
    this.drawMbaClocktower(ctx, mba.px - 40, mba.py - 38);

    // 5. MAIN GATE — Grand security gateway arch & barrier arm
    const gate = worldToTile(-0.1, 47.9);
    this.drawMainGateArch(ctx, gate.px - 38, gate.py - 24);
  }

  /**
   * MECH: Iconic Pokémon Center style (Image 2 inspired!)
   */
  private static drawMechCenter(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const w = 80;
    const h = 60;

    // Ground cast shadow
    ctx.fillStyle = 'rgba(24, 48, 24, 0.35)';
    ctx.fillRect(x - 2, y + h - 6, w + 6, 10);

    // 1. Lower Building Wall (White/cream siding with blue plinth)
    ctx.fillStyle = '#ECEFF1';
    ctx.fillRect(x + 4, y + 22, w - 8, h - 22);

    // Dark grey foundation line
    ctx.fillStyle = '#78909C';
    ctx.fillRect(x + 4, y + h - 4, w - 8, 4);

    // Horizontal siding grooves
    ctx.fillStyle = '#CFD8DC';
    for (let sy = y + 28; sy < y + h - 6; sy += 8) {
      ctx.fillRect(x + 4, sy, w - 8, 1);
    }

    // 2. Iconic Pokémon Center Curved Red Hip-Roof
    // Outer red roof
    ctx.fillStyle = '#D32F2F';
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 4);
    ctx.lineTo(x + w - 10, y + 4);
    ctx.lineTo(x + w, y + 22);
    ctx.lineTo(x, y + 22);
    ctx.closePath();
    ctx.fill();

    // Red highlight bevel
    ctx.fillStyle = '#EF5350';
    ctx.fillRect(x + 14, y + 4, w - 28, 4);

    // Dark red roof shadow
    ctx.fillStyle = '#B71C1C';
    ctx.fillRect(x, y + 20, w, 2);

    // Cream roof ridge stripes (like Image 2!)
    ctx.fillStyle = '#FFE082';
    ctx.fillRect(x + 22, y + 4, 4, 18);
    ctx.fillRect(x + w - 26, y + 4, 4, 18);

    // 3. Central Gear / Pokéball Emblem
    ctx.fillStyle = '#ECEFF1';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 14, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#D32F2F';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 14, 8, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#37474F';
    ctx.fillRect(x + w / 2 - 8, y + 13, 16, 2);
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 14, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ECEFF1';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 14, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Large Blue Glass Sliding Doors
    ctx.fillStyle = '#0288D1';
    ctx.fillRect(x + w / 2 - 12, y + h - 22, 24, 18);
    ctx.fillStyle = '#4FC3F7';
    // Glass sheen diagonals
    ctx.fillRect(x + w / 2 - 10, y + h - 20, 9, 7);
    ctx.fillRect(x + w / 2 + 1, y + h - 20, 9, 7);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + w / 2 - 8, y + h - 18, 2, 2);
    ctx.fillRect(x + w / 2 + 3, y + h - 18, 2, 2);

    // Door frame
    ctx.strokeStyle = '#37474F';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + w / 2 - 12, y + h - 22, 24, 18);

    // 5. Building Signboard ("MECH")
    ctx.fillStyle = '#D32F2F';
    ctx.fillRect(x + 8, y + 26, 24, 8);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 6px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MECH', x + 20, y + 32);

    // Window on right
    ctx.fillStyle = '#4FC3F7';
    ctx.fillRect(x + w - 24, y + 26, 14, 10);
    ctx.strokeRect(x + w - 24, y + 26, 14, 10);
  }

  /**
   * GALLERY: Pokémon Mart / Contemporary Art Pavilion style
   */
  private static drawGalleryPavilion(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const w = 72;
    const h = 54;

    // Ground shadow
    ctx.fillStyle = 'rgba(24, 48, 24, 0.35)';
    ctx.fillRect(x - 2, y + h - 6, w + 6, 10);

    // White marble walls
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(x + 4, y + 18, w - 8, h - 18);
    ctx.fillStyle = '#B0BEC5';
    ctx.fillRect(x + 4, y + h - 4, w - 8, 4);

    // Cobalt blue slanted roof
    ctx.fillStyle = '#1976D2';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 2);
    ctx.lineTo(x + w - 8, y + 2);
    ctx.lineTo(x + w, y + 18);
    ctx.lineTo(x, y + 18);
    ctx.closePath();
    ctx.fill();

    // Roof highlight
    ctx.fillStyle = '#42A5F5';
    ctx.fillRect(x + 12, y + 3, w - 24, 3);

    // Skylight glass on roof
    ctx.fillStyle = '#81D4FA';
    ctx.fillRect(x + w / 2 - 14, y + 6, 28, 8);
    ctx.strokeStyle = '#0D47A1';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + w / 2 - 14, y + 6, 28, 8);

    // Large glass display windows showing mini art canvases
    ctx.fillStyle = '#E1F5FE';
    ctx.fillRect(x + 8, y + 24, 20, 14);
    ctx.strokeRect(x + 8, y + 24, 20, 14);

    // Mini paintings inside
    ctx.fillStyle = '#AB47BC';
    ctx.fillRect(x + 10, y + 26, 6, 8);
    ctx.fillStyle = '#FFA726';
    ctx.fillRect(x + 18, y + 26, 7, 8);

    // Glass entrance doors
    ctx.fillStyle = '#0288D1';
    ctx.fillRect(x + w / 2 - 10, y + h - 20, 20, 16);
    ctx.fillStyle = '#81D4FA';
    ctx.fillRect(x + w / 2 - 8, y + h - 18, 7, 7);
    ctx.fillRect(x + w / 2 + 1, y + h - 18, 7, 7);

    // Signboard ("GALLERY")
    ctx.fillStyle = '#1976D2';
    ctx.fillRect(x + w - 30, y + 22, 24, 8);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GALLERY', x + w - 18, y + 28);
  }

  /**
   * AMPHITHEATRE: Tiered stone arena with wooden stage & bunting lights
   */
  private static drawAmphiArena(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const w = 88;
    const h = 68;
    const cx = x + w / 2;
    const cy = y + h / 2 - 4;

    // Stone Tier 1 (Outer)
    ctx.fillStyle = '#90A4AE';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 42, 28, 0, 0, Math.PI);
    ctx.fill();

    // Stone Tier 2 (Mid)
    ctx.fillStyle = '#CFD8DC';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 32, 20, 0, 0, Math.PI);
    ctx.fill();

    // Stone Tier 3 (Inner)
    ctx.fillStyle = '#ECEFF1';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 22, 14, 0, 0, Math.PI);
    ctx.fill();

    // Wooden Stage Platform
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(cx - 28, cy - 4, 56, 18);
    ctx.fillStyle = '#A1887F';
    ctx.fillRect(cx - 26, cy - 2, 52, 14);

    // Stage circular star emblem
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.arc(cx, cy + 5, 5, 0, Math.PI * 2);
    ctx.fill();

    // Backdrop pillars & light truss
    ctx.fillStyle = '#37474F';
    ctx.fillRect(cx - 30, cy + 14, 60, 4);
    ctx.fillRect(cx - 28, cy, 4, 14);
    ctx.fillRect(cx + 24, cy, 4, 14);

    // Party Festival String Lights Bunting
    const lightCols = ['#F44336', '#FFEB3B', '#4CAF50', '#2196F3', '#E91E63'];
    for (let lx = cx - 26; lx < cx + 26; lx += 8) {
      ctx.fillStyle = lightCols[Math.floor((lx - cx + 26) / 8) % lightCols.length];
      ctx.fillRect(lx, cy + 17, 3, 3);
    }

    // Signboard ("AMPHI")
    ctx.fillStyle = '#7E57C2';
    ctx.fillRect(cx - 16, cy + 20, 32, 7);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AMPHI', cx, cy + 25);
  }

  /**
   * MBA: Pokémon University Clocktower (Image 3 inspired!)
   */
  private static drawMbaClocktower(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const w = 80;
    const h = 72;

    // Ground cast shadow
    ctx.fillStyle = 'rgba(24, 48, 24, 0.35)';
    ctx.fillRect(x - 2, y + h - 6, w + 6, 10);

    // Terracotta Brick Academic Hall
    ctx.fillStyle = '#A04028';
    ctx.fillRect(x + 4, y + 24, w - 8, h - 24);

    // White Classical Pillars
    ctx.fillStyle = '#ECEFF1';
    for (let colX = x + 8; colX < x + w - 8; colX += 16) {
      ctx.fillRect(colX, y + 26, 4, h - 30);
    }

    // Central Tower
    const tx = x + w / 2 - 14;
    ctx.fillStyle = '#C04830';
    ctx.fillRect(tx, y + 2, 28, 24);

    // Clock Face (Gold circle with hands)
    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 14, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#37474F';
    ctx.fillRect(x + w / 2 - 0.5, y + 10, 1, 4);
    ctx.fillRect(x + w / 2, y + 13, 3, 1);

    // Tower Roof Gable (Slate grey)
    ctx.fillStyle = '#455A64';
    ctx.beginPath();
    ctx.moveTo(tx - 2, y + 2);
    ctx.lineTo(x + w / 2, y - 8);
    ctx.lineTo(tx + 30, y + 2);
    ctx.closePath();
    ctx.fill();

    // Arched Windows
    ctx.fillStyle = '#81D4FA';
    ctx.fillRect(x + 14, y + 32, 10, 10);
    ctx.fillRect(x + w - 24, y + 32, 10, 10);
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 14, y + 32, 10, 10);
    ctx.strokeRect(x + w - 24, y + 32, 10, 10);

    // Double Grand Entrance Doors
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x + w / 2 - 10, y + h - 20, 20, 18);
    ctx.fillStyle = '#3E2723';
    ctx.strokeRect(x + w / 2 - 10, y + h - 20, 20, 18);

    // Signboard ("MBA")
    ctx.fillStyle = '#1565C0';
    ctx.fillRect(x + w / 2 - 14, y + 22, 28, 7);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MBA', x + w / 2, y + 27);
  }

  /**
   * MAIN GATE: Security Gateway & Barrier Arm
   */
  private static drawMainGateArch(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const w = 76;
    const h = 44;

    // Ground shadow
    ctx.fillStyle = 'rgba(24, 48, 24, 0.35)';
    ctx.fillRect(x - 2, y + h - 4, w + 6, 8);

    // Emerald Green Pillars
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(x + 4, y + 4, 12, h - 4);
    ctx.fillRect(x + w - 16, y + 4, 12, h - 4);

    // Gateway Arch Top Beam
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(x, y - 4, w, 10);
    ctx.fillStyle = '#FFD54F'; // Gold trim
    ctx.fillRect(x, y + 4, w, 2);

    // Security Gatehouse on left
    ctx.fillStyle = '#ECEFF1';
    ctx.fillRect(x + 6, y + 16, 12, 16);
    ctx.fillStyle = '#4FC3F7';
    ctx.fillRect(x + 8, y + 18, 6, 6);

    // Red-and-white striped barrier arm across entrance
    for (let bx = x + 16; bx < x + w - 16; bx += 8) {
      ctx.fillStyle = ((bx - x) / 8) % 2 === 0 ? '#E53935' : '#FFFFFF';
      ctx.fillRect(bx, y + h - 14, 8, 3);
    }

    // Signboard: MAIN GATE
    ctx.fillStyle = '#1B5E20';
    ctx.fillRect(x + w / 2 - 22, y - 12, 44, 9);
    ctx.fillStyle = '#FFF59D';
    ctx.font = 'bold 6px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MAIN GATE', x + w / 2, y - 5);
  }

  /**
   * Environment Props: Dense GBA Pokémon Pine Trees, Benches, Lamps, Fences
   */
  private static drawEnvironmentProps(ctx: CanvasRenderingContext2D) {
    // 1. Dense border pine tree rows (like Image 2 & 3!)
    const spineX = CAMPUS_TILE_ORIGIN_X * TILE_SIZE;

    // Tree border clusters around the campus slice
    const borderTrees = [
      // Left boundary wall
      { x: -35, y: -45 }, { x: -35, y: -35 }, { x: -35, y: -25 }, { x: -35, y: -15 }, { x: -35, y: -5 },
      { x: -35, y: 5 }, { x: -35, y: 15 }, { x: -35, y: 25 }, { x: -35, y: 35 }, { x: -35, y: 45 },
      // Right boundary wall
      { x: 55, y: -45 }, { x: 55, y: -35 }, { x: 55, y: -25 }, { x: 55, y: -15 }, { x: 55, y: -5 },
      { x: 55, y: 5 }, { x: 55, y: 15 }, { x: 55, y: 25 }, { x: 55, y: 35 }, { x: 55, y: 45 },
      // Top northern woods
      { x: -25, y: -55 }, { x: -15, y: -55 }, { x: -5, y: -55 }, { x: 5, y: -55 }, { x: 15, y: -55 },
      { x: 25, y: -55 }, { x: 35, y: -55 }, { x: 45, y: -55 },
      // Grove near Gallery & Mech
      { x: 42, y: 8 }, { x: 48, y: 8 }, { x: 48, y: -2 }, { x: 52, y: -8 },
      // Grove near Amphitheatre
      { x: -8, y: -42 }, { x: -16, y: -42 }, { x: 16, y: -42 },
      // Grove south of Mech
      { x: 22, y: 10 }, { x: 28, y: 12 }, { x: 34, y: 14 },
    ];

    borderTrees.forEach((t) => {
      const tile = worldToTile(t.x, t.y);
      this.drawGbaPineTree(ctx, tile.px, tile.py);
    });

    // 2. White picket fence segments along paths (like Image 3!)
    const fenceLines = [
      { x: spineX - 32, y: worldToTile(0, 32).py, len: 4 },
      { x: spineX + 24, y: worldToTile(0, 32).py, len: 4 },
      { x: spineX - 32, y: worldToTile(0, 8).py, len: 4 },
      { x: spineX + 24, y: worldToTile(0, 8).py, len: 4 },
    ];
    fenceLines.forEach((f) => {
      this.drawPicketFenceLine(ctx, f.x, f.y, f.len);
    });

    // 3. Street Lamps along the central path
    for (let ty = 35; ty <= 78; ty += 12) {
      this.drawGbaStreetLamp(ctx, spineX - 24, ty * TILE_SIZE);
      this.drawGbaStreetLamp(ctx, spineX + 24, ty * TILE_SIZE);
    }

    // 4. Wooden Benches
    const benches = [
      { x: 8, y: 22 },
      { x: 8, y: 2 },
      { x: 8, y: -18 },
      { x: 22, y: -14 },
    ];
    benches.forEach((b) => {
      const tile = worldToTile(b.x, b.y);
      this.drawWoodenBench(ctx, tile.px, tile.py);
    });

    // 5. Wooden Directional Signposts
    const signposts = [
      { x: 6, y: 44, text: 'CAMPUS' },
      { x: 18, y: 0, text: 'MECH' },
      { x: 8, y: -26, text: 'AMPHI' },
      { x: 20, y: -40, text: 'MBA' },
    ];
    signposts.forEach((s) => {
      const tile = worldToTile(s.x, s.y);
      this.drawSignpost(ctx, tile.px, tile.py, s.text);
    });
  }

  /**
   * Iconic GBA Pokémon Emerald / FireRed Pine Tree (Image 2 & 3 inspired!)
   */
  private static drawGbaPineTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Ground shadow
    ctx.fillStyle = 'rgba(24, 48, 24, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + 16, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(x - 3, y + 4, 6, 14);
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(x, y + 4, 3, 14);

    // 3-Tier Layered Conical Foliage
    // Bottom Tier (Widest)
    this.drawTreeCone(ctx, x, y + 4, 15, 12);
    // Mid Tier
    this.drawTreeCone(ctx, x, y - 4, 12, 11);
    // Top Tier (Narrowest)
    this.drawTreeCone(ctx, x, y - 12, 9, 10);
  }

  private static drawTreeCone(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) {
    // Dark outline
    ctx.fillStyle = '#1B5E20';
    ctx.beginPath();
    ctx.moveTo(x, y - ry);
    ctx.lineTo(x + rx + 1, y + ry + 1);
    ctx.lineTo(x - rx - 1, y + ry + 1);
    ctx.closePath();
    ctx.fill();

    // Mid Green body
    ctx.fillStyle = '#43A047';
    ctx.beginPath();
    ctx.moveTo(x, y - ry + 1);
    ctx.lineTo(x + rx, y + ry);
    ctx.lineTo(x - rx, y + ry);
    ctx.closePath();
    ctx.fill();

    // Left light highlight (Authentic GBA Pokémon shading!)
    ctx.fillStyle = '#81C784';
    ctx.beginPath();
    ctx.moveTo(x, y - ry + 1);
    ctx.lineTo(x - rx, y + ry);
    ctx.lineTo(x, y + ry);
    ctx.closePath();
    ctx.fill();

    // Right dark shadow
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.moveTo(x, y - ry + 2);
    ctx.lineTo(x + rx, y + ry);
    ctx.lineTo(x + 2, y + ry);
    ctx.closePath();
    ctx.fill();

    // Bright apex highlight glint
    ctx.fillStyle = '#C8E6C9';
    ctx.fillRect(x - 1, y - ry + 2, 2, 2);
  }

  /**
   * White Picket Fence rectangle
   */
  private static drawPicketFenceRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    // Top & bottom horizontal fence rails
    ctx.fillStyle = '#ECEFF1';
    ctx.fillRect(x, y, w, 2);
    ctx.fillRect(x, y + h - 2, w, 2);
    ctx.fillRect(x, y, 2, h);
    ctx.fillRect(x + w - 2, y, 2, h);

    // Fence pickets
    for (let px = x; px <= x + w; px += 6) {
      ctx.fillStyle = '#ECEFF1';
      ctx.fillRect(px - 1, y - 2, 3, 5);
      ctx.fillRect(px - 1, y + h - 3, 3, 5);
      ctx.fillStyle = '#B0BEC5';
      ctx.fillRect(px + 1, y - 2, 1, 5);
      ctx.fillRect(px + 1, y + h - 3, 1, 5);
    }
  }

  private static drawPicketFenceLine(ctx: CanvasRenderingContext2D, x: number, y: number, pickets: number) {
    ctx.fillStyle = '#CFD8DC';
    ctx.fillRect(x, y + 2, pickets * 8, 2);
    for (let i = 0; i < pickets; i++) {
      const px = x + i * 8;
      ctx.fillStyle = '#ECEFF1';
      ctx.fillRect(px, y - 2, 4, 8);
      ctx.fillStyle = '#B0BEC5';
      ctx.fillRect(px + 3, y - 2, 1, 8);
    }
  }

  private static drawGbaStreetLamp(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Warm light circle on ground
    ctx.fillStyle = 'rgba(255, 238, 88, 0.2)';
    ctx.beginPath();
    ctx.arc(x, y + 10, 16, 0, Math.PI * 2);
    ctx.fill();

    // Lamp iron post
    ctx.fillStyle = '#263238';
    ctx.fillRect(x - 1, y - 8, 2, 18);
    ctx.fillRect(x - 3, y + 9, 6, 2);

    // Lantern
    ctx.fillStyle = '#FFA000';
    ctx.fillRect(x - 2.5, y - 12, 5, 5);
    ctx.fillStyle = '#FFF59D'; // Bulb
    ctx.fillRect(x - 1.5, y - 11, 3, 3);
    ctx.fillStyle = '#263238'; // Cap
    ctx.fillRect(x - 3.5, y - 14, 7, 2);
  }

  private static drawWoodenBench(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(x - 8, y, 16, 3);
    ctx.fillRect(x - 8, y + 4, 16, 3);
    ctx.fillStyle = '#37474F';
    ctx.fillRect(x - 7, y + 1, 2, 7);
    ctx.fillRect(x + 5, y + 1, 2, 7);
  }

  private static drawSignpost(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
    // Wooden post
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(x - 1, y, 2, 12);

    // Wooden sign board
    ctx.fillStyle = '#D7CCC8';
    ctx.fillRect(x - 8, y - 8, 16, 8);
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 8, y - 8, 16, 8);

    // Text lines
    ctx.fillStyle = '#4E342E';
    ctx.font = 'bold 4px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text.slice(0, 5), x, y - 2);
  }
}
