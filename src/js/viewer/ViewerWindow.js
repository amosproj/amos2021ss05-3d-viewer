"use strict";

import { ViewerAPI } from "./ViewerAPI.js";

export class ViewerWindow{

    
    static viewerAsync(baseUrl, callback) {
        const api = new ViewerAPI(baseUrl);
        callback(api);
    }


}