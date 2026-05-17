/* =============================================================
   script.js — Site Romântico de Aniversário
   Funcionalidades:
   - Partículas de fundo (canvas)
   - Animações de entrada com fade-in no hero
   - Scroll reveal para todas as seções
   - Botão "Começar" com scroll suave
   - Pétalas caindo na seção final
   - Cursor personalizado (sutil)
   ============================================================= */

/* ─── 1. INICIALIZAÇÃO ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHeroAnimations();
  initParticles();
  initScrollReveal();
  initStartButton();
  initPetals();
  initCursor();
});

/* ─── 2. ANIMAÇÕES DO HERO ──────────────────────────────────── */
/**
 * Dispara as animações da tela inicial assim que a página carrega.
 * Os elementos com .fade-in-up recebem a classe .animated em sequência.
 */
function initHeroAnimations() {
  const elements = document.querySelectorAll('.fade-in-up');
  // Pequeno delay inicial para garantir que o CSS já foi aplicado
  setTimeout(() => {
    elements.forEach(el => el.classList.add('animated'));
  }, 100);
}

/* ─── 3. BOTÃO "COMEÇAR" ────────────────────────────────────── */
/**
 * Ao clicar no botão da hero section, rola suavemente para a seção de mensagens.
 */
function initStartButton() {
  const btn = document.getElementById('start-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const nextSection = document.getElementById('messages');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

/* ─── 4. SCROLL REVEAL ──────────────────────────────────────── */
/**
 * Usa IntersectionObserver para revelar elementos .reveal
 * quando eles entram na viewport.
 */
function initScrollReveal() {
  const revealItems = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Uma vez revelado, não precisa mais observar
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -60px 0px', // Aciona 60px antes de entrar na viewport
      threshold: 0.1
    }
  );

  revealItems.forEach(item => observer.observe(item));
}

