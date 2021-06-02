"use strict";

import { ViewerAPI } from "./ViewerAPI.js";

// Map (2D) Viewer API

// Specific API for the Map View
export class ViewerMapAPI {

    constructor(viewerAPI) {
        this.viewerImageAPI = viewerAPI.viewerImageAPI;
        this.viewerFloorAPI = viewerAPI.viewerFloorAPI;
        viewerAPI.viewerFloorAPI.viewerMapAPI = this; // set reference to mapAPI in floorAPI

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

        // const baseURL = "https://bora.bup-nbg.de/amos2floors/";
        const baseURL = viewerAPI.baseURL;
                
        const mapPicturePath = baseURL + this.viewerFloorAPI.currentFloor.mapData.name + ".png";
        this.map = displayMap(mapPicturePath); 
        /*
    
        var popup = new ol.Overlay({
            //element: 
            positioning: 'bottom-center',
            stopEvent: false,
            offset: [0, -10],
          });
          this.mapLayer.addOvSerlay(popup);
        */
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
        point_canvas = generateCircularSprite(color);
        position =[-this.mapScalingFactor * offset[0], this.mapScalingFactor * offset[1]]

        return position;
    }
    
    // Method
    scale() {
        //Get the scale used by the three.js scene overlayed over the map (2D) view.
        return this.viewerFloorAPI.currentFloor.mapData.density; //  (in meter / pixel)
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


function displayMap(mapURL){

    var extent = [0, 0, 256, 256];
    //  Projection map image coordinates directly to map coordinates in pixels. 
    var projection = new ol.proj.Projection({
    code: 'map-image',
    units: 'pixels',
    extent: extent,
    });

    var map = new ol.Map({
        controls: ol.control.defaults({rotate: false}),
        interactions: ol.interaction.defaults({altShiftDragRotate:false, pinchRotate:false}), 
        layers: [
            new ol.layer.Image({
            source: new ol.source.ImageStatic({
                //attributions: '© <a href="https://github.com/openlayers/openlayers/blob/main/LICENSE.md">OpenLayers</a>',
                url: mapURL,
                projection: projection,
                imageExtent: extent,

            }),
            }) ],
        target: 'map',
        view: new ol.View({
            projection: projection,
            center: new ol.extent.getCenter(extent),
            zoom: 0.8,
            maxZoom: 4,
        }),
        });
        
    return map; 

}
