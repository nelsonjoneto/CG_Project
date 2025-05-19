import { CGFobject } from '../lib/CGF.js';
import { MyUnitCube } from './MyUnitCube.js';
import { MyCylinder } from './MyCylinder.js';
import { MySphere } from './MySphere.js';
import { MyBlade } from './MyBlade.js';
import { MyTail } from './MyTail.js';
import { MyVerticalFin } from './MyVerticalFin.js';
import { CGFappearance } from '../lib/CGF.js';
import { MySolidCylinder } from './MySolidCylinder.js';
import { MyBucket } from './MyBucket.js';

export class MyHelicopter extends CGFobject {
    constructor(scene) {
        super(scene);
        this.scene = scene;

        // Position and Movement Properties
        this.x = 0;
        this.y = 0.8; // Initial helipad height
        this.z = 0;
        this.orientation = 0; // Rotation around Y-axis
        this.speed = 0; // Horizontal speed
        this.velocity = [0, 0, 0]; // [x, y, z] velocity
        this.tiltAngle = 0; // Forward/backward tilt
        
        // Vertical Movement Properties
        this.cruiseAltitude = 10;
        this.verticalSpeed = 0;
        this.ascending = false;
        this.descending = false;
        this.verticalAcceleration = 1.2;
        this.maxVerticalSpeed = 2.5;
        this.isLanded = true;
        this.isBucketDeployed = false;
        this.bucketY = 0.45;

        // Helicopter Components
        this.body = new MySphere(scene, 1, 20, 20);
        this.tail = new MyTail(scene);
        this.rotor = new MyCylinder(scene, 20, 1);
        this.tailRotor = new MyCylinder(scene, 8, 1);
        this.blade = new MyBlade(scene);
        this.ski = new MyUnitCube(scene);
        this.skiSupport = new MyUnitCube(scene);
        this.verticalFin = new MyVerticalFin(scene);
        this.tailConnector = new MySolidCylinder(scene, 20, 1);
        this.bucket = new MyBucket(scene);

        // Materials
        this.helicopterMaterial = new CGFappearance(scene);
        this.helicopterMaterial.setAmbient(0.4, 0.4, 0.4, 1.0);
        this.helicopterMaterial.setDiffuse(0.6, 0.6, 0.6, 1.0);
        this.helicopterMaterial.setSpecular(1.0, 1.0, 1.0, 1.0);
        this.helicopterMaterial.setShininess(70.0);
        this.helicopterMaterial.loadTexture("textures/helicopter.png");
    }

    update(delta_t) {
        // Horizontal movement
        this.x += this.velocity[0] * delta_t;
        this.z += this.velocity[2] * delta_t;

        // Vertical movement
        if (this.ascending) {
            this.verticalSpeed = Math.min(
                this.verticalSpeed + this.verticalAcceleration * delta_t,
                this.maxVerticalSpeed
            );
            this.y += this.verticalSpeed * delta_t;
            
            // Reached cruise altitude
            if (this.y >= this.cruiseAltitude) {
                this.y = this.cruiseAltitude;
                this.ascending = false;
                this.verticalSpeed = 0;
                this.isBucketDeployed = true;
            }
        }

        if (this.descending) {
            this.verticalSpeed = Math.max(
                this.verticalSpeed - this.verticalAcceleration * delta_t,
                -this.maxVerticalSpeed
            );
            this.y += this.verticalSpeed * delta_t;
            
            // Landed on helipad
            if (this.y <= 0.8) {
                this.y = 0.8;
                this.descending = false;
                this.isLanded = true;
                this.verticalSpeed = 0;
                this.isBucketDeployed = false;
            }
        }

        // Tilt based on horizontal speed
        this.tiltAngle = Math.max(
            -Math.PI/8,
            Math.min(Math.PI/8, this.speed * 0.1)
        );
    }

    startAscent() {
        if (this.isLanded) {
            this.isLanded = false;
            this.ascending = true;
            this.verticalSpeed = 0;
        }
    }

    startDescent() {
        if (!this.isLanded && !this.ascending) {
            this.descending = true;
            this.verticalSpeed = 0;
        }
    }

    turn(v) {
        this.orientation += v;
        const dirX = Math.sin(this.orientation);
        const dirZ = Math.cos(this.orientation);
        this.velocity[0] = this.speed * dirX;
        this.velocity[2] = this.speed * dirZ;
    }

