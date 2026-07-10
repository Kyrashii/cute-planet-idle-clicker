import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "prompt",
        manifest: {
          name: "Cute Planet Idle Clicker",
          short_name: "Cute Planet",
          description:
            "Cosy pastel idle clicker — tap your planet, hatch animals, ride cosmic events.",
          lang: "de",
          display: "standalone",
          orientation: "portrait",
          theme_color: "#100d23",
          background_color: "#100d23",
          icons: [
            { src: "/icons/pwa-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icons/pwa-512.png", sizes: "512x512", type: "image/png" },
            {
              src: "/icons/pwa-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          // Art (png/webp/webm) is precached too: the whole game is playable offline,
          // and no runtime route can cache a stale-hash HTML fallback under an asset URL.
          globPatterns: ["**/*.{js,css,html,svg,png,webp,webm,woff2}"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [
            /^\/assets\//,
            /\.(?:js|css|map|json|png|webp|webm|svg|ico|woff2|webmanifest|txt)$/,
          ],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: ({ url }) =>
                url.hostname.includes("googleapis.com") ||
                url.hostname.includes("googletagmanager.com") ||
                url.hostname.includes("google-analytics.com"),
              handler: "NetworkOnly",
            },
          ],
        },
      }),
    ],
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      hmr: true,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
            motion: ["motion/react"],
          },
        },
      },
    },
  };
});
