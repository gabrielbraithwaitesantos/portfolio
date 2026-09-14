/* ==========================================================================
   project-lightbox.js — abre a mídia (foto/vídeo) de um projeto em destaque,
   com setas para passar entre todos os itens daquele mesmo projeto
   (agrupados por data-media-group). Funciona com placeholders (mostra o
   texto do placeholder ampliado) e com <img>/<video> reais dentro do botão.
   ========================================================================== */

(function () {
  var lightbox = document.getElementById('media-lightbox');
  if (!lightbox) return;

  var stage = document.getElementById('media-lightbox-stage');
  var counter = document.getElementById('media-lightbox-counter');
  var closeBtn = lightbox.querySelector('.lightbox-close');
  var prevBtn = lightbox.querySelector('.lightbox-nav-prev');
  var nextBtn = lightbox.querySelector('.lightbox-nav-next');

  var groups = {}; // { slug: [elementos ordenados por data-media-index] }
  var currentGroup = [];
  var currentIndex = 0;

  document.querySelectorAll('.media-item[data-media-group]').forEach(function (item) {
    var group = item.getAttribute('data-media-group');
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
  });

  Object.keys(groups).forEach(function (group) {
    groups[group].sort(function (a, b) {
      return (parseInt(a.getAttribute('data-media-index'), 10) || 0) -
        (parseInt(b.getAttribute('data-media-index'), 10) || 0);
    });
  });

  function renderStage() {
    var item = currentGroup[currentIndex];
    if (!item) return;

    stage.innerHTML = '';

    var img = item.querySelector('img');
    var video = item.querySelector('video');

    if (video) {
      var v = document.createElement('video');
      v.src = video.currentSrc || video.src;
      v.controls = true;
      v.autoplay = true;
      stage.appendChild(v);
    } else if (img) {
      var i = document.createElement('img');
      i.src = img.src;
      i.alt = img.alt || '';
      stage.appendChild(i);
    } else {
      // ainda é placeholder — mostra o texto ampliado, sem quebrar a experiência
      var placeholder = item.querySelector('.media-placeholder');
      var span = document.createElement('div');
      span.className = 'media-lightbox-placeholder mono';
      span.textContent = placeholder ? placeholder.textContent : '';
      stage.appendChild(span);
    }

    counter.textContent = (currentIndex + 1) + ' / ' + currentGroup.length;
    var multi = currentGroup.length > 1;
    prevBtn.style.display = multi ? '' : 'none';
    nextBtn.style.display = multi ? '' : 'none';
  }

  function open(group, index) {
    currentGroup = groups[group] || [];
    currentIndex = index;
    renderStage();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    stage.innerHTML = ''; // para qualquer vídeo tocando
  }

  function next() {
    currentIndex = (currentIndex + 1) % currentGroup.length;
    renderStage();
  }

  function prev() {
    currentIndex = (currentIndex - 1 + currentGroup.length) % currentGroup.length;
    renderStage();
  }

  document.querySelectorAll('.media-item[data-media-group]').forEach(function (item) {
    item.addEventListener('click', function () {
      var group = item.getAttribute('data-media-group');
      var index = groups[group].indexOf(item);
      open(group, index);
    });
  });

  closeBtn.addEventListener('click', close);
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
})();
