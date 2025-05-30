// MyPanorama.js
import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MySphere } from './MySphere.js';

export class MyPanorama extends CGFobject {
    constructor(scene, texture) {
        super(scene)
        this.texture = texture;
        
        // Create inverted sphere with large radius
        this.sphere = new MySphere(this.scene, 200, 40, 40, true);
        
        // Configure material properties
        this.material = new CGFappearance(this.scene);
        this.material.setEmission(1, 1, 1, 1);
        this.material.setTexture(texture);
        this.material.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        this.scene.pushMatrix(); 
        
        this.material.apply();
        
        // Follow camera position
        const camPos = this.scene.camera.position;
        this.scene.translate(camPos[0], camPos[1] - 90, camPos[2]);
        
        this.sphere.display();
        
        this.scene.popMatrix();
    }
}