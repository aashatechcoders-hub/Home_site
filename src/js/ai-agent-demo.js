export const AGENT_PRESETS = {
  'e-commerce': {
    name: 'Smart Commerce & Retention Agent',
    role: 'Autonomous Inventory & Customer Concierge',
    problem: 'High customer drop-off on cart abandoned & slow manual support tickets during flash sales.',
    workflow: 'User behavior webhook triggers agent → queries inventory database → personalized recovery offer via WhatsApp/Email.',
    tools: ['Shopify GraphQL API', 'PostgreSQL DB', 'SendGrid', 'Stripe Refunds'],
    tech: ['GPT-4o / Claude 3.5', 'Pinecone Vector DB', 'Custom Webhooks', 'Function Calling'],
    userQuery: 'Customer #4920 left cart with 2 items. Check stock and offer approved discount code.',
    agentOutput: '⚡ Agent executed: Verified 14 units in stock. Generated 1-time 10% code "ATC10". Dispatched interactive WhatsApp notification. Cart status: Recovered ($140 value).'
  },
  'healthcare': {
    name: 'Clinical Triage & Appointment Agent',
    role: 'HIPAA-Compliant Patient Assistant',
    problem: 'Reception phone lines overwhelmed; patients experiencing friction in triage & lab report routing.',
    workflow: 'Symptom description input → checks clinical triage safety rules → schedules doctor slot → sends secure SMS calendar invite.',
    tools: ['FHIR Clinical API', 'Google Calendar', 'Twilio SMS', 'Encrypted Vector Vault'],
    tech: ['Llama-3-70B Private VPC', 'HIPAA Guardrails', 'RAG on Clinic Guidelines'],
    userQuery: 'Patient reports mild fever for 2 days after travel. Needs booking with internal medicine.',
    agentOutput: '🩺 Agent executed: Assessed travel questionnaire (low risk). Found open Dr. Rao slot for today 4:30 PM. Booked slot ID #8812 and sent encrypted confirmation SMS.'
  },
  'real-estate': {
    name: 'Property Match & Lead Qualifier',
    role: 'Instant Broker Assistant',
    problem: 'Lead response delays cause 60% of buyers to contact rival agencies before receiving property brochures.',
    workflow: 'Buyer submits budget & preferences on portal → agent runs vector similarity search against active listings → sends curated PDF.',
    tools: ['MLS Database', 'WhatsApp Business API', 'PDF Generator', 'HubSpot CRM'],
    tech: ['RAG Vector Embeddings', 'OpenAI Function Calling', 'Webhook Automation'],
    userQuery: 'New lead looking for 3BHK near Tech Park under 1.2 Cr. Requested brochure.',
    agentOutput: '🏢 Agent executed: Scored 3 matching properties with 96% match rating. Dynamic PDF portfolio compiled. Sent via WhatsApp within 4 seconds. Lead priority set to HIGH in CRM.'
  },
  'finance': {
    name: 'Invoice Reconciliation & Audit Agent',
    role: 'Automated Financial Operations',
    problem: 'Finance team spends 15 hours weekly manually matching vendor invoices against bank statements.',
    workflow: 'PDF invoice arrives via email → OCR extracts line items → cross-references ERP database → flags discrepancies or approves payment.',
    tools: ['Paddle / Stripe', 'QuickBooks API', 'Document OCR', 'Slack Alerts'],
    tech: ['Document Vision LLM', 'Structured JSON Output', 'PostgreSQL Verification'],
    userQuery: 'New invoice INV-2026-99 received from Cloud Hosting vendor for $3,450.00.',
    agentOutput: '📊 Agent executed: Extracted line items. Matched against AWS monthly usage report ($3,450.00 exact match). Status: Approved and routed to Slack #finance-approvals.'
  },
  'startups': {
    name: 'Growth & Pitch Intelligence Agent',
    role: 'Full-Funnel Founder Co-Pilot',
    problem: 'Founders lack time to do deep competitor research and daily metric digest compilation.',
    workflow: 'Scrapes competitor updates → compiles GitHub & Product Hunt trend analysis → generates daily 5-minute Slack executive briefing.',
    tools: ['Perplexity / Firecrawl', 'GitHub API', 'Slack Webhook', 'Notion Database'],
    tech: ['Multi-Agent Crew', 'Web Search Grounding', 'Automated Summarization'],
    userQuery: 'Summarize top 3 competitive AI developer tools launched this week and our architectural advantages.',
    agentOutput: '🚀 Agent executed: Synthesized 18 product releases. Identified key gap in latency & self-hosting. Prepared 1-page tactical teardown saved to Notion Executive Board.'
  },
  'education': {
    name: 'Adaptive Student Tutor & Doubt Solver',
    role: '24/7 Coding Mentor',
    problem: 'Students get stuck on coding syntax and debug errors late at night when human instructors are offline.',
    workflow: 'Student pastes broken code & compiler error → agent performs AST analysis → provides hint without giving away whole assignment answer.',
    tools: ['Sandboxed Code Runner', 'Course LMS API', 'Discord Bot'],
    tech: ['CodeLLM', 'Socratic Pedagogical Prompting', 'Syntax Tree Analysis'],
    userQuery: 'TypeError: Cannot read property "map" of undefined in React useEffect.',
    agentOutput: '💡 Agent executed: Detected asynchronous API delay. Guided student to add conditional optional chaining `data?.map()` and empty array dependency. Student test passed!'
  },
  'logistics': {
    name: 'Fleet Dispatch & Route Optimizer',
    role: 'Supply Chain Operations Monitor',
    problem: 'Delivery delays caused by weather alerts and traffic bottlenecks requiring manual re-routing.',
    workflow: 'GPS ping + weather API triggers route recalculation → recalculates delivery sequence → notifies driver dashboard.',
    tools: ['Google Maps Route API', 'IoT Telematics', 'Driver App Push'],
    tech: ['Geospatial Optimization', 'Event-Driven Webhooks', 'Automated Alerts'],
    userQuery: 'Truck #18 facing unexpected highway closure on Route 4. 12 parcels onboard.',
    agentOutput: '🚛 Agent executed: Recalculated bypass route via State Highway 9. ETA revised by only +14 mins. Real-time ETA update pushed to receiving warehouses.'
  }
};

