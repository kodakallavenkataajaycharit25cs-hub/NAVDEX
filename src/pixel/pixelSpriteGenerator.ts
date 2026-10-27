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
    // Vertical bobbing offsets
    let bobY = 0;
    let jumpY = 0;
    if (anim === 'walk') {
      bobY = (frame % 2 === 1) ? -1 : 0;
    } else if (anim === 'idle') {
      bobY = (frame % 2 === 1) ? 1 : 0;
    } else if (anim === 'celebrate') {
      jumpY = frame === 1 ? -4 : 0;
    } else if (anim === 'sit') {
      bobY = 3;
    }

    const cx = 16;
    const cy = 20 + jumpY;

    // 1. Shadow (always under feet)
    this.drawShadow(ctx, cx, 29, anim === 'celebrate' && frame === 1);

    // 2. Backpack Behind (when facing up or side-away)
    if (config.backpack !== 'none' && dir === 'up') {
      this.drawBackpack(ctx, config, dir, cx, cy + bobY, false);
    }

    // 3. Legs & Shoes
    this.drawLegsAndShoes(ctx, config, dir, anim, frame, cx, cy, bobY);

    // 4. Body & Shirt
    this.drawBodyAndShirt(ctx, config, dir, anim, frame, cx, cy, bobY);

    // 5. Head Base & Skin
    this.drawHead(ctx, config, dir, anim, frame, cx, cy + bobY);

    // 6. Face Features
    this.drawFace(ctx, config, dir, anim, frame, cx, cy + bobY);

    // 7. Hair
    this.drawHair(ctx, config, dir, anim, frame, cx, cy + bobY);

    // 8. Backpack Front / Straps
    if (config.backpack !== 'none' && dir !== 'up') {
      this.drawBackpack(ctx, config, dir, cx, cy + bobY, true);
    }

    // 9. Hat / Accessory
    if (config.accessory !== 'none') {
      this.drawAccessory(ctx, config, dir, cx, cy + bobY);
    }

    // 10. Celebrate sparkles
    if (anim === 'celebrate' && frame === 1) {
      this.drawSparkles(ctx, cx, cy - 12);
    }
  }

  private static drawShadow(ctx: CanvasRenderingContext2D, cx: number, y: number, isJumping: boolean) {
    ctx.fillStyle = isJumping ? 'rgba(29, 36, 64, 0.15)' : 'rgba(29, 36, 64, 0.35)';
    const rx = isJumping ? 4 : 6;
    const ry = isJumping ? 2 : 2.5;
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
    const pantsDark = adjustColor(pantsColor, -25);
    const shoesColor = config.shoesColor;
    const shoesSole = adjustColor(shoesColor, -40);
    const skinTone = config.skinTone;

    const isShorts = config.pantsStyle === 'shorts';
    const isSkirt = config.pantsStyle === 'skirt';

    let leftLegY = 0;
    let rightLegY = 0;
    let leftLegX = 0;
    let rightLegX = 0;

    if (anim === 'walk') {
      const step = frame % 4;
      if (dir === 'down' || dir === 'up') {
        if (step === 1) {
          leftLegY = -2;
        } else if (step === 3) {
          rightLegY = -2;
        }
      } else {
        // Side walking
        if (step === 1) {
          leftLegX = -2;
          rightLegX = 2;
        } else if (step === 3) {
          leftLegX = 2;
          rightLegX = -2;
        }
      }
    } else if (anim === 'sit') {
      // Sitting legs
      ctx.fillStyle = pantsColor;
      ctx.fillRect(cx - 5, cy + 5, 10, 3);
      ctx.fillStyle = shoesColor;
      ctx.fillRect(cx - 6, cy + 6, 3, 2);
      ctx.fillRect(cx + 3, cy + 6, 3, 2);
      return;
    }

    if (dir === 'down' || dir === 'up') {
      // Left leg
      const lx = cx - 4;
      const rx = cx + 1;
      const legTop = cy + 2 + bobY;

      // Skirt
      if (isSkirt) {
        ctx.fillStyle = pantsColor;
        ctx.fillRect(cx - 5, legTop - 1, 10, 4);
        ctx.fillStyle = pantsDark;
        ctx.fillRect(cx - 5, legTop + 2, 10, 1);
        // Bare legs under skirt
        ctx.fillStyle = skinTone;
        ctx.fillRect(lx + 1, legTop + 3 + leftLegY, 2, 2);
        ctx.fillRect(rx + 1, legTop + 3 + rightLegY, 2, 2);
      } else {
        // Pants legs
        ctx.fillStyle = pantsColor;
        const pantsHeight = isShorts ? 3 : 5;
        ctx.fillRect(lx, legTop + leftLegY, 3, pantsHeight);
        ctx.fillRect(rx, legTop + rightLegY, 3, pantsHeight);

        if (isShorts) {
          ctx.fillStyle = skinTone;
          ctx.fillRect(lx, legTop + 3 + leftLegY, 3, 2);
          ctx.fillRect(rx, legTop + 3 + rightLegY, 3, 2);
        }
      }

      // Shoes
      ctx.fillStyle = shoesColor;
      ctx.fillRect(lx, cy + 7 + bobY + leftLegY, 3, 2);
      ctx.fillRect(rx, cy + 7 + bobY + rightLegY, 3, 2);
      ctx.fillStyle = shoesSole;
      ctx.fillRect(lx, cy + 8 + bobY + leftLegY, 3, 1);
      ctx.fillRect(rx, cy + 8 + bobY + rightLegY, 3, 1);
    } else {
      // Side view (left or right)
      const sign = dir === 'left' ? -1 : 1;
      const lx = cx - 2 + sign;
      const legTop = cy + 2 + bobY;

      if (isSkirt) {
        ctx.fillStyle = pantsColor;
        ctx.fillRect(cx - 4, legTop - 1, 8, 4);
        ctx.fillStyle = skinTone;
        ctx.fillRect(lx + leftLegX, legTop + 3, 3, 2);
      } else {
        ctx.fillStyle = pantsColor;
        const pantsHeight = isShorts ? 3 : 5;
        ctx.fillRect(lx + leftLegX, legTop, 4, pantsHeight);
        if (anim === 'walk') {
          ctx.fillStyle = pantsDark;
          ctx.fillRect(lx + rightLegX, legTop, 3, pantsHeight);
        }
        if (isShorts) {
          ctx.fillStyle = skinTone;
          ctx.fillRect(lx + leftLegX, legTop + 3, 4, 2);
        }
      }

      // Shoes
      ctx.fillStyle = shoesColor;
      ctx.fillRect(lx + leftLegX + sign, cy + 7 + bobY, 4, 2);
      ctx.fillStyle = shoesSole;
      ctx.fillRect(lx + leftLegX + sign, cy + 8 + bobY, 4, 1);
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
    const shirtDark = adjustColor(shirtColor, -25);
    const skinTone = config.skinTone;
    const topY = cy - 4 + bobY;

    // Torso block (6x6)
    ctx.fillStyle = shirtColor;
    ctx.fillRect(cx - 4, topY, 8, 6);

    // Collar / Details based on shirt style
    if (config.shirtStyle === 'hoodie') {
      ctx.fillStyle = shirtDark;
      if (dir === 'down') {
        // Hood cords & pocket pouch
        ctx.fillRect(cx - 1, topY + 1, 2, 2);
        ctx.fillRect(cx - 3, topY + 4, 6, 2);
      } else if (dir === 'up') {
        // Hood bunched at back of neck
        ctx.fillRect(cx - 3, topY - 1, 6, 2);
      }
    } else if (config.shirtStyle === 'jacket') {
      ctx.fillStyle = shirtDark;
      if (dir === 'down') {
        // Open zipper line
        ctx.fillRect(cx - 0.5, topY + 1, 1, 5);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - 1.5, topY + 1, 1, 2);
      }
    } else if (config.shirtStyle === 'shirt') {
      if (dir === 'down') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - 1, topY, 2, 2); // collar
        ctx.fillStyle = '#1D2440';
        ctx.fillRect(cx, topY + 2, 1, 1); // button
        ctx.fillRect(cx, topY + 4, 1, 1);
      }
    }

    // Arms
    let armSwing = 0;
    if (anim === 'walk') {
      armSwing = (frame % 4 === 1 ? 1 : frame % 4 === 3 ? -1 : 0);
    } else if (anim === 'celebrate' && frame === 1) {
      // Arms up celebrating! \o/
      ctx.fillStyle = shirtColor;
      ctx.fillRect(cx - 6, topY - 3, 2, 5);
      ctx.fillRect(cx + 4, topY - 3, 2, 5);
      ctx.fillStyle = skinTone;
      ctx.fillRect(cx - 6, topY - 5, 2, 2);
      ctx.fillRect(cx + 4, topY - 5, 2, 2);
      return;
    }

    if (dir === 'down' || dir === 'up') {
      // Left arm
      ctx.fillStyle = shirtColor;
      ctx.fillRect(cx - 6, topY + 1 - armSwing, 2, 4);
      ctx.fillStyle = skinTone;
      ctx.fillRect(cx - 6, topY + 5 - armSwing, 2, 2); // Hand

      // Right arm
      ctx.fillStyle = shirtColor;
      ctx.fillRect(cx + 4, topY + 1 + armSwing, 2, 4);
      ctx.fillStyle = skinTone;
      ctx.fillRect(cx + 4, topY + 5 + armSwing, 2, 2);
    } else {
      // Side arm
      const sign = dir === 'left' ? -1 : 1;
      ctx.fillStyle = shirtColor;
      ctx.fillRect(cx - 1 + sign * 2, topY + 1 + armSwing, 3, 4);
      ctx.fillStyle = skinTone;
      ctx.fillRect(cx - 1 + sign * 2, topY + 5 + armSwing, 3, 2);
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
    const skinShade = adjustColor(skinTone, -20);
    const headY = cy - 13;

    // Head base (10x9 block)
    ctx.fillStyle = skinTone;
    ctx.fillRect(cx - 5, headY, 10, 9);
    // Rounded corners
    ctx.clearRect(cx - 5, headY, 1, 1);
    ctx.clearRect(cx + 4, headY, 1, 1);
    ctx.clearRect(cx - 5, headY + 8, 1, 1);
    ctx.clearRect(cx + 4, headY + 8, 1, 1);

    // Neck
    ctx.fillStyle = skinShade;
    ctx.fillRect(cx - 2, headY + 8, 4, 2);
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
    if (dir === 'up') return; // Facing away

    const headY = cy - 13;
    const eyeColor = '#1D2440';
    const blushColor = 'rgba(239, 68, 68, 0.45)';

    if (dir === 'down') {
      if (anim === 'celebrate' && frame === 1) {
        // Happy closed eyes (^ ^)
        ctx.fillStyle = eyeColor;
        ctx.fillRect(cx - 4, headY + 4, 3, 1);
        ctx.fillRect(cx - 3, headY + 3, 1, 1);
        ctx.fillRect(cx + 1, headY + 4, 3, 1);
        ctx.fillRect(cx + 2, headY + 3, 1, 1);
        // Cute open smile :D
        ctx.fillStyle = '#BE123C';
        ctx.fillRect(cx - 1, headY + 6, 2, 2);
      } else {
        // Big cute expressive anime/pixel eyes
        ctx.fillStyle = eyeColor;
        ctx.fillRect(cx - 4, headY + 3, 2, 3);
        ctx.fillRect(cx + 2, headY + 3, 2, 3);
        // Eye shine (white sparkle)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - 4, headY + 3, 1, 1);
        ctx.fillRect(cx + 2, headY + 3, 1, 1);

        // Smile
        ctx.fillStyle = '#991B1B';
        ctx.fillRect(cx - 1, headY + 6, 2, 1);
      }

      // Blushing cheeks
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

      // Cheek blush
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
    const hairHighlight = adjustColor(hairColor, 35);
    const hairShadow = adjustColor(hairColor, -30);
    const headY = cy - 13;

    ctx.fillStyle = hairColor;

    switch (config.hairStyle) {
      case 'crop':
        // Modern textured crop
        ctx.fillRect(cx - 5, headY - 2, 10, 4);
        ctx.fillRect(cx - 6, headY, 2, 4);
        ctx.fillRect(cx + 4, headY, 2, 4);
        if (dir === 'down') {
          ctx.fillRect(cx - 4, headY + 2, 8, 1);
        } else if (dir === 'up') {
          ctx.fillRect(cx - 5, headY + 1, 10, 6);
        }
        break;

      case 'messy':
        // Spiky / tousled anime messy hair
        ctx.fillRect(cx - 5, headY - 2, 10, 4);
        ctx.fillRect(cx - 3, headY - 3, 3, 2);
        ctx.fillRect(cx + 1, headY - 3, 3, 2);
        ctx.fillRect(cx - 6, headY - 1, 2, 6);
        ctx.fillRect(cx + 4, headY - 1, 2, 6);
        if (dir === 'down') {
          // Bangs
          ctx.fillRect(cx - 4, headY + 2, 3, 2);
          ctx.fillRect(cx, headY + 2, 2, 2);
          ctx.fillRect(cx + 2, headY + 2, 2, 1);
        } else if (dir === 'up') {
          ctx.fillRect(cx - 5, headY, 10, 7);
          ctx.fillStyle = hairShadow;
          ctx.fillRect(cx - 4, headY + 5, 8, 2);
        }
        break;

      case 'pompadour':
        ctx.fillRect(cx - 5, headY - 4, 10, 6);
        ctx.fillRect(cx - 4, headY - 5, 8, 2);
        ctx.fillRect(cx - 6, headY, 2, 4);
        ctx.fillRect(cx + 4, headY, 2, 4);
        if (dir === 'up') {
          ctx.fillRect(cx - 5, headY + 1, 10, 6);
        }
        break;

      case 'spiky':
        ctx.fillRect(cx - 5, headY - 2, 10, 4);
        ctx.fillRect(cx - 4, headY - 4, 2, 3);
        ctx.fillRect(cx - 1, headY - 5, 2, 4);
        ctx.fillRect(cx + 2, headY - 4, 2, 3);
        ctx.fillRect(cx - 6, headY, 2, 5);
        ctx.fillRect(cx + 4, headY, 2, 5);
        if (dir === 'up') {
          ctx.fillRect(cx - 5, headY + 1, 10, 6);
        }
        break;

      case 'buzz':
        ctx.fillRect(cx - 5, headY - 1, 10, 2);
        ctx.fillRect(cx - 5, headY, 1, 4);
        ctx.fillRect(cx + 4, headY, 1, 4);
        if (dir === 'up') {
          ctx.fillRect(cx - 5, headY + 1, 10, 4);
        }
        break;

      case 'bob':
        ctx.fillRect(cx - 6, headY - 2, 12, 4);
        ctx.fillRect(cx - 6, headY + 1, 3, 7);
        ctx.fillRect(cx + 3, headY + 1, 3, 7);
        if (dir === 'down') {
          ctx.fillRect(cx - 4, headY + 2, 8, 1);
        } else if (dir === 'up') {
          ctx.fillRect(cx - 6, headY + 1, 12, 8);
        }
        break;

      case 'ponytail':
        ctx.fillRect(cx - 5, headY - 2, 10, 4);
        ctx.fillRect(cx - 6, headY, 2, 4);
        ctx.fillRect(cx + 4, headY, 2, 4);
        if (dir === 'down') {
          // Ponytail visible peeking to side
          ctx.fillRect(cx + 4, headY - 3, 4, 5);
          ctx.fillRect(cx + 5, headY + 2, 3, 5);
        } else if (dir === 'up') {
          ctx.fillRect(cx - 5, headY + 1, 10, 6);
          // High ponytail tied at back
          ctx.fillStyle = '#E11D48'; // Hair tie
          ctx.fillRect(cx - 1, headY - 3, 2, 2);
          ctx.fillStyle = hairColor;
          ctx.fillRect(cx - 2, headY - 6, 4, 3);
          ctx.fillRect(cx - 1, headY - 2, 2, 8);
        } else {
          const sign = dir === 'left' ? 1 : -1;
          ctx.fillRect(cx + sign * 4, headY - 4, 3, 3);
          ctx.fillRect(cx + sign * 5, headY - 1, 3, 7);
        }
        break;

      case 'wavy':
        ctx.fillRect(cx - 6, headY - 2, 12, 4);
        ctx.fillRect(cx - 6, headY + 1, 3, 9);
        ctx.fillRect(cx + 3, headY + 1, 3, 9);
        ctx.fillRect(cx - 5, headY + 9, 2, 2);
        ctx.fillRect(cx + 3, headY + 9, 2, 2);
        if (dir === 'up') {
          ctx.fillRect(cx - 6, headY + 1, 12, 10);
        }
        break;

      case 'buns':
        ctx.fillRect(cx - 5, headY - 2, 10, 4);
        // Space buns left & right
        ctx.fillRect(cx - 7, headY - 5, 4, 4);
        ctx.fillRect(cx + 3, headY - 5, 4, 4);
        if (dir === 'up') {
          ctx.fillRect(cx - 5, headY + 1, 10, 6);
        }
        break;

      case 'curly':
      default:
        ctx.fillRect(cx - 6, headY - 3, 12, 5);
        ctx.fillRect(cx - 6, headY + 1, 3, 6);
        ctx.fillRect(cx + 3, headY + 1, 3, 6);
        ctx.fillRect(cx - 3, headY - 4, 6, 2);
        if (dir === 'up') {
          ctx.fillRect(cx - 6, headY + 1, 12, 7);
        }
        break;
    }

    // Top hair highlight glint
    ctx.fillStyle = hairHighlight;
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
    const topY = cy - 4;

    if (!isFront && dir === 'up') {
      // Full backpack on back
      ctx.fillStyle = bpColor;
      ctx.fillRect(cx - 4, topY + 1, 8, 7);
      ctx.fillStyle = bpDark;
      ctx.fillRect(cx - 3, topY + 4, 6, 3); // Front pouch
      ctx.fillStyle = '#F59E0B'; // Zipper
      ctx.fillRect(cx - 1, topY + 4, 2, 1);
    } else if (isFront && dir === 'down') {
      // Straps on front
      ctx.fillStyle = bpDark;
      ctx.fillRect(cx - 4, topY + 1, 1, 5);
      ctx.fillRect(cx + 3, topY + 1, 1, 5);
    } else if (dir === 'left' || dir === 'right') {
      const sign = dir === 'left' ? 1 : -1;
      ctx.fillStyle = bpColor;
      ctx.fillRect(cx + sign * 4, topY + 1, 3, 6);
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
    const accDark = adjustColor(accColor, -30);
    const headY = cy - 13;

    switch (config.accessory) {
      case 'cap':
        ctx.fillStyle = accColor;
        ctx.fillRect(cx - 5, headY - 2, 10, 3);
        if (dir === 'down') {
          ctx.fillStyle = accDark;
          ctx.fillRect(cx - 6, headY + 1, 12, 2); // Brim
        } else if (dir === 'left') {
          ctx.fillStyle = accDark;
          ctx.fillRect(cx - 8, headY + 1, 6, 2);
        } else if (dir === 'right') {
          ctx.fillStyle = accDark;
          ctx.fillRect(cx + 2, headY + 1, 6, 2);
        }
        break;

      case 'beanie':
        ctx.fillStyle = accColor;
        ctx.fillRect(cx - 5, headY - 4, 10, 5);
        ctx.fillStyle = accDark;
        ctx.fillRect(cx - 6, headY + 1, 12, 2);
        // Beanie pompom
        ctx.fillRect(cx - 1, headY - 6, 2, 2);
        break;

      case 'headphones':
        ctx.fillStyle = accDark;
        // Headband over top
        ctx.fillRect(cx - 5, headY - 3, 10, 2);
        // Earcups
        ctx.fillStyle = accColor;
        ctx.fillRect(cx - 6, headY + 2, 2, 4);
        ctx.fillRect(cx + 4, headY + 2, 2, 4);
        break;

      case 'glasses':
        if (dir === 'down') {
          ctx.fillStyle = '#1D2440';
          ctx.strokeRect(cx - 4.5, headY + 2.5, 3, 3);
          ctx.strokeRect(cx + 1.5, headY + 2.5, 3, 3);
          ctx.fillRect(cx - 1.5, headY + 3.5, 3, 1); // Bridge
        }
        break;

      case 'sprout':
        // Cute green leaf sprout on head
        ctx.fillStyle = '#84CC16';
        ctx.fillRect(cx - 0.5, headY - 4, 1, 3);
        ctx.fillRect(cx - 2.5, headY - 6, 2, 2);
        ctx.fillRect(cx + 0.5, headY - 5, 2, 2);
        break;

      default:
        break;
    }
  }

  private static drawSparkles(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    ctx.fillStyle = '#FBBF24'; // Golden star sparkles
    // Left star
    ctx.fillRect(cx - 8, cy, 3, 1);
    ctx.fillRect(cx - 7, cy - 1, 1, 3);
    // Right star
    ctx.fillRect(cx + 6, cy - 2, 3, 1);
    ctx.fillRect(cx + 7, cy - 3, 1, 3);
  }
}
