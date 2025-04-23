// MyUnitCube.js
import { CGFobject } from '../lib/CGF.js';

export class MyUnitCube extends CGFobject {
    constructor(scene, moduleNumber) {
        super(scene);
        this.moduleNumber = moduleNumber;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [
            // Front face (Z+)
            -0.5, 0.0, 0.5,  // 0
             0.5, 0.0, 0.5,  // 1
            -0.5, 1.0, 0.5,  // 2
             0.5, 1.0, 0.5,  // 3

            // Back face (Z-)
            -0.5, 0.0, -0.5, // 4
             0.5, 0.0, -0.5, // 5
            -0.5, 1.0, -0.5, // 6
             0.5, 1.0, -0.5, // 7

            // Top face (Y+)
            -0.5, 1.0, 0.5,  // 8
             0.5, 1.0, 0.5,  // 9
            -0.5, 1.0, -0.5, // 10
             0.5, 1.0, -0.5  // 11
        ];

        // Base indices for front, back, top, bottom
        this.indices = [
            // Front face
            1, 2, 0,
            3, 2, 1,

            // Back face
            4, 7, 5,
            6, 7, 4,

            // Top face
            8, 9, 10,
            9, 11, 10
        ];

        this.normals = [
            // Front face (Z+)
            0,0,1, 0,0,1, 0,0,1, 0,0,1,
            // Back face (Z-)
            0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
            // Top face (Y+)
            0,1,0, 0,1,0, 0,1,0, 0,1,0,
        ];

        //12, 13, 14, 15
        // Add right/left face based on boolean
        if (this.moduleNumber == 0) {
            // Right face
            this.vertices.push(0.5, 0.0, 0.5, 0.5, 0.0, -0.5, 0.5, 1.0, 0.5, 0.5, 1.0, -0.5)
            this.indices.push(12, 13, 14, 13, 15, 14);
            this.normals.push(1,0,0, 1,0,0, 1,0,0, 1,0,0)
        } else if (this.moduleNumber == 1) {
            // Left face
            this.vertices.push(-0.5, 0.0, 0.5, -0.5, 0.0, -0.5, -0.5, 1.0, 0.5, -0.5, 1.0, -0.5)
            this.indices.push(14, 13, 12, 14, 15, 13);
            this.normals.push(-1,0,0, -1,0,0, -1,0,0, -1,0,0)
        } else {
            // Right face
            this.vertices.push(0.5, 0.0, 0.5, 0.5, 0.0, -0.5, 0.5, 1.0, 0.5, 0.5, 1.0, -0.5)
            this.indices.push(12, 13, 14, 13, 15, 14);
            this.normals.push(1,0,0, 1,0,0, 1,0,0, 1,0,0)

            // Left face
            this.vertices.push(-0.5, 0.0, 0.5, -0.5, 0.0, -0.5, -0.5, 1.0, 0.5, -0.5, 1.0, -0.5)
            this.indices.push(18, 17, 16, 18, 19, 17);
            this.normals.push(-1,0,0, -1,0,0, -1,0,0, -1,0,0)
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}