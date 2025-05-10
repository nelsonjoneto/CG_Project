import { CGFobject } from '../lib/CGF.js';


/**
     * MySolidCylinder
     * @constructor
     * @param scene - Reference to MyScene object
     * @param slices - Number of slices 
     * @param stacks - Number of stacks
     */
export class MySolidCylinder extends CGFobject {
    constructor(scene, slices, stacks) {
        super(scene);
        
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];

        const angleIncrement = (2 * Math.PI) / this.slices;
        const stackHeight = 1.0 / this.stacks;

        // Corpo lateral
        for (let slice = 0; slice <= this.slices; slice++) {
            const angle = slice * angleIncrement;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            for (let stack = 0; stack <= this.stacks; stack++) {
                const z = stack * stackHeight;
                this.vertices.push(cos, sin, z);
                this.normals.push(cos, sin, 0);
            }
        }

        for (let slice = 0; slice < this.slices; slice++) {
            for (let stack = 0; stack < this.stacks; stack++) {
                const curr = slice * (this.stacks + 1) + stack;
                const next = (slice + 1) * (this.stacks + 1) + stack;

                this.indices.push(curr, next, curr + 1);
                this.indices.push(next, next + 1, curr + 1);
            }
        }

        const baseCenterIndex = this.vertices.length / 3;
        this.vertices.push(0, 0, 0);     // centro da base
        this.normals.push(0, 0, -1);

        const topCenterIndex = baseCenterIndex + 1;
        this.vertices.push(0, 0, 1);     // centro do topo
        this.normals.push(0, 0, 1);

        // Base inferior
        for (let slice = 0; slice < this.slices; slice++) {
            const angle = slice * angleIncrement;
            const nextAngle = ((slice + 1) % this.slices) * angleIncrement;

            const i1 = slice * (this.stacks + 1);
            const i2 = ((slice + 1) % this.slices) * (this.stacks + 1);

            this.indices.push(baseCenterIndex, i2, i1);
        }

        // Topo
        for (let slice = 0; slice < this.slices; slice++) {
            const i1 = slice * (this.stacks + 1) + this.stacks;
            const i2 = ((slice + 1) % this.slices) * (this.stacks + 1) + this.stacks;

            this.indices.push(topCenterIndex, i1, i2);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
