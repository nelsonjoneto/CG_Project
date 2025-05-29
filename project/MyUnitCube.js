import { CGFobject } from '../lib/CGF.js';

export class MyUnitCube extends CGFobject {
    constructor(scene, moduleNumber, options = {}) {
        super(scene);
        this.moduleNumber = moduleNumber;
        
        this.options = {
            includeTop: true,  
            ...options  
        };
        
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        
        // Front face (Z+)
        this.vertices.push(
            -0.5, 0.0, 0.5,  // 0
             0.5, 0.0, 0.5,  // 1
            -0.5, 1.0, 0.5,  // 2
             0.5, 1.0, 0.5   // 3
        );
        this.normals.push(0,0,1, 0,0,1, 0,0,1, 0,0,1);
        this.texCoords.push(0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0);
        
        // Front face indices
        this.indices.push(1, 2, 0, 3, 2, 1);

        // Back face (Z-)
        this.vertices.push(
            -0.5, 0.0, -0.5, // 4
             0.5, 0.0, -0.5, // 5
            -0.5, 1.0, -0.5, // 6
             0.5, 1.0, -0.5  // 7
        );
        this.normals.push(0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1);
        this.texCoords.push(1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0);
        
        // Back face indices
        this.indices.push(4, 6, 5, 5, 6, 7);

        // Optional top face (Y+)
        if (this.options.includeTop) {
            this.vertices.push(
                -0.5, 1.0, 0.5,  // 8
                 0.5, 1.0, 0.5,  // 9
                -0.5, 1.0, -0.5, // 10
                 0.5, 1.0, -0.5  // 11
            );
            this.normals.push(0,1,0, 0,1,0, 0,1,0, 0,1,0);
            this.texCoords.push(0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0);
            
            // Add top face indices
            this.indices.push(8, 9, 10, 9, 11, 10);
        }

        // Add right/left face based on module number
        let vertexIndex = this.options.includeTop ? 12 : 8;
        
        if (this.moduleNumber == 0 || this.moduleNumber == 2) {
            // Right face (X+)
            this.vertices.push(
                0.5, 0.0, 0.5,  
                0.5, 0.0, -0.5, 
                0.5, 1.0, 0.5,  
                0.5, 1.0, -0.5  
            );
            this.normals.push(1,0,0, 1,0,0, 1,0,0, 1,0,0);
            this.texCoords.push(0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0);
            
            // Add right face indices
            this.indices.push(vertexIndex, vertexIndex+1, vertexIndex+2, 
                             vertexIndex+1, vertexIndex+3, vertexIndex+2);
            vertexIndex += 4;
        }
        
        if (this.moduleNumber == 1 || this.moduleNumber == 2) {
            // Left face (X-)
            this.vertices.push(
                -0.5, 0.0, 0.5,  
                -0.5, 0.0, -0.5, 
                -0.5, 1.0, 0.5,  
                -0.5, 1.0, -0.5  
            );
            this.normals.push(-1,0,0, -1,0,0, -1,0,0, -1,0,0);
            this.texCoords.push(1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0);
            
            // Add left face indices
            this.indices.push(vertexIndex+2, vertexIndex+1, vertexIndex, 
                             vertexIndex+2, vertexIndex+3, vertexIndex+1);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}