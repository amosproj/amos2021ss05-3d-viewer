//var img = document.createElement("img"); 
//img.src = "../assets/map0.jpg"; //"/seamless_metal.jpg";
//var src = document.getElementById("map"); 
//src.appendChild(img); 


"use strict";

let cameraOrtho, sceneOrtho, rendererOrtho;

let spriteBR;

let onPointerDownMouseX = 0, onPointerDownMouseY = 0,
    longitude = 0, onPointerDownLon = 0,
    latitude = 0, onPointerDownLat = 0,
    phi = 0, theta = 0;

const DEFAULT_FOV = 90, MAX_FOV = 120, MIN_FOV = 5;

init();
animate();

function init() {

    const container = document.getElementById('map');

    // Create the Thee.js scene
    const width = window.innerWidth;
    const height = window.innerHeight;

    cameraOrtho = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, 1, 10 );
    sceneOrtho = new THREE.Scene();

    // Load the map textures
    const mapTexture = new THREE.TextureLoader().load( '../assets/metal.jpg' ); 
    //var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff } );
    //var sprite = new THREE.TextureLoader().load( "../assets/map0.jpg", createHUDSprites )//new THREE.Sprite( material );
    const material = new THREE.SpriteMaterial( { map: mapTexture } );
    spriteBR = new THREE.Sprite( material );
    spriteBR.center.set( 1.0, 0.0 );
    spriteBR.scale.set( width/10, height/10, 1 );
    sceneOrtho.add( spriteBR );

    //sprite.scale.set(width,height,1);
    //sceneOrtho.add( sprite );
  
    // create sprites
    //const mapTexture = new THREE.TextureLoader().load( "../assets/map0.png", createHUDSprites );
    //const materialMap = new THREE.SpriteMaterial( { map: mapTexture, color: 0xffffff, fog: true } );

    // create the renderer, and embed the attributed dom element in the html page
    rendererOrtho = new THREE.WebGLRenderer();
    rendererOrtho.setPixelRatio(window.devicePixelRatio);
    rendererOrtho.setSize(window.innerWidth, window.innerHeight);

    //Render 2D Map
    rendererOrtho.clearDepth();
    rendererOrtho.render( sceneOrtho, cameraOrtho );
    container.appendChild(rendererOrtho.domElement);

    // link event listeners to the corresponding functions
    container.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('resize', onWindowResize);
}

function animate() {
    requestAnimationFrame(animate);
    update();

}

function update() {
    updateHUDSprites()
    rendererOrtho.render(sceneOrtho, cameraOrtho);
}


// this event listener is called when the user *begins* moving the picture
function onPointerDown(event) {

    onPointerDownMouseX = event.clientX;
    onPointerDownMouseY = event.clientY;

    onPointerDownLon = longitude;
    onPointerDownLat = latitude;

    // Two new event listeneres are called to handle *how far* the user drags
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

}

// handles continues update of the distance mouse moved
function onPointerMove(event) {

    longitude = (onPointerDownMouseX - event.clientX) * 0.2 + onPointerDownLon;
    latitude = (event.clientY - onPointerDownMouseY) * 0.2 + onPointerDownLat;
    // keep latitude within bounds because it loops back around at top and bottom
    latitude = Math.max( -85, Math.min(85, latitude));

}

// this event listener is called when the user *ends* moving the picture
function onPointerUp() {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

}


function onWindowResize() {
    cameraOrtho.aspect = window.innerWidth / window.innerHeight;
    cameraOrtho.updateProjectionMatrix();
    rendererOrtho.setSize(window.innerWidth, window.innerHeight);

}


function createHUDSprites( texture ) {

    const material = new THREE.SpriteMaterial( { map: texture } );
    const width = material.map.image.width;
    const height = material.map.image.height;

    spriteBR = new THREE.Sprite( material );
    spriteBR.center.set( 1.0, 0.0 );
    spriteBR.scale.set( width, height, 1 );
    sceneOrtho.add( spriteBR );
    updateHUDSprites();
}

function updateHUDSprites() {
    const width = window.innerWidth / 2;
    const height = window.innerHeight / 2;
    spriteBR.position.set( -width, - height, 1 ); // bottom left
}
