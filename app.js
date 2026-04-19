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

// Check for Reduced Motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!prefersReducedMotion.matches) {
    init();
} else {
    console.log('Reduced motion enabled: Hero animation disabled.');
}
