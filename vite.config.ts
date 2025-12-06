import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "::",
      port: 8080,
      headers: {
        "ngrok-skip-browser-warning": "true"
      },
      allowedHosts: [
        "roller-tutorials-arbor-grass.trycloudflare.com"
      ]
    },

    plugins: [
      react(),
      mode === "development" && componentTagger()
    ].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
