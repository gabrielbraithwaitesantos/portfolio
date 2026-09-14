/* ==========================================================================
   cursor.js — cursor customizado (ponto + anel) com leve delay
   Desativado automaticamente em dispositivos touch (ver CSS: hover: none)
   ========================================================================== */

(function () {
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isTouch || prefersReducedMotion) return;

  var dot = document.createElement('div');
  dot.className = 'cursor-dot';
  var ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  var mouseX = 0, mouseY = 0;
  var ringX = 0, ringY = 0;

  window.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing() {
    // easing suave: o anel "persegue" o ponto com delay
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);

  var hoverTargets = 'a, button, .project-card, .creation-card, .preview-card, .skill-card, .featured-card, .cert-card, [data-cursor-hover]';

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(hoverTargets)) {
      ring.classList.add('hovered');
    }
  });

  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(hoverTargets)) {
      ring.classList.remove('hovered');
    }
  });

  document.addEventListener('mouseleave', function () {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', function () {
    dot.style.opacity = '1';
    ring.style.opacity = '0.6';
  });
})();
