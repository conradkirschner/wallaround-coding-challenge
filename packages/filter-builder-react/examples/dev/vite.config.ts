// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import * as path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, 'examples/dev'),

plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  resolve: {
    alias: {
      // use the *source* while developing
      'filter-builder-react': path.resolve(__dirname, '../../src/index.ts'),
      'filter-builder-core': path.resolve(
          __dirname,
          '../../../filter-builder-core/src/index.ts',
      ),
    },
    // Helpful when using workspace symlinks
    preserveSymlinks: true,
  },
  optimizeDeps: {
    // avoid esbuild pre-bundling these local libs
    exclude: ['filter-builder-react', 'filter-builder-core'],
  },
});
