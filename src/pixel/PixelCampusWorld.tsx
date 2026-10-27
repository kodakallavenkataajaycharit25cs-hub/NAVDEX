import confetti from 'canvas-confetti';
import {
  Compass,
  Footprints,
  Maximize2,
  Navigation,
  Sparkles,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Application, Container, Graphics, Sprite, Texture } from 'pixi.js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PLACES_BY_ID } from '../data/campusPlaces';
import { useCampusStore } from '../store/useCampusStore';
import { PixelPetGenerator } from './pixelPetGenerator';
import { PixelSpriteGenerator } from './pixelSpriteGenerator';
import {
  PIXEL_BUILDINGS,
  PixelTilemapRenderer,
  TILE_SIZE,
  worldToTile,
} from './pixelTilemap';
import {
  PixelAnimState,
  PixelCharacterConfig,
  PixelDirection,
  PixelPetState,
  profileToPixelConfig,
} from './types';

export interface PixelCampusWorldProps {
  onOpenStudio?: () => void;
}

export const PixelCampusWorld: React.FC<PixelCampusWorldProps> = ({ onOpenStudio }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const worldContainerRef = useRef<Container | null>(null);
  const pathGraphicsRef = useRef<Graphics | null>(null);

  // Store state
  const profile = useCampusStore((s) => s.profile);
  const uiMode = useCampusStore((s) => s.uiMode);
  const currentBlockId = useCampusStore((s) => s.currentBlockId);
  const selectedPlaceId = useCampusStore((s) => s.selectedPlaceId);
  const activeRoute = useCampusStore((s) => s.activeRoute);
  const demoSpeed = useCampusStore((s) => s.demoSpeed);
  const selectDestination = useCampusStore((s) => s.selectDestination);
  const startWalk = useCampusStore((s) => s.startWalk);
  const triggerArrival = useCampusStore((s) => s.triggerArrival);
  const syncWalkProgress = useCampusStore((s) => s.syncWalkProgressFromFrame);

  // Character & Pet configs
  const charConfigRef = useRef<PixelCharacterConfig>(profileToPixelConfig(profile));
  useEffect(() => {
    charConfigRef.current = profileToPixelConfig(profile);
  }, [profile]);

  // Motion & Animation state refs (60fps without React re-render)
  const initialPlace = PLACES_BY_ID[currentBlockId] || PLACES_BY_ID['GATE'];
  const initTile = worldToTile(initialPlace.entranceVisualPos.x, initialPlace.entranceVisualPos.z);

  const playerPosRef = useRef({ x: initTile.px, y: initTile.py });
  const playerDirRef = useRef<PixelDirection>('down');
  const playerAnimRef = useRef<PixelAnimState>('idle');
  const playerFrameRef = useRef(0);

  const petPosRef = useRef({ x: initTile.px - 14, y: initTile.py + 4 });
  const petDirRef = useRef<PixelDirection>('down');
  const petAnimRef = useRef<PixelPetState>('idle');
  const petFrameRef = useRef(0);

  // Breadcrumbs history ring for pet organic lag
  const breadcrumbsRef = useRef<Array<{ x: number; y: number }>>([
    { x: initTile.px - 6, y: initTile.py },
    { x: initTile.px - 12, y: initTile.py + 2 },
  ]);

  // Camera state
  const cameraRef = useRef({
    x: initTile.px,
    y: initTile.py,
    targetX: initTile.px,
    targetY: initTile.py,
    zoom: 2.2,
  });

  // Navigation waypoint index
  const waypointIdxRef = useRef(0);

  // UI / Controls state
  const [zoomLevel, setZoomLevel] = useState(2.2);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Trigger celebration confetti when arrived
  useEffect(() => {
    if (uiMode === 'arrived') {
      playerAnimRef.current = 'celebrate';
      petAnimRef.current = 'celebrate';
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#5A4FE8', '#80FFDB', '#F59E0B', '#EC4899'],
      });
    }
  }, [uiMode]);

  // Smooth camera pan when selecting a place or block
  useEffect(() => {
    const targetId = selectedPlaceId || currentBlockId;
    const place = PLACES_BY_ID[targetId];
    if (place) {
      const tile = worldToTile(place.entranceVisualPos.x, place.entranceVisualPos.z);
      cameraRef.current.targetX = tile.px;
      cameraRef.current.targetY = tile.py;
    }
  }, [selectedPlaceId, currentBlockId]);

  // Teleport player when changing current block in explore mode
  useEffect(() => {
    if (uiMode !== 'walk') {
      const place = PLACES_BY_ID[currentBlockId];
      if (place) {
        const tile = worldToTile(place.entranceVisualPos.x, place.entranceVisualPos.z);
        playerPosRef.current = { x: tile.px, y: tile.py };
        cameraRef.current.x = tile.px;
        cameraRef.current.y = tile.py;
        cameraRef.current.targetX = tile.px;
        cameraRef.current.targetY = tile.py;
      }
    }
  }, [currentBlockId, uiMode]);

  // Reset walk waypoints when starting a walk
  useEffect(() => {
    if (uiMode === 'walk') {
      waypointIdxRef.current = 0;
      playerAnimRef.current = 'walk';
      petAnimRef.current = 'walk';
    }
  }, [uiMode, activeRoute]);

  // Mount PixiJS Application
  useEffect(() => {
    let isCancelled = false;
    const container = containerRef.current;
    if (!container) return;

    const app = new Application();
    appRef.current = app;

    (async () => {
      await app.init({
        resizeTo: container,
        backgroundColor: '#48A850',
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        antialias: false,
        roundPixels: true,
      });

      if (isCancelled) {
        app.destroy(true);
        return;
      }

      container.appendChild(app.canvas);

      // World Container holds all game objects and transforms with Camera
      const world = new Container();
      worldContainerRef.current = world;
      app.stage.addChild(world);

      // 1. Tilemap Layer
      const mapCanvas = PixelTilemapRenderer.getMapCanvas();
      const mapTexture = Texture.from(mapCanvas);
      mapTexture.source.scaleMode = 'nearest';
      const mapSprite = new Sprite(mapTexture);
      world.addChild(mapSprite);

      // 2. Active Route & Paw Trail Layer
      const pathGraphics = new Graphics();
      pathGraphicsRef.current = pathGraphics;
      world.addChild(pathGraphics);

      // 3. Pet Sprite
      const petCanvas = PixelPetGenerator.renderPetFrame('dog', 'down', 'idle', 0);
      const petTexture = Texture.from(petCanvas);
      petTexture.source.scaleMode = 'nearest';
      const petSprite = new Sprite(petTexture);
      petSprite.anchor.set(0.5, 0.85);
      world.addChild(petSprite);

      // 4. Player Sprite
      const playerCanvas = PixelSpriteGenerator.renderFrame(
        charConfigRef.current,
        'down',
        'idle',
        0
      );
      const playerTexture = Texture.from(playerCanvas);
      playerTexture.source.scaleMode = 'nearest';
      const playerSprite = new Sprite(playerTexture);
      playerSprite.anchor.set(0.5, 0.9);
      world.addChild(playerSprite);

      // Interactive Click on Tilemap / Buildings
      mapSprite.eventMode = 'static';
      mapSprite.on('pointerdown', (e) => {
        const localPos = e.getLocalPosition(world);
        // Check if clicked near a building
        for (const b of PIXEL_BUILDINGS) {
          const bTile = worldToTile(b.worldX, b.worldZ);
          const dist = Math.hypot(localPos.x - bTile.px, localPos.y - bTile.py);
          if (dist < 40) {
            selectDestination(b.id);
            return;
          }
        }
      });

      // Animation tick counters
      let animTick = 0;
      let lastTime = performance.now();

      // Main 60 FPS Game Loop
      app.ticker.add(() => {
        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;
        animTick += dt;

        // Advance animation frames every 120ms
        if (animTick >= 0.12) {
          animTick = 0;
          playerFrameRef.current = (playerFrameRef.current + 1) % 4;
          petFrameRef.current = (petFrameRef.current + 1) % 4;
        }

        // ==========================================
        // 1. MOVEMENT & NAVIGATION LOGIC
        // ==========================================
        const currentUIMode = useCampusStore.getState().uiMode;
        const currentSpeed = useCampusStore.getState().demoSpeed;
        const route = useCampusStore.getState().activeRoute;

        let isWalking = false;

        if (currentUIMode === 'walk' && route && currentSpeed > 0) {
          // Autonomous Navigation Walk following A* waypoints
          isWalking = true;
          playerAnimRef.current = 'walk';
          petAnimRef.current = currentSpeed >= 4 ? 'run' : 'walk';

          const waypoints = route.pawTrailPoints;
          const currentWaypoint = waypoints[waypointIdxRef.current];

          if (currentWaypoint) {
            const targetTile = worldToTile(currentWaypoint.x, currentWaypoint.z);
            const dx = targetTile.px - playerPosRef.current.x;
            const dy = targetTile.py - playerPosRef.current.y;
            const dist = Math.hypot(dx, dy);

            // Speed in pixels per second (approx 48 px/s at 1x speed)
            const moveSpeed = 48 * currentSpeed * dt;

            if (dist > 3) {
              const vx = (dx / dist) * Math.min(moveSpeed, dist);
              const vy = (dy / dist) * Math.min(moveSpeed, dist);
              playerPosRef.current.x += vx;
              playerPosRef.current.y += vy;

              // Update facing direction
              if (Math.abs(dx) > Math.abs(dy)) {
                playerDirRef.current = dx > 0 ? 'right' : 'left';
              } else {
                playerDirRef.current = dy > 0 ? 'down' : 'up';
              }
            } else {
              // Reached this waypoint -> advance to next
              waypointIdxRef.current++;
              if (waypointIdxRef.current >= waypoints.length) {
                // Arrived at destination!
                triggerArrival();
              } else {
                const travelledDist = (waypointIdxRef.current / waypoints.length) * route.totalDistanceM;
                syncWalkProgress(travelledDist, useCampusStore.getState().selectedPlaceId || 'MECH');
              }
            }
          }
        } else if (currentUIMode === 'explore') {
          // Manual Keyboard / Virtual Joystick Walk
          let mx = 0;
          let my = 0;
          const keys = keysPressedRef.current;

          if (keys['ArrowUp'] || keys['KeyW']) my -= 1;
          if (keys['ArrowDown'] || keys['KeyS']) my += 1;
          if (keys['ArrowLeft'] || keys['KeyA']) mx -= 1;
          if (keys['ArrowRight'] || keys['KeyD']) mx += 1;

          if (mx !== 0 || my !== 0) {
            isWalking = true;
            playerAnimRef.current = 'walk';
            petAnimRef.current = 'walk';

            const len = Math.hypot(mx, my);
            const walkSpeed = 56 * dt;
            playerPosRef.current.x += (mx / len) * walkSpeed;
            playerPosRef.current.y += (my / len) * walkSpeed;

            if (Math.abs(mx) > Math.abs(my)) {
              playerDirRef.current = mx > 0 ? 'right' : 'left';
            } else {
              playerDirRef.current = my > 0 ? 'down' : 'up';
            }
          } else {
            playerAnimRef.current = 'idle';
          }
        }

        // ==========================================
        // 2. PET COMPANION FOLLOW LOGIC (Organic Lag & Playful Hops)
        // ==========================================
        const playerPos = playerPosRef.current;
        const petPos = petPosRef.current;

        // Record breadcrumbs if player moved
        const crumbs = breadcrumbsRef.current;
        const lastCrumb = crumbs[crumbs.length - 1];
        if (!lastCrumb || Math.hypot(playerPos.x - lastCrumb.x, playerPos.y - lastCrumb.y) > 10) {
          crumbs.push({ x: playerPos.x, y: playerPos.y });
          if (crumbs.length > 20) crumbs.shift();
        }

        const distToPlayer = Math.hypot(playerPos.x - petPos.x, playerPos.y - petPos.y);

        if (distToPlayer > 80) {
          // Running to catch up!
          petAnimRef.current = 'run';
          const target = crumbs[0] || playerPos;
          const pdx = target.x - petPos.x;
          const pdy = target.y - petPos.y;
          const pdist = Math.hypot(pdx, pdy);
          petPos.x += (pdx / pdist) * 90 * dt;
          petPos.y += (pdy / pdist) * 90 * dt;
          petDirRef.current = pdx > 0 ? 'right' : 'left';
        } else if (distToPlayer > 32) {
          // Walking behind player
          petAnimRef.current = 'walk';
          const target = crumbs[0] || playerPos;
          const pdx = target.x - petPos.x;
          const pdy = target.y - petPos.y;
          const pdist = Math.hypot(pdx, pdy);
          if (pdist > 2) {
            petPos.x += (pdx / pdist) * 44 * dt;
            petPos.y += (pdy / pdist) * 44 * dt;
            petDirRef.current = pdx > 0 ? 'right' : 'left';
          }
        } else {
          // Close to player
          if (!isWalking) {
            if (currentUIMode === 'arrived') {
              petAnimRef.current = 'celebrate';
            } else {
              petAnimRef.current = 'sit';
            }
          }
        }

        // ==========================================
        // 3. UPDATE SPRITE TEXTURES & POSITIONS
        // ==========================================
        // Player Sprite
        playerSprite.x = playerPos.x;
        playerSprite.y = playerPos.y;
        const newPlayerCanvas = PixelSpriteGenerator.renderFrame(
          charConfigRef.current,
          playerDirRef.current,
          playerAnimRef.current,
          playerFrameRef.current
        );
        playerSprite.texture = Texture.from(newPlayerCanvas);
        playerSprite.texture.source.scaleMode = 'nearest';

        // Pet Sprite
        petSprite.x = petPos.x;
        petSprite.y = petPos.y;
        const newPetCanvas = PixelPetGenerator.renderPetFrame(
          charConfigRef.current.petSpecies,
          petDirRef.current,
          petAnimRef.current,
          petFrameRef.current
        );
        petSprite.texture = Texture.from(newPetCanvas);
        petSprite.texture.source.scaleMode = 'nearest';

        // ==========================================
        // 4. DRAW ROUTE & PAW PRINTS
        // ==========================================
        pathGraphics.clear();
        const activeRt = useCampusStore.getState().activeRoute;
        if (activeRt && activeRt.pawTrailPoints.length > 0) {
          const pts = activeRt.pawTrailPoints;

          // Draw Glowing Purple Route Line
          pathGraphics.beginPath();
          const firstTile = worldToTile(pts[0].x, pts[0].z);
          pathGraphics.moveTo(firstTile.px, firstTile.py);
          for (let i = 1; i < pts.length; i++) {
            const t = worldToTile(pts[i].x, pts[i].z);
            pathGraphics.lineTo(t.px, t.py);
          }
          pathGraphics.stroke({ width: 3, color: 0x5a4fe8, alpha: 0.6 });

          // Draw Cute Paw Print Circles along route
          for (let i = 0; i < pts.length; i += 2) {
            const t = worldToTile(pts[i].x, pts[i].z);
            pathGraphics.circle(t.px, t.py, 2);
            pathGraphics.fill({ color: 0xffb3d9, alpha: 0.85 });
          }
        }

        // ==========================================
        // 5. CAMERA SMOOTH LERP
        // ==========================================
        const targetCamX = isWalking ? playerPos.x : cameraRef.current.targetX;
        const targetCamY = isWalking ? playerPos.y : cameraRef.current.targetY;

        // Lerp camera towards target
        cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.08;
        cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.08;

        const screenW = app.screen.width;
        const screenH = app.screen.height;
        const curZoom = cameraRef.current.zoom;

        world.scale.set(curZoom);
        world.x = screenW / 2 - cameraRef.current.x * curZoom;
        world.y = screenH / 2 - cameraRef.current.y * curZoom;
      });
    })();

    // Keyboard controls
    const onKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      isCancelled = true;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [selectDestination, triggerArrival, syncWalkProgress]);

  // Touch virtual D-pad handler
  const handleVirtualDpad = useCallback((dir: PixelDirection, pressed: boolean) => {
    const keyMap: Record<PixelDirection, string> = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
    };
    keysPressedRef.current[keyMap[dir]] = pressed;
  }, []);

  const changeZoom = (delta: number) => {
    const newZ = Math.min(3.5, Math.max(1.4, cameraRef.current.zoom + delta));
    cameraRef.current.zoom = newZ;
    setZoomLevel(newZ);
  };

  const centerOnPlayer = () => {
    cameraRef.current.targetX = playerPosRef.current.x;
    cameraRef.current.targetY = playerPosRef.current.y;
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#48A850]">
      {/* PixiJS Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Retro Pixel Floating Action Badges */}
      <div className="absolute top-16 left-4 z-20 flex flex-col gap-2">
        {/* Campus Slice Badge */}
        <div className="bg-[#1D2440]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-white text-xs font-bold tracking-wide">
            2D Pixel Campus
          </span>
          <span className="text-xs text-white/60">
            {PLACES_BY_ID[currentBlockId]?.id || 'MECH'}
          </span>
        </div>

        {/* Companion Tag */}
        <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-purple-200 shadow-sm flex items-center gap-1.5 self-start">
          <span className="text-xs">🐾</span>
          <span className="text-xs font-bold text-[#1D2440]">
            {profile.petName || 'Mochi'}
          </span>
          <span className="text-[10px] text-purple-600 font-medium">Following</span>
        </div>
      </div>

      {/* Floating Controls Right Bar (Zoom, Center, Character Studio) */}
      <div className="absolute top-16 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={onOpenStudio}
          title="Open Pixel Character Studio"
          className="w-10 h-10 rounded-2xl bg-white shadow-md border border-purple-100 flex items-center justify-center text-[#5A4FE8] hover:bg-purple-50 active:scale-95 transition-transform"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        <button
          onClick={() => changeZoom(0.3)}
          title="Zoom In"
          className="w-10 h-10 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-transform"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        <button
          onClick={() => changeZoom(-0.3)}
          title="Zoom Out"
          className="w-10 h-10 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-transform"
        >
          <ZoomOut className="w-5 h-5" />
        </button>

        <button
          onClick={centerOnPlayer}
          title="Center on Player"
          className="w-10 h-10 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-transform"
        >
          <Compass className="w-5 h-5 text-indigo-600" />
        </button>
      </div>

      {/* Mobile Retro Virtual D-Pad (Touch Controls for walking around) */}
      <div className="absolute bottom-24 left-4 z-20 pointer-events-auto sm:opacity-90">
        <div className="relative w-28 h-28 bg-[#1D2440]/30 backdrop-blur-sm rounded-full p-1.5 shadow-lg border border-white/20">
          {/* Up */}
          <button
            onTouchStart={() => handleVirtualDpad('up', true)}
            onTouchEnd={() => handleVirtualDpad('up', false)}
            onMouseDown={() => handleVirtualDpad('up', true)}
            onMouseUp={() => handleVirtualDpad('up', false)}
            className="absolute top-1 left-9 w-10 h-8 bg-white/90 active:bg-purple-200 rounded-t-lg shadow flex items-center justify-center text-[#1D2440] font-bold text-xs"
          >
            ▲
          </button>
          {/* Down */}
          <button
            onTouchStart={() => handleVirtualDpad('down', true)}
            onTouchEnd={() => handleVirtualDpad('down', false)}
            onMouseDown={() => handleVirtualDpad('down', true)}
            onMouseUp={() => handleVirtualDpad('down', false)}
            className="absolute bottom-1 left-9 w-10 h-8 bg-white/90 active:bg-purple-200 rounded-b-lg shadow flex items-center justify-center text-[#1D2440] font-bold text-xs"
          >
            ▼
          </button>
          {/* Left */}
          <button
            onTouchStart={() => handleVirtualDpad('left', true)}
            onTouchEnd={() => handleVirtualDpad('left', false)}
            onMouseDown={() => handleVirtualDpad('left', true)}
            onMouseUp={() => handleVirtualDpad('left', false)}
            className="absolute top-9 left-1 w-8 h-10 bg-white/90 active:bg-purple-200 rounded-l-lg shadow flex items-center justify-center text-[#1D2440] font-bold text-xs"
          >
            ◀
          </button>
          {/* Right */}
          <button
            onTouchStart={() => handleVirtualDpad('right', true)}
            onTouchEnd={() => handleVirtualDpad('right', false)}
            onMouseDown={() => handleVirtualDpad('right', true)}
            onMouseUp={() => handleVirtualDpad('right', false)}
            className="absolute top-9 right-1 w-8 h-10 bg-white/90 active:bg-purple-200 rounded-r-lg shadow flex items-center justify-center text-[#1D2440] font-bold text-xs"
          >
            ▶
          </button>
          {/* Center Hub */}
          <div className="absolute top-9 left-9 w-10 h-10 bg-white rounded-md shadow-inner flex items-center justify-center">
            <Footprints className="w-4 h-4 text-purple-600 opacity-60" />
          </div>
        </div>
      </div>

      {/* Buildings Quick-Jump Pill Tray (Section 22: MECH, GALLERY, AMPHI, MBA) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-[#1D2440]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-xl overflow-x-auto max-w-[92vw]">
        {PIXEL_BUILDINGS.map((b) => {
          const isSelected = selectedPlaceId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => {
                selectDestination(b.id);
                const tile = worldToTile(b.worldX, b.worldZ);
                cameraRef.current.targetX = tile.px;
                cameraRef.current.targetY = tile.py;
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                isSelected
                  ? 'bg-[#5A4FE8] text-white shadow-sm scale-105'
                  : 'text-white/80 hover:bg-white/10 active:scale-95'
              }`}
            >
              <span>{b.icon}</span>
              <span>{b.id}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
