import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://tblstudio.pt',
  base: '/',
  build: {
    assets: '_assets',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
