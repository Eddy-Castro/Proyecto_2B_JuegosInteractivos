# Guion para el video demostrativo — Laberinto de Acero

**Duración objetivo:** 2 min (máx. 2:30) · **Participantes:** Eddy Castro, David Valencia, Gabriel Vásconez
**Formato:** captura de pantalla del juego + voz en off (los tres hablan)

---

## Antes de grabar (15 minutos de preparación)

### 1. Preparar el juego

Ábrelo desde el enlace desplegado, no desde localhost:

```
https://eddy-castro.github.io/Proyecto_2B_JuegosInteractivos/
```

- Usa **ventana de incógnito** (evita caché) y **pantalla completa** (F11).
- Sube el volumen: la música y los efectos tienen que oírse en la grabación.
- Ten los **dos teclados/manos listos**: el juego es a 2 jugadores en el mismo teclado.

### 2. Configurar OBS (o Xbox Game Bar con `Win + G`)

- Resolución **1920×1080, 60 fps**.
- ⚠️ **Verifica que se graba el audio del sistema**, no solo el micrófono. Es el error más común y dejaría el video mudo justo en las mejoras de sonido.
- El juego es 4:3 (1280×960): quedarán franjas negras a los lados. Está bien — no las dejes vacías si puedes, pon el logo o un fondo oscuro en la edición.

### 3. Grabar material de sobra

Antes de grabar la voz, **jugad 10-15 minutos y grabadlo todo**. Luego escogéis los mejores momentos. Necesitáis clips donde se vea:

- [ ] Un duelo cerrado en el **Nivel 1** con muro de trinchera y una explosión
- [ ] El **dash azul** atravesando una pared
- [ ] Un **teletransporte** en el Nivel 2 (con su efecto de onda)
- [ ] Una **mina** que se arma y explota sobre el rival en el Nivel 3
- [ ] Un tanque **frenando en el barro** (se ve el tinte marrón)
- [ ] La **pantalla de victoria** al llegar a 5 rondas

> Jugad **de verdad**, con intención. Un tanque dando vueltas sin rumbo se nota muchísimo en cámara.

---

## Guion por bloques

### BLOQUE 1 — Apertura (0:00 – 0:20) · **Eddy**

**En pantalla:** menú principal. Deja que se vean las tres tarjetas de facción y pasa el ratón por encima para mostrar el efecto hover.

> «Somos Eddy Castro, David Valencia y Gabriel Vásconez, del paralelo GR1SW.
> Presentamos **Laberinto de Acero**, un duelo de tanques 2D para dos jugadores
> desarrollado con Phaser sobre arquitectura web: se juega directamente desde el
> navegador, sin instalar nada.
> El juego tiene tres niveles, y cada uno representa a una facción con su propia
> física, su habilidad y su escenario.»

---

### BLOQUE 2 — Nivel 1: Imperio de Hierro (0:20 – 0:45) · **Eddy**

**En pantalla:** partida en el Nivel 1. Muestra el HUD, dispara varias veces seguidas y usa el muro con `E`.

> «El Imperio de Hierro es lento y pesado, pero controla el terreno: con la tecla E
> levanta un muro de trinchera que bloquea el paso y las balas.
> Aquí se ven varias de nuestras mejoras: el disparo tiene retroceso, sacudida de
> cámara y fogonazo, y ahora se pueden tener hasta tres balas en pantalla.
> Arriba, cada jugador tiene su marcador y una barra que indica cuándo su habilidad
> vuelve a estar lista.»

**Punto clave que debe verse:** la barra de recarga vaciándose y volviéndose a llenar.

---

### BLOQUE 3 — Nivel 2: Sindicato de Neón (0:45 – 1:10) · **David**

**En pantalla:** Nivel 2. Enseña primero los pasillos, luego entra en un portal.

> «El Sindicato de Neón juega en un mapa distinto: cámaras cerradas y pasillos
> estrechos, en lugar del campo abierto del primer nivel.
> Su tanque es rápido y evasivo, y con la tecla N hace un dash que le permite
> atravesar los muros interiores, pero nunca salir del mapa.
> Los cuatro portales de las esquinas conectan los extremos del mapa: son la vía
> rápida para escapar o para sorprender al rival por detrás.»

