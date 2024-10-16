let currentSketch;

document.addEventListener('DOMContentLoaded', () => {
  fetch('sketches.json')
    .then(response => response.json())
    .then(sketches => {
      const buttonsContainer = document.getElementById('buttons');
      sketches.forEach((sketch, index) => {
        const button = document.createElement('button');
        button.textContent = sketch.name;
        button.onclick = () => loadSketch(sketch);
        buttonsContainer.appendChild(button);
      });
    });
});

function loadSketch(sketch) {
  if (currentSketch) {
    currentSketch.remove();
  }
  const canvasContainer = document.getElementById('canvas-container');
  canvasContainer.innerHTML = ''; // Clear the container

  const script = document.createElement('script');
  script.src = `sketches/${sketch.file}`;
  script.onload = () => {
    currentSketch = new p5();
  };
  canvasContainer.appendChild(script);

  // Create sliders
  const slidersContainer = document.getElementById('sliders');
  slidersContainer.innerHTML = ''; // Clear existing sliders
  if (sketch.sliders) {
    sketch.sliders.forEach(slider => {
      const label = document.createElement('label');
      label.setAttribute('for', slider.id);
      label.textContent = slider.label;
      const input = document.createElement('input');
      input.type = 'range';
      input.id = slider.id;
      input.name = slider.id;
      input.min = slider.min;
      input.max = slider.max;
      if (slider.step) {
        input.step = slider.step;
      }
      input.value = slider.value; // Set value after min, max, and step
      slidersContainer.appendChild(label);
      slidersContainer.appendChild(input);
    });
  }

  // Create checkboxes
  const checkboxesContainer = document.getElementById('checkboxes');
  checkboxesContainer.innerHTML = ''; // Clear existing checkboxes
  if (sketch.checkboxes) {
    sketch.checkboxes.forEach(checkbox => {
      const label = document.createElement('label');
      label.setAttribute('for', checkbox.id);
      label.textContent = checkbox.label;
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = checkbox.id;
      input.name = checkbox.id;
      input.checked = checkbox.checked;
      checkboxesContainer.appendChild(label);
      checkboxesContainer.appendChild(input);
    });
  }
}