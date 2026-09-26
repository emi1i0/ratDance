import type { Scene } from "@babylonjs/core/scene";
import { PlayerView } from "../systems/PlayerView";
import { RatSystem } from "../systems/RatSystem";
import { TOTAL_WAVES, WaveSystem } from "../systems/WaveSystem";
import { WeaponSystem } from "../systems/WeaponSystem";
import { HitEffects } from "../systems/HitEffects";
import { AudioSystem } from "../systems/AudioSystem";
import { DAMAGE_SOUND, GAME_OVER_SOUND, MUSIC } from "../data/audio";
import { Hud } from "../ui/hud";
import { loadSettings, SettingsPanel } from "../ui/settings";

const MAX_HEALTH = 100;

const DAMAGE_FLASH_OPACITY = 0.6;
const DAMAGE_FLASH_FADE = 2; // opacidad por segundo
// Al morir el jugador suele seguir clickeando: los botones del final esperan un poco
// para que ese click no aprete "Reintentar" sin querer.
const END_BUTTONS_DELAY = 800; // ms

// "menu" es la pantalla inicial. Sin mouse capturado no corre la simulación ("paused").
// "gameOver" cubre el fin de la partida, tanto si moriste como si ganaste.
type State = "menu" | "paused" | "playing" | "gameOver";

export interface GameUI {
  overlay: HTMLElement;
  damage: HTMLElement;
  hitmarker: HTMLElement;
  hud: HTMLElement;
  settings: HTMLElement;
}

/** Dueño de los sistemas y de la máquina de estados. */
export class Game {
  private state: State = "menu";
  private health = MAX_HEALTH;
  private survived = 0; // segundos
  private damageFlash = 0;

  private player: PlayerView;
  private rats: RatSystem;
  private waves: WaveSystem;
  private weapons: WeaponSystem;
  private effects: HitEffects;
  private audio = new AudioSystem();
  private hud: Hud;

