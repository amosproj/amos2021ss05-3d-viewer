
// Map (2D) Viewer API

// Specific API for the Map View
export class ViewerMapAPI {

    constructor(mapPicturePath, viewerImageAPI) {
        // hardcoded to work with assets/ for now
        this.viewerImageAPI = viewerImageAPI;
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

        this.spriteGroup = new THREE.Group(); //create an sprite group
        this.mapScalingFactor = 10;

        new THREE.TextureLoader().load(mapPicturePath, (texture) => {
            const material = new THREE.SpriteMaterial({ map: texture, blending: THREE.AdditiveBlending, transparent: true });
            material.renderOrder = 1;
            material.depthTest = false;
            const spriteMap = new THREE.Sprite(material);
            this.spriteMapScale = [texture.image.width / this.mapScalingFactor, texture.image.height / this.mapScalingFactor, 1];
            spriteMap.scale.set(this.spriteMapScale[0], this.spriteMapScale[1], 1);
            spriteMap.center.set(1.0, 0.0); // bottom right
            spriteMap.position.set(0, 0, 1); // Send Behind
            //this.scene.add(spriteMap);
            this.spriteGroup.add(spriteMap);
        });
        
        this.redraw();
        this.spriteGroup.position.set(window.innerWidth / 2, -window.innerHeight / 2, 0); // bottom right
        this.scene.add(this.spriteGroup);

    }

    // Method: Add an event layer to the map (2D) view.
    addLayer (layer) {
        this.scene.add(layer); 
    }

    // Method: remove an event layer to the map (2D) view.
    removeLayer(layer ) {
        // Layer: EventLayer
        this.scene.remove(layer); 
    }
   
    // Method : Schedule a redraw of the three.js scene overlayed over the map (2D) view.
    redraw() {

        var point_text = new THREE.Texture(generateCircularSprite("red"));
        point_text.needsUpdate = true;
        var mat = new THREE.SpriteMaterial({
            map: point_text,
            transparent: false,
            //depthTest: false,
            //blending: THREE.AdditiveBlending , 
            color: 0xff0000 // RED, 
        });
        // Render on Top
        mat.renderOrder = 3;
        // Create the point sprite
        this.location = new THREE.Sprite(mat);

        this.location.center.set(0.0, 0.0);

        // draw it at pixel offset of currently viewed image
        const offset = this.viewerImageAPI.currentImage.mapOffset;
        this.location.position.set(offset[0] / -this.mapScalingFactor, offset[1] / this.mapScalingFactor, -3);

        //scale the point
        this.location.scale.set(5,5,1); 
        this.spriteGroup.add(this.location);
    }
    
    // Method
    scale() {
        //Get the scale used by the three.js scene overlayed over the map (2D) view.
        return this.viewerImageAPI.currentFloor.mapData.density; //  (in meter / pixel)
    }

    

}


function generateCircularSprite(color) {
    var canvas = document.createElement('canvas');
    canvas.height = 16;
    canvas.width = 16;
    var context = canvas.getContext('2d');
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = 8;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'red';
    context.fill();
    return canvas;

}

