/// <reference types="vitest" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: true,
    },
    test: {
      globals: true,
      environment: "node",
      include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    },
  };
});
