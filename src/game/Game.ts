import type { Scene } from "@babylonjs/core/scene";
import { PlayerView } from "../systems/PlayerView";
import { RatSystem } from "../systems/RatSystem";
import { WaveSystem } from "../systems/WaveSystem";
import { WeaponSystem } from "../systems/WeaponSystem";
import { HitEffects } from "../systems/HitEffects";
import { Hud } from "../ui/hud";

const MAX_HEALTH = 100;
const DAMAGE_FLASH_OPACITY = 0.6;
const DAMAGE_FLASH_FADE = 2; // opacidad por segundo

// "paused" también cubre el inicio: sin mouse capturado no corre la simulación.
type State = "paused" | "playing" | "gameOver";

export interface GameUI {
  overlay: HTMLElement;
  damage: HTMLElement;
  hitmarker: HTMLElement;
  hud: HTMLElement;
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
  private hud: Hud;

  constructor(scene: Scene, canvas: HTMLCanvasElement, private ui: GameUI) {
    this.hud = new Hud(ui.hud);
    this.player = new PlayerView(scene, canvas, (locked) => this.onLockChange(locked));
    this.rats = new RatSystem(scene);
    this.waves = new WaveSystem(this.rats, (wave) => this.hud.showWaveBanner(wave));
    this.effects = new HitEffects(scene, ui.hitmarker);
    this.weapons = new WeaponSystem(scene, this.player, this.rats, this.effects, canvas);
    this.showOverlay("start", `<h1 class="sign">ratDance</h1><p class="hint">Click para jugar</p>`);
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
      this.hud.hurt();
      if (this.health <= 0) this.gameOver();
    }
    this.hud.update(this.health, MAX_HEALTH, this.waves.wave, this.rats.money);
  }

  private onLockChange(locked: boolean): void {
    if (locked) {
      // wave === 0: primera partida, todavía no arrancó ninguna oleada.
      if (this.state === "gameOver" || this.waves.wave === 0) this.reset();
      this.state = "playing";
      this.ui.overlay.classList.add("hidden");
    } else if (this.state === "playing") {
      this.state = "paused";
      this.showOverlay("pause", `<h1 class="sign">Pausa</h1><p class="hint">Click para seguir</p>`);
    }
  }

  private gameOver(): void {
    this.state = "gameOver";
    document.exitPointerLock();
    const seconds = Math.floor(this.survived);
    this.showOverlay(
      "gameOver",
      `<h1 class="sign">Te bailaron</h1>` +
        `<dl class="stats panel">` +
        `<dt>Oleada</dt><dd>${this.waves.wave}</dd>` +
        `<dt>Tiempo</dt><dd>${seconds} s</dd>` +
        `<dt>Ratas</dt><dd>${this.rats.kills}</dd>` +
        `<dt>Queso</dt><dd>${this.rats.money}</dd>` +
        `</dl>` +
        `<p class="hint">Click para reintentar</p>`,
    );
  }

  private reset(): void {
    this.health = MAX_HEALTH;
    this.survived = 0;
    this.rats.clear();
    this.waves.reset();
    this.weapons.clear();
  }

  private showOverlay(kind: "start" | "pause" | "gameOver", html: string): void {
    this.ui.overlay.dataset.kind = kind; // el CSS cambia el estilo según el tipo
    this.ui.overlay.innerHTML = html;
    this.ui.overlay.classList.remove("hidden");
  }
}
