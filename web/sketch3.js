(function() {
  let angle = 0;
  let colors = [];
  let numCircles = 10;
  let rotationSpeed = 0.01;
  let numCirclesSlider, rotationSpeedSlider;

  function setup() {
    let canvasWidth = windowWidth * 0.7;
    let canvasHeight = canvasWidth * (3 / 4);
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    noStroke();
    for (let i = 0; i < 10; i++) {
      colors.push([random(255), random(255), random(255)]);
    }

    // Create sliders
    numCirclesSlider = createSlider(1, 20, numCircles);
    numCirclesSlider.position(10, 10);
    rotationSpeedSlider = createSlider(0.001, 0.1, rotationSpeed, 0.001);
    rotationSpeedSlider.position(10, 40);
  }

  function draw() {
    background(0);
    translate(width / 2, height / 2);

    // Update parameters from sliders
    numCircles = numCirclesSlider.value();
    rotationSpeed = rotationSpeedSlider.value();

    for (let i = 0; i < numCircles; i++) {
      push();
      rotate(angle + i * TWO_PI / numCircles);
      translate(100, 0);
      fill(colors[i % colors.length]);
      ellipse(0, 0, 50, 50);
      pop();
    }
    angle += rotationSpeed;
  }

  window.setup = setup;
  window.draw = draw;
})();