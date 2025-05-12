import { CGFobject } from '../lib/CGF.js';
import { MyCone } from './MyCone.js';
import { MyPyramid } from './MyPyramid.js';
import { CGFappearance } from '../lib/CGF.js';
import { CGFtexture } from '../lib/CGF.js'; // Importa CGFtexture

/**
 * MyTree
 * @constructor
 * @param scene - Referência ao objeto MyScene
 * @param rotationAngle - Inclinação da árvore em graus
 * @param rotationAxis - Eixo de inclinação, 'x' ou 'z'
 * @param trunkRadius - Raio do tronco (base do cone)
 * @param totalHeight - Altura total da árvore
 * @param crownColor - Array de valores RGB (ex. [0, 0.6, 0])
 */
export class MyTree extends CGFobject {
    constructor(scene, rotationAngle, rotationAxis, trunkRadius, totalHeight, crownColor) {
        super(scene);

        this.scene = scene;
        this.rotationAngle = rotationAngle * Math.PI / 180;
        this.rotationAxis = rotationAxis.toLowerCase();
        this.trunkRadius = trunkRadius;
        this.totalHeight = totalHeight;
        this.crownColor = crownColor;

        // Altura do tronco: altura total da árvore
        this.trunkHeight = totalHeight;
        // Copa ocupa os 80% superiores da altura total
        this.crownHeight = totalHeight * 0.8;
        this.crownBaseY = totalHeight - this.crownHeight;

        // Cria o tronco (cone de altura total)
        this.trunk = new MyCone(
            scene,
            12,                // slices
            1,                 // stacks
            trunkRadius * 2,   // baseWidth = diâmetro
            this.trunkHeight   // height
        );

        // Parâmetros das pirâmides da copa
        this.pyramidHeight = 1.5;
        const overlap = 0.5;
        const stepY = this.pyramidHeight * (1 - overlap);

        // Calcula o número de pirâmides para que o topo coincida com o topo do tronco
        const availableHeight = this.crownHeight;
        const count = Math.max(
            1,
            Math.ceil((availableHeight - this.pyramidHeight) / stepY) + 1
        );

        // Cria um array de pirâmides idênticas (base = 2 * trunkRadius)
        this.crownPyramids = [];
        const baseWidth = trunkRadius * 3.5;
        const pyramidFaces = 6
        for (let i = 0; i < count; i++) {
            this.crownPyramids.push(
                new MyPyramid(scene, pyramidFaces, 1, baseWidth, this.pyramidHeight)
            );
        }

        // Materiais
        this.trunkMaterial = new CGFappearance(scene);
        this.trunkMaterial.setAmbient(0.3, 0.2, 0.1, 1);
        this.trunkMaterial.setDiffuse(0.3, 0.2, 0.1, 1);

        this.crownMaterial = new CGFappearance(scene);
        this.crownMaterial.setAmbient(...crownColor, 1);
        this.crownMaterial.setDiffuse(...crownColor, 1);

        // Carrega as texturas
        this.trunkTexture = new CGFtexture(scene, "textures/trunk.jpg");
        this.crownTexture = new CGFtexture(scene, "textures/crown.jpg");

        // Aplica as texturas aos materiais
        this.trunkMaterial.setTexture(this.trunkTexture);
        this.crownMaterial.setTexture(this.crownTexture);

        // Configura a forma como a textura se repete
        this.trunkMaterial.setTextureWrap('REPEAT', 'REPEAT');
        this.crownMaterial.setTextureWrap('REPEAT', 'REPEAT');

        // Armazena para exibição
        this._stepY = stepY;
    }

    display() {
        this.scene.pushMatrix();

        // Inclination

        if (this.rotationAxis === 'x') {
            this.scene.rotate(this.rotationAngle, 1, 0, 0);
        } else {
            this.scene.rotate(this.rotationAngle, 0, 0, 1);
        }

        // Draw trunk
        this.trunkMaterial.apply();
        this.trunk.display();

        // Draw crown pyramids
        this.crownMaterial.apply();
        for (let i = 0; i < this.crownPyramids.length; i++) {
            this.scene.pushMatrix();
            const y = this.crownBaseY + i * this._stepY;
            this.scene.translate(0, y, 0);
            this.crownPyramids[i].display();
            this.scene.popMatrix();
        }

        this.scene.popMatrix();
    }
}