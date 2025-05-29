import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyBucketCylinder } from './MyBucketCylinder.js';
import { MyRing } from './MyRing.js';

export class MyBucket extends CGFobject {
    constructor(scene) {
        super(scene);
        
        // Create bucket components
        this.outerCylinder = new MyBucketCylinder(scene, 32, 1);
        this.innerCylinder = new MyBucketCylinder(scene, 32, 1, false);
        this.rimRing = new MyRing(scene, 32, 0.05, 0.9, 1.0);
        
        // NEW: Create water cylinder that will be visible when bucket has water
        this.waterCylinder = new MyBucketCylinder(scene, 32, 1, true, true);
        
        // Material properties
        this.metalMaterial = new CGFappearance(scene);
        this.metalMaterial.setAmbient(0.3, 0.3, 0.3, 1);
        this.metalMaterial.setDiffuse(0.8, 0.8, 0.8, 1);
        this.metalMaterial.setSpecular(1.0, 1.0, 1.0, 1);
        this.metalMaterial.setShininess(120);
        
        
        this.waterMaterial = new CGFappearance(scene);
        // Load water texture
        this.waterMaterial.setTexture(this.waterTexture);
        this.waterMaterial.setTexture(this.waterTexture);
        this.waterMaterial.setTextureWrap('REPEAT', 'REPEAT');
        
        // Store constants for easier reference
        this.scale = 0.5;  
        this.height = 0.8;
        this.rimScale = 0.52;
    }

    display(hasWater = false, openAmount = 0) {
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
        
        // Only draw bottom if bucket isn't fully open
        if (openAmount < 1.0) {
            // Draw bottom (partially if opening)
            this.scene.pushMatrix();
            // Bottom moves downward as bucket opens
            this.scene.translate(0, 0, openAmount * 0.3);
            // Scale down as it opens
            this.scene.scale(0.45 * (1.0 - openAmount), 0.45 * (1.0 - openAmount), 0.05);
            this.scene.rotate(Math.PI, 0, 0, 1); // Flip to show bottom
            this.outerCylinder.display(); // Just use outer cylinder for bottom
            this.scene.popMatrix();
        }
        
        // Draw rim
        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.height);  
        this.scene.scale(this.rimScale, this.rimScale, 1.0);
        this.rimRing.display();
        this.scene.popMatrix();
        
        // Draw water if bucket has water and isn't fully open
        if (hasWater) {
            this.waterMaterial.apply();
            this.scene.pushMatrix();
            // Scale slightly smaller than inner bucket to avoid z-fighting
            this.scene.scale(0.43, 0.43, this.height * 0.7); // Water fills 70% of bucket height
            this.scene.translate(0, 0, 0.2); // Position water slightly higher in bucket
            this.waterCylinder.display();
            this.scene.popMatrix();
        }
        
        this.scene.popMatrix();
    }
    
    // Helper methods for accessing bucket dimensions
    getRimRadius() {
        return this.scale * this.rimScale;
    }
    
    getHeight() {
        return this.scale * this.height;
    }
}