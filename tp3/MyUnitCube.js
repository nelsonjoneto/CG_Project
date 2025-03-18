import { CGFobject } from '../lib/CGF.js';

export class MyUnitCube extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }

    initBuffers() {

        this.vertices = [
            // Front face (Z+)
            -0.5, -0.5, 0.5,  // 0
            0.5, -0.5, 0.5,   // 1
            -0.5, 0.5, 0.5,   // 2
            0.5, 0.5, 0.5,    // 3

            // Back face (Z-)
            -0.5, -0.5, -0.5, // 4
            0.5, -0.5, -0.5,  // 5
            -0.5, 0.5, -0.5,  // 6
            0.5, 0.5, -0.5,   // 7

            // Top face (Y+)
            -0.5, 0.5, 0.5,   // 8 (duplicate of 2)
            0.5, 0.5, 0.5,    // 9 (duplicate of 3)
            -0.5, 0.5, -0.5,  // 10 (duplicate of 6)
            0.5, 0.5, -0.5,   // 11 (duplicate of 7)

            // Bottom face (Y-)
            -0.5, -0.5, 0.5,  // 12 (duplicate of 0)
            0.5, -0.5, 0.5,   // 13 (duplicate of 1)
            -0.5, -0.5, -0.5, // 14 (duplicate of 4)
            0.5, -0.5, -0.5, // 15 (duplicate of 5)

            // Right face (X+)
            0.5, -0.5, 0.5,   // 16 (duplicate of 1)
            0.5, -0.5, -0.5,  // 17 (duplicate of 5)
            0.5, 0.5, 0.5,    // 18 (duplicate of 3)
            0.5, 0.5, -0.5,   // 19 (duplicate of 7)

            // Left face (X-)
            -0.5, -0.5, 0.5,  // 20 (duplicate of 0)
            -0.5, -0.5, -0.5, // 21 (duplicate of 4)
            -0.5, 0.5, 0.5,   // 22 (duplicate of 2)
            -0.5, 0.5, -0.5  // 23 (duplicate of 6)
        ];

        // Indices (counter-clockwise triangles for all 6 faces)
        this.indices = [
            // Front face
            1, 2, 0,
            3, 2, 1,

            // Back face
            4, 7, 5,
            6, 7, 4,
            //5, 7, 4,
            //4, 7, 6,

            // Top face
            8, 9, 10,
            9, 11, 10,

            // Bottom face
            14, 13, 12,
            14, 15, 13,
            //12, 13, 14,
            //13, 15, 14,

            // Right face
            16, 17, 18,
            17, 19, 18,

            // Left face
            22, 21, 20,
            22, 23, 21
            //20, 21, 22,
            //21, 23, 22
        ];

        this.normals = [
            // Front face (Z+)
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // Back face (Z-)
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // Top face (Y+)
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // Bottom face (Y-)
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // Right face (X+)
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // Left face (X-)
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}