/* ==========================================================================
   interactions.js — botões magnéticos + parallax leve no hero
   Desativado em touch/reduced-motion para não pesar e não fazer sentido no mobile
   ========================================================================== */

(function () {
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isTouch || prefersReducedMotion) return;

  /* ---------- Botões magnéticos ---------- */
  var magneticEls = document.querySelectorAll('.btn, [data-magnetic]');

  magneticEls.forEach(function (el) {
    var strength = 0.35;

    el.addEventListener('mousemove', function (e) {
      var bounds = el.getBoundingClientRect();
      var relX = e.clientX - (bounds.left + bounds.width / 2);
      var relY = e.clientY - (bounds.top + bounds.height / 2);
      el.style.transform = 'translate(' + relX * strength + 'px, ' + relY * strength + 'px)';
    });

    el.addEventListener('mouseleave', function () {
      el.style.transform = 'translate(0, 0)';
    });
  });

  /* ---------- Parallax leve na foto do hero, seguindo o mouse ---------- */
  /* A imagem se desloca alguns pixels na direção oposta ao cursor —
     dá sensação de profundidade sem exagerar. */
  var heroVisual = document.querySelector('.hero-visual');

  if (heroVisual) {
    window.addEventListener('mousemove', function (e) {
      var w = window.innerWidth || 1;
      var h = window.innerHeight || 1;
      var px = ((e.clientX / w) - 0.5) * -18;
      var py = ((e.clientY / h) - 0.5) * -12;
      heroVisual.style.transform = 'translate3d(' + px + 'px, ' + py + 'px, 0)';
    });
  }

  /* ---------- Painel de projeto: abre com o mouse sobre o card ---------- */
  /* Abordagem simples e à prova de troca rápida: em vez de cada card
     cuidar do próprio estado (o que causava cards abertos ao mesmo tempo
     ou nenhum abrindo), UM único listener em document.mousemove decide,
     a cada movimento, qual card está sob o cursor — e esse é o único que
     pode ficar aberto. Como é sempre recalculado a partir da posição real
     do mouse, não existe estado "preso": se o cursor está sobre o card B,
     o A fecha e o B abre, não importa a ordem dos eventos do navegador.

     O único atraso é para não abrir enquanto a página está rolando (a
     roda do mouse passa o cursor por cima dos cards sem intenção). */
  var hoverDelay = 100;
  var openTimer = null;
  var openCard = null; // card com a classe aplicada agora
  var wantedCard = null; // card sob o cursor no último movimento
  var isScrolling = false;
  var scrollEndTimer = null;

  window.addEventListener(
    'scroll',
    function () {
      isScrolling = true;
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(function () {
        isScrolling = false;
        // ao terminar de rolar, reavalia: se o cursor parou sobre um card,
        // ele deve abrir normalmente
        applyWanted();
      }, 120);
    },
    { passive: true }
  );

  function setOpenCard(card) {
    if (openCard === card) return;
    if (openCard) {
      openCard.classList.remove('project-card-open');
      var closingVideo = openCard.querySelector('.media-video video');
      if (closingVideo) {
        closingVideo.pause();
        closingVideo.currentTime = 0;
      }
    }
    openCard = card;
    if (openCard) {
      openCard.classList.add('project-card-open');
      var openingVideo = openCard.querySelector('.media-video video');
      if (openingVideo) openingVideo.play().catch(function () {});
    }
  }

  function applyWanted() {
    clearTimeout(openTimer);

    // sem card sob o cursor: fecha na hora, sem atraso
    if (!wantedCard) {
      setOpenCard(null);
      return;
    }

    // rolando a página: não abre nada (mas mantém fechado o que já fechou)
    if (isScrolling) {
      setOpenCard(null);
      return;
    }

    // já é o card aberto: nada a fazer
    if (wantedCard === openCard) return;

    // troca de card: fecha o anterior na hora e abre o novo após o atraso
    setOpenCard(null);
    var target = wantedCard;
    openTimer = setTimeout(function () {
      if (wantedCard === target && !isScrolling) setOpenCard(target);
    }, hoverDelay);
  }

  document.addEventListener(
    'mousemove',
    function (e) {
      var card = e.target.closest ? e.target.closest('.project-card') : null;
      if (card === wantedCard) return; // nada mudou, evita trabalho a cada pixel
      wantedCard = card;
      applyWanted();
    },
    { passive: true }
  );

  // se o mouse sair da janela, fecha
  document.addEventListener('mouseleave', function () {
    wantedCard = null;
    applyWanted();
  });
})();
