# Pixel Character System for the Campus Navigation Project

## 1. Core Direction

The campus navigation project should use **small, expressive 2D pixel characters** rather than generic 3D avatars.

The visual goal is:
- A living 2D pixel-art campus
- Simple, expressive characters
- Animal Crossing-like simplicity
- Classic Pokémon-style pixel-world scale as a conceptual reference, not a clone
- Characters that feel like actual inhabitants of the campus
- Customizable characters without creating a completely new sprite for every combination

> **The world has the personality. The UI has the discipline.**

The campus itself should feel handcrafted and alive. Characters should be small enough that the environment remains the main visual focus.

---

## 2. Recommended Tools

### Aseprite — Best Overall Choice

**Aseprite** is the strongest choice for a serious custom pixel-character system.

Useful features:
- Pixel-perfect drawing
- Layers
- Animation
- Onion skinning
- Multiple frames
- Sprite-sheet export
- Texture atlas workflows
- Palette management

https://www.aseprite.org/

Aseprite is especially useful because the character can be designed as separate visual layers:

```text
CHARACTER
│
├── Body
├── Skin
├── Hair
├── Face
├── Shirt
├── Pants
├── Shoes
├── Backpack
└── Accessory
```

This makes the character system modular instead of requiring one giant image for every combination.

### Pixelorama — Free/Open-Source Alternative

**Pixelorama** is a strong free alternative.

https://pixelorama.org/

Useful features:
- Pixel-art tools
- Layers
- Frame-by-frame animation
- Onion skinning
- Tilemap support
- Sprite-sheet workflows
- Open-source

Since the project is being developed on Linux/Arch, Pixelorama is worth trying before buying anything.

### Pixel Paperdoll — Character-System Reference

https://devdvdt.itch.io/pixel-paperdoll

Pixel Paperdoll is useful because its concept is close to the desired character architecture: modular body, hair, face, outfit and accessories.

The important lesson is the idea of **swappable character components**.

### UnitForge — Quick Experimentation

https://www.unitforge.net/character

Useful for quickly experimenting with character combinations and sprite sheets before spending significant time creating final assets.

---

## 3. AI Pixel-Art Generators

AI tools can be useful for:
- Character ideation
- Exploring silhouettes
- Trying clothing concepts
- Generating visual references
- Exploring color palettes

However, AI-generated sprites should **not** be the foundation of the final character pipeline.

The problem is consistency.

The project needs to support:

```text
Same character
    +
different shirt
    +
different hair
    +
backpack
    +
4 directions
    +
6-frame walking animation
```

AI-generated sprites can become inconsistent when the same character needs to be reproduced across many combinations and animation frames.

Therefore:

> **Use AI for ideation. Use Aseprite/Pixelorama for final controlled assets.**

---

## 4. Recommended Production Pipeline

```text
Aseprite / Pixelorama
        ↓
Character sprite layers
        ↓
Sprite sheets / texture atlases
        ↓
PixiJS
        ↓
Web application
```

Application stack:

```text
Next.js / React / TypeScript
        │
        ├── UI
        ├── Search
        ├── Character customization
        ├── Events
        └── User profile
                │
                ↓
             PixiJS
                │
                ├── Campus world
                ├── Player
                ├── Pet
                ├── NPCs
                ├── Camera
                └── Animations
```

Anime.js can be used separately for UI and cinematic transitions.

---

## 5. Character Scale

The character should be intentionally small.

Suggested starting scale:

```text
World tile:
16 × 16 px

Character:
approximately 24 × 32 px

Walking animation:
4–6 frames

Directions:
    Down
    Up
    Left
    Right
```

The character should **not dominate the screen**.

The campus should feel huge compared with the player.

The intended feeling is:

> "I am a tiny person walking around my college."

rather than:

> "I am controlling a giant game character."

---

## 6. Character Layer Architecture

Every character part should use the same canvas dimensions and alignment.

```text
Player
│
├── Shadow
├── Body
├── Skin
├── Hair
├── Face
├── Shirt
├── Pants
├── Shoes
├── Backpack
└── Accessory
```

Every layer must share:
- Same canvas size
- Same origin
- Same frame count
- Same direction order
- Matching pixel alignment

For example:

```text
hair_messy.png
shirt_black.png
pants_jeans.png
shoes_01.png
```

can all be composited over the same body.

---

## 7. Character Configuration

The user's character should be represented as data rather than a single generated image.

Example:

```json
{
  "character": {
    "body": "body_02",
    "skin": "skin_03",
    "hair": "hair_07",
    "shirt": "shirt_04",
    "pants": "pants_02",
    "shoes": "shoes_01",
    "accessory": "cap_03"
  }
}
```

The application reads this configuration and assembles the correct sprite layers.

