
// Map (2D) Viewer API

// Specific API for the Map View


// Panorama Image
export class ViewerMapAPI {

    constructor() {
        // hardcoded to work with assets/ for now

        this.layer;
        this.scene = new THREE.Scene(); // scene THREE.Scene Three.js scene overlayed over the map (2D) view
    }

    // Getter
    get scene() {
        return this.scene;
    }

    // Method: Add an event layer to the map (2D) view.
    addLayer(layer ) {
        // Layer: EventLayer

    }

    // Method: Add an event layer to the map (2D) view.
    removeLayer(layer ) {
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

