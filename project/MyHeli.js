import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyUnitCube } from './MyUnitCube.js';
import { MyCylinder } from './MyCylinder.js';
import { MySphere } from './MySphere.js';
import { MyBlade } from './MyBlade.js';
import { MyTail } from './MyTail.js';
import { MyVerticalFin } from './MyVerticalFin.js';
import { MySolidCylinder } from './MySolidCylinder.js';
import { MyBucket } from './MyBucket.js';

// Helicopter states as enum
const HeliState = {
    LANDED: 'landed',
    ASCENDING: 'ascending',
    CRUISING: 'cruising',
    DESCENDING: 'descending',
    AUTO_RETURNING: 'auto_returning'
};

export class MyHelicopter extends CGFobject {
    constructor(scene, initialPosition = null) {
        super(scene);
        this.scene = scene;

        // Use the provided initial position or default values
        if (initialPosition) {
            this.position = { 
                x: initialPosition.x || 0, 
                y: initialPosition.y + 0.8 || 0.8, // Add 0.8 for height above helipad
                z: initialPosition.z || 0 
            };
        } else {
            this.position = { x: 0, y: 0.8, z: 0 };
        }
        
        // Store original position for reset
        this.initialPosition = { ...this.position };
        
        // Initialize helicopter state
        this.state = HeliState.LANDED;
        this.orientation = 0;
        this.velocity = { x: 0, y: 0, z: 0 };
        this.speed = 0;
        
        // Movement parameters
        this.tiltAngle = 0;
        this.sideTiltAngle = 0;
        this.lastTurnValue = 0;
        this.verticalSpeed = 0;
        this.isAccelerating = false;
        this.isTurning = false;
        this.currentTurnRate = 0;
        this.maxTurnRate = Math.PI;
    
        // Configuration constants
        this.config = {
            maxSpeed: 0.4,
            maxTiltAngle: Math.PI / 12,
            maxSideTiltAngle: Math.PI / 12,
            sideTiltDecay: 0.75,
            cruiseAltitude: this.position.y + 5,
            maxVerticalSpeed: 0.20,
            verticalAcceleration: 0.005,
            deceleration: 0.0005,
            autoMoveSpeed: 0.03,
            autoTurnRate: 0.02,
            baseRotorSpeed: 6.5
        };
        
        // Rotor animation properties
        this.mainRotorAngle = 0;
        this.tailRotorAngle = 0;
        
        // Bucket state
        this.isBucketDeployed = false;
        this.bucketY = 0.45;
        
        // Target for auto-return
        this.targetPosition = { x: 0, z: 0 };

        // Create helicopter components
        this.initializeComponents();
    }

    // Initialize all geometric components
    initializeComponents() {
        this.body = new MySphere(this.scene, 1, 20, 20);
        this.tail = new MyTail(this.scene);
        this.rotor = new MyCylinder(this.scene, 20, 1);
        this.tailRotor = new MyCylinder(this.scene, 8, 1);
        this.blade = new MyBlade(this.scene);
        this.ski = new MyUnitCube(this.scene);
        this.skiSupport = new MyUnitCube(this.scene);
        this.verticalFin = new MyVerticalFin(this.scene);
        this.tailConnector = new MySolidCylinder(this.scene, 20, 1);
        this.bucket = new MyBucket(this.scene);

        this.helicopterMaterial = new CGFappearance(this.scene);
        this.helicopterMaterial.setAmbient(0.4, 0.4, 0.4, 1.0);
        this.helicopterMaterial.setDiffuse(0.6, 0.6, 0.6, 1.0);
        this.helicopterMaterial.setSpecular(1.0, 1.0, 1.0, 1.0);
        this.helicopterMaterial.setShininess(70.0);
        this.helicopterMaterial.loadTexture("textures/helicopter.png");
    }

    get isLanded() {
        return this.state === HeliState.LANDED;
    }

