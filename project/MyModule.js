import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyUnitCube } from './MyUnitCube.js';
import { MyWindow } from './MyWindow.js';
import { MyPlane } from './MyPlane.js';
import { MyRoofBorder } from './MyRoofBorder.js';

export class MyModule extends CGFobject {
    constructor(scene, width, numFloors, windowsPerFloor, windowSize, color, windowTexture, buildingNumber, wallTexture = null, roofTexture = null) {
        super(scene);
        this.scene = scene;
        this.buildingNumber = buildingNumber;
        this.width = width;
        this.depth = width * 0.75;
        this.numFloors = numFloors;
        this.floorHeight = (width / 0.75) / (numFloors + 1);
        this.totalHeight = this.floorHeight * numFloors;
        
        this.cube = new MyUnitCube(scene, buildingNumber, { includeTop: false });
        
        this.roofPlane = new MyPlane(scene, 20, 0, 1, 0, 1);
        
        this.window = new MyWindow(scene, windowTexture, windowSize, windowSize, false);
        this.initWindowPositions(windowsPerFloor, windowSize);

        this.wallMaterial = new CGFappearance(scene);
        this.wallMaterial.setAmbient(...color);
        this.wallMaterial.setDiffuse(...color);
        if (wallTexture) {
            this.wallMaterial.setTexture(wallTexture);
            this.wallMaterial.setTextureWrap('REPEAT', 'REPEAT');
        }
        
        this.roofMaterial = new CGFappearance(scene);
        this.roofMaterial.setAmbient(0.5, 0.5, 0.5, 1);
        this.roofMaterial.setDiffuse(0.7, 0.7, 0.7, 1);
        if (roofTexture) {
            this.roofMaterial.setTexture(roofTexture);
            this.roofMaterial.setTextureWrap('REPEAT', 'REPEAT');
        }
        
        this.hasRoofTexture = !!roofTexture;

        const borderHeight = 0.5;
        const borderThickness = 0.5;
        this.borderHeight = borderHeight;
        this.borderThickness = borderThickness;

        this.roofBorder = new MyRoofBorder(this.scene, 1, 1, 1);
    }

    initWindowPositions(windowsPerFloor, windowSize) {
        this.windowPositions = [];
        const totalWindowWidth = windowsPerFloor * windowSize;
        const availableWidth = this.width * 0.8;
        const totalSpacing = availableWidth - totalWindowWidth;
        const spacing = totalSpacing / (windowsPerFloor + 1);
    
        const startX = -availableWidth / 2;
    
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
        this.scene.scale(this.width, this.totalHeight, this.depth);
        this.wallMaterial.apply();
        this.cube.display();
        this.scene.popMatrix();
        
        if (this.hasRoofTexture) {
            this.scene.pushMatrix();

            this.scene.translate(0, this.totalHeight + 0.001, 0);
            
            this.scene.rotate(-Math.PI/2, 1, 0, 0);
            
            this.scene.scale(this.width, this.depth, 1);

            this.roofMaterial.apply();
            
            this.roofPlane.display();
            
            this.scene.popMatrix();
        }
    }
    displayRoofBorder() {
        const y = this.totalHeight + this.borderHeight / 2 - this.borderHeight;
        const halfW = this.width / 2;
        const halfD = this.depth / 2;
        const t = this.borderThickness;

        // Decide que bordas desenhar consoante o número do módulo
        let segments = [
            // Frente
            { tx: 0, ty: 0, tz: halfD - t / 2, sx: this.width + 2 * t - 1, sy: this.borderHeight + 0.3, sz: t },
            // Trás
            { tx: 0, ty: 0, tz: -halfD + t / 2, sx: this.width + 2 * t - 1, sy: this.borderHeight + 0.3, sz: t }
        ];

        if (this.buildingNumber === 1) { // Esquerdo
            // Esquerda
            segments.push({ tx: -halfW - t / 2, ty: 0, tz: 0, sx: t, sy: this.borderHeight + 0.3, sz: this.depth + 2 * t - 1 });
        } else if (this.buildingNumber === 2) { // Direito
            // Direita
            segments.push({ tx: halfW + t / 2, ty: 0, tz: 0, sx: t, sy: this.borderHeight + 0.3, sz: this.depth + 2 * t - 1 });
        }

        for (let s of segments) {
            this.scene.pushMatrix();
            this.scene.translate(s.tx, y, s.tz);
            this.scene.scale(s.sx, s.sy, s.sz);
            this.roofMaterial.apply();
            this.roofBorder.display();
            this.scene.popMatrix();
        }
    }

    
    display() {
        this.scene.pushMatrix();

        this.displayStructure();
        this.displayRoofBorder();
        this.displayWindows();
        
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
}