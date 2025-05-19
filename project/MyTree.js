import { CGFobject } from '../lib/CGF.js';
import { MyCone } from './MyCone.js';
import { MyPyramid } from './MyPyramid.js';
import { CGFappearance } from '../lib/CGF.js';
import { CGFtexture } from '../lib/CGF.js';

/**
 * MyTree
 * @constructor
 * @param scene - Reference to MyScene object
 * @param rotationAngle - Tree inclination in degrees
 * @param rotationAxis - Inclination axis ('x' or 'z')
 * @param trunkRadius - Trunk radius (cone base)
 * @param totalHeight - Total tree height
 * @param crownColor - RGB array for crown color (e.g. [0, 0.6, 0])
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

        // Trunk height equals total height
        this.trunkHeight = totalHeight;
        // Crown occupies upper 80% of total height
        this.crownHeight = totalHeight * 0.8;
        this.crownBaseY = totalHeight - this.crownHeight;

        // Create trunk (full height cone)
        this.trunk = new MyCone(
            scene,
            12,                // slices
            1,                 // stacks
            trunkRadius * 2,   // baseWidth = diameter
            this.trunkHeight   // height
        );

        // Crown pyramid parameters
        this.pyramidHeight = 5;
        const overlap = 0.5;
        const stepY = this.pyramidHeight * (1 - overlap);

        // Calculate number of pyramids to reach trunk top
        const availableHeight = this.crownHeight;
        const count = Math.max(
            1,
            Math.ceil((availableHeight - this.pyramidHeight) / stepY) + 1
        );

        // Create pyramid array (base = 3.5 * trunkRadius)
        this.crownPyramids = [];
        const baseWidth = trunkRadius * 3.5;
        const pyramidFaces = 6;
        for (let i = 0; i < count; i++) {
            this.crownPyramids.push(
                new MyPyramid(scene, pyramidFaces, 1, baseWidth, this.pyramidHeight)
            );
        }

        if (Math.random() < 0.5) {
            this.currentTrunkMaterial = new CGFappearance(scene);
            this.currentTrunkMaterial.setAmbient(0.3, 0.2, 0.1, 1); // Darker brown
            this.currentTrunkMaterial.setDiffuse(0.3, 0.2, 0.1, 1);
            this.currentTrunkMaterial.setTexture(new CGFtexture(scene, "textures/trunk.jpg"));
            this.crownTexture = new CGFtexture(scene, "textures/leaves.png");
        } else {
            this.currentTrunkMaterial = new CGFappearance(scene);
            this.currentTrunkMaterial.setAmbient(0.8, 0.8, 0.7, 1); // Light grayish-white
            this.currentTrunkMaterial.setDiffuse(0.9, 0.9, 0.8, 1);
            this.currentTrunkMaterial.setSpecular(0.2, 0.2, 0.2, 1);
            this.currentTrunkMaterial.setShininess(20);
            this.currentTrunkMaterial.setTexture(new CGFtexture(scene, "textures/trunk3.jpg"));
            this.crownTexture = new CGFtexture(scene, "textures/pinetree.png");
        }

        // Crown material
        this.crownMaterial = new CGFappearance(scene);
        this.crownMaterial.setAmbient(...crownColor, 1);
        this.crownMaterial.setDiffuse(...crownColor, 1);
        this.crownMaterial.setTexture(this.crownTexture);
        this.crownMaterial.setTextureWrap('REPEAT', 'REPEAT');

        // Configure texture wrapping for the trunk material
        this.currentTrunkMaterial.setTextureWrap('REPEAT', 'REPEAT');

        // Store stepY for display
        this._stepY = stepY;
    }

    display() {
        this.scene.pushMatrix();

        // Apply tree inclination
        if (this.rotationAxis === 'x') {
            this.scene.rotate(this.rotationAngle, 1, 0, 0);
        } else {
            this.scene.rotate(this.rotationAngle, 0, 0, 1);
        }

        // Draw trunk with selected material
        this.currentTrunkMaterial.apply();
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