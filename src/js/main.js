import { initGlobe } from './globe.js';
import { initNavigation } from './navigation.js';
import { initPillarsAndServices } from './pillars.js';
import { initAiAgentDemo } from './ai-agent-demo.js';
import { initAiCreativeStudio } from './ai-creative.js';
import { initTechDemos } from './tech-demos.js';
import { initProjects } from './projects.js';
import { initTechUniverse } from './technologies.js';
import { initTeamNetwork } from './team-network.js';
import { initContact } from './contact.js';
import { initScrollReveal, initStatCounters } from './scroll-reveal.js';
import {
  initPreloader,
  initHeroEntrance,
  initScrollProgress,
  initCursorSpotlight,
  initCardTilt,
} from './interactive-fx.js';

function runATC() {
  // Motion & flow layer first, so preloader dismisses without blocking
  initPreloader(initHeroEntrance);
  initScrollProgress();
  initScrollReveal();
  initStatCounters();
  initCursorSpotlight();
  initCardTilt();

  // Initialize interactive components safely
  const inits = [
    ['Globe', initGlobe],
    ['Navigation', initNavigation],
    ['Pillars', initPillarsAndServices],
    ['AiAgentDemo', initAiAgentDemo],
    ['AiCreative', initAiCreativeStudio],
    ['TechDemos', initTechDemos],
    ['Projects', initProjects],
    ['TechUniverse', initTechUniverse],
    ['TeamNetwork', initTeamNetwork],
    ['Contact', initContact],
  ];

  for (const [name, fn] of inits) {
    try {
      fn();
    } catch (err) {
      console.warn(`[ATC] Warning initializing ${name}:`, err);
    }
  }

  console.log('⚡ ATC — AASHA TECH CODERS initialized. "CODE TODAY • A BRIGHTER TOMORROW"');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runATC);
} else {
  runATC();
}
