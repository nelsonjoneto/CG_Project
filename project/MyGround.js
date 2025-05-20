import { CGFobject, CGFappearance, CGFtexture, CGFshader } from '../lib/CGF.js';
import { MyPlane } from './MyPlane.js';

export class MyGround extends CGFobject {
    constructor(scene) {
        super(scene);
        const textureRepeat = 10;

        this.plane = new MyPlane(scene, textureRepeat, 0, textureRepeat, 0, textureRepeat);
        
        // Create a material for the ground
        this.groundMaterial = new CGFappearance(scene);
        this.groundMaterial.setAmbient(0.4, 0.4, 0.4, 1);
        this.groundMaterial.setDiffuse(0.8, 0.8, 0.8, 1);
        this.groundMaterial.setSpecular(0.1, 0.1, 0.1, 1);

        // Textures
        this.grassTex = new CGFtexture(scene, "textures/seamless_grass.jpg");
        this.waterTex = new CGFtexture(scene, "textures/waterTex.jpg");
        this.maskTex = new CGFtexture(scene, "textures/mask.png");
        this.waterMap = new CGFtexture(scene, "textures/waterMap.jpg");

        // Set default texture and wrapping mode
        this.groundMaterial.setTexture(this.grassTex);
        this.groundMaterial.setTextureWrap('REPEAT', 'REPEAT');

        // Shader setup
        this.groundShader = new CGFshader(scene.gl, "shaders/terrain.vert", "shaders/terrain.frag");

        this.groundShader.setUniformsValues({
            uSampler: 0,    // Grass texture
            uSampler2: 1,   // Water texture
            lakeMask: 2,    // Mask
            waterMap: 3,    // Height/normal map
            timeFactor: 0,
            textureRepeat: textureRepeat
        });
    }

    display() {
        this.scene.pushMatrix();
        
        // Scale and position the ground
        this.scene.scale(400, 1, 400);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        
        // Save current shader
        const currentShader = this.scene.activeShader;
        
        // Activate terrain shader
        this.scene.setActiveShader(this.groundShader);
        
        // Apply material (this binds the grass texture to unit 0)
        this.groundMaterial.apply();
        
        // Bind additional textures to their respective units
        this.waterTex.bind(1);
        this.maskTex.bind(2);
        this.waterMap.bind(3);
        
        // Update shader uniforms to include the waterMap as a uniform
        this.groundShader.setUniformsValues({
            waterMap: 3
        });
        
        // Display the plane
        this.plane.display();
        
        // Restore original shader
        this.scene.setActiveShader(currentShader);
        
        this.scene.popMatrix();
    }
}
