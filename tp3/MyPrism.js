import { CGFobject } from '../lib/CGF.js';

/**
 * MyPrism
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - Number of slices 
 * @param stacks - Number of stacks
 */
export class MyPrism extends CGFobject {
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
        let index = 0;

        for (let slice = 0; slice < this.slices; slice++) {
            const angle = slice * angleIncrement;
            const nextAngle = (slice + 1) * angleIncrement;

            const cosAngle = Math.cos(angle);
            const sinAngle = Math.sin(angle);
            const cosNextAngle = Math.cos(nextAngle);
            const sinNextAngle = Math.sin(nextAngle);

            for (let stack = 0; stack < this.stacks; stack++) {
                const z = stack * stackHeight;
                const nextZ = (stack + 1) * stackHeight;

                // Vertices
                this.vertices.push(cosAngle, sinAngle, z);
                this.vertices.push(cosNextAngle, sinNextAngle, z);
                this.vertices.push(cosAngle, sinAngle, nextZ);
                this.vertices.push(cosNextAngle, sinNextAngle, nextZ);

                // Indices
                this.indices.push(index, index + 1, index + 2);
                this.indices.push(index + 1, index + 3, index + 2);

                // Normals
                const normalX = Math.cos(angle + angleIncrement / 2);
                const normalY = Math.sin(angle + angleIncrement / 2);
                this.normals.push(normalX, normalY, 0);
                this.normals.push(normalX, normalY, 0);
                this.normals.push(normalX, normalY, 0);
                this.normals.push(normalX, normalY, 0);

                index += 4;
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

}