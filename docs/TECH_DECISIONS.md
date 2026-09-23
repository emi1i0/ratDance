# Decisiones técnicas

Cada decisión con su motivo. Si cambia, se actualiza acá.

## Base
- **TypeScript** — tipos para los datos de contenido (ratas, armas, perks) evitan errores tontos.
- **Vite** — dev server instantáneo y build sin configuración.
- **Babylon.js 9 con `@babylonjs/core` e imports específicos** — el bundle solo incluye lo que se usa.
- **Inspector solo en dev (import dinámico)** — herramienta de depuración valiosa que no debe pesar en producción.

## Física
- **Havok diferido** — el jugador no se mueve y las ratas caminan en línea recta sobre un
  piso plano; proyectil↔rata se resuelve con chequeo de distancia (esferas). Un motor de
  física sería complejidad sin beneficio. Se reevalúa si aparecen armas que lo requieran
  (rebotes, explosiones con empuje, ragdolls).

## Render
- **Ratas con `SpriteManager`** — dibuja miles de sprites animados en un solo draw call; el
  GIF se convierte a spritesheet y se reproduce frame por frame, fiel al meme.
- **Tinte y tamaño por sprite** — `sprite.color` y `sprite.size` dan variedad de ratas con un solo asset.
- **Look PS1 por render a baja resolución** — `engine.setHardwareScalingLevel(n)` + texturas
  con filtrado `NEAREST`; auténtico y prácticamente gratis.
- **Proyectiles como meshes simples reutilizados (pool)** — evita crear/destruir objetos por disparo.

## Cámara y control
- **Cámara fija, solo rotación** — el diseño es estacionario; no hay movimiento del jugador.
- **Pointer lock activado por click** — requisito del navegador; el mismo click desbloquea el audio.

## UI
- **HUD y menús en HTML/CSS sobre el canvas** — familiar, rápido de iterar y no suma
  `@babylonjs/gui` como dependencia.

## Audio
- **Motor de audio de Babylon (incluido en `@babylonjs/core`)** — sin dependencias extra;
  se inicia después del primer click por la política de autoplay.

## Persistencia
- **`localStorage` con clave versionada** — solo guardamos dinero y desbloqueos; no justifica backend.

## Calidad
- **`tsc --noEmit` como chequeo** — sin framework de tests por ahora; si la lógica de oleadas
  o perks se complica, proponer Vitest (requiere aprobación de dependencia).
