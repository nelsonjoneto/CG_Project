import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyPlane } from '../../geometry/MyPlane.js';

/**
 * MyWindow
 * @constructor
 * @param scene       - Reference to MyScene object
 * @param texture     - Texture to apply to the window
 * @param width       - Width of the window (default: 1)
 * @param height      - Height of the window (default: 1)
 * @param isDoor      - Whether this is a door instead of a window (default: false)
 * @param doorTexture - Optional door texture if isDoor is true (default: null)
 */
export class MyWindow extends CGFobject {
    constructor(scene, texture, width=1, height=1, isDoor=false, doorTexture=null) {
        super(scene);
        this.scene = scene;
        this.isDoor = isDoor;

        this.plane = new MyPlane(scene, 1);
        
        // Create appropriate material based on window or door type
        this.material = new CGFappearance(scene);
        
        if (isDoor) {
            this.material.setTexture(doorTexture);
            this.material.setAmbient(0.7, 0.7, 0.7, 1.0);
            this.material.setDiffuse(1.0, 1.0, 1.0, 1.0);
            this.material.setSpecular(0.1, 0.1, 0.1, 1.0);
            this.material.setShininess(70.0);
        } else {
            this.material.setTexture(texture);
            this.material.setAmbient(0.7, 0.7, 0.7, 1.0);   
            this.material.setDiffuse(1.0, 1.0, 1.0, 1.0);   
            this.material.setSpecular(0.2, 0.2, 0.2, 1.0);
            this.material.setShininess(200.0);
        }
        
        this.width = width;
        this.height = height;
    }

    /**
     * Display the window/door
     * Places a textured plane with the specified dimensions
     */
    display() {
        this.scene.pushMatrix();
        
        this.material.apply();
        
        this.scene.scale(this.width, this.height, 1);
        
        this.plane.display();
        
        this.scene.popMatrix();
    }

    /**
     * Update the size of the window/door
     * @param width  - New width
     * @param height - New height
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
    }
}