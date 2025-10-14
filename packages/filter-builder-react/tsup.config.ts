import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  clean: true,
  sourcemap: false,
  format: ['esm', 'cjs'],
  target: 'es2020',
  splitting: false,
  treeshake: true,
  minify: false
});
