import {CGFobject} from '../lib/CGF.js';
/**
 * MyTriangleRed
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTriangleRed extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [
            -1, -1, 0,	//0
            -1, -1, 0,	//0

            1, -1, 0,	//1
            1, -1, 0,	//1

            -1, 1, 0,	//2
            -1, 1, 0,	//2
        ];

        //Counter-clockwise reference of vertices
        this.indices = [
            0, 2, 4,
            5, 3, 1
        ];

        this.normals = [
            0, 0, 1,
            0, 0, -1,

            0, 0, 1,
            0, 0, -1,

            0, 0, 1,
            0, 0, -1
        ];

        this.texCoords = [
            0.5,0.5,
            0.25,0.75,
            0.75,0.75,
            
            0.5,0.5,
            0.25,0.75,
            0.75,0.75,
        ]

        //The defined indices (and corresponding vertices)
        //will be read in groups of three to draw triangles
        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
    }
}

