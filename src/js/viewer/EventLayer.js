"use strict";
import { ViewerContextItem } from "./ViewerContextItem.js";

export class EventLayer {
    constructor() {
        this.viewer_contex;
    }

    vwr_oncontext(xy, location) {
        //Parameters: 
        //xy EventPosition:  Pointer position
        //location THREE.Vector3 : Local coordinates for pointer position+

        //Creating callback function for context menu item.

        console.log("xy: ", xy);
        console.log("Viewing Direction: ", location);

        let callback = function (key, options) {
            var msg = 'clicked: ' + key;
            (window.console && console.log(msg)) || alert(msg);
        };

        //Creating item objects
        let itemEdit = new ViewerContextItem(callback, "edit", null, "Edit");
        let itemCut = new ViewerContextItem(callback, "cut", null, "Cut");

        //Creating list of item objects.
        let listOfItems = { "edit": itemEdit, "cut": itemCut };

        return listOfItems;
    }

}