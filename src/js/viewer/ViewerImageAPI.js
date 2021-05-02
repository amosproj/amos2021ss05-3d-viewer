"use strict";
//import { ViewerImage } from "ViewerImage.js";

// Specific API for Panorama Image(s)
export class ViewerImageAPI {

    constructor() {
        // hardcoded to work with assets/ for now
        const jsonImageDataFilepath = "../assets/data.json";
        this.viewer_image; //= new ViewerImage()
        this.metadata; 
        // The file «data.json» contains the metadata defining the panorama image locations.
            //"images" Array Images Array
            //"lon0" Number Reference longitude of model (WGS 84)
            //"lat0" Number Reference latitude of model (WGS 84)
            //"floors" Object Floors Object

            
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