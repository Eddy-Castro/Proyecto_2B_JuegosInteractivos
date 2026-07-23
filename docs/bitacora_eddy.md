# Bitácora de Playtesting — Eddy
**Fecha:** 23/07/2026 · **Versión jugada (commit):** `c087861` (cierre de Fase 0)
**Equipo:** Windows 11 · Chrome · teclado mecánico · servidor local `http://localhost:8777`
**Foco de mis corridas:** el bucle de combate del Nivel 1 (duelo, rondas, marcador)

---

## Corrida 1
**Hora inicio:** 19:40 · **Hora fin:** 20:05 · **Duración:** 25 min

| # | Nivel | Categoría | Qué pasó (observación cruda) | Gravedad | Propuesta de mejora |
|---|---|---|---|---|---|
| 1 | 1 | Game Feel | Disparé estando cerca de un muro y la bala volvió y me mató a mí. No fue una vez suelta: repitiéndolo a propósito desde 34 posiciones y ángulos distintos, **me maté solo en 7 de 34 disparos (21 %)**, con una mediana de 1,2 s desde el disparo hasta morir | **Alta** | Que la bala no dañe a quien la dispara durante el primer segundo, o limitar los rebotes a 3-4 en vez de dejarla viva 15 s |
| 2 | 1 | Game Feel | Solo puedo tener **1 bala en pantalla**. Si fallo, me quedo desarmado hasta que se agote (15 s) o choque con algo. El duelo se corta a la mitad | **Alta** | Permitir 3 balas simultáneas y reducir la vida de la bala a ~6 s |
| 3 | 1 | UI/UX | Maté al azul y no pasó nada visible durante 3 segundos. No sabía si el juego se había colgado, si había ganado, o si estaba esperando algo | **Alta** | Cartel grande "¡RONDA PARA ROJO!" durante la espera |
| 4 | 1 | Game Feel | El tanque rojo se siente muy pesado: tarda ~0,5 s en alcanzar su velocidad máxima (100 px/s) y frena en 0,1 s. Comparado con el azul (250 px/s) parece que juego en cámara lenta | Media | Es una decisión de diseño defendible, pero la diferencia es tan grande que el rojo se siente injugable al lado del azul |

**Sensación general de la corrida:**
> Frustrante. Más de una vez perdí la ronda sin que el rival me disparara: me maté yo con mi propio rebote. Y cuando gano, el juego no me lo dice.

---

## Corrida 2
**Hora inicio:** 20:10 · **Hora fin:** 20:35 · **Duración:** 25 min

| # | Nivel | Categoría | Qué pasó (observación cruda) | Gravedad | Propuesta de mejora |
|---|---|---|---|---|---|
| 5 | 1 | Level Design | Dos rondas seguidas aparecí prácticamente encima del azul. Midiéndolo sobre 30 reinicios: la distancia mínima entre spawns fue de **143 px** (poco más de dos tanques) y **2 de 30 rondas empezaron a menos de 200 px** | Media | Exigir una distancia mínima de 400 px entre los dos puntos de aparición |
| 6 | 1 | UI/UX | **La partida no termina nunca.** Estuve jugando rondas y el marcador solo sigue subiendo. Forcé el marcador a 99 y el juego seguía lanzando rondas | **Alta** | Condición de victoria: primero en llegar a 5 rondas, y pantalla de fin de partida con el ganador |
| 7 | 1 | UI/UX | Volví al menú con ESC, entré otra vez y **el marcador seguía con los puntos de la partida anterior**. No hay forma de empezar de cero sin recargar la página | **Alta** | Reiniciar `scoreRojo` y `scoreAzul` al entrar a un nivel desde el menú |
| 8 | 1 | UI/UX | Pulsé E para poner el muro y funcionó, pero después no tenía forma de saber cuándo volvía a estar listo. Me quedé pulsando E a ciegas | **Alta** | Barra o icono de recarga de habilidad en el HUD |

**Sensación general de la corrida:**
> El combate en sí funciona, pero no hay partida: no hay principio ni final. Es un bucle de rondas sin cierre y con un marcador que se arrastra entre partidas.

---

## Corrida 3
**Hora inicio:** 20:45 · **Hora fin:** 21:10 · **Duración:** 25 min

| # | Nivel | Categoría | Qué pasó (observación cruda) | Gravedad | Propuesta de mejora |
|---|---|---|---|---|---|
| 9 | 1 | Game Feel | Disparar no transmite nada. No hay retroceso, ni destello, ni sonido, ni sacudida. Solo aparece un punto que se aleja | **Alta** | Retroceso del chasis, fogonazo, sacudida corta de cámara al disparar |
| 10 | 1 | Animaciones | Morir es que el sprite desaparece de golpe. Ni explosión, ni restos, ni nada | **Alta** | Explosión con fragmentos + destello de cámara |
| 11 | Todos | SFX | **Silencio absoluto en todo el juego.** No hay ni un solo sonido: ni disparo, ni impacto, ni muerte | **Alta** | Sistema de efectos de sonido |
| 12 | 1 | Game Feel | Los dos tanques **se atraviesan entre sí** como fantasmas. Pasé por encima del azul y no pasó nada | Media | Colisión tanque contra tanque |
| 13 | 1 | Level Design | Las cajas destructibles están ahí (vi dos) pero en 3 corridas nunca fueron relevantes: están sueltas en medio del mapa y no dan cobertura real | Baja | Reubicarlas para que sirvan de parapeto en las líneas de tiro principales |

**Sensación general de la corrida:**
> El esqueleto del juego está, pero está mudo y sin peso. Todo pasa sin que el juego te lo comunique.

---

## Top 5 problemas que más me molestaron
1. Matarme con mi propia bala en 1 de cada 5 disparos (#1)
2. Que la partida no termine nunca ni haya ganador (#6)
3. El silencio total: ningún sonido en todo el juego (#11)
4. No saber cuándo mi habilidad vuelve a estar lista (#8)
5. Los 3 segundos muertos tras cada ronda, sin ningún aviso (#3)
