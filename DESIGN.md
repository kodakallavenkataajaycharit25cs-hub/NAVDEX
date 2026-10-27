# Design System — Campus World (NAVDEX)

## Product Context
- **What this is:** A mobile-first 3D web app ("a personal campus world disguised as a navigation app") that lets students navigate a Bengaluru college campus (`293 m × 164 m`, 25 blocks) through a miniature stylized 3D clay diorama with a customizable buddy and pet companion.
- **Who it's for:** College students navigating between blocks, labs, canteens, and campus events — optimized first and foremost for a fail-proof 5-minute graded demo on mid-range Android phones (`₹12–15k` class, `≥30 fps`) and classroom projectors.
- **Space/industry:** Spatial consumer navigation / cozy miniature companion games (Pokémon Go walk feel meets miniature clay diorama).
- **Project type:** Mobile-first PWA web app (`Vite + React + TypeScript + Tailwind CSS + React Three Fiber + Framer Motion + Supabase`).
- **Memorable thing:** A warm, tactile miniature clay campus where your custom character and pet physically walk a trail of paw prints to your next class.

---

## Aesthetic Direction — "Soft Diorama"
- **Direction:** Soft Diorama (Playful/Tactile 3D World + Calm, Flat Warm-Paper HUD).
- **Decoration level:** Intentional — Puffy/beveled clay geometry, soft hemisphere lighting, and procedural 3D hero landmarks live **exclusively in the 3D World and full-bleed Moments**. All HUD controls, cards, and bottom sheets are flat `#FFFDF9` surfaces with soft purple-tinted elevation.
- **Mood:** Warm, approachable, daylight-legible, and responsive. Never sterile SaaS, never dark-mode neon gamer UI, never cluttered map-utility chrome.
- **Anti-Generic & Anti-Slop Hard Rules:**
  1. **Zero emoji as UI icons.** Use `lucide-react` (`strokeWidth={2}`, `strokeLinecap="round"`, `strokeLinejoin="round"`) paired with procedural clay/SVG landmark badges.
  2. **Zero gradients on UI surfaces.** The only gradient is the 3D world sky (`#EEF0FF` → `#FFF4EC`).
  3. **Zero `backdrop-filter: blur()` over the WebGL canvas.** Blurring over WebGL destroys mobile GPU frame rates on mid-range Android devices and muddies figure-ground separation.
  4. **Zero nested cards inside sheets.** Bottom sheets are already elevated containers; rows inside them use spatial proximity and `1px` single-edge dividers.
  5. **Persistent visible form labels.** Every input (`College Email`, `6-Digit Secret Code`, `Pet Name`) displays a visible label `4px` above the field — never placeholder-as-label.

---

## Typography
- **Display / Hero (`--font-display`):** **`Fredoka`** (`600 SemiBold`, `500 Medium` fallback) — Used strictly for display moments: character greeting bubble (`"Where to, Aarav?"`), destination card title (`"ME Block"`), signpost name tags, and arrival celebration (`"You made it!"`).
  - *Fallback stack:* `'Fredoka', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`
  - *Licence:* SIL Open Font License 1.1 (Google Fonts).
