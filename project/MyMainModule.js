import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyUnitCube } from './MyUnitCube.js';
import { MyWindow } from './MyWindow.js';
import { MyPlane } from './MyPlane.js';

export class MyMainModule extends CGFobject {
    constructor(scene, width, numFloors, windowsPerFloor, windowSize, color, textures = {}) {
        super(scene);
        this.scene = scene;
        
        // Textures
        this.doorTexture = textures.door;
        this.heliportTexture = textures.helipad;
        this.wallTexture = textures.wall;
        this.roofTexture = textures.roof;

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
    
        // Start from floor 1 instead of 0 (ground floor has door, not windows)
        for (let floor = 1; floor < this.numFloors; floor++) {
            for (let i = 0; i < windowsPerFloor; i++) {
                const x = startX + spacing * (i + 1) + windowSize * i + windowSize / 2;
                const y = (floor * this.floorHeight) + (this.floorHeight / 2);
                this.windowPositions.push({ x, y });
            }
        }
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

    displayHelipad() {
        this.scene.pushMatrix();
        this.scene.translate(0, this.totalHeight + 0.01, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        
        // Display helipad texture
        this.helipad.display();
        this.scene.popMatrix();
    }
    
    display() {
        this.scene.pushMatrix();
        
        // Main structure
        this.displayStructure();
        
        // Special elements and windows
        this.displayWindows();
        this.displayDoor();
        this.displayHelipad();
        
        this.scene.popMatrix();
    }
    
    // Method to get the helipad position (keep for future use with helicopter)
    getHelipadPosition() {
        return {
            x: 0,
            y: this.totalHeight,
            z: 0
        };
    }
}