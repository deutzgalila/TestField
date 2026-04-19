/* 
   Deutz Cymar Galila — Graphics Worker
*/

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

let renderer, scene, camera, particles;
let mouseX = 0, mouseY = 0;
let width = 0, height = 0;

self.onmessage = function(e) {
    const data = e.data;
    switch(data.type) {
        case 'init': init(data); break;
        case 'resize': resize(data); break;
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

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(data.pixelRatio);

    const geometry = new THREE.BufferGeometry();
    const count = 3000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 12;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x3b82f6,
        size: 0.04,
        transparent: true,
        opacity: 0.8,
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
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
        const dx = mouseX * 5 - pos[i];
        const dy = mouseY * 5 - pos[i+1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2.5) {
            pos[i] += dx * 0.03;
            pos[i+1] += dy * 0.03;
        } else {
            pos[i] += (Math.random() - 0.5) * 0.01;
            pos[i+1] += (Math.random() - 0.5) * 0.01;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.rotation.y += 0.0015;
    renderer.render(scene, camera);
}

