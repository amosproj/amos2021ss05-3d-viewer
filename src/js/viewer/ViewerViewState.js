"use strict";

export class ViewerViewState{
    constructor(fov, latov, lonov) {
        this.fov = fov; // : Number // Field of view (in degrees)

        this.latov = latov; // : Number // View latitude (in degrees)

        this.lonov = lonov; // : Number // View longitude (in degrees)
    }
}