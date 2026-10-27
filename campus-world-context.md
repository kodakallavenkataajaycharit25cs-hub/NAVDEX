# Campus World — Project Context & UI Design Brief

> Feed this file to the coding/design agent as the single source of truth.
> Where this file states a decision, follow it. Where it says "TUNE" or "VERIFY", treat the value as a starting point to be checked.
> Do not add features that are in the "Out of scope" list.

---

## 1. Overview

**Campus World** is a mobile-first web app that lets students navigate **one specific college campus** (Bengaluru, India) through a miniature, stylized 3D "clay diorama" of the campus instead of a flat map.

Each user has a customizable **character** and a **pet** that walk the route together. Searching for a place makes the camera fly to that building's landmark. Tapping **Let's Go** switches to a chase-camera "walk mode" similar in feel to Pokémon Go, with a route drawn as the pet's paw prints.

Product statement: **a personal campus world disguised as a navigation app.**

This is a **semester project with a graded demo**. It is not a public product. Every decision below optimizes for: (1) a demo that cannot fail, (2) a distinctive, polished look, (3) scope that one developer can finish in under 6 weeks.

---

## 2. Constraints & decisions

### 2.1 Constraints (given by the developer)
- **Team:** 4 people on paper, but **one person does essentially all development.** Plan for solo dev. Teammates can realistically help with: path tracing, data collection, phone testing, the report, slides.
- **Time:** under 6 weeks to final submission.
- **Purpose:** demo for grading only. No real student rollout.
- **Platform:** mobile-first web app (PWA-capable). Desktop only needs to not break.
- **Target devices:** mid-range Android (assume roughly ₹12–15k class) must run at a steady frame rate. TUNE: aim for 30 fps minimum.
- **3D skills:** developer does not know Blender. Do not plan on custom-modelled assets.

