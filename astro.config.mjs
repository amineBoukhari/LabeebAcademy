import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://labeebacademy.pages.dev',
  output: 'static',
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'ar'],
    routing: { prefixDefaultLocale: false }
  },
  vite: { plugins: [tailwindcss()] }
});
