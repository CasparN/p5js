(function() {
  function setup() {
    let canvasWidth = windowWidth * 0.7;
    let canvasHeight = canvasWidth * (3 / 4);
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    noStroke();
    background(0, 0, 0);
  }

  function draw() {
    background(0, 0, 0, 1);
    drawRandomShapes();
  }

  function drawRandomShapes() {
    let x = random(width);
    let y = random(height);
    let size = random(10, 50);
    let shapeType = random(['ellipse', 'rect']);
    let r = random(255);
    let g = random(255);
    let b = random(255);

    fill(r, g, b, 150);

    if (shapeType === 'ellipse') {
      ellipse(x, y, size, size);
    } else {
      rect(x, y, size, size);
    }
  }

  window.setup = setup;
  window.draw = draw;
})();