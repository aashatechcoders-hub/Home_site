import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { PROJECTS } from './src/js/data/projects.js';
import { TECH_DOMAINS } from './src/js/data/tech.js';
import {
  SITE, esc, projectPath, projectTitle, projectDescription, projectJsonLd, projectBodyHTML,
} from './src/js/project-render.js';

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

const setAttr = (html, selector, attr, value) =>
  html.replace(new RegExp(`(<${selector}[^>]*\\s${attr}=")[^"]*(")`), `$1${esc(value)}$2`);

// Builds crawlable output that search engines and AI assistants can read
// without running JavaScript:
//  - /projects/<id>/index.html — a static, fully rendered page per blueprint
//  - sitemap.xml — regenerated each build so lastmod is always current
//  - llms-full.txt — public/llms.txt plus every blueprint and technology
function seoPages() {
  let outDir;
  return {
    name: 'atc-seo-pages',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    // Dev only: serve /projects/<id>/ from project.html, which renders client-side.
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (/^\/projects\/[\w-]+\/?(\?.*)?$/.test(req.url)) req.url = '/project.html';
        next();
      });
    },
    closeBundle() {
      if (!outDir) return;
      const template = readFileSync(resolve(outDir, 'project.html'), 'utf8');

      for (const p of PROJECTS) {
        const url = SITE + projectPath(p.id);
        const title = projectTitle(p);
        const description = projectDescription(p);
        let html = template.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
        html = setAttr(html, 'meta name="robots"', 'content', 'index, follow, max-image-preview:large, max-snippet:-1');
        html = setAttr(html, 'meta name="description"', 'content', description);
        html = setAttr(html, 'link rel="canonical"', 'href', url);
        html = setAttr(html, 'meta property="og:url"', 'content', url);
        html = setAttr(html, 'meta property="og:title"', 'content', title);
        html = setAttr(html, 'meta property="og:description"', 'content', description);
        html = setAttr(html, 'meta name="twitter:title"', 'content', title);
        html = setAttr(html, 'meta name="twitter:description"', 'content', description);
        const ld = JSON.stringify(projectJsonLd(p)).replace(/</g, '\\u003c');
        html = html.replace('</head>', `  <script type="application/ld+json">${ld}</script>\n</head>`);
        html = html.replace(
          /<main id="main" data-project-root>[\s\S]*?<\/main>/,
          `<main id="main" data-project-root data-prerendered style="--accent: ${esc(p.accent)}">${projectBodyHTML(p)}\n  </main>`
        );
        const dir = resolve(outDir, 'projects', p.id);
        mkdirSync(dir, { recursive: true });
        writeFileSync(resolve(dir, 'index.html'), html);
      }

      const today = new Date().toISOString().slice(0, 10);
      const urls = ['/', ...PROJECTS.map((p) => projectPath(p.id)), '/privacy.html', '/terms.html'];
      writeFileSync(
        resolve(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((u) => `  <url>\n    <loc>${SITE}${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
          .join('\n')}\n</urlset>\n`
      );

      const llms = readFileSync(resolve(__dirname, 'public/llms.txt'), 'utf8').trimEnd();
      const blueprints = PROJECTS.map((p) => [
        `### ${p.title}`,
        '',
        `URL: ${SITE}${projectPath(p.id)}`,
        `Category: ${p.category} · Industry: ${p.industry}`,
        '',
        p.summary,
        '',
        `Problem: ${p.problem}`,
        '',
        `Solution: ${p.solution}`,
        '',
        'Requirements:',
        ...(p.requirements || []).map((r) => `- ${r}`),
        '',
        'Key capabilities:',
        ...p.features.map((f) => `- ${f}`),
        '',
        `Architecture: ${p.architecture.join(' → ')}`,
        `Technologies: ${p.technologies.join(', ')}`,
        '',
        `UX: ${p.ux}`,
        `Development: ${p.development}`,
        `Testing: ${p.testing}`,
        `Deployment: ${p.deployment}`,
      ].join('\n'));
      const tech = TECH_DOMAINS.map((d) => [
        `### ${d.title}`,
        '',
        d.desc,
        '',
        ...d.items.map(([name, desc]) => `- ${name}: ${desc}`),
      ].join('\n'));
      writeFileSync(
        resolve(outDir, 'llms-full.txt'),
        `${llms}\n\n## Solution blueprints in full\n\nRepresentative architectures showing how ATC approaches each class of problem.\n\n${blueprints.join('\n\n')}\n\n## Technology ATC works with\n\n${tech.join('\n\n')}\n`
      );
    },
  };
}

export default defineConfig({
  plugins: [htmlPartials(), seoPages()],
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
        notFound: resolve(__dirname, '404.html'),
      },
    },
  },
});
