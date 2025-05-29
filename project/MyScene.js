import { CGFscene, CGFcamera, CGFaxis, CGFtexture} from "../lib/CGF.js";
import { MyPanorama } from './MyPanorama.js';
import { MyGround } from "./MyGround.js";
import { MyBuilding } from "./MyBuilding.js";

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
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
    this.ground = new MyGround(this, this.grassTexture);
    this.panorama = new MyPanorama(this, this.panoramaTexture);
    
    // Create the building
    this.building = new MyBuilding(this, 15, 2, 2, 
      [this.windowTexture, this.windowTexture, this.windowTexture],
      [0.7, 0.7, 0.7, 1.0], 
      {
        door: this.doorTexture, 
        helipad: this.helipadTexture,
        wall: this.wallTexture,
        roof: this.roofTexture
      }
    );

    // Display flags
    this.displayAxis = false;
    this.displayPanorama = true;
    this.displayPlane = true;
    this.displayBuilding = true;
  }

  initTextures() {
    // Panorama & ground textures
    this.panoramaTexture = new CGFtexture(this, "textures/panorama.jpg");
    this.grassTexture = new CGFtexture(this, "textures/grass.png");
    
    // Building textures
    this.windowTexture = new CGFtexture(this, "textures/window.jpg");
    this.doorTexture = new CGFtexture(this, "textures/door.png");
    this.helipadTexture = new CGFtexture(this, "textures/heliport.png");
    this.wallTexture = new CGFtexture(this, "textures/building_wall.jpg");
    this.roofTexture = new CGFtexture(this, "textures/roof.webp");
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
  checkKeys() {
    var text = "Keys pressed: ";
    var keysPressed = false;

    // Check for key codes e.g. in https://keycode.info/
    if (this.gui.isKeyPressed("KeyW")) {
      text += " W ";
      keysPressed = true;
    }

    if (this.gui.isKeyPressed("KeyS")) {
      text += " S ";
      keysPressed = true;
    }
    if (keysPressed)
      console.log(text);
  }

  update(t) {
    this.checkKeys();
  }

  setDefaultAppearance() {
    this.setAmbient(0.5, 0.5, 0.5, 1.0);
    this.setDiffuse(0.5, 0.5, 0.5, 1.0);
    this.setSpecular(0.5, 0.5, 0.5, 1.0);
    this.setEmission(0, 0, 0, 1);
    this.setShininess(10.0);
  }

  display() {
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    // Initialize Model-View matrix as identity (no transformation)
    this.updateProjectionMatrix();
    this.loadIdentity();
    this.applyViewMatrix();
    
    // Display objects
    if (this.displayPanorama) this.panorama.display();
    if (this.displayPlane) this.ground.display();
    if (this.displayAxis) this.axis.display();
    if (this.displayBuilding) this.building.display();
  }
}
