# TODOS — Campus World (NAVDEX)

## Data & Field Calibration (Teammate Deliverables — Week 2 to Week 5)

### 1. Satellite GeoJSON Building Footprints & Field-Walk Entrance Calibration
- **What:** Trace accurate satellite building footprint polygons (`geojson.io`) and verify entrance coordinates + walking-path graph edges for all 25 campus blocks, replacing the procedural `18m × 14m` fallback footprints in `src/data/campus-places.json`.
- **Why:** Unblocks Week 1–2 3D world development immediately (via procedural footprints and pre-computed `renderOffset` vectors) while ensuring the final Week 5–6 real-GPS walk test has true-to-life building shapes and entrance arrival triggers (`20m` enter / `30m` exit hysteresis).
- **Pros:** Decouples solo developer coding velocity from manual GIS tracing; resolves dense cluster ambiguity (`CSE / C1 / C2 / C3` at `4.5–11m`, `GAL / PIV` at `9m`, `E1 / COE` at `13m`).
- **Cons:** ~3–4 hours of teammate tracing over a single shared satellite imagery layer + a 20-minute on-campus walk validation.
- **Context:** See `campus-world-context.md` Sections 4.1–4.5 and Open Questions #1–#3. All footprints, entrances, and path nodes must be traced from the **same satellite imagery** so they align without drift.
- **Depends on / blocked by:** Shared `latLonToWorld(lat, lon)` equirectangular transform (`src/data/transform.ts`).
