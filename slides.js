/**
 * Slide engine — pure JS.
 */
(function () {
  'use strict';

  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  const bar = document.getElementById('progress');
  const ctr = document.getElementById('counter');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  let cur = 0;

  function clamp(n) { return Math.max(0, Math.min(total - 1, n)); }

  function go(i, dir) {
    i = clamp(i);
    if (i === cur) return;
    const old = slides[cur];
    old.classList.remove('active');
    old.classList.add('exit-left');
    const nxt = slides[i];
    nxt.style.transform = dir === 'back' ? 'translateY(12px)' : 'translateY(-12px)';
    nxt.classList.remove('exit-left');
    void nxt.offsetWidth;
    nxt.classList.add('active');
    nxt.style.transform = '';
    setTimeout(() => old.classList.remove('exit-left'), 500);
    cur = i;
    update();
  }

  function update() {
    bar.style.width = ((cur + 1) / total * 100) + '%';
    ctr.textContent = (cur + 1) + '/' + total;
    const classes = [];
    if (slides[cur].dataset.theme === 'light') classes.push('light');
    if (slides[cur].dataset.pace === 'flash') classes.push('flash-active');
    document.body.className = classes.join(' ');
    history.replaceState(null, '', '#' + (cur + 1));
  }

  function init() {
    const h = parseInt(location.hash.replace('#', ''), 10);
    cur = clamp((h || 1) - 1);
    slides[cur].classList.add('active');
    update();
  }

  document.addEventListener('keydown', e => {
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown':
        e.preventDefault(); go(cur + 1, 'forward'); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
        e.preventDefault(); go(cur - 1, 'back'); break;
      case 'Home': e.preventDefault(); go(0, 'back'); break;
      case 'End':  e.preventDefault(); go(total - 1, 'forward'); break;
    }
  });

  prev.addEventListener('click', () => go(cur - 1, 'back'));
  next.addEventListener('click', () => go(cur + 1, 'forward'));

  let tx = 0, ty = 0;
  document.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) dx < 0 ? go(cur + 1, 'forward') : go(cur - 1, 'back');
  }, { passive: true });

  window.addEventListener('hashchange', () => {
    const h = parseInt(location.hash.replace('#', ''), 10);
    if (h && h - 1 !== cur) go(h - 1, h - 1 > cur ? 'forward' : 'back');
  });

  init();
})();

// KaTeX
window.addEventListener('load', () => {
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
      ],
      throwOnError: false,
    });
  }
});
