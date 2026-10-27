# CLAUDE.md — Campus World (NAVDEX)

## Project Overview
**Campus World** is a mobile-first 3D web app (`Vite + React + TypeScript + Tailwind CSS + React Three Fiber + @react-three/drei + Framer Motion + Fuse.js + Supabase`) that lets students navigate a Bengaluru college campus (`293 m × 164 m`, 25 blocks) through a miniature stylized 3D clay diorama with a customizable character and pet companion.

Single source of truth for requirements and scope: `campus-world-context.md`.
Single source of truth for visual design, tokens, and Gestalt rules: `DESIGN.md`.

## Design System
Always read `DESIGN.md` before making any visual or UI decisions.
All font choices (`Fredoka` + `Plus Jakarta Sans`), color tokens (`#FFFDF9` surface, `#1D2440` ink, `#5A4FE8` primary, purple-tinted shadows), spacing scale (`4px/8px` base), layout grid (`4-col` mobile, `430px` max-width centered HUD shell over full-bleed `100vw × 100dvh` 3D canvas on desktop), and Gestalt rules are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match `DESIGN.md` (especially: any emoji used as an icon, any `backdrop-filter: blur()` over the WebGL canvas, any nested cards inside bottom sheets, or any `#6C63FF` / `#8A90AD` low-contrast colors).

## Architecture Boundaries (Mandatory)
1. **Navigation Engine (`src/navigation/`):** Pure TypeScript (`A*`, Spine+Corridor campus graph, snapping, distance, ETA, landmark turn generator). **Must not import anything from Three.js / R3F or React UI.** Ships with a built-in connected 25-block + 14-junction Spine+Corridor walkway graph (all 600 block pairs valid) and smoothstep blends the final `18m` of `route.visualWaypoints` into each building's visual `renderOffset` entrance.
2. **Location Service (`src/location/`):** Exposes a single unified stream (`position`, `accuracyM`, `source: 'gps' | 'demo' | 'manual'`, `nearestBlockId`, `clusterCandidates[]`). Includes EMA low-pass GPS smoothing, `320m` geofence check (`>320m` or `>4s` timeout falls back to `GATE`), and `<18m` / `>25m` arrival hysteresis.
3. **Two-Speed State Boundary (`src/store/`):**
   - `useCampusStore.ts` (Reactive Zustand, `≤ 2 Hz`): Coarse UI state (`uiMode`, `nearestBlockId`, `activeRoute`, `demoSpeed`, `profile`).
   - `worldMotionRef.ts` (Mutable 60fps Frame Ref): High-frequency 3D positions (`charWorldPos`, `petWorldPos`, and 64-slot `0.25m` distance-sampled `historyRing`) updated inside R3F `useFrame` with **zero React re-renders**.
4. **Coordinate Transform (`src/navigation/projection.ts`):** Never hard-code world `x/z` coordinates. Always convert `(lat, lon)` to local metres via the shared equirectangular campus center transform (`12.9011734, 77.5183180`, `metersPerDegLat = 110632`, `metersPerDegLon = 108410`), applying `renderOffset` only in the visual presentation layer for dense clusters (`CSE/C1/C2/C3`, `GAL/PIV`, `E1/COE`, `J1/J2`).
5. **3D Layer (`src/world/`):** Renders state only (`Explore` 50° pitch camera vs. `Walk` chase camera, procedural clay buildings, 10 hero landmarks, procedural clay chibi character & pet rigs). Enforce `≤ 45` draw calls using `<InstancedMesh>` for trees/bushes and paw prints (`count={80}`), mount at most **4** `@react-three/drei` `<Html>` pills at once (`3 signposts + 1 event pin`), use baked radial contact shadow decals (`shadows={false}`), and pair `dpr={[1, 1.75]}` with `<PerformanceMonitor>` fallback to `1.0×`.

## Karpathy Coding Guidelines
1. **Think Before Coding:** Surface assumptions and coordinate/data ambiguities explicitly.
2. **Simplicity First:** Minimum code that solves the problem. No speculative abstractions, no out-of-scope features from Section 3.2 of `campus-world-context.md`.
3. **Surgical Changes:** Touch only what is required; keep module boundaries clean.
4. **Goal-Driven Execution:** Verify every step against concrete checks (`npm test` passing all 600 A* pairs + unit suites, contrast ≥ 4.5:1, 30+ fps budget).

