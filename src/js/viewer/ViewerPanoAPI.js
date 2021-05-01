
//let scene = new THREE.Scene();

let onPointerDownMouseX = 0, onPointerDownMouseY = 0,
    longitude = 0, onPointerDownLon = 0,
    latitude = 0, onPointerDownLat = 0,
    phi = 0, theta = 0;

const DEFAULT_FOV = 90, MAX_FOV = 120, MIN_FOV = 5;

export class ViewerPanoAPI{

    constructor(){
        this.scene = new THREE.Scene(); // three.js scene used by the panorama (3D) viewer
    }

    camera(){
        return new THREE.PerspectiveCamera(DEFAULT_FOV, window.innerWidth / window.innerHeight, 1, 1100);
    }
    
    // Set the panorama view characteristics.
    view (lonov, latov, fov){

        //lonov // Number // Longitude of view (in rad) // 0 looks east // (PI / 2) looks north
        //latov // Number // Latitude of view (in rad) // 0 is horizontal // positive values look up // negative values look down
        //fov // Number // Field of view (in degrees)
        let cameratest = this.camera();
        phi = THREE.MathUtils.degToRad(90 - latov);
        theta = THREE.MathUtils.degToRad(lonov);
    
        const x = 500 * Math.sin(phi) * Math.cos(theta);
        const y = 500 * Math.cos(phi);
        const z = 500 * Math.sin(phi) * Math.sin(theta);
    
        cameratest.lookAt(x, y, z);
        //renderer.render(scene, cameratest);

        cameratest.fov = THREE.MathUtils.clamp(fov, MIN_FOV, MAX_FOV);

        cameratest.updateProjectionMatrix();

        return this.scene, cameratest;

    }


}
