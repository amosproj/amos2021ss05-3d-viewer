export class ViewerState {

    constructor([panoLon, panoLat, panz],imageIdx, name,[fov, lonov,latov] ) {

        //this.big =
    
        this.floor = name; // : String // Name of floor which contains this image

        this.imageNum = imageIdx; // : Number // Image number
    
        this.loc = [panoLon, panoLat,panz]; // : [Number] // WGS 84 coordinates [longitude, latitude, z] of this image

        //this.fov = fov; // : Number // Field of view (in degrees)
       // viewerViewState1= new ViewerViewState(DEFAULT_FOV, 0, 0)
       this.view=[fov, lonov, latov];
      



    }

}
