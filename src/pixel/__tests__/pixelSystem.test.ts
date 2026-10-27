import { describe, expect, it } from 'vitest';
import { PixelPetGenerator } from '../pixelPetGenerator';
import { PixelSpriteGenerator } from '../pixelSpriteGenerator';
import {
  CAMPUS_TILE_ORIGIN_X,
  CAMPUS_TILE_ORIGIN_Y,
  isPositionBlocked,
  METRES_PER_TILE,
  PIXEL_BUILDINGS,
  pixelToWorld,
  SOLID_COLLISION_BOXES,
  TILE_SIZE,
  worldToTile,
} from '../pixelTilemap';
import {
  DEFAULT_PIXEL_CONFIG,
  PixelCharacterConfig,
  profileToPixelConfig,
} from '../types';

describe('Pixel System: Tilemap Coordinates & Buildings', () => {
  it('correctly maps world coordinates to tile and pixel coordinates', () => {
    const originTile = worldToTile(0, 0);
    expect(originTile.tx).toBe(CAMPUS_TILE_ORIGIN_X);
    expect(originTile.ty).toBe(CAMPUS_TILE_ORIGIN_Y);
    expect(originTile.px).toBe(CAMPUS_TILE_ORIGIN_X * TILE_SIZE);
    expect(originTile.py).toBe(CAMPUS_TILE_ORIGIN_Y * TILE_SIZE);

    const worldBack = pixelToWorld(originTile.px, originTile.py);
    expect(worldBack.x).toBeCloseTo(0, 1);
    expect(worldBack.z).toBeCloseTo(0, 1);
  });

  it('contains the complete campus map buildings from user layout', () => {
    const ids = PIXEL_BUILDINGS.map((b) => b.id);
    // Left column
    expect(ids).toContain('ECE');
    expect(ids).toContain('COE');
    expect(ids).toContain('IT');
    expect(ids).toContain('CSE');
    expect(ids).toContain('CIVIL');
    expect(ids).toContain('AIML');
    expect(ids).toContain('HOSTEL');
    expect(ids).toContain('SCHOOL');
    // Center column
    expect(ids).toContain('GATE');
    expect(ids).toContain('ADM');
    expect(ids).toContain('GAL');
    expect(ids).toContain('AT');
    expect(ids).toContain('AUDI');
    expect(ids).toContain('LIB');
    expect(ids).toContain('SIC');
    // Right column
    expect(ids).toContain('ME');
    expect(ids).toContain('MBA');
    expect(ids).toContain('PU');
    expect(ids).toContain('TEMP');
    expect(ids).toContain('GROUND');

    PIXEL_BUILDINGS.forEach((b) => {
      expect(b.tx).toBeGreaterThan(0);
      expect(b.ty).toBeGreaterThan(0);
      expect(b.entranceTx).toBeGreaterThan(0);
      expect(b.entranceTy).toBeGreaterThan(0);
    });
  });

  it('prevents character from walking inside solid buildings', () => {
    const admin = PIXEL_BUILDINGS.find((b) => b.id === 'ADM')!;
    // Point inside Admin building should be blocked
    const insideAdminX = (admin.tx + 4) * TILE_SIZE;
    const insideAdminY = (admin.ty + 4) * TILE_SIZE;
    expect(isPositionBlocked(insideAdminX, insideAdminY)).toBe(true);

    // Point outside in front entrance should NOT be blocked
    const entranceX = admin.entranceTx * TILE_SIZE;
    const entranceY = admin.entranceTy * TILE_SIZE;
    expect(isPositionBlocked(entranceX, entranceY)).toBe(false);
  });

  it('keeps Main Gate road open with a clear junction branch heading west', () => {
    const gate = PIXEL_BUILDINGS.find((b) => b.id === 'GATE')!;
    const gateEntranceX = gate.entranceTx * TILE_SIZE;
    const gateEntranceY = gate.entranceTy * TILE_SIZE;
    // Entrance must be walkable
    expect(isPositionBlocked(gateEntranceX, gateEntranceY)).toBe(false);

    // South down the main gate avenue (e.g. Y=18) must be walkable
    expect(isPositionBlocked(gateEntranceX, 18 * TILE_SIZE)).toBe(false);

    // North T-junction branch going west towards ECE must be walkable
    expect(isPositionBlocked(50 * TILE_SIZE, 17 * TILE_SIZE)).toBe(false);
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
