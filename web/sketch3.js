(function() {
  let angle = 0;
  let colors = [];

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
    for (let i = 0; i < 10; i++) {
      push();
      rotate(angle + i * TWO_PI / 10);
      translate(100, 0);
      fill(colors[i]);
      ellipse(0, 0, 50, 50);
      pop();
    }
    angle += 0.01;
  }

  window.setup = setup;
  window.draw = draw;
})();