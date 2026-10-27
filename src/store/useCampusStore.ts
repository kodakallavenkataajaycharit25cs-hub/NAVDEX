import { create } from 'zustand';
import { PLACES_BY_ID } from '../data/campusPlaces';
import { CampusEvent, SEEDED_EVENTS } from '../data/campusEvents';
import { evaluateCampusLocation, LocationSource } from '../location/locationEngine';
import { findRoute, RouteResult } from '../navigation/astar';
import {
  safeLoadStorage,
  safeSaveStorage,
  sanitizeName,
  UserCharacterProfile,
} from './storage';
import { teleportCharacterInRef } from './worldMotionRef';

export type UIMode =
  | 'auth'
  | 'onboarding-avatar'
  | 'onboarding-pet'
  | 'explore'
  | 'walk'
  | 'arrived';

export type ActiveSheet =
  | 'none'
  | 'search'
  | 'destination'
  | 'menu'
  | 'events'
  | 'location-picker'
  | 'settings';

export type DemoSpeed = 0 | 1 | 4;

export interface CampusStoreState {
  uiMode: UIMode;
  activeSheet: ActiveSheet;
  profile: UserCharacterProfile;
  demoMode: boolean;
  locationSource: LocationSource;
  offCampusBanner: boolean;
  currentBlockId: string;
  clusterCandidates: string[];
  selectedPlaceId: string | null;
  activeEvent: CampusEvent | null;
  events: CampusEvent[];
  activeRoute: RouteResult | null;
  demoSpeed: DemoSpeed;
  walkProgressM: number;
  currentDirectionIndex: number;
  announcement: string;
  webglLost: boolean;

  // Actions
  setUIMode: (mode: UIMode) => void;
  setActiveSheet: (sheet: ActiveSheet) => void;
  updateProfile: (partial: Partial<UserCharacterProfile>) => void;
  setCurrentBlock: (blockId: string, source?: LocationSource) => void;
  selectDestination: (placeId: string) => void;
  startWalk: (destPlaceId?: string) => void;
  stopWalk: () => void;
  setDemoSpeed: (speed: DemoSpeed) => void;
  syncWalkProgressFromFrame: (distM: number, currentBlockId: string) => void;
  triggerArrival: () => void;
  setDemoMode: (enabled: boolean) => void;
  openEventDetail: (event: CampusEvent) => void;
  replayOnboarding: () => void;
  openCharacterStudio: () => void;
  setWebglLost: (lost: boolean) => void;
}

const persisted = safeLoadStorage();
const initialBlock = PLACES_BY_ID[persisted.lastBlockId] ? persisted.lastBlockId : 'GATE';
const initialPlace = PLACES_BY_ID[initialBlock];
const initialSnap = evaluateCampusLocation(initialPlace.worldPos);

teleportCharacterInRef(
  initialPlace.entranceVisualPos.x,
  initialPlace.entranceVisualPos.z,
  0
);

