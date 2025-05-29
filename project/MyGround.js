import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyPlane } from './MyPlane.js';

export class MyGround extends CGFobject {
    constructor(scene, grassTexture) {
        super(scene);
        
        const textureRepeat = 40;

        this.textureRepeat = textureRepeat;
        this.plane = new MyPlane(scene, 200, 0, textureRepeat, 0, textureRepeat);

        this.groundMaterial = new CGFappearance(scene);
        
        this.groundMaterial.setDiffuse(0.8, 0.8, 0.8, 1.0);
        this.groundMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.groundMaterial.setTexture(grassTexture); 
        this.groundMaterial.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        this.scene.pushMatrix();

        this.scene.scale(400, 1, 400);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);

        this.groundMaterial.apply();
        this.plane.display();
        
        this.scene.popMatrix();
    }
}