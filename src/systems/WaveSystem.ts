import type { RatSystem } from "./RatSystem";

// Oleada única y continua: cada rata aparece un poco antes que la anterior.
// (Las oleadas por datos llegan en el hito 6.)
const START_INTERVAL = 2; // segundos entre ratas al empezar
const MIN_INTERVAL = 0.4;
const INTERVAL_DECAY = 0.96; // cada spawn multiplica el intervalo por esto

export class WaveSystem {
  private interval = START_INTERVAL;
  private timer = 0;

  constructor(private rats: RatSystem) {}

  update(dt: number): void {
    this.timer -= dt;
    if (this.timer > 0) return;
    this.rats.spawn();
    this.interval = Math.max(MIN_INTERVAL, this.interval * INTERVAL_DECAY);
    this.timer = this.interval;
  }

  reset(): void {
    this.interval = START_INTERVAL;
    this.timer = 0;
  }
}
