import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/cnc-kalkulator/" : "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    legalComments: "none",
  },
  build: {
    target: "es2020",
    cssTarget: "chrome87",
    modulePreload: { polyfill: false },
    rollupOptions: {
      treeshake: {
        preset: "recommended",
      },

      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return;
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("react-router")) return "vendor-router";
          if (id.includes("@tanstack")) return "vendor-query";
          if (id.includes("@radix-ui") || id.includes("cmdk") || id.includes("vaul")) {
            return "vendor-ui";
          }
          if (id.includes("react-dom") || id.includes("/react/") || id.includes("scheduler")) {
            return "vendor-react";
          }
          return "vendor";
        },
      },
    },
  },
}));
