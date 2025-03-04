import { CGFobject } from '../lib/CGF.js';

/**
 * MyUnitCube
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyUnitCube extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [
            -0.5, -0.5, 0.5,  // 0
            0.5, -0.5, 0.5,   // 1
            -0.5, 0.5, 0.5,   // 2
            0.5, 0.5, 0.5,    // 3
            
            -0.5, -0.5, -0.5, // 4
            0.5, -0.5, -0.5,  // 5
            -0.5, 0.5, -0.5,  // 6
            0.5, 0.5, -0.5    // 7
        ];

        // Counter-clockwise reference of vertices
        this.indices = [
            // Front face
            0, 1, 2,
            1, 3, 2,
            // Back face
            4, 6, 5,
            5, 6, 7,
            // Top face
            2, 3, 6,
            3, 7, 6,
            // Bottom face
            0, 4, 1,
            1, 4, 5,
            // Right face
            1, 5, 3,
            3, 5, 7,
            // Left face
            0, 2, 4,
            2, 6, 4
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}