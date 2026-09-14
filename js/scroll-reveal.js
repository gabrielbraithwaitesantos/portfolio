/* ==========================================================================
   scroll-reveal.js — revela elementos [data-reveal] ao entrar na viewport,
   desenha a linha da timeline em sincronia com o scroll real, e destaca
   os marcadores da timeline quando o mouse passa perto
   ========================================================================== */

(function () {
  var revealEls = document.querySelectorAll('[data-reveal]');
  var timeline = document.querySelector('.timeline');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // fallback: sem IntersectionObserver, mostra tudo direto
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------- Linha da timeline: cresce acompanhando o scroll real,
     com uma "luz" na ponta e os marcadores preenchendo conforme ela passa ---------- */
  if (timeline) {
    var timelineItems = timeline.querySelectorAll('.timeline-item');
    var timelineMarkers = timeline.querySelectorAll('.timeline-marker');
    var nextSection = document.getElementById('projetos-destaque');

    var targetProgress = 0; // progresso "real" calculado a partir do scroll
    var smoothProgress = 0; // progresso exibido, com atraso suave (lerp)
    var hasHitEnd = false; // evita disparar o efeito de "bater" mais de uma vez
    var rafRunning = false;

    function computeTargetProgress() {
      var rect = timeline.getBoundingClientRect();
      var viewportH = window.innerHeight || document.documentElement.clientHeight;

      // progresso 0→1: começa quando o topo da timeline entra na tela,
      // termina quando o fim da timeline passa do meio da tela
      var start = viewportH * 0.85;
      var end = -rect.height + viewportH * 0.4;
      var total = start - end;
      var progress = (start - rect.top) / total;
      targetProgress = Math.max(0, Math.min(1, progress));
      return rect;
    }

    function renderProgress(rect) {
      timeline.style.setProperty('--timeline-progress', smoothProgress);

      // a "luz" acompanha a ponta da linha, que cresce com scaleY(progress)
      // a partir do topo — então a posição dela é só altura * progress
      var lightY = rect.height * smoothProgress;
      timeline.style.setProperty('--timeline-light-y', lightY + 'px');

      // cada marcador preenche de cor quando a "luz" já passou por ele
      timelineMarkers.forEach(function (marker, i) {
        var markerRect = marker.getBoundingClientRect();
        var markerOffsetInTimeline = markerRect.top - rect.top + markerRect.height / 2;
        timelineItems[i].classList.toggle('is-filled', lightY >= markerOffsetInTimeline);
      });

      // "bate" quando a luz chega perto do fim da linha. Uma vez batido,
      // fica permanente — nunca desfaz, mesmo que o usuário role de volta
      // pra cima da timeline depois.
      if (targetProgress > 0.985 && !hasHitEnd) {
        hasHitEnd = true;
        if (nextSection) nextSection.classList.add('section-hit');
      }
    }

    function loop() {
      var rect = computeTargetProgress();
      // suaviza a transição: a luz "espera um pouco" antes de reagir ao
      // scroll, em vez de pular instantaneamente pra posição do scroll bruto
      smoothProgress += (targetProgress - smoothProgress) * 0.09;

      if (Math.abs(targetProgress - smoothProgress) < 0.0005) {
        smoothProgress = targetProgress;
      }

      renderProgress(rect);

      // continua rodando enquanto houver diferença perceptível (a luz
      // ainda "viajando" pro alvo) OU enquanto ainda não bateu no fim —
      // isso garante que, mesmo se o usuário rolar rápido até o fim e
      // parar, o loop continua sozinho até a luz realmente convergir e
      // dar a batida, em vez de "desistir" achando que já chegou perto o
      // suficiente.
      var stillConverging = Math.abs(targetProgress - smoothProgress) > 0.0005;
      var waitingToHit = targetProgress > 0.985 && !hasHitEnd;

      if (stillConverging || waitingToHit) {
        requestAnimationFrame(loop);
      } else {
        rafRunning = false;
      }
    }

    function requestLoop() {
      if (!rafRunning) {
        rafRunning = true;
        requestAnimationFrame(loop);
      }
    }

    window.addEventListener('scroll', requestLoop, { passive: true });
    window.addEventListener('resize', requestLoop);

    computeTargetProgress();
    smoothProgress = targetProgress;
    renderProgress(timeline.getBoundingClientRect());
  }

  /* ---------- Marcadores da timeline reagem à proximidade do mouse ---------- */
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (timeline && !isTouch && !prefersReducedMotion) {
    var items = timeline.querySelectorAll('.timeline-item');
    var proximity = 60; // px — raio de ativação ao redor do marcador

    window.addEventListener('mousemove', function (e) {
      items.forEach(function (item) {
        var marker = item.querySelector('.timeline-marker');
        if (!marker) return;
        // .timeline-marker agora é um elemento real — dá pra ler a posição
        // exata dele na tela, sem precisar aproximar com valores fixos
        var rect = marker.getBoundingClientRect();
        var markerX = rect.left + rect.width / 2;
        var markerY = rect.top + rect.height / 2;
        var dist = Math.hypot(e.clientX - markerX, e.clientY - markerY);
        item.classList.toggle('marker-near', dist < proximity);
      });
    });
  }
})();
