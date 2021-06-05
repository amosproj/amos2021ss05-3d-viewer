"use strict";
import { ViewerContextItem } from "./ViewerContextItem.js";

// Event position in viewer

export class EventPosition {
    constructor() {

        this.x; //  Number // y coordinate of this image on the floor

        this.y; // Number // y coordinate of this image on the floor
    }

}


export class EventLayer {
    constructor() {
        this.viewer_contex;
    }

    vwr_oncontext(xy, location) {
        //Parameters: 
        //xy EventPosition:  Pointer position
        //location THREE.Vector3 : Local coordinates for pointer position+
        var items = {
            "edit": { name: "Edit", icon: "edit" },
            "cut": { name: "Cut", icon: "cut" },
        };

        let callback = function (key, options) {
            var msg = 'clicked: ' + key;
            (window.console && console.log(msg)) || alert(msg)
        };

        let itemEdit = new ViewerContextItem(callback, items.edit.icon, null, items.edit.name);

        let itemCut = new ViewerContextItem(callback, items.cut.icon, null, items.cut.name);

        var listOfItems = { "edit": itemEdit, "cut": itemCut };

        return listOfItems;
    }

}