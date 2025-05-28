import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyUnitCube } from './MyUnitCube.js';
import { MyWindow } from './MyWindow.js';
import { MyPlane } from './MyPlane.js';

export class MyModule extends CGFobject {
    constructor(scene, width, numFloors, windowsPerFloor, windowSize, color, windowTexture, buildingNumber, wallTexture = null, roofTexture = null) {
        super(scene);
        this.scene = scene;
        
        // Dimensions
        this.width = width;
        this.depth = width * 0.75;
        this.numFloors = numFloors;
        this.floorHeight = (width / 0.75) / (numFloors + 1);
        this.totalHeight = this.floorHeight * numFloors;
        
        // Create cube without top face for walls
        this.cube = new MyUnitCube(scene, buildingNumber, { includeTop: false });
        
        // Create roof plane
        this.roofPlane = new MyPlane(scene, 20, 0, 1, 0, 1);
        
        // Windows
        this.window = new MyWindow(scene, windowTexture, windowSize, windowSize, false);
        this.initWindowPositions(windowsPerFloor, windowSize);

        // Wall Material with texture
        this.wallMaterial = new CGFappearance(scene);
        this.wallMaterial.setAmbient(...color);
        this.wallMaterial.setDiffuse(...color);
        if (wallTexture) {
            this.wallMaterial.setTexture(wallTexture);
            this.wallMaterial.setTextureWrap('REPEAT', 'REPEAT');
        }
        
        // Roof Material with texture
        this.roofMaterial = new CGFappearance(scene);
        this.roofMaterial.setAmbient(0.5, 0.5, 0.5, 1);
        this.roofMaterial.setDiffuse(0.7, 0.7, 0.7, 1);
        if (roofTexture) {
            this.roofMaterial.setTexture(roofTexture);
            this.roofMaterial.setTextureWrap('REPEAT', 'REPEAT');
        }
        
        // Store if we have a roof texture
        this.hasRoofTexture = !!roofTexture;
    }

    initWindowPositions(windowsPerFloor, windowSize) {
        this.windowPositions = [];
        const totalWindowWidth = windowsPerFloor * windowSize;
        const availableWidth = this.width * 0.8;
        const totalSpacing = availableWidth - totalWindowWidth;
        const spacing = totalSpacing / (windowsPerFloor + 1);
    
        const startX = -availableWidth / 2;
    
        // Start from floor 1 instead of 0
        for (let floor = 0; floor < this.numFloors; floor++) {
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
        if (this.hasRoofTexture) {
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
    
    display() {
        this.scene.pushMatrix();
        
        // Draw scaled cube structure
        this.displayStructure();
        
        // Add windows
        this.displayWindows();
        
        this.scene.popMatrix();
    }

    displayWindows() {
        for (const pos of this.windowPositions) {
            this.scene.pushMatrix();
            // Position windows on front face (z = depth/2)
            this.scene.translate(pos.x, pos.y, this.depth/2 + 0.01);
            this.window.display();
            this.scene.popMatrix();
        }
    }
}