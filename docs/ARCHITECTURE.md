# Arquitectura

Objetivo: que se entienda leyendo. Pocas capas, sin ECS ni frameworks propios.

## Estructura de carpetas
```
index.html
src/
  main.ts            # crea Engine + Scene, arranca Game, render loop, inspector en dev
  game/
    Game.ts          # dueño de los sistemas, máquina de estados, update(dt) por frame
    events.ts        # bus de eventos tipado y mínimo
  scene/
    environment.ts   # piso, alacena, props, luces (incluye luces de discoteca)
  systems/
    PlayerView.ts    # cámara fija en primera persona + pointer lock
    WaveSystem.ts    # qué ratas aparecen, cuándo y dónde
    RatSystem.ts     # sprites de ratas, movimiento hacia el jugador, vida
    WeaponSystem.ts  # disparo y proyectiles, colisión proyectil↔rata
    PerkSystem.ts    # perks activos de la partida y sus modificadores
    AudioSystem.ts   # música en loop + efectos
  ui/
    hud.ts           # overlay HTML/CSS: vida, oleada, dinero
    screens.ts       # menú, elección de perk, game over, tienda (HTML)
  data/
    characters.ts    # stats de personajes
    weapons.ts       # stats de armas
    rats.ts          # tipos de rata (color, tamaño, vida, velocidad, daño, recompensa)
    perks.ts         # definiciones de perks
    waves.ts         # composición de cada oleada
  save/
    storage.ts       # dinero y desbloqueos en localStorage (con versión)
  assets/            # spritesheets, texturas, audio (importados desde el código → URL con hash)
tools/               # scripts locales de preparación de assets (no forman parte del juego)
```
Las carpetas se crean cuando hacen falta, no antes.

## Comunicación entre sistemas
- **Game** crea los sistemas y llama `update(dt)` de cada uno en un orden fijo:
  `WaveSystem → RatSystem → WeaponSystem → PerkSystem → hud`.
- **Referencias directas** cuando un sistema necesita datos de otro
  (ej. `WeaponSystem` recibe `RatSystem` para consultar ratas vivas). Se pasan por constructor.
- **Eventos** (`events.ts`) solo para avisos que interesan a varios sistemas sin que el
  emisor los conozca. Lista cerrada y tipada, por ejemplo:
  - `ratKilled { type, position, reward }` → dinero, audio (chillido), HUD
  - `playerDamaged { amount }` → HUD, audio
  - `waveCleared { index }` → Game (pasa a elección de perk)
  - `playerDied` → Game (pasa a game over)
- **Datos** (`src/data/`) son objetos planos de solo lectura; los sistemas los leen, nunca
  los modifican. Los perks producen modificadores que se aplican al calcular stats.

## Estados de juego
```
Boot ──► Menu ──► Playing ◄──► Paused
          ▲  ▲       │
          │  │       ├──► PerkChoice ──► Playing   (entre oleadas)
          │  │       │
          │  └────── GameOver ◄─ (muerte o última oleada)
          │            │
          └── Shop ◄───┘
```
- **Boot**: carga de assets.
- **Menu**: elegir personaje/arma; click inicia partida (y habilita audio + pointer lock).
- **Playing**: oleadas activas; solo acá corre la simulación.
- **Paused**: se entra al perder el pointer lock (Esc); click para volver.
- **PerkChoice**: oleada terminada, elegir perk; simulación congelada.
- **GameOver**: resumen, dinero ganado se guarda; ir a tienda o reintentar.
- **Shop**: gastar dinero en personajes/armas.

Implementación: un `state` string en `Game` + un `switch` en `update` y en las transiciones.
Sin clases por estado hasta que haga falta.

**Estado actual (hito 4):** existen `paused` (también cubre el inicio, "Click para jugar"),
`playing` y `gameOver`. El daño al jugador lo devuelve `RatSystem.update()` y lo aplica `Game`;
el bus de eventos se agrega recién cuando haya un segundo interesado (HUD/audio).
