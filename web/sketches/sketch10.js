(function () {
    let ribbonCount = 8;
    let ribbonWidth = 15;
    let flowSpeed = 1.0;
    let colorSpeed = 1.0;
    let fadeTrail = true;
    let rainbowMode = true;
  
    let ribbons = [];
    let time = 0;
  
    class Ribbon {
      constructor(offset) {
        this.points = [];
        // Assign each ribbon a starting hue based on its offset
        this.hue = (offset * 360 / ribbonCount) % 360;
        this.offset = offset;
      }
  
      addPoint(x, y) {
        // Prepend a new point, remove the oldest if too many
        this.points.unshift({ x, y, age: 0 });
        if (this.points.length > 50) {
          this.points.pop();
        }
      }
  
      update() {
        // Increment the age of every point
        this.points.forEach(p => p.age++);
  
        // Remove points older than 100 frames
        this.points = this.points.filter(p => p.age < 100);
  
        // Shift hue if rainbow mode is active
        if (rainbowMode) {
          this.hue = (this.hue + colorSpeed) % 360;
        }
      }
  
      draw() {
        if (this.points.length < 2) return;
  
        beginShape();
        noFill();
  
        // Draw pairs of vertices for each point
        for (let i = 0; i < this.points.length - 1; i++) {
          const p = this.points[i];
          const next = this.points[i + 1];
  
          // Fade out older points if fadeTrail is on
          const alpha = fadeTrail ? map(p.age, 0, 100, 1, 0) : 0.8;
  
          // Find the direction from this point to the next
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const angle = atan2(dy, dx);
  
          // Compute perpendicular vector to draw the ribbon “edges”
          const perpX = sin(angle) * ribbonWidth;
          const perpY = -cos(angle) * ribbonWidth;
  
          // Add a “wave” motion along the ribbon
          const wave = sin(time * flowSpeed + this.offset + i * 0.1) * ribbonWidth * 0.5;
          const waveX = perpX + sin(time * 0.5 + i * 0.1) * wave;
          const waveY = perpY + cos(time * 0.5 + i * 0.1) * wave;
  
          // Choose stroke color
          if (rainbowMode) {
            stroke(this.hue, 80, 100, alpha);
          } else {
            // If not rainbow, default to white (RGB) with alpha
            stroke(255, alpha * 255);
          }
  
          // Draw the “left” and “right” edges around the center point
          strokeWeight(2);
          vertex(p.x + waveX, p.y + waveY);
          vertex(p.x - waveX, p.y - waveY);
        }
        endShape();
      }
    }
  
    function setup() {
      let canvasWidth = windowWidth * 0.7;
      let canvasHeight = canvasWidth * (3 / 4);
      let canvas = createCanvas(canvasWidth, canvasHeight);
      canvas.parent("canvas-container");
      colorMode(HSB, 360, 100, 100, 1);
  
      // Initialize ribbons
      for (let i = 0; i < ribbonCount; i++) {
        ribbons.push(new Ribbon(i));
      }
    }
  
    function draw() {
      // Update parameters from UI
      ribbonCount = parseInt(document.getElementById("ribbonCount").value);
      ribbonWidth = parseFloat(document.getElementById("ribbonWidth").value);
      flowSpeed = parseFloat(document.getElementById("flowSpeed").value);
      colorSpeed = parseFloat(document.getElementById("colorSpeed").value);
      fadeTrail = document.getElementById("fadeTrail").checked;
      rainbowMode = document.getElementById("rainbowMode").checked;
  
      // Light background fade if trails are on, darker if off
      background(0, fadeTrail ? 0.1 : 0.2);
  
      // Adjust number of ribbons to match ribbonCount
      while (ribbons.length < ribbonCount) {
        ribbons.push(new Ribbon(ribbons.length));
      }
      while (ribbons.length > ribbonCount) {
        ribbons.pop();
      }
  
      // Advance time slightly each frame
      time += 0.05;
  
      // If no mouse movement, default to center
      const targetX = mouseX || width / 2;
      const targetY = mouseY || height / 2;
  
      // Update and draw each ribbon
      ribbons.forEach((ribbon, i) => {
        // Spread ribbons around a circle orbit
        const offset = (i * TWO_PI) / ribbonCount;
        const radius = 20;
  
        // Position “orbiting” around the mouse or center
        const x = targetX + cos(time * flowSpeed + offset) * radius;
        const y = targetY + sin(time * flowSpeed + offset) * radius;
  
        ribbon.addPoint(x, y);
        ribbon.update();
        ribbon.draw();
      });
    }
  
    function windowResized() {
      let canvasWidth = windowWidth * 0.7;
      let canvasHeight = canvasWidth * (3 / 4);
      resizeCanvas(canvasWidth, canvasHeight);
    }
  
    window.setup = setup;
    window.draw = draw;
    window.windowResized = windowResized;
  })();