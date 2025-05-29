import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyUnitCube } from './MyUnitCube.js';
import { MyCylinder } from './MyCylinder.js';
import { MySphere } from './MySphere.js';
import { MyBlade } from './MyBlade.js';
import { MyTail } from './MyTail.js';
import { MyVerticalFin } from './MyVerticalFin.js';
import { MySolidCylinder } from './MySolidCylinder.js';
import { MyBucket } from './MyBucket.js'; // New bucket implementation
import { MyRope } from './MyRope.js'; // New rope class

// Helicopter states as enum
const HeliState = {
    LANDED: 'landed',
    ASCENDING: 'ascending',
    CRUISING: 'cruising',
    DESCENDING: 'descending',
    AUTO_RETURNING: 'auto_returning',
    DESCENDING_TO_WATER: 'descending_to_water', // NEW: Descending to collect water
    ASCENDING_FROM_WATER: 'ascending_from_water', // NEW: Ascending after collecting water
    DROPPING_WATER: 'dropping_water' // New state for water drop animation
};

// New enum for auto-return phases
const AutoReturnPhase = {
    TURNING: 'turning',         // Face toward target
    ACCELERATING: 'accelerating', 
    APPROACHING: 'approaching',
    ORIENTING: 'orienting'      // Final phase to align with initial orientation
};

