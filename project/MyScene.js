import { CGFscene, CGFcamera, CGFaxis, CGFtexture} from "../lib/CGF.js";
import { MyPanorama } from './MyPanorama.js';
import { MyGround } from "./MyGround.js";
import { MyBuilding } from "./MyBuilding.js";
import { MyForest } from "./MyForest.js";
import { MyHelicopter } from "./MyHeli.js";
import { MyFire } from "./MyFire.js";
import { MyTriangle } from "./MyTriangle.js";

export class MyScene extends CGFscene {
  constructor() {
    super();
    this.speedFactor = 1;
    this.lastTime = 0;
    this.elapsedTime = 0; // Track elapsed time
    this.takeoffTriggered = false; // Flag to track if takeoff was triggered
    this.landingTriggered = false; // Flag to track if landing was triggered
  }

  init(application) {
    super.init(application);
    this.initCameras();
    this.initLights();

    this.gl.clearColor(0, 0, 0, 1.0);
    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.BLEND);

    this.enableTextures(true);
    this.initTextures();
    this.setUpdatePeriod(50);

    // Initialize scene objects
    this.axis = new CGFaxis(this, 20, 1);
    this.ground = new MyGround(this);
    this.panorama = new MyPanorama(this, this.panoramaTexture);
    // First create the building
    this.module = new MyBuilding(this, 15, 2, 2, 
      [this.windowTexture, this.windowTexture, this.windowTexture],
      [0.8, 0.8, 0.8, 1.0]);
      
    // Then create the helicopter with the building's helipad position
    const helipadPos = this.module.getHelipadPosition();
    this.helicopter = new MyHelicopter(this, helipadPos);  

    this.fire = new MyFire(this, 3, 3, 60, 60);

    this.triangle = new MyTriangle(this, 20, 20);

    // Display flags
    this.displayAxis = false;
    this.displayPanorama = true;
    this.displayPlane = true;
    this.displayForest = true;
    this.displayBuilding = true;
  }

  initTextures() {
    this.panoramaTexture = new CGFtexture(this, "textures/panorama.jpg");
    this.windowTexture = new CGFtexture(this, "textures/window.jpg");
  }

  initLights() {
    this.lights[0].setPosition(200, 200, 200, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].enable();
    this.lights[0].update();
  }

  initCameras() {
    this.camera = new CGFcamera(
      1,
      0.1,
      1000,
      vec3.fromValues(100, 100, 100),
      vec3.fromValues(0, 0, 0)
    );
  }

    checkKeys(delta_t) {
        if (this.helicopter) {
            // Scale controls by delta_t and speedFactor for smooth, consistent movement
            const accelFactor = 0.001 * this.speedFactor;
            const turnFactor = 0.002 * this.speedFactor;
            
            // Track forward/backward key state
            let forwardKeyPressed = false;
            let turnKeyPressed = false;
            
            // Forward/backward movement
            if (this.gui.isKeyPressed("KeyW")) {
                this.helicopter.accelerate(accelFactor * delta_t);
                forwardKeyPressed = true;
            } else if (this.gui.isKeyPressed("KeyS")) {
                this.helicopter.accelerate(-accelFactor * delta_t);
                forwardKeyPressed = true;
            } else {
                // No forward/backward keys pressed, notify helicopter
                this.helicopter.setForwardAccelerating(false);
            }
            
            // Turning movement
            if (this.gui.isKeyPressed("KeyA")) {
                this.helicopter.turn(-turnFactor * delta_t);
                turnKeyPressed = true;
            } else if (this.gui.isKeyPressed("KeyD")) {
                this.helicopter.turn(turnFactor * delta_t);
                turnKeyPressed = true;
            } else {
                // No turning keys pressed, notify helicopter
                this.helicopter.setTurning(false);
            }
            
            // Special controls remain the same
            if (this.gui.isKeyPressed("KeyR"))
                this.helicopter.resetPosition();
            if (this.gui.isKeyPressed("KeyP") && this.helicopter.isLanded)
                this.helicopter.startAscent();
            if (this.gui.isKeyPressed("KeyL") && !this.helicopter.isLanded)
                this.helicopter.startDescent();
        }
    }

    update(t) {
        if (!this.lastTime) {
            this.lastTime = t;
            this.accumulatedTime = 0;
            this.elapsedTime = 0;
        }
        
        const delta_t = t - this.lastTime;
        this.lastTime = t;
        
        // Update timeFactor for shaders
        this.accumulatedTime += delta_t;
        
        // Update ground shader
        if (this.ground) {
            this.ground.groundShader.setUniformsValues({
                timeFactor: this.accumulatedTime / 100 % 100
            });
        }
        
        // Update other elements
        if (this.fire) this.fire.update(delta_t);
        if (this.helicopter) this.helicopter.update(delta_t);
        
        // Process keyboard input
        this.checkKeys(delta_t);
        
        // Update elapsed time
        this.elapsedTime += delta_t;
    }

  setDefaultAppearance() {
    this.setAmbient(0.5, 0.5, 0.5, 1.0);
    this.setDiffuse(0.5, 0.5, 0.5, 1.0);
    this.setSpecular(0.5, 0.5, 0.5, 1.0);
    this.setEmission(0,0,0,1)
    this.setShininess(10.0);
  }

  display() {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.updateProjectionMatrix();
    this.loadIdentity();
    this.applyViewMatrix();

    if (this.displayPanorama) this.panorama.display();
    if (this.displayPlane) this.ground.display();
    if (this.displayAxis) this.axis.display();
    if (this.displayForest) {} 
    //this.module.display();
    //this.forest.display();
    //this.fire.display();
    this.helicopter.display();
    this.module.display();
    
  }
}