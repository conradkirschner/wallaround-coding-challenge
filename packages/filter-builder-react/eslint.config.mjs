import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  // Ignore output and vendor dirs
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'cypress/screenshots*/**',
      'cypress/videos*/**',
      'cypress/downloads*/**',
    ],
  },

  // Base TS/TSX everywhere (non type-aware by default)
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // default: NOT type-aware; we’ll enable it only for src/** below
        project: false,
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
      react,
      'react-hooks': reactHooks,
      prettier,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...js.configs.recommended.rules,

      // Use TS versions of core rules
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // React modern JSX
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      // Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Prettier
      'prettier/prettier': 'error',
    },
  },

  // Make Cypress/Mocha globals available in all Cypress files
  {
    files: ['cypress/**/*.{ts,tsx}'],
    languageOptions: {
      // keep non type-aware in cypress for speed and fewer parser issues
      parserOptions: { project: false },
      globals: {
        ...globals.mocha, // describe/it/beforeEach etc.
        cy: 'readonly',
        Cypress: 'readonly',
        expect: 'readonly',
      },
    },
    rules: {
      // specs/support often carry helpers with unused params — underscore them if you like
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },

  // Run type-aware linting for lib + example
  {
    files: ['src/**/*.{ts,tsx}', 'example/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: [path.join(__dirname, 'tsconfig.eslint.json')],
        tsconfigRootDir: __dirname,
      },
    },
  },

  // Config files: explicitly non type-aware so they don’t error
  {
    files: [
      '**/tailwind.config.ts',
      '**/tsup.config.ts',
      '**/vite.config.ts',
      '**/cypress.config.ts',
      '**/examples/**/vite.config.ts',
    ],
    languageOptions: {
      parserOptions: { project: false },
    },
  },
];
