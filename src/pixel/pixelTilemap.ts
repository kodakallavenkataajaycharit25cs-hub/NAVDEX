export const TILE_SIZE = 16;
export const MAP_WIDTH_TILES = 90;
export const MAP_HEIGHT_TILES = 120;

export const CAMPUS_TILE_ORIGIN_X = 45;
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

    // 1. Base Grass Fill
    this.drawBaseGrass(ctx, width, height);

    // 2. Campus Walkway Network (Spine + Corridors)
    this.drawWalkways(ctx);

    // 3. Water Pond & Fountain near Amphitheatre
    this.drawPondAndWater(ctx);

    // 4. Buildings (Footprints, Silhouettes, Details)
    this.drawBuildings(ctx);

    // 5. Environmental Props (Trees, Street Lamps, Benches, Flower Bushes)
    this.drawEnvironmentProps(ctx);

    this.cachedMapCanvas = canvas;
    return canvas;
  }

  private static drawBaseGrass(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Soft vibrant campus grass
    ctx.fillStyle = '#48A850';
    ctx.fillRect(0, 0, width, height);

    // Subtle checkered / textured grass tiles
    ctx.fillStyle = '#439C4B';
    for (let ty = 0; ty < MAP_HEIGHT_TILES; ty++) {
      for (let tx = 0; tx < MAP_WIDTH_TILES; tx++) {
        if ((tx + ty) % 2 === 0) {
          ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Flower & clover sprinkles
    const rng = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 300; i++) {
      const rx = Math.floor(rng(i * 13) * width);
      const ry = Math.floor(rng(i * 29) * height);
      // Small yellow or white daisy
      ctx.fillStyle = i % 2 === 0 ? '#FEF08A' : '#FFFFFF';
      ctx.fillRect(rx, ry, 2, 2);
      ctx.fillStyle = '#EAB308';
      ctx.fillRect(rx + 1, ry + 1, 1, 1);
    }
  }

  private static drawWalkways(ctx: CanvasRenderingContext2D) {
    // Path color: warm light campus stone paver
    const pathFill = '#F3E8D6';
    const pathBorder = '#D6C7B2';
    const pathPaverLine = '#E5D6C0';

    // Main central spine: runs roughly from Gate (ty=82) up through Campus (ty=35) around tx=45
    const drawPavedPath = (x1: number, y1: number, x2: number, y2: number, widthPx: number) => {
      ctx.strokeStyle = pathBorder;
      ctx.lineWidth = widthPx + 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.strokeStyle = pathFill;
      ctx.lineWidth = widthPx;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    // Central Walkway Spine (North-South)
    const spineX = CAMPUS_TILE_ORIGIN_X * TILE_SIZE;
    const gateY = worldToTile(0, 48).py;
    const northY = worldToTile(0, -50).py;
    drawPavedPath(spineX, gateY, spineX, northY, 28);

    // Connector path to Mechanical & Gallery (East)
    const mechTile = worldToTile(30.6, -2.3);
    const galTile = worldToTile(44.5, -15.8);
    const amphiTile = worldToTile(3.8, -30.9);
    const mbaTile = worldToTile(31.9, -44.7);

    // Mech corridor: spine -> Mech entrance
    drawPavedPath(spineX, mechTile.py, mechTile.px, mechTile.py, 22);

    // Gal corridor: Mech -> Gallery
    drawPavedPath(mechTile.px, mechTile.py, galTile.px, galTile.py, 18);

    // Amphi plaza & path: spine -> Amphitheatre
    drawPavedPath(spineX, amphiTile.py, amphiTile.px + 20, amphiTile.py, 26);

    // MBA path: spine -> MBA
    drawPavedPath(spineX, mbaTile.py, mbaTile.px, mbaTile.py, 22);

    // Loop connector between Mech and MBA
    drawPavedPath(mechTile.px, mechTile.py, mbaTile.px, mbaTile.py, 18);

    // Circular stone plazas at junctions
    const drawPlaza = (cx: number, cy: number, radius: number) => {
      ctx.fillStyle = pathBorder;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pathFill;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Stone paver ring
      ctx.strokeStyle = pathPaverLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    };

    drawPlaza(spineX, mechTile.py, 18);
    drawPlaza(spineX, amphiTile.py, 20);
    drawPlaza(spineX, mbaTile.py, 18);
    drawPlaza(spineX, gateY - 20, 22);
  }

  private static drawPondAndWater(ctx: CanvasRenderingContext2D) {
    // Water pond situated near Gallery & Amphitheatre
    const pondCenter = worldToTile(18, -18);
    const px = pondCenter.px;
    const py = pondCenter.py;

    // Stone rim
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.ellipse(px, py, 34, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Deep water
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.ellipse(px, py, 30, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fountain ripple waves
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(px, py, 14, 8, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Lily pad
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(px - 12, py - 4, 4, 0, Math.PI * 1.8);
    ctx.fill();
    ctx.fillStyle = '#F472B6'; // Pink lotus flower
    ctx.fillRect(px - 12, py - 4, 2, 2);
  }

  private static drawBuildings(ctx: CanvasRenderingContext2D) {
    // 1. Mechanical Block (MECH) — Industrial Brick with Rooftop Gears
    const mech = worldToTile(30.6, -2.3);
    this.drawMechanicalBuilding(ctx, mech.px - 36, mech.py - 30);

    // 2. Campus Gallery (GAL) — Glass Pavilions with Art Banners
    const gal = worldToTile(44.5, -15.8);
    this.drawGalleryBuilding(ctx, gal.px - 32, gal.py - 26);

    // 3. Open Amphitheatre (AMPHI) — Tiered Stone Curved Stage
    const amphi = worldToTile(3.8, -30.9);
    this.drawAmphiBuilding(ctx, amphi.px - 38, amphi.py - 30);

    // 4. MBA Block (MBA) — Academic Clocktower
    const mba = worldToTile(31.9, -44.7);
    this.drawMbaBuilding(ctx, mba.px - 36, mba.py - 34);

    // 5. Main Gate (GATE) — Grand Entrance Gateway Arch
    const gate = worldToTile(-0.1, 47.9);
    this.drawGateBuilding(ctx, gate.px - 34, gate.py - 20);
  }

  private static drawMechanicalBuilding(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const w = 76;
    const h = 58;

    // Cast Shadow
    ctx.fillStyle = 'rgba(29, 36, 64, 0.25)';
    ctx.fillRect(x - 2, y + h - 4, w + 6, 8);

    // Main Brick Facade
    ctx.fillStyle = '#B45309';
    ctx.fillRect(x, y + 14, w, h - 14);

    // Rooftop Trim
    ctx.fillStyle = '#78350F';
    ctx.fillRect(x - 2, y + 10, w + 4, 5);

    // Industrial Corrugated Roof
    ctx.fillStyle = '#64748B';
    ctx.fillRect(x + 2, y, w - 4, 10);
    ctx.fillStyle = '#475569';
    for (let rx = x + 4; rx < x + w - 4; rx += 6) {
      ctx.fillRect(rx, y, 2, 10);
    }

    // Rooftop Brass Gear Feature
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(x + 18, y + 5, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.arc(x + 18, y + 5, 3, 0, Math.PI * 2);
    ctx.fill();
    // Gear teeth
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(x + 18 - 10, y + 4, 20, 2);
    ctx.fillRect(x + 17, y + 5 - 10, 2, 20);

    // Mechanical Exhaust Chimney
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + w - 16, y - 4, 8, 14);
    ctx.fillStyle = '#64748B';
    ctx.fillRect(x + w - 18, y - 6, 12, 3);

    // Windows (Glass panes)
    ctx.fillStyle = '#38BDF8';
    for (let wx = x + 8; wx < x + w - 16; wx += 14) {
      ctx.fillRect(wx, y + 20, 8, 8);
      // Window frame
      ctx.fillStyle = '#1E293B';
      ctx.strokeRect(wx, y + 20, 8, 8);
      ctx.fillStyle = '#38BDF8';
    }

    // Double Workshop Entrance Doors
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x + w / 2 - 10, y + h - 18, 20, 18);
    ctx.fillStyle = '#F59E0B'; // Yellow warning stripe
    ctx.fillRect(x + w / 2 - 10, y + h - 19, 20, 2);

    // Signboard
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x + w / 2 - 16, y + 14, 32, 6);
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MECH', x + w / 2, y + 19);
  }

  private static drawGalleryBuilding(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const w = 68;
    const h = 50;

    // Shadow
    ctx.fillStyle = 'rgba(29, 36, 64, 0.25)';
    ctx.fillRect(x - 2, y + h - 4, w + 6, 8);

    // White Minimalist Architecture
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(x, y + 12, w, h - 12);

    // Glass Front
    ctx.fillStyle = '#BAE6FD';
    ctx.fillRect(x + 6, y + 18, w - 12, 20);

    // Geometric Modern Roof
    ctx.fillStyle = '#EC4899';
    ctx.fillRect(x - 2, y + 8, w + 4, 5);

    // Colorful Art Banners on Facade
    const banners = ['#8B5CF6', '#F59E0B', '#10B981'];
    banners.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.fillRect(x + 10 + idx * 18, y + 14, 10, 22);
      // Triangle cut at bottom of banner
      ctx.fillStyle = '#BAE6FD';
      ctx.beginPath();
      ctx.moveTo(x + 10 + idx * 18, y + 36);
      ctx.lineTo(x + 15 + idx * 18, y + 32);
      ctx.lineTo(x + 20 + idx * 18, y + 36);
      ctx.fill();
    });

    // Glass Entrance Door
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(x + w / 2 - 8, y + h - 14, 16, 14);

    // Signboard
    ctx.fillStyle = '#BE185D';
    ctx.fillRect(x + w / 2 - 16, y + 6, 32, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GALLERY', x + w / 2, y + 11);
  }

  private static drawAmphiBuilding(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const w = 78;
    const h = 60;

    // Tiered Stone Curved Seating
    const cx = x + w / 2;
    const cy = y + h / 2 - 6;

    // Outer stone tier
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 36, 24, 0, 0, Math.PI);
    ctx.fill();

    // Mid stone tier
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 28, 18, 0, 0, Math.PI);
    ctx.fill();

    // Inner stone tier
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 20, 12, 0, 0, Math.PI);
    ctx.fill();

    // Wooden Stage Platform
    ctx.fillStyle = '#854D0E';
    ctx.fillRect(cx - 24, cy - 2, 48, 16);
    ctx.fillStyle = '#A16207';
    ctx.fillRect(cx - 22, cy, 44, 12);

    // Stage Backdrop & Lighting Truss
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(cx - 26, cy + 12, 52, 4);
    ctx.fillRect(cx - 24, cy + 2, 3, 12);
    ctx.fillRect(cx + 21, cy + 2, 3, 12);

    // Party Festival String Lights Bunting
    const lightCols = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899'];
    for (let lx = cx - 22; lx < cx + 22; lx += 8) {
      ctx.fillStyle = lightCols[Math.floor((lx - cx + 22) / 8) % lightCols.length];
      ctx.fillRect(lx, cy + 15, 3, 3);
    }

    // Signboard
    ctx.fillStyle = '#7C3AED';
    ctx.fillRect(cx - 16, cy + 18, 32, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AMPHI', cx, cy + 23);
  }

  private static drawMbaBuilding(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const w = 74;
    const h = 64;

    // Shadow
    ctx.fillStyle = 'rgba(29, 36, 64, 0.25)';
    ctx.fillRect(x - 2, y + h - 4, w + 6, 8);

    // Classical Brick Edifice
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(x, y + 20, w, h - 20);

    // White Academic Columns
    ctx.fillStyle = '#F8FAFC';
    for (let colX = x + 6; colX < x + w - 6; colX += 14) {
      ctx.fillRect(colX, y + 24, 4, h - 26);
    }

    // Clocktower Center Section
    const tx = x + w / 2 - 12;
    ctx.fillStyle = '#1D4ED8';
    ctx.fillRect(tx, y, 24, 22);

    // Clock Face
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 10, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x + w / 2 - 0.5, y + 6, 1, 4); // clock hands
    ctx.fillRect(x + w / 2, y + 9, 3, 1);

    // Pyramid Tower Roof
    ctx.fillStyle = '#1E40AF';
    ctx.beginPath();
    ctx.moveTo(tx - 2, y);
    ctx.lineTo(x + w / 2, y - 8);
    ctx.lineTo(tx + 26, y);
    ctx.fill();

    // Grand Entrance Arch
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(x + w / 2 - 10, y + h - 18, 20, 18);
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h - 12, 6, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x + w / 2 - 6, y + h - 12, 12, 12);

    // Signboard
    ctx.fillStyle = '#1E40AF';
    ctx.fillRect(x + w / 2 - 14, y + 18, 28, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MBA', x + w / 2, y + 23);
  }

  private static drawGateBuilding(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const w = 70;
    const h = 38;

    // Red & Gold Grand Gateway Pillars
    ctx.fillStyle = '#065F46';
    ctx.fillRect(x + 4, y, 12, h);
    ctx.fillRect(x + w - 16, y, 12, h);

    // Gateway Arch Crossbeam
    ctx.fillStyle = '#047857';
    ctx.fillRect(x, y - 6, w, 10);
    ctx.fillStyle = '#F59E0B'; // Gold trim
    ctx.fillRect(x, y + 2, w, 2);

    // Security booth
    ctx.fillStyle = '#10B981';
    ctx.fillRect(x + 6, y + 14, 8, 14);
    ctx.fillStyle = '#6EE7B7';
    ctx.fillRect(x + 8, y + 16, 4, 4);

    // Signboard: CAMPUS MAIN GATE
    ctx.fillStyle = '#064E3B';
    ctx.fillRect(x + w / 2 - 20, y - 14, 40, 8);
    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MAIN GATE', x + w / 2, y - 8);
  }

  private static drawEnvironmentProps(ctx: CanvasRenderingContext2D) {
    // Street Lamps along main spine
    const spineX = CAMPUS_TILE_ORIGIN_X * TILE_SIZE;
    for (let ty = 35; ty <= 80; ty += 10) {
      this.drawStreetLamp(ctx, spineX - 20, ty * TILE_SIZE);
      this.drawStreetLamp(ctx, spineX + 20, ty * TILE_SIZE);
    }

    // Lush Trees around campus green zones
    const treeCoords = [
      { x: 20, y: -25 },
      { x: 26, y: -22 },
      { x: 12, y: -12 },
      { x: 15, y: -5 },
      { x: 42, y: 5 },
      { x: 48, y: -5 },
      { x: 10, y: 15 },
      { x: 14, y: 25 },
      { x: -15, y: 20 },
      { x: -20, y: 10 },
      { x: -18, y: -10 },
      { x: -12, y: -28 },
      { x: 28, y: -52 },
      { x: 38, y: -54 },
      { x: 2, y: -45 },
    ];

    treeCoords.forEach((tc, idx) => {
      const tile = worldToTile(tc.x, tc.y);
      if (idx % 3 === 0) {
        this.drawCherryTree(ctx, tile.px, tile.py);
      } else if (idx % 3 === 1) {
        this.drawPineTree(ctx, tile.px, tile.py);
      } else {
        this.drawOakTree(ctx, tile.px, tile.py);
      }
    });

    // Wooden benches along path
    const benchCoords = [
      { x: 5, y: 35 },
      { x: 5, y: 15 },
      { x: 5, y: -5 },
      { x: 20, y: -12 },
      { x: 25, y: -38 },
    ];
    benchCoords.forEach((bc) => {
      const tile = worldToTile(bc.x, bc.y);
      this.drawWoodenBench(ctx, tile.px, tile.py);
    });
  }

  private static drawOakTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Shadow
    ctx.fillStyle = 'rgba(29, 36, 64, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x, y + 16, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = '#78350F';
    ctx.fillRect(x - 3, y + 2, 6, 14);

    // Leaves Canopy
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.arc(x, y - 2, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(x - 3, y - 5, 10, 0, Math.PI * 2);
    ctx.fill();

    // Apple / berry dots
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x - 5, y - 4, 2, 2);
    ctx.fillRect(x + 4, y, 2, 2);
  }

  private static drawCherryTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Shadow
    ctx.fillStyle = 'rgba(29, 36, 64, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x, y + 16, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = '#451A03';
    ctx.fillRect(x - 2, y + 2, 4, 14);

    // Pink Blossom Canopy
    ctx.fillStyle = '#EC4899';
    ctx.beginPath();
    ctx.arc(x, y - 2, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.arc(x - 2, y - 5, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FBCFE8';
    ctx.fillRect(x - 4, y - 3, 2, 2);
    ctx.fillRect(x + 3, y - 1, 2, 2);
  }

  private static drawPineTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Shadow
    ctx.fillStyle = 'rgba(29, 36, 64, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x, y + 16, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = '#78350F';
    ctx.fillRect(x - 2, y + 4, 4, 12);

    // Tiered Pine Foliage
    ctx.fillStyle = '#065F46';
    // Bottom triangle
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 6);
    ctx.lineTo(x, y - 4);
    ctx.lineTo(x + 12, y + 6);
    ctx.fill();

    // Mid triangle
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.lineTo(x, y - 10);
    ctx.lineTo(x + 9, y);
    ctx.fill();

    // Top triangle
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 6);
    ctx.lineTo(x, y - 16);
    ctx.lineTo(x + 6, y - 6);
    ctx.fill();
  }

  private static drawStreetLamp(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Glow circle on ground
    ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
    ctx.beginPath();
    ctx.arc(x, y + 12, 18, 0, Math.PI * 2);
    ctx.fill();

    // Lamp post
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x - 1, y - 6, 2, 18);
    // Base
    ctx.fillRect(x - 3, y + 11, 6, 2);
    // Lantern head
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(x - 2.5, y - 10, 5, 5);
    ctx.fillStyle = '#FEF08A'; // Bulb
    ctx.fillRect(x - 1.5, y - 9, 3, 3);
    // Cap
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x - 3.5, y - 12, 7, 2);
  }

  private static drawWoodenBench(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Wood slats
    ctx.fillStyle = '#92400E';
    ctx.fillRect(x - 8, y, 16, 3);
    ctx.fillRect(x - 8, y + 4, 16, 3);
    // Iron legs
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x - 7, y + 1, 2, 8);
    ctx.fillRect(x + 5, y + 1, 2, 8);
  }
}
