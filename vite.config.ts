import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from "fs"

// https://vite.dev/config/
export default defineConfig({
  base: "/static/",
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "move-html",
      writeBundle() {
        const htmlPath = path.resolve(__dirname, "../app/static/index.html");
        const targetDir = path.resolve(__dirname, "../app/templates");
        const targetPath = path.resolve(targetDir, "index.html");

        if (fs.existsSync(htmlPath)) {
          fs.mkdirSync(targetDir, { recursive: true });
          fs.renameSync(htmlPath, targetPath);
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../app/static",
    emptyOutDir: true,
  },
})
