import {CGFobject} from '../../lib/CGF.js';

/**
 * MyTriangle
 * @constructor
 * @param scene  - Reference to MyScene object
 * @param width  - Width of the triangle base (default: 1.0)
 * @param height - Height of the triangle from base to apex (default: 1.0)
 */
export class MyTriangle extends CGFobject {
    constructor(scene, width = 1.0, height = 1.0) {
        super(scene);
        this.width = width;
        this.height = height;
        this.initBuffers();
    }
    
    /**
     * Initialize vertex buffers for the triangle
     * Creates vertices, normals, texture coordinates, and indices
     * Includes both front and back faces
     */
    initBuffers() {
        const halfWidth = this.width/2;
        
        // Vertices for two faces (front and back)
        this.vertices = [
            // Front face
            -halfWidth, 0, 0,    // v0
            halfWidth, 0, 0,     // v1
            0, this.height, 0,   // v2
            
            // Back face
            -halfWidth, 0, 0,    // v3
            halfWidth, 0, 0,     // v4
            0, this.height, 0    // v5
        ];

        this.indices = [
            0, 1, 2,    // Front face
            5, 4, 3     // Back face (reversed winding)
        ];

        this.normals = [
            // Front face normals
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            
            // Back face normals
            0, 0, -1,
            0, 0, -1,
            0, 0, -1
        ];

        this.texCoords = [
            // Front face mapping
            0, 1,
            1, 1,
            0.5, 0,
            
            // Back face mapping
            0, 1,
            1, 1,
            0.5, 0
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}