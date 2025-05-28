import { CGFobject, CGFappearance} from '../lib/CGF.js';
import { MyUnitCube } from './MyUnitCube.js';
import { MyWindow } from './MyWindow.js';
import { MyHelipadLight } from './MyHelipadLight.js';
import { MyPlane } from './MyPlane.js';

// Heliport animation
const HeliportState = {
    NEUTRAL: 'neutral',
    TAKEOFF: 'takeoff',
    LANDING: 'landing'
};

// Main module class
export class MyMainModule extends CGFobject {
    constructor(scene, width, numFloors, windowsPerFloor, windowSize, color, textures = {}) {
        super(scene);
        this.scene = scene;
        this.textures = textures;
        
        // Textures
        this.doorTexture = textures.door;
        this.heliportTexture = textures.helipad;
        this.upTexture = textures.up;
        this.downTexture = textures.down;
        this.wallTexture = textures.wall;
        this.roofTexture = textures.roof;

        // Animation state properties
        this.heliportState = HeliportState.NEUTRAL;
        this.flashTimer = 0;
        this.flashInterval = 500; // Flash every 500ms
        this.isShowingAlternate = false;
        this.lastStateChangeTime = 0;

        // Dimensions
        this.width = width;
        this.depth = width * 0.75;
        this.numFloors = numFloors;
        this.totalHeight = width;
        this.floorHeight = width / numFloors;
        this.helipadSize = this.depth * 0.5;

        // Main structure - use cube without top face
        this.cube = new MyUnitCube(scene, 2, { includeTop: false });
        
        // Create plane for roof
        this.roofPlane = new MyPlane(scene, 20, 0, 1, 0, 1);

        // Windows (start from floor 1)
        this.window = new MyWindow(scene, textures.window, windowSize, windowSize);
        this.initWindowPositions(windowsPerFloor, windowSize);

        // Special elements
        this.door = new MyWindow(scene, null, this.floorHeight * 0.8, this.floorHeight, true, this.doorTexture);
        this.helipad = new MyWindow(scene, this.heliportTexture, this.depth * 0.5, this.depth * 0.5);

        // Calculate light size relative to helipad
        const lightSizeFactor = this.helipadSize / 5;  // Lights will be 1/5 of helipad size

        // NEW: Corner lights with size proportional to helipad
        this.cornerLights = [];
        for (let i = 0; i < 4; i++) {
            this.cornerLights.push(new MyHelipadLight(scene, lightSizeFactor));
        }

        // Materials
        this.wallMaterial = new CGFappearance(scene);
        this.wallMaterial.setAmbient(...color);
        this.wallMaterial.setDiffuse(...color);
        
        if (this.wallTexture) {
            this.wallMaterial.setTexture(this.wallTexture);
            this.wallMaterial.setTextureWrap('REPEAT', 'REPEAT');
        }
        
        // Set up roof material
        this.roofMaterial = new CGFappearance(scene);
        this.roofMaterial.setAmbient(0.5, 0.5, 0.5, 1);
        this.roofMaterial.setDiffuse(0.7, 0.7, 0.7, 1);
        if (this.roofTexture) {
            this.roofMaterial.setTexture(this.roofTexture);
            this.roofMaterial.setTextureWrap('REPEAT', 'REPEAT');
        }
    }

    initWindowPositions(windowsPerFloor, windowSize) {
        this.windowPositions = [];
        const totalWindowWidth = windowsPerFloor * windowSize;
        const availableWidth = this.width * 0.8;
        const totalSpacing = availableWidth - totalWindowWidth;
        const spacing = totalSpacing / (windowsPerFloor + 1);
    
        const startX = -availableWidth / 2;
    
        // Start from floor 1 instead of 0
        for (let floor = 1; floor < this.numFloors; floor++) {
            for (let i = 0; i < windowsPerFloor; i++) {
                const x = startX + spacing * (i + 1) + windowSize * i + windowSize / 2;
                const y = (floor * this.floorHeight) + (this.floorHeight / 2);
                this.windowPositions.push({ x, y });
            }
        }
    }

    // Update method to be called from scene's update
    update(t) {
        // Return to neutral state after 5 seconds of animation, but only for takeoff
        // Landing animation will continue until helicopter is fully landed
        if (this.heliportState === HeliportState.TAKEOFF) {
            if (t - this.lastStateChangeTime > 5000) {
                this.setHeliportState(HeliportState.NEUTRAL, t);
            }
        }

        // Handle texture flashing
        if (this.heliportState !== HeliportState.NEUTRAL) {
            // Check if it's time to toggle the texture
            if (t - this.flashTimer > this.flashInterval) {
                this.flashTimer = t;
                this.isShowingAlternate = !this.isShowingAlternate;
                this.updateHelipadTexture();
            }

            // NEW: Update corner lights with pulsing effect
            this.updateCornerLights(t);
        } else {
            // In neutral state, always show the normal texture
            if (this.isShowingAlternate) {
                this.isShowingAlternate = false;
                this.updateHelipadTexture();
            }

            // Turn off corner lights in neutral state
            this.cornerLights.forEach(light => light.setActive(false));
        }
    }

