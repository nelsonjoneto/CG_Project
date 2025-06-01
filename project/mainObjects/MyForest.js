import { CGFobject } from '../../lib/CGF.js';
import { MyTree } from '../objects/forest/MyTree.js';

/**
 * MyForest - Creates a forest of randomly placed trees
 * @constructor
 * @param scene          - Reference to MyScene object
 * @param rows           - Number of rows in the forest grid
 * @param cols           - Number of columns in the forest grid
 * @param areaWidth      - Width of the forest area
 * @param areaDepth      - Depth of the forest area
 * @param trunkTexture   - Primary texture for tree trunks
 * @param trunkAltTexture- Alternative texture for pine tree trunks
 * @param leavesTexture  - Texture for tree foliage
 * @param pineTexture    - Texture for pine tree foliage
 * @param ground         - Reference to ground object for water detection
 */
export class MyForest extends CGFobject {
    constructor(scene, rows, cols, areaWidth, areaDepth, trunkTexture, trunkAltTexture, leavesTexture, pineTexture, ground) {
        super(scene);
        this.scene = scene;
        this.rows = rows;
        this.cols = cols;
        this.areaWidth = areaWidth;
        this.areaDepth = areaDepth;
        this.trunkTexture = trunkTexture;
        this.trunkAltTexture = trunkAltTexture;
        this.leavesTexture = leavesTexture;
        this.pineTexture = pineTexture;
        this.ground = ground;
        this.trees = [];
        this.initForest();
    }

    /**
     * Initialize forest with randomly placed trees
     * Creates tree objects with randomized parameters in a grid layout
     * Avoids placing trees in water or building areas
     */
    initForest() {
        const cellW = this.areaWidth / this.cols;
        const cellD = this.areaDepth / this.rows;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                // Calculate base position for this cell
                const centerX = -this.areaWidth/2 + cellW * (j + 0.5);
                const centerZ = -this.areaDepth/2 + cellD * (i + 0.5);
                
                // Add random offset within cell (±40%)
                const offsetX = (Math.random() * 0.8 - 0.4) * cellW;
                const offsetZ = (Math.random() * 0.8 - 0.4) * cellD;

                const posX = centerX + offsetX;
                const posZ = centerZ + offsetZ;

                // Skip this position if it's in water or near water
                if (this.ground.isLake(posX, posZ) || this.ground.isNearLake(posX, posZ, 20)) continue;
                
                // Skip this position if it's in the building area
                if (this.scene.isBuildingArea(posX, posZ)) continue;

                // Randomize tree parameters within defined ranges
                const rotationAngle = Math.random() * 30 - 15;         // [-15°, +15°]
                const rotationAxis = Math.random() < 0.5 ? 'x' : 'z';  // Random axis
                const trunkRadius = 0.6 + Math.random() * 1.3;         // [0.6, 1.9]
                const totalHeight = 12 + Math.random() * 6;            // [12, 18]
                const greenTone = 0.4 + Math.random() * 0.4;           // [0.4, 0.8]
                const crownColor = [0.05, greenTone, 0.05];            // Varying green

                // Randomly choose between regular tree and pine (30% pine)
                const isPine = Math.random() < 0.3;
                const trunkTexture = isPine ? this.trunkAltTexture : this.trunkTexture;
                const crownTexture = isPine ? this.pineTexture : this.leavesTexture;

                // Create tree with randomized parameters
                const tree = new MyTree(
                    this.scene,
                    rotationAngle,
                    rotationAxis,
                    trunkRadius,
                    totalHeight,
                    crownColor,
                    trunkTexture,
                    crownTexture
                );

                // Store tree with its position
                this.trees.push({
                    tree,
                    x: posX,
                    z: posZ
                });
            }
        }
    }

    /**
     * Get array of tree positions for fire placement
     * @return {Array} Array of position objects {x, z}
     */
    getTreePositions() {
        return this.trees.map(t => ({x: t.x, z: t.z}));
    }
    
    /**
     * Display all trees in the forest
     * Renders each tree at its calculated position
     */
    display() {
        this.scene.pushMatrix();
        for (const entry of this.trees) {
            this.scene.pushMatrix();
            this.scene.translate(entry.x, 0, entry.z);
            entry.tree.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();
    }
}