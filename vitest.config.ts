import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

const alias = [
  {
    find: /^@application\/(.*)$/,
    replacement: `${path.resolve(rootDir, 'src/application')}/$1`,
  },
  {
    find: /^@domain\/(.*)$/,
    replacement: `${path.resolve(rootDir, 'src/domain')}/$1`,
  },
  {
    find: /^@infrastructure\/(.*)$/,
    replacement: `${path.resolve(rootDir, 'src/infrastructure')}/$1`,
  },
  {
    find: /^@main\/(.*)$/,
    replacement: `${path.resolve(rootDir, 'src/main')}/$1`,
  },
  {
    find: /^@preload\/(.*)$/,
    replacement: `${path.resolve(rootDir, 'src/preload')}/$1`,
  },
  {
    find: /^@renderer\/(.*)$/,
    replacement: `${path.resolve(rootDir, 'src/renderer')}/$1`,
  },
  {
    find: /^@tests\/(.*)$/,
    replacement: `${path.resolve(rootDir, 'tests')}/$1`,
  },
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias,
  },
  test: {
    alias,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    environment: 'node',
  },
});
