import { describe, expect, it } from 'vitest';
import { computeTurnAngleDeg, generateDirections } from '../directions';

describe('Landmark Turn Instruction Generator (directions.ts)', () => {
  it('classifies straight, right, and left bearing deltas accurately', () => {
    // Moving North (0,0 -> 0,-20), then continuing slightly North-East (0,-20 -> 3,-40) => < 25 deg
    const straightDeg = computeTurnAngleDeg({ x: 0, z: 0 }, { x: 0, z: -20 }, { x: 3, z: -40 });
    expect(Math.abs(straightDeg)).toBeLessThan(25);

    // Moving North (0,0 -> 0,-20), then turning East (0,-20 -> 20,-20) => +90 deg (Right)
    const rightDeg = computeTurnAngleDeg({ x: 0, z: 0 }, { x: 0, z: -20 }, { x: 20, z: -20 });
    expect(rightDeg).toBeCloseTo(90, 1);

    // Moving North (0,0 -> 0,-20), then turning West (0,-20 -> -20,-20) => -90 deg (Left)
    const leftDeg = computeTurnAngleDeg({ x: 0, z: 0 }, { x: 0, z: -20 }, { x: -20, z: -20 });
    expect(leftDeg).toBeCloseTo(-90, 1);
  });

  it('produces readable landmark steps starting with Head out and ending with Arrive', () => {
    const steps = generateDirections(['GATE', 'W_NORTH_GATE', 'W_NORTH_MID', 'C1']);
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps[0].turnType).toBe('start');
    expect(steps[steps.length - 1].turnType).toBe('arrive');
    expect(steps[steps.length - 1].instruction).toContain('C1');
  });
});
