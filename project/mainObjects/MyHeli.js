
import { CGFobject, CGFappearance } from '../../lib/CGF.js';
import { MyUnitCube } from '../geometry/MyUnitCube.js';
import { MyBucketCylinder } from '../geometry/MyBucketCylinder.js';
import { MySphere } from '../geometry/MySphere.js';
import { MyBlade } from '../objects/helicopter/MyBlade.js';
import { MyTail } from '../objects/helicopter/MyTail.js';
import { MyVerticalFin } from '../objects/helicopter/MyVerticalFin.js';
import { MyBucket } from '../objects/helicopter/MyBucket.js'; 
import { MyRope } from '../objects/helicopter/MyRope.js'; 
import { MyCone } from '../geometry/MyCone.js';
/**
 * Helicopter states as enum
 * @enum {string}
 */

const HeliState = {
    LANDED: 'landed',
    ASCENDING: 'ascending',
    CRUISING: 'cruising',
    DESCENDING: 'descending',
    AUTO_RETURNING: 'auto_returning',
    DESCENDING_TO_WATER: 'descending_to_water',
    ASCENDING_FROM_WATER: 'ascending_from_water',
    DROPPING_WATER: 'dropping_water'
};

/**
 * Auto-return phases for controlled landing sequence
 * @enum {string}
 */
const AutoReturnPhase = {
    TURNING: 'turning',
    ACCELERATING: 'accelerating', 
    APPROACHING: 'approaching',
    ORIENTING: 'orienting'
};

/**
 * MyHelicopter - Creates and manages the helicopter with physics and animation
 * @constructor
 * @param scene           - Reference to MyScene object
 * @param initialPosition - Initial helicopter position (default: null for origin)
 * @param textures        - Object containing required textures (heliBody, heliGlass)
 */
export class MyHelicopter extends CGFobject {
    constructor(scene, initialPosition = null, textures = {}) {
        super(scene);
        this.scene = scene;
        this.textures = textures;

        // Use the provided initial position or default values
        if (initialPosition) {
            this.position = { 
                x: initialPosition.x || 0, 
                y: initialPosition.y + 0.8 || 0.8, 
                z: initialPosition.z || 0 
            };
        } else {
            this.position = { x: 0, y: 0.8, z: 0 };
        }
        
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
        
        // Bucket deployment (0 = retracted, 1 = fully deployed)
        this.bucketDeployment = 0;
        
        // Target for auto-return
        this.targetPosition = { x: 0, z: 0 };
        
        // Auto-return state tracking
        this.autoReturnPhase = AutoReturnPhase.TURNING;
        this.autoReturnStartTime = 0;
    
        // Store initial orientation for reset (typically 0)
        this.initialOrientation = 0;
        
        // Water collection properties
        this.hasWater = false;
        this.waterCollectionHeight = 2;
        
        // Water dropping animation properties
        this.waterDropAnimation = {
            active: false,
            progress: 0,
            duration: 2.0,
            waterY: 0,
            waterScale: 1,
            bucketOpen: 0
        };
        
        // Create helicopter components
        this.initializeComponents();
    }

    /**
     * Initialize all geometric components of the helicopter
     * Creates body, tail, rotors, blades, and bucket components
     */
    initializeComponents() {
        this.body = new MySphere(this.scene, 1, 20, 20);
        this.tail = new MyTail(this.scene);
        
        // Use MyBucketCylinder instead of multiple cylinder classes
        this.rotor = new MyBucketCylinder(this.scene, 20, 1, false, false);
        this.tailRotor = new MyBucketCylinder(this.scene, 8, 1, false, false);
        this.tailConnector = new MyBucketCylinder(this.scene, 20, 1, true, true);
        
        this.blade = new MyBlade(this.scene);
        this.ski = new MyUnitCube(this.scene);
        this.skiSupport = new MyUnitCube(this.scene);
        this.verticalFin = new MyVerticalFin(this.scene);
        
        // Bucket and rope for water transport
        this.bucket = new MyBucket(this.scene);
        this.rope = new MyRope(this.scene);
        this.waterCone = new MyCone(this.scene, 24, 10, 1, 1); // Inicialização simples


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

        this.waterMaterial = new CGFappearance(this.scene);
        this.waterMaterial.setAmbient(0.5, 0.5, 0.5, 1.0);     // Iluminação ambiente mais forte
        this.waterMaterial.setDiffuse(0.9, 0.9, 0.9, 1.0);     // Reflete mais luz difusa
        this.waterMaterial.setSpecular(0.6, 0.6, 0.6, 1.0);    // Reflexo especular mais leve
        this.waterMaterial.setShininess(10.0);                // Brilho mais suave

        if (this.textures.water) {
            this.waterMaterial.setTexture(this.textures.water);
            this.waterMaterial.setTextureWrap('REPEAT', 'REPEAT');
        }
    }

