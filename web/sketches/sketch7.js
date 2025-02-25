(function() {
    // Terrain parameters
    let terrainDetail = 3;
    let terrainHeight = 120;
    let colorIntensity = 1.0;
    let cameraSpeed = 0.01;
    let waterLevel = -20;
    
    // Display settings
    let showWireframe = false;
    let autoRotate = true;
    let showParticles = true;
    let nightMode = false;
  
    // 3D variables
    let terrain = [];
    let cols, rows;
    let scl = 20; // Scale of terrain grid cells
    let w, h;
    let terrainNoise;
    let particles = [];
    let clouds = [];
    
    // Camera control
    let cameraAngle = 0;
    let cameraHeight = 300;
    let cameraDist = 500;
    let targetCameraHeight = 300;
    
    // Animation variables
    let time = 0;
    let seed;
  
    function setup() {
      let canvasWidth = windowWidth * 0.7;
      let canvasHeight = canvasWidth * (3 / 4);
      let canvas = createCanvas(canvasWidth, canvasHeight, WEBGL);
      canvas.parent("canvas-container");
      
      // Set random seed for consistent terrain across reloads
      seed = random(10000);
      noiseSeed(seed);
      
      // Initialize parameters for terrain
      w = canvasWidth * 1.5;
      h = canvasHeight * 2;
      cols = Math.floor(w / scl);
      rows = Math.floor(h / scl);
      
      // Initialize terrain noise
      terrainNoise = createNoiseGrid();
      
      // Create initial particles and clouds
      createParticles(50);
      createClouds(15);
      
      // Use a custom shader for better performance (if available)
      try {
        setAttributes('antialias', true);
      } catch(e) {
        console.log("Enhanced WebGL features not available");
      }
    }
  
    function draw() {
      // Update parameters from UI controls
      terrainDetail = parseInt(document.getElementById("terrainDetail").value);
      terrainHeight = parseFloat(document.getElementById("terrainHeight").value);
      colorIntensity = parseFloat(document.getElementById("colorIntensity").value);
      cameraSpeed = parseFloat(document.getElementById("cameraSpeed").value);
      waterLevel = parseFloat(document.getElementById("waterLevel").value);
      
      showWireframe = document.getElementById("showWireframe").checked;
      autoRotate = document.getElementById("autoRotate").checked;
      showParticles = document.getElementById("showParticles").checked;
      nightMode = document.getElementById("nightMode").checked;
      
      // Update time
      time += 0.01;
      
      // Set background and lighting based on mode
      if (nightMode) {
        background(10, 15, 30);
        ambientLight(40, 40, 60);
        directionalLight(150, 150, 200, 0.5, 1, -0.5);
        pointLight(200, 150, 100, 0, -200, 200); // "moon" light
        // Add subtle fog effect for night
        noStroke();
        push();
        translate(0, 0, -1000);
        fill(10, 15, 30, 50);
        plane(w * 3, h * 3);
        pop();
      } else {
        background(135, 206, 235); // Sky blue
        ambientLight(90, 90, 90);
        directionalLight(255, 255, 220, 0.5, 1, -0.5); // Sun
        // Add subtle fog effect for day
        noStroke();
        push();
        translate(0, 0, -1000);
        fill(255, 255, 255, 20);
        plane(w * 3, h * 3);
        pop();
      }
  
      // Camera movement
      if (autoRotate) {
        cameraAngle += cameraSpeed;
      }
      
      // Smooth camera height changes
      cameraHeight = lerp(cameraHeight, targetCameraHeight, 0.05);
      
      // Set camera position with slight bobbing
      let camX = cameraDist * cos(cameraAngle);
      let camZ = cameraDist * sin(cameraAngle);
      let camY = -cameraHeight + sin(time * 0.5) * 5;
      camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);
      
      // Update terrain if detail level changed
      if (frameCount % 30 === 0 || terrainNoise.detail !== terrainDetail) {
        terrainNoise = createNoiseGrid();
      }
      
      // Draw clouds
      drawClouds();
      
      // Draw terrain
      push();
      translate(-w / 2, 0, -h / 2);
      drawTerrain();
      pop();
      
      // Draw water plane with ripple effect
      push();
      translate(0, waterLevel, 0);
      if (nightMode) {
        fill(10, 20, 50, 190);
      } else {
        fill(0, 100, 200, 170);
      }
      noStroke();
      rotateX(HALF_PI);
      
      // Create rippling water effect
      beginShape(TRIANGLE_STRIP);
      for (let z = -h/2; z <= h/2; z += 20) {
        for (let x = -w/2; x <= w/2; x += 20) {
          let rippleY = sin(time + x * 0.01 + z * 0.01) * 3;
          vertex(x, z, rippleY);
          vertex(x, z + 20, rippleY);
        }
      }
      endShape();
      pop();
      
      // Update and draw particles
      if (showParticles) {
        updateParticles();
        drawParticles();
      }
      
      // Add sun or moon
      push();
      noStroke();
      if (nightMode) {
        fill(200, 200, 230);
        translate(-500 * cos(time * 0.1), -800, -500 * sin(time * 0.1));
        sphere(50);
        
        // Add stars
        for (let i = 0; i < 100; i++) {
          let starX = random(-2000, 2000);
          let starY = random(-2000, -1000);
          let starZ = random(-2000, 2000);
          push();
          translate(starX, starY, starZ);
          fill(255, random(100, 255));
          sphere(random(1, 3));
          pop();
        }
      } else {
        fill(255, 255, 200);
        translate(-800 * cos(time * 0.1), -600, -800 * sin(time * 0.1));
        sphere(80);
      }
      pop();
    }
  
    function createNoiseGrid() {
      const detail = terrainDetail;
      let noiseScale = 0.005 * Math.pow(0.5, detail - 1); 
      let result = { grid: [], detail: detail };
      
      // Create terrain grid using Perlin noise with more dramatic features
      for (let y = 0; y <= rows; y++) {
        result.grid[y] = [];
        for (let x = 0; x <= cols; x++) {
          // Create multi-octave noise
          let elevation = 0;
          let amplitude = 1;
          let frequency = 1;
          let maxValue = 0;
          
          for (let i = 0; i < detail; i++) {
            let noiseVal = noise(
              x * noiseScale * frequency,
              y * noiseScale * frequency
            );
            elevation += noiseVal * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
          }
          
          // Add more dramatic peaks and valleys
          elevation = (elevation / maxValue);
          
          // Apply exponential curve to create more dramatic terrain
          if (elevation > 0.5) {
            elevation = 0.5 + pow(elevation - 0.5, 0.8) * 0.5;
          }
          
          // Apply ridges for mountain ranges
          let cx = x - cols/2;
          let cy = y - rows/2;
          let distFromCenter = sqrt(cx*cx + cy*cy) / (cols/2);
          let ridgeFactor = sin(x * 0.05) * cos(y * 0.05) * (1 - distFromCenter) * 0.3;
          
          elevation = (elevation + ridgeFactor) * terrainHeight;
          result.grid[y][x] = elevation;
        }
      }
      
      return result;
    }
  
    function drawTerrain() {
      // Draw terrain using triangles with enhanced detail
      for (let y = 0; y < rows; y++) {
        beginShape(TRIANGLE_STRIP);
        for (let x = 0; x <= cols; x++) {
          // Get terrain heights
          let elevation1 = terrainNoise.grid[y][x];
          let elevation2 = y < rows ? terrainNoise.grid[y + 1][x] : elevation1;
          
          // Set colors based on elevation
          let c1 = getTerrainColor(elevation1);
          let c2 = getTerrainColor(elevation2);
          
          if (showWireframe) {
            stroke(255);
            noFill();
          } else {
            noStroke();
            fill(c1);
            
            // Add subtle highlights and shadows based on slope
            if (x > 0 && y > 0) {
              let dx = terrainNoise.grid[y][x] - terrainNoise.grid[y][x-1];
              let dy = terrainNoise.grid[y][x] - terrainNoise.grid[y-1][x];
              let slope = sqrt(dx*dx + dy*dy);
              
              if (slope > 5) {
                // Steeper terrain gets darker (shadow)
                fill(red(c1)*0.8, green(c1)*0.8, blue(c1)*0.8);
              } else if (elevation1 > waterLevel + 80) {
                // Higher terrain gets lighter (snow)
                let snowAmount = map(elevation1, waterLevel + 80, waterLevel + 120, 0, 1);
                fill(lerp(red(c1), 255, snowAmount), 
                     lerp(green(c1), 255, snowAmount), 
                     lerp(blue(c1), 255, snowAmount));
              }
            }
          }
          
          // Create vertices
          vertex(x * scl, elevation1, y * scl);
          vertex(x * scl, elevation2, (y + 1) * scl);
        }
        endShape();
      }
    }
  
    function getTerrainColor(height) {
      // Enhanced color mapping for more realistic terrain
      if (height < waterLevel - 5) {
        // Deep underwater
        return nightMode
          ? color(5, 10, 30)
          : color(0, 20 * colorIntensity, 100 * colorIntensity);
      } else if (height < waterLevel + 5) {
        // Shore
        return nightMode
          ? color(20, 25, 35)
          : color(240 * colorIntensity, 220 * colorIntensity, 130 * colorIntensity);
      } else if (height < waterLevel + 20) {
        // Low ground
        return nightMode
          ? color(20, 40, 25)
          : color(30 * colorIntensity, 160 * colorIntensity, 30 * colorIntensity);
      } else if (height < waterLevel + 60) {
        // Mid elevations
        return nightMode
          ? color(30, 50, 30)
          : color(20 * colorIntensity, 120 * colorIntensity, 20 * colorIntensity);
      } else if (height < waterLevel + 100) {
        // High ground
        return nightMode
          ? color(60, 55, 60)
          : color(120 * colorIntensity, 100 * colorIntensity, 80 * colorIntensity);
      } else {
        // Peaks
        return nightMode
          ? color(200, 200, 220)
          : color(255 * colorIntensity, 255 * colorIntensity, 255 * colorIntensity);
      }
    }
  
    function createParticles(count) {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: random(-w / 2, w / 2),
          y: random(-50, -150),
          z: random(-h / 2, h / 2),
          size: random(2, 8),
          speed: random(0.2, 1.5),
          color: nightMode
            ? color(200, 200, random(200, 255), random(100, 200))
            : color(255, 255, random(200, 255), random(100, 200)),
        });
      }
    }
    
    function createClouds(count) {
      clouds = [];
      for (let i = 0; i < count; i++) {
        clouds.push({
          x: random(-w, w),
          y: random(-100, -50),
          z: random(-h, h),
          width: random(100, 300),
          depth: random(100, 300),
          speed: random(0.2, 0.5),
          opacity: random(150, 200)
        });
      }
    }
    
    function drawClouds() {
      push();
      noStroke();
      for (let cloud of clouds) {
        push();
        translate(cloud.x, cloud.y, cloud.z);
        if (nightMode) {
          fill(50, 50, 70, cloud.opacity * 0.7);
        } else {
          fill(255, 255, 255, cloud.opacity);
        }
        
        // Create cloud shape with multiple spheres
        for (let i = 0; i < 5; i++) {
          let xOffset = sin(i * PI / 2.5) * cloud.width * 0.5;
          let zOffset = cos(i * PI / 2.5) * cloud.depth * 0.5;
          push();
          translate(xOffset, sin(i + time) * 5, zOffset);
          sphere(cloud.width * 0.3);
          pop();
        }
        
        pop();
        
        // Move cloud
        cloud.x += cloud.speed;
        if (cloud.x > w) {
          cloud.x = -w;
          cloud.z = random(-h, h);
        }
      }
      pop();
    }
  
    function updateParticles() {
      particles.forEach((p) => {
        // Move particles upward with more interesting movement
        p.y -= p.speed;
        p.x += sin(frameCount * 0.01 + p.z) * 0.2;
        p.z += cos(frameCount * 0.01 + p.x) * 0.2;
  
        // Reset particles that go offscreen
        if (p.y < -300) {
          p.y = 0;
          p.x = random(-w / 2, w / 2);
          p.z = random(-h / 2, h / 2);
          // Update color based on night mode
          p.color = nightMode
            ? color(200, 200, random(200, 255), random(100, 200))
            : color(255, 255, random(200, 255), random(100, 200));
        }
      });
  
      // Add more particles if needed
      if (particles.length < 50 && frameCount % 30 === 0) {
        particles.push({
          x: random(-w / 2, w / 2),
          y: 0,
          z: random(-h / 2, h / 2),
          size: random(2, 8),
          speed: random(0.2, 1.5),
          color: nightMode
            ? color(200, 200, random(200, 255), random(100, 200))
            : color(255, 255, random(200, 255), random(100, 200)),
        });
      }
    }
  
    function drawParticles() {
      push();
      noStroke();
      particles.forEach((p) => {
        push();
        translate(p.x, p.y, p.z);
        fill(p.color);
        sphere(p.size);
        pop();
      });
      pop();
    }
  
    function mouseDragged() {
      // Allow manual camera control
      if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        cameraAngle += (mouseX - pmouseX) * 0.01;
        targetCameraHeight = constrain(targetCameraHeight + (mouseY - pmouseY), 100, 500);
        autoRotate = false;
        return false; // Prevent default
      }
    }
    
    function mouseWheel(event) {
      // Zoom in/out with mouse wheel
      cameraDist = constrain(cameraDist + event.delta, 200, 1000);
      return false;
    }
  
    // For mobile interaction
    function touchMoved() {
      return mouseDragged();
    }
  
    window.setup = setup;
    window.draw = draw;
    window.mouseDragged = mouseDragged;
    window.touchMoved = touchMoved;
    window.mouseWheel = mouseWheel;
  })();