  constructor(scene: Scene, canvas: HTMLCanvasElement, private ui: GameUI) {
    this.hud = new Hud(ui.hud);
    this.player = new PlayerView(scene, canvas, (locked) => this.onLockChange(locked));
    const settings = loadSettings();
    this.player.sensitivity = settings.sensitivity;
    this.audio.setVolume(settings.volume);
    void this.audio.loadMusic(MUSIC.url, MUSIC.cues);
    void this.audio.loadDamageSound(DAMAGE_SOUND);
    void this.audio.loadGameOverSound(GAME_OVER_SOUND);
    new SettingsPanel(ui.settings, settings, (s) => {
      this.player.sensitivity = s.sensitivity;
      this.audio.setVolume(s.volume);
    });
    this.rats = new RatSystem(scene);
    this.waves = new WaveSystem(
      this.rats,
      (wave, hasBoss) => this.hud.showWaveBanner(wave, hasBoss),
      () => this.endGame(true),
    );
    this.effects = new HitEffects(scene, ui.hitmarker);
    ui.overlay.addEventListener("click", (e) => this.onOverlayClick(e));
    // El panel de opciones es una sub-pantalla de menú y pausa, con su botón para volver.
    ui.settings.insertAdjacentHTML("beforeend", `<div class="menu"><button data-action="back">Volver</button></div>`);
    ui.settings.querySelector("button")?.addEventListener("click", () => {
      this.showOptions(false);
      this.ui.overlay.querySelector<HTMLElement>('[data-action="options"]')?.focus();
    });
    this.weapons = new WeaponSystem(scene, this.player, this.rats, this.effects, this.audio, canvas);
    this.showMenu();
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
      this.audio.damage();
      if (this.health <= 0) this.endGame(false);
    }
    this.hud.update(this.health, MAX_HEALTH, this.waves.wave, TOTAL_WAVES, this.rats.money);
  }

  private onLockChange(locked: boolean): void {
    if (locked) {
      // El HUD se muestra antes de arrancar: el cartel de la oleada 1 se anima dentro de él.
      this.ui.hud.classList.remove("hidden");
      // Desde el menú o el fin de partida arranca una partida nueva; desde la pausa, sigue.
      if (this.state === "menu" || this.state === "gameOver") this.startRun();
      this.state = "playing";
      this.audio.resume();
      this.ui.overlay.classList.add("hidden");
    } else if (this.state === "playing") {
      this.state = "paused";
      this.audio.suspend();
      this.showOverlay(
        "pause",
        `<h1 class="sign">Pausa</h1>` +
          `<div class="menu">` +
          `<button data-action="play">Seguir</button>` +
          `<button data-action="options">Opciones</button>` +
          `<button data-action="menu">Menú</button>` +
          `</div>` +
          `<p class="hint">Click para seguir</p>`,
      );
    }
  }

  private endGame(won: boolean): void {
    if (this.state === "gameOver") return;
    this.state = "gameOver";
    document.exitPointerLock();
    if (!won) this.audio.gameOver(); // música ahogada + "trombón triste" con el sonido de game over
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
        `<div class="menu">` +
        `<button data-action="play" disabled>${won ? "Jugar de nuevo" : "Reintentar"}</button>` +
        `<button data-action="menu" disabled>Menú</button>` +
        `</div>`,
    );
    const buttons = this.ui.overlay.querySelectorAll("button");
    setTimeout(() => {
      buttons.forEach((b) => (b.disabled = false));
      buttons[0].focus(); // Enter también sirve
    }, END_BUTTONS_DELAY);
  }

  private showMenu(): void {
    this.state = "menu";
    this.showOverlay(
      "menu",
      `<h1 class="sign">ratDance</h1>` +
        `<div class="menu">` +
        `<button data-action="play">Jugar</button>` +
        `<button data-action="options">Opciones</button>` +
        `</div>` +
        `<p class="controls">Mouse: apuntar · Click: disparar · Esc: pausa</p>`,
    );
    this.ui.overlay.querySelector("button")?.focus();
  }

  /** Clicks en el overlay: botones de menú, pausa y fin de partida. */
  private onOverlayClick(e: MouseEvent): void {
    const action = (e.target as HTMLElement).closest("button")?.dataset.action;
    if (this.ui.overlay.classList.contains("options-open")) return; // se cierra con "Volver"
    // En pausa, un click en cualquier otro lado también sigue la partida.
    if (action === "play" || (!action && this.state === "paused")) {
      this.player.lock(); // al capturarse el mouse, onLockChange arranca la partida
    } else if (action === "options") {
      this.showOptions(true);
    } else if (action === "menu") {
      this.clearRun(); // limpia la escena de fondo sin arrancar oleadas
      this.showMenu();
    }
  }

  /** Abre/cierra el panel de opciones; mientras está abierto, el CSS oculta el contenido del overlay. */
  private showOptions(open: boolean): void {
    this.ui.overlay.classList.toggle("options-open", open);
    this.ui.settings.classList.toggle("hidden", !open);
    if (open) this.ui.settings.querySelector("input")?.focus();
  }

  /** Deja la partida en cero: sin ratas, sin proyectiles, vida llena. */
  private clearRun(): void {
    this.audio.unmask();
    this.health = MAX_HEALTH;
    this.survived = 0;
    this.rats.clear();
    this.waves.clear();
    this.weapons.clear();
  }

  /** Partida nueva desde la oleada 1. Se llama al capturar el mouse, así el cartel se ve. */
  private startRun(): void {
    this.clearRun();
    this.waves.start();
  }

  private showOverlay(kind: "menu" | "pause" | "gameOver" | "victory", html: string): void {
    this.ui.overlay.dataset.kind = kind; // el CSS cambia el estilo según el tipo
    this.ui.overlay.innerHTML = html;
    this.ui.overlay.classList.remove("hidden");
    // En el menú no hay partida: el HUD se oculta para no mostrar valores viejos.
    this.ui.hud.classList.toggle("hidden", kind === "menu");
    this.showOptions(false);
  }
}
