import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Replaces <!-- @include name --> with src/partials/name.html so every page
// shares one header/footer without shipping them as client-side JS.
function htmlPartials() {
  return {
    name: 'atc-html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, name) =>
          readFileSync(resolve(__dirname, 'src/partials', `${name}.html`), 'utf8')
        );
      },
    },
  };
}

export default defineConfig({
  plugins: [htmlPartials()],
  server: {
    port: 5173,
    host: true,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2019',
    // The 3D world chunk (three.js) is ~190 KB gzipped but only loads lazily after first paint.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        project: resolve(__dirname, 'project.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
      },
    },
  },
});
