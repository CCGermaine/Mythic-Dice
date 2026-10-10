# Hosting

Pages serves the orphan branch `gh-pages` from its root. `main` is source only. `dist/` stays gitignored on `main`.

The install URL is https://ccgermaine.github.io/Mythic-Dice/manifest.json. The live manifest uses full `https://ccgermaine.github.io/Mythic-Dice/…` addresses for the icon, popover, and background page. Owlbear joins a manifest path onto the domain only, so a leading slash would miss `/Mythic-Dice/`. `public/manifest.json` stays root-relative so `http://localhost:5173/manifest.json` still works in dev. The production build rewrites the copy in `dist/`.

`npm run build` must be run before a deploy. Publish the contents of `dist/` at the root of `gh-pages`, not inside a `dist/` folder. Keep `.nojekyll`. Do not `git add dist/*` from the repo root.

GitHub Actions has to be enabled on the CCGermaine account. A branch deploy still runs as an Actions job. If Actions is disabled, Pages reports a queued build and never publishes.

Local checkout is `/home/manny/Work/mythic-dice`, branch `master`, tracking `origin/main`.
