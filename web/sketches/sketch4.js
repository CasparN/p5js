(function() {
    let balls = [];
    let numBalls = 10;
    let ballSpeed = 5;
    let trail = false;
  
    function setup() {
      let canvasWidth = windowWidth * 0.7;
      let canvasHeight = canvasWidth * (3 / 4);
      let canvas = createCanvas(canvasWidth, canvasHeight);
      canvas.parent('canvas-container');
      noStroke();
      for (let i = 0; i < numBalls; i++) {
        balls.push(new Ball());
      }
    }
  
    function draw() {
      // Update parameters from sliders and checkboxes
      numBalls = parseInt(document.getElementById('numBalls').value);
      ballSpeed = parseFloat(document.getElementById('ballSpeed').value);
      trail = document.getElementById('trail').checked;
  
      if (!trail) {
        background(0);
      } else {
        background(0, 20);
      }
  
      // Adjust the number of balls
      if (balls.length < numBalls) {
        for (let i = balls.length; i < numBalls; i++) {
          balls.push(new Ball());
        }
      } else if (balls.length > numBalls) {
        balls.splice(numBalls);
      }
  
      // Update and display balls
      balls.forEach(ball => {
        ball.speed = ballSpeed;
        ball.update();
        ball.display();
      });
    }
  
    class Ball {
      constructor() {
        this.x = random(width);
        this.y = random(height);
        this.dx = random(-1, 1);
        this.dy = random(-1, 1);
        this.speed = ballSpeed;
        this.size = random(10, 30);
        this.color = [random(255), random(255), random(255)];
      }
  
      update() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
  
        if (this.x < 0 || this.x > width) this.dx *= -1;
        if (this.y < 0 || this.y > height) this.dy *= -1;
      }
  
      display() {
        fill(this.color);
        ellipse(this.x, this.y, this.size, this.size);
      }
    }
  
    window.setup = setup;
    window.draw = draw;
  })();