import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { NebulaShader } from './nebula-shader.js';

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
    const envData = createEnvironment(scene, config) || {};

    // 6. Loop
    renderer.setAnimationLoop(function () {
        if (envData.skybox) {
            envData.skybox.material.uniforms.time.value += 0.01;
        }

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
    // Environment setup is now handled in visual-effects.js
    // We only handle the skybox here


    // Nebula Skybox (Custom Shader)
    const skyGeo = new THREE.SphereGeometry(1000, 60, 40); // Large sphere
    const skyMat = new THREE.ShaderMaterial({
        vertexShader: NebulaShader.vertexShader,
        fragmentShader: NebulaShader.fragmentShader,
        uniforms: {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        },
        side: THREE.BackSide
    });

    const skybox = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skybox);
    console.log("Custom Nebula Shader added to scene.");

    return { skybox };
}
