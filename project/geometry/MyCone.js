import { CGFobject } from '../../lib/CGF.js';

/**
 * MyCone
 * @constructor
 * @param scene     - Reference to MyScene object
 * @param slices    - Number of divisions around the cone circumference
 * @param stacks    - Number of divisions along the cone height (not used in current implementation)
 * @param baseWidth - Width of the cone base
 * @param height    - Height of the cone
 */
export class MyCone extends CGFobject {
    constructor(scene, slices, stacks, baseWidth, height) {
        super(scene);
        this.scene = scene;
        this.slices = slices;
        this.stacks = stacks;
        this.baseWidth = baseWidth;
        this.height = height;
        this.initBuffers();
    }

    /**
     * Initialize vertex buffers for the cone
     * Creates the vertices, normals, texture coordinates, and indices
     */
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = []; 

        const halfBase = this.baseWidth / 2;
        let ang = 0;
        const alphaAng = (2 * Math.PI) / this.slices;

        // Generate base vertices in a circle
        for (let i = 0; i < this.slices; i++) {
            const x = Math.cos(ang) * halfBase;
            const z = -Math.sin(ang) * halfBase;

            this.vertices.push(x, 0, z);

            // Calculate normals for smooth shading
            const normalX = Math.cos(ang);
            const normalZ = -Math.sin(ang);
            const normalY = this.height / Math.sqrt(this.height ** 2 + halfBase ** 2);
            this.normals.push(normalX, normalY, normalZ);

            // Connect each base vertex to the next one and to the apex
            this.indices.push(i, (i + 1) % this.slices, this.slices);

            // Texture coordinates
            const u = i / this.slices;
            const v = 0;
            this.texCoords.push(u, v);
            ang += alphaAng;
        }

        // Add the apex vertex
        this.vertices.push(0, this.height, 0);
        this.normals.push(0, 1, 0);
        this.texCoords.push(0.5, 1);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Updates the cone's complexity when the user interacts with the GUI
     * @param complexity - Complexity factor (0-1) that adjusts the number of slices
     */
    updateBuffers(complexity) {
        this.slices = 3 + Math.round(9 * complexity);
        this.initBuffers();
    }
}