# ratDance

FPS estacionario de oleadas para navegador: ratas bailarinas (meme) atacan desde 360°.

## Stack
- TypeScript + Vite
- Babylon.js 9 vía paquetes ES (`@babylonjs/core`), **imports específicos por archivo** (nunca `import * as BABYLON`)
- `@babylonjs/inspector` solo en desarrollo (import dinámico detrás de `import.meta.env.DEV`)
- Sin motor de física por ahora (ver docs/TECH_DECISIONS.md)

## Comandos
- `npm run dev` — servidor de desarrollo (Vite)
- `npm run build` — typecheck + build de producción
- `npm run preview` — servir el build
- `npm run typecheck` — solo chequeo de tipos
- `python tools/gif_to_spritesheet.py <in.gif> <out.png> [celda]` — GIF → spritesheet (requiere Pillow; herramienta local, no del juego)

## Reglas
- No agregar dependencias sin preguntar al usuario.
- Simple y legible antes que "escalable". Nada de abstracciones sin un segundo caso de uso real.
- El usuario viene de three.js: al usar algo propio de Babylon, explicarlo en una línea.
- Si un pedido parece mala idea, decirlo antes de hacerlo.
- Contenido (ratas, armas, personajes, perks, oleadas) vive como datos en `src/data/`, no como lógica especial.
- Trabajar de a un hito del roadmap; al terminarlo, marcarlo en docs/ROADMAP.md.
- Docs y comentarios en español; identificadores de código en inglés.

## Docs
- docs/GAME_DESIGN.md — qué es el juego, loop, mecánicas, fuera de alcance
- docs/ARCHITECTURE.md — carpetas, comunicación entre sistemas, estados
- docs/TECH_DECISIONS.md — decisiones técnicas y por qué
- docs/ROADMAP.md — hitos y estado
