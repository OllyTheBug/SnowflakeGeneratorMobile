document.querySelector("#widthSliderRange").addEventListener("input", function () {
    leftness = this.value;
    rightness = this.value;
});

document.querySelector("#separationSliderRange").addEventListener("input", function () {
    rightness = leftness * (1 / this.value);
});

document.querySelector("#color-picker").addEventListener("input", function () {
    selectedColor = hexToRgb(this.value);
    oscillationSpeed = 0;
    document.querySelector("#colorOscillatorRange").value = 0;
});

document.querySelector("#colorOscillatorRange").addEventListener("input", function () {
    oscillationSpeed = this.value;
    console.log(`oscillationSpeed changed to ${this.value}`);
});
// buttons

document.querySelector("#startButton").addEventListener("click", function () {
    running = false;
    initApp();

});

document.querySelector("#stopButton").addEventListener("click", function () {
    spawning = false;
});

document.querySelector("#clearButton").addEventListener("click", function () {
    pixels.fill(0);
    clearParticles();
});