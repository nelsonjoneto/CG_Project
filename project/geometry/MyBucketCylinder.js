import { CGFobject } from '../../lib/CGF.js';

/**
 * MyBucketCylinder
 * @constructor
 * @param scene     - Reference to MyScene object
 * @param slices    - Number of divisions around the cylinder circumference
 * @param stacks    - Number of divisions along the cylinder height
 * @param hasBottom - Whether to include a bottom cap (default: true)
 * @param hasTop    - Whether to include a top cap (default: false)
 */
export class MyBucketCylinder extends CGFobject {
    constructor(scene, slices, stacks, hasBottom = true, hasTop = false) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.hasBottom = hasBottom;
        this.hasTop = hasTop;
        this.initBuffers();
    }

    /**
     * Initialize vertex buffers for the cylinder
     * Creates the vertices, normals, texture coordinates, and indices
     */
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        
        const angleStep = (2 * Math.PI) / this.slices;
        const zStep = 1.0 / this.stacks;

        // Generate cylinder wall vertices
        for (let slice = 0; slice <= this.slices; slice++) {
            const angle = slice * angleStep;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            for (let stack = 0; stack <= this.stacks; stack++) {
                const z = stack * zStep;
                // Vertices
                this.vertices.push(cos, sin, z);
                // Normals (pointing outward)
                this.normals.push(cos, sin, 0);
                // Texture coordinates
                this.texCoords.push(slice/this.slices, 1 - stack/this.stacks);
            }
        }

        // Generate cylinder wall indices
        for (let s = 0; s < this.slices; s++) {
            for (let t = 0; t < this.stacks; t++) {
                const current = s * (this.stacks + 1) + t;
                const next = (s + 1) * (this.stacks + 1) + t;
                
                this.indices.push(current, current + 1, next);
                this.indices.push(next, current + 1, next + 1);
            }
        }

        // Add bottom cap if specified
        if (this.hasBottom) {
            this.addCap(0, -1);
        }

        // Add top cap if specified
        if (this.hasTop) {
            this.addCap(1, 1);
        }

        // Create back faces by duplicating triangles with reversed vertex order
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

    /**
     * Helper method to add a cap to the cylinder (top or bottom)
     * @param zPos     - Z position of the cap (0 for bottom, 1 for top)
     * @param normalDir - Direction of the normal vector (-1 for bottom, 1 for top)
     */
    addCap(zPos, normalDir) {
        const angleStep = (2 * Math.PI) / this.slices;
        const baseIndex = this.vertices.length / 3;
        
        // Center vertex
        this.vertices.push(0, 0, zPos);
        this.normals.push(0, 0, normalDir);
        this.texCoords.push(0.5, 0.5);
        
        // Rim vertices
        for (let s = 0; s <= this.slices; s++) {
            const angle = s * angleStep;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            this.vertices.push(cos, sin, zPos);
            this.normals.push(0, 0, normalDir);
            this.texCoords.push(0.5 + cos*0.5, 0.5 + sin*0.5);
        }

        // Cap indices
        for (let s = 0; s < this.slices; s++) {
            if (normalDir > 0) {
                // Top cap winding order
                this.indices.push(
                    baseIndex,
                    baseIndex + s + 2,
                    baseIndex + s + 1
                );
            } else {
                // Bottom cap winding order
                this.indices.push(
                    baseIndex,
                    baseIndex + s + 1,
                    baseIndex + s + 2
                );
            }
        }
    }
}