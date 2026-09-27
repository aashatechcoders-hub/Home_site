export function initTechDemos() {
  const container = document.getElementById('tech-demos-section');
  if (!container) return;

  // Tab switching
  const tabs = container.querySelectorAll('.demo-tab-btn');
  const panels = container.querySelectorAll('.demo-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const activePanel = container.querySelector(`#demo-${target}`);
      if (activePanel) activePanel.classList.add('active');
    });
  });

  // Demo 1: Viewport Switcher
  const viewportBtns = container.querySelectorAll('.vp-btn');
  const viewportFrame = container.querySelector('#preview-viewport-frame');

  viewportBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewportBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-mode');

      if (viewportFrame) {
        if (mode === 'desktop') {
          viewportFrame.style.maxWidth = '100%';
          viewportFrame.style.height = '360px';
        } else if (mode === 'tablet') {
          viewportFrame.style.maxWidth = '768px';
          viewportFrame.style.height = '420px';
        } else if (mode === 'mobile') {
          viewportFrame.style.maxWidth = '375px';
          viewportFrame.style.height = '480px';
        }
      }
    });
  });

  // Demo 2: API Flow Runner
  const apiRunBtn = container.querySelector('#run-api-flow-btn');
  const apiSteps = container.querySelectorAll('.api-step-node');
  const apiOutput = container.querySelector('#api-live-response');

  if (apiRunBtn) {
    apiRunBtn.addEventListener('click', () => {
      apiRunBtn.disabled = true;
      apiRunBtn.textContent = '⚡ Simulating Request...';

      let currentStep = 0;
      apiSteps.forEach(s => s.classList.remove('step-active', 'step-done'));

      const interval = setInterval(() => {
        if (currentStep > 0 && currentStep <= apiSteps.length) {
          apiSteps[currentStep - 1].classList.remove('step-active');
          apiSteps[currentStep - 1].classList.add('step-done');
        }

        if (currentStep < apiSteps.length) {
          apiSteps[currentStep].classList.add('step-active');
          currentStep++;
        } else {
          clearInterval(interval);
          if (apiOutput) {
            apiOutput.textContent = JSON.stringify({
              status: 200,
              message: "OK - Authenticated & Cached",
              latency_ms: 24,
              endpoint: "/api/v1/business-intelligence/metrics",
              payload: {
                active_users: 1420,
                cache_hit: true,
                database_source: "PostgreSQL Replica #2"
              }
            }, null, 2);
          }
          apiRunBtn.disabled = false;
          apiRunBtn.textContent = '▶ Send API Request';
        }
      }, 400);
    });
  }

  // Demo 3: CI/CD Pipeline
  const cicdBtn = container.querySelector('#run-cicd-btn');
  const cicdNodes = container.querySelectorAll('.cicd-pipeline-node');
  const cicdLog = container.querySelector('#cicd-log-terminal');

  if (cicdBtn) {
    cicdBtn.addEventListener('click', () => {
      cicdBtn.disabled = true;
      cicdBtn.textContent = '🚀 Deploying Pipeline...';
      if (cicdLog) cicdLog.textContent = '[CI/CD] Triggered commit: git push origin main\n';

      let step = 0;
      cicdNodes.forEach(n => n.classList.remove('active-node', 'done-node'));

      const logs = [
        '[1/5] Running ESLint & Unit Tests... PASS (48/48 tests)',
        '[2/5] Building Docker multi-stage image atc-app:v2.4... OK',
        '[3/5] Trivy Vulnerability Scan: 0 Critical, 0 High... PASSED',
        '[4/5] Pushing image to AWS ECR & rolling restart on ECS...',
        '[5/5] Healthcheck 200 OK. Deployment completed in 18.2s!'
      ];

      const interval = setInterval(() => {
        if (step > 0 && step <= cicdNodes.length) {
          cicdNodes[step - 1].classList.remove('active-node');
          cicdNodes[step - 1].classList.add('done-node');
        }

        if (step < cicdNodes.length) {
          cicdNodes[step].classList.add('active-node');
          if (cicdLog) cicdLog.textContent += `${logs[step]}\n`;
          step++;
        } else {
          clearInterval(interval);
          cicdBtn.disabled = false;
          cicdBtn.textContent = '▶ Run CI/CD Pipeline';
        }
      }, 500);
    });
  }
}
