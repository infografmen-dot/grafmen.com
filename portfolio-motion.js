/* Decorative portfolio loops: no player UI inside project links. */
(() => {
  const videos = [...document.querySelectorAll('.portfolio-loop')];
  const toggle = document.querySelector('.motion-toggle');
  if (!videos.length || !toggle) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let userPaused = false;
  let explicitlyEnabled = false;
  const visible = new Set();
  const blocked = () => userPaused || (!explicitlyEnabled && (reduced.matches || connection?.saveData));
  const labels = () => {
    const en = document.documentElement.lang === 'en';
    toggle.textContent = blocked() ? (en ? 'Play animations' : 'Włącz animacje') : (en ? 'Pause animations' : 'Wstrzymaj animacje');
    toggle.setAttribute('aria-pressed', String(blocked()));
  };
  const load = video => {
    if (video.dataset.loaded) return;
    video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; });
    video.dataset.loaded = 'true';
    video.load();
  };
  const sync = video => {
    if (blocked() || document.hidden || !visible.has(video)) {
      video.pause();
      if (blocked()) video.classList.remove('is-playing');
      return;
    }
    load(video);
    video.muted = true;
    const playing = video.play();
    playing?.catch(error => {
      if (error?.name === 'AbortError' || blocked() || document.hidden || !visible.has(video)) return;
      video.classList.remove('is-playing');
      // Allow a user gesture to retry autoplay if the browser blocked it.
      userPaused = true;
      videos.forEach(item => item.pause());
      labels();
    });
  };
  videos.forEach(video => {
    video.addEventListener('playing', () => {
      if (!blocked() && visible.has(video)) video.classList.add('is-playing');
      else video.pause();
    });
    video.addEventListener('error', () => video.classList.remove('is-playing'));
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target);
        sync(entry.target);
      });
    }, { threshold: 0.1 });
    videos.forEach(video => observer.observe(video));
  } else videos.forEach(video => visible.add(video));
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const wasBlocked = blocked();
    userPaused = !wasBlocked;
    explicitlyEnabled = wasBlocked;
    videos.forEach(sync);
    labels();
  });
  const preferenceChanged = () => { explicitlyEnabled = false; videos.forEach(sync); labels(); };
  reduced.addEventListener('change', preferenceChanged);
  connection?.addEventListener('change', preferenceChanged);
  document.addEventListener('visibilitychange', () => videos.forEach(sync));
  new MutationObserver(labels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  labels(); videos.forEach(sync);
})();
