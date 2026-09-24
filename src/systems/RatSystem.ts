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
const RAT_DAMAGE_PER_SECOND = 10;
const RAT_REWARD = 1; // dinero por rata muerta
const SPAWN_DISTANCE = 25;
const REACH_DISTANCE = 1.5; // a esta distancia la rata se queda bailando y hace daño
const MAX_RATS = 200;

// Zona de impacto: cilindro vertical desde el piso (el sprite es más ancho que el cuerpo).
export const RAT_HIT_RADIUS = RAT_SIZE * 0.25;
export const RAT_HIT_HEIGHT = RAT_SIZE * 0.9;

/** Ratas que caminan hacia el jugador (en el origen) y le hacen daño al llegar. */
export class RatSystem {
  readonly rats: Sprite[] = [];
  kills = 0;
  money = 0; // ganado en esta partida
  private manager: SpriteManager;

  constructor(scene: Scene) {
    // SpriteManager: dibuja muchos sprites de un mismo spritesheet en un solo draw call.
    this.manager = new SpriteManager("rats", ratSheetUrl, MAX_RATS, CELL_SIZE, scene);
  }

  /** Mueve las ratas y devuelve el daño total que le hicieron al jugador en este frame. */
  update(dt: number): number {
    let damage = 0;
    for (const rat of this.rats) {
      const pos = rat.position;
      const toPlayer = new Vector3(-pos.x, 0, -pos.z);
      const distance = toPlayer.length();
      if (distance <= REACH_DISTANCE) {
        damage += RAT_DAMAGE_PER_SECOND * dt;
        continue;
      }
      const step = Math.min(RAT_SPEED * dt, distance - REACH_DISTANCE);
      pos.addInPlace(toPlayer.scaleInPlace(step / distance));
    }
    return damage;
  }

  /** Crea una rata lejos, en un ángulo al azar alrededor del jugador. */
  spawn(): void {
    if (this.rats.length >= MAX_RATS) return;
    const rat = new Sprite("rat", this.manager);
    rat.size = RAT_SIZE;
    // playAnimation(desde, hasta, loop, ms por frame): recorre las celdas del spritesheet.
    // Arrancar en un frame al azar evita que todas bailen sincronizadas.
    rat.playAnimation(0, FRAME_COUNT - 1, true, FRAME_MS);
    rat.cellIndex = Math.floor(Math.random() * FRAME_COUNT);

    const angle = Math.random() * Math.PI * 2;
    // El sprite se posiciona por su centro: lo subimos para que los pies toquen el piso.
    const y = RAT_SIZE * (FEET_RATIO - 0.5);
    rat.position = new Vector3(Math.sin(angle) * SPAWN_DISTANCE, y, Math.cos(angle) * SPAWN_DISTANCE);
    this.rats.push(rat);
  }

  kill(rat: Sprite): void {
    rat.dispose();
    this.rats.splice(this.rats.indexOf(rat), 1);
    this.kills++;
    this.money += RAT_REWARD;
  }

  clear(): void {
    for (const rat of this.rats) rat.dispose();
    this.rats.length = 0;
    this.kills = 0;
    this.money = 0;
  }
}
