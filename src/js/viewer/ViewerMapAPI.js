
// Map (2D) Viewer API

// Specific API for the Map View


// Panorama Image
export class ViewerMapAPI {

    constructor() {
        // hardcoded to work with assets/ for now

        this.layer;
        this.scene = new THREE.Scene(); // scene THREE.Scene scene overlayed over the map (2D) view
    
        }

    // Getter
    get scene() {
        return this.scene;
    }

    // Method: Add an event layer to the map (2D) view.
    addLayer(layer ) {
        // Layer: EventLayer
        // Create a Othogonal camaera for 2D image display 
        const map = document.getElementById('map');
        cameraOrtho = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, 1, 10 );
        cameraOrtho.position.z = 10;
        sceneOrtho = new THREE.Scene();

        // Create MAP Canvas
        geometry = new THREE.BoxGeometry(200, 200, 200);
        material = new THREE.MeshNormalMaterial();         
        mesh = new $wnd.THREE.Mesh(geometry, material);
        sceneOrtho.add(mesh);
        
        map_renderer = new THREE.WebGLRenderer({
            canvas : foreground,
            alpha : true
        });


        map_renderer.setSize(viewportWidth / 2, viewportHeight);
        map_renderer.setClearColor(0x000000, 0); 

    }

    // Method: remove an event layer to the map (2D) view.
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

