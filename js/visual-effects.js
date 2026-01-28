import * as THREE from 'three';

export class VisualEffects {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.floorMesh = null;
        this.particles = null;
        this.lasers = [];
        this.fftData = null;
    }

    init() {
        this.setupFloor();
        this.setupParticles();
        this.setupLasers();
    }

    setupFloor() {
        // Find existing floor or create new better one
        // For now, let's look for the platform we made in scene.js
        // Ideally we would replace it or modify its material here

        // Let's create a visualizer overlay on top of the floor
        const geometry = new THREE.PlaneGeometry(this.config.platform.size, this.config.platform.size, 64, 64);
        geometry.rotateX(-Math.PI / 2);

        // Custom Shader Material for pulsing grid (Enhanced with threejs-shaders skill)
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0x00ffff) },
                audioLevel: { value: 0.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPos;
                
                void main() {
                    vUv = uv;
                    vPos = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                uniform float audioLevel;
                varying vec2 vUv;
                varying vec3 vPos;

                void main() {
                    // Create a grid pattern
                    float gridX = step(0.98, fract(vUv.x * 20.0));
                    float gridY = step(0.98, fract(vUv.y * 20.0));
                    float grid = max(gridX, gridY);
                    
                    // Pulse from center
                    float dist = distance(vUv, vec2(0.5));
                    float pulse = sin(time * 2.0 - dist * 10.0) * 0.5 + 0.5;
                    
                    // Mix pulsing glow
                    float alpha = grid * (0.3 + pulse * 0.3 + audioLevel * 0.5);
                    
                    // Fade edges
                    alpha *= (1.0 - smoothstep(0.3, 0.5, dist));
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.floorMesh = new THREE.Mesh(geometry, material);
        this.floorMesh.position.y = 0.05; // Slightly above main floor
        this.scene.add(this.floorMesh);
    }

    setupParticles() {
        const particleCount = 100; // Reduced from 2000 to 100
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);

        const radius = this.config.platform.size / 2;

        for (let i = 0; i < particleCount; i++) {
            const r = Math.random() * radius;
            const theta = Math.random() * Math.PI * 2;

            positions[i * 3] = r * Math.cos(theta); // x
            positions[i * 3 + 1] = Math.random() * 10; // y height
            positions[i * 3 + 2] = r * Math.sin(theta); // z

            scales[i] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

        const material = new THREE.PointsMaterial({
            color: 0xaa00aa,
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    setupLasers() {
        // Simple lines as lasers
        for (let i = 0; i < 4; i++) {
            const geometry = new THREE.CylinderGeometry(0.02, 0.02, 50, 8);
            geometry.rotateX(Math.PI / 2); // Point along Z
            geometry.translate(0, 0, 25); // Pivot at start

            const material = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.5
            });

            const laser = new THREE.Mesh(geometry, material);
            laser.position.set(0, 8, -8); // DJ booth area
            this.scene.add(laser);
            this.lasers.push(laser);
        }
    }

    update(audioSystem) {
        if (!audioSystem) return;

        const volume = audioSystem.getAverageVolume(); // 0-255
        const scale = 1 + (volume / 255) * 0.5;

        // 1. Floor Pulse (Shader Update)
        if (this.floorMesh) {
            this.floorMesh.material.uniforms.time.value = Date.now() * 0.001;
            // Normalize volume 0-255 to 0-1 range for shader
            this.floorMesh.material.uniforms.audioLevel.value = volume / 255.0;
        }

        // 2. Particles Rise
        if (this.particles) {
            this.particles.rotation.y += 0.001;
            // React to bass?
        }

        // 3. Lasers Sweep
        const time = Date.now() * 0.001;
        this.lasers.forEach((laser, i) => {
            const offset = i * (Math.PI / 2);
            laser.rotation.y = Math.sin(time + offset) * 0.5;
            laser.rotation.z = Math.cos(time * 2 + offset) * 0.2;

            // Randomly flash
            laser.material.opacity = (Math.sin(time * 10 + i) > 0) ? 0.8 : 0.1;
        });
    }
}
