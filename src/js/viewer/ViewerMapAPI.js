
// Map (2D) Viewer API

// Specific API for the Map View


// Panorama Image
export class ViewerMapAPI {

    constructor() {
        // hardcoded to work with assets/ for now
        this.layers;
        this.scene = new THREE.Scene(); // scene THREE.Scene scene overlayed over the map (2D) view
        this.camera = new THREE.OrthographicCamera( 
            - window.innerWidth / 2,    // frustum left plane 
            window.innerWidth / 2,      // frustum right plane
            window.innerHeight / 2,     // frustum top plane
            - window.innerHeight / 2,   // frustum bottom plane
            1,                          // frustum near plane
            10);                        // frustum far plane
        this.camera.position.z = 2;     // need to be in [near + 1, far + 1] to be displayed

        this.spriteMap; // for createHUDSprites and updateHUDSprites
    }

    // Method: Add an event layer to the map (2D) view.
    addLayer (layer) {

    }

    // Method: remove an event layer to the map (2D) view.
    removeLayer (layer) {
        // Layer: EventLayer

    }
    // Method
    redraw() {
        // Schedule a redraw of the three.js scene overlayed over the map (2D) view.
      
    }
    
    // Method
    scale() {
        //Get the scale used by the three.js scene overlayed over the map (2D) view.
        scale = 1 //  (in meter / pixel)
        return scale
    }

}

