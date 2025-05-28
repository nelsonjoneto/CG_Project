import { CGFobject } from '../lib/CGF.js';

/**
 * MyCone
 * @constructor
 * @param scene - Referência à cena a que pertence o objeto
 * @param slices - Número de divisões ao longo do eixo Y
 * @param stacks - Número de divisões ao longo do eixo Y
 * @param baseWidth - Largura da base do cone
 * @param height - Altura do cone
 */
export class MyCone extends CGFobject {
    constructor(scene, slices, stacks, baseWidth, height) {
        super(scene);
        this.scene = scene; // Guarda a referência à cena
        this.slices = slices;
        this.stacks = stacks;
        this.baseWidth = baseWidth;
        this.height = height;
        this.initBuffers();
    }

    // Update the initBuffers method with improved texture mapping
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const halfBase = this.baseWidth / 2;
        const alphaAng = (2 * Math.PI) / this.slices;
        
        // Add vertex at the top
        this.vertices.push(0, this.height, 0);
        this.normals.push(0, 1, 0);
        this.texCoords.push(0.5, 0); // Top center of texture
        
        // Generate the lateral vertices
        for (let i = 0; i <= this.slices; i++) {  // Note: <= to include closing vertex
            // Calculate angle - complete the loop for texture mapping
            const ang = i * alphaAng;
            
            // Position
            const x = Math.cos(ang) * halfBase;
            const z = -Math.sin(ang) * halfBase;
            this.vertices.push(x, 0, z);
            
            // Normal vector (angled outward and up)
            const normalX = Math.cos(ang);
            const normalZ = -Math.sin(ang);
            const normalY = this.height / Math.sqrt(this.height**2 + halfBase**2);
            this.normals.push(normalX, normalY, normalZ);
            
            // Texture mapping - full wrap from 0-1
            const u = i / this.slices;
            const v = 1; // Base is at bottom of texture
            this.texCoords.push(u, v);
        }
        
        // Create triangle indices - fan from top vertex
        for (let i = 0; i < this.slices; i++) {
            this.indices.push(0, i+1, i+2);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Chamado quando o utilizador interage com a GUI para alterar a complexidade do objeto.
     * @param {integer} complexity - Altera o número de slices
     */
    updateBuffers(complexity) {
        this.slices = 3 + Math.round(9 * complexity);
        this.initBuffers();
    }
}