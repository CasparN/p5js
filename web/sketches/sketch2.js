(function() {
  let numStars = 25;
  let starSize = 15;
  let starSpeed = 1;
  let stars = [];
  let sideBehaviour = false;

  function setup() {
    let canvasWidth = windowWidth * 0.7;
    let canvasHeight = canvasWidth * (3 / 4);
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    noStroke();
    background(0, 0, 0);

    // Create stars for stars array
    for (let i = 0; i < numStars; i++) {
      let angle = random(TWO_PI);
      stars.push({
        x: random(width),
        y: random(height),
        dx: cos(angle),
        dy: sin(angle),
        size: random(10, starSize),
        speed: random(0.5, starSpeed)
      });
    }
  }

  function draw() {
    background(0, 0, 0, 10);
    numStars = parseInt(document.getElementById('numStars').value);
    starSize = parseInt(document.getElementById('starSize').value);
    starSpeed = parseFloat(document.getElementById('starSpeed').value);
    sideBehaviour = document.getElementById('sideBehaviour').checked;

    // Adjust the number of stars
    if (numStars > stars.length) {
      for (let i = stars.length; i < numStars; i++) {
        let angle = random(TWO_PI);
        stars.push({
          x: random(width),
          y: random(height),
          dx: cos(angle),
          dy: sin(angle),
          size: random(10, starSize),
          speed: random(0.5, starSpeed)
        });
      }
    } else if (numStars < stars.length) {
      stars.splice(numStars, stars.length - numStars);
    }

    // Update stars array and change their position using direction vector and starSpeed
    for (let i = 0; i < numStars; i++) {
      stars[i].x += stars[i].dx * starSpeed;
      stars[i].y += stars[i].dy * starSpeed;

      if (sideBehaviour) {
        // if star goes off screen, flip its direction vector
        if (stars[i].x < 0 || stars[i].x > width) {
          stars[i].dx *= -1;
        }
        if (stars[i].y < 0 || stars[i].y > height) {
          stars[i].dy *= -1;
        }
      } else {
        // If star goes off screen, reset its position
        if (stars[i].x < 0 || stars[i].x > width || stars[i].y < 0 || stars[i].y > height) {
          stars[i].x = random(width);
          stars[i].y = random(height);
          let angle = random(TWO_PI);
          stars[i].dx = cos(angle);
          stars[i].dy = sin(angle);
          stars[i].speed = random(0.5, starSpeed);
          stars[i].size = random(10, starSize);
        }
      }

      fill(255, 255, 255, 150);
      ellipse(stars[i].x, stars[i].y, stars[i].size, stars[i].size);
    }
  }

  window.setup = setup;
  window.draw = draw;
})();