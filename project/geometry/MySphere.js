import { CGFobject } from '../../lib/CGF.js';

/**
 * MySphere
 * @constructor
 * @param scene   - Reference to MyScene object
 * @param radius  - Radius of the sphere
 * @param slices  - Number of divisions around the sphere's equator
 * @param stacks  - Number of divisions along the sphere from pole to pole
 * @param inside  - Whether to display the sphere from inside (default: false)
 */
export class MySphere extends CGFobject {
    constructor(scene, radius, slices, stacks, inside = false) {
        super(scene);
        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;
        this.inside = inside;
        this.initBuffers();
    }

    /**
     * Initialize vertex buffers for the sphere
     * Creates vertices, normals, texture coordinates, and indices
     * Supports both regular (outside) and inside view modes
     */
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const thetaIncrement = (2 * Math.PI) / this.slices;
        const phiIncrement = Math.PI / this.stacks;

        // Generate vertices from top to bottom (North Pole to South Pole)
        for (let stack = 0; stack <= this.stacks; stack++) {
            const phi = Math.PI/2 - stack * phiIncrement; // Start at top (North Pole)
            
            for (let slice = 0; slice <= this.slices; slice++) {
                const theta = slice * thetaIncrement;
                
                // Convert spherical to cartesian coordinates
                const x = this.radius * Math.cos(phi) * Math.cos(theta);
                const y = this.radius * Math.sin(phi);
                const z = this.radius * Math.cos(phi) * Math.sin(theta);

                // Add vertices
                this.vertices.push(x, y, z);
                
                // Add normals (invert if inside view is requested)
                this.normals.push(this.inside ? -x/this.radius : x/this.radius, 
                                 this.inside ? -y/this.radius : y/this.radius, 
                                 this.inside ? -z/this.radius : z/this.radius);

                // Texture coordinates (u wraps around, v goes from 0 at top to 1 at bottom)
                this.texCoords.push(1 - (slice / this.slices), stack / this.stacks);
            }
        }

        // Generate indices to create the triangle mesh
        for (let stack = 0; stack < this.stacks; stack++) {
            for (let slice = 0; slice < this.slices; slice++) {
                const first = (stack * (this.slices + 1)) + slice;
                const second = first + this.slices + 1;

                // Two triangles per stack/slice segment
                this.indices.push(first, first + 1, second);
                this.indices.push(second, first + 1, second + 1);                
            }
        }

        // For inside view, reverse the winding order
        if (this.inside) {
            this.indices = this.indices.reverse();
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}