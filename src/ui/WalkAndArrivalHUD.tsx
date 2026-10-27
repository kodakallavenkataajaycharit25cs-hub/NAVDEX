import confetti from 'canvas-confetti';
import {
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  FastForward,
  Flag,
  Footprints,
  Gauge,
  Navigation,
  PartyPopper,
  Pause,
  Play,
  Square,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect } from 'react';
import { PLACES_BY_ID } from '../data/campusPlaces';
import { DemoSpeed, useCampusStore } from '../store/useCampusStore';

/**
 * Walk Mode HUD & Arrival Celebration Card (Section 7.2 & Pass 3 — 3A):
 * - Walk Mode shows: Landmark turn card, two stat chips (Speed, Est. Steps), ETA pill, Stop button,
 *   and the compact Demo Mode Pacing Pill (`[Pause (Pet Sits) · 1× · 4×]`).
 * - Arrived Mode triggers confetti and celebrates with the user & pet.
 */
export const WalkAndArrivalHUD: React.FC = () => {
  const uiMode = useCampusStore((s) => s.uiMode);
  const profile = useCampusStore((s) => s.profile);
  const selectedPlaceId = useCampusStore((s) => s.selectedPlaceId);
  const activeRoute = useCampusStore((s) => s.activeRoute);
  const demoMode = useCampusStore((s) => s.demoMode);
  const demoSpeed = useCampusStore((s) => s.demoSpeed);
  const walkProgressM = useCampusStore((s) => s.walkProgressM);
  const currentDirectionIndex = useCampusStore((s) => s.currentDirectionIndex);
  const setDemoSpeed = useCampusStore((s) => s.setDemoSpeed);
  const stopWalk = useCampusStore((s) => s.stopWalk);
  const setActiveSheet = useCampusStore((s) => s.setActiveSheet);

  useEffect(() => {
    if (uiMode === 'arrived') {
      try {
        confetti({
          particleCount: 55,
          spread: 68,
          origin: { y: 0.65 },
          colors: ['#5A4FE8', '#FF7E6B', '#FFE59A', '#7CC98B'],
        });
      } catch {
        // Ignore confetti errors in headless test environments
      }
    }
  }, [uiMode]);

  if (uiMode !== 'walk' && uiMode !== 'arrived') {
    return null;
  }

  const destPlace = selectedPlaceId ? PLACES_BY_ID[selectedPlaceId] : null;

  if (uiMode === 'arrived') {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[430px] flex-col justify-end p-4">
        <motion.div
          role="dialog"
          aria-label="Destination arrival celebration"
          initial={{ opacity: 0, y: 40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className="pointer-events-auto rounded-[28px] bg-[#FFFDF9] p-5 text-center shadow-sheet border border-[#1D2440]/10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1, damping: 14, stiffness: 260 }}
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#DCFCE7] text-[#166534]"
          >
            <PartyPopper className="h-6 w-6" />
          </motion.div>
          <h2 className="mt-3 font-display text-2xl font-bold text-[#1D2440]">
            You made it to {destPlace?.shortLabel ?? 'your destination'}!
          </h2>
          <p className="mt-1 text-sm text-[#525B7A]">
            {profile.petName} led you {activeRoute?.totalDistanceM ?? 0} m across campus.
          </p>
          <div className="mt-4 flex gap-2.5">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => stopWalk()}
              className="flex-1 rounded-full bg-[#F4F1EA] py-3 font-display text-sm font-semibold text-[#1D2440]"
            >
              Explore Here
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                stopWalk();
                setActiveSheet('search');
              }}
              className="flex-1 rounded-full bg-[#5A4FE8] py-3 font-display text-sm font-semibold text-white shadow-cta"
            >
              Next Destination
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // WALK MODE HUD
  const totalDist = activeRoute?.totalDistanceM ?? 100;
  const remainingM = Math.max(0, totalDist - walkProgressM);
  const remainingSteps = Math.max(5, Math.round(remainingM / 0.74));
  const remainingMin = Math.max(1, Math.ceil(remainingM / 80));
  const currentStep =
    activeRoute?.directions[currentDirectionIndex] ?? activeRoute?.directions[0];

  const TurnIcon =
    currentStep?.turnType === 'left'
      ? CornerUpLeft
      : currentStep?.turnType === 'right'
        ? CornerUpRight
        : currentStep?.turnType === 'arrive'
          ? Flag
          : ArrowUp;

  const speedLabel =
    demoSpeed === 0 ? '0.0 m/s (Sitting)' : demoSpeed === 4 ? '5.4 m/s (4×)' : '1.4 m/s';

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-[430px] flex-col justify-end px-4 pb-5">
      {/* Demo Mode Pacing Pill (Pass 3 — 3A: Pause / Pet Sits · 1x · 4x Fast-Forward) */}
      <AnimatePresence>
        {demoMode && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto mb-2.5 flex items-center justify-between rounded-full bg-[#FFFDF9] px-3 py-1.5 shadow-pill border border-[#1D2440]/10"
          >
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#525B7A]">
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
              Demo Walk Pacing
            </span>
            <div className="flex items-center gap-1">
              {(
                [
                  { speed: 0 as DemoSpeed, label: 'Pause (Sit)', icon: Pause },
                  { speed: 1 as DemoSpeed, label: '1× Walk', icon: Play },
                  { speed: 4 as DemoSpeed, label: '4× Fast', icon: FastForward },
                ] as const
              ).map((btn) => {
                const Icon = btn.icon;
                const active = demoSpeed === btn.speed;
                return (
                  <motion.button
                    key={btn.speed}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setDemoSpeed(btn.speed)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-[#5A4FE8] text-white'
                        : 'bg-[#F4F1EA] text-[#1D2440] hover:bg-[#EDE9FE]'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{btn.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Walk Card (Turn instruction + 2 Stat Chips + ETA Pill + Stop) */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="pointer-events-auto rounded-[26px] bg-[#FFFDF9] p-4 shadow-sheet border border-[#1D2440]/10"
      >
        {/* Landmark Turn Row */}
        <div className="flex items-center gap-3">
          <motion.div
            key={currentStep?.instruction ?? 'turn'}
            initial={{ scale: 0.85, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#5A4FE8]"
          >
            <TurnIcon className="h-5 w-5 stroke-[2.4]" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-base font-bold text-[#1D2440]">
              {currentStep?.instruction ?? `Follow ${profile.petName} to ${destPlace?.shortLabel}`}
            </div>
            <div className="text-xs font-medium text-[#525B7A]">
              {demoSpeed === 0
                ? `${profile.petName} is sitting and waiting for you`
                : `${remainingM} m left to ${destPlace?.name ?? 'destination'}`}
            </div>
          </div>
        </div>

        {/* Declutter Rule 7.2: Two Stat Chips (Speed, Est. Steps) + ETA Pill + Stop */}
        <div className="mt-3.5 flex items-center justify-between gap-2 pt-3 border-t border-[#1D2440]/[0.07]">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F4F1EA] px-2.5 py-1 text-xs font-semibold text-[#1D2440]">
              <Gauge className="h-3.5 w-3.5 text-[#5A4FE8]" />
              {speedLabel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F4F1EA] px-2.5 py-1 text-xs font-semibold text-[#1D2440]">
              <Footprints className="h-3.5 w-3.5 text-[#5A4FE8]" />
              ~{remainingSteps} steps
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#EDE9FE] px-2.5 py-1 text-xs font-bold text-[#5A4FE8]">
              <Navigation className="h-3 w-3" />
              {remainingMin} min
            </span>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => stopWalk()}
            aria-label="Stop walking navigation"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-3.5 py-1.5 font-display text-xs font-bold text-[#991B1B]"
          >
            <Square className="h-3 w-3 fill-current" />
            <span>Stop</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
