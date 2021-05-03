let phi = 0, theta = 0;

const DEFAULT_FOV = 90, MAX_FOV = 120, MIN_FOV = 5;

export class ViewerPanoAPI{

    constructor(){
        this.scene = new THREE.Scene(); // three.js scene used by the panorama (3D) viewer
        this.#cam = new THREE.PerspectiveCamera(DEFAULT_FOV, window.innerWidth / window.innerHeight, 1, 1100);
    }

    camera(){
        return this.#cam;
    }
    
    // Set the panorama view characteristics.
    view (lonov, latov, fov){

        phi = THREE.MathUtils.degToRad(90 - latov);
        theta = THREE.MathUtils.degToRad(lonov);
    
        const x = 500 * Math.sin(phi) * Math.cos(theta);
        const y = 500 * Math.cos(phi);
        const z = 500 * Math.sin(phi) * Math.sin(theta);
    
        this.camera().lookAt(x, y, z);

        this.camera().fov = THREE.MathUtils.clamp(fov, MIN_FOV, MAX_FOV);

        this.camera().updateProjectionMatrix();

    }
}
