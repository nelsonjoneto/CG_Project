import { CGFobject, CGFappearance, CGFshader } from '../lib/CGF.js';
    import { MyPlane } from './MyPlane.js';

    export class MyGround extends CGFobject {
        constructor(scene, textures = {}) {
            super(scene);
            this.textures = textures;
            const textureRepeat = 40;

            this.textureRepeat = textureRepeat;
            this.plane = new MyPlane(scene, 200, 0, textureRepeat, 0, textureRepeat);
            this.maskReady = false;

            // Ground material
            this.groundMaterial = new CGFappearance(scene);
            this.groundMaterial.setAmbient(0.4, 0.4, 0.4, 1);
            this.groundMaterial.setDiffuse(0.8, 0.8, 0.8, 1);
            this.groundMaterial.setSpecular(0.1, 0.1, 0.1, 1);

            // Textures
            this.groundMaterial.setTexture(this.textures.grass);
            this.waterTex = this.textures.water;
            this.maskTex = this.textures.mask;
            


            //this.groundMaterial.setTexture(this.textures.grassTex);
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

        loadLakeMaskData () {
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
                this.maskReady = true; 
            };
        }

        isLake(x, z) {
            // Make sure we have lake mask data
            if (!this.lakeMaskData || !this.maskReady) {
                console.log("Lake mask data not ready yet");
                return false; // Default to "not a lake" if data isn't ready
            }

            // Convert from world space (-200 to 200) to normalized space (0 to 1)
            const worldSize = 400; // Total world size
            
            // Normalize coordinates
            let u = (x + worldSize/2) / worldSize;
            let v = (z + worldSize/2) / worldSize;
            
            // Clamp values to prevent out-of-bounds access
            u = Math.max(0, Math.min(0.999, u));
            v = Math.max(0, Math.min(0.999, v));
            
            // Convert to pixel coordinates in the mask texture
            const px = Math.floor(u * this.lakeMaskWidth);
            const py = Math.floor(v * this.lakeMaskHeight);
            
            // Get the pixel data (RGBA format, 4 bytes per pixel)
            const index = (py * this.lakeMaskWidth + px) * 4;
            
            // Ensure index is within bounds
            if (index < 0 || index >= this.lakeMaskData.length) {
                return false;
            }
            
            const red = this.lakeMaskData[index] / 255;
            
            // Lake area is black in the mask (red < 0.5)
            return red < 0.5;
        }

        isNearLake(x, z, radius = 3) {
            const steps = 8;
            for (let angle = 0; angle < 2 * Math.PI; angle += 2 * Math.PI / steps) {
                const checkX = x + Math.cos(angle) * radius;
                const checkZ = z + Math.sin(angle) * radius;
                if (this.isLake(checkX, checkZ)) return true;
            }
            return false;
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
