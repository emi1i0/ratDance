import type { Scene } from "@babylonjs/core/scene";
import { PlayerView } from "../systems/PlayerView";
import { RatSystem } from "../systems/RatSystem";
import { TOTAL_WAVES, WaveSystem } from "../systems/WaveSystem";
import { WeaponSystem } from "../systems/WeaponSystem";
import { HitEffects } from "../systems/HitEffects";
import { Hud } from "../ui/hud";
import { loadSettings, SettingsPanel } from "../ui/settings";

const MAX_HEALTH = 100;
const DAMAGE_FLASH_OPACITY = 0.6;
const DAMAGE_FLASH_FADE = 2; // opacidad por segundo

// "paused" también cubre el inicio: sin mouse capturado no corre la simulación.
// "gameOver" cubre el fin de la partida, tanto si moriste como si ganaste.
type State = "paused" | "playing" | "gameOver";

export interface GameUI {
  overlay: HTMLElement;
  damage: HTMLElement;
  hitmarker: HTMLElement;
  hud: HTMLElement;
  settings: HTMLElement;
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
    const settings = loadSettings();
    this.player.sensitivity = settings.sensitivity;
    new SettingsPanel(ui.settings, settings, (s) => (this.player.sensitivity = s.sensitivity));
    this.rats = new RatSystem(scene);
    this.waves = new WaveSystem(
      this.rats,
      (wave, hasBoss) => this.hud.showWaveBanner(wave, hasBoss),
      () => this.endGame(true),
    );
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
      if (this.health <= 0) this.endGame(false);
    }
    this.hud.update(this.health, MAX_HEALTH, this.waves.wave, TOTAL_WAVES, this.rats.money);
  }

  private onLockChange(locked: boolean): void {
    if (locked) {
      // wave === 0: primera partida, todavía no arrancó ninguna oleada.
      if (this.state === "gameOver" || this.waves.wave === 0) this.reset();
      this.state = "playing";
      this.ui.overlay.classList.add("hidden");
      this.ui.settings.classList.add("hidden");
    } else if (this.state === "playing") {
      this.state = "paused";
      this.showOverlay("pause", `<h1 class="sign">Pausa</h1><p class="hint">Click para seguir</p>`);
    }
  }

  private endGame(won: boolean): void {
    if (this.state === "gameOver") return;
    this.state = "gameOver";
    document.exitPointerLock();
    const seconds = Math.floor(this.survived);
    this.showOverlay(
      won ? "victory" : "gameOver",
      `<h1 class="sign">${won ? "Sobreviviste" : "Te bailaron"}</h1>` +
        `<dl class="stats panel">` +
        `<dt>Oleada</dt><dd>${this.waves.wave}</dd>` +
        `<dt>Tiempo</dt><dd>${seconds} s</dd>` +
        `<dt>Ratas</dt><dd>${this.rats.kills}</dd>` +
        `<dt>Queso</dt><dd>${this.rats.money}</dd>` +
        `</dl>` +
        `<p class="hint">${won ? "Click para jugar de nuevo" : "Click para reintentar"}</p>`,
    );
  }

  private reset(): void {
    this.health = MAX_HEALTH;
    this.survived = 0;
    this.rats.clear();
    this.waves.reset();
    this.weapons.clear();
  }

  private showOverlay(kind: "start" | "pause" | "gameOver" | "victory", html: string): void {
    this.ui.overlay.dataset.kind = kind; // el CSS cambia el estilo según el tipo
    this.ui.overlay.innerHTML = html;
    this.ui.overlay.classList.remove("hidden");
    // Las opciones se pueden tocar en inicio y pausa (en el fin de partida, no).
    this.ui.settings.classList.toggle("hidden", kind !== "start" && kind !== "pause");
  }
}
