(function() {
    let frequency = 5;
    let amplitude = 50;
    let fillWave = true;
    let phase = 0;
    let particles = [];
  
    function setup() {
      let canvasWidth = windowWidth * 0.7;
      let canvasHeight = canvasWidth * (3 / 4);
      let canvas = createCanvas(canvasWidth, canvasHeight);
      canvas.parent('canvas-container');
      noStroke();
    }
  
    function draw() {
      background(0);
      frequency = parseFloat(document.getElementById('frequency').value);
      amplitude = parseFloat(document.getElementById('amplitude').value);
      fillWave = document.getElementById('fillWave').checked;
  
      phase += 0.1; // Controls the speed of the wave movement
  
      stroke(255);
      if (fillWave) {
        fill(100, 150, 200);
      } else {
        noFill();
      }
  
      beginShape();
      for (let x = 0; x < width; x++) {
        let angle = (x * 0.02 * frequency) + phase;
        let y = height / 2 + sin(angle) * amplitude;
        vertex(x, y);
  
        // Emit particles at wave peaks
        if (sin(angle+PI) > 0.95) { // Adjust threshold as needed
          particles.push(new Particle(x, y));
        }
      }
      endShape();
  
      // Update and display particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].display();
        if (particles[i].isFinished()) {
          particles.splice(i, 1);
        }
      }
    }
  
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = random(-1, 1);
        this.vy = random(-2, -5);
        this.alpha = 255;
        this.size = random(2, 5);
        this.color = [random(200, 255), random(100, 200), random(100, 255)];
      }
  
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 5;
      }
  
      display() {
        noStroke();
        fill(this.color[0], this.color[1], this.color[2], this.alpha);
        ellipse(this.x, this.y, this.size);
      }
  
      isFinished() {
        return this.alpha <= 0;
      }
    }
  
    window.setup = setup;
    window.draw = draw;
})();