"use strict";

// Configurable values to change some aspects of the ViewerPanoAPI

// Describes the Field of View of the camera displaying the panorama. 
// A lower value means a more narrow FOV
export const DEFAULT_FOV = 80;
export const MAX_FOV = 100;
export const MIN_FOV = 10;

// Describes how much mouse wheel scrolling is needed to zoom in the picture. 
// A higher value means zooming is faster (also more stuttered)
export const ZOOM_SPEED = 0.05;

// Describes how much the mouse has to be moved for the picture to pan
// A higher value means panning is quicker
export const PAN_SPEED = 0.1;
