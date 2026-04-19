/* 
   Web Worker Script
   Contains Three.js rendering logic off-main-thread
*/

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

let renderer, scene, camera, particles;
let mouseX = 0, mouseY = 0;
let width = 0, height = 0;

self.postMessage({ type: 'worker-ready' });

self.onmessage = function(e) {
    const data = e.data;
    
    switch(data.type) {
        case 'init':
            init(data);
            break;
        case 'resize':
            resize(data);
            break;
        case 'mousemove':
            mouseX = (data.x / width) * 2 - 1;
            mouseY = -(data.y / height) * 2 + 1;
            break;
    }
};

function init(data) {
    const canvas = data.canvas;
    width = data.width;
    height = data.height;

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(data.pixelRatio);

    // Particle Force-Field Concept
    const geometry = new THREE.BufferGeometry();
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
        velocities[i] = (Math.random() - 0.5) * 0.02;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x3b82f6, // --blue-500
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    animate();
}

function resize(data) {
    width = data.width;
    height = data.height;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
}

function animate() {
    requestAnimationFrame(animate);

    const positions = particles.geometry.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 3) {
        // Gentle rotation
        const x = positions[i];
        const y = positions[i+1];
        
        // Interaction: Simple attract to mouse
        const dx = mouseX * 5 - x;
        const dy = mouseY * 5 - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 2) {
            positions[i] += dx * 0.02;
            positions[i+1] += dy * 0.02;
        } else {
            // Drift back / brownian motion
            positions[i] += (Math.random() - 0.5) * 0.01;
            positions[i+1] += (Math.random() - 0.5) * 0.01;
        }
    }
    
    particles.geometry.attributes.position.needsUpdate = true;
    particles.rotation.y += 0.001;
    
    renderer.render(scene, camera);
}
