// Order matches the constellation nodes in index.html (tab ids cn-tab-0 … cn-tab-7).
// Only technologies ATC works with.
export const TECH_DOMAINS = [
  {
    title: 'Frontend',
    desc: 'Interfaces that load fast, work on every screen and stay maintainable as the product grows.',
    items: [
      ['React', 'Component-driven interfaces, dashboards and single-page apps.'],
      ['TypeScript', 'Type-safe code that stays easy to change as it grows.'],
      ['Vite', 'Fast builds and a fast development loop.'],
      ['Tailwind CSS', 'Consistent, maintainable styling at speed.'],
      ['Next.js', 'Server-rendered sites and portals that load fast and rank well.'],
    ],
  },
  {
    title: 'Backend',
    desc: 'APIs and services with clear structure, strong validation and room to scale.',
    items: [
      ['Python', 'Our core language for APIs, automation and AI pipelines.'],
      ['Django', 'Secure, batteries-included framework for business systems.'],
      ['FastAPI', 'High-performance async APIs with automatic documentation.'],
      ['Node.js', 'Real-time services, WebSockets and streaming APIs.'],
      ['REST APIs', 'Versioned, documented contracts for apps and partners.'],
    ],
  },
  {
    title: 'Database',
    desc: 'Data models designed for correctness first, then tuned for speed.',
    items: [
      ['PostgreSQL', 'Primary relational database for transactional systems.'],
      ['Redis', 'Caching, sessions, rate limiting and job queues.'],
      ['MySQL', 'Reliable storage for established business platforms.'],
      ['MongoDB', 'Flexible documents for catalogues and dynamic schemas.'],
    ],
  },
  {
    title: 'AI',
    desc: 'Practical AI grounded in your own data, with people kept in the loop where it matters.',
    items: [
      ['LLM APIs', 'Language models integrated into products and internal tools.'],
      ['RAG pipelines', 'Answers grounded in your documents, not guesswork.'],
      ['Vector databases', 'Semantic search across large collections of content.'],
      ['LangChain', 'Agents with tool calling and multi-step workflows.'],
    ],
  },
  {
    title: 'Mobile',
    desc: 'One codebase for Android and iOS, built to keep working when the network does not.',
    items: [
      ['Flutter', 'Cross-platform apps for Android and iOS from a single codebase.'],
      ['Dart', 'Fast, typed language behind every Flutter app.'],
      ['Firebase', 'Push notifications, authentication and analytics.'],
      ['SQLite', 'Local storage for offline-first sync.'],
    ],
  },
  {
    title: 'DevOps',
    desc: 'Releases that are routine: tested, reviewed, automated and reversible.',
    items: [
      ['Git', 'Branching, reviewed pull requests and full history.'],
      ['GitHub Actions', 'CI/CD with tests, scans and automated deploys.'],
      ['Docker', 'Identical environments from laptop to production.'],
      ['CI/CD', 'Every change built, tested and released the same way.'],
      ['Monitoring', 'Metrics, logs and alerts on everything we run.'],
    ],
  },
  {
    title: 'Cloud',
    desc: 'Infrastructure you own, can understand and can afford to run.',
    items: [
      ['Linux', 'Hardened servers we configure and maintain.'],
      ['Nginx', 'Reverse proxy, TLS termination and load balancing.'],
      ['AWS', 'Compute, managed databases, storage and CDN.'],
      ['VPS hosting', 'Lean, cost-effective servers where they fit best.'],
    ],
  },
  {
    title: 'Automation',
    desc: 'Workflows that move data between systems and run without anyone clicking.',
    items: [
      ['Python', 'Scripts and services that do the repetitive work.'],
      ['Webhooks', 'Real-time triggers between the tools you already use.'],
      ['REST integrations', 'Connecting CRMs, payment, email and internal systems.'],
      ['Scheduled jobs & queues', 'Reliable background processing and reporting.'],
    ],
  },
];
