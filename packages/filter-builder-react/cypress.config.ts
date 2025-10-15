// cypress.config.ts
import { defineConfig } from 'cypress';
import { defineConfig as defineViteConfig } from 'vite';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';
import path from 'node:path';
import codeCoverageTask from '@cypress/code-coverage/task';

const coverageEnabled = process.env.VITE_COVERAGE === 'true' || !!process.env.CYPRESS;

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);
      return config;
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: defineViteConfig({
        root: process.cwd(),
        plugins: [
          react(),
          istanbul({
            cypress: true,
            requireEnv: false,
            include: ['src/**/*', 'examples/**/*'],
            exclude: ['node_modules', 'cypress', 'dist', 'coverage'],
            extension: ['.ts', '.tsx', '.js', '.jsx'],
          }),
        ],
        resolve: {
          alias: {
            // use source during CT
            'filter-builder-react': path.resolve(process.cwd(), 'src/index.ts'),
            'filter-builder-core': path.resolve(process.cwd(), '../filter-builder-core/src/index.ts'),
          },
          preserveSymlinks: true,
        },
        optimizeDeps: {
          exclude: ['filter-builder-react', 'filter-builder-core'],
        },
      }),
    },
    specPattern: 'cypress/component/**/*.cy.{ts,tsx}',
    supportFile: 'cypress/support/component.ts',
    indexHtmlFile: 'cypress/support/component-index.html',
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);
      return config;
    },
  },
});
