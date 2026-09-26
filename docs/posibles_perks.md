# ratDance — Catálogo Completo de Perks (Roguelite Horde Shooter)

---

## Resumen de Diseño
- **Género**: Stationary FPS Horde Shooter (360° pivote fijo, sin movimiento del jugador).
- **Entorno**: Alacena convertida en club nocturno de ratas bailarinas.
- **Mecánica de Progresión**: Selección de 1 perk entre 3 aleatorios al final de cada oleada (máximo 10 oleadas, jefes en oleadas 5 y 10).
- **Escalado**: Perks acumulables hasta Nivel 3.

---

## 1. Perks Comunes (Estadísticas Base y Rendimiento)

### 1. Cheddar Caliente
* **Rareza:** Común
* **Efecto / Mecánica:** Aumenta el daño base por impacto directo de todos los proyectiles.
* **Escalado por Niveles:**
  * **Nivel 1:** $+15\%$ daño base.
  * **Nivel 2:** $+30\%$ daño base.
  * **Nivel 3:** $+45\%$ daño base.
* **Flavor Text:** *"Servido a 200°C directo a los bigotes."*

---

### 2. Golpe de Hi-Hat
* **Rareza:** Común
* **Efecto / Mecánica:** Incrementa la cadencia de fuego (tasa de disparo por segundo).
* **Escalado por Niveles:**
  * **Nivel 1:** $+12\%$ velocidad de ataque.
  * **Nivel 2:** $+24\%$ velocidad de ataque.
  * **Nivel 3:** $+36\%$ velocidad de ataque.
* **Flavor Text:** *"Tss-tss-tss-tss... el ritmo no puede parar."*

---

### 3. Especias de Frasco
* **Rareza:** Común
* **Efecto / Mecánica:** Incrementa la velocidad de desplazamiento de los proyectiles en el aire, reduciendo la necesidad de cálculo de trayectoria.
* **Escalado por Niveles:**
  * **Nivel 1:** $+25\%$ velocidad de proyectil.
  * **Nivel 2:** $+50\%$ velocidad de proyectil.
  * **Nivel 3:** $+75\%$ velocidad de proyectil.
* **Flavor Text:** *"Pimienta negra molida a match 2."*

---

### 4. Vaso Descartable Extra
* **Rareza:** Común
* **Efecto / Mecánica:** Aumenta la salud máxima del jugador y cura al instante los puntos de vida agregados.
* **Escalado por Niveles:**
  * **Nivel 1:** $+20$ Salud Máxima.
  * **Nivel 2:** $+40$ Salud Máxima.
  * **Nivel 3:** $+60$ Salud Máxima.
* **Flavor Text:** *"Un trago más antes del colapso."*

---

### 5. Empuje de Pogo
* **Rareza:** Común
* **Efecto / Mecánica:** Incrementa la fuerza de retroceso (*knockback*) infligida a los roedores al ser alcanzados por un proyectil.
* **Escalado por Niveles:**
  * **Nivel 1:** $+25\%$ fuerza de retroceso.
  * **Nivel 2:** $+50\%$ fuerza de retroceso.
  * **Nivel 3:** $+75\%$ fuerza de retroceso.
* **Flavor Text:** *"¡Respeta el espacio personal en la pista!"*

---

### 6. Rallador de Precisión
* **Rareza:** Común
* **Efecto / Mecánica:** Reduce la dispersión del arma y otorga probabilidad de impacto crítico ($1.8\times$ daño).
* **Escalado por Niveles:**
  * **Nivel 1:** $-20\%$ dispersión / $+8\%$ probabilidad crítica.
  * **Nivel 2:** $-35\%$ dispersión / $+15\%$ probabilidad crítica.
  * **Nivel 3:** $-50\%$ dispersión / $+22\%$ probabilidad crítica.
* **Flavor Text:** *"Cortes finos para fiestas elegantes."*

---

## 2. Perks Raros (Efectos de Estado y Modificadores de Proyectil)

### 7. Salsa Picante en el Ojo
* **Rareza:** Raro
* **Efecto / Mecánica:** Los proyectiles aplican una quemadura cáustica que inflige daño continuo (DoT) durante 3 segundos.
* **Escalado por Niveles:**
  * **Nivel 1:** $5$ de daño por segundo.
  * **Nivel 2:** $10$ de daño por segundo.
  * **Nivel 3:** $16$ de daño por segundo.
* **Flavor Text:** *"No tocarse la cara después de manipular jalapeños."*

---

### 8. Pista Resbaladiza
* **Rareza:** Raro
* **Efecto / Mecánica:** Los impactos cubren a las ratas con aderezo resbaladizo, reduciendo su velocidad de avance.
* **Escalado por Niveles:**
  * **Nivel 1:** $-15\%$ velocidad enemiga durante $2.5\,\text{s}$.
  * **Nivel 2:** $-25\%$ velocidad enemiga durante $3.0\,\text{s}$.
  * **Nivel 3:** $-35\%$ velocidad enemiga durante $3.5\,\text{s}$.
