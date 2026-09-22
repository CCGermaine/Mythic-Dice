import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  appType: "mpa",
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
});
