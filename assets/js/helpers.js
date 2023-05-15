function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function oscilateColor(timeMillis) {
    let hue = (timeMillis / (30 - oscillationSpeed)) % 360; // Should change this expression, reciprocals make for weird controls.
    let sat = 1;
    let val = 1;
    return HSVtoRGB(hue, sat, val);
}