    accelerate(v) {
        this.speed = Math.max(-5, Math.min(5, this.speed + v));
        const dirX = Math.sin(this.orientation);
        const dirZ = Math.cos(this.orientation);
        this.velocity[0] = this.speed * dirX;
        this.velocity[2] = this.speed * dirZ;
    }

    resetPosition() {
        this.x = 0;
        this.y = 0.8;
        this.z = 0;
        this.orientation = 0;
        this.speed = 0;
        this.velocity = [0, 0, 0];
        this.verticalSpeed = 0;
        this.ascending = false;
        this.descending = false;
        this.isLanded = true;
        this.isBucketDeployed = false;
        this.bucketY = 0.45;
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(this.z, this.y, this.x);
        this.scene.rotate(this.orientation, 0, 1, 0);
        this.scene.rotate(- this.tiltAngle, 0, 0, 1);

        // Animate bucket during ascent/descent
        if (this.ascending) {
            this.bucketY = 0.2 + (this.y / this.cruiseAltitude) * 0.25;
        } else if (this.descending) {
            this.bucketY = 0.45 - ((0.8 - this.y) / 0.8) * 0.25;
        }

        this.helicopterMaterial.apply();

        // Main body
        this.scene.pushMatrix();
        this.scene.scale(1, 0.5, 0.5);
        this.body.display();
        this.scene.popMatrix();

        // Tail
        this.scene.pushMatrix();
        this.scene.translate(-0.9, 0, 0);
        this.scene.scale(0.65, 2, 2);
        this.tail.display(this.helicopterMaterial);
        this.scene.popMatrix();

        // Main rotor
        this.scene.pushMatrix();
        this.scene.translate(0, 0.65, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(0.05, 0.05, 0.6);
        this.rotor.display();
        this.scene.popMatrix();

        // Rotor blades
        for (let i = 0; i < 4; i++) {
            this.scene.pushMatrix();
            this.scene.translate(0, 0.32, 0);
            this.scene.rotate(i * Math.PI / 2, 0, 1, 0);
            this.scene.scale(1.5, 1.5, 1.5);
            this.scene.translate(0.7, 0.2, 0);
            this.blade.display();
            this.scene.popMatrix();
        }

        // Water bucket
        this.scene.pushMatrix();
        this.scene.translate(0, this.bucketY, 0);
        this.bucket.display();
        this.scene.popMatrix();

        // Skis and supports
        const skiY = -0.77;
        const skiZ = 0.35;
        for (let side of [-1, 1]) {
            this.scene.pushMatrix();
            this.scene.translate(0, skiY, skiZ * side);
            this.scene.scale(2, 0.06, 0.05);
            this.ski.display();
            this.scene.popMatrix();

            // Front support
            this.scene.pushMatrix();
            this.scene.translate(0.4, skiY, skiZ * side);
            this.scene.scale(0.05, 0.4, 0.05);
            this.skiSupport.display();
            this.scene.popMatrix();

            // Rear support
            this.scene.pushMatrix();
            this.scene.translate(-0.4, skiY, skiZ * side);
            this.scene.scale(0.05, 0.4, 0.05);
            this.skiSupport.display();
            this.scene.popMatrix();
        }

        // Tail components
        this.scene.pushMatrix();
        this.scene.translate(-2.5, 0.12, 0);
        this.scene.scale(0.05, 0.2, 0.05);
        this.tailConnector.display();
        this.scene.popMatrix();

        // Tail rotor
        this.scene.pushMatrix();
        this.scene.translate(-2.5, 0.3, 0.04);
        this.scene.rotate(-Math.PI, 0, 1, 0);
        this.scene.scale(0.15, 0.15, 0.1);
        this.tailRotor.display();
        this.scene.popMatrix();

        // Tail rotor blades
        for (let i = 0; i < 4; i++) {
            this.scene.pushMatrix();
            this.scene.translate(-2.5, 0.3, 0.04);
            this.scene.rotate(i * Math.PI / 2, 0, 0, 1);
            this.scene.scale(0.2, 0.5, 0.5);
            this.blade.display();
            this.scene.popMatrix();
        }

        this.scene.popMatrix();
    }
}