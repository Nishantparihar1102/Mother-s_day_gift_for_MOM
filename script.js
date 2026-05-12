/* ═══════════════════════════════════════════════════════
   DEAR MOM ❤️ — script.js
   Handles: Loader · Typed · Particles · Scroll Reveals
            Poem · Timeline · Letter · Slideshow · Music
═══════════════════════════════════════════════════════ */

'use strict';

// ── CONFIG ──────────────────────────────────────────────
const CONFIG = {
  loaderDuration: 4800,   // total loader time in ms
  loaderLines: [
    'Initializing Memories…',
    'Loading Love…',
    'Connecting to Mom\'s Heart…',
    'Almost ready…',
  ],
  slides: [
    { src: 'assets/images/slide1.jpg', caption: 'Every smile you gave became my strength.' },
    { src: 'assets/images/slide2.jpg', caption: 'Home was wherever you were.' },
    { src: 'assets/images/slide3.jpg', caption: 'Your hands held mine before I could walk.' },
    { src: 'assets/images/slide4.jpg', caption: 'The best days always had you in them.' },
    { src: 'assets/images/slide5.jpg', caption: 'A thousand moments. One feeling — love.' },
  ],
  heartCount: 18,
  musicSrc: 'assets/music/piano.mp3',
};

// ── UTILITIES ────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const wait = ms => new Promise(r => setTimeout(r, ms));

// ── DOM REFS ─────────────────────────────────────────────
const loader        = $('#loader');
const loaderBar     = $('#loader-bar');
const loaderPercent = $('#loader-percent');
const loaderTyped   = $('#loader-typed');
const main          = $('#main');
const musicBtn      = $('#music-btn');
const musicIcon     = $('#music-icon');
const bgMusic       = $('#bg-music');
const letterBtn     = $('#letter-btn');
const letterEnv     = $('#letter-envelope');
const slideshowTrack = $('#slideshow-track');
const slideshowDots  = $('#slideshow-dots');
const slidePrev     = $('#slide-prev');
const slideNext     = $('#slide-next');
const endingHearts  = $('#ending-hearts');

// ═══════════════════════════════════════════════════════
//  1. LOADER
// ═══════════════════════════════════════════════════════
let loaderTextIndex = 0;
let loaderCharIndex = 0;
let loaderLineTimer;

function typeLoaderLine() {
  if (loaderTextIndex >= CONFIG.loaderLines.length) return;
  const line = CONFIG.loaderLines[loaderTextIndex];

  if (loaderCharIndex <= line.length) {
    loaderTyped.textContent = line.slice(0, loaderCharIndex);
    loaderCharIndex++;
    loaderLineTimer = setTimeout(typeLoaderLine, 38);
  } else {
    // Pause, then move to next line
    setTimeout(() => {
      loaderTextIndex++;
      loaderCharIndex = 0;
      if (loaderTextIndex < CONFIG.loaderLines.length) {
        loaderTyped.textContent = '';
        typeLoaderLine();
      }
    }, 700);
  }
}

function animateLoaderBar(duration) {
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    // Ease-in-out-cubic
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    const pct = Math.round(eased * 100);
    loaderBar.style.width = pct + '%';
    loaderPercent.textContent = pct + '%';
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

async function runLoader() {
  typeLoaderLine();
  animateLoaderBar(CONFIG.loaderDuration - 600);
  await wait(CONFIG.loaderDuration);
  clearTimeout(loaderLineTimer);

  // Fade out loader
  loader.classList.add('fade-out');
  await wait(1200);
  loader.style.display = 'none';

  // Reveal main
  main.classList.remove('hidden');
  await wait(50);
  main.classList.add('visible');

  // Show music button
  musicBtn.classList.add('visible');

  // Kick off all observers / interactions
  initParticles();
  initScrollReveal();
  initPoemReveal();
  initSlideshow();
  initEndingHearts();

  // Try autoplay music (browsers may block)
  tryAutoplayMusic();
}

// ═══════════════════════════════════════════════════════
//  2. PARTICLES
// ═══════════════════════════════════════════════════════
function initParticles() {
  if (typeof particlesJS === 'undefined') return;

  particlesJS('particles-js', {
    particles: {
      number: { value: 55, density: { enable: true, value_area: 900 } },
      color: { value: ['#e8a0b0', '#d4849a', '#f5f0eb', '#c9a96e'] },
      shape: {
        type: ['circle', 'char'],
        character: { value: ['❤', '✦', '·'], font: 'Arial', style: '', weight: '400' },
      },
      opacity: { value: 0.45, random: true, anim: { enable: true, speed: 0.5, opacity_min: 0.1, sync: false } },
      size: { value: 3, random: true, anim: { enable: false } },
      line_linked: { enable: false },
      move: {
        enable: true,
        speed: 0.6,
        direction: 'top',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false,
      },
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: false }, resize: true },
      modes: { repulse: { distance: 80, duration: 0.4 } },
    },
    retina_detect: true,
  });
}

