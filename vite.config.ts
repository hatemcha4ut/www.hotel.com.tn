import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, Plugin } from "vite";
import { resolve } from 'path';
import { execSync } from 'child_process';
import fs from 'fs';

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// Vite plugin to generate version.json at build time
function generateVersionPlugin(): Plugin {
  return {
    name: 'generate-version',
    buildStart() {
      try {
        const sha = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()
        const timestamp = new Date().toISOString()
        
        const versionInfo = {
          sha,
          branch,
          timestamp,
          buildDate: new Date().toLocaleDateString('fr-FR'),
          buildTime: new Date().toLocaleTimeString('fr-FR'),
        }
        
        const publicDir = resolve(projectRoot, 'public')
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true })
        }
        
        fs.writeFileSync(
          resolve(publicDir, 'version.json'),
          JSON.stringify(versionInfo, null, 2)
        )
        
        console.log('✓ Generated version.json:', versionInfo)
      } catch (error) {
        console.warn('⚠ Could not generate version.json:', error)
        // Create a fallback version.json
        const fallbackVersion = {
          sha: 'unknown',
          branch: 'unknown',
          timestamp: new Date().toISOString(),
          buildDate: new Date().toLocaleDateString('fr-FR'),
          buildTime: new Date().toLocaleTimeString('fr-FR'),
        }
        const publicDir = resolve(projectRoot, 'public')
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true })
        }
        fs.writeFileSync(
          resolve(publicDir, 'version.json'),
          JSON.stringify(fallbackVersion, null, 2)
        )
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), generateVersionPlugin()],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
});
