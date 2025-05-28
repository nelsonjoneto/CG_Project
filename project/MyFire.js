import { CGFobject, CGFshader, CGFappearance } from '../lib/CGF.js';
import { MyTriangle } from './MyTriangle.js';

export class MyFire extends CGFobject {
    constructor(scene, treePositions, numFires = 10, flameTexture) {
        super(scene);
        this.scene = scene;
        this.triangles = [];
        this.extinguishingCells = {};
        this.cells = [];

        // Setup material
        this.flameMaterial = new CGFappearance(this.scene);
        this.flameMaterial.setEmission(1.0, 0.6, 0.0, 1.0);
        this.flameMaterial.setTexture(flameTexture);

        // Shader
        this.flameShader = new CGFshader(
            this.scene.gl,
            "shaders/flame.vert",
            "shaders/flame.frag"
        );
        this.flameShader.setUniformsValues({
            timeFactor: 0
        });

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

            const numFlames = 4 + Math.floor(Math.random() * 3); // 4-6
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
                    flameOffset: Math.random() * Math.PI * 2,
                    xFrequency: 0.7 + Math.random() * 0.6,
                    yFrequency: 0.5 + Math.random() * 0.4,
                    zFrequency: 0.6 + Math.random() * 0.5,
                    moveScale: 0.8 + Math.random() * 0.4,
                    cellId
                };
                this.triangles.push(flame);
                cell.triangles.push(flame);
            }
        }
    }

    extinguishAtLocation(x, z) {
        for (const cell of this.cells) {
            if (cell.extinguished || this.extinguishingCells[cell.cellId]) continue;

            const dx = x - cell.baseX;
            const dz = z - cell.baseZ;
            const distSq = dx * dx + dz * dz;

            if (distSq <= 5 * 5) { // within radius 5
                console.log(`Extinguishing fire at ${cell.cellId}`);
                this.extinguishingCells[cell.cellId] = {
                    startTime: Date.now(),
                    cell
                };
                return true;
            }
        }
        return false;
    }

    update(t) {
        if (!this.accumulatedTime) this.accumulatedTime = 0;
        this.accumulatedTime += t / 800;
        this.flameShader.setUniformsValues({ timeFactor: this.accumulatedTime });

        const now = Date.now();
        const toRemove = [];

        for (const cellId in this.extinguishingCells) {
            const info = this.extinguishingCells[cellId];
            const elapsed = (now - info.startTime) / 2000;
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
        const currentShader = this.scene.activeShader;
        this.scene.setActiveShader(this.flameShader);

        for (const flame of this.triangles) {
            const cell = this.cells.find(c => c.cellId === flame.cellId);
            if (cell && cell.extinguished) continue;

            this.scene.pushMatrix();
            this.scene.translate(flame.position.x, 0, flame.position.z);
            this.scene.rotate(flame.rotationY, 0, 1, 0);

            let scale = 1.0;
            if (this.extinguishingCells[flame.cellId]) {
                scale = 1.0 - cell.extinguishProgress;
                this.scene.scale(scale, scale, scale);

                const fading = new CGFappearance(this.scene);
                fading.setEmission(1.0 * scale, 0.6 * scale, 0.0 * scale, 1.0);
                fading.setTexture(this.flameMaterial.texture);
                fading.apply();
            } else {
                this.flameMaterial.apply();
            }

            this.flameShader.setUniformsValues({
                flameOffset: flame.flameOffset,
                xFrequency: flame.xFrequency,
                yFrequency: flame.yFrequency,
                zFrequency: flame.zFrequency,
                moveScale: flame.moveScale
            });

            flame.triangle.display();
            this.scene.popMatrix();
        }

        this.scene.setActiveShader(currentShader);
        this.scene.popMatrix();
    }
}
