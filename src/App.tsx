import React, { useEffect, useRef, useState } from 'react';
import {
  evaluateCampusLocation,
  isWithinCampusGeofence,
  smoothWorldPosition,
} from './location/locationEngine';
import { gpsToWorld, WorldXZ } from './navigation/projection';
import { PixelCampusWorld } from './pixel/PixelCampusWorld';
import { PixelCustomizationStudio } from './pixel/PixelCustomizationStudio';
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
  const uiMode = useCampusStore((s) => s.uiMode);
  const setUIMode = useCampusStore((s) => s.setUIMode);

  const smoothedGpsRef = useRef<WorldXZ | null>(null);

  // View Mode: 'pixel' (default for pixel-character-system branch) vs '3d'
  const [worldView, setWorldView] = useState<'pixel' | '3d'>('pixel');
  const [pixelStudioOpen, setPixelStudioOpen] = useState(false);

  // Open pixel studio when store requests onboarding avatar / studio
  useEffect(() => {
    if (uiMode === 'onboarding-avatar') {
      setPixelStudioOpen(true);
    }
  }, [uiMode]);

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
    <main className="relative h-[100dvh] w-screen overflow-hidden select-none bg-[#48A850]">
      {/* Visually-Hidden Screen Reader Announcer */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Campus World Renderers: 2D Pixel World (PixiJS) vs 3D Clay Diorama (Three.js) */}
      {worldView === 'pixel' ? (
        <PixelCampusWorld onOpenStudio={() => setPixelStudioOpen(true)} />
      ) : (
        <CampusWorldCanvas />
      )}

      {/* Top Floating View Mode Switcher */}
      <header className="fixed top-3 inset-x-0 z-30 mx-auto flex w-full max-w-[430px] justify-between items-center px-4 pointer-events-none">
        {/* Brand / Title Badge */}
        <div className="pointer-events-auto bg-[#FFFDF9]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#1D2440]/10 shadow-sm flex items-center gap-1.5">
          <span className="text-sm">🧭</span>
          <span className="font-bold text-xs text-[#1D2440] font-fredoka tracking-wide">
            CAMPUS WORLD
          </span>
        </div>

        {/* 2D Pixel / 3D Clay Mode Toggle Pill */}
        <div className="pointer-events-auto flex items-center bg-[#1D2440]/80 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-md">
          <button
            type="button"
            onClick={() => setWorldView('pixel')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              worldView === 'pixel'
                ? 'bg-[#5A4FE8] text-white shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <span>🎮</span>
            <span>2D Pixel</span>
          </button>
          <button
            type="button"
            onClick={() => setWorldView('3d')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              worldView === '3d'
                ? 'bg-[#5A4FE8] text-white shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <span>🏺</span>
            <span>3D Clay</span>
          </button>
        </div>
      </header>

      {/* Centered 430px Max-Width Soft Diorama HUD & Sheet Layers */}
      <HomeExploreHUD />
      <WalkAndArrivalHUD />
      <BottomSheets />
      <AuthAndOnboardingModal />

      {/* Dedicated Pixel Character & Pet Customization Studio */}
      <PixelCustomizationStudio
        isOpen={pixelStudioOpen}
        onClose={() => {
          setPixelStudioOpen(false);
          if (uiMode === 'onboarding-avatar') {
            setUIMode('explore');
          }
        }}
      />
    </main>
  );
};

export default App;
