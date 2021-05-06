"use strict";

// API provided by the viewer
export class ViewerAPI {
    constructor() {
        //list of all images
        this.images = [];
        
        // access JSON file
        const jsonImageDataFilepath = "../assets/data.json";

        // save only index 0 to 2 of each images as THREE.Vector3
        $.getJSON(jsonImageDataFilepath, function(data) {
            $.each( data, function( key, val ) {
                this.images.push( new THREE.Vector3( , , ) );
            });
        });

    }

    //Move the view to the given position.
    move ( lon,  lat,  z ){

        // current lon, lat, z
        const vec1 = new THREE.Vector3( lon, lat, z );

        // compare between vectors
        const distance = [];

        for (i = 0; i < this.images.length; i++){
            distance.push = vec1.distanceTo(this.images[i]);
        }
        
        // get the index of the image which has the shotest distance
        const index = distance.indexOf(Math.min.apply(Math, distance));

        // move to the index of this image //TODO

    }


}