export function initAiAgentDemo() {
  const container = document.getElementById('ai-agent-section');
  if (!container) return;

  const selector = container.querySelector('.ai-category-selector');
  const agentName = container.querySelector('#agent-name');
  const agentRole = container.querySelector('#agent-role');
  const agentProblem = container.querySelector('#agent-problem');
  const agentWorkflow = container.querySelector('#agent-workflow');
  const agentQuery = container.querySelector('#agent-query');
  const agentOutput = container.querySelector('#agent-output');
  const agentTechList = container.querySelector('#agent-tech-list');

  const categories = Object.keys(AGENT_PRESETS);

  function loadCategory(catKey) {
    const data = AGENT_PRESETS[catKey] || AGENT_PRESETS['e-commerce'];

    if (agentName) agentName.textContent = data.name;
    if (agentRole) agentRole.textContent = data.role;
    if (agentProblem) agentProblem.textContent = data.problem;
    if (agentWorkflow) agentWorkflow.textContent = data.workflow;
    if (agentQuery) agentQuery.textContent = `"${data.userQuery}"`;
    if (agentOutput) agentOutput.textContent = data.agentOutput;

    if (agentTechList) {
      agentTechList.innerHTML = data.tech
        .map(t => `<span class="service-tech-tag" style="color: #00e676; border-color: rgba(0,230,118,0.3);">${t}</span>`)
        .join('');
    }

    // Update active chip
    container.querySelectorAll('.cat-chip').forEach(btn => {
      if (btn.getAttribute('data-cat') === catKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Bind click handlers to category chips
  container.querySelectorAll('.cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cat = chip.getAttribute('data-cat');
      if (cat) loadCategory(cat);
    });
  });

  // Initial load
  loadCategory('e-commerce');
}
