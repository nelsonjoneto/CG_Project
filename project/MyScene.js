import { CGFscene, CGFcamera, CGFaxis, CGFtexture} from "../lib/CGF.js";
import { MyPanorama } from './MyPanorama.js';
import { MyGround } from "./MyGround.js";
import { MyBuilding } from "./MyBuilding.js";
import { MyUnitCube } from "./MyUnitCube.js";
import { MyTree } from "./MyTree.js";
import { MyForest } from "./MyForest.js";

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

    //Background color
    this.gl.clearColor(0, 0, 0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.enableTextures(true);
    this.initTextures();

    this.setUpdatePeriod(50);

    //Initialize scene objects
    this.axis = new CGFaxis(this, 20, 1);
    this.ground = new MyGround(this);
    this.panorama = new MyPanorama(this, this.panoramaTexture);
    this.module = new MyBuilding(this,10, 2, 2, 
      [this.windowTexture, this.windowTexture, this.windowTexture],[0.8, 0.8, 0.8, 1.0]);

    this.cube = new MyUnitCube(this);
    this.forest = new MyForest(this, 10, 10, 20, 20);


    this.displayAxis = false;
    this.displayPanorama = true;
    this.displayPlane = true;

  }

  initTextures() {
    this.panoramaTexture = new CGFtexture(this, "textures/panorama6.jpg");
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
    this.setEmission(0,0,0,1)
    this.setShininess(10.0);
  }
  display() {
    // ---- BEGIN Background, camera and axis setup
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();
    
    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix(); 
    
    
    if (this.displayPanorama) {
      this.panorama.display();
    }

    if (this.displayPlane) {
        this.ground.display();
    }

    // Draw axis last
    if (this.displayAxis) this.axis.display();
    //this.module.display();

    this.forest.display()
    
  }
}
