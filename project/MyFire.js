import { CGFobject, CGFshader, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyTriangle } from './MyTriangle.js';

export class MyFire extends CGFobject {
    constructor(scene, rows = 3, cols = 3, areaWidth = 15, areaDepth = 15) {
        super(scene);
        this.scene = scene;
        this.triangles = [];
        
        // Store dimensions as properties
        this.rows = rows;
        this.cols = cols;
        this.areaWidth = areaWidth;
        this.areaDepth = areaDepth;
        
        // Store cell information for efficiency
        this.cells = [];
        this.extinguishingCells = {};

        // Create and configure flame material
        this.flameMaterial = new CGFappearance(this.scene);
        this.flameMaterial.setEmission(1.0, 0.6, 0.0, 1.0); // Flame-like glow
        this.flameMaterial.setTexture(new CGFtexture(this.scene, "textures/flame_texture.webp"));

        // Create shader
        this.flameShader = new CGFshader(
            this.scene.gl, 
            "shaders/flame.vert", 
            "shaders/flame.frag"
        );
        
        // Initialize shader uniforms
        this.flameShader.setUniformsValues({
            timeFactor: 0
        });

        this.initTriangles();
    }

    initTriangles() {
        const cellWidth = this.areaWidth / this.cols;
        const cellDepth = this.areaDepth / this.rows;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const baseX = -this.areaWidth / 2 + (j + 0.5) * cellWidth;
                const baseZ = -this.areaDepth / 2 + (i + 0.5) * cellDepth;
                
                // Store cell boundary information
                const cell = {
                    row: i,
                    col: j,
                    minX: baseX - cellWidth / 2,
                    maxX: baseX + cellWidth / 2,
                    minZ: baseZ - cellDepth / 2,
                    maxZ: baseZ + cellDepth / 2,
                    baseX: baseX,
                    baseZ: baseZ,
                    extinguished: false,
                    extinguishProgress: 0,
                    triangles: [],
                    cellId: `${i}_${j}`
                };
                
                this.cells.push(cell);
                
                const numFlames = 5 + Math.floor(Math.random() * 2); // 5-6 flames

                for (let k = 0; k < numFlames; k++) {
                    const width = 6 + Math.random() * 3.75;
                    const height = 11.25 + Math.random() * 7.5;
                    const rotationY = (Math.random() - 0.5) * Math.PI / 3;
                    
                    // Create unique movement pattern for each flame
                    const flameOffset = Math.random() * Math.PI * 2; // Phase offset
                    const xFrequency = 0.7 + Math.random() * 0.6; // Range: 0.7-1.3
                    const yFrequency = 0.5 + Math.random() * 0.4; // Range: 0.5-0.9
                    const zFrequency = 0.6 + Math.random() * 0.5; // Range: 0.6-1.1
                    const moveScale = 0.8 + Math.random() * 0.4; // Range: 0.8-1.2

                    const triangle = new MyTriangle(this.scene, width, height);

                    const flameObj = {
                        triangle: triangle,
                        position: {
                            x: baseX + (Math.random() - 0.5) * cellWidth * 0.5,
                            z: baseZ + (Math.random() - 0.5) * cellDepth * 0.5
                        },
                        rotationY: rotationY,
                        flameOffset: flameOffset,
                        xFrequency: xFrequency,
                        yFrequency: yFrequency,
                        zFrequency: zFrequency,
                        moveScale: moveScale,
                        cellId: cell.cellId
                    };
                    
                    // Add to both global triangle list and cell's triangle list
                    this.triangles.push(flameObj);
                    cell.triangles.push(flameObj);
                }
            }
        }
    }
    
    /**
     * Checks if a point is inside any fire cell and extinguishes it
     * @param {Number} x - x coordinate to check
     * @param {Number} z - z coordinate to check
     * @returns {Boolean} - true if coordinates were inside a fire cell
     */
    extinguishAtLocation(x, z) {
        // Check each cell
        for (const cell of this.cells) {
            // Skip already extinguishing or extinguished cells
            if (cell.extinguished || this.extinguishingCells[cell.cellId]) {
                continue;
            }
            
            // Check if point is inside this cell
            if (x >= cell.minX && x <= cell.maxX && z >= cell.minZ && z <= cell.maxZ) {
                console.log(`Extinguishing fire at cell ${cell.row},${cell.col}`);
                
                // Mark this cell as being extinguished
                this.extinguishingCells[cell.cellId] = {
                    startTime: Date.now(),
                    cell: cell
                };
                
                return true;
            }
        }
        
        return false;
    }
    
    // Update method for animation
    update(t) {
        // Store accumulated time as a class property
        if (!this.accumulatedTime) this.accumulatedTime = 0;
        this.accumulatedTime += t / 800; // Convert milliseconds to seconds
        
        this.flameShader.setUniformsValues({
            timeFactor: this.accumulatedTime
        });
        
        // Handle extinguishing animations
        const now = Date.now();
        const extinguishedCellIds = [];
        
        for (const cellId in this.extinguishingCells) {
            const extInfo = this.extinguishingCells[cellId];
            const cell = extInfo.cell;
            
            // Calculate progress (0 to 1 over 2 seconds)
            const elapsed = (now - extInfo.startTime) / 2000; // 2 seconds
            cell.extinguishProgress = Math.min(1.0, elapsed);
            
            // Check if fully extinguished
            if (cell.extinguishProgress >= 1.0) {
                cell.extinguished = true;
                extinguishedCellIds.push(cellId);
            }
        }
        
        // Remove fully extinguished cells from active list
        for (const cellId of extinguishedCellIds) {
            delete this.extinguishingCells[cellId];
        }
    }

    display() {
        this.scene.pushMatrix();
        
        // Save current shader
        const currentShader = this.scene.activeShader;

        // Activate flame shader
        this.scene.setActiveShader(this.flameShader);

        for (const flame of this.triangles) {
            // Skip flames in fully extinguished cells
            const cell = this.cells.find(c => c.cellId === flame.cellId);
            if (cell && cell.extinguished) {
                continue;
            }
            
            this.scene.pushMatrix();
            
            // Position the flame
            this.scene.translate(flame.position.x, 0, flame.position.z);
            this.scene.rotate(flame.rotationY, 0, 1, 0);
            
            // Check if this flame is in an extinguishing cell
            let extinguishFactor = 1.0;
            let isExtinguishing = false;
            
            if (this.extinguishingCells[flame.cellId]) {
                isExtinguishing = true;
                extinguishFactor = 1.0 - cell.extinguishProgress;
            }
            
            // Apply scale if extinguishing
            if (isExtinguishing) {
                this.scene.scale(extinguishFactor, extinguishFactor, extinguishFactor);
                
                // Adjust the emission color to fade out
                const fadingMaterial = new CGFappearance(this.scene);
                fadingMaterial.setEmission(
                    1.0 * extinguishFactor, 
                    0.6 * extinguishFactor, 
                    0.0 * extinguishFactor, 
                    1.0
                );
                fadingMaterial.setTexture(this.flameMaterial.texture);
                fadingMaterial.apply();
            } else {
                this.flameMaterial.apply();
            }
            
            // Set unique parameters for this flame
            this.flameShader.setUniformsValues({
                flameOffset: flame.flameOffset,
                xFrequency: flame.xFrequency,
                yFrequency: flame.yFrequency, 
                zFrequency: flame.zFrequency,
                moveScale: flame.moveScale
            });
            
            // Display the flame
            flame.triangle.display();
            
            this.scene.popMatrix();
        }
        
        // Restore original shader
        this.scene.setActiveShader(currentShader);
        
        this.scene.popMatrix();
    }
}