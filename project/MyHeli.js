import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyUnitCube } from './MyUnitCube.js';
import { MyCylinder } from './MyCylinder.js';
import { MySphere } from './MySphere.js';
import { MyBlade } from './MyBlade.js';
import { MyTail } from './MyTail.js';
import { MyVerticalFin } from './MyVerticalFin.js';
import { MySolidCylinder } from './MySolidCylinder.js';
import { MyBucket } from './MyBucket_2.js'; // New bucket implementation
import { MyRope } from './MyRope.js'; // New rope class

// Helicopter states as enum
const HeliState = {
    LANDED: 'landed',
    ASCENDING: 'ascending',
    CRUISING: 'cruising',
    DESCENDING: 'descending',
    AUTO_RETURNING: 'auto_returning'
};

// New enum for auto-return phases
const AutoReturnPhase = {
    TURNING: 'turning',         // Face toward target
    ACCELERATING: 'accelerating', 
    APPROACHING: 'approaching',
    ORIENTING: 'orienting'      // Final phase to align with initial orientation
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
        
        // Simplified bucket state - single deployment factor from 0 to 1
        // 0 = inside helicopter, 1 = fully deployed
        this.bucketDeployment = 0;
        
        // Target for auto-return
        this.targetPosition = { x: 0, z: 0 };

        // Auto-return state tracking
        this.autoReturnPhase = AutoReturnPhase.TURNING;
        this.autoReturnStartTime = 0;
    
        // Store initial orientation for reset (typically 0)
        this.initialOrientation = 0;
    
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
        
        // New bucket and rope implementation
        this.bucket = new MyBucket(this.scene);
        this.rope = new MyRope(this.scene);

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
        
        // Simplified bucket deployment logic based on helicopter state
        switch (this.state) {
            case HeliState.LANDED:
                // When landed, bucket is fully retracted
                this.bucketDeployment = this._updateValue(this.bucketDeployment, 0, 0.05);
                break;
                
            case HeliState.ASCENDING:
                // During ascent, deploy based on height progress
                const ascentProgress = (this.position.y - this.initialPosition.y) / 
                                      (this.config.cruiseAltitude - this.initialPosition.y);
                
                // Start deploying after 30% of ascent
                if (ascentProgress < 0.3) {
                    this.bucketDeployment = this._updateValue(this.bucketDeployment, 0, 0.05);
                } else {
                    // Map 30%-100% progress to 0-1 deployment
                    const targetDeployment = Math.min(1, (ascentProgress - 0.3) / 0.7);
                    this.bucketDeployment = this._updateValue(this.bucketDeployment, targetDeployment, 0.03);
                }
                break;
                
            case HeliState.CRUISING:
                // When cruising, bucket is fully deployed
                this.bucketDeployment = this._updateValue(this.bucketDeployment, 1, 0.05);
                break;
                
            case HeliState.DESCENDING:
            case HeliState.AUTO_RETURNING:
                // When returning or descending, retract bucket
                this.bucketDeployment = this._updateValue(this.bucketDeployment, 0, 0.03);
                break;
        }
        
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

    // Helper method for smooth value transitions
    _updateValue(current, target, step) {
        if (Math.abs(target - current) < step) return target;
        return current + Math.sign(target - current) * step;
    }

    updateRotors(dt) {
        if (this.state === HeliState.LANDED) return;
        
        // Base rotation speeds
        let mainRotorSpeed = this.config.baseRotorSpeed * 0.7;
        let tailRotorSpeed = this.config.baseRotorSpeed * 1.2;
        
        // Adjust speeds based on helicopter state
        switch (this.state) {
            case HeliState.CRUISING:
                // Increase main rotor speed based on forward speed
                const speedRatio = Math.abs(this.speed) / this.config.maxSpeed;
                mainRotorSpeed += 5.0 * speedRatio * this.scene.speedFactor;
                
                // Increase tail rotor speed during turning (more subtle effect)
                if (this.isTurning) {
                    tailRotorSpeed += 4.0 * Math.abs(this.currentTurnRate) * this.scene.speedFactor;
                }
                break;
                
            case HeliState.ASCENDING:
                // Faster main rotor during ascent
                mainRotorSpeed += 8.0 * this.scene.speedFactor;
                break;
                
            case HeliState.DESCENDING:
                // Slower rotors during descent
                const descentFactor = Math.max(0.5, 1 - 0.2 * this.scene.speedFactor);
                mainRotorSpeed *= descentFactor;
                break;
                
            case HeliState.AUTO_RETURNING:
                // Similar to cruising but with a constant minimum speed
                const autoReturnSpeedRatio = Math.max(0.5, Math.abs(this.speed) / this.config.maxSpeed);
                mainRotorSpeed += 5.0 * autoReturnSpeedRatio * this.scene.speedFactor;
                
                // Slight tail rotor speed increase during auto-return turning
                if (this.isTurning) {
                    tailRotorSpeed += 3.0 * this.scene.speedFactor;
                }
                break;
        }
        
        // Update the rotation angles
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
        
        // When reaching cruise altitude, fully deploy bucket
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
        
        // Change this check to use the exact initial y position
        if (this.position.y <= this.initialPosition.y) {
            // Set exact position and orientation values when landing
            this.position.x = this.initialPosition.x;
            this.position.y = this.initialPosition.y; // Exact initial y value
            this.position.z = this.initialPosition.z;
            this.orientation = 0; // Reset to default orientation
            
            this.verticalSpeed = 0;
            this.state = HeliState.LANDED;
            this.isBucketDeployed = false;
        }
    }

    // --- Improved auto return using the same movement logic as manual controls ---
    updateAutoReturn() {
        // Calculate distance to target
        const dx = this.targetPosition.x - this.position.x;
        const dz = this.targetPosition.z - this.position.z;
        const distance = Math.sqrt(dx*dx + dz*dz);
        
        // Check if we're in the orientation phase
        if (this.autoReturnPhase === AutoReturnPhase.ORIENTING) {
            this._handleOrientingPhase();
            return;
        }
        
        // Target reached - start orientation phase
        if (distance < 0.3) {
            // Snap exactly to target position
            this.position.x = this.targetPosition.x;
            this.position.z = this.targetPosition.z;
            this.speed = 0;
            this.velocity = { x: 0, y: 0, z: 0 };
            
            // Start orientation phase before descent
            this.autoReturnPhase = AutoReturnPhase.ORIENTING;
            this.isTurning = true;
            this.isAccelerating = false;
            console.log("Reached target position, aligning orientation");
            return;
        }
        
        // Standard movement phases
        switch (this.autoReturnPhase) {
            case AutoReturnPhase.TURNING:
                this._handleTurningPhase(dx, dz);
                break;
                
            case AutoReturnPhase.ACCELERATING:
                this._handleAcceleratingPhase(distance);
                break;
                
            case AutoReturnPhase.APPROACHING:
                this._handleApproachingPhase(distance);
                break;
        }
        
        // Position and tilt updates
        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;
        
        this.tiltAngle = -1.5 * this.speed;
        this.tiltAngle = Math.max(-this.config.maxTiltAngle, 
                     Math.min(this.config.maxTiltAngle, this.tiltAngle));
    }
    // ---------------------------------------------------------------------------

    // Helper methods for cleaner code structure
    _handleTurningPhase(dx, dz) {
        // Stop forward movement during turn
        this.speed = 0;
        this.velocity = { x: 0, y: 0, z: 0 };
        this.isAccelerating = false;
        
        // Calculate angle to target - use proper atan2 order to match velocity calculations
        const targetOrientation = Math.atan2(-dx, dz); 
        
        // Calculate the angle difference 
        let angleDiff = this.normalizeAngle(targetOrientation - this.orientation);
        
        // Check if we're close enough to the target orientation
        if (Math.abs(angleDiff) < 0.02) {
            // Snap exactly to target orientation
            this.orientation = targetOrientation;
            this.isTurning = false;
            this.autoReturnPhase = AutoReturnPhase.ACCELERATING;
            console.log("Aligned with target, starting movement");
        } else {
            // Turn in the most efficient direction
            const turnDirection = angleDiff > 0 ? 1 : -1;
            const turnAmount = Math.min(Math.abs(angleDiff), 0.03 * this.scene.speedFactor);
            this.orientation = this.normalizeAngle(this.orientation + turnDirection * turnAmount);
            this.isTurning = true;
        }
    }

    _handleAcceleratingPhase(distance) {
        this.isTurning = false;
        this.isAccelerating = true;
        
        // Set speed based on distance
        if (distance > 5) {
            this.speed = 0.25; // Faster when far away
        } else {
            this.speed = 0.15; // Medium speed when closer
        }
        
        // Update velocity
        this.updateVelocityDirection();
        
        // Switch to approach phase when close
        if (distance < 2) {
            console.log("Close to target, slowing down for final approach");
            this.autoReturnPhase = AutoReturnPhase.APPROACHING;
        }
    }

    _handleApproachingPhase(distance) {
        this.isTurning = false;
        this.isAccelerating = true;
        
        // Variable speed based on distance for smooth approach
        this.speed = Math.min(0.06, distance * 0.12);
        this.updateVelocityDirection();
        
        // Even slower for very close approach
        if (distance < 0.5) {
            this.speed = Math.min(0.03, distance * 0.06);
            this.updateVelocityDirection();
        }
    }

    // New method to handle orientation reset before descent
    _handleOrientingPhase() {
        // Stop all forward movement
        this.speed = 0;
        this.velocity = { x: 0, y: 0, z: 0 };
        this.isAccelerating = false;
        
        // Calculate the angle difference to initial orientation
        let angleDiff = this.normalizeAngle(this.initialOrientation - this.orientation);
        
        // Check if we're close enough to the initial orientation
        if (Math.abs(angleDiff) < 0.02) {
            // Snap exactly to initial orientation
            this.orientation = this.initialOrientation;
            this.isTurning = false;
            
            // Start descent
            this.state = HeliState.DESCENDING;
            this.verticalSpeed = 0;
            console.log("Orientation reset, starting descent");
        } else {
            // Turn in the most efficient direction
            const turnDirection = angleDiff > 0 ? 1 : -1;
            const turnAmount = Math.min(Math.abs(angleDiff), 0.03 * this.scene.speedFactor);
            this.orientation = this.normalizeAngle(this.orientation + turnDirection * turnAmount);
            this.isTurning = true;
        }
    }

    // Keep the original updateDescent method but with improved behavior
    updateDescent(dt) {
        const verticalDeceleration = this.config.verticalAcceleration * dt * 1000 * this.scene.speedFactor;
        this.verticalSpeed = Math.max(
            this.verticalSpeed - verticalDeceleration,
            -this.config.maxVerticalSpeed
        );
        this.position.y += this.verticalSpeed;
        
        // Land when reaching initial height
        if (this.position.y <= this.initialPosition.y) {
            // Set exact position values when landing
            this.position = { ...this.initialPosition };
            this.orientation = this.initialOrientation;
            
            this.verticalSpeed = 0;
            this.state = HeliState.LANDED;
            this.isBucketDeployed = false;
            this.autoReturnPhase = AutoReturnPhase.TURNING; // Reset for next time
        }
    }

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
            this.autoReturnPhase = AutoReturnPhase.TURNING; // Reset phase
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
        this.bucketDeployment = 0;
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

        // Body
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

        // Main rotor support
        this.scene.pushMatrix();
        this.scene.translate(0, 0.65, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(0.05, 0.05, 0.6);
        this.rotor.display();
        this.scene.popMatrix();

        // Main rotor blades
        this.scene.pushMatrix();
        this.scene.translate(0, 0.32, 0);
        // Only apply the main rotor rotation - not countering the helicopter orientation
        this.scene.rotate(this.mainRotorAngle, 0, 1, 0);
        
        // Draw each blade
        for (let i = 0; i < 4; i++) {
            this.scene.pushMatrix();
            this.scene.rotate(i * Math.PI / 2, 0, 1, 0);
            this.scene.scale(1.5, 1.5, 1.5);
            this.scene.translate(0.7, 0.2, 0);
            this.blade.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();

        // Only display bucket and rope if there's any deployment
        if (this.bucketDeployment > 0) {
            const maxRopeLength = 2.0; // Maximum rope length when fully deployed
            const heliBottomY = -0.3;  // Point where rope connects to helicopter
            
            // Calculate positions based on deployment factor
            const ropeLength = this.bucketDeployment * maxRopeLength;
            const bucketY = heliBottomY - ropeLength - 0.24;
            
            // Display rope first (if long enough to be visible)
            if (ropeLength > 0.05) {
                this.scene.pushMatrix();
                this.scene.translate(0, heliBottomY, 0);
                this.rope.display(ropeLength);
                this.scene.popMatrix();
            }
            
            // Display bucket
            this.scene.pushMatrix();
            this.scene.translate(0, bucketY, 0);
            this.bucket.display();
            this.scene.popMatrix();
        }

        // Skis
        this.displaySkis();

        // Tail rotor assembly
        this.scene.pushMatrix();
        this.scene.translate(-2.5, 0.3, 0.04);
        // Only apply the tail rotor rotation
        this.scene.rotate(this.tailRotorAngle, 0, 0, 1);
        
        // Draw tail rotor blades
        for (let i = 0; i < 4; i++) {
            this.scene.pushMatrix();
            this.scene.rotate(i * Math.PI / 2, 0, 0, 1);
            this.scene.scale(0.2, 0.5, 0.5);
            this.blade.display();
            this.scene.popMatrix();
        }
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