import { CGFobject } from '../lib/CGF.js';
import { MyCone } from './MyCone.js';
import { MyPyramid } from './MyPyramid.js';
import { CGFappearance } from '../lib/CGF.js';

/**
 * MyTree
 * @constructor
 * @param scene - Reference to MyScene object
 * @param rotationAngle - Inclination of the tree in degrees
 * @param rotationAxis - Inclination axis, 'x' or 'z'
 * @param trunkRadius - Radius of the trunk (cone base)
 * @param totalHeight - Total height of the tree
 * @param crownColor - Array of RGB values (e.g. [0, 0.6, 0])
 */
export class MyTree extends CGFobject {
    constructor(scene, rotationAngle, rotationAxis, trunkRadius, totalHeight, crownColor) {
        super(scene);

        this.scene = scene;
        this.rotationAngle = rotationAngle * Math.PI / 180;
        this.rotationAxis = rotationAxis.toLowerCase();
        this.trunkRadius = trunkRadius;
        this.totalHeight = totalHeight;
        this.crownColor = crownColor;

        // Trunk: full tree height
        this.trunkHeight = totalHeight;
        // Crown spans top 80% of total height
        this.crownHeight = totalHeight * 0.8;
        this.crownBaseY = totalHeight - this.crownHeight;

        // Create trunk (full-height cone)
        this.trunk = new MyCone(
            scene,
            12,                // slices
            1,                 // stacks
            trunkRadius * 2,   // baseWidth = diameter
            this.trunkHeight   // height
        );

        // Crown pyramids parameters
        this.pyramidHeight = 1.5;
        const overlap = 0.5;
        const stepY = this.pyramidHeight * (1 - overlap);

        // Compute number of pyramids so top tip aligns with trunk tip
        const availableHeight = this.crownHeight;
        const count = Math.max(
            1,
            Math.ceil((availableHeight - this.pyramidHeight) / stepY) + 1
        );

        // Build an array of identical pyramids (base = 2 * trunkRadius)
        this.crownPyramids = [];
        const baseWidth = trunkRadius * 3.5;
        for (let i = 0; i < count; i++) {
            this.crownPyramids.push(
                new MyPyramid(scene, 6, 1, baseWidth, this.pyramidHeight)
            );
        }

        // Materials
        this.trunkMaterial = new CGFappearance(scene);
        this.trunkMaterial.setAmbient(0.3, 0.2, 0.1, 1);
        this.trunkMaterial.setDiffuse(0.3, 0.2, 0.1, 1);

        this.crownMaterial = new CGFappearance(scene);
        this.crownMaterial.setAmbient(...crownColor, 1);
        this.crownMaterial.setDiffuse(...crownColor, 1);

        // Store for display
        this._stepY = stepY;
    }

    display() {
        this.scene.pushMatrix();

        // Inclination

        if (this.rotationAxis === 'x') {
            this.scene.rotate(this.rotationAngle, 1, 0, 0);
        } else {
            this.scene.rotate(this.rotationAngle, 0, 0, 1);
        }

        // Draw trunk
        this.trunkMaterial.apply();
        this.trunk.display();

        // Draw crown pyramids
        this.crownMaterial.apply();
        for (let i = 0; i < this.crownPyramids.length; i++) {
            this.scene.pushMatrix();
            const y = this.crownBaseY + i * this._stepY;
            this.scene.translate(0, y, 0);
            this.crownPyramids[i].display();
            this.scene.popMatrix();
        }

        this.scene.popMatrix();
    }
}