    /**
     * Check if helicopter is currently in landed state
     * @return {boolean} True if helicopter is landed
     */
    get isLanded() {
        return this.state === HeliState.LANDED;
    }

    /**
     * Updates helicopter state and animations
     * @param delta_t - Time elapsed since last update in milliseconds
     */
    update(delta_t) {
        const dt = delta_t * 0.001;
        
        // Bucket deployment logic based on helicopter state
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
            case HeliState.DESCENDING_TO_WATER: this.updateDescentToWater(dt); break;
            case HeliState.ASCENDING_FROM_WATER: this.updateAscentFromWater(dt); break;
            case HeliState.DROPPING_WATER: this.updateWaterDrop(dt); break;
        }
        this.updateRotors(dt);
        this.updateTilt();
        this.updateSideTilt();
        
        // Enforce position limits after all position updates
        this.enforcePositionLimits();
    }

    /**
     * Helper method for smooth value transitions
     * @param current - Current value
     * @param target  - Target value
     * @param step    - Maximum change per update
     * @return {number} Updated value
     */
    _updateValue(current, target, step) {
        if (Math.abs(target - current) < step) return target;
        return current + Math.sign(target - current) * step;
    }

    /**
     * Update rotor animations based on helicopter state
     * Adjusts rotation speeds for main and tail rotors
     * @param dt - Time delta in seconds
     */
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
                
                // Increase tail rotor speed during turning
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
    
    /**
     * Update helicopter position during ascent
     * Controls vertical speed and transition to cruising
     * @param dt - Time delta in seconds
     */
    updateAscent(dt) {
        const verticalAcceleration = 0.002 * dt * 1000 * this.scene.speedFactor;
        this.verticalSpeed = Math.min(
            this.verticalSpeed + verticalAcceleration,
            this.config.maxVerticalSpeed
        );
        this.position.y += this.verticalSpeed;
        
        // When reaching cruise altitude
        if (this.position.y >= this.config.cruiseAltitude) {
            this.position.y = this.config.cruiseAltitude;
            this.verticalSpeed = 0;
            this.state = HeliState.CRUISING;
        }
    }
    
    /**
     * Update helicopter position during cruising
     * Handles deceleration when not accelerating
     * @param dt - Time delta in seconds
     */
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
    
    /**
     * Update helicopter position during descent
     * Controls vertical speed and landing sequence
     * @param dt - Time delta in seconds
     */
    updateDescent(dt) {
        const verticalDeceleration = this.config.verticalAcceleration * 2.0 * dt * 1000 * this.scene.speedFactor;
        
        this.verticalSpeed = Math.max(
            this.verticalSpeed - verticalDeceleration,
            -this.config.maxVerticalSpeed * 1.5
        );
        this.position.y += this.verticalSpeed;
        
        // Change this check to use the exact initial y position
        if (this.position.y <= this.initialPosition.y) {
            // Set exact position and orientation values when landing
            this.position.x = this.initialPosition.x;
            this.position.y = this.initialPosition.y;
            this.position.z = this.initialPosition.z;
            this.orientation = 0;
            
            this.verticalSpeed = 0;
            this.state = HeliState.LANDED;
        }
    }

    /**
     * Update helicopter position during auto-return
     * Handles multi-phase return to landing pad sequence
     */
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
        
        if (distance < 0.4) {
            // Snap exactly to target position
            this.position.x = this.targetPosition.x;
            this.position.z = this.targetPosition.z;
            this.speed = 0;
            this.velocity = { x: 0, y: 0, z: 0 };
            
            // Start orientation phase before descent
            this.autoReturnPhase = AutoReturnPhase.ORIENTING;
            this.isTurning = true;
            this.isAccelerating = false;
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
        this.position.x += this.velocity.x * 1.5;
        this.position.z += this.velocity.z * 1.5;
        
        this.tiltAngle = -1.5 * this.speed;
        this.tiltAngle = Math.max(-this.config.maxTiltAngle, 
                         Math.min(this.config.maxTiltAngle, this.tiltAngle));
    }

    /**
     * Handle turning phase of auto-return
     * Rotates helicopter to face target position
     * @param dx - X distance to target
     * @param dz - Z distance to target
     */
    _handleTurningPhase(dx, dz) {
        // Stop forward movement during turn
        this.speed = 0;
        this.velocity = { x: 0, y: 0, z: 0 };
        this.isAccelerating = false;
        
        // Calculate angle to target
        const targetOrientation = Math.atan2(-dx, dz); 
        
        // Calculate the angle difference 
        let angleDiff = this.normalizeAngle(targetOrientation - this.orientation);
        
        // Check if we're close enough to the target orientation
        if (Math.abs(angleDiff) < 0.02) {
            // Snap exactly to target orientation
            this.orientation = targetOrientation;
            this.isTurning = false;
            this.autoReturnPhase = AutoReturnPhase.ACCELERATING;
        } else {
            // Turn in the most efficient direction
            const turnDirection = angleDiff > 0 ? 1 : -1;
            const turnAmount = Math.min(Math.abs(angleDiff), 0.06 * this.scene.speedFactor);
            this.orientation = this.normalizeAngle(this.orientation + turnDirection * turnAmount);
            this.isTurning = true;
        }
    }

    /**
     * Handle accelerating phase of auto-return
     * Adjusts helicopter speed based on distance to target
     * @param distance - Distance to target position
     */
    _handleAcceleratingPhase(distance) {
        this.isTurning = false;
        this.isAccelerating = true;
        
        if (distance > 5) {
            this.speed = 0.4; // Faster when far away
        } else {
            this.speed = 0.25; // Medium speed when closer
        }
        
        // Update velocity
        this.updateVelocityDirection();
        
        // Switch to approach phase when closer
        if (distance < 3) {
            this.autoReturnPhase = AutoReturnPhase.APPROACHING;
        }
    }

    /**
     * Handle approaching phase of auto-return
     * Gradually decreases speed as helicopter nears target
     * @param distance - Distance to target position
     */
    _handleApproachingPhase(distance) {
        this.isTurning = false;
        this.isAccelerating = true;
        
        this.speed = Math.min(0.1, distance * 0.2);
        this.updateVelocityDirection();
        
        // Even for very close approach, still maintain reasonable speed
        if (distance < 0.5) {
            this.speed = Math.min(0.05, distance * 0.1);
            this.updateVelocityDirection();
        }
    }

    /**
     * Handle orienting phase of auto-return
     * Rotates helicopter to initial orientation before landing
     */
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
        } else {
            // Turn in the most efficient direction
            const turnDirection = angleDiff > 0 ? 1 : -1;
            const turnAmount = Math.min(Math.abs(angleDiff), 0.06 * this.scene.speedFactor);
            this.orientation = this.normalizeAngle(this.orientation + turnDirection * turnAmount);
            this.isTurning = true;
        }
    }
    
    /**
     * Update helicopter position during descent to water
     * Controls vertical speed and water collection
     * @param dt - Time delta in seconds
     */
    updateDescentToWater(dt) {
        const waterLevel = this.waterCollectionHeight;
        
        const verticalAcceleration = this.config.verticalAcceleration * 4.0 * dt * 1000 * this.scene.speedFactor;
        
        this.verticalSpeed = Math.max(
            this.verticalSpeed - verticalAcceleration,
            -this.config.maxVerticalSpeed * 1.5
        );
        
        // Update position
        this.position.y += this.verticalSpeed;
        
        // Only start braking when very close to water
        if (this.position.y <= waterLevel + 0.3) {
            const brakingForce = this.config.verticalAcceleration * 6.0 * dt * 1000;
            this.verticalSpeed = Math.min(this.verticalSpeed + brakingForce, -0.01);
        }
        
        // When bucket reaches water level
        if (this.position.y <= waterLevel) {
            this.position.y = waterLevel;
            this.verticalSpeed = 0;
            
            // Fill bucket with water
            if (!this.hasWater) {
                this.hasWater = true;
            }
        }
    }

    /**
     * Update helicopter position during ascent from water
     * Controls vertical speed and transition to cruising
     * @param dt - Time delta in seconds
     */
    updateAscentFromWater(dt) {
        const verticalAcceleration = 0.004 * dt * 1000 * this.scene.speedFactor;
        
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

    /**
     * Update water dropping animation
     * Controls bucket opening, water falling, and fire extinguishing
     * @param dt - Time delta in seconds
     */
    updateWaterDrop(dt) {
        // Update animation progress
        this.waterDropAnimation.progress += dt / this.waterDropAnimation.duration;
        
        if (this.waterDropAnimation.progress >= 1.0) {
            // Animation complete
            this.waterDropAnimation.active = false;
            this.hasWater = false;
            this.state = HeliState.CRUISING;
            
            // Explicitly reset bucket open state to ensure it's fully closed
            this.waterDropAnimation.bucketOpen = 0;
            
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
        
        
        // Bucket opening/closing animation
        if (this.waterDropAnimation.progress < 0.2) {
            // Opening phase (0-20%)
            this.waterDropAnimation.bucketOpen = this.waterDropAnimation.progress / 0.2;
        } else if (this.waterDropAnimation.progress > 0.8) {
            // Closing phase (80-100%)
            this.waterDropAnimation.bucketOpen = 1.0 - ((this.waterDropAnimation.progress - 0.8) / 0.2);
        } else {
            // Fully open phase (20-80%)
            this.waterDropAnimation.bucketOpen = 1.0;
        }
        
        // Water falling animation (starts only AFTER bucket fully opens)
        if (this.waterDropAnimation.progress > 0.2) {
            // Adjust the fall progress to span from 20% to 90% of the animation
            const fallProgress = Math.min(1.0, (this.waterDropAnimation.progress - 0.2) / 0.7);
            
            // Water position - use ease-in quad for natural falling acceleration
            const easeInQuad = fallProgress * fallProgress * (2 - fallProgress); // Easing function
            
            // Distance from helicopter to ground
            const groundY = 0.5; // Estimated ground level
            const maxFallDistance = this.position.y - groundY;
            this.waterDropAnimation.waterY = easeInQuad * maxFallDistance;
            
            // Water expansion - starts small, then expands as it falls
            this.waterDropAnimation.waterScale = 1 + (fallProgress * 6); // Expands to 7x original size
        }
    }
    
    /**
     * Normalize angle to range [-π, π]
     * @param angle - Angle in radians
     * @return {number} Normalized angle
     */
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }
    
    /**
     * Update helicopter tilt based on speed
     * Creates realistic forward tilt during movement
     */
    updateTilt() {
        this.tiltAngle = -1.5 * this.speed;
        this.tiltAngle = Math.max(-this.config.maxTiltAngle, 
                               Math.min(this.config.maxTiltAngle, this.tiltAngle));
    }

    /**
     * Update side tilt based on turning rate
     * Creates realistic banking during turns
     */
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
     
    /**
     * Apply turning input from user
     * Rotates helicopter around Y axis during cruising
     * @param v - Turn value (-1 to 1)
     */
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

    /**
     * Apply acceleration input from user
     * Changes helicopter speed during cruising
     * @param v - Acceleration value (-1 to 1)
     */
    accelerate(v) {
        // Only allow acceleration during CRUISING state
        if (this.state !== HeliState.CRUISING) return;
        
        this.isAccelerating = true;
        const accelerationValue = v * 1.2 * this.scene.speedFactor;
        this.speed += accelerationValue;
        this.speed = Math.max(-this.config.maxSpeed, Math.min(this.config.maxSpeed, this.speed));
        this.updateVelocityDirection();
    }

    /**
     * Set the turning state of the helicopter
     * @param state - Boolean indicating if turning should be active
     */
    setTurning(state) {
        // Only allow changing turning state during CRUISING
        if (this.state !== HeliState.CRUISING) return;
        
        this.isTurning = state;
        if (!state) this.lastTurnValue = 0;
    }

    /**
     * Set the acceleration state of the helicopter
     * @param state - Boolean indicating if acceleration should be active
     */
    setForwardAccelerating(state) {
        // Only allow changing acceleration state during CRUISING
        if (this.state !== HeliState.CRUISING) return;
        
        this.isAccelerating = state;
    }
    
    /**
     * Update velocity based on speed and orientation
     * Sets X and Z components of velocity vector
     */
    updateVelocityDirection() {
        this.velocity.x = -Math.sin(this.orientation) * this.speed;
        this.velocity.z = Math.cos(this.orientation) * this.speed;
    }
    
    /**
     * Start ascent from current position
     * Controls takeoff and water collection ascent
     */
    startAscent() {
        // If landed, take off normally
        if (this.state === HeliState.LANDED) {
            this.state = HeliState.ASCENDING;
            this.verticalSpeed = 0.03;
        } 
        // If at water level with water collected, ascend to cruising altitude
        else if (this.state === HeliState.DESCENDING_TO_WATER && this.hasWater) {
            this.state = HeliState.ASCENDING_FROM_WATER;
            this.verticalSpeed = 0.03;
        }
    }

    /**
     * Drop water from the bucket
     * Initiates water dropping animation and fire extinguishing
     * @return {boolean} True if water drop initiated successfully
     */
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
    
    /**
     * Start descent from current position
     * Handles water collection or auto-return to helipad
     */
    startDescent() {
        // If cruising over water and bucket is empty, descend to collect water
        if (this.state === HeliState.CRUISING && this.isOverWater() && !this.hasWater) {
            this.state = HeliState.DESCENDING_TO_WATER;
            this.verticalSpeed = 0;
            return;
        }

        if (this.hasWater) {
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

    /**
     * Check if helicopter is positioned over water
     * @return {boolean} True if helicopter is over water
     */
    isOverWater() {
        if (!this.scene || !this.scene.ground || !this.scene.ground.maskReady) {
            return false;
        }
        
        // Direct lake check with corrected coordinates
        return this.scene.ground.isLake(this.position.z, this.position.x);
    }

    /**
     * Reset helicopter position and state
     * Returns to initial position on the helipad
     */
    resetPosition() {
        this.position = { ...this.initialPosition };
        this.orientation = 0;
        this.velocity = { x: 0, y: 0, z: 0 };
        this.speed = 0;
        this.verticalSpeed = 0;
        this.state = HeliState.LANDED;
        this.tiltAngle = 0;
        this.sideTiltAngle = 0;
        this.bucketDeployment = 0;
        this.hasWater = false; // Reset water state
    }
    
    /**
     * Get current helicopter position
     * @return {Object} Position object with x, y, z coordinates
     */
    getPosition() {
        return this.position;
    }

    /**
     * Display water falling animation
     * Creates water stream effect during water drop
     * @param bucketY - Y position of bucket relative to helicopter
     */
    displayWaterDrop(bucketY) {
    const waterMaterial = this.waterMaterial;

    const bucketWorldX = this.position.x;
    const bucketWorldY = this.position.y + bucketY;
    const bucketWorldZ = this.position.z;

    this.scene.pushMatrix();

    // Topo fixo na boca do balde
    this.scene.translate(bucketWorldZ, bucketWorldY, bucketWorldX);

    const progress = this.waterDropAnimation.progress;

    const fallProgress = Math.min(1.0, (progress - 0.2) / 0.7); // 0 → 1
    const easeInQuad = fallProgress * fallProgress;

    const groundY = 3;
    const maxFallDistance = this.position.y - groundY -4;
    const height = easeInQuad * maxFallDistance;

    const spreadFactor = 30; // controla quanto aumenta
    const baseRadius = this.bucket.getRimRadius() * (1 + fallProgress * spreadFactor);

    this.scene.scale(baseRadius, height, baseRadius);
    this.scene.translate(0, -1, 0);

    waterMaterial.apply();
    this.waterCone.display();

    this.scene.popMatrix();
}





    /**
     * Display the complete helicopter model
     * Renders all helicopter components with proper transformations
     */
    display() {
        // Begin helicopter transformation
        this.scene.pushMatrix();
        this.scene.translate(this.position.z, this.position.y, this.position.x);
        this.scene.rotate(this.orientation, 0, 1, 0);
        this.scene.rotate(this.tiltAngle, 0, 0, 1);
        this.scene.rotate(this.sideTiltAngle, 1, 0, 0);

        // Apply helicopter material explicitly before drawing helicopter parts
        this.helicopterMaterial.apply();

        // Body
        this.scene.pushMatrix();
        this.scene.scale(1, 0.5, 0.5);
        this.body.display();
        this.scene.popMatrix();

        // Cabine (vidro frontal) - explicitly apply glass material
        this.scene.pushMatrix();
        this.scene.translate(0.5, 0.11, 0);
        this.scene.scale(0.45, 0.35, 0.4);
        this.glassMaterial.apply();
        this.body.display();
        this.scene.popMatrix();

        // Reapply helicopter material for remaining parts
        this.helicopterMaterial.apply();

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
            const maxRopeLength = 2.0;
            const heliBottomY = -0.3;
            
            // Calculate positions based on deployment factor
            const ropeLength = this.bucketDeployment * maxRopeLength;
            const bucketY = heliBottomY - ropeLength - 0.4;
            
            // Display rope first (if long enough to be visible)
            if (ropeLength > 0.05) {
                this.scene.pushMatrix();
                this.scene.translate(0, heliBottomY, 0);
                // Explicitly apply helicopter material for rope
                this.helicopterMaterial.apply();
                this.rope.display(ropeLength);
                this.scene.popMatrix();
            }
            
            // Display bucket with water state
            this.scene.pushMatrix();
            this.scene.translate(0, bucketY, 0);
            
            // Only show water in bucket if not dropping or bucket is not fully open
            const showWaterInBucket = this.hasWater && 
                (!this.waterDropAnimation.active || this.waterDropAnimation.bucketOpen < 0.8);
            
            // Pass bucket opening state and display
            this.bucket.display(showWaterInBucket, this.waterDropAnimation.bucketOpen);
            this.scene.popMatrix();
            
            // Display falling water if animation is active and bucket is opened enough
            if (this.waterDropAnimation.active && this.waterDropAnimation.bucketOpen > 0.8) {
                this.scene.popMatrix(); // sair do helicóptero
                this.displayWaterDrop(bucketY);
                this.scene.pushMatrix(); // voltar ao helicóptero
                this.scene.translate(this.position.z, this.position.y, this.position.x);
                this.scene.rotate(this.orientation, 0, 1, 0);
                this.scene.rotate(this.tiltAngle, 0, 0, 1);
                this.scene.rotate(this.sideTiltAngle, 1, 0, 0);

            }
        }

        // Reapply helicopter material for remaining parts
        this.helicopterMaterial.apply();

        // Skis
        this.displaySkis();

        // Tail rotor assembly
        this.scene.pushMatrix();
        this.scene.translate(-2.5, 0.3, 0.04);
        this.scene.rotate(this.tailRotorAngle, 0, 0, 1);
        
        // Add the tail rotor hub before the blades
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -0.09);
        this.scene.scale(0.17, 0.17, 0.1);
        this.tailRotor.display();
        this.scene.popMatrix();
        
        // Draw tail rotor blades
        for (let i = 0; i < 4; i++) {
            this.scene.pushMatrix();
            this.scene.translate(0, 0, -0.04);
            this.scene.rotate(i * Math.PI / 2, 0, 0, 1);
            this.scene.scale(0.2, 0.5, 0.5);
            this.blade.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();

        // Display the vertical fin
        this.scene.pushMatrix();
        this.scene.translate(-2.6, 0.12, 0); // Position at the tail tip
        this.scene.rotate(-Math.PI/2, 0, 1, 0); // Rotate to correct orientation
        this.verticalFin.display(this.helicopterMaterial);
        this.scene.popMatrix();

        // Tail rotor support cylinder
        this.scene.pushMatrix();
        this.scene.translate(-2.5, 0.12, 0); 
        this.scene.scale(0.05, 0.2, 0.05);
        this.tailConnector.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
    
    /**
     * Display the helicopter landing skis
     * Creates landing gear with supports
     */
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

    /**
     * Enforce position limits to keep helicopter within world boundaries
     * Prevents helicopter from flying outside the map
     */
    enforcePositionLimits() {
        const scene = this.scene;
        if (!scene || !scene.worldBounds) return;
        
        // Clamp position values to world boundaries
        this.position.x = Math.max(
            scene.worldBounds.minX, 
            Math.min(scene.worldBounds.maxX, this.position.x)
        );
        
        this.position.z = Math.max(
            scene.worldBounds.minZ,
            Math.min(scene.worldBounds.maxZ, this.position.z)
        );
    }
}