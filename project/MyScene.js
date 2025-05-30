import { CGFscene, CGFcamera, CGFaxis, CGFtexture} from "../lib/CGF.js";
import { MyPanorama } from './MyPanorama.js';
import { MyGround } from "./MyGround.js";
import { MyBuilding } from "./MyBuilding.js";
import { MyForest } from "./MyForest.js";
import { MyHelicopter } from "./MyHeli.js";

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
    this.ground = new MyGround(this, this.textures.grass);
    this.panorama = new MyPanorama(this, this.textures.panorama);
    
    // Create the building
    this.building = new MyBuilding(this, this.buildingWidth, this.buildingFloors, this.buildingWindows, 
      [this.textures.window, this.textures.window, this.textures.window],
      [0.7, 0.7, 0.7, 1.0], 
      {
        door: this.textures.door, 
        helipad: this.textures.helipad,
        wall: this.textures.wall,
        roof: this.textures.roof
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

    // Create forest once ground is ready
    this.forest = new MyForest(this, 18, 18, 200, 200,
      this.textures.trunk,
      this.textures.trunkAlt,
      this.textures.leaves,
      this.textures.pine
    );
  }

  initTextures() {
    this.textures = {
      // Panorama & ground
      panorama: new CGFtexture(this, "textures/panorama.jpg"),
      grass: new CGFtexture(this, "textures/grass.png"),
      
      // Helicopter
      heliBody: new CGFtexture(this, "textures/heli_with_doors.png"),
      heliGlass: new CGFtexture(this, "textures/cockpit_glass.jpg"),
      
      // Building
      window: new CGFtexture(this, "textures/window.jpg"),
      door: new CGFtexture(this, "textures/door.png"),
      helipad: new CGFtexture(this, "textures/heliport.png"),
      wall: new CGFtexture(this, "textures/building_wall.jpg"),
      roof: new CGFtexture(this, "textures/roof.webp"),
      
      // Forest 
      trunk: new CGFtexture(this, "textures/trunk1.jpg"),
      trunkAlt: new CGFtexture(this, "textures/trunk.jpg"),
      leaves: new CGFtexture(this, "textures/crown.png"),
      pine: new CGFtexture(this, "textures/crown1.png")
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
    
    // Additional lights
    this.lights[1].setPosition(0, 200, 0, 1);
    this.lights[1].setAmbient(0.1, 0.1, 0.1, 1.0);
    this.lights[1].setDiffuse(0.4, 0.4, 0.4, 1.0);
    this.lights[1].setSpecular(0.1, 0.1, 0.1, 1.0);
    this.lights[1].enable();
    this.lights[1].update();

    this.lights[2].setPosition(100, 200, 100, 1);
    this.lights[2].setAmbient(0.1, 0.1, 0.1, 1.0);
    this.lights[2].setDiffuse(0.4, 0.4, 0.4, 1.0);
    this.lights[2].setSpecular(0.1, 0.1, 0.1, 1.0);
    this.lights[2].enable();
    this.lights[2].update();
  }
  
  initCameras() {
    // Create default camera (static, overview position)
    this.defaultCamera = new CGFcamera(
      1,
      0.1,
      1000,
      vec3.fromValues(50, 50, 50),
      vec3.fromValues(0, 0, 0)
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
      if (this.gui.isKeyPressed("KeyP") && this.helicopter.isLanded) {
        this.helicopter.startAscent();
      }
      
      // Handle L key (descent/landing)
      if (this.gui.isKeyPressed("KeyL") && !this.helicopter.isLanded) {
        this.helicopter.startDescent();
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
    }
    
    // Calculate delta time
    const delta_t = t - this.lastTime;
    this.lastTime = t;
    this.elapsedTime += delta_t;
    
    // Update helicopter
    if (this.helicopter) {
      this.helicopter.update(delta_t);
      
      // Update helicopter camera if it exists
      this.updateHelicopterCamera();
    }
    
    // Process keyboard input
    this.checkKeys(delta_t);
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
          wall: this.textures.wall,
          roof: this.textures.roof
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
    // Clear image and depth buffer
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    // Initialize Model-View matrix as identity
    this.updateProjectionMatrix();
    this.loadIdentity();
    this.applyViewMatrix();
    
    // Display scene objects
    if (this.displayPanorama) this.panorama.display();
    if (this.displayPlane) this.ground.display();
    if (this.displayAxis) this.axis.display();
    if (this.displayBuilding) this.building.display();
    if (this.displayForest) this.forest.display();
    if (this.displayHelicopter) this.helicopter.display();
  }

}
