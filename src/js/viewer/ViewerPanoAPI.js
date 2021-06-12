"use strict";

import { ViewerViewState } from "./ViewerViewState.js";
import { DEFAULT_FOV, MAX_FOV, MIN_FOV, ZOOM_SPEED, PAN_SPEED } from "./ViewerConfig.js";
import { EventLayer } from "./EventLayer.js";
import { EventPosition } from "./EventPosition.js";

export class ViewerPanoAPI {

    constructor(viewerAPI) {
        this.scene = new THREE.Scene(); // three.js scene used by the panorama (3D) viewer
        this.camera = new THREE.PerspectiveCamera(DEFAULT_FOV, window.innerWidth / window.innerHeight, 1, 1100);
        this.viewerImageAPI = viewerAPI.image;
        this.viewerAPI = viewerAPI;
        this.sphereRadius = 10;

        this.viewerViewState = new ViewerViewState(DEFAULT_FOV, 0, 0);
        this.lastViewState;
        this.lastMousePos;

        //initialize the eventLayer
        this.eventLayer = new EventLayer();

        // properties needed for display and depthAtPointer method
        this.loadedMesh = null;
        this.depthCanvas = document.createElement("canvas");

        // Two new event listeneres are called to handle *how far* the user drags
        this.oPM = (event) => this.onPointerMove(event);
        this.oPU = () => this.onPointerUp();

        document.addEventListener('wheel', (event) => this.onDocumentMouseWheel(event));
        document.addEventListener('pointerdown', (event) => this.onPointerDown(event));
        document.addEventListener('dblclick', (event) => this.onDoubleClick(event));
        $('#pano-viewer').mousedown((event) => this.onRightClick(event));

        this.display(this.viewerImageAPI.currentImageId);
    }

