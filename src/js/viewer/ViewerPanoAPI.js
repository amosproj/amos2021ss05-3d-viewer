import { DEFAULT_FOV, MAX_FOV, MIN_FOV, getFolderNumber } from "./Globals.js";

export class ViewerPanoAPI{

    constructor(viewerImageAPI) {
        this.scene = new THREE.Scene(); // three.js scene used by the panorama (3D) viewer
        this.camera = new THREE.PerspectiveCamera(DEFAULT_FOV, window.innerWidth / window.innerHeight, 1, 1100);
        this.viewerImageAPI = viewerImageAPI;
        this.sphereRadius = 500;

        this.display(this.viewerImageAPI.currentImageId);
    }

    // displays the panorama with idx *ImageNum* in the model
    display(imageNum) {
        this.viewerImageAPI.currentImageId = imageNum;

        // Create a Sphere for the image texture to be displayed on
        const sphere = new THREE.SphereGeometry(this.sphereRadius, 60, 40);
        // invert the geometry on the x-axis so that we look out from the middle of the sphere
        sphere.scale(-1, 1, 1);

        // load the 360-panorama image data (one specific hardcoded for now)
        const texturePano = new THREE.TextureLoader().load('../assets/' + getFolderNumber(this.viewerImageAPI.currentImageId) + '/' + this.viewerImageAPI.currentImageId + 'r3.jpg');
        texturePano.mapping = THREE.EquirectangularReflectionMapping; // not sure if this line matters
        
        // put the texture on the spehere and add it to the scene
        const material = new THREE.MeshBasicMaterial({ map: texturePano });
        const mesh = new THREE.Mesh(sphere, material);
        const orientation = this.viewerImageAPI.currentImage.orientation;
        // applyQuaternion(orientation); on something
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

    // angle returned in realtion to real word: +-0 -> north, -90 -> east, +-180 -> south, +90 -> east
    getAngle(){
        var vector = new THREE.Vector3( 0, 0, - 1 );
        // Get the direction of the camera 
        vector = this.camera.getWorldDirection();
        // Compute the viewing angle direction
        var theta = Math.atan2(vector.x,vector.z);
        // Return the angle in degrees
        var angle = THREE.Math.radToDeg( theta );
        return angle; 
    }
}
