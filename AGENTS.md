# Working on Modvind

Modvind is a static Vite + TypeScript + Three.js browser game deployed to GitHub Pages.

## Commands

- Install with `npm ci` (Node 22.12+ recommended).
- Develop with `npm run dev`; the app lives under `/modvind/`.
- Run `npm test` for simulation and input checks.
- Run `npm run build` for TypeScript validation and the production bundle.
- On Windows PowerShell, use `npm.cmd` if script execution policy blocks npm.

## Architecture and constraints

- Keep deterministic gameplay in `src/simulation.ts`; use seconds and the existing 1/120-second fixed step. Keep rendering and audio out of simulation.
- Route chapters and landmarks belong in `src/route.ts`. The 2,000 game metres are compressed fiction, not measured navigation. Preserve MCH Arena → central Herning → Birk → AU Herning ordering.
- Procedural models live in `src/models.ts`; camera and rendering in `src/world.ts`.
- Keyboard and simultaneous pointer holds are managed by `src/pedal-input.ts`. Clear held controls on pause, restart and focus loss.
- `src/audio.ts` synthesizes original audio through Web Audio. Create/resume audio only after a user gesture, honor the saved mute setting, and silence music when paused or finished. Audio failures must never block the game.
- Keep the game static and self-contained: no backend, live Maps dependency, or externally hosted runtime assets.
- Maintain keyboard, touch, narrow-screen layouts and accessible button names/focus states.
- Social metadata is in `index.html`; preview assets are in `public/`. Keep absolute share URLs aligned with the published site.

## Validation and deployment

Run tests and build after gameplay changes. For UI/audio changes, check the browser at desktop and mobile widths, including start, mute, pause/resume and restart. Add tests for meaningful new behavior rather than copying implementation details.

`main` deploys automatically via `.github/workflows/pages.yml` to https://urcraft.github.io/modvind/. Keep the Vite base `/modvind/`. Do not commit `dist/`, `node_modules/`, or temporary test artifacts. Publish only when requested; check the deployment result after pushing a release.
