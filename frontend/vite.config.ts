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
      proxy: { "/api": { target: env.API_SERVER_URL || "http://localhost:5000", changeOrigin: true } }
    },
    preview: { port: 4173, host: "0.0.0.0" }
  };
});
