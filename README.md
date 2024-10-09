# p5.js Sketch Switcher

This project allows you to switch between different p5.js sketches on a single webpage. Each sketch can have its own set of adjustable parameters controlled by sliders. The infrastructure is designed to be easily extendable, allowing you to add new sketches with minimal effort.

## Directory Structure

```bash
/p5js
  /web
    /sketches
      sketch1.js
      sketch2.js
      sketch3.js
    index.html
    style.css
    main.js
    sketches.json
```

## Adding a New Sketch

To add a new sketch, follow these steps:

1. **Create the Sketch File**: Add your new sketch file in the `sketches` directory. Ensure it follows the structure of the existing sketches.

2. **Update `sketches.json`**: Add an entry for your new sketch in the `sketches.json` file. Define the sliders you want to use for your sketch.

### Example

#### New Sketch File: `sketch4.js`

```javascript
(function() {
  let someParameter = 50;

  function setup() {
    let canvasWidth = windowWidth * 0.7;
    let canvasHeight = canvasWidth * (3 / 4);
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    noStroke();
  }

  function draw() {
    background(0);
    someParameter = parseInt(document.getElementById('someParameter').value);
    // Your drawing code here
  }

  window.setup = setup;
  window.draw = draw;
})();
```

#### Update `sketches.json`

```json
[
  {
    "name": "Sketch 1",
    "file": "sketch1.js",
    "sliders": [
      { "id": "numShapes", "label": "Number of Shapes", "min": 1, "max": 20, "value": 10 },
      { "id": "shapeSize", "label": "Shape Size", "min": 10, "max": 100, "value": 50 }
    ]
  },
  {
    "name": "Sketch 2",
    "file": "sketch2.js",
    "sliders": [
      { "id": "numStars", "label": "Number of Stars", "min": 1, "max": 50, "value": 25 },
      { "id": "starSize", "label": "Star Size", "min": 5, "max": 30, "value": 15 }
    ]
  },
  {
    "name": "Sketch 3",
    "file": "sketch3.js",
    "sliders": [
      { "id": "numCircles", "label": "Number of Circles", "min": 1, "max": 20, "value": 10 },
      { "id": "rotationSpeed", "label": "Rotation Speed", "min": 0.001, "max": 0.1, "step": 0.001, "value": 0.01 }
    ]
  },
  {
    "name": "Sketch 4",
    "file": "sketch4.js",
    "sliders": [
      { "id": "someParameter", "label": "Some Parameter", "min": 0, "max": 100, "value": 50 }
    ]
  }
]
```

## Running the Project

1. **Open `index.html`**: Open the `index.html` file in your web browser. This will load the main interface.

2. **Switch Sketches**: Use the buttons in the sidebar to switch between different sketches. The sliders for each sketch will appear below the buttons.

3. **Adjust Parameters**: Use the sliders to adjust the parameters of the currently loaded sketch. The sketch will update in real-time based on the slider values.

## Customizing the Interface

You can customize the appearance of the interface by modifying the `style.css` file. This file contains the styles for the sidebar, buttons, sliders, and canvas container.

## Example Sketch Structure

Each sketch file should follow this structure:

```javascript
(function() {
  // Define your parameters
  let parameter1 = 50;
  let parameter2 = 100;

  function setup() {
    let canvasWidth = windowWidth * 0.7;
    let canvasHeight = canvasWidth * (3 / 4);
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    noStroke();
  }

  function draw() {
    background(0);
    // Update parameters from sliders
    parameter1 = parseInt(document.getElementById('parameter1').value);
    parameter2 = parseInt(document.getElementById('parameter2').value);
    // Your drawing code here
  }

  window.setup = setup;
  window.draw = draw;
})();
```

## Conclusion

This infrastructure allows you to easily switch between different p5.js sketches and adjust their parameters using sliders. By following the provided structure, you can add new sketches and customize the interface to suit your needs.
