// MyWindow.js
import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyPlane } from './MyPlane.js';

export class MyWindow extends CGFobject {
    constructor(scene, texture, width=1, height=1) {
        super(scene);
        this.scene = scene;
        
        // Window geometry
        this.plane = new MyPlane(scene, 1);
        
        this.windowMaterial = new CGFappearance(scene);
        this.windowMaterial.setTexture(texture);
        this.windowMaterial.setAmbient(0.4, 0.4, 0.4, 1.0);   // Mais visível mesmo sem luz direta
        this.windowMaterial.setDiffuse(0.8, 0.8, 0.8, 1.0);   // Reflete bem a luz
        this.windowMaterial.setSpecular(1.0, 1.0, 1.0, 1.0);  // Reflexo especular forte
        this.windowMaterial.setShininess(100.0);   
        
        // Default window dimensions
        this.width = width;
        this.height = height;
    }

    display() {
        this.scene.pushMatrix();
        
        // Apply window texture
        this.windowMaterial.apply();
        
        // Scale to desired window size
        this.scene.scale(this.width, this.height, 1);
        
        // Display window plane
        this.plane.display();
        
        this.scene.popMatrix();
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }
}