/* 
   Deutz Cymar Galila — Application Logic
*/

function initRevealEffects() {
    const revealTargets = document.querySelectorAll('section:not(#hero) > *, .glass-card, .expertise-marquee > *');
    if (!revealTargets.length) return;

    revealTargets.forEach((target) => {
        if (!target.closest('#hero')) {
            target.classList.add('js-reveal');
        }
    });

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

    revealTargets.forEach((target) => {
        if (target.classList.contains('js-reveal')) {
            observer.observe(target);
        }
    });
}

function startMainThreadHero(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (width === 0 || height === 0) return;

        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    window.addEventListener('resize', resize);
    resize();

    const particles = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 1
    }));

    const mouse = { x: -1000, y: -1000 };
    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    function draw() {
        if (canvas.clientWidth === 0) return requestAnimationFrame(draw);

        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';

        particles.forEach(p => {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
                p.vx += dx * 0.0001;
                p.vy += dy * 0.0001;
            }

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.clientWidth) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.clientHeight) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        if (!reducedMotion) requestAnimationFrame(draw);
    }
    draw();
}

async function initHero() {
    const canvas = document.querySelector('#hero-canvas');
    if (!canvas) return;

    // Force visibility and check dimensions
    canvas.style.opacity = '1';
    canvas.style.visibility = 'visible';
    canvas.style.display = 'block';

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

// Ensure layout is fully settled before initializing hero
if (document.readyState === 'complete') {
    initRevealEffects();
    initHero();
} else {
    window.addEventListener('load', () => {
        initRevealEffects();
        initHero();
    });
}
