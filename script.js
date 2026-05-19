/* ════════════════════════════════════════════════
   script.js — Gothic Anniversary Site
════════════════════════════════════════════════ */

'use strict';

/* ────────────────────────────────────────────
   1. CUSTOM CURSOR
──────────────────────────────────────────── */
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');

let mX = window.innerWidth / 2;
let mY = window.innerHeight / 2;
let tX = mX, tY = mY;

document.addEventListener('mousemove', e => {
  mX = e.clientX;
  mY = e.clientY;
  cursor.style.left = mX + 'px';
  cursor.style.top  = mY + 'px';
});

(function trailLoop() {
  tX += (mX - tX) * 0.13;
  tY += (mY - tY) * 0.13;
  cursorTrail.style.left = tX + 'px';
  cursorTrail.style.top  = tY + 'px';
  requestAnimationFrame(trailLoop);
})();

document.querySelectorAll(
  'a, button, .envelope, .gal-frame, .gothic-btn, .lb-close'
).forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

/* ────────────────────────────────────────────
   2. CANVAS SETUP
──────────────────────────────────────────── */
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/* ────────────────────────────────────────────
   3. GOLDEN PARTICLES
──────────────────────────────────────────── */
class Particle {
  constructor() { this.init(true); }

  init(scatter = false) {
    this.x     = scatter ? Math.random() * canvas.width : Math.random() * canvas.width;
    this.y     = scatter ? Math.random() * canvas.height : canvas.height + 10;
    this.r     = Math.random() * 1.8 + 0.4;
    this.vx    = (Math.random() - 0.5) * 0.25;
    this.vy    = -(Math.random() * 0.45 + 0.08);
    this.alpha = Math.random() * 0.55 + 0.08;
    this.life  = Math.random() * 320 + 80;
    this.maxL  = this.life;
    this.gold  = Math.random() > 0.42;
  }

  step() {
    this.x += this.vx;
    this.y += this.vy + Math.sin(this.life * 0.04) * 0.08;
    this.life--;
    if (this.life <= 0 || this.y < -8) this.init();
  }

  draw() {
    const a = this.alpha * (this.life / this.maxL);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.gold
      ? `rgba(212,175,55,${a})`
      : `rgba(160,20,20,${a * 0.7})`;
    ctx.fill();
  }
}

const PART_COUNT = 70;
const particles  = Array.from({ length: PART_COUNT }, () => new Particle());

/* ────────────────────────────────────────────
   4. BAT ENTITIES
──────────────────────────────────────────── */
class Bat {
  constructor(scattered = false) {
    this.reset(scattered);
  }

  reset(scattered = false) {
    this.x       = scattered ? Math.random() * canvas.width : -70;
    this.y       = Math.random() * canvas.height * 0.72 + 40;
    this.baseY   = this.y;
    this.vx      = Math.random() * 1.3 + 0.6;
    this.wing    = Math.random() * Math.PI * 2;
    this.ws      = Math.random() * 0.12 + 0.08;
    this.sz      = Math.random() * 0.45 + 0.45;
    this.amp     = Math.random() * 38 + 18;
    this.phase   = Math.random() * Math.PI * 2;
    this.opacity = Math.random() * 0.35 + 0.1;
  }

  step() {
    this.x    += this.vx;
    this.wing += this.ws;
    this.y     = this.baseY + Math.sin(this.wing * 0.48 + this.phase) * this.amp;
    if (this.x > canvas.width + 80) this.reset();
  }

  draw() {
    const flap = Math.sin(this.wing);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.sz, this.sz);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = '#120808';

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 3, 0);
      ctx.bezierCurveTo(
        side * 18, -22 * (1 + flap * 0.6),
        side * 30, -6 * (1 + flap * 0.4),
        side * 32, 6
      );
      ctx.bezierCurveTo(
        side * 22, 10,
        side * 12, 10 * (1 + flap * 0.35),
        side * 3, 2
      );
      ctx.fill();
    }

    // Ears
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 2.5, -2.5);
      ctx.lineTo(side * 5, -9);
      ctx.lineTo(side * 1.5, -3.5);
      ctx.closePath();
      ctx.fill();
    }

    // Eyes (tiny red dots)
    ctx.fillStyle = 'rgba(160,20,20,0.85)';
    ctx.beginPath();
    ctx.arc(-2, -1, 0.8, 0, Math.PI * 2);
    ctx.arc(2, -1, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

const BAT_COUNT = 7;
const bats      = Array.from({ length: BAT_COUNT }, () => new Bat(true));

/* ────────────────────────────────────────────
   5. SMOKE WISPS
──────────────────────────────────────────── */
class Smoke {
  constructor() { this.reset(); }

  reset() {
    this.x     = Math.random() * canvas.width;
    this.y     = canvas.height + 30;
    this.r     = Math.random() * 55 + 25;
    this.vx    = (Math.random() - 0.5) * 0.3;
    this.vy    = -(Math.random() * 0.22 + 0.06);
    this.rot   = Math.random() * Math.PI * 2;
    this.rotV  = (Math.random() - 0.5) * 0.008;
    this.alpha = Math.random() * 0.038 + 0.008;
    this.life  = Math.random() * 380 + 160;
    this.maxL  = this.life;
  }

  step() {
    this.x   += this.vx;
    this.y   += this.vy;
    this.r   += 0.18;
    this.rot += this.rotV;
    this.life--;
    if (this.life <= 0) this.reset();
  }

  draw() {
    const a = this.alpha * (this.life / this.maxL);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.r);
    g.addColorStop(0,   `rgba(90,50,15,${a})`);
    g.addColorStop(0.6, `rgba(50,25,8,${a * 0.5})`);
    g.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const SMOKE_COUNT = 22;
const smokes      = Array.from({ length: SMOKE_COUNT }, () => new Smoke());

/* ────────────────────────────────────────────
   6. ANIMATION LOOP
──────────────────────────────────────────── */
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  smokes.forEach(s => { s.step(); s.draw(); });
  particles.forEach(p => { p.step(); p.draw(); });
  bats.forEach(b => { b.step(); b.draw(); });

  requestAnimationFrame(loop);
}
loop();

/* ────────────────────────────────────────────
   7. ANNIVERSARY DATE
   ★ Edit the date below to your anniversary ★
──────────────────────────────────────────── */
const ANNIVERSARY = new Date(2024, 0, 1); // Jan 1, 2024

(function setDate() {
  const el = document.getElementById('anniversaryDate');
  if (!el) return;
  const d  = String(ANNIVERSARY.getDate()).padStart(2, '0');
  const m  = String(ANNIVERSARY.getMonth() + 1).padStart(2, '0');
  const y  = ANNIVERSARY.getFullYear();
  el.textContent = `${d} / ${m} / ${y}`;
})();

/* ────────────────────────────────────────────
   8. SCROLL PARALLAX (hero title only)
──────────────────────────────────────────── */
const heroTitle = document.querySelector('.main-title');

window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  if (heroTitle) {
    heroTitle.style.transform = `translateY(${sy * 0.14}px)`;
    heroTitle.style.opacity   = Math.max(0, 1 - sy / 560);
  }
}, { passive: true });

