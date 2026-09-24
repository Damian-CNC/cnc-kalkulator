import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./",
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
    rollupOptions: {
      treeshake: {
        preset: "recommended",
      },
      output: {
        // Tłumaczenia: jeden plik na język (ładowany leniwie), zamiast 13 małych
        manualChunks(id: string) {
          const match = id.match(/[\\/]locales[\\/]([a-z]{2})[\\/]/);
          if (match) return `locale-${match[1]}`;
          return undefined;
        },
      },
    },
  },
}));