The database therefore stores selected components rather than a generated character image.

---

## 8. Start Small

Do not create hundreds of assets initially.

Start with:

```text
Hair        → 3 styles
Shirts      → 3 styles
Pants       → 3 styles
Shoes       → 2 styles
Accessories → 3 styles
Backpacks   → 2 styles
```

This gives:

```text
3 × 3 × 3 × 2 × 3 × 2 = 324 combinations
```

without drawing 324 complete characters.

---

## 9. Character Animation States

The first version only needs:

### Idle

```text
idle_down
idle_up
idle_left
idle_right
```

### Walking

```text
walk_down
walk_up
walk_left
walk_right
```

Later:

```text
run
sit
wave
celebrate
interact
sleep
look_left
look_right
```

Do not build every animation initially.

Get the character moving naturally through the campus first.

---

## 10. Character Customization

Possible flow:

```text
CREATE YOUR CHARACTER

        [Character Preview]

Hair
[ Short ] [ Messy ] [ Long ]

Shirt
[ White ] [ Black ] [ Blue ]

Pants
[ Jeans ] [ Black ] [ Beige ]

Accessory
[ None ] [ Cap ] [ Headphones ]

             [ DONE ]
```

The preview should use the same sprite layers that are eventually used inside the campus.

The character selected during onboarding should be the **exact same character** that later walks around the campus.

---

## 11. Character as a Real Inhabitant

The character should not feel like a UI avatar placed on top of a map.

It should actually exist inside the world.

Example experience:

```text
Search "Mechanical"
        ↓
Camera moves toward Mechanical Block
        ↓
User presses "Let's Go"
        ↓
Route is calculated
        ↓
Character starts walking
        ↓
Camera follows
        ↓
Pet follows
        ↓
Character reaches Mechanical
        ↓
Arrival animation
```

This is the central experience.

---

## 12. Pet System

The pet should use a similar entity architecture.

States:

```text
FOLLOW
IDLE
WALK
RUN
SIT
CELEBRATE
```

The pet should not follow perfectly like a GPS marker.

Instead:

```text
Player walks
      ↓
Pet follows
      ↓
Pet occasionally stops
      ↓
Pet wanders 1–2 tiles
      ↓
Pet catches up
```

That small amount of imperfection makes it feel alive.

The pet should behave more like a companion than a navigation indicator.

---

## 13. NPCs

Later, simple student NPCs can make the campus feel alive.

They do not need sophisticated AI.

A simple schedule system is enough:

```text
Classroom
    ↓
Corridor
    ↓
Cafeteria
    ↓
Classroom
    ↓
Exit
```

NPCs can use the same pathfinding system as the player.

---

## 14. Pixel-Art World

The character system only works if the campus itself follows the same visual language.

The world should contain:

```text
Grass
Dirt
Stone
Water
Paths
Roads
Trees
Bushes
Flowers
Rocks
Benches
Lamps
Fences
Buildings
Signs
Students
Bicycles
Cats
Fountains
```

The world should not be a direct Google Maps conversion.

GPS coordinates should only act as anchors.

---

## 15. GPS → Pixel World

The conversion should be:

```text
GPS coordinates
       ↓
Campus coordinate system
       ↓
Tile coordinates
       ↓
Navigation graph
       ↓
Pixel-art world
```

Do not directly use latitude/longitude as rendering coordinates.

The game world needs its own coordinate system.

### Important Principle

GPS points tell us approximately where destinations are.

They do **not** tell us:
- Building footprints
- Walking paths
- Entrances
- Stairs
- Courtyards
- Gardens
- Obstacles
- Decorative areas

Therefore:

> **GPS coordinates should anchor the world, not generate the world.**

The final map should be manually art-directed.

---

## 16. Campus Scale

Using the current campus GPS points, the approximate footprint is:

```text
East-West:  ~159 m
North-South: ~275 m
```

A useful game scale is:

```text
1 tile ≈ 2 meters

Tile size:
16 × 16 px

World:
≈ 80 tiles wide
≈ 138 tiles tall
```

Rendered world:

```text
≈ 1280 × 2208 px
```

At a mobile viewport around:

```text
390 × 844 px
```

the user sees approximately:

```text
24 × 52 tiles
```

This is a good scale for a classic top-down pixel world.

---

## 17. Current Campus Anchor Layout

Based on the current GPS anchors, the rough north-to-south distribution is:

```text
                         NORTH
                           ↑

                     TEMPLE
                       🛕
                       │
                    PU AREA
                       │

 SIC                 J3
                     AUDI

 ARCHITECTURE        LIBRARY

                          MBA

                     AMPHITHEATRE

                          MECH       GALLERY

               CSE
               IT

                          GATE

               COE       ADM
               ECE

                         SOUTH
```

