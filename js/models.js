import * as THREE from 'three';

export class Models {
    constructor(scene) {
        this.scene = scene;
        this.materials = {
            black: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 }),
            metal: new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 }),
            glow: new THREE.MeshBasicMaterial({ color: 0x00ffff }) // Blue glow
        };
    }

    init() {
        this.buildDJBooth();
        this.buildSpeakers();
    }

    buildDJBooth() {
        const group = new THREE.Group();
        group.position.set(0, 0, -8);

        // Desk
        const deskGeo = new THREE.BoxGeometry(4, 1, 1.5);
        const desk = new THREE.Mesh(deskGeo, this.materials.black);
        desk.position.y = 0.5;
        group.add(desk);

        // Pillars
        const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 16);
        const leg1 = new THREE.Mesh(legGeo, this.materials.metal);
        leg1.position.set(-1.8, 0.5, 0);
        group.add(leg1);

        const leg2 = new THREE.Mesh(legGeo, this.materials.metal);
        leg2.position.set(1.8, 0.5, 0);
        group.add(leg2);

        // Equipment (Simple Boxes)
        const deckGeo = new THREE.BoxGeometry(0.8, 0.1, 0.6);
        const deck1 = new THREE.Mesh(deckGeo, this.materials.metal);
        deck1.position.set(-1, 1.05, 0);
        group.add(deck1);

        const deck2 = new THREE.Mesh(deckGeo, this.materials.metal);
        deck2.position.set(1, 1.05, 0);
        group.add(deck2);

        const mixerGeo = new THREE.BoxGeometry(0.8, 0.15, 0.6);
        const mixer = new THREE.Mesh(mixerGeo, this.materials.black);
        mixer.position.set(0, 1.05, 0);
        group.add(mixer);

        this.scene.add(group);
    }

    buildSpeakers() {
        // Create 2 Big stacks
        this.createSpeakerStack(-6, -8);
        this.createSpeakerStack(6, -8);
    }

    createSpeakerStack(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        group.rotation.y = x > 0 ? -0.5 : 0.5; // Angle approx towards center

        // Bottom Sub
        const subGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const sub = new THREE.Mesh(subGeo, this.materials.black);
        sub.position.y = 0.75;
        group.add(sub);

        // Sub Cone
        const coneGeo = new THREE.CircleGeometry(0.6, 32);
        const cone = new THREE.Mesh(coneGeo, this.materials.metal);
        cone.position.set(0, 0.75, 0.76);
        group.add(cone);

        // Top Range
        const topGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const top = new THREE.Mesh(topGeo, this.materials.black);
        top.position.y = 2.25;
        group.add(top);

        // Mid Cone
        const midCone = new THREE.Mesh(coneGeo, this.materials.metal);
        midCone.position.set(0, 2.25, 0.76);
        group.add(midCone);

        this.scene.add(group);
    }
}
