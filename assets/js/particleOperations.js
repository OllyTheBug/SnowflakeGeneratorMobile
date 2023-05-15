function fall(particle) {
    particle.pos[1] += 1;
    let horizontalStep = getRandomInt(-leftness, rightness);
    particle.pos[0] += horizontalStep;
}

function land(particle) {
    let index = xyToIndex(particle.pos);
    lockedIndicesList.push(index);
    lockedIndexMatrix[index / 4] = 1;
    indexColors.push(particle.color);
}

function pixelAtVCenter(particle) {
    return xyToIndex(particle.pos) >= centerHorizontal; //y = height/2
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
    for (let i = 0; i < fallingParticles.length; i++) {
        if (pixelAtVCenter(fallingParticles[i]) || particleAdjacentToLanded(fallingParticles[i])) {
            land(fallingParticles[i]);
            fallingParticles.splice(i, 1);
        } else {
            fall(fallingParticles[i]);
        }
    }
}

function landedToPixelArray() {
    for (let i = 0; i < lockedIndicesList.length; i++) {
        pixels[lockedIndicesList[i]] = indexColors[i][0];
        pixels[lockedIndicesList[i] + 1] = indexColors[i][1];
        pixels[lockedIndicesList[i] + 2] = indexColors[i][2];
        pixels[lockedIndicesList[i] + 3] = indexColors[i][3];
    }
}

function addFallingParticlesToPixelArray() {
    for (let i = 0; i < fallingParticles.length; i++) {
        particleToPixelArray(fallingParticles[i]);
    }
}

function particleToPixelArray(particle) {
    let root = xyToIndex(particle.pos);
    setPixel(root, particle.color);
}

function clearParticles(){
    fallingParticles = [];
    lockedIndicesList = [];
    indexColors = [];
    lockedIndexMatrix = new Array(Math.ceil((canvas.width * canvas.height) / 4)).fill(0);
}