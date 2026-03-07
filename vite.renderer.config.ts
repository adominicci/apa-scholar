import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: './',
  build: {
    outDir: '.vite/renderer/main_window',
    emptyOutDir: false,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@application': path.resolve(rootDir, 'src/application'),
      '@domain': path.resolve(rootDir, 'src/domain'),
      '@infrastructure': path.resolve(rootDir, 'src/infrastructure'),
      '@main': path.resolve(rootDir, 'src/main'),
      '@preload': path.resolve(rootDir, 'src/preload'),
      '@renderer': path.resolve(rootDir, 'src/renderer'),
      '@tests': path.resolve(rootDir, 'tests'),
    },
  },
  test: {
    environment: 'jsdom',
  },
});
