import type { RatTypeId } from "./rats";

// Composición de cada oleada. Las ratas de una oleada salen mezcladas al azar.
// Valores placeholder: 10 oleadas, jefa en la 5 y dos jefas en la 10.

export interface WaveDef {
  rats: Partial<Record<RatTypeId, number>>; // tipo → cantidad
  spawnInterval: number; // segundos entre ratas
}

export const WAVES: WaveDef[] = [
  { rats: { common: 6 }, spawnInterval: 1.4 },
  { rats: { common: 8, runner: 2 }, spawnInterval: 1.3 },
  { rats: { common: 8, runner: 4 }, spawnInterval: 1.2 },
  { rats: { common: 8, runner: 4, chonk: 2 }, spawnInterval: 1.1 },
  { rats: { boss: 1, common: 8 }, spawnInterval: 1.2 },
  { rats: { common: 10, runner: 6, chonk: 2 }, spawnInterval: 0.9 },
  { rats: { common: 10, runner: 8, chonk: 4 }, spawnInterval: 0.8 },
  { rats: { common: 12, runner: 8, chonk: 5 }, spawnInterval: 0.7 },
  { rats: { common: 14, runner: 10, chonk: 6 }, spawnInterval: 0.6 },
  { rats: { boss: 2, common: 10, runner: 8, chonk: 4 }, spawnInterval: 0.6 },
];
