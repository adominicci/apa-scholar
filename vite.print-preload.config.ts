import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    outDir: '.vite/build',
    emptyOutDir: false,
    lib: {
      entry: path.resolve(rootDir, 'src/preload/print-preload.ts'),
      formats: ['cjs'],
      fileName: () => 'print-preload.js',
    },
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
      ],
    },
  },
  resolve: {
    alias: {
      '@application': path.resolve(rootDir, 'src/application'),
      '@domain': path.resolve(rootDir, 'src/domain'),
      '@preload': path.resolve(rootDir, 'src/preload'),
    },
  },
});