- **Body & UI Controls (`--font-sans`):** **`Plus Jakarta Sans`** (`500 Medium`, `700 Bold`) — Used for all search inputs, list rows, buttons, category badges, and body copy.
  - *Fallback stack:* `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - *Licence:* SIL Open Font License 1.1 (Google Fonts).
- **Numeric / Live Telemetry:** `Plus Jakarta Sans` with `font-variant-numeric: tabular-nums` enforced on all Walk Mode chips (`speed`, `est. steps`, `distance m`, `ETA min`) so numbers never jitter horizontally as values tick.
- **Constraint:** Maximum **2 font families** and **2 font weights** visible on any single screen.

### Modular Type Scale
| Role | Token | Font Family | Weight | Size (`px` / `rem`) | Line Height | Tracking | Usage |
|---|---|---|---|---|---|---|---|
| Moment Hero | `--text-hero` | `Fredoka` | `600` | `28px` / `1.75rem` | `1.15` (`32px`) | `-0.01em` | Welcome headline, `"You made it!"` arrival card |
| Sheet / Card Title | `--text-title` | `Fredoka` | `600` | `20px` / `1.25rem` | `1.2` (`24px`) | `-0.01em` | Destination place name, Sheet header |
| Greeting Bubble | `--text-greeting` | `Fredoka` | `600` | `16px` / `1.0rem` | `1.25` (`20px`) | `0` | `"Where to, {name}?"` speech bubble |
| Body / List Row | `--text-body` | `Plus Jakarta Sans` | `500` / `700` | `16px` / `1.0rem` | `1.5` (`24px`) | `0` | Search input, Search/Menu/Event row title, Primary CTA |
| Secondary / Meta | `--text-meta` | `Plus Jakarta Sans` | `500` | `14px` / `0.875rem` | `1.4` (`20px`) | `0` | Distance & walk time (`145 m · ~2 min walk`) |
| Caption / Chip | `--text-caption` | `Plus Jakarta Sans` | `500` / `700` | `13px` / `0.8125rem` | `1.35` (`18px`) | `+0.01em` | Form labels, `"Near CSE Block"`, Walk stat chips |
| Signpost Tag | `--text-signpost` | `Fredoka` | `600` | `12px` / `0.75rem` | `1.2` (`14px`) | `+0.01em` | 3D camera-facing building name tags (max 3 visible) |

---

## Color System (`/color-system`)

### 1. Neutral & Surface Stack (`/law-of-figure-ground`)
| Token | Hex / Value | Contrast on `#FFFDF9` | Role & Usage |
|---|---|---|---|
| `--ink-900` | `#1D2440` | `15.1:1` (AAA) | Primary text, headings, active icons |
| `--ink-700` | `#394160` | `9.6:1` (AAA) | Secondary body copy, active chip text |
| `--ink-500` | `#5B6384` | `5.8:1` (AA) | Muted text, captions, placeholders, walking time |
| `--surface-base` | `#FFFDF9` | `1.0:1` | Warm alabaster surface for all HUD cards, pills, and sheets |
| `--surface-subtle` | `#F7F4EC` | `1.08:1` | Recessed inputs, unselected customization chips, secondary buttons |
| `--surface-scrim` | `rgba(29, 36, 64, 0.34)` | N/A | Flat warm-navy dim overlay behind modal sheets (replaces banned backdrop-blur) |
| `--border-hairline` | `rgba(29, 36, 64, 0.08)` | N/A | `1px` outer perimeter on `#FFFDF9` cards (prevents bleed over `#FFF1DC` cream paths) and single-edge list dividers |
| `--border-highlight` | `rgba(255, 255, 255, 0.95)` | N/A | `1px` top inner highlight (`inset 0 1px 0 0`) on cards and pills |

> **Contrast Bans:** Never use `#6C63FF` for primary buttons with white text (`4.3:1`, fails AA). Never use `#8A90AD` for muted text on cards (`3.1:1`, fails AA).

### 2. Brand Primary Tonal Scale (`#5A4FE8` Anchor)
| Token | Hex | Role & Usage |
|---|---|---|
| `--primary-50` | `#F2F1FE` | Subtle category pill background, active search row highlight |
| `--primary-100` | `#E4E1FD` | Selected trait chip fill in Character Creation |
| `--primary-200` | `#C6C0FA` | Focus ring border (`2px solid`), OTP active box border |
| `--primary-500` | `#5A4FE8` | **Primary Action CTA** (`Let's Go`, `Looks good`, `Done`) — `5.65:1` with `#FFFFFF` text; also paw-print route trail fill |
| `--primary-600` | `#483DD4` | Primary button `:hover` / `:active` pressed fill |
| `--primary-700` | `#382EB8` | High-contrast text inside `--primary-50` / `--primary-100` badges (`8.2:1`) |

### 3. 3D Diorama World & Semantic Roof Pastels (`/law-of-similarity`)
| Token | Hex | Contrast w/ `#1D2440` | Semantic Category Mapping (`Law of Similarity`) |
|---|---|---|---|
| `--sky-top` | `#EEF0FF` | N/A | 3D world zenith background |
| `--sky-bottom` | `#FFF4EC` | N/A | 3D world horizon background |
| `--world-grass` | `#CDEBC5` | N/A | Mint campus ground plane |
| `--world-path` | `#FFF1DC` | N/A | Cream walking paths (`#EDD8B8` subtle curb edge) |
| `--world-wall` | `#FFF6EB` | N/A | Extruded clay building walls (`roughness: 0.88`) |
| `--roof-sky` | `#BFE0FF` | `11.8:1` | **Engineering & Tech Departments:** `CSE`, `ME`, `ARC`, `E1`, `COE`, `GAL`, `PIV`, `X1` |
| `--roof-lilac` | `#C9BFFF` | `10.4:1` | **Academic & Central Facilities:** `LIB`, `AUDI`, `AT`, `MBA`, `PU`, `SIC`, `S1`, `T1` |
| `--roof-butter` | `#FFE59A` | `12.6:1` | **Food & Canteens:** `C1`, `C2`, `C3` |
| `--roof-peach` | `#FFC9B0` | `11.1:1` | **Admin, Gate & Worship:** `ADM`, `GATE`, `TEMP` |
| `--roof-mint` | `#B7E8D2` | `12.1:1` | **Junctions & Waypoints:** `J1`, `J2`, `J3` |
| `--accent-event` | `#FF8A5B` | `8.4:1` (ink only) | **3D Event Pins & Badges ONLY** — never use as text color, never pair with white text |
| `--accent-pet` | `#FF8FB1` | `8.7:1` (ink only) | Pet collar/heart accent & Arrival confetti |

