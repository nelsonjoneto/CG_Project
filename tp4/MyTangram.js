import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyDiamond } from './MyDiamond.js';
import { MyParallelogram } from './MyParallelogram.js';
import { MyTriangle } from './MyTriangle.js';
import { MyTriangleSmall } from './MyTriangleSmall.js';

/**
 * MyTangram
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTangram extends CGFobject {
    constructor(scene) {
        super(scene);
        this.diamond = new MyDiamond(scene);
        this.triangle = new MyTriangle(scene);
        this.triangleBlue = new MyTriangle(scene, [0.5,0.5,1,0,0,0,0.5,0.5,1,0,0,0]);
        this.triangleRed = new MyTriangle(scene, [0.5,0.5,0.25,0.75,0.75,0.75,0.5,0.5,0.25,0.75,0.75,0.75]);
        this.trianglePurple = new MyTriangle(scene, [0.25,0.25,0,0,0,0.5,0.25,0.25,0,0,0,0.5]);
        this.triangleSmall = new MyTriangleSmall(scene);
        this.parallelogram = new MyParallelogram(scene);

        // Define materials
        this.diamondMaterial = new CGFappearance(scene);
        this.diamondMaterial.setAmbient(0, 1, 0, 1.0);
        this.diamondMaterial.setDiffuse(0, 1, 0, 1.0);
        this.diamondMaterial.setSpecular(1, 1, 1, 1.0);
        this.diamondMaterial.setShininess(100.0);

        this.triangle1Material = new CGFappearance(scene);
        this.triangle1Material.setAmbient(1, 0.5, 0, 1.0);
        this.triangle1Material.setDiffuse(1, 0.5, 0, 1.0);
        this.triangle1Material.setSpecular(1, 1, 1, 1.0);
        this.triangle1Material.setShininess(100.0);

        this.triangle2Material = new CGFappearance(scene);
        this.triangle2Material.setAmbient(0, 0, 1, 1.0);
        this.triangle2Material.setDiffuse(0, 0, 1, 1.0);
        this.triangle2Material.setSpecular(1, 1, 1, 1.0);
        this.triangle2Material.setShininess(100.0);

        this.triangleSmallMaterial = new CGFappearance(scene);
        this.triangleSmallMaterial.setAmbient(1, 0.6, 0.8, 1.0);
        this.triangleSmallMaterial.setDiffuse(1, 0.6, 0.8, 1.0);
        this.triangleSmallMaterial.setSpecular(1, 1, 1, 1.0);
        this.triangleSmallMaterial.setShininess(100.0);

        this.parallelogramMaterial = new CGFappearance(scene);
        this.parallelogramMaterial.setAmbient(1, 1, 0, 1.0);
        this.parallelogramMaterial.setDiffuse(1, 1, 0, 1.0);
        this.parallelogramMaterial.setSpecular(1, 1, 1, 1.0);
        this.parallelogramMaterial.setShininess(100.0);

        this.triangle3Material = new CGFappearance(scene);
        this.triangle3Material.setAmbient(1, 0, 0, 1.0);
        this.triangle3Material.setDiffuse(1, 0, 0, 1.0);
        this.triangle3Material.setSpecular(1, 1, 1, 1.0);
        this.triangle3Material.setShininess(100.0);

        this.triangle4Material = new CGFappearance(scene);
        this.triangle4Material.setAmbient(0.3, 0, 0.6, 1.0);
        this.triangle4Material.setDiffuse(0.3, 0, 0.6, 1.0);
        this.triangle4Material.setSpecular(1, 1, 1, 1.0);
        this.triangle4Material.setShininess(100.0);

        this.texture = new CGFappearance(this.scene);
        this.texture.setAmbient(0.1, 0.1, 0.1, 1);
        this.texture.setDiffuse(0.9, 0.9, 0.9, 1);
        this.texture.setSpecular(0.1, 0.1, 0.1, 1);
        this.texture.setShininess(10.0);
        this.texture.loadTexture('images/tangram.png');
    }

    display() {
        // Diamond
        this.scene.pushMatrix();
        //this.diamondMaterial.apply();
        this.scene.scale(0.707106781, 0.707106781, 1);
        this.scene.translate(0, -0.707106781, 0);
        this.scene.rotate(Math.PI / 4, 0, 0, 1);
        this.texture.apply();
        this.diamond.display();
        this.scene.popMatrix();
        
        // Triangle 1
        this.scene.pushMatrix();
        this.texture.apply();
        this.scene.translate(0, 1, 0);
        this.scene.rotate(-Math.PI / 2, 0, 0, 1);
        this.triangle.display();
        this.scene.popMatrix();
        
        // Triangle 2
        this.scene.pushMatrix();
        this.texture.apply();
        this.scene.translate(0, 1, 0);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.triangleBlue.display();
        this.scene.popMatrix();
        
        // Triangle Small
        this.scene.pushMatrix();
        this.texture.apply();
        this.scene.translate(0, 2, 0);  
        this.triangleSmall.display();
        this.scene.popMatrix();
        
        // Parallelogram
        this.scene.pushMatrix();
        this.scene.translate(0.5, 0, 0); 
        this.scene.rotate(-Math.PI / 4, 0, 0, 1);
        this.scene.scale(0.707106781, -0.707106781, 1);
        this.texture.apply();
        this.parallelogram.display();
        this.scene.popMatrix();

        // Triangle 3
        this.scene.pushMatrix();
        this.texture.apply();
        this.scene.scale(0.5, 0.5, 1);
        this.scene.translate(-2, -1, 0);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.triangleRed.display();
        this.scene.popMatrix();

        // Triangle 4
        this.scene.pushMatrix();
        this.texture.apply();
        this.scene.scale(0.5, 0.5, 1);
        this.scene.translate(-2, -3, 0);
        this.scene.rotate(-Math.PI / 2, 0, 0, 1);
        this.trianglePurple.display();
        this.scene.popMatrix();
    }
    
    enableNormalViz() {
        this.diamond.enableNormalViz();
        this.triangle.enableNormalViz();
        this.triangleSmall.enableNormalViz();
        this.parallelogram.enableNormalViz();
    }

    disableNormalViz() {
        this.diamond.disableNormalViz();
        this.triangle.disableNormalViz();
        this.triangleSmall.disableNormalViz();
        this.parallelogram.disableNormalViz();
    }
}