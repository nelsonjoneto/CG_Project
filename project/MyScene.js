import { CGFscene, CGFcamera, CGFaxis, CGFtexture } from "../lib/CGF.js";
import { MyPanorama } from './MyPanorama.js';
import { MyGround } from "./MyGround.js";
import { MyBuilding } from "./MyBuilding.js";
import { MyForest } from "./MyForest.js";
import { MyHelicopter } from "./MyHeli.js";
import { MyFire } from "./MyFire.js";

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
    
    // Building configuration properties
    this.buildingFloors = 2;
    this.buildingWindows = 2;
    this.buildingWidth = 15;
    
    // Helicopter speed factor
    this.speedFactor = 1;
    
    // Camera settings
    this.activeCamera = 'default'; // Current active camera: 'default' or 'helicopter'
    this.defaultCamera = null;    // Will hold the default camera
    this.helicopterCamera = null; // Will hold the helicopter-focused camera
    
    // Helicopter camera settings
    this.heliCamDistance = 15;  // Distance from helicopter
    this.heliCamHeight = 8;     // Height above helicopter
    this.heliCamAngle = -Math.PI/2;      // Angle around helicopter (radians)
    
    // Time tracking
    this.lastTime = 0;
    this.elapsedTime = 0;
    
    // Display flags
    this.displayAxis = false;
    this.displayPanorama = true;
    this.displayPlane = true;
    this.displayForest = true;
    this.displayBuilding = true;
    this.displayHelicopter = true;
    this.displayFire = true;

    // Add timing for shader animation
    this.accumulatedTime = 0;

    // Define world boundaries for helicopter movement
    this.worldBounds = {
      minX: -100,
      maxX: 100,
      minZ: -100,
      maxZ: 100
    };

    // Add camera zoom constraints
    this.minCameraDistance = 25; 
    this.maxCameraDistance = 60;  
  }

  init(application) {
    super.init(application);

    this.initCameras();
    this.initLights();

    // Set up the WebGL context
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
    
    // Updated ground initialization with required textures
    this.ground = new MyGround(this, {
      grass: this.textures.grass,
      water: this.textures.water,
      mask: this.textures.mask
    });
    
    this.panorama = new MyPanorama(this, this.textures.panorama);
    
    // Create the building with signaling textures
    this.building = new MyBuilding(this, this.buildingWidth, this.buildingFloors, this.buildingWindows, 
      [this.textures.window, this.textures.window, this.textures.window],
      [0.7, 0.7, 0.7, 1.0], 
      {
        door: this.textures.door, 
        helipad: this.textures.helipad,
        up: this.textures.up,      // Add these two textures
        down: this.textures.down,  // for heliport signaling
        wall: this.textures.wall,
        roof: this.textures.roof,
        sign: this.textures.sign
      }
    );

    // Get helipad position from building and create helicopter
    const helipadPosition = this.building.getHelipadPosition();
    this.helicopter = new MyHelicopter(this, helipadPosition, 
      {
        heliBody: this.textures.heliBody,
        heliGlass: this.textures.heliGlass
      }
    );

    // Create forest - move after ground is ready
    this.forest = null; // Will be created in update once mask is ready
  }

  initTextures() {
    this.textures = {
      // Panorama & ground
      panorama: new CGFtexture(this, "textures/panorama.jpg"),
      grass: new CGFtexture(this, "textures/grass.png"),
      
      // New ground textures for shader-based ground
      water: new CGFtexture(this, "textures/waterTex.jpg"),
      mask: new CGFtexture(this, "textures/mask.png"),
      
      // Helicopter
      heliBody: new CGFtexture(this, "textures/heli_with_doors.png"),
      heliGlass: new CGFtexture(this, "textures/cockpit_glass.jpg"),
      
      // Building
      window: new CGFtexture(this, "textures/window.jpg"),
      door: new CGFtexture(this, "textures/door.png"),
      helipad: new CGFtexture(this, "textures/heliport.png"),
      wall: new CGFtexture(this, "textures/building_wall.jpg"),
      roof: new CGFtexture(this, "textures/roof.webp"),
      sign: new CGFtexture(this, "textures/bombeiros.png"),
      
      // Forest 
      trunk: new CGFtexture(this, "textures/trunk1.jpg"),
      trunkAlt: new CGFtexture(this, "textures/trunk.jpg"),
      leaves: new CGFtexture(this, "textures/crown.png"),
      pine: new CGFtexture(this, "textures/crown1.png"),

      // Fire texture
      flame: new CGFtexture(this, "textures/flame_texture.webp"),

      // Add UP and DOWN textures for heliport signaling
      up: new CGFtexture(this, "textures/up.png"),
      down: new CGFtexture(this, "textures/down.png")
    };
  }

  initLights() {
    // Main light
    this.lights[0].setPosition(0, 100, -100, 1);
    this.lights[0].setAmbient(0.1, 0.1, 0.1, 1.0);
    this.lights[0].setDiffuse(0.4, 0.4, 0.4, 1.0);
    this.lights[0].setSpecular(0.1, 0.1, 0.1, 1.0);
    this.lights[0].enable();
    this.lights[0].update();
    
    

    this.lights[2].setPosition(100, 200, 100, 1);
    this.lights[2].setAmbient(0.1, 0.1, 0.1, 1.0);
    this.lights[2].setDiffuse(0.4, 0.4, 0.4, 1.0);
    this.lights[2].setSpecular(0.1, 0.1, 0.1, 1.0);
    this.lights[2].enable();
    this.lights[2].update();

    this.lights[3].setPosition(-200, 200, -200, 1);
    this.lights[3].setAmbient(0.1, 0.1, 0.1, 1.0);
    this.lights[3].setDiffuse(0.4, 0.4, 0.4, 1.0);
    this.lights[3].setSpecular(0.1, 0.1, 0.1, 1.0);
    this.lights[3].enable();
    this.lights[3].update();
  }
  
  initCameras() {
    // Create default camera (static, overview position)
    this.defaultCamera = new CGFcamera(
      1,
      0.1,
      1000,
      vec3.fromValues(50, 50, 50),
      vec3.fromValues(0, 15, 0)
    );
    
    // Create helicopter camera (will be updated to follow helicopter)
    this.helicopterCamera = new CGFcamera(
      1.1,  // Slightly wider angle for better view
      0.1,
      1000,
      vec3.fromValues(15, 10, 15),  // Initial position
      vec3.fromValues(0, 0, 0)      // Initial target
    );
    
    // Set active camera as the default
    this.camera = this.defaultCamera;
  }

  updateHelicopterCamera() {
    if (!this.helicopter) return;
    
    const heliPos = this.helicopter.getPosition();
    const heliOrientation = this.helicopter.orientation;
    
    // Calculate camera position based on helicopter position, orientation and set distance
    const camX = heliPos.z + Math.sin(heliOrientation + this.heliCamAngle) * this.heliCamDistance;
    const camY = heliPos.y + this.heliCamHeight;
    const camZ = heliPos.x + Math.cos(heliOrientation + this.heliCamAngle) * this.heliCamDistance;
    
    // Update helicopter camera position and target
    this.helicopterCamera.position = vec3.fromValues(camX, camY, camZ);
    this.helicopterCamera.target = vec3.fromValues(heliPos.z, heliPos.y, heliPos.x);
  }

  toggleCamera() {
    if (this.activeCamera === 'default') {
      this.activeCamera = 'helicopter';
      this.camera = this.helicopterCamera;
    } else {
      this.activeCamera = 'default';
      this.camera = this.defaultCamera;
    }
  }

  isBuildingArea(x, z) {
    // Building is centered at (0, 0)
    const totalWidth = this.buildingWidth + 2 * (this.buildingWidth * 0.75);
    const totalDepth = this.buildingWidth * 0.75;
    
    const margin = 15; // Extra margin for free space
    
    const halfWidth = totalWidth / 2 + margin;
    const halfDepth = totalDepth / 2 + margin;
    
    return (
      x >= -halfWidth && x <= halfWidth &&
      z >= -halfDepth && z <= halfDepth
    );
  }

  // Add this method to check if a position is within the allowed boundaries
  isPositionValid(position) {
    return (
      position.x >= this.worldBounds.minX && 
      position.x <= this.worldBounds.maxX &&
      position.z >= this.worldBounds.minZ && 
      position.z <= this.worldBounds.maxZ
    );
  }

  checkKeys(delta_t) {
    if (this.helicopter) {
      // Scale controls by delta_t and speedFactor for smooth movement
      const accelFactor = 0.001 * this.speedFactor;
      const turnFactor = 0.002 * this.speedFactor;
      
      // Forward/backward movement
      if (this.gui.isKeyPressed("KeyW")) {
        this.helicopter.accelerate(accelFactor * delta_t);
      } else if (this.gui.isKeyPressed("KeyS")) {
        this.helicopter.accelerate(-accelFactor * delta_t);
      } else {
        this.helicopter.setForwardAccelerating(false);
      }
      
      // Turning movement
      if (this.gui.isKeyPressed("KeyA")) {
        this.helicopter.turn(-turnFactor * delta_t);
      } else if (this.gui.isKeyPressed("KeyD")) {
        this.helicopter.turn(turnFactor * delta_t);
      } else {
        this.helicopter.setTurning(false);
      }
      
      // Special controls
      if (this.gui.isKeyPressed("KeyR"))
        this.helicopter.resetPosition();
      
      // Handle P key (ascent/takeoff)
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
      
      // Handle L key (descent/landing)
      if (this.gui.isKeyPressed("KeyL") && !this.helicopter.isLanded) {
        // Try to descend - the helicopter will decide if it should go to water or helipad
        this.helicopter.startDescent();
      }
      
      // Change to O key for water drop (as per assignment)
      if (this.gui.isKeyPressed("KeyO") && !this.waterKeyPressed) {
        this.helicopter.dropWater();
        this.waterKeyPressed = true;
      }
      
      // Reset water key flag when released
      if (!this.gui.isKeyPressed("KeyO")) {
        this.waterKeyPressed = false;
      }
    }
    
    // Add camera toggle with 'C' key
    if (this.gui.isKeyPressed("KeyC") && !this.keyPressedC) {
      this.toggleCamera();
      this.keyPressedC = true;
    }
    
    if (!this.gui.isKeyPressed("KeyC")) {
      this.keyPressedC = false;
    }
  }

  update(t) {
    // Initialize time tracking
    if (!this.lastTime) {
      this.lastTime = t;
      this.elapsedTime = 0;
      this.accumulatedTime = 0;
    }
    
    // Calculate delta time
    const delta_t = t - this.lastTime;
    this.lastTime = t;
    this.elapsedTime += delta_t;
    
    // Accumulate time for shaders
    this.accumulatedTime += delta_t;
    
    // Update ground shader
    if (this.ground) {
        this.ground.groundShader.setUniformsValues({
            timeFactor: this.accumulatedTime / 100 % 100
        });
    }
    
    // Make sure mask is ready before creating forest
    if (!this.forest && this.ground && this.ground.maskReady) {
        console.log("Creating forest - mask is ready");
        this.forest = new MyForest(this, 17, 17, 200, 200,
            this.textures.trunk,
            this.textures.trunkAlt,
            this.textures.leaves,
            this.textures.pine,
            this.ground
        );
    }
    
    // Only create fire if forest exists
    if (this.forest && !this.fire && this.ground.maskReady) {
      const treePositions = this.forest.trees.map(entry => ({ x: entry.x, z: entry.z }));
      this.fire = new MyFire(this, treePositions, 50, this.textures.flame);
    }
    
    // Update fire if it exists
    if (this.fire) {
      this.fire.update(delta_t);
    }
    
    // Update helicopter
    if (this.helicopter) {
      this.helicopter.update(delta_t);
      this.updateHelicopterCamera();
    }
    
    // Update building with helicopter state
    if (this.building && this.helicopter) {
      this.building.update(t, this.helicopter.state);
    }
    
    // Process keyboard input
    this.checkKeys(delta_t);

    // Check and enforce camera distance limits
    this.enforceCameraLimits();
  }

  enforceCameraLimits() {
  // Only apply to default camera, not helicopter camera
  if (this.activeCamera !== 'default') return;
  
  // Calculate current camera-to-target distance
  const pos = this.defaultCamera.position;
  const target = this.defaultCamera.target;
  
  const dx = pos[0] - target[0];
  const dy = pos[1] - target[1];
  const dz = pos[2] - target[2];
  
  const currentDistance = Math.sqrt(dx*dx + dy*dy + dz*dz);
  
  // Store old distance for comparison
  const previousDistance = currentDistance;
  let positionChanged = false;
  
  // If distance exceeds limits, adjust camera position
  if (currentDistance > this.maxCameraDistance) {
    // Scale down the position vector to max allowed distance
    const scale = this.maxCameraDistance / currentDistance;
    
    // Calculate new position that maintains direction but limits distance
    this.defaultCamera.position = [
      target[0] + dx * scale,
      target[1] + dy * scale,
      target[2] + dz * scale
    ];
    
    positionChanged = true;
  }
  
  // Enforce minimum distance
  else if (currentDistance < this.minCameraDistance) {
    const scale = this.minCameraDistance / currentDistance;
    
    this.defaultCamera.position = [
      target[0] + dx * scale,
      target[1] + dy * scale,
      target[2] + dz * scale
    ];
    
    positionChanged = true;
  }
  
  // NEW: Enforce minimum Y position (prevent camera from going below ground)
  if (this.defaultCamera.position[1] < 0) {
    // Adjust Y position to ground level (0)
    this.defaultCamera.position[1] = 2;
    positionChanged = true;
  }
  
  // NEW: If position was changed, update the camera's internal state
  if (positionChanged) {
    // This is the key fix - force the camera to update its internal matrices
    this.defaultCamera.orbit(0, 0); // Apply a zero orbit to trigger internal updates
  }
}

  
  updateBuilding() {
    if (this.building) {
      // Store helicopter landing state before recreating building
      const helicopterWasLanded = this.helicopter && this.helicopter.isLanded;
      
      // Create new building with updated parameters
      this.building = new MyBuilding(this, this.buildingWidth, this.buildingFloors, this.buildingWindows, 
        [this.textures.window, this.textures.window, this.textures.window],
        [0.7, 0.7, 0.7, 1.0], 
        {
          door: this.textures.door, 
          helipad: this.textures.helipad,
          up: this.textures.up,      // Add these two textures
          down: this.textures.down,  // for heliport signaling
          wall: this.textures.wall,
          roof: this.textures.roof,
          sign: this.textures.sign
        }
      );
      
      // If helicopter exists and was landed, update its position
      if (helicopterWasLanded && this.helicopter) {
        const newHelipadPos = this.building.getHelipadPosition();
        this.helicopter.resetPosition();
      }
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
    // Clear buffers and set up view
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.updateProjectionMatrix();
    this.loadIdentity();
    this.applyViewMatrix();
    
    if (this.displayPanorama && this.panorama) this.panorama.display();
    if (this.displayPlane && this.ground) this.ground.display();
    if (this.displayAxis && this.axis) this.axis.display();
    if (this.displayBuilding && this.building) this.building.display();
    if (this.displayForest && this.forest) this.forest.display();
    if (this.displayFire && this.fire) this.fire.display();
    if (this.displayHelicopter && this.helicopter) this.helicopter.display();
  }

}
