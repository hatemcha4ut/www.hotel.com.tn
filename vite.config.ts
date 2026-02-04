import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
 copilot/remove-spark-legacy-code


 main
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  base: '/',
 copilot/remove-spark-legacy-code
  plugins: [
    react(),
    tailwindcss(),
  ],

  plugins: [react(), tailwindcss()],
 main
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
});
