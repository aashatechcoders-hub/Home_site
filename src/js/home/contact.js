// Project intake: three short steps with progressive disclosure. A small
// IDEA → PLAN → BUILD → LAUNCH track advances as the visitor fills it in.
// Without JavaScript every step is visible and the form submits as one.
import { scrollToTarget } from '../site.js';

const NOTIFY_EMAIL = 'aashatechcoders@gmail.com';
const ENDPOINT = `https://formsubmit.co/ajax/${NOTIFY_EMAIL}`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STEP_NAMES = ['The idea', 'Budget and timing', 'Your details'];

export function initContactForm() {
  const form = document.getElementById('project-form');
  const success = document.querySelector('[data-form-success]');
  if (!form || !success) return;

  const steps = [...form.querySelectorAll('.pstep')];
  const label = form.querySelector('[data-step-label]');
  const back = form.querySelector('[data-step-back]');
  const next = form.querySelector('[data-step-next]');
  const submitBtn = form.querySelector('[data-submit]');
  const submitLabel = form.querySelector('[data-submit-label]');
  const errorBox = form.querySelector('[data-form-error]');
  const buildFieldset = form.querySelector('input[name="build"]').closest('fieldset');
  const track = document.querySelector('[data-intake-track]');
  const trackSteps = track ? [...track.querySelectorAll('[data-track]')] : [];
  let current = 0;

  const setError = (input, errEl, message) => {
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (errEl) errEl.textContent = message || '';
  };

  const validators = [
    () => {
      const ok = !!form.querySelector('input[name="build"]:checked');
      buildFieldset.classList.toggle('is-invalid', !ok);
      form.querySelector('#f-build-err').textContent = ok ? '' : 'Pick at least one — “Not sure yet” is fine.';
      return ok ? [] : [form.querySelector('input[name="build"]')];
    },
    () => [],
    () => {
      const invalid = [];
      const name = form.elements.name;
      const email = form.elements.email;
      const nameMsg = name.value.trim() ? '' : 'Please tell us your name.';
      setError(name, form.querySelector('#f-name-err'), nameMsg);
      if (nameMsg) invalid.push(name);
      const v = email.value.trim();
      const emailMsg = !v ? 'We need an email to reply to.' : EMAIL_RE.test(v) ? '' : 'That email address doesn’t look right.';
      setError(email, form.querySelector('#f-email-err'), emailMsg);
      if (emailMsg) invalid.push(email);
      return invalid;
    },
  ];

  function updateTrack(done = false) {
    const has = (sel) => !!form.querySelector(sel);
    const lit = [
      has('input[name="build"]:checked') || form.elements.details.value.trim().length > 3,
      current >= 1 && (has('input[name="budget"]:checked') || has('input[name="timeline"]:checked') || current >= 2),
      form.elements.name.value.trim() && EMAIL_RE.test(form.elements.email.value.trim()),
      done,
    ];
    let n = 0;
    while (n < lit.length && lit[n]) n++;
    trackSteps.forEach((li, i) => li.classList.toggle('on', i < n));
    track?.style.setProperty('--tp', n);
  }

  function show(i, focus = true) {
    current = i;
    steps.forEach((s, j) => {
      s.classList.toggle('is-current', j === i);
      s.disabled = false;
      s.hidden = j !== i;
    });
    label.textContent = `Step ${i + 1} of ${steps.length} · ${STEP_NAMES[i]}`;
    back.hidden = i === 0;
    next.hidden = i === steps.length - 1;
    submitBtn.hidden = i !== steps.length - 1;
    updateTrack();
    if (focus) steps[i].querySelector('input, textarea')?.focus({ preventScroll: true });
  }

  function goNext() {
    const invalid = validators[current]();
    if (invalid.length) return invalid[0].focus();
    show(Math.min(steps.length - 1, current + 1));
  }

  form.classList.add('is-stepped');
  show(0, false);
  next.addEventListener('click', goNext);
  back.addEventListener('click', () => show(Math.max(0, current - 1)));
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t.getAttribute('aria-invalid') === 'true') setError(t, form.querySelector(`#${t.id}-err`), '');
    if (t.name === 'build' && form.querySelector('input[name="build"]:checked')) {
      buildFieldset.classList.remove('is-invalid');
      form.querySelector('#f-build-err').textContent = '';
    }
    updateTrack();
  });

  const showFailure = () => {
    errorBox.replaceChildren(
      'We couldn’t send that automatically. Please email ',
      Object.assign(document.createElement('a'), { href: `mailto:${NOTIFY_EMAIL}`, textContent: NOTIFY_EMAIL }),
      ' or message us on ',
      Object.assign(document.createElement('a'), { href: 'https://wa.me/918978941066', textContent: 'WhatsApp', target: '_blank', rel: 'noopener' }),
      ' — your details are still in the form.'
    );
    errorBox.hidden = false;
  };

  const showSuccess = (name, email) => {
    success.querySelector('[data-success-name]').textContent = name ? `, ${name.split(' ')[0]}` : '';
    success.querySelector('[data-success-email]').textContent = email;
    updateTrack(true);
    form.hidden = true;
    success.hidden = false;
    success.focus();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;
    // Enter on an earlier step advances instead of submitting.
    if (current < steps.length - 1) return goNext();

    // Validate every step; jump back to the first one with a problem.
    for (let i = 0; i < steps.length; i++) {
      const invalid = validators[i]();
      if (invalid.length) {
        if (i !== current) show(i, false);
        invalid[0].focus();
        return;
      }
    }

    const data = new FormData(form);
    const name = data.get('name').trim();
    const email = data.get('email').trim();
    if (data.get('_honey')) return showSuccess(name, email);

    submitBtn.disabled = true;
    submitLabel.textContent = 'Sending…';
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          Name: name,
          Company: data.get('company').trim() || '—',
          Email: email,
          Phone: data.get('phone').trim() || '—',
          'Project type': data.getAll('build').join(', '),
          'What they want to build': data.get('details').trim() || '—',
          Budget: data.get('budget') || 'Not specified',
          Timeline: data.get('timeline') || 'Not specified',
          _subject: `New project request — ${name}${data.get('company') ? ` (${data.get('company').trim()})` : ''}`,
          _replyto: email,
          _template: 'table',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showSuccess(name, email);
    } catch (err) {
      console.warn('[ATC] form submit failed', err);
      showFailure();
    } finally {
      submitBtn.disabled = false;
      submitLabel.textContent = 'Send Project Request';
    }
  });

  success.querySelector('[data-form-reset]')?.addEventListener('click', () => {
    form.reset();
    success.hidden = true;
    form.hidden = false;
    show(0);
    scrollToTarget(form, { immediate: true });
  });
}