export const useCampusStore = create<CampusStoreState>((set, get) => ({
  uiMode: persisted.profile.onboardingComplete ? 'explore' : 'auth',
  activeSheet: 'none',
  profile: persisted.profile,
  demoMode: persisted.demoMode,
  locationSource: persisted.demoMode ? 'manual' : 'gps',
  offCampusBanner: false,
  currentBlockId: initialSnap.nearestBlockId,
  clusterCandidates: initialSnap.clusterCandidates,
  selectedPlaceId: null,
  activeEvent: SEEDED_EVENTS[0],
  events: SEEDED_EVENTS,
  activeRoute: null,
  demoSpeed: 1,
  walkProgressM: 0,
  currentDirectionIndex: 0,
  announcement: `Welcome to Campus World. Currently near ${initialPlace.name}.`,
  webglLost: false,

  setUIMode: (mode) => set({ uiMode: mode }),

  setActiveSheet: (sheet) => set({ activeSheet: sheet }),

  updateProfile: (partial) => {
    const current = get().profile;
    const updated: UserCharacterProfile = {
      ...current,
      ...partial,
      displayName:
        partial.displayName !== undefined
          ? sanitizeName(partial.displayName, current.displayName)
          : current.displayName,
      petName:
        partial.petName !== undefined
          ? sanitizeName(partial.petName, current.petName)
          : current.petName,
    };
    set({ profile: updated });
    safeSaveStorage({
      version: 'navdex_v1',
      profile: updated,
      lastBlockId: get().currentBlockId,
      demoMode: get().demoMode,
    });
  },

  setCurrentBlock: (blockId, source = 'manual') => {
    const place = PLACES_BY_ID[blockId];
    if (!place) return;
    const snap = evaluateCampusLocation(place.worldPos);
    teleportCharacterInRef(
      place.entranceVisualPos.x,
      place.entranceVisualPos.z,
      0
    );

    const selected = get().selectedPlaceId;
    const updatedRoute = selected ? findRoute(blockId, selected) : null;

    set({
      currentBlockId: blockId,
      clusterCandidates: snap.clusterCandidates,
      locationSource: source,
      activeRoute: updatedRoute && updatedRoute.ok ? updatedRoute : null,
      activeSheet: get().activeSheet === 'location-picker' ? 'none' : get().activeSheet,
      announcement: `Location set to ${place.name}.`,
    });

    safeSaveStorage({
      version: 'navdex_v1',
      profile: get().profile,
      lastBlockId: blockId,
      demoMode: get().demoMode,
    });
  },

  selectDestination: (placeId) => {
    const place = PLACES_BY_ID[placeId];
    if (!place) return;
    const startId = get().currentBlockId;
    const route = findRoute(startId, placeId);

    set({
      selectedPlaceId: placeId,
      activeRoute: route.ok ? route : null,
      activeSheet: 'destination',
      uiMode: 'explore',
      announcement: `Showing ${place.name}. ${route.totalDistanceM} metres, about ${route.estimatedMinutes} minute walk.`,
    });
  },

  startWalk: (destPlaceId) => {
    const targetId = destPlaceId ?? get().selectedPlaceId;
    if (!targetId) return;
    const startId = get().currentBlockId;
    const route = findRoute(startId, targetId);
    if (!route.ok) return;

    if (startId === targetId || route.totalDistanceM === 0) {
      set({
        selectedPlaceId: targetId,
        activeRoute: route,
        uiMode: 'arrived',
        activeSheet: 'none',
        announcement: `You have arrived at ${PLACES_BY_ID[targetId]?.name ?? targetId}!`,
      });
      return;
    }

    const firstPt = route.pawTrailPoints[0];
    if (firstPt) {
      teleportCharacterInRef(firstPt.x, firstPt.z, firstPt.heading);
    }

    set({
      selectedPlaceId: targetId,
      activeRoute: route,
      uiMode: 'walk',
      activeSheet: 'none',
      demoSpeed: 1,
      walkProgressM: 0,
      currentDirectionIndex: 0,
      announcement: `Started walking to ${PLACES_BY_ID[targetId]?.name ?? targetId}. Follow ${get().profile.petName}!`,
    });
  },

  stopWalk: () => {
    const currPlace = PLACES_BY_ID[get().currentBlockId];
    if (currPlace) {
      teleportCharacterInRef(
        currPlace.entranceVisualPos.x,
        currPlace.entranceVisualPos.z,
        0
      );
    }
    set({
      uiMode: 'explore',
      activeSheet: 'none',
      demoSpeed: 1,
      walkProgressM: 0,
      announcement: 'Walk stopped. Back to explore view.',
    });
  },

  setDemoSpeed: (speed) => {
    set({
      demoSpeed: speed,
      announcement:
        speed === 0
          ? `Walk paused. ${get().profile.petName} is sitting and waiting.`
          : `Walk speed set to ${speed}x.`,
    });
  },

  syncWalkProgressFromFrame: (distM, nearestId) => {
    const route = get().activeRoute;
    if (!route) return;
    const total = Math.max(1, route.totalDistanceM);
    const ratio = Math.min(1, distM / total);
    const dirIdx = Math.min(
      route.directions.length - 1,
      Math.floor(ratio * route.directions.length)
    );
    const snap = evaluateCampusLocation(PLACES_BY_ID[nearestId]?.worldPos ?? { x: 0, z: 0 });
    set({
      walkProgressM: Math.round(distM),
      currentBlockId: nearestId,
      clusterCandidates: snap.clusterCandidates,
      currentDirectionIndex: dirIdx,
    });
  },

  triggerArrival: () => {
    const destId = get().selectedPlaceId ?? get().currentBlockId;
    const destPlace = PLACES_BY_ID[destId];
    if (destPlace) {
      teleportCharacterInRef(
        destPlace.entranceVisualPos.x,
        destPlace.entranceVisualPos.z,
        0
      );
    }
    set({
      uiMode: 'arrived',
      activeSheet: 'none',
      currentBlockId: destId,
      walkProgressM: get().activeRoute?.totalDistanceM ?? 0,
      announcement: `You and ${get().profile.petName} made it to ${destPlace?.name ?? destId}!`,
    });
  },

  setDemoMode: (enabled) => {
    set({
      demoMode: enabled,
      locationSource: enabled ? 'manual' : 'gps',
    });
    safeSaveStorage({
      version: 'navdex_v1',
      profile: get().profile,
      lastBlockId: get().currentBlockId,
      demoMode: enabled,
    });
  },

  openEventDetail: (event) => {
    const route = findRoute(get().currentBlockId, event.placeId);
    set({
      activeEvent: event,
      selectedPlaceId: event.placeId,
      activeRoute: route.ok ? route : null,
      activeSheet: 'destination',
      announcement: `Event ${event.title} at ${PLACES_BY_ID[event.placeId]?.name ?? event.placeId}.`,
    });
  },

  replayOnboarding: () => {
    set({
      uiMode: 'auth',
      activeSheet: 'none',
      selectedPlaceId: null,
      announcement: 'Replaying welcome and onboarding flow.',
    });
  },

  openCharacterStudio: () => {
    set({
      uiMode: 'onboarding-avatar',
      activeSheet: 'none',
      selectedPlaceId: null,
      announcement: 'Opened live 3D Character and Pet Studio.',
    });
  },

  setWebglLost: (lost) => set({ webglLost: lost }),
}));
