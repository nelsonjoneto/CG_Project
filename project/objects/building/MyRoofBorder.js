import { CGFobject } from '../../../lib/CGF.js';
import { MyUnitCube } from '../../geometry/MyUnitCube.js';

/**
 * MyRoofBorder - Creates borders around building rooftops
 * @constructor
 * @param scene  - Reference to MyScene object
 * @param width  - Width of the border segment
 * @param height - Height of the border segment
 * @param depth  - Depth of the border segment
 */
export class MyRoofBorder extends CGFobject {
    constructor(scene, width, height, depth) {
        super(scene);
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.cube = new MyUnitCube(scene);
    }

    /**
     * Display the roof border
     * Renders a scaled unit cube to create the border segment
     */
    display() {
        this.scene.pushMatrix();
        this.scene.scale(this.width, this.height, this.depth);
        this.cube.display();
        this.scene.popMatrix();
    }
}