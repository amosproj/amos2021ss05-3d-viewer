"use strict";

import {  MAX_FOV, MIN_FOV } from "./ViewerConfig.js";
// Map (2D) Viewer API

// Specific API for the Map View
export class ViewerMapAPI {

    constructor(viewerAPI) {
        this.viewerImageAPI = viewerAPI.image;
        this.viewerFloorAPI = viewerAPI.floor;
        // draw direction 
        this.viewerViewState = viewerAPI.pano.viewerViewState;

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

        this.spriteGroup = new THREE.Group(); //create an sprite group
        this.mapScalingFactor = 0.2;

        this.baseURL = viewerAPI.baseURL;

        // create Map and Layers
        this.map;
        this.vectorLayer = [];
        this.initDisplayMap();
        this.init = true;

        // avoid duplicating
        this.lastVectorLayer;
        this.lastFloorID = 0;
        this.viewerAPI = viewerAPI;

        // direction
        this.lastvectorLayerdes = [];
        this.lastLayerDirection = [];

        this.redraw();
        this.init = false;



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

    // Method
    scale() {
        //Get the scale used by the three.js scene overlayed over the map (2D) view.
        return this.viewerFloorAPI.currentFloor.mapData.density; //  (in meter / pixel)
    }

    initDisplayMap() {

        let currentMapData = this.viewerFloorAPI.floors[this.viewerFloorAPI.currentFloorId].mapData;
        var extent = [0, 0, currentMapData.width / currentMapData.density, currentMapData.height / currentMapData.density];

        // create map 
        this.map = new ol.Map({ 
            target: 'map',
            view: new ol.View({
                projection: new ol.proj.Projection({
                    extent: extent
                }),
                center: new ol.extent.getCenter(extent), // TODO: update center to current position
                zoom: 1,
                maxZoom: 4,
            }),
            controls: ol.control.defaults({
                // Hide Map rotation button
                rotate: false                   
            }).extend([
                // create fullScreen button
                new ol.control.FullScreen(),    
                //new ol.control.ZoomSlider(),
            ]),
            //Disable Zoom Control on MAP
            interactions: ol.interaction.defaults({mouseWheelZoom:false}),         
        });


        // TODO CLEAN MAP MEATADATA
        
        // calculate map origin in lon,lan
        var current_MapData0 = this.viewerFloorAPI.floors[0].mapData;
        // converting map pixel to lon, lan
        var mapdata_X_in_meter0 = (current_MapData0.x / current_MapData0.density);
        var mapdata_X_in_lon0 = mapdata_X_in_meter0 / 87000; // temporary a degree of longitude, one degree east or west at lan -37.80299558787142 degree => 87000m
        var mapdata_origin_lon0 = this.viewerFloorAPI.origin[0] - mapdata_X_in_lon0;

        var mapdata_Y_in_meter0 = (current_MapData0.y / current_MapData0.density);
        var mapdata_Y_in_lan0 = mapdata_Y_in_meter0 / 111000; // temporary a degree of latitude, one degree north or south, is about the same distance anywhere, about 111000m
        var mapdata_origin_lan0 = this.viewerFloorAPI.origin[1] - mapdata_Y_in_lan0;

        // calculate map center in lon,lan
        this.mapdata_center_lon0 = mapdata_origin_lon0 + (1 / 2) * (current_MapData0.width / current_MapData0.density);
        this.mapdata_center_lan0 = mapdata_origin_lan0 + (1 / 2) * (current_MapData0.height / current_MapData0.density);

        var current_MapData1 = this.viewerFloorAPI.floors[1].mapData;

        var mapdata_X_in_meter1 = (current_MapData1.x / current_MapData1.density);
        var mapdata_X_in_lon1 = mapdata_X_in_meter1 / 87000; // temporary a degree of longitude, one degree east or west at lan -37.80299558787142 degree => 87000m
        var mapdata_origin_lon1 = this.viewerFloorAPI.origin[0] - mapdata_X_in_lon1;

        var mapdata_Y_in_meter1 = (current_MapData1.y / current_MapData1.density);
        var mapdata_Y_in_lan1 = mapdata_Y_in_meter1 / 111000; // temporary a degree of latitude, one degree north or south, is about the same distance anywhere, about 111000m
        var mapdata_origin_lan1 = this.viewerFloorAPI.origin[1] - mapdata_Y_in_lan1;

        // calculate map center in lon,lan
        this.mapdata_center_lon1 = mapdata_origin_lon1 + (1 / 2) * (current_MapData1.width / current_MapData1.density);
        this.mapdata_center_lan1 = mapdata_origin_lan1 + (1 / 2) * (current_MapData1.height / current_MapData1.density);


        // create image layers for each floors 
        for (var i = 0; i < this.viewerFloorAPI.floors.length; i++) {
            let mapData = this.viewerFloorAPI.floors[i].mapData
            this.map.addLayer(new ol.layer.Image({
                source: new ol.source.ImageStatic({
                    //attributions: '© <a href="https://github.com/openlayers/openlayers/blob/main/LICENSE.md">OpenLayers</a>',
                    url: this.baseURL + mapData.name + ".png",
                    imageExtent: [0, 0, mapData.width / mapData.density, mapData.height / mapData.density],
                })
            }))
        }

        this.updateDisplayMap((this.viewerFloorAPI.currentFloorId));

        // create vector layers for each floors
        for (var i = 0; i < this.viewerFloorAPI.floors.length; i++) {
            let allImages = this.viewerFloorAPI.floors[i].viewerImages;
            var currentMapdata = this.viewerFloorAPI.floors[i].mapData;

            var features = [];
            // TODO retrieve information from stored data 
            allImages.forEach(image => {
                // Get Longitude and latitude from each point
                var lon = 87000 * (image.pos[0] - this.viewerFloorAPI.origin[0]) + (currentMapdata.x / currentMapdata.density);
                var lan = 111000 * (image.pos[1] - this.viewerFloorAPI.origin[1]) + (currentMapdata.y / currentMapdata.density);

                var current_feature = new ol.Feature({
                    geometry: new ol.geom.Point([lon, lan]),
                })
                features.push(current_feature)
            });

            // create the vector layer for black points
            var vectorSource = new ol.source.Vector({
                features: features
            });

            this.vectorLayer.push(new ol.layer.Vector({
                source: vectorSource,
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 1,
                        fill: new ol.style.Fill({ color: 'black' })
                    })
                })
            }));
        }
    }

    updateDisplayMap(floorIndex) {

        var group = this.map.getLayerGroup();
        var layers = group.getLayers();

        // set layer visibility
        layers.forEach(function (layer, i) {
            if (i == floorIndex) {
                layer.setVisible(true);
            }
            else {
                layer.setVisible(false);
            }
        });
    }

    // Method : Schedule a redraw of the three.js scene overlayed over the map (2D) view.
    redraw() {


        if (this.init != true) {
            // remove prvious vector layers 
            this.map.removeLayer(this.lastVectorLayerRed);
            this.map.removeLayer(this.lastVectorLayer);
        }


        // show layer map
        this.updateDisplayMap(this.viewerFloorAPI.currentFloorId);

        var floorIndex = this.viewerFloorAPI.currentFloorId;
        var currentMapdata = this.viewerFloorAPI.currentFloor.mapData;

        // show current floor black points
        var currentVectorLayer = this.vectorLayer[floorIndex]
        this.map.addLayer(currentVectorLayer);
    
            //adding red points, using this. for show_direction
        this.redlon = 87000 * (this.viewerImageAPI.currentImage.pos[0] - this.viewerFloorAPI.origin[0]) + (currentMapdata.x / currentMapdata.density);
        this.redlan = 111000 * (this.viewerImageAPI.currentImage.pos[1] - this.viewerFloorAPI.origin[1]) + (currentMapdata.y / currentMapdata.density);

        var redFeature = new ol.Feature({
            geometry: new ol.geom.Point([this.redlon, this.redlan]),
        });

        var vectorSourceRed = new ol.source.Vector({
            features: [redFeature]
        });

        var vectorLayerRed = new ol.layer.Vector({
            source: vectorSourceRed,
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 3,
                    fill: new ol.style.Fill({ color: 'red' })
                })
            })
        });

        this.map.addLayer(vectorLayerRed);


        // save last vector layers for deleting next time
        this.lastFloorID = this.viewerFloorAPI.currentFloorId;
        this.lastVectorLayer = currentVectorLayer;
        this.lastVectorLayerRed = vectorLayerRed;

        // disable init
        this.show_direction();
        this.init = false;
    }

    show_direction() {

        // get viewing longitude direction (in degrees)
        var lonov = this.viewerViewState.lonov;

        // temporary using 170 degree for correcting the starting zero degree of 2D map
        var direction = (- lonov - 170)* (Math.PI / 180);
        if (this.init != true) {
            // // remove prvious vector layers 
            this.removeLayer(this.lastVectorLayerRed);
            this.removeLayer(this.lastLayerDirection);
            this.removeLayer(this.viewingDirevyionLayer); 
        }

    
        // remove previoous direction layers
        this.map.removeLayer(this.lastLayerDirection);

        // get direction triangle vertex
        var FOV = this.viewerViewState.fov/2 * (Math.PI / 180)
        //var angle = direction + FOV; 

        var RADIUS = this.viewerViewState.fov / MAX_FOV *5;


        var pointsFOV = [ [this.redlon, this.redlan],
                          [this.redlon + RADIUS*Math.cos((direction + FOV) ), this.redlan + RADIUS*Math.sin((direction + FOV))],  //left  vertex point 
                          [this.redlon + RADIUS*Math.cos((direction - FOV) ), this.redlan + RADIUS*Math.sin((direction - FOV))],  //right vertex point 
                        ];
                        
        var triangleFeats = [];

        for(var i = 0; i < pointsFOV.length; i++){
            let point = new ol.geom.Point(pointsFOV[i]);
            triangleFeats.push(new ol.Feature({ geometry: point}));
        }

        //close the triangle
        //pointsFOV.push(pointsFOV[0]);

        let coordinates = [[this.redlon, this.redlan],
                            [this.redlon + RADIUS*Math.cos((direction + FOV) ), this.redlan + RADIUS*Math.sin((direction + FOV))],  //left  vertex point 
                            [this.redlon + RADIUS*Math.cos((direction - FOV) ), this.redlan + RADIUS*Math.sin((direction - FOV))],  //right vertex point 
                            ];

        let styleTriangle =  new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgba(255, 0, 0, 0.4)',
              width: 2
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255, 0, 0, 0.2)'
            })
          }); 

        var polygonDirectionFeature = new ol.Feature({
            geometry: new ol.geom.Polygon([pointsFOV])//.transform('EPSG:4326','EPSG:4326'),  
            } );



        // Draw Triangle Vertex
        var vectorLayerTriangleVertex = new ol.layer.Vector({
            source: new ol.source.Vector({ features: [polygonDirectionFeature], 
                                            projection: this.map.getView().projection}),
            style: styleTriangle, 
        });
        this.viewingDirevyionLayer = vectorLayerTriangleVertex; 
        this.map.addLayer(vectorLayerTriangleVertex);
        /* Draw Triangle Vertex
        vectorTriangleDirection = new ol.layer.Vector({
            source: new ol.source.Vector({ features:
                 new ol.Feature({ geometry: new ol.geom.Point(pointsFOV[0])}) }),
            style:  new ol.style.Style({
                image: new ol.style.RegularShape({
                  fill: fill,
                  stroke: stroke,
                  points: 3,
                  radius: 10,
                  rotation:direction,
                  angle: FOV,
                })
            })
    
        });
      */


   

        // Draw Triangle Vertex
        var vectorLayerTriangleVertex = new ol.layer.Vector({
            source: new ol.source.Vector({
                            features: triangleFeats}),
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 2,
                    fill: new ol.style.Fill({ color: 'red' })
                })
            })
        });

        
        this.lastLayerDirection = vectorLayerTriangleVertex;
        this.map.addLayer( this.lastLayerDirection);
    }

}

