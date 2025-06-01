import { CGFobject, CGFappearance } from '../../../lib/CGF.js';

/**
 * MyBlade
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyBlade extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();

        // Create material for the blade
        this.bladeMaterial = new CGFappearance(scene);
        this.bladeMaterial.setAmbient(0.3, 0.3, 0.3, 1.0);
        this.bladeMaterial.setDiffuse(0.8, 0.8, 0.8, 1.0);
        this.bladeMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.bladeMaterial.setShininess(10.0);
    }

    /**
     * Initialize vertex buffers for the helicopter blade
     * Creates a slightly twisted blade shape with six faces
     */
    initBuffers() {
        const thickness = 0.05;
    
        this.vertices = [
            // Top face (Y+)
            -0.75, thickness / 2, -0.05,  // 0
            -0.75, thickness / 2,  0.05,  // 1
             0.75, thickness / 2, -0.1,   // 2
             0.75, thickness / 2,  0.1,   // 3
    
            // Bottom face (Y-)
            -0.75, -thickness / 2, -0.05, // 4
            -0.75, -thickness / 2,  0.05, // 5
             0.75, -thickness / 2, -0.1,  // 6
             0.75, -thickness / 2,  0.1,  // 7
    
            // Left face (X-)
            -0.75, thickness / 2, -0.05,  // 8
            -0.75, thickness / 2,  0.05,  // 9
            -0.75, -thickness / 2, -0.05, //10
            -0.75, -thickness / 2,  0.05, //11
    
            // Right face (X+)
             0.75, thickness / 2, -0.1,   //12
             0.75, thickness / 2,  0.1,   //13
             0.75, -thickness / 2, -0.1,  //14
             0.75, -thickness / 2,  0.1,  //15
    
            // Front face (Z+)
            -0.75, thickness / 2,  0.05,  //16
             0.75, thickness / 2,  0.1,   //17
            -0.75, -thickness / 2,  0.05, //18
             0.75, -thickness / 2,  0.1,  //19
    
            // Back face (Z-)
            -0.75, thickness / 2, -0.05,  //20
             0.75, thickness / 2, -0.1,   //21
            -0.75, -thickness / 2, -0.05, //22
             0.75, -thickness / 2, -0.1   //23
        ];
    
        this.indices = [
            // Top
            0, 1, 2,
            1, 3, 2,
    
            // Bottom
            5, 4, 6,
            5, 6, 7,
    
            // Left
            8, 10, 9,
            9, 10, 11,
    
            // Right
            12, 13, 14,
            13, 15, 14,
    
            // Front
            16, 18, 17,
            17, 18, 19,
    
            // Back
            20, 21, 22,
            21, 23, 22
        ];
    
        this.normals = [
            // Top face
            0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    
            // Bottom face
            0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,
    
            // Left face
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    
            // Right face
            1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    
            // Front face
            0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
    
            // Back face
            0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1
        ];
    
        this.texCoords = new Array(24).fill(0).flatMap((_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 2;
            const rowVal = (i % 4 >= 2) ? 1 : 0;
            return [col, rowVal];
        });
    
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Display the blade with its material
     * Applies the blade material before rendering
     */
    display() {
        this.scene.pushMatrix();
        this.bladeMaterial.apply();
        super.display();
        this.scene.popMatrix();
    }
}