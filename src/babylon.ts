import { CreatePlane, SceneLoader } from '@babylonjs/core';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { Engine } from '@babylonjs/core/Engines/engine';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Scene } from '@babylonjs/core/scene';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
// import { AxesViewer } from '@babylonjs/core/Debug/axesViewer';

import { registerBuiltInLoaders } from '@babylonjs/loaders/dynamic';

(async () => {
  registerBuiltInLoaders();
  // Get the canvas element from the DOM.
  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

  // Associate a Babylon Engine to it.
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });

  // Create our first scene.
  const scene = new Scene(engine);

  // This creates and positions a free camera (non-mesh)
  const camera = new FreeCamera('camera1', new Vector3(0, 0, -6), scene);

  // This targets the camera to scene origin
  camera.setTarget(Vector3.Zero());

  // Add mouse tracking variables
  let mouseX = 0;
  let mouseY = 0;

  // Track mouse movement - moved before camera attachment
  window.onmousemove = (evt) => {
    mouseX = (evt.clientX / window.innerWidth) * 2 - 1;
    mouseY = (evt.clientY / window.innerHeight) * 2 - 1;
  };

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 1;

  // Create a black material
  const material = new StandardMaterial('black-material', scene);
  material.diffuseColor = new Color3(0, 0, 0);

  // plane
  const plane = CreatePlane('plane', { size: 50 }, scene);
  plane.position.x = 0;
  plane.position.y = 0;
  plane.position.z = 0;
  plane.rotation.y = 0;

  // Affect a material
  plane.material = material;

  // Modify render loop to include camera movement
  engine.runRenderLoop(() => {
    // Smoothly move camera based on mouse position
    const targetX = mouseX * 5; // 5 controls horizontal movement range
    const targetY = mouseY * -3; // 3 controls vertical movement range

    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;

    camera.setTarget(Vector3.Zero());
    scene.render();
  });

  SceneLoader.ImportMeshAsync(null, './', 'ile.splat', scene).then((result) => {
    const gaussianSplattingMesh = result.meshes[0];
    gaussianSplattingMesh.rotate(Vector3.Up(), Math.PI / 2);
    gaussianSplattingMesh.position = new Vector3(0, 0, 0);

    let angleUp = 0;
    let angleBack = 0;
    let directionUp = 1;
    let directionBack = 1;
    const rotationSpeed = 0.0005;
    const maxRotation = Math.PI / 16;

    scene.registerBeforeRender(() => {
      // Up rotation
      angleUp += rotationSpeed * directionUp;
      if (Math.abs(angleUp) >= maxRotation) {
        directionUp *= -1;
      }

      // Backward rotation
      angleBack += rotationSpeed * 0.7 * directionBack; // Slightly different speed
      if (Math.abs(angleBack) >= maxRotation * 0.8) {
        // Different max rotation
        directionBack *= -1;
      }

      gaussianSplattingMesh.rotate(Vector3.Up(), rotationSpeed * directionUp);
      gaussianSplattingMesh.rotate(
        Vector3.Backward(),
        rotationSpeed * directionBack,
      );
    });
  });

  // Handle browser resize
  window.addEventListener('resize', () => {
    engine.resize();
  });
})();
