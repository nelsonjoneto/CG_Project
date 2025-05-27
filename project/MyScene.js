// filepath: /home/nelson/CG/cg-t07-g10/project/MyScene.js
import { CGFscene, CGFcamera, CGFaxis, CGFtexture} from "../lib/CGF.js";
import { MyPanorama } from './MyPanorama.js';
import { MyGround } from "./MyGround.js";
import { MyBuilding } from "./MyBuilding.js";
import { MyForest } from "./MyForest.js";
import { MyHelicopter } from "./MyHeli.js";
import { MyFire } from "./MyFire.js";
import { MyTriangle } from "./MyTriangle.js";
import { MyBucket } from "./MyBucket_2.js";

export class MyScene extends CGFscene {
  constructor() {
    super();
    this.speedFactor = 1;
    this.lastTime = 0;
    this.elapsedTime = 0;
    this.takeoffTriggered = false;
    this.landingTriggered = false;
    
    // Camera settings
    this.cameraMode = 'Default'; // Default to third-person mode
    this.thirdPersonDistance = 10;   // Distance behind helicopter
    this.thirdPersonHeight = 5;      // Height above helicopter
    
    // Store default camera settings for initialization
    this.defaultCameraPosition = vec3.fromValues(5, 5, 5);
    this.defaultCameraTarget = vec3.fromValues(0, 0, 0);
    
    // Add this flag to track camera mode changes
    this.needsCameraReset = true;
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
    this.bucket = new MyBucket(this);
    
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
    this.displayPlane = false;
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
    // Initialize with default camera
    this.camera = new CGFcamera(
      1,
      0.1,
      1000,
      this.defaultCameraPosition,
      this.defaultCameraTarget
    );
  }

  // Update third-person camera position to follow helicopter
  updateThirdPersonCamera() {
    // Only update if in third-person mode
    if (this.cameraMode !== 'ThirdPerson' || !this.helicopter) return;
    
    // Get helicopter position and orientation
    const heliPos = this.helicopter.getPosition();
    const heliOrientation = this.helicopter.orientation;
    
    // Calculate camera position behind helicopter
    const dx = Math.sin(heliOrientation) * this.thirdPersonDistance;
    const dz = -Math.cos(heliOrientation) * this.thirdPersonDistance;
    
    // Set camera position and target
    this.camera.position = vec3.fromValues(
      heliPos.z + dz,                       // Camera X (scene Z)
      heliPos.y + this.thirdPersonHeight,   // Camera Y (height above helicopter)
      heliPos.x + dx                        // Camera Z (scene X)
    );
    
    this.camera.target = vec3.fromValues(
      heliPos.z,       // Target X (scene Z)
      heliPos.y + 1,   // Target Y (slightly above helicopter)
      heliPos.x        // Target Z (scene X)
    );
  }

  // Completely replace your updateCameraMode method
  updateCameraMode() {
    if (this.cameraMode === 'Default' && this.needsCameraReset) {
      // Reset camera ONLY when switching modes
      this.camera.position = vec3.clone(this.defaultCameraPosition);
      this.camera.target = vec3.clone(this.defaultCameraTarget);
      this.needsCameraReset = false;
    }
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
    
    // Update camera toggle on 'C' key press
    if (this.gui.isKeyPressed("KeyC") && !this.keyPressed) {
      // Toggle between camera modes
      const previousMode = this.cameraMode;
      this.cameraMode = (this.cameraMode === 'Default') ? 'ThirdPerson' : 'Default';
      
      // Set flag to reset camera if mode changed
      if (previousMode !== this.cameraMode) {
        this.needsCameraReset = true;
      }
      
      this.keyPressed = true;
    }
    
    // Track key state to prevent multiple toggles per press
    if (!this.gui.isKeyPressed("KeyC")) {
      this.keyPressed = false;
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
    
    // Check camera mode before updating
    if (this.cameraMode === 'ThirdPerson') {
      this.updateThirdPersonCamera();
    } else {
      this.updateCameraMode();
    }
    
    // Process keyboard input
    this.checkKeys(delta_t);
    
    // Update elapsed time
    this.elapsedTime += delta_t;
  }

  setDefaultAppearance() {
    this.setAmbient(0.5, 0.5, 0.5, 1.0);
    this.setDiffuse(0.5, 0.5, 0.5, 1.0);
    this.setSpecular(0.5, 0.5, 0.5, 1.0);
    this.setEmission(0, 0, 0, 1);
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
    this.helicopter.display();
    // Display bucket only if it's initialized
    if (this.bucket) this.bucket.display();
  }
}