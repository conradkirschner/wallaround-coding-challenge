import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/__tests__/**',
        'src/**/*.d.ts',
        'src/types.ts', // <- types-only file, no runtime, exclude from coverage
      ],
      reporter: ['text', 'json-summary', 'lcov', 'html'],
      thresholds: { statements: 100, lines: 100, branches: 100, functions: 100 },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
