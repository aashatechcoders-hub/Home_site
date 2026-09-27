import { PROJECTS_DATA } from './projects.js';

const CATEGORY_LABELS = {
  ai: 'AI & Automation',
  ecommerce: 'E-Commerce',
  saas: 'SaaS & Cloud Software',
  mobile: 'Mobile Apps',
  cloud: 'Cloud & DevOps',
  growth: 'Growth & Marketing',
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderNotFound(container) {
  document.title = 'Case Study Not Found — ATC';
  const breadcrumbCurrent = document.getElementById('breadcrumb-current');
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Not Found';

  container.innerHTML = `
    <div class="glass-card" style="padding: 3rem; text-align: center;">
      <div style="font-size: 2.5rem; margin-bottom: 1rem;">🔍</div>
      <h1 style="font-size: 1.75rem; font-weight: 800; color: #fff; margin-bottom: 0.75rem;">Case Study Not Found</h1>
      <p style="color: var(--text-muted); margin-bottom: 1.75rem;">
        We couldn't find the case study you're looking for. It may have moved — browse all case studies instead.
      </p>
      <a href="index.html#projects" class="btn btn-primary">
        <span>← Back to Case Studies</span>
      </a>
    </div>
  `;
}

function renderProject(container, project) {
  document.title = `${project.title} — ATC Case Study`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', project.shortDesc);

  const breadcrumbCurrent = document.getElementById('breadcrumb-current');
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = project.title;

  const architectureSteps = project.architecture.split('→').map(s => s.trim()).filter(Boolean);

  container.innerHTML = `
    <div class="project-hero">
      <span class="project-card-badge">${escapeHtml(project.industry)}</span>
      <h1 class="project-hero-title">${escapeHtml(project.title)}</h1>
      <p class="project-hero-desc">${escapeHtml(project.shortDesc)}</p>
    </div>

    <div class="project-glance-grid">
      <div class="project-glance-card glass-card">
        <div class="project-glance-label">Industry</div>
        <div class="project-glance-value">${escapeHtml(project.industry)}</div>
      </div>
      <div class="project-glance-card glass-card">
        <div class="project-glance-label">Focus Area</div>
        <div class="project-glance-value">${escapeHtml(CATEGORY_LABELS[project.category] || project.category)}</div>
      </div>
      <div class="project-glance-card glass-card">
        <div class="project-glance-label">Primary Stack</div>
        <div class="project-glance-value">${escapeHtml(project.technologies[0])}</div>
      </div>
      <div class="project-glance-card glass-card">
        <div class="project-glance-label">Technologies Used</div>
        <div class="project-glance-value">${project.technologies.length}</div>
      </div>
    </div>

    <div class="project-detail-block glass-card project-block-problem">
      <h2 class="project-block-title"><span class="project-block-icon">⚠️</span> The Challenge</h2>
      <p class="project-block-text">${escapeHtml(project.problem)}</p>
    </div>

    <div class="project-detail-block glass-card project-block-solution">
      <h2 class="project-block-title"><span class="project-block-icon">⚡</span> The ATC Engineering Approach</h2>
      <p class="project-block-text">${escapeHtml(project.solution)}</p>
    </div>

    <div class="project-detail-block glass-card">
      <h2 class="project-block-title"><span class="project-block-icon">🏗️</span> Architecture Flow</h2>
      <div class="project-architecture-flow">
        ${architectureSteps.map((step, i) => `
          ${i > 0 ? '<span class="project-arch-arrow">→</span>' : ''}
          <div class="pillar-pill project-arch-step">${escapeHtml(step)}</div>
        `).join('')}
      </div>
    </div>

    <div class="project-detail-block glass-card">
      <h2 class="project-block-title"><span class="project-block-icon">✅</span> Key Features & Capabilities</h2>
      <ul class="project-features-list">
        ${project.features.map(f => `
          <li><span class="project-feature-check">✔</span> ${escapeHtml(f)}</li>
        `).join('')}
      </ul>
    </div>

    <div class="project-detail-block glass-card">
      <h2 class="project-block-title"><span class="project-block-icon">🧰</span> Full Technology Stack</h2>
      <div class="project-tech-tags" style="margin-top: 0.5rem;">
        ${project.technologies.map(t => `<span class="service-tech-tag">${escapeHtml(t)}</span>`).join('')}
      </div>
    </div>

    <div class="project-cta-banner">
      <h3>Have a similar problem to solve?</h3>
      <p>Let's talk about how ATC would approach your project.</p>
      <a href="index.html#contact" class="btn btn-primary">
        <span>Discuss a Similar Project</span>
        <span>→</span>
      </a>
    </div>
  `;
}

function renderRelatedProjects(grid, currentProject) {
  if (!grid) return;

  const related = PROJECTS_DATA
    .filter(p => p.id !== currentProject.id && p.category === currentProject.category)
    .concat(PROJECTS_DATA.filter(p => p.id !== currentProject.id && p.category !== currentProject.category))
    .slice(0, 3);

  grid.innerHTML = related.map(project => `
    <div class="glass-card project-card">
      <div class="project-card-badge">${escapeHtml(project.industry)}</div>
      <h3 class="project-card-title">${escapeHtml(project.title)}</h3>
      <p class="project-card-desc">${escapeHtml(project.shortDesc)}</p>
      <div class="project-tech-tags">
        ${project.technologies.slice(0, 4).map(t => `<span class="service-tech-tag">${escapeHtml(t)}</span>`).join('')}
      </div>
      <div class="project-card-footer">
        <a class="view-case-study-btn" href="project.html?id=${encodeURIComponent(project.id)}">
          <span>View Full Case Study</span>
          <span>→</span>
        </a>
      </div>
    </div>
  `).join('');
}

export function initProjectDetail() {
  const container = document.getElementById('project-detail-content');
  const relatedGrid = document.getElementById('related-projects-grid');
  const relatedSection = document.getElementById('related-projects-section');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const project = PROJECTS_DATA.find(p => p.id === id);

  if (!project) {
    renderNotFound(container);
    if (relatedSection) relatedSection.style.display = 'none';
    return;
  }

  renderProject(container, project);
  renderRelatedProjects(relatedGrid, project);
}
