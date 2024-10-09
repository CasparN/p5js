(function() {
  let angle = 0;
  let colors = [];
  let numCircles = 10;
  let rotationSpeed = 0.01;

  function setup() {
    let canvasWidth = windowWidth * 0.7;
    let canvasHeight = canvasWidth * (3 / 4);
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    noStroke();
    for (let i = 0; i < 10; i++) {
      colors.push([random(255), random(255), random(255)]);
    }
  }

  function draw() {
    background(0);
    translate(width / 2, height / 2);

    // Update parameters from HTML sliders
    numCircles = parseInt(document.getElementById('numCircles').value);
    rotationSpeed = parseFloat(document.getElementById('rotationSpeed').value);
    circleSize = parseFloat(document.getElementById('circleSize').value);
    diameter = parseFloat(document.getElementById('diameter').value);

    for (let i = 0; i < numCircles; i++) {
      push();
      rotate(angle + i * TWO_PI / numCircles);
      translate(diameter, 0);
      fill(colors[i % colors.length]);
      ellipse(0, 0, circleSize, circleSize);
      pop();
    }
    angle += rotationSpeed;
  }

  window.setup = setup;
  window.draw = draw;
})();