import { CGFobject } from '../lib/CGF.js';
import { MyDiamond } from './MyDiamond.js';
import { MyParallelogram } from './MyParallelogram.js';
import { MyTriangle } from './MyTriangle.js';
import { MyTriangleSmall } from './MyTriangleSmall.js';
import { MyTriangleBig } from './MyTriangleBig.js';

/**
 * MyTangram
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTangram extends CGFobject {
    constructor(scene) {
        super(scene);
        this.diamond = new MyDiamond(scene);
        this.triangle1 = new MyTriangle(scene);
        this.triangle2 = new MyTriangle(scene);
        this.triangle3 = new MyTriangle(scene);
        this.triangle4 = new MyTriangle(scene);
        this.triangleSmall = new MyTriangleSmall(scene);
        this.parallelogram = new MyParallelogram(scene);
    }

    display() {

        // Diamond
        this.scene.pushMatrix();
        this.scene.setDiffuse(0, 255 / 255, 0, 1);
        this.scene.scale(0.707106781, 0.707106781, 0);
        this.scene.translate(0, -0.707106781, 0);
        this.scene.rotate(Math.PI / 4, 0, 0, 1);
        this.diamond.display();
        this.scene.popMatrix();
        
        // Triangle 1
        this.scene.pushMatrix();
        this.scene.setDiffuse(255 / 255, 128 / 255, 0 / 255, 0)
        this.scene.translate(0, 1, 0);
        this.scene.rotate(- Math.PI / 2, 0, 0, 1);
        this.triangle1.display();
        this.scene.popMatrix();
        
        //Triangle 2
        this.scene.pushMatrix();
        this.scene.setDiffuse(0, 0, 1, 1);
        this.scene.translate(0, 1, 0);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.triangle2.display();
        this.scene.popMatrix();
        
        //Triangle Small
        this.scene.pushMatrix();
        this.scene.setDiffuse(255 / 255, 153 / 255, 204 / 255, 1);
        this.scene.translate(0, 2, 0);  
        this.triangleSmall.display();
        this.scene.popMatrix();

        //Parallelogram
        this.scene.pushMatrix();
        this.scene.setDiffuse(1, 1, 0, 1);
        this.scene.translate(0.5, 0, 0); 
        this.scene.rotate(- Math.PI / 4, 0, 0, 1);
        this.scene.scale(0.707106781, -0.707106781, 0);
        this.parallelogram.display();
        this.scene.popMatrix();

        //Triangle 3
        this.scene.pushMatrix();
        this.scene.setDiffuse(1, 0, 0, 1);
        this.scene.scale(0.5, 0.5, 0);
        this.scene.translate(-2,-1,0);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.triangle3.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.setDiffuse(76 / 255, 0 / 255, 153 / 255, 1);
        this.scene.scale(0.5, 0.5, 0);
        this.scene.translate(-2,-3,0);
        this.scene.rotate(- Math.PI / 2, 0, 0, 1);
        this.triangle4.display();
        this.scene.popMatrix();
        
        
    }
}