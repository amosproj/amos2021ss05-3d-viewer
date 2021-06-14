"use strict";

export class ViewerViewState {

    constructor(fov, latov, lonov) {
        this.fov = fov; // : Number // Field of view (in degrees)

        this.latov = latov; // : Number // View latitude (in degrees)

        this.lonov = lonov; // : Number // View longitude (in degrees)
    }

    setLatov(newVal) {
        // keep viewerviewstate.latov within bounds because it loops back around at top and bottom
        this.latov = Math.max(-85, Math.min(85, newVal));
    }
    
    setLonov(newVal) {
        // keep lonov between 0 and 360
        this.lonov = (newVal + 360) % 360;
    }

}