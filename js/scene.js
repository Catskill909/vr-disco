import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function initScene(config) {
    // 1. Scene Setup (Reference: .agent/skills/threejs-fundamentals.md)
    const scene = new THREE.Scene();
    // Deep space background color (fog will blend into this)
    scene.background = new THREE.Color(0x050510);
    // Fog for depth (Reference: .agent/skills/threejs-fundamentals.md - Scene section)
    scene.fog = new THREE.FogExp2(0x050510, 0.02);

    // 2. Camera & User Rig (Required for Teleportation)
    const userRig = new THREE.Group();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5); // Default non-VR view
    userRig.add(camera);
    scene.add(userRig);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // VR Requirement: Enable XR
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Add VR Button
    document.body.appendChild(VRButton.createButton(renderer));

    // Desktop Controls (Fallback)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.6, 0);
    controls.update();

    // 4. Lighting (from Lighting Skill)
    setupLighting(scene, config);

    // 5. Basic Environment (Temporary Dance Floor)
    createEnvironment(scene, config);

    // 6. Loop
    renderer.setAnimationLoop(function () {
        // Update logic here (visuals, etc.)

        renderer.render(scene, camera);
    });

    // Handle Resize
    window.addEventListener('resize', onWindowResize);

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    return { scene, camera, renderer, userRig };
}

function setupLighting(scene, config) {
    // Ambient - Base visibility
    const ambient = new THREE.AmbientLight(0xffffff, config.lighting.ambientIntensity);
    scene.add(ambient);

    // Directional - "Moonlight" or Cosmic source
    const dirLight = new THREE.DirectionalLight(0xaaccff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Spotlights for the stage (Dynamic)
    const stageSpot = new THREE.SpotLight(0xff00ff, config.lighting.spotlightIntensity);
    stageSpot.position.set(0, 10, -5);
    stageSpot.angle = Math.PI / 6;
    stageSpot.penumbra = 0.5;
    stageSpot.castShadow = true;
    scene.add(stageSpot);

    // Add a helper just to see it initially (remove later)
    // const spotLightHelper = new THREE.SpotLightHelper( stageSpot );
    // scene.add( spotLightHelper );
}

function createEnvironment(scene, config) {
    // Basic Platform
    const geometry = new THREE.CylinderGeometry(config.platform.size, config.platform.size, 0.2, 32);
    const material = new THREE.MeshStandardMaterial({
        color: config.platform.color,
        roughness: 0.2,
        metalness: 0.8
    });
    const platform = new THREE.Mesh(geometry, material);
    platform.position.y = -0.1; // Just below feet
    scene.add(platform);

    // Grid helper for "Tron" look
    const gridHelper = new THREE.GridHelper(config.platform.size * 2, 40, config.platform.gridColor, 0x444444);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Starfield (Simple Points)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 5000;
    const posArray = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100; // Spread across 100 units
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMat = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
}
