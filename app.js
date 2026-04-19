/* 
   Deutz Cymar Galila — Application Logic
*/

const HERO_WORKER_READY_TIMEOUT = 1500;

function initRevealEffects() {
    const revealTargets = document.querySelectorAll('section.container > *, .glass-card, .expertise-marquee > *');
    if (!revealTargets.length) return;

    revealTargets.forEach((target) => target.classList.add('js-reveal'));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
        revealTargets.forEach((target) => target.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealTargets.forEach((target) => observer.observe(target));
}

function startMainThreadHero(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particles = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
    }));

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#3b82f6';
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        });
        if (!reducedMotion) requestAnimationFrame(draw);
    }
    draw();
}

async function initHero() {
    const canvas = document.querySelector('#hero-canvas');
    if (!canvas) return;

    if (!('transferControlToOffscreen' in canvas) || !window.Worker) {
        startMainThreadHero(canvas);
        return;
    }

    try {
        const worker = new Worker('worker.js', { type: 'module' });
        const offscreen = canvas.transferControlToOffscreen();
        
        worker.postMessage({
            type: 'init',
            canvas: offscreen,
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: window.devicePixelRatio
        }, [offscreen]);

        window.addEventListener('resize', () => {
            worker.postMessage({ type: 'resize', width: window.innerWidth, height: window.innerHeight });
        });

        window.addEventListener('mousemove', (e) => {
            worker.postMessage({ type: 'mousemove', x: e.clientX, y: e.clientY });
        });
    } catch (e) {
        startMainThreadHero(canvas);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initRevealEffects();
    initHero();
});