This is only a spatial reference.

Actual roads, paths, buildings and scenery should be designed manually.

---

## 18. Building Design

Buildings should not simply be rectangles.

Each important building should have:
- Distinct silhouette
- Roof
- Entrance
- Windows
- Signs
- Vegetation
- Small environmental details
- A recognizable landmark

Examples:

```text
CSE
→ computer-inspired environmental landmark

Mechanical
→ gear / mechanical assembly

ECE
→ circuit/chip-inspired detail

AI/ML
→ small robot-inspired detail

Library
→ open-book-inspired detail

MBA
→ briefcase-inspired detail
```

These should be physical objects inside the world rather than floating emoji or giant UI icons.

---

## 19. Overall Technical Architecture

```text
                    NEXT.JS / REACT
                          │
             ┌────────────┴────────────┐
             │                         │
          React UI                  PIXI GAME
             │                         │
             │                ┌────────┼────────┐
             │                │        │        │
             │              Map      Player    Pet
             │                │        │        │
             │             Tilemap   Sprite   Sprite
             │                │        │        │
             └────────────────┴────────┴────────┘
                              │
                         GAME STATE
                              │
                 ┌────────────┼────────────┐
                 │            │            │
                GPS          A*        Character
                 │            │          Config
                 └────────────┼────────────┘
                              │
                         BACKEND/API
                              │
                          PostgreSQL
```

---

## 20. Recommended Technology Stack

### Frontend

```text
Next.js
React
TypeScript
```

Responsible for:
- Authentication
- Search
- Character customization
- Events
- Profile
- Menus
- Settings

### World Renderer

```text
PixiJS
```

Responsible for:
- Pixel-art world
- Tilemap
- Sprites
- Character rendering
- Pet rendering
- NPCs
- Camera
- Animation
- Collision
- World interaction

### Animation / UI Motion

```text
Anime.js
```

Useful for:
- Camera fly-to
- Menu transitions
- Search transitions
- Destination reveal
- Arrival animation
- UI microinteractions

### Navigation

```text
A*
```

Used for:
- Walking routes
- Player movement
- NPC movement
- Pet movement

### Backend

```text
PostgreSQL
```

Stores:
- Users
- Character configuration
- Campus locations
- Events
- Campus passport
- User preferences

---

## 21. Why PixiJS Instead of Three.js?

The core world is fundamentally 2D.

Therefore:

```text
PixiJS
    ↓
2D rendering
    ↓
Pixel art
    ↓
Sprites
    ↓
Tilemaps
    ↓
Simple camera
```

is a better fit than introducing a full 3D engine.

Three.js should only be considered later if the project genuinely needs:
- 3D elements
- 3D buildings
- 3D parallax
- WebGL-based 3D effects
- Hybrid 2D/3D scenes

For the current concept:

> **PixiJS is enough.**

---

## 22. The Vertical Slice

Do **not** create the entire campus first.

Build one tiny working section.

Recommended area:

```text
Gallery
Mechanical
Amphitheatre
MBA
```

Create only:

```text
Grass
Trees
Paths
4 buildings
1 player
1 pet
```

Then make the complete interaction work:

```text
Spawn
  ↓
Walk
  ↓
Camera follows
  ↓
Search "MECH"
  ↓
Camera fly-to
  ↓
Press "Let's Go"
  ↓
A* calculates route
  ↓
Character walks
  ↓
Pet follows
  ↓
Arrival animation
```

If this works, the entire product concept is proven.

Then expand the map.

---

## 23. The Key Product Philosophy

The project should NOT feel like:

```text
Google Maps
+
a game character
```

It should feel like:

```text
A tiny living pixel-art version of my college.
```

The user is not simply navigating a map.

They are:
- Living inside the campus
- Walking through it
- Discovering places
- Building a personal character
- Having a companion
- Seeing other students
- Exploring landmarks
- Returning to familiar places

Navigation becomes a natural part of the world rather than the entire product.

---

# 24. Final Recommendation

For the character creation workflow:

```text
                 DESIGN
                   │
           Aseprite / Pixelorama
                   │
                   ↓
          Modular Sprite Layers
                   │
                   ↓
             Sprite Atlases
                   │
                   ↓
                 PixiJS
                   │
                   ↓
       Character inside Campus World
```

### Best practical choice

**Aseprite → custom modular sprite system → PixiJS**

### Free workflow

**Pixelorama → custom modular sprite system → PixiJS**

Use Pixel Paperdoll and UnitForge as references/prototyping tools.

Use AI generation for visual exploration and references, not as the final asset pipeline.

The end result should be a small, modular, animated character that can be customized by the user and then actually **live inside the pixel-art campus world**.
