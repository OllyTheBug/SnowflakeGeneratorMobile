let points = [];
let drawing = false;
let pixels = [];
let canvas;
let ctx;
let imagedata

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    imagedata = ctx.createImageData(canvas.width, canvas.height);
    window.requestAnimationFrame(draw);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    pixels = imagedata.data;
    //draw random dot on canvas
    points.push([Math.random() * canvas.width, Math.random() * canvas.height]);
    rotatePoints((2 * Math.PI) / 3, canvas.width / 2, canvas.height / 2);
    pointsToPixelArray();
    ctx.putImageData(imagedata, 0, 0);

    window.requestAnimationFrame(draw);


    // ctx.putImageData()


    // background(0);
    // loadPixels();
    // if (drawing) {
    //     pointAtMouse();
    // }
    // pointsToPixelArray();
    // rotatePoints((2 * PI) / 200);
    // updatePixels();

}

init();

function xyToIndex(pos) {
    let d = 1;
    index = 4 * ((Math.floor(pos[1]) * d) * canvas.width * d + (Math.floor(pos[0]) * d));
    return index;
    //return round(pos[0] * 4 + pos[1] * canvas.width * 4);
}

function pointsToPixelArray() {
    let index;
    for (let i = 0; i < points.length; i++) {
        index = xyToIndex(points[i]);
        pixels[index] = 255;
        pixels[index + 1] = 255;
        pixels[index + 2] = 255;
        pixels[index + 3] = 255;
    }
}
function rotatePoints(theta, center_x = 400, center_y = 400) {
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