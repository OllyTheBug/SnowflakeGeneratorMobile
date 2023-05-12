let centerHorizontal;
let leftness = 4;
let rightness = 1;
let oscillationSpeed = 0;
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

function init() {
    canvas = document.getElementById("canvas");
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    const time = new Date();
    // Spawn particle
    if (fallingParticles.length < fallingLimit && time.getMilliseconds() % 2 == 0) {
        fallingParticles.push({pos: indexToXY(emitterPixel), color: currentColor});
        // If new spawn is adjacent to landed particle, the snowflake is complete
        if (particleAdjacentToLanded(fallingParticles[fallingParticles.length - 1])) {
            console.log("done");
            return;
        }
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

function xyToIndex(pos) {
    let d = 1;
    index = 4 * (((pos[1] | 0) * d) * canvas.width * d + ((pos[0] | 0) * d));
    return index;
    //return round(pos[0] * 4 + pos[1] * canvas.width * 4);
}

function indexToXY(index) {
    return [((index % (canvas.width * 4)) / 4) | 0, (index / (canvas.width * 4)) | 0];
}

function fall(particle) {
    particle.pos[1] += 1;
    particle.pos[0] += Math.round(Math.random(-leftness, rightness));
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
        return fallingParticle.pos[0] <= 50 || fallingParticle.pos[0] >= canvas.width - 50 || fallingParticle.pos[1] >= canvas.height - 500;
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