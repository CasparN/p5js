let currentSketch;

function loadSketch(scriptName) {
  if (currentSketch) {
    currentSketch.remove();
  }
  const canvasContainer = document.getElementById('canvas-container');
  canvasContainer.innerHTML = ''; // Clear the container

  const script = document.createElement('script');
  script.src = scriptName;
  script.onload = () => {
    currentSketch = new p5();
  };
  canvasContainer.appendChild(script);
}