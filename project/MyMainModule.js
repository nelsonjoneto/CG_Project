import { CGFobject, CGFappearance, CGFshader } from '../lib/CGF.js';
import { MyUnitCube } from './MyUnitCube.js';
import { MyWindow } from './MyWindow.js';

// Heliport animation states
const HeliportState = {
    NEUTRAL: 0,
    TAKEOFF: 1,
    LANDING: 2
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

        // Current heliport state
        this.heliportState = HeliportState.NEUTRAL;
        this.lastHeliportStateChange = 0;
        
        // Create heliport shader
        this.heliportShader = new CGFshader(
            this.scene.gl,
            "shaders/heliport.vert",
            "shaders/heliport.frag"
        );
        
        // Initialize shader uniforms
        this.heliportShader.setUniformsValues({
            uBaseTexture: 0,
            uManeuverTexture: 1,
            timeFactor: 0,
            isAnimating: 0
        });

        // Dimensions
        this.width = width;
        this.depth = width * 0.75;
        this.numFloors = numFloors;
        this.totalHeight = width;
        this.floorHeight = width / numFloors;

        // Main structure
        this.cube = new MyUnitCube(scene, 2);

        // Windows (start from floor 1)
        this.window = new MyWindow(scene, textures.window, windowSize, windowSize);
        this.initWindowPositions(windowsPerFloor, windowSize);

        // Special elements
        this.door = new MyWindow(scene, null, this.floorHeight * 0.8, this.floorHeight, true, this.doorTexture);
        this.helipad = new MyWindow(scene, this.heliportTexture, this.depth * 0.5, this.depth * 0.5);

        // Materials
        this.wallMaterial = new CGFappearance(scene);
        this.wallMaterial.setAmbient(...color);
        this.wallMaterial.setDiffuse(...color);
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
        // Update shader time factor for animation
        this.heliportShader.setUniformsValues({
            timeFactor: t * 0.001 % 1000
        });
        
        // Reset to neutral state after 5 seconds of animation
        if (this.heliportState !== HeliportState.NEUTRAL) {
            if (t - this.lastHeliportStateChange > 5000) {
                this.setHeliportState(HeliportState.NEUTRAL);
            }
        }
    }
    
    // Method to set heliport state
    setHeliportState(state) {
        this.heliportState = state;
        this.lastHeliportStateChange = Date.now();
        
        // Update shader uniforms based on state
        if (state === HeliportState.NEUTRAL) {
            this.heliportShader.setUniformsValues({
                isAnimating: 0
            });
        } else {
            this.heliportShader.setUniformsValues({
                isAnimating: 1
            });
        }
    }
    
    // Method to get the helipad position for the helicopter's initial position
    getHelipadPosition() {
        // Calculate the position on top of the main module
        return {
            x: 0,           // Centered horizontally
            y: this.totalHeight, // Top of the building
            z: 0            // Centered in depth
        };
    }

    displayStructure() {
        this.scene.pushMatrix();
        this.scene.scale(this.width, this.totalHeight, this.depth);
        this.wallMaterial.apply();
        this.cube.display();
        this.scene.popMatrix();
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

    displayHelipad() {
        // Save current shader
        const currentShader = this.scene.activeShader;
        
        // Use our heliport shader
        this.scene.setActiveShader(this.heliportShader);
        
        // Bind appropriate textures based on state
        this.heliportTexture.bind(0); // Base texture is always H
        
        // Bind the appropriate maneuver texture
        if (this.heliportState === HeliportState.TAKEOFF) {
            this.upTexture.bind(1);
        } else if (this.heliportState === HeliportState.LANDING) {
            this.downTexture.bind(1);
        } else {
            // In neutral state, just bind the base texture again
            this.heliportTexture.bind(1);
        }
        
        this.scene.pushMatrix();
        this.scene.translate(0, this.totalHeight + 0.01, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        
        this.helipad.display();
        this.scene.popMatrix();
        
        // Restore original shader
        this.scene.setActiveShader(currentShader);
    }
    
    display() {
        this.scene.pushMatrix();
        
        // Main structure
        this.displayStructure();
        
        // Windows
        this.displayWindows();
        
        // Special elements
        this.displayDoor();
        this.displayHelipad();
        
        this.scene.popMatrix();
    }
}