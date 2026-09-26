import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "/",
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") }, dedupe: ["react", "react-dom"] },
    server: {
      port: 5173, host: "0.0.0.0",
      proxy: {
        "/api": { target: env.API_SERVER_URL || "http://localhost:5000", changeOrigin: true },
        "/sitemap.xml": { target: env.API_SERVER_URL || "http://localhost:5000", changeOrigin: true, rewrite: () => "/api/sitemap.xml" },
      }
    },
    preview: { port: 4173, host: "0.0.0.0" },
    build: {
      // Country flags for the phone field stay separate files, fetched only when shown,
      // instead of being inlined into the JavaScript bundle.
      assetsInlineLimit: (filePath: string) => (filePath.includes("country-flag-icons") ? false : undefined),
    },
  };
});
