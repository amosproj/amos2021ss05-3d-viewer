"use strict";

// Panorama Image
export class ViewerImageAPI {

    constructor() {
        // hardcoded to work with assets/ for now

        this.metadata;

        const jsonImageDataFilepath = "../assets/data.json";

        $.getJSON(jsonImageDataFilepath, function(data) {
           this.metadata = data;
           console.log(data); 
        });

    }

}