"use strict";

import { MAX_FOV, SCALING_MAP, MAP_ZOOM, LON_SCALAR, LAN_SCALAR } from "./ViewerConfig.js";
// Map (2D) Viewer API

// Specific API for the Map View
export class ViewerMapAPI {

    constructor(viewerAPI) {
        this.viewerImageAPI = viewerAPI.image;
        this.viewerFloorAPI = viewerAPI.floor;
        // draw direction 
        this.viewerViewState = viewerAPI.pano.viewerViewState;

        viewerAPI.floor.viewerMapAPI = this; // set reference to mapAPI in floorAPI

        this.baseURL = viewerAPI.baseURL;

        // create Map and Layers
        this.map;
        this.vectorLayer = [];
        this.initDisplayMap();
        this.init = true;
        
        // avoid duplicating
        this.lastVectorLayer;

        // direction
        this.lastLayerDirection = [];

        this.redraw();

        this.viewerAPI = viewerAPI;
        let map = document.getElementById('map');
        map.addEventListener('dblclick', (event) => this.onDoubleClick(event));

        map.addEventListener('fullscreenchange', (event) => {
            // If map set to full screen, hide the floor setting buttons
            hideButtons("floorOL");
        });
        this.control_button();
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

    // Method: Get the scale used by the three.js scene overlayed over the map (2D) view.
    scale() {
        return this.viewerFloorAPI.currentFloor.mapData.density; //  (in meter / pixel)
    }

    initDisplayMap() {
        let currentMapData = this.viewerFloorAPI.floors[this.viewerFloorAPI.currentFloorId].mapData;
        var extent = [0, 0, currentMapData.width / currentMapData.density, currentMapData.height / currentMapData.density];
        //extent = [-0.5*currentMapData.width/ currentMapData.density ,  -0.5*currentMapData.height/ currentMapData.density , 0.5*currentMapData.width/ currentMapData.density , 0.5*currentMapData.height/ currentMapData.density ];
        // create map 
        this.map = new ol.Map({
            target: 'map',
            layers:[new ol.layer.Tile({
                source: new ol.source.OSM()
              })],
            view: new ol.View({
                projection: 'EPSG:4326',
                center: this.viewerFloorAPI.origin, // Update center to current position
                zoom: 20,
                
            }),
            controls: ol.control.defaults({
                // Hide Map rotation button
                rotate: false,
                zoom: false,
                attribution: false
            }),
            //Disable Zoom Control on MAP
            interactions: ol.interaction.defaults({doubleClickZoom :false}),
        });

        // create image layers for each floors 
        for (var i = 0; i < this.viewerFloorAPI.floors.length; i++) {
            let mapData = this.viewerFloorAPI.floors[i].mapData
            let e = new ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326')
            let mapOrigin =   this.viewerFloorAPI.origin
            this.map.addLayer(new ol.layer.Image({
                source: new ol.source.ImageStatic({
                    //attributions: '© <a href="https://github.com/openlayers/openlayers/blob/main/LICENSE.md">OpenLayers</a>',
                    url: this.baseURL + mapData.name + ".png",
                    imageSize: [mapData.width, mapData.height],
                    //imageExtent: new ol.proj.transformExtent([0, 0, mapData.width / mapData.density, mapData.height / mapData.density], 'EPSG:3857', 'EPSG:4326')
                    imageExtent:[e[0]+mapOrigin[0], e[1]+mapOrigin[1], e[2]+mapOrigin[0],e[3]+mapOrigin[1]],
                })

            }))
        }

        this.updateDisplayMap((this.viewerFloorAPI.currentFloorId));

        // create vector layers for each floors
        for (var i = 0; i < this.viewerFloorAPI.floors.length; i++) {
            let allImages = this.viewerFloorAPI.floors[i].viewerImages;

            var features = [];
            //Retrieve information from stored data 
            allImages.forEach(image => {
                // Get Longitude and latitude from each point
                features.push(new ol.Feature({
                    
                    geometry: new ol.geom.Point(  [image.pos[0], image.pos[1]]
                  )}))
            });

            // create the vector layer for black points
            var vectorSource = new ol.source.Vector({
                features: features
            });

            this.vectorLayer.push(new ol.layer.Vector({
                source: vectorSource,
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 3,
                        fill: new ol.style.Fill({ color: 'black' })
                    })
                }),
                projection: 'EPSG:4326'

            }));
        }
    }

    updateDisplayMap(floorIndex) {
        var group = this.map.getLayerGroup();
        var layers = group.getLayers();

        // set layer visibility
        layers.forEach(function (layer, i) {
            // openstreetmap = layer 0

                layer.setVisible(true);

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

        // show current floor black points
        var currentVectorLayer = this.vectorLayer[floorIndex]
        this.map.addLayer(currentVectorLayer);

        //adding red points, using this. for show_direction
        this.posLon = this.viewerImageAPI.currentImage.pos[0];
        this.posLan = this.viewerImageAPI.currentImage.pos[1];

        var redFeature = new ol.Feature({
            geometry: new ol.geom.Point([this.posLon, this.posLan]),
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
            }),
            projection: 'EPSG:4326',
        });

        this.map.addLayer(vectorLayerRed);

        // set view to middle
        this.setMiddle();

        // save last vector layers for deleting next time
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
        var direction = lonov * (Math.PI / 180) % 360;

        // remove prvious vector layers 
        
        this.removeLayer(this.lastLayerDirection);
        this.map.removeLayer(this.viewingDirectionLayer);

        // get direction triangle vertex
        var FOV = this.viewerViewState.fov / 2 * (Math.PI / 180);
        var RADIUS = this.viewerViewState.fov / (MAX_FOV * SCALING_MAP);
        var pointsFOV = [[this.posLon, this.posLan],
        [this.posLon + RADIUS * 0.000005 * Math.cos((direction + FOV)), this.posLan + RADIUS * 0.000005* Math.sin((direction + FOV))],  //left  vertex point 
        [this.posLon + RADIUS * 0.000005* Math.cos((direction - FOV)), this.posLan + RADIUS * 0.000005* Math.sin((direction - FOV))],  //right vertex point 
        ];

        var triangleFeats = [];
        for (var i = 0; i < pointsFOV.length; i++) {
            triangleFeats.push(new ol.Feature({ 
                geometry: new ol.geom.Point(pointsFOV[i])}));
        }
        
        // Draw Triangle Vertex
        var vectorLayerTriangleVertex = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: triangleFeats
            }),
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 1,
                    fill: new ol.style.Fill({ color: 'red' })
                })
            })
        });

        this.lastLayerDirection = vectorLayerTriangleVertex;

        // Draw Triangle Polygon
        let styleTriangle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(255, 0, 0, 0.4)',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 0, 0, 0.2)'
            })
        });

        var pointsFOV_project =[[this.posLon, this.posLan],
        [this.posLon + RADIUS * 0.000005 * Math.cos((direction + FOV)), this.posLan + RADIUS * 0.000005* Math.sin((direction + FOV))],  //left  vertex point 
        [this.posLon + RADIUS * 0.000005* Math.cos((direction - FOV)), this.posLan + RADIUS * 0.000005* Math.sin((direction - FOV))],  //right vertex point 
        ];

        var polygonDirectionFeature = new ol.Feature({
            geometry: new ol.geom.Polygon([pointsFOV_project])
        });

        var vectorLayerTrianglePolygon = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [polygonDirectionFeature],
                projection: this.map.getView().projection
            }),
            style: styleTriangle,
        });

        this.viewingDirectionLayer = vectorLayerTrianglePolygon;
        this.addLayer(this.viewingDirectionLayer);
    }

    getLonLanCoordinates(position, mapdata){
        // Compute the latitude and longitude  in reference to the origin in WGS84 and aff offset of the map 
        let lon = LON_SCALAR * 1000 *  (position[0] - this.viewerFloorAPI.origin[0]) + (mapdata.x / mapdata.density);
        let lan = LAN_SCALAR * 1000 * (position[1] - this.viewerFloorAPI.origin[1]) + (mapdata.y / mapdata.density);
        return [lon, lan]; 
    }

    onDoubleClick(event) {

        var coord = [];
        // var mousePosition = [];
        var mapdata = this.viewerFloorAPI.floors[this.viewerFloorAPI.currentFloorId].mapData;
        var floor = this.viewerFloorAPI;
        var z = this.viewerFloorAPI.floors[this.viewerFloorAPI.currentFloorId].z;
        var cuttentId = this.viewerFloorAPI.currentFloorId;
        var viewerAPI = this.viewerAPI;
        
        this.map.on('dblclick', function (event) {
            coord = event.coordinate;
            
            let allImages = floor.floors[cuttentId].viewerImages;
            var minDistance = 1000
            var bestImg;

            allImages.forEach(image => {
                
                var currLocalPos = ol.proj.transform([image.pos[0], image.pos[1]], 'EPSG:3857', 'EPSG:4326');
                const [dx, dy] = [coord[0] - currLocalPos[0], coord[1] - currLocalPos[1]];
                const currDistance = Math.sqrt(dx * dx + dy * dy);
                if (currDistance < minDistance) {
                    minDistance = currDistance;
                    bestImg = image;
                }
            });

            // move 
            viewerAPI.move(bestImg.pos[0], bestImg.pos[1], z);
        });

        viewerAPI.propagateEvent("moved", viewerAPI.image.currentImage.id, true);
    }

    setMiddle() {
        this.map.getView().setCenter([this.posLon, this.posLan]);
    }

    control_button(){
        var zoom_in = document.getElementById('zoom-in');
        var zoom_out = document.getElementById('zoom-out');
        var full_screen = document.getElementById('full-screen');
        var close_full_screen = document.getElementById('close-full-screen');
        var map = this.map;
        close_full_screen.style.display = "none";

        zoom_in.addEventListener('click', function () {
            var view = map.getView();
			var zoom = view.getZoom();
			view.setZoom(zoom + 1);
        })

        zoom_out.addEventListener('click', function () {
            var view = map.getView();
			var zoom = view.getZoom();
            view.setZoom(zoom - 1);
        })

        full_screen.addEventListener('click', function () {
            var elem = document.getElementById('map');
            elem.requestFullscreen();
            full_screen.style.display = "none"; //hide.
            close_full_screen.style.display = "";
        })

        close_full_screen.addEventListener('click', function () {
            document.getElementById('map');
            document.exitFullscreen();
            close_full_screen.style.display = "none";
            full_screen.style.display = "";
        })

        // attemp 1
        // document.addEventListener("keydown", event => {
        //     if (event.code == 'Escape') {
        //         console.log(event.code)
        //         close_full_screen.style.display = "none";
        //         full_screen.style.display = "";
        //     }
        // })

        // attemp 2
        // if (document.fullscreen == false){
            //     close_full_screen.style.display = "none";
            //     full_screen.style.display = "";
            // }
    }
}

function hideButtons(divId) {
    //let divId = "floorOL"; 
    var element = document.getElementById(divId); 
    
    /* Toggle to hide HTML div */
    if (element.style.display === "none") {
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
}
