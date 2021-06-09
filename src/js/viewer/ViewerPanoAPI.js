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
        this.sphereRadius = 500;

        this.viewerViewState = new ViewerViewState(DEFAULT_FOV, 0, 0);
        this.lastViewState;
        this.lastMousePos;

        //initialize the eventLayer
        this.eventLayer = new EventLayer();

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

        // Create a Sphere for the image texture to be displayed on
        const sphere = new THREE.SphereGeometry(this.sphereRadius, 60, 40);
        // invert the geometry on the x-axis so that we look out from the middle of the sphere
        sphere.scale(-1, 1, 1);

        // load the 360-panorama image data (highest resolution hardcoded for now)
        const texturePano = this.viewerAPI.textureLoader.load(
            this.viewerAPI.baseURL +
            Math.trunc(this.viewerImageAPI.currentImageId / 100) +
            '/' +
            this.viewerImageAPI.currentImageId +
            'r3.jpg');
        texturePano.mapping = THREE.EquirectangularReflectionMapping; // not sure if this line matters

        // put the texture on the spehere and add it to the scene
        const material = new THREE.MeshBasicMaterial({ map: texturePano });
        const mesh = new THREE.Mesh(sphere, material);

        const orientation = this.viewerImageAPI.currentImage.orientation;

        mesh.applyQuaternion(orientation);

        this.scene.clear();

        this.scene.add(mesh);
    }

    camera() {
        return this.camera;
    }

    // Set the panorama view characteristics.
    view(lonov, latov, fov) {

        let phi = THREE.MathUtils.degToRad(90 - latov);
        let theta = THREE.MathUtils.degToRad(lonov);

        const x = this.sphereRadius * Math.sin(phi) * Math.cos(theta);
        const y = this.sphereRadius * Math.cos(phi);
        const z = this.sphereRadius * Math.sin(phi) * Math.sin(theta);

        this.camera.lookAt(x, y, z);

        this.camera.fov = THREE.MathUtils.clamp(fov, MIN_FOV, MAX_FOV);

        this.camera.updateProjectionMatrix();

    }

    viewInternal() {
        this.view(this.viewerViewState.lonov, this.viewerViewState.latov, this.viewerViewState.fov);
    }


    // ----- Event handling functions for panning, zooming and moving -----
    onPointerDown(event) {
        this.lastMousePos = [event.clientX, event.clientY];

        this.lastViewState = [this.viewerViewState.lonov, this.viewerViewState.latov];

        document.addEventListener('pointermove', this.oPM);
        document.addEventListener('pointerup', this.oPU);
    }

    // handles continues update of the distance mouse moved
    onPointerMove(event) {
        let scalingFactor = this.camera.fov / MAX_FOV;

        this.viewerViewState.lonov = (this.lastMousePos[0] - event.clientX) * PAN_SPEED * scalingFactor + this.lastViewState[0];
        this.viewerViewState.latov = (event.clientY - this.lastMousePos[1]) * PAN_SPEED * scalingFactor + this.lastViewState[1];

        // keep viewerviewstate.latov within bounds because it loops back around at top and bottom
        this.viewerViewState.latov = Math.max(-85, Math.min(85, this.viewerViewState.latov));

        // keep lonov between 0 and 360
        this.viewerViewState.lonov = (this.viewerViewState.lonov + 360) % 360;
    }

    // this event listener is called when the user *ends* moving the picture
    onPointerUp() {
        document.removeEventListener('pointermove', this.oPM);
        document.removeEventListener('pointerup', this.oPU);

        this.viewerAPI.propagateEvent("viewed", this.viewerViewState, true);
    }

    onDocumentMouseWheel(event) {
        // the 0.05 constant determines how quick scrolling in and out feels for the user
        this.viewerViewState.fov = this.camera.fov + event.deltaY * ZOOM_SPEED;

        this.viewInternal();

        this.camera.updateProjectionMatrix();

        this.viewerAPI.propagateEvent("viewed", this.viewerViewState, true);
    }

    onDoubleClick(event) {
        const halfWidth = window.innerWidth / 2;
        const halfHeight = window.innerHeight / 2;

        const horizontalAngle = (this.viewerViewState.lonov > 270) ? 450 - this.viewerViewState.lonov : -(this.viewerViewState.lonov - 90);
        const horizontalOffset = (event.x - halfWidth) / halfWidth; // scaled between [-1,1] depending how left-right the click is
        const adjustedHorizontalAngle = horizontalAngle - (horizontalOffset * this.viewerViewState.fov / 2); // line from current position towards where the mouse double clicked (2D birds eye view angle)

        const verticalAngle = -this.viewerViewState.latov + 90 // between [0,180]Deg depending on how far up/down the user looks
        const verticalOffset = (event.y - halfHeight) / halfHeight; // between [-1,1] depending how up-down the mouse click is on the screen
        const adjustedVerticalAngle = verticalAngle + (verticalOffset * this.viewerViewState.fov / 2);
        const realVerticalOffset = (adjustedVerticalAngle - 90) / 90; // between [-1,1] depending how far up/down user looks and clicks

        const MEDIAN_WALKING_DISTANCE = 5; // in meter
        // distance to be walked along adjustedHorizontalAngle from current location
        const distance = MEDIAN_WALKING_DISTANCE - (realVerticalOffset * MEDIAN_WALKING_DISTANCE);

        // adjustedHorizontalAngle converted to represent directions like specified in newLocationFromPointAngle
        let convertedAngle = (adjustedHorizontalAngle > -90) ? adjustedHorizontalAngle - 90 : adjustedHorizontalAngle + 270;
        convertedAngle = THREE.Math.degToRad(convertedAngle);
        const currentPos = this.viewerImageAPI.currentImage.pos;

        const newPos = newLocationFromPointAngle(currentPos[0], currentPos[1], convertedAngle, distance);

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