/* 
   Main Thread Application Script
   Uses worker-based Three.js when available, with resilient main-thread canvas fallback.
*/

const HERO_WORKER_READY_TIMEOUT_MS = 1500;

function initRevealEffects() {
    const revealTargets = document.querySelectorAll('section.container > *, .glass-card');
    if (!revealTargets.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    revealTargets.forEach((target) => target.classList.add('js-reveal'));

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealTargets.forEach((target) => target.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.15 });

    revealTargets.forEach((target) => observer.observe(target));
}

function startMainThreadHero(canvas) {
    const context = canvas.getContext('2d');
    if (!context) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particleCount = prefersReducedMotion ? 80 : 140;
    const mouse = { x: -9999, y: -9999 };

    const particles = Array.from({ length: particleCount }, () => ({
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 0.8
    }));

    function resize() {
        canvas.width = Math.floor(canvas.clientWidth * window.devicePixelRatio);
        canvas.height = Math.floor(canvas.clientHeight * window.devicePixelRatio);
        context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
        particles.forEach((p) => {
            p.x = Math.random() * canvas.clientWidth;
            p.y = Math.random() * canvas.clientHeight;
        });
    }

    function draw() {
        context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        context.fillStyle = 'rgba(59, 130, 246, 0.7)';

        for (const p of particles) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const distSq = dx * dx + dy * dy;

            if (!prefersReducedMotion && distSq < 18000) {
                p.vx += dx * 0.00002;
                p.vy += dy * 0.00002;
            }

            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.99;
            p.vy *= 0.99;

            if (p.x <= 0 || p.x >= canvas.clientWidth) p.vx *= -1;
            if (p.y <= 0 || p.y >= canvas.clientHeight) p.vy *= -1;

            context.beginPath();
            context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            context.fill();
        }

        if (!prefersReducedMotion) {
            requestAnimationFrame(draw);
        }
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    resize();
    draw();
}

function waitForWorkerReady(worker) {
    return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => {
            cleanup();
            reject(new Error('Worker readiness timeout'));
        }, HERO_WORKER_READY_TIMEOUT_MS);

        const onMessage = (event) => {
            if (event.data?.type !== 'worker-ready') return;
            cleanup();
            resolve();
        };

        const onError = () => {
            cleanup();
            reject(new Error('Worker failed to load'));
        };

        function cleanup() {
            window.clearTimeout(timeout);
            worker.removeEventListener('message', onMessage);
            worker.removeEventListener('error', onError);
        }

        worker.addEventListener('message', onMessage);
        worker.addEventListener('error', onError);
    });
}

async function initHeroEffect() {
    const canvas = document.querySelector('#hero-canvas');
    if (!canvas) return;

    if (!('transferControlToOffscreen' in canvas) || !window.Worker) {
        startMainThreadHero(canvas);
        return;
    }

    let worker;
    try {
        worker = new Worker('worker.js', { type: 'module' });
        await waitForWorkerReady(worker);
    } catch (error) {
        if (worker) worker.terminate();
        console.warn('Falling back to main-thread hero effect.', error.message);
        startMainThreadHero(canvas);
        return;
    }

    const offscreen = canvas.transferControlToOffscreen();

    worker.addEventListener('error', (event) => {
        console.error('Hero worker runtime error.', event.message || event);
    });

    worker.postMessage({
        type: 'init',
        canvas: offscreen,
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio
    }, [offscreen]);

    window.addEventListener('resize', () => {
        worker.postMessage({
            type: 'resize',
            width: window.innerWidth,
            height: window.innerHeight
        });
    });

    window.addEventListener('mousemove', (event) => {
        worker.postMessage({
            type: 'mousemove',
            x: event.clientX,
            y: event.clientY
        });
    });
}

initRevealEffects();
initHeroEffect();
