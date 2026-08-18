import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { NIGHT } from "./pwa-theme";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' not 'autoUpdate': an in-progress set (weight/reps typed but
      // not yet saved) lives only in React state. A silent auto-reload could
      // wipe it. Updates apply only when the user taps the toast.
      registerType: "prompt",
      // No includeAssets: favicon.ico/icon-master.svg are already matched
      // by globPatterns below (ico/svg) — listing them again here would
      // just duplicate their precache entries. Same reason for
      // includeManifestIcons: false — the manifest.icons entries below are
      // already matched by the png glob.
      includeManifestIcons: false,
      manifest: {
        name: "The Log",
        short_name: "The Log",
        description: "One-handed strength log for mid-workout entry.",
        theme_color: NIGHT,
        background_color: NIGHT,
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Fonts are self-hosted (@fontsource) specifically so they're
        // precached here — the app has no other network dependency.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // The Progress tab's chart library is lazy-loaded specifically to
        // keep it out of the initial load (see React.lazy in App.tsx) — do
        // not undo that by precaching it on install. Cache it at runtime
        // instead, the first time it's actually requested, so it's still
        // available offline after that one visit.
        globIgnores: ["**/ProgressView-*.js"],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/ProgressView-.*\.js$/,
            handler: "CacheFirst",
            options: { cacheName: "lazy-chunks" },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "node",
  },
});
