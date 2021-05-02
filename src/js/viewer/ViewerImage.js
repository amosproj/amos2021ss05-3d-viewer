"use strict";

// Panorama Image
export class ViewerImage {

    constructor([panoLon, panoLat, panoZ, w, x, y, z, floorZ], imageIdx) {
    
        this.floor; // : String // Name of floor which contains this image

        this.floorZ = floorZ; // : Number // Z coordinate of this image on the floor

        this.hidden; // : Boolean // Flag if this image is hidden

        this.id = imageIdx; // : Number // Image number
    
        this.pos = [panoLon, panoLat, panoZ]; // : [Number] // WGS 84 coordinates [longitude, latitude, z] of this image

    }

}