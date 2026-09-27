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

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all interactive components
  initGlobe();
  initNavigation();
  initPillarsAndServices();
  initAiAgentDemo();
  initAiCreativeStudio();
  initTechDemos();
  initProjects();
  initTechUniverse();
  initTeamNetwork();
  initContact();

  // Motion & flow layer
  initScrollProgress();
  initScrollReveal();
  initStatCounters();
  initCursorSpotlight();
  initCardTilt();
  initPreloader(initHeroEntrance);

  console.log('⚡ ATC — AASHA TECH CODERS initialized. "CODE TODAY • A BRIGHTER TOMORROW"');
});