/* ─── 5. PARTÍCULAS DE FUNDO (CANVAS) ───────────────────────── */
/**
 * Cria partículas flutuantes sutis no canvas de fundo.
 * São pequenos pontos brancos/prateados que se movem lentamente,
 * criando uma atmosfera etérea.
 *
 * 🌹 Você pode ajustar:
 *    - PARTICLE_COUNT: quantidade de partículas (padrão: 80)
 *    - colors: cores das partículas
 *    - speed range: velocidade de movimento
 */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // ── Configurações das partículas ──
  const PARTICLE_COUNT = 80;
  const colors = [
    'rgba(192, 184, 200, 0.5)', // prata
    'rgba(240, 236, 232, 0.4)', // pérola
    'rgba(139, 0, 0, 0.4)',     // vermelho vinho
    'rgba(255, 255, 255, 0.3)', // branco suave
  ];

  let particles = [];
  let width, height;

  // Redimensiona canvas ao iniciar e ao redimensionar janela
  function resize() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  // Cria uma partícula com valores aleatórios
  function createParticle() {
    return {
      x:      Math.random() * width,
      y:      Math.random() * height,
      r:      Math.random() * 1.5 + 0.3,        // raio entre 0.3 e 1.8
      color:  colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 0.25,     // movimento horizontal lento
      speedY: (Math.random() - 0.5) * 0.25,     // movimento vertical lento
      opacity: Math.random() * 0.6 + 0.2,
      pulse:  Math.random() * Math.PI * 2,       // fase inicial aleatória para pulsar
    };
  }

  // Popula o array de partículas
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle());
  }

  // Loop de animação principal
  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      // Pulso de opacidade suave
      p.pulse += 0.01;
      const currentOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));

      // Desenha a partícula
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${currentOpacity})`);
      ctx.fill();

      // Move a partícula
      p.x += p.speedX;
      p.y += p.speedY;

      // Rebate nas bordas com margem
      const margin = 10;
      if (p.x < -margin || p.x > width + margin)  p.speedX *= -1;
      if (p.y < -margin || p.y > height + margin)  p.speedY *= -1;
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ─── 6. PÉTALAS CAINDO (SEÇÃO FINAL) ──────────────────────── */
/**
 * Quando a seção final entra na viewport, pétalas de rosa
 * começam a cair. São emojis com animação CSS aleatória.
 *
 * 🌹 Você pode ajustar:
 *    - petals: emojis usados
 *    - TOTAL: quantidade de pétalas
 *    - intervalTime: velocidade de geração (ms)
 */
function initPetals() {
  const finale   = document.getElementById('finale');
  const container = document.getElementById('petals');
  if (!finale || !container) return;

  const PETALS_SYMBOLS = ['🌹', '🥀', '✦', '·', '❋'];
  const TOTAL = 20; // total de pétalas geradas
  let count = 0;
  let interval = null;
  let triggered = false;

  function spawnPetal() {
    if (count >= TOTAL) {
      clearInterval(interval);
      return;
    }

    const el = document.createElement('span');
    el.className = 'petal';

    // Escolhe emoji aleatório (mais probabilidade para pontos discretos)
    const symbols = ['·', '·', '·', '✦', '✦', '🥀', '🌹'];
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    // Posição horizontal aleatória
    el.style.left = `${Math.random() * 100}%`;

    // Deriva horizontal (CSS variable usada na keyframe)
    const drift = (Math.random() - 0.5) * 200;
    el.style.setProperty('--drift', `${drift}px`);

    // Duração e delay aleatórios
    const duration = 4 + Math.random() * 6;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay    = `${Math.random() * 1.5}s`;

    // Tamanho aleatório
    el.style.fontSize = `${0.6 + Math.random() * 1}rem`;
    el.style.opacity  = '0';

    container.appendChild(el);
    count++;

    // Remove do DOM após animação
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  // Observa quando a seção final aparece
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !triggered) {
        triggered = true;
        interval = setInterval(spawnPetal, 300);
        observer.unobserve(finale);
      }
    },
    { threshold: 0.3 }
  );

  observer.observe(finale);
}

/* ─── 7. CURSOR PERSONALIZADO (SUTIL) ───────────────────────── */
/**
 * Adiciona um leve rastro ao cursor em elementos interativos,
 * mantendo elegância sem exagero.
 * Desativado em dispositivos touch.
 */
function initCursor() {
  // Não ativa em touch
  if ('ontouchstart' in window) return;

  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    width: 6px;
    height: 6px;
    background: rgba(139, 0, 0, 0.7);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: transform 0.15s ease, opacity 0.3s ease, background 0.3s ease;
    mix-blend-mode: screen;
  `;
  document.body.appendChild(cursor);

  const ring = document.createElement('div');
  ring.style.cssText = `
    position: fixed;
    width: 28px;
    height: 28px;
    border: 1px solid rgba(139, 0, 0, 0.35);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%);
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                width 0.35s ease, height 0.35s ease,
                border-color 0.3s ease;
  `;
  document.body.appendChild(ring);

  let mx = 0, my = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = `${mx}px`;
    cursor.style.top  = `${my}px`;
    // Ring segue com pequeno atraso (feito via transition CSS)
    ring.style.left   = `${mx}px`;
    ring.style.top    = `${my}px`;
  });

  // Expande o ring em elementos clicáveis
  document.querySelectorAll('a, button, .message-card, .gallery-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width  = '50px';
      ring.style.height = '50px';
      ring.style.borderColor = 'rgba(139, 0, 0, 0.6)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width  = '28px';
      ring.style.height = '28px';
      ring.style.borderColor = 'rgba(139, 0, 0, 0.35)';
    });
  });

  // Oculta cursor padrão nas áreas principais
  document.documentElement.style.cursor = 'none';
}

/* ─── 8. EFEITO DE DIGITAÇÃO NA HERO (opcional) ─────────────── */
/**
 * 🌹 EXTRA OPCIONAL: Se quiser que o nome da amada apareça
 * com efeito de digitação, descomente o código abaixo
 * e adicione o id="hero-name" ao elemento h1 no HTML.
 *
 * Certifique-se de alterar o texto DENTRO do código abaixo
 * para o nome correto se usá-lo.

function typewriterEffect(elementId, text, speed = 100) {
  const el = document.getElementById(elementId);
  if (!el) return;

  el.textContent = '';
  let i = 0;

  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  // Aguarda a animação de entrada antes de começar
  setTimeout(type, 1500);
}

// Chame assim:
// typewriterEffect('hero-name', 'Beatriz', 120);
*/

/* ─── 9. PARALLAX SUAVE NO HERO ─────────────────────────────── */
/**
 * Leve efeito de parallax no scroll — move o conteúdo hero
 * mais devagar que a página, criando profundidade.
 */
(function initParallax() {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroH   = document.getElementById('hero')?.offsetHeight || 0;

        if (scrollY < heroH) {
          heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
          heroContent.style.opacity   = `${1 - scrollY / (heroH * 0.8)}`;
        }

        ticking = false;
      });
      ticking = true;
    }
  });
})();
