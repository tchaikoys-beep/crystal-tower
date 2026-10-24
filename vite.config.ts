import { defineConfig } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
export default defineConfig({
  base: './',
  build: { outDir: 'dist', assetsDir: 'assets', target: 'es2020', sourcemap: false },
  plugins: [{
    name: 'stamp-sw',
    closeBundle() {
      const p = 'dist/sw.js';
      try { writeFileSync(p, readFileSync(p, 'utf8').replace('__BUILD__', Date.now().toString(36))); } catch {}
    },
  }],
});
