import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyBucketCylinder } from '../../geometry/MyBucketCylinder.js';
import { MyRing } from '../../geometry/MyRing.js';

/**
 * MyBucket
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyBucket extends CGFobject {
    constructor(scene) {
        super(scene);
        
        // Create bucket components
        this.outerCylinder = new MyBucketCylinder(scene, 32, 1, true, false);
        
        // Inner cylinder with NO bottom
        this.innerCylinder = new MyBucketCylinder(scene, 32, 1, false);
        
        // Create a special flap/bottom piece (just the flat circle)
        this.bucketFlap = new MyBucketCylinder(scene, 32, 1, true, false);
        
        this.rimRing = new MyRing(scene, 32, 0.05, 0.9, 1.0);
        
        // Water cylinder for falling water effect
        this.waterCylinder = new MyBucketCylinder(scene, 32, 1, true, true);
        
        // Material properties
        this.metalMaterial = new CGFappearance(scene);
        this.metalMaterial.setAmbient(0.3, 0.3, 0.3, 1);
        this.metalMaterial.setDiffuse(0.8, 0.8, 0.8, 1);
        this.metalMaterial.setSpecular(1.0, 1.0, 1.0, 1);
        this.metalMaterial.setShininess(120);
        
        this.waterMaterial = new CGFappearance(scene);
        this.waterMaterial.setAmbient(0.1, 0.4, 0.8, 0.8);
        this.waterMaterial.setDiffuse(0.2, 0.6, 0.9, 0.8);
        this.waterMaterial.setSpecular(0.5, 0.8, 1.0, 0.8);
        this.waterMaterial.setShininess(120);
        
        // Store constants for easier reference
        this.scale = 0.5;  
        this.height = 0.8;
        this.rimScale = 0.52;
    }

    /**
     * Display the bucket with optional water content and opening animation
     * @param hasWater   - Boolean indicating if the bucket contains water
     * @param openAmount - Value from 0 to 1 indicating how open the bucket flap is
     */
    display(hasWater = false, openAmount = 0) {
        // Rotate to make bucket upright
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        
        // Apply material
        this.metalMaterial.apply();
        
        // Scale the entire bucket
        this.scene.scale(this.scale, this.scale, this.scale);
        
        // Draw outer cylinder (without bottom cap - we'll add our own)
        this.scene.pushMatrix();
        this.scene.scale(0.5, 0.5, this.height);  
        this.outerCylinder.display();
        this.scene.popMatrix();

        // Draw inner cylinder (no bottom)
        this.scene.pushMatrix();
        this.scene.scale(0.45, 0.45, this.height);
        this.scene.translate(0, 0, 0.05); // Avoid z-fighting
        this.innerCylinder.display();
        this.scene.popMatrix();
        
        // Draw the hinged bottom flap
        this.scene.pushMatrix();
        
        // Move to bottom of bucket
        this.scene.translate(0, 0, 0.05); // Slightly above bottom to avoid z-fighting
        
        // Create a hinge effect by setting pivot point at one edge of the disk
        // Move origin to back edge for hinge effect
        this.scene.translate(0, -0.45, 0);
        
        // Rotate based on open amount (0 = closed, 90° = fully open)
        // Using negative angle so it opens downward
        const openAngle = -openAmount * Math.PI/2;
        this.scene.rotate(openAngle, 1, 0, 0);
        
        // Move back to center
        this.scene.translate(0, 0.45, 0);
        
        // Scale to fit inside the inner cylinder
        this.scene.scale(0.45, 0.45, 0.02); // Thin disk
        
        // Display just the bottom disk
        this.bucketFlap.display();
        
        this.scene.popMatrix();
        
        // Draw rim
        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.height);  
        this.scene.scale(this.rimScale, this.rimScale, 1.0);
        this.rimRing.display();
        this.scene.popMatrix();
        
        // Draw water if bucket has water and isn't too open
        if (hasWater) {
            // Apply water material to ensure water has correct appearance
            this.waterMaterial.apply();
            
            this.scene.pushMatrix();
            // Scale slightly smaller than inner bucket to avoid z-fighting
            this.scene.scale(0.43, 0.43, this.height * 0.7); // Water fills 70% of bucket height
            this.scene.translate(0, 0, 0.2); // Position water slightly higher in bucket
            this.waterCylinder.display();
            this.scene.popMatrix();
            
            // Reapply metal material for anything drawn after water
            this.metalMaterial.apply();
        }
        
        this.scene.popMatrix();
    }
    
    /**
     * Helper method to get the bucket's rim radius
     * @return {number} Rim radius in world units
     */
    getRimRadius() {
        return this.scale * this.rimScale;
    }
    
    /**
     * Helper method to get the bucket's height
     * @return {number} Bucket height in world units
     */
    getHeight() {
        return this.scale * this.height;
    }
}