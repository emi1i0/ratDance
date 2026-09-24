import type { Scene } from "@babylonjs/core/scene";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import type { AudioSystem } from "./AudioSystem";
import type { HitEffects } from "./HitEffects";
import type { PlayerView } from "./PlayerView";
import { hitHeight, hitRadius, type Rat, type RatSystem } from "./RatSystem";

// Arma placeholder.
const PROJECTILE_SPEED = 30; // unidades por segundo
const PROJECTILE_LIFETIME = 2; // segundos
const PROJECTILE_DIAMETER = 0.15;
const MUZZLE_OFFSET = 0.5; // distancia delante de la cámara donde nace el proyectil
const DAMAGE = 1;

interface Projectile {
  mesh: Mesh;
  velocity: Vector3;
  age: number;
}

export class WeaponSystem {
  private projectiles: Projectile[] = [];
  private material: StandardMaterial;

  constructor(
    private scene: Scene,
    private player: PlayerView,
    private rats: RatSystem,
    private effects: HitEffects,
    private audio: AudioSystem,
    canvas: HTMLCanvasElement,
  ) {
    this.material = new StandardMaterial("projectileMat", scene);
    this.material.emissiveColor = new Color3(1, 0.9, 0.2);
    this.material.disableLighting = true; // brilla con su color propio, sin depender de la luz

    // El primer click solo captura el mouse; se dispara recién con el mouse capturado.
    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0 && this.player.isLocked) this.fire();
    });
  }

  update(dt: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const from = p.mesh.position.clone();
      p.mesh.position.addInPlace(p.velocity.scale(dt));
      p.age += dt;

      // Si el tramo cruza varias ratas, le pega a la primera en el camino (menor t).
      let hit: { rat: Rat; point: Vector3; t: number } | null = null;
      for (const rat of this.rats.rats) {
        const h = segmentHit(from, p.mesh.position, rat);
        if (h && (!hit || h.t < hit.t)) hit = { rat, ...h };
      }
      if (hit) {
        const killed = this.rats.damage(hit.rat, DAMAGE);
        this.effects.hit(hit.point, killed);
        if (killed) this.audio.squeak(hit.rat.type.size);
        else this.audio.hit();
      }
      if (hit || p.age > PROJECTILE_LIFETIME || p.mesh.position.y < 0) this.remove(i);
    }
  }

  clear(): void {
    for (const p of this.projectiles) p.mesh.dispose();
    this.projectiles.length = 0;
  }

  private fire(): void {
    const camera = this.player.camera;
    // getDirection: convierte un eje local a mundo. En Babylon "adelante" es +Z (mano izquierda).
    const forward = camera.getDirection(Vector3.Forward());
    this.audio.shoot();
    const mesh = CreateSphere("projectile", { diameter: PROJECTILE_DIAMETER, segments: 4 }, this.scene);
    mesh.material = this.material;
    mesh.position = camera.position.add(forward.scale(MUZZLE_OFFSET));
    this.projectiles.push({ mesh, velocity: forward.scale(PROJECTILE_SPEED), age: 0 });
  }

  private remove(index: number): void {
    this.projectiles[index].mesh.dispose();
    this.projectiles.splice(index, 1);
  }
}

/**
 * Si el tramo recorrido por el proyectil en este frame toca el cilindro de la rata, devuelve
 * el punto de impacto y su posición en el tramo (t de 0 a 1); si no, null. Revisar el tramo
 * (y no solo la posición final) evita que un proyectil rápido la atraviese.
 */
function segmentHit(from: Vector3, to: Vector3, rat: Rat): { point: Vector3; t: number } | null {
  const ratPos = rat.sprite.position;
  // Punto del tramo más cercano al eje vertical de la rata (calculado en el plano XZ).
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const lenSq = dx * dx + dz * dz;
  const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((ratPos.x - from.x) * dx + (ratPos.z - from.z) * dz) / lenSq));
  const closest = Vector3.Lerp(from, to, t);

  const horizontal = Math.hypot(closest.x - ratPos.x, closest.z - ratPos.z);
  const inside = horizontal <= hitRadius(rat) && closest.y >= 0 && closest.y <= hitHeight(rat);
  return inside ? { point: closest, t } : null;
}