* **Flavor Text:** *"Alguien derramó la botella y nadie trajo un trapo."*

---

### 9. Rebote en Estantería
* **Rareza:** Raro
* **Efecto / Mecánica:** Los proyectiles rebotan contra las paredes y repisas de madera de la alacena sin destruirse.
* **Escalado por Niveles:**
  * **Nivel 1:** $+1$ rebote ($+10\%$ daño tras botar).
  * **Nivel 2:** $+2$ rebotes ($+20\%$ daño tras botar).
  * **Nivel 3:** $+3$ rebotes ($+30\%$ daño tras botar).
* **Flavor Text:** *"Geometría aplicada al arte del clubbing."*

---

### 10. Bajón de Medianoche
* **Rareza:** Raro
* **Efecto / Mecánica:** Eliminar a una rata otorga probabilidad de soltar una "Migaja de Fiesta" que viaja magnéticamente hacia el jugador y restaura salud.
* **Escalado por Niveles:**
  * **Nivel 1:** $8\%$ de probabilidad (recupera $3\,\text{HP}$).
  * **Nivel 2:** $14\%$ de probabilidad (recupera $5\,\text{HP}$).
  * **Nivel 3:** $20\%$ de probabilidad (recupera $7\,\text{HP}$).
* **Flavor Text:** *"Comer del piso es legal si pasaron menos de 5 segundos."*

---

### 11. Salva de Boliche
* **Rareza:** Raro
* **Efecto / Mecánica:** Dispara proyectiles extra en abanico frontal por cada disparo ejecutado.
* **Escalado por Niveles:**
  * **Nivel 1:** $+1$ proyectil extra ($-15\%$ daño individual).
  * **Nivel 2:** $+2$ proyectiles extra ($-10\%$ daño individual).
  * **Nivel 3:** $+3$ proyectiles extra (sin reducción de daño).
* **Flavor Text:** *"Para los que disparan primero y apuntan después."*

---

### 12. Bajos Saturados (Subwoofer)
* **Rareza:** Raro
* **Efecto / Mecánica:** Cada cierta cantidad fija de disparos, se emite un estallido acústico esférico de 360° que aturde a los roedores adyacentes por 1 segundo.
* **Escalado por Niveles:**
  * **Nivel 1:** Se activa cada 6 disparos (radio: $2\,\text{m}$).
  * **Nivel 2:** Se activa cada 5 disparos (radio: $3\,\text{m}$).
  * **Nivel 3:** Se activa cada 4 disparos (radio: $4\,\text{m}$).
* **Flavor Text:** *"El bajo vibra tanto que les descoloca las vértebras."*

---

## 3. Perks Épicos (Control de Masas y Desencadenantes)

### 13. Explosión de Levadura
* **Rareza:** Épico
* **Efecto / Mecánica:** Al ser eliminadas, las ratas explotan en gas fermentado dañando a los enemigos vecinos.
* **Escalado por Niveles:**
  * **Nivel 1:** Detonación inflige el $40\%$ de la vida máxima de la rata en área.
  * **Nivel 2:** Detonación inflige el $65\%$ de la vida máxima en área.
  * **Nivel 3:** Detonación inflige el $90\%$ de la vida máxima con $+30\%$ de radio de explosión.
* **Flavor Text:** *"Demasiado pan fermentado en un cuerpo tan diminuto."*

---

### 14. Máquina de Humo Denso
* **Rareza:** Épico
* **Efecto / Mecánica:** Al recargar el arma, se despide una densa nube de humo en 360°. Las ratas dentro pierden la orientación hacia el centro.
* **Escalado por Niveles:**
  * **Nivel 1:** Humo activo durante $2.5\,\text{s}$ ($20\%$ prob. de desorientar).
  * **Nivel 2:** Humo activo durante $3.5\,\text{s}$ ($40\%$ prob. de desorientar).
  * **Nivel 3:** Humo activo durante $4.5\,\text{s}$ ($60\%$ prob. de desorientar).
* **Flavor Text:** *"Efectos especiales baratos comprados en liquidación."*

---

### 15. Seguridad del VIP (Patovica)
* **Rareza:** Épico
* **Efecto / Mecánica:** Al recibir un golpe, se detona automáticamente una onda de choque omnidireccional que aleja a los enemigos y otorga inmunidad momentánea.
* **Escalado por Niveles:**
  * **Nivel 1:** Retroceso moderado $+ 0.8\,\text{s}$ invulnerabilidad ($25\,\text{s}$ cooldown).
  * **Nivel 2:** Retroceso fuerte $+ 1.2\,\text{s}$ invulnerabilidad ($20\,\text{s}$ cooldown).
  * **Nivel 3:** Retroceso masivo $+ 1.6\,\text{s}$ invulnerabilidad ($15\,\text{s}$ cooldown).
* **Flavor Text:** *"No estás en la lista. Circulando."*

---

