import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { createEnvironment } from "./scene/environment";
import { Game } from "./game/Game";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

// Engine: envuelve el contexto WebGL (como WebGLRenderer). Scene: el grafo de objetos.
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
scene.clearColor = new Color4(0.08, 0.05, 0.12, 1);

createEnvironment(scene);
const game = new Game(scene, canvas, {
  overlay: document.getElementById("overlay") as HTMLDivElement,
  damage: document.getElementById("damage") as HTMLDivElement,
  hitmarker: document.getElementById("hitmarker") as HTMLDivElement,
});

engine.runRenderLoop(() => {
  // getDeltaTime(): ms desde el frame anterior; lo acotamos para evitar saltos tras cambiar de pestaña.
  const dt = Math.min(engine.getDeltaTime() / 1000, 0.1);
  game.update(dt);
  scene.render();
});
window.addEventListener("resize", () => engine.resize());

if (import.meta.env.DEV) {
  // Inspector de Babylon: árbol de escena + propiedades editables. Toggle con la tecla "I".
  let inspector: { dispose(): void } | null = null;
  window.addEventListener("keydown", async (e) => {
    if (e.key.toLowerCase() !== "i") return;
    if (inspector) {
      inspector.dispose();
      inspector = null;
      return;
    }
    const { ShowInspector } = await import("@babylonjs/inspector");
    document.exitPointerLock();
    inspector = ShowInspector(scene);
  });
}
