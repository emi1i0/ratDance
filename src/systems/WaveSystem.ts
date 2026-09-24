import type { RatSystem } from "./RatSystem";

// Oleadas numeradas con fórmula simple (en el hito 6 pasan a datos en src/data/waves.ts).
const BREAK_TIME = 3; // segundos de respiro entre oleadas

const ratsInWave = (wave: number) => 4 + wave * 3;
const spawnInterval = (wave: number) => Math.max(0.4, 1.6 * 0.9 ** (wave - 1)); // segundos

export class WaveSystem {
  wave = 0;
  private toSpawn = 0;
  private spawnTimer = 0;
  private breakTimer = 0;

  constructor(private rats: RatSystem, private onWaveStart: (wave: number) => void) {}

  update(dt: number): void {
    if (this.breakTimer > 0) {
      this.breakTimer -= dt;
      if (this.breakTimer <= 0) this.startWave(this.wave + 1);
      return;
    }

    if (this.toSpawn > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.rats.spawn();
        this.toSpawn--;
        this.spawnTimer = spawnInterval(this.wave);
      }
    } else if (this.rats.rats.length === 0) {
      this.breakTimer = BREAK_TIME; // oleada limpia
    }
  }

  reset(): void {
    this.breakTimer = 0;
    this.startWave(1);
  }

  private startWave(wave: number): void {
    this.wave = wave;
    this.toSpawn = ratsInWave(wave);
    this.spawnTimer = 0;
    this.onWaveStart(wave);
  }
}
