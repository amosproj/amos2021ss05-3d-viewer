
export class ViewerVersionAPI {

    constructor(MAJOR, MINOR, viewer) {
        this.MAJOR = MAJOR;     // : Number // MAJOR version of the API (incremented for breaking API changes)
        this.MINOR = MINOR;     // : Number // MINOR version of the API (incremented for API enhancements)
        this.viewer = viewer;   // : String // Version string of the viewer (not the API)
    }

}
