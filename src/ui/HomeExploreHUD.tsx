import { ChevronDown, MapPin, Menu, PawPrint, Search } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { PLACES_BY_ID } from '../data/campusPlaces';
import { useCampusStore } from '../store/useCampusStore';

/**
 * Home Explore HUD with Motion Physics (https://motion.dev/docs)
 * - Spring entrance and tactile gesture feedback on search pill, menu orb, and studio launcher
 * - Clean 2-Row Thumb Zone Dock (≤ 148px total height)
 */
export const HomeExploreHUD: React.FC = () => {
  const uiMode = useCampusStore((s) => s.uiMode);
  const activeSheet = useCampusStore((s) => s.activeSheet);
  const profile = useCampusStore((s) => s.profile);
  const currentBlockId = useCampusStore((s) => s.currentBlockId);
  const clusterCandidates = useCampusStore((s) => s.clusterCandidates);
  const demoMode = useCampusStore((s) => s.demoMode);
  const setActiveSheet = useCampusStore((s) => s.setActiveSheet);
  const setCurrentBlock = useCampusStore((s) => s.setCurrentBlock);
  const openCharacterStudio = useCampusStore((s) => s.openCharacterStudio);

  if (uiMode !== 'explore' || activeSheet !== 'none') {
    return null;
  }

  const currentPlace = PLACES_BY_ID[currentBlockId] ?? PLACES_BY_ID['GATE'];

  return (
    <motion.div
      initial={{ y: 36, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 36, opacity: 0 }}
      transition={{ type: 'spring', damping: 24, stiffness: 320 }}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-[430px] flex-col justify-end px-4 pb-4 pt-2"
    >
      {/* Unified Companion Greeting + Location Picker + 1-Tap Avatar/Pet Studio Card */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="pointer-events-auto mb-2.5 rounded-[22px] bg-[#FFFDF9] px-3.5 py-2.5 shadow-pill border border-[#1D2440]/10"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-display text-sm font-bold text-[#1D2440]">
              Hi {profile.displayName}! {profile.petName} is right beside you.
            </div>
            <button
              type="button"
              onClick={() => setActiveSheet('location-picker')}
              aria-label={`Current location: Near ${currentPlace.name}. Tap to change starting block`}
              className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#F4F1EA] px-2.5 py-0.5 text-xs font-semibold text-[#525B7A] hover:bg-[#EDE9FE] hover:text-[#5A4FE8] transition-colors"
            >
              {demoMode && (
                <span
                  className="h-2 w-2 rounded-full bg-[#F59E0B]"
                  title="Demo Mode Active"
                />
              )}
              <MapPin className="h-3 w-3 text-[#5A4FE8]" />
              <span>Near {currentPlace.shortLabel}</span>
              <span className="font-bold text-[#5A4FE8]">· Change</span>
              <ChevronDown className="h-3 w-3 text-[#5A4FE8]" />
            </button>
          </div>

          {/* 1-Tap Character & Pet Customizer Studio Button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03 }}
            type="button"
            onClick={() => openCharacterStudio()}
            aria-label="Customize 3D character and pet companion"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-[#EDE9FE] px-3 py-2 font-display text-xs font-bold text-[#5A4FE8] hover:bg-[#5A4FE8] hover:text-white transition-colors"
          >
            <PawPrint className="h-3.5 w-3.5" />
            <span>Style Avatar &amp; Pet</span>
          </motion.button>
        </div>

        {/* Inline Dense Cluster Disambiguation Pills (only when inside <15m cluster) */}
        {clusterCandidates.length >= 2 && (
          <div className="mt-2 flex items-center gap-1.5 overflow-x-auto border-t border-[#1D2440]/[0.07] pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E7794] shrink-0">
              Cluster:
            </span>
            {clusterCandidates.map((id) => {
              const p = PLACES_BY_ID[id];
              if (!p) return null;
              const active = id === currentBlockId;
              return (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  key={id}
                  type="button"
                  onClick={() => setCurrentBlock(id, 'manual')}
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                    active
                      ? 'bg-[#5A4FE8] text-white'
                      : 'bg-[#F4F1EA] text-[#1D2440] hover:bg-[#EDE9FE]'
                  }`}
                >
                  {p.shortLabel}
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Bottom Thumb-Zone Dock: 52px Search Pill + 52px Menu Orb */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', damping: 20, stiffness: 350 }}
          type="button"
          onClick={() => setActiveSheet('search')}
          aria-label="Search campus blocks, canteens, or labs"
          className="flex h-[52px] flex-1 items-center gap-3 rounded-full bg-[#FFFDF9] px-4 text-left shadow-pill border border-[#1D2440]/10"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-[#5A4FE8]">
            <Search className="h-4 w-4 stroke-[2.2]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-sm font-semibold text-[#1D2440]">
              Where to on campus?
            </div>
            <div className="truncate text-xs text-[#6E7794]">
              Try Library, CSE, Canteen 1, Auditorium…
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.06, rotate: 6 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', damping: 18, stiffness: 400 }}
          type="button"
          onClick={() => setActiveSheet('menu')}
          aria-label="Open campus menu"
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#FFFDF9] text-[#1D2440] shadow-pill border border-[#1D2440]/10 hover:text-[#5A4FE8]"
        >
          <Menu className="h-5 w-5 stroke-[2.2]" />
        </motion.button>
      </div>
    </motion.div>
  );
};
