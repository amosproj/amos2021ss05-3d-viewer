export const DEFAULT_FOV = 80, MAX_FOV = 100, MIN_FOV = 10;

export function distanceWGS84TwoPoints(lon1, lat1, lon2, lat2) {
    // Distance calculation math roughly taken from here https://www.mkompf.com/gps/distcalc.html
    let dx, dy; // distance to origin in kilometers

    const avgLat = (lat1 + lat2) / 2 * 0.01745;
    dx = 111.3 * Math.cos(THREE.MathUtils.degToRad(avgLat)) * (lon1 - lon2);
    dy = 111.3 * (lat1 - lat2);
    
    return [dx, dy];
}