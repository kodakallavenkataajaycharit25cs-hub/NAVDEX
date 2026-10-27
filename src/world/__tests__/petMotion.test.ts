import { describe, expect, it } from 'vitest';
import { PetDistanceRingBuffer, sampleRouteAhead } from '../petMotion';

describe('Pet Distance-Sampled Ring Buffer (petMotion.ts)', () => {
  it('ignores tiny jitter (<0.25m) so stationary frames do not overwrite the trail', () => {
    const buf = new PetDistanceRingBuffer(64, 0.25);
    buf.reset({ x: 0, z: 0 }, 0);
    expect(buf.push({ x: 0.05, z: 0.05 })).toBe(false);
    expect(buf.getLength()).toBe(1);

    expect(buf.push({ x: 0, z: 1.0 })).toBe(true);
    expect(buf.getLength()).toBe(2);
  });

  it('samples accurately 1.8m behind the character in Explore mode', () => {
    const buf = new PetDistanceRingBuffer(64, 0.25);
    buf.reset({ x: 0, z: 0 }, 0);
    for (let i = 1; i <= 10; i++) {
      buf.push({ x: 0, z: i * 0.5 }, 0);
    }
    // Latest is z = 5.0; 1.8m behind is z = 3.2
    const behind = buf.sampleBehind(1.8);
    expect(behind.x).toBeCloseTo(0, 2);
    expect(behind.z).toBeCloseTo(3.2, 2);
  });

  it('samples 2.2m ahead along the route in Walk mode', () => {
    const trail = [
      { x: 0, z: 0, heading: 0, distFromStart: 0 },
      { x: 0, z: 5, heading: 0, distFromStart: 5 },
      { x: 0, z: 10, heading: 0, distFromStart: 10 },
    ];
    const lead = sampleRouteAhead(trail, 2.0, 2.2);
    expect(lead.z).toBeCloseTo(4.2, 2);
  });
});
