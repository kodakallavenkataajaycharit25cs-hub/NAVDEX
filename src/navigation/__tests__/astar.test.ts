import { describe, expect, it } from 'vitest';
import {
  CAMPUS_PLACES,
  isPointInsideAnyBuilding,
  PLACES_BY_ID,
} from '../../data/campusPlaces';
import { findRoute } from '../astar';
import { distanceXZ } from '../projection';

describe('A* Routing, Obstacle Avoidance & Front-Door Plaza Alignment (astar.ts)', () => {
  it('finds a valid connected route for all 25 x 24 = 600 ordered block pairs with ZERO building collisions', () => {
    let pairCount = 0;
    for (const start of CAMPUS_PLACES) {
      for (const dest of CAMPUS_PLACES) {
        if (start.id === dest.id) continue;
        const route = findRoute(start.id, dest.id);
        expect(route.ok, `Route failed from ${start.id} to ${dest.id}`).toBe(true);
        expect(route.nodeIds[0]).toBe(start.id);
        expect(route.nodeIds[route.nodeIds.length - 1]).toBe(dest.id);
        expect(route.totalDistanceM).toBeGreaterThan(0);
        expect(route.totalDistanceM).toBeLessThan(650);
        expect(route.pawTrailPoints.length).toBeGreaterThanOrEqual(2);
        expect(route.pawTrailPoints.length).toBeLessThanOrEqual(80);

        // Verify ZERO pawTrailPoints clip inside any 3D building footprint
        for (const pt of route.pawTrailPoints) {
          const hit = isPointInsideAnyBuilding(pt, 0.5);
          expect(
            hit,
            `Route ${start.id} -> ${dest.id} clipped inside building ${hit?.id} at (${pt.x.toFixed(1)}, ${pt.z.toFixed(1)})`
          ).toBeNull();
        }
        pairCount++;
      }
    }
    expect(pairCount).toBe(600);
  });

  it('handles same-block routing (A -> A) cleanly without looping', () => {
    const route = findRoute('LIB', 'LIB');
    expect(route.ok).toBe(true);
    expect(route.totalDistanceM).toBe(0);
    expect(route.nodeIds).toEqual(['LIB']);
  });

  it('returns explicit INVALID_NODE when given an unknown place ID', () => {
    const route = findRoute('GATE', 'NON_EXISTENT');
    expect(route.ok).toBe(false);
    expect(route.reason).toBe('INVALID_NODE');
  });

  it('terminates the 3D paw-print trail directly at the destination front-door plaza (entranceVisualPos)', () => {
    const route = findRoute('GATE', 'CSE');
    expect(route.ok).toBe(true);
    const lastVisual = route.visualWaypoints[route.visualWaypoints.length - 1];
    const cseEntrancePlaza = PLACES_BY_ID['CSE'].entranceVisualPos;
    expect(distanceXZ(lastVisual, cseEntrancePlaza)).toBeLessThan(2.5);
  });
});
