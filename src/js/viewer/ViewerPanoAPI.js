
let scene = new THREE.Scene();

export class ViewerPanoAPI{

    constructor(){
        this.scene = scene; // three.js scene used by the panorama (3D) viewer
    }
    
    // Set the panorama view characteristics.
    view (lonov, latov, fov){

        //lonov // Number // Longitude of view (in rad) // 0 looks east // (PI / 2) looks north
        //latov // Number // Latitude of view (in rad) // 0 is horizontal // positive values look up // negative values look down
        //fov // Number // Field of view (in degrees)

    }

}
