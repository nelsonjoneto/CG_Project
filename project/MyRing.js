import { CGFobject } from '../lib/CGF.js';

export class MyRing extends CGFobject {
    constructor(scene, slices, height = 0.05, innerRadius = 0.8, outerRadius = 1.0) {
        super(scene);
        this.slices = slices;
        this.height = height;        // Height of the ring
        this.innerRadius = innerRadius;  // Inner radius ratio
        this.outerRadius = outerRadius;  // Outer radius
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        
        // Create bottom ring face
        this.createRingFace(0, -1);
        
        // Create top ring face
        this.createRingFace(this.height, 1);
        
        // Create outer cylinder wall
        this.createCylinderWall(this.outerRadius, 1);
        
        // Create inner cylinder wall
        this.createCylinderWall(this.innerRadius, -1);
        
        // Create back faces
        const originalIndicesCount = this.indices.length;
        for (let i = 0; i < originalIndicesCount; i += 3) {
            this.indices.push(
                this.indices[i],     
                this.indices[i + 2], 
                this.indices[i + 1]  
            );
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    // Create a ring-shaped face (either top or bottom)
    createRingFace(zPos, normalDir) {
        const angleStep = (2 * Math.PI) / this.slices;
        const baseIndex = this.vertices.length / 3;
        
        // Create outer and inner rings of vertices
        for (let s = 0; s <= this.slices; s++) {
            const angle = s * angleStep;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            // Outer rim vertex
            this.vertices.push(cos * this.outerRadius, sin * this.outerRadius, zPos);
            this.normals.push(0, 0, normalDir);
            this.texCoords.push(0.5 + cos*0.5, 0.5 + sin*0.5);
            
            // Inner rim vertex
            this.vertices.push(cos * this.innerRadius, sin * this.innerRadius, zPos);
            this.normals.push(0, 0, normalDir);
            this.texCoords.push(0.5 + cos*0.5*this.innerRadius/this.outerRadius, 0.5 + sin*0.5*this.innerRadius/this.outerRadius);
        }
        
        // Create ring triangles
        for (let s = 0; s < this.slices; s++) {
            const outerCurrent = baseIndex + s * 2;
            const innerCurrent = outerCurrent + 1;
            const outerNext = baseIndex + (s + 1) * 2;
            const innerNext = outerNext + 1;
            
            // Create two triangles to form a quad
            if (normalDir > 0) {
                this.indices.push(outerCurrent, outerNext, innerCurrent);
                this.indices.push(innerCurrent, outerNext, innerNext);
            } else {
                this.indices.push(outerCurrent, innerCurrent, outerNext);
                this.indices.push(outerNext, innerCurrent, innerNext);
            }
        }
    }

    // Create cylinder wall (either outer or inner)
    createCylinderWall(radius, normalDir) {
        const angleStep = (2 * Math.PI) / this.slices;
        const baseIndex = this.vertices.length / 3;
        
        // Generate vertices for the cylinder wall
        for (let s = 0; s <= this.slices; s++) {
            const angle = s * angleStep;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            // Bottom vertex
            this.vertices.push(cos * radius, sin * radius, 0);
            this.normals.push(normalDir * cos, normalDir * sin, 0);
            this.texCoords.push(s/this.slices, 0);
            
            // Top vertex
            this.vertices.push(cos * radius, sin * radius, this.height);
            this.normals.push(normalDir * cos, normalDir * sin, 0);
            this.texCoords.push(s/this.slices, 1);
        }
        
        // Generate indices for the cylinder wall
        for (let s = 0; s < this.slices; s++) {
            const bottomCurrent = baseIndex + s * 2;
            const topCurrent = bottomCurrent + 1;
            const bottomNext = baseIndex + (s + 1) * 2;
            const topNext = bottomNext + 1;
            
            // Create two triangles to form a quad
            if (normalDir > 0) {
                this.indices.push(bottomCurrent, bottomNext, topCurrent);
                this.indices.push(topCurrent, bottomNext, topNext);
            } else {
                this.indices.push(bottomCurrent, topCurrent, bottomNext);
                this.indices.push(bottomNext, topCurrent, topNext);
            }
        }
    }
}