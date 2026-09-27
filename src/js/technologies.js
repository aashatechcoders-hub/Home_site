export const TECH_UNIVERSE_DATA = {
  frontend: [
    { name: 'React', use: 'High-performance interactive dashboards, SPAs, and state-driven web applications.' },
    { name: 'Next.js', use: 'Server-side rendered enterprise portals with sub-second First Contentful Paint and SEO excellence.' },
    { name: 'Flutter', use: 'Cross-platform mobile apps for Android & iOS delivering 60fps animations and offline sync.' },
    { name: 'HTML5 & Modern CSS', use: 'Semantic web layouts, accessible design systems, and fluid responsive UI.' },
    { name: 'JavaScript & TypeScript', use: 'Type-safe enterprise logic, client validation, and real-time asynchronous interactions.' }
  ],
  backend: [
    { name: 'Python', use: 'Core language for AI pipelines, computational backend microservices, and data processing.' },
    { name: 'Django & DRF', use: 'Rapid, secure API frameworks with ORM integrity for scalable enterprise backends.' },
    { name: 'FastAPI', use: 'High-concurrency, asynchronous microservices with automatic OpenAPI documentation.' },
    { name: 'Node.js', use: 'Real-time WebSocket event dispatchers, streaming APIs, and serverless compute functions.' }
  ],
  database: [
    { name: 'PostgreSQL', use: 'Primary relational database for ACID-compliant transactions, JSONB storage, and complex queries.' },
    { name: 'Redis', use: 'Ultra-low latency in-memory caching, API rate limiting, session storage, and queue management.' },
    { name: 'MySQL', use: 'Reliable transactional storage for structured business systems and e-commerce platforms.' },
    { name: 'MongoDB', use: 'Flexible document store for catalog indexing, dynamic schemas, and fast analytical read queries.' }
  ],
  ai: [
    { name: 'LLMs & Foundation Models', use: 'Custom cognitive systems powered by GPT-4o, Claude 3.5, and private Llama models.' },
    { name: 'RAG (Retrieval Augmented Generation)', use: 'Grounded enterprise search connecting internal company docs with generative reasoning.' },
    { name: 'Vector Search & Pinecone', use: 'High-dimensional semantic embeddings for ultra-fast document similarity and matching.' },
    { name: 'AI Agents & Tool Calling', use: 'Multi-step autonomous agents that browse APIs, execute database transactions, and report outcomes.' },
    { name: 'Machine Learning', use: 'Predictive analytics, customer churn prevention, classification, and conversion scoring.' }
  ],
  devops: [
    { name: 'AWS Cloud', use: 'Resilient multi-availability zone infrastructure across ECS, RDS, S3, CloudFront, and Lambda.' },
    { name: 'Docker', use: 'Immutable container packaging ensuring zero discrepancies between staging and production.' },
    { name: 'CI/CD & GitHub Actions', use: 'Automated test execution, vulnerability scanning, image building, and rolling releases.' },
    { name: 'Linux & Nginx', use: 'Hardened web servers, reverse proxies, SSL/TLS termination, and load balancing.' },
    { name: 'Git & GitHub', use: 'Strict branching strategies, pull request reviews, and audited version control.' }
  ]
};

export function initTechUniverse() {
  const container = document.getElementById('tech-universe-container');
  if (!container) return;

  const tabs = container.querySelectorAll('.tech-cat-tab');
  const grid = container.querySelector('#tech-nodes-grid');
  const detailBox = container.querySelector('#tech-detail-text');
  const currentTechName = container.querySelector('#current-tech-name');

  function renderCategory(catKey) {
    if (!grid) return;
    grid.innerHTML = '';

    const list = TECH_UNIVERSE_DATA[catKey] || TECH_UNIVERSE_DATA.frontend;

    list.forEach((item, idx) => {
      const node = document.createElement('div');
      node.className = 'tech-universe-card glass-card card-pop-in';
      node.style.animationDelay = `${Math.min(idx, 10) * 0.05}s`;
      node.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
          <span style="font-weight: 800; font-size: 1.1rem; color: #ffffff;">${item.name}</span>
          <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-cyan);">[0${idx + 1}]</span>
        </div>
        <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.55;">${item.use}</p>
      `;

      // Hover interaction to update spotlight detail
      node.addEventListener('mouseenter', () => {
        if (currentTechName) currentTechName.textContent = item.name;
        if (detailBox) detailBox.textContent = item.use;
        grid.querySelectorAll('.tech-universe-card').forEach(c => c.style.borderColor = '');
        node.style.borderColor = 'var(--color-cyan)';
      });

      grid.appendChild(node);
    });

    // Default detail
    if (list.length > 0) {
      if (currentTechName) currentTechName.textContent = list[0].name;
      if (detailBox) detailBox.textContent = list[0].use;
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-tech-cat');
      if (cat) renderCategory(cat);
    });
  });

  // Initial
  renderCategory('frontend');
}
