// MyWindow.js
import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyPlane } from './MyPlane.js';

export class MyWindow extends CGFobject {
    constructor(scene, texture, width=1, height=1, isDoor=false, doorTexture=null) {
        super(scene);
        this.scene = scene;
        this.isDoor = isDoor;

        this.plane = new MyPlane(scene, 1);
        
        if (isDoor) {
        this.material = new CGFappearance(scene);
        this.material.setTexture(doorTexture);
        this.material.setAmbient(0.7, 0.7, 0.7, 1.0);
        this.material.setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.material.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.material.setShininess(70.0);
    } else {
        this.material = new CGFappearance(scene);
        this.material.setTexture(texture);
        this.material.setAmbient(0.7, 0.7, 0.7, 1.0);   
        this.material.setDiffuse(1.0, 1.0, 1.0, 1.0);   
        this.material.setSpecular(0.2, 0.2, 0.2, 1.0);
        this.material.setShininess(200.0);
    }
        

        this.width = width;
        this.height = height;
    }

    display() {
        this.scene.pushMatrix();
        
        this.material.apply();
        
        this.scene.scale(this.width, this.height, 1);
        
        this.plane.display();
        
        this.scene.popMatrix();
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }
}