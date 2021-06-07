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

        this.spriteGroup = new THREE.Group(); //create an sprite group
        this.mapScalingFactor = 0.2;

        this.baseURL = viewerAPI.baseURL;

        // create Map and Layers
        this.map;
        
        this.initDisplayMap();
        this.updateDisplayMap(this.viewerFloorAPI.currentFloorId);
        this.features = [];
        this.lastVectorLayer;
        this.lastFloorID;
        this.viewerAPI = viewerAPI;
        this.test_current_position();
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
        
        // remove prvious last vector layer 
        this.map.removeLayer(this.lastVectorLayer);

        // this.spriteGroup.clear();
        
        // remove comment to draw all points on map
        let allImages = this.viewerFloorAPI.currentFloor.viewerImages;
   
        allImages.forEach(image => {
            // this.addPoint("black", image.mapOffset);

            // add all black points to feature layer 
            // transform xy to lon lan
            var lon = this.viewerAPI.floor.origin[0] - (-this.mapScalingFactor * image.mapOffset[0] / 71.5); 
            var lan = this.viewerAPI.floor.origin[1] - (this.mapScalingFactor * image.mapOffset[1] / 111.3);
            this.features.push(new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([
                lon, lan
                ]))
            })
            )
        });
        
        
        // add current red point to feature layer
        // this.addPointOL("red", this.viewerImageAPI.currentImage.mapOffset);

        // this.location = this.addPoint("red", this.viewerImageAPI.currentImage.mapOffset);
        // this.addViewingDirection("yellow",  this.viewerImageAPI.currentImage.mapOffset);

        // create the layer for features -> black points
        const features = this.features;
        
        var vectorSource = new ol.source.Vector({
            features
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

        this.lastFloorID = this.viewerFloorAPI.currentFloorId;
        this.lastVectorLayer = vectorLayer;
        
        var floorIndex = this.viewerFloorAPI.currentFloorId;
        this.updateDisplayMap(floorIndex);

    }

    /* draws a point in *color* on the map at *offset*, also returns the THREE.Sprite after it is drawn
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
    }*/
    
    // Method
    scale() {
        //Get the scale used by the three.js scene overlayed over the map (2D) view.
        return this.viewerFloorAPI.currentFloor.mapData.density; //  (in meter / pixel)
    }
    
    /*addViewingDirection(color, position){
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

    }*/

    test_current_position(){

        const features = [];
        const featureRed= [];

        let allImages = this.viewerFloorAPI.currentFloor.viewerImages;
        
        // adding black points
        allImages.forEach(image => {

            // add all black points to feature layer 
            // transform xy to lon lan
            var lon = this.viewerAPI.floor.origin[0] - (-this.mapScalingFactor * image.mapOffset[0] / 71.5); 
            var lan = this.viewerAPI.floor.origin[1] - (this.mapScalingFactor * image.mapOffset[1] / 111.3);
            features.push(new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([
                lon, lan
                ]))
            })
            )
            // console.log(lon,lan)
        });

        //adding red points
        var redlon = this.viewerAPI.floor.origin[0] - (-this.mapScalingFactor * this.viewerImageAPI.currentImage.mapOffset[0] / 71.5); 
        var redlan = this.viewerAPI.floor.origin[1] - (this.mapScalingFactor * this.viewerImageAPI.currentImage.mapOffset[1] / 111.3);
        
        featureRed.push(new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([
            redlon, redlan
            ]))
        }))

        // console.log("red point")
        console.log(redlon,redlan)
        
        // create the source and layer for balck points
        const vectorSource = new ol.source.Vector({
            features
        });
        const vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 2,
                fill: new ol.style.Fill({color: 'black'})
            })
            })
        });

        // create the source and layer for red point
        const vectorSourceRed = new ol.source.Vector({
            featureRed
        });
        const vectorRedLayer = new ol.layer.Vector({
            source: vectorSourceRed,
            style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 3,
                fill: new ol.style.Fill({color: 'red'})
            })
            })
        });

        // create map and add layers
        /*
        const map = new ol.Map({
            target: 'map',
            layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            vectorLayer,
            vectorRedLayer
            ],
            view: new ol.View({
            center: ol.proj.fromLonLat([0, 0]),
            zoom: 2
            }),
            controls: ol.control.defaults().extend([
                new ol.control.FullScreen(),
                new ol.control.MousePosition({
                    coordinateFormat: ol.coordinate.createStringXY(4),
                    projection: 'EPSG:4326', // wgs 48
                    className: 'custom-mouse-position-testmap',
                    target: document.getElementById('mouse-position-testmap')
                })
              ])
        });
    */
    }


    initDisplayMap(){

        // test create button 1

        // buttonUp = document.createElement('buttonUp');
        // var handleButtonUp = function (e) {}
        // buttonUp.addEventListener('click', handleButtonUp, false);

        // creat elements
        // var element = document.createElement("div")
        // element.className = 'control';
        // element.id = 'floor';
        // document.getElementById('pano-viewer').appendChild(element);
        // element.appendChild(buttonUp);

        // var myControl = new ol.control.Control({
        //     className: 'myControl',
        //     element: element,
        // });

        // test create button 2

        /* CSS:
        #custom_anchor:before {
            content:"Cycle";
            left : 10%;
            bottom: 20%;
            z-index: -50;
        }
        */
        
        // var myControl = new ol.control.Control({
        //     className: 'myControl',
        //     element: document.getElementById('floorOL'),
        // });

        // // online -  create buttons example 1
        // var button = document.createElement('button');
        // button.innerHTML = '<i class="fa fa-home"></i>';

        // var handleRotateNorth = function(e) {
        //     map.getView().setRotation(180);
        // };

        // button.addEventListener('click', handleRotateNorth, false);

        // var element = document.createElement('div');
        // element.className = 'rotate-north-ol-control';
        // element.appendChild(button);

        // // online - create button example 2
        // var anchor_element = document.createElement('a');
        // anchor_element.href = '#custom_href';
        // anchor_element.className = 'custom_anchor';
    
        // var this_ = this;
        // var handleCustomControl = function (e) {
        //     myControl.customFunction(e);
        // };
    
        // anchor_element.addEventListener('click', handleCustomControl, false);
        // anchor_element.addEventListener('touchstart', handleCustomControl, false);
    
        // var custom_element = document.createElement('div');
        // custom_element.className = 'myCustomControl ol-unselectable';
        // document.getElementById('pano-viewer').appendChild(custom_element);
        // custom_element.appendChild(anchor_element);
    
        // var myControl = new ol.control.Control({
        //     className: 'myControl',
        //     element: custom_element,
        //     target: document.getElementById("myCustomControl")
        // });

        // current version of test create button
        /*
        var button = function() {
            var this_ = this;

            ol.control.Control.call(this, {
                element: document.getElementById('floorOL'),
              });
            };
    
        var ol_ext_inherits = function(child,parent) {
            child.prototype = Object.create(parent.prototype);
            child.prototype.constructor = child;
            };
        ol.inherits(button, ol.control.Control);

        // create contorls for map 
        var controls = ol.control.defaults({
            rotate: false // hide rotation button
        //})
        }).extend([
            new button
            // myControl

            // new ol.control.Control({
            //   element:element
            // })
          ])
        */

        var extent = [0, 0, 512, 512];

        //  Projection map image coordinates directly to map coordinates in pixels. 
        var projection = new ol.proj.Projection({
        code: 'map-image',
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
                maxZoom: 5,
            }),
            // controls: controls,
            controls: ol.control.defaults({
                rotate: false // hide rotation button
            }).extend([
                new ol.control.FullScreen(), // create fullScreen button
                new ol.control.MousePosition({ // create the function of showing current mouse position
                    coordinateFormat: ol.coordinate.createStringXY(4),
                    projection: 'EPSG:4326', // wgs 48
                    className: 'custom-mouse-position',
                    target: document.getElementById('mouse-position')
                })
              ])
            });
        
        // create image layers for each floors 
        for (var i =0; i < this.viewerFloorAPI.floors.length; i++){
            this.map.addLayer(new ol.layer.Image({
                source: new ol.source.ImageStatic({
                    //attributions: '© <a href="https://github.com/openlayers/openlayers/blob/main/LICENSE.md">OpenLayers</a>',
                    url: this.baseURL + this.viewerFloorAPI.floors[i].mapData.name + ".png",
                    projection: projection,
                    imageExtent: extent,
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
            if (i == layers.length){ // showing black and red points
                layer.setVisible(true);
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