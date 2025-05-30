import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyTriangle } from './MyTriangle.js';

export class MyFire extends CGFobject {
    constructor(scene, treePositions, numFires = 10, flameTexture) {
        super(scene);
        this.scene = scene;
        this.triangles = [];
        this.extinguishingCells = {};
        this.cells = [];
        this.accumulatedTime = 0;

        // Setup material for flames
        this.flameMaterial = new CGFappearance(this.scene);
        this.flameMaterial.setEmission(1.0, 0.6, 0.0, 1.0);
        this.flameMaterial.setTexture(flameTexture);


        this.initTrianglesFromTrees(treePositions, numFires);
    }

    initTrianglesFromTrees(treePositions, numFires) {
        const selected = new Set();

        while (this.cells.length < numFires && selected.size < treePositions.length) {
            const idx = Math.floor(Math.random() * treePositions.length);
            if (selected.has(idx)) continue;
            selected.add(idx);

            const baseX = treePositions[idx].x;
            const baseZ = treePositions[idx].z;
            const cellId = `tree_${idx}`;

            const cell = {
                cellId,
                baseX,
                baseZ,
                extinguished: false,
                extinguishProgress: 0,
                triangles: []
            };
            this.cells.push(cell);

            const numFlames = 4 + Math.floor(Math.random() * 3); // 4-6 flames per fire
            for (let k = 0; k < numFlames; k++) {
                const width = 6 + Math.random() * 3.75;
                const height = 11.25 + Math.random() * 7.5;
                const rotationY = (Math.random() - 0.5) * Math.PI / 3;

                const triangle = new MyTriangle(this.scene, width, height);
                const flame = {
                    triangle,
                    position: {
                        x: baseX + (Math.random() - 0.5) * 1.5,
                        z: baseZ + (Math.random() - 0.5) * 1.5
                    },
                    rotationY,
                    animationOffset: Math.random() * Math.PI * 2,
                    cellId
                };
                this.triangles.push(flame);
                cell.triangles.push(flame);
            }
        }
    }

    // Find a fire at location and return its cell ID if found
    findFireAtLocation(x, z, radius = 5) {
        for (const cell of this.cells) {
            if (cell.extinguished || this.extinguishingCells[cell.cellId]) continue;

            const dx = x - cell.baseX;
            const dz = z - cell.baseZ;
            const distSq = dx * dx + dz * dz;

            if (distSq <= radius * radius) {
                return cell.cellId;
            }
        }
        return null;
    }

    // Extinguish a specific fire by its cell ID
    extinguishFireByID(cellId) {
        if (!cellId) return false;
        
        const cell = this.cells.find(c => c.cellId === cellId);
        if (!cell || cell.extinguished || this.extinguishingCells[cellId]) {
            return false;
        }
        
        this.extinguishingCells[cellId] = {
            startTime: Date.now(),
            cell
        };
        return true;
    }

    // Find all fires in a radius
    findAllFiresInRadius(x, z, radius = 10) {
        const foundFireIds = [];
        
        for (const cell of this.cells) {
            if (cell.extinguished || this.extinguishingCells[cell.cellId]) continue;

            const dx = x - cell.baseX;
            const dz = z - cell.baseZ;
            const distSq = dx * dx + dz * dz;

            if (distSq <= radius * radius) {
                foundFireIds.push(cell.cellId);
            }
        }
        
        return foundFireIds;
    }

    update(t) {
        // Basic animation timing
        this.accumulatedTime += t / 1000;
        
        // Check extinguishing progress
        const now = Date.now();
        const toRemove = [];

        for (const cellId in this.extinguishingCells) {
            const info = this.extinguishingCells[cellId];
            const elapsed = (now - info.startTime) / 2000; // 2 seconds to extinguish
            info.cell.extinguishProgress = Math.min(1.0, elapsed);

            if (info.cell.extinguishProgress >= 1.0) {
                info.cell.extinguished = true;
                toRemove.push(cellId);
            }
        }

        for (const cellId of toRemove) {
            delete this.extinguishingCells[cellId];
        }
    }

    display() {
        this.scene.pushMatrix();
        
        for (const flame of this.triangles) {
            const cell = this.cells.find(c => c.cellId === flame.cellId);
            if (cell && cell.extinguished) continue;

            this.scene.pushMatrix();
            
            // Position the flame (no animation)
            this.scene.translate(flame.position.x, 0, flame.position.z);
            this.scene.rotate(flame.rotationY, 0, 1, 0); // Only the base rotation, no sway
            
            // Scale down if being extinguished
            let scale = 1.0;
            if (this.extinguishingCells[flame.cellId]) {
                scale = 1.0 - cell.extinguishProgress;
                this.scene.scale(scale, scale, scale);
                
                // Fade the material as fire is extinguished
                const fading = new CGFappearance(this.scene);
                fading.setAmbient(0.3 * scale, 0.1 * scale, 0.05 * scale, scale);
                fading.setDiffuse(0.8 * scale, 0.4 * scale, 0.1 * scale, scale);
                fading.setEmission(0.7 * scale, 0.3 * scale, 0.0 * scale, scale);
                fading.setSpecular(0.9 * scale, 0.6 * scale, 0.2 * scale, scale);
                fading.setTexture(this.flameMaterial.texture);
                fading.apply();
            } else {
                this.flameMaterial.apply();
            }

            // Display the triangle
            flame.triangle.display();
            
            this.scene.popMatrix();
        }
        
        this.scene.popMatrix();
    }
}