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
    this.module = new MyBuilding(this,15, 2, 2, 
      [this.windowTexture, this.windowTexture, this.windowTexture],[0.8, 0.8, 0.8, 1.0]);
    //this.forest = new MyForest(this, 10, 10, 60, 60);
    this.forest = new MyForest(this, 8, 8, 60, 60);
    this.helicopter = new MyHelicopter(this);  

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
    const speedFactor = this.speedFactor;

    // Movement controls
    if (this.gui.isKeyPressed("KeyW"))
        this.helicopter.accelerate(2 * speedFactor * delta_t);
    if (this.gui.isKeyPressed("KeyS"))
        this.helicopter.accelerate(-2 * speedFactor * delta_t);
    if (this.gui.isKeyPressed("KeyA"))
        this.helicopter.turn(-1 * speedFactor * delta_t);
    if (this.gui.isKeyPressed("KeyD"))
        this.helicopter.turn(1 * speedFactor * delta_t);

    // Special controls
    if (this.gui.isKeyPressed("KeyR"))
        this.helicopter.resetPosition();
    if (this.gui.isKeyPressed("KeyP") && this.helicopter.isLanded)
        this.helicopter.startAscent();
    if (this.gui.isKeyPressed("KeyL") && !this.helicopter.isLanded)
        this.helicopter.startDescent();
  }

  update(t) {
      if (!this.lastTime) this.lastTime = t;
      const delta_t = t - this.lastTime;
      this.lastTime = t;

      if (this.fire) this.fire.update(delta_t);
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
    this.forest.display();
    this.fire.display();
    //this.helicopter.display();
    
  }
}