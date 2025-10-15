import istanbul from 'vite-plugin-istanbul';

export default {
  plugins: [
    react(),
    istanbul({
      include: ['src/**/*'],
      exclude: ['node_modules', 'test', 'cypress', 'dist'],
      extension: [ '.ts', '.tsx' ],
      cypress: true,
      requireEnv: false
    })
  ]
};
