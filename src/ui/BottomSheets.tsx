import Fuse from 'fuse.js';
import {
  Calendar,
  Check,
  ChevronRight,
  Compass,
  Footprints,
  MapPin,
  Navigation,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useMemo, useState } from 'react';
import { CAMPUS_PLACES, PlaceCategory, PLACES_BY_ID } from '../data/campusPlaces';
import { useCampusStore } from '../store/useCampusStore';

const CATEGORY_FILTERS: Array<{ id: 'all' | PlaceCategory; label: string; color: string }> = [
  { id: 'all', label: 'All (25)', color: '#5A4FE8' },
  { id: 'engineering', label: 'Engineering', color: '#BFE0FF' },
  { id: 'academic', label: 'Academic & Halls', color: '#C9BFFF' },
  { id: 'food', label: 'Canteens', color: '#FFE59A' },
  { id: 'admin', label: 'Gate & Admin', color: '#FFC9B0' },
];

/**
 * All Soft Diorama Bottom Sheets (Search, Destination Card, 5-Item Menu, Events,
 * Location Picker, and Settings).
 * Enforces Pass 4 Anti-Slop Rules:
 * - Flat proximity-grouped list rows with `1px solid rgba(29,36,64,0.07)` dividers (zero nested cards)
 * - Permanent visible form labels 4px above inputs
 * - Zero emoji icons (100% Lucide 2px stroke icons)
 */
