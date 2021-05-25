"use strict";

import { distanceWGS84TwoPoints } from "./Globals.js";

export class ViewerFloorAPI {
   
    constructor(data, viewerImageAPI) {
        // The file «data.json» contains the metadata defining the panorama image locations.
            //"images" Array Images Array
            //"lon0" Number Reference longitude of model (WGS 84)
            //"lat0" Number Reference latitude of model (WGS 84)
            //"floors" Object Floors Object
        
        this.z; // : Number // Z coordinate of current floor(in meters)
        
        this.floors = [];

        // iterate over floors
        Object.keys(data.floors).forEach((key) => {
            const currentFloor = new ViewerFloor(data.floors[key], key);

            // add ViewerImages corresponding to this floor
            viewerImageAPI.images.forEach((currentImage) => {

              
                // check if imageidx in any of the i intervalls
                currentFloor.i.forEach((interval) => {
                    if (currentImage.id >= interval[0] && currentImage.id <= interval[1]) {
                        currentImage.floor = key;
                        
                        // dx, dy distance in kilometers
                        const [dx, dy] = distanceWGS84TwoPoints(data.lon0, data.lat0, currentImage.pos[0], currentImage.pos[1]);

                        const offsetX = currentFloor.mapData.x + currentFloor.mapData.density * (dx * 1000);
                        const offsetY = currentFloor.mapData.y - currentFloor.mapData.density * (dy * 1000);

                        currentImage.mapOffset = [offsetX, offsetY];

                        currentFloor.viewerImages.push(currentImage);
                    }
                 });
            });

            this.floors.push(currentFloor);            
        });

        //lowest floor will be at lowest index and highest floor at floors.length-1
        this.floors.sort((a, b) => (a.z > b.z) ? 1 : -1);

        this.currentFloorId = 0.0;
        viewerImageAPI.currentImageId = this.floors[this.currentFloorId].i[0][0];
    }

    all(callback) {
        callback(this.floors);
    }

    get currentFloor() {
        return this.floors[this.currentFloorId];
    }
}

class ViewerFloor {

    constructor(floorData, key) {
        this.name = key;
        this.z = floorData.z;
        this.viewerImages = [];
        this.mapData = floorData.map;
        this.i = floorData.i; // array of intervals, i.e. [ [1 , 3], [10, 12], [27, 30] ] means pictures {1,2,3,10,12,27,28,29,30} belong to this floor
    }

}
