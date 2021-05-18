
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
        this.mapScalingFactor = 0.2;

        new THREE.TextureLoader().load(mapPicturePath, (texture) => {
            const material = new THREE.SpriteMaterial({ map: texture, blending: THREE.AdditiveBlending, transparent: true });
            material.renderOrder = 1;
            material.depthTest = false;
            const spriteMap = new THREE.Sprite(material);
            this.spriteMapScale = [texture.image.width * this.mapScalingFactor, texture.image.height * this.mapScalingFactor, 1];
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
    addLayer(layer) {
        this.scene.add(layer);
    }

    // Method: remove an event layer to the map (2D) view.
    removeLayer(layer) {
        // Layer: EventLayer
        this.scene.remove(layer);
    }
   
    // Method : Schedule a redraw of the three.js scene overlayed over the map (2D) view.
    redraw() {

        /* remove comment to draw all points on map
        let allImages = this.viewerImageAPI.currentFloor.viewerImages;
        allImages.forEach(image => {
            this.addPoint("black", image.mapOffset);
        });
        //*/

        this.location = this.addPoint("red", this.viewerImageAPI.currentImage.mapOffset);
    }

    // draws a point in *color* on the map at *offset*, also returns the THREE.Sprite after it is drawn
    addPoint(color, offset) {
        const texture = new THREE.Texture(generateCircularSprite(color));
        texture.needsUpdate = true;
        var mat = new THREE.SpriteMaterial({
            map: texture,
            transparent: false,
            color: 0xffffff // BLACK, 
        });
        // Render on Top
        mat.renderOrder = 3;
        // Create the point sprite
        let pointSprite = new THREE.Sprite(mat);
        pointSprite.center.set(0.0, 0.0);

        // draw it at pixel offset of as agruemnt passed pixel offset
        pointSprite.position.set(-this.mapScalingFactor * offset[0], this.mapScalingFactor * offset[1], -3);

        //scale the point
        pointSprite.scale.set(5, 5, 1);
        this.spriteGroup.add(pointSprite);

        return pointSprite;
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
    context.fillStyle = color;
    context.fill();
    return canvas;

}