// ═══════════════════════════════════════════════════════
//  3. SCROLL REVEAL (IntersectionObserver)
// ═══════════════════════════════════════════════════════
function initScrollReveal() {
  const revealEls = $$('.reveal-up, .reveal-scale');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = $$('.reveal-up, .reveal-scale', entry.target.parentElement);
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = (idx * 0.12) + 's';
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  revealEls.forEach(el => observer.observe(el));

  // Timeline cards
  const memoryCards = $$('.memory-card .timeline__card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  memoryCards.forEach(card => cardObserver.observe(card));
}

// ═══════════════════════════════════════════════════════
//  4. POEM REVEAL
// ═══════════════════════════════════════════════════════
function initPoemReveal() {
  const poemLines = $$('.poem-line:not(.poem-spacer)');

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      poemLines.forEach((line, i) => {
        const delay = parseFloat(line.dataset.delay || i) * 280;
        setTimeout(() => line.classList.add('revealed'), delay);
      });
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  const poemSection = $('#poem');
  if (poemSection) observer.observe(poemSection);
}

// ═══════════════════════════════════════════════════════
//  5. LETTER
// ═══════════════════════════════════════════════════════
letterBtn?.addEventListener('click', () => {
  if (letterEnv.classList.contains('open')) return;
  letterEnv.classList.add('open');
  letterBtn.disabled = true;
  letterBtn.style.opacity = '0.4';
  letterBtn.style.pointerEvents = 'none';

  // Scroll to letter after it opens
  setTimeout(() => {
    letterEnv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 600);
});

// ═══════════════════════════════════════════════════════
//  6. SLIDESHOW
// ═══════════════════════════════════════════════════════
let currentSlide = 0;
let slideshowInterval;

function buildSlideshow() {
  CONFIG.slides.forEach((s, i) => {
    // Slide
    const slide = document.createElement('div');
    slide.className = 'slide';

    const img = document.createElement('img');
    img.src = s.src;
    img.alt = s.caption;
    img.onerror = () => {
      slide.innerHTML = `
        <div class="slide__placeholder">
          <span>${['📸','🌸','💕','🌟','🎀'][i] || '📷'}</span>
          <p>Place slide${i + 1}.jpg in assets/images/</p>
        </div>
      `;
    };
    slide.appendChild(img);

    const caption = document.createElement('div');
    caption.className = 'slide__caption';
    caption.textContent = s.caption;
    slide.appendChild(caption);

    slideshowTrack.appendChild(slide);

    // Dot
    const dot = document.createElement('div');
    dot.className = 'slideshow__dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    slideshowDots.appendChild(dot);
  });
}

function goToSlide(n) {
  currentSlide = (n + CONFIG.slides.length) % CONFIG.slides.length;
  slideshowTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  $$('.slideshow__dot').forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
  resetSlideshowInterval();
}

function resetSlideshowInterval() {
  clearInterval(slideshowInterval);
  slideshowInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
}

function initSlideshow() {
  buildSlideshow();
  slidePrev?.addEventListener('click', () => goToSlide(currentSlide - 1));
  slideNext?.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Touch/swipe
  let touchStartX = 0;
  slideshowTrack?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slideshowTrack?.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) goToSlide(currentSlide + (dx > 0 ? 1 : -1));
  });

  resetSlideshowInterval();
}

// ═══════════════════════════════════════════════════════
//  7. ENDING HEARTS
// ═══════════════════════════════════════════════════════
function initEndingHearts() {
  if (!endingHearts) return;

  const emojis = ['❤️', '🩷', '💕', '💗', '💓', '✦', '♡'];
  for (let i = 0; i < CONFIG.heartCount; i++) {
    const h = document.createElement('span');
    h.className = 'ending-heart';
    h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const dur   = (4 + Math.random() * 6).toFixed(1);
    const delay = (Math.random() * 8).toFixed(1);
    const left  = (Math.random() * 90 + 5).toFixed(1);
    const size  = (0.8 + Math.random() * 1.2).toFixed(2);
    h.style.cssText = `--dur:${dur}s; --delay:${delay}s; --left:${left}%; font-size:${size}rem;`;
    endingHearts.appendChild(h);
  }
}

// ═══════════════════════════════════════════════════════
//  8. MUSIC
// ═══════════════════════════════════════════════════════
let musicPlaying = false;

function tryAutoplayMusic() {
  if (!bgMusic) return;
  bgMusic.volume = 0;
  bgMusic.play().then(() => {
    musicPlaying = true;
    updateMusicBtn();
    // Fade in
    fadeAudio(bgMusic, 0, 0.4, 3000);
  }).catch(() => {
    // Autoplay blocked — user must interact
    musicPlaying = false;
    updateMusicBtn();
  });
}

function fadeAudio(audio, from, to, duration) {
  audio.volume = from;
  const step = (to - from) / (duration / 50);
  const interval = setInterval(() => {
    audio.volume = Math.min(1, Math.max(0, audio.volume + step));
    if ((step > 0 && audio.volume >= to) || (step < 0 && audio.volume <= to)) {
      audio.volume = to;
      clearInterval(interval);
      if (to === 0) audio.pause();
    }
  }, 50);
}

function updateMusicBtn() {
  if (!musicBtn || !musicIcon) return;
  if (musicPlaying) {
    musicIcon.textContent = '♪';
    musicBtn.classList.remove('muted');
    musicBtn.title = 'Pause Music';
  } else {
    musicIcon.textContent = '⏸';
    musicBtn.classList.add('muted');
    musicBtn.title = 'Play Music';
  }
}

musicBtn?.addEventListener('click', () => {
  if (musicPlaying) {
    fadeAudio(bgMusic, bgMusic.volume, 0, 1200);
    musicPlaying = false;
  } else {
    bgMusic.play().then(() => {
      fadeAudio(bgMusic, 0, 0.4, 1200);
      musicPlaying = true;
    }).catch(() => {});
  }
  updateMusicBtn();
});

// ── KEYBOARD: space = music toggle, arrows = slideshow ─
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    musicBtn?.click();
  }
  if (e.code === 'ArrowRight') slideNext?.click();
  if (e.code === 'ArrowLeft')  slidePrev?.click();
});

// ── SMOOTH SECTION SCROLLING ─────────────────────────
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = $(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  runLoader();
});
