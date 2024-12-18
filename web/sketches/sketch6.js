(function() {
    let particles = [];
    let particleCount = 200;
    let particleSize = 5;
    let particleSpeed = 5;
    let smokeAmount = 50;
    let wind = false;
    let colorVariation = true;
    let img;

    // function preload() {
    //     img = loadImage('../img/sketch6.png');
    // }

    function setup() {
      let canvasWidth = windowWidth * 0.7;
      let canvasHeight = canvasWidth * (3 / 4);
      let canvas = createCanvas(canvasWidth, canvasHeight);
      canvas.parent('canvas-container');
      noStroke();
      img = loadImage('img/sketch6.png');
    }
  
    function draw() {
      background(10,10,70);
      if (img) {
        // Scale image to fit canvas
        image(img, 0, height/2, width, width/2);
        console.log('did da img');
        } else {console.log('no img');}
      // Update parameters from sliders and checkboxes
      particleCount = parseInt(document.getElementById('particleCount').value);
      particleSize = parseFloat(document.getElementById('particleSize').value);
      particleSpeed = parseFloat(document.getElementById('particleSpeed').value);
      smokeAmount = parseFloat(document.getElementById('smokeAmount').value);
      wind = document.getElementById('wind').checked;
      colorVariation = document.getElementById('colorVariation').checked;
  
      // Calculate emission rate based on particleCount
      let emissionRate = particleCount / 60; // Adjust divisor based on desired effect and frame rate
  
      // Generate new particles
      for (let i = 0; i < emissionRate; i++) {
        particles.push(new Particle());
      }
  
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
      constructor() {
        this.dx = width - 340; // Adjust x position based on desired effect
        this.x = random(this.dx / 2 - 20, this.dx / 2 + 20);
        this.y = height-225;
        this.vx = wind ? random(-2, 2) : 0;
        this.vy = random(-particleSpeed - 2, -particleSpeed);
        this.alpha = 255;
        this.size = random(particleSize - 2, particleSize + 2);
        if (colorVariation) {
          this.color = [random(200, 255), random(50, 150), 0];
        } else {
          this.color = [255, 100, 0];
        }
      }
  
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 2;
        this.vy -= -0.1, -0.1;
      }
  
      display() {
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