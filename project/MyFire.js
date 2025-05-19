import { CGFobject, CGFshader, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyTriangle } from './MyTriangle.js';

export class MyFire extends CGFobject {
    constructor(scene, rows = 3, cols = 3, areaWidth = 15, areaDepth = 15) {
        super(scene);
        this.scene = scene;
        this.triangles = [];

        // Create and configure flame material
        this.flameMaterial = new CGFappearance(this.scene);
        this.flameMaterial.setEmission(1.0, 0.6, 0.0, 1.0); // Flame-like glow
        this.flameMaterial.setTexture(new CGFtexture(this.scene, "textures/flame_texture.webp"));

        // Create shader
        this.flameShader = new CGFshader(
            this.scene.gl, 
            "shaders/flame.vert", 
            "shaders/flame.frag"
        );
        
        // Initialize shader uniforms
        this.flameShader.setUniformsValues({
            timeFactor: 0
        });

        this.initTriangles(rows, cols, areaWidth, areaDepth);
    }

    initTriangles(rows, cols, areaWidth, areaDepth) {
        const cellWidth = areaWidth / cols;
        const cellDepth = areaDepth / rows;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const baseX = -areaWidth / 2 + (j + 0.5) * cellWidth;
                const baseZ = -areaDepth / 2 + (i + 0.5) * cellDepth;

                const numFlames = 5 + Math.floor(Math.random() * 2); // 5-6 flames

                for (let k = 0; k < numFlames; k++) {
                        const width = 6 + Math.random() * 3.75;
                        const height = 11.25 + Math.random() * 7.5;
                        const rotationY = (Math.random() - 0.5) * Math.PI / 3;
                        
                        // Create unique movement pattern for each flame
                        const flameOffset = Math.random() * Math.PI * 2; // Phase offset
                        const xFrequency = 0.7 + Math.random() * 0.6; // Range: 0.7-1.3
                        const yFrequency = 0.5 + Math.random() * 0.4; // Range: 0.5-0.9
                        const zFrequency = 0.6 + Math.random() * 0.5; // Range: 0.6-1.1
                        const moveScale = 0.8 + Math.random() * 0.4; // Range: 0.8-1.2

                        const triangle = new MyTriangle(this.scene, width, height);

                        this.triangles.push({
                            triangle: triangle,
                            position: {
                                x: baseX + (Math.random() - 0.5) * cellWidth * 0.5,
                                z: baseZ + (Math.random() - 0.5) * cellDepth * 0.5
                            },
                            rotationY: rotationY,
                            flameOffset: flameOffset,
                            xFrequency: xFrequency,
                            yFrequency: yFrequency,
                            zFrequency: zFrequency,
                            moveScale: moveScale
                        });
                    }
            }
        }
    }
    
    // Update method for animation
    update(t) {
        // Store accumulated time as a class property
        if (!this.accumulatedTime) this.accumulatedTime = 0;
        this.accumulatedTime += t / 500; // Convert milliseconds to seconds
        
        this.flameShader.setUniformsValues({
            timeFactor: this.accumulatedTime
        });
    }

    display() {
        this.scene.pushMatrix();
        
        // Save current shader
        const currentShader = this.scene.activeShader;

        // Activate flame shader
        this.scene.setActiveShader(this.flameShader);

        for (const flame of this.triangles) {
            this.scene.pushMatrix();
            
            this.scene.translate(flame.position.x, 0, flame.position.z);
            this.scene.rotate(flame.rotationY, 0, 1, 0);
            
            // Set unique parameters for this flame
            this.flameShader.setUniformsValues({
                flameOffset: flame.flameOffset,
                xFrequency: flame.xFrequency,
                yFrequency: flame.yFrequency, 
                zFrequency: flame.zFrequency,
                moveScale: flame.moveScale
            });
            
            this.flameMaterial.apply();
            flame.triangle.display();
            
            this.scene.popMatrix();
        }
        
        // Restore original shader
        this.scene.setActiveShader(currentShader);
        
        this.scene.popMatrix();
    }
}