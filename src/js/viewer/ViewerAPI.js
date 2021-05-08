"use strict";
import { ViewerImageAPI } from "./ViewerImageAPI.js";

// API provided by the viewer
export class ViewerAPI {
    constructor() {
        //list of all images
        this.images = [];
    }


    //Move the view to the given position.
    move ( lon,  lat,  z ){
        const jsonImageDataFilepath = "../assets/data.json";
        let viewerImageAPI;
        let temp = [lon,lat,z];
        let resultset = [];
        //console.log(temp[0]);

        $.getJSON(jsonImageDataFilepath, function(data) {


            viewerImageAPI = new ViewerImageAPI(data);
            //console.log(viewerImageAPI.viewerImages);
            for (let i in viewerImageAPI.viewerImages){
                //console.log(viewerImageAPI.viewerImages[i].pos);
                //console.log(viewerImageAPI.viewerImages[i].pos[0]);
                //console.log(temp[0]);
                let result = Math.sqrt(Math.pow(viewerImageAPI.viewerImages[i].pos[0]-temp[0],2)+Math.pow(viewerImageAPI.viewerImages[i].pos[1]-temp[1],2)+Math.pow(viewerImageAPI.viewerImages[i].pos[2]-temp[2],2));
                //console.log(result);
                resultset.push(result);  
            }
            console.log(resultset);
        });
    



    }


}