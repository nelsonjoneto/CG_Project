import { CGFobject } from '../lib/CGF.js';
import { MyTree } from './MyTree.js';

/**
 * MyForest
 * @constructor
 * @param scene      - Reference to MyScene object
 * @param rows       - Number of rows in the forest grid
 * @param cols       - Number of columns in the forest grid
 * @param areaWidth  - Width of the forest area
 * @param areaDepth  - Depth of the forest area
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

    
    initForest() {
        const cellW = this.areaWidth / this.cols;
        const cellD = this.areaDepth / this.rows;


        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {

                const centerX = -this.areaWidth/2 + cellW * (j + 0.5);
                const centerZ = -this.areaDepth/2 + cellD * (i + 0.5);
                const offsetX = (Math.random() * 0.8 - 0.4) * cellW; // ±40%
                const offsetZ = (Math.random() * 0.8 - 0.4) * cellD;

                const posX = centerX + offsetX;
                const posZ = centerZ + offsetZ;

                // Randomize tree parameters within defined ranges
                const rotationAngle = Math.random() * 30 - 15;           // [-15°, +15°]
                const rotationAxis  = Math.random() < 0.5 ? 'x' : 'z';  
                // Inside the initForest() method
                const trunkRadius = 0.6 + Math.random() * 1.3;        // [0.4, 1.0]
                const totalHeight = 12 + Math.random() * 6;            // [6, 12]
                const greenTone     = 0.4 + Math.random() * 0.4;        // [0.4, 0.8]
                const crownColor     = [0.05, greenTone, 0.05];          // varying green

                if (this.ground.isLake(posX, posZ) || this.ground.isNearLake(posX, posZ, 20)) continue;
                if (this.scene.isBuildingArea(posX, posZ)) continue;

                const isPine = Math.random() < 0.3;
                const trunkTexture = isPine ? this.trunkAltTexture : this.trunkTexture;
                const crownTexture = isPine ? this.pineTexture : this.leavesTexture;

                // Create tree
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

                // Compute base grid position
                

                this.trees.push({
                    tree,
                    x: centerX + offsetX,
                    z: centerZ + offsetZ
                });
            }
        }
    }

    
    display() {
        this.scene.pushMatrix();
        //this.scene.translate(-90, 0, 0);
        for (const entry of this.trees) {
            this.scene.pushMatrix();
            this.scene.translate(entry.x, 0, entry.z);
            entry.tree.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();
    }
}
