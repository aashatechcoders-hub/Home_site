// Shared by the browser (project.js) and the build (vite.config.js), which
// pre-renders every blueprint to /projects/<id>/ so crawlers that don't run
// JavaScript — search engines and AI assistants alike — see the full page.
import { PROJECTS } from './data/projects.js';

export const SITE = 'https://aashatechcoders.in';

export const projectPath = (id) => `/projects/${encodeURIComponent(id)}/`;

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const projectTitle = (p) => `${p.title} — Solution Blueprint | ATC Aasha Tech Coders`;

export const projectDescription = (p) =>
  `${p.summary} How ATC Aasha Tech Coders builds it with ${p.technologies.slice(0, 3).join(', ')} and more.`;

export function projectJsonLd(p) {
  const url = SITE + projectPath(p.id);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: projectTitle(p),
        description: projectDescription(p),
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${url}#service` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        primaryImageOfPage: `${SITE}/logo-atc.jpeg`,
        publisher: { '@id': `${SITE}/#organization` },
      },
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: p.title,
        serviceType: p.category,
        description: `${p.summary} ${p.solution}`,
        provider: { '@id': `${SITE}/#organization` },
        areaServed: 'Worldwide',
        audience: { '@type': 'BusinessAudience', name: p.industry },
        category: p.category,
        keywords: p.technologies.join(', '),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Work', item: `${SITE}/#work` },
          { '@type': 'ListItem', position: 3, name: p.title, item: url },
        ],
      },
    ],
  };
}

export function projectBodyHTML(p) {
  const others = PROJECTS.filter((o) => o.id !== p.id);
  return `
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
              <a class="text-link" href="${projectPath(o.id)}"><span>Explore blueprint</span><span aria-hidden="true">→</span></a>
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
