"use strict";

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
<<<<<<< Updated upstream
=======

        // direction
        this.lastvectorLayerdes = [];
        this.lastvectorLayerLeftRight = [];

        this.redraw();
        this.init = false;



>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
    // Method : Schedule a redraw of the three.js scene overlayed over the map (2D) view.
    redraw() {
        
        var features = [];
        // for avoid duplicating
        if (this.viewerFloorAPI.currentFloorId != this.lastFloorID){

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
            
            console.log("Position in WGS84: ", image.pos)
            var lon = (image.mapOffset[0]+this.viewerFloorAPI.floors[floorIndex].mapData.x); 
            var lan = (image.mapOffset[1]- this.viewerFloorAPI.floors[floorIndex].mapData.y); // this.viewerAPI.floor.origin[1] - image.mapOffset[1];
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
            let rotationLonov = 0; // TODO: Change to get LONOV in radians
            var orientationRedStyle = new ol.style.Style({
                image: new ol.style.RegularShape({
                  fill: new ol.style.Fill({color: 'red'}), //new Fill({  color: 'rgba(255, 0, 0, 0.2)'     }),
                  stroke: new ol.style.Stroke({color: 'black', width: 2}),
                  points: 3,
                  radius: 10,
                  rotation: rotationLonov, 
                  angle: 0
                })
              }),
            

            //vectorLayerRed.setStyle(style);
            // Example to  
            //orientationRedStyle.setRotation(Math.PI / 180 * heading);

            // save last vector layers for deleting 
            this.lastFloorID = this.viewerFloorAPI.currentFloorId;
            this.lastVectorLayer = vectorLayer;
            this.lastVectorLayerRed = vectorLayerRed;
        }
    }
    
=======
>>>>>>> Stashed changes
    // Method
    scale() {
        //Get the scale used by the three.js scene overlayed over the map (2D) view.
        return this.viewerFloorAPI.currentFloor.mapData.density; //  (in meter / pixel)
    }
<<<<<<< Updated upstream

