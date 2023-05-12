let centerHorizontal;
let leftness = 2;
let rightness = 2;
let oscillationSpeed = 1;
let selectedColor = [0, 255, 255, 255];
/* -------------------------------- INTERNAL -------------------------------- */
const fallingLimit = 1000;
let fallingParticles = [];
let emitterPixel;
let lockedIndexesList = [];
let lockedIndexMatrix = [];
let currentColor = [0, 255, 255, 255]
let indexColors = [];
let ctx;
let pixels;
let spawning = true;
function init() {
    canvas = document.getElementById("canvas");

    // set canvas size to minimum of 400x400 and window size
    canvas.width = Math.min(400, window.innerWidth);
    canvas.height = canvas.width;

    ctx = canvas.getContext("2d");

    imagedata = ctx.createImageData(canvas.width, canvas.height);

    pixels = imagedata.data;

    centerHorizontal = (canvas.width * 4) * (canvas.height / 2);
    emitterPixel = (canvas.width * 2 + 4);
    lockedIndexMatrix = new Array((canvas.width * canvas.height) / 4).fill(0);

    window.requestAnimationFrame(draw);
}

function draw() {
    //clear canvas
    pixels.fill(0);

    const time = new Date();
    currentColor = oscillationSpeed > 0 ? oscilateColor(time.getTime()) : selectedColor;
    // Spawn particle
    if (fallingParticles.length < fallingLimit && time.getMilliseconds() % 1 == 0 && spawning) {
        fallingParticles.push({pos: indexToXY(emitterPixel), color: currentColor});
        // If new spawn is adjacent to landed particle, the snowflake is complete
        if (particleAdjacentToLanded(fallingParticles[fallingParticles.length - 1])) {
            spawning = false;
        }
    }
    if (spawning == false && fallingParticles.length == 0) {
        console.log("done");
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    addFallingParticlesToPixelArray();
    updateFallingParticles();
    landedToPixelArray();
    mirrorPixelArrayAcrossVertical();
    pentagonizePixelArray(canvas.width / 2, canvas.height / 2);
    ctx.putImageData(imagedata, 0, 0);
    window.requestAnimationFrame(draw);
}

init()
ctx.putImageData(imagedata, 0, 0);

function xyToIndex(pos) {
    let d = 1;
    index = 4 * (((pos[1] | 0) * d) * canvas.width * d + ((pos[0] | 0) * d));
    return index;
}

function indexToXY(index) {
    return [((index % (canvas.width * 4)) / 4) | 0, (index / (canvas.width * 4)) | 0];
}

function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function fall(particle) {
    particle.pos[1] += 1;
    let hstep = getRandomInt(-leftness, rightness);
    particle.pos[0] += hstep;
}

function land(particle) {
    let index = xyToIndex(particle.pos);
    lockedIndexesList.push(index);
    lockedIndexMatrix[index / 4] = 1;
    indexColors.push(particle.color);

}

function pixelAtVCenter(particle) {
    // if pixel index is at or below the center of the screen, return false
    return xyToIndex(particle.pos) >= centerHorizontal;

}

function particleAdjacentToLanded(particle) {
    let root = xyToIndex(particle.pos);
    //check the eight pixels surrounding the particleA
    let adjacents = [root - 4,
        root + 4,
        root - (canvas.width * 4),
        root + (canvas.width * 4),
        root - (canvas.width * 4) - 4,
        root - (canvas.width * 4) + 4,
        root + (canvas.width * 4) - 4,
        root + (canvas.width * 4) + 4]
    for (let i = 0; i < adjacents.length; i++) {
        if (lockedIndexMatrix[adjacents[i] / 4] === 1) {
            return true;
        }
    }
    return false;
}

function updateFallingParticles() {
    function atBoundary(fallingParticle) {
        return false
        //return fallingParticle.pos[0] <= 50 || fallingParticle.pos[0] >= canvas.width - 50 || fallingParticle.pos[1] >= canvas.height - 500;
    }

    for (let i = 0; i < fallingParticles.length; i++) {
        if (pixelAtVCenter(fallingParticles[i]) || particleAdjacentToLanded(fallingParticles[i]) || atBoundary(fallingParticles[i])) {
            land(fallingParticles[i]);
            fallingParticles.splice(i, 1);
        } else {
            fall(fallingParticles[i]);
        }
    }
}

function landedToPixelArray() {
    for (let i = 0; i < lockedIndexesList.length; i++) {
        pixels[lockedIndexesList[i]] = indexColors[i][0];
        pixels[lockedIndexesList[i] + 1] = indexColors[i][1];
        pixels[lockedIndexesList[i] + 2] = indexColors[i][2];
        pixels[lockedIndexesList[i] + 3] = indexColors[i][3];
    }
}

function addFallingParticlesToPixelArray() {
    for (let i = 0; i < fallingParticles.length; i++) {
        particleToPixelArray(fallingParticles[i]);
    }
}

function particleToPixelArray(particle) {
    let root = xyToIndex(particle.pos);
    pixels[root] = particle.color[0];
    pixels[root + 1] = particle.color[1];
    pixels[root + 2] = particle.color[2];
    pixels[root + 3] = particle.color[3];
}

function rotatePoints(points, angle, center_x = 400, center_y = 400) {
    cosTheta = Math.cos(angle);
    sinTheta = Math.sin(angle);
    let newPoints = [];
    let x, y;
    for (let i = 0; i < points.length; i++) {
        x = points[i][0];
        y = points[i][1];
        let xp = (x - center_x) * cosTheta - (y - center_y) * sinTheta + center_x;
        let yp = (x - center_x) * sinTheta + (y - center_y) * cosTheta + center_y;
        newPoints.push([xp, yp]);
    }
    return newPoints;
}

// let xp = (x - center_x) * c_theta - (y - center_y) * s_theta + center_x;
// let yp = (x - center_x) * s_theta + (y - center_y) * c_theta + center_y;
function pentagonizePixelArray(center_x, center_y) {
    let angle = 2 * Math.PI / 5;

    let occupiedPoints = [];
    let occupiedIndexes = [];
    let newPoints = [];
    for (i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] !== 0) {
            occupiedPoints.push(indexToXY(i));
            occupiedIndexes.push(i);
        }
    }
    // rotate by 2PI/6 5 times
    for (i = 1; i < 5; i++) {
        newPoints = rotatePoints(occupiedPoints, angle * i, center_x, center_y);
        for (j = 0; j < newPoints.length; j++) {
            let index = xyToIndex(newPoints[j]);
            pixels[index] = pixels[occupiedIndexes[j]];
            pixels[index + 1] = pixels[occupiedIndexes[j] + 1];
            pixels[index + 2] = pixels[occupiedIndexes[j] + 2];
            pixels[index + 3] = 255;
        }

    }
}

