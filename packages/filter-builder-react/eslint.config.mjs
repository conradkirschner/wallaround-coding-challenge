import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectTsconfig = path.join(__dirname, 'tsconfig.eslint.json');

export default tseslint.config(
  // Ignores
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '**/*.d.ts',
      'cypress/screenshots*/**',
      'cypress/videos*/**',
      'cypress/downloads*/**',
    ],
  },

  // Base TS/React config
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: [projectTsconfig],
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
      prettier,
    },
    settings: {
      react: { version: 'detect' },
    },
    // Start from JS recommended, then add our rules
    rules: {
      ...js.configs.recommended.rules,

      // React modern JSX
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      // Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Prettier
      'prettier/prettier': 'error',

      // Relax noisy TS rules so you can iterate
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
    },
  },

  // Cypress overrides (define cy/Cypress globals)
  {
    files: ['cypress/**/*.{ts,tsx}', 'cypress.config.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        cy: 'readonly',
        Cypress: 'readonly',
        expect: 'readonly',
      },
    },
  },

  // Node-ish config files
  {
    files: ['vite.config.ts', 'examples/dev/vite.config.ts', '*.config.{ts,js,cjs,mjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Example app: keep lenient TS safety
  {
    files: ['examples/dev/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
    },
  },
);
