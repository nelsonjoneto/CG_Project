// MyGround.js
import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyPlane } from './MyPlane.js';

export class MyGround extends CGFobject {
    constructor(scene) {
        super(scene);
        this.plane = new MyPlane(scene, 90);
        this.groundMaterial = new CGFappearance(scene);
        this.groundTexture = new CGFtexture(scene, "textures/relva.jpg");
        
        // Configure material properties
        this.groundMaterial.setTexture(this.groundTexture);
        this.groundMaterial.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        this.scene.pushMatrix();
        
        // Scale and rotate to match previous plane configuration
        this.scene.scale(400, 1, 400);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        
        // Apply material and display
        this.groundMaterial.apply();
        this.plane.display();
        
        this.scene.popMatrix();
    }
}