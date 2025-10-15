import { defineConfig } from 'cypress';
import react from '@vitejs/plugin-react';
import * as path from 'node:path';

const pkgRoot = __dirname; // packages/filter-builder-react
const examplesRoot = path.resolve(pkgRoot, 'examples/dev');
const coreRoot = path.resolve(pkgRoot, '../filter-builder-core');

// If env var present, we instrument CT via Babel plugin.
// For E2E, the example app's Vite config does the instrumentation.
const coverageEnabled = process.env.VITE_COVERAGE === 'true' || !!process.env.CYPRESS;

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      // IMPORTANT: no vite-plugin-istanbul here
      viteConfig: {
        plugins: [
          react({
            // instrument CT via Babel plugin (safe + simple)
            ...(coverageEnabled
              ? { babel: { plugins: ['istanbul'] } }
              : {}),
          }),
        ],
        resolve: {
          alias: {
            'filter-builder-react': path.resolve(pkgRoot, 'src/index.ts'),
            'filter-builder-core': path.resolve(coreRoot, 'src/index.ts'),
          },
          preserveSymlinks: true,
        },
        server: {
          fs: {
            allow: [pkgRoot, coreRoot, examplesRoot],
          },
        },
      },
    },
    indexHtmlFile: 'cypress/support/component-index.html',
    specPattern: 'cypress/component/**/*.cy.{ts,tsx}',
    supportFile: 'cypress/support/component.ts',
    screenshotsFolder: 'cypress/screenshots-ct',
    videosFolder: 'cypress/videos-ct',
  },
});
