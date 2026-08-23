import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// satellite.js only exports its barrel ("."), but we need the pure-JS subpath
// files (io/propagation/transforms) directly to keep the satellite worker's
// dependency graph free of the optional WASM build (which can't bundle in a
// worker due to top-level await + node:worker_threads). These aliases bypass
// the package's restricted exports map and point at the files on disk.
const satDist = fileURLToPath(
  new URL("./node_modules/satellite.js/dist/", import.meta.url)
);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5100,
    proxy: {
      // TeleGeography does not expose browser CORS headers. Keep the client on
      // a same-origin URL, just like the globe.gl reference example's proxy.
      "/api/telegeography/cables": {
        target: "https://www.submarinecablemap.com",
        changeOrigin: true,
        rewrite: () => "/api/v3/cable/cable-geo.json",
      },
      "/api/telegeography/cable/": {
        target: "https://www.submarinecablemap.com",
        changeOrigin: true,
        rewrite: (path) => `/api/v3/cable/${path.split("/").pop()}.json`,
      },
    },
  },
  worker: { format: "es" },
  resolve: {
    alias: {
      "satellite.js/dist/io.js": satDist + "io.js",
      "satellite.js/dist/propagation.js": satDist + "propagation.js",
      "satellite.js/dist/transforms.js": satDist + "transforms.js",
    },
  },
  // Force a single hoisted `three` instance shared by react-globe.gl, globe.gl,
  // three-globe and three-render-objects. Without this, Vite's optimizer can
  // bundle two copies of three into the same chunk, which triggers three.js's
  // "Multiple instances of Three.js being imported" warning and breaks the
  // objects-layer visibility checks (undefined-length crash).
  optimizeDeps: {
    include: ["three", "three-globe", "globe.gl", "react-globe.gl"],
  },
});
