"use strict";

import { ViewerAPI } from "./ViewerAPI.js";

export class ViewerWindow{

    constructor() {
        this.window = window;
    }
    
    viewerAsync(baseUrl, callback) {
        const api = new ViewerAPI(baseUrl);
        callback(api);
    }


}