function mirrorPixelArrayAcrossVertical() {
    for (let i = 0; i < fallingParticles.length; i++) {
        let particle = fallingParticles[i];
        let pos = particle.pos;
        let newPos = [canvas.width - pos[0], pos[1]];
        let newIndex = xyToIndex(newPos);
        pixels[newIndex] = particle.color[0];
        pixels[newIndex + 1] = particle.color[1];
        pixels[newIndex + 2] = particle.color[2];
        pixels[newIndex + 3] = particle.color[3];

    }
    for (let i = 0; i < lockedIndexesList.length; i++) {
        let pos = indexToXY(lockedIndexesList[i]);
        let newPos = [canvas.width - pos[0], pos[1]];
        let newIndex = xyToIndex(newPos);
        pixels[newIndex] = indexColors[i][0];
        pixels[newIndex + 1] = indexColors[i][1];
        pixels[newIndex + 2] = indexColors[i][2];
        pixels[newIndex + 3] = indexColors[i][3];

    }

}

document.querySelector("#widthSliderRange").addEventListener("input", function () {
    leftness = this.value;
    rightness = this.value;
    console.log(`widthSliderRange changed to ${this.value}`);
    console.log(`leftness is ${leftness}`);
});

document.querySelector("#color-picker").addEventListener("input", function () {
    selectedColor = hexToRgb(this.value);
    oscillationSpeed = 0;
    document.querySelector("#colorOscillatorRange").value = 0;
});

document.querySelector("#colorOscillatorRange").addEventListener("input", function () {
    oscillationSpeed = this.value;
    console.log(`oscillationSpeed changed to ${this.value}`);
});
function oscilateColor(timeMillis) {
    let ratio = 30/ oscillationSpeed;
    let hue = (timeMillis/(30-oscillationSpeed)) % 360;
    let sat = 1;
    let val = 1;
    return HSVtoRGB(hue, sat, val);
}
function hexToRgb(hex) {
    if (hex.length === 4) {
        hex = hex + hex[1] + hex[2] + hex[3];
    }
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    let a = 255;
    return [r, g, b, a];
}

function HSVtoRGB(hue, sat, val) {
    let chroma = val * sat;
    let huePrime = hue / 60;
    let x = chroma * (1 - Math.abs((huePrime % 2) - 1));
    let r1, g1, b1;
    if (huePrime >= 0 && huePrime <= 1) {
        [r1, g1, b1] = [chroma, x, 0];
    } else if (huePrime >= 1 && huePrime <= 2) {
        [r1, g1, b1] = [x, chroma, 0];
    } else if (huePrime >= 2 && huePrime <= 3) {
        [r1, g1, b1] = [0, chroma, x];
    } else if (huePrime >= 3 && huePrime <= 4) {
        [r1, g1, b1] = [0, x, chroma];
    } else if (huePrime >= 4 && huePrime <= 5) {
        [r1, g1, b1] = [x, 0, chroma];
    } else if (huePrime >= 5 && huePrime <= 6) {
        [r1, g1, b1] = [chroma, 0, x];
    }
    let m = val - chroma;
    let [r, g, b] = [r1 + m, g1 + m, b1 + m];
    return [r * 255, g * 255, b * 255, 255];
}