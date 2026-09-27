export function initTeamNetwork() {
  const canvas = document.getElementById('team-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 200;
  }
  resize();
  window.addEventListener('resize', resize);

  // 4 Team Members on top row (Ganesh, Srinivas, and two distinct Vinays)
  const teamNodes = [
    { name: 'Ganagani Ganesh', label: 'Tech & Architecture', xRatio: 0.15 },
    { name: 'N. Srinivas', label: 'Systems & Engineering', xRatio: 0.38 },
    { name: 'Vinay', label: 'Frontend & Creative', xRatio: 0.62 },
    { name: 'Vinay', label: 'Backend & Cloud', xRatio: 0.85 }
  ];

  // Craft Areas on bottom row
  const craftNodes = [
    { name: 'ENGINEERING', xRatio: 0.1 },
    { name: 'AI & AUTOMATION', xRatio: 0.26 },
    { name: 'PRODUCT ARCHITECTURE', xRatio: 0.42 },
    { name: 'UI/UX DESIGN', xRatio: 0.58 },
    { name: 'CLOUD & DEVOPS', xRatio: 0.74 },
    { name: 'GROWTH & STRATEGY', xRatio: 0.9 }
  ];

  let pulseOffset = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const topY = 40;
    const botY = 160;

    pulseOffset += 0.02;

    // Draw interconnecting synapse lines
    teamNodes.forEach((t, i) => {
      const tx = t.xRatio * canvas.width;

      craftNodes.forEach((c, j) => {
        const cx = c.xRatio * canvas.width;

        // Gradient line
        const grad = ctx.createLinearGradient(tx, topY, cx, botY);
        const alpha = 0.12 + 0.08 * Math.sin(pulseOffset + i + j);
        grad.addColorStop(0, `rgba(0, 210, 255, ${alpha})`);
        grad.addColorStop(1, `rgba(0, 230, 118, ${alpha})`);

        ctx.beginPath();
        ctx.moveTo(tx, topY);
        ctx.bezierCurveTo(tx, (topY + botY) / 2, cx, (topY + botY) / 2, cx, botY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Traveling particle
        const tProgress = (pulseOffset * 0.4 + (i * 0.2) + (j * 0.15)) % 1;
        const px = (1 - tProgress) * tx + tProgress * cx;
        const py = (1 - tProgress) * topY + tProgress * botY;

        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? '#00d2ff' : '#00e676';
        ctx.fill();
      });

      // Draw team node
      ctx.beginPath();
      ctx.arc(tx, topY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#0e1733';
      ctx.fill();
      ctx.strokeStyle = '#00d2ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.name, tx, topY - 14);

      if (t.label) {
        ctx.fillStyle = '#00d2ff';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(t.label, tx, topY + 20);
      }
    });

    // Draw craft nodes
    craftNodes.forEach(c => {
      const cx = c.xRatio * canvas.width;
      ctx.beginPath();
      ctx.arc(cx, botY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#00e676';
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(c.name, cx, botY + 18);
    });

    requestAnimationFrame(draw);
  }

  draw();
}
