let centerHorizontal;
let leftness = 2;
let rightness = 2;
let oscillationSpeed = 0.5;
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
let drawFrameId;

function initPage() {
    canvas = document.getElementById("canvas");
    // set canvas size to minimum of 400x400 and window size
    canvas.width = Math.min(400, screen.width);
    canvas.height = canvas.width;
    ctx = canvas.getContext("2d");
    centerHorizontal = (canvas.width * 4) * (canvas.height / 2);
    emitterPixel = (canvas.width * 2 + 4);
    imagedata = ctx.createImageData(canvas.width, canvas.height);
    pixels = imagedata.data;
    initApp();
}

function initApp() {
    window.cancelAnimationFrame(drawFrameId);
    spawning = true;
    pixels.fill(0);
    fallingParticles = [];
    lockedIndexesList = [];
    lockedIndexMatrix = new Array(Math.ceil((canvas.width * canvas.height) / 4)).fill(0);
    drawFrameId = window.requestAnimationFrame(draw);
}

function draw() {
    //clear canvas
    pixels.fill(0);

    const time = new Date();
    //print out second count
    if(time.getMilliseconds() % 1000 == 0){
        console.log(time.getSeconds());
    }
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
    drawFrameId = window.requestAnimationFrame(draw);
}

initPage()
ctx.putImageData(imagedata, 0, 0);



