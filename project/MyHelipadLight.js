import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyBucketCylinder } from './MyBucketCylinder.js';
import { MySphere } from './MySphere.js';

export class MyHelipadLight extends CGFobject {
    constructor(scene, size = 1.0) {
        super(scene);
        
        // Base size that will be scaled according to helipad dimensions
        this.size = size;
        
        // Define proportions - will be scaled by size parameter
        const baseProportionalHeight = 0.20;
        const baseProportionalRadius = 0.156;
        const sphereProportionalRadius = 0.18;
        
        // Calculate actual dimensions based on size parameter
        this.baseHeight = baseProportionalHeight * size;
        this.baseRadius = baseProportionalRadius * size;
        this.sphereRadius = sphereProportionalRadius * size;
        
        // Create base (cylinder) with correct dimensions
        this.base = new MyBucketCylinder(scene, 16, 1, true, false);
        
        // Create light (sphere) with correct radius
        this.light = new MySphere(scene, this.sphereRadius, 16, 12);
        
        // Base material (gray metal)
        this.baseMaterial = new CGFappearance(scene);
        this.baseMaterial.setAmbient(0.3, 0.3, 0.3, 1.0);
        this.baseMaterial.setDiffuse(0.5, 0.5, 0.5, 1.0);
        this.baseMaterial.setSpecular(0.7, 0.7, 0.7, 1.0);
        this.baseMaterial.setShininess(120);
        
        // Light material (red with optional emission)
        this.lightMaterial = new CGFappearance(scene);
        this.lightMaterial.setAmbient(0.8, 0.1, 0.1, 1.0);
        this.lightMaterial.setDiffuse(1.0, 0.1, 0.1, 1.0);
        this.lightMaterial.setSpecular(1.0, 0.5, 0.5, 1.0);
        this.lightMaterial.setShininess(30);
        
        // Default state (off)
        this.isActive = false;
        this.emissionIntensity = 0.0;
    }
    
    /**
     * Set light emissivity on/off with optional intensity
     */
    setActive(active, intensity = 1.0) {
        this.isActive = active;
        this.emissionIntensity = active ? intensity : 0.0;
        
        // Update material emission
        this.lightMaterial.setEmission(
            this.emissionIntensity, 
            this.emissionIntensity * 0.2, 
            this.emissionIntensity * 0.2, 
            1.0
        );
    }
    
    /**
     * Display the light with its base using exact dimensions
     */
    display() {
        // Draw base cylinder
        this.scene.pushMatrix();
        this.baseMaterial.apply();
        
        // Scale to get exact dimensions
        this.scene.scale(this.baseRadius, this.baseRadius, this.baseHeight);
        this.base.display();
        this.scene.popMatrix();
        
        // Draw light sphere
        this.scene.pushMatrix();
        this.lightMaterial.apply();
        
        // Position sphere on top of the cylinder
        this.scene.translate(0, 0, this.baseHeight);
        
        // No need to scale since MySphere constructor takes radius
        this.light.display();
        this.scene.popMatrix();
    }
}