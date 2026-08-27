import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/video": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true
      },

      "/word": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true
      },

      "/translate": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true
      },

      "/speak": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true
      }
    }
  }
});