=======


    initDisplayMap() {

        let currentMapData = this.viewerFloorAPI.floors[this.viewerFloorAPI.currentFloorId].mapData;
        var extent = [0, 0, currentMapData.width / currentMapData.density, currentMapData.height / currentMapData.density];

        // create map 
        this.map = new ol.Map({  //new ol.control.OverviewMap({
            target: 'map',
            view: new ol.View({
                projection: new ol.proj.Projection({
                    extent: extent
                }),
                center: new ol.extent.getCenter(extent),
                zoom: 1,
                maxZoom: 4,
            }),
            // controls: controls,
            controls: ol.control.defaults({
                rotate: false // hide rotation button
            }).extend([
                new ol.control.FullScreen(), // create fullScreen button
                new ol.control.ZoomSlider(),
                // new ol.control.MousePosition({
                //     coordinateFormat: ol.coordinate.createStringXY(4),
                //     projection: new ol.proj.Projection({ 
                //         extent: extent
                //      }),
                //     className: 'custom-mouse-position-testmap',
                //     target: document.getElementById('mouse-position-testmap')
                // })
            ])
        });

        /*
        // testing map origin and center in lon, lan 
        // -> can not push to list
        for (var i =0; i < this.viewerFloorAPI.floors.length; i++){
>>>>>>> Stashed changes

            // calculate map origin in lon,lan
            var current_MapData = this.viewerFloorAPI.floors[i].mapData; 
            console.log("cuttent_MapData:"+current_MapData);
            var mapdata_X_in_meter = (current_MapData.x / current_MapData.density);
            console.log("current_MapData.X:"+current_MapData.x);
            console.log("current_MapData.density:"+current_MapData.density);
            console.log("mapdata_X_in_meter:"+mapdata_X_in_meter);
            var mapdata_X_in_lon = mapdata_X_in_meter/87000; // temporary a degree of longitude, one degree east or west at lan -37.80299558787142 degree => 87000m
            console.log("mapdata_X_in_lon:"+mapdata_X_in_lon);
            var mapdata_origin_lon = this.viewerFloorAPI.origin[0] - mapdata_X_in_lon; 
            console.log("this.viewerFloorAPI.origin[0]:"+this.viewerFloorAPI.origin[0]);
            console.log("mapdata_X_in_lon:"+mapdata_X_in_lon);
            console.log("mapdata_origin_lon:"+mapdata_origin_lon);

            var mapdata_Y_in_meter = (current_MapData.y / current_MapData.density);
            console.log("current_MapData.Y:"+current_MapData.y);
            console.log("current_MapData.density:"+current_MapData.density);
            console.log("mapdata_Y_in_meter:"+mapdata_Y_in_meter);
            var mapdata_Y_in_lan = mapdata_Y_in_meter/111000; // temporary a degree of latitude, one degree north or south, is about the same distance anywhere, about 111000m
            console.log(" mapdata_Y_in_lan:"+ mapdata_Y_in_lan);
            var mapdata_origin_lan = this.viewerFloorAPI.origin[1] - mapdata_Y_in_lan;
            console.log("this.viewerFloorAPI.origin[1]:"+this.viewerFloorAPI.origin[1]);
            console.log("mapdata_Y_in_lan:"+ mapdata_Y_in_lan);
            console.log("mapdata_origin_lan:"+mapdata_origin_lan);
            
            // calculate map center in lon,lan
            var mapdata_center_lon = mapdata_origin_lon + (1/2)*(current_MapData.width/current_MapData.density);
            var mapdata_center_lan = mapdata_origin_lan + (1/2)*(current_MapData.height/current_MapData.density);
            console.log("mapdata_origin_lon:"+mapdata_origin_lon);
            console.log("current_MapData.width:"+current_MapData.width);
            console.log("current_MapData.density:"+current_MapData.density);
            console.log("mapdata_origin_lan:"+mapdata_origin_lan);
            console.log("current_MapData.height:"+current_MapData.height);
            console.log("current_MapData.density:"+current_MapData.density);
            console.log("mapdata_center_lon:" + mapdata_center_lon);
            console.log("mapdata_center_lan"+mapdata_center_lan);

            console.log("type of mapdata_origin_lon:"+(typeof mapdata_origin_lon));
            console.log("type of mapdata_origin_lan:"+(typeof mapdata_origin_lan));
            console.log("type of mapdata_center_lon:"+ typeof(mapdata_center_lon));
            console.log("type of mapdata_center_lan:"+ typeof(mapdata_center_lan));

            this.mapdataOriginLon.push(mapdata_origin_lon.toFixed(14));
            this.mapdataOriginLan.push(mapdata_origin_lan.toFixed(14));
            this.mapdataCenterLon.push(mapdata_center_lon.toFixed(14));
            this.mapdataCenterLan.push(mapdata_center_lan.toFixed(14));
        }
        */

<<<<<<< Updated upstream
        let  currentMapData = this.viewerFloorAPI.floors[this.viewerFloorAPI.currentFloorId].mapData; 
        var extent = [0, 0, currentMapData.width, currentMapData.height];

        //  Projection map image coordinates directly to map coordinates in pixels. 
        var projection = new ol.proj.Projection({
        code: 'image',
        units: 'pixels',
        extent: extent,
        });

        // [X, Y] coordinate corresponding to "lon0" in floor map image (in pixels)
        let centerMap = [currentMapData.x, currentMapData.y]; 
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
            let projImage = new ol.proj.Projection({
                code: 'image',
                units: 'pixels',
                extent: e,
                }); 
            this.map.addLayer(new ol.layer.Image({
                source: new ol.source.ImageStatic({
                    //attributions: '© <a href="https://github.com/openlayers/openlayers/blob/main/LICENSE.md">OpenLayers</a>',
                    url: this.baseURL +  mapData.name + ".png",
                    projection: projImage, 
                    /*
                    projection: new ol.proj.Projection({
                        code: 'image',
                        units: 'pixels',
                        extent: e,
                        }),
                    */
                        imageExtent:e,
                })

            }))
=======
        // converting map pixel to lon, lan
        // calculate map origin in lon,lan
        var current_MapData0 = this.viewerFloorAPI.floors[0].mapData;

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
                    imageExtent: extent,
                })
            }))
        }

        this.updateDisplayMap((this.viewerFloorAPI.currentFloorId));

        // create vector layers for each floors
        for (var i = 0; i < this.viewerFloorAPI.floors.length; i++) {
            let allImages = this.viewerFloorAPI.floors[i].viewerImages;
            //console.log("allImages: " + allImages);
            var currentMapdata = this.viewerFloorAPI.floors[i].mapData;

            //Modification of the Map data for the 4th floor
            if (i === 1) {
                currentMapdata.x = currentMapdata.x - 200;
                currentMapdata.y = currentMapdata.y - 70;
                currentMapdata.density = currentMapdata.density;
            }

            var features = [];

            allImages.forEach(image => {
                //if its in the 4th floor,add some offset:
                if (i === 1) {
                    var lon = 67000 * (image.pos[0] - this.viewerFloorAPI.origin[0]) + (currentMapdata.x / currentMapdata.density);
                    var lan = 107000 * (image.pos[1] - this.viewerFloorAPI.origin[1]) + (currentMapdata.y / currentMapdata.density);
                }
                else {
                    // add all black points to feature layer 
                    var lon = 87000 * (image.pos[0] - this.viewerFloorAPI.origin[0]) + (currentMapdata.x / currentMapdata.density);
                    var lan = 111000 * (image.pos[1] - this.viewerFloorAPI.origin[1]) + (currentMapdata.y / currentMapdata.density);

                }

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
                        radius: 2,
                        fill: new ol.style.Fill({ color: 'black' })
                    })
                })
            }));
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            });
=======
        });