    // NEW: Update corner lights with pulsing effect
    updateCornerLights(t) {
        // Create sinusoidal pulsing effect
        const sinValue = Math.sin(t * 0.010) * 0.5 + 0.5; // Range 0-1
        const pulseIntensity = sinValue; // Range 0.5-1.0

        // Update all corner lights with current intensity
        this.cornerLights.forEach(light => {
            light.setActive(true, pulseIntensity);
        });
    }

    // Update the helipad texture based on current state and flash status
    updateHelipadTexture() {
        if (this.isShowingAlternate) {
            if (this.heliportState === HeliportState.TAKEOFF) {
                this.helipad.material.setTexture(this.upTexture);
            } else if (this.heliportState === HeliportState.LANDING) {
                this.helipad.material.setTexture(this.downTexture);
            }
        } else {
            this.helipad.material.setTexture(this.heliportTexture);
        }
    }
    
    // Method to set heliport state
    setHeliportState(state, t) {
        this.heliportState = state;
        this.lastStateChangeTime = t;
        this.flashTimer = t;
        
        // Begin with alternate texture immediately for better visibility
        if (state === 'takeoff' || state === 'landing') {
            this.isShowingAlternate = true;

            // Apply the appropriate texture immediately - fixed property name
            if (state === 'takeoff') {
                this.helipad.material.setTexture(this.upTexture);
            } else {
                this.helipad.material.setTexture(this.downTexture);
            }

            // Activate corner lights immediately
            this.cornerLights.forEach(light => light.setActive(true, 0.75));
        } else {
            // For neutral state, use normal H texture and turn off lights
            this.isShowingAlternate = false;
            this.helipad.material.setTexture(this.heliportTexture);
            this.cornerLights.forEach(light => light.setActive(false));
        }
    }
    
    // Method to get the helipad position for the helicopter's initial position
    getHelipadPosition() {
        return {
            x: 0,
            y: this.totalHeight,
            z: 0
        };
    }

    displayStructure() {
        // Display main building walls
        this.scene.pushMatrix();
        this.scene.scale(this.width, this.totalHeight, this.depth);
        this.wallMaterial.apply();
        this.cube.display();
        this.scene.popMatrix();
        
        // Display roof as a separate plane if we have a texture
        if (this.roofTexture) {
            this.scene.pushMatrix();
            
            // Position on top of the building
            this.scene.translate(0, this.totalHeight + 0.001, 0);
            
            // Rotate to horizontal
            this.scene.rotate(-Math.PI/2, 1, 0, 0);
            
            // Scale to match building dimensions
            this.scene.scale(this.width, this.depth, 1);
            
            // Apply roof material
            this.roofMaterial.apply();
            
            // Display the roof plane
            this.roofPlane.display();
            
            this.scene.popMatrix();
        }
    }

    displayWindows() {
        for (const pos of this.windowPositions) {
            this.scene.pushMatrix();
            this.scene.translate(pos.x, pos.y, this.depth/2 + 0.01);
            this.window.display();
            this.scene.popMatrix();
        }
    }

    displayDoor() {
        this.scene.pushMatrix();
        this.scene.translate(0, this.floorHeight/2, this.depth/2 + 0.01);
        this.door.display();
        this.scene.popMatrix();
    }

    // NEW: Updated to include corner lights
    displayHelipad() {
        // Use the stored helipad size
        const cornerOffset = this.helipadSize * 0.4;
        
        this.scene.pushMatrix();
        this.scene.translate(0, this.totalHeight + 0.01, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        
        // Display helipad texture
        this.helipad.display();

        // Display corner lights
        for (let i = 0; i < 4; i++) {
            const x = ((i % 2) * 2 - 1) * cornerOffset;
            const z = (Math.floor(i / 2) * 2 - 1) * cornerOffset;

            this.scene.pushMatrix();
            // Position at the corner
            this.scene.translate(x, z, 0.001);

            // Display the light
            this.cornerLights[i].display();
            this.scene.popMatrix();
        }
        
        this.scene.popMatrix();
    }
    
    // Update display method sequence to ensure proper layering
    display() {
        this.scene.pushMatrix();
        
        // Main structure with borders
        this.displayStructure();
        
        // Special elements and windows (now after structure+borders)
        this.displayWindows();
        this.displayDoor();
        this.displayHelipad();
        
        this.scene.popMatrix();
    }
}