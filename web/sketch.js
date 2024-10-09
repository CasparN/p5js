function setup() {
  createCanvas(400, 400);
  noStroke();
}

function draw() {
  background(255);
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