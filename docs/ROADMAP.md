# Roadmap

Cada hito termina en algo jugable/visible en el navegador. Se trabaja de a uno.

- [x] **1. Mirar alrededor** — escena con piso y luz; cámara en primera persona fija con
  pointer lock por click y mirada 360° con el mouse.
- [ ] **2. Una rata** — sprite animado placeholder que aparece lejos y camina hacia el jugador.
- [ ] **3. Disparar** — click dispara un proyectil placeholder; al impactar, la rata muere.
- [ ] **4. Oleada y muerte** — ratas aparecen en 360°; el jugador tiene vida, recibe daño y
  hay game over con reintento.
- [ ] **5. HUD** — vida, número de oleada y dinero en overlay HTML.
- [ ] **6. Oleadas y bosses por datos** — `waves.ts` y `rats.ts`; tipos de rata por color,
  tamaño y stats; boss en oleadas 5 y 10; victoria al final.
- [ ] **7. Audio** — música del meme en loop, disparo y chillido al morir.
- [ ] **8. Perks** — al terminar cada oleada, elegir 1 de 3 perks; se pierden al morir.
- [ ] **9. Meta-progresión** — dinero persistente en `localStorage`, tienda y selección de
  personaje/arma (placeholders).
- [ ] **10. Sprite del meme** — spritesheet real de la rata bailando, fiel al GIF.
- [ ] **11. Look PS1 + alacena discoteca** — baja resolución, props low-poly (queso, comida
  mordida), luces de colores que cambian.

Después: definir armas, personajes, ratas y perks reales (según diseño del usuario).
