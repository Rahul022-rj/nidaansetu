import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development the API is proxied, so the refresh cookie is same-origin.
// In production set VITE_API_URL to the API's origin (e.g. https://api.nidaansetu.in).
const target = process.env.API_PROXY_TARGET || "http://localhost:5050";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": { target, changeOrigin: true } } },
  preview: { port: 4173, proxy: { "/api": { target, changeOrigin: true } } },
});
