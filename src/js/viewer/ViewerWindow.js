"use strict";

import { ViewerAPI } from "./ViewerAPI.js";

export class ViewerWindow{

    
    static viewerAsync(baseUrl, callback) {
        if (baseUrl.charAt(baseUrl.length - 1) != '/') {
            baseUrl = baseUrl + '/';
        }
        const api = new ViewerAPI(baseUrl);
        callback(api);
    }


}