    update(delta_t) {
        const dt = delta_t * 0.001;
        switch (this.state) {
            case HeliState.ASCENDING:  this.updateAscent(dt); break;
            case HeliState.CRUISING:   this.updateCruising(dt); break;
            case HeliState.DESCENDING: this.updateDescent(dt); break;
            case HeliState.AUTO_RETURNING: this.updateAutoReturn(); break;
        }
        this.updateRotors(dt);
        this.updateTilt();
        this.updateSideTilt();
    }

    updateRotors(dt) {
        if (this.state === HeliState.LANDED) return;
        const baseMainRotorSpeed = this.config.baseRotorSpeed * 0.7;
        const baseTailRotorSpeed = this.config.baseRotorSpeed * 1.2;
        let mainRotorSpeed = baseMainRotorSpeed;
        let tailRotorSpeed = baseTailRotorSpeed;
        if (this.state === HeliState.CRUISING) {
            const speedRatio = Math.abs(this.speed) / this.config.maxSpeed;
            mainRotorSpeed += 15.0 * speedRatio * this.scene.speedFactor;
            tailRotorSpeed += 60.0 * Math.abs(this.lastTurnValue) * this.scene.speedFactor;
        } else if (this.state === HeliState.ASCENDING) {
            mainRotorSpeed += 8.0 * this.scene.speedFactor;
        } else if (this.state === HeliState.DESCENDING) {
            const descentFactor = Math.max(0.5, 1 - 0.2 * this.scene.speedFactor);
            mainRotorSpeed *= descentFactor;
        }
        this.mainRotorAngle = (this.mainRotorAngle + mainRotorSpeed * dt) % (2 * Math.PI);
        this.tailRotorAngle = (this.tailRotorAngle + tailRotorSpeed * dt) % (2 * Math.PI);
    }
    
    updateAscent(dt) {
        const verticalAcceleration = 0.002 * dt * 1000 * this.scene.speedFactor;
        this.verticalSpeed = Math.min(
            this.verticalSpeed + verticalAcceleration,
            this.config.maxVerticalSpeed
        );
        this.position.y += this.verticalSpeed;
        if (this.position.y >= this.config.cruiseAltitude) {
            this.position.y = this.config.cruiseAltitude;
            this.verticalSpeed = 0;
            this.state = HeliState.CRUISING;
            this.isBucketDeployed = true;
        }
    }
    
    updateCruising(dt) {
        if (!this.isAccelerating && Math.abs(this.speed) > 0) {
            const effectiveSpeedFactor = Math.max(0.3, this.scene.speedFactor);
            const decelerationAmount = this.config.deceleration * dt * 1000 * effectiveSpeedFactor;
            const decelerationDirection = this.speed > 0 ? -1 : 1;
            if (Math.abs(this.speed) > decelerationAmount) {
                this.speed += decelerationDirection * decelerationAmount;
            } else {
                this.speed = 0;
            }
            this.updateVelocityDirection();
        }
        const speedMultiplier = 1.5;
        this.position.x += this.velocity.x * speedMultiplier;
        this.position.z += this.velocity.z * speedMultiplier;
    }
    
    updateDescent(dt) {
        const verticalDeceleration = this.config.verticalAcceleration * dt * 1000 * this.scene.speedFactor;
        this.verticalSpeed = Math.max(
            this.verticalSpeed - verticalDeceleration,
            -this.config.maxVerticalSpeed
        );
        this.position.y += this.verticalSpeed;
        if (this.position.y <= 0.8) {
            this.position.y = 0.8;
            this.verticalSpeed = 0;
            this.state = HeliState.LANDED;
            this.isBucketDeployed = false;
        }
    }

