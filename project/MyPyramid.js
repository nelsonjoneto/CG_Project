import { CGFobject } from '../lib/CGF.js';

/**
 * MyPyramid
 * @constructor
 * @param scene - Referência à cena a que pertence o objeto
 * @param slices - Número de divisões ao longo do eixo Y
 * @param stacks - Número de divisões ao longo do eixo Y
 * @param baseWidth - Largura da base da pirâmide
 * @param height - Altura da pirâmide
 */
export class MyPyramid extends CGFobject {
    constructor(scene, slices, stacks, baseWidth, height) {
        super(scene);
        this.scene = scene;
        this.slices = slices;
        this.stacks = stacks;
        this.baseWidth = baseWidth;
        this.height = height;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = []; // Array para coordenadas de textura

        const halfBase = this.baseWidth / 2;
        let ang = 0;
        const alphaAng = (2 * Math.PI) / this.slices;

        for (let i = 0; i < this.slices; i++) {
            const sa = Math.sin(ang);
            const saa = Math.sin(ang + alphaAng);
            const ca = Math.cos(ang);
            const caa = Math.cos(ang + alphaAng);

            this.vertices.push(0, this.height, 0);
            this.vertices.push(ca * halfBase, 0, -sa * halfBase);
            this.vertices.push(caa * halfBase, 0, -saa * halfBase);

            const normal = [
                saa - sa,
                ca * saa - sa * caa,
                caa - ca
            ];
            const nsize = Math.sqrt(
                normal[0] * normal[0] +
                normal[1] * normal[1] +
                normal[2] * normal[2]
            );
            normal[0] /= nsize;
            normal[1] /= nsize;
            normal[2] /= nsize;

            this.normals.push(...normal);
            this.normals.push(...normal);
            this.normals.push(...normal);

            this.indices.push(3 * i, 3 * i + 1, 3 * i + 2);

            // Calcula as coordenadas de textura para a face lateral da pirâmide
            const u1 = 0.5;
            const v1 = 1;
            const u2 = (ca + 1) / 2;
            const v2 = 0;
            const u3 = (caa + 1) / 2;
            const v3 = 0;
            this.texCoords.push(u1, v1, u2, v2, u3, v3);

            ang += alphaAng;
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