    // displays the panorama with idx *ImageNum* in the model
    display(imageNum) {
        this.viewerImageAPI.currentImageId = imageNum;

        // create sphere
        const sphere = new THREE.SphereGeometry(this.sphereRadius, 60, 40);
        // invert the geometry on the x-axis so that we look out from the middle of the sphere
        sphere.scale(-1, 1, 1);

        // load the 360-panorama image data (highest resolution hardcoded for now)
        const texturePano = this.viewerAPI.textureLoader.load(
            this.viewerAPI.baseURL +
            Math.trunc(imageNum / 100) +
            '/' +
            imageNum +
            'r3.jpg');
        texturePano.mapping = THREE.EquirectangularReflectionMapping; // not sure if this line matters

        // also load depth-map for panorama
        const image = new Image();

        //image.crossOrigin = "use-credentials";
        image.src = this.viewerAPI.baseURL +
                    Math.trunc(this.viewerImageAPI.currentImage.id / 100) + '/' +
                    this.viewerImageAPI.currentImage.id + 'd.png';
        
        image.addEventListener('load', () => {
            this.depthCanvas.getContext("2d").drawImage(image, 0, 0);
        }, false);

        // put the texture on the spehere and add it to the scene
        const mesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ map: texturePano }));
        
        // adjust for orientation offset
        mesh.applyQuaternion(this.viewerImageAPI.currentImage.orientation);
        
        // put in the correct position in the scene
        const localCoord = this.viewerAPI.toLocal(this.viewerImageAPI.currentImage.pos);
        mesh.position.set(localCoord.x, localCoord.y, localCoord.z);

        // check if other panorama was previously already loaded
        if (this.loadedMesh != null) {
            this.scene.remove(this.loadedMesh);
        }

        this.scene.add(mesh);
        this.loadedMesh = mesh;
        
        // put camera inside sphere mesh
        this.camera.position.set(localCoord.x, localCoord.y, localCoord.z);
    }

    camera() {
        return this.camera;
    }

    // Set the panorama view characteristics.
    view(lonov, latov, fov) {
        const normalizedViewingDirection = lonLatToLocal(lonov, latov);

        // adjust looking direction for offset of current mesh in scene
        const localCoord = this.viewerAPI.toLocal(this.viewerImageAPI.currentImage.pos);

        this.camera.lookAt(localCoord.add(normalizedViewingDirection));

        this.camera.fov = THREE.MathUtils.clamp(fov, MIN_FOV, MAX_FOV);

        this.camera.updateProjectionMatrix();
    }


    // ----- Event handling functions for panning, zooming and moving -----
    onPointerDown(event) {
        this.lastMousePos = [event.clientX, event.clientY];

        this.lastViewState = [this.viewerViewState.lonov, this.viewerViewState.latov];

        document.addEventListener('pointermove', this.oPM);
        document.addEventListener('pointerup', this.oPU);
        
        this.visualTest(event);
    }

    // handles continues update of the distance mouse moved
    onPointerMove(event) {
        let scalingFactor = this.camera.fov / MAX_FOV;
    
        this.viewerViewState.setLonov((this.lastMousePos[0] - event.clientX) * PAN_SPEED * scalingFactor + this.lastViewState[0]);
        this.viewerViewState.setLatov((event.clientY - this.lastMousePos[1]) * PAN_SPEED * scalingFactor + this.lastViewState[1]);
    }

    // this event listener is called when the user *ends* moving the picture
    onPointerUp() {
        document.removeEventListener('pointermove', this.oPM);
        document.removeEventListener('pointerup', this.oPU);

        this.viewerAPI.propagateEvent("viewed", this.viewerViewState, true);
    }

    onDocumentMouseWheel(event) {
        this.viewerViewState.fov = this.camera.fov + event.deltaY * ZOOM_SPEED;
    
        this.view(this.viewerViewState.lonov, this.viewerViewState.latov, this.viewerViewState.fov);
        this.camera.updateProjectionMatrix();

        this.viewerAPI.propagateEvent("viewed", this.viewerViewState, true);
    }

    onDoubleClick(event) {
        const [adjustedLonov, adjustedLatov] = this.getAdjustedViewstate(event);
        const MEDIAN_WALKING_DISTANCE = 5; // in meter
        // distance to be walked along adjustedHorizontalAngle from current location
        const distance = MEDIAN_WALKING_DISTANCE + ((adjustedLatov / 85) * MEDIAN_WALKING_DISTANCE);

        // convertedAngle converted to represent directions like specified in newLocationFromPointAngle
        const convertedAngle = (adjustedLonov < 180) ? -adjustedLonov : 360 - adjustedLonov;
        
        const currentPos = this.viewerImageAPI.currentImage.pos;
        
        const newPos = newLocationFromPointAngle(currentPos[0], currentPos[1], THREE.Math.degToRad(convertedAngle), distance);
        this.viewerAPI.move(newPos[0], newPos[1], currentPos[2]);

        this.viewerAPI.propagateEvent("moved", this.viewerImageAPI.currentImage.id, true);
    }

    onRightClick(event) {
        //if right mouse is clicked:
        if (event.which == 3) {

            //get the current pointer position:
            const xy = new EventPosition(event);

            //get the viewing direction:
            const location = this.camera.getWorldDirection();

            //Set up the context menu:
            $.contextMenu({
                selector: '#pano-viewer',
                items: this.eventLayer.vwr_oncontext(xy, location),
            });
        }
    }

    // returns: the depth information (in meter) of the panorama at the current curser position (event.x, event.y)
    depthAtPointer(event) {
        const [adjustedLonov, adjustedLatov] = this.getAdjustedViewstate(event);

        // because depth map is not rotated by quaternion like panorama mesh, the quaternion adjustment need to happen first
        const localPos = lonLatToLocal(adjustedLonov, adjustedLatov);
        const adjustedQuaternion = localPos.applyQuaternion(this.viewerImageAPI.currentImage.orientation);
        const [realLonov, realLatov] = localToLonLat(adjustedQuaternion);
        console.log("lonov",adjustedLonov, realLonov);
        console.log("latov",adjustedLatov, realLatov);
        // pixel offsets in depth map at current curser position
        const pixelX = Math.trunc((realLonov / 360) * this.depthCanvas.width);
        const pixelY = Math.trunc((realLatov + 90) / 180 * this.depthCanvas.height);
        
        const offsetX = (pixelX >= 2) ? pixelX - 2 : 0;
        const offsetY = (pixelY >= 2) ? pixelY - 2 : 0;

        // convert pixel value to depth information (use 5x5 pixels around cursor)
        const imgData = this.depthCanvas.getContext("2d").getImageData(offsetX, offsetY, 5, 5);
        const [red, green, blue, alpha] = averagePixelValues(imgData.data);

        // LSB red -> green -> blue MSB (ignore alpha)
        const distanceMM = red | (green << 8) | (blue << 16);

        // convert from millimeter to meter
        return distanceMM / 1000;
    }

    // returns the current location of the cursor in the three js scene (Vector3)
    getCursorLocation(event) {
        // param: event.x event.y current cursor position on screen
        const [adjustedLonov, adjustedLatov] = this.getAdjustedViewstate(event);
        const normalizedLocalViewingDir = lonLatToLocal(adjustedLonov, adjustedLatov);
        
        // adjust looking direction for offset of current mesh in scene
        const localCoord = this.viewerAPI.toLocal(this.viewerImageAPI.currentImage.pos);

        // get distance und extend viewing direction vector by distance
        const dist = this.depthAtPointer(event);

        localCoord.addScaledVector(normalizedLocalViewingDir, dist)

        return localCoord;
    }

    // returns [lonov, latov] at the current cursor position
    getAdjustedViewstate(event) {
        // find correct pixel position on equilateral projected depth map
        const halfWidth = window.innerWidth / 2;
        const halfHeight = window.innerHeight / 2;

        // horizontal (lonov) : image left -> 0, image right -> 360
        // vertical (latov) : image top -> 85, image bottom -> -85
        const horizontalOffset = (event.x - halfWidth) / halfWidth; // scaled between [-1,1] depending how left-right the mouse click is on the screen
        const verticalOffset = (halfHeight - event.y) / halfHeight; // scaled between [-1,1] depending how up-down the mouse click is on the screen
        
        const adjustedLonov = ((this.viewerViewState.lonov + (horizontalOffset * this.viewerViewState.fov / 2)) + 360) % 360;
        const adjustedLatov = Math.max(-85, Math.min(85, this.viewerViewState.latov + (verticalOffset * this.viewerViewState.fov / 2)));
        
        return [adjustedLonov, adjustedLatov];
    }

    visualTest(event) {
        // visual test, spawn in white sphere at cursor position in scene
        const direction = this.getCursorLocation(event);
        const sphere = new THREE.SphereGeometry(1 / this.depthAtPointer(event), 10, 10);
        const mesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial());
        mesh.position.set(direction.x, direction.y, direction.z);
        
        if (this.testMesh != null) {
            this.scene.remove(this.testMesh);
        }

        this.scene.add(mesh);
        
        this.testMesh = mesh;
    }

}

