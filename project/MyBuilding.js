// MyBuilding.js
import { CGFobject } from '../lib/CGF.js';
import { MyModule } from './MyModule.js';
import { MyMainModule } from './MyMainModule.js';

export class MyBuilding extends CGFobject {
    constructor(scene, width, numFloors, windowsPerFloor, windowTextures, color, textures = {}) {
        super(scene);
        this.scene = scene;
        this.textures = textures;
        
        // Calculate module dimensions
        this.mainWidth = width;
        this.lateralWidth = width * 0.75;
        this.moduleSpacing = (this.mainWidth + this.lateralWidth) / 2;

        const windowSize = Math.min(((this.lateralWidth * 0.8) / windowsPerFloor) * 0.8, (this.lateralWidth / (numFloors)) * 0.6);

        
        // Create modules
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
                1
            ),

            // Main central module
            new MyMainModule(
                scene,
                this.mainWidth,
                numFloors + 1, // +1 floor for main module
                windowsPerFloor,
                windowSize,
                color,
                {
                    window: windowTextures[1],
                    door: scene.textures.door,
                    helipad: scene.textures.helipad,
                    up: scene.textures.up,
                    down: scene.textures.down
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
                windowTextures[2], // Right texture
                1
            )
        ];
    }
    
    // Update the building with helicopter state
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
            this.mainModule.setHeliportState(heliportState, t);
        }

        this.lastHelicopterState = helicopterState;
        this.mainModule.update(t);
    }

    getHelipadPosition() {
        return this.mainModule.getHelipadPosition();
    }

    display() {
        this.mainModule.display();
    }
}