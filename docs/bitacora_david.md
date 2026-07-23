# Bitácora de Playtesting — David
**Fecha:** 23/07/2026 · **Versión jugada (commit):** `c087861` (cierre de Fase 0)
**Equipo:** Windows 11 · Chrome · portátil · servidor local `http://localhost:8777`
**Foco de mis corridas:** el recorrido completo de los tres niveles, con atención al Nivel 2

---

## Corrida 1
**Hora inicio:** 18:15 · **Hora fin:** 18:40 · **Duración:** 25 min

| # | Nivel | Categoría | Qué pasó (observación cruda) | Gravedad | Propuesta de mejora |
|---|---|---|---|---|---|
| 1 | 2 | Level Design | **El tanque choca contra un muro invisible.** Avancé hacia la derecha y me detuve en seco a los 768 px, con medio mapa todavía dibujado delante que no puedo pisar. Lo mismo hacia abajo | **Alta** | Los límites del mundo están fijados a 800×600 pero el mapa mide 1280×960: solo el **39 % del nivel es jugable**. Usar `mapa.widthInPixels` / `heightInPixels` como en el Nivel 1 |
| 2 | 2 | Game Feel | **No hay rival.** Entro al Nivel 2 y solo existe mi tanque. No hay nadie contra quien jugar, ni enemigos, ni objetivo | **Alta** | Instanciar los dos jugadores como en el Nivel 1, con su sistema de rondas |
| 3 | 2 | Game Feel | Pasé por encima de un portal varias veces y **no me teletransportó ninguna**. Los crucé de lado a lado y no reaccionan | **Alta** | El overlap del portal nunca dispara. Revisar cómo se crea el cuerpo físico del portal y su grupo |
| 4 | 2 | Level Design | Los dos portales están en la mitad superior izquierda del mapa, muy juntos y dentro de la única zona a la que puedo llegar. No conectan nada interesante | Media | Colocarlos por coordenadas de tile en esquinas opuestas, en pares |

**Sensación general de la corrida:**
> El Nivel 2 no es un nivel todavía. Es un tanque solo, en un cuarto del mapa, con dos adornos azules que no hacen nada.

---

## Corrida 2
**Hora inicio:** 18:50 · **Hora fin:** 19:15 · **Duración:** 25 min

| # | Nivel | Categoría | Qué pasó (observación cruda) | Gravedad | Propuesta de mejora |
|---|---|---|---|---|---|
| 5 | 3 | Level Design | Mismo muro invisible que en el Nivel 2: me paro a los 768 px y quedan **480 px de mapa dibujado e inalcanzable** a la derecha | **Alta** | Mismo arreglo que #1 |
| 6 | 3 | Game Feel | Otra vez estoy solo. Los tres niveles prometen tres facciones enfrentadas pero solo el Nivel 1 tiene dos tanques | **Alta** | Dos jugadores también en los niveles 2 y 3 |
| 7 | 2 | UI/UX | En el Nivel 2, si mi propia bala rebota y me da, **la partida se acaba directamente** y me manda a la pantalla de fin. No hay rondas ni segunda oportunidad | **Alta** | Quitar ese atajo a `GameOverScene` y usar el sistema de rondas del Nivel 1 |
| 8 | Todos | UI/UX | Empecé sin saber qué teclas usar. Tuve que ir a mirar el código para descubrir que el azul dispara con M y hace dash con N | **Alta** | Pantalla de controles en el menú |
| 9 | 1 | Game Feel | Confirmo lo del rebote: disparando cerca de una pared la bala vuelve y te mata. Me pasó tres veces en una sola corrida | **Alta** | Inmunidad breve a la bala propia o límite de rebotes |

**Sensación general de la corrida:**
> Los niveles 2 y 3 comparten exactamente los mismos dos fallos de base: medio mapa bloqueado y ningún oponente. Se nota que se copiaron del mismo molde antes de terminarlo.

---

## Corrida 3
**Hora inicio:** 19:25 · **Hora fin:** 19:50 · **Duración:** 25 min

| # | Nivel | Categoría | Qué pasó (observación cruda) | Gravedad | Propuesta de mejora |
|---|---|---|---|---|---|
| 10 | 2 | Animaciones | Los portales son un círculo azul quieto. No pulsan, no giran, no indican que sean algo con lo que interactuar. Parecen decoración del suelo | Media | Animación de pulso continuo y efecto al atravesarlos |
| 11 | Todos | Animaciones | El tanque se desliza por el suelo sin dejar rastro ni tener orugas animadas. Se mueve como una pegatina arrastrada | Media | Estelas de rodadura que se desvanecen |
| 12 | Todos | Música | **No hay música en ninguna pantalla.** Ni en el menú, ni en los niveles | **Alta** | Sistema de música de fondo |
| 13 | 2 | Level Design | El mapa del Nivel 2 se ve exactamente igual que el del Nivel 1: mismas texturas, misma sensación de espacio abierto. Nada dice "Sindicato de Neón" | Media | Rediseñar el layout con identidad propia (pasillos estrechos frente al campo abierto del Nivel 1) |
| 14 | Todos | UI/UX | La cámara sigue solo al tanque rojo. En el Nivel 1 da igual porque el mapa entra entero en pantalla, pero es una decisión que se rompería en cuanto el mapa fuera más grande | Baja | Si algún mapa crece, usar cámara que encuadre a ambos jugadores |

**Sensación general de la corrida:**
> Visualmente los tres niveles son el mismo juego con distinto muro. No hay identidad visual ni sonora que los diferencie.

---

## Top 5 problemas que más me molestaron
1. El muro invisible que bloquea el 61 % de los niveles 2 y 3 (#1, #5)
2. Que los niveles 2 y 3 no tengan oponente (#2, #6)
3. Los portales del Nivel 2 no funcionan en absoluto (#3)
4. No saber los controles al empezar (#8)
5. Ausencia total de música (#12)