// takes in a location (in lot/lat), a direction (as a *angle*[rad, in birds eye view), and a distance (in meters) to move in the direction
function newLocationFromPointAngle(lon1, lat1, angle, distance) {
    // angle: +-0 -> west, +pi/2 -> south, +-pi -> east, -pi/2 -> north
    let lon2, lat2;

    const dx = (distance / 1000) * Math.cos(angle);
    const dy = (distance / 1000) * Math.sin(angle);

    lon2 = lon1 - (dx / 71.5);
    lat2 = lat1 - (dy / 111.3);

    return [lon2, lat2];
}

function averagePixelValues(data) {
    const pixels = data.length / 4;
    let [red, green, blue, alpha] = [0, 0, 0, 0]; // sum of all pixel values

    for (let i = 0; i < data.length; i = i + 4) {
        red = red + data[i];
        green = green + data[i + 1];
        blue = blue + data[i + 2];
        alpha = alpha + data[i + 3];
    }

    // get average by dividing
    red = red / pixels;
    green = green / pixels;
    blue = blue / pixels;
    alpha = alpha / pixels;

    return [red, green, blue, alpha];
}

// returns a normalized Vector3 pointing in the direction specified by lonov latov
function lonLatToLocal(lonov, latov) {
    const phi = THREE.MathUtils.degToRad(90 - latov);
    const theta = THREE.MathUtils.degToRad(lonov);
    
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

// inverse operation to above
function localToLonLat(vec) {
    const phi = Math.acos(vec.y);
    const theta = Math.atan2(vec.z, vec.x);

    let latov = THREE.MathUtils.radToDeg(phi);
    const lonov = (THREE.MathUtils.radToDeg(theta) + 360) % 360;

    return [lonov, 90 - latov];
}
