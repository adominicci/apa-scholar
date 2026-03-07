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
      entry: path.resolve(rootDir, 'src/main/index.ts'),
      formats: ['cjs'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external: [
        'electron',
        'electron-squirrel-startup',
        'better-sqlite3',
        ...builtinModules,
        ...builtinModules.map((moduleName) => `node:${moduleName}`),
      ],
    },
  },
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
});
