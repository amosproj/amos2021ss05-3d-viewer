"use strict";
import { ViewerImage } from "ViewerImageAPI.js";

// Specific API for Panorama Image(s)
export class ViewerImageAPI {

    constructor() {
        // hardcoded to work with assets/ for now

        this.metadata;
        const jsonImageDataFilepath = "../assets/data.json";
        this.viewer_image = new ViewerImage ()

        $.getJSON(jsonImageDataFilepath, function(data) {
           this.metadata = data;
           console.log(data); 
        });

    }
    
    all ( callback ) {
     //    Get all panorama images.
    // Parameters:  Function called with all images ([ViewerImage]): Array of panorama images
    }

    changed (  ) {
        //  Signal changed image data (e.g. hidden flag) to the viewer.
    }

    get get() {
        //      Get the currently displayed panorama image.

        return this.viewer_image;
    }
}