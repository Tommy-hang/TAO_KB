import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sections from './src/lib/remark-sections.mjs';
import { unified } from '@astrojs/markdown-remark';
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  vite: { plugins: [tailwindcss()] },
  markdown: {
    processor: unified({ remarkPlugins: [sections] }),
    shikiConfig: { theme: 'github-light' },
  },
});
