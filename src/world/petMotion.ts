import { distanceXZ, WorldXZ } from '../navigation/projection';

export type PetMotionState = 'idle' | 'follow' | 'lead' | 'sit' | 'celebrate';

export interface TrailSample {
  x: number;
  z: number;
  heading: number;
  cumulativeDist: number;
}

export class PetDistanceRingBuffer {
  private readonly capacity: number;
  private readonly minStepM: number;
  private samples: TrailSample[] = [];

  constructor(capacity = 64, minStepM = 0.25) {
    this.capacity = capacity;
    this.minStepM = minStepM;
  }

  reset(initialPos: WorldXZ, heading = 0): void {
    this.samples = [
      {
        x: initialPos.x,
        z: initialPos.z,
        heading,
        cumulativeDist: 0,
      },
    ];
  }

  /**
   * Pushes a new sample only if the character has moved at least minStepM (0.25m).
   * Returns true if a new sample was recorded.
   */
  push(pos: WorldXZ, heading?: number): boolean {
    if (this.samples.length === 0) {
      this.reset(pos, heading ?? 0);
      return true;
    }

    const last = this.samples[this.samples.length - 1];
    const stepDist = distanceXZ(last, pos);
    if (stepDist < this.minStepM) {
      return false;
    }

    const computedHeading =
      heading !== undefined ? heading : Math.atan2(pos.x - last.x, pos.z - last.z);

    this.samples.push({
      x: pos.x,
      z: pos.z,
      heading: computedHeading,
      cumulativeDist: last.cumulativeDist + stepDist,
    });

    if (this.samples.length > this.capacity) {
      this.samples.shift();
    }
    return true;
  }

  /**
   * Samples a point at `distanceBehindM` (default 1.8m) behind the latest character position.
   */
  sampleBehind(distanceBehindM = 1.8): { x: number; z: number; heading: number } {
    if (this.samples.length === 0) {
      return { x: 0, z: 0, heading: 0 };
    }
    const latest = this.samples[this.samples.length - 1];
    const targetDist = Math.max(0, latest.cumulativeDist - distanceBehindM);

    for (let i = this.samples.length - 1; i > 0; i--) {
      const curr = this.samples[i];
      const prev = this.samples[i - 1];
      if (targetDist >= prev.cumulativeDist && targetDist <= curr.cumulativeDist) {
        const span = Math.max(1e-4, curr.cumulativeDist - prev.cumulativeDist);
        const t = (targetDist - prev.cumulativeDist) / span;
        return {
          x: prev.x + (curr.x - prev.x) * t,
          z: prev.z + (curr.z - prev.z) * t,
          heading: curr.heading,
        };
      }
    }

    // If history is shorter than distanceBehindM, stand clearly beside the character (+2.8m X, +0.6m Z)
    const oldest = this.samples[0];
    return {
      x: oldest.x + 2.8,
      z: oldest.z + 0.6,
      heading: oldest.heading,
    };
  }

  getLength(): number {
    return this.samples.length;
  }
}

/**
 * Samples a target position along a route polyline at `distanceAheadM` (default 2.2m)
 * ahead of the character's current progress along the route.
 */
export function sampleRouteAhead(
  pawTrailPoints: Array<{ x: number; z: number; heading: number; distFromStart: number }>,
  currentDistAlongRoute: number,
  distanceAheadM = 2.2
): { x: number; z: number; heading: number } {
  if (pawTrailPoints.length === 0) {
    return { x: 0, z: 0, heading: 0 };
  }
  const targetDist = currentDistAlongRoute + distanceAheadM;
  for (let i = 0; i < pawTrailPoints.length - 1; i++) {
    const a = pawTrailPoints[i];
    const b = pawTrailPoints[i + 1];
    if (targetDist >= a.distFromStart && targetDist <= b.distFromStart) {
      const span = Math.max(1e-4, b.distFromStart - a.distFromStart);
      const t = (targetDist - a.distFromStart) / span;
      return {
        x: a.x + (b.x - a.x) * t,
        z: a.z + (b.z - a.z) * t,
        heading: a.heading,
      };
    }
  }
  const last = pawTrailPoints[pawTrailPoints.length - 1];
  return { x: last.x, z: last.z, heading: last.heading };
}
