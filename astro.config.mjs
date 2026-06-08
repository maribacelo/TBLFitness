import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://maribacelo.github.io',
  base: '/TBLFitness/',
  build: {
    assets: '_assets',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
