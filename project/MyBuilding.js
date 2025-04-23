// MyBuilding.js
import { CGFobject } from '../lib/CGF.js';
import { MyModule } from './MyModule.js';
import { MyMainModule } from './MyMainModule.js';

export class MyBuilding extends CGFobject {
    constructor(scene, width, numFloors, windowsPerFloor, windowTextures, color) {
        super(scene);
        this.scene = scene;
        
        // Calculate module dimensions
        this.mainWidth = width;
        this.lateralWidth = width * 0.75;
        this.moduleSpacing = (this.mainWidth + this.lateralWidth) / 2;

        const windowSize = Math.min(((this.lateralWidth * 0.8) / windowsPerFloor) * 0.8, (this.lateralWidth / (numFloors)) * 0.6);

        
        // Create modules
        this.modules = [
            // Left module
            new MyModule(
                scene,
                this.lateralWidth,
                numFloors,
                windowsPerFloor,
                windowSize,
                color,
                windowTextures[0], // Left texture
                1
            ),
            
            // Main central module
            new MyMainModule(
                scene,
                this.mainWidth,
                numFloors + 1, // +1 floor for main module
                windowsPerFloor,
                windowSize,
                color,
                windowTextures[1] // Middle texture
            ),
            
            // Right module
            new MyModule(
                scene,
                this.lateralWidth,
                numFloors,
                windowsPerFloor,
                windowSize,
                color,
                windowTextures[2], // Right texture
                0
            )
        ];
    }

    display() {
        // Display left module
        this.scene.pushMatrix();
        this.scene.translate(-this.moduleSpacing, 0, 0);
        this.modules[0].display();
        this.scene.popMatrix();

        // Display main module
        this.scene.pushMatrix();
        this.modules[1].display();
        this.scene.popMatrix();

        // Display right module
        this.scene.pushMatrix();
        this.scene.translate(this.moduleSpacing, 0, 0);
        this.modules[2].display();
        this.scene.popMatrix();
    }
}