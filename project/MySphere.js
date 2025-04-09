import { CGFobject } from '../lib/CGF.js';

export class MySphere extends CGFobject {
    constructor(scene, radius, slices, stacks, inside = false) {
        super(scene);
        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;
        this.inside = inside;
        this.initBuffers();
    }

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
                
                // Convert spherical to cartesian
                const x = this.radius * Math.cos(phi) * Math.cos(theta);
                const y = this.radius * Math.sin(phi);
                const z = this.radius * Math.cos(phi) * Math.sin(theta);

                // Vertices and normals (invert normals if inside)
                this.vertices.push(x, y, z);
                this.normals.push(this.inside ? -x : x, 
                                 this.inside ? -y : y, 
                                 this.inside ? -z : z);

                // Texture coordinates (u wraps around, v goes from 0 at top to 1 at bottom)
                this.texCoords.push(1 - (slice / this.slices), stack / this.stacks);
            }
        }

        // Generate indices
        for (let stack = 0; stack < this.stacks; stack++) {
            for (let slice = 0; slice < this.slices; slice++) {
                const first = (stack * (this.slices + 1)) + slice;
                const second = first + this.slices + 1;

                // Two triangles per stack/slice
                this.indices.push(first, first + 1, second);
                this.indices.push(second, first + 1, second + 1);                
                
            }
        }

        if (this.inside) {
            // Reverse winding order for inside visibility
            this.indices = this.indices.reverse();
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}