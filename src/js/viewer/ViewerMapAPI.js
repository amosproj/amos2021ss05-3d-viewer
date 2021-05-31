import { textureLoader, baseURL } from "./Globals.js";



// Map (2D) Viewer API

// Specific API for the Map View
export class ViewerMapAPI {

    constructor(viewerImageAPI, viewerFloorAPI) {
        // hardcoded to work with assets/ for now
        this.viewerImageAPI = viewerImageAPI;
        this.viewerFloorAPI = viewerFloorAPI;
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
        
        const mapPicturePath = baseURL + this.viewerFloorAPI.currentFloor.mapData.name + ".png";
        this.mapLayer = displayMap(mapPicturePath); 
        var popup = new ol.Overlay({
            //element: 
            positioning: 'bottom-center',
            stopEvent: false,
            offset: [0, -10],
          });
          //this.mapLayer.addOvSerlay(popup);
          
        //this.redraw();
        //this.spriteGroup.position.set(window.innerWidth / 2, -window.innerHeight / 2, 0); // bottom right
        //this.scene.add(this.spriteGroup);

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
        this.spriteGroup.clear();
        
        //* remove comment to draw all points on map
        let allImages = this.viewerFloorAPI.currentFloor.viewerImages;
        allImages.forEach(image => {
            this.addPoint("black", image.mapOffset);
        });
        //*/

        this.location = this.addPoint("red", this.viewerImageAPI.currentImage.mapOffset);
        //this.addViewingDirection("yellow",  this.viewerImageAPI.currentImage.mapOffset);
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
        return this.viewerFloorAPI.currentFloor.mapData.density; //  (in meter / pixel)
    }
    
    addViewingDirection(color, position){
        const texture = new THREE.Texture(generateTriangleCanvas(color));
        texture.needsUpdate = true;
        var mat = new THREE.SpriteMaterial({
            map: texture
        });
        position 
        // Create the sprite
        let triangleSprite = new THREE.Sprite(mat);
        triangleSprite.center.set(0.0, 0.0);

        // Draw it at The localization point
        triangleSprite.position.set(-this.mapScalingFactor * position[0], this.mapScalingFactor * position[1], -3);

        //var quartenion = new THREE.Quaternion(this.viewerImageAPI.currentImage.orientation);
        //triangleSprite.transform.rotation = rotation;
        //scale the point
        triangleSprite.scale.set(10, 10, 1);
        this.spriteGroup.add(triangleSprite);

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

function generateTriangleCanvas(color){
    var canvasTri = document.createElement('canvas');
    var context = canvasTri.getContext('2d');

    //Cretae triangle shape
    context.beginPath();
    context.moveTo(200, 100);
    context.lineTo(300, 300);
    context.lineTo(100, 300);
    context.closePath();
    
    // outline
    context.lineWidth = 10;
    context.strokeStyle = '0xff0000'; //blue
    context.stroke();
    
    // the fill color
    context.fillStyle = color;
    context.fill();
    return context; 
}

function displayMap(mapURL){

    var extent = [0, 0, 1024, 1024];
    //  Projection map image coordinates directly to map coordinates in pixels. 
    var projection = new ol.proj.Projection({
    code: 'map-image',
    units: 'pixels',
    extent: extent,
    });

    var map = new ol.control.OverviewMap({
    layers: [
        new ol.layer.Image({
        source: new ol.source.ImageStatic({
            //attributions: '© <a href="https://github.com/openlayers/openlayers/blob/main/LICENSE.md">OpenLayers</a>',
            url: mapURL,
            projection: projection,
            imageExtent: extent,
            fill: new ol.style.Fill({color: 'red'})
        }),
        }) ],
    target: 'map',
    view: new ol.View({
        projection: projection,
        center: new ol.extent.getCenter(extent),
        zoom: 1,
        maxZoom: 5,
    }),
    });
    return map;
}

/*
var overviewMapControl = new OverviewMap({
  // see in overviewmap-custom.html to see the custom CSS used
  className: 'ol-overviewmap ol-custom-overviewmap',
  layers: [
    new TileLayer({
      source: new OSM({
        'url':
          'https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png' +
          '?apikey=Your API key from http://www.thunderforest.com/docs/apikeys/ here',
      }),
    }) ],
  collapseLabel: '\u00BB',
  label: '\u00AB',
  collapsed: false,
});
*/