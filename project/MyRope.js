import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyCylinder } from './MyCylinder.js';

export class MyRope extends CGFobject {
    constructor(scene, slices = 8, connections = 4) {
        super(scene);
        
        // Create main vertical rope segment
        this.mainRope = new MyCylinder(scene, slices, 1);
        
        // Create branch ropes (connections to rim)
        this.branches = [];
        for (let i = 0; i < connections; i++) {
            this.branches.push(new MyCylinder(scene, slices, 1));
        }
        
        // Number of connection points
        this.numConnections = connections;
        
        // Rope material
        this.ropeMaterial = new CGFappearance(scene);
        this.ropeMaterial.setAmbient(0.15, 0.1, 0.05, 1.0);
        this.ropeMaterial.setDiffuse(0.3, 0.2, 0.1, 1.0);
        this.ropeMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.ropeMaterial.setShininess(10.0);
    }
    
    /**
     * Display the rope with branches
     * @param {number} mainLength - Length of main vertical rope
     */
    display(mainLength) {
        this.ropeMaterial.apply();
        
        // Constants for rope geometry
        const branchOffset = 0.5;       // Fixed distance from main rope end to bucket top
        const bucketRimRadius = 0.156;  // Radius of bucket rim (0.3 * 0.52)
        
        // Calculate actual vertical rope length and end position
        const verticalRopeLength = Math.max(0, mainLength - branchOffset);
        
        // Draw main vertical rope if it has length
        if (verticalRopeLength > 0.01) {
            this.scene.pushMatrix();
            this.scene.rotate(Math.PI/2, 1, 0, 0); // Point downward
            this.scene.scale(0.02, 0.02, verticalRopeLength); // Thin rope
            this.mainRope.display();
            this.scene.popMatrix();
        }
        
        // Draw branches from end of main rope to rim points
        for (let i = 0; i < this.numConnections; i++) {
            const angle = (i / this.numConnections) * Math.PI * 2;
            
            // Calculate branch end point on bucket rim
            const rimX = Math.cos(angle) * bucketRimRadius;
            const rimZ = Math.sin(angle) * bucketRimRadius;
            
            this.scene.pushMatrix();
            
            // Position at end of main vertical rope
            this.scene.translate(0, -verticalRopeLength, 0);
            
            // Calculate branch angles
            const yawAngle = Math.atan2(rimX, rimZ); // Horizontal angle
            
            // Fixed branch length and angle to reach rim
            const branchLength = Math.sqrt(bucketRimRadius*bucketRimRadius + branchOffset*branchOffset);
            const branchAngle = Math.atan2(bucketRimRadius, branchOffset);
            
            // Rotate and scale branch to connect to rim
            this.scene.rotate(yawAngle, 0, 1, 0);
            this.scene.rotate(branchAngle + Math.PI/2, 1, 0, 0);
            this.scene.scale(0.01, 0.01, branchLength);
            
            // Draw branch
            this.branches[i].display();
            
            this.scene.popMatrix();
        }
    }
}