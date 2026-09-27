export function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-link');

  // Mobile Drawer Toggle
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      mobileToggle.innerHTML = isOpen ? '✕' : '☰';
    });

    // Close on link click
    navItems.forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        if (mobileToggle) mobileToggle.innerHTML = '☰';
      });
    });

    // Dropdown toggle on click (touch/mobile friendly)
    const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
    const dropdown = document.querySelector('.nav-dropdown');
    if (dropdownToggle && dropdown) {
      dropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });

      document.addEventListener('click', () => {
        dropdown.classList.remove('open');
      });
    }

    // Close on dropdown item click
    const dropdownItems = document.querySelectorAll('.nav-dropdown-item');
    dropdownItems.forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        if (dropdown) dropdown.classList.remove('open');
        if (mobileToggle) mobileToggle.innerHTML = '☰';
      });
    });
  }

  // Active Section Spy
  const sections = document.querySelectorAll('section[id]');
  function updateActiveSection() {
    const scrollY = window.scrollY + 180;
    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navItems.forEach((item) => {
          if (item.getAttribute('href') === `#${sectionId}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }

  // Sticky Scroll Class
  function handleScroll() {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
    updateActiveSection();
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}
