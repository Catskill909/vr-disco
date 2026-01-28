import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

export class VRControls {
    constructor(renderer, scene, userRig) {
        this.renderer = renderer;
        this.scene = scene;
        this.userRig = userRig;
        this.controllers = [];
        this.controllerGrips = [];

        // Rays
        this.raycaster = new THREE.Raycaster();
        this.workingMatrix = new THREE.Matrix4();
        this.workingVector = new THREE.Vector3();
        this.origin = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        // Teleport marker
        this.teleportMarker = this.createTeleportMarker();
        this.scene.add(this.teleportMarker);

        this.initControllers();
    }

    initControllers() {
        const controllerModelFactory = new XRControllerModelFactory();

        // Setup 2 controllers
        for (let i = 0; i < 2; i++) {
            // Target Ray Space (Raycasting)
            const controller = this.renderer.xr.getController(i);
            controller.addEventListener('selectstart', (e) => this.onSelectStart(e));
            controller.addEventListener('selectend', (e) => this.onSelectEnd(e));
            controller.addEventListener('connected', (e) => {
                controller.add(this.buildControllerBeam());
            });
            controller.addEventListener('disconnected', () => {
                controller.remove(controller.children[0]);
            });
            this.userRig.add(controller);
            this.controllers.push(controller);

            // Grip Space (Visual Model)
            const controllerGrip = this.renderer.xr.getControllerGrip(i);
            controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip));
            this.userRig.add(controllerGrip);
            this.controllerGrips.push(controllerGrip);
        }
    }

    buildControllerBeam() {
        // Simple beam line
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1)
        ]);
        const line = new THREE.Line(geometry);
        line.name = 'beam';
        line.scale.z = 5;
        return line;
    }

    createTeleportMarker() {
        const marker = new THREE.Mesh(
            new THREE.RingGeometry(0.2, 0.3, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0x00ffff })
        );
        marker.visible = false;
        return marker;
    }

    onSelectStart(event) {
        this.isSelecting = true;
    }

    onSelectEnd(event) {
        this.isSelecting = false;

        if (this.teleportMarker.visible) {
            // Teleport!
            this.userRig.position.copy(this.teleportMarker.position);
            // Height correction if needed, but rig is 0-based
        }

        this.teleportMarker.visible = false;
    }

    update() {
        // Check intersections for teleportation
        // Only active if selecting is happening or button pressed (simplified to constant check for now)
        // Ideally we only show marker when button is half-pressed or similar, but for now simple point mechanism

        let intersection = null;

        // Check both controllers
        for (const controller of this.controllers) {
            this.workingMatrix.identity().extractRotation(controller.matrixWorld);

            this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
            this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.workingMatrix);

            // Raycast against all objects in scene (optimize later to just floor)
            // Ideally we tag the floor objects
            const intersects = this.raycaster.intersectObjects(this.scene.children);

            if (intersects.length > 0) {
                // Find first valid floor (rough check by normal up)
                const point = intersects[0].point;
                // Simple normal check: if facing up
                if (intersects[0].face && intersects[0].face.normal.y > 0.5) {
                    intersection = point;
                    break;
                }
            }
        }

        if (intersection && this.isSelecting) { // Only update marker if holding trigger
            this.teleportMarker.position.copy(intersection);
            this.teleportMarker.visible = true;
        } else if (!this.isSelecting) {
            this.teleportMarker.visible = false;
        }
    }
}
