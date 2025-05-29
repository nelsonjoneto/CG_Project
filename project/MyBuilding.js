import { CGFobject } from '../lib/CGF.js';
import { MyModule } from './MyModule.js';
import { MyMainModule } from './MyMainModule.js';

export class MyBuilding extends CGFobject {
    constructor(scene, width, numFloors, windowsPerFloor, windowTextures, color, textures = {}) {
        super(scene);
        this.scene = scene;
        
        // Calculate module dimensions
        this.mainWidth = width;
        this.lateralWidth = width * 0.75;
        this.moduleSpacing = (this.mainWidth + this.lateralWidth) / 2;

        const windowSize = Math.min(((this.lateralWidth * 0.8) / windowsPerFloor) * 0.8, (this.lateralWidth / (numFloors)) * 0.6);

        // Create modules with textures
        this.modules = [
            // Left module
            new MyModule(
                scene,
                this.lateralWidth,
                numFloors,
                windowsPerFloor,
                windowSize,
                color,
                windowTextures[0],
                1,              // building number
                textures.wall,  // wall texture
                textures.roof   // roof texture
            ),
            // Main module
            new MyMainModule(
                scene,
                this.mainWidth,
                numFloors + 1,
                windowsPerFloor,
                windowSize,
                color,
                {
                    window: windowTextures[1],
                    door: textures.door,        // Use textures from parameter, not scene.textures
                    helipad: textures.helipad,  // Use textures from parameter, not scene.textures
                    wall: textures.wall,
                    roof: textures.roof
                }
            ),
            // Right module
            new MyModule(
                scene,
                this.lateralWidth,
                numFloors,
                windowsPerFloor,
                windowSize,
                color,
                windowTextures[2],
                2,              // building number
                textures.wall,  // wall texture
                textures.roof   // roof texture
            )
        ];
    }
    
    getHelipadPosition() {
        return this.modules[1].getHelipadPosition();
    }

    display() {
        this.scene.pushMatrix();
        
        // Left module
        this.scene.pushMatrix();
        this.scene.translate(-this.moduleSpacing, 0, 0);
        this.modules[0].display();
        this.scene.popMatrix();
        
        // Main center module
        this.modules[1].display();
        
        // Right module
        this.scene.pushMatrix();
        this.scene.translate(this.moduleSpacing, 0, 0);
        this.modules[2].display();
        this.scene.popMatrix();
        
        this.scene.popMatrix();
    }
}