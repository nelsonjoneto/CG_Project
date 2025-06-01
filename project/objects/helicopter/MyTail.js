import { CGFobject } from '../../../lib/CGF.js';

/**
 * MyTail - Helicopter tail boom component
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTail extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }

    /**
     * Initialize vertex buffers for the helicopter tail
     * Creates a tapered shape that is wider at the connection to the body
     * and narrower at the tail rotor end
     */
    initBuffers() {
        const largeWidth = 0.18;   // Width at connection to helicopter body
        const smallWidth = 0.05;   // Width at tail end
        const length = 2.5;        // Length of the tail boom
        const height = 0.15;       // Height of the tail boom

        this.vertices = [
            // Front face (body connection side) - 4 vertices
            0,  height/2,  largeWidth/2,   // 0
            0,  height/2, -largeWidth/2,   // 1
            0, -height/2,  largeWidth/2,   // 2
            0, -height/2, -largeWidth/2,   // 3

            // Rear face (tapered end)
            -length,  height/4,  smallWidth/2,   // 4
            -length,  height/4, -smallWidth/2,   // 5
            -length, -height/4,  smallWidth/2,   // 6
            -length, -height/4, -smallWidth/2,   // 7

            // Top face
            0,  height/2,  largeWidth/2,   // 8
            -length,  height/4,  smallWidth/2,   // 9
            0,  height/2, -largeWidth/2,   // 10
            -length,  height/4, -smallWidth/2,   // 11

            // Bottom face
            0, -height/2,  largeWidth/2,   // 12
            -length, -height/4,  smallWidth/2,   // 13
            0, -height/2, -largeWidth/2,   // 14
            -length, -height/4, -smallWidth/2,   // 15

            // Right side face
            0,  height/2,  largeWidth/2,   // 16
            -length,  height/4,  smallWidth/2,   // 17
            0, -height/2,  largeWidth/2,   // 18
            -length, -height/4,  smallWidth/2,   // 19

            // Left side face
            0,  height/2, -largeWidth/2,   // 20
            -length,  height/4, -smallWidth/2,   // 21
            0, -height/2, -largeWidth/2,   // 22
            -length, -height/4, -smallWidth/2    // 23
        ];

        this.indices = [
            // Front face
            0, 1, 2,
            1, 3, 2,
        
            // Rear face
            4, 5, 6,
            5, 7, 6,
        
            // Top face
            8, 10, 9,
            10, 11, 9,
        
            // Bottom face
            12, 13, 14,
            14, 13, 15,
        
            // Right side face
            16, 17, 18,
            18, 17, 19,
        
            // Left side face
            20, 22, 21,
            22, 23, 21
        ];
        
        this.normals = [
            // Front face (X+)
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // Rear face (X-)
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

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

            // Right side face (Z+)
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // Left side face (Z-)
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1
        ];

        this.texCoords = [
            // Front face
            0, 0,
            1, 0,
            0, 1,
            1, 1,

            // Rear face
            0, 0,
            1, 0,
            0, 1,
            1, 1,

            // Top face
            0, 0,
            1, 0,
            0, 1,
            1, 1,

            // Bottom face
            0, 0,
            1, 0,
            0, 1,
            1, 1,

            // Right side face
            0, 0,
            1, 0,
            0, 1,
            1, 1,

            // Left side face
            0, 0,
            1, 0,
            0, 1,
            1, 1
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Display the tail with optional material
     * @param material - CGFappearance material to apply (optional)
     */
    display(material) {
        if (material) {
            material.apply();
        }
        super.display();
    }
}