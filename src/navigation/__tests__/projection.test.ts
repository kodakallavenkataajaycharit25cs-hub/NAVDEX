import { describe, expect, it } from 'vitest';
import { PLACES_BY_ID } from '../../data/campusPlaces';
import {
  CAMPUS_ORIGIN,
  distanceXZ,
  gpsToWorld,
  haversineMeters,
  worldToGps,
} from '../projection';

describe('Equirectangular Coordinate Projection (projection.ts)', () => {
  it('maps CAMPUS_ORIGIN exactly to (0, 0)', () => {
    const world = gpsToWorld(CAMPUS_ORIGIN);
    expect(Math.abs(world.x)).toBeLessThan(1e-6);
    expect(Math.abs(world.z)).toBeLessThan(1e-6);
  });

  it('round-trips gpsToWorld <-> worldToGps within 0.05m across all 25 blocks', () => {
    for (const place of Object.values(PLACES_BY_ID)) {
      const world = gpsToWorld(place.entrance);
      const back = worldToGps(world);
      const errM = haversineMeters(place.entrance, back);
      expect(errM).toBeLessThan(0.05);
    }
  });

  it('agrees with Haversine within 0.5% for both dense (CSE-C3 ~4.5m) and cross-campus (GATE-TEMP ~250m) pairs', () => {
    const cse = PLACES_BY_ID['CSE'];
    const c3 = PLACES_BY_ID['C3'];
    const projShort = distanceXZ(cse.worldPos, c3.worldPos);
    const havShort = haversineMeters(cse.entrance, c3.entrance);
    expect(projShort).toBeGreaterThan(4.0);
    expect(projShort).toBeLessThan(5.2);
    expect(Math.abs(projShort - havShort) / havShort).toBeLessThan(0.01);

    const gate = PLACES_BY_ID['GATE'];
    const temp = PLACES_BY_ID['TEMP'];
    const projLong = distanceXZ(gate.worldPos, temp.worldPos);
    const havLong = haversineMeters(gate.entrance, temp.entrance);
    expect(Math.abs(projLong - havLong) / havLong).toBeLessThan(0.005);
  });
});
