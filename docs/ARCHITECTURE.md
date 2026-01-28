# VR Dance Platform Implementation Plan

## Goal Description
Create a WebXR-based virtual reality dance club in outer space using Three.js. The app will stream live audio from an AzuraCast server and feature an immersive, audio-reactive environment compatible with Meta Quest headsets.

## User Review Required
> [!IMPORTANT]
> - **Audio Streaming**: Cross-Origin Resource Sharing (CORS) might be an issue with some AzuraCast servers. We may need a proxy or specific server configuration.
> - **Performance**: Targeting 72fps+ on standalone headsets requires strict polygon and texture management.

## Proposed Changes

### Project Structure
Directory structure as requested:
```
/project
├── index.html
├── /js
│   ├── main.js
│   ├── scene.js
│   ├── vr-controls.js
│   ├── audio-system.js
│   ├── visual-effects.js
│   └── models.js
├── /assets (created as needed)
└── /css
    └── styles.css
```

### Core Technologies
- **Three.js**: Loaded via CDN (ES modules) or local build. using CDN for simplicity as requested "Single HTML file OR modular project structure". Modular structure is preferred for maintainability.

### [Phase 1] Core Setup & Environment
#### [NEW] [index.html](file:///Users/paulhenshaw/Desktop/vr-dance/index.html)
- Main entry point.
- Loads Three.js and module scripts.
- "Enter VR" UI overlay.

#### [NEW] [js/main.js](file:///Users/paulhenshaw/Desktop/vr-dance/js/main.js)
- App orchestration.
- Config object definition.

#### [NEW] [js/scene.js](file:///Users/paulhenshaw/Desktop/vr-dance/js/scene.js)
- Scene setup, camera, renderer loop.
- Starfield background and Lighting.
- Basic platform geometry.

### [Phase 2] VR Interactions
#### [NEW] [js/vr-controls.js](file:///Users/paulhenshaw/Desktop/vr-dance/js/vr-controls.js)
- WebXR session handling.
- Controller input mapping.
- Teleportation logic.

### [Phase 3] Audio System
#### [NEW] [js/audio-system.js](file:///Users/paulhenshaw/Desktop/vr-dance/js/audio-system.js)
- HTML5 Audio or Web Audio API loader for stream.
- AnalyserNode setup for FFT data.
- State management (playing/paused/connecting).

### [Phase 4] Visual Effects & Polish
#### [NEW] [js/visual-effects.js](file:///Users/paulhenshaw/Desktop/vr-dance/js/visual-effects.js)
- Particle systems.
- Shader materials for audio reactivity (if needed).
- Laser system.

#### [NEW] [js/models.js](file:///Users/paulhenshaw/Desktop/vr-dance/js/models.js)
- Procedural generation of DJ booth and Speakers (using Three.js primitives to save asset weight initially).

## Verification Plan

### Automated Tests
- None planned for this visual prototype.

### Manual Verification
- **Desktop**: Verify scene loads, streaming audio plays, and mouse interaction works (if strict VR not enforced).
- **VR Simulator**: Use Chrome/Firefox WebXR emulator extension to test controller inputs.
- **Quest Hardware**: (User to perform) Load URL in Quest Browser, enter VR, check frame rate and audio sync.

## Skills Integration
Reference patterns from local skills in `.agent/skills/`:
- `threejs-fundamentals.md`: Scene setup
- `threejs-lighting.md`: Lighting configuration
- `threejs-interaction.md`: VR Controllers
- `threejs-shaders.md`: Visual effects

### Fundamentals (Scene Setup)
```javascript
import * as THREE from "three";

// Create scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Add basic lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

camera.position.z = 5;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

### Lighting Setup
```javascript
// 1. Ambient Light - General glow
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// 2. Directional Light - Sunlight/Moonlight
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 5. Spot Light - Stage lighting
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(0, 10, 0);
spotLight.angle = Math.PI / 6;
spotLight.castShadow = true;
scene.add(spotLight);
```

