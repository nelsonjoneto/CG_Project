// filepath: /home/nelson/CG/cg-t07-g10/project/MyScene.js
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
    this.elapsedTime = 0;
    this.takeoffTriggered = false;
    this.landingTriggered = false;
    
    // Camera settings
    this.cameraMode = 'ThirdPerson'; // Default to third-person mode
    this.thirdPersonDistance = 10;   // Distance behind helicopter
    this.thirdPersonHeight = 5;      // Height above helicopter
    
    // Store default camera settings for initialization
    this.defaultCameraPosition = vec3.fromValues(50, 50, 50);
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
    this.ground = new MyGround(this, {
        grass: this.textures.grass,
        water: this.textures.water,
        mask: this.textures.mask
      });
    this.panorama = new MyPanorama(this, this.textures.panorama);

    // First create the building
    this.module = new MyBuilding(this, 15, 2, 2, 
      [this.textures.window, this.textures.window, this.textures.window],
      [0.7, 0.7, 0.7, 1.0], 
      {
        door: this.textures.door, 
        helipad: this.textures.helipad, 
        up: this.textures.up, 
        down: this.textures.down,
        wall: this.textures.wall,
        roof: this.textures.roof
      }
    );

    // Then create the helicopter with the building's helipad position
    const helipadPos = this.module.getHelipadPosition();
    this.helicopter = new MyHelicopter(this, helipadPos, {heliBody: this.textures.heliBody, heliGlass: this.textures.heliGlass, water: this.textures.water });  
    
    
    this.triangle = new MyTriangle(this, 20, 20);

    // Display flags
    this.displayAxis = false;
    this.displayPanorama = true;
    this.displayPlane = true;
    this.displayForest = true;
    this.displayBuilding = true;
  }

  initTextures() {
  this.textures = {
    // Panorama & genéricos - DONE
    panorama: new CGFtexture(this, "textures/panorama.jpg"),
    window: new CGFtexture(this, "textures/window.jpg"),

    // Helicóptero - DONE
    heliBody: new CGFtexture(this, "textures/heli_with_doors.png"),
    heliGlass: new CGFtexture(this, "textures/cockpit_glass.jpg"),

    // Fogo - DONE
    flame: new CGFtexture(this, "textures/flame_texture.webp"),

    // Ground - DONE
    grass: new CGFtexture(this, "textures/grass_tex.png"),
    water: new CGFtexture(this, "textures/waterTex.jpg"),
    mask: new CGFtexture(this, "textures/mask.png"),

    // Edifício / Heliporto - DONE
    door: new CGFtexture(this, "textures/door.png"),
    helipad: new CGFtexture(this, "textures/H.png"),
    up: new CGFtexture(this, "textures/UP.png"),
    down: new CGFtexture(this, "textures/DOWN.png"),

    // Árvores - DONE
    trunk: new CGFtexture(this, "textures/trunk2.jpg"),
    trunkAlt: new CGFtexture(this, "textures/trunk3.jpg"),
    leaves: new CGFtexture(this, "textures/leaves.png"),
    pine: new CGFtexture(this, "textures/pinetree.png"),

    // ShaderScene
    waterMap: new CGFtexture(this, "textures/waterMap.jpg"),

    // Building textures
    wall: new CGFtexture(this, "textures/building_wall.jpg"),
    roof: new CGFtexture(this, "textures/roof.webp")
  };
}


  initLights() {
    // Luz 0
    this.lights[0].setPosition(200, 300, 200, 1);    // Sol (principal)
    this.lights[0].setAmbient(0.1, 0.1, 0.1, 1.0);   // Ambiente
    this.lights[0].setDiffuse(0.4, 0.4, 0.4, 1.0);   // Difusa (reduzida)
    this.lights[0].setSpecular(0.1, 0.1, 0.1, 1.0);  // Especular (reduzida)
    this.lights[0].enable();
    this.lights[0].update();

    // Luz 1
    this.lights[1].setPosition(-200, 100, -200, 1);
    this.lights[1].setAmbient(0.1, 0.1, 0.1, 1.0);
    this.lights[1].setDiffuse(0.4, 0.4, 0.4, 1.0);
    this.lights[1].setSpecular(0.1, 0.1, 0.1, 1.0);
    this.lights[1].enable();
    this.lights[1].update();

    // Luz 2
    this.lights[2].setPosition(0, 250, -200, 1);
    this.lights[2].setAmbient(0.1, 0.1, 0.1, 1.0);
    this.lights[2].setDiffuse(0.4, 0.4, 0.4, 1.0);
    this.lights[2].setSpecular(0.1, 0.1, 0.1, 1.0);
    this.lights[2].enable();
    this.lights[2].update();
  }
  isBuildingArea(x, z) {
    // O edifício está centrado em (0, 0)
    const totalWidth = 15 + 2 * (15 * 0.75); // main + 2 laterais = 15 + 11.25 * 2 = 37.5
    const totalDepth = 15 * 0.75;            // Usado como profundidade base

    const margin = 15; // margem extra para garantir espaço livre

    const halfWidth = totalWidth / 2 + margin;
    const halfDepth = totalDepth / 2 + margin;

    return (
        x >= -halfWidth && x <= halfWidth &&
        z >= -halfDepth && z <= halfDepth
    );
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
      
      // Special controls with enhanced water logic
      if (this.gui.isKeyPressed("KeyR"))
          this.helicopter.resetPosition();
      
      // Handle P key (ascent)
      if (this.gui.isKeyPressed("KeyP")) {
          // Case 1: On helipad - take off
          if (this.helicopter.isLanded) {
              this.helicopter.startAscent();
          } 
          // Case 2: At water level with filled bucket - ascend
          else if (this.helicopter.state === 'descending_to_water' && this.helicopter.hasWater) {
              this.helicopter.startAscent();
          }
      }
    
      // Handle L key (descent)
      if (this.gui.isKeyPressed("KeyL") && !this.helicopter.isLanded) {
          // Try to descend - the helicopter will decide if it should go to water or helipad
          this.helicopter.startDescent();
      }
      
      // Add water drop control - "O" key
      if (this.gui.isKeyPressed("KeyO") && !this.waterKeyPressed) {
          this.helicopter.dropWater();
          this.waterKeyPressed = true;
      }
      
      // Reset water key flag when released
      if (!this.gui.isKeyPressed("KeyO")) {
          this.waterKeyPressed = false;
      }
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
    
    // Update helicopter
    if (this.helicopter) {
        this.helicopter.update(delta_t);
    }
    
    // Update building with current time and helicopter state
    if (this.module && this.helicopter) {
        this.module.update(t, this.helicopter.state);
    }
    
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

    if (!this.forest && this.ground.maskReady) {
    this.forest = new MyForest(this, 23, 23, 200, 200,
        this.textures.trunk,
        this.textures.trunkAlt,
        this.textures.leaves,
        this.textures.pine,
        this.ground);

    const treePositions = this.forest.trees.map(entry => ({ x: entry.x, z: entry.z }));
    this.fire = new MyFire(this, treePositions, 100, this.textures.flame); // 10 focos de fogo, por exemplo

  }
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

    //this.setGlobalAmbientLight(0.5,0.5,0.5,1);

    if (this.displayPanorama) this.panorama.display();
    if (this.displayPlane) this.ground.display();
    if (this.displayAxis) this.axis.display();
    //if (this.displayForest && this.forest) { this.forest.display(); }
    if (this.fire) this.fire.display();
    this.module.display();
    this.helicopter.display();
  }
}