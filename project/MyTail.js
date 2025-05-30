import { CGFobject } from '../lib/CGF.js';

export class MyTail extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }

    initBuffers() {
        const largeWidth = 0.18;
        const smallWidth = 0.05;
        const length = 2.5;
        const height = 0.15;

        this.vertices = [
            // Frente (lado do corpo) - normal (1 face = 4 vértices)
            0,  height/2,  largeWidth/2,   // 0
            0,  height/2, -largeWidth/2,   // 1
            0, -height/2,  largeWidth/2,   // 2
            0, -height/2, -largeWidth/2,   // 3

            // Traseira (afinada)
            -length,  height/4,  smallWidth/2,   // 4
            -length,  height/4, -smallWidth/2,   // 5
            -length, -height/4,  smallWidth/2,   // 6
            -length, -height/4, -smallWidth/2,   // 7

            // Topo
            0,  height/2,  largeWidth/2,   // 8
            -length,  height/4,  smallWidth/2,   // 9
            0,  height/2, -largeWidth/2,   // 10
            -length,  height/4, -smallWidth/2,   // 11

            // Fundo
            0, -height/2,  largeWidth/2,   // 12
            -length, -height/4,  smallWidth/2,   // 13
            0, -height/2, -largeWidth/2,   // 14
            -length, -height/4, -smallWidth/2,   // 15

            // Lado direito
            0,  height/2,  largeWidth/2,   // 16
            -length,  height/4,  smallWidth/2,   // 17
            0, -height/2,  largeWidth/2,   // 18
            -length, -height/4,  smallWidth/2,   // 19

            // Lado esquerdo
            0,  height/2, -largeWidth/2,   // 20
            -length,  height/4, -smallWidth/2,   // 21
            0, -height/2, -largeWidth/2,   // 22
            -length, -height/4, -smallWidth/2    // 23
        ];

        this.indices = [
            // Frente
            0, 1, 2,
            1, 3, 2,
        
            // Traseira
            4, 5, 6,
            5, 7, 6,
        
            // Topo
            8, 10, 9,
            10, 11, 9,
        
            // Fundo
            12, 13, 14,
            14, 13, 15,
        
            // Lado direito
            16, 17, 18,
            18, 17, 19,
        
            // Lado esquerdo
            20, 22, 21,
            22, 23, 21
        ];
        

        this.normals = [
            // Frente (Z+)
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // Traseira (Z-)
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            // Topo (Y+)
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // Fundo (Y-)
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // Direita (Z+)
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // Esquerda (Z-)
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1
        ];

        this.texCoords = [
            // Frente
            0, 0,
            1, 0,
            0, 1,
            1, 1,

            // Traseira
            0, 0,
            1, 0,
            0, 1,
            1, 1,

            // Topo
            0, 0,
            1, 0,
            0, 1,
            1, 1,

            // Fundo
            0, 0,
            1, 0,
            0, 1,
            1, 1,

            // Lado direito
            0, 0,
            1, 0,
            0, 1,
            1, 1,

            // Lado esquerdo
            0, 0,
            1, 0,
            0, 1,
            1, 1
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    display(material) {
        if (material) {
            material.apply();
        }
        super.display();
    }
}
