"use strict";

//Event position in viewer
export class EventPosition {
    constructor(event) {

        this.x = event.clientX;
        this.y = event.clientY;

    }
}