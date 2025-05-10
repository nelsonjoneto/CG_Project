import { CGFobject } from '../lib/CGF.js';

export class MyTrapezoidalFinWithHole extends CGFobject {
    constructor(scene, segments = 32) {
        super(scene);
        this.segments = segments;
        this.initBuffers();
    }

    initBuffers() {
        const thickness = 0.025;
        const height = 1.0;
        const baseWidth = 0.6; // comprimento da base (Z)
        const topWidth = 0.3;  // comprimento do topo (Z)
        const holeRadius = 0.15;
        const holeCenterY = 0;   // posição vertical do buraco
        const holeCenterZ = 0;   // centrado

        const xFront = thickness / 2;
        const xBack = -thickness / 2;

        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const addVertex = (x, y, z, nx, ny, nz) => {
            this.vertices.push(x, y, z);
            this.normals.push(nx, ny, nz);
            this.texCoords.push(0, 0);
        };

        // === Gerar vértices ===
        const frontOuter = [];
        const backOuter = [];
        const frontInner = [];
        const backInner = [];

        // Pontos do trapézio (frontal)
        frontOuter.push([xFront, height / 2, -topWidth / 2]); // topo esq
        frontOuter.push([xFront, height / 2, topWidth / 2]);  // topo dir
        frontOuter.push([xFront, -height / 2, -baseWidth / 2]); // base esq
        frontOuter.push([xFront, -height / 2, baseWidth / 2]);  // base dir

        // Versão traseira (mesmos pontos, em X negativo)
        backOuter.push([xBack, height / 2, -topWidth / 2]);
        backOuter.push([xBack, height / 2, topWidth / 2]);
        backOuter.push([xBack, -height / 2, -baseWidth / 2]);
        backOuter.push([xBack, -height / 2, baseWidth / 2]);

        // Buraco circular frontal
        for (let i = 0; i < this.segments; i++) {
            const angle = (2 * Math.PI * i) / this.segments;
            const y = holeCenterY + holeRadius * Math.sin(angle);
            const z = holeCenterZ + holeRadius * Math.cos(angle);
            frontInner.push([xFront, y, z]);
            backInner.push([xBack, y, z]);
        }

        // === Adicionar todos os vértices ===
        const startFrontOuter = 0;
        frontOuter.forEach(v => addVertex(...v, 1, 0, 0));
        const startFrontInner = this.vertices.length / 3;
        frontInner.forEach(v => addVertex(...v, 1, 0, 0));

        const startBackOuter = this.vertices.length / 3;
        backOuter.forEach(v => addVertex(...v, -1, 0, 0));
        const startBackInner = this.vertices.length / 3;
        backInner.forEach(v => addVertex(...v, -1, 0, 0));

        // === Faces frontais (entre trapézio e buraco)
        for (let i = 0; i < this.segments; i++) {
            const next = (i + 1) % this.segments;
            this.indices.push(startFrontOuter, startFrontInner + i, startFrontInner + next);
        }

        // === Faces traseiras
        for (let i = 0; i < this.segments; i++) {
            const next = (i + 1) % this.segments;
            this.indices.push(startBackOuter, startBackInner + next, startBackInner + i);
        }

        // === Paredes internas do buraco (conectar frente e trás)
        for (let i = 0; i < this.segments; i++) {
            const next = (i + 1) % this.segments;
            const f1 = startFrontInner + i;
            const f2 = startFrontInner + next;
            const b1 = startBackInner + i;
            const b2 = startBackInner + next;
            this.indices.push(f1, b1, f2);
            this.indices.push(f2, b1, b2);
        }

        // === Paredes externas do trapézio (4 arestas)
        const connectWall = (i1, i2, j1, j2) => {
            this.indices.push(i1, j1, i2);
            this.indices.push(i2, j1, j2);
        };

        for (let i = 0; i < 4; i++) {
            const frontIdx = startFrontOuter + i;
            const backIdx = startBackOuter + i;
            const frontNext = startFrontOuter + ((i + 1) % 4);
            const backNext = startBackOuter + ((i + 1) % 4);
            connectWall(frontIdx, frontNext, backIdx, backNext);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    display(material) {
        if (material) material.apply();
        super.display();
    }
}
