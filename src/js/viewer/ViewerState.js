"use strict";

export class ViewerState {

    constructor([longitude, latitude, z], imageIdx, name, viewerViewState) {

        this.big = "pano";                      // : String // Currently displayed scene in the big area: 'pano' (3D) xor 'map' (2D)
    
        this.floor = name;                      // : String // Name of the current floor

        this.imageNum = imageIdx;               // : Number // Current image number
    
        this.loc = [longitude, latitude, z];    // : [Number] // Current WGS 84 coordinates [longitude, latitude, z] of the displayed panorama image
        
        this.view = viewerViewState;            // : ViewerViewState // Current view

    }

}
