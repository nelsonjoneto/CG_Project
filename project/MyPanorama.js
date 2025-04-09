import { MySphere } from "./MySphere";

export class MyPanorama {
    constructor(scene, texture, camera) {
        this.scene = scene;
        this.texture = texture;
        this.camera = camera;
        
        // Create inverted sphere with radius 1 (scaled later)
        this.sphere = new MySphere(scene, 64, 64, true);
        
        // Configure material (emissive only)
        this.material = new CGFappearance(scene);
        this.material.setAmbient(0, 0, 0, 1);
        this.material.setDiffuse(0, 0, 0, 1);
        this.material.setSpecular(0, 0, 0, 1);
        this.material.setEmission(1, 1, 1, 1); // Full emission
        this.material.setTexture(this.texture);
    }

    display() {
        this.scene.pushMatrix();
        
        // Follow camera position
        const pos = this.camera.position;
        this.scene.translate(pos[0], pos[1], pos[2]);
        
        // Scale to radius 200
        this.scene.scale(200, 200, 200);
        
        // Apply material and texture
        this.material.apply();
        this.sphere.display();
        
        this.scene.popMatrix();
    }
}