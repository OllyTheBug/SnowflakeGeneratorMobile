let centerHorizontal;
let leftness = 4;
let rightness = 1;
let density = 10;
let oscillationSpeed = 0;
let selectedColor = [0, 255, 255, 255];
/* -------------------------------- INTERNAL -------------------------------- */
const fallingLimit = 1000;
const sin45 = Math.sin(Math.PI / 4);
const cos45 = Math.cos(Math.PI / 4);
let fallingParticles = [];
let emitterPixel;
let lockedIndexes = [];
let currentColor = [0, 255, 255, 255]
let indexColors = [];
let img;
let ctx;
let pixels;

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    imagedata = ctx.createImageData(canvas.width, canvas.height);

    pixels = imagedata.data;

    centerHorizontal = (canvas.width * 4) * (canvas.height / 2);
    emitterPixel = (canvas.width * 2 + 4);
    lockedIndexes = Array(canvas.width * canvas.height).fill(0);
    indexColors = Array(canvas.width * canvas.height).fill(0);

    window.requestAnimationFrame(draw);
}

function draw() {
    //clear pixels
    for (let i = 0; i < pixels.length; i++) {
        pixels[i] = 0;
    }

    const time = new Date();
    // Spawn particle
    if (fallingParticles.length < fallingLimit && time.getMilliseconds() % 2 == 0) {
        fallingParticles.push({ pos: indexToXY(emitterPixel), color: currentColor });
        // If new spawn is adjacent to landed particle, the snowflake is complete
        if (particleAdjacentToLanded(fallingParticles[fallingParticles.length - 1])) {
            noLoop();
            console.log("done");
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    addFallingParticlesToPixelArray();
    updateFallingParticles();
    landedToPixelArray();
    mirrorPixelArrayAcrossVertical();

    ctx.putImageData(imagedata, 0, 0);
    window.requestAnimationFrame(draw);
}
init()

function xyToIndex(pos) {
    let d = 1;
    index = 4 * ((Math.floor(pos[1]) * d) * canvas.width * d + (Math.floor(pos[0]) * d));
    return index;
    //return round(pos[0] * 4 + pos[1] * canvas.width * 4);
}

function indexToXY(index) {
    return [Math.floor((index % (canvas.width * 4)) / 4), Math.floor(index / (canvas.width * 4))];
}

function fall(particle) {
    particle.pos[1] += 1;
    particle.pos[0] += Math.round(Math.random(-leftness, rightness));
}

function land(particle) {
    const root = xyToIndex(particle.pos);
    lockedIndexes[root / 4] = 1;
    indexColors[root / 4] = particle.color;

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
        if (lockedIndexes[adjacents[i] / 4] === 1) {
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
    for (let i = 0; i < lockedIndexes.length; i++) {
        if (lockedIndexes[i] === 1) {
            pixels[i * 4] = indexColors[i][0];
            pixels[i * 4 + 1] = indexColors[i][1];
            pixels[i * 4 + 2] = indexColors[i][2];
            pixels[i * 4 + 3] = indexColors[i][3];
        }
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

function rotatePixels(points, theta, center_x = 400, center_y = 400) {
    let newPoints = [];
    let x, y;
    for (let i = 0; i < points.length; i++) {
        x = points[i][0];
        y = points[i][1];
        let xp = (x - center_x) * Math.cos(theta) - (y - center_y) * Math.sin(theta) + center_x;
        let yp = (x - center_x) * Math.sin(theta) + (y - center_y) * Math.cos(theta) + center_y;
        newPoints.push([xp, yp]);
    }
    points = newPoints;
}

function mirrorPixelArrayAcrossVertical() {
    for (let i = 0; i < pixels.length; i += 4) {
        // if pixel (x,y) is white, make pixel (-y,x) white
        if (pixels[i + 3] === 255) {
            let pos = indexToXY(i);
            let newPos = [canvas.width - pos[0], pos[1]];
            let newIndex = xyToIndex(newPos);
            pixels[newIndex] = pixels[i];
            pixels[newIndex + 1] = pixels[i + 1];
            pixels[newIndex + 2] = pixels[i + 2];
            pixels[newIndex + 3] = pixels[i + 3];
        }
    }
}