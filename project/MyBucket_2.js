import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyBucketCylinder } from './MyBucketCylinder.js';
import { MyRing } from './MyRing.js';

export class MyBucket extends CGFobject {
    constructor(scene) {
        super(scene);
        
        // Create bucket components
        this.outerCylinder = new MyBucketCylinder(scene, 32, 1);
        this.innerCylinder = new MyBucketCylinder(scene, 32, 1, false);
        this.rimRing = new MyRing(scene, 32, 0.05, 0.9, 1.0);
        
        // Material properties
        this.metalMaterial = new CGFappearance(scene);
        this.metalMaterial.setAmbient(0.3, 0.3, 0.3, 1);
        this.metalMaterial.setDiffuse(0.8, 0.8, 0.8, 1);
        this.metalMaterial.setSpecular(1.0, 1.0, 1.0, 1);
        this.metalMaterial.setShininess(120);
        
        // Store constants for easier reference
        this.scale = 0.3;
        this.height = 0.8;
        this.rimScale = 0.52;
    }

    display() {
        // Rotate to make bucket upright
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        
        // Apply material
        this.metalMaterial.apply();
        
        // Scale the entire bucket
        this.scene.scale(this.scale, this.scale, this.scale);
        
        // Draw outer cylinder
        this.scene.pushMatrix();
        this.scene.scale(0.5, 0.5, this.height);  
        this.outerCylinder.display();
        this.scene.popMatrix();

        // Draw inner cylinder
        this.scene.pushMatrix();
        this.scene.scale(0.45, 0.45, this.height);
        this.scene.translate(0, 0, 0.05); // Avoid z-fighting
        this.innerCylinder.display();
        this.scene.popMatrix();
        
        // Draw rim
        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.height);  
        this.scene.scale(this.rimScale, this.rimScale, 1.0);
        this.rimRing.display();
        this.scene.popMatrix();
        
        this.scene.popMatrix();
    }
    
    // Public methods for accessing bucket dimensions
    getRimRadius() {
        return this.scale * this.rimScale;
    }
    
    getHeight() {
        return this.scale * this.height;
    }
}