/* ────────────────────────────────────────────
   9. INTERSECTION OBSERVER — FADE IN
──────────────────────────────────────────── */
const ioFade = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      ioFade.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.msg-card, .gal-frame, .section-header, .spotify-vessel, .letter-stage').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.1}s`;
  ioFade.observe(el);
});

/* ────────────────────────────────────────────
   10. MESSAGE CARD staggered reveal
──────────────────────────────────────────── */
document.querySelectorAll('.msg-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.18}s`;
});

/* ────────────────────────────────────────────
   11. GALLERY — LIGHTBOX
──────────────────────────────────────────── */
const lightbox  = document.getElementById('lightbox');
const lbContent = document.getElementById('lbContent');
const lbCaption = document.getElementById('lbCaption');

function openLightbox(frame, caption) {
  const imgEl = frame.querySelector('img');

  if (imgEl) {
    lbContent.innerHTML = `<img src="${imgEl.src}" alt="${caption}" style="max-width:70vw;max-height:65vh;object-fit:contain;display:block;">`;
  } else {
    const ph = frame.querySelector('.photo-placeholder-inner');
    lbContent.innerHTML = ph
      ? ph.innerHTML
      : `<p style="font-style:italic;color:var(--text-parch);font-size:1rem;">${caption}</p>`;
  }

  lbCaption.textContent = `✦ ${caption} ✦`;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

/* ────────────────────────────────────────────
   12. ENVELOPE → LETTER REVEAL
──────────────────────────────────────────── */
let letterRevealed = false;

function triggerLetter() {
  if (letterRevealed) return;
  letterRevealed = true;

  const envelope = document.getElementById('envelope');
  const parchment = document.getElementById('parchmentWrap');

  envelope.classList.add('is-open');

  // Step 1: flap opens (CSS transition ~1.1s)
  // Step 2: seal fades
  setTimeout(() => {
    const sealGroup = document.getElementById('envSealGroup');
    if (sealGroup) {
      sealGroup.style.transition = 'opacity 0.5s ease';
      sealGroup.style.opacity = '0';
    }
  }, 600);

  // Step 3: envelope shrinks out, parchment unfurls
  setTimeout(() => {
    envelope.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    envelope.style.opacity    = '0';
    envelope.style.transform  = 'translateY(-30px) scale(0.88)';
  }, 1400);

  setTimeout(() => {
    envelope.style.display = 'none';
    parchment.style.display = 'block';

    // Force reflow then animate
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        parchment.classList.add('unrolled');
      });
    });
  }, 2050);
}

/* ────────────────────────────────────────────
   13. CANDLE FLICKER — stagger variation
──────────────────────────────────────────── */
document.querySelectorAll('.candle-flame').forEach((flame, i) => {
  const dur  = (1.2 + i * 0.27).toFixed(2);
  const del  = flame.style.animationDelay || '0s';
  flame.style.animationDuration = dur + 's';
  flame.style.animationDelay    = del;
});

/* ────────────────────────────────────────────
   14. HOVER GLOW ON SECTION HEADINGS
──────────────────────────────────────────── */
document.querySelectorAll('.section-title').forEach(title => {
  title.addEventListener('mouseenter', () => {
    title.style.textShadow =
      '0 0 45px rgba(212,175,55,0.55), 0 0 80px rgba(212,175,55,0.2), 2px 2px 6px rgba(0,0,0,0.9)';
  });
  title.addEventListener('mouseleave', () => {
    title.style.textShadow =
      '0 0 28px rgba(212,175,55,0.35), 2px 2px 6px rgba(0,0,0,0.9)';
  });
});

/* ────────────────────────────────────────────
   15. PERIODIC RANDOM BAT BURST
──────────────────────────────────────────── */
function releaseBat() {
  // Reset one random bat from off-screen left
  const b   = bats[Math.floor(Math.random() * bats.length)];
  b.x       = -70;
  b.y       = Math.random() * canvas.height * 0.65 + 60;
  b.baseY   = b.y;
  b.vx      = Math.random() * 1.6 + 0.7;
  b.opacity = Math.random() * 0.5 + 0.15;
}

setInterval(releaseBat, 4200);

/* ────────────────────────────────────────────
   16. SUBTLE PAGE LOAD ANIMATION
──────────────────────────────────────────── */
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 1.4s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });
});
