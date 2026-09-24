import type { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";

const EYE_HEIGHT = 1.7;
const BASE_SENSITIVITY = 0.002; // radianes por píxel con sensibilidad 1x
const MAX_PITCH = Math.PI / 2 - 0.05;

/** Cámara en primera persona fija en el centro: solo gira con el mouse (pointer lock). */
export class PlayerView {
  readonly camera: FreeCamera;
  sensitivity = 1; // multiplicador elegido en Opciones

  constructor(scene: Scene, private canvas: HTMLCanvasElement, private onLockChange: (locked: boolean) => void) {
    // FreeCamera: cámara con posición + rotación (euler) libres, como una PerspectiveCamera.
    this.camera = new FreeCamera("playerCamera", new Vector3(0, EYE_HEIGHT, 0), scene);
    this.camera.minZ = 0.05;
    this.camera.fov = 1.2; // radianes (vertical)
    // Sin attachControl: el jugador no se mueve y la mirada la manejamos a mano.
    this.camera.inputs.clear();

    canvas.addEventListener("click", () => {
      // El navegador rechaza el pedido si se hace justo después de salir con Esc (~1 s de espera).
      if (!this.isLocked) Promise.resolve(canvas.requestPointerLock()).catch(() => {});
    });
    document.addEventListener("pointerlockchange", () => this.onLockChange(this.isLocked));
    document.addEventListener("mousemove", (e) => this.look(e));
  }

  get isLocked(): boolean {
    return document.pointerLockElement === this.canvas;
  }

  private look(e: MouseEvent): void {
    if (!this.isLocked) return;
    const k = BASE_SENSITIVITY * this.sensitivity;
    const rot = this.camera.rotation;
    rot.y += e.movementX * k;
    rot.x = Math.min(MAX_PITCH, Math.max(-MAX_PITCH, rot.x + e.movementY * k));
  }
}