### 16. Fondue Hirviente
* **Rareza:** Épico
* **Efecto / Mecánica:** Los disparos que dan contra el suelo dejan parches de queso caliente que inmovilizan (*root*) a las ratas y queman sus patas.
* **Escalado por Niveles:**
  * **Nivel 1:** Charcos duran $3\,\text{s}$ / Inmoviliza $0.8\,\text{s}$.
  * **Nivel 2:** Charcos duran $4\,\text{s}$ / Inmoviliza $1.2\,\text{s}$.
  * **Nivel 3:** Charcos duran $5\,\text{s}$ / Inmoviliza $1.6\,\text{s}$ con doble área de cobertura.
* **Flavor Text:** *"Queso gruyere al punto de fusión nuclear."*

---

### 17. Disparo DJ Scratch
* **Rareza:** Épico
* **Efecto / Mecánica:** Asestar un golpe crítico hace que el proyectil rebobine su curso hacia atrás, atravesando la hilera de enemigos que venían detrás.
* **Escalado por Niveles:**
  * **Nivel 1:** Reversa con $50\%$ del daño base original.
  * **Nivel 2:** Reversa con $75\%$ del daño base original.
  * **Nivel 3:** Reversa con $100\%$ del daño base original $+ 1$ rebote adicional.
* **Flavor Text:** *"Wick-a-wick-a... ¡remix!"*

---

## 4. Perks Legendarios (Modificadores Mayores de Partida)

### 18. Bola de Discoteca Orbital
* **Rareza:** Legendario
* **Efecto / Mecánica:** Una esfera de espejos gira suspendida sobre el jugador, barriendo continuamente con 4 haces láser que cortan y frenan todo a su paso.
* **Escalado por Niveles:**
  * **Nivel 1:** 4 haces láser ($20\,\text{DPS}$ cada uno, $-20\%$ velocidad enemiga).
  * **Nivel 2:** Rotación un $+50\%$ más veloz ($35\,\text{DPS}$).
  * **Nivel 3:** Pasa a 6 haces láser con daño elevado a $50\,\text{DPS}$.
* **Flavor Text:** *"Iluminación estroboscópica no apta para roedores fotosensibles."*

---

### 19. El Drop del Siglo (Bass Drop)
* **Rareza:** Legendario
* **Efecto / Mecánica:** Permite canalizar un disparo cargado. Al soltarlo, detona una vibración sónica que limpia proyectiles enemigos y pulveriza a las ratas menores en toda la pantalla.
* **Escalado por Niveles:**
  * **Nivel 1:** Canalización de $6.0\,\text{s}$ $\rightarrow$ $150$ de daño global en pantalla.
  * **Nivel 2:** Canalización de $4.5\,\text{s}$ $\rightarrow$ $250$ de daño global en pantalla.
  * **Nivel 3:** Canalización de $3.0\,\text{s}$ $\rightarrow$ $400$ de daño global y aturde jefes por $2\,\text{s}$.
* **Flavor Text:** *"Esperá que explote el tema... ESPERÁ... ¡AHORA!"*

---

### 20. Trance Psicodélico
* **Rareza:** Legendario
* **Efecto / Mecánica:** Balas ligeramente guiadas hacia puntos críticos. Las ratas golpeadas pueden quedar poseídas por el ritmo, atacando a otros miembros de la horda durante 4 segundos.
* **Escalado por Niveles:**
  * **Nivel 1:** Guía leve / $12\%$ prob. de inducir confusión aliada.
  * **Nivel 2:** Guía media / $20\%$ prob. de inducir confusión aliada.
  * **Nivel 3:** Guía agresiva / $30\%$ prob. de confusión aliada ($+50\%$ velocidad de ataque a la rata convertida).
* **Flavor Text:** *"Están bailando tan fuerte que ya no saben a quién morder."*

---

### 21. Lluvia de Parmesano Divino
* **Rareza:** Legendario
* **Efecto / Mecánica:** Cada 10 segundos cae una cascada de astillas afiladas de queso sobre una sección de la alacena, atravesando hordas densas y armaduras.
* **Escalado por Niveles:**
  * **Nivel 1:** 1 cuadrante afectado ($60$ daño cortante/segundo durante $5\,\text{s}$).
  * **Nivel 2:** 2 cuadrantes simultáneos ($90$ daño cortante/segundo).
  * **Nivel 3:** Tormenta omnidireccional en 360° ($120$ daño cortante/segundo).
* **Flavor Text:** *"Decime 'basta' cuando sientas que es suficiente queso."*

---

### 22. Paso Prohibido (Conga Line)
* **Rareza:** Legendario
* **Efecto / Mecánica:** Concede perforación infinita (*infinite pierce*). Cada rata atravesada en la fila incrementa de forma multiplicativa el daño del proyectil contra la siguiente.
* **Escalado por Niveles:**
  * **Nivel 1:** Perforación total / $+15\%$ daño acumulativo por cada enemigo traspasado.
  * **Nivel 2:** Perforación total / $+25\%$ daño acumulativo por cada enemigo traspasado.
  * **Nivel 3:** Perforación total / $+40\%$ daño acumulativo por enemigo; la última rata alcanzada explota.
* **Flavor Text:** *"Uno detrás del otro, nadie rompe la fila del tren de la alegría."*