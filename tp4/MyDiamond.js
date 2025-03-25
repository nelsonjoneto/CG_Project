import { CGFobject } from '../lib/CGF.js';

/**
 * MyDiamond
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyDiamond extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [
            -1, 0, 0,  // 0
            0, -1, 0,  // 1
            1, 0, 0,   // 2
            0, 1, 0,   // 3

            -1, 0, 0,  // 4
            0, -1, 0,  // 5
            1, 0, 0,   // 6
            0, 1, 0    // 7
        ];

        this.indices = [
            0, 1, 2,
            0, 2, 3,

            4, 6, 5,
            4, 7, 6
        ];

        this.normals = [
            // Front face
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // Back face
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1
        ];

		this.texCoords = [
			0, 0.5,
			0.25, 0.75,
			0.5, 0.5,
			0.25, 0.25,

            0, 0.5,
			0.25, 0.75,
			0.5, 0.5,
			0.25, 0.25,
		]

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}