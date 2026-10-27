import React, { useEffect, useRef } from 'react';
import {
  evaluateCampusLocation,
  isWithinCampusGeofence,
  smoothWorldPosition,
} from './location/locationEngine';
import { gpsToWorld, WorldXZ } from './navigation/projection';
import { useCampusStore } from './store/useCampusStore';
import { AuthAndOnboardingModal } from './ui/AuthAndOnboardingModal';
import { BottomSheets } from './ui/BottomSheets';
import { HomeExploreHUD } from './ui/HomeExploreHUD';
import { WalkAndArrivalHUD } from './ui/WalkAndArrivalHUD';
import { CampusWorldCanvas } from './world/CampusWorldCanvas';

export const App: React.FC = () => {
  const demoMode = useCampusStore((s) => s.demoMode);
  const announcement = useCampusStore((s) => s.announcement);
  const setCurrentBlock = useCampusStore((s) => s.setCurrentBlock);
  const setDemoMode = useCampusStore((s) => s.setDemoMode);
  const smoothedGpsRef = useRef<WorldXZ | null>(null);

  // Unified Geolocation Watcher when Live GPS Mode is toggled on (4s timeout + 320m geofence)
  useEffect(() => {
    if (demoMode || typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coord = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        if (!isWithinCampusGeofence(coord)) {
          // Outside 320m campus boundary -> automatic fallback to Demo/Manual at Main Gate
          setDemoMode(true);
          setCurrentBlock('GATE', 'manual');
          return;
        }
        const rawWorld = gpsToWorld(coord);
        const smoothed = smoothWorldPosition(smoothedGpsRef.current, rawWorld, 0.35);
        smoothedGpsRef.current = smoothed;
        const snap = evaluateCampusLocation(smoothed);
        setCurrentBlock(snap.nearestBlockId, 'gps');
      },
      () => {
        // Permission denied or 4000ms timeout -> fallback cleanly to Demo Mode
        setDemoMode(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 4000,
        maximumAge: 2000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [demoMode, setCurrentBlock, setDemoMode]);

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden select-none">
      {/* Visually-Hidden Screen Reader Announcer (Pass 6 — 6A A11y Rule) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Full-Bleed 100vw x 100dvh 3D Clay Diorama Canvas */}
      <CampusWorldCanvas />

      {/* Centered 430px Max-Width Soft Diorama HUD & Sheet Layers */}
      <HomeExploreHUD />
      <WalkAndArrivalHUD />
      <BottomSheets />
      <AuthAndOnboardingModal />
    </main>
  );
};

export default App;
