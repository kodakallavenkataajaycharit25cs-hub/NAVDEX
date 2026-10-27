import {
  PixelAnimState,
  PixelCharacterConfig,
  PixelDirection,
  PixelHairStyle,
  PixelHatStyle,
  PixelPantsStyle,
  PixelShoesStyle,
  PixelTopStyle,
} from './types';

export const SPRITE_FRAME_SIZE = 32;

// Utility to lighten or darken a hex color
function adjustColor(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export class PixelSpriteGenerator {
  private static canvasCache = new Map<string, HTMLCanvasElement>();

  /**
   * Generates a single 32x32 pixel frame as an offscreen canvas
   * Styled in classic GBA Pokémon Trainer proportions (Brendan / Red)
   */
  public static renderFrame(
    config: PixelCharacterConfig,
    direction: PixelDirection,
    anim: PixelAnimState,
    frameIndex: number
  ): HTMLCanvasElement {
    const key = `${JSON.stringify(config)}_${direction}_${anim}_${frameIndex}`;
    const cached = this.canvasCache.get(key);
    if (cached) return cached;

    const canvas = document.createElement('canvas');
    canvas.width = SPRITE_FRAME_SIZE;
    canvas.height = SPRITE_FRAME_SIZE;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    this.drawCharacter(ctx, config, direction, anim, frameIndex);

    this.canvasCache.set(key, canvas);
    return canvas;
  }

  private static drawCharacter(
    ctx: CanvasRenderingContext2D,
    config: PixelCharacterConfig,
    dir: PixelDirection,
    anim: PixelAnimState,
    frame: number
  ) {
    let bobY = 0;
    let jumpY = 0;
    if (anim === 'walk') {
      bobY = frame % 2 === 1 ? -1 : 0;
    } else if (anim === 'idle') {
      bobY = frame % 2 === 1 ? 1 : 0;
    } else if (anim === 'celebrate') {
      jumpY = frame % 2 === 1 ? -5 : 0;
    } else if (anim === 'sit') {
      bobY = 3;
    }

    const cx = 16;
    const cy = 20 + jumpY;

    // 1. Soft Elliptical Shadow under feet
    this.drawShadow(ctx, cx, 28, anim === 'celebrate' && frame % 2 === 1);

    // 2. Backpack behind (when facing away)
    if (config.backpack !== 'none' && dir === 'up') {
      this.drawBackpack(ctx, config, dir, cx, cy + bobY, false);
    }

    // 3. Legs & Shoes (with GBA Pokémon stride)
    this.drawLegsAndShoes(ctx, config, dir, anim, frame, cx, cy, bobY);

    // 4. Body & Shirt / Jacket (with dark outline)
    this.drawBodyAndShirt(ctx, config, dir, anim, frame, cx, cy, bobY);

    // 5. Head & Skin
    this.drawHead(ctx, config, dir, anim, frame, cx, cy + bobY);

    // 6. Facial Expressions (Anime eyes, blush)
    this.drawFace(ctx, config, dir, anim, frame, cx, cy + bobY);

    // 7. Hair
    this.drawHair(ctx, config, dir, anim, frame, cx, cy + bobY);

    // 8. Backpack front straps
    if (config.backpack !== 'none' && dir !== 'up') {
      this.drawBackpack(ctx, config, dir, cx, cy + bobY, true);
    }

    // 9. Hat / Accessory (Iconic Pokémon Trainer Cap / Headband)
    if (config.accessory !== 'none') {
      this.drawAccessory(ctx, config, dir, cx, cy + bobY);
    }

    // 10. Sparkles when celebrating
    if (anim === 'celebrate' && frame % 2 === 1) {
      this.drawSparkles(ctx, cx, cy - 14);
    }
  }

  private static drawShadow(ctx: CanvasRenderingContext2D, cx: number, y: number, isJumping: boolean) {
    ctx.fillStyle = isJumping ? 'rgba(24, 48, 24, 0.18)' : 'rgba(24, 48, 24, 0.4)';
    const rx = isJumping ? 4 : 6;
    const ry = isJumping ? 1.5 : 2.5;
    ctx.beginPath();
    ctx.ellipse(cx, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawLegsAndShoes(
    ctx: CanvasRenderingContext2D,
    config: PixelCharacterConfig,
    dir: PixelDirection,
    anim: PixelAnimState,
    frame: number,
    cx: number,
    cy: number,
    bobY: number
  ) {
    const pantsColor = config.pantsColor;
    const pantsDark = adjustColor(pantsColor, -30);
    const shoesColor = config.shoesColor;
    const outline = '#182030';
    const skinTone = config.skinTone;
    const isShorts = config.pantsStyle === 'shorts';

    let lOffY = 0;
    let rOffY = 0;
    let lOffX = 0;
    let rOffX = 0;

    if (anim === 'walk') {
      const step = frame % 4;
      if (dir === 'down' || dir === 'up') {
        if (step === 1) lOffY = -2;
        if (step === 3) rOffY = -2;
      } else {
        if (step === 1) { lOffX = -2; rOffX = 2; }
        if (step === 3) { lOffX = 2; rOffX = -2; }
      }
    }

    const legTop = cy + 1 + bobY;

    if (dir === 'down' || dir === 'up') {
      const lx = cx - 4;
      const rx = cx + 1;

      // Dark outline around legs
      ctx.fillStyle = outline;
      ctx.fillRect(lx - 1, legTop + lOffY, 4, 6);
      ctx.fillRect(rx, legTop + rOffY, 4, 6);

      // Pants fill
      ctx.fillStyle = pantsColor;
      ctx.fillRect(lx, legTop + lOffY, 3, isShorts ? 3 : 5);
      ctx.fillRect(rx + 1, legTop + rOffY, 3, isShorts ? 3 : 5);

      if (isShorts) {
        ctx.fillStyle = skinTone;
        ctx.fillRect(lx, legTop + 3 + lOffY, 3, 2);
        ctx.fillRect(rx + 1, legTop + 3 + rOffY, 3, 2);
      }

      // Shoes with rubber sole
      ctx.fillStyle = shoesColor;
      ctx.fillRect(lx, cy + 6 + bobY + lOffY, 3, 2);
      ctx.fillRect(rx + 1, cy + 6 + bobY + rOffY, 3, 2);
      ctx.fillStyle = outline;
      ctx.fillRect(lx, cy + 7 + bobY + lOffY, 3, 1);
      ctx.fillRect(rx + 1, cy + 7 + bobY + rOffY, 3, 1);
    } else {
      // Side view
      const sign = dir === 'left' ? -1 : 1;
      const legX = cx - 2 + sign;

      ctx.fillStyle = outline;
      ctx.fillRect(legX - 1 + lOffX, legTop, 5, 6);

      ctx.fillStyle = pantsColor;
      ctx.fillRect(legX + lOffX, legTop, 3, isShorts ? 3 : 5);
      if (anim === 'walk') {
        ctx.fillStyle = pantsDark;
        ctx.fillRect(legX + rOffX, legTop, 3, isShorts ? 3 : 5);
      }

      // Shoe
      ctx.fillStyle = shoesColor;
      ctx.fillRect(legX + lOffX + sign, cy + 6 + bobY, 4, 2);
      ctx.fillStyle = outline;
      ctx.fillRect(legX + lOffX + sign, cy + 7 + bobY, 4, 1);
    }
  }

  private static drawBodyAndShirt(
    ctx: CanvasRenderingContext2D,
    config: PixelCharacterConfig,
    dir: PixelDirection,
    anim: PixelAnimState,
    frame: number,
    cx: number,
    cy: number,
    bobY: number
  ) {
    const shirtColor = config.shirtColor;
    const shirtDark = adjustColor(shirtColor, -30);
    const outline = '#182030';
    const skinTone = config.skinTone;
    const topY = cy - 5 + bobY;

    // Dark outline around torso
    ctx.fillStyle = outline;
    ctx.fillRect(cx - 5, topY - 1, 10, 7);

    // Torso Fill
    ctx.fillStyle = shirtColor;
    ctx.fillRect(cx - 4, topY, 8, 5);

    // Shirt details (collar, hoodie pocket, track stripe)
    if (config.shirtStyle === 'hoodie') {
      ctx.fillStyle = shirtDark;
      if (dir === 'down') {
        ctx.fillRect(cx - 2, topY + 2, 4, 3); // kangaroo pouch
      }
    } else if (config.shirtStyle === 'jacket') {
      if (dir === 'down') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - 1, topY, 2, 5); // White inner tee
        ctx.fillStyle = outline;
        ctx.fillRect(cx - 0.5, topY, 1, 5); // zipper
      }
    } else {
      // Classic Pokémon Trainer vest / t-shirt
      if (dir === 'down') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - 2, topY, 4, 2); // collar trim
      }
    }

    // Arms
    let armSwing = 0;
    if (anim === 'walk') {
      armSwing = frame % 4 === 1 ? 1 : frame % 4 === 3 ? -1 : 0;
    } else if (anim === 'celebrate' && frame % 2 === 1) {
      // Arms up cheering \o/
      ctx.fillStyle = outline;
      ctx.fillRect(cx - 7, topY - 4, 3, 6);
      ctx.fillRect(cx + 4, topY - 4, 3, 6);
      ctx.fillStyle = shirtColor;
      ctx.fillRect(cx - 6, topY - 3, 2, 4);
      ctx.fillRect(cx + 4, topY - 3, 2, 4);
      ctx.fillStyle = skinTone;
      ctx.fillRect(cx - 6, topY - 5, 2, 2);
      ctx.fillRect(cx + 4, topY - 5, 2, 2);
      return;
    }

    if (dir === 'down' || dir === 'up') {
      // Left arm
      ctx.fillStyle = outline;
      ctx.fillRect(cx - 6, topY + armSwing, 3, 6);
      ctx.fillStyle = shirtColor;
      ctx.fillRect(cx - 5, topY + 1 + armSwing, 2, 3);
      ctx.fillStyle = skinTone;
      ctx.fillRect(cx - 5, topY + 4 + armSwing, 2, 2);

      // Right arm
      ctx.fillStyle = outline;
      ctx.fillRect(cx + 3, topY - armSwing, 3, 6);
      ctx.fillStyle = shirtColor;
      ctx.fillRect(cx + 3, topY + 1 - armSwing, 2, 3);
      ctx.fillStyle = skinTone;
      ctx.fillRect(cx + 3, topY + 4 - armSwing, 2, 2);
    } else {
      const sign = dir === 'left' ? -1 : 1;
      ctx.fillStyle = outline;
      ctx.fillRect(cx - 1 + sign * 2, topY + armSwing, 4, 6);
      ctx.fillStyle = shirtColor;
      ctx.fillRect(cx + sign * 2, topY + 1 + armSwing, 2, 3);
      ctx.fillStyle = skinTone;
      ctx.fillRect(cx + sign * 2, topY + 4 + armSwing, 2, 2);
    }
  }

  private static drawHead(
    ctx: CanvasRenderingContext2D,
    config: PixelCharacterConfig,
    dir: PixelDirection,
    anim: PixelAnimState,
    frame: number,
    cx: number,
    cy: number
  ) {
    const skinTone = config.skinTone;
    const outline = '#182030';
    const headY = cy - 14;

    // Dark outline around head
    ctx.fillStyle = outline;
    ctx.fillRect(cx - 6, headY - 1, 12, 10);

    // Head base (10x8 block)
    ctx.fillStyle = skinTone;
    ctx.fillRect(cx - 5, headY, 10, 8);

    // Rounded corner pixels
    ctx.clearRect(cx - 6, headY - 1, 1, 1);
    ctx.clearRect(cx + 5, headY - 1, 1, 1);
    ctx.clearRect(cx - 6, headY + 8, 1, 1);
    ctx.clearRect(cx + 5, headY + 8, 1, 1);
  }

  private static drawFace(
    ctx: CanvasRenderingContext2D,
    config: PixelCharacterConfig,
    dir: PixelDirection,
    anim: PixelAnimState,
    frame: number,
    cx: number,
    cy: number
  ) {
    if (dir === 'up') return;

    const headY = cy - 14;
    const eyeColor = '#182030';
    const blushColor = 'rgba(239, 68, 68, 0.4)';

    if (dir === 'down') {
      if (anim === 'celebrate' && frame % 2 === 1) {
        // Happy closed eyes (^ ^)
        ctx.fillStyle = eyeColor;
        ctx.fillRect(cx - 4, headY + 4, 3, 1);
        ctx.fillRect(cx - 3, headY + 3, 1, 1);
        ctx.fillRect(cx + 1, headY + 4, 3, 1);
        ctx.fillRect(cx + 2, headY + 3, 1, 1);
        // Happy smile :D
        ctx.fillStyle = '#C2185B';
        ctx.fillRect(cx - 1, headY + 5, 2, 2);
      } else {
        // Big cute Pokémon anime eyes
        ctx.fillStyle = eyeColor;
        ctx.fillRect(cx - 4, headY + 3, 2, 3);
        ctx.fillRect(cx + 2, headY + 3, 2, 3);
        // Eye shine sparkle
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - 4, headY + 3, 1, 1);
        ctx.fillRect(cx + 2, headY + 3, 1, 1);

        // Smile
        ctx.fillStyle = '#880E4F';
        ctx.fillRect(cx - 1, headY + 6, 2, 1);
      }

      // Cheeks
      ctx.fillStyle = blushColor;
      ctx.fillRect(cx - 5, headY + 5, 2, 1);
      ctx.fillRect(cx + 3, headY + 5, 2, 1);
    } else {
      // Side profile
      const sign = dir === 'left' ? -1 : 1;
      const eyeX = cx + sign * 2;
      ctx.fillStyle = eyeColor;
      ctx.fillRect(eyeX, headY + 3, 2, 3);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(eyeX, headY + 3, 1, 1);
      ctx.fillStyle = blushColor;
      ctx.fillRect(eyeX - sign, headY + 5, 2, 1);
    }
  }

  private static drawHair(
    ctx: CanvasRenderingContext2D,
    config: PixelCharacterConfig,
    dir: PixelDirection,
    anim: PixelAnimState,
    frame: number,
    cx: number,
    cy: number
  ) {
    const hairColor = config.hairColor;
    const highlight = adjustColor(hairColor, 35);
    const outline = '#182030';
    const headY = cy - 14;

    ctx.fillStyle = hairColor;

    switch (config.hairStyle) {
      case 'crop':
      case 'pompadour':
        ctx.fillRect(cx - 5, headY - 2, 10, 4);
        ctx.fillRect(cx - 6, headY, 2, 4);
        ctx.fillRect(cx + 4, headY, 2, 4);
        if (dir === 'up') ctx.fillRect(cx - 5, headY + 1, 10, 6);
        break;

      case 'spiky':
      case 'messy':
      default:
        // Spiky anime hair tufts
        ctx.fillRect(cx - 5, headY - 2, 10, 4);
        ctx.fillRect(cx - 3, headY - 4, 3, 3);
        ctx.fillRect(cx + 1, headY - 4, 3, 3);
        ctx.fillRect(cx - 6, headY, 2, 5);
        ctx.fillRect(cx + 4, headY, 2, 5);
        if (dir === 'down') {
          // Bangs
          ctx.fillRect(cx - 4, headY + 2, 3, 2);
          ctx.fillRect(cx + 1, headY + 2, 3, 2);
        } else if (dir === 'up') {
          ctx.fillRect(cx - 5, headY + 1, 10, 7);
        }
        break;

      case 'bob':
      case 'curly':
        ctx.fillRect(cx - 6, headY - 2, 12, 4);
        ctx.fillRect(cx - 6, headY + 1, 3, 7);
        ctx.fillRect(cx + 3, headY + 1, 3, 7);
        if (dir === 'up') ctx.fillRect(cx - 6, headY + 1, 12, 8);
        break;

      case 'ponytail':
        ctx.fillRect(cx - 5, headY - 2, 10, 4);
        ctx.fillRect(cx - 6, headY, 2, 4);
        ctx.fillRect(cx + 4, headY, 2, 4);
        if (dir === 'down') {
          ctx.fillRect(cx + 4, headY - 3, 4, 7);
        } else if (dir === 'up') {
          ctx.fillRect(cx - 5, headY + 1, 10, 6);
          ctx.fillRect(cx - 2, headY - 6, 4, 5);
        }
        break;
    }

    // Top hair glint
    ctx.fillStyle = highlight;
    ctx.fillRect(cx - 2, headY - 1, 4, 1);
  }

  private static drawBackpack(
    ctx: CanvasRenderingContext2D,
    config: PixelCharacterConfig,
    dir: PixelDirection,
    cx: number,
    cy: number,
    isFront: boolean
  ) {
    const bpColor = config.backpackColor;
    const bpDark = adjustColor(bpColor, -30);
    const outline = '#182030';
    const topY = cy - 5;

    if (!isFront && dir === 'up') {
      // Full backpack on back
      ctx.fillStyle = outline;
      ctx.fillRect(cx - 5, topY, 10, 8);
      ctx.fillStyle = bpColor;
      ctx.fillRect(cx - 4, topY + 1, 8, 6);
      ctx.fillStyle = bpDark;
      ctx.fillRect(cx - 3, topY + 4, 6, 3);
    } else if (isFront && dir === 'down') {
      // Straps on front
      ctx.fillStyle = bpDark;
      ctx.fillRect(cx - 4, topY + 1, 1, 4);
      ctx.fillRect(cx + 3, topY + 1, 1, 4);
    }
  }

  private static drawAccessory(
    ctx: CanvasRenderingContext2D,
    config: PixelCharacterConfig,
    dir: PixelDirection,
    cx: number,
    cy: number
  ) {
    const accColor = config.accessoryColor;
    const outline = '#182030';
    const headY = cy - 14;

    switch (config.accessory) {
      case 'cap':
        // Classic Pokémon Trainer Cap (Image 2 & 3 inspired!)
        ctx.fillStyle = outline;
        ctx.fillRect(cx - 6, headY - 3, 12, 4);
        ctx.fillStyle = accColor;
        ctx.fillRect(cx - 5, headY - 2, 10, 3);
        // White emblem on cap center (Pokéball or crest)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - 1, headY - 1, 2, 2);
        // Brim
        if (dir === 'down') {
          ctx.fillStyle = outline;
          ctx.fillRect(cx - 6, headY + 1, 12, 2);
          ctx.fillStyle = accColor;
          ctx.fillRect(cx - 5, headY + 1, 10, 1);
        } else if (dir === 'left') {
          ctx.fillStyle = accColor;
          ctx.fillRect(cx - 8, headY + 1, 6, 2);
        } else if (dir === 'right') {
          ctx.fillStyle = accColor;
          ctx.fillRect(cx + 2, headY + 1, 6, 2);
        }
        break;

      case 'beanie':
        ctx.fillStyle = accColor;
        ctx.fillRect(cx - 5, headY - 4, 10, 5);
        ctx.fillRect(cx - 1, headY - 6, 2, 2); // pompom
        break;

      case 'headphones':
        ctx.fillStyle = '#37474F';
        ctx.fillRect(cx - 5, headY - 3, 10, 2); // band
        ctx.fillStyle = accColor;
        ctx.fillRect(cx - 6, headY + 2, 2, 4); // earcups
        ctx.fillRect(cx + 4, headY + 2, 2, 4);
        break;

      case 'glasses':
        if (dir === 'down') {
          ctx.fillStyle = outline;
          ctx.strokeRect(cx - 4.5, headY + 2.5, 3, 3);
          ctx.strokeRect(cx + 1.5, headY + 2.5, 3, 3);
          ctx.fillRect(cx - 1.5, headY + 3.5, 3, 1);
        }
        break;

      case 'sprout':
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(cx - 0.5, headY - 4, 1, 3);
        ctx.fillRect(cx - 2.5, headY - 6, 2, 2);
        ctx.fillRect(cx + 0.5, headY - 5, 2, 2);
        break;
    }
  }

  private static drawSparkles(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    ctx.fillStyle = '#FFD54F';
    ctx.fillRect(cx - 8, cy, 3, 1);
    ctx.fillRect(cx - 7, cy - 1, 1, 3);
    ctx.fillRect(cx + 6, cy - 2, 3, 1);
    ctx.fillRect(cx + 7, cy - 3, 1, 3);
  }
}
