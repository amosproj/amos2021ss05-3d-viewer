"use strict";
import { ViewerImage } from "./ViewerImage.js";

// Specific API for Panorama Image(s)
export class ViewerImageAPI {

    constructor(data) {
        // The file «data.json» contains the metadata defining the panorama image locations.
            //"images" Array Images Array
            //"lon0" Number Reference longitude of model (WGS 84)
            //"lat0" Number Reference latitude of model (WGS 84)
            //"floors" Object Floors Object
    
        this.origin = [data.lon0, data.lat0];
        this.floors = data.floors;
        this.viewerImages = [];

        data.images.forEach( (element, index) => {
            this.viewerImages.push(new ViewerImage(element, index));
        });

        console.log(this);
    }
    
    all ( callback ) {
     //    Get all panorama images.
    // Parameters:  Function called with all images ([ViewerImage]): Array of panorama images
    }

    changed (  ) {
        //  Signal changed image data (e.g. hidden flag) to the viewer.
    }

    get images() {
        // Get the currently managed panorama images.

        return this.viewerImages;
    }
}