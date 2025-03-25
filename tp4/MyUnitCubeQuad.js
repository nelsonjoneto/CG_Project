import { CGFobject } from '../lib/CGF.js';
import { MyQuad } from './MyQuad.js';

/**
 * MyUnitCubeQuad
 * @constructor
 * @param scene - Reference to MyScene object
 * @param topTexture - Texture for the top face (+Y)
 * @param frontTexture - Texture for the front face (+Z)
 * @param rightTexture - Texture for the right face (+X)
 * @param backTexture - Texture for the back face (-Z)
 * @param leftTexture - Texture for the left face (-X)
 * @param bottomTexture - Texture for the bottom face (-Y)
 */
export class MyUnitCubeQuad extends CGFobject {
    constructor(scene, topTexture = null, frontTexture = null, rightTexture = null, backTexture = null, leftTexture = null, bottomTexture = null) {
        super(scene);
        this.quad = new MyQuad(scene);

        // Store the textures
        this.topTexture = topTexture;
        this.frontTexture = frontTexture;
        this.rightTexture = rightTexture;
        this.backTexture = backTexture;
        this.leftTexture = leftTexture;
        this.bottomTexture = bottomTexture;
    }

    display() {
        // Top face (+Y)
        if (this.topTexture) this.topTexture.bind();
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
        this.scene.pushMatrix();
        this.scene.translate(0, 0.5, 0);
        this.scene.rotate(3 * Math.PI / 2, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();

        // Bottom face (-Y)
        if (this.bottomTexture) this.bottomTexture.bind();
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
        this.scene.pushMatrix();
        this.scene.translate(0, -0.5, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();

        // Front face (+Z)
        if (this.frontTexture) this.frontTexture.bind();
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.5);
        this.quad.display();
        this.scene.popMatrix();

        // Back face (-Z)
        if (this.backTexture) this.backTexture.bind();
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -0.5);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();

        // Right face (+X)
        if (this.rightTexture) this.rightTexture.bind();
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
        this.scene.pushMatrix();
        this.scene.translate(0.5, 0, 0);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();

        // Left face (-X)
        if (this.leftTexture) this.leftTexture.bind();
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
        this.scene.pushMatrix();
        this.scene.translate(-0.5, 0, 0);
        this.scene.rotate(3 * Math.PI / 2, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();

    }
}