    // --- Improved auto return using the same movement logic as manual controls ---
    updateAutoReturn() {
        const dx = this.targetPosition.x - this.position.x;
        const dz = this.targetPosition.z - this.position.z;
        const distance = Math.sqrt(dx*dx + dz*dz);

        if (distance < 1) {
            this.state = HeliState.DESCENDING;
            this.verticalSpeed = 0;
            return;
        }

        const targetOrientation = Math.atan2(dx, dz);
        const orientationDiff = this.normalizeAngle(targetOrientation - this.orientation);

        const baseAccelValue = 0.001;
        const baseTurnValue = 0.002;

        // Turn towards target if needed
        if (Math.abs(orientationDiff) > 0.05) {
            const turnDir = Math.sign(orientationDiff);
            this.turn(turnDir * baseTurnValue * this.scene.speedFactor);
            this.isTurning = true;
            this.isAccelerating = false;
        } else {
            // Facing target, accelerate forward
            this.isTurning = false;
            this.lastTurnValue = 0;
            this.accelerate(baseAccelValue * this.scene.speedFactor);
            this.isAccelerating = true;
            // Slow down as we approach
            if (distance < 10) {
                const brakeFactor = Math.max(0.3, distance / 10);
                this.speed *= brakeFactor;
            }
        }
        // Position is updated in updateCruising
    }
    // ---------------------------------------------------------------------------

    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }
    
    updateTilt() {
        this.tiltAngle = -1.5 * this.speed;
        this.tiltAngle = Math.max(-this.config.maxTiltAngle, 
                               Math.min(this.config.maxTiltAngle, this.tiltAngle));
    }

    updateSideTilt() {
        const targetSideTilt = 30 * this.currentTurnRate;
        if (!this.isTurning) {
            this.currentTurnRate *= 0.7;
            const decayRate = 0.1;
            if (Math.abs(this.sideTiltAngle) > decayRate) {
                this.sideTiltAngle += (this.sideTiltAngle > 0) ? -decayRate : decayRate;
            } else {
                this.sideTiltAngle = 0;
            }
            if (Math.abs(this.currentTurnRate) < 0.001) {
                this.currentTurnRate = 0;
            }
        } else {
            const tiltRate = 0.08;
            const tiltDiff = targetSideTilt - this.sideTiltAngle;
            if (Math.abs(tiltDiff) > 0.01) {
                this.sideTiltAngle += tiltDiff * tiltRate;
            } else {
                this.sideTiltAngle = targetSideTilt;
            }
        }
        this.sideTiltAngle = Math.max(-this.config.maxSideTiltAngle, 
                                Math.min(this.config.maxSideTiltAngle, this.sideTiltAngle));
    }
     
    turn(v) {
        if (this.state !== HeliState.CRUISING && this.state !== HeliState.AUTO_RETURNING) return;
        this.lastTurnValue = v;
        this.isTurning = true;
        const maxTurnRate = 0.2;
        const baseAcceleration = 0.02;
        const targetDirection = v > 0 ? 1 : (v < 0 ? -1 : 0);
        const targetRate = targetDirection * maxTurnRate;
        const turnAcceleration = baseAcceleration * this.scene.speedFactor;
        if (this.currentTurnRate < targetRate) {
            this.currentTurnRate = Math.min(targetRate, this.currentTurnRate + turnAcceleration);
        } else if (this.currentTurnRate > targetRate) {
            this.currentTurnRate = Math.max(targetRate, this.currentTurnRate - turnAcceleration);
        }
        this.orientation -= this.currentTurnRate;
        this.updateVelocityDirection();
    }

    setTurning(state) {
        this.isTurning = state;
        if (!state) this.lastTurnValue = 0;
    }
    
    accelerate(v) {
        if (this.state !== HeliState.CRUISING && this.state !== HeliState.AUTO_RETURNING) return;
        this.isAccelerating = true;
        const accelerationValue = v * 1.2 * this.scene.speedFactor;
        this.speed += accelerationValue;
        this.speed = Math.max(-this.config.maxSpeed, Math.min(this.config.maxSpeed, this.speed));
        this.updateVelocityDirection();
    }

    setForwardAccelerating(state) {
        this.isAccelerating = state;
    }
    
    updateVelocityDirection() {
        this.velocity.x = -Math.sin(this.orientation) * this.speed;
        this.velocity.z = Math.cos(this.orientation) * this.speed;
    }
    
    startAscent() {
        if (this.state === HeliState.LANDED) {
            this.state = HeliState.ASCENDING;
            this.verticalSpeed = 0.03;
        }
    }
    
    startDescent() {
        if (this.state === HeliState.CRUISING) {
            // Use the stored initial position for auto-return
            this.targetPosition = { 
                x: this.initialPosition.x, 
                z: this.initialPosition.z 
            };
            this.state = HeliState.AUTO_RETURNING;
            this.speed = 0;
        }
    }
    
    resetPosition() {
        this.position = { ...this.initialPosition };
        this.orientation = 0;
        this.velocity = { x: 0, y: 0, z: 0 };
        this.speed = 0;
        this.verticalSpeed = 0;
        this.state = HeliState.LANDED;
        this.tiltAngle = 0;
        this.sideTiltAngle = 0;
        this.isBucketDeployed = false;
        this.bucketY = 0.45;
    }
    
    getPosition() {
        return this.position;
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(this.position.z, this.position.y, this.position.x);
        this.scene.rotate(this.orientation, 0, 1, 0);
        this.scene.rotate(this.tiltAngle, 0, 0, 1);
        this.scene.rotate(this.sideTiltAngle, 1, 0, 0);

        this.helicopterMaterial.apply();

        this.scene.pushMatrix();
        this.scene.scale(1, 0.5, 0.5);
        this.body.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-0.9, 0, 0);
        this.scene.scale(0.65, 2, 2);
        this.tail.display(this.helicopterMaterial);
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 0.65, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(0.05, 0.05, 0.6);
        this.rotor.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 0.32, 0);
        this.scene.pushMatrix();
        this.scene.rotate(-this.orientation, 0, 1, 0);
        this.scene.rotate(-this.tiltAngle, 0, 0, 1);
        this.scene.rotate(-this.sideTiltAngle, 1, 0, 0);
        this.scene.rotate(this.mainRotorAngle, 0, 1, 0);
        for (let i = 0; i < 4; i++) {
            this.scene.pushMatrix();
            this.scene.rotate(i * Math.PI / 2, 0, 1, 0);
            this.scene.scale(1.5, 1.5, 1.5);
            this.scene.translate(0.7, 0.2, 0);
            this.blade.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, this.bucketY, 0);
        this.bucket.display();
        this.scene.popMatrix();

        this.displaySkis();

        this.scene.pushMatrix();
        this.scene.translate(-2.5, 0.12, 0);
        this.scene.scale(0.05, 0.2, 0.05);
        this.tailConnector.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-2.5, 0.3, 0.04);
        this.scene.rotate(-Math.PI, 0, 1, 0);
        this.scene.scale(0.15, 0.15, 0.1);
        this.tailRotor.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-2.5, 0.3, 0.04);
        this.scene.pushMatrix();
        this.scene.rotate(-this.orientation, 0, 1, 0);
        this.scene.rotate(-this.tiltAngle, 0, 0, 1);
        this.scene.rotate(-this.sideTiltAngle, 1, 0, 0);
        this.scene.rotate(this.tailRotorAngle, 0, 0, 1);
        for (let i = 0; i < 4; i++) {
            this.scene.pushMatrix();
            this.scene.rotate(i * Math.PI / 2, 0, 0, 1);
            this.scene.scale(0.2, 0.5, 0.5);
            this.blade.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
    
    displaySkis() {
        const skiY = -0.77;
        const skiZ = 0.35;
        for (let side of [-1, 1]) {
            this.scene.pushMatrix();
            this.scene.translate(0, skiY, skiZ * side);
            this.scene.scale(2, 0.06, 0.05);
            this.ski.display();
            this.scene.popMatrix();

            this.scene.pushMatrix();
            this.scene.translate(0.4, skiY, skiZ * side);
            this.scene.scale(0.05, 0.4, 0.05);
            this.skiSupport.display();
            this.scene.popMatrix();

            this.scene.pushMatrix();
            this.scene.translate(-0.4, skiY, skiZ * side);
            this.scene.scale(0.05, 0.4, 0.05);
            this.skiSupport.display();
            this.scene.popMatrix();
        }
    }
}