export const BottomSheets: React.FC = () => {
  const activeSheet = useCampusStore((s) => s.activeSheet);
  const setActiveSheet = useCampusStore((s) => s.setActiveSheet);
  const currentBlockId = useCampusStore((s) => s.currentBlockId);
  const selectedPlaceId = useCampusStore((s) => s.selectedPlaceId);
  const activeRoute = useCampusStore((s) => s.activeRoute);
  const events = useCampusStore((s) => s.events);
  const demoMode = useCampusStore((s) => s.demoMode);
  const profile = useCampusStore((s) => s.profile);

  const selectDestination = useCampusStore((s) => s.selectDestination);
  const startWalk = useCampusStore((s) => s.startWalk);
  const setCurrentBlock = useCampusStore((s) => s.setCurrentBlock);
  const setDemoMode = useCampusStore((s) => s.setDemoMode);
  const setUIMode = useCampusStore((s) => s.setUIMode);
  const replayOnboarding = useCampusStore((s) => s.replayOnboarding);

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | PlaceCategory>('all');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeSheet !== 'none') {
        setActiveSheet('none');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeSheet, setActiveSheet]);

  const fuse = useMemo(
    () =>
      new Fuse(CAMPUS_PLACES, {
        keys: ['name', 'shortLabel', 'id', 'aliases', 'categoryLabel', 'description'],
        threshold: 0.34,
      }),
    []
  );

  const filteredPlaces = useMemo(() => {
    const base =
      query.trim().length > 0
        ? fuse.search(query.trim()).map((r) => r.item)
        : CAMPUS_PLACES;
    if (categoryFilter === 'all') return base;
    return base.filter((p) => p.category === categoryFilter);
  }, [fuse, query, categoryFilter]);

  const selectedPlace = selectedPlaceId ? PLACES_BY_ID[selectedPlaceId] : null;
  const currentPlace = PLACES_BY_ID[currentBlockId] ?? PLACES_BY_ID['GATE'];
  const matchingEvents = selectedPlace
    ? events.filter((e) => e.placeId === selectedPlace.id)
    : [];

  return (
    <AnimatePresence>
      {activeSheet !== 'none' && (
        <div className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-end">
          {/* Subtle scrim for modal sheets (non-blurred per Section 6.2) */}
          {activeSheet !== 'destination' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveSheet('none')}
              className="pointer-events-auto fixed inset-0 bg-[#1D2440]/20"
            />
          )}

          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Campus ${activeSheet} sheet`}
            style={{ overscrollBehavior: 'contain' }}
            className="pointer-events-auto relative z-10 mx-auto w-full max-w-[430px] max-h-[82dvh] overflow-y-auto rounded-t-[28px] bg-[#FFFDF9] px-5 pb-6 pt-3.5 shadow-sheet border-t border-[#1D2440]/10"
          >
            {/* Drag Handle Pill */}
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#1D2440]/15" />

        {/* 1. DESTINATION FLY-TO CARD */}
        {activeSheet === 'destination' && selectedPlace && (
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F1EA] px-2.5 py-0.5 text-xs font-semibold text-[#525B7A]">
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-[#1D2440]/15"
                    style={{ backgroundColor: selectedPlace.roofColor }}
                  />
                  <span>{selectedPlace.categoryLabel}</span>
                </div>
                <h2 className="mt-1.5 font-display text-2xl font-bold text-[#1D2440]">
                  {selectedPlace.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveSheet('none')}
                aria-label="Close destination card"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F1EA] text-[#525B7A] hover:text-[#1D2440]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-1 text-sm text-[#525B7A]">{selectedPlace.description}</p>

            {/* Route distance & walking time summary */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDE9FE] px-3 py-1 text-xs font-bold text-[#5A4FE8]">
                <Navigation className="h-3.5 w-3.5" />
                {activeRoute?.totalDistanceM ?? 0} m from {currentPlace.shortLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F1EA] px-3 py-1 text-xs font-semibold text-[#1D2440]">
                <Footprints className="h-3.5 w-3.5 text-[#5A4FE8]" />
                ~{activeRoute?.estimatedMinutes ?? 1} min walk ({activeRoute?.estimatedSteps ?? 15}{' '}
                steps)
              </span>
            </div>

            {/* Event happening at this block (if any) */}
            {matchingEvents.length > 0 && (
              <div className="mt-3 border-t border-[#1D2440]/[0.07] pt-3">
                {matchingEvents.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-2.5">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#FF7E6B]" />
                    <div>
                      <div className="font-display text-xs font-bold text-[#1D2440]">
                        {ev.title}{' '}
                        <span className="text-[#525B7A] font-normal">· {ev.timeLabel}</span>
                      </div>
                      <div className="text-xs text-[#525B7A]">{ev.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Primary Action: Let's Go */}
            <div className="mt-4 flex items-center gap-2.5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => startWalk(selectedPlace.id)}
                className="flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-full bg-[#5A4FE8] px-6 py-3 font-display text-base font-semibold text-white shadow-cta"
              >
                <Navigation className="h-4 w-4" />
                <span>
                  {selectedPlace.id === currentBlockId
                    ? "You're Here — Celebrate!"
                    : `Let's Go with ${profile.petName}`}
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setCurrentBlock(selectedPlace.id, 'manual')}
                title="Teleport here (I'm at this block)"
                className="rounded-full bg-[#F4F1EA] px-4 py-3 font-display text-xs font-semibold text-[#1D2440] hover:bg-[#EDE9FE]"
              >
                I&apos;m Here
              </motion.button>
            </div>
          </div>
        )}

        {/* 2. SEARCH & AUTOCOMPLETE SHEET (Top-Pinned Input + Flat Divided Rows) */}
        {activeSheet === 'search' && (
          <div>
            <div className="sticky top-0 z-10 bg-[#FFFDF9] pb-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="campus-search-input"
                  className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#525B7A]"
                >
                  Find a Campus Block, Lab, or Canteen
                </label>
                <button
                  type="button"
                  onClick={() => setActiveSheet('none')}
                  aria-label="Close search"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F1EA] text-[#525B7A]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#5A4FE8]" />
                <input
                  id="campus-search-input"
                  type="search"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Library, CSE, ME, Canteen, Temple…"
                  className="w-full rounded-2xl border border-[#1D2440]/15 bg-[#F4F1EA] py-3 pl-10 pr-4 text-sm font-semibold text-[#1D2440] placeholder:text-[#6E7794] focus:border-[#5A4FE8] focus:bg-[#FFFDF9] focus:outline-none"
                />
              </div>

              {/* Category Filter Chips (Law of Similarity roof pastel dots) */}
              <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1">
                {CATEGORY_FILTERS.map((cat) => {
                  const active = categoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-[#5A4FE8] text-white'
                          : 'bg-[#F4F1EA] text-[#1D2440] hover:bg-[#EDE9FE]'
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full border border-[#1D2440]/20"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flat Proximity-Grouped Result Rows with 1px Single-Edge Dividers */}
            <div className="mt-1 divide-y divide-[#1D2440]/[0.07]">
              {filteredPlaces.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#525B7A]">
                  No blocks match &ldquo;{query}&rdquo;. Try searching{' '}
                  <button
                    type="button"
                    onClick={() => setQuery('Library')}
                    className="font-semibold text-[#5A4FE8] underline"
                  >
                    Library
                  </button>{' '}
                  or{' '}
                  <button
                    type="button"
                    onClick={() => setQuery('CSE')}
                    className="font-semibold text-[#5A4FE8] underline"
                  >
                    CSE
                  </button>
                  .
                </div>
              ) : (
                filteredPlaces.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => selectDestination(place.id)}
                    className="flex w-full items-center justify-between py-3 text-left transition-colors hover:bg-[#F4F1EA]/60 px-1 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full border border-[#1D2440]/20"
                        style={{ backgroundColor: place.roofColor }}
                      />
                      <div className="min-w-0">
                        <div className="truncate font-display text-sm font-bold text-[#1D2440]">
                          {place.name}
                        </div>
                        <div className="truncate text-xs text-[#525B7A]">
                          {place.categoryLabel} · {place.aliases.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#6E7794]" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* 3. MENU SHEET (Strictly the 5 Items from Section 7.2) */}
        {activeSheet === 'menu' && (
          <div>
            <div className="flex items-center justify-between pb-2">
              <div>
                <h2 className="font-display text-xl font-bold text-[#1D2440]">
                  Campus World Menu
                </h2>
                <p className="text-xs text-[#525B7A]">
                  Exploring as {profile.displayName} &amp; {profile.petName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSheet('none')}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F1EA] text-[#525B7A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-1 divide-y divide-[#1D2440]/[0.07]">
              {[
                {
                  id: 'navigate',
                  label: 'Navigate',
                  sub: 'Search all 25 campus blocks & calculate A* routes',
                  icon: Navigation,
                  onClick: () => setActiveSheet('search'),
                },
                {
                  id: 'events',
                  label: 'Events',
                  sub: `${events.length} campus happenings today & tomorrow`,
                  icon: Calendar,
                  onClick: () => setActiveSheet('events'),
                },
                {
                  id: 'explore',
                  label: 'Explore (Set Starting Block)',
                  sub: `Currently near ${currentPlace.name}`,
                  icon: Compass,
                  onClick: () => setActiveSheet('location-picker'),
                },
                {
                  id: 'character',
                  label: 'My Character & Pet',
                  sub: `Customize ${profile.displayName} & ${profile.petName}`,
                  icon: User,
                  onClick: () => {
                    setActiveSheet('none');
                    setUIMode('onboarding-avatar');
                  },
                },
                {
                  id: 'settings',
                  label: 'Settings & Demo Mode',
                  sub: demoMode
                    ? 'Demo Simulator active · Replay onboarding'
                    : 'Live GPS active · Replay onboarding',
                  icon: Settings,
                  onClick: () => setActiveSheet('settings'),
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.onClick}
                    className="flex w-full items-center justify-between py-3.5 text-left hover:bg-[#F4F1EA]/60 px-1 rounded-lg"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#5A4FE8]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="font-display text-sm font-bold text-[#1D2440]">
                          {item.label}
                        </div>
                        <div className="text-xs text-[#525B7A]">{item.sub}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#6E7794]" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. EVENTS SHEET (5 Seeded Campus Events with "Take me here" routing) */}
        {activeSheet === 'events' && (
          <div>
            <div className="flex items-center justify-between pb-2">
              <div>
                <h2 className="font-display text-xl font-bold text-[#1D2440]">
                  Happening on Campus
                </h2>
                <p className="text-xs text-[#525B7A]">
                  Tap any event to fly to its building or walk right there.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSheet('none')}
                aria-label="Close events"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F1EA] text-[#525B7A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-1 divide-y divide-[#1D2440]/[0.07]">
              {events.map((ev) => {
                const place = PLACES_BY_ID[ev.placeId];
                return (
                  <div key={ev.id} className="py-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EDE9FE] px-2.5 py-0.5 text-[11px] font-bold text-[#5A4FE8]">
                        {ev.isLiveNow && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF7E6B]" />
                        )}
                        {ev.tag} · {place?.shortLabel ?? ev.placeId}
                      </span>
                      <span className="text-xs font-medium text-[#525B7A]">
                        {ev.timeLabel}
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-base font-bold text-[#1D2440]">
                      {ev.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#525B7A]">{ev.description}</p>
                    <div className="mt-2.5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => selectDestination(ev.placeId)}
                        className="rounded-full bg-[#F4F1EA] px-3.5 py-1.5 font-display text-xs font-semibold text-[#1D2440]"
                      >
                        Preview on Map
                      </button>
                      <button
                        type="button"
                        onClick={() => startWalk(ev.placeId)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#5A4FE8] px-4 py-1.5 font-display text-xs font-semibold text-white"
                      >
                        <Navigation className="h-3 w-3" />
                        <span>Take me here</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. LOCATION PICKER SHEET ("I'm at: [Place]" 1-Tap Demo Teleporter) */}
        {activeSheet === 'location-picker' && (
          <div>
            <div className="flex items-center justify-between pb-2">
              <div>
                <h2 className="font-display text-xl font-bold text-[#1D2440]">
                  I&apos;m currently at…
                </h2>
                <p className="text-xs text-[#525B7A]">
                  Pick any block to teleport your character &amp; set your route origin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSheet('none')}
                aria-label="Close location picker"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F1EA] text-[#525B7A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-1 divide-y divide-[#1D2440]/[0.07]">
              {CAMPUS_PLACES.map((place) => {
                const isCurrent = place.id === currentBlockId;
                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => setCurrentBlock(place.id, 'manual')}
                    className="flex w-full items-center justify-between py-3 text-left hover:bg-[#F4F1EA]/60 px-1 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin
                        className={`h-4 w-4 ${
                          isCurrent ? 'text-[#5A4FE8]' : 'text-[#6E7794]'
                        }`}
                      />
                      <div>
                        <div className="font-display text-sm font-bold text-[#1D2440]">
                          {place.name}
                        </div>
                        <div className="text-xs text-[#525B7A]">{place.categoryLabel}</div>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EDE9FE] px-2.5 py-0.5 text-xs font-bold text-[#5A4FE8]">
                        <Check className="h-3.5 w-3.5" />
                        Here
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. SETTINGS & DEMO CONTROLS SHEET */}
        {activeSheet === 'settings' && (
          <div>
            <div className="flex items-center justify-between pb-2">
              <div>
                <h2 className="font-display text-xl font-bold text-[#1D2440]">
                  Settings &amp; Demo Controls
                </h2>
                <p className="text-xs text-[#525B7A]">
                  Configure indoor classroom presentation mode or replay onboarding.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSheet('none')}
                aria-label="Close settings"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F1EA] text-[#525B7A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 divide-y divide-[#1D2440]/[0.07]">
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <div className="font-display text-sm font-bold text-[#1D2440]">
                    Demo Mode (Simulated Walk &amp; Pacing Pill)
                  </div>
                  <div className="text-xs text-[#525B7A]">
                    Enables [Pause · 1× · 4×] walk controls and manual &ldquo;I&apos;m at&rdquo; teleporting
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={demoMode}
                  onClick={() => setDemoMode(!demoMode)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    demoMode ? 'bg-[#5A4FE8]' : 'bg-[#1D2440]/20'
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                      demoMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="py-3.5">
                <div className="font-display text-sm font-bold text-[#1D2440]">
                  5-Minute Graded Presentation Reset
                </div>
                <p className="mt-0.5 text-xs text-[#525B7A]">
                  Replays Beat #1 (Email + OTP eye-cover/peek login) and Beat #2 (Character &amp; Pet Studio).
                </p>
                <button
                  type="button"
                  onClick={() => replayOnboarding()}
                  className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-[#EDE9FE] px-4 py-2 font-display text-xs font-bold text-[#5A4FE8]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Replay Onboarding &amp; Login</span>
                </button>
              </div>
            </div>
          </div>
        )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
