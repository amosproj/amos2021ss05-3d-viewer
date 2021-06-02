"use strict";

// Event position in viewer

export class EventPosition {
    constructor() {
    
        this.x; //  Number // y coordinate of this image on the floor

        this.y; // Number // y coordinate of this image on the floor
    }

}


export class EventLayer {
    constructor() {
        this.viewer_contex; 
    }
    
    vwr_oncontext (xy, location){
        //Parameters: 
        //xy EventPosition:  Pointer position
        //location THREE.Vector3 : Local coordinates for pointer position+
        viewer_contex = new ViewerContextItem();
        return viewer_contex;
    }

}