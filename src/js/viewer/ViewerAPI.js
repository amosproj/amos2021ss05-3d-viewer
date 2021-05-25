"use strict";
import { libraryInfo } from "./LibraryInfo.js";
import { distanceWGS84TwoPoints } from "./Globals.js";


// API provided by the viewer
export class ViewerAPI {

    constructor(viewerImageAPI, viewerPanoAPI, viewerMapAPI, viewerFloorAPI) {
        this.viewerImageAPI = viewerImageAPI;
        this.viewerPanoAPI = viewerPanoAPI;
        this.viewerMapAPI = viewerMapAPI;
        this.viewerFloorAPI = viewerFloorAPI;
        this.libs = libraryInfo(); // List of used third party libraries     
        this.MAJOR =null; 
        this.MINOR =null; 
    }


    //Move the view to the nearest (euclidian distance) panorama to the given position. (ignore z value because only called on same floor)
    move(lon, lat, z) {

        let minDistance = 1000000000;
        let bestImg;
        this.viewerFloorAPI.currentFloor.viewerImages.forEach(element => {
            const currDistances = distanceWGS84TwoPoints(lon, lat, element.pos[0], element.pos[1]);
            const currDistance = Math.sqrt(currDistances[0] * currDistances[0] + currDistances[1] * currDistances[1]);
            if (currDistance < minDistance) {
                minDistance = currDistance;
                bestImg = element;
            }
        });

        // avoid duplication
        if (bestImg != this.viewerImageAPI.currentImage) {
            
            this.viewerPanoAPI.display(bestImg.id);
            this.viewerMapAPI.redraw();

        }
    }

}
