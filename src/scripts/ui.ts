// DOM interactions layered over the WebGL scene: reveals, tilt cards, magnetic buttons,
// cursor glow, counters, name scramble and scroll progress.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

export function initUI() {
  revealOnScroll();
  counters();
  scrollProgress();
  activeNav();
  if (!reduceMotion) scramble();
  if (finePointer && !reduceMotion) {
    tiltCards();
    magnetic();
    cursor();
  }
}

function revealOnScroll() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  );
  els.forEach((el) => io.observe(el));
}

function counters() {
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      io.unobserve(el);
      const target = Number(el.dataset.count);
      const start = performance.now();
      const dur = reduceMotion ? 1 : 1400;
      const step = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  });
  els.forEach((el) => io.observe(el));
}

function scrollProgress() {
  const bar = document.querySelector<HTMLElement>('.progress');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function activeNav() {
  const links = document.querySelectorAll<HTMLAnchorElement>('.nav-links a[href^="#"]');
  const map = new Map<string, HTMLAnchorElement>();
  links.forEach((a) => map.set(a.getAttribute('href')!.slice(1), a));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove('active'));
          map.get(e.target.id)?.classList.add('active');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  map.forEach((_, id) => {
    const s = document.getElementById(id);
    if (s) io.observe(s);
  });
}

function scramble() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/{}#*';
  document.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el, idx) => {
    const final = el.textContent ?? '';
    let frame = 0;
    const total = 28 + idx * 8;
    const run = () => {
      el.textContent = final
        .split('')
        .map((ch, i) => (i < (frame / total) * final.length ? ch : chars[Math.floor(Math.random() * chars.length)]))
        .join('');
      if (++frame <= total) requestAnimationFrame(run);
      else el.textContent = final;
    };
    setTimeout(run, 350 + idx * 150);
  });
}

function tiltCards() {
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
    const max = Number(card.dataset.tilt) || 10;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', `${(0.5 - y) * max}deg`);
      card.style.setProperty('--ry', `${(x - 0.5) * max}deg`);
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

function magnetic() {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });
}

function cursor() {
  const dot = document.querySelector<HTMLElement>('.cursor-dot');
  const ring = document.querySelector<HTMLElement>('.cursor-ring');
  if (!dot || !ring) return;
  document.documentElement.classList.add('has-cursor');
  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let rx = x;
  let ry = y;
  window.addEventListener(
    'pointermove',
    (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    },
    { passive: true },
  );
  const loop = () => {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.querySelectorAll('a, button, [data-tilt]').forEach((el) => {
    el.addEventListener('pointerenter', () => ring.classList.add('hover'));
    el.addEventListener('pointerleave', () => ring.classList.remove('hover'));
  });
}