### 2.2 Decisions
| Area | Decision |
|---|---|
| Frontend | Vite + React + TypeScript + Tailwind CSS (no Next.js; SSR is unnecessary for a demo) |
| 3D | Three.js via React Three Fiber + `@react-three/drei` |
| UI motion | Framer Motion (springs), CSS for simple transitions |
| Auth / storage | Supabase (email OTP or Google sign-in, Postgres, row-level security ON). The app never stores passwords itself. |
| Hosting | Vercel over HTTPS (required for browser geolocation) |
| Search | Fuse.js over a local JSON index (~30 places, no backend call) |
| Routing | Hand-built navigation graph + A* (client-side) |
| Character/pet assets | Use a free pre-rigged low-poly character and animal pack (e.g. Quaternius/Kenney style packs; **VERIFY each asset's licence**), recolor to match the clay look. Do not model from scratch. |
| Landmarks | Build from Three.js primitives (rounded boxes, cylinders, tori, extrusions) with clay materials. No imported landmark models in MVP. |
| Onboarding character | Layered 2D SVG + Framer Motion (not Rive, to avoid a learning-curve risk) |
| Art direction | **Soft Diorama** (calm pastels, warm light). See section 7. |
| Location | GPS with smoothing and snapping, plus a mandatory **Demo Mode** simulator |
| Steps | **Estimated** (distance ÷ stride length) and always labelled "est." Web browsers cannot read a real step count. |

---

## 3. Scope

### 3.1 In scope (MVP)
1. Welcome, Register / Login (reactive character), Character creation, Pet selection.
2. 3D campus scene: extruded clay buildings from traced footprints, paths, instanced trees, **8–10 hero landmarks**, generic clay blocks for the rest.
3. Home screen with greeting, search dock, floating menu.
4. Search with autocomplete and aliases.
5. Camera fly-to + landmark highlight + destination card.
6. Route calculation (graph + A*), distance and walking time.
7. Walk mode: chase camera, character walks the route, pet follows, paw-print trail, speed chip, estimated steps chip, ETA pill, Stop.
8. Arrival celebration.
9. Events: seeded list (about 5 fake events), floating pins on buildings, event detail card, list in the Menu.
10. Demo Mode (simulated walk + manual "I'm at:" picker).
11. Real GPS mode (bonus, field-tested).

### 3.2 Out of scope (do NOT build)
Campus Passport, achievements, QR positioning, social/friends, day-night cycle, weather, advanced pet AI, full wardrobe, indoor navigation, push notifications, event organizer/admin tooling, desktop-specific layouts. Mention a few as "future work" in the report only.

---

## 4. Campus data

### 4.1 Reality check (computed from the developer's coordinates)
- Campus extent is roughly **293 m north–south by 164 m east–west**. The longest straight-line distance is under about 335 m. Typical walks are 1–3 minutes. Never show distances or times that exceed this scale.
- Several points are too close for phone GPS (typically 3–10 m error) to distinguish: **C3–CSE 4.5 m, C2–CSE 11 m, C2–C3 11 m, GAL–PIV 9 m, E1–COE 13 m, J1–J2 13.6 m.**
- The original `threshold: 80` (assumed metres) is far too large: 65 of 300 block pairs are closer than 80 m. **Use per-place arrival radius of about 15–25 m measured from the building entrance, with hysteresis** (enter at 20 m, exit at 30 m). TUNE after field testing.
- Seven-decimal coordinates imply false precision. The source accuracy is phone GPS (meters). Single points are not building footprints or entrances.

### 4.2 Raw destination list (as supplied by the developer)
Coordinates are from the developer's own GPS capture. How each was captured (entrance vs building centre) is **unknown — see Open Questions.**

| id | name | keywords | lat | lon |
|---|---|---|---|---|
| ME | ME Block | mech, mech block, mechanical | 12.9015525 | 77.5189999 |
| GATE | Main Gate | gate, main gate, entrance | 12.9022711 | 77.5188850 |
| GAL | Galileo Block | gal, gallery | 12.9019049 | 77.5190094 |
| PIV | PIV Block | piv | 12.9019690 | 77.5190615 |
| AT | AT Block | amphitheatre, theatre | 12.9013695 | 77.5188589 |
| MBA | MBA Block | mba, mba block | 12.9011607 | 77.5188885 |
| J1 | J1 Block | j1, junction 1 | 12.9007084 | 77.5187950 |
| J2 | J2 Block | j2, junction 2 | 12.9006508 | 77.5186843 |
| PU | PU Block | pu, pu block | 12.9003920 | 77.5186389 |
| TEMP | Temple | temp, temple | 12.9000229 | 77.5185222 |
| T1 | T1 Block | t1 | 12.8998579 | 77.5184509 |
| S1 | S1 Block | s1 | 12.9000117 | 77.5176365 |
| SIC | SIC Block | sic | 12.9005785 | 77.5175464 |
| ARC | Architecture Block | architecture | 12.9008568 | 77.5175980 |
| LIB | Library | lib, library | 12.9008680 | 77.5177878 |
| AUDI | Auditorium | audi, auditorium | 12.9007642 | 77.5182311 |
| J3 | J3 Block | j3, junction 3 | 12.9006912 | 77.5185133 |
| ADM | Admin Block | admin block, admin, administration | 12.9023831 | 77.5187190 |
| X1 | X1 Block | x1 | 12.9018409 | 77.5188799 |
| E1 | E1 Block | e1 | 12.9024889 | 77.5181543 |
| COE | COE Block | coe, coe block | 12.9023767 | 77.5181238 |
| C1 | C1 Block | c1, canteen 1 | 12.9021100 | 77.5181952 |
| C2 | C2 Block | c2, canteen 2 | 12.9019856 | 77.5180372 |
| C3 | C3 Block | c3, canteen 3 | 12.9019416 | 77.5179425 |
| CSE | CSE Block | cse, computer science | 12.9019815 | 77.5179359 |

### 4.3 Data that must be created (required before 3D and routing work)
1. **Footprint polygon per building**, traced over satellite imagery (geojson.io or QGIS). Used to extrude the clay buildings.
2. **Entrance point per building.** All routing, arrival detection and "you are here" use the entrance, not the centre.
3. **Navigation graph:** walking-path nodes and edges between entrances (about 40–80 nodes). Edges carry length in metres and optional flags (stairs, gate-hours, covered).
4. **Campus boundary polygon** for the geofence.

Trace footprints, entrances and paths from the **same imagery** so they align with each other. Use phone GPS only to validate by walking the campus afterwards.

### 4.4 Data model (shape only)
Each **place** record: stable `id`, display `name`, `category` (department, facility, food, landmark, gate, worship, admin), `aliases[]`, `entrance` (lat, lon, graph node id), `footprint` (polygon), `landmarkType` (see 6.3), `arrivalRadiusM`, `renderOffset` (x, z; see 4.5).

Each **graph node:** `id`, `lat`, `lon`, `type` (path | entrance | junction). Each **edge:** `from`, `to`, `lengthM`, optional `flags`.

Each **event:** `id`, `title`, `placeId`, `start`, `end`, `description`, `artwork` (optional).

Search, landmarks, events and routing must all key off the same place `id`.

### 4.5 GPS → world transform
- Convert lat/lon to local metres using one fixed campus origin and a small-area equirectangular approximation (accurate enough at campus scale). Optional single calibrated rotation to align with the imagery.
- **Never hand-type world x/z coordinates.** Always derive them from GPS via the transform.
- **Render offsets:** the diorama is allowed to cheat. Crowded clusters (notably CSE / C1 / C2 / C3, GAL / PIV) get a visual `renderOffset` so landmarks do not overlap on a phone screen. Routing and GPS keep using the real coordinates.

---

## 5. Architecture

```
Campus data (places, footprints, graph, events)
        │
 ┌──────┴───────────────────────────┐
 │                                  │
Navigation engine                3D world (R3F)
(A*, route, snap, ETA)           (buildings, landmarks,
 │                                character, pet, camera)
 └──────┬───────────────────────────┘
        │
   Location service  ←  real GPS  |  Demo Mode simulator  |  manual "I'm at"
        │
       UI layer (HUD, sheets, cards, onboarding)
        │
   Supabase (auth, profile/character config, events)
```

Rules:
- The **navigation engine must not import anything from the 3D layer.** It takes a position and a destination and returns a route (ordered node list, polyline, distance, duration).
- The **location service exposes one interface** (current position + accuracy + source). The rest of the app cannot tell whether the position is real or simulated. This is what makes Demo Mode cheap and reliable.
- The 3D layer only renders state; it does not decide navigation.
- Character configuration (base, skin, hair colour, outfit colour, hat, pet) is a small JSON object saved to the user's profile.

### 5.1 Camera system
Two camera modes, with animated transitions between them.

| Mode | Used when | Behaviour (TUNE all values) |
|---|---|---|
| **Explore** | Home, search, destination card | Tilted diorama, about 50° pitch, limited rotation, clamped zoom, pan bounded to the campus plus a small margin |
| **Walk** | After "Let's Go" | Chase camera behind the character, about 6–8 world units back, steeper pitch, smooth follow with damping |

**Fly-to:** about 1.2–1.6 s ease-in-out. The destination is framed so the landmark sits in the upper-middle of the screen and the destination card has room at the bottom. Landmark highlight: slight scale-up, soft glow, subtle rotation. Cancel and reverse cleanly if the user taps elsewhere mid-flight.

### 5.2 Character and pet behaviour (simple state machines, no AI)
- **Character:** idle, walking, turning, arriving, celebrating.
- **Pet:** idle, walking beside, trotting slightly ahead, sitting (when the user stops), celebrating (on arrival). The pet follows the character's recent path with a small delay rather than steering independently.
- Character and pet are drawn **about 3–4× larger than real scale** so they are visible on a 293 m campus.

---

## 6. 3D world design

### 6.1 Look
Miniature **clay diorama**: rounded geometry, soft pastel materials with high roughness, soft baked shadows, hemisphere + one directional light, instanced rounded trees, cream paths on mint grass. Not photorealistic.

Fake the clay look with: beveled/rounded boxes, soft ambient occlusion, subtle fresnel rim, pastel colours. **No post-processing stack, no real-time shadow maps if avoidable, cap device pixel ratio (about 1.5–2).**

### 6.2 Performance rules
- Low-poly everything. Instance repeated objects (trees, lamps).
- Compress any `.glb` (Draco/Meshopt) and use WebP/AVIF textures.
- Keep the number of continuously animated objects small (only hero landmarks near the camera animate).
- Test on a cheap Android phone by **end of week 5**. Reduce effects before reducing landmark count.
- Do not use backdrop blur on UI layered over the WebGL canvas.

### 6.3 Landmarks (8–10 hero landmarks; everything else is a plain clay block with a pastel roof)

| Place | Landmark object | Idle animation (subtle) |
|---|---|---|
| CSE | Chunky clay monitor/computer | Screen glow / tiny blink |
| ME | Gear | Slow rotation |
| LIB | Open book | Pages gently open/close |
| MBA | Briefcase | Tiny hop or latch click |
| AUDI | Stage with curtains | Curtains sway |
| AT | Amphitheatre steps | None or soft glow |
| TEMP | Small stylized temple | None |
| GATE | Arch | None |
| ADM | Block with flagpole | Flag wave |
| C1–C3 | One shared cup / food-tray object | Steam wisp |

Landmark rules: rounded geometry, clay material, 2–3 dominant colours, small base platform, soft shadow, readable from far away, animations short and subtle.

**Name tags:** small signpost-shaped pills that face the camera. **Maximum 3 visible at once**; others fade in as the camera approaches.

---

## 7. UI design system — "Soft Diorama"

### 7.1 Anti-generic rules (these exist because earlier designs looked AI-made, cluttered, and off in colour/typography)
- **No emoji as icons.** Use one consistent rounded-stroke icon set (2 px) or small clay landmark renders.
- **No gradients on UI surfaces.** The only gradient is the sky behind the 3D world.
- **No glassmorphism or backdrop blur** over the canvas.
- **Signature elements** appear on every screen where relevant: the paw-print route trail, the greeting bubble from the character, signpost name tags.
- **Microcopy has a voice** (examples in 8.x). Short and specific.
- Three layers, never mixed: **World** (clay, 3D) · **HUD** (flat, soft-shadow cards) · **Moments** (full-bleed illustrations for welcome and arrival).
- Clay/puffy styling is for the **world and illustrations only.** UI controls are flat with soft shadow.

### 7.2 Declutter rules
- **One primary action per screen.**
- **Home shows only:** the world, a greeting bubble, the bottom dock (search pill + round menu button), and one event pin if something is happening nearby. **No top bar.**
- Max 3 name tags at once.
- Menu is a bottom sheet with **5 items:** Navigate, Events, Explore, My Character, Settings.
- Walk mode shows only: route, two stat chips (speed, est. steps), ETA pill, Stop.
- Onboarding: **one idea per screen.**

### 7.3 Colour tokens
| Role | Hex | Notes |
|---|---|---|
| Ink (primary text) | `#1D2440` | ~15:1 on surface |
| Muted text | `#5B6384` | ~5.8:1 on surface; safe for small text |
| Surface (cards, sheets) | `#FFFDF9` | warm white, not pure white |
| Sky (world background only) | `#EEF0FF` → `#FFF4EC` | periwinkle to peach |
| Primary action | `#5A4FE8` | white text on it ≈ 5.65:1 |
| Grass | `#CDEBC5` | mint |
| Paths | `#FFF1DC` | cream |
| Roof pastels (rotate) | lilac `#C9BFFF`, peach `#FFC9B0`, mint `#B7E8D2`, butter `#FFE59A`, sky `#BFE0FF` | ink text on these ≥ 9:1 |
| Event accent | `#FF8A5B` | pins and badges only, **never text** |
| Character/pet accent | `#FF8FB1` | sparingly |

Notes:
- Do **not** use `#6C63FF` for small white-on-primary text (≈4.3:1, fails). Use `#5A4FE8`.
- Do **not** use light grey text like `#8A90AD` on cards (≈3.1:1).
- Minimum text contrast 4.5:1 for normal text, 3:1 for large text.
- Shadows are **purple-tinted** (about `rgba(90,79,232,0.18)`), never black.

### 7.4 Typography
- **Plus Jakarta Sans** for all UI text. Body 16 px, captions 13 px, titles 20 px.
- **Fredoka** (or a similar rounded display face) **only** for display moments: greeting, location names, arrival message.
- Maximum two fonts, maximum two weights per screen.
- Provide proper fallback font stacks.

### 7.5 Shape and elevation
- Radius: 28 px for sheets/cards, full pill for search, 16 px for chips.
- One elevation style: soft coloured shadow plus a 1 px inner highlight on the top edge.
- Touch targets at least 44×44 px. Primary controls sit in the thumb zone (bottom).

### 7.6 Motion
- Springy overshoot on taps, sheets and landmarks (starting point: spring stiffness ≈ 300, damping ≈ 20; TUNE).
- Squash-and-stretch on buttons and the character.
- Respect `prefers-reduced-motion`: reduce idle landmark animation and large camera moves.
- Motion is short and purposeful; nothing loops attention-grabbingly on the home screen.

---

## 8. Screens

For each screen: purpose, elements, states, copy direction.

### 8.1 Welcome
Large character illustration, short message, **one** primary button. Character blinks, looks around, reacts to tap.
Copy example: "Hey! I'm your campus buddy. Ready to explore?"

### 8.2 Register / Login
Layered SVG character above the form. Reactions:
- Focus on email/username → character looks toward the field (eyes follow the caret roughly).
- Focus on password → character covers its eyes. Show-password toggle makes it peek.
- Error → confused look, short shake.
- Success → celebrate.
Auth is email OTP or Google sign-in (see section 11). If a password is ever used, use the managed auth provider, never custom storage.
Error copy is specific and kind: "That code didn't match. Try again?"

### 8.3 Character creation
Live preview of the 3D (or high-quality static) character. Controls as horizontally scrolling chips, one category visible at a time. Categories: **Look** (2 base bodies), **Skin tone**, **Hair** (4 styles + colour), **Outfit** (4, recolourable), **Hat** (3 + none). The user picks a look, not a gender label. Primary action: "Looks good".

### 8.4 Pet selection
2–3 pets (dog, cat, bunny). Each shows a tiny idle animation on selection. Name the pet (optional text field).

### 8.5 Home
- World fills the screen; character and pet stand in the lower third; camera in Explore mode.
- Greeting bubble from the character: "Where to, {name}?"
- Bottom dock: **search pill** (with placeholder like "Search blocks, labs, canteens") and a **round menu button** beside it.
- At most one event pin visible if an event is nearby and happening soon.
- Shows current approximate location as a small caption ("Near CSE Block") only when position is known with acceptable accuracy.

### 8.6 Search
Tapping the pill expands it into a search sheet over the world (world stays visible behind). Results are list rows: landmark thumbnail (clay render or icon), name, category, walking time. Example: typing `mec` shows **ME Block** first. Recent places shown before typing. Empty state: "Nothing by that name. Try a block code like CSE or J2."
Search covers: names, codes, departments, facilities, aliases, events. Tolerates typos.

### 8.7 Destination
On selection: camera flies to the landmark, landmark highlights, **destination card** rises from the bottom.
Card contents: place name (display font), category, distance (m) and walking time, one primary button **Let's Go**, secondary "Back". Nothing else.

### 8.8 Walk mode
- Chase camera behind the character; pet beside/ahead.
- Route drawn as **paw prints** along the path; next turn highlighted.
- Chips at top: **speed** and **est. steps** (labelled "est."). ETA pill and **Stop** button at the bottom.
- If the user stops moving, the pet sits.
- Off-route handling: soft banner "Taking a different way? Rerouting…" and recompute.

### 8.9 Arrival
Camera eases out; character and pet celebrate; short confetti/sparkle burst; full-bleed moment card. Copy: "You made it!" with the place name. One button: "Done".

### 8.10 Menu (bottom sheet, world visible behind)
Five rows: Navigate, Events, Explore, My Character, Settings. Sheet is dismissible by drag or tap outside. Not a full-screen page.

### 8.11 Events
List of today's/upcoming events, each with title, place, time and a "Show me" action that flies the camera to the building. Event pins in the world pulse softly. Event detail card: title, time, place, short description, primary action "Take me there".
User-supplied text (event titles/descriptions) must be treated as untrusted: escape/sanitize before rendering.

### 8.12 My Character
Preview of character + pet, the editing controls from 8.3, and one friendly stat line at most (e.g. places visited). Not a generic account page.

---

## 9. State flow

### 9.1 Happy path
`Welcome → Register/Login → Character → Pet → Home → Search → Destination (fly-to) → Walk mode → Arrival → Home`

### 9.2 Location state machine
- **Demo Mode:** position supplied by a simulator walking the computed route at roughly 1.4 m/s (average walking speed; TUNE). A manual "I'm at: [place]" picker sets the start position. This must work with **no GPS and no network beyond initial load.**
- **Real GPS mode:**
  1. Ask permission with a short explanation first ("I use your location only to show where you are on campus").
  2. Discard fixes with poor accuracy (starting point: worse than about 25 m; TUNE).
  3. Smooth positions (low-pass or simple Kalman).
  4. Snap to the nearest graph edge if within about 20 m; otherwise show an "off the path" state.
  5. Geofence against the campus polygon plus a small margin. If outside, show a friendly "You seem to be off campus" state and offer Demo Mode.
  6. Arrival: within the destination's arrival radius of its **entrance**, with hysteresis; require a short dwell (about 2 s) to avoid false triggers.
- **Permission denied / unavailable:** fall back to the manual picker + Demo Mode. Never leave the user on a blank screen.

### 9.3 Routing
Inputs: start node (snapped), destination entrance node. Output: ordered node list, polyline, total metres, walking time (distance ÷ about 1.3–1.4 m/s). A* with straight-line heuristic. If no path exists, show a clear message and log it (indicates a graph data bug).
Recompute when the user deviates beyond a threshold from the route (TUNE).

### 9.4 Steps and speed
- Speed: derived from smoothed GPS (or simulator in Demo Mode). Show 0 when below a small movement threshold.
- Steps: **estimate** = distance travelled ÷ stride length (about 0.7–0.8 m; TUNE; optional height-based calibration). Always labelled "est.".

---

## 10. Failure modes & safety considerations

| Failure | Consequence | Mitigation |
|---|---|---|
| GPS indoors in the demo room | Position wrong or missing; demo dies | **Demo Mode is mandatory**; record a backup demo video |
| GPS jitter near buildings | Character teleports between blocks | Accuracy threshold, smoothing, snap-to-graph |
| Points 4–13 m apart (C3/CSE/C2, GAL/PIV, E1/COE) | Live GPS cannot tell them apart | Use entrances; accept ambiguity in real mode; Demo Mode for the graded demo |
| Oversized arrival threshold (80 m) | Wrong "You made it!" triggers | 15–25 m from entrance, hysteresis, dwell time |
| Overlapping landmarks in dense clusters | Cluttered, unreadable scene | `renderOffset` per place |
| Low-end phone stutters | Janky demo | Baked shadows, no post-processing, DPR cap, fewer animated objects; test early |
| Browser stops GPS when screen locks | Walk mode freezes | Tell users to keep the screen on; do not promise background tracking |
| Wrong/missing graph edges | "No route" or silly routes | Validate graph connectivity; walk every route once before the demo |
| Untrusted text (events, names) | XSS | Escape/sanitize all user-supplied text |
| Leaked keys | Account abuse | Keys in environment variables; only public anon key in the client; row-level security on all tables |
| Location privacy | Unnecessary sensitive data | Process location **on-device only; do not store location history**; show a plain-language privacy note |
| Asset licensing | Grading/legal issue | VERIFY and record the licence for every third-party asset and font |
| Scope creep | Unfinished demo | Out-of-scope list in section 3.2 is binding; cut landmarks/hats before cutting Demo Mode or fly-to |

---

## 11. Security & privacy (demo-appropriate but built correctly)
- **Do not implement custom password storage.** Use Supabase Auth with email OTP or Google sign-in. If restricting to the college, enforce the domain **server-side** (not just in the UI).
- Row-level security on every table; users can only read/write their own profile.
- Store only: display name, character/pet configuration, and (optional) saved favourites. **No location trails.**
- All traffic over HTTPS; secrets only in environment variables; never commit keys.
- Sanitize and length-limit all user-supplied strings; rate-limit sign-in attempts via the auth provider settings.
- Ask for location consent with a clear explanation. India's data-protection law (DPDP Act 2023) emphasises consent and purpose limitation — **VERIFY current requirements** if the app ever leaves the demo stage.

---

## 12. Build plan (6 weeks, solo)

| Week | Goal |
|---|---|
| 1 | **Prove the look.** One landmark + character + pet in a lit clay scene; design the core screens; trace footprints, entrances, paths; set up GPS→world transform. **Gate:** if it doesn't look good by end of week 1, change the art approach now. |
| 2 | Full campus scene, fly-to camera with landmark highlight, search + autocomplete |
| 3 | Routing, character walks the route, pet follows, destination card, arrival |
| 4 | Welcome, register/login, character creation, pet selection, save profile |
| 5 | Remaining hero landmarks, events, menu sheet, **performance pass on a cheap Android phone** |
| 6 | Real-GPS field test, Demo Mode hardening, report, slides, backup video. **No new features.** |

If behind schedule: cut landmark count, hats and event polish. Never cut Demo Mode, fly-to, or the walk-mode paw-print route.

### 12.1 Suggested demo script (about 5 minutes)
1. Welcome + register (character covers eyes on password).
2. Create character and pick a pet.
3. Home: show the campus world and greeting.
4. Search `mec`; autocomplete shows ME Block; camera flies to the gear landmark.
5. Tap Let's Go; chase camera, paw-print route, speed/est. steps chips, pet sits when stopped.
6. Arrival celebration.
7. Open Menu → Events → fly to an event location.
8. Show a field-test clip of real GPS (pre-recorded) and explain the Demo Mode design decision.

---

## 13. Open questions / deferred decisions
1. **How were the 25 coordinates captured?** (standing at the entrance, at building centre, or from map pins). This decides whether they can serve as entrance points.
2. Are C3, C2 and CSE genuinely adjacent buildings? (They are within 4.5–11 m of each other.)
3. Who among the teammates can trace footprints/paths, collect entrance coordinates, test on phones, and write report sections?
4. Which free character/pet pack will be used, and what is its licence?
5. Is Supabase acceptable, or should the demo use mock local auth? (Decide in week 1.)
6. What are the course's grading criteria (technical depth, novelty, report, demo)? Adjust emphasis accordingly.
7. Are there additional places missing from the list (ground, hostels, parking, sports courts) that users would expect to search for?
8. Exact aliases per place (e.g. `at`, `cs`, `canteen`, `ground`) — extend the search index.
9. Final choice of rounded display font and icon set (record licences).

---

## 14. Instructions for the agent
- Treat this document as authoritative; ask before deviating.
- Do not write implementation for out-of-scope features.
- Keep navigation logic, location logic and 3D rendering in separate modules with the interfaces in section 5.
- Never hard-code world coordinates; always derive from GPS via the shared transform.
- Follow the UI rules in section 7 exactly: no emoji icons, no UI gradients, no backdrop blur over the canvas, contrast ≥ 4.5:1, one primary action per screen.
- Prefer simple, robust solutions over impressive fragile ones; the graded demo must work offline-ish and without real GPS.
- When a value is marked TUNE or VERIFY, surface it in a short list of assumptions rather than silently choosing.

---

## 15. Resolved UI/UX Specifications (`/plan-design-review` 10/10 Lock)

> Full visual token definitions, tonal scales, Gestalt bindings, and typography rules live in `DESIGN.md`.

### 15.1 Viewport Architecture, Z-Layer Stack & Demo Mode IA (Pass 1 — `1A`)
- **Vertical Viewport Budget (Explore & Fly-To):**
  - **Upper-Middle Focal Zone (`0%–58% vh`):** Reserved for 3D landmarks during Camera Fly-To (`y = 38% vh` target), maximum 3 camera-facing Signpost name tags, and at most 1 nearby Event pin.
  - **Character & Greeting Zone (`58%–74% vh`):** Character and pet stand in the lower third; speech bubble (`"Where to, {name}?"`) sits immediately above the character.
  - **Thumb Zone HUD (`74%–100% vh`, max `220px`):** Houses the `52px` Search Pill + `52px` Menu Orb on Home, or the Destination Card (`max-height: 220px`), or the Walk Mode bottom bar (`padding-bottom: max(16px, env(safe-area-inset-bottom))`).
- **Z-Index Figure-Ground Stack:**
  - `z-0`: 3D Clay Diorama `<Canvas>` (`100vw × 100dvh`)
  - `z-10`: 3D HTML Signpost pills (max 3 visible) + 1 nearby Event pin
  - `z-20`: Character Greeting Bubble + interactive `"Near {Place}"` location caption
  - `z-30`: Primary Thumb-Zone HUD (Bottom Dock / Destination Card / Walk Mode HUD)
  - `z-40`: Flat warm-navy scrim `rgba(29, 36, 64, 0.34)` (zero `backdrop-filter: blur`)
  - `z-50`: Draggable Bottom Sheets (`Search` 82% vh, `Menu` / `Events` / `My Character` 60% vh)
  - `z-60`: Full-bleed Moments (`Welcome`, `Arrival Celebration`)
- **1-Tap Demo Mode & `"I'm at:"` Picker (`1A`):**
  - Tapping the `"Near {Place}"` caption inside the character's greeting bubble (which displays a warm amber dot when Demo Mode is active or a green dot when Live GPS is active) opens a compact `"I'm at: [Place]"` bottom sheet picker in 1 tap. Full Demo Mode / GPS toggle also lives in `Menu → Settings`.

### 15.2 Interaction State Matrix & Local-First Resilience (Pass 2 — `2A`)
- **Local-First Demo Resilience:** Profile/character configuration and the 5 seeded campus events read/write to `localStorage` immediately (zero blocking spinners if demo-room Wi-Fi drops) and sync to Supabase asynchronously in the background.
- **Dense Cluster Disambiguation (`CSE / C2 / C3` at `4.5–11m`, `GAL / PIV` at `9m`, `E1 / COE` at `13m`):** When GPS or manual placement is within a dense cluster, tapping the `"Near CSE / Canteen Cluster"` caption displays a 1-tap disambiguation chip row (`[CSE] [C2] [C3]`) so the user can lock the exact building entrance.
- **3D Cold-Start Boot:** Immediate sky gradient (`#EEF0FF → #FFF4EC`) with the 2D SVG buddy walking in place above `"Setting up your campus…"` until the R3F canvas settles.

### 15.3 User Journey, Demo Walk Pacing & Onboarding Replay (Pass 3 — `3A`)
- **Walk Mode Demo Pacing Pill (`3A`):** When Demo Mode is active during Walk Mode, a compact pill (`[Pause (Pet Sits)] · [1×] · [4×]`) lets the presenter demonstrate normal `1.4 m/s` walking, pause on command to show the **pet sitting down**, and fast-forward `4×` so a 2-minute campus walk finishes in ~20 seconds during the 5-minute graded demo.
- **Demo Reset / Replay Onboarding:** `Menu → Settings` includes a 1-tap `"Replay Onboarding"` action so the presenter can reset to the Welcome + Register/OTP screen for the next examiner without clearing browser storage in DevTools.

### 15.4 Anti-Slop Rules, Form Labels & Iconography (Pass 4 — `4A`)
- **Zero Nested Cards Inside Sheets:** Bottom sheets (`#FFFDF9`, `28px` radius) use flat rows separated by `Law of Proximity` spacing (`12px` vertical padding) and `1px solid rgba(29,36,64,0.07)` single-edge dividers (`Law of Closure`).
- **Persistent Visible Form Labels:** Every form input in `8.2 Register / Login` and `8.4 Pet Selection` renders a permanent `13px Plus Jakarta Sans SemiBold (#1D2440)` label `4px` above the input field.
- **Resolved Open Question #9 (Icons & Fonts):**
  - Icon set: **`lucide-react`** (ISC Licence), `strokeWidth={2}`, `strokeLinecap="round"`, `strokeLinejoin="round"`.
  - Fonts: **`Fredoka`** (600 SemiBold) + **`Plus Jakarta Sans`** (500 Medium, 700 Bold) (SIL Open Font License 1.1).

### 15.5 Semantic Roof Pastels & Token Alignment (Pass 5 — `5A`)
- Roof pastels map deterministically to building categories (`Law of Similarity`) and echo as matching category dots on 3D Signpost tags and 2D Search rows:
  - **Sky (`#BFE0FF`):** Engineering & Tech Departments (`CSE`, `ME`, `ARC`, `E1`, `COE`, `GAL`, `PIV`, `X1`)
  - **Lilac (`#C9BFFF`):** Academic & Central Facilities (`LIB`, `AUDI`, `AT`, `MBA`, `PU`, `SIC`, `S1`, `T1`)
  - **Butter (`#FFE59A`):** Food & Canteens (`C1`, `C2`, `C3` — with `±6%` lightness shift between adjacent canteen roofs in 3D)
  - **Peach (`#FFC9B0`):** Admin, Gate & Worship (`ADM`, `GATE`, `TEMP`)
  - **Mint (`#B7E8D2`):** Junctions & Waypoints (`J1`, `J2`, `J3`)

### 15.6 Responsive Projector Shell & Accessibility (Pass 6 — `6A`)
- **Desktop / Classroom Projector (`>480px`):** The 3D WebGL canvas stays full-bleed (`100vw × 100dvh`), while all HUD docks, bottom sheets, and onboarding cards are constrained inside a centered `max-width: 430px` shell (`margin: 0 auto`).
- **Android Virtual Keyboard Handling:** Search and OTP inputs pin to the top of their sheet using `100dvh` / `visualViewport` so the top 3 results and submit CTA stay visible above the mobile keyboard.
- **A11y:** Visually-hidden `aria-live="polite"` announcer for Camera Fly-To, Walk Mode turns, and Arrival; `role="dialog"` + `Escape` support on all sheets; focusable `<button>` Signpost pills (`≥44×44px` hit area).

### 15.7 Resolved Open Questions on Auth & 3D Assets (Pass 7 — `7B` & `7D`)
- **Email OTP with Masked Passcode & `"Peek code"` Toggle (`7B`):** Auth uses Email OTP (plus offline Demo Sign-In fallback). The 6-digit OTP field is masked (`••••••`) by default with a `"Peek code"` eye button: focusing the OTP input makes the 2D SVG buddy cover its eyes, and toggling `"Peek code"` makes it peek through its fingers — preserving Demo Script Beat #1 (`12.1`) without storing passwords.
- **Procedural Three.js Clay Chibi Rigs & Auto-Footprint Fallback (`7D`):** Character (2 bodies, 4 hairs, 4 outfits, 3 hats) and Pets (dog, cat, bunny) are built as procedural Three.js rounded-primitive hierarchies (`<RoundedBox>`, `<Capsule>`, `<Sphere>`) with spring-damped walk/sit/hop cycles (supporting optional CC0 `.glb` overrides). Building footprints auto-generate as `18m × 14m` beveled clay blocks with pre-computed cluster `renderOffset` vectors from the 25 GPS points until satellite GeoJSON polygons are dropped in (`TODOS.md`).

### 15.8 What Already Exists & NOT in Scope
- **What already exists:** `campus-world-context.md` (requirements & 25 block coordinates), `DESIGN.md` (complete Soft Diorama design system), `CLAUDE.md` (architectural & Karpathy rules), `TODOS.md` (teammate GIS calibration), and the interactive visual comparison board (`~/.gstack/projects/NAVDEX/designs/campus-world-preview-20261017/design-board.html`).
- **NOT in scope (explicitly deferred):** Campus Passport, achievements, QR positioning, social/friends, day-night cycle, weather, advanced pet AI, full wardrobe, indoor navigation, push notifications, event organizer/admin tooling, and multi-column desktop dashboard layouts.

---

## 16. Locked Engineering Architecture & Test Specification (from `/plan-eng-review`)

### 16.1 Auto-Bootstrapped Campus Spine + Corridor A* Graph & Visual Endpoint Blending (Section 1 — `1A`)
- **Built-in Connected Campus Graph (`src/navigation/campusGraph.ts`):** Ships with a deterministic connected planar walkway graph connecting all **25 blocks** via **14 campus spine & corridor junction nodes** along the North–South spine (`GATE → ADM → AUD/L1 → MEC/CIV → CSE/C1/C2/C3 → EEE/EC1/EC2 → E1/COE → TEMP/T1`) and West loop (`ADM → LIB → ARC → SIC → S1`), guaranteeing all `25 × 24 = 600` block-to-block routes succeed immediately and never cut through buildings. Supports drop-in GeoJSON override when satellite path edges (`TODOS.md`) are provided.
- **True GPS vs. Visual `renderOffset` Smoothstep Blending (`src/navigation/astar.ts`):** A* computes `route.trueWaypoints` on true equirectangular GPS meters (`center: 12.9011734, 77.5183180`, `metersPerDegLat = 110632`, `metersPerDegLon = 108410`) for accurate distance, ETA, and arrival hysteresis (`<18m` enter / `>25m` exit), while `route.visualWaypoints` smoothly blends (`smoothstep` over the final `18m` approach) into the destination building's visual `renderOffset` entrance so 3D paw prints land directly at the offset door in dense clusters (`CSE/C1/C2/C3`, `GAL/PIV`, `E1/COE`, `J1/J2`).

### 16.2 Two-Speed State Architecture, Pet Ring Buffer & Resilience (Section 2 — `2A`)
- **Two-Speed 2D/3D State Boundary (`src/store/`):**
  - `useCampusStore.ts` (Reactive Zustand, `≤ 2 Hz`): Holds `uiMode`, `nearestBlockId`, `clusterCandidates`, `activeRoute`, `demoSpeed: 0 | 1 | 4`, `locationSource: 'gps' | 'demo' | 'manual'`, and `profile`.
  - `worldMotionRef.ts` (Mutable 60fps Frame Ref): Holds `charWorldPos`, `charHeading`, `petWorldPos`, `petHeading`, `petState`, and the 64-slot distance-sampled circular buffer (`historyRing`), read and mutated inside R3F `useFrame` with **zero React re-renders**.
- **Distance-Sampled Pet Ring Buffer (`src/world/petMotion.ts`):** Records `(x, z, heading)` every `0.25m` of character travel. In Explore mode, the pet samples `1.8m` behind the character with damped spring interpolation; in Walk mode (`1×` / `4×`), the pet leads `2.2m` ahead along `route.visualWaypoints`; when `demoSpeed === 0` (`Pause`), `petState` switches to `'sit'` and faces the user.
- **Error Handling & Resilience:**
  - `webglcontextlost` / `webglcontextrestored` listener on `<Canvas>` with a Soft Diorama recovery card.
  - `watchPosition` (`4000ms` timeout) + `320m` geofence check automatically falls back to `locationSource: 'manual'` at `GATE` with a non-blocking status pill.
  - `safeLoadStorage('navdex_v1')` handles corrupted `localStorage` JSON gracefully and sanitizes `displayName` / `petName` (`≤ 24` chars, strips HTML tags).

### 16.3 Automated Vitest Suite & Codepath Coverage (Section 3 — `3A`)
- Test plan saved at `~/.gstack/projects/NAVDEX/Kira-main-eng-review-test-plan-20261017-121449.md`:
  - `projection.test.ts`: Origin `(0, 0)` mapping, `gpsToWorld` ↔ `worldToGps` round-trip (`< 0.05m` error), and Haversine agreement (`< 0.5%`).
  - `astar.test.ts`: All `25 × 24 = 600` ordered block pairs valid, `A → A` zero-length route safety, and final `18m` visual `renderOffset` endpoint blending.
  - `directions.test.ts`: Landmark-based turn instructions (`|Δθ| < 25°` straight, `+25°..+150°` right, `-25°..-150°` left, final arrival).
  - `locationEngine.test.ts`: EMA GPS spike smoothing, `320m` geofence fallback, dense cluster candidate detection (`< 15m`), and `< 18m` / `> 25m` arrival hysteresis.
  - `petMotion.test.ts`: `0.25m` distance-ring buffer sampling (`1.8m` behind in Explore, `2.2m` ahead in Walk, `'sit'` when paused).
  - `storage.test.ts`: Corrupted JSON fallback and XSS sanitization for user/pet names.

### 16.4 Mid-Range Android 30+ FPS Performance Budget (Section 4 — `4A`)
- **Instanced Geometry Batching (`≤ 45 draw calls`):** Trees/bushes rendered via shared `<InstancedMesh>` groups; active route paw prints rendered via a single `<InstancedMesh count={80}>` updated in `useFrame`.
- **DOM Overlay Culling (`≤ 4 <Html> nodes`):** Only mount `@react-three/drei` `<Html>` pills for the max 3 visible signposts + 1 event pin returned by `useVisibleSignposts`.
- **Baked Radial Contact Shadows & Adaptive DPR:** `<Canvas shadows={false} dpr={[1, 1.75]}>` paired with `<PerformanceMonitor>` to auto-drop DPR to `1.0×` if frame times exceed `28ms`, using flat vertex-alpha ground decals instead of shadow maps.

---

## Approved Mockups

| Screen/Section | Mockup Path | Direction | Notes |
|---|---|---|---|
| Home (Explore), Destination Fly-To, Walk Mode + System Tokens | `~/.gstack/projects/NAVDEX/designs/campus-world-preview-20261017/design-board.html` | Variant A — "Soft Diorama Classic" (`approved.json`) | `Fredoka` + `Plus Jakarta Sans`, 52px floating search pill + menu orb, purple-tinted elevation, 1-tap location caption picker |

---

## Implementation Tasks
Synthesized from this review's findings. Each task derives from a specific
finding above. Run with Claude Code or Codex; checkbox as you ship.

- [x] **T1 (P1, human: ~2h / CC: ~10min)** — `design-tokens` — Configure Soft Diorama CSS variables, Tailwind theme tokens, `Fredoka` + `Plus Jakarta Sans` fonts, and `430px` centered HUD shell over full-bleed `100vw × 100dvh` canvas
  - Surfaced by: Pass 5 & Pass 6 — Design System Alignment & Projector/Mobile Responsive Grid
  - Files: `src/index.css`, `tailwind.config.js`, `DESIGN.md`
  - Verify: Contrast check ≥ 4.5:1 on all token pairs; HUD stays `≤430px` wide at `1280×800` viewport
- [x] **T2 (P1, human: ~4h / CC: ~20min)** — `world-data-transform` — Implement GPS-to-world equirectangular transform, procedural fallback footprints, cluster `renderOffset` vectors, and procedural Clay Chibi character/pet rigs
  - Surfaced by: Pass 7 (`7D`) — Week 1 3D Pipeline & Dense Cluster Disambiguation
  - Files: `src/navigation/projection.ts`, `src/data/campusPlaces.ts`, `src/world/ClayCharacter.tsx`, `src/world/ClayPet.tsx`
  - Verify: All 25 blocks render without overlap in `CSE/C1–C3` and `GAL/PIV`; character & pet animate at ≥30 fps
- [x] **T3 (P1, human: ~3h / CC: ~15min)** — `hud-demo-controls` — Build Greeting Bubble 1-tap `"I'm at:"` picker, dense cluster disambiguation row, and Walk Mode Demo Pacing Pill (`[Pause/Pet Sits · 1× · 4×]`)
  - Surfaced by: Pass 1 (`1A`), Pass 2 (`2A`), Pass 3 (`3A`) — Demo Mode IA, Cluster Recovery & Walk Mode Pacing
  - Files: `src/ui/HomeExploreHUD.tsx`, `src/ui/BottomSheets.tsx`, `src/ui/WalkAndArrivalHUD.tsx`
  - Verify: Tapping `"Near {Place}"` opens picker in 1 tap; `Pause` makes pet sit; `4×` completes a 180m route in <20s
- [x] **T4 (P1, human: ~2h / CC: ~15min)** — `onboarding-auth-svg` — Implement Email OTP login with masked passcode + `"Peek code"` toggle triggering 2D SVG character eye-cover and peek animations
  - Surfaced by: Pass 4 (`4A`) & Pass 7 (`7B`) — Visible form labels and Demo Script Beat #1 OTP eye-cover/peek
  - Files: `src/ui/AuthAndOnboardingModal.tsx`, `src/ui/ReactiveBuddySVG.tsx`
  - Verify: Focusing OTP masks input and covers SVG eyes; clicking `"Peek code"` reveals digits and triggers 1-eye peek
- [x] **T5 (P1, human: ~3h / CC: ~15min)** — `spine-astar-engine` — Implement Auto-Bootstrapped Campus Spine + Corridor Graph, A* pathfinder with `18m` smoothstep visual endpoint blend, and landmark turn generator
  - Surfaced by: Eng Review Section 1 (`1A`) — Navigation Graph Bootstrap & Visual Offset Alignment
  - Files: `src/navigation/campusGraph.ts`, `src/navigation/astar.ts`, `src/navigation/directions.ts`
  - Verify: All `25 × 24 = 600` block pairs pass connectivity & smoothstep endpoint unit tests in Vitest
- [x] **T6 (P1, human: ~2h / CC: ~10min)** — `two-speed-state-and-pet-buffer` — Implement `useCampusStore` (≤2Hz UI) + `worldMotionRef` (60fps R3F), `0.25m` pet distance-ring buffer, and WebGL/GPS/storage resilience
  - Surfaced by: Eng Review Section 2 (`2A`) — State Boundaries, Pet Path-Following & Error Recovery
  - Files: `src/store/useCampusStore.ts`, `src/store/worldMotionRef.ts`, `src/world/petMotion.ts`, `src/location/locationEngine.ts`
  - Verify: Zero React re-renders during 60fps character motion; pet trails at `1.8m` / leads at `2.2m`; hysteresis latches `<18m` / `>25m`
- [x] **T7 (P1, human: ~2h / CC: ~15min)** — `instanced-world-and-vitest` — Implement `<InstancedMesh>` paw prints & trees, max 4 mounted `<Html>` signpost pills, adaptive DPR monitor, and full Vitest suite
  - Surfaced by: Eng Review Section 3 (`3A`) & Section 4 (`4A`) — Automated Test Matrix & Android 30+ FPS Budget
  - Files: `src/world/InstancedPawTrail.tsx`, `src/world/InstancedTrees.tsx`, `src/navigation/__tests__/`, `src/location/__tests__/`
  - Verify: `npm test` passes all 6 test suites; WebGL draw calls ≤ 45

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (PLAN) | 4 decisions locked (1A, 2A, 3A, 4A), 0 unresolved |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR (FULL) | score: 6.5/10 → 10/10, 8 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **VERDICT:** ENG + DESIGN CLEARED — ready to implement
NO UNRESOLVED DECISIONS

