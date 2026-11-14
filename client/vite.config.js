
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // In local dev, proxy /api/... → the Express backend so cookies are
    // first-party and no CORS is needed. This mirrors the Vercel rewrite in
    // production. The backend mounts routes at /api/v1/*, so we strip the
    // /api prefix and forward to /api/v1/*.
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
      },
    },
  },
});
