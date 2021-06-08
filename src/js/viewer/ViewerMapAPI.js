"use strict";

// Map (2D) Viewer API

// Specific API for the Map View
export class ViewerMapAPI {

    constructor(viewerAPI) {
        this.viewerImageAPI = viewerAPI.image;
        this.viewerFloorAPI = viewerAPI.floor;
        viewerAPI.floor.viewerMapAPI = this; // set reference to mapAPI in floorAPI

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
        this.mapScalingFactor = 0.2;
        this.baseURL = viewerAPI.baseURL;

        // create Map and Layers
        this.map;
        
        this.initDisplayMap();
        this.updateDisplayMap(this.viewerFloorAPI.currentFloorId);
        this.features = [];
        this.lastVectorLayer;
        this.lastFloorID = 0;
        this.viewerAPI = viewerAPI;
    }

    // Method: Add an event layer to the map (2D) view.
    addLayer(layer) {
        this.map.addLayer(layer);
    }

    // Method: remove an event layer to the map (2D) view.
    removeLayer(layer) {
        // Layer: EventLayer
        this.map.removeLayer(layer);
    }

    // Method : Schedule a redraw of the three.js scene overlayed over the map (2D) view.
    redraw() {
        
        var features = [];
        // for avoid duplicating
        if (this.viewerFloorAPI.currentFloorId != this.lastFloorID){

            console.log("not duplicate")
            console.log(this.map)
            // // remove prvious vector layers 
            this.map.removeLayer(this.lastVectorLayerRed);
            this.map.removeLayer(this.lastVectorLayer);

            
            // show layer map

        // remove comment to draw all points on map
        let allImages = this.viewerFloorAPI.currentFloor.viewerImages;
        let floorIndex = this.viewerFloorAPI.currentFloorId; 
        allImages.forEach(image => {
            // add all black points to feature layer 
            // transform xy to lon lan
            //TODO: adjust the position better. This is a temporary scaling and offset
            
            var lon = (image.mapOffset[0]+this.viewerFloorAPI.floors[floorIndex].mapData.x); 
            var lan = (image.mapOffset[1]+ this.viewerFloorAPI.floors[floorIndex].mapData.y); // this.viewerAPI.floor.origin[1] - image.mapOffset[1];
            //console.log(" Coordinates", [ this.viewerFloorAPI.floors[floorIndex].mapData.x,  lon ]); 
            features.push(new ol.Feature({
                geometry: new ol.geom.Point([lon, lan]),
            })
            )

        });

        // create the layer for features -> black points
        var vectorSource = new ol.source.Vector({
            features: features
        });

        var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 3,
                fill: new ol.style.Fill({color: 'black'})
            })
            })
        });

        this.map.addLayer(vectorLayer);

            var features = [];

            // remove comment to draw all points on map
            let allFloorImages = this.viewerFloorAPI.currentFloor.viewerImages;
            var redlon = this.viewerImageAPI.currentImage.mapOffset[0]; 
            var redlan = this.viewerImageAPI.currentImage.mapOffset[1]; 

            allFloorImages.forEach(image => {
            // var redlon = this.viewerAPI.floor.origin[0] - (-this.mapScalingFactor * this.viewerImageAPI.currentImage.mapOffset[0])*3; 
            // var redlan = this.viewerAPI.floor.origin[1] - (this.mapScalingFactor * this.viewerImageAPI.currentImage.mapOffset[1])*2;
 
                // add all black points to feature layer 
                // transform xy to lon lan
                //TODO: adjust the position better. This is a temporary scaling and offset
    
                var lon = this.viewerAPI.floor.origin[0] + image.mapOffset[0]; 
                var lan = this.viewerAPI.floor.origin[1] + image.mapOffset[1] ; // this.viewerAPI.floor.origin[1] - image.mapOffset[1];
                //console.log([this.viewerAPI.floor.origin[0], lon]); 
                features.push(new ol.Feature({
                    geometry: new ol.geom.Point([lon, lan]),
                })
                )
            });

            // create the layer for features -> black points
            var vectorSource = new ol.source.Vector({
                features: features
            });

            var vectorLayer = new ol.layer.Vector({
                source: vectorSource,
                style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 3,
                    fill: new ol.style.Fill({color: 'black'})
                })
                })
            });

            this.map.addLayer(vectorLayer);


            //adding red points

            // var redlon = this.viewerAPI.floor.origin[0] - (-this.mapScalingFactor * this.viewerImageAPI.currentImage.mapOffset[0])*3; 
            // var redlan = this.viewerAPI.floor.origin[1] - (this.mapScalingFactor * this.viewerImageAPI.currentImage.mapOffset[1])*2;
            
            var redlon = this.viewerImageAPI.currentImage.mapOffset[0];
            var redlan = this.viewerImageAPI.currentImage.mapOffset[1]; 

            var redFeature = new ol.Feature({
                geometry: new ol.geom.Point([redlon, redlan]),
            });

            var vectorSourceRed = new ol.source.Vector({
                features: [redFeature]
            });

            var vectorLayerRed = new ol.layer.Vector({
                source: vectorSourceRed,
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 3,
                        fill: new ol.style.Fill({color: 'red'})
                    })
                    })
            });

            this.map.addLayer(vectorLayerRed);

            // save last vector layers for deleting 
            this.lastFloorID = this.viewerFloorAPI.currentFloorId;
            this.lastVectorLayer = vectorLayer;
            this.lastVectorLayerRed = vectorLayerRed;
        }
    }
    
    // Method
    scale() {
        //Get the scale used by the three.js scene overlayed over the map (2D) view.
        return this.viewerFloorAPI.currentFloor.mapData.density; //  (in meter / pixel)
    }


    initDisplayMap(){

        let  currentMapData = this.viewerFloorAPI.floors[this.viewerFloorAPI.currentFloorId].mapData; 
        var extent = [0, 0, currentMapData.width, currentMapData.height];

        //  Projection map image coordinates directly to map coordinates in pixels. 
        var projection = new ol.proj.Projection({
        code: 'image',
        units: 'pixels',
        extent: extent,
        });
    
        // create map 
        this.map = new ol.Map({  //new ol.control.OverviewMap({
            target: 'map',
            view: new ol.View({
                projection: projection,
                center: new ol.extent.getCenter(extent),
                zoom: 1,
                maxZoom: 4,
            }),
            // controls: controls,
            controls: ol.control.defaults({
                rotate: false // hide rotation button
            }).extend([
                new ol.control.FullScreen() // create fullScreen button
              ])
            });
        
        
        // create image layers for each floors 
        for (var i =0; i < this.viewerFloorAPI.floors.length; i++){
            let mapData = this.viewerFloorAPI.floors[i].mapData; 
            let e = [0, 0, mapData.width, mapData.height]; 
            this.map.addLayer(new ol.layer.Image({
                source: new ol.source.ImageStatic({
                    //attributions: '© <a href="https://github.com/openlayers/openlayers/blob/main/LICENSE.md">OpenLayers</a>',
                    url: this.baseURL +  mapData.name + ".png",
                    projection: new ol.proj.Projection({
                        code: 'image',
                        units: 'pixels',
                        extent: e,
                        }),
                    imageExtent:e  ,
                })
            }))
        }
    }

    updateDisplayMap(floorIndex){

        var group = this.map.getLayerGroup();
        var layers = group.getLayers();

        // set layer visibility
        layers.forEach(function (layer, i) {
            if (i == floorIndex){
                layer.setVisible(true);
            }
            else{
                layer.setVisible(false);
            }
            });
    }

}

/*
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