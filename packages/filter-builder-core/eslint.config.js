// Flat config for ESLint v9+
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

export default [
  // replaces .eslintignore
  { ignores: ['dist', 'coverage', 'node_modules'] },

  // base JS + TS recommended
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // project rules
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // good DX without heavy type-aware linting; switch to `project: ['./tsconfig.json']` if you want type-aware rules
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      // @typescript-eslint rules provided via ...tseslint.configs.recommended
      import: importPlugin,
    },
    settings: {
      // so eslint-plugin-import resolves @/* and TS paths
      'import/resolver': {
        typescript: { project: ['./tsconfig.json'] },
        node: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'import/order': ['warn', { alphabetize: { order: 'asc', caseInsensitive: true } }],
    },
  },
];
