// MyRoofBorder.js
import { CGFobject } from '../lib/CGF.js';
import { MyUnitCube } from './MyUnitCube.js';

export class MyRoofBorder extends CGFobject {
    constructor(scene, width, height, depth) {
        super(scene);
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.cube = new MyUnitCube(scene);
    }

    display() {
        this.scene.pushMatrix();
        this.scene.scale(this.width, this.height, this.depth);
        this.cube.display();
        this.scene.popMatrix();
    }
}
