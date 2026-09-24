// Tipos de rata. Todas usan el mismo sprite; cambian tinte, tamaño y stats.
// Valores placeholder hasta que se definan los tipos reales.

export interface RatType {
  name: string;
  tint: [r: number, g: number, b: number]; // multiplica el color del sprite (1,1,1 = original)
  size: number; // alto del sprite en unidades de mundo
  health: number; // impactos del arma placeholder para matarla
  speed: number; // unidades por segundo
  damagePerSecond: number;
  reward: number; // queso al morir
  boss?: boolean;
}

export type RatTypeId = "common" | "runner" | "chonk" | "boss";

export const RAT_TYPES: Record<RatTypeId, RatType> = {
  common: { name: "Común", tint: [1, 1, 1], size: 2, health: 1, speed: 3, damagePerSecond: 10, reward: 1 },
  runner: { name: "Corredora", tint: [1, 0.55, 0.8], size: 1.5, health: 1, speed: 5.5, damagePerSecond: 6, reward: 2 },
  chonk: { name: "Gordita", tint: [0.6, 1, 0.45], size: 2.8, health: 4, speed: 1.8, damagePerSecond: 20, reward: 4 },
  boss: {
    name: "Jefa",
    tint: [1, 0.35, 0.3],
    size: 6,
    health: 30,
    speed: 1.2,
    damagePerSecond: 40,
    reward: 50,
    boss: true,
  },
};
