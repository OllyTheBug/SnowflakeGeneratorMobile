function setPixel(root, source) {
    pixels[root] = source[0];
    pixels[root + 1] = source[1];
    pixels[root + 2] = source[2];
    pixels[root + 3] = source[3];
}

function xyToIndex(pos) {
    let d = 1;
    return 4 * (((pos[1] | 0) * d) * canvas.width * d + ((pos[0] | 0) * d));
}

function indexToXY(index) {
    return [((index % (canvas.width * 4)) / 4) | 0, (index / (canvas.width * 4)) | 0];
}

function rotatePoints(points, theta, center_x = canvas.width / 2, center_y = canvas.height / 2) {
    let cosTheta = Math.cos(theta);
    let sinTheta = Math.sin(theta);
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

function kaleidoscopePixelArray(center_x, center_y) {
    let angle = 2 * Math.PI / vertexCount;
    let occupiedPoints = [];
    let occupiedIndices = [];
    let newPoints = [];
    for (let i = 0; i < pixels.length / 2; i += 4) {
        if (pixels[i + 3] !== 0) {
            occupiedPoints.push(indexToXY(i));
            occupiedIndices.push(i);
        }
    }
    for (let i = 1; i < vertexCount; i++) {
        newPoints = rotatePoints(occupiedPoints, angle * i, center_x, center_y);
        for (let j = 0; j < newPoints.length; j++) {
            let index = xyToIndex(newPoints[j]);
            pixels[index] = pixels[occupiedIndices[j]];
            pixels[index + 1] = pixels[occupiedIndices[j] + 1];
            pixels[index + 2] = pixels[occupiedIndices[j] + 2];
            pixels[index + 3] = pixels[occupiedIndices[j] + 3];
        }
    }
}

function mirrorPixelArrayAcrossVertical() {
    for (let i = 0; i < fallingParticles.length; i++) {
        let particle = fallingParticles[i];
        let pos = particle.pos;
        let newPos = [canvas.width - pos[0], pos[1]];
        let newIndex = xyToIndex(newPos);
        setPixel(newIndex, particle.color);
    }
    for (let i = 0; i < lockedIndicesList.length; i++) {
        let pos = indexToXY(lockedIndicesList[i]);
        let newPos = [canvas.width - pos[0], pos[1]];
        let newIndex = xyToIndex(newPos);
        setPixel(newIndex, indexColors[i]);
    }
}