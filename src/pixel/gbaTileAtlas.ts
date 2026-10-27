/**
 * Authentic Pokémon GBA (Emerald / FireRed / Ruby) Pixel Art Tile Atlas
 *
 * Implements handcrafted 16-bit pixel art with exact GBA color palettes,
 * 4-shade depth, stepped grass-to-path ledges, bulbous scalloped pine trees,
 * flower boxes, and rich building facades.
 */

export class GbaTileAtlas {
  private static canvasCache = new Map<string, HTMLCanvasElement>();

  /**
   * Helper to create a crisp 16x16 or NxM pixel canvas
   */
  public static createCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  /**
   * Authentic GBA Pokémon Pine Tree (32x44 px)
   * Exactly matches the bulbous, scalloped frond pine trees from Image 1 & 2!
   */
  public static getPokemonPineTree(): HTMLCanvasElement {
    const key = 'pine_tree_gba';
    const cached = this.canvasCache.get(key);
    if (cached) return cached;

    const { canvas, ctx } = this.createCanvas(32, 44);

    // Color Palette
    const cOutline = '#0E2812';
    const cDarkShade = '#1A501C';
    const cMidShade = '#2C7A28';
    const cMainGreen = '#48A834';
    const cLightGreen = '#72D246';
    const cSunHighlight = '#A6F25C';
    const cTrunk = '#6B4024';
    const cTrunkDark = '#482812';
    const cTrunkLight = '#8C5632';

    // 1. Ground Shadow (Dark green-black ellipse)
    ctx.fillStyle = 'rgba(14, 40, 18, 0.5)';
    ctx.beginPath();
    ctx.ellipse(16, 40, 13, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Trunk (Cylindrical with root flares)
    ctx.fillStyle = cOutline;
    ctx.fillRect(12, 28, 8, 13);
    ctx.fillStyle = cTrunk;
    ctx.fillRect(13, 29, 6, 11);
    ctx.fillStyle = cTrunkDark;
    ctx.fillRect(16, 29, 3, 11); // Right trunk shadow
    ctx.fillStyle = cTrunkLight;
    ctx.fillRect(13, 29, 1, 10); // Left trunk highlight

    // 3. Foliage: 3 Scalloped Bulbous Tiers
    // Tier 3: Bottom Tier (Y = 22 to 34, W = 28)
    this.drawScallopedTier(ctx, 16, 27, 14, 8, {
      cOutline,
      cDarkShade,
      cMidShade,
      cMainGreen,
      cLightGreen,
      cSunHighlight,
    });

    // Tier 2: Middle Tier (Y = 13 to 24, W = 22)
    this.drawScallopedTier(ctx, 16, 18, 11, 7, {
      cOutline,
      cDarkShade,
      cMidShade,
      cMainGreen,
      cLightGreen,
      cSunHighlight,
    });

    // Tier 1: Top Tier (Y = 4 to 15, W = 16)
    this.drawScallopedTier(ctx, 16, 10, 8, 6.5, {
      cOutline,
      cDarkShade,
      cMidShade,
      cMainGreen,
      cLightGreen,
      cSunHighlight,
    });

    // Pointed Apex Cone & Glint
    ctx.fillStyle = cOutline;
    ctx.fillRect(15, 1, 2, 4);
    ctx.fillStyle = cLightGreen;
    ctx.fillRect(15, 2, 2, 2);
    ctx.fillStyle = cSunHighlight;
    ctx.fillRect(15, 2, 1, 1);

    this.canvasCache.set(key, canvas);
    return canvas;
  }

  /**
   * Draws a single bulbous pine tier with scalloped cloud lobes and 4-tone GBA lighting
   */
  private static drawScallopedTier(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    colors: any
  ) {
    const { cOutline, cDarkShade, cMidShade, cMainGreen, cLightGreen, cSunHighlight } = colors;

    // Outer dark outline
    ctx.fillStyle = cOutline;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx + 1, ry + 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark underside shadow (bottom 40% of the tier)
    ctx.fillStyle = cDarkShade;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mid Green body
    ctx.fillStyle = cMidShade;
    ctx.beginPath();
    ctx.ellipse(cx - 0.5, cy - 1.5, rx - 1, ry - 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main vibrant green upper mass
    ctx.fillStyle = cMainGreen;
    ctx.beginPath();
    ctx.ellipse(cx - 1, cy - 2.5, rx - 2, ry - 1.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left and top bulbous lobes (Scalloped puffs from Image 1!)
    ctx.fillStyle = cLightGreen;
    // Left lobe puff
    ctx.beginPath();
    ctx.arc(cx - rx * 0.45, cy - 1, rx * 0.38, 0, Math.PI * 2);
    ctx.fill();
    // Center-top puff
    ctx.beginPath();
    ctx.arc(cx - 1, cy - ry * 0.4, rx * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Brightest sunlit rim glint (Iconic Pokémon GBA foliage glint!)
    ctx.fillStyle = cSunHighlight;
    ctx.fillRect(cx - Math.floor(rx * 0.55), cy - Math.floor(ry * 0.5), 3, 2);
    ctx.fillRect(cx - 2, cy - Math.floor(ry * 0.7), 4, 2);
    ctx.fillRect(cx - 1, cy - Math.floor(ry * 0.8), 2, 1);
  }

  /**
   * Authentic GBA Deciduous Round Tree (36x44 px)
   * The large hero round tree in the center of Image 1!
   */
  public static getPokemonOakTree(): HTMLCanvasElement {
    const key = 'oak_tree_gba';
    const cached = this.canvasCache.get(key);
    if (cached) return cached;

    const { canvas, ctx } = this.createCanvas(36, 44);

    const cOutline = '#0E2812';
    const cDark = '#1A501C';
    const cMid = '#2C7A28';
    const cMain = '#48A834';
    const cLight = '#72D246';
    const cGlint = '#A6F25C';
    const cTrunk = '#6B4024';
    const cTrunkDark = '#482812';

    // Shadow
    ctx.fillStyle = 'rgba(14, 40, 18, 0.5)';
    ctx.beginPath();
    ctx.ellipse(18, 40, 15, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk with roots
    ctx.fillStyle = cOutline;
    ctx.fillRect(14, 26, 8, 14);
    ctx.fillStyle = cTrunk;
    ctx.fillRect(15, 27, 6, 12);
    ctx.fillStyle = cTrunkDark;
    ctx.fillRect(18, 27, 3, 12);

    // Multi-lobed canopy (5 overlapping bulbous foliage spheres)
    const lobes = [
      { x: 18, y: 12, r: 12 },
      { x: 10, y: 18, r: 10 },
      { x: 26, y: 18, r: 10 },
      { x: 12, y: 24, r: 9 },
      { x: 24, y: 24, r: 9 },
    ];

    // Outlines
    ctx.fillStyle = cOutline;
    lobes.forEach((l) => {
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r + 1, 0, Math.PI * 2);
      ctx.fill();
    });

    // Dark shadow fill
    ctx.fillStyle = cDark;
    lobes.forEach((l) => {
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Mid Green
    ctx.fillStyle = cMid;
    lobes.forEach((l) => {
      ctx.beginPath();
      ctx.arc(l.x - 1, l.y - 1.5, l.r - 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Upper light green
    ctx.fillStyle = cLight;
    lobes.forEach((l) => {
      ctx.beginPath();
      ctx.arc(l.x - 2, l.y - 3, l.r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    });

    // Sunlit highlights
    ctx.fillStyle = cGlint;
    ctx.fillRect(15, 4, 5, 2);
    ctx.fillRect(8, 12, 4, 2);
    ctx.fillRect(23, 12, 3, 2);

    this.canvasCache.set(key, canvas);
    return canvas;
  }

  /**
   * Authentic GBA Flower Bush (16x16 px)
   * Matches the round flower bushes with white 4-petal blossoms in Image 1!
   */
  public static getFlowerBush(): HTMLCanvasElement {
    const key = 'flower_bush_gba';
    const cached = this.canvasCache.get(key);
    if (cached) return cached;

    const { canvas, ctx } = this.createCanvas(16, 16);

    // Ground shadow
    ctx.fillStyle = 'rgba(14, 40, 18, 0.4)';
    ctx.beginPath();
    ctx.ellipse(8, 14, 7, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.fillStyle = '#0E2812';
    ctx.beginPath();
    ctx.arc(8, 8, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Dark shadow
    ctx.fillStyle = '#1A501C';
    ctx.beginPath();
    ctx.arc(8, 8, 7, 0, Math.PI * 2);
    ctx.fill();

    // Mid Green
    ctx.fillStyle = '#2C7A28';
    ctx.beginPath();
    ctx.arc(7.5, 7, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Bright Green
    ctx.fillStyle = '#5EB834';
    ctx.beginPath();
    ctx.arc(6.5, 5.5, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 4-petal white blossoms with golden center
    const drawBlossom = (bx: number, by: number) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(bx - 1, by, 3, 1);
      ctx.fillRect(bx, by - 1, 1, 3);
      ctx.fillStyle = '#FDE047';
      ctx.fillRect(bx, by, 1, 1);
    };

    drawBlossom(4, 5);
    drawBlossom(11, 6);
    drawBlossom(7, 10);

    this.canvasCache.set(key, canvas);
    return canvas;
  }

  /**
   * Authentic Pokémon GBA Red-Tiled Building Roof & Siding (Pokémon Center style)
   * Produces the exact curved red hip-roof, ridge stripes, and weatherboard panels from Image 2!
   */
  public static drawPokemonBuilding(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    roofColor: string,
    buildingCode: string,
    roofStyle: 'hip' | 'peaked' | 'flat' = 'hip'
  ) {
    // 1. Cast Shadow on ground
    ctx.fillStyle = 'rgba(16, 36, 18, 0.45)';
    ctx.fillRect(x - 2, y + h - 5, w + 4, 9);

    // 2. Wall Base / Plinth
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 2, y + h - 4, w - 4, 4);
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x + 2, y + h - 1, w - 4, 1);

    // 3. Wall Siding (White weatherboard panels with 1px horizontal shadow lines)
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(x + 2, y + 16, w - 4, h - 20);

    ctx.fillStyle = '#CBD5E1';
    for (let sy = y + 22; sy < y + h - 6; sy += 6) {
      ctx.fillRect(x + 2, sy, w - 4, 1);
    }

    // 4. Roof Construction
    const roofH = 18;
    const darkEdge = '#7F1D1D';
    const mainRoof = roofColor;
    const highlight = '#F87171';
    const ridgeCream = '#FEF08A';

    if (roofStyle === 'hip') {
      // Slanted hip roof (Iconic Pokémon Center)
      ctx.fillStyle = darkEdge;
      ctx.beginPath();
      ctx.moveTo(x + 6, y);
      ctx.lineTo(x + w - 6, y);
      ctx.lineTo(x + w, y + roofH);
      ctx.lineTo(x, y + roofH);
      ctx.closePath();
      ctx.fill();

      // Main roof color
      ctx.fillStyle = mainRoof;
      ctx.beginPath();
      ctx.moveTo(x + 7, y + 1);
      ctx.lineTo(x + w - 7, y + 1);
      ctx.lineTo(x + w - 1, y + roofH - 1);
      ctx.lineTo(x + 1, y + roofH - 1);
      ctx.closePath();
      ctx.fill();

      // Roof ridge highlight
      ctx.fillStyle = highlight;
      ctx.fillRect(x + 8, y + 2, w - 16, 2);

      // Cream vertical roof ridge stripes (like Image 2!)
      ctx.fillStyle = ridgeCream;
      ctx.fillRect(x + 16, y + 1, 3, roofH - 2);
      ctx.fillRect(x + w - 19, y + 1, 3, roofH - 2);

      // Eaves shadow underneath onto wall
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.fillRect(x, y + roofH, w, 2);
    } else {
      // Peaked / Gable roof
      ctx.fillStyle = darkEdge;
      ctx.fillRect(x, y, w, roofH);
      ctx.fillStyle = mainRoof;
      ctx.fillRect(x + 1, y + 1, w - 2, roofH - 2);
      ctx.fillStyle = highlight;
      ctx.fillRect(x + 2, y + 2, w - 4, 2);
    }

    // 5. Windows (3-tone reflective glass with sky-blue sheen & frame)
    const windowW = 12;
    const windowH = 10;
    const winY = y + 22;
    const winX1 = x + 8;
    const winX2 = x + w - windowW - 8;

    [winX1, winX2].forEach((wx) => {
      // Window dark frame
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(wx - 1, winY - 1, windowW + 2, windowH + 2);

      // Deep glass
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(wx, winY, windowW, windowH);

      // Diagonal sky blue reflection (Iconic GBA glass reflection!)
      ctx.fillStyle = '#7DD3FC';
      ctx.fillRect(wx + 1, winY + 1, windowW - 2, 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(wx + 2, winY + 2, 2, 2);

      // Window sill
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(wx - 2, winY + windowH, windowW + 4, 2);
    });

    // 6. Sliding Glass Entrance Door (Centered)
    const doorW = 18;
    const doorH = 16;
    const doorX = x + Math.floor(w / 2) - Math.floor(doorW / 2);
    const doorY = y + h - doorH;

    // Door frame
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(doorX - 1, doorY - 1, doorW + 2, doorH + 1);

    // Cyan reflective glass sliding door
    ctx.fillStyle = '#0369A1';
    ctx.fillRect(doorX, doorY, doorW, doorH);

    // Glass sheen
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(doorX + 1, doorY + 1, 7, doorH - 2);
    ctx.fillRect(doorX + 10, doorY + 1, 7, doorH - 2);

    ctx.fillStyle = '#E0F2FE';
    ctx.fillRect(doorX + 2, doorY + 2, 3, 4);
    ctx.fillRect(doorX + 11, doorY + 2, 3, 4);

    // Center door split line & handle
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(doorX + 8, doorY, 2, doorH);
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(doorX + 6, doorY + 7, 2, 3);
    ctx.fillRect(doorX + 10, doorY + 7, 2, 3);

    // Welcome mat / stone threshold
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(doorX - 2, y + h - 1, doorW + 4, 3);

    // 7. Building Signboard / Emblem
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x + Math.floor(w / 2) - 20, y + 8, 40, 8);
    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 6px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(buildingCode, x + Math.floor(w / 2), y + 14);
  }
}
