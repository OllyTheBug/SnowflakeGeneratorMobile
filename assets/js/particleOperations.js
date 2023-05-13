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

function clearParticles(){
    fallingParticles = [];
    lockedIndexesList = [];
    indexColors = [];
    lockedIndexMatrix = new Array(Math.ceil((canvas.width * canvas.height) / 4)).fill(0);
}