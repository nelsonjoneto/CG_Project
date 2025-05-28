import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyUnitCube } from './MyUnitCube.js';
import { MyWindow } from './MyWindow.js';

export class MyModule extends CGFobject {
    constructor(scene, width, numFloors, windowsPerFloor, windowSize, color, windowTexture, buldingNumber) {
        super(scene);
        this.scene = scene;
        
        // Dimensions
        this.width = width;
        this.depth = width * 0.75;
        this.numFloors = numFloors;
        this.floorHeight = (width / 0.75) / (numFloors + 1);
        this.totalHeight = this.floorHeight * numFloors;

        // Main cube structure
        this.cube = new MyUnitCube(scene, buldingNumber);
        
        // Windows
        this.window = new MyWindow(scene, windowTexture, windowSize, windowSize, false);
        this.initWindowPositions(windowsPerFloor, windowSize);

        // Material
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
        for (let floor = 0; floor < this.numFloors; floor++) {
            for (let i = 0; i < windowsPerFloor; i++) {
                const x = startX + spacing * (i + 1) + windowSize * i + windowSize / 2;
                const y = (floor * this.floorHeight) + (this.floorHeight / 2);
                this.windowPositions.push({ x, y });
            }
        }
    }


    displayStructure() {
        this.scene.pushMatrix();
        
        // Scale unit cube to module dimensions
        this.scene.scale(
            this.width,
            this.totalHeight,
            this.depth
        );
        
        this.cube.display();
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

    display() {
        this.scene.pushMatrix();
        this.wallMaterial.apply();
        
        // Draw scaled cube structure
        this.displayStructure();
        
        // Add windows
        this.displayWindows();
        
        this.scene.popMatrix();
    }
}