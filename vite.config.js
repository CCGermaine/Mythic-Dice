import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = dirname(fileURLToPath(import.meta.url));
const pagesOrigin = "https://ccgermaine.github.io";
const pagesBase = "/Mythic-Dice/";

// Owlbear loads icon, popover, and background_url as origin + path.
// The origin is the domain only, so "/icon.svg" becomes
// https://ccgermaine.github.io/icon.svg. A full https URL is left as-is.
function absoluteManifestPath(value) {
  if (typeof value !== "string" || value.startsWith("http")) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${pagesOrigin}${pagesBase.slice(0, -1)}${path}`;
}

function rewriteProductionManifest() {
  return {
    name: "absolute-manifest-urls",
    apply: "build",
    closeBundle() {
      const file = resolve(root, "dist/manifest.json");
      const manifest = JSON.parse(readFileSync(file, "utf8"));
      if (manifest.icon) manifest.icon = absoluteManifestPath(manifest.icon);
      if (manifest.action) {
        manifest.action.icon = absoluteManifestPath(manifest.action.icon);
        manifest.action.popover = absoluteManifestPath(manifest.action.popover);
      }
      if (manifest.background_url) {
        manifest.background_url = absoluteManifestPath(manifest.background_url);
      }
      writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Dev stays at the origin root. The production site is a project page.
  base: command === "build" ? pagesBase : "/",
  plugins: [rewriteProductionManifest()],
  appType: "mpa",
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        background: resolve(root, "background.html"),
      },
    },
  },
  server: {
    cors: {
      origin: ["https://www.owlbear.rodeo", "https://owlbear.rodeo"],
    },
    headers: {
      "Access-Control-Allow-Private-Network": "true",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
    fs: {
      allow: [
        "/home/manny/Work/mythic-dice",
      ],
    },
    port: 5173,
    strictPort: true,
  },
}));
