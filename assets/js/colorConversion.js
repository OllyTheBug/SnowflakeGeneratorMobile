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