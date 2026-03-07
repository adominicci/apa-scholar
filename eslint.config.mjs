import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '.vite/**',
      'out/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'tests/e2e/**/*.js',
      'eslint.config.mjs',
      'prettier.config.mjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: [
      'src/main/**/*.ts',
      'src/preload/**/*.ts',
      'forge.config.ts',
      'playwright.config.ts',
      'vite.*.config.ts',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: [
      'src/renderer/**/*.ts',
      'src/renderer/**/*.tsx',
      'tests/**/*.ts',
      'tests/**/*.tsx',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['src/renderer/**/*.ts', 'src/renderer/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'electron',
              message:
                'Renderer code must use the typed preload bridge instead of importing Electron directly.',
            },
          ],
          patterns: [
            {
              group: ['node:*'],
              message: 'Renderer code must not import Node built-in modules.',
            },
          ],
        },
      ],
    },
  },
  prettier,
);
