(function() {
  function setup() {
    let canvasWidth = windowWidth * 0.7;
    let canvasHeight = canvasWidth * (3 / 4);
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    noStroke();
  }

  function draw() {
    background(0);
    drawRandomStars();
  }

  function drawRandomStars() {
    let x = random(width);
    let y = random(height);
    let size = random(5, 15);
    let r = random(255);
    let g = random(255);
    let b = random(255);

    fill(r, g, b, 150);
    star(x, y, size, size * 2, 5);
  }

  function star(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius2;
      let sy = y + sin(a) * radius2;
      vertex(sx, sy);
      sx = x + cos(a + halfAngle) * radius1;
      sy = y + sin(a + halfAngle) * radius1;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }

  window.setup = setup;
  window.draw = draw;
})();