# AGENTS.md

Mythic Dice is an Owlbear Rodeo extension for a Mythic Bastionland table. Vite and `@owlbear-rodeo/sdk`.

- Dev: `npm install && npm run dev`. Build: `npm run build`.
- Install link for players: https://ccgermaine.github.io/Mythic-Dice/manifest.json (see `README.md`).
- How rolls behave: `docs/how-it-works.md`. How the public site is updated: `docs/hosting.md`.
- Source art lives in `art/` (not shipped). `dice-renders/` and Krita files are gitignored.

## Cursor Cloud specific instructions

- Install with `npm ci`. Dev server is `npm run dev -- --host 0.0.0.0 --port 5173` (`strictPort` is 5173).
- Tests are Node’s runner: `node --test src/dice.test.js`. There is no `npm test` script.
- The popover works outside Owlbear and stays on “Waiting for Owlbear…”. Die buttons stay disabled until a token is attached inside Owlbear. Color swatches still swap the preview art.
