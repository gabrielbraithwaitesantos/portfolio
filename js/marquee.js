/* ==========================================================================
   marquee.js — move a esteira de certificados a cada frame (em vez de usar
   uma @keyframes CSS), para poder desacelerar suavemente no hover sem o
   salto que acontece ao mudar animation-duration no meio do percurso.
   Também aceita arraste (mouse e touch) com inércia real: ao soltar, a
   esteira continua no embalo da velocidade do gesto e vai freando aos
   poucos até voltar à velocidade normal — em vez de travar seco.
   ========================================================================== */

(function () {
  var marqueeWrap = document.querySelector('.cert-marquee-wrap');
  var marquee = document.querySelector('.cert-marquee');
  if (!marquee) return;

  var track = marquee.querySelector('.cert-track');
  var group = marquee.querySelector('.cert-group-set');
  if (!track || !group) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var normalSpeed = 40; // px/segundo
  var hoverSpeed = 8; // px/segundo — bem mais devagar, mas sem parar
  var currentSpeed = prefersReducedMotion ? 0 : normalSpeed;
  var targetSpeed = currentSpeed;
  var offset = 0;
  var groupWidth = 0;
  var lastTime = null;

  var isDragging = false;
  var dragMoved = false; // distingue "arrastou" de "só clicou"
  var lastPointerX = 0;
  var lastPointerTime = 0;
  var gestureVelocity = 0; // px/segundo, calculada durante o arraste
  var coastingVelocity = null; // velocidade de "embalo" após soltar, ou null se não está no embalo

  function measure() {
    groupWidth = group.getBoundingClientRect().width;
  }

  function normalize() {
    // mantém o offset sempre dentro de [0, groupWidth), pra funcionar
    // tanto arrastando pra frente quanto pra trás, sem limite de arraste
    if (groupWidth <= 0) return;
    offset = ((offset % groupWidth) + groupWidth) % groupWidth;
  }

  function render() {
    track.style.transform = 'translateX(-' + offset + 'px)';
  }

  measure();
  window.addEventListener('resize', measure);

  marquee.addEventListener('mouseenter', function () {
    if (coastingVelocity === null) targetSpeed = hoverSpeed;
  });

  marquee.addEventListener('mouseleave', function () {
    targetSpeed = normalSpeed;
  });

  /* ---------- Indicador "arraste para navegar", some no primeiro uso ---------- */
  function dismissHint() {
    if (marqueeWrap) marqueeWrap.classList.add('hint-dismissed');
  }

  /* ---------- Arraste (mouse e touch) ---------- */

  function getX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  var dragStartX = 0; // posição onde o gesto começou, para medir a distância TOTAL
  var dragStartCard = null; // card sob o ponteiro quando o gesto começou

  function dragStart(e) {
    isDragging = true;
    dragMoved = false;
    coastingVelocity = null;
    dragStartCard = e.target && e.target.closest ? e.target.closest('.cert-card') : null;
    dragStartX = getX(e);
    lastPointerX = dragStartX;
    lastPointerTime = performance.now();
    gestureVelocity = 0;
    track.classList.add('dragging');
  }

  function dragMove(e) {
    if (!isDragging) return;
    var x = getX(e);
    var now = performance.now();
    var delta = x - lastPointerX;
    var dt = (now - lastPointerTime) / 1000;

    // "arrastou de verdade" = distância TOTAL desde o início do gesto,
    // não o delta entre dois eventos — um clique real sempre gera alguns
    // mousemove de 1-2px por tremor da mão, e isso não pode contar como arraste
    if (Math.abs(x - dragStartX) > 6) dragMoved = true;

    offset -= delta;
    normalize();
    render();

    if (dt > 0) {
      // velocidade instantânea do gesto (suavizada com o valor anterior)
      var instant = -delta / dt;
      gestureVelocity = gestureVelocity * 0.7 + instant * 0.3;
    }

    lastPointerX = x;
    lastPointerTime = now;

    if (dragMoved) dismissHint();
  }

  function dragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');

    if (dragMoved) {
      // solta com o embalo da velocidade do gesto — a física real do "toque"
      coastingVelocity = gestureVelocity;
      dragMoved = false;
      dragStartCard = null;
      return;
    }

    dragMoved = false;

    /* Não houve arraste: isso foi um CLIQUE.

       Por que abrir o lightbox aqui, e não no evento 'click'?
       A esteira está sempre em movimento (mesmo desacelerada no hover).
       Entre o mousedown e o mouseup, o card desliza alguns pixels sob o
       cursor — e o navegador só dispara 'click' se os dois aconteceram
       sobre o MESMO elemento na MESMA posição. Com o elemento se movendo,
       o 'click' simplesmente nunca nasce: o botão até reage visualmente,
       mas nenhum handler de clique roda. Por isso detectamos o clique
       nós mesmos aqui, a partir do que está sob o ponteiro ao soltar. */
    // 1ª fonte: o card onde o gesto COMEÇOU (guardado no mousedown). É o
    // mais fiel à intenção do usuário, já que o card pode ter deslizado
    // durante o clique. 2ª fonte (reserva): o que está sob o ponteiro.
    var card = dragStartCard;
    if (!card) {
      var x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      var y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      var el = document.elementFromPoint(x, y);
      card = el && el.closest ? el.closest('.cert-card') : null;
    }
    dragStartCard = null;
    if (card && typeof window.openCertLightbox === 'function') {
      window.openCertLightbox(card);
    }
  }

  track.addEventListener('mousedown', dragStart);
  window.addEventListener('mousemove', dragMove);
  window.addEventListener('mouseup', dragEnd);

  track.addEventListener('touchstart', dragStart, { passive: true });
  track.addEventListener('touchmove', dragMove, { passive: true });
  track.addEventListener('touchend', dragEnd);

  /* ---------- Loop de animação ---------- */

  function tick(time) {
    if (lastTime === null) lastTime = time;
    var delta = (time - lastTime) / 1000;
    lastTime = time;

    if (!isDragging && !prefersReducedMotion) {
      if (coastingVelocity !== null) {
        // fase de "embalo": desacelera exponencialmente a partir da
        // velocidade que a mão tinha ao soltar, até convergir pro normal
        offset += coastingVelocity * delta;
        normalize();
        render();

        coastingVelocity += (normalSpeed - coastingVelocity) * Math.min(1, delta * 2.2);

        // quando já está bem próximo da velocidade normal, encerra o
        // embalo e volta pro comportamento padrão (com hover etc)
        if (Math.abs(coastingVelocity - normalSpeed) < 1.5) {
          currentSpeed = coastingVelocity;
          coastingVelocity = null;
        }
      } else {
        // interpola a velocidade atual em direção à velocidade alvo,
        // isso evita qualquer salto brusco ao entrar/sair do hover
        currentSpeed += (targetSpeed - currentSpeed) * Math.min(1, delta * 3);
        offset += currentSpeed * delta;
        normalize();
        render();
      }
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
