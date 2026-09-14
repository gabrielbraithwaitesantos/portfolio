/* ==========================================================================
   lightbox.js — abre o certificado clicado em preview grande, sem sair
   da página. Fecha ao clicar fora, no X, ou apertando Esc.
   ========================================================================== */

(function () {
  var lightbox = document.getElementById('cert-lightbox');
  if (!lightbox) return;

  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxName = document.getElementById('lightbox-name');
  var lightboxMeta = document.getElementById('lightbox-meta');
  var closeBtn = lightbox.querySelector('.lightbox-close');
  var cards = document.querySelectorAll('.cert-card');

  function open(card) {
    var img = card.querySelector('img');
    var name = card.querySelector('.cert-name');
    var meta = card.querySelector('.cert-meta');

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxName.textContent = name ? name.textContent : '';
    lightboxMeta.textContent = meta ? meta.textContent : '';

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* A esteira está sempre em movimento, e o navegador não dispara 'click'
     quando o elemento desliza sob o cursor entre o mousedown e o mouseup.
     Por isso quem detecta o clique é o js/marquee.js (no mouseup) e chama
     esta função. Os listeners de 'click' abaixo ficam como reforço para
     teclado (Enter/Espaço em <button> gera click) e para o caso de a
     esteira estar parada. */
  window.openCertLightbox = open;

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      open(card);
    });
  });

  closeBtn.addEventListener('click', close);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
  });
})();
