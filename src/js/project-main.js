import { initNavigation } from './navigation.js';
import { initProjectDetail } from './project-detail.js';
import { initContact } from './contact.js';
import { initScrollReveal } from './scroll-reveal.js';
import {
  initPreloader,
  initHeroEntrance,
  initScrollProgress,
  initCursorSpotlight,
  initCardTilt,
} from './interactive-fx.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initProjectDetail();
  initContact();

  window.scrollTo(0, 0);

  initScrollProgress();
  initScrollReveal();
  initCursorSpotlight();
  initCardTilt();
  initPreloader(initHeroEntrance);
});
