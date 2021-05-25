export class ViewerState {

    constructor([panoLon, panoLat, panz], imageIdx, name, [fov, lonov, latov]) {

        //this.big =
    
        this.floor = name; // : String // Name of floor which contains this image

        this.imageNum = imageIdx; // : Number // Image number
    
        this.loc = [panoLon, panoLat, panz]; // : [Number] // WGS 84 coordinates [longitude, latitude, z] of this image

        this.fov = fov; // : Number // Field of view (in degrees)
        
        this.view = [fov, lonov, latov];

    }

}
