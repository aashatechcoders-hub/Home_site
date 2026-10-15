import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { existsSync } from 'fs';

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function teamPortrait(member) {
  const file = resolve(__dirname, 'public', member.image.replace(/^\//, ''));
  const hasPhoto = existsSync(file);
  const photo = hasPhoto
    ? `<img src="${escapeHtml(member.image)}" alt="Portrait of ${escapeHtml(member.name)}" width="180" height="180" loading="lazy" decoding="async" />`
    : `<span class="team-portrait__initials" aria-hidden="true">${escapeHtml(member.initials)}</span>`;
  return `<div class="team-portrait"${hasPhoto ? '' : ` role="img" aria-label="Initials placeholder for ${escapeHtml(member.name)}"`}>${photo}</div>`;
}

function teamProfile(member) {
  const id = `team-${escapeHtml(member.id)}`;
  const featured = member.category === 'product';
  return `<article class="team-profile${featured ? ' team-profile--featured' : ''}" aria-labelledby="${id}" tabindex="0" data-reveal>
    ${featured ? '<span class="team-profile__badge">Product</span>' : ''}
    ${teamPortrait(member)}
    <h4 id="${id}" class="team-profile__name">${escapeHtml(member.name)}</h4>
    <p class="team-profile__role">${escapeHtml(member.role)}</p>
    <p class="team-profile__tagline">${escapeHtml(member.tagline)}</p>
  </article>`;
}

function renderTeam() {
  const members = JSON.parse(readFileSync(resolve(__dirname, 'src/js/data/team.json'), 'utf8'));
  const count = (category) => members.filter((member) => member.category === category).length;
  if (members.length !== 6 || count('product') !== 1 || count('engineering') !== 3 || count('design-growth') !== 2) {
    throw new Error('Team configuration must contain one product, three engineering, and two design/growth profiles.');
  }
  return `<section class="team" aria-labelledby="team-title">
    <header class="team__head" data-reveal>
      <p class="team__eyebrow">The people behind ATC</p>
      <h3 id="team-title" class="team__title">Meet the Minds Behind ATC</h3>
      <p class="team__intro">A team combining product thinking, engineering, design, and growth to turn ideas into meaningful digital experiences.</p>
    </header>
    <div class="team__list">
      ${members.map((member) => teamProfile(member)).join('')}
    </div>
    <aside class="team-open" aria-labelledby="team-open-title" tabindex="0" data-reveal>
      <span class="team-open__mark" aria-hidden="true">+</span>
      <div class="team-open__copy">
        <p class="team-open__eyebrow">We're hiring</p>
        <h4 id="team-open-title">Open Position</h4>
        <p class="team-open__role">QA Engineer / Software Tester</p>
      </div>
    </aside>
  </section>`;
}

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
        ).replace('<!-- @team -->', () => renderTeam());
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
