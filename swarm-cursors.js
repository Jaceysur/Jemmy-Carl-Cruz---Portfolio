/*
 * Portfolio swarm cursor effect
 * Inspired by the multi-cursor visual language of Swarm Rebuild.
 * This is an original, lightweight canvas implementation; it does not
 * copy the referenced project's animation engine or assets.
 */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  const canvas = document.createElement("canvas");
  canvas.id = "portfolio-cursor-swarm";
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "999",
    overflow: "hidden"
  });

  const style = document.createElement("style");
  style.textContent = `
    #portfolio-cursor-swarm { opacity: 0; transition: opacity .35s ease; }
    body.swarm-cursor-ready #portfolio-cursor-swarm { opacity: 1; }
    @media (hover: none), (pointer: coarse) {
      #portfolio-cursor-swarm { display: none !important; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    canvas.remove();
    style.remove();
    return;
  }

  const palette = [
    "#0D99FF", "#A259FF", "#F24E1E", "#0ACF83",
    "#FF7262", "#FFC700", "#E8467C", "#00B5CE"
  ];
  const names = [
    "Ada", "Linus", "Grace", "Alan", "Margaret", "Ken",
    "Barbara", "Dennis", "Radia", "Guido", "Hedy", "Tim"
  ];

  const pointer = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
    active: false,
    lastMove: 0
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let lastFrame = 0;
  let visible = true;
  let destroyed = false;

  const count = Math.max(8, Math.min(14, Math.round(window.innerWidth / 110)));
  const cursors = Array.from({ length: count }, (_, index) => ({
    x: pointer.x + (Math.random() - 0.5) * 240,
    y: pointer.y + (Math.random() - 0.5) * 180,
    vx: 0,
    vy: 0,
    angle: 0,
    phase: Math.random() * Math.PI * 2,
    orbit: 38 + Math.random() * 78,
    speed: 2.0 + Math.random() * 1.8,
    color: palette[index % palette.length],
    name: names[index % names.length],
    size: 0.78 + Math.random() * 0.3,
    blink: 0
  }));

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function onPointerMove(event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    pointer.lastMove = performance.now();
  }

  function onPointerLeave() {
    pointer.active = false;
  }

  function onVisibilityChange() {
    visible = !document.hidden;
    if (!visible && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else {
      lastFrame = 0;
      start();
    }
  }

  function drawCursor(cursor) {
    const x = cursor.x;
    const y = cursor.y;
    const size = 22 * cursor.size;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(cursor.angle);
    ctx.scale(cursor.size, cursor.size);

    // Soft colored halo, followed by a compact pointer silhouette.
    ctx.shadowColor = cursor.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = cursor.color;
    ctx.strokeStyle = "rgba(255,255,255,.96)";
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(2, 2);
    ctx.lineTo(5, size);
    ctx.lineTo(10, size - 5);
    ctx.lineTo(16, size + 3);
    ctx.lineTo(20, size + 1);
    ctx.lineTo(14, size - 7);
    ctx.lineTo(23, size - 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.font = "600 10px Arial, sans-serif";
    const label = cursor.name;
    const labelWidth = ctx.measureText(label).width + 12;
    ctx.fillStyle = cursor.color;
    ctx.beginPath();
    const lx = 22, ly = 20, lw = labelWidth, lh = 17, lr = 5;
    ctx.moveTo(lx + lr, ly);
    ctx.lineTo(lx + lw - lr, ly);
    ctx.quadraticCurveTo(lx + lw, ly, lx + lw, ly + lr);
    ctx.lineTo(lx + lw, ly + lh - lr);
    ctx.quadraticCurveTo(lx + lw, ly + lh, lx + lw - lr, ly + lh);
    ctx.lineTo(lx + lr, ly + lh);
    ctx.quadraticCurveTo(lx, ly + lh, lx, ly + lh - lr);
    ctx.lineTo(lx, ly + lr);
    ctx.quadraticCurveTo(lx, ly, lx + lr, ly);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(label, 28, 32);

    ctx.restore();
  }

  function frame(now) {
    rafId = 0;
    if (destroyed || !visible) return;

    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.04) : 1 / 60;
    lastFrame = now;
    const idle = now - pointer.lastMove > 1800;
    const target = pointer.active && !idle
      ? { x: pointer.x, y: pointer.y }
      : { x: width * 0.5, y: height * 0.46 };

    ctx.clearRect(0, 0, width, height);

    cursors.forEach((cursor, index) => {
      cursor.phase += dt * (0.75 + index * 0.025);
      const angle = cursor.phase + index * (Math.PI * 2 / cursors.length);
      const radius = cursor.orbit + Math.sin(cursor.phase * 1.4) * 9;
      const tx = target.x + Math.cos(angle) * radius;
      const ty = target.y + Math.sin(angle * 1.15) * radius * 0.72;

      const dx = tx - cursor.x;
      const dy = ty - cursor.y;
      cursor.vx += (dx * 4.2 - cursor.vx * 3.2) * dt;
      cursor.vy += (dy * 4.2 - cursor.vy * 3.2) * dt;

      const maxSpeed = cursor.speed * 115;
      const speed = Math.hypot(cursor.vx, cursor.vy);
      if (speed > maxSpeed) {
        cursor.vx = cursor.vx / speed * maxSpeed;
        cursor.vy = cursor.vy / speed * maxSpeed;
      }

      cursor.x += cursor.vx * dt;
      cursor.y += cursor.vy * dt;

      if (Math.hypot(cursor.vx, cursor.vy) > 8) {
        const desired = Math.atan2(cursor.vy, cursor.vx) + Math.PI / 2;
        let delta = ((desired - cursor.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        cursor.angle += delta * Math.min(1, dt * 8);
      }

      drawCursor(cursor);
    });

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (!destroyed && visible && !rafId) {
      rafId = requestAnimationFrame(frame);
      document.body.classList.add("swarm-cursor-ready");
    }
  }

  function destroy() {
    destroyed = true;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerleave", onPointerLeave);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    reduceMotion.removeEventListener?.("change", onMotionPreferenceChange);
    document.body.classList.remove("swarm-cursor-ready");
    canvas.remove();
    style.remove();
    delete window.portfolioCursorSwarm;
  }

  function onMotionPreferenceChange(event) {
    if (event.matches) destroy();
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibilityChange);
  reduceMotion.addEventListener?.("change", onMotionPreferenceChange);

  window.portfolioCursorSwarm = { destroy };
  resize();
  start();
})();
