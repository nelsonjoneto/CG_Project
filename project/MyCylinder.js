import { CGFobject } from '../lib/CGF.js';

/**
 * MyCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - Number of slices 
 * @param stacks - Number of stacks
 */
export class MyCylinder extends CGFobject {
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

        for (let slice = 0; slice <= this.slices; slice++) {
            const angle = slice * angleIncrement;
            const cosAngle = Math.cos(angle);
            const sinAngle = Math.sin(angle);

            for (let stack = 0; stack <= this.stacks; stack++) {
                const z = stack * stackHeight;

                // Vertices
                this.vertices.push(cosAngle, sinAngle, z);

                this.normals.push(cosAngle, sinAngle, 0);
            }
        }

        for (let slice = 0; slice < this.slices; slice++) {
            for (let stack = 0; stack < this.stacks; stack++) {
                const current = slice * (this.stacks + 1) + stack;
                const next = (slice + 1) * (this.stacks + 1) + stack;

                // Indices
                this.indices.push(current, next, current + 1);
                this.indices.push(next, next + 1, current + 1);
            }
        }


        const indexCount = this.indices.length;
        for (let i = 0; i < indexCount; i += 3) {
            this.indices.push(this.indices[i], this.indices[i + 2], this.indices[i + 1]);
        }
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

}