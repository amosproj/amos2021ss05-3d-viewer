"use strict";

// Panorama Image
export class ViewerImage {

    constructor() {
    
        this.floor; // : String // Name of floor which contains this image

        this.floorZ; // : Number // Z coordinate of this image on the floor

        this.hidden; // : Boolean // Flag if this image is hidden

        this.id; // : Number // Image number
    
        this.pos; // : [Number] // WGS 84 coordinates [longitude, latitude, z] of this image

    }

}