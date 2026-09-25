# Revisión de diseño del código

Análisis de `src/` (~1000 líneas) contra principios de diseño (SOLID, GRASP) y contra los
propios docs del proyecto. Estado del código: commit `6f04de2` (post hito 7).

Nota: CLAUDE.md pide "nada de abstracciones sin un segundo caso de uso real". Aplicar SOLID
al pie de la letra (interfaces para todo, inyectar abstracciones) contradiría esa regla, así
que acá solo se marcan problemas reales o que van a doler en los hitos 8 (perks) y 9 (meta-progresión).

## Problemas de diseño

### 1. `WeaponSystem` decide las consecuencias de un impacto (acoplamiento alto, cohesión baja)
`src/systems/WeaponSystem.ts:60-65`: al impactar, el arma llama a `rats.damage`, `effects.hit`,
`audio.squeak` y `audio.hit`. Recibe 6 dependencias por constructor y la mitad no tienen
que ver con disparar.

Además es inconsistente con `WaveSystem`, que avisa por callbacks (`onWaveStart`,
`onAllCleared`) y deja que `Game` conecte las cosas.

ARCHITECTURE.md dice que el bus de eventos se agrega "cuando haya un segundo interesado
(HUD/audio)": eso ya pasó.

**Sugerencia:** sin bus todavía; un callback `onHit(rat, point, killed)` como el de
`WaveSystem`, y que `Game` lo conecte con efectos y audio.

### 2. `RatSystem` lleva la economía y las estadísticas (GRASP: Information Expert)
`src/systems/RatSystem.ts:37-38,109-110`: `kills` y `money` viven en el sistema que mueve
sprites. Para el hito 9 (queso persistente, tienda, perks que multipliquen queso) no es su
lugar. Además `Game` ya tiene `health` y `survived`: el estado de la partida está partido
en dos.

**Sugerencia:** que `RatSystem` avise la muerte (va junto con el punto 1) y que el queso y
las kills los cuente quien lleva el estado de la partida (`Game`, por ahora).

### 3. La UI está repartida en 4 lugares sin criterio
- `Game` arma HTML de pantallas (`src/game/Game.ts:116-126`) y maneja el fade del flash de
  daño a mano (`src/game/Game.ts:77-78`).
- `Hud` tiene su propio `hurt()` para el mismo evento de daño (`src/game/Game.ts:89-90`):
  un mismo concepto partido en dos.
- `HitEffects` está en `systems/` pero toca el DOM del hitmarker (`src/systems/HitEffects.ts:46-48`).
- El truco de reiniciar la animación CSS está duplicado (`src/systems/HitEffects.ts:46-48`
  y `src/ui/hud.ts:62-64`).

Con PerkChoice y la tienda, `Game` se va a llenar de strings de HTML. ARCHITECTURE.md ya
prevé `ui/screens.ts`; conviene crearlo al arrancar el hito 8.

### 4. `Game` conoce detalles del archivo de música
`src/game/Game.ts:9,14-23`: muestras de la forma de onda y puntos de corte del `.ogg`. No
tiene nada que ver con la máquina de estados; iría junto al audio (en `AudioSystem` o en un
`data/music.ts`).

## Contenido fuera de `src/data/` (regla de CLAUDE.md)
- Stats del arma hardcodeados en `src/systems/WeaponSystem.ts:13-17` y vida del jugador en
  `src/game/Game.ts:12`. Está bien como placeholder, pero los perks del hito 8 van a
  modificar daño, velocidad y vida, y los modificadores se aplican sobre datos. Conviene
  crear `weapons.ts`/`characters.ts` antes o durante el hito 8, no después.
- `RatType.health` dice "impactos del arma placeholder" (`src/data/rats.ts:8`): depende de
  que `DAMAGE = 1`. Con armas de otro daño, ese número cambia de significado.

## Encapsulamiento (menor)
- `RatSystem.rats` es `readonly rats: Rat[]` (`src/systems/RatSystem.ts:36`): la referencia
  no cambia, pero cualquiera puede hacer `push`. `WaveSystem` y `WeaponSystem` lo leen
  directo. Con `ReadonlyArray<Rat>` en la firma pública se arregla sin costo.
- `waves.wave === 0` se usa como bandera de "primera partida" (`src/game/Game.ts:99`):
  acoplamiento implícito. Si `WaveSystem` cambia cómo numera, esto se rompe sin avisar.
- `Hud.update` recibe 5 parámetros sueltos (`src/ui/hud.ts:33`) y va a crecer. Pasarle un
  objeto sería más legible.

## Docs que no coinciden con el código
- TECH_DECISIONS.md dice que los proyectiles se reutilizan con un pool, pero el código crea
  y destruye una esfera por disparo (`src/systems/WeaponSystem.ts:80`, `:87`). Las chispas
  hacen lo mismo: 10 `CreateBox` por kill (`src/systems/HitEffects.ts:36`).
- TECH_DECISIONS.md dice que la colisión es por distancia entre esferas, pero en realidad es
  un barrido del tramo contra cilindros (`src/systems/WeaponSystem.ts:97`).
- ARCHITECTURE.md dice "Estado actual (hito 6)", pero el 7 ya está hecho. Además
  `HitEffects.ts` no figura en el árbol de carpetas.

## Lo que no se marca aunque "SOLID lo pida"
- **DIP** (que `WeaponSystem` dependa de interfaces en vez de clases concretas): hay una sola
  implementación de cada cosa, así que sería ceremonia.
- **Clases por estado** (patrón State): el `switch` alcanza hasta que aparezcan PerkChoice y
  la tienda; el doc ya lo contempla.
- **Listeners sin `dispose`**: hay una sola instancia del juego por página, así que no es un
  problema.

## Prioridad sugerida
1. Puntos 1 + 2 juntos: callback de impacto/muerte, con queso y kills movidos a `Game`. Es
   un cambio chico y deja limpio el camino para los perks.
2. Actualizar los docs desactualizados.
3. Al arrancar el hito 8: `ui/screens.ts` y los datos de arma y personaje en `src/data/`.
