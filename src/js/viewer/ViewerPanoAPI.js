import { DEFAULT_FOV, MAX_FOV, MIN_FOV } from "./Globals.js";

export class ViewerPanoAPI{

    constructor(viewerImageAPI) {
        this.scene = new THREE.Scene(); // three.js scene used by the panorama (3D) viewer
        this.camera = new THREE.PerspectiveCamera(DEFAULT_FOV, window.innerWidth / window.innerHeight, 1, 1100);
    
        // Create a Sphere for the image texture to be displayed on
        this.sphereRadius = 500;
        const sphere = new THREE.SphereGeometry(this.sphereRadius, 60, 40);
        // invert the geometry on the x-axis so that we look out from the middle of the sphere
        sphere.scale(-1, 1, 1);

        // load the 360-panorama image data (one specific hardcoded for now)
        this.viewerimageAPI = viewerImageAPI;
        const texturePano = new THREE.TextureLoader().load( '../assets/0/'+this.viewerimageAPI.currentImageId+'r3.jpg' );
        console.log(this.viewerimageAPI.currentImageId)
        texturePano.mapping = THREE.EquirectangularReflectionMapping; // not sure if this line matters
        
        // put the texture on the spehere and add it to the scene
        const material = new THREE.MeshBasicMaterial({ map: texturePano });
        const mesh = new THREE.Mesh(sphere, material);
        this.scene.add(mesh);
    }

    camera() {
        return this.camera;
    }

    // Set the panorama view characteristics.
    view(lonov, latov, fov) {

        let phi = THREE.MathUtils.degToRad(90 - latov);
        let theta = THREE.MathUtils.degToRad(lonov);
    
        const x = this.sphereRadius * Math.sin(phi) * Math.cos(theta);
        const y = this.sphereRadius * Math.cos(phi);
        const z = this.sphereRadius * Math.sin(phi) * Math.sin(theta);
    
        this.camera.lookAt(x, y, z);

        this.camera.fov = THREE.MathUtils.clamp(fov, MIN_FOV, MAX_FOV);

        this.camera.updateProjectionMatrix();

    }
}
