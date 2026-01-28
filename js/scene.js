import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { NebulaShader } from './nebula-shader.js';

export function initScene(config) {
    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    // Fog for depth (Reduced for sky visibility)
    scene.fog = new THREE.FogExp2(0x050510, 0.005);

    // 2. Camera & User Rig
    const userRig = new THREE.Group();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);
    userRig.add(camera);
    scene.add(userRig);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Monitoring Stability (CRITICAL for VR/Heavy scenes)
    renderer.domElement.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        console.error('❌ CRITICAL: WebGL Context Lost! The machine is likely out of memory or the GPU driver crashed.');
        if (window.app) window.app.isContextLost = true;
    }, false);

    renderer.domElement.addEventListener('webglcontextrestored', () => {
        console.warn('🔄 WebGL Context Restored. Attempting to resume...');
        if (window.app) window.app.isContextLost = false;
    }, false);

    document.body.appendChild(VRButton.createButton(renderer));

    // Desktop Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.6, 0);
    controls.update();

    // 4. Lighting
    setupLighting(scene, config);

    // 5. Environment (Skybox)
    createEnvironment(scene, config);

    window.addEventListener('resize', onWindowResize);

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    return { scene, camera, renderer, userRig, skybox: null };
}

function setupLighting(scene, config) {
    const ambient = new THREE.AmbientLight(0xffffff, config.lighting.ambientIntensity);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xaaccff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const stageSpot = new THREE.SpotLight(0xff00ff, config.lighting.spotlightIntensity);
    stageSpot.position.set(0, 10, -5);
    stageSpot.angle = Math.PI / 6;
    stageSpot.penumbra = 0.5;
    stageSpot.castShadow = true;
    scene.add(stageSpot);
}

function createEnvironment(scene) {
    // STANDARD SKYBOX: Generated Starfield Texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Space Base
    ctx.fillStyle = '#020205';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Random Stars
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 1.5;
        const opacity = Math.random();
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;

    scene.background = texture;
    console.log("🌌 Standard Equirectangular Starfield set as scene.background.");

    return { skybox: null };
}
