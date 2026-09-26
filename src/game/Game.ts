import type { Scene } from "@babylonjs/core/scene";
import { PlayerView } from "../systems/PlayerView";
import { RatSystem } from "../systems/RatSystem";
import { TOTAL_WAVES, WaveSystem } from "../systems/WaveSystem";
import { WeaponSystem } from "../systems/WeaponSystem";
import { HitEffects } from "../systems/HitEffects";
import { AudioSystem, type MusicCues } from "../systems/AudioSystem";
import { Hud } from "../ui/hud";
import musicUrl from "../assets/audio/rat_dance_soundtrack.ogg";
import { loadSettings, SettingsPanel } from "../ui/settings";

const MAX_HEALTH = 100;

// Música, medida analizando la forma de onda del archivo (44,1 kHz):
// - 0–3,3 s es la cuenta de entrada; después la pieza se repite cada 3.950.651 muestras.
//   Cualquier inicio de loop posterior a la intro empalma igual; 4 s deja margen.
// - Entre el 1er y 2do golpe de la intro sobran 0,424 s de silencio (los golpes van cada
//   0,5587 s): se saltea, cortando en cruces por cero para que no haga "clic".
const MUSIC_CUES: MusicCues = {
  loopStart: 4,
  loopEnd: 4 + 3950651 / 44100,
  skip: [0.91322, 1.33739],
};
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
    void this.audio.loadMusic(musicUrl, MUSIC_CUES);
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
      if (this.health <= 0) this.endGame(false);
    }
    this.hud.update(this.health, MAX_HEALTH, this.waves.wave, TOTAL_WAVES, this.rats.money);
  }

  private onLockChange(locked: boolean): void {
    if (locked) {
      if (this.state === "gameOver") this.reset();
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
      this.reset(); // limpia la escena de fondo
      this.showMenu();
    }
  }

  /** Abre/cierra el panel de opciones; mientras está abierto, el CSS oculta el contenido del overlay. */
  private showOptions(open: boolean): void {
    this.ui.overlay.classList.toggle("options-open", open);
    this.ui.settings.classList.toggle("hidden", !open);
    if (open) this.ui.settings.querySelector("input")?.focus();
  }

  private reset(): void {
    this.health = MAX_HEALTH;
    this.survived = 0;
    this.rats.clear();
    this.waves.reset();
    this.weapons.clear();
  }

  private showOverlay(kind: "menu" | "pause" | "gameOver" | "victory", html: string): void {
    this.ui.overlay.dataset.kind = kind; // el CSS cambia el estilo según el tipo
    this.ui.overlay.innerHTML = html;
    this.ui.overlay.classList.remove("hidden");
    this.showOptions(false);
  }
}
