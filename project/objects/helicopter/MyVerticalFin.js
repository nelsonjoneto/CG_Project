import { CGFobject } from '../../../lib/CGF.js';

/**
 * MyVerticalFin - Helicopter vertical stabilizer fin
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyVerticalFin extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }

    /**
     * Initialize vertex buffers for the vertical fin
     * Creates a trapezoidal shape with an asymmetric top edge
     */
    initBuffers() {
        const width = 0.2;     // Thickness (X)
        const height = 0.5;    // Height (Y)
        const depth = 0.5;     // Base length (Z)
        const shift = 0.2;     // Top edge shift amount
        
        const x1 = width / 2;  // Right side X coordinate
        const x2 = -width / 2; // Left side X coordinate

        // Vertices (side view Y-Z, extruded along X)
        this.vertices = [
            // Right side (X = +)
            x1,  height / 2, -depth / 2 + shift,  // 0 top left
            x1,  height / 2,  depth / 2 + shift,  // 1 top right
            x1, -height / 2, -depth / 2,          // 2 bottom left
            x1, -height / 2,  depth / 2,          // 3 bottom right

            // Left side (X = -)
            x2,  height / 2, -depth / 2 + shift,  // 4 top left
            x2,  height / 2,  depth / 2 + shift,  // 5 top right
            x2, -height / 2, -depth / 2,          // 6 bottom left
            x2, -height / 2,  depth / 2           // 7 bottom right
        ];

        this.indices = [
            // Right face (trapezoidal)
            0, 2, 1,
            1, 2, 3,

            // Left face
            5, 6, 4,
            5, 7, 6,

            // Top face
            0, 1, 4,
            1, 5, 4,

            // Bottom face
            2, 6, 3,
            3, 6, 7,

            // Front face (Z+)
            1, 3, 5,
            5, 3, 7,

            // Back face (Z-)
            0, 4, 2,
            2, 4, 6
        ];

        this.normals = [
            // Right side (X+)
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
            // Left side (X-)
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
        ];

        this.texCoords = Array(this.vertices.length / 3).fill(0).flatMap(() => [0, 0]);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Display the vertical fin with optional material
     * @param material - Optional material to apply before rendering
     */
    display(material) {
        if (material) material.apply();
        super.display();
    }
}