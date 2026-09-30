// Solution blueprints: how ATC approaches each class of problem.
// Deliberately contains no client names or outcome metrics — add those only
// when a real engagement can be verified and the client has agreed.
export const PROJECTS = [
  {
    id: 'ai-ops-agent',
    title: 'AI Support & Operations Agent',
    category: 'AI & Automation',
    industry: 'Enterprise operations',
    accent: '#4f7dff',
    summary: 'A multi-step AI agent that answers tier-1 support questions, routes tickets and triggers backend workflows.',
    problem:
      'Support teams spend a large share of their week answering the same troubleshooting questions. The issues that genuinely need a person wait behind the ones that don’t.',
    solution:
      'An AI agent connected to the company knowledge base and internal CRM APIs. It retrieves the right context, answers routine questions, carries out approved actions through function calls, and hands anything uncertain to a person with the full conversation attached.',
    technologies: ['Python', 'FastAPI', 'LangChain', 'Vector database (Pinecone)', 'Docker', 'Webhooks'],
    features: [
      'Multi-step reasoning with function calling',
      'Retrieval over private company knowledge (RAG)',
      'Confidence scoring with automatic human escalation',
      'Structured JSON output for downstream systems',
    ],
    architecture: ['Webhook', 'API Gateway', 'Intent Classifier', 'Vector Search', 'Tool Execution', 'JSON Response'],
  },
  {
    id: 'headless-ecommerce',
    title: 'Headless Commerce Platform',
    category: 'Web & Commerce',
    industry: 'Retail & direct-to-consumer',
    accent: '#2fd4ef',
    summary: 'A fast storefront with search, cart recovery and a resilient checkout, designed to hold up during sales peaks.',
    problem:
      'Monolithic storefronts often slow down or fail under sale-day traffic, because every page view waits on the same database.',
    solution:
      'A headless Next.js storefront rendered at the edge, backed by Node.js services, a Redis cache and PostgreSQL read replicas — so traffic spikes hit the cache, not the database.',
    technologies: ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe'],
    features: [
      'Edge-rendered product and category pages',
      'Cart-abandonment recovery over WhatsApp',
      'Multi-currency payments through Stripe',
      'Real-time inventory updates to prevent overselling',
    ],
    architecture: ['Next.js Edge', 'Redis Cache', 'Node.js Services', 'PostgreSQL Replicas'],
  },
  {
    id: 'b2b-saas-portal',
    title: 'Multi-Tenant SaaS & Billing Platform',
    category: 'SaaS',
    industry: 'B2B software',
    accent: '#8b7cf6',
    summary: 'Subscription platform with isolated tenant workspaces, team roles and usage-based billing.',
    problem:
      'Manual customer onboarding and missing role-based access make it hard for a growing SaaS product to sell to larger organisations.',
    solution:
      'A multi-tenant architecture with automatic workspace provisioning, granular role-based access control, Stripe subscription billing with usage metering, and a complete audit log.',
    technologies: ['React', 'Django REST Framework', 'PostgreSQL', 'AWS ECS', 'Docker', 'Stripe'],
    features: [
      'Automatic tenant workspace provisioning',
      'Granular role-based access control (RBAC)',
      'Tiered and usage-based recurring billing',
      'Audit log of every significant system event',
    ],
    architecture: ['React SPA', 'CloudFront', 'Django API on ECS', 'Tenant Schemas'],
  },
  {
    id: 'fleet-mobile-app',
    title: 'Offline-First Fleet & Logistics App',
    category: 'Mobile',
    industry: 'Logistics & supply chain',
    accent: '#2fd4ef',
    summary: 'Android and iOS app for drivers with live tracking, routing and proof-of-delivery scanning that keeps working without signal.',
    problem:
      'Drivers on rural routes regularly lose mobile coverage, so dispatch updates are dropped and tracking goes dark.',
    solution:
      'A Flutter app that queues every event in local SQLite and syncs automatically when the connection returns, with maps-based routing and camera scanning built in.',
    technologies: ['Flutter', 'Dart', 'Google Maps API', 'SQLite', 'Firebase Cloud Messaging'],
    features: [
      'Offline event queue with automatic sync',
      'Route guidance with Google Maps',
      'Camera barcode and document scanning',
      'Push alerts for urgent re-dispatch',
    ],
    architecture: ['Flutter Client', 'SQLite Sync Queue', 'REST / WebSocket API', 'Fleet Database'],
  },
  {
    id: 'cloud-devops-migration',
    title: 'Zero-Downtime Cloud & CI/CD Modernisation',
    category: 'Cloud & DevOps',
    industry: 'Fintech & high-traffic systems',
    accent: '#4f7dff',
    summary: 'Containerised infrastructure with automated testing, security checks and blue-green deployments on AWS.',
    problem:
      'Manual server deployments need scheduled downtime, and nothing stops a failing build or a vulnerable dependency from reaching production.',
    solution:
      'Applications containerised with Docker and released to AWS through GitHub Actions. Every change is linted, tested and scanned, then shipped with blue-green deployment and monitored in Grafana.',
    technologies: ['AWS ECS / RDS', 'Docker', 'GitHub Actions', 'Nginx', 'Grafana', 'Linux'],
    features: [
      'Automated test gates before every release',
      'Blue-green deployments with instant rollback',
      'Centralised logs and real-time alerts',
      'Automated, encrypted daily backups',
    ],
    architecture: ['Git Push', 'Tests & Lint', 'Docker Build', 'AWS ECR', 'Blue-Green Deploy'],
  },
];

