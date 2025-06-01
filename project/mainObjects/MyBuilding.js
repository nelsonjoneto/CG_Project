import { CGFobject } from '../../lib/CGF.js';
import { MyModule } from '../objects/building/MyModule.js';
import { MyMainModule } from '../objects/building/MyMainModule.js';

/**
 * MyBuilding - Main building complex with helipad
 * @constructor
 * @param scene          - Reference to MyScene object
 * @param width          - Width of the main central module
 * @param numFloors      - Number of floors in the side modules (main has numFloors+1)
 * @param windowsPerFloor- Number of windows per floor for each module
 * @param windowTextures - Array of three window textures [left, main, right]
 * @param color          - RGBA color array for building walls
 * @param textures       - Object containing all required textures (door, helipad, up/down, wall, roof, sign)
 */
export class MyBuilding extends CGFobject {
    constructor(scene, width, numFloors, windowsPerFloor, windowTextures, color, textures = {}) {
        super(scene);
        this.scene = scene;
        
        // Initialize tracking variables
        this.isInLandingSequence = false;
        this.lastHelicopterState = null;
        
        // Calculate module dimensions
        this.mainWidth = width;
        this.lateralWidth = width * 0.75;
        this.moduleSpacing = (this.mainWidth + this.lateralWidth) / 2;

        const windowSize = Math.min(((this.lateralWidth * 0.8) / windowsPerFloor) * 0.8, (this.lateralWidth / (numFloors)) * 0.6);

        // Create modules with textures
        this.modules = [
            // Left module
            new MyModule(
                scene,
                this.lateralWidth,
                numFloors,
                windowsPerFloor,
                windowSize,
                color,
                windowTextures[0],
                1,              // building number
                textures.wall,  // wall texture
                textures.roof   // roof texture
            ),
            // Main module
            new MyMainModule(
                scene,
                this.mainWidth,
                numFloors + 1,
                windowsPerFloor,
                windowSize,
                color,
                {
                    window: windowTextures[1],
                    door: textures.door,
                    helipad: textures.helipad,
                    up: textures.up,
                    down: textures.down,
                    wall: textures.wall,
                    roof: textures.roof,
                    sign: textures.sign
                }
            ),
            // Right module
            new MyModule(
                scene,
                this.lateralWidth,
                numFloors,
                windowsPerFloor,
                windowSize,
                color,
                windowTextures[2],
                2,              // building number
                textures.wall,  // wall texture
                textures.roof   // roof texture
            )
        ];
    }
    
    /**
     * Update the building state based on helicopter state
     * Controls helipad animations for landing and takeoff sequences
     * @param t              - Current time in milliseconds
     * @param helicopterState- Current state of the helicopter
     */
    update(t, helicopterState) {
        // Determine heliport display state
        let heliportState = null;

        // Track landing sequence - starts with auto_returning and ends with landed
        if (helicopterState === 'auto_returning' || helicopterState === 'descending') {
            this.isInLandingSequence = true;
            heliportState = 'landing';
        }
        else if (helicopterState === 'ascending') {
            this.isInLandingSequence = false; // Reset landing sequence if we take off
            heliportState = 'takeoff';
        }
        else if (helicopterState === 'landed') {
            // Only switch to neutral if we were in a landing sequence
            if (this.isInLandingSequence) {
                console.log("Landing sequence complete, switching helipad to neutral");
                this.isInLandingSequence = false;
                heliportState = 'neutral';
            }
        }
        else {
            // Any other state doesn't affect landing sequence
            heliportState = this.isInLandingSequence ? 'landing' : 'neutral';
        }

        // Update heliport state if it changed
        if (heliportState !== null &&
            (helicopterState !== this.lastHelicopterState || heliportState === 'neutral')) {
            this.modules[1].setHeliportState(heliportState, t);
        }

        this.lastHelicopterState = helicopterState;
        this.modules[1].update(t);
    }
    
    /**
     * Get the position of the helipad for helicopter positioning
     * @return {Object} Position object with x, y, z coordinates
     */
    getHelipadPosition() {
        return this.modules[1].getHelipadPosition();
    }

    /**
     * Display the complete building complex
     * Renders left, main, and right modules at correct positions
     */
    display() {
        this.scene.pushMatrix();
        
        // Left module
        this.scene.pushMatrix();
        this.scene.translate(-this.moduleSpacing, 0, 0);
        this.modules[0].display();
        this.scene.popMatrix();
        
        // Main center module
        this.modules[1].display();
        
        // Right module
        this.scene.pushMatrix();
        this.scene.translate(this.moduleSpacing, 0, 0);
        this.modules[2].display();
        this.scene.popMatrix();
        
        this.scene.popMatrix();
    }
}