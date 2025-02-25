(function() {
    // Configurable parameters
    let gridSize = 25;
    let gridSpacing = 40;
    let pulseSpeed = 1.0;
    let flowSpeed = 1.0;
    let particleCount = 100;
    let lineWeight = 2;
    
    // Visual settings
    let showParticles = true;
    let glowEffect = true;
    let audioReactive = false;
    let colorShift = true;
    
    // Internal variables
    let particles = [];
    let time = 0;
    let colorOffset = 0;
    let gridVertices = [];
    let gridConnections = [];
    let flowField = [];
    
    // Camera variables
    let cameraRotationX = 0;
    let cameraRotationY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let zoomLevel = 1;
    
    function setup() {
      let canvasWidth = windowWidth * 0.7;
      let canvasHeight = canvasWidth * (3/4);
      let canvas = createCanvas(canvasWidth, canvasHeight, WEBGL);
      canvas.parent("canvas-container");
      
      // Enable anti-aliasing for smoother lines
      setAttributes('antialias', true);
      
      // Generate grid
      generateGrid();
      
      // Generate particles
      generateParticles();
      
      // Performance optimizations
      pixelDensity(1);
      frameRate(60);
    }
    
    function draw() {
      // Update time
      time += 0.01 * flowSpeed;
      
      // Get parameter values from UI controls
      updateParameters();
      
      // Set background color (deep space black with slight blue tint)
      background(5, 8, 15);
      
      // Set basic lighting
      ambientLight(30, 30, 40);
      
      // Apply camera transformations
      applyCameraControls();
      
      // Apply scale for zoom
      scale(zoomLevel);
      
      // Draw grid with effect
      drawGrid();
      
      // Update and draw particles
      if (showParticles) {
        updateParticles();
        drawParticles();
      }
      
      // Draw overlay glow if enabled
      if (glowEffect) {
        drawGlowOverlay();
      }
      
      // Update color cycle
      if (colorShift) {
        colorOffset += 0.003;
        if (colorOffset > 1) colorOffset -= 1;
      }
    }
    
    function updateParameters() {
      // Get values from UI sliders
      gridSize = parseInt(document.getElementById("gridSize").value);
      gridSpacing = parseInt(document.getElementById("gridSpacing").value);
      pulseSpeed = parseFloat(document.getElementById("pulseSpeed").value);
      flowSpeed = parseFloat(document.getElementById("flowSpeed").value);
      particleCount = parseInt(document.getElementById("particleCount").value);
      lineWeight = parseFloat(document.getElementById("lineWeight").value);
      
      // Get checkbox values
      showParticles = document.getElementById("showParticles").checked;
      glowEffect = document.getElementById("glowEffect").checked;
      audioReactive = document.getElementById("audioReactive").checked;
      colorShift = document.getElementById("colorShift").checked;
      
      // Check if grid needs to be regenerated
      if (gridVertices.length === 0 || 
          gridVertices.length !== (gridSize + 1) * (gridSize + 1) * (gridSize + 1)) {
        generateGrid();
        generateParticles();
      }
    }
    
    function generateGrid() {
      // Clear previous grid
      gridVertices = [];
      gridConnections = [];
      flowField = [];
      
      // Calculate bounds
      const half = gridSize / 2;
      
      // Create vertices
      for (let z = -half; z <= half; z++) {
        for (let y = -half; y <= half; y++) {
          for (let x = -half; x <= half; x++) {
            const vx = x * gridSpacing;
            const vy = y * gridSpacing;
            const vz = z * gridSpacing;
            
            // Only create vertices at the edges of the cube for optimization
            if (isGridEdge(x, y, z, half)) {
              gridVertices.push({
                x: vx,
                y: vy,
                z: vz,
                originalX: vx,
                originalY: vy,
                originalZ: vz
              });
            }
          }
        }
      }
      
      // Create connections for edges
      createGridEdges();
      
      // Create flow field
      createFlowField();
    }
    
    function isGridEdge(x, y, z, half) {
      // Return true if vertex is on the edge of the grid
      return x === -half || x === half || 
             y === -half || y === half || 
             z === -half || z === half;
    }
    
    function createGridEdges() {
      // Create connections between adjacent vertices
      const vertexMap = new Map();
      
      // Create a map for quick lookup
      gridVertices.forEach((v, i) => {
        const key = `${Math.round(v.x/gridSpacing)},${Math.round(v.y/gridSpacing)},${Math.round(v.z/gridSpacing)}`;
        vertexMap.set(key, i);
      });
      
      // Add connections between adjacent vertices
      gridVertices.forEach((v, i) => {
        const x = Math.round(v.x/gridSpacing);
        const y = Math.round(v.y/gridSpacing);
        const z = Math.round(v.z/gridSpacing);
        
        // Check adjacent vertices (only along grid lines)
        const adjacentPositions = [
          [x+1, y, z], [x-1, y, z],
          [x, y+1, z], [x, y-1, z],
          [x, y, z+1], [x, y, z-1]
        ];
        
        adjacentPositions.forEach(pos => {
          const key = `${pos[0]},${pos[1]},${pos[2]}`;
          if (vertexMap.has(key)) {
            const j = vertexMap.get(key);
            // Add connection if it doesn't exist yet
            if (i < j) { // Only add each edge once
              gridConnections.push([i, j]);
            }
          }
        });
      });
    }
    
    function createFlowField() {
      // Create vector field for particle movement
      const resolution = 10;
      const halfSize = gridSize * gridSpacing / 2 + gridSpacing;
      
      for (let z = -halfSize; z <= halfSize; z += resolution) {
        const zLayer = [];
        for (let y = -halfSize; y <= halfSize; y += resolution) {
          const yRow = [];
          for (let x = -halfSize; x <= halfSize; x += resolution) {
            // Create vector field based on position and noise
            const angle1 = noise(x * 0.01, y * 0.01, z * 0.01 + time * 0.1) * TWO_PI * 2;
            const angle2 = noise(x * 0.01 + 100, y * 0.01 + 100, z * 0.01 + 100 + time * 0.1) * TWO_PI;
            
            yRow.push({
              x: cos(angle1) * sin(angle2),
              y: sin(angle1) * sin(angle2),
              z: cos(angle2)
            });
          }
          zLayer.push(yRow);
        }
        flowField.push(zLayer);
      }
    }
    
    function getFlowVector(x, y, z) {
      // Get interpolated vector from flow field
      const halfSize = gridSize * gridSpacing / 2 + gridSpacing;
      const resolution = 10;
      
      // Convert to indices
      const ix = constrain(floor((x + halfSize) / resolution), 0, flowField[0][0].length - 1);
      const iy = constrain(floor((y + halfSize) / resolution), 0, flowField[0].length - 1);
      const iz = constrain(floor((z + halfSize) / resolution), 0, flowField.length - 1);
      
      // Return flow vector
      if (iz < flowField.length && iy < flowField[iz].length && ix < flowField[iz][iy].length) {
        return flowField[iz][iy][ix];
      }
      return { x: 0, y: 0, z: 0 };
    }
    
    function generateParticles() {
      particles = [];
      const halfSize = gridSize * gridSpacing / 2;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: random(-halfSize, halfSize),
          y: random(-halfSize, halfSize),
          z: random(-halfSize, halfSize),
          size: random(2, 6),
          speed: random(0.5, 2),
          hue: random(0, 1),
          age: random(0, 1),
          maxAge: random(0.5, 2)
        });
      }
    }
    
    function updateParticles() {
      // Update flow field occasionally
      if (frameCount % 10 === 0) {
        createFlowField();
      }
      
      const halfSize = gridSize * gridSpacing / 2 + gridSpacing;
      
      // Update each particle
      particles.forEach(p => {
        // Get flow vector for current position
        const flow = getFlowVector(p.x, p.y, p.z);
        
        // Update position based on flow
        p.x += flow.x * p.speed * flowSpeed;
        p.y += flow.y * p.speed * flowSpeed;
        p.z += flow.z * p.speed * flowSpeed;
        
        // Age particle
        p.age += 0.01;
        
        // Reset particles that get too old or go out of bounds
        if (p.age > p.maxAge || 
            abs(p.x) > halfSize ||
            abs(p.y) > halfSize ||
            abs(p.z) > halfSize) {
          p.x = random(-halfSize, halfSize);
          p.y = random(-halfSize, halfSize);
          p.z = random(-halfSize, halfSize);
          p.age = 0;
          p.maxAge = random(0.5, 2);
        }
      });
    }
    
    function drawGrid() {
      // Update grid vertex positions
      gridVertices.forEach(v => {
        // Calculate displacement based on sine waves
        const dx = sin(time * pulseSpeed + v.originalY * 0.01) * 5;
        const dy = cos(time * pulseSpeed + v.originalX * 0.01) * 5;
        const dz = sin(time * pulseSpeed + v.originalZ * 0.01 + v.originalX * 0.01) * 5;
        
        v.x = v.originalX + dx;
        v.y = v.originalY + dy;
        v.z = v.originalZ + dz;
      });
      
      // Draw connections with color gradients
      strokeWeight(lineWeight);
      for (let i = 0; i < gridConnections.length; i++) {
        const [i1, i2] = gridConnections[i];
        const v1 = gridVertices[i1];
        const v2 = gridVertices[i2];
        
        // Calculate distance from center for color
        const d1 = dist(0, 0, 0, v1.x, v1.y, v1.z) / (gridSize * gridSpacing);
        const d2 = dist(0, 0, 0, v2.x, v2.y, v2.z) / (gridSize * gridSpacing);
        
        // Determine colors with shifting hue
        const hue1 = ((d1 * 0.5) + colorOffset) % 1;
        const hue2 = ((d2 * 0.5) + colorOffset) % 1;
        
        // Calculate pulse intensity based on time
        const pulse1 = 0.5 + 0.5 * sin(time * pulseSpeed * 2 + d1 * 10);
        const pulse2 = 0.5 + 0.5 * sin(time * pulseSpeed * 2 + d2 * 10);
        
        // Draw line with gradient
        drawGradientLine(
          v1.x, v1.y, v1.z, 
          v2.x, v2.y, v2.z,
          hue1, 1, 1 * pulse1, // HSB for first vertex
          hue2, 1, 1 * pulse2  // HSB for second vertex
        );
      }
    }
    
    function drawGradientLine(x1, y1, z1, x2, y2, z2, h1, s1, b1, h2, s2, b2) {
      // Number of segments for gradient (more = smoother gradient but slower)
      const steps = 6;
      
      // Convert HSB to RGB for both endpoints
      colorMode(HSB, 1);
      const c1 = color(h1, s1, b1);
      const c2 = color(h2, s2, b2);
      colorMode(RGB);
      
      // Draw segments
      for (let i = 0; i < steps; i++) {
        const t1 = i / steps;
        const t2 = (i + 1) / steps;
        
        // Interpolate position
        const x1i = lerp(x1, x2, t1);
        const y1i = lerp(y1, y2, t1);
        const z1i = lerp(z1, z2, t1);
        
        const x2i = lerp(x1, x2, t2);
        const y2i = lerp(y1, y2, t2);
        const z2i = lerp(z1, z2, t2);
        
        // Interpolate color
        const c = lerpColor(c1, c2, t1);
        stroke(c);
        
        // Draw line segment
        line(x1i, y1i, z1i, x2i, y2i, z2i);
      }
    }
    
    function drawParticles() {
      // Set blend mode for additive blending
      blendMode(ADD);
      noStroke();
      
      // Draw each particle
      particles.forEach(p => {
        push();
        translate(p.x, p.y, p.z);
        
        // Calculate color based on particle properties
        const hue = (p.hue + colorOffset) % 1;
        const brightness = map(sin(p.age * 5), -1, 1, 0.5, 1);
        
        // Create glowing particle
        drawGlowingParticle(p.size, hue, brightness);
        
        pop();
      });
      
      // Reset blend mode
      blendMode(BLEND);
    }
    
    function drawGlowingParticle(size, hue, brightness) {
      // Draw multiple concentric spheres with decreasing opacity for glow effect
      colorMode(HSB, 1);
      
      // Core
      fill(hue, 1, brightness, 0.8);
      sphere(size * 0.5);
      
      // Inner glow
      fill(hue, 0.8, brightness, 0.4);
      sphere(size * 0.8);
      
      // Outer glow
      fill(hue, 0.6, brightness, 0.2);
      sphere(size);
      
      colorMode(RGB);
    }
    
    function drawGlowOverlay() {
      // Add subtle glow effect with post-processing
      push();
      blendMode(SCREEN);
      noFill();
      
      // Draw radial gradient for central glow
      for (let i = 0; i < 5; i++) {
        const alpha = map(i, 0, 5, 50, 0);
        const size = map(i, 0, 5, 50, 1000);
        stroke(100, 150, 255, alpha);
        strokeWeight(2);
        rotateX(time * 0.1);
        rotateY(time * 0.2);
        sphere(size, 8, 8); // Low detail for performance
      }
      
      // Reset blend mode
      blendMode(BLEND);
      pop();
    }
    
    function applyCameraControls() {
      // Smooth camera rotation
      cameraRotationX = lerp(cameraRotationX, targetRotationX, 0.1);
      cameraRotationY = lerp(cameraRotationY, targetRotationY, 0.1);
      
      // Apply camera rotation
      rotateX(cameraRotationX);
      rotateY(cameraRotationY);
      
      // Auto-rotation if no user input
      if (abs(mouseX - pmouseX) < 1 && abs(mouseY - pmouseY) < 1) {
        targetRotationY += 0.001;
      }
    }
    
    function mouseDragged() {
      if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        // Update camera rotation based on mouse movement
        targetRotationY += (mouseX - pmouseX) * 0.01;
        targetRotationX += (mouseY - pmouseY) * 0.01;
        
        // Limit X rotation to avoid flipping
        targetRotationX = constrain(targetRotationX, -PI/2, PI/2);
        
        return false; // Prevent default
      }
    }
    
    function mouseWheel(event) {
      // Update zoom level
      zoomLevel = constrain(zoomLevel - event.delta * 0.001, 0.5, 2);
      return false;
    }
    
    function touchMoved() {
      return mouseDragged();
    }
    
    // Expose functions to window scope
    window.setup = setup;
    window.draw = draw;
    window.mouseDragged = mouseDragged;
    window.touchMoved = touchMoved;
    window.mouseWheel = mouseWheel;
  })();