export const DEFAULT_FOV = 80, MAX_FOV = 100, MIN_FOV = 10;

export function distanceWGS84TwoPoints(lon1, lat1, lon2, lat2) {
    // Distance calculation math taken from here https://www.mkompf.com/gps/distcalc.html
    let dx, dy; // distance to origin in kilometers

    dx = 71.5 * (lon1 - lon2);
    dy = 111.3 * (lat1 - lat2);
    
    return [dx, dy];

    // The more accurate calculation breaks the pixel offset on the precreated maps
    //const avgLat = (lat1 + lat2) / 2 * 0.01745;
    //dx = 111.3 * Math.cos(THREE.MathUtils.degToRad(avgLat)) * (lon1 - lon2);
}

// takes in a location (in lot/lat), a direction (as a *angle*[rad, in birds eye view), and a distance (in meters) to move in the direction
export function newLocationFromPointAngle(lon1, lat1, angle, distance) {
    // angle: +-0 -> south, +pi/2 -> west, +-pi -> north, -pi/2 -> east
    let lon2, lat2;

    const dx = (distance / 1000) * Math.cos(angle);
    const dy = (distance / 1000) * Math.sin(angle);

    lon2 = lon1 - (dx / 71.5);
    lat2 = lat1 - (dy / 111.3);

    return [lon2, lat2];
}

export function getFolderNumber(imageNumber) {
    return Math.trunc(imageNumber / 100);
}