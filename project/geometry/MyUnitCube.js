import { CGFobject } from '../../lib/CGF.js';

/**
 * MyUnitCube
 * @constructor
 * @param scene        - Reference to MyScene object
 * @param moduleNumber - Identifier for the module/building (default: 0)
 * @param options      - Configuration options (e.g. includeTop: false to omit top face)
 */
export class MyUnitCube extends CGFobject {
    constructor(scene, moduleNumber = 0, options = {}) {
        super(scene);
        this.moduleNumber = moduleNumber;
        this.options = options;
        this.initBuffers();
    }

    /**
     * Initialize vertex buffers for the unit cube
     * Creates vertices, normals, texture coordinates, and indices for all faces
     * Supports both outward and inward facing normals
     */
    initBuffers() {
        // Vertices for a unit cube centered at (0,0,0)
        this.vertices = [
            // Front face
            -0.5, 0,  0.5,
             0.5, 0,  0.5,
            -0.5, 1,  0.5,
             0.5, 1,  0.5,
            // Back face
            -0.5, 0, -0.5,
             0.5, 0, -0.5,
            -0.5, 1, -0.5,
             0.5, 1, -0.5,
        ];

        // Normals for each face (outwards)
        this.normals = [
            // Front
            0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
            // Back
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        ];

        // Texture coordinates
        this.texCoords = [
            // Front
            0, 1, 1, 1, 0, 0, 1, 0,
            // Back
            1, 1, 0, 1, 1, 0, 0, 0,
        ];

        // Indices for each face (outwards)
        this.indices = [
            // Front
            0, 1, 2, 1, 3, 2,
            // Back
            5, 4, 7, 4, 6, 7,
        ];

        // Add left, right, top, bottom faces (outwards)
        // Right
        this.vertices.push(
            0.5, 0,  0.5,  0.5, 0, -0.5,  0.5, 1,  0.5,  0.5, 1, -0.5
        );
        this.normals.push(
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0
        );
        this.texCoords.push(
            0, 1, 1, 1, 0, 0, 1, 0
        );
        this.indices.push(
            8, 9,10, 9,11,10
        );
        // Left
        this.vertices.push(
            -0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 1, -0.5, -0.5, 1, 0.5
        );
        this.normals.push(
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
        );
        this.texCoords.push(
            0, 1, 1, 1, 0, 0, 1, 0
        );
        this.indices.push(
            12,13,14, 13,15,14
        );
        // Top
        this.vertices.push(
            -0.5, 1, 0.5, 0.5, 1, 0.5, -0.5, 1, -0.5, 0.5, 1, -0.5
        );
        this.normals.push(
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
        );
        this.texCoords.push(
            0, 1, 1, 1, 0, 0, 1, 0
        );
        this.indices.push(
            16,17,18, 17,19,18
        );
        // Bottom
        this.vertices.push(
            -0.5, 0, -0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, 0.5
        );
        this.normals.push(
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0
        );
        this.texCoords.push(
            0, 1, 1, 1, 0, 0, 1, 0
        );
        this.indices.push(
            20,21,22, 21,23,22
        );

        // Save copies of original arrays
        const origVerts = this.vertices.slice();
        const origNorms = this.normals.slice();
        const origTex = this.texCoords.slice();
        const origInds = this.indices.slice();
        const nVerts = origVerts.length / 3;

        // Duplicate geometry to create inward-facing faces
        for (let i = 0; i < nVerts; i++) {
            this.vertices.push(origVerts[i * 3], origVerts[i * 3 + 1], origVerts[i * 3 + 2]);
            this.normals.push(-origNorms[i * 3], -origNorms[i * 3 + 1], -origNorms[i * 3 + 2]);
            this.texCoords.push(origTex[i * 2], origTex[i * 2 + 1]);
        }
        for (let i = 0; i < origInds.length; i += 3) {
            this.indices.push(
                nVerts + origInds[i], nVerts + origInds[i + 2], nVerts + origInds[i + 1]
            );
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}