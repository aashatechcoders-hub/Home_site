const NOTIFY_EMAIL = 'aashatechcoders@gmail.com';

export function showToast(message, icon = '✓') {
  let container = document.querySelector('.atc-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'atc-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'atc-toast';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

export function initContact() {
  const form = document.getElementById('project-inquiry-form');
  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = form.querySelector('#client-name')?.value.trim();
      const email = form.querySelector('#client-email')?.value.trim();
      const phone = form.querySelector('#client-phone')?.value.trim();
      const service = form.querySelector('#project-service')?.value;
      const scope = form.querySelector('#project-scope')?.value.trim();

      if (!name || !email) {
        showToast('Please provide your name and email.', '⚠️');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending your inquiry…</span>';
      }

      try {
        const response = await fetch(`https://formsubmit.co/ajax/${NOTIFY_EMAIL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            Name: name,
            Email: email,
            Phone: phone || 'Not provided',
            'Capability Needed': service,
            'Project Details': scope || 'Not provided',
            _subject: `New ATC Project Inquiry from ${name}`,
            _template: 'table',
          }),
        });

        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

        showToast(`Thank you, ${name}! Your inquiry has been sent. The ATC team will reach out within 24 hours.`, '🚀');
        form.reset();
      } catch (err) {
        showToast(`We couldn't send that automatically — please email ${NOTIFY_EMAIL} directly or reach us on WhatsApp.`, '⚠️');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    });
  }

  // Copy email and phone quick actions
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(NOTIFY_EMAIL);
      showToast(`Copied email: ${NOTIFY_EMAIL} to clipboard!`, '📋');
    });
  }

  const copyPhoneBtn = document.getElementById('copy-phone-btn');
  if (copyPhoneBtn) {
    copyPhoneBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('8978941066');
      showToast('Copied phone: 8978941066 to clipboard!', '📞');
    });
  }

  // FAQ accordion — only one open at a time per group
  document.querySelectorAll('.faq-list').forEach((list) => {
    const items = list.querySelectorAll('details.faq-item');
    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          items.forEach((other) => {
            if (other !== item) other.open = false;
          });
        }
      });
    });
  });

  // Back to top
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
