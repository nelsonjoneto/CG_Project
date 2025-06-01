/**
 * MyInterface - Handles GUI and keyboard input for scene interaction
 * Provides control panels for all adjustable simulation parameters
 */
import { CGFinterface, dat } from '../lib/CGF.js';

/**
* MyInterface
* @constructor
* Creates the interface handler
*/
export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    /**
     * Initialize the interface with controls and input handlers
     * Sets up all GUI panels and keyboard event listeners
     * @param application - The application context
     */
    init(application) {
        // Initialize base interface
        super.init(application);

        // Create main GUI controller using dat.GUI library
        this.gui = new dat.GUI();

        // Scene visibility toggles
        this.gui.add(this.scene, 'displayAxis').name('Display Axis');       // Toggle coordinate axis
        this.gui.add(this.scene, 'displayPlane').name("Display Plane");     // Toggle ground plane
        this.gui.add(this.scene, 'displayPanorama').name("Display Panorama"); // Toggle skybox
        
        // Helicopter control panel
        const helicopterFolder = this.gui.addFolder('Helicopter Movement');
        
        // Speed factor slider (0.1-3.0) affects overall simulation speed
        helicopterFolder.add(this.scene, 'speedFactor', 0.1, 3.0, 0.1)
            .name('Speed Factor')
            .onChange((val) => {
                this.scene.speedFactor = val;
            });
            
        // Open helicopter folder by default for easy access
        helicopterFolder.open();
        
        // Building configuration panel
        const buildingFolder = this.gui.addFolder('Building Configuration');
        
        // Controls for building customization
        buildingFolder.add(this.scene, 'buildingFloors', 1, 3, 1)
          .name('Number of Floors')
          .onChange(() => this.scene.updateBuilding());  // Trigger building update on change
          
        buildingFolder.add(this.scene, 'buildingWindows', 1, 4, 1)
          .name('Windows per Floor')
          .onChange(() => this.scene.updateBuilding());  // Trigger building update on change
          
        // Open building folder by default
        buildingFolder.open();

        // Camera controls panel
        const cameraFolder = this.gui.addFolder('Camera Settings');

        // Camera selection dropdown
        cameraFolder.add(this.scene, 'activeCamera', ['default', 'helicopter'])
          .name('Active Camera')
          .onChange((val) => {
            // Switch active camera reference based on selection
            if (val === 'default') {
              this.scene.camera = this.scene.defaultCamera;
            } else {
              this.scene.camera = this.scene.helicopterCamera;
            }
          });

        // Helicopter camera positioning controls
        cameraFolder.add(this.scene, 'heliCamDistance', 5, 30)
          .name('Distance')
          .onChange(() => this.scene.updateHelicopterCamera());
        
        cameraFolder.add(this.scene, 'heliCamHeight', 2, 20)
          .name('Height')
          .onChange(() => this.scene.updateHelicopterCamera());
        
        cameraFolder.add(this.scene, 'heliCamAngle', -Math.PI / 2, 3 * Math.PI / 2, 0.1)
          .name('Angle')
          .onChange(() => this.scene.updateHelicopterCamera());

        // Open camera folder by default
        cameraFolder.open();

        // Set up keyboard handling
        this.initKeys();

        return true;
    }

    /**
     * Initialize keyboard input tracking system
     * Creates key state tracking data structures
     */
    initKeys() {
        // Store reference to interface in the scene for key access
        this.scene.gui = this;

        // Disable default keyboard processor
        this.processKeyboard = function () { };

        // Create state tracking object for active keys
        this.activeKeys = {};
    }

    /**
     * Handle key press events
     * Records the pressed key in the active keys tracking object
     * @param event - Key press event
     */
    processKeyDown(event) {
        // Mark key as active in tracking array
        this.activeKeys[event.code] = true;
    };

    /**
     * Handle key release events
     * Removes the released key from active keys tracking
     * @param event - Key release event
     */
    processKeyUp(event) {
        // Mark key as inactive in tracking array
        this.activeKeys[event.code] = false;
    };

    /**
     * Check if a specific key is currently pressed
     * @param keyCode - Key code to check
     * @return {boolean} True if key is currently pressed
     */
    isKeyPressed(keyCode) {
        // Return key state or false if not found
        return this.activeKeys[keyCode] || false;
    }
}