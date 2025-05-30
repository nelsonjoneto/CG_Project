import {CGFobject} from '../lib/CGF.js';

export class MyTriangle extends CGFobject {
    constructor(scene, width = 1.0, height = 1.0) {
        super(scene);
        this.width = width;
        this.height = height;
        this.initBuffers();
    }
    
    initBuffers() {
        const halfWidth = this.width/2;
        
        // Vertices para duas faces (frontal e traseira)
        this.vertices = [
            // Face frontal
            -halfWidth, 0, 0,    // v0
            halfWidth, 0, 0,     // v1
            0, this.height, 0,   // v2
            
            // Face traseira
            -halfWidth, 0, 0,    // v3
            halfWidth, 0, 0,     // v4
            0, this.height, 0    // v5
        ];

        this.indices = [
            0, 1, 2,    // Face frontal
            5, 4, 3     // Face traseira
        ];

        this.normals = [
            // Normais face frontal
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            
            // Normais face traseira
            0, 0, -1,
            0, 0, -1,
            0, 0, -1
        ];

        this.texCoords = [
            // Mapeamento face frontal
            0, 1,
            1, 1,
            0.5, 0,
            
            // Mapeamento face traseira
            0, 1,
            1, 1,
            0.5, 0
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}