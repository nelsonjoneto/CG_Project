import { CGFobject } from '../lib/CGF.js';

/**
 * MyPyramid
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - Number of divisions around the Y axis
 * @param stacks - Number of divisions along the Y axis
 * @param baseWidth - Width of the pyramid's base
 * @param height - Height of the pyramid
 */
export class MyPyramid extends CGFobject {
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

        for (let i = 0; i < this.slices; i++) {
            // All vertices have to be declared for a given face
            // even if they are shared with others, as the normals
            // in each face will be different

            const sa = Math.sin(ang);
            const saa = Math.sin(ang + alphaAng);
            const ca = Math.cos(ang);
            const caa = Math.cos(ang + alphaAng);

            // Apex vertex
            this.vertices.push(0, this.height, 0);

            // Base vertices
            this.vertices.push(ca * halfBase, 0, -sa * halfBase);
            this.vertices.push(caa * halfBase, 0, -saa * halfBase);

            // Triangle normal computed by cross product of two edges
            const normal = [
                saa - sa,
                ca * saa - sa * caa,
                caa - ca
            ];

            // Normalize the normal vector
            const nsize = Math.sqrt(
                normal[0] * normal[0] +
                normal[1] * normal[1] +
                normal[2] * normal[2]
            );
            normal[0] /= nsize;
            normal[1] /= nsize;
            normal[2] /= nsize;

            // Push normal once for each vertex of this triangle
            this.normals.push(...normal);
            this.normals.push(...normal);
            this.normals.push(...normal);

            // Add indices for the triangle
            this.indices.push(3 * i, 3 * i + 1, 3 * i + 2);

            ang += alphaAng;
        }

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