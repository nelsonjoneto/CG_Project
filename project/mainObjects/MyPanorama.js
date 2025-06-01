import { CGFobject, CGFappearance } from '../../lib/CGF.js';
import { MySphere } from '../geometry/MySphere.js';

/**
 * MyPanorama - Creates a panoramic skybox using an inverted sphere
 * @constructor
 * @param scene   - Reference to MyScene object
 * @param texture - Equirectangular panorama texture to apply to the sphere
 */
export class MyPanorama extends CGFobject {
    constructor(scene, texture) {
        super(scene);
        this.texture = texture;
        
        // Create inverted sphere with large radius
        // The last parameter "true" makes the sphere inverted so it's visible from inside
        this.sphere = new MySphere(this.scene, 200, 40, 40, true);
        
        // Configure material properties
        this.material = new CGFappearance(this.scene);
        this.material.setEmission(1, 1, 1, 1);
        this.material.setTexture(texture);
        this.material.setTextureWrap('REPEAT', 'REPEAT');
    }

    /**
     * Display the panoramic background
     * Positions the sphere to follow the camera for an infinite distance effect
     */
    display() {
        this.scene.pushMatrix(); 
        
        this.material.apply();
        
        const camPos = this.scene.camera.position;
        this.scene.translate(camPos[0], camPos[1] - 90, camPos[2]);
        
        // Render the inverted sphere
        this.sphere.display();
        
        this.scene.popMatrix();
    }
}