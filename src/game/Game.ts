import type { Scene } from "@babylonjs/core/scene";
import { PlayerView } from "../systems/PlayerView";
import { RatSystem } from "../systems/RatSystem";
import { WaveSystem } from "../systems/WaveSystem";
import { WeaponSystem } from "../systems/WeaponSystem";
import { HitEffects } from "../systems/HitEffects";

const MAX_HEALTH = 100;
const DAMAGE_FLASH_OPACITY = 0.6;
const DAMAGE_FLASH_FADE = 2; // opacidad por segundo

// "paused" también cubre el inicio: sin mouse capturado no corre la simulación.
type State = "paused" | "playing" | "gameOver";

export interface GameUI {
  overlay: HTMLElement;
  damage: HTMLElement;
  hitmarker: HTMLElement;
}

/** Dueño de los sistemas y de la máquina de estados. */
export class Game {
  private state: State = "paused";
  private health = MAX_HEALTH;
  private survived = 0; // segundos
  private damageFlash = 0;

  private player: PlayerView;
  private rats: RatSystem;
  private waves: WaveSystem;
  private weapons: WeaponSystem;
  private effects: HitEffects;

  constructor(scene: Scene, canvas: HTMLCanvasElement, private ui: GameUI) {
    this.player = new PlayerView(scene, canvas, (locked) => this.onLockChange(locked));
    this.rats = new RatSystem(scene);
    this.waves = new WaveSystem(this.rats);
    this.effects = new HitEffects(scene, ui.hitmarker);
    this.weapons = new WeaponSystem(scene, this.player, this.rats, this.effects, canvas);
    this.showOverlay("Click para jugar");
  }

  update(dt: number): void {
    this.damageFlash = Math.max(0, this.damageFlash - DAMAGE_FLASH_FADE * dt);
    this.ui.damage.style.opacity = String(this.damageFlash);
    if (this.state !== "playing") return;

    this.survived += dt;
    this.waves.update(dt);
    const damage = this.rats.update(dt);
    this.weapons.update(dt);
    this.effects.update(dt);

    if (damage > 0) {
      this.health -= damage;
      this.damageFlash = DAMAGE_FLASH_OPACITY;
      if (this.health <= 0) this.gameOver();
    }
  }

  private onLockChange(locked: boolean): void {
    if (locked) {
      if (this.state === "gameOver") this.reset();
      this.state = "playing";
      this.ui.overlay.classList.add("hidden");
    } else if (this.state === "playing") {
      this.state = "paused";
      this.showOverlay("Pausa<small>Click para seguir</small>");
    }
  }

  private gameOver(): void {
    this.state = "gameOver";
    document.exitPointerLock();
    const seconds = Math.floor(this.survived);
    this.showOverlay(
      `GAME OVER<small>Sobreviviste ${seconds} s · ${this.rats.kills} ratas</small><small>Click para reintentar</small>`,
    );
  }

  private reset(): void {
    this.health = MAX_HEALTH;
    this.survived = 0;
    this.rats.clear();
    this.waves.reset();
    this.weapons.clear();
  }

  private showOverlay(html: string): void {
    this.ui.overlay.innerHTML = html;
    this.ui.overlay.classList.remove("hidden");
  }
}