*Dense Cluster Contrast Rule (`C1/C2/C3/CSE`, `GAL/PIV`):* In 3D space, adjacent buildings within `<15m` apply a `±6%` lightness shift to their roof material while keeping their exact category dot color on Signpost tags and Search rows.

### 4. Semantic Status Tokens (AA Verified)
| State | Surface Fill | Text / Icon Ink | Contrast | Usage |
|---|---|---|---|---|
| **Success** | `#E8F8EE` | `#18633A` | `7.1:1` | Live GPS active dot, Arrival confirmation pill |
| **Warning** | `#FFF5E0` | `#7A4B00` | `6.4:1` | Demo Mode active badge, `"Taking a different way? Rerouting…"` banner |
| **Error / Stop** | `#FFEBEB` | `#9E2222` | `6.8:1` | OTP mismatch alert (`"That code didn't match. Try again?"`), Walk Mode `Stop` button |
| **Info** | `#EDF3FF` | `#24479E` | `6.9:1` | Dense cluster disambiguation prompt (`"Near CSE / Canteen Cluster"`) |

---

## Spacing System (`/spacing-system` & `/law-of-proximity`)
- **Base Unit:** `4px` / `8px` (`--sp-2xs: 2px`, `--sp-xs: 4px`, `--sp-sm: 8px`, `--sp-md: 16px`, `--sp-lg: 24px`, `--sp-xl: 32px`, `--sp-2xl: 48px`, `--sp-3xl: 64px`).
- **Density Mode:** Comfortable (touch-first mobile ergonomics).
- **Law of Proximity Ratios (Mandatory):**
  - **Within-group spacing (`4px–8px`):** Form label to input (`4px`), place title to category/walk-time subtitle (`4px`), icon to label inside chips (`6px`), bottom dock search pill to menu orb (`10px`).
  - **Between-group spacing (`16px–24px`):** Form field to next form field (`16px`), card header to primary CTA row (`16px`), sheet section to next section (`24px`).
  - **Rule:** Never add a box border where `16px–24px` of whitespace already communicates separation.

---

## Layout Grid & Viewport Architecture (`/layout-grid`)
- **Mobile (`320px–480px`):** 4-column fluid grid, `16px` outer horizontal margins (`--sp-md`), `12px` gutters. Bottom controls pad with `max(16px, env(safe-area-inset-bottom))`.
- **Tablet / Desktop / Classroom Projector (`>480px`):**
  - **3D Diorama Canvas:** Always full-bleed `100vw × 100dvh`.
  - **HUD & Bottom Sheets Shell:** Constrained to `max-width: 430px` centered horizontally (`margin: 0 auto`, `left: 0; right: 0`) so the search pill, destination card, and sheets retain crisp phone proportions on a `1920×1080` classroom projector.
- **Vertical Viewport Budget (Explore & Fly-To):**
  - **Upper-Middle Focal Zone (`0%–58% vh`):** Reserved for 3D landmarks during Camera Fly-To, max 3 Signpost name tags, and at most 1 nearby Event pin.
  - **Character & Greeting Zone (`58%–74% vh`):** Character and pet stand in the lower third; speech bubble (`"Where to, {name}?"` + interactive `"Near {Place}"` caption) sits immediately above the character.
  - **Thumb Zone HUD (`74%–100% vh`, max `220px`):** Houses the `52px` Search Pill + `52px` Menu Orb on Home, or the Destination Card (`max-height: 220px`), or the Walk Mode bottom bar.
