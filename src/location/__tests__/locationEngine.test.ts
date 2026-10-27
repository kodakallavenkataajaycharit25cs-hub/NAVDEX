import { describe, expect, it } from 'vitest';
import { PLACES_BY_ID } from '../../data/campusPlaces';
import {
  evaluateArrivalHysteresis,
  evaluateCampusLocation,
  isWithinCampusGeofence,
  smoothWorldPosition,
} from '../locationEngine';

describe('Location Smoothing, Geofence, Cluster Disambiguation & Hysteresis (locationEngine.ts)', () => {
  it('dampens a 15m single-sample GPS spike via EMA low-pass smoothing', () => {
    const prev = { x: 10, z: 20 };
    const spiked = { x: 25, z: 20 };
    const smoothed = smoothWorldPosition(prev, spiked, 0.3);
    expect(smoothed.x).toBeCloseTo(14.5, 2);
  });

  it('detects off-campus coordinates (>320m) and falls back to GATE', () => {
    expect(isWithinCampusGeofence(PLACES_BY_ID['GATE'].entrance)).toBe(true);
    expect(isWithinCampusGeofence({ lat: 12.95, lon: 77.6 })).toBe(false);

    const offSnap = evaluateCampusLocation({ x: 500, z: -500 });
    expect(offSnap.offCampus).toBe(true);
    expect(offSnap.nearestBlockId).toBe('GATE');
  });

  it('populates clusterCandidates when standing in the CSE / C2 / C3 cluster (<15m)', () => {
    const csePos = PLACES_BY_ID['CSE'].worldPos;
    const snap = evaluateCampusLocation(csePos);
    expect(snap.nearestBlockId).toBe('CSE');
    expect(snap.clusterCandidates).toContain('CSE');
    expect(snap.clusterCandidates).toContain('C3');
    expect(snap.clusterCandidates).toContain('C2');
  });

  it('enforces <18m enter and >25m exit arrival hysteresis', () => {
    const libPos = PLACES_BY_ID['LIB'].worldPos;

    // 21m away while not yet arrived -> false
    const at21mNotArrived = evaluateArrivalHysteresis(
      false,
      { x: libPos.x + 21, z: libPos.z },
      'LIB'
    );
    expect(at21mNotArrived).toBe(false);

    // 16m away -> enters arrived state (true)
    const at16m = evaluateArrivalHysteresis(false, { x: libPos.x + 16, z: libPos.z }, 'LIB');
    expect(at16m).toBe(true);

    // Drifts to 21m while already arrived -> stays latched (true)
    const driftTo21m = evaluateArrivalHysteresis(true, { x: libPos.x + 21, z: libPos.z }, 'LIB');
    expect(driftTo21m).toBe(true);

    // Walks 35m away -> exits arrived state (false)
    const walkAway35m = evaluateArrivalHysteresis(true, { x: libPos.x + 35, z: libPos.z }, 'LIB');
    expect(walkAway35m).toBe(false);
  });
});
