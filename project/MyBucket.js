// MyBucket.js
import { CGFobject } from '../lib/CGF.js';
import { MyCylinder } from './MyCylinder.js';
import { MySolidCylinder } from './MySolidCylinder.js';

export class MyBucket extends CGFobject {
    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.bucketBody = new MyCylinder(scene, 20, 1);      // laterais abertas
        this.bucketBottom = new MySolidCylinder(scene, 20, 1); // base fechada
        this.cable = new MyCylinder(scene, 6, 1);             // cabo fino
    }

    display() {
        this.scene.pushMatrix();

        // Cabo
        this.scene.pushMatrix();
        this.scene.translate(0, -0.57, 0); // altura pendurada
        this.scene.scale(0.02, 0.1, 0.02); // fino e longo
        this.cable.display();
        this.scene.popMatrix();

        // Corpo do balde
        this.scene.pushMatrix();
        this.scene.translate(0, -1.05, 0); // logo abaixo do cabo
        this.scene.scale(0.4, 0.15, 0.4); // largura e altura do balde
        this.bucketBody.display();
        this.bucketBottom.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}
