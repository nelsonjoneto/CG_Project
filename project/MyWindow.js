// MyWindow.js
import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyPlane } from './MyPlane.js';

export class MyWindow extends CGFobject {
    constructor(scene, texture, width=1, height=1, isDoor=false, doorTexture=null) {
        super(scene);
        this.scene = scene;
        this.isDoor = isDoor;
        // Window geometry
        this.plane = new MyPlane(scene, 1);
        
        if (isDoor) {
        this.material = new CGFappearance(scene);
        this.material.setTexture(doorTexture);
        this.material.setAmbient(0.4, 0.4, 0.4, 1.0);
        this.material.setDiffuse(0.7, 0.7, 0.7, 1.0);
        this.material.setSpecular(0.05, 0.05, 0.05, 1.0);
        this.material.setShininess(10.0);
    } else {
        this.material = new CGFappearance(scene);
        this.material.setTexture(texture);
        this.material.setAmbient(0.3, 0.3, 0.3, 1.0);
        this.material.setDiffuse(0.5, 0.5, 0.5, 1.0);
        this.material.setSpecular(0.8, 0.9, 1.0, 1.0);
        this.material.setShininess(200.0);
    }
        
        // Default window dimensions
        this.width = width;
        this.height = height;
    }

    display() {
        this.scene.pushMatrix();
        
        // Apply window texture
        this.material.apply();
        

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