/**
 * Physics-themed visualizations for AI interpretability slide deck.
 * All canvas-based, DPR-aware. Palette: teal / red / amber / purple.
 */
const Viz = (() => {
  const TAU = Math.PI * 2;
  const dpr = window.devicePixelRatio || 1;
  const TEAL = '#78c4a4', TEAL2 = '#5ba88a', RED = '#d94f4f', AMBER = '#e8a02a', PURPLE = '#b893e6';

  /** DPR-aware canvas setup. Returns { ctx, w, h } in CSS pixels. */
  function setup(canvas) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w: rect.width, h: rect.height };
  }

  /** Parse hex color to [r, g, b]. */
  function hex(c) {
    return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  }

  /** True when the canvas's parent slide is the active one. */
  function isActive(canvas) { return !!canvas.closest('.slide.active'); }

  // ════════════════════════════════════════════════════════════════
  // 1. ORBITS — full-screen title background.
  //    80 particles on elliptical orbits with fading comet trails.
  // ════════════════════════════════════════════════════════════════
  function orbits(canvas) {
    const { ctx, w, h } = setup(canvas);
    const cx = w / 2, cy = h / 2;
    const colors = [TEAL, TEAL2, AMBER, RED, PURPLE];
    const N = 80;
    const TRAIL_LEN = 15;

    const particles = Array.from({ length: N }, (_, i) => {
      const r = 60 + Math.random() * Math.min(w, h) * 0.42;
      return {
        angle: Math.random() * TAU,
        r,
        speed: 0.12 / Math.sqrt(r / 80),   // Kepler-like: inner = faster
        size: 0.8 + Math.random() * 1.8,
        color: colors[i % 5],
        opacity: 0.1 + Math.random() * 0.35,
        trail: [],
      };
    });

    function frame() {
      if (!isActive(canvas)) { requestAnimationFrame(frame); return; }

      // Motion-blur clear
      ctx.fillStyle = 'rgba(11,15,20,0.12)';
      ctx.fillRect(0, 0, w, h);

      // Central glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
      g.addColorStop(0, 'rgba(120,196,164,0.05)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(cx - 220, cy - 220, 440, 440);

      // Faint orbit rings
      [90, 160, 250, 340].forEach(r => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.55, 0, 0, TAU);
        ctx.strokeStyle = 'rgba(255,255,255,0.02)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Update & draw particles
      particles.forEach(p => {
        p.angle += p.speed * 0.018;
        const x = cx + p.r * Math.cos(p.angle);
        const y = cy + p.r * Math.sin(p.angle) * 0.55;   // elliptical
        p.trail.push({ x, y });
        if (p.trail.length > TRAIL_LEN) p.trail.shift();

        // Fading trail
        if (p.trail.length > 2) {
          for (let i = 1; i < p.trail.length; i++) {
            const frac = i / p.trail.length;
            ctx.beginPath();
            ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = p.opacity * frac * 0.3;
            ctx.lineWidth = p.size * frac * 0.8;
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }

        // Head dot
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, TAU);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      requestAnimationFrame(frame);
    }
    frame();
  }

  // ════════════════════════════════════════════════════════════════
  // 2. AETHER WAVES — very subtle transverse-wave background.
  //    Grid of dots displaced vertically. No connections.
  //    Kept extremely faint so overlaid text stays readable.
  // ════════════════════════════════════════════════════════════════
  function aetherWaves(canvas) {
    const { ctx, w, h } = setup(canvas);
    let t = 0;
    const cols = 50, rows = 16;
    const sx = w / (cols - 1), sy = h / (rows - 1);

    function frame() {
      if (!isActive(canvas)) { requestAnimationFrame(frame); return; }
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = c * sx, by = r * sy;
          // Transverse wave propagating left → right
          const wave = Math.sin(c * 0.28 - t * 2.0) * 12
                     + Math.sin(c * 0.16 - t * 1.2 + r * 0.12) * 7;
          const py = by + wave;
          const disp = Math.abs(wave);

          // Very low opacity — max ~0.05 so text remains readable
          const alpha = Math.min(0.015 + disp * 0.002, 0.05);
          const rb = 140 + disp * 3, gb = 100 + disp * 2, bb = 220;
          ctx.fillStyle = `rgba(${rb},${gb},${bb},${alpha})`;
          ctx.beginPath();
          ctx.arc(bx, py, 1.4 + disp * 0.04, 0, TAU);
          ctx.fill();
        }
      }

      requestAnimationFrame(frame);
    }
    frame();
  }

  // ════════════════════════════════════════════════════════════════
  // 3. MM RESULT — Michelson-Morley null result chart.
  //    X: rotation 0°–360°. Y: fringe shift.
  //    Red dashed = expected sinusoidal. Teal solid = observed flat.
  // ════════════════════════════════════════════════════════════════
  function mmResult(canvas) {
    const { ctx, w, h } = setup(canvas);
    const pad = { t: 28, r: 14, b: 34, l: 38 };
    const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
    const zeroY = pad.t + ph * 0.5;

    // ── Axes ──
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, h - pad.b);
    ctx.lineTo(w - pad.r, h - pad.b);
    ctx.stroke();

    // ── Tick marks on X axis ──
    ctx.font = '8px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const x = pad.l + (i / 4) * pw;
      ctx.beginPath();
      ctx.moveTo(x, h - pad.b);
      ctx.lineTo(x, h - pad.b + 4);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.stroke();
      ctx.fillText(`${i * 90}°`, x, h - pad.b + 15);
    }

    // ── Tick marks on Y axis ──
    ctx.textAlign = 'right';
    for (let i = -1; i <= 1; i++) {
      const y = zeroY - i * ph * 0.38;
      ctx.beginPath();
      ctx.moveTo(pad.l - 3, y);
      ctx.lineTo(pad.l, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.stroke();
      if (i !== 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillText(i > 0 ? '+Δ' : '−Δ', pad.l - 6, y + 3);
      }
    }

    // ── Zero line ──
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(pad.l, zeroY);
    ctx.lineTo(w - pad.r, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Expected curve — area fill under ──
    function expectedY(i) {
      return pad.t + ph * (1 - (Math.sin((i / 200) * Math.PI * 4) * 0.38 + 0.5));
    }

    ctx.beginPath();
    ctx.moveTo(pad.l, zeroY);
    for (let i = 0; i <= 200; i++) {
      ctx.lineTo(pad.l + (i / 200) * pw, expectedY(i));
    }
    ctx.lineTo(w - pad.r, zeroY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(217,79,79,0.06)';
    ctx.fill();

    // Expected curve — red dashed line
    ctx.beginPath();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = RED;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= 200; i++) {
      const x = pad.l + (i / 200) * pw;
      i === 0 ? ctx.moveTo(x, expectedY(i)) : ctx.lineTo(x, expectedY(i));
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // ── Observed curve — teal solid with tiny noise ──
    ctx.beginPath();
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 2;
    for (let i = 0; i <= 200; i++) {
      const x = pad.l + (i / 200) * pw;
      const noise = Math.sin(i * 7.3 + 42) * 0.012
                  + Math.sin(i * 13.1) * 0.008
                  + Math.sin(i * 3.7) * 0.005;
      const y = pad.t + ph * (1 - (0.5 + noise));
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // ── Axis labels ──
    ctx.font = '500 8px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillText('ROTATION ANGLE', pad.l + pw / 2, h - 4);
    ctx.save();
    ctx.translate(10, pad.t + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('FRINGE SHIFT', 0, 0);
    ctx.restore();
    ctx.textAlign = 'left';

    // ── Legend ──
    const lx = w - pad.r - 105, ly = pad.t + 6;
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = RED;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx + 16, ly);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px "IBM Plex Mono", monospace';
    ctx.fillText('expected', lx + 20, ly + 3);

    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, ly + 14);
    ctx.lineTo(lx + 16, ly + 14);
    ctx.stroke();
    ctx.fillText('observed', lx + 20, ly + 17);
  }

  // ════════════════════════════════════════════════════════════════
  // 4. GRAVITY FIELD — inverse-square heatmap with 3 masses.
  //    Voronoi-like weighting by 1/r², equipotential circles,
  //    sparse gradient arrows, radial glow on mass centers.
  // ════════════════════════════════════════════════════════════════
  function gravityField(canvas) {
    const { ctx, w, h } = setup(canvas);
    const masses = [
      { x: w * 0.3, y: h * 0.4, m: 1.0, color: TEAL },
      { x: w * 0.7, y: h * 0.55, m: 0.7, color: RED },
      { x: w * 0.5, y: h * 0.25, m: 0.5, color: AMBER },
    ];
    const res = 3;

    // ── Heatmap — dominant mass per pixel ──
    for (let px = 0; px < w; px += res) {
      for (let py = 0; py < h; py += res) {
        let pot = 0, best = 0, bestP = 0;
        masses.forEach((m, i) => {
          const dx = px - m.x, dy = py - m.y;
          const p = m.m / (dx * dx + dy * dy + 300) * 8000;
          pot += p;
          if (p > bestP) { bestP = p; best = i; }
        });
        const intensity = Math.min(pot * 0.12, 0.8);
        const [r, g, b] = hex(masses[best].color);
        ctx.fillStyle = `rgba(${r},${g},${b},${intensity * 0.5})`;
        ctx.fillRect(px, py, res, res);
      }
    }

    // ── Equipotential circles ──
    masses.forEach(m => {
      ctx.strokeStyle = m.color;
      for (let r = 25; r < 220; r += 30) {
        ctx.beginPath();
        ctx.arc(m.x, m.y, r, 0, TAU);
        ctx.globalAlpha = 0.06;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });

    // ── Force-field arrows (sparse) ──
    const step = 40;
    for (let px = step; px < w; px += step) {
      for (let py = step; py < h; py += step) {
        let fx = 0, fy = 0;
        masses.forEach(m => {
          const dx = m.x - px, dy = m.y - py;
          const r2 = dx * dx + dy * dy + 100;
          const f = m.m / r2 * 500;
          fx += dx / Math.sqrt(r2) * f;
          fy += dy / Math.sqrt(r2) * f;
        });
        const mag = Math.sqrt(fx * fx + fy * fy);
        if (mag < 0.5) continue;
        const len = Math.min(mag * 0.4, 14);
        const nx = fx / mag, ny = fy / mag;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + nx * len, py + ny * len);
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
        // Arrowhead
        const ax = px + nx * len, ay = py + ny * len;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - nx * 3 + ny * 2, ay - ny * 3 - nx * 2);
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - nx * 3 - ny * 2, ay - ny * 3 + nx * 2);
        ctx.stroke();
      }
    }

    // ── Mass centers with radial glow ──
    masses.forEach(m => {
      const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 22 + m.m * 16);
      g.addColorStop(0, m.color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.18;
      ctx.fillRect(m.x - 35, m.y - 35, 70, 70);
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.arc(m.x, m.y, 3 + m.m * 3, 0, TAU);
      ctx.fillStyle = m.color;
      ctx.fill();
    });

    // Label
    ctx.font = '500 9px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillText('F ∝ 1/r²', 8, h - 8);
  }

  // ════════════════════════════════════════════════════════════════
  // 5. MANIFOLD DISTORTION — THE MOST IMPORTANT VIZ.
  //    Top half:  "BEFORE ACTIVATION" — 30 points on a unit circle,
  //              teal (0°–180°) vs red (180°–360°). Dashed lines
  //              connecting opposite (180°-apart) pairs.
  //    Bottom:   "AFTER ReLU" — ReLU(x,y) = (max(0,x), max(0,y)).
  //              Negative quadrants collapse to axes/origin.
  //              Red glow at origin where opposites overlap.
  //    Static — no animation.
  // ════════════════════════════════════════════════════════════════
  function manifoldDistortion(canvas) {
    const { ctx, w, h } = setup(canvas);
    const N = 20;
    const points = Array.from({ length: N }, (_, i) => {
      const angle = (i / N) * TAU;
      return { angle, x: Math.cos(angle), y: Math.sin(angle) };
    });

    // Side-by-side: LEFT = before, RIGHT = after
    const pad = 20;
    const halfW = (w - pad * 3) / 2;
    const R = Math.min(halfW * 0.42, (h - 80) * 0.38);
    const leftCx = pad + halfW / 2;
    const rightCx = pad * 2 + halfW + halfW / 2;
    const cy = h / 2;

    // ── Helper: draw axes ──
    function drawAxes(cx) {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx - R - 8, cy); ctx.lineTo(cx + R + 8, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - R - 8); ctx.lineTo(cx, cy + R + 8); ctx.stroke();
      // Axis labels
      ctx.font = '400 7px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.textAlign = 'center';
      ctx.fillText('x₁', cx + R + 14, cy + 3);
      ctx.fillText('x₂', cx + 3, cy - R - 10);
    }

    // ══════ LEFT: BEFORE ACTIVATION ══════
    ctx.font = '600 9px "IBM Plex Mono", monospace';
    ctx.fillStyle = TEAL;
    ctx.globalAlpha = 0.5;
    ctx.textAlign = 'center';
    ctx.fillText('BEFORE', leftCx, 16);
    ctx.globalAlpha = 1;

    drawAxes(leftCx);

    // Unit circle
    ctx.beginPath(); ctx.arc(leftCx, cy, R, 0, TAU);
    ctx.strokeStyle = 'rgba(120,196,164,0.15)'; ctx.lineWidth = 1; ctx.stroke();

    // Points + opposite-pair dashed lines
    for (let i = 0; i < N; i++) {
      const a = points[i].angle;
      // Screen coords: standard math convention (right = +x, up = +y → screen up = -y)
      const px = leftCx + R * Math.cos(a);
      const py = cy - R * Math.sin(a);

      // Teal for top half of circle (0–π), red for bottom (π–2π)
      const isTeal = a <= Math.PI;

      // Connect opposite pairs
      if (i < N / 2) {
        const oppA = points[i + N / 2].angle;
        const ox = leftCx + R * Math.cos(oppA);
        const oy = cy - R * Math.sin(oppA);
        ctx.setLineDash([2, 3]);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ox, oy); ctx.stroke();
        ctx.setLineDash([]);
      }

      // Point
      ctx.beginPath(); ctx.arc(px, py, 4, 0, TAU);
      ctx.fillStyle = isTeal ? TEAL : RED;
      ctx.globalAlpha = 0.65;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Center label
    ctx.font = '500 8px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.textAlign = 'center';
    ctx.fillText('180° = opposite', leftCx, cy);

    // Bottom label
    ctx.font = '400 7px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillText('angles preserved', leftCx, h - 10);

    // ══════ ARROW between the two ══════
    const arrowY = cy;
    const arrowX1 = pad + halfW + 4;
    const arrowX2 = pad * 2 + halfW - 4;
    ctx.strokeStyle = 'rgba(217,79,79,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(arrowX1, arrowY); ctx.lineTo(arrowX2, arrowY); ctx.stroke();
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(arrowX2 - 6, arrowY - 4);
    ctx.lineTo(arrowX2, arrowY);
    ctx.lineTo(arrowX2 - 6, arrowY + 4);
    ctx.stroke();
    // Label
    ctx.font = '600 8px "IBM Plex Mono", monospace';
    ctx.fillStyle = RED;
    ctx.globalAlpha = 0.45;
    ctx.fillText('ReLU', (arrowX1 + arrowX2) / 2, arrowY - 8);
    ctx.globalAlpha = 1;

    // ══════ RIGHT: AFTER ReLU ══════
    ctx.font = '600 9px "IBM Plex Mono", monospace';
    ctx.fillStyle = RED;
    ctx.globalAlpha = 0.5;
    ctx.fillText('AFTER ReLU', rightCx, 16);
    ctx.globalAlpha = 1;

    drawAxes(rightCx);

    // Ghost circle (faint)
    ctx.beginPath(); ctx.arc(rightCx, cy, R, 0, TAU);
    ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 0.5; ctx.stroke();

    // Dead-zone shading: everywhere x<0 or y<0 (screen: left of center or below center)
    // In math coords: x<0 is left of rightCx, y<0 is below cy (below in screen = above in math... no)
    // ReLU kills negatives. In screen coords with y-up:
    //   x<0 → left of rightCx
    //   y<0 → below cy (screen below = math negative y)
    // So alive quadrant is: right of rightCx AND above cy (screen)
    ctx.fillStyle = 'rgba(217,79,79,0.03)';
    // Left half (x < 0)
    ctx.fillRect(rightCx - R - 8, cy - R - 8, R + 8, (R + 8) * 2 + 16);
    // Bottom half (y < 0) — but not the part already covered
    ctx.fillRect(rightCx, cy, R + 8, R + 8);

    // ReLU'd manifold: for each angle, apply max(0, cos(a)), max(0, sin(a))
    // then convert to screen: px = rightCx + rx * R, py = cy - ry * R
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const a = (i / 200) * TAU;
      const rx = Math.max(0, Math.cos(a));
      const ry = Math.max(0, Math.sin(a));
      const px = rightCx + rx * R;
      const py = cy - ry * R;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.strokeStyle = PURPLE;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // ReLU'd points
    for (let i = 0; i < N; i++) {
      const a = points[i].angle;
      const rx = Math.max(0, Math.cos(a));
      const ry = Math.max(0, Math.sin(a));
      const px = rightCx + rx * R;
      const py = cy - ry * R;
      const isTeal = a <= Math.PI;

      // How collapsed is this point?
      const atOrigin = rx < 0.01 && ry < 0.01;
      const onAxis = rx < 0.01 || ry < 0.01;

      ctx.beginPath();
      ctx.arc(px, py, atOrigin ? 3 : 4, 0, TAU);
      ctx.fillStyle = isTeal ? TEAL : RED;
      ctx.globalAlpha = atOrigin ? 0.2 : onAxis ? 0.35 : 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Glow at origin (where opposites collapse)
    const grd = ctx.createRadialGradient(rightCx, cy, 0, rightCx, cy, 22);
    grd.addColorStop(0, 'rgba(217,79,79,0.2)');
    grd.addColorStop(0.5, 'rgba(217,79,79,0.07)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(rightCx - 22, cy - 22, 44, 44);

    // Annotation at origin
    ctx.font = '500 7px "IBM Plex Mono", monospace';
    ctx.fillStyle = RED;
    ctx.globalAlpha = 0.5;
    ctx.fillText('collapse', rightCx, cy + 28);
    ctx.globalAlpha = 1;

    // Bottom label
    ctx.font = '400 7px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(217,79,79,0.35)';
    ctx.fillText('opposite → orthogonal', rightCx, h - 10);

    ctx.textAlign = 'left';
  }

  // ════════════════════════════════════════════════════════════════
  // 6. SIGNAL DEPTH — animated signal degradation through layers.
  //    Clean sine → ReLU → ReLU → … showing progressive info loss.
  //    5 stages: Original, Layer 1, Layer 4, Layer 16, Layer 64.
  // ════════════════════════════════════════════════════════════════
  function signalDepth(canvas) {
    const { ctx, w, h } = setup(canvas);
    let t = 0;
    const stages = ['Original', 'Layer 1', 'Layer 4', 'Layer 16', 'Layer 64'];
    const nStages = stages.length;

    /** Simulate iterated ReLU on a sine wave. More passes = more destroyed. */
    function applyReLU(val, passes) {
      let v = val;
      for (let p = 0; p < passes; p++) {
        // Each "layer" transforms: ReLU + slight frequency mixing
        v = Math.max(0, v);
        // simulate residual + nonlinearity compounding
        v = v * 0.85 + 0.15 * Math.max(0, Math.sin(v * 2.5 + p * 0.7));
      }
      return v;
    }

    const passMap = [0, 1, 4, 16, 64];

    function frame() {
      if (!isActive(canvas)) { requestAnimationFrame(frame); return; }
      t += 0.012;
      ctx.clearRect(0, 0, w, h);

      const stageW = w / nStages;
      const padY = 34;
      const plotH = h - padY * 2;

      for (let s = 0; s < nStages; s++) {
        const sx = s * stageW;
        const midX = sx + stageW / 2;
        const midY = padY + plotH / 2;

        // Stage separator
        if (s > 0) {
          ctx.strokeStyle = 'rgba(255,255,255,0.04)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(sx, padY);
          ctx.lineTo(sx, h - padY);
          ctx.stroke();

          // Arrow between stages
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.beginPath();
          ctx.moveTo(sx - 6, midY - 3);
          ctx.lineTo(sx, midY);
          ctx.lineTo(sx - 6, midY + 3);
          ctx.fill();
        }

        // Zero line
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(sx + 4, midY);
        ctx.lineTo(sx + stageW - 4, midY);
        ctx.stroke();

        // Draw signal
        const passes = passMap[s];
        const color = s === 0 ? TEAL : s < 3 ? TEAL2 : s < 4 ? AMBER : RED;
        const [cr, cg, cb] = hex(color);

        ctx.beginPath();
        const nPts = 80;
        for (let i = 0; i <= nPts; i++) {
          const frac = i / nPts;
          const x = sx + 6 + frac * (stageW - 12);
          // Original signal: composite sine
          const orig = Math.sin(frac * TAU * 2 + t)
                     + 0.5 * Math.sin(frac * TAU * 5 - t * 0.7)
                     + 0.3 * Math.cos(frac * TAU * 3 + t * 1.3);
          const val = passes === 0 ? orig : applyReLU(orig, passes);
          const normed = Math.max(-1, Math.min(1, val / 1.8));
          const y = midY - normed * plotH * 0.4;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Area fill
        ctx.beginPath();
        ctx.moveTo(sx + 6, midY);
        for (let i = 0; i <= nPts; i++) {
          const frac = i / nPts;
          const x = sx + 6 + frac * (stageW - 12);
          const orig = Math.sin(frac * TAU * 2 + t)
                     + 0.5 * Math.sin(frac * TAU * 5 - t * 0.7)
                     + 0.3 * Math.cos(frac * TAU * 3 + t * 1.3);
          const val = passes === 0 ? orig : applyReLU(orig, passes);
          const normed = Math.max(-1, Math.min(1, val / 1.8));
          ctx.lineTo(x, midY - normed * plotH * 0.4);
        }
        ctx.lineTo(sx + stageW - 6, midY);
        ctx.closePath();
        ctx.fillStyle = `rgba(${cr},${cg},${cb},0.06)`;
        ctx.fill();

        // Stage label
        ctx.font = '500 7px "IBM Plex Mono", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.textAlign = 'center';
        ctx.fillText(stages[s], midX, h - 10);

        // "ReLU" markers above if not original
        if (s > 0) {
          ctx.font = '500 7px "IBM Plex Mono", monospace';
          ctx.fillStyle = `rgba(${cr},${cg},${cb},0.3)`;
          ctx.fillText(`×${passMap[s]} ReLU`, midX, padY - 6);
        }
      }

      ctx.textAlign = 'left';
      requestAnimationFrame(frame);
    }
    frame();
  }

  // ════════════════════════════════════════════════════════════════
  // 7. METRIC COMPARISON — dot product vs ⵟ heatmap side-by-side.
  //    3 prototypes. Brighter fills, explicit decision boundary,
  //    coordinate grid, labeled prototypes.
  // ════════════════════════════════════════════════════════════════
  function metricComparison(cDot, cYat) {
    const protos = [
      { wx: 1.8, wy: 0.8, color: TEAL, label: 'w₁' },
      { wx: -0.8, wy: 1.5, color: RED, label: 'w₂' },
      { wx: 0.4, wy: -1.8, color: AMBER, label: 'w₃' },
    ];
    const range = 4;

    function draw(canvas, metric, label) {
      const { ctx, w, h } = setup(canvas);
      const res = 2;

      // ── Compute scores + store for boundary detection ──
      const grid = [];
      for (let py = 0; py < h; py += res) {
        const row = [];
        for (let px = 0; px < w; px += res) {
          const x = (px / w - 0.5) * range * 2;
          const y = (0.5 - py / h) * range * 2;
          let best = 0, bestS = -Infinity, second = -Infinity;
          protos.forEach((p, i) => {
            const s = metric(x, y, p.wx, p.wy);
            if (s > bestS) { second = bestS; bestS = s; best = i; }
            else if (s > second) second = s;
          });
          row.push({ best, bestS, margin: bestS - second });
        }
        grid.push(row);
      }

      // ── Draw heatmap — brighter, more saturated ──
      for (let py = 0; py < h; py += res) {
        const gy = py / res;
        for (let px = 0; px < w; px += res) {
          const gx = px / res;
          const cell = grid[gy] && grid[gy][gx];
          if (!cell) continue;
          const [r, g, b] = hex(protos[cell.best].color);
          // Base fill — strong enough to see the territories
          const base = 0.12;
          // Score-proportional intensity
          const score = Math.min(Math.abs(cell.bestS) * 0.08, 0.45);
          // Fade at decision boundary
          const edgeFade = Math.min(cell.margin * 3, 1);
          const alpha = (base + score) * (0.3 + edgeFade * 0.7);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fillRect(px, py, res, res);
        }
      }

      // ── Decision boundaries (where best changes between neighbors) ──
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      const cols = Math.ceil(w / res);
      for (let gy = 0; gy < grid.length; gy++) {
        for (let gx = 0; gx < grid[gy].length; gx++) {
          const cell = grid[gy][gx];
          const right = grid[gy][gx + 1];
          const down = grid[gy + 1] && grid[gy + 1][gx];
          if ((right && right.best !== cell.best) || (down && down.best !== cell.best)) {
            ctx.fillRect(gx * res, gy * res, res, res);
          }
        }
      }

      // ── Coordinate grid ──
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 0.5;
      for (let i = 1; i < 4; i++) {
        const x = (i / 4) * w;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        const y = (i / 4) * h;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      // Center axes (slightly brighter)
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

      // ── Prototype markers ──
      protos.forEach(p => {
        const sx = ((p.wx / (range * 2)) + 0.5) * w;
        const sy = (0.5 - (p.wy / (range * 2))) * h;

        // Glow
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, 16);
        grd.addColorStop(0, p.color);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(sx - 16, sy - 16, 32, 32);
        ctx.globalAlpha = 1;

        // White ring
        ctx.beginPath(); ctx.arc(sx, sy, 6, 0, TAU);
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5; ctx.stroke();
        // Color fill
        ctx.beginPath(); ctx.arc(sx, sy, 4, 0, TAU);
        ctx.fillStyle = p.color; ctx.fill();
        // Label
        ctx.font = '600 9px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.7;
        ctx.fillText(p.label, sx + 9, sy - 5);
        ctx.globalAlpha = 1;
      });

      // ── Title label ──
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.textAlign = 'left';
      ctx.fillText(label, 8, 16);
    }

    // Metric functions
    function dot(x, y, wx, wy) { return x * wx + y * wy; }
    function yat(x, y, wx, wy) {
      const d = x * wx + y * wy;
      const dx = x - wx, dy = y - wy;
      return (d * d) / (dx * dx + dy * dy + 0.05);
    }

    draw(cDot, dot, 'DOT PRODUCT');
    draw(cYat, yat, 'ⵟ-KERNEL');
  }

  // ════════════════════════════════════════════════════════════════
  // 8. SELF-REGULATION — animated cursor sweeping ‖x‖.
  //    Red dashed = dot product (grows linearly, unbounded).
  //    Teal solid = ⵟ-kernel (saturates at ‖w‖²cos²θ).
  // ════════════════════════════════════════════════════════════════
  function selfRegulation(canvas) {
    const { ctx, w, h } = setup(canvas);
    let t = 0;
    const pad = { t: 26, r: 16, b: 36, l: 44 };
    const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
    const wNorm = 1.5, cosTheta = 0.7;
    const limit = wNorm * wNorm * cosTheta * cosTheta;
    const maxK = 20, maxY = limit * 2.5;

    function yatVal(k) {
      const d = wNorm * k * cosTheta;
      return (d * d) / (wNorm * wNorm + k * k - 2 * wNorm * k * cosTheta + 0.01);
    }

    function frame() {
      if (!isActive(canvas)) { requestAnimationFrame(frame); return; }
      t += 0.006;
      ctx.clearRect(0, 0, w, h);

      const cursor = ((Math.sin(t) + 1) / 2) * 0.95 + 0.02;

      // ── Axes ──
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(pad.l, pad.t);
      ctx.lineTo(pad.l, h - pad.b);
      ctx.lineTo(w - pad.r, h - pad.b);
      ctx.stroke();

      // ── Limit line (horizontal dashed teal) ──
      const limY = pad.t + ph * (1 - limit / maxY);
      ctx.strokeStyle = 'rgba(120,196,164,0.22)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(pad.l, limY);
      ctx.lineTo(w - pad.r, limY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '8px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'rgba(120,196,164,0.4)';
      ctx.textAlign = 'right';
      ctx.fillText('‖w‖²cos²θ', w - pad.r - 4, limY - 5);

      // ── Dot product curve — area fill ──
      ctx.beginPath();
      ctx.moveTo(pad.l, h - pad.b);
      for (let i = 0; i <= 200; i++) {
        const k = (i / 200) * maxK;
        const val = Math.min(wNorm * k * cosTheta / maxY, 1);
        ctx.lineTo(pad.l + (i / 200) * pw, pad.t + ph * (1 - val));
      }
      ctx.lineTo(pad.l + pw, h - pad.b);
      ctx.closePath();
      ctx.fillStyle = 'rgba(217,79,79,0.04)';
      ctx.fill();

      // Dot product line — red dashed
      ctx.beginPath();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = RED;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= 200; i++) {
        const k = (i / 200) * maxK;
        const val = Math.min(wNorm * k * cosTheta / maxY, 1);
        const x = pad.l + (i / 200) * pw;
        const y = pad.t + ph * (1 - val);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // ── Yat curve — area fill ──
      ctx.beginPath();
      ctx.moveTo(pad.l, h - pad.b);
      for (let i = 0; i <= 200; i++) {
        const k = (i / 200) * maxK;
        const val = Math.min(yatVal(k) / maxY, 1);
        ctx.lineTo(pad.l + (i / 200) * pw, pad.t + ph * (1 - val));
      }
      ctx.lineTo(pad.l + pw, h - pad.b);
      ctx.closePath();
      ctx.fillStyle = 'rgba(120,196,164,0.06)';
      ctx.fill();

      // Yat line — teal solid
      ctx.beginPath();
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 2;
      for (let i = 0; i <= 200; i++) {
        const k = (i / 200) * maxK;
        const val = Math.min(yatVal(k) / maxY, 1);
        const x = pad.l + (i / 200) * pw;
        const y = pad.t + ph * (1 - val);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // ── Animated cursor ──
      const ck = cursor * maxK;
      const cx_ = pad.l + cursor * pw;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx_, pad.t);
      ctx.lineTo(cx_, h - pad.b);
      ctx.stroke();

      // Cursor dots on both curves
      const dotY = pad.t + ph * (1 - Math.min(wNorm * ck * cosTheta / maxY, 1));
      const yatY = pad.t + ph * (1 - Math.min(yatVal(ck) / maxY, 1));
      ctx.beginPath();
      ctx.arc(cx_, dotY, 3, 0, TAU);
      ctx.fillStyle = RED;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx_, yatY, 4, 0, TAU);
      ctx.fillStyle = TEAL;
      ctx.fill();

      // ── Axis labels ──
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.font = '8px "IBM Plex Mono", monospace';
      ctx.fillText('‖x‖ →', pad.l + pw / 2, h - 8);
      ctx.save();
      ctx.translate(10, pad.t + ph / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('RESPONSE', 0, 0);
      ctx.restore();
      ctx.textAlign = 'left';

      // ── Legend ──
      const lx = pad.l + 8, ly = pad.t + 4;
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = RED;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(lx, ly + 2);
      ctx.lineTo(lx + 12, ly + 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '8px "IBM Plex Mono", monospace';
      ctx.fillText('dot product (unbounded)', lx + 16, ly + 5);

      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx, ly + 16);
      ctx.lineTo(lx + 12, ly + 16);
      ctx.stroke();
      ctx.fillText('ⵟ-kernel (self-regulating)', lx + 16, ly + 19);

      requestAnimationFrame(frame);
    }
    frame();
  }

  // ════════════════════════════════════════════════════════════════
  // 9. SPHERICAL ATTENTION — query sweeps smoothly with eased
  //    pauses at key positions. Keys labeled as tokens. Attention
  //    weight bar chart on the right side. Arcs curve along the
  //    circle perimeter (geodesic). No inner ellipse clutter.
  // ════════════════════════════════════════════════════════════════
  function sphericalAttention(canvas) {
    const { ctx, w, h } = setup(canvas);
    let t = 0;

    // Layout: circle on left, bar chart on right
    const chartW = w * 0.28;
    const circleArea = w - chartW;
    const ccx = circleArea * 0.5;
    const ccy = h * 0.48;
    const R = Math.min(circleArea * 0.38, h * 0.36);

    // 7 keys with token labels, evenly spread
    const keyData = [
      { angle: 0.0,   label: 'The',   color: TEAL },
      { angle: 0.9,   label: 'model', color: TEAL2 },
      { angle: 1.8,   label: 'learns', color: AMBER },
      { angle: 2.7,   label: 'from',  color: RED },
      { angle: 3.6,   label: 'first', color: PURPLE },
      { angle: 4.5,   label: 'prin-', color: TEAL },
      { angle: 5.4,   label: 'ciples', color: TEAL2 },
    ];
    const nKeys = keyData.length;

    // ⵟ_sph kernel
    function yatSph(cosA) {
      const C = 2.05;
      const denom = C - 2 * cosA;
      if (denom <= 0.01) return 10; // clamp
      return (cosA * cosA) / denom;
    }

    function frame() {
      if (!isActive(canvas)) { requestAnimationFrame(frame); return; }
      t += 0.006;
      ctx.clearRect(0, 0, w, h);

      // Query angle: smooth sweep with eased pauses near keys
      // Use a sine-modulated speed so it slows near integer multiples
      const baseAngle = t * 0.5;
      const query = baseAngle + 0.15 * Math.sin(baseAngle * nKeys * 0.5);

      const qx = ccx + R * Math.cos(query);
      const qy = ccy + R * Math.sin(query);

      // ── Unit circle ──
      ctx.beginPath();
      ctx.arc(ccx, ccy, R, 0, TAU);
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Subtle tick marks at key positions on the circle
      keyData.forEach(k => {
        const tx1 = ccx + (R - 4) * Math.cos(k.angle);
        const ty1 = ccy + (R - 4) * Math.sin(k.angle);
        const tx2 = ccx + (R + 4) * Math.cos(k.angle);
        const ty2 = ccy + (R + 4) * Math.sin(k.angle);
        ctx.beginPath();
        ctx.moveTo(tx1, ty1); ctx.lineTo(tx2, ty2);
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // ── Compute weights ──
      const weights = keyData.map(k => {
        const cosA = Math.cos(query - k.angle);
        return Math.max(0, yatSph(cosA));
      });
      const maxW = Math.max(...weights, 0.01);

      // ── Arcs from query to each key (curve along circle) ──
      keyData.forEach((k, i) => {
        const kx = ccx + R * Math.cos(k.angle);
        const ky = ccy + R * Math.sin(k.angle);
        const w_ = weights[i];
        const normW = w_ / maxW;
        const alpha = normW * 0.75;

        if (alpha < 0.02) return; // skip invisible arcs

        // Control point: push outward from center along the bisector angle
        const bisect = (query + k.angle) / 2;
        const pushR = R * (0.65 + normW * 0.15); // stronger connections stay closer to circle
        const cpx = ccx + pushR * Math.cos(bisect);
        const cpy = ccy + pushR * Math.sin(bisect);

        ctx.beginPath();
        ctx.moveTo(qx, qy);
        ctx.quadraticCurveTo(cpx, cpy, kx, ky);
        ctx.strokeStyle = k.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 0.8 + normW * 3;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // ── Key dots + labels ──
      keyData.forEach((k, i) => {
        const kx = ccx + R * Math.cos(k.angle);
        const ky = ccy + R * Math.sin(k.angle);
        const normW = weights[i] / maxW;
        const dotR = 3 + normW * 3;

        // Dot
        ctx.beginPath();
        ctx.arc(kx, ky, dotR, 0, TAU);
        ctx.fillStyle = k.color;
        ctx.globalAlpha = 0.25 + normW * 0.65;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Token label (outside circle)
        const labelR = R + 14 + dotR;
        const lx = ccx + labelR * Math.cos(k.angle);
        const ly = ccy + labelR * Math.sin(k.angle);
        ctx.font = '500 8px "IBM Plex Mono", monospace';
        ctx.fillStyle = k.color;
        ctx.globalAlpha = 0.3 + normW * 0.5;
        ctx.textAlign = 'center';
        ctx.fillText(k.label, lx, ly + 3);
        ctx.globalAlpha = 1;
      });

      // ── Query dot ──
      // Glow
      const qg = ctx.createRadialGradient(qx, qy, 0, qx, qy, 18);
      qg.addColorStop(0, 'rgba(120,196,164,0.2)');
      qg.addColorStop(1, 'transparent');
      ctx.fillStyle = qg;
      ctx.fillRect(qx - 18, qy - 18, 36, 36);
      // White outer
      ctx.beginPath(); ctx.arc(qx, qy, 5, 0, TAU);
      ctx.fillStyle = '#fff'; ctx.fill();
      // Teal inner
      ctx.beginPath(); ctx.arc(qx, qy, 3.5, 0, TAU);
      ctx.fillStyle = TEAL; ctx.fill();
      // Label
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.6;
      ctx.textAlign = 'left';
      ctx.fillText('q\u0302', qx + 8, qy - 6);
      ctx.globalAlpha = 1;

      // ── Attention weight bar chart (right side) ──
      const barX = circleArea + 8;
      const barAreaW = chartW - 16;
      const barH = 10;
      const barGap = Math.min(18, (h - 60) / nKeys);
      const barStartY = ccy - (nKeys * barGap) / 2;

      // Title
      ctx.font = '600 7px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.textAlign = 'left';
      ctx.fillText('ATTN WEIGHTS', barX, barStartY - 10);

      // Separator line
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(barX - 4, barStartY - 4);
      ctx.lineTo(barX - 4, barStartY + nKeys * barGap + 4);
      ctx.stroke();

      keyData.forEach((k, i) => {
        const by = barStartY + i * barGap;
        const normW = weights[i] / maxW;
        const bw = normW * barAreaW * 0.85;

        // Token label
        ctx.font = '400 7px "IBM Plex Mono", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.textAlign = 'left';
        ctx.fillText(k.label, barX, by + barH / 2 + 3);

        // Bar background
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        ctx.fillRect(barX + 36, by, barAreaW - 36, barH);

        // Bar fill
        const [cr, cg, cb] = hex(k.color);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.15 + normW * 0.5})`;
        ctx.fillRect(barX + 36, by, Math.max(bw - 36, 0), barH);

        // Weight value
        if (normW > 0.05) {
          ctx.font = '500 6px "IBM Plex Mono", monospace';
          ctx.fillStyle = `rgba(255,255,255,${0.15 + normW * 0.35})`;
          ctx.fillText((weights[i]).toFixed(1), barX + 38 + Math.max(bw - 36, 0), by + barH / 2 + 2);
        }
      });

      // ── Bottom label ──
      ctx.font = '500 7px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.textAlign = 'left';
      ctx.fillText('ⵟ_sph — angular alignment on S^(d-1)', 8, h - 8);

      requestAnimationFrame(frame);
    }
    frame();
  }

  // ══════════════════════════════════════════════════════════════
  // 11. RKHS VISUALIZATION — static.
  //     Input space (2D points, non-separable) → φ → RKHS (separated).
  // ══════════════════════════════════════════════════════════════
  function rkhsViz(canvas) {
    const { ctx, w, h } = setup(canvas);
    const midX = w / 2;

    // ── LEFT: Input space (XOR-like, not linearly separable) ──
    const lCx = w * 0.22, lCy = h * 0.45, lR = Math.min(w * 0.18, h * 0.32);

    ctx.font = '600 8px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.textAlign = 'center';
    ctx.fillText('INPUT SPACE', lCx, 16);

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(lCx - lR - 5, lCy); ctx.lineTo(lCx + lR + 5, lCy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lCx, lCy - lR - 5); ctx.lineTo(lCx, lCy + lR + 5); ctx.stroke();

    // Points (two interleaved classes — concentric rings)
    const innerR = lR * 0.3, outerR = lR * 0.75;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU + 0.2;
      const px = lCx + innerR * Math.cos(a), py = lCy + innerR * Math.sin(a);
      ctx.beginPath(); ctx.arc(px, py, 3, 0, TAU);
      ctx.fillStyle = TEAL; ctx.globalAlpha = 0.6; ctx.fill(); ctx.globalAlpha = 1;
    }
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU;
      const r = outerR + (Math.sin(i * 3) * lR * 0.08);
      const px = lCx + r * Math.cos(a), py = lCy + r * Math.sin(a);
      ctx.beginPath(); ctx.arc(px, py, 3, 0, TAU);
      ctx.fillStyle = RED; ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1;
    }

    ctx.font = '400 7px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillText('not linearly separable', lCx, lCy + lR + 18);

    // ── ARROW: φ ──
    const arrowY = h * 0.45;
    ctx.strokeStyle = 'rgba(120,196,164,0.2)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(midX - 40, arrowY); ctx.lineTo(midX + 40, arrowY); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(midX + 34, arrowY - 4); ctx.lineTo(midX + 40, arrowY); ctx.lineTo(midX + 34, arrowY + 4);
    ctx.stroke();
    ctx.font = '600 12px "IBM Plex Mono", monospace';
    ctx.fillStyle = TEAL; ctx.globalAlpha = 0.5;
    ctx.fillText('φ', midX, arrowY - 10);
    ctx.globalAlpha = 1;
    ctx.font = '400 7px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillText('kernel map', midX, arrowY + 16);

    // ── RIGHT: RKHS (separated — inner class lifted up) ──
    const rCx = w * 0.78, rCy = h * 0.45, rR = Math.min(w * 0.18, h * 0.32);

    ctx.font = '600 8px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillText('RKHS  H', rCx, 16);

    // Axes (3 for implied 3D)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(rCx - rR - 5, rCy); ctx.lineTo(rCx + rR + 5, rCy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rCx, rCy - rR - 5); ctx.lineTo(rCx, rCy + rR + 5); ctx.stroke();
    // Implied z-axis (diagonal)
    ctx.beginPath(); ctx.moveTo(rCx - rR * 0.4, rCy + rR * 0.4); ctx.lineTo(rCx + rR * 0.4, rCy - rR * 0.4); ctx.stroke();

    // Inner class — lifted up
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU + 0.2;
      const px = rCx + innerR * Math.cos(a) * 0.9;
      const py = rCy - rR * 0.45 + innerR * Math.sin(a) * 0.4;
      ctx.beginPath(); ctx.arc(px, py, 3, 0, TAU);
      ctx.fillStyle = TEAL; ctx.globalAlpha = 0.6; ctx.fill(); ctx.globalAlpha = 1;
    }
    // Outer class — stays on plane
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU;
      const r = outerR * 0.85;
      const px = rCx + r * Math.cos(a), py = rCy + r * Math.sin(a) * 0.45 + rR * 0.15;
      ctx.beginPath(); ctx.arc(px, py, 3, 0, TAU);
      ctx.fillStyle = RED; ctx.globalAlpha = 0.45; ctx.fill(); ctx.globalAlpha = 1;
    }

    // Separating plane (dashed line between the two groups)
    ctx.setLineDash([4, 3]); ctx.strokeStyle = 'rgba(232,160,42,0.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(rCx - rR, rCy - rR * 0.1); ctx.lineTo(rCx + rR, rCy - rR * 0.1); ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '400 7px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(232,160,42,0.3)';
    ctx.fillText('linearly separable in H', rCx, rCy + rR + 18);
    ctx.textAlign = 'left';
  }

  // ══════════════════════════════════════════════════════════════
  // 12. YAT POTENTIAL WELL — static.
  //     2D heatmap of the ⵟ-kernel value as x varies, w fixed.
  //     Level set contours overlaid. Pseudo-3D perspective.
  // ══════════════════════════════════════════════════════════════
  function yatPotential(canvas) {
    const { ctx, w, h } = setup(canvas);
    // w_vec fixed at (1, 0.5) — the "weight"
    const wVec = [1.0, 0.5];
    const res = 3;
    const range = 3.5;

    // Compute and draw heatmap
    const values = [];
    let maxVal = 0;
    for (let py = 0; py < h; py += res) {
      for (let px = 0; px < w; px += res) {
        const x = (px / w - 0.5) * range * 2;
        const y = (0.5 - py / h) * range * 2;
        const dot = x * wVec[0] + y * wVec[1];
        const dx = x - wVec[0], dy = y - wVec[1];
        const dist2 = dx * dx + dy * dy + 0.05;
        const val = (dot * dot) / dist2;
        values.push({ px, py, val });
        if (val > maxVal) maxVal = val;
      }
    }

    // Draw heatmap
    values.forEach(({ px, py, val }) => {
      const norm = val / maxVal;
      const intensity = Math.pow(norm, 0.4); // gamma for visibility
      const [r, g, b] = hex(TEAL);
      ctx.fillStyle = `rgba(${r},${g},${b},${intensity * 0.65})`;
      ctx.fillRect(px, py, res, res);
    });

    // Level set contours — draw as visible dots at threshold crossings
    const cols = Math.ceil(w / res);
    const levels = [0.1, 0.2, 0.35, 0.5, 0.7, 0.85];
    levels.forEach(level => {
      const threshold = level * maxVal;
      const alpha = 0.08 + level * 0.1;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      for (let gy = 1; gy < Math.ceil(h / res) - 1; gy++) {
        for (let gx = 1; gx < cols - 1; gx++) {
          const idx = gy * cols + gx;
          if (!values[idx]) continue;
          const v = values[idx].val;
          const vr = values[idx + 1] ? values[idx + 1].val : v;
          const vd = values[idx + cols] ? values[idx + cols].val : v;
          const crossH = (v < threshold) !== (vr < threshold);
          const crossV = (v < threshold) !== (vd < threshold);
          if (crossH || crossV) {
            ctx.fillRect(gx * res, gy * res, res, res);
          }
        }
      }
    });

    // Mark w position
    const wPx = (wVec[0] / (range * 2) + 0.5) * w;
    const wPy = (0.5 - wVec[1] / (range * 2)) * h;
    const wg = ctx.createRadialGradient(wPx, wPy, 0, wPx, wPy, 12);
    wg.addColorStop(0, 'rgba(255,255,255,0.3)'); wg.addColorStop(1, 'transparent');
    ctx.fillStyle = wg; ctx.fillRect(wPx - 12, wPy - 12, 24, 24);
    ctx.beginPath(); ctx.arc(wPx, wPy, 4, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.beginPath(); ctx.arc(wPx, wPy, 2.5, 0, TAU); ctx.fillStyle = TEAL; ctx.fill();

    // Labels
    ctx.font = '600 9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.5;
    ctx.fillText('w', wPx + 8, wPy - 4);
    ctx.globalAlpha = 1;

    ctx.font = '500 8px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.textAlign = 'left';
    ctx.fillText('ⵟ(w, x) — potential well around w', 8, h - 8);

    // Level labels on right edge
    ctx.font = '400 7px "IBM Plex Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillText('HIGH', w - 6, wPy - 2);
    ctx.fillText('LOW', w - 6, 14);
    ctx.textAlign = 'left';
  }

  // ══════════════════════════════════════════════════════════════
  // 13. TRANSFORMER BLOCK — single clean block.
  //     One transformer block: LayerNorm → Attention → Add&Norm → MLP → Add&Norm.
  //     Clear lines, skip connections, color-coded.
  //     Animated pulse flowing through.
  // ══════════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════════
  function transformerBlock(canvas) {
    const { ctx, w, h } = setup(canvas);
    let t = 0;

    // Single block — use full canvas width properly
    const bW = Math.min(w * 0.5, 220);
    const bX = w * 0.18;
    const compH = Math.min(40, (h - 80) / 7);
    const gap = Math.min(18, (h - 80 - compH * 5) / 4);
    const components = [
      { label: 'LAYER NORM',           type: 'norm' },
      { label: 'MULTI-HEAD ATTENTION', type: 'ok' },
      { label: 'ADD + LAYER NORM',     type: 'norm' },
      { label: 'MLP:  Linear → σ → Linear', type: 'bad' },
      { label: 'ADD + LAYER NORM',     type: 'norm' },
    ];
    const totalH = components.length * compH + (components.length - 1) * gap;
    const bY = (h - totalH) / 2;

    // Small attention map example — 5×5 grid drawn next to the attention block
    const attnSize = 5;
    const attnWeights = [
      [0.9, 0.3, 0.1, 0.05, 0.02],
      [0.2, 0.8, 0.4, 0.1, 0.05],
      [0.1, 0.3, 0.7, 0.5, 0.1],
      [0.05, 0.1, 0.3, 0.85, 0.3],
      [0.02, 0.05, 0.1, 0.4, 0.9],
    ];
    const tokens = ['The', 'cat', 'sat', 'on', 'mat'];

    function frame() {
      if (!isActive(canvas)) { requestAnimationFrame(frame); return; }
      t += 0.004;
      ctx.clearRect(0, 0, w, h);

      const pulse = (t * 0.3) % 1;
      const pulseIdx = pulse * components.length; // which component the pulse is at

      // ── Draw components ──
      components.forEach((comp, i) => {
        const cy = bY + i * (compH + gap);
        const dist = Math.abs(pulseIdx - i);
        const active = dist < 0.6;

        // Colors
        let bg, border, txt;
        if (comp.type === 'ok') {
          bg = active ? 'rgba(120,196,164,0.1)' : 'rgba(120,196,164,0.03)';
          border = active ? TEAL : 'rgba(120,196,164,0.12)';
          txt = TEAL;
        } else if (comp.type === 'bad') {
          bg = active ? 'rgba(217,79,79,0.12)' : 'rgba(217,79,79,0.03)';
          border = active ? RED : 'rgba(217,79,79,0.12)';
          txt = RED;
        } else {
          bg = 'rgba(255,255,255,0.015)';
          border = 'rgba(255,255,255,0.04)';
          txt = 'rgba(200,205,216,0.3)';
        }

        // Box
        ctx.fillStyle = bg;
        ctx.fillRect(bX, cy, bW, compH);
        ctx.strokeStyle = border;
        ctx.lineWidth = active ? 1 : 0.5;
        ctx.strokeRect(bX, cy, bW, compH);

        // Glow
        if (active && comp.type !== 'norm') {
          ctx.save();
          ctx.shadowColor = comp.type === 'ok' ? TEAL : RED;
          ctx.shadowBlur = 12;
          ctx.strokeStyle = comp.type === 'ok' ? TEAL : RED;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(bX, cy, bW, compH);
          ctx.restore();
        }

        // Label
        ctx.font = '500 9px "IBM Plex Mono", monospace';
        ctx.fillStyle = txt;
        ctx.globalAlpha = active ? 0.85 : 0.45;
        ctx.textAlign = 'center';
        ctx.fillText(comp.label, bX + bW / 2, cy + compH / 2 + 3);
        ctx.globalAlpha = 1;

        // Tag
        if (comp.type === 'ok') {
          ctx.font = '600 7px "IBM Plex Mono", monospace';
          ctx.fillStyle = TEAL; ctx.globalAlpha = active ? 0.6 : 0.2;
          ctx.fillText('✓ EXPLAINABLE', bX + bW / 2, cy + compH - 2);
          ctx.globalAlpha = 1;
        } else if (comp.type === 'bad') {
          ctx.font = '600 7px "IBM Plex Mono", monospace';
          ctx.fillStyle = RED; ctx.globalAlpha = active ? 0.7 : 0.2;
          ctx.fillText('✕ BLACK BOX', bX + bW / 2, cy + compH - 2);
          ctx.globalAlpha = 1;
        }
        ctx.textAlign = 'left';

        // ── Connection line to next component ──
        if (i < components.length - 1) {
          const lineX = bX + bW / 2;
          const y1 = cy + compH, y2 = cy + compH + gap;
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(lineX, y1); ctx.lineTo(lineX, y2); ctx.stroke();
          // Arrow
          ctx.beginPath();
          ctx.moveTo(lineX - 3, y2 - 5); ctx.lineTo(lineX, y2); ctx.lineTo(lineX + 3, y2 - 5);
          ctx.stroke();
        }
      });

      // ── Skip connections (left side) ──
      const skipX = bX - 14;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);

      // Skip 1: around attention (comp 0 → comp 2)
      const s1Top = bY + 0 * (compH + gap) + compH / 2;
      const s1Bot = bY + 2 * (compH + gap) + compH / 2;
      ctx.beginPath();
      ctx.moveTo(bX, s1Top); ctx.lineTo(skipX, s1Top);
      ctx.lineTo(skipX, s1Bot); ctx.lineTo(bX, s1Bot);
      ctx.stroke();

      // Skip 2: around MLP (comp 2 → comp 4)
      const s2Top = bY + 2 * (compH + gap) + compH / 2;
      const s2Bot = bY + 4 * (compH + gap) + compH / 2;
      ctx.beginPath();
      ctx.moveTo(bX, s2Top); ctx.lineTo(skipX - 8, s2Top);
      ctx.lineTo(skipX - 8, s2Bot); ctx.lineTo(bX, s2Bot);
      ctx.stroke();

      ctx.setLineDash([]);

      // ⊕ symbols
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.textAlign = 'center';
      ctx.fillText('⊕', skipX, s1Bot + 3);
      ctx.fillText('⊕', skipX - 8, s2Bot + 3);
      ctx.textAlign = 'left';

      // ── Input/output labels ──
      ctx.font = '500 8px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.textAlign = 'center';
      ctx.fillText('INPUT', bX + bW / 2, bY - 8);
      ctx.fillText('× N', bX + bW / 2, bY + totalH + 14);
      ctx.textAlign = 'left';

      // ── Attention map (right side — always visible, brightens on pulse) ──
      const attnComp = 1;
      const attnY = bY + attnComp * (compH + gap);
      const mapX = bX + bW + 24;
      const mapY = attnY - 8;
      const cellS = 16;

      const attnDist = Math.abs(pulseIdx - attnComp);
      const mapBright = Math.max(0.4, 1 - attnDist * 0.8);

      ctx.globalAlpha = mapBright;

      // Header
      ctx.font = '600 8px "IBM Plex Mono", monospace';
      ctx.fillStyle = TEAL;
      ctx.fillText('ATTENTION MAP', mapX, mapY - 6);

      // Token labels — columns
      ctx.font = '500 7px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      tokens.forEach((tk, i) => {
        ctx.save();
        ctx.translate(mapX + i * cellS + cellS / 2 + 2, mapY - 10);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(tk, 0, 0);
        ctx.restore();
      });

      // Token labels — rows
      for (let r = 0; r < attnSize; r++) {
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.textAlign = 'right';
        ctx.fillText(tokens[r], mapX - 5, mapY + r * cellS + cellS / 2 + 3);
        ctx.textAlign = 'left';
      }

      // Grid cells
      for (let r = 0; r < attnSize; r++) {
        for (let c = 0; c < attnSize; c++) {
          const v = attnWeights[r][c];
          const [cr, cg, cb] = hex(TEAL);
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${v * 0.8})`;
          ctx.fillRect(mapX + c * cellS, mapY + r * cellS, cellS - 2, cellS - 2);
        }
      }

      // "We can see what attends to what" annotation
      ctx.font = '400 7px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'rgba(120,196,164,0.35)';
      ctx.fillText('traceable weights', mapX, mapY + attnSize * cellS + 12);

      ctx.globalAlpha = 1;

      // ── MLP black box indicator (right side of MLP — always visible) ──
      const mlpComp = 3;
      const mlpDist = Math.abs(pulseIdx - mlpComp);
      const mlpBright = Math.max(0.3, 1 - mlpDist * 0.8);
      {
        ctx.globalAlpha = mlpBright * 0.6;
        const mlpY = bY + mlpComp * (compH + gap);
        ctx.font = '500 8px "IBM Plex Mono", monospace';
        ctx.fillStyle = RED;
        ctx.fillText('σ destroys geometry', mapX, mlpY + 10);
        ctx.font = '400 7px "IBM Plex Mono", monospace';
        ctx.fillStyle = 'rgba(217,79,79,0.5)';
        ctx.fillText('no mathematical structure', mapX, mlpY + 24);
        ctx.fillText('to interpret', mapX, mlpY + 36);
        ctx.globalAlpha = 1;
      }

      requestAnimationFrame(frame);
    }
    frame();
  }

  // ══════════════════════════════════════════════════════════════
  // CONCEPT EDITING DIAGRAM — glass-box network.
  //   Input tokens → 3 concept layers (named neurons) → output.
  //   One highlighted neuron shows the "edit" indicator.
  //   Animated signal pulses along active edges.
  // ══════════════════════════════════════════════════════════════
  function conceptEditing(canvas) {
    const { ctx, w, h } = setup(canvas);
    let t = 0;

    // 4 columns: inputs, layer1, layer2, output
    const pad = { l: 50, r: 30, t: 30, b: 28 };
    const cols = [
      { label: 'Input',        nodes: ['The', 'capital', 'of', 'France'], color: 'rgba(255,255,255,0.25)' },
      { label: 'Layer 1',      nodes: ['Question', 'Geography', 'Named', 'Country'],         color: TEAL },
      { label: 'Layer 2',      nodes: ['Capital City', 'Location', 'Europe', 'Nation'],      color: AMBER },
      { label: 'Output',       nodes: ['Paris'],                                              color: TEAL },
    ];
    const nCols = cols.length;
    const colX = i => pad.l + (i / (nCols - 1)) * (w - pad.l - pad.r);

    function nodeY(colIdx, nodeIdx) {
      const n = cols[colIdx].nodes.length;
      const usable = h - pad.t - pad.b;
      if (n === 1) return pad.t + usable / 2;
      const step = usable / (n - 1);
      return pad.t + nodeIdx * step;
    }

    // The "edited" neuron — layer 2 index 0 (Capital City)
    const editedCol = 2, editedNode = 0;
    // Signal path: highlight the route to Paris
    // inputs: all 4 → layer1[0,1,3] → layer2[0,1] → output[0]
    const activePath = {
      in_l1: [[0,0],[1,1],[1,3],[2,0],[2,1],[3,3]],
      l1_l2: [[0,0],[1,0],[1,2],[3,3]],
      l2_out: [[0,0],[1,0]],
    };

    function isActive(edgeList, a, b) {
      return edgeList.some(([x,y]) => x === a && y === b);
    }

    function frame() {
      if (!canvas.closest('.slide.active')) { requestAnimationFrame(frame); return; }
      t += 0.012;
      ctx.clearRect(0, 0, w, h);

      // ── Edges (input → L1 → L2 → out) ──
      for (let c = 0; c < nCols - 1; c++) {
        const next = c + 1;
        const active = c === 0 ? activePath.in_l1 : c === 1 ? activePath.l1_l2 : activePath.l2_out;
        for (let a = 0; a < cols[c].nodes.length; a++) {
          for (let b = 0; b < cols[next].nodes.length; b++) {
            const isOn = isActive(active, a, b);
            const x1 = colX(c) + 8, y1 = nodeY(c, a);
            const x2 = colX(next) - 8, y2 = nodeY(next, b);
            ctx.beginPath();
            ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
            ctx.strokeStyle = isOn ? TEAL : 'rgba(255,255,255,0.04)';
            ctx.globalAlpha = isOn ? 0.5 : 1;
            ctx.lineWidth = isOn ? 1 : 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Animated signal pulse on active edges
            if (isOn) {
              const phase = ((t * 0.7) + a * 0.1 + b * 0.15) % 1;
              const px = x1 + (x2 - x1) * phase;
              const py = y1 + (y2 - y1) * phase;
              ctx.beginPath();
              ctx.arc(px, py, 1.8, 0, TAU);
              ctx.fillStyle = TEAL;
              ctx.globalAlpha = 0.8;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
        }
      }

      // ── Nodes ──
      cols.forEach((col, c) => {
        // Column label
        ctx.font = '600 8px "IBM Plex Mono", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.textAlign = 'center';
        ctx.fillText(col.label.toUpperCase(), colX(c), pad.t - 12);

        col.nodes.forEach((node, n) => {
          const x = colX(c), y = nodeY(c, n);
          const isEdited = c === editedCol && n === editedNode;
          const isOutput = c === nCols - 1;

          // Highlighted/edited glow
          if (isEdited) {
            const pulse = 8 + Math.sin(t * 3) * 2;
            const g = ctx.createRadialGradient(x, y, 0, x, y, 22 + pulse);
            g.addColorStop(0, 'rgba(232,160,42,0.35)');
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.fillRect(x - 30, y - 30, 60, 60);
          }

          // Node circle
          const r = isOutput ? 8 : 6;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, TAU);
          ctx.fillStyle = isEdited ? AMBER : (c === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(120,196,164,0.08)');
          ctx.fill();
          ctx.strokeStyle = isEdited ? AMBER : col.color;
          ctx.lineWidth = isEdited ? 1.5 : 1;
          ctx.stroke();

          // Label
          ctx.font = c === 0 || isOutput
            ? '500 9px "IBM Plex Mono", monospace'
            : '400 8px "IBM Plex Mono", monospace';
          ctx.fillStyle = isEdited ? AMBER : (c === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.4)');
          ctx.textAlign = c === 0 ? 'right' : isOutput ? 'left' : 'center';
          const tx = c === 0 ? x - 12 : isOutput ? x + 14 : x;
          const ty = c === 0 || isOutput ? y + 3 : y - 10;
          ctx.fillText(node, tx, ty);
        });
      });

      // ── "EDIT" indicator pointing to the highlighted neuron ──
      const ex = colX(editedCol), ey = nodeY(editedCol, editedNode);
      ctx.font = '600 8px "IBM Plex Mono", monospace';
      ctx.fillStyle = AMBER;
      ctx.globalAlpha = 0.5 + Math.sin(t * 3) * 0.25;
      ctx.textAlign = 'center';
      ctx.fillText('✎ EDIT', ex, ey + 22);
      ctx.globalAlpha = 1;

      // ── Bottom label ──
      ctx.font = '500 8px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.textAlign = 'left';
      ctx.fillText('GLASS BOX — every neuron is a concept', 8, h - 8);

      requestAnimationFrame(frame);
    }
    frame();
  }

  // ══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════
  return {
    orbits,
    aetherWaves,
    mmResult,
    gravityField,
    manifoldDistortion,
    signalDepth,
    metricComparison,
    selfRegulation,
    sphericalAttention,
    transformerBlock,
    rkhsViz,
    yatPotential,
    conceptEditing,
  };
})();

// ═══ INIT ═══
window.addEventListener('load', () => {
  const q = s => document.querySelector(s);
  const init = (sel, fn, ...args) => { const el = q(sel); if (el) fn(el, ...args); };

  // Animated canvases
  init('#viz-orbits', Viz.orbits);
  init('#viz-aether-waves', Viz.aetherWaves);
  init('#viz-depth', Viz.signalDepth);
  init('#viz-regulation', Viz.selfRegulation);
  init('#viz-sphere', Viz.sphericalAttention);
  init('#viz-transformer', Viz.transformerBlock);
  init('#viz-concept-edit', Viz.conceptEditing);

  // Static canvases (draw once)
  init('#viz-mm-result', Viz.mmResult);
  init('#viz-gravity', Viz.gravityField);
  init('#viz-manifold', Viz.manifoldDistortion);
  init('#viz-rkhs', Viz.rkhsViz);
  init('#viz-yat-potential', Viz.yatPotential);

  // Paired metric canvases
  const d = q('#viz-dot'), y = q('#viz-yat');
  if (d && y) Viz.metricComparison(d, y);

  // Resize handler for static canvases
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      init('#viz-mm-result', Viz.mmResult);
      init('#viz-gravity', Viz.gravityField);
      init('#viz-manifold', Viz.manifoldDistortion);
      init('#viz-rkhs', Viz.rkhsViz);
      init('#viz-yat-potential', Viz.yatPotential);
      const d2 = q('#viz-dot'), y2 = q('#viz-yat');
      if (d2 && y2) Viz.metricComparison(d2, y2);
    }, 200);
  });
});
