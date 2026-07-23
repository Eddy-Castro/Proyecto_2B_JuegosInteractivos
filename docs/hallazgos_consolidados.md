# Hallazgos consolidados de playtesting
**Versión analizada:** commit `c087861` (cierre de Fase 0) · **Fecha de consolidación:** 23/07/2026
**Corridas totales:** 9 (3 por integrante) · **Hallazgos brutos:** 40 · **Consolidados sin duplicar:** 24

---

## Metodología

Cada integrante jugó el recorrido completo (Nivel 1 → 2 → 3) tres veces seguidas, anotando durante la partida. Para reducir el sesgo de que los tres miraran lo mismo, cada uno trabajó con un foco distinto:

- **Eddy** → bucle de combate del Nivel 1 (duelo, rondas, marcador)
- **David** → recorrido completo de los tres niveles, con atención al Nivel 2
- **Gabriel** → mecánicas propias de cada nivel (habilidades, terreno) y Nivel 3

Varias observaciones se acompañan de **mediciones repetidas** en lugar de impresiones sueltas (porcentaje de suicidios sobre 34 disparos, distancia de spawn sobre 30 reinicios, coste de procesamiento por frame). Eso permite distinguir lo que molesta de verdad de lo que solo llamó la atención una vez.

---

## Tabla consolidada

Ordenada por gravedad y luego por número de personas que lo reportaron.

| # | Categoría | Hallazgo | Reportado por | Gravedad | Evidencia medida |
|:--:|---|---|:--:|:--:|---|
| C1 | Game Feel | La bala rebota y mata a quien la disparó | **3 de 3** | Alta | 7 de 34 disparos (21 %), mediana 1,2 s |
| C2 | Level Design | Límites del mundo a 800×600 sobre mapas de 1280×960 en los niveles 2 y 3 | 2 de 3 | Alta | Tope real en x=768; 480 px de mapa inalcanzable; **39 % jugable** |
| C3 | Game Feel | Los niveles 2 y 3 no tienen oponente: un solo tanque | 2 de 3 | Alta | `jugadores: 1` en ambos |
| C4 | SFX | Ausencia total de efectos de sonido | **3 de 3** | Alta | 0 archivos de audio cargados |
| C5 | UI/UX | La partida no termina nunca: no hay condición de victoria | 1 de 3 | Alta | Con marcador forzado a 99, sigue lanzando rondas |
| C6 | UI/UX | Los cooldowns de habilidad son invisibles | **3 de 3** | Alta | 10 s (muro), 3 s (dash), 8 s (mina), sin ningún indicador |
| C7 | Game Feel | La mina del Nivel 3 detona sobre quien la coloca, en el mismo frame | 1 de 3 | Alta | maxVelocity 350 → 70 (20 %) durante 3 s |
| C8 | Game Feel | Los portales del Nivel 2 nunca se activan | 1 de 3 | Alta | 0 llamadas a `teletransportar` cruzándolos de lado a lado |
| C9 | UI/UX | No se explican los controles en ninguna parte | 2 de 3 | Alta | — |
| C10 | Game Feel | Solo una bala en pantalla por tanque, viva hasta 15 s | 1 de 3 | Alta | Deja desarmado al que falla |
| C11 | UI/UX | Los 3 s tras cada ronda no muestran ningún aviso | 1 de 3 | Alta | Únicos textos en pantalla: "1" y "0" |
| C12 | Level Design | El barro del Nivel 3 es visualmente idéntico al suelo | 1 de 3 | Alta | Misma baldosa, sin tinte |
| C13 | Música | Ausencia total de música | 2 de 3 | Alta | — |
| C14 | Animaciones | La mina es invisible en la práctica (aparece y muere en el mismo frame) | 1 de 3 | Alta | Consecuencia de C7 |
| C15 | Game Feel | Disparar no transmite peso: sin retroceso, destello ni sacudida | 1 de 3 | Alta | — |
| C16 | Animaciones | Morir es la desaparición seca del sprite | 1 de 3 | Alta | — |
| C17 | UI/UX | El marcador no se reinicia al volver al menú | 2 de 3 | Media | `scoreAzul` además queda en `null` hasta que alguien puntúa |
| C18 | Level Design | Los spawns pueden quedar demasiado cerca | 1 de 3 | Media | Mínimo 143 px; 2 de 30 rondas por debajo de 200 px |
| C19 | Game Feel | Los dos tanques se atraviesan entre sí | 1 de 3 | Media | Sin collider tanque↔tanque |
| C20 | Animaciones | Los portales son estáticos, no parecen interactivos | 1 de 3 | Media | — |
| C21 | Animaciones | Los tanques no dejan rastro ni tienen orugas animadas | 1 de 3 | Media | — |
| C22 | Level Design | Los tres niveles se ven iguales: mismas texturas, misma sensación | 1 de 3 | Media | — |
| C23 | Game Feel | El barro frena pero no da ninguna señal (ni salpicadura, ni tinte, ni sonido) | 1 de 3 | Media | drag 50 → 800, sin feedback |
| C24 | Level Design | Las cajas destructibles no dan cobertura útil | 1 de 3 | Baja | 2 cajas sueltas en medio del mapa |

