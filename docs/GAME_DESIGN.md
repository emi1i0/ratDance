# Game Design — ratDance

## Concepto
FPS *stationary horde shooter* single player para navegador. El jugador está fijo en el
centro de una alacena convertida en discoteca y oleadas de ratas bailarinas (el meme de la
rata que baila) avanzan hacia él desde todas las direcciones. El tono es gracioso hasta el
punto de ser molesto.

**Referencias**
- Genome Guardian — jugador estacionario, solo apuntar y disparar.
- Deep Rock Galactic — hordas de bichos que te rodean.
- Vampire Survivors — personajes y armas con atributos, perks durante la partida,
  meta-progresión con dinero.

## Loop
1. **Menú / tienda** → elegir personaje y arma (desbloqueados con dinero).
2. **Partida** → oleadas de ratas; matar ratas da dinero.
3. **Entre oleadas** → elegir un perk (mejora incremental, dura solo esa partida).
4. **Boss** en oleadas clave.
5. **Muerte o victoria** → se pierden los perks, se conserva el dinero ganado.
6. Volver a 1.

Nivel por defecto (ajustable): **10 oleadas, boss en la 5 y en la 10**. Partidas cortas.

## Mecánicas

### Jugador
- Posición **totalmente fija**. Sin sprint, salto, agacharse ni WASD.
- Controles: mouse para mirar 360° (pointer lock, se activa con click), click para disparar.
- Tiene vida; las ratas lo dañan al llegar.

### Personajes
- Varios, cada uno con atributos distintos (vida, daño, cadencia, etc. — por definir).
- Son datos (stats + nombre). En primera persona no se ven; lo visual queda para después.
- Por ahora: **un personaje placeholder**.

### Armas
- Varias, disparan **proyectiles** (no hitscan) porque algunas tendrán mecánicas dinámicas.
- Detalle de cada arma: **pendiente hasta nuevo aviso**. Por ahora: **un arma placeholder**.

### Ratas
- Aparecen alrededor del jugador (360°) y caminan directo hacia él.
- Varios tipos con atributos distintos (vida, velocidad, daño, recompensa — por definir).
- **Todas usan el mismo sprite animado**; se diferencian por color (tinte) y tamaño.
- **Bosses**: ratas especiales (más grandes, más vida); comportamiento por definir.

### Perks
- Se eligen durante la partida y se mejoran de forma incremental.
- Se pierden al morir.

### Meta-progresión
- Lo único que persiste entre partidas es el **dinero**.
- El dinero compra personajes y armas nuevos.

## Estilo
- **Visual**: low-poly estética PS1, caótico. Una alacena con queso y comida mordisqueada,
  luces de discoteca de colores que cambian de forma molesta.
- **Ratas**: sprite animado sacado del GIF del meme, fiel frame por frame al baile original.
- **Audio**: loop infinito de la música del meme; encima, disparos y chillidos de ratas al morir.

## Fuera de alcance
- Multijugador y rankings online
- Móvil / táctil y gamepad (solo mouse + teclado en escritorio)
- Backend y cuentas (el progreso vive en el navegador)
- Movimiento del jugador (sprint, salto, agacharse, WASD)
- Modelos 3D animados para enemigos (todo es sprite)
- Editor de niveles

## Pendiente de definir
- Lista de armas, personajes, tipos de rata y perks con sus números
- Comportamiento de los bosses
- Sistema de puntaje (sin referencia todavía)
- Asset final del sprite y la música (verificar que se puedan usar si se publica)
