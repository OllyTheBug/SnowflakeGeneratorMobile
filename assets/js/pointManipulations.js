function xyToIndex(pos) {
    let d = 1;
    return 4 * (((pos[1] | 0) * d) * canvas.width * d + ((pos[0] | 0) * d));
}

function indexToXY(index) {
    return [((index % (canvas.width * 4)) / 4) | 0, (index / (canvas.width * 4)) | 0];
}

function rotatePoints(points, angle, center_x = 400, center_y = 400) {
    let cosTheta = Math.cos(angle);
    let sinTheta = Math.sin(angle);
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

function pentagonizePixelArray(center_x, center_y) {
    let angle = 2 * Math.PI / 5;

    let occupiedPoints = [];
    let occupiedIndexes = [];
    let newPoints = [];
    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] !== 0) {
            occupiedPoints.push(indexToXY(i));
            occupiedIndexes.push(i);
        }
    }
    // rotate by 2PI/6 5 times
    for (let i = 1; i < 5; i++) {
        newPoints = rotatePoints(occupiedPoints, angle * i, center_x, center_y);
        for (let j = 0; j < newPoints.length; j++) {
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