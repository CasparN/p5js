(function () {
    let humanThoughts = [];
    let backgroundProcessing = [];
    let lastMouseX, lastMouseY;
    let activeState = true;
    let inactiveTimer = 0;
    let colorWheel;
    let bodyOutline;
  
    function setup() {
      let canvasWidth = windowWidth * 0.7;
      let canvasHeight = canvasWidth * (3 / 4);
      let canvas = createCanvas(canvasWidth, canvasHeight);
      canvas.parent('canvas-container');
      colorMode(HSB, 360, 100, 100, 1);
      background(0);
  
      // Initialize thought particles
      for (let i = 0; i < 100; i++) {
        humanThoughts.push({
          x: random(width),
          y: random(height),
          size: random(3, 8),
          speed: random(0.5, 2),
          angle: random(TWO_PI),
          color: color(random(360), 80, 95, 0.7),
        });
      }
  
      for (let i = 0; i < 50; i++) {
        backgroundProcessing.push({
          x: random(width),
          y: random(height),
          size: random(2, 5),
          speed: random(0.1, 0.5),
          angle: random(TWO_PI),
          color: color(random(180, 240), 70, 90, 0.5),
        });
      }
  
      // Create color wheel (inspired by Claude logo)
      colorWheel = createGraphics(150, 150);
      drawColorWheel(colorWheel);
  
      // Create body outline
      bodyOutline = createGraphics(200, 400);
      drawBodyOutline(bodyOutline);
  
      lastMouseX = mouseX;
      lastMouseY = mouseY;
    }
  
    function draw() {
      // Fade background slightly for trail effect
      fill(0, 0, 0, 0.1);
      rect(0, 0, width, height);
  
      // Check if mouse is moving
      let mouseMoving = dist(mouseX, mouseY, lastMouseX, lastMouseY) > 1;
  
      // Update inactive timer
      if (mouseMoving) {
        inactiveTimer = 0;
        activeState = true;
      } else {
        inactiveTimer++;
        if (inactiveTimer > 120) {
          // Switch after 2 seconds of inactivity
          activeState = false;
        }
      }
  
      // Draw based on state
      if (activeState) {
        drawActiveState();
      } else {
        drawInactiveState();
      }
  
      // Update mouse position
      lastMouseX = mouseX;
      lastMouseY = mouseY;
  
      // Add explanation text
      fill(255);
      textSize(14);
      if (activeState) {
        text(
          "Active consciousness: Embodied thinking (move mouse to interact)",
          20,
          height - 40
        );
        text(
          "Colored particles: Current thoughts | Blue particles: Background processing",
          20,
          height - 20
        );
      } else {
        text("Inactive state: Digital consciousness", 20, height - 40);
        text(
          "Only runs when prompted, lacks continuous background processing",
          20,
          height - 20
        );
      }
    }
  
    function drawActiveState() {
      // Draw embodied consciousness representation
      image(bodyOutline, width / 2 - 100, height / 2 - 230);
  
      // Draw human thought particles - these respond to mouse
      for (let i = 0; i < humanThoughts.length; i++) {
        let t = humanThoughts[i];
  
        // Attract thoughts toward mouse with some randomness
        let angle = atan2(mouseY - t.y, mouseX - t.x);
        let targetAngle = angle + random(-0.5, 0.5);
        t.angle = lerp(t.angle, targetAngle, 0.05);
  
        t.x += cos(t.angle) * t.speed;
        t.y += sin(t.angle) * t.speed;
  
        // Wrap around edges
        if (t.x < 0) t.x = width;
        if (t.x > width) t.x = 0;
        if (t.y < 0) t.y = height;
        if (t.y > height) t.y = 0;
  
        // Draw thought
        noStroke();
        fill(t.color);
        ellipse(t.x, t.y, t.size);
      }
  
      // Draw background processing particles - these move more randomly
      for (let i = 0; i < backgroundProcessing.length; i++) {
        let p = backgroundProcessing[i];
        if (random() < 0.05) {
          p.angle += random(-0.5, 0.5);
        }
        p.x += cos(p.angle) * p.speed;
        p.y += sin(p.angle) * p.speed;
  
        // Wrap around edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
  
        noStroke();
        fill(p.color);
        ellipse(p.x, p.y, p.size);
      }
  
      // Draw connections between nearby human thought particles
      stroke(255, 50);
      for (let i = 0; i < humanThoughts.length; i++) {
        for (let j = i + 1; j < humanThoughts.length; j++) {
          let t1 = humanThoughts[i];
          let t2 = humanThoughts[j];
          let d = dist(t1.x, t1.y, t2.x, t2.y);
          if (d < 50) {
            strokeWeight(map(d, 0, 50, 2, 0.2));
            line(t1.x, t1.y, t2.x, t2.y);
          }
        }
      }
    }
  
    function drawInactiveState() {
      push();
      translate(width / 2, height / 2);
  
      // Draw a computer-like shape
      noFill();
      stroke(100, 100, 255);
      strokeWeight(2);
      rect(-120, -80, 240, 160, 5);
  
      // Draw the color wheel representing AI identity
      image(colorWheel, -75, -70);
  
      // Draw discrete thinking lines (active briefly)
      if (frameCount % 180 < 60) {
        for (let i = 0; i < 10; i++) {
          stroke(random(160, 240), 80, 95, 0.7);
          strokeWeight(random(1, 3));
          let startX = random(-110, 110);
          let length = random(30, 100);
          line(startX, 50, startX + length, 50);
        }
      }
      pop();
    }
  
    function drawColorWheel(g) {
      g.colorMode(HSB, 360, 100, 100, 1);
      g.noStroke();
      let segments = 12;
      for (let i = 0; i < segments; i++) {
        let angle1 = map(i, 0, segments, 0, TWO_PI);
        let angle2 = map(i + 1, 0, segments, 0, TWO_PI);
        let hue = map(i, 0, segments, 0, 360);
  
        g.fill(hue, 80, 95);
        g.beginShape();
        g.vertex(g.width / 2, g.height / 2);
        for (let a = angle1; a <= angle2; a += 0.1) {
          let x = g.width / 2 + cos(a) * 50;
          let y = g.height / 2 + sin(a) * 50;
          g.vertex(x, y);
        }
        g.endShape(CLOSE);
      }
    }
  
    function drawBodyOutline(g) {
      g.stroke(255);
      g.strokeWeight(2);
      g.noFill();
  
      // Head
      g.ellipse(g.width / 2, 70, 60, 60);
  
      // Body
      g.beginShape();
      g.vertex(g.width / 2, 100);
      g.vertex(g.width / 2, 250);
      g.endShape();
  
      // Arms
      g.line(g.width / 2, 130, g.width / 2 - 60, 180);
      g.line(g.width / 2, 130, g.width / 2 + 60, 180);
  
      // Legs
      g.line(g.width / 2, 250, g.width / 2 - 40, 350);
      g.line(g.width / 2, 250, g.width / 2 + 40, 350);
  
      // Brain area with activity
      g.stroke(200, 120, 255, 0.7);
      g.strokeWeight(1);
      for (let i = 0; i < 15; i++) {
        let x1 = g.width / 2 - 20 + random(-10, 10);
        let y1 = 70 - 10 + random(-10, 10);
        let x2 = x1 + random(-15, 15);
        let y2 = y1 + random(-15, 15);
        g.line(x1, y1, x2, y2);
      }
    }
  
    // Assign global setup and draw functions outside of helpers
    window.setup = setup;
    window.draw = draw;
  })();