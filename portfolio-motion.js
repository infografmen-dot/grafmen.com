/* Portfolio motion loops: play only on user interaction (desktop hover/focus), static on mobile */
(() => {
  const cards = document.querySelectorAll('.portfolio .work');
  if (!cards.length) return;

  const isReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSaveData = () => Boolean(navigator.connection?.saveData);
  const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const loadVideo = (video) => {
    if (video.dataset.loaded) return;
    video.querySelectorAll('source[data-src]').forEach(source => {
      source.src = source.dataset.src;
    });
    video.dataset.loaded = 'true';
    video.load();
  };

  const playCard = (card) => {
    if (!canHover() || isReducedMotion() || isSaveData()) return;
    const video = card.querySelector('.portfolio-loop');
    if (!video) return;

    loadVideo(video);
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (!video.paused) {
            video.classList.add('is-playing');
          }
        })
        .catch(() => {
          video.classList.remove('is-playing');
        });
    }
  };

  const stopCard = (card) => {
    const video = card.querySelector('.portfolio-loop');
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    video.classList.remove('is-playing');
  };

  cards.forEach(card => {
    // Desktop hover
    card.addEventListener('mouseenter', () => playCard(card));
    card.addEventListener('mouseleave', () => stopCard(card));

    // Keyboard focus accessibility
    card.addEventListener('focusin', () => playCard(card));
    card.addEventListener('focusout', () => stopCard(card));
  });

  // Stop all playing videos when switching tabs or window blur
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cards.forEach(stopCard);
    }
  });

  // Handle preference changes dynamically
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      cards.forEach(stopCard);
    }
  });
})();
