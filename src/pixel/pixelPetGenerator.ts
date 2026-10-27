import { PixelDirection, PixelPetSpecies, PixelPetState } from './types';

export const PET_FRAME_SIZE = 24;

export class PixelPetGenerator {
  private static petCanvasCache = new Map<string, HTMLCanvasElement>();

  public static renderPetFrame(
    species: PixelPetSpecies,
    dir: PixelDirection,
    anim: PixelPetState,
    frameIndex: number
  ): HTMLCanvasElement {
    const key = `${species}_${dir}_${anim}_${frameIndex}`;
    const cached = this.petCanvasCache.get(key);
    if (cached) return cached;

    const canvas = document.createElement('canvas');
    canvas.width = PET_FRAME_SIZE;
    canvas.height = PET_FRAME_SIZE;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    this.drawPet(ctx, species, dir, anim, frameIndex);

    this.petCanvasCache.set(key, canvas);
    return canvas;
  }

  private static drawPet(
    ctx: CanvasRenderingContext2D,
    species: PixelPetSpecies,
    dir: PixelDirection,
    anim: PixelPetState,
    frame: number
  ) {
    const cx = 12;
    let hopY = 0;
    if (anim === 'walk' || anim === 'run') {
      hopY = frame % 2 === 1 ? -2 : 0;
    } else if (anim === 'celebrate') {
      hopY = frame % 2 === 1 ? -4 : 0;
    } else if (anim === 'sit') {
      hopY = 1;
    }

    const cy = 15 + hopY;

    // Soft shadow
    ctx.fillStyle = hopY < -1 ? 'rgba(29, 36, 64, 0.15)' : 'rgba(29, 36, 64, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, 21, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Color palette based on species
    let mainColor = '#80FFDB';
    let shadeColor = '#48CAE4';
    let accentColor = '#FFFFFF';
    let earColor = '#72EFDD';

    if (species === 'cat') {
      mainColor = '#FFB3D9';
      shadeColor = '#F72585';
      accentColor = '#FFFFFF';
      earColor = '#FF85A1';
    } else if (species === 'bunny') {
      mainColor = '#A5F3FC';
      shadeColor = '#38BDF8';
      accentColor = '#FFFFFF';
      earColor = '#FDA4AF';
    }

    // Body
    ctx.fillStyle = mainColor;
    if (anim === 'sit') {
      ctx.fillRect(cx - 4, cy - 3, 8, 7);
    } else {
      ctx.fillRect(cx - 5, cy - 4, 10, 7);
    }

    // Legs / Paws
    ctx.fillStyle = shadeColor;
    if (anim === 'sit') {
      ctx.fillRect(cx - 4, cy + 4, 3, 2);
      ctx.fillRect(cx + 1, cy + 4, 3, 2);
    } else if (anim === 'walk' || anim === 'run') {
      const step = frame % 2;
      ctx.fillRect(cx - 4 + (step ? 1 : -1), cy + 3, 3, 3);
      ctx.fillRect(cx + 1 + (step ? -1 : 1), cy + 3, 3, 3);
    } else {
      ctx.fillRect(cx - 4, cy + 3, 3, 3);
      ctx.fillRect(cx + 1, cy + 3, 3, 3);
    }

    // Head
    const headY = cy - 7;
    ctx.fillStyle = mainColor;
    ctx.fillRect(cx - 4, headY, 8, 6);

    // Ears based on species
    if (species === 'dog') {
      // Floppy dog ears
      ctx.fillStyle = earColor;
      ctx.fillRect(cx - 6, headY + 1, 2, 4);
      ctx.fillRect(cx + 4, headY + 1, 2, 4);
    } else if (species === 'cat') {
      // Pointed cat ears
      ctx.fillStyle = earColor;
      ctx.fillRect(cx - 4, headY - 3, 2, 3);
      ctx.fillRect(cx + 2, headY - 3, 2, 3);
      ctx.fillStyle = '#FFFFFF'; // inner ear
      ctx.fillRect(cx - 3, headY - 2, 1, 2);
      ctx.fillRect(cx + 2, headY - 2, 1, 2);
    } else if (species === 'bunny') {
      // Long upright bunny ears
      ctx.fillStyle = mainColor;
      ctx.fillRect(cx - 3, headY - 5, 2, 6);
      ctx.fillRect(cx + 1, headY - 5, 2, 6);
      ctx.fillStyle = earColor; // pink inner
      ctx.fillRect(cx - 3, headY - 4, 1, 4);
      ctx.fillRect(cx + 2, headY - 4, 1, 4);
    }

    // Face (Eyes + Snout)
    if (dir !== 'up') {
      ctx.fillStyle = '#1D2440';
      if (anim === 'celebrate') {
        // Happy squint
        ctx.fillRect(cx - 3, headY + 2, 2, 1);
        ctx.fillRect(cx + 1, headY + 2, 2, 1);
      } else {
        ctx.fillRect(cx - 3, headY + 2, 2, 2);
        ctx.fillRect(cx + 1, headY + 2, 2, 2);
        // Shine
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - 3, headY + 2, 1, 1);
        ctx.fillRect(cx + 1, headY + 2, 1, 1);
      }

      // Cute nose
      ctx.fillStyle = '#BE123C';
      ctx.fillRect(cx - 0.5, headY + 4, 1, 1);

      // Cheeks
      ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.fillRect(cx - 4, headY + 3, 1, 1);
      ctx.fillRect(cx + 3, headY + 3, 1, 1);
    }

    // Tail
    ctx.fillStyle = accentColor;
    const tailWag = frame % 2 === 1 ? 1 : -1;
    if (species === 'bunny') {
      // Round puff tail
      ctx.fillRect(cx - 1, cy, 2, 2);
    } else {
      // Wagging tail
      ctx.fillRect(cx + 4, cy - 2 + tailWag, 2, 3);
    }

    // Heart sparkle when celebrating
    if (anim === 'celebrate') {
      ctx.fillStyle = '#F43F5E';
      ctx.fillRect(cx - 1, headY - 7, 3, 2);
      ctx.fillRect(cx, headY - 5, 1, 1);
    }
  }
}
