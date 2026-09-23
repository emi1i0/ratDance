import type { Scene } from "@babylonjs/core/scene";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";

const SPARK_COUNT = 10;
const SPARK_SIZE = 0.08;
const SPARK_SPEED_MIN = 2;
const SPARK_SPEED_MAX = 6;
const SPARK_LIFETIME = 0.35; // segundos
const GRAVITY = 15;

interface Spark {
  mesh: Mesh;
  velocity: Vector3;
  age: number;
}

/** Feedback de impacto: chispas en el mundo + hitmarker en la mira. */
export class HitEffects {
  private sparks: Spark[] = [];
  private material: StandardMaterial;

  constructor(private scene: Scene, private hitmarker: HTMLElement) {
    this.material = new StandardMaterial("sparkMat", scene);
    this.material.emissiveColor = new Color3(1, 0.6, 0.1);
    this.material.disableLighting = true;
  }

  hit(position: Vector3): void {
    for (let i = 0; i < SPARK_COUNT; i++) {
      const mesh = CreateBox("spark", { size: SPARK_SIZE }, this.scene);
      mesh.material = this.material;
      mesh.position = position.clone();
      // Dirección al azar, sesgada hacia arriba para que "salten".
      const dir = new Vector3(Math.random() - 0.5, Math.random() * 0.8, Math.random() - 0.5).normalize();
      const speed = SPARK_SPEED_MIN + Math.random() * (SPARK_SPEED_MAX - SPARK_SPEED_MIN);
      this.sparks.push({ mesh, velocity: dir.scale(speed), age: 0 });
    }

    // Reiniciar la animación CSS: sacar la clase, forzar reflow y volver a ponerla.
    this.hitmarker.classList.remove("show");
    void this.hitmarker.offsetWidth;
    this.hitmarker.classList.add("show");
  }

  update(dt: number): void {
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.age += dt;
      if (s.age >= SPARK_LIFETIME) {
        s.mesh.dispose();
        this.sparks.splice(i, 1);
        continue;
      }
      s.velocity.y -= GRAVITY * dt;
      s.mesh.position.addInPlace(s.velocity.scale(dt));
      s.mesh.scaling.setAll(1 - s.age / SPARK_LIFETIME); // se encogen hasta desaparecer
    }
  }
}
