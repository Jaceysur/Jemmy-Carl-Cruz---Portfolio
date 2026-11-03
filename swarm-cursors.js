/*
 * Portfolio page-build swarm
 * Original DOM-reveal animation inspired by the visual idea of Swarm Rebuild.
 * It does not reuse the reference repository's source, cursor art, or engine.
 */
(() => {
  "use strict";

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");
  if (motionPreference.matches || window.innerWidth < 640 || coarsePointer.matches) return;

  const BUILD_SELECTORS = [
    ".portfolio-navbar",
    ".portfolio-navbar .nav-link",
    ".portfolio-navbar .theme-toggle-switch",
    "#home h1",
    "#home .hero-lead",
    "#home .info-grid article",
    "#home .hero-actions a",
    "#home .profile-panel",
    "#home .profile-image",
    "#about .section-heading",
    "#about .content-card",
    "#about .content-card h3",
    "#about .content-card p",
    "#about .skill-category-block",
    "#about .skill-category-title",
    "#about .skill-inline-item",
    "#about .career-strip",
    "#about .career-strip h3",
    "#about .career-strip p",
    "#projects .section-heading",
    "#projects .project-category-section",
    "#projects .project-category-header h3",
    "#projects .project-card",
    "#projects .project-image",
    "#projects .project-body h3",
    "#projects .project-body p",
    "#projects .tool-item",
    "#projects .project-body a",
    "#reflection .reflection-layout > div",
    "#reflection .reflection-card",
    "#reflection .reflection-card p",
    "#contact .simple-contact-info > .eyebrow",
    "#contact .simple-contact-info h2",
    "#contact .simple-email-row",
    "#contact .simple-contact-row",
    "#contact .simple-social-row",
    "#contact .simple-contact-form .floating-field",
    "#contact .simple-contact-form button",
    "body > footer",
    "body h1, body h2, body h3, body h4, body p, body a, body span, body strong, body button, body label, body input, body textarea, body select, body img" 
  ];

  const COLORS = [
    "#0D99FF", "#A259FF", "#F24E1E", "#0ACF83",
    "#FF7262", "#FFC700", "#E8467C", "#00B5CE"
  ];
  const NAMES = [
    "Ada", "Linus", "Grace", "Alan", "Margaret", "Ken",
    "Barbara", "Dennis", "Radia", "Guido", "Hedy", "Tim"
  ];
  const CURSOR_COUNT = 7;

  let canvas;
  let ctx;
  let style;
  let tasks = [];
  let agents = [];
  let rafId = 0;
  let lastTime = 0;
  let scrollWasAtTop = true;
  let running = false;
  let finished = false;
  let activeCount = 0;
  let removeListeners = [];

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;

  function depthOf(element) {
    let depth = 0;
    let node = element;
    while (node && node !== document.body) {
      depth++;
      node = node.parentElement;
    }
    return depth;
  }

  function originalInlineStyle(element, property) {
    return {
      value: element.style.getPropertyValue(property),
      priority: element.style.getPropertyPriority(property)
    };
  }

  function restoreInlineStyle(element, property, saved) {
    if (saved.value) element.style.setProperty(property, saved.value, saved.priority);
    else element.style.removeProperty(property);
  }

  function prepareTasks() {
    const unique = new Set();
    const collected = [];

    BUILD_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (unique.has(element)) return;
        unique.add(element);

        const rect = element.getBoundingClientRect();
        if (rect.width < 3 || rect.height < 3) return;

        const tag = element.tagName.toLowerCase();
        const isText = /^(h1|h2|h3|h4|p|a|span|strong|label|button)$/.test(tag);
        const isImage = tag === "img" || element.classList.contains("project-visual-image");
        collected.push({
          element,
          kind: isText ? "text" : isImage ? "image" : "box",
          depth: depthOf(element),
          rectTop: rect.top + window.scrollY,
          assigned: false,
          done: false,
          parentTask: null,
          saved: {
            visibility: originalInlineStyle(element, "visibility"),
            clipPath: originalInlineStyle(element, "clip-path"),
            transition: originalInlineStyle(element, "transition"),
            willChange: originalInlineStyle(element, "will-change")
          }
        });
      });
    });

    collected.sort((a, b) => {
      if (Math.abs(a.rectTop - b.rectTop) > 2) return a.rectTop - b.rectTop;
      return a.depth - b.depth;
    });

    const taskByElement = new Map(collected.map((task) => [task.element, task]));
    collected.forEach((task) => {
      let ancestor = task.element.parentElement;
      while (ancestor && ancestor !== document.body) {
        const parentTask = taskByElement.get(ancestor);
        if (parentTask) {
          task.parentTask = parentTask;
          break;
        }
        ancestor = ancestor.parentElement;
      }
    });

    return collected;
  }

  function createCanvas() {
    canvas = document.createElement("canvas");
    canvas.id = "portfolio-cursor-swarm";
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "10000"
    });

    style = document.createElement("style");
    style.textContent = [
      "body.swarm-building { background:#fff !important; }",
      "body.swarm-building *:not(#portfolio-cursor-swarm) { visibility:hidden !important; }",
      "#portfolio-cursor-swarm { opacity:1; transition:opacity .45s ease; }",
      "#portfolio-cursor-swarm.swarm-fade { opacity:0; }"
    ].join("\n");

    document.head.appendChild(style);
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d", { alpha: true });
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeAgent(index) {
    const startOnLeft = index % 2 === 0;
    return {
      x: startOnLeft ? -35 : window.innerWidth + 35,
      y: 70 + Math.random() * Math.max(150, window.innerHeight - 140),
      vx: 0,
      vy: 0,
      angle: 0,
      color: COLORS[index % COLORS.length],
      name: NAMES[index % NAMES.length],
      task: null,
      phase: "idle",
      elapsed: 0,
      progress: 0,
      size: 0.88 + Math.random() * 0.2,
      lastX: 0,
      lastY: 0
    };
  }

  function visibleRect(task) {
    const rect = task.element.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height
    };
  }

  function parentIsReady(task) {
    return !task.parentTask || task.parentTask.done;
  }

  function taskIsInReach(task) {
    const rect = visibleRect(task);
    return rect.width > 2 && rect.height > 2 &&
      rect.bottom > -90 && rect.top < window.innerHeight + 130;
  }

  function getNextTask() {
    return tasks.find((task) =>
      !task.done && !task.assigned && parentIsReady(task) && taskIsInReach(task)
    ) || null;
  }

  function assignTask(agent, task) {
    task.assigned = true;
    agent.task = task;
    agent.phase = "approach";
    agent.elapsed = 0;
    agent.progress = 0;

    const el = task.element;
    const scrollParent = el.closest(".scroll-animate");
    if (scrollParent) scrollParent.classList.add("show");

    el.style.setProperty("visibility", "visible", "important");
    el.style.setProperty("clip-path", "inset(0 100% 0 0)", "important");
    el.style.setProperty("transition", "none", "important");
    el.style.setProperty("will-change", "clip-path", "important");
  }

  function completeTask(agent) {
    const task = agent.task;
    if (!task) return;
    task.done = true;
    task.element.style.setProperty("visibility", "visible", "important");
    restoreInlineStyle(task.element, "clip-path", task.saved.clipPath);
    restoreInlineStyle(task.element, "transition", task.saved.transition);
    restoreInlineStyle(task.element, "will-change", task.saved.willChange);
    agent.task = null;
    agent.phase = "idle";
    agent.elapsed = 0;
    agent.progress = 0;
  }

  function drawArrow(agent) {
    const scale = agent.size;
    ctx.save();
    ctx.translate(agent.x, agent.y);
    ctx.rotate(agent.angle);
    ctx.scale(scale, scale);
    ctx.shadowColor = agent.color;
    ctx.shadowBlur = 13;
    ctx.fillStyle = agent.color;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(2, 2);
    ctx.lineTo(5, 29);
    ctx.lineTo(11, 22);
    ctx.lineTo(17, 34);
    ctx.lineTo(22, 31);
    ctx.lineTo(16, 19);
    ctx.lineTo(26, 17);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.font = "700 10px Arial, sans-serif";
    const labelWidth = ctx.measureText(agent.name).width + 13;
    roundedRect(24, 22, labelWidth, 18, 5);
    ctx.fillStyle = agent.color;
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(agent.name, 30, 34);
    ctx.restore();
  }

  function drawIBeam(agent) {
    ctx.save();
    ctx.translate(agent.x, agent.y);
    ctx.strokeStyle = agent.color;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = agent.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 12);
    ctx.moveTo(-6, -12);
    ctx.lineTo(6, -12);
    ctx.moveTo(-6, 12);
    ctx.lineTo(6, 12);
    ctx.stroke();
    ctx.restore();
  }

  function roundedRect(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawBuildOutline(agent) {
    const task = agent.task;
    if (!task) return;
    const rect = visibleRect(task);
    if (rect.width <= 0 || rect.height <= 0) return;

    ctx.save();
    ctx.strokeStyle = agent.color;
    ctx.fillStyle = agent.color;
    ctx.lineWidth = 1.3;
    ctx.setLineDash([5, 4]);
    ctx.globalAlpha = 0.78;
    ctx.strokeRect(rect.left, rect.top, rect.width * agent.progress, rect.height * agent.progress);
    ctx.setLineDash([]);

    if (task.kind !== "text") {
      const badge = Math.round(rect.width * agent.progress) + " × " +
        Math.round(rect.height * agent.progress);
      ctx.font = "600 10px Arial, sans-serif";
      const badgeWidth = ctx.measureText(badge).width + 12;
      roundedRect(
        clamp(agent.x + 13, 4, window.innerWidth - badgeWidth - 4),
        clamp(agent.y + 14, 4, window.innerHeight - 23),
        badgeWidth,
        18,
        4
      );
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText(badge, clamp(agent.x + 19, 10, window.innerWidth - badgeWidth + 2), clamp(agent.y + 26, 16, window.innerHeight - 9));
    }
    ctx.restore();
  }

  function updateAgent(agent, dt) {
    if (!agent.task) {
      const task = getNextTask();
      if (task) assignTask(agent, task);
      else return;
    }

    const task = agent.task;
    const rect = visibleRect(task);
    if (rect.width < 2 || rect.height < 2) {
      completeTask(agent);
      return;
    }

    if (agent.phase === "approach") {
      const targetX = rect.left + 2;
      const targetY = rect.top + 2;
      const dx = targetX - agent.x;
      const dy = targetY - agent.y;
      const distance = Math.hypot(dx, dy);
      const factor = 1 - Math.exp(-dt * 8.5);
      agent.x += dx * factor;
      agent.y += dy * factor;
      if (distance > 2) agent.angle = lerp(agent.angle, Math.atan2(dy, dx) + Math.PI / 2, factor);
      if (distance < 15) {
        agent.phase = "draw";
        agent.elapsed = 0;
        agent.progress = 0;
      }
      return;
    }

    if (agent.phase === "draw") {
      agent.elapsed += dt;
      agent.progress = clamp(agent.elapsed / (task.kind === "text" ? 0.18 : 0.28), 0, 1);
      if (task.kind === "text") {
        agent.x = rect.left + rect.width * agent.progress;
        agent.y = rect.top + Math.min(rect.height * 0.55, 24);
      } else {
        agent.x = rect.left + rect.width * agent.progress;
        agent.y = rect.top + rect.height * agent.progress;
      }
      if (agent.progress >= 1) {
        agent.phase = "reveal";
        agent.elapsed = 0;
        agent.progress = 0;
      }
      return;
    }

    if (agent.phase === "reveal") {
      const duration = clamp(rect.width / 1450, 0.16, 0.48);
      agent.elapsed += dt;
      agent.progress = clamp(agent.elapsed / duration, 0, 1);
      task.element.style.setProperty(
        "clip-path",
        "inset(0 " + ((1 - agent.progress) * 100).toFixed(2) + "% 0 0)",
        "important"
      );
      agent.x = rect.left + rect.width * agent.progress;
      agent.y = rect.top + (task.kind === "text" ? Math.min(rect.height * 0.55, 24) : rect.height * 0.5);
      if (agent.progress >= 1) completeTask(agent);
    }
  }

  function drawProgress() {
    const doneCount = tasks.filter((task) => task.done).length;
    const percent = tasks.length ? doneCount / tasks.length : 1;
    const label = "BUILDING PORTFOLIO";
    const boxWidth = 190;
    const boxHeight = 42;
    const x = 18;
    const y = window.innerHeight - 62;

    ctx.save();
    ctx.globalAlpha = 0.94;
    roundedRect(x, y, boxWidth, boxHeight, 9);
    ctx.fillStyle = "rgba(255,255,255,.94)";
    ctx.fill();
    ctx.strokeStyle = "rgba(13,153,255,.22)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#17324d";
    ctx.font = "700 9px Arial, sans-serif";
    ctx.fillText(label, x + 12, y + 14);
    ctx.fillStyle = "#7a8da1";
    ctx.font = "600 9px Arial, sans-serif";
    ctx.fillText(Math.round(percent * 100) + "%", x + boxWidth - 31, y + 14);

    roundedRect(x + 12, y + 23, boxWidth - 24, 5, 3);
    ctx.fillStyle = "#e8f0f8";
    ctx.fill();
    roundedRect(x + 12, y + 23, (boxWidth - 24) * percent, 5, 3);
    ctx.fillStyle = "#0D99FF";
    ctx.fill();
    ctx.restore();
  }

  function scrollTowardNextTask(dt) {
    const pending = tasks.find((task) =>
      !task.done && !task.assigned && parentIsReady(task)
    );
    if (!pending) return;

    const rect = visibleRect(pending);
    if (rect.top > window.innerHeight * 0.82) {
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const nextY = Math.min(maxScroll, window.scrollY + Math.min(260 * dt, rect.top - window.innerHeight * 0.68));
      window.scrollTo(0, nextY);
    }
  }

  function cleanupStyles() {
    tasks.forEach((task) => {
      restoreInlineStyle(task.element, "visibility", task.saved.visibility);
      restoreInlineStyle(task.element, "clip-path", task.saved.clipPath);
      restoreInlineStyle(task.element, "transition", task.saved.transition);
      restoreInlineStyle(task.element, "will-change", task.saved.willChange);
    });
  }

  function removeBuild() {
    running = false;
    finished = true;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    cleanupStyles();
    document.body.classList.remove("swarm-building");
    if (canvas) {
      canvas.classList.add("swarm-fade");
      window.setTimeout(() => {
        canvas && canvas.remove();
        style && style.remove();
      }, 480);
    }
    removeListeners.forEach((remove) => remove());
    removeListeners = [];
  }

  function finishBuild(returnToTop) {
    if (finished) return;
    if (returnToTop && scrollWasAtTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    removeBuild();
  }

  function cancelOnUserAction(event) {
    if (!running || finished || !event.isTrusted) return;
    finishBuild(false);
  }

  function addCancelListeners() {
    const cancelEvents = [
      [window, "wheel"],
      [window, "touchstart"],
      [window, "pointerdown"],
      [window, "keydown"]
    ];
    cancelEvents.forEach(([target, eventName]) => {
      const handler = cancelOnUserAction;
      target.addEventListener(eventName, handler, { passive: true, once: true });
      removeListeners.push(() => target.removeEventListener(eventName, handler));
    });
  }

  function animationFrame(now) {
    rafId = 0;
    if (!running || finished) return;
    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.04) : 1 / 60;
    lastTime = now;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    agents.forEach((agent) => {
      updateAgent(agent, dt);
      if (agent.task) drawBuildOutline(agent);
      if (agent.task && agent.task.kind === "text" && agent.phase === "reveal") drawIBeam(agent);
      else drawArrow(agent);
    });

    drawProgress();

    const done = tasks.every((task) => task.done);
    if (done) {
      finishBuild(true);
      return;
    }

    scrollTowardNextTask(dt);
    rafId = requestAnimationFrame(animationFrame);
  }

  function startBuild() {
    if (running || finished || document.body.classList.contains("swarm-building")) return;
    if (window.scrollY > 30 || motionPreference.matches || window.innerWidth < 640 || coarsePointer.matches) return;

    tasks = prepareTasks();
    if (tasks.length < 10) return;

    createCanvas();
    if (!ctx) {
      canvas && canvas.remove();
      style && style.remove();
      return;
    }

    scrollWasAtTop = window.scrollY <= 30;
    agents = Array.from({ length: CURSOR_COUNT }, (_, index) => makeAgent(index));
    running = true;
    lastTime = 0;
    document.body.classList.add("swarm-building");
    resizeCanvas();
    addCancelListeners();

    window.addEventListener("resize", resizeCanvas, { passive: true });
    removeListeners.push(() => window.removeEventListener("resize", resizeCanvas));

    rafId = requestAnimationFrame(animationFrame);
  }

  window.addEventListener("DOMContentLoaded", () => {
    // Wait briefly for the portfolio's DOM renderers to populate project and
    // reflection content before measuring the page's build targets.
    window.requestAnimationFrame(startBuild);
  }, { once: true });

  motionPreference.addEventListener?.("change", (event) => {
    if (event.matches && running) finishBuild(false);
  });
})();