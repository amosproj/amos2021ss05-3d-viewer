"use strict";

// Panorama Image
export class ViewerImage {

    constructor([panoLon, panoLat, panoZ, w, x, y, z, floorZ], imageIdx, name) {
    
        this.floor = name; // : String // Name of floor which contains this image

        this.floorZ = floorZ; // : Number // Z coordinate of this image on the floor

        this.hidden; // : Boolean // Flag if this image is hidden

        this.id = imageIdx; // : Number // Image number
    
        this.pos = [panoLon, panoLat, panoZ]; // : [Number] // WGS 84 coordinates [longitude, latitude, z] of this image

        this.orientation = new THREE.Quaternion(x, y, z, w);

        this.mapOffset; // : [offsetX, offsetY] // in pixels, offset from map png. Values initalized in ViewerMapAPI shortly after object creation
    }

}