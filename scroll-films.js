/* Scroll-linked decorative films: no autoplay, no scroll interception. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const films = [...document.querySelectorAll('video[data-scroll-film]')].map(video => ({
    video, scene: video.closest('[data-film-scene]'), target: 0
  })).filter(item => item.scene);
  const euros = new Intl.NumberFormat('fr-FR', {style:'currency',currency:'EUR',maximumFractionDigits:0});
  function updateFigures(item) {
    const progress = reduced.matches ? 1 : item.target;
    item.scene.querySelectorAll('[data-film-reveal]').forEach(el => {
      el.classList.toggle('is-revealed', progress >= Number(el.dataset.filmReveal));
    });
    const total = item.scene.querySelector('[data-growth-total]');
    if (!total) return;
    const months = Math.round(progress * Number(total.dataset.years) * 12);
    total.textContent = euros.format(Number(total.dataset.initial) + months * Number(total.dataset.monthly));
    item.scene.querySelector('[data-growth-year]').textContent = (months / 12).toLocaleString('fr-FR', {maximumFractionDigits:1});
  }
  let frame = 0;
  function seek(item) {
    const {video} = item;
    if (reduced.matches || video.readyState < 1 || video.seeking || !Number.isFinite(video.duration)) return;
    const time = item.target * Math.max(0, video.duration - .06);
    if (Math.abs(video.currentTime - time) > 1 / 30) video.currentTime = time;
  }
  function update() {
    frame = 0;
    films.forEach(item => {
      const rect = item.scene.getBoundingClientRect();
      if (!rect.height || rect.bottom < 0 || rect.top > innerHeight) return;
      const sticky = item.scene.querySelector('.film-sticky');
      const isHero = item.scene.matches('.hero, .study-hero');
      const distance = sticky ? item.scene.offsetHeight - sticky.offsetHeight : isHero ? Math.min(rect.height * .65, Math.max(1, document.documentElement.scrollHeight-innerHeight)) : innerHeight + rect.height;
      const offset = sticky ? parseFloat(getComputedStyle(sticky).top) || 0 : isHero ? item.scene.offsetTop : innerHeight;
      item.target = Math.max(0, Math.min(1, (offset - rect.top) / Math.max(1, distance)));
      item.scene.style.setProperty('--film-progress', item.target);
      updateFigures(item);
      seek(item);
    });
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting && !reduced.matches) {
      const item = films.find(item => item.scene === entry.target);
      if (item.video.dataset.src) {
        item.video.src = item.video.dataset.src;
        delete item.video.dataset.src;
        item.video.load();
      }
      schedule();
    }
  }), {rootMargin: '400px'});
  films.forEach(item => {
    updateFigures(item);
    item.video.muted = true;
    item.video.addEventListener('loadeddata', () => { item.video.classList.add('film-ready'); schedule(); });
    item.video.addEventListener('seeked', () => seek(item));
    observer.observe(item.scene);
  });
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  reduced.addEventListener('change', () => { films.forEach(item => {
    if (!reduced.matches && item.video.dataset.src) { item.video.src=item.video.dataset.src; delete item.video.dataset.src; item.video.load(); }
  }); schedule(); });
  schedule();
})();
