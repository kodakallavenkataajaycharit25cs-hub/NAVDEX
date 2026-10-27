import { describe, expect, it } from 'vitest';
import { PixelPetGenerator } from '../pixelPetGenerator';
import { PixelSpriteGenerator } from '../pixelSpriteGenerator';
import {
  METRES_PER_TILE,
  PIXEL_BUILDINGS,
  pixelToWorld,
  TILE_SIZE,
  worldToTile,
} from '../pixelTilemap';
import {
  DEFAULT_PIXEL_CONFIG,
  PixelCharacterConfig,
  profileToPixelConfig,
} from '../types';

describe('Pixel System: Tilemap Coordinates', () => {
  it('correctly maps world coordinates to tile and pixel coordinates', () => {
    const originTile = worldToTile(0, 0);
    expect(originTile.tx).toBe(48);
    expect(originTile.ty).toBe(60);
    expect(originTile.px).toBe(48 * TILE_SIZE);
    expect(originTile.py).toBe(60 * TILE_SIZE);

    const worldBack = pixelToWorld(originTile.px, originTile.py);
    expect(worldBack.x).toBeCloseTo(0, 1);
    expect(worldBack.z).toBeCloseTo(0, 1);
  });

  it('contains the vertical slice landmark buildings with valid coordinates', () => {
    const ids = PIXEL_BUILDINGS.map((b) => b.id);
    expect(ids).toContain('MECH');
    expect(ids).toContain('GAL');
    expect(ids).toContain('AMPHI');
    expect(ids).toContain('MBA');
    expect(ids).toContain('GATE');

    PIXEL_BUILDINGS.forEach((b) => {
      const tile = worldToTile(b.worldX, b.worldZ);
      expect(tile.tx).toBeGreaterThan(0);
      expect(tile.ty).toBeGreaterThan(0);
    });
  });
});

describe('Pixel System: Profile Converter', () => {
  it('converts profile to PixelCharacterConfig with sensible fallbacks', () => {
    const config = profileToPixelConfig({
      skinTone: '#E59866',
      hairStyle: 'pompadour',
      hairColor: '#5E3A24',
      topStyle: 'jacket',
      outfitColor: '#159A74',
      hatStyle: 'cap',
      petSpecies: 'bunny',
      petName: 'Willow',
    });

    expect(config.skinTone).toBe('#E59866');
    expect(config.hairStyle).toBe('pompadour');
    expect(config.shirtStyle).toBe('jacket');
    expect(config.shirtColor).toBe('#159A74');
    expect(config.accessory).toBe('cap');
    expect(config.petSpecies).toBe('bunny');
    expect(config.petName).toBe('Willow');
  });

  it('handles empty profile gracefully', () => {
    const config = profileToPixelConfig({});
    expect(config.skinTone).toBe('#F4C29F');
    expect(config.hairStyle).toBe('messy');
    expect(config.petSpecies).toBe('dog');
  });
});

describe('Pixel System: Sprite Generation', () => {
  it('renders character frames across all 4 directions', () => {
    if (typeof document !== 'undefined') {
      const directions = ['down', 'up', 'left', 'right'] as const;
      directions.forEach((dir) => {
        const canvas = PixelSpriteGenerator.renderFrame(
          DEFAULT_PIXEL_CONFIG,
          dir,
          'walk',
          1
        );
        expect(canvas.width).toBe(32);
        expect(canvas.height).toBe(32);
      });
    }
  });

  it('renders pet frames across species and states', () => {
    if (typeof document !== 'undefined') {
      const speciesList = ['dog', 'cat', 'bunny'] as const;
      speciesList.forEach((sp) => {
        const canvas = PixelPetGenerator.renderPetFrame(sp, 'down', 'walk', 0);
        expect(canvas.width).toBe(24);
        expect(canvas.height).toBe(24);
      });
    }
  });
});
