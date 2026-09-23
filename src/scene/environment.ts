import type { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";

export function createEnvironment(scene: Scene): void {
  // Luz ambiente que ilumina desde "arriba" con un color de suelo para las caras de abajo
  // (equivalente a HemisphereLight de three.js).
  const light = new HemisphericLight("light", new Vector3(0.3, 1, 0.2), scene);
  light.intensity = 0.9;
  light.groundColor = new Color3(0.2, 0.15, 0.25);

  // CreateGround: plano horizontal ya rotado (no hace falta girarlo como PlaneGeometry).
  const ground = CreateGround("ground", { width: 60, height: 60 }, scene);
  const groundMat = new StandardMaterial("groundMat", scene);
  groundMat.diffuseColor = new Color3(0.45, 0.35, 0.25);
  groundMat.specularColor = Color3.Black();
  ground.material = groundMat;

  // Marcadores temporales para orientarse al girar la cámara (N/E/S/O).
  const markers: [string, Vector3, Color3][] = [
    ["north", new Vector3(0, 1, 15), new Color3(1, 0.2, 0.2)],
    ["east", new Vector3(15, 1, 0), new Color3(0.2, 1, 0.2)],
    ["south", new Vector3(0, 1, -15), new Color3(0.2, 0.4, 1)],
    ["west", new Vector3(-15, 1, 0), new Color3(1, 1, 0.2)],
  ];
  for (const [name, position, color] of markers) {
    const box = CreateBox(name, { size: 2 }, scene);
    box.position = position;
    const mat = new StandardMaterial(`${name}Mat`, scene);
    mat.diffuseColor = color;
    box.material = mat;
  }
}
