import {CGFobject} from '../lib/CGF.js';
/**
 * MyDiamond
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyParallelogram extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [
            
            0, 0, 0, //0
            2, 0, 0, //1  
            3, 1, 0, //2
            1, 1, 0, //3

            0, 0, 0, //4
            2, 0, 0, //5  
            3, 1, 0, //6
            1, 1, 0, //7
            
        ];

        //Counter-clockwise reference of vertices
        this.indices = [
            
            2,1,0,
            0,3,2,

            4,5,6,
            6,7,4,
               
        ];
        
        this.normals = [
            
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

        ]

        this.texCoords = [
            0.25,0.75,
            0.5,1,
            1,1,
            0.75,0.75,

            0.25,0.75,
            0.5,1,
            1,1,
            0.75,0.75,
		]

        //The defined indices (and corresponding vertices)
        //will be read in groups of three to draw triangles
        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
    }
}

