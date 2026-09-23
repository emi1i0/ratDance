import type { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { SpriteManager } from "@babylonjs/core/Sprites/spriteManager";
import { Sprite } from "@babylonjs/core/Sprites/sprite";
// Importar el asset hace que Vite le agregue un hash a la URL en el build (evita caché vieja).
import ratSheetUrl from "../assets/rat_dance.png";

// Datos del spritesheet generado con tools/gif_to_spritesheet.py desde el GIF del meme.
const CELL_SIZE = 128;
const FRAME_COUNT = 157;
const FRAME_MS = 30;
const FEET_RATIO = 0.97; // los pies están al 97% de la altura del frame

const RAT_SIZE = 2;
const RAT_SPEED = 3; // unidades por segundo
const SPAWN_DISTANCE = 25;
const REACH_DISTANCE = 1.5;
const RESPAWN_DELAY = 1; // segundos

// Zona de impacto: cilindro vertical desde el piso (el sprite es más ancho que el cuerpo).
export const RAT_HIT_RADIUS = RAT_SIZE * 0.25;
export const RAT_HIT_HEIGHT = RAT_SIZE * 0.9;

/** Por ahora: una sola rata que aparece lejos y camina hacia el jugador (en el origen). */
export class RatSystem {
  readonly rats: Sprite[] = [];
  private manager: SpriteManager;
  private respawnTimer = 0;

  constructor(scene: Scene) {
    // SpriteManager: dibuja muchos sprites de un mismo spritesheet en un solo draw call.
    this.manager = new SpriteManager("rats", ratSheetUrl, 200, CELL_SIZE, scene);
  }

  update(dt: number): void {
    if (this.rats.length === 0) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) this.spawn();
    }

    for (const rat of this.rats) {
      const pos = rat.position;
      const toPlayer = new Vector3(-pos.x, 0, -pos.z);
      const distance = toPlayer.length();
      if (distance <= REACH_DISTANCE) {
        this.placeAtSpawn(rat); // temporal hasta que exista el daño al jugador (hito 4)
        continue;
      }
      pos.addInPlace(toPlayer.scaleInPlace(Math.min(RAT_SPEED * dt, distance) / distance));
    }
  }

  kill(rat: Sprite): void {
    rat.dispose();
    this.rats.splice(this.rats.indexOf(rat), 1);
    this.respawnTimer = RESPAWN_DELAY;
  }

  private spawn(): void {
    const rat = new Sprite("rat", this.manager);
    rat.size = RAT_SIZE;
    // playAnimation(desde, hasta, loop, ms por frame): recorre las celdas del spritesheet.
    rat.playAnimation(0, FRAME_COUNT - 1, true, FRAME_MS);
    this.placeAtSpawn(rat);
    this.rats.push(rat);
  }

  private placeAtSpawn(rat: Sprite): void {
    const angle = Math.random() * Math.PI * 2;
    // El sprite se posiciona por su centro: lo subimos para que los pies toquen el piso.
    const y = RAT_SIZE * (FEET_RATIO - 0.5);
    rat.position = new Vector3(Math.sin(angle) * SPAWN_DISTANCE, y, Math.cos(angle) * SPAWN_DISTANCE);
  }
}
