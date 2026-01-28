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
        // Generate procedural texture
        const texture = this.createFloorTexture();
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10); // 10x10 tiles

        // Textured Dance Floor
        const geometry = new THREE.PlaneGeometry(this.config.platform.size, this.config.platform.size);
        geometry.rotateX(-Math.PI / 2);

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.2, // Glossy
            metalness: 0.5, // Metallic
            side: THREE.DoubleSide
        });

        this.floorMesh = new THREE.Mesh(geometry, material);
        this.floorMesh.position.y = 0.05;
        this.floorMesh.receiveShadow = true;
        this.scene.add(this.floorMesh);

        // No grid helper needed with tiles
    }

    createFloorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Background (Grout lines)
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, 512, 512);

        // Tiles (2x2 pattern for seamless repeat)
        const tileSize = 250; // slightly smaller than 256 for grout line
        const offset = 6; // grout width / 2

        ctx.fillStyle = '#444444'; // Base tile color (Dark Silver)

        // Top Left
        ctx.fillRect(offset, offset, tileSize, tileSize);
        // Top Right
        ctx.fillRect(256 + offset, offset, tileSize, tileSize);
        // Bottom Left
        ctx.fillRect(offset, 256 + offset, tileSize, tileSize);
        // Bottom Right
        ctx.fillRect(256 + offset, 256 + offset, tileSize, tileSize);

        // Add some "gloss" highlights to tiles for realism
        ctx.fillStyle = '#555555';
        const innerOffset = offset + 10;
        const innerSize = tileSize - 20;

        ctx.fillRect(innerOffset, innerOffset, innerSize, innerSize);
        ctx.fillRect(256 + innerOffset, innerOffset, innerSize, innerSize);
        ctx.fillRect(innerOffset, 256 + innerOffset, innerSize, innerSize);
        ctx.fillRect(256 + innerOffset, 256 + innerOffset, innerSize, innerSize);

        return new THREE.CanvasTexture(canvas);
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

        // 1. Floor (Static now)
        // No update needed for MeshStandardMaterial

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
