import { CGFobject, CGFappearance, CGFtexture, CGFshader } from '../lib/CGF.js';
import { MyPlane } from './MyPlane.js';

export class MyGround extends CGFobject {
    constructor(scene) {
        super(scene);
        const textureRepeat = 10;

        this.textureRepeat = textureRepeat;
        this.plane = new MyPlane(scene, textureRepeat, 0, textureRepeat, 0, textureRepeat);
        
        // Ground material
        this.groundMaterial = new CGFappearance(scene);
        this.groundMaterial.setAmbient(0.4, 0.4, 0.4, 1);
        this.groundMaterial.setDiffuse(0.8, 0.8, 0.8, 1);
        this.groundMaterial.setSpecular(0.1, 0.1, 0.1, 1);

        // Textures
        this.grassTex = new CGFtexture(scene, "textures/seamless_grass.jpg");
        this.waterTex = new CGFtexture(scene, "textures/waterTex.jpg");
        this.maskTex = new CGFtexture(scene, "textures/mask.png");

        this.groundMaterial.setTexture(this.grassTex);
        this.groundMaterial.setTextureWrap('REPEAT', 'REPEAT');

        // Shader setup
        this.groundShader = new CGFshader(scene.gl, "shaders/terrain.vert", "shaders/terrain.frag");
        this.groundShader.setUniformsValues({
            uSampler: 0,
            uSampler2: 1,
            lakeMask: 2,
            timeFactor: 0,
            textureRepeat: textureRepeat
        });

        // Load lake mask pixel data for lake detection
        this.loadLakeMaskData();
    }

    loadLakeMaskData() {
        const img = new Image();
        img.src = "textures/mask.png";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            this.lakeMaskWidth = img.width;
            this.lakeMaskHeight = img.height;
            this.lakeMaskData = ctx.getImageData(0, 0, img.width, img.height).data;
        };
    }

    isLake(x, z) {
        if (!this.lakeMaskData) return false;

        // Convert from world space (-200 to 200) to normalized space (0 to 1)
        const worldSize = 400; // Total world size
        
        // FIXED: Properly normalize coordinates and handle edge cases
        let u = (x + worldSize/2) / worldSize;
        let v = (z + worldSize/2) / worldSize;
        
        // Clamp values to prevent out-of-bounds access
        u = Math.max(0, Math.min(0.999, u));
        v = Math.max(0, Math.min(0.999, v));
        
        // Convert to pixel coordinates in the mask texture
        const px = Math.floor(u * this.lakeMaskWidth);
        const py = Math.floor(v * this.lakeMaskHeight); // FIXED: Don't flip v
        
        // Get the pixel data (RGBA format, 4 bytes per pixel)
        const index = (py * this.lakeMaskWidth + px) * 4;
        const red = this.lakeMaskData[index] / 255;
        
        // Lake area is black in the mask (red < 0.5)
        return red < 0.5;
    }

    display() {
        this.scene.pushMatrix();
        this.scene.scale(400, 1, 400);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);

        const currentShader = this.scene.activeShader;
        this.scene.setActiveShader(this.groundShader);

        this.groundMaterial.apply();
        this.waterTex.bind(1);
        this.maskTex.bind(2);

        this.plane.display();

        this.scene.setActiveShader(currentShader);
        this.scene.popMatrix();
    }
}