---

## Aspectos positivos detectados

No todo fueron problemas. Conviene registrarlo porque marca lo que **no** hay que tocar:

- **El dash del tanque azul** (tecla N) fue señalado como la mejor mecánica del juego: atraviesa muros interiores pero impide salir del mapa. Es el modelo a seguir para las demás habilidades.
- **El rendimiento tiene margen de sobra**: ~0,12 ms de procesamiento por frame sobre los 16,7 ms disponibles a 60 fps. Se pueden añadir efectos visuales sin riesgo.
- **Los perfiles de física de los tres tanques están bien diferenciados** (100/250/350 px/s de velocidad máxima con rozamientos y rotaciones distintas). La identidad de cada facción se nota al conducir.
- **El Nivel 1 sí usa correctamente las dimensiones del mapa** para los límites del mundo: es la referencia para arreglar los otros dos.

---

## Contraste con la auditoría técnica previa

La auditoría de código había señalado 12 hallazgos candidatos (A–L). Al jugar:

**Confirmados jugando** — A (sin condición de victoria), B (marcador no se reinicia), C (controles no explicados), D (tanques se atraviesan), E (spawns cercanos), F (una sola bala), G (cooldowns invisibles), H (sin audio), I (muerte sin efecto), K (teletransporte sin feedback), L (barro y minas imperceptibles).

**Detectado técnicamente pero sin impacto perceptible** — J (fuego amigo en Nivel 2 lleva a fin de partida): existe, pero como el Nivel 2 ni siquiera tiene rival, el problema real resultó ser otro (C3).

**No detectados en la auditoría, encontrados solo al jugar** — los tres más graves del informe:
- **C2**, los límites del mundo a 800×600: no salta leyendo el código porque la línea `setBounds(0, 0, 800, 600)` es sintácticamente correcta; solo se descubre al chocar contra un muro que no existe.
- **C7**, la mina que detona sobre su propio dueño: hay que pulsar la tecla para verlo.
- **C8**, los portales que nunca se activan: el código de teletransporte se lee bien y parece correcto.

Es el argumento más claro a favor de haber jugado en lugar de solo revisar el código.

---

## Cierre de las 9 mejoras

Los hallazgos confirman las 9 mejoras previstas y **añaden dos problemas nuevos de gravedad alta** (C2 y C8) que hay que absorber:

| Mejora | Cubre | Ajuste respecto al plan original |
|---|---|---|
| **E1** Game Feel — combate con peso | C1, C10, C15 | Sin cambios |
| **E2** UI/UX — HUD y victoria | C5, C6, C9, C11, C17 | Sin cambios |
| **E3** SFX | C4 | Sin cambios |
| **D1** Level Design — Nivel 2 | C22, C20 | Sin cambios |
| **D2** Game Feel — Nivel 2 jugable | C3, C8, C18, C19 | **Añadir C2**: corregir los límites del mundo del Nivel 2 |
| **D3** Animaciones | C16, C20, C21 | Sin cambios |
| **G1** Game Feel — minas y barro | C7, C14, C23 | Sin cambios |
| **G2** Level Design — Nivel 3 | C12, C22 | **Añadir C2**: corregir los límites del mundo del Nivel 3 |
| **G3** Música | C13 | Sin cambios |

**Cobertura de categorías del rubro:** Game Feel ✅ · Level Design ✅ · Música ✅ · SFX ✅ · Animaciones ✅ · UI/UX ✅ — ninguna queda vacía.

> ⚠️ **Único cambio de alcance frente al plan:** C2 (límites del mundo) no estaba contemplado. Es un arreglo de dos líneas por nivel y encaja de forma natural en D2 y G2, así que **no se sustituye ninguna mejora**: se amplían esas dos. C24 (cajas) queda registrado pero fuera de alcance por ser de gravedad baja.
