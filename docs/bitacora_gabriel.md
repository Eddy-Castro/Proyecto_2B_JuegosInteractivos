# Bitácora de Playtesting — Gabriel
**Fecha:** 23/07/2026 · **Versión jugada (commit):** `c087861` (cierre de Fase 0)
**Equipo:** Windows 11 · Chrome · servidor local `http://localhost:8777`
**Foco de mis corridas:** las mecánicas propias de cada nivel (habilidades, terreno) y el Nivel 3

---

## Corrida 1
**Hora inicio:** 21:20 · **Hora fin:** 21:45 · **Duración:** 25 min

| # | Nivel | Categoría | Qué pasó (observación cruda) | Gravedad | Propuesta de mejora |
|---|---|---|---|---|---|
| 1 | 3 | Game Feel | **Puse una mina con E y me explotó a mí en el acto.** No exagero: se coloca bajo mis pies y detona en el mismo frame. Mi velocidad máxima cayó de 350 a 70 (un 20 %) durante 3 segundos | **Alta** | La mina no debe afectar a quien la coloca, y necesita una fase de armado de ~1,5 s antes de ser peligrosa |
| 2 | 3 | Game Feel | Como la mina se autodetona, la habilidad del tanque verde **solo sirve para castigarte**. Pulsar E es siempre malo. Es la única habilidad de las tres que perjudica al que la usa | **Alta** | Igual que #1 |
| 3 | 3 | Animaciones | La mina no llega a verse. Aparece y desaparece en el mismo frame, así que en la práctica es un sprite invisible | **Alta** | Fase de armado con parpadeo + pulso cuando está lista |
| 4 | 3 | UI/UX | Tras pisar la mina me quedé lentísimo 3 segundos sin ninguna indicación de por qué. No hay icono, ni tinte, ni contador | Media | Teñir el tanque mientras dura la penalización |

**Sensación general de la corrida:**
> La mecánica estrella del Nivel 3 está exactamente al revés de como debería: la habilidad es un autocastigo.

---

## Corrida 2
**Hora inicio:** 21:55 · **Hora fin:** 22:20 · **Duración:** 25 min

| # | Nivel | Categoría | Qué pasó (observación cruda) | Gravedad | Propuesta de mejora |
|---|---|---|---|---|---|
| 5 | 3 | Level Design | **El barro no se distingue del suelo normal.** Sé que está ahí porque el tanque frena, pero visualmente es la misma baldosa. Tuve que ir memorizando por dónde me había frenado | **Alta** | Teñir la capa de barro (marrón) y bajarle el alfa para que se lea de un vistazo |
| 6 | 3 | Game Feel | Cuando entro al barro sí noto el frenazo (el rozamiento sube de 50 a 800), pero no hay ninguna otra señal: ni salpicaduras, ni sonido, ni cambio en el tanque | Media | Salpicaduras al avanzar y tinte embarrado en el tanque |
| 7 | 3 | Level Design | Combinado con el muro invisible, casi todas las zonas de barro del mapa quedan fuera de la parte jugable. La mecánica principal del nivel es prácticamente inalcanzable | **Alta** | Arreglar los límites del mundo (mismo problema que reportó David) |
| 8 | 1 | Game Feel | El muro de trinchera del rojo sí funciona y bloquea bien, pero dura 10 s y tiene 10 s de recarga, así que casi siempre lo tengo gastado sin saberlo | Media | Indicador de recarga en pantalla |

**Sensación general de la corrida:**
> Las dos mecánicas propias del Nivel 3 (minas y barro) existen en el código pero el jugador no las percibe: una se autodestruye y la otra es invisible.

---

## Corrida 3
**Hora inicio:** 22:30 · **Hora fin:** 22:55 · **Duración:** 25 min

| # | Nivel | Categoría | Qué pasó (observación cruda) | Gravedad | Propuesta de mejora |
|---|---|---|---|---|---|
| 9 | 1 | Game Feel | Probé el dash del azul (N) y es lo mejor del juego: atraviesa muros interiores pero no te deja salir del mapa. Se siente muy bien | — | **Mantener tal cual.** Es el mejor ejemplo de habilidad del proyecto |
| 10 | Todos | SFX | Ni las habilidades tienen sonido. Poner un muro, hacer un dash o soltar una mina son acciones mudas | **Alta** | SFX diferenciado por habilidad |
| 11 | Todos | UI/UX | Cuando vuelvo al menú con ESC y entro a otro nivel, el marcador de la partida anterior sigue ahí | Media | Reiniciar el marcador al entrar desde el menú |
| 12 | Todos | Game Feel | El juego va perfectamente fluido, sin tirones, incluso con balas rebotando. Medí el coste de procesamiento y está en torno a **0,12 ms por frame** sobre los 16,7 ms disponibles | — | Hay muchísimo margen para añadir efectos visuales sin arriesgar el rendimiento |
| 13 | 3 | Animaciones | El tanque verde, el rojo y el azul se mueven exactamente igual. Nada distingue visualmente a las facciones más allá del color | Baja | Diferenciar con efectos propios (estela, humo) |

**Sensación general de la corrida:**
> Lo que está bien hecho está muy bien hecho (el dash, el rendimiento). Lo que falta, falta entero: sonido, feedback visual y que las mecánicas del Nivel 3 sean jugables.

---

## Top 5 problemas que más me molestaron
1. La mina que te explota a ti mismo al ponerla (#1, #2)
2. El barro invisible, imposible de anticipar (#5)
3. Que las zonas de barro queden fuera del área jugable (#7)
4. Habilidades sin ningún sonido (#10)
5. No saber cuándo la habilidad está recargada (#8)
