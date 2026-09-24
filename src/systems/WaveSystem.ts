import { RAT_TYPES, type RatTypeId } from "../data/rats";
import { WAVES } from "../data/waves";
import type { RatSystem } from "./RatSystem";

const BREAK_TIME = 3; // segundos de respiro entre oleadas

export const TOTAL_WAVES = WAVES.length;

export class WaveSystem {
  wave = 0; // 1-based; 0 = todavía no arrancó
  private queue: RatTypeId[] = []; // ratas que faltan salir en esta oleada
  private spawnTimer = 0;
  private breakTimer = 0;

  constructor(
    private rats: RatSystem,
    private onWaveStart: (wave: number, hasBoss: boolean) => void,
    private onAllCleared: () => void,
  ) {}

  update(dt: number): void {
    if (this.breakTimer > 0) {
      this.breakTimer -= dt;
      if (this.breakTimer <= 0) this.startWave(this.wave + 1);
      return;
    }

    if (this.queue.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.rats.spawn(RAT_TYPES[this.queue.pop()!]);
        this.spawnTimer = WAVES[this.wave - 1].spawnInterval;
      }
    } else if (this.rats.rats.length === 0) {
      // Oleada limpia.
      if (this.wave >= TOTAL_WAVES) this.onAllCleared();
      else this.breakTimer = BREAK_TIME;
    }
  }

  reset(): void {
    this.breakTimer = 0;
    this.startWave(1);
  }

  private startWave(wave: number): void {
    this.wave = wave;
    const def = WAVES[wave - 1];
    this.queue = [];
    for (const [id, count] of Object.entries(def.rats) as [RatTypeId, number][]) {
      for (let i = 0; i < count; i++) this.queue.push(id);
    }
    shuffle(this.queue);
    this.spawnTimer = 0;
    this.onWaveStart(wave, this.queue.some((id) => RAT_TYPES[id].boss));
  }
}

/** Fisher-Yates: mezcla el array en el lugar. */
function shuffle<T>(items: T[]): void {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
}