>>>>>>> Stashed changes
    }

    // Method : Schedule a redraw of the three.js scene overlayed over the map (2D) view.
    redraw() {
        console.log("call redraw")

        if (this.init != true) {
            // // remove prvious vector layers 
            this.map.removeLayer(this.lastVectorLayerRed);
            this.map.removeLayer(this.lastVectorLayer);
        }

        // show layer map
        this.updateDisplayMap(this.viewerFloorAPI.currentFloorId);

        var floorIndex = this.viewerFloorAPI.currentFloorId;
        var currentMapdata = this.viewerFloorAPI.currentFloor.mapData;
        console.log("--------For Red point-------------");
        console.log("floorIndex: " + floorIndex);
        console.log("currentMapdata.x: " + currentMapdata.x);
        console.log("currentMapdata.y " + currentMapdata.y);
        console.log("currentMapdata.density: " + currentMapdata.density);
        console.log("-----------------------------------");

        // show current floor black points
        var currentVectorLayer = this.vectorLayer[floorIndex]
        this.map.addLayer(currentVectorLayer);

        if (floorIndex === 1) {

            //add some offset if it is on 4th floor:
            this.redlon = 67000 * (this.viewerImageAPI.currentImage.pos[0] - this.viewerFloorAPI.origin[0]) + (currentMapdata.x / currentMapdata.density);
            this.redlan = 107000 * (this.viewerImageAPI.currentImage.pos[1] - this.viewerFloorAPI.origin[1]) + (currentMapdata.y / currentMapdata.density);

        }
        else {
            //adding red points, using this. for show_direction
            this.redlon = 87000 * (this.viewerImageAPI.currentImage.pos[0] - this.viewerFloorAPI.origin[0]) + (currentMapdata.x / currentMapdata.density);
            this.redlan = 111000 * (this.viewerImageAPI.currentImage.pos[1] - this.viewerFloorAPI.origin[1]) + (currentMapdata.y / currentMapdata.density);

        }

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
                    radius: 5,
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

        // get direction in degree
        var direction_lon = this.viewerViewState.lonov;

        // temporary using 170 degree for correcting the starting zero degree of 2D map
        var correct_direction = 170; // degree 
        var direction = -direction_lon - correct_direction;

        if (this.init != true) {
            //this.map.removeLayer(this.lastvectorLayerdes);
            this.map.removeLayer(this.lastvectorLayerLeftRight);
        }

        // x coordinate of destination point : add cos(to radians)
        var redlondes = this.redlon + Math.cos(direction * (Math.PI / 180))
        // y coordinate of destination point : add sin(to radians)
        var redlandes = this.redlan + Math.sin(direction * (Math.PI / 180))

        // draw a point of current direction destination
        var desFeature = new ol.Feature({
            geometry: new ol.geom.Point([redlondes, redlandes]),
        });
        
        /*
        var vectorSourcedes = new ol.source.Vector({
            features: [desFeature]
        });
       
        var vectorLayerdes = new ol.layer.Vector({
            source: vectorSourcedes,
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 3,
                    fill: new ol.style.Fill({ color: 'blue' })
                })
            })
        });
    

        this.map.addLayer(vectorLayerdes);
        */
        // draw triangle
        var FOV = this.viewerViewState.fov/2; 

        var left_redlondes = this.redlon + Math.cos((direction + FOV) * (Math.PI / 180))
        var left_redlandes = this.redlan + Math.sin((direction + FOV) * (Math.PI / 180))
        var right_redlondes = this.redlon + Math.cos((direction - FOV) * (Math.PI / 180))
        var right_redlandes = this.redlan + Math.sin((direction - FOV) * (Math.PI / 180))

        
        var triangleFeatures =  new ol.Feature({
                geometry: new ol.geom.LineString([ new ol.geom.Point([this.redlon, this.redlan]), new ol.geom.Point([left_redlondes, left_redlandes]) ]),
                style : new ol.style.Style({   stroke : new ol.style.Stroke({color : "red", width: 3 }) }),
        });
        
        var vectorTriangleDirection = new ol.layer.Vector({ 
            features: [triangleFeatures],
        });

        this.map.addLayer(vectorTriangleDirection);
        
        var leftFeature = new ol.Feature({
            geometry: new ol.geom.Point([left_redlondes, left_redlandes]),
        });

        var rightFeature = new ol.Feature({
            geometry: new ol.geom.Point([right_redlondes, right_redlandes]),
        });

        var vectorSourceLeftRight = new ol.source.Vector({
            features: [leftFeature, rightFeature]
        });

        var vectorLayerLeftRight = new ol.layer.Vector({
            source: vectorSourceLeftRight,
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 1,
                    fill: new ol.style.Fill({ color: 'orange' })
                })
            })
        });

        this.map.addLayer(vectorLayerLeftRight);

        //this.lastvectorLayerdes = vectorLayerdes;
        this.lastvectorLayerLeftRight = vectorLayerLeftRight;
    }

}
