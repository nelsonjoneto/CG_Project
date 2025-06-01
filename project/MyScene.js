/**
 * MyScene - Main scene class for the helicopter firefighting simulation
 * Manages all scene components, rendering, physics, and state control
 */
import { CGFscene, CGFcamera, CGFaxis, CGFtexture } from "../lib/CGF.js";
import { MyPanorama } from './mainObjects/MyPanorama.js';
import { MyGround } from "./mainObjects/MyGround.js";
import { MyBuilding } from "./mainObjects/MyBuilding.js";
import { MyForest } from "./mainObjects/MyForest.js";
import { MyHelicopter } from "./mainObjects/MyHeli.js";
import { MyFire } from "./mainObjects/MyFire.js";

/**
 * MyScene
 * @constructor
 * Initializes scene properties including configuration parameters,
 * display flags, and camera settings
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
    
    // Building configuration properties
    this.buildingFloors = 2;        // Number of floors in the building
    this.buildingWindows = 2;       // Windows per floor
    this.buildingWidth = 15;        // Base width for scaling
    
    // Helicopter speed factor - controls overall simulation speed
    this.speedFactor = 1;
    
    // Camera management system
    this.activeCamera = 'default';  // Current active camera: 'default' or 'helicopter'
    this.defaultCamera = null;      // Overview camera (initialized later)
    this.helicopterCamera = null;   // Helicopter-following camera (initialized later)
    
    // Helicopter camera configuration parameters
    this.heliCamDistance = 15;      // Distance from helicopter
    this.heliCamHeight = 8;         // Height above helicopter
    this.heliCamAngle = -Math.PI/2; // Angle around helicopter (radians)
    
    // Time tracking for animations and physics
    this.lastTime = 0;              // Last update timestamp
    this.elapsedTime = 0;           // Total elapsed time
    
    // Display flags for toggling scene elements
    this.displayAxis = false;       // Coordinate axis visibility
    this.displayPanorama = true;    // Skybox visibility
    this.displayPlane = true;       // Ground plane visibility
    this.displayForest = true;      // Forest visibility
    this.displayBuilding = true;    // Building complex visibility
    this.displayHelicopter = true;  // Helicopter visibility
    this.displayFire = true;        // Fire effects visibility

    // Shader animation timing
    this.accumulatedTime = 0;       // Accumulated time for shader animations

    // Define world boundaries for helicopter movement constraint
    this.worldBounds = {
      minX: -100,
      maxX: 100,
      minZ: -100,
      maxZ: 100
    };

    // Camera distance constraints for zoom limits
    this.minCameraDistance = 25;    // Minimum camera distance (prevents too close zoom)
    this.maxCameraDistance = 60;    // Maximum camera distance (prevents too far zoom)
  }

  /**
   * Initialize the scene with cameras, lights, and objects
   * Sets up WebGL context and creates initial scene graph
   * @param application - The application context
   */
  init(application) {
    super.init(application);

    this.initCameras();
    this.initLights();

    // Configure WebGL context
    this.gl.clearColor(0, 0, 0, 1.0);
    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);
    // Set up alpha blending for transparent objects (water, fire)
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.BLEND);

    this.enableTextures(true);
    this.initTextures();

    // Set update frequency (20fps)
    this.setUpdatePeriod(50);

    // Initialize coordinate system axis for reference
    this.axis = new CGFaxis(this, 20, 1);
    
    // Initialize ground with shader textures
    this.ground = new MyGround(this, {
      grass: this.textures.grass,
      water: this.textures.water,
      mask: this.textures.mask
    });
    
    // Create panoramic skybox
    this.panorama = new MyPanorama(this, this.textures.panorama);
    
    // Create building complex with signaling capabilities
    this.building = new MyBuilding(this, this.buildingWidth, this.buildingFloors, this.buildingWindows, 
      [this.textures.window, this.textures.window, this.textures.window],
      [0.7, 0.7, 0.7, 1.0], 
      {
        door: this.textures.door, 
        helipad: this.textures.helipad,
        up: this.textures.up,        // For takeoff signaling
        down: this.textures.down,    // For landing signaling
        wall: this.textures.wall,
        roof: this.textures.roof,
        sign: this.textures.sign
      }
    );

    // Create helicopter on the building's helipad
    const helipadPosition = this.building.getHelipadPosition();
    this.helicopter = new MyHelicopter(this, helipadPosition, 
      {
        heliBody: this.textures.heliBody,
        heliGlass: this.textures.heliGlass,
        water: this.textures.water
      }
    );

    // Forest is created later after ground mask is loaded
    this.forest = null;
  }

  /**
   * Initialize all textures used in the scene
   * Loads environment, building, helicopter and effect textures
   */
  initTextures() {
    this.textures = {
      // Environment textures
      panorama: new CGFtexture(this, "textures/panorama.jpg"),
      grass: new CGFtexture(this, "textures/grass.png"),
      
      // Shader-based water system textures
      water: new CGFtexture(this, "textures/waterTex.jpg"),
      mask: new CGFtexture(this, "textures/mask.png"),  // Defines water regions
      
      // Helicopter textures
      heliBody: new CGFtexture(this, "textures/heli_with_doors.png"),
      heliGlass: new CGFtexture(this, "textures/cockpit_glass.jpg"),
      
      // Building textures
      window: new CGFtexture(this, "textures/window.jpg"),
      door: new CGFtexture(this, "textures/door.png"),
      helipad: new CGFtexture(this, "textures/heliport.png"),
      wall: new CGFtexture(this, "textures/building_wall.jpg"),
      roof: new CGFtexture(this, "textures/roof.webp"),
      sign: new CGFtexture(this, "textures/bombeiros.png"),
      
      // Forest textures
      trunk: new CGFtexture(this, "textures/trunk1.jpg"),
      trunkAlt: new CGFtexture(this, "textures/trunk.jpg"),
      leaves: new CGFtexture(this, "textures/crown.png"),
      pine: new CGFtexture(this, "textures/crown1.png"),

      // Fire effect texture
      flame: new CGFtexture(this, "textures/flame_texture.webp"),

      // Heliport signaling textures
      up: new CGFtexture(this, "textures/up.png"),      // Takeoff indicator
      down: new CGFtexture(this, "textures/down.png")   // Landing indicator
    };
  }

  /**
   * Initialize scene lights
   * Sets up multiple light sources for balanced scene illumination
   */
  initLights() {
    // Main directional light (simulates sun)
    this.lights[0].setPosition(0, 100, -100, 1);
    this.lights[0].setAmbient(0.1, 0.1, 0.1, 1.0);
    this.lights[0].setDiffuse(0.4, 0.4, 0.4, 1.0);
    this.lights[0].setSpecular(0.1, 0.1, 0.1, 1.0);
    this.lights[0].enable();
    this.lights[0].update();
    
    // Additional directional lights for balanced illumination
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
  
  /**
   * Initialize scene cameras
   * Creates main overview camera and helicopter-following camera
   */
  initCameras() {
    // Static overview camera positioned to view entire scene
    this.defaultCamera = new CGFcamera(
      1,              // Field of view
      0.1,            // Near clipping plane
      1000,           // Far clipping plane
      vec3.fromValues(50, 50, 50),  // Camera position
      vec3.fromValues(0, 15, 0)     // Target point
    );
    
    // Helicopter-following camera with wider angle for better view
    this.helicopterCamera = new CGFcamera(
      1.1,            // Slightly wider angle
      0.1,            // Near clipping plane
      1000,           // Far clipping plane
      vec3.fromValues(15, 10, 15),  // Initial position (updated dynamically)
      vec3.fromValues(0, 0, 0)      // Initial target (updated dynamically)
    );
    
    // Use default camera initially
    this.camera = this.defaultCamera;
  }

  /**
   * Update the helicopter-following camera position based on helicopter state
   * Positions camera at specified distance, height and angle from helicopter
   */
  updateHelicopterCamera() {
    if (!this.helicopter) return;
    
    const heliPos = this.helicopter.getPosition();
    const heliOrientation = this.helicopter.orientation;
    
    // Calculate orbital position around helicopter based on parameters
    const camX = heliPos.z + Math.sin(heliOrientation + this.heliCamAngle) * this.heliCamDistance;
    const camY = heliPos.y + this.heliCamHeight;
    const camZ = heliPos.x + Math.cos(heliOrientation + this.heliCamAngle) * this.heliCamDistance;
    
    // Update camera position and target
    this.helicopterCamera.position = vec3.fromValues(camX, camY, camZ);
    this.helicopterCamera.target = vec3.fromValues(heliPos.z, heliPos.y, heliPos.x);
  }

  /**
   * Toggle between default and helicopter-following cameras
   * Updates active camera reference and scene.camera pointer
   */
  toggleCamera() {
    if (this.activeCamera === 'default') {
      this.activeCamera = 'helicopter';
      this.camera = this.helicopterCamera;
    } else {
      this.activeCamera = 'default';
      this.camera = this.defaultCamera;
    }
  }

  /**
   * Check if a position is within the building area (used for collision detection)
   * @param x - X coordinate to check
   * @param z - Z coordinate to check
   * @return {boolean} True if position is within building area
   */
  isBuildingArea(x, z) {
    // Calculate building dimensions based on module sizes
    const totalWidth = this.buildingWidth + 2 * (this.buildingWidth * 0.75);
    const totalDepth = this.buildingWidth * 0.75;
    
    const margin = 15; // Extra margin for clear space around building
    
    const halfWidth = totalWidth / 2 + margin;
    const halfDepth = totalDepth / 2 + margin;
    
    // Check if position is within bounds
    return (
      x >= -halfWidth && x <= halfWidth &&
      z >= -halfDepth && z <= halfDepth
    );
  }

  /**
   * Check if a position is within the allowed world boundaries
   * @param position - Position object with x, y, z coordinates
   * @return {boolean} True if position is within world boundaries
   */
  isPositionValid(position) {
    return (
      position.x >= this.worldBounds.minX && 
      position.x <= this.worldBounds.maxX &&
      position.z >= this.worldBounds.minZ && 
      position.z <= this.worldBounds.maxZ
    );
  }

  /**
   * Process keyboard inputs for helicopter control
   * Handles movement, camera toggle, and special actions
   * @param delta_t - Time delta since last update in milliseconds
   */
  checkKeys(delta_t) {
    if (this.helicopter) {
      // Scale control factors by delta time and speed factor
      const accelFactor = 0.001 * this.speedFactor;
      const turnFactor = 0.002 * this.speedFactor;
      
      // Forward/backward movement (W/S keys)
      if (this.gui.isKeyPressed("KeyW")) {
        this.helicopter.accelerate(accelFactor * delta_t);
      } else if (this.gui.isKeyPressed("KeyS")) {
        this.helicopter.accelerate(-accelFactor * delta_t);
      } else {
        this.helicopter.setForwardAccelerating(false);
      }
      
      // Left/right turning (A/D keys)
      if (this.gui.isKeyPressed("KeyA")) {
        this.helicopter.turn(-turnFactor * delta_t);
      } else if (this.gui.isKeyPressed("KeyD")) {
        this.helicopter.turn(turnFactor * delta_t);
      } else {
        this.helicopter.setTurning(false);
      }
      
      // Reset helicopter position (R key)
      if (this.gui.isKeyPressed("KeyR"))
        this.helicopter.resetPosition();
      
      // Takeoff/ascent control (P key)
      if (this.gui.isKeyPressed("KeyP")) {
        // Case 1: Takeoff from helipad
        if (this.helicopter.isLanded) {
          this.helicopter.startAscent();
        } 
        // Case 2: Ascent from water after collection
        else if (this.helicopter.state === 'descending_to_water' && this.helicopter.hasWater) {
          this.helicopter.startAscent();
        }
      }
      
      // Landing/descent control (L key)
      if (this.gui.isKeyPressed("KeyL") && !this.helicopter.isLanded) {
        // Initiate descent - helicopter determines if going to water or helipad
        this.helicopter.startDescent();
      }
      
      // Water dropping (O key) with key-press tracking to prevent repeat triggers
      if (this.gui.isKeyPressed("KeyO") && !this.waterKeyPressed) {
        this.helicopter.dropWater();
        this.waterKeyPressed = true;
      }
      
      // Reset water key flag when released
      if (!this.gui.isKeyPressed("KeyO")) {
        this.waterKeyPressed = false;
      }
    }
    
    // Camera toggle with 'C' key
    if (this.gui.isKeyPressed("KeyC") && !this.keyPressedC) {
      this.toggleCamera();
      this.keyPressedC = true;
    }
    
    // Reset camera toggle flag when key is released
    if (!this.gui.isKeyPressed("KeyC")) {
      this.keyPressedC = false;
    }
  }

  /**
   * Main update method called on every animation frame
   * Updates all scene components, animations, and physics
   * @param t - Current timestamp in milliseconds
   */
  update(t) {
    // Initialize time tracking on first update
    if (!this.lastTime) {
      this.lastTime = t;
      this.elapsedTime = 0;
      this.accumulatedTime = 0;
    }
    
    // Calculate time deltas
    const delta_t = t - this.lastTime;
    this.lastTime = t;
    this.elapsedTime += delta_t;
    
    // Update shader animation time
    this.accumulatedTime += delta_t;
    
    // Update ground shader time factor
    if (this.ground) {
        this.ground.groundShader.setUniformsValues({
            timeFactor: this.accumulatedTime / 100 % 100
        });
    }
    
    // Deferred creation of forest once ground mask is ready
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
    
    // Deferred creation of fire system once forest exists
    if (this.forest && !this.fire && this.ground.maskReady) {
      const treePositions = this.forest.trees.map(entry => ({ x: entry.x, z: entry.z }));
      this.fire = new MyFire(this, treePositions, 50, this.textures.flame);
    }
    
    // Update fire animation and effects
    if (this.fire) {
      this.fire.update(delta_t);
    }
    
    // Update helicopter physics and animation
    if (this.helicopter) {
      this.helicopter.update(delta_t);
      this.updateHelicopterCamera();
    }
    
    // Update building helipad signaling based on helicopter state
    if (this.building && this.helicopter) {
      this.building.update(t, this.helicopter.state);
    }
    
    // Process user input
    this.checkKeys(delta_t);

    // Enforce camera zoom and position constraints
    this.enforceCameraLimits();
  }

  /**
   * Enforce camera distance and position constraints
   * Prevents camera from going too close, too far, or below ground
   */
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
    
    let positionChanged = false;
    
    // Limit maximum zoom distance
    if (currentDistance > this.maxCameraDistance) {
      // Scale position vector to maximum allowed distance
      const scale = this.maxCameraDistance / currentDistance;
      
      // Recalculate position while maintaining direction
      this.defaultCamera.position = [
        target[0] + dx * scale,
        target[1] + dy * scale,
        target[2] + dz * scale
      ];
      
      positionChanged = true;
    }
    
    // Limit minimum zoom distance
    else if (currentDistance < this.minCameraDistance) {
      const scale = this.minCameraDistance / currentDistance;
      
      this.defaultCamera.position = [
        target[0] + dx * scale,
        target[1] + dy * scale,
        target[2] + dz * scale
      ];
      
      positionChanged = true;
    }
    
    // Prevent camera from going below ground level
    if (this.defaultCamera.position[1] < 0) {
      this.defaultCamera.position[1] = 2;  // Set small height above ground
      positionChanged = true;
    }
    
    // Force camera to update internal matrices after position changes
    if (positionChanged) {
      this.defaultCamera.orbit(0, 0); // Apply zero orbit to trigger update
    }
  }

  /**
   * Recreate building with updated parameters
   * Updates helicopter position if it was landed on the helipad
   */
  updateBuilding() {
    if (this.building) {
      // Track helicopter landing state before recreation
      const helicopterWasLanded = this.helicopter && this.helicopter.isLanded;
      
      // Create new building with updated parameters
      this.building = new MyBuilding(this, this.buildingWidth, this.buildingFloors, this.buildingWindows, 
        [this.textures.window, this.textures.window, this.textures.window],
        [0.7, 0.7, 0.7, 1.0], 
        {
          door: this.textures.door, 
          helipad: this.textures.helipad,
          up: this.textures.up,
          down: this.textures.down,
          wall: this.textures.wall,
          roof: this.textures.roof,
          sign: this.textures.sign
        }
      );
      
      // Reset helicopter position if it was landed
      if (helicopterWasLanded && this.helicopter) {
        const newHelipadPos = this.building.getHelipadPosition();
        this.helicopter.resetPosition();
      }
    }
  }

  /**
   * Set default material properties for rendering
   * Used for objects without specific materials
   */
  setDefaultAppearance() {
    this.setAmbient(0.5, 0.5, 0.5, 1.0);
    this.setDiffuse(0.5, 0.5, 0.5, 1.0);
    this.setSpecular(0.5, 0.5, 0.5, 1.0);
    this.setEmission(0, 0, 0, 1);
    this.setShininess(10.0);
  }

  /**
   * Main display method to render the complete scene
   * Renders all visible scene elements in the correct order
   */
  display() {
    // Set up rendering context
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.updateProjectionMatrix();
    this.loadIdentity();
    this.applyViewMatrix();
    
    // Render scene components based on visibility flags
    if (this.displayPanorama && this.panorama) this.panorama.display();
    if (this.displayPlane && this.ground) this.ground.display();
    if (this.displayAxis && this.axis) this.axis.display();
    if (this.displayBuilding && this.building) this.building.display();
    if (this.displayForest && this.forest) this.forest.display();
    if (this.displayFire && this.fire) this.fire.display();
    if (this.displayHelicopter && this.helicopter) this.helicopter.display();
  }
}