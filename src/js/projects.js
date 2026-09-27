export const PROJECTS_DATA = [
  {
    id: 'ai-ops-agent',
    category: 'ai',
    title: 'Autonomous Enterprise AI Support & Ops Agent',
    industry: 'Enterprise Software & Operations',
    shortDesc: 'Multi-step autonomous agent resolving tier-1 customer inquiries, routing tickets, and executing backend workflows.',
    problem: 'Customer support teams spent 1,200+ hours monthly handling repetitive troubleshooting queries, resulting in 4-hour SLA delays.',
    solution: 'Engineered an autonomous AI agent integrated with enterprise vector databases and internal CRM APIs. The agent understands context, queries secure databases, and resolves inquiries autonomously.',
    technologies: ['Python', 'FastAPI', 'LangChain', 'Pinecone Vector DB', 'Docker', 'Webhooks'],
    features: [
      'Multi-step reasoning and function calling',
      'Encrypted internal company knowledge RAG',
      'Automatic confidence scoring & human escalation',
      'Real-time operational latency under 900ms'
    ],
    architecture: 'User Webhook → API Gateway → Intent Classifier → Vector Search → Tool Execution → Structured JSON Response'
  },
  {
    id: 'headless-ecommerce',
    category: 'ecommerce',
    title: 'High-Performance Headless E-Commerce Platform',
    industry: 'Modern Retail & Direct-to-Consumer',
    shortDesc: 'Sub-second omnichannel storefront with dynamic search, cart retention flows, and resilient cloud checkout.',
    problem: 'Legacy monolithic architecture experienced server crashes during high-volume sales bursts and suffered from 4.2-second load times.',
    solution: 'Re-architected the entire storefront into a headless Next.js frontend backed by optimized PostgreSQL connection pooling and Redis cache layers.',
    technologies: ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe'],
    features: [
      'Sub-800ms First Contentful Paint globally',
      'Automated WhatsApp cart abandonment recovery',
      'PCI-DSS compliant multi-currency payment gateway',
      'Real-time inventory decrement with zero overselling'
    ],
    architecture: 'Next.js Edge CDN → Redis Query Cache → Node.js Microservice → PostgreSQL Read Replicas'
  },
  {
    id: 'b2b-saas-portal',
    category: 'saas',
    title: 'Multi-Tenant B2B SaaS Platform & Billing Engine',
    industry: 'Cloud Software & Workforce Automation',
    shortDesc: 'Enterprise subscription platform featuring automated tenant isolation, team permissions, and usage metering.',
    problem: 'Manual client provisioning and lack of role-based access control prevented the client from closing enterprise sales contracts.',
    solution: 'Designed and deployed a scalable multi-tenant architecture with automated organizational workspaces, Stripe subscription billing, and audit logs.',
    technologies: ['React', 'Django REST Framework', 'PostgreSQL', 'AWS ECS', 'Docker', 'Stripe'],
    features: [
      'Instant automated tenant workspace provisioning',
      'Granular Role-Based Access Control (RBAC)',
      'Automated tiered recurring billing with usage metering',
      'Full compliance audit log recording all system events'
    ],
    architecture: 'React SPA → CloudFront → Django API Container on AWS ECS → Isolated Tenant Schemas'
  },
  {
    id: 'fleet-mobile-app',
    category: 'mobile',
    title: 'Cross-Platform Logistics & Fleet Telematics App',
    industry: 'Freight & Supply Chain Operations',
    shortDesc: 'Offline-first Android & iOS mobile app providing real-time telemetry, routing, and proof-of-delivery barcode scans.',
    problem: 'Drivers frequently lost cellular reception in rural transport corridors, resulting in dropped dispatch updates and delayed tracking.',
    solution: 'Built an offline-first mobile application in Flutter with local SQLite queuing that automatically synchronizes with central servers upon reconnect.',
    technologies: ['Flutter', 'Dart', 'Google Maps API', 'SQLite', 'Firebase Cloud Messaging'],
    features: [
      'Zero-data-loss offline SQLite event queue',
      'Dynamic GPS route optimization and toll avoidance',
      'High-speed camera barcode and document scanning',
      'Push notification alerts for urgent re-dispatch orders'
    ],
    architecture: 'Flutter Native Client ↔ Local SQLite Sync Engine ↔ WebSocket / REST API ↔ Fleet DB'
  },
  {
    id: 'cloud-devops-migration',
    category: 'cloud',
    title: 'Zero-Downtime AWS Cloud & CI/CD Modernization',
    industry: 'FinTech & High-Concurrency Systems',
    shortDesc: 'Full infrastructure hardening with Docker containerization, GitHub Actions CI/CD, and automated rolling deployments.',
    problem: 'Manual server deployments required 45 minutes of scheduled downtime and lacked automated vulnerability scans.',
    solution: 'Migrated infrastructure to AWS container services with blue-green deployments, automated test gating, and Prometheus/Grafana observability.',
    technologies: ['AWS ECS / RDS', 'Docker', 'GitHub Actions', 'Nginx', 'Grafana', 'Linux'],
    features: [
      '100% automated test gating before production release',
      'Zero-downtime rolling container updates',
      'Centralized audit logging and real-time alerts',
      'Automated daily encrypted snapshot backups'
    ],
    architecture: 'Git Push → GitHub Actions Linter & Tests → Docker Build → AWS ECR → ECS Blue-Green Deploy'
  },
  {
    id: 'ai-creative-engine',
    category: 'growth',
    title: 'AI Creative Ads Generator & Campaign Suite',
    industry: 'Performance Marketing & Digital Commerce',
    shortDesc: 'AI-powered studio generating multi-format ad copy, promotional creative banners, and automated audience targeting.',
    problem: 'Marketing teams spent over 2 weeks drafting copy variations and rendering multi-aspect creatives for omnichannel campaigns.',
    solution: 'Developed an automated AI Creative Studio that takes product inputs and produces copy variants, targeted headlines, and analytics tracking.',
    technologies: ['Generative AI', 'Python', 'FastAPI', 'Next.js', 'Ad Analytics API'],
    features: [
      'Instant generation of Instagram, LinkedIn & Google ad variations',
      'Platform-specific character counts and CTA optimization',
      'Integrated CTR & ROAS projection modeling',
      'One-click export to campaign managers'
    ],
    architecture: 'Product Prompt → LLM Variation Engine → Canvas Image Compositor → Campaign Exporter'
  }
];

export function initProjects() {
  const grid = document.getElementById('projects-grid');
  const filterBtns = document.querySelectorAll('.project-filter-btn');

  function renderProjects(category = 'all') {
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = category === 'all'
      ? PROJECTS_DATA
      : PROJECTS_DATA.filter(p => p.category === category || (category === 'web' && (p.category === 'ecommerce' || p.category === 'saas')));

    filtered.forEach((project, i) => {
      const card = document.createElement('div');
      card.className = 'glass-card project-card card-pop-in';
      card.style.animationDelay = `${Math.min(i, 10) * 0.05}s`;
      card.innerHTML = `
        <div class="project-card-badge">${project.industry}</div>
        <h3 class="project-card-title">${project.title}</h3>
        <p class="project-card-desc">${project.shortDesc}</p>
        <div class="project-tech-tags">
          ${project.technologies.slice(0, 4).map(t => `<span class="service-tech-tag">${t}</span>`).join('')}
        </div>
        <div class="project-card-footer">
          <a class="view-case-study-btn" href="project.html?id=${project.id}">
            <span>View Full Case Study</span>
            <span>→</span>
          </a>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat') || 'all';
      renderProjects(cat);
    });
  });

  // Initial render
  renderProjects('all');
}
