import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';
import * as path from 'node:path';

const coverageEnabled = process.env.VITE_COVERAGE === 'true';

export default defineConfig({
  root: path.resolve(__dirname, '.'),
  plugins: [
    react(),
    istanbul({
      cypress: true,
      requireEnv: false,
      include: ['src/**/*', 'dev/**/*', 'examples/**/*'],
      exclude: ['node_modules', 'cypress', 'dist', 'coverage'],
      extension: ['.ts', '.tsx', '.js', '.jsx'],
      // @ts-expect-error plugin supports this at runtime
      enabled: coverageEnabled,
    }) as unknown as PluginOption,
  ],
  resolve: {
    alias: {
      'filter-builder-react': path.resolve(__dirname, '../../src/index.ts'),
      'filter-builder-core': path.resolve(__dirname, '../../../filter-builder-core/src/index.ts'),
    },
    preserveSymlinks: true,
  },
  optimizeDeps: {
    exclude: ['filter-builder-react', 'filter-builder-core'],
  },
});
