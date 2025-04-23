import { CGFobject } from '../lib/CGF.js';

/**
 * MyCone
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - Number of divisions around the Y axis
 * @param stacks - Number of divisions along the Y axis
 * @param baseWidth - Width of the cone's base
 * @param height - Height of the cone
 */
export class MyCone extends CGFobject {
    constructor(scene, slices, stacks, baseWidth, height) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.baseWidth = baseWidth;
        this.height = height;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];

        const halfBase = this.baseWidth / 2; // Half of the base width
        let ang = 0;
        const alphaAng = (2 * Math.PI) / this.slices;

        // Generate base vertices and normals
        for (let i = 0; i < this.slices; i++) {
            const x = Math.cos(ang) * halfBase;
            const z = -Math.sin(ang) * halfBase;

            // Base vertex
            this.vertices.push(x, 0, z);

            // Normal for the side face
            const normalX = Math.cos(ang);
            const normalZ = -Math.sin(ang);
            const normalY = this.height / Math.sqrt(this.height ** 2 + halfBase ** 2); // Normalize the normal
            this.normals.push(normalX, normalY, normalZ);

            // Add indices for the side face
            this.indices.push(i, (i + 1) % this.slices, this.slices);

            ang += alphaAng;
        }

        // Apex vertex
        this.vertices.push(0, this.height, 0);
        this.normals.push(0, 1, 0);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Called when user interacts with GUI to change object's complexity.
     * @param {integer} complexity - Changes number of slices
     */
    updateBuffers(complexity) {
        this.slices = 3 + Math.round(9 * complexity); // Complexity varies 0-1, so slices vary 3-12

        // Reinitialize buffers
        this.initBuffers();
        this.initNormalVizBuffers();
    }
}