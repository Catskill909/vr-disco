import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Models {
    constructor(scene) {
        this.scene = scene;
        this.materials = {
            black: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 }),
            metal: new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 }),
            glow: new THREE.MeshBasicMaterial({ color: 0x00ffff })
        };
    }

    init() {
        // Disabled for Skybox Reset
    }

    async getModel(file) {
        if (this.cache.has(file)) {
            const gltf = await this.cache.get(file);
            return gltf.scene.clone();
        }

        const path = `speakers/${file}`;
        const loadPromise = new Promise((resolve, reject) => {
            this.loader.load(path, (gltf) => {
                console.log(`📦 Model Cached (First Load): ${file}`);
                resolve(gltf);
            }, undefined, (err) => {
                console.error(`CRITICAL: Failed to load ${file} at ${path}.`, err);
                this.cache.delete(file); // Clear failed promise
                reject(err);
            });
        });

        this.cache.set(file, loadPromise);
        const gltf = await loadPromise;
        return gltf.scene.clone();
    }

    buildDJBooth() {
        const group = new THREE.Group();
        group.position.set(0, 0, -8);

        const deskGeo = new THREE.BoxGeometry(4, 1, 1.5);
        const desk = new THREE.Mesh(deskGeo, this.materials.black);
        desk.position.y = 0.5;
        group.add(desk);

        const mixerGeo = new THREE.BoxGeometry(0.8, 0.15, 0.6);
        const mixer = new THREE.Mesh(mixerGeo, this.materials.black);
        mixer.position.set(0, 1.05, 0);
        group.add(mixer);

        this.scene.add(group);
    }

    async buildSpeakers() {
        console.log("Models: Initializing Wall of Sound (Clone Pattern)...");

        const setupInstance = (model, pos, rot, scale) => {
            model.position.set(pos.x, pos.y, pos.z);
            model.rotation.set(rot.x, rot.y, rot.z);
            model.scale.set(scale, scale, scale);
            model.traverse(c => {
                if (c.isMesh) {
                    c.castShadow = true;
                    c.receiveShadow = true;
                }
            });
            this.scene.add(model);
        };

        const radius = 12;
        const count = 4; // REDUCED LOAD: 4 Stacks = 8 Speakers total

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const rotY = -angle + Math.PI / 2;

            // Load/Clone Bottom
            this.getModel('dusty_passive_stage_speaker.glb').then(model => {
                setupInstance(model, { x: x, y: 0, z: z }, { x: 0, y: rotY, z: 0 }, 3.0);
            });

            // Load/Clone Top
            this.getModel('dusty_passive_stage_speaker.glb').then(model => {
                setupInstance(model, { x: x, y: 3.5, z: z }, { x: Math.PI, y: rotY, z: 0 }, 3.0);
            });
        }

        // Monitors
        this.getModel('stage_monitor_speaker.glb').then(model => {
            setupInstance(model, { x: -2, y: 0, z: -7 }, { x: 0, y: -Math.PI / 4, z: 0 }, 2.0);
        });
        this.getModel('stage_monitor_speaker.glb').then(model => {
            setupInstance(model, { x: 2, y: 0, z: -7 }, { x: 0, y: Math.PI / 4, z: 0 }, 2.0);
        });
    }
}
