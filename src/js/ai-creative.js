export const CREATIVE_PRESETS = {
  'saas-launch': {
    format: 'Instagram & LinkedIn Carousel (1080x1080)',
    headline: 'Stop Burning Hours on Manual Ops. Automate with ATC.',
    body: 'Discover custom AI Agents that execute 40+ daily workflows with zero code friction. Built for modern fast-moving startups.',
    cta: 'Explore AI Agents →',
    stats: 'CTR: 4.82% • Avg CPC: $0.42 • ROAS: 3.8x',
    tags: ['#AIAgents', '#Automation', '#TechStartup', '#ATC']
  },
  'ecommerce-flash': {
    format: 'Instagram Story & Reels Video Ad (9:16)',
    headline: 'The Future of Shopping is Personalized & Instant.',
    body: 'Hyper-responsive storefronts built with sub-second checkout and automated WhatsApp retention flows.',
    cta: 'Shop Collection Now →',
    stats: 'CTR: 6.14% • Conversion Rate: 8.9% • ROAS: 5.2x',
    tags: ['#Ecommerce', '#NextJSCommerce', '#FlashSale', '#ShopSmart']
  },
  'enterprise-cloud': {
    format: 'Google Search & LinkedIn Sponsored Content',
    headline: 'Zero-Downtime AWS Architecture & Hardened DevOps.',
    body: 'Scale from 10k to 10M daily requests with bulletproof Kubernetes clustering and continuous CI/CD reliability.',
    cta: 'Book Tech Architecture Review →',
    stats: 'CTR: 3.91% • High Intent Score: 94% • Pipeline Value: $180k',
    tags: ['#DevOps', '#AWSCloud', '#EnterpriseEngineering', '#CI_CD']
  }
};

export function initAiCreativeStudio() {
  const container = document.getElementById('ai-creative-section');
  if (!container) return;

  const campaignSelect = container.querySelector('#campaign-type-select');
  const formatTag = container.querySelector('#ad-format-tag');
  const headlineEl = container.querySelector('#ad-headline');
  const bodyEl = container.querySelector('#ad-body');
  const ctaEl = container.querySelector('#ad-cta');
  const statsEl = container.querySelector('#ad-stats');
  const generateBtn = container.querySelector('#generate-variations-btn');

  function updateCreative(key) {
    const data = CREATIVE_PRESETS[key] || CREATIVE_PRESETS['saas-launch'];
    if (formatTag) formatTag.textContent = data.format;
    if (headlineEl) headlineEl.textContent = data.headline;
    if (bodyEl) bodyEl.textContent = data.body;
    if (ctaEl) ctaEl.textContent = data.cta;
    if (statsEl) statsEl.textContent = data.stats;
  }

  if (campaignSelect) {
    campaignSelect.addEventListener('change', (e) => {
      updateCreative(e.target.value);
    });
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      generateBtn.textContent = '⚡ Generating Variations...';
      generateBtn.disabled = true;

      setTimeout(() => {
        const keys = Object.keys(CREATIVE_PRESETS);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        if (campaignSelect) campaignSelect.value = randomKey;
        updateCreative(randomKey);

        generateBtn.textContent = '✨ Generate AI Variations';
        generateBtn.disabled = false;
      }, 500);
    });
  }

  // Initial
  updateCreative('saas-launch');
}
