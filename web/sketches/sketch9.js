(function () {
  // Simulation parameters
  let particleDensity = 40;
  let flowStrength = 2.0;
  let noiseScale = 0.005;
  let particleSpeed = 2.0;
  let particleSize = 3.0;
  let colorCycleSpeed = 0.5;

  // Display options
  let motionBlur = true;
  let showFlowField = false;
  let multiColor = true;
  let useMouseAttraction = true;

  // System variables
  let particles = [];
  let flowField = [];
  let cols, rows;
  let resolution = 20; // Resolution of flow field grid
  let zoff = 0; // For noise movement
  let colorPhase = 0;
  let mouseInfluence = { x: 0, y: 0, active: false };

  // Gradient palettes - different color themes
  const palettes = [
    {
      // Aurora borealis
      colors: [
        [32, 0, 128, 0.7], // Deep blue
        [0, 255, 180, 0.7], // Teal
        [60, 255, 130, 0.7], // Green
        [140, 255, 200, 0.7], // Cyan
        [180, 120, 255, 0.7], // Purple
      ],
    },
    {
      // Cyberpunk
      colors: [
        [255, 0, 128, 0.7], // Magenta
        [0, 255, 255, 0.7], // Cyan
        [255, 255, 0, 0.7], // Yellow
        [128, 0, 255, 0.7], // Purple
        [0, 255, 128, 0.7], // Neon green
      ],
    },
    {
      // Fire and ice
      colors: [
        [255, 50, 0, 0.7], // Orange-red
        [255, 150, 20, 0.7], // Orange
        [255, 255, 255, 0.7], // White
        [100, 200, 255, 0.7], // Light blue
        [0, 100, 255, 0.7], // Deep blue
      ],
    },
  ];

  let currentPalette = 0;
  let graphics; // For motion blur effect

  function setup() {
    let canvasWidth = windowWidth * 0.7;
    let canvasHeight = canvasWidth * (3 / 4);
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent("canvas-container");

    // Create offscreen graphics for motion blur
    graphics = createGraphics(width, height);
    graphics.background(10, 10, 15);

    // Calculate grid dimensions for flow field
    cols = floor(width / resolution);
    rows = floor(height / resolution);

    // Initialize flow field
    initFlowField();

    // Create initial particles
    createParticles();

    // Change from ADD to SCREEN blending mode for better visual effect
    // without the whitewashing problem
    blendMode(SCREEN);
    colorMode(HSB, 360, 255, 255, 1);

    // Respond to mouse movement immediately
    mouseInfluence = { x: width / 2, y: height / 2, active: false };
  }

  function draw() {
    // Update parameters from UI
    particleDensity = parseInt(
      document.getElementById("particleDensity").value
    );
    flowStrength = parseFloat(document.getElementById("flowStrength").value);
    noiseScale = parseFloat(document.getElementById("noiseScale").value);
    particleSpeed = parseFloat(document.getElementById("particleSpeed").value);
    particleSize = parseFloat(document.getElementById("particleSize").value);
    colorCycleSpeed = parseFloat(
      document.getElementById("colorCycleSpeed").value
    );

    motionBlur = document.getElementById("motionBlur").checked;
    showFlowField = document.getElementById("showFlowField").checked;
    multiColor = document.getElementById("multiColor").checked;
    useMouseAttraction = document.getElementById("useMouseAttraction").checked;

    // Handle motion blur - FIXED to prevent color accumulation
    if (motionBlur) {
        graphics.colorMode(RGB, 255, 255, 255, 255);
        graphics.fill(10, 10, 15, 40);
      graphics.noStroke();
      graphics.rect(0, 0, width, height);
      // Clear the main canvas first to prevent buildup
      background(0, 0, 0);
      image(graphics, 0, 0);
    } else {
      background(0, 0, 0);
    }

    // Update flow field
    updateFlowField();

    // Show flow field if enabled
    if (showFlowField) {
      displayFlowField();
    }

    // Update particle count if needed
    if (particles.length < particleDensity * 20) {
      addParticles(50);
    } else if (particles.length > particleDensity * 20) {
      particles = particles.slice(0, particleDensity * 20);
    }

    // Update and display particles
    updateAndDisplayParticles();

    // Update mouse influence
    if (mouseIsPressed && useMouseAttraction) {
      mouseInfluence = { x: mouseX, y: mouseY, active: true };
    } else if (frameCount % 200 === 0) {
      // Occasionally move the influence point
      mouseInfluence = {
        x: random(width),
        y: random(height),
        active: useMouseAttraction,
      };
    }

    // Cycle color phase
    colorPhase = (colorPhase + 0.5 * colorCycleSpeed) % 360;

    // Switch palette occasionally
    if (frameCount % 600 === 0 && multiColor) {
      currentPalette = (currentPalette + 1) % palettes.length;
    }

    // Progress the noise space
    zoff += 0.003 * particleSpeed;
  }

  function initFlowField() {
    flowField = new Array(cols * rows);
  }

  function updateFlowField() {
    let yoff = 0;
    for (let y = 0; y < rows; y++) {
      let xoff = 0;
      for (let x = 0; x < cols; x++) {
        const index = x + y * cols;

        // Calculate flow angle from noise
        const angle = noise(xoff, yoff, zoff) * TWO_PI * 2;

        // Create a vector from the angle
        const v = p5.Vector.fromAngle(angle);
        v.setMag(flowStrength);
        flowField[index] = v;

        xoff += noiseScale;
      }
      yoff += noiseScale;
    }
  }

  function displayFlowField() {
    strokeWeight(1);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const index = x + y * cols;
        const v = flowField[index];

        stroke(200, 50);
        push();
        translate(x * resolution, y * resolution);
        rotate(v.heading());
        line(0, 0, resolution * 0.6, 0);
        pop();
      }
    }
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < particleDensity * 20; i++) {
      addParticle();
    }
  }

  function addParticles(count) {
    for (let i = 0; i < count; i++) {
      addParticle();
    }
  }

  function addParticle() {
    particles.push({
      pos: createVector(random(width), random(height)),
      vel: createVector(0, 0),
      acc: createVector(0, 0),
      color: {
        h: random(360),
        s: random(150, 255),
        b: random(150, 255),
        a: random(0.4, 0.8),
      },
      size: random(particleSize * 0.5, particleSize * 1.5),
      maxSpeed: random(1, 4) * particleSpeed,
      life: 255,
      decay: random(0.5, 2),
      age: 0, // Add age counter starting at 0
      maxAge: random(300, 800), // Maximum age before fading starts
    });
  }

  function updateAndDisplayParticles() {
    noStroke();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Increment age regardless of motion blur setting
      p.age++;

      // Find the flow field vector at this position
      const x = floor(p.pos.x / resolution);
      const y = floor(p.pos.y / resolution);

      // Check if position is valid
      if (x >= 0 && x < cols && y >= 0 && y < rows) {
        const index = x + y * cols;
        const force = flowField[index].copy();

        // Apply flow field force
        p.acc.add(force);

        // Apply mouse influence if active
        if (mouseInfluence.active) {
          const mousePos = createVector(mouseInfluence.x, mouseInfluence.y);
          const dir = p5.Vector.sub(mousePos, p.pos);
          const d = dir.mag();

          if (d < 200) {
            dir.normalize();
            // Push away from mouse point
            dir.mult(-1.5 * flowStrength * (1 - d / 200));
            p.acc.add(dir);
          }
        }
      }

      // Update velocity
      p.vel.add(p.acc);
      p.vel.limit(p.maxSpeed);

      // Update position
      p.pos.add(p.vel);

      // Reset acceleration
      p.acc.mult(0);

      // Edge wrapping
      if (p.pos.x < -50) p.pos.x = width + 50;
      if (p.pos.x > width + 50) p.pos.x = -50;
      if (p.pos.y < -50) p.pos.y = height + 50;
      if (p.pos.y > height + 50) p.pos.y = -50;


      p.life -= p.decay;

      // Display particle
      drawParticle(p);

      // Remove dead particles or extremely old particles
      if (p.life < 0 || p.age > p.maxAge * 1.5) {
        particles.splice(i, 1);
      }
    }
  }

  function drawParticle(p) {
    // Calculate age-based opacity reduction
    let ageOpacity = 0.5;
    if (p.age <= p.maxAge) {
      // Fade from full opacity (1) to, say, 0.5
      ageOpacity = map(p.age, 0, p.maxAge, 1, 0.5);
    } else {
      // Then fade from 0.5 to 0 until p.age hits p.maxAge*1.5
      ageOpacity = map(p.age, p.maxAge, p.maxAge * 1.5, 0.5, 0);
    }
    ageOpacity = constrain(ageOpacity, 0, 1);

    // Get color based on position and palette
    let color;

    if (multiColor) {
      // Get colors from current palette
      const palette = palettes[currentPalette].colors;

      // Interpolate color based on position in flow field
      const noiseVal = noise(
        p.pos.x * noiseScale * 0.5,
        p.pos.y * noiseScale * 0.5,
        zoff * 0.5
      );

      // Map noise to palette index
      const colorIndex = floor(noiseVal * palette.length);
      const nextColorIndex = (colorIndex + 1) % palette.length;
      const colorBlend = (noiseVal * palette.length) % 1;

      // Get current and next colors
      const currentColor = palette[colorIndex];
      const nextColor = palette[nextColorIndex];

      // Interpolate between colors
      const r = lerp(currentColor[0], nextColor[0], colorBlend);
      const g = lerp(currentColor[1], nextColor[1], colorBlend);
      const b = lerp(currentColor[2], nextColor[2], colorBlend);
      const a = lerp(currentColor[3], nextColor[3], colorBlend);

      // Apply both life-based and age-based opacity
      fill(r, g, b, a * (p.life / 255) * ageOpacity);
    } else {
      // Use HSB color cycling for unified color scheme
      const hue = (p.color.h + colorPhase) % 360;
      // Apply both life-based and age-based opacity
      fill(hue, p.color.s, p.color.b, p.color.a * (p.life / 255) * ageOpacity);
    }

    // Draw particle
    const size = p.size * (0.8 + 0.4 * sin(frameCount * 0.05 + p.color.h));

    // Draw with velocity-based stretching
    push();
    translate(p.pos.x, p.pos.y);
    rotate(p.vel.heading());
    const stretch = map(p.vel.mag(), 0, p.maxSpeed, 1, 3);
    ellipse(0, 0, size * stretch, size);
    pop();
  }

  function mousePressed() {
    if (
      useMouseAttraction &&
      mouseX > 0 &&
      mouseX < width &&
      mouseY > 0 &&
      mouseY < height
    ) {
      mouseInfluence = { x: mouseX, y: mouseY, active: true };
      return false; // Prevent default
    }
  }

  function mouseReleased() {
    mouseInfluence.active = false;
  }

  function keyPressed() {
    if (key === "c" || key === "C") {
      // Change color palette
      currentPalette = (currentPalette + 1) % palettes.length;
    } else if (key === " ") {
      // Reset particles
      createParticles();
    }
  }

  // Handle window resize
  function windowResized() {
    let canvasWidth = windowWidth * 0.7;
    let canvasHeight = canvasWidth * (3 / 4);
    resizeCanvas(canvasWidth, canvasHeight);

    // Recreate graphics buffer
    graphics = createGraphics(width, height);
    graphics.background(0, 0, 0);

    // Recalculate grid dimensions
    cols = floor(width / resolution);
    rows = floor(height / resolution);

    // Reinitialize flow field
    initFlowField();
  }

  // For mobile interaction
  function touchMoved() {
    if (useMouseAttraction) {
      mouseInfluence = { x: mouseX, y: mouseY, active: true };
      return false;
    }
  }

  function touchEnded() {
    mouseInfluence.active = false;
  }

  window.setup = setup;
  window.draw = draw;
  window.mousePressed = mousePressed;
  window.mouseReleased = mouseReleased;
  window.keyPressed = keyPressed;
  window.windowResized = windowResized;
  window.touchMoved = touchMoved;
  window.touchEnded = touchEnded;
})();
