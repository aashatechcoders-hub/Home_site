import { initSite } from './site.js';
import { PROJECTS } from './data/projects.js';
import { SITE, projectPath, projectTitle, projectDescription, projectBodyHTML } from './project-render.js';

function setMeta(project) {
  const url = SITE + projectPath(project.id);
  const title = projectTitle(project);
  const description = projectDescription(project);
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
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

// Production serves pre-rendered /projects/<id>/ pages (see vite.config.js);
// this path only runs in dev and for legacy /project.html?id=… links.
const root = document.querySelector('[data-project-root]');
if (root && !root.hasAttribute('data-prerendered')) {
  const fromPath = window.location.pathname.match(/^\/projects\/([\w-]+)\/?$/);
  const id = fromPath ? fromPath[1] : new URLSearchParams(window.location.search).get('id');
  const project = PROJECTS.find((p) => p.id === id);
  if (project) {
    setMeta(project);
    root.style.setProperty('--accent', project.accent);
    root.innerHTML = projectBodyHTML(project);
  } else {
    renderMissing(root);
  }
}
// Initialise after rendering so reveal/magnetic pick up the new nodes.
initSite();
