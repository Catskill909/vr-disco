import { initScene } from './scene.js';
import { AudioSystem } from './audio-system.js';
import { VRControls } from './vr-controls.js';
import { VisualEffects } from './visual-effects.js'; // Reference: .agent/skills/threejs-shaders.md
import { Models } from './models.js';

// Configuration Object - Easy to tweak settings
export const CONFIG = {
    audio: {
        streamURL: 'https://supersoul.site:8000/OSS-320',
        metadataAPI: null, // Optional
        fftSize: 2048
    },
    platform: {
        size: 20,
        color: 0x111111,
        gridColor: 0x00ffff
    },
    lighting: {
        ambientIntensity: 0.2,
        spotlightIntensity: 2.0
    }
};

class App {
    constructor() {
        this.init();
    }

    async init() {
        console.log("Initializing Cosmic Club VR...");
        console.log("Using Skills from .agent/skills/...");

        // 1. Initialize 3D Scene (Reference: .agent/skills/threejs-fundamentals.md)
        const { scene, camera, renderer, userRig } = initScene(CONFIG);
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;

        // 2. Audio System
        this.audioSystem = new AudioSystem(CONFIG);
        this.audioSystem.init();

        // 3. VR Controls (Reference: .agent/skills/threejs-interaction.md)
        this.vrControls = new VRControls(renderer, scene, userRig);

        // 4. Visuals & Models (Reference: .agent/skills/threejs-shaders.md)
        this.visualEffects = new VisualEffects(scene, CONFIG);
        this.visualEffects.init();

        this.models = new Models(scene);
        this.models.init();

        // 5. Interaction for Audio Start (Overlay Handling)
        this.setupOverlay();

        // 6. Render Loop Update
        renderer.setAnimationLoop(() => {
            this.vrControls.update();
            this.visualEffects.update(this.audioSystem);
            this.renderer.render(this.scene, camera);
        });

        // Expose app to window for debuggingConsole
        window.app = this;
    }

    setupOverlay() {
        const overlay = document.getElementById('overlay');

        // Manual Start function
        const startApp = () => {
            console.log("Starting Audio & Experience...");
            this.audioSystem.startAudio();
            if (overlay) {
                overlay.classList.add('hidden');
                overlay.style.pointerEvents = 'none';
            }
        };

        if (overlay) {
            overlay.addEventListener('click', startApp);
        } else {
            console.warn("Overlay removed. Creating manual start button.");
            // Emergency Start Button
            const btn = document.createElement('button');
            btn.textContent = "🔊 START AUDIO";
            btn.style.position = 'fixed';
            btn.style.top = '10px';
            btn.style.left = '10px';
            btn.style.zIndex = '9999';
            btn.style.padding = '10px 20px';
            btn.style.background = '#00ffff';
            btn.style.border = 'none';
            btn.style.cursor = 'pointer';
            btn.onclick = () => {
                startApp();
                btn.remove();
            };
            document.body.appendChild(btn);
        }

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('debug')) {
            console.log("Debug mode: Auto-start");
            startApp();
        }
    }
}

// Start the app when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    new App();
});
