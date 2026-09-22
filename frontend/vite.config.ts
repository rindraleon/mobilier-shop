import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Découpage stable : React et les dépendances lourdes restent dans un
         * chunk séparé, mis en cache par le navigateur entre deux déploiements.
         */
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    /**
     * En développement, l'API NestJS est servie sur le même origine via ce
     * proxy : le frontend n'a donc jamais besoin de connaître l'URL du
     * backend et aucun cookie n'est cross-origin (§50).
     */
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET ?? "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
