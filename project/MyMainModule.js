import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyHelicopter } from './MyHeli.js';
import { MyUnitCube } from './MyUnitCube.js';
import { MyWindow } from './MyWindow.js';


// Main module class
export class MyMainModule extends CGFobject {
    constructor(scene, width, numFloors, windowsPerFloor, windowSize, color, windowTexture) {
        super(scene);
        this.scene = scene;

        this.helicopter = new MyHelicopter(scene);

        //Textures
        this.doorTexture = new CGFtexture(this.scene, "textures/door.png");
        this.heliportTexture = new CGFtexture(this.scene, "textures/heliport.png");

        // Dimensions
        this.width = width;
        this.depth = width * 0.75;
        this.numFloors = numFloors;
        this.totalHeight = width;
        this.floorHeight = width / numFloors;

        // Main structure
        this.cube = new MyUnitCube(scene, 2);

        // Windows (start from floor 1)
        this.window = new MyWindow(scene, windowTexture, windowSize, windowSize);
        this.initWindowPositions(windowsPerFloor, windowSize);

        // Special elements
        this.door = new MyWindow(scene, this.doorTexture, this.floorHeight * 0.8, this.floorHeight);
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
        this.scene.pushMatrix();
        this.scene.translate(0, this.totalHeight + 0.01, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        
        this.helipad.display();
        this.scene.popMatrix();
    }

    displayHelicopter() {
        this.scene.pushMatrix();
        this.scene.translate(0, this.totalHeight + 0.8, 0); // Posicione o helicóptero no heliponto
        this.helicopter.display();
        this.scene.popMatrix();
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
        this.displayHelicopter();
        this.scene.popMatrix();
    }
}