**Punto clave que debe verse:** el efecto de teletransporte (onda azul + destello) y los portales pulsando.

---

### BLOQUE 4 — Nivel 3: Hijos del Páramo (1:10 – 1:35) · **Gabriel**

**En pantalla:** Nivel 3. Coloca una mina, aléjate, y que el rival la pise. Luego cruza el barro.

> «Los Hijos del Páramo pelean con trampas. Con la tecla E colocan minas de óxido
> que tardan un segundo y medio en armarse: parpadean mientras tanto y no dañan a
> quien las puso, solo al rival, que queda ralentizado.
> Las zonas marrones son barro: no bloquean el paso, pero frenan el tanque y
> levantan salpicaduras. Obligan a elegir entre el camino corto y lento, o el largo
> y expuesto.»

**Punto clave que debe verse:** la mina parpadeando (armado) y luego la explosión sobre el rival.

---

### BLOQUE 5 — Cierre (1:35 – 2:00) · **los tres**

**En pantalla:** pantalla de victoria, y luego vuelta al menú.

> **Gabriel:** «Todo el sonido del juego es original de esta versión: siete efectos
> y música propia para cada nivel, que no se corta cuando reinicia la ronda.»
>
> **David:** «Las partidas se ganan al llegar a cinco rondas, y el juego lo indica
> con su pantalla final.»
>
> **Eddy:** «El juego está desplegado y es público: cualquiera puede jugarlo desde
> el navegador en el enlace que aparece en pantalla. Gracias.»

**En pantalla al final (texto sobreimpreso, 4-5 segundos):**

```
LABERINTO DE ACERO
eddy-castro.github.io/Proyecto_2B_JuegosInteractivos

Eddy Castro · David Valencia · Gabriel Vásconez
Desarrollo de Juegos Interactivos — GR1SW
```

---

## Reparto de voces (resumen)

| Bloque | Quién habla | Contenido |
|:--:|---|---|
| 1 | **Eddy** | Presentación del equipo y del juego |
| 2 | **Eddy** | Nivel 1 + mejoras de disparo y HUD |
| 3 | **David** | Nivel 2 + dash y portales |
| 4 | **Gabriel** | Nivel 3 + minas y barro |
| 5 | Los tres | Audio, victoria y cierre |

> Cada uno narra el nivel y las mejoras de las que fue responsable. Así el video
> refleja el reparto real de trabajo que consta en el GDD.

---

## Edición

- **Programas gratuitos:** CapCut (el más rápido), DaVinci Resolve o Shotcut.
- Baja el volumen del juego a ~30 % cuando alguien habla, y súbelo en los momentos
  de acción sin voz (explosiones, teletransporte).
- Cortes secos entre bloques. Nada de transiciones elaboradas.
- Pon un rótulo con el nombre del nivel al inicio de cada bloque (ej. «Nivel 2 —
  Sindicato de Neón»).

## Publicación

- Subir a **YouTube** como **"No listado"** o **"Público"** — nunca "Privado", o el
  docente no podrá verlo.
- **Verifica el enlace desde una ventana de incógnito** antes de entregarlo.

---

## Checklist final antes de entregar

```
[ ] El video dura entre 1 y 2:30 minutos
[ ] Se escuchan música y efectos de sonido
[ ] Aparecen los tres niveles jugándose de verdad
[ ] Se ven las habilidades: muro, dash, portal, mina
[ ] Hablan los tres integrantes
[ ] Aparece el enlace de GitHub Pages en pantalla
[ ] El enlace de YouTube abre en incógnito
```

> **Nota sobre el rubro:** si además se pide una cinemática introductoria generada
> con IA (Runway, Kling, Luma…), va **antes del bloque 1**, con unos 15-20 segundos
> de ambientación del páramo y las tres facciones. Empezad a generarla con tiempo:
> las colas de renderizado son el cuello de botella típico.