// How each blueprint moves through the lifecycle — approach only, no outcomes.
const LIFECYCLE = {
  'ai-ops-agent': {
    requirements: ['Answer routine questions from approved company knowledge only', 'Take a small set of safe actions through existing CRM APIs', 'Hand off to a person, with context, whenever confidence is low', 'Log every conversation and action for review'],
    ux: 'A chat experience embedded where customers already ask for help, with a clear signal when a person has taken over.',
    development: 'A retrieval pipeline over the knowledge base, a tool layer wrapping approved API calls, and a confidence gate in front of every action.',
    testing: 'A regression set of real-world question types, tests for every tool call, and adversarial prompts to check the agent refuses what it should.',
    deployment: 'A containerised FastAPI service behind the existing gateway, rolled out to a small share of traffic first, with conversation monitoring from day one.',
  },
  'headless-ecommerce': {
    requirements: ['Stay fast and available during sale-day traffic', 'Keep inventory accurate across simultaneous orders', 'Support multiple currencies and payment methods', 'Recover abandoned carts'],
    ux: 'Product and category pages that render instantly, a short checkout, and cart-recovery messages on WhatsApp.',
    development: 'A Next.js storefront rendered at the edge, Node.js services for cart and orders, Redis caching and PostgreSQL read replicas.',
    testing: 'Load tests that simulate sale peaks, end-to-end checkout tests, and concurrency tests on inventory updates.',
    deployment: 'Blue-green releases for the services, cache warm-up before traffic switches, and dashboards for checkout errors and latency.',
  },
  'b2b-saas-portal': {
    requirements: ['Onboard new customer organisations without manual setup', 'Granular roles and permissions per organisation', 'Subscription and usage-based billing', 'An audit trail for every significant action'],
    ux: 'Self-serve workspace creation, team invitations and a billing page that organisation admins can manage themselves.',
    development: 'A Django REST API with schema-level tenant isolation, a React SPA, Stripe billing integration and an audit-log service.',
    testing: 'Permission-matrix tests for every role, tenant-isolation tests, and billing scenarios run against Stripe test mode.',
    deployment: 'Containers on AWS ECS behind CloudFront, migrations run per tenant schema, and alerts on billing webhooks.',
  },
  'fleet-mobile-app': {
    requirements: ['Keep working with no mobile signal', 'Never lose a delivery event', 'Scan barcodes and documents as proof of delivery', 'Alert drivers to urgent re-dispatch'],
    ux: 'Large touch targets for use in a vehicle, a clear sync status, and a scan flow that works one-handed.',
    development: 'A Flutter app with a local SQLite event queue, a sync engine that retries safely, and REST/WebSocket APIs to the fleet backend.',
    testing: 'Offline and flaky-network scenarios on real devices, sync-conflict tests, and scanner tests in poor lighting.',
    deployment: 'Staged rollouts through the App Store and Play Store, with backend changes kept compatible with older app versions.',
  },
  'cloud-devops-migration': {
    requirements: ['Release without scheduled downtime', 'Stop failing builds and vulnerable dependencies reaching production', 'Roll back instantly if something goes wrong', 'Automated, encrypted backups'],
    ux: 'A pipeline view the team can read at a glance, and one-click promotion from staging to production.',
    development: 'Dockerfiles for every service, GitHub Actions pipelines with lint, test and security-scan gates, and infrastructure defined as code.',
    testing: 'Pipeline dry-runs on staging, restore tests for backups, and failure drills for rollback.',
    deployment: 'Blue-green deployment on AWS ECS with health checks, automatic rollback, and Grafana dashboards with alerting.',
  },
};
PROJECTS.forEach((p) => Object.assign(p, LIFECYCLE[p.id]));
