import { initSite } from './site.js';
import { PROJECTS } from './data/projects.js';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function setMeta(project) {
  const url = `https://aashatechcoders.com/project.html?id=${encodeURIComponent(project.id)}`;
  const title = `${project.title} — Solution Blueprint | ATC`;
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', project.summary);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', project.summary);
}

function renderMissing(root) {
  document.title = 'Blueprint not found — ATC Aasha Tech Coders';
  const robots = document.querySelector('meta[name="robots"]');
  if (robots) robots.setAttribute('content', 'noindex, follow');
  root.innerHTML = `
    <section class="page-top">
      <div class="container pd-missing">
        <p class="eyebrow">404</p>
        <h1 class="page-title">Blueprint not found.</h1>
        <p class="page-lead">That project link doesn’t match anything we’ve published. Browse all of our work instead.</p>
        <a href="/#work" class="btn btn--primary"><span>View our work</span><span class="btn__arrow" aria-hidden="true">→</span></a>
      </div>
    </section>`;
}

function render(root, p) {
  const others = PROJECTS.filter((o) => o.id !== p.id);
  root.style.setProperty('--accent', p.accent);
  root.innerHTML = `
    <section class="page-top">
      <div class="container">
        <nav aria-label="Breadcrumb">
          <ol class="crumbs">
            <li><a class="link" href="/">Home</a></li>
            <li><a class="link" href="/#work">Work</a></li>
            <li aria-current="page">${esc(p.title)}</li>
          </ol>
        </nav>
        <div class="pd-hero">
          <div>
            <p class="pd-badge"><span>Solution blueprint</span><span>${esc(p.category)}</span><span>${esc(p.industry)}</span></p>
            <h1 class="page-title">${esc(p.title)}</h1>
            <p class="page-lead">${esc(p.summary)}</p>
            <div class="pd-ctas">
              <a href="/#contact" class="btn btn--primary btn--lg" data-magnetic><span>Start a similar project</span><span class="btn__arrow" aria-hidden="true">→</span></a>
              <a href="/#work" class="btn btn--ghost btn--lg" data-magnetic><span>All work</span></a>
            </div>
          </div>
          <div class="pd-visual" aria-hidden="true">
            <div class="bp">
              <div class="bp__plane">
                <p class="bp__label">Architecture</p>
                <ol class="bp__flow">${p.architecture.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container">
      <dl class="pd-glance" data-reveal>
        <div><dt>Focus</dt><dd>${esc(p.category)}</dd></div>
        <div><dt>Industry</dt><dd>${esc(p.industry)}</dd></div>
        <div><dt>Primary stack</dt><dd>${esc(p.technologies[0])}</dd></div>
        <div><dt>Architecture</dt><dd>${p.architecture.length} components</dd></div>
      </dl>

      <section class="pd-section" aria-labelledby="pd-life-h">
        <h2 class="pd-h" id="pd-life-h" data-reveal>From problem to production</h2>
        <ol class="life">
          ${[
            ['Problem', `<p>${esc(p.problem)}</p>`],
            ['Requirements', `<ul class="pd-features">${(p.requirements || []).map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`],
            ['Architecture', `<p>${esc(p.solution)}</p><ol class="pd-flow">${p.architecture.map((s, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${esc(s)}</li>`).join('')}</ol>`],
            ['UX', `<p>${esc(p.ux || '')}</p>`],
            ['Development', `<p>${esc(p.development || '')}</p>`],
            ['Testing', `<p>${esc(p.testing || '')}</p>`],
            ['Deployment', `<p>${esc(p.deployment || '')}</p>`],
          ]
            .map(([h, body], i) => `
            <li class="life__step" data-reveal>
              <span class="life__n mono" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
              <div class="life__body"><h3 class="life__h">${h}</h3>${body}</div>
            </li>`)
            .join('')}
        </ol>
      </section>

      <section class="pd-section pd-cols">
        <div data-reveal>
          <h2 class="pd-h">Key capabilities</h2>
          <ul class="pd-features">${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
        </div>
        <div data-reveal>
          <h2 class="pd-h">Technology</h2>
          <ul class="chips" aria-label="Technology used">${p.technologies.map((t) => `<li class="chip">${esc(t)}</li>`).join('')}</ul>
          <p class="pd-note">This is a solution blueprint: a representative architecture showing how we approach this kind of problem. Every real build is shaped around the client’s existing systems, constraints and budget.</p>
        </div>
      </section>

      <section class="pd-section" aria-labelledby="pd-more-h">
        <h2 class="pd-h" id="pd-more-h" data-reveal>More blueprints</h2>
        <div class="pd-others">
          ${others
            .map(
              (o) => `
            <article class="pd-other" data-reveal>
              <p class="pd-other__meta">${esc(o.category)}</p>
              <h3 class="pd-other__title">${esc(o.title)}</h3>
              <a class="text-link" href="/project.html?id=${encodeURIComponent(o.id)}"><span>Explore blueprint</span><span aria-hidden="true">→</span></a>
            </article>`
            )
            .join('')}
        </div>
      </section>
    </div>

    <section class="band" aria-labelledby="band-h">
      <div class="container">
        <p class="eyebrow">Start here</p>
        <h2 class="band__title" id="band-h">Build something similar.</h2>
        <p>Tell us about it — we’ll help you shape it, starting with a free discovery call.</p>
        <a href="/#contact" class="btn btn--primary btn--lg" data-magnetic><span>Start a Project</span><span class="btn__arrow" aria-hidden="true">→</span></a>
      </div>
    </section>`;
}

const root = document.querySelector('[data-project-root]');
if (root) {
  const id = new URLSearchParams(window.location.search).get('id');
  const project = PROJECTS.find((p) => p.id === id);
  if (project) {
    setMeta(project);
    render(root, project);
  } else {
    renderMissing(root);
  }
}
// Initialise after rendering so reveal/magnetic pick up the new nodes.
initSite();
