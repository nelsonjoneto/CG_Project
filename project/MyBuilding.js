// MyBuilding.js
import { CGFobject } from '../lib/CGF.js';
import { MyMainModule } from './MyMainModule.js';

export class MyBuilding extends CGFobject {
    constructor(scene, width, numFloors, windowsPerFloor, windowTextures, color) {
        super(scene);
        
        // Create the main module
        this.mainModule = new MyMainModule(
            scene, 
            width, 
            numFloors, 
            windowsPerFloor,
            width / (windowsPerFloor + 1), // Window size
            color,
            windowTextures[0] // Use first texture for windows
        );
        
        this.lastHelicopterState = null; // Track previous state
        this.isInLandingSequence = false; // Track if we're in a landing sequence
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