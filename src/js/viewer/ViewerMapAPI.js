
// Map (2D) Viewer API

// Specific API for the Map View

let  viewerMapAPI; 

export class ViewerMapAPI {

    constructor(mapPicturePath) {
        // hardcoded to work with assets/ for now
        this.layers;
        this.scene = new THREE.Scene(); // scene THREE.Scene scene overlayed over the map (2D) view
        this.camera = new THREE.OrthographicCamera( 
            - window.innerWidth / 2,    // frustum left plane 
            window.innerWidth / 2,      // frustum right plane
            window.innerHeight / 2,     // frustum top plane
            - window.innerHeight / 2,   // frustum bottom plane
            1,                          // frustum near plane
            10);                        // frustum far plane
        this.camera.position.z = 2;     // need to be in [near + 1, far + 1] to be displayed

        this.spriteGroup = new THREE.Group(); //create an sprite group

        new THREE.TextureLoader().load(mapPicturePath, (texture) => {
            const material = new THREE.SpriteMaterial({ map: texture,  blending: THREE.AdditiveBlending, transparent:true  });
            material.renderOrder=1; 
            material.depthTest = false;
            const spriteMap = new THREE.Sprite(material);
            this.scale = [texture.image.width/10, texture.image.height/10, 1]; 
            spriteMap.scale.set(texture.image.width/10, texture.image.height/10, 1);
            spriteMap.center.set(1.0, 0.0); // bottom right
            spriteMap.position.set(0, 0, 1 ); //Send Behind
            //this.scene.add(spriteMap);
            this.spriteGroup.add(spriteMap); 
        } );
        this.redraw(); 
        //this.spriteGroup.center.set(1.0, 0.0); // bottom right
        this.spriteGroup.position.set(window.innerWidth / 2, -window.innerHeight / 2, 0 ); // bottom right
        this.scene.add( this.spriteGroup );
        console.log(this.spriteGroup.position) ; 
        console.log(this.location.position) ; 


    }

    // Method: Add an event layer to the map (2D) view.
    addLayer (layer) {
        this.scene.add(layer); 
    }

    // Method: remove an event layer to the map (2D) view.
    removeLayer (layer) {
        // Layer: EventLayer
        this.scene.remove(layer); 

    }
   
    // Method
    redraw() {
        
        // Schedule a redraw of the three.js scene overlayed over the map (2D) view.
     
        var point_text =  new THREE.Texture( generateCircularSprite("red") ); 
        point_text.needsUpdate = true;
        var mat = new THREE.SpriteMaterial({
            map: point_text,
            transparent: false,
            //depthTest: false,
            //blending: THREE.AdditiveBlending , 
            color: 0xff0000 // RED, 
        });
        // Render on Top
        mat.renderOrder =3; 
        // Create the point sprite
        this.location = new THREE.Sprite( mat);//new THREE.SpriteMaterial( { map: point_text//,    blending: THREE.AdditiveBlending  }) );    

        // TODO: find appropaiete position of the point on the map
        this.location.center.set(0.0, 0.0);
        this.location.position.set(-100, 100,-3 );
        //scale the point 
        this.location.scale.set(5,5,1); 
        this.spriteGroup.add(this.location);
    }
    
    // Method
    scale() {
        //Get the scale used by the three.js scene overlayed over the map (2D) view.
        scale = 1 //  (in meter / pixel)
        scale = this.scale
        return scale
    }
}



function createHUDSprites(texture){
    // Create the point sprite
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( (1.0,1.0,1), 3 ) );
    
    //Create a red material 
    const points = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0xFF0000 , size: 30,  depthTest: false}));
    //this.mapgroup = new THREE.Group();
    //this.mapgroup.add( points );  


    //Texture is Map
    const material = new THREE.SpriteMaterial( { map: texture } );
    this.spriteMap = new THREE.Sprite(material);
    this.spriteMap.center.set(1.0, 0.0); // bottom right
    this.spriteMap.scale.set( texture.image.width/10, texture.image.height/10, 1 );
    //this.mapgroup.add( this.spriteMap );  
    this.scene.add( this.spriteMap );
    
    updateHUDSprites();

}

function updateHUDSprites() {

    this.spriteMap.position.set(window.innerWidth / 2, -window.innerHeight / 2, 1 ); // bottom right

}


function generateCircularSprite(color) {
    var canvas = document.createElement('canvas');
    canvas.height = 16;
    canvas.width = 16;
    var context = canvas.getContext('2d');
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = 8;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'red';
    context.fill();
    return canvas;
    
}