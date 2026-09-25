# MODVIND — The Commute to Herning

A small browser game about a very persistent Danish headwind. Ride from MCH Arena to AU Herning through central Herning in a roughly one-minute arcade commute.

Made on **25 September 2026** at **AU BTECH** during an **ARTIG session on Coding agents**.

## Run

Play online: https://urcraft.github.io/modvind/

GitHub Actions tests, builds, and publishes `main` to GitHub Pages. Vite uses the `/modvind/` base path so scripts, fonts, and styles load correctly on the project site.

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` produces the deployable `dist/` directory; `npm run preview` serves that build. The game and fonts are bundled locally, with no backend, map API, or external runtime assets. WebGL is required.

## Controls

- Hold **Space** to pedal continuously. Release it to coast; the headwind will eventually push you backwards.
- **Up/Down** or **W/S** changes between three lanes.
- **P/Escape** pauses and resumes; the pause menu also offers a restart.
- Touch: hold **PEDAL**, with the arrow buttons for lane changes. Both controls can be used together.

Energy drains over time; puddles, sheep and tractors cause additional loss and slow you down. Rundstykker restore energy and boost pedaling for three seconds. Without pedaling, the headwind pushes you backwards. Reach campus before running out of energy. Your best distance is stored in this browser, with graceful fallback if storage is unavailable. Switching tabs or losing window focus pauses the game.

## Route and visual references

The current short route goes MCH Arena → city approach → Bredgade → Torvet / Herning Kirke → Østergade → Silkeborgvej corridor → Birk Centerpark → AU Herning. It has **2,000 game metres** and targets **45–75 seconds** of skilled play. These compressed distances are not real-world route measurements or navigation directions. The original longer 7.4 km countryside route has been replaced.

City scenery includes shopfronts, sidewalks, streetlights, the paved town square and a simplified red-brick Herning Kirke with clock and slate spire. MCH Arena, neighboring Boxen and the white AU campus remain the start/end landmarks. Shops and obstacle locations are fictional. Three lanes are a gameplay abstraction.

References:
- [Herning municipality: Torvet, Bredgade and Østergade](https://kommuneplan2025.herning.dk/kommuneplanrammer/herning-bymidte-11/11c4)
- [Herning Kirke](https://herningkirke.dk/)
- [MCH Arena and adjacent Boxen](https://www.mch.dk/om-os/lokationer/mch-arena)
- [AU campus architecture](https://omnibus.au.dk/arkiv/vis/artikel/campus-guide-herning-bliv-gode-venner-med-receptionisten-heidi-og-nyd-den-taette-relation-med-baade-undervisere-og-studerende)

The original concept image is a design reference only and is not loaded by the game. Short-route records use their own local-storage key so scores from the previous longer route do not carry over.

## Project structure and checks

- `src/simulation.ts`: deterministic fixed-step rules, tuning and seeded obstacle schedule.
- `src/route.ts`: ordered chapters and landmark positions.
- `src/models.ts` and `src/world.ts`: procedural Three.js models, camera and rendering.
- `src/pedal-input.ts`: independent keyboard/pointer hold state, cleared on pause, restart and focus loss.
- `src/main.ts` and `src/style.css`: keyboard/touch input, HUD and lifecycle screens.

`npm test` checks drift, score, lane changes, collisions, invulnerability, pickups, terminal states, obstacle spacing, route order, frame-rate independence and a complete simulated commute. `npm run build` checks TypeScript and creates the production bundle.

An original Web Audio soundtrack and synthesized lane, collision, pickup and finish effects start after pressing LET’S RIDE. The header sound button mutes both music and effects and remembers your choice. Music pauses with the game. No audio files or third-party recordings are used. Open Graph and Twitter metadata provide a rich sharing preview using the original concept artwork. Desktop and narrow-screen browser layouts are supported; actual mobile GPU performance depends on the device.
