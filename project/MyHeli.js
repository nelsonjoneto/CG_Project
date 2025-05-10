import { CGFobject } from '../lib/CGF.js';
import { MyUnitCube } from './MyUnitCube.js';
import { MyCylinder } from './MyCylinder.js';
import { MySphere } from './MySphere.js';
import { MyBlade } from './MyBlade.js';
import { MyTail } from './MyTail.js';
import { MyVerticalFin } from './MyVerticalFin.js';
import { CGFappearance } from '../lib/CGF.js';
import { MySolidCylinder } from './MySolidCylinder.js';
import { MyBucket } from './MyBucket.js';


export class MyHelicopter extends CGFobject {
    constructor(scene) {
        super(scene);
        this.scene = scene;

        // Componentes do helicóptero
        this.body = new MySphere(scene, 1,  20, 20); // Corpo principal
        this.tail = new MyTail(scene); // Cauda
        this.rotor = new MyCylinder(scene, 20, 1); // Rotor principal
        this.tailRotor = new MyCylinder(scene, 8, 1); // Rotor traseiro
        this.blade = new MyBlade(scene);
        this.ski = new MyUnitCube(scene); // Patins do helicóptero
        this.skiSupport = new MyUnitCube(scene); // Suporte dos patins
        this.verticalFin = new MyVerticalFin(scene); // Fim vertical do rotor traseiro
        this.tailConnector = new MySolidCylinder(scene, 20, 1);
        this.bucket = new MyBucket(scene);




        // Material para o helicóptero
        this.helicopterMaterial = new CGFappearance(scene);
        this.helicopterMaterial.setAmbient(0.4, 0.4, 0.4, 1.0);
        this.helicopterMaterial.setDiffuse(0.6, 0.6, 0.6, 1.0);
        this.helicopterMaterial.setSpecular(1.0, 1.0, 1.0, 1.0);
        this.helicopterMaterial.setShininess(70.0);
        this.helicopterMaterial.loadTexture("textures/helicopter.png"); // Caminho para a textura do helicóptero
        //this.helicopterMaterial.setTextureWrap('REPEAT', 'REPEAT');

        this.otherMaterial = new CGFappearance(scene);
        this.otherMaterial.setAmbient(0.3, 0.3, 0.3, 1.0);
        this.otherMaterial.setDiffuse(0.8, 0.8, 0.8, 1.0);
        this.otherMaterial.setSpecular(0.1, 0.8, 0.2, 1.0);
        this.otherMaterial.setShininess(10.0);
        this.otherMaterial.loadTexture("textures/helicopter.jpg"); // Caminho para a textura do helicóptero

        
        
    }

    display() {
        this.scene.pushMatrix();

        this.helicopterMaterial.apply(); // Aplica o material do helicóptero
        
        // Corpo principal
        this.scene.pushMatrix();
        this.scene.scale(1, 0.5, 0.5);
        this.body.display();
        this.scene.popMatrix();

        // Cauda
        this.scene.pushMatrix();
        this.scene.translate(-0.9, 0, 0);
        this.scene.scale(0.65, 2, 2);
        //this.tail.enableNormalViz();
        this.tail.display(this.helicopterMaterial);
        this.scene.popMatrix();

        // Rotor principal
        this.scene.pushMatrix();
        this.scene.translate(0, 0.65, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(0.05, 0.05, 0.6);
        this.rotor.display();
        this.scene.popMatrix();

        

        // blades
        for (let i = 0; i < 4; i++) {
            this.scene.pushMatrix();
            this.scene.translate(0, 0.32, 0); // ligeiramente acima do cilindro
            this.scene.rotate(i * Math.PI / 2, 0, 1, 0); // 0º, 90º, 180º, 270º
            this.scene.scale(1.5, 1.5, 1.5);

            this.scene.translate(0.7, 0.2, 0);
            
            this.blade.display();
            this.scene.popMatrix();
        }

        this.scene.pushMatrix();
        this.scene.translate(0, 0.45, 0); // posição relativa abaixo do helicóptero
        this.bucket.display();
        this.scene.popMatrix();

        // ESQUIS (lado direito e esquerdo)
        const skiY = -0.77;      // Altura abaixo do corpo
        const skiZ = 0.35;      // Distância lateral
        const skiLength = 2;  // Comprimento do esqui
        const skiHeight = 0.06; // Altura do esqui
        const skiWidth = 0.05;  // Largura do esqui

        for (let side of [-1, 1]) {
            // Esqui principal
            this.scene.pushMatrix();
            this.scene.translate(0, skiY, skiZ * side);
            this.scene.scale(skiLength, skiHeight, skiWidth);
            this.ski.display();
            this.scene.popMatrix();

            // Suporte frontal
            this.scene.pushMatrix();
            this.scene.translate(0.4, skiY, skiZ * side); // altura = corpo até esqui
            this.scene.scale(0.05, 0.4, 0.05);
            this.skiSupport.display();
            this.scene.popMatrix();

            // Suporte traseiro
            this.scene.pushMatrix();
            this.scene.translate(-0.4, skiY, skiZ * side);
            this.scene.scale(0.05, 0.4, 0.05);
            this.skiSupport.display();
            this.scene.popMatrix();
        }


        // Empenagem vertical (losango no fim da cauda)
        this.scene.pushMatrix();
        this.scene.translate(-2.6, 0.12, 0); // ajustar para a ponta da cauda
        this.scene.rotate(-Math.PI /2, 0, 1, 0); // rotacionar para ficar na posição correta
        //this.verticalFin.display(this.helicopterMaterial);
        this.scene.popMatrix();

        // Cilindro vertical sólido no fim da cauda (suporte do rotor traseiro)
        this.scene.pushMatrix();
        this.scene.translate(-2.5, 0.12, 0); // fim da cauda
        this.scene.scale(0.05, 0.2, 0.05);   // pequeno e vertical
        this.tailConnector.display();
        this.scene.popMatrix();

        // Rotor traseiro embutido na empenagem vertical (estilo Fenestron)
        this.scene.pushMatrix();
        this.scene.translate(-2.5, 0.3, 0.04); // centro da empenagem
        this.scene.rotate(-Math.PI, 0, 1, 0); // rodar em torno de X
        this.scene.scale(0.15, 0.15, 0.1); // achatado e ajustado para caber na empenagem
        this.tailRotor.display();
        this.scene.popMatrix();


        for (let i = 0; i < 4; i++) {
            this.scene.pushMatrix();
            this.scene.translate(-2.5, 0.3, 0.04); // centro do rotor traseiro

            this.scene.rotate(i * Math.PI / 2, 0, 0, 1); // gira em torno de Z → plano XY
            this.scene.scale(0.2, 0.5, 0.5);
            this.blade.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();
        
    }
}