export class MyHelicopter extends CGFobject {
    constructor(scene, initialPosition = null, textures = {}) {
        super(scene);
        this.scene = scene;
        this.textures = textures;


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

        //this.textures = {heliBody, heliGlass};
        
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
    
        // NEW: Water collection properties
        this.hasWater = false; // Bucket is empty initially
        this.waterCollectionHeight = 2; // Height above ground where water is collected
        
        // Water dropping animation properties
        this.waterDropAnimation = {
            active: false,
            progress: 0,
            duration: 2.0, // Animation lasts 2 seconds
            waterY: 0,     // Current Y position of falling water
            waterScale: 1, // Current horizontal scale of water
            bucketOpen: 0  // 0-1 animation value for bucket opening
        };
        
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
        this.bucket = new MyBucket(this.scene, this.textures.water);
        this.rope = new MyRope(this.scene);

        this.helicopterMaterial = new CGFappearance(this.scene);
        this.helicopterMaterial.setAmbient(0.4, 0.4, 0.4, 1.0);
        this.helicopterMaterial.setDiffuse(0.6, 0.6, 0.6, 1.0);
        this.helicopterMaterial.setSpecular(1.0, 1.0, 1.0, 1.0);
        this.helicopterMaterial.setShininess(70.0);
        if (this.textures.heliBody) this.helicopterMaterial.setTexture(this.textures.heliBody);

        this.glassMaterial = new CGFappearance(this.scene);
        this.glassMaterial.setAmbient(0.1, 0.1, 0.1, 1.0);
        this.glassMaterial.setDiffuse(0.22, 0.22, 0.22, 1.0);
        this.glassMaterial.setSpecular(0.8, 0.8, 0.8, 1.0);
        this.glassMaterial.setShininess(100.0);
        if (this.textures.heliGlass) this.glassMaterial.setTexture(this.textures.heliGlass);
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
        
        // Update based on state
        switch (this.state) {
            case HeliState.ASCENDING:  this.updateAscent(dt); break;
            case HeliState.CRUISING:   this.updateCruising(dt); break;
            case HeliState.DESCENDING: this.updateDescent(dt); break;
            case HeliState.AUTO_RETURNING: this.updateAutoReturn(); break;
            // NEW: Add water-related states
            case HeliState.DESCENDING_TO_WATER: this.updateDescentToWater(dt); break;
            case HeliState.ASCENDING_FROM_WATER: this.updateAscentFromWater(dt); break;
            case HeliState.DROPPING_WATER: this.updateWaterDrop(dt); break; // New state handler
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

    // NEW: Update descent to water
    updateDescentToWater(dt) {
        const waterLevel = this.waterCollectionHeight;
        
        // INCREASED: Acceleration multiplier from 2.0 to 4.0 for much faster descent
        const verticalAcceleration = this.config.verticalAcceleration * 4.0 * dt * 1000 * this.scene.speedFactor;
        
        // INCREASED: Maximum descent speed by 50%
        this.verticalSpeed = Math.max(
            this.verticalSpeed - verticalAcceleration,
            -this.config.maxVerticalSpeed * 1.5
        );
        
        // Update position
        this.position.y += this.verticalSpeed;
        
        // Only start braking when very close to water (0.3 units instead of 0.5)
        if (this.position.y <= waterLevel + 0.3) {
            // ADJUSTED: Stronger braking force for quicker stop
            const brakingForce = this.config.verticalAcceleration * 6.0 * dt * 1000;
            this.verticalSpeed = Math.min(this.verticalSpeed + brakingForce, -0.01);
        }
        
        // When bucket reaches water level
        if (this.position.y <= waterLevel) {
            this.position.y = waterLevel;
            this.verticalSpeed = 0;
            
            // Fill bucket with water
            if (!this.hasWater) {
                console.log("Collecting water");
                this.hasWater = true;
            }
        }
    }

    // NEW: Update ascent from water
    updateAscentFromWater(dt) {
        // INCREASED: Acceleration value doubled for faster takeoff
        const verticalAcceleration = 0.004 * dt * 1000 * this.scene.speedFactor;
        
        // INCREASED: Maximum ascent speed by 50%
        this.verticalSpeed = Math.min(
            this.verticalSpeed + verticalAcceleration,
            this.config.maxVerticalSpeed * 1.5
        );
        
        this.position.y += this.verticalSpeed;
        
        // When reaching cruise altitude
        if (this.position.y >= this.config.cruiseAltitude) {
            this.position.y = this.config.cruiseAltitude;
            this.verticalSpeed = 0;
            this.state = HeliState.CRUISING;
        }
    }

    // NEW: Water dropping animation update
    updateWaterDrop(dt) {
        // Update animation progress
        this.waterDropAnimation.progress += dt / this.waterDropAnimation.duration;
        
        if (this.waterDropAnimation.progress >= 1.0) {
            // Animation complete
            this.waterDropAnimation.active = false;
            this.hasWater = false;
            this.state = HeliState.CRUISING;
            
            // Extinguish all the fires we identified at the start
            if (this.scene && this.scene.fire && this.targetFireIds && this.targetFireIds.length > 0) {
                // Extinguish each fire in the stored array
                this.targetFireIds.forEach(fireId => {
                    this.scene.fire.extinguishFireByID(fireId);
                });
                
                // Clear the array
                this.targetFireIds = [];
            }
            
            return;
        }
        
        // Animation phases:
        // 1. Bucket opens (0-0.2)
        // 2. Water falls and expands (0.1-1.0)
        
        // Bucket opening animation
        if (this.waterDropAnimation.progress < 0.2) {
            this.waterDropAnimation.bucketOpen = this.waterDropAnimation.progress / 0.2;
        } else {
            this.waterDropAnimation.bucketOpen = 1.0;
        }
        
        // Water falling animation (starts slightly before bucket fully opens)
        if (this.waterDropAnimation.progress > 0.1) {
            const fallProgress = (this.waterDropAnimation.progress - 0.1) / 0.9;
            
            // Water position - use ease-in quad for natural falling acceleration
            const easeInQuad = fallProgress * fallProgress;
            
            // Distance from helicopter to ground
            const groundY = 0.5; // Estimated ground level
            const maxFallDistance = this.position.y - groundY;
            this.waterDropAnimation.waterY = easeInQuad * maxFallDistance;
            
            // Water expansion - starts small, then expands as it falls
            this.waterDropAnimation.waterScale = 1 + (fallProgress * 6); // Now expands to 7x original size
        }
    }

    displayWaterDrop(bucketY) {
        // Calculate the world position of the bucket's bottom in helicopter coordinates
        // We need to get the helicopter's world matrix to transform this properly
        
        // Create water material with transparency
        const waterMaterial = new CGFappearance(this.scene);
        waterMaterial.setAmbient(0.1, 0.4, 0.8, 0.8);
        waterMaterial.setDiffuse(0.2, 0.6, 0.9, 0.8);
        waterMaterial.setSpecular(0.5, 0.8, 1.0, 0.8);
        waterMaterial.setShininess(120);
        
        // Save the current matrix (helicopter's coordinate system)
        this.scene.pushMatrix();
        
        // Get the absolute world position where water starts falling
        // This gives us the bucket position in world space
        let bucketWorldX = 0;
        let bucketWorldY = bucketY;
        let bucketWorldZ = 0;
        
        // Convert from helicopter's local coordinates to world coordinates
        // Use the helicopter's position but ignore rotation for gravity
        bucketWorldX = this.position.x;
        bucketWorldY = this.position.y + bucketY;
        bucketWorldZ = this.position.z;
        
        // Revert to world coordinates (pop the helicopter's matrix)
        this.scene.popMatrix();
        
        // Start a fresh matrix stack in world coordinates 
        this.scene.pushMatrix();
        
        // Position the water at the bucket's world position
        this.scene.translate(bucketWorldZ, bucketWorldY - this.waterDropAnimation.waterY, bucketWorldX);
        
        // Rotate cylinder to be vertical (in world space)
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        
        // Water gets wider as it falls, but shorter in height
        const widthScale = this.waterDropAnimation.waterScale;
        const heightScale = Math.max(0.05, 0.3 - this.waterDropAnimation.progress * 0.2);
        
        this.scene.scale(widthScale, widthScale, heightScale);
        
    
        // Apply water material and display
        waterMaterial.apply();
        this.bucket.waterCylinder.display();
        
        this.scene.popMatrix();
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
        // Only allow turning during CRUISING state
        if (this.state !== HeliState.CRUISING) return;
        
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

    accelerate(v) {
        // Only allow acceleration during CRUISING state
        if (this.state !== HeliState.CRUISING) return;
        
        this.isAccelerating = true;
        const accelerationValue = v * 1.2 * this.scene.speedFactor;
        this.speed += accelerationValue;
        this.speed = Math.max(-this.config.maxSpeed, Math.min(this.config.maxSpeed, this.speed));
        this.updateVelocityDirection();
    }

    setTurning(state) {
        // Only allow changing turning state during CRUISING
        if (this.state !== HeliState.CRUISING) return;
        
        this.isTurning = state;
        if (!state) this.lastTurnValue = 0;
    }

    setForwardAccelerating(state) {
        // Only allow changing acceleration state during CRUISING
        if (this.state !== HeliState.CRUISING) return;
        
        this.isAccelerating = state;
    }
    
    updateVelocityDirection() {
        this.velocity.x = -Math.sin(this.orientation) * this.speed;
        this.velocity.z = Math.cos(this.orientation) * this.speed;
    }
    
    startAscent() {
        // If landed, take off normally
        if (this.state === HeliState.LANDED) {
            this.state = HeliState.ASCENDING;
            this.verticalSpeed = 0.03;
        } 
        // If at water level with water collected, ascend to cruising altitude
        else if (this.state === HeliState.DESCENDING_TO_WATER && this.hasWater) {
            console.log("Ascending with water");
            this.state = HeliState.ASCENDING_FROM_WATER;
            this.verticalSpeed = 0.03;
        }
    }


    dropWater() {
        // Only drop water if helicopter has water and is in cruising state
        if (!this.hasWater || this.state !== HeliState.CRUISING) {
            return false;
        }
        
        // Find ALL fires within radius and store their IDs
        const targetFireIds = [];
        const waterRadius = 7; // Larger area effect for water
        
        if (this.scene && this.scene.fire) {
            // Get all fire cell IDs in the target area
            const affectedFireIds = this.scene.fire.findAllFiresInRadius(
                this.position.z,
                this.position.x,
                waterRadius
            );
            
            if (affectedFireIds && affectedFireIds.length > 0) {
                targetFireIds.push(...affectedFireIds);
            }
        }
        
        if (targetFireIds.length === 0) {
            return false; // No fires found
        }
        
        // Store the fire IDs to extinguish when animation completes
        this.targetFireIds = targetFireIds;
        
        this.state = HeliState.DROPPING_WATER;
        this.waterDropAnimation = {
            active: true,
            progress: 0,
            duration: 2.0,
            waterY: 0,
            waterScale: 1,
            bucketOpen: 0
        };
        
        return true;
    }
    
    startDescent() {
        // If cruising over water and bucket is empty, descend to collect water
        if (this.state === HeliState.CRUISING && this.isOverWater() && !this.hasWater) {
            console.log("Descending to collect water");
            this.state = HeliState.DESCENDING_TO_WATER;
            this.verticalSpeed = 0;
            return;
        }

        if (this.hasWater) {
            console.log("Cannot return to base with water in bucket - use the water to extinguish fires first");
            return;
        }
        
        // Otherwise, use the existing auto-return logic (return to helipad)
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
    
    // Add new method to check if over water
    isOverWater() {
        if (!this.scene || !this.scene.ground || !this.scene.ground.maskReady) {
            return false;
        }
        
        // Using isNearLake with a radius that matches the helicopter's visual size
        // Try different values for the radius (5 is a good starting point)
        return this.scene.ground.isNearLake(this.position.x, this.position.z, 5);
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
        this.hasWater = false; // Reset water state
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

        // Cabine (vidro frontal)
        this.scene.pushMatrix();
        this.scene.translate(0.5, 0.11, 0); // um pouco à frente
        this.scene.scale(0.45, 0.35, 0.4); // forma menor e achatada
        this.glassMaterial.apply();
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
            const bucketY = heliBottomY - ropeLength - 0.4;
            
            // Display rope first (if long enough to be visible)
            if (ropeLength > 0.05) {
                this.scene.pushMatrix();
                this.scene.translate(0, heliBottomY, 0);
                this.rope.display(ropeLength);
                this.scene.popMatrix();
            }
            
            // Display bucket with water state
            this.scene.pushMatrix();
            this.scene.translate(0, bucketY, 0);
            
            // Only show water in bucket if not dropping
            const showWaterInBucket = this.hasWater && 
                (!this.waterDropAnimation.active || this.waterDropAnimation.bucketOpen < 0.5);
            
            // Pass bucket opening state and display
            this.bucket.display(showWaterInBucket, this.waterDropAnimation.bucketOpen);
            this.scene.popMatrix();
            
            // Display falling water if animation is active
            if (this.waterDropAnimation.active && this.waterDropAnimation.bucketOpen > 0.1) {
                // Save the current transformation matrix that includes helicopter's rotations
                const originalModelViewMatrix = this.scene.getMatrix();
                
                // Need to call displayWaterDrop from world coordinates
                this.scene.popMatrix(); // Pop helicopter's matrix temporarily
                
                // Display water in world coordinates
                this.displayWaterDrop(bucketY);
                
                // Restore helicopter's matrix to continue rendering the helicopter
                this.scene.loadMatrix(originalModelViewMatrix);
            }
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