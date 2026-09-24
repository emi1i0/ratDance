import type { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { SpriteManager } from "@babylonjs/core/Sprites/spriteManager";
import { Sprite } from "@babylonjs/core/Sprites/sprite";
import type { RatType } from "../data/rats";
// Importar el asset hace que Vite le agregue un hash a la URL en el build (evita caché vieja).
import ratSheetUrl from "../assets/rat_dance.png";

// Datos del spritesheet generado con tools/gif_to_spritesheet.py desde el GIF del meme.
const CELL_SIZE = 128;
const FRAME_COUNT = 157;
const FRAME_MS = 30;
const FEET_RATIO = 0.97; // los pies están al 97% de la altura del frame

const SPAWN_DISTANCE = 25;
const MAX_RATS = 200;
const HIT_FLASH_TIME = 0.08; // segundos que la rata queda blanca al recibir un impacto
const HIT_FLASH_BRIGHTNESS = 3; // el color del sprite multiplica la textura: >1 la aclara

export interface Rat {
  sprite: Sprite;
  type: RatType;
  health: number;
  flash: number; // segundos de destello restantes
}

// Zona de impacto: cilindro vertical desde el piso (el sprite es más ancho que el cuerpo).
export const hitRadius = (rat: Rat) => rat.type.size * 0.25;
export const hitHeight = (rat: Rat) => rat.type.size * 0.9;
// A esta distancia la rata se queda bailando y hace daño; las grandes se frenan antes.
const reachDistance = (rat: Rat) => 1.2 + rat.type.size * 0.2;

/** Ratas que caminan hacia el jugador (en el origen) y le hacen daño al llegar. */
export class RatSystem {
  readonly rats: Rat[] = [];
  kills = 0;
  money = 0; // queso ganado en esta partida
  private manager: SpriteManager;

  constructor(scene: Scene) {
    // SpriteManager: dibuja muchos sprites de un mismo spritesheet en un solo draw call.
    this.manager = new SpriteManager("rats", ratSheetUrl, MAX_RATS, CELL_SIZE, scene);
  }

  /** Mueve las ratas y devuelve el daño total que le hicieron al jugador en este frame. */
  update(dt: number): number {
    let damage = 0;
    for (const rat of this.rats) {
      if (rat.flash > 0) {
        rat.flash -= dt;
        if (rat.flash <= 0) rat.sprite.color = tintColor(rat.type);
      }

      const pos = rat.sprite.position;
      const toPlayer = new Vector3(-pos.x, 0, -pos.z);
      const distance = toPlayer.length();
      const reach = reachDistance(rat);
      if (distance <= reach) {
        damage += rat.type.damagePerSecond * dt;
        continue;
      }
      const step = Math.min(rat.type.speed * dt, distance - reach);
      pos.addInPlace(toPlayer.scaleInPlace(step / distance));
    }
    return damage;
  }

  /** Crea una rata lejos, en un ángulo al azar alrededor del jugador. */
  spawn(type: RatType): void {
    if (this.rats.length >= MAX_RATS) return;
    const sprite = new Sprite("rat", this.manager);
    sprite.size = type.size;
    sprite.color = tintColor(type);
    // playAnimation(desde, hasta, loop, ms por frame): recorre las celdas del spritesheet.
    // Arrancar en un frame al azar evita que todas bailen sincronizadas.
    sprite.playAnimation(0, FRAME_COUNT - 1, true, FRAME_MS);
    sprite.cellIndex = Math.floor(Math.random() * FRAME_COUNT);

    const angle = Math.random() * Math.PI * 2;
    // El sprite se posiciona por su centro: lo subimos para que los pies toquen el piso.
    const y = type.size * (FEET_RATIO - 0.5);
    sprite.position = new Vector3(Math.sin(angle) * SPAWN_DISTANCE, y, Math.cos(angle) * SPAWN_DISTANCE);
    this.rats.push({ sprite, type, health: type.health, flash: 0 });
  }

  /** Aplica daño; devuelve true si la rata murió. */
  damage(rat: Rat, amount: number): boolean {
    rat.health -= amount;
    if (rat.health <= 0) {
      this.kill(rat);
      return true;
    }
    rat.flash = HIT_FLASH_TIME;
    rat.sprite.color = new Color4(HIT_FLASH_BRIGHTNESS, HIT_FLASH_BRIGHTNESS, HIT_FLASH_BRIGHTNESS, 1);
    return false;
  }

  clear(): void {
    for (const rat of this.rats) rat.sprite.dispose();
    this.rats.length = 0;
    this.kills = 0;
    this.money = 0;
  }

  private kill(rat: Rat): void {
    rat.sprite.dispose();
    this.rats.splice(this.rats.indexOf(rat), 1);
    this.kills++;
    this.money += rat.type.reward;
  }
}

function tintColor(type: RatType): Color4 {
  const [r, g, b] = type.tint;
  return new Color4(r, g, b, 1);
}