- **Shape & Elevation Tokens:**
  - Sheet / Card radius: `28px` (`--radius-card`)
  - Search & Walk bottom bar radius: `9999px` (`--radius-pill`)
  - Chips & Secondary buttons radius: `16px` (`--radius-chip`)
  - Touch targets: `min-width: 44px; min-height: 44px` on every interactive element.
  - Card shadow (`--shadow-card`): `0 12px 28px -4px rgba(90, 79, 232, 0.18), 0 4px 10px -2px rgba(90, 79, 232, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)`

---

## Gestalt Principles Mapping
1. **Law of Figure-Ground (`/law-of-figure-ground`):** Three strict planes — **Ground** (`z-0` 3D Clay World), **Figure HUD** (`z-20..35` `#FFFDF9` cards with purple shadow + `1px` hairline + `1px` top inner highlight), and **Modal Sheet / Moment** (`z-40` flat warm scrim `rgba(29,36,64,0.34)` + `z-50` sheet). Zero backdrop blur.
2. **Law of Common Region (`/law-of-common-region`):** Used only for top-level floating HUD containers (Destination Card, Bottom Sheets, Greeting Bubble, Stat Chips). Never nest bordered cards inside a bottom sheet.
3. **Law of Proximity (`/law-of-proximity`):** Drives internal hierarchy inside cards and sheets (`4px` label-to-value vs. `16px` group-to-group). Tapping the `"Near {Place}"` caption inside the greeting bubble opens the `"I'm at: [Place]"` picker because it is spatially bound to the user's avatar.
4. **Law of Similarity (`/law-of-similarity`):** Primary CTAs (`Let's Go`, `Looks good`, `Take me there`, `Done`) exclusively share `#5A4FE8` fill + white bold text + `16px` radius. 3D Signpost tags use `#FFFDF9` fill + `12px Fredoka` + category color dot so static labels never impersonate primary buttons.
5. **Law of Continuity (`/law-of-continuity`):** In Walk Mode, pet paw prints are spaced every `3.5m` along the A* polyline and pulse sequentially toward the next turn; in Search and Events sheets, all text titles align to a continuous `56px` left vertical axis (after the `40px` landmark badge).
6. **Law of Closure (`/law-of-closure`):** In Character Creation (`8.3`), the horizontal chip rail clips the 4th option at `50%` width on the right viewport edge to imply horizontal scrollability without scrollbars. Inside sheets, `1px` single-edge dividers (`rgba(29,36,64,0.07)`) imply row boundaries without full boxes.

---

## Motion & Camera Choreography
- **UI Spring Default (Framer Motion):** `type: "spring", stiffness: 300, damping: 20` on bottom sheets, destination cards, and landmark pop highlights.
- **Button Squash-and-Stretch:** `whileTap={{ scaleX: 1.04, scaleY: 0.94 }}`, `transition={{ type: "spring", stiffness: 500, damping: 22 }}`.
- **Camera Fly-To (`5.1`):** `1.4s` cubic-bezier ease-in-out (`[0.22, 1, 0.36, 1]`), framing the target landmark at `y = 38% vh` so the `220px` Destination Card never occludes it. Interruptible mid-flight.
- **Reduced Motion (`prefers-reduced-motion: reduce`):** Replaces `1.4s` camera fly-to with a `250ms` cross-fade + instant camera snap, and disables continuous idle landmark oscillations.

---

## Decisions Log
| Date | Decision | Rationale |
|---|---|---|
| 2026-10-17 | Locked Variant A ("Soft Diorama Classic") | Preserves `Fredoka` + `Plus Jakarta Sans`, floating 52px pill + orb dock, and purple-tinted elevation from `campus-world-context.md`. |
| 2026-10-17 | Bound `"I'm at:"` picker & Demo indicator to Greeting Bubble caption (`1A`) | Gives 1-tap location switching during the 5-min graded demo without violating the "No top bar" declutter rule. |
| 2026-10-17 | Added Walk Mode Demo Pacing Pill (`[Pause/Pet Sits · 1× · 4×]`) (`3A`) | Prevents a 2-minute dead zone during the 5-minute demo while letting the presenter trigger the "pet sits" state on demand. |
| 2026-10-17 | Email OTP with masked `••••••` + `"Peek code"` toggle (`7B`) | Preserves Demo Script Beat #1 ("character covers eyes and peeks") while using passwordless Email OTP. |
| 2026-10-17 | Procedural Three.js Clay Chibi Rigs + Auto-Footprint Fallback (`7D`) | Eliminates Blender dependency and unblocks Week 1 3D campus rendering while GeoJSON footprints are traced. |
