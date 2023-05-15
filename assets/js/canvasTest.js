// Using globals for code simplicity. There's really just one big namespace. Will refactor if it starts to grow too much.
const fallingLimit = 1000;
let fallingParticles = [];
// Storing indicies in two ways for efficiency:
// A list used for iterating and a matrix used for checking if a pixel is occupied (collision).
let lockedIndicesList = []; // Pixel indices that are occupied by a landed particle.
let lockedIndexMatrix = []; // All indicies represented, occupied or not. 0 = unoccupied, 1 = occupied.
let indexColors = []; // For color of landed particles.
let currentColor = [0, 255, 255, 255]

let ctx;
let pixels;
let spawning = true;
let drawFrameId;
let centerHorizontal;

let leftness = 2, // How much each particle blows to the left or right each frame while falling.
    rightness = 2,
    oscillationSpeed = 0.5, // Color oscillation speed.
    selectedColor = [0, 255, 255, 255],
    vertexCount = 4, // symmetry shape/number of "branches".
    emitterPixel;


function initPage() {
    canvas = document.getElementById("canvas");
    canvas.width = Math.min(800, screen.width);
    canvas.height = canvas.width; // It's a square.
    ctx = canvas.getContext("2d");
    imagedata = ctx.createImageData(canvas.width, canvas.height);
    pixels = imagedata.data;

    centerHorizontal = (canvas.width * 4) * (canvas.height / 2);
    emitterPixel = (canvas.width * 2 + 4);

    initApp();
}

function initApp() {
    window.cancelAnimationFrame(drawFrameId); // To not recursively call draw() when restarting. Prevents speedup.
    spawning = true;
    fallingParticles = [];
    lockedIndicesList = [];
    lockedIndexMatrix = new Array(Math.ceil((canvas.width * canvas.height) / 4)).fill(0);

    drawFrameId = window.requestAnimationFrame(draw);
}

function draw() {
    // Reset image data
    pixels.fill(0);
    // Erase visible canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const time = new Date();

    currentColor = oscillationSpeed > 0 ? oscilateColor(time.getTime()) : selectedColor;

    if (fallingParticles.length < fallingLimit && spawning) {
        fallingParticles.push({pos: indexToXY(emitterPixel), color: currentColor});
        // If new spawn is adjacent to landed particle, the snowflake is complete
        if (particleAdjacentToLanded(fallingParticles[fallingParticles.length - 1])) {
            spawning = false;
        }
    }

    
    addFallingParticlesToPixelArray();
    updateFallingParticles();
    landedToPixelArray();

    mirrorPixelArrayAcrossVertical();
    kaleidoscopePixelArray(canvas.width / 2, canvas.height / 2);

    ctx.putImageData(imagedata, 0, 0);
    drawFrameId = window.requestAnimationFrame(draw);
}

initPage()
ctx.putImageData(imagedata, 0, 0);



