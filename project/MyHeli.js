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
import { vec3 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js';



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

        this.mainRotorAngle = 0;
        this.tailRotorAngle = 0;
        this.rotorSpeed = 0.3;


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

        // Estado de movimento
        this.position = vec3.fromValues(0, 9, 0); // posição inicial no heliporto (ajuste y se necessário)
        this.orientation = 0; // ângulo em torno do eixo Y
        this.velocity = vec3.fromValues(0, 0, 0); // vetor de velocidade

        this.speed = 0; // magnitude da velocidade
        this.pitch = 0; // inclinação
        this.state = "landed"; // landed | taking_off | cruising | landing
        this.rotorSpeed = 0;
        this.bucketVisible = false;
        this.position = vec3.fromValues(0, 0, 0); // deve estar compatível com a altura do heliporto

    }
        //console.log("Posição do helicóptero:", this.position);

    

    update(t) {
    const dt = this.scene.speedFactor * 0.05;

    if (this.state !== "landed") {
        this.mainRotorAngle += this.rotorSpeed;
        this.tailRotorAngle += this.rotorSpeed * 4;
    }

    if (this.state === "cruising") {
        if (!isNaN(this.orientation) && !isNaN(this.speed)) {
            const dir = vec3.fromValues(Math.cos(this.orientation), 0, -Math.sin(this.orientation));
            vec3.normalize(dir, dir);
            vec3.scale(this.velocity, dir, this.speed);
            vec3.scaleAndAdd(this.position, this.position, this.velocity, dt);
        }
    }

    if (this.state === "taking_off") {
        this.position[1] += 0.1 * this.scene.speedFactor;
        if (this.position[1] >= 5) {
            this.position[1] = 5;
            this.state = "cruising";
            this.bucketVisible = true;
        }
    }

    if (this.state === "landing") {
    const landingSpeed = 0.1 * this.scene.speedFactor;
    const landingTarget = vec3.fromValues(0, 0, 0);

    
    this.speed = 0;
    vec3.copy(this.velocity, vec3.fromValues(0, 0, 0));

    // Passo 1: mover horizontalmente (X,Z) com lerp
    const horizontalVec = vec3.fromValues(this.position[0], 0, this.position[2]);
    const targetXZ = vec3.fromValues(landingTarget[0], 0, landingTarget[2]);
    const distXZ = vec3.distance(horizontalVec, targetXZ);

    if (distXZ > 0.05) {
        const newXZ = vec3.create();
        vec3.lerp(newXZ, horizontalVec, targetXZ, 0.1);
        this.position[0] = newXZ[0];
        this.position[2] = newXZ[2];
    }

    // Etspa 2: descida em Y
    else if (this.position[1] > 0.05) {
        this.position[1] -= landingSpeed;
        if (this.position[1] < 0) this.position[1] = 0;
    }

    // passo 3: pouso feito
    else {
        vec3.copy(this.position, landingTarget);
        this.state = "landed";
        this.rotorSpeed = 0;
        this.bucketVisible = false;
        console.log("Helicóptero aterrado com sucesso (fixo).");
    }
}



    // inclinação gradual baseada na velocidade
    this.pitch = this.speed > 0 ? -Math.min(0.3, this.speed * 0.2) :
                this.speed < 0 ? Math.min(0.3, -this.speed * 0.2) : 0;

    console.log("Update pos:", this.position, "speed:", this.speed, "state:", this.state);
    console.log("Velocity:", this.velocity, "Position:", this.position);
}

    turn(v) {
        this.orientation += v * 0.05 * this.scene.speedFactor;
    }

    accelerate(v) {
        this.speed += v * 0.02 * this.scene.speedFactor;
        this.speed = Math.max(Math.min(this.speed, 0.5), -0.3);
    }

    takeOff() {
        if (this.state === "landed") {
            this.state = "taking_off";
            this.rotorSpeed = 0.3;
        }
    }

    land() {
    if (this.state === "cruising") {
        this.state = "landing";
        this.speed = 0;
        vec3.copy(this.velocity, vec3.fromValues(0, 0, 0)); // anula movimento
    }
}

    

    reset() {
        this.position = vec3.fromValues(0, 0, 0);
        this.orientation = 0;
        this.velocity = vec3.fromValues(0, 0, 0);
        vec3.copy(this.velocity, vec3.fromValues(0, 0, 0));
        this.speed = 0;
        this.state = "landed";
        this.pitch = 0;
        this.rotorSpeed = 0;
        this.bucketVisible = false;
        this.readyToDescend = false;
    }

    display() {
        this.scene.pushMatrix();

        // Transformações de posição e rotação
        this.scene.translate(...this.position);
        this.scene.rotate(this.orientation, 0, 1, 0);
        this.scene.rotate(this.pitch, 1, 0, 0);

        this.helicopterMaterial.apply();
        
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

        

        // blades principais com rotação animada
        this.scene.pushMatrix();
        this.scene.translate(0, 0.32, 0); // centro do rotor
        this.scene.rotate(this.mainRotorAngle, 0, 1, 0); // rotação animada em Y

        for (let i = 0; i < 4; i++) {
            this.scene.pushMatrix();
            this.scene.rotate(i * Math.PI / 2, 0, 1, 0); // 90º, 180º, 270º...
            this.scene.scale(1.5, 1.5, 1.5);
            this.scene.translate(0.7, 0.2, 0);
            this.blade.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();


        if (this.bucketVisible) {
            this.scene.pushMatrix();
            this.scene.translate(0, 0.45, 0);
            this.bucket.display();
            this.scene.popMatrix();
        }
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


        // blades traseiras com rotação animada
        this.scene.pushMatrix();
        this.scene.translate(-2.5, 0.3, 0.04); // centro do rotor traseiro
        this.scene.rotate(this.tailRotorAngle, 0, 0, 1); // rotação animada no plano XY

        for (let i = 0; i < 4; i++) {
            this.scene.pushMatrix();
            this.scene.rotate(i * Math.PI / 2, 0, 0, 1);
            this.scene.scale(0.2, 0.5, 0.5);
            this.blade.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();

        this.scene.popMatrix();
        
    }
}