"use strict";
import { ViewerImageAPI } from "./ViewerImageAPI.js";
import { ViewerPanoAPI } from "./ViewerPanoAPI.js";

// API provided by the viewer
export class ViewerAPI {
    constructor() {
        //list of all images
        //this.images = [];
    }


    //Move the view to the given position.
    move ( lon,  lat,  z ){
        const jsonImageDataFilepath = "../assets/data.json";
        let viewerImageAPI;
        let temp = [lon,lat,z];
        let resultset = [];
        let minval;
        let minkey;
        let viewerPanoAPI = new ViewerPanoAPI();
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
            minkey = 0;
            minval = resultset[0];
            for (let i in resultset){
                if (resultset[i]<minval){
                    minval = resultset[i];
                    minkey = i;
                }
            }
            console.log(minkey);
            console.log(minval);

            // Create a Sphere for the image texture to be displayed on
            const sphere = new THREE.SphereGeometry(500, 60, 40);
            // invert the geometry on the x-axis so that we look out from the middle of the sphere
            sphere.scale( -1, 1, 1);

            // load the 360-panorama image data (one specific hardcoded for now)
            const texturePano = new THREE.TextureLoader().load( '../assets/0/'+minkey+'r3.jpg' );
            texturePano.mapping = THREE.EquirectangularReflectionMapping; // not sure if this line matters
            
            // put the texture on the spehere and add it to the scene
            const material = new THREE.MeshBasicMaterial({ map: texturePano });
            const mesh = new THREE.Mesh(sphere, material);
            viewerPanoAPI.scene.add(mesh);
            // ----- -----
        });
        //console.log(minkey);
        // console.log(minval);


        

    



    }


}