import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyBucketCylinder } from './MyBucketCylinder.js';
import { MyRing } from './MyRing.js';

export class MyBucket extends CGFobject {
    constructor(scene) {
        super(scene);
        
        // Create basic cylinder components
        this.outerCylinder = new MyBucketCylinder(scene, 32, 1);
        this.innerCylinder = new MyBucketCylinder(scene, 32, 1, false);
        
        // Create rim as a proper ring shape with height 0.05
        // MyRing params: scene, slices, height, innerRadius, outerRadius
        this.rimRing = new MyRing(scene, 32, 0.05, 0.9, 1.0);
        
        // Material properties
        this.metalMaterial = new CGFappearance(scene);
        this.metalMaterial.setAmbient(0.3, 0.3, 0.3, 1);
        this.metalMaterial.setDiffuse(0.8, 0.8, 0.8, 1);
        this.metalMaterial.setSpecular(1.0, 1.0, 1.0, 1);
        this.metalMaterial.setShininess(120);
    }

    display() {
        // Main transformation - rotate to make bucket upright
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        
        // Apply material once for all elements
        this.metalMaterial.apply();
        
        // Outer cylinder
        this.scene.pushMatrix();
        this.scene.scale(0.5, 0.5, 0.8);  
        this.outerCylinder.display();
        this.scene.popMatrix();

        // Inner cylinder
        this.scene.pushMatrix();
        this.scene.scale(0.45, 0.45, 0.8);
        this.scene.translate(0, 0, 0.05); // Avoid z-fighting
        this.innerCylinder.display();
        this.scene.popMatrix();
        
        // Rim ring at the top of the bucket
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.8); // Connect directly to bucket top
        this.scene.scale(0.52, 0.52, 1.0); // Slightly wider than bucket
        this.rimRing.display();
        this.scene.popMatrix();
        
        this.scene.popMatrix();
    }
}