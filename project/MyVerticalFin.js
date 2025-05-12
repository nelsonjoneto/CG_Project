import { CGFobject } from '../lib/CGF.js';

export class MyVerticalFin extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }

    initBuffers() {
        const width = 0.2;     // Espessura (X)
        const height = 0.5;      // Altura (Y)
        const depth = 0.5;       // Comprimento da base (Z)
        const shift = 0.2;       // Deslocamento lateral da base superior

        const x1 = width / 2;
        const x2 = -width / 2;

        // Vértices (vista de lado Y-Z, extrudido em X)
        this.vertices = [
            // Lado direito (X = +)
            x1,  height / 2, -depth / 2 + shift,  // 0 topo esquerdo
            x1,  height / 2,  depth / 2 + shift,  // 1 topo direito
            x1, -height / 2, -depth / 2,          // 2 base esquerdo
            x1, -height / 2,  depth / 2,          // 3 base direito

            // Lado esquerdo (X = -)
            x2,  height / 2, -depth / 2 + shift,  // 4
            x2,  height / 2,  depth / 2 + shift,  // 5
            x2, -height / 2, -depth / 2,          // 6
            x2, -height / 2,  depth / 2           // 7
        ];

        this.indices = [
            // Face direita (trapezoidal)
            0, 2, 1,
            1, 2, 3,

            // Face esquerda
            5, 6, 4,
            5, 7, 6,

            // Topo
            0, 1, 4,
            1, 5, 4,

            // Base
            2, 6, 3,
            3, 6, 7,

            // Frente (Z+)
            1, 3, 5,
            5, 3, 7,

            // Trás (Z-)
            0, 4, 2,
            2, 4, 6
        ];

        this.normals = [
            // Direita (X+)
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
            // Esquerda (X-)
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
        ];

        this.texCoords = Array(this.vertices.length / 3).fill(0).flatMap(() => [0, 0]);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    display(material) {
        if (material) material.apply();
        super.display();
    }
}
