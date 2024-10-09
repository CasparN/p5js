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
    input.value = slider.value;
    if (slider.step) {
      input.step = slider.step;
    }
    slidersContainer.appendChild(label);
    slidersContainer.appendChild(input);
  });
}