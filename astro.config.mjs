// astro.config.mjs
// ─────────────────────────────────────────────────────────────
// GITHUB PAGES:
//   • Se o repo for  username.github.io  →  base: '/'
//   • Se o repo for  username/tbl-studio  →  base: '/tbl-studio'
//
// Altere BASE abaixo conforme o nome do seu repositório.
// ─────────────────────────────────────────────────────────────
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const BASE = '/'; // ← [SUBSTITUIR] ex: '/tbl-studio' se o repo não for username.github.io

export default defineConfig({
  integrations: [react()],
  output: 'static',
  site: 'https://[DOMINIO]', // ← [SUBSTITUIR] pelo domínio real
  base: BASE,
  build: {
    assets: '_assets',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
