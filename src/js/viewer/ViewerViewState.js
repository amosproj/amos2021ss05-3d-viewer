"use strict";

export class ViewerViewState {

    constructor(fov, latov, lonov) {
        this.fov = fov; // : Number // Field of view (in degrees)

        this.latov = latov; // : Number // View latitude (in rad)

        this.lonov = lonov; // : Number // View longitude (in rad)
    }

    setLatov(newVal) { // set with degs
        // keep viewerviewstate.latov within bounds because it loops back around at top and bottom
        this.latov = THREE.Math.degToRad(Math.max(-85, Math.min(85, newVal)));
    }
    
    setLonov(newVal) { // set with degs
        // keep lonov between 0 and 360
        this.lonov = THREE.Math.degToRad((newVal + 360) % 360);
    }

}