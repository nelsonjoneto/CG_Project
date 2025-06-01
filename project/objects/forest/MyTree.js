import { CGFobject } from '../../../lib/CGF.js';
import { MyCone } from '../../geometry/MyCone.js';
import { MyPyramid } from '../../geometry/MyPyramid.js';
import { CGFappearance } from '../../../lib/CGF.js';

/**
 * MyTree
 * @constructor
 * @param scene         - Reference to MyScene object
 * @param rotationAngle - Tree inclination in degrees
 * @param rotationAxis  - Inclination axis ('x' or 'z')
 * @param trunkRadius   - Trunk radius (cone base)
 * @param totalHeight   - Total tree height
 * @param crownColor    - RGB array for crown color (e.g. [0, 0.6, 0])
 * @param trunkTexture  - Texture to apply to the trunk
 * @param crownTexture  - Texture to apply to the crown
 */
export class MyTree extends CGFobject {
    constructor(scene, rotationAngle, rotationAxis, trunkRadius, totalHeight, crownColor, trunkTexture, crownTexture) {
        super(scene);

        this.scene = scene;
        this.rotationAngle = rotationAngle * Math.PI / 180; // Convert degrees to radians
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
        const pyramidFaces = Math.floor(Math.random() * 4) + 4; // Random between 4-7 faces
        for (let i = 0; i < count; i++) {
            this.crownPyramids.push(
                new MyPyramid(scene, pyramidFaces, 1, baseWidth, this.pyramidHeight)
            );
        }

        // Set up trunk material with improved wrapping mode
        this.currentTrunkMaterial = new CGFappearance(scene);
        this.currentTrunkMaterial.setAmbient(0.5, 0.4, 0.3, 1);
        this.currentTrunkMaterial.setDiffuse(0.6, 0.5, 0.4, 1);
        this.currentTrunkMaterial.setSpecular(0.2, 0.2, 0.2, 1);
        this.currentTrunkMaterial.setShininess(10);
        this.currentTrunkMaterial.setTexture(trunkTexture);
        
        // Use CLAMP_TO_EDGE for trunk texture to avoid visible seams
        this.currentTrunkMaterial.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');

        // Crown material with texture
        this.crownTexture = crownTexture;
        this.crownMaterial = new CGFappearance(scene);
        this.crownMaterial.setAmbient(...crownColor, 1);
        this.crownMaterial.setDiffuse(...crownColor, 1);
        this.crownMaterial.setTexture(this.crownTexture);
        this.crownMaterial.setTextureWrap('REPEAT', 'REPEAT');

        // Store stepY for display
        this._stepY = stepY;
    }

    /**
     * Display the complete tree with trunk and crown
     * Applies rotation for tree inclination and burial adjustment
     */
    display() {
        this.scene.pushMatrix();
        
        // Calculate burial adjustment: how much the tree needs to sink based on inclination
        let burialAdjustment = 0;
        if (this.rotationAngle !== 0) {
            // When tree is inclined, the base edge lifts up by approximately radius * sin(angle)
            burialAdjustment = this.trunkRadius * Math.sin(Math.abs(this.rotationAngle));
        }

        // Apply rotation and burial adjustment
        if (this.rotationAxis === 'x') {
            // Rotate around X axis
            this.scene.rotate(this.rotationAngle, 1, 0, 0);
            // Translate down to bury the tree
            this.scene.translate(0, -burialAdjustment, 0);
        } else if (this.rotationAxis === 'z') {
            // Rotate around Z axis
            this.scene.rotate(this.rotationAngle, 0, 0, 1);
            // Translate down to bury the tree
            this.scene.translate(0, -burialAdjustment, 0);
        }

        // Render trunk with trunk material
        this.currentTrunkMaterial.apply();
        this.trunk.display();
        
        // Apply crown material for all pyramids
        this.crownMaterial.apply();
        
        // Render crown pyramids with overlap
        let yOffset = this.crownBaseY;
        for (const pyramid of this.crownPyramids) {
            this.scene.pushMatrix();
            this.scene.translate(0, yOffset, 0);
            pyramid.display();
            this.scene.popMatrix();
            
            // Move up for next pyramid (with overlap)
            yOffset += this._stepY;
        }
        
        this.scene.popMatrix();
    }
}