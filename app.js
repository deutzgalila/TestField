/* 
   Main Thread Application Script
   Handles Web Worker communication and canvas transfer
*/

async function init() {
    const canvas = document.querySelector('#hero-canvas');
    
    if (!canvas) return;

    // Feature Detection for OffscreenCanvas
    if (!('transferControlToOffscreen' in canvas)) {
        console.warn('OffscreenCanvas not supported in this browser. Falling back to main-thread rendering.');
        // Optional: Implement main-thread fallback or static background
        return;
    }

    const offscreen = canvas.transferControlToOffscreen();
    const worker = new Worker('worker.js', { type: 'module' });

    worker.addEventListener('error', (event) => {
        console.error('Hero worker failed to initialize.', event.message || event);
    });

    // Send the offscreen canvas to the worker
    worker.postMessage({
        type: 'init',
        canvas: offscreen,
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio
    }, [offscreen]);

    // Handle Resize
    window.addEventListener('resize', () => {
        worker.postMessage({
            type: 'resize',
            width: window.innerWidth,
            height: window.innerHeight
        });
    });

    // Handle Mouse Movements
    window.addEventListener('mousemove', (e) => {
        worker.postMessage({
            type: 'mousemove',
            x: e.clientX,
            y: e.clientY
        });
    });
}

function initRevealFallback() {
    if ('CSS' in window && CSS.supports('animation-timeline: view()')) {
        return;
    }

    const revealTargets = document.querySelectorAll('section.container > *, .glass-card');
    revealTargets.forEach((target) => target.classList.add('js-reveal'));

    if (!('IntersectionObserver' in window)) {
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
    }, { threshold: 0.15 });

    revealTargets.forEach((target) => observer.observe(target));
}

// Check for Reduced Motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!prefersReducedMotion.matches) {
    init();
} else {
    console.log('Reduced motion enabled: Hero animation disabled.');
}

initRevealFallback();
