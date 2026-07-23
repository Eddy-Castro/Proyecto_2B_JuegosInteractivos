# Prompts de ejecución — Laberinto de Acero
Guion de sesiones para ejecutar `PLAN_PROYECTO_FINAL.md` con un modelo asistente (Sonnet 5), fase por fase.

---

## Cómo usar este archivo

- **Una sesión nueva por prompt.** No encadenes varias tareas grandes en la misma conversación: el contexto se llena y la calidad cae.
- **Copia el prompt entero**, incluida la cabecera de contexto. Cada prompt es autosuficiente: el modelo arranca en frío y no sabe nada de las sesiones anteriores.
- **Orden estricto.** Los prompts están numerados en el orden en que deben ejecutarse. Saltarse uno rompe dependencias reales (ver *Orden de ejecución* en el plan).
- **Al terminar cada sesión**, ejecuta el *Prompt de cierre* (sección final) antes de pasar al siguiente.

### Resumen de sesiones

| # | Sesión | Qué hace | Duración aprox. |
|:--:|---|---|---|
| 1 | `F0-A` | Separar `main.js` en módulos | 30–45 min |
| 2 | `F0-B` | Corregir los 4 crashes y el 404 | 45 min |
| 3 | `F0-C` | Generar mapas y quitar dependencias externas | 45 min |
| 4 | `F0-D` | Higiene, centrado y verificación de Fase 0 | 30 min |
| 5 | — | **Playtesting (lo haces tú, sin IA)** | 1–2 h |
| 6 | `F2` | Consolidar bitácoras | 20 min |
| 7–15 | `M1`…`M9` | Las 9 mejoras, una por sesión | 1–2 h c/u |
| 16 | `F4` | GDD | 2 sesiones |
| 17 | `F6` | Verificación final de despliegue | 30 min |

---

# BLOQUE COMÚN (va al inicio de cada prompt)

Este bloque se repite en todos los prompts de abajo. Está aquí solo como referencia; **no lo copies por separado**, ya viene incluido en cada uno.

```
CONTEXTO DEL PROYECTO
Juego: "Laberinto de Acero", duelo de tanques 2D en Phaser 3.60 (JS plano, sin build).
Carpeta de trabajo: D:\Repositorios-Github\ProyectoB2JuegosInteractivos\Proyecto_1B
Repositorio: https://github.com/Eddy-Castro/Proyecto_2B_JuegosInteractivos (rama main)
Desplegado en: https://eddy-castro.github.io/Proyecto_2B_JuegosInteractivos/

FUENTE DE VERDAD
El archivo PLAN_PROYECTO_FINAL.md contiene el plan completo con código concreto,
rutas exactas y criterios de aceptación. LÉELO antes de tocar nada. No improvises
soluciones alternativas: si el plan dice cómo hacer algo, hazlo así.

REGLAS INNEGOCIABLES
1. Ejecuta SOLO la tarea que te pido. No adelantes trabajo de otras tareas.
2. Verifica de verdad. Levanta el servidor local y comprueba cada criterio de
   aceptación ejecutando el juego. No declares algo "listo" sin haberlo comprobado.
3. Si un criterio NO pasa, dilo claramente. Prefiero un informe honesto de 3 de 4
   criterios cumplidos que un "todo listo" falso.
4. NO hagas git push salvo que te lo pida explícitamente.
5. Servidor local obligatorio (el juego carga el tilemap por fetch; file:// no sirve):
   python -m http.server 8777    ->  http://localhost:8777
6. Rutas siempre relativas, nunca empezando por "/".
7. Nombres de archivo sin espacios, sin tildes, mayúsculas consistentes.
   GitHub Pages corre en Linux y distingue mayúsculas; Windows no.
```

---

# SESIÓN 1 — `F0-A`: separar `main.js`

````
CONTEXTO DEL PROYECTO
Juego: "Laberinto de Acero", duelo de tanques 2D en Phaser 3.60 (JS plano, sin build).
Carpeta de trabajo: D:\Repositorios-Github\ProyectoB2JuegosInteractivos\Proyecto_1B
Repositorio: https://github.com/Eddy-Castro/Proyecto_2B_JuegosInteractivos (rama main)

FUENTE DE VERDAD
PLAN_PROYECTO_FINAL.md contiene el plan completo con código concreto, rutas exactas
y criterios de aceptación. LÉELO antes de tocar nada. No improvises soluciones
alternativas: si el plan dice cómo hacer algo, hazlo así.

REGLAS INNEGOCIABLES
1. Ejecuta SOLO la tarea que te pido. No adelantes trabajo de otras tareas.
2. Verifica de verdad: levanta el servidor y comprueba cada criterio de aceptación.
3. Si un criterio NO pasa, dilo claramente. No declares "listo" lo que no lo está.
4. NO hagas git push salvo que te lo pida explícitamente.
5. Servidor local: python -m http.server 8777  ->  http://localhost:8777
6. Rutas relativas, nunca empezando por "/".

TAREA DE ESTA SESIÓN: F0.1 — Separar main.js en módulos

Lee la sección "F0.1 — Separar main.js en módulos" del plan y ejecútala.

Resumen de lo que hay que hacer:
- main.js tiene hoy 295 líneas con 3 clases de escena (Level2, Level3, UIScene),
  3 clases de entidad (Teletransportador, MinaOxido, TanqueVerde) y el arranque.
- Hay que repartirlo en archivos separados según la tabla del plan.
- main.js debe quedar SOLO con el objeto config y el arranque (<= 25 líneas),
  incluyendo la línea window.game = game.
- Hay que actualizar index.html con el nuevo orden de <script>, que está
  escrito literalmente en el plan. El orden importa: las clases base antes que
  las hijas.
- Renombrar src/tanks/skills.js -> src/entities/MuroTrinchera.js
- Crear src/audio/AudioManager.js con el stub vacío que indica el plan.

IMPORTANTE: en esta tarea NO se corrige ningún bug. Es un movimiento de código
puro. El juego debe comportarse exactamente igual que antes (con los mismos
errores). Si "aprovechas" para arreglar algo, me lo dices explícitamente.

CRITERIOS DE ACEPTACIÓN (verifícalos ejecutando el juego)
- main.js tiene <= 25 líneas
- Ningún archivo .js define dos escenas distintas
- El juego arranca y llega al menú
- La consola no tiene NINGÚN error nuevo respecto a antes del cambio
  (los errores preexistentes de los niveles 2 y 3 deben seguir igual)

Antes de empezar, hazme un resumen de qué archivos vas a crear y cuáles vas a
modificar. Luego ejecuta.
````

---

# SESIÓN 2 — `F0-B`: corregir crashes

````
CONTEXTO DEL PROYECTO
Juego: "Laberinto de Acero", duelo de tanques 2D en Phaser 3.60 (JS plano, sin build).
Carpeta de trabajo: D:\Repositorios-Github\ProyectoB2JuegosInteractivos\Proyecto_1B

FUENTE DE VERDAD
PLAN_PROYECTO_FINAL.md contiene el plan con código concreto y criterios de
aceptación. LÉELO antes de tocar nada. No improvises.

REGLAS INNEGOCIABLES
1. Ejecuta SOLO las tareas que te pido.
2. Verifica de verdad ejecutando el juego. No declares "listo" lo no comprobado.
3. Si un criterio NO pasa, dilo claramente.
4. NO hagas git push.
5. Servidor local: python -m http.server 8777  ->  http://localhost:8777

TAREAS DE ESTA SESIÓN: F0.2, F0.4, F0.5 y F0.8

Ejecuta en este orden las secciones del plan:

  F0.2 — Corregir el 404 de BootScene
         (carga "tanqueRojo.png" desde la raíz; el archivo está en resources/img/.
          La textura dummy_tank no se usa: hay que eliminarla, además de añadir
          la barra de carga y el handler de loaderror que indica el plan)

  F0.4 — Corregir el crash de la bala destruida
         (impactoJugador() hace bala.destroy(), pero cada tanque reutiliza UNA
          sola bala. Tras el destroy, bala.body es null y el siguiente disparo
          revienta. Solución: nunca destruir, solo desactivar, y blindar
          desactivar() y disparar() contra body null)

  F0.5 — Dar teclas al TanqueVerde
         (TanqueVerde no define this.teclas, y TanqueBase.actualizar() lo lee en
          cada frame -> excepción por frame en el Nivel 3)

  F0.8 — Arreglar el HUD de puntuación roto
         (UIScene tiene un listener que usa this.textoPuntuacion, que está
          comentado -> lanza al cambiar la puntuación)

CÓMO VERIFICAR (esto es la parte importante)
Tras F0.1 ya existe window.game, así que puedes inspeccionar el juego desde la
consola del navegador. Si el navegador está en una pestaña que no se está
renderizando, requestAnimationFrame se pausa y el juego no avanza; en ese caso
haz avanzar el bucle a mano:

    let t = 0;
    for (let i = 0; i < 120; i++) { t += 16.7; window.game.step(t, 16.7); }

Comprobaciones concretas:
- F0.2: pestaña Network sin ningún 404 al cargar
- F0.4: entrar al Nivel 1, matar a un tanque, y durante los 3 segundos previos
        al reinicio pulsar disparo repetidamente -> cero errores en consola
- F0.5: entrar al Nivel 3 y dejarlo correr 30 s -> cero errores en consola;
        el tanque verde se mueve con WASD y dispara con ESPACIO
- F0.8: ejecutar en consola  window.game.registry.set("puntuacion", 99)
        -> no lanza error

Al terminar, dime qué criterios pasaron y cuáles no, uno por uno.
````

---

# SESIÓN 3 — `F0-C`: mapas y assets locales

````
CONTEXTO DEL PROYECTO
Juego: "Laberinto de Acero", duelo de tanques 2D en Phaser 3.60.
Carpeta de trabajo: D:\Repositorios-Github\ProyectoB2JuegosInteractivos\Proyecto_1B

FUENTE DE VERDAD
PLAN_PROYECTO_FINAL.md. LÉELO antes de tocar nada. Contiene los scripts de
Python COMPLETOS y los layouts ASCII ya validados: cópialos tal cual, no los
reescribas ni los "mejores".

REGLAS INNEGOCIABLES
1. Ejecuta SOLO las tareas que te pido.
2. Verifica de verdad ejecutando el juego.
3. Si un criterio NO pasa, dilo claramente.
4. NO hagas git push.
5. Servidor local: python -m http.server 8777

TAREAS DE ESTA SESIÓN: F0.3 y F0.6

  F0.3 — Eliminar la dependencia de labs.phaser.io
         Hoy 7 assets (bala, caja, muro, portal, mina, tiles, sprites) se
         descargan del servidor de demos de Phaser. Sin internet el juego se
         rompe, incluida la bala.
         - Crea tools/generar_texturas.py (está completo en el plan) y ejecútalo.
           Requiere: pip install pillow
         - Sustituye TODAS las URLs externas por las rutas locales según la
           tabla de equivalencias del plan.

  F0.6 — Crear los mapas de los niveles 2 y 3
         Hoy apuntan a "ruta/mapa2.json" y "ruta/mapa3.json", que son
         placeholders que nunca existieron.
         - Crea tools/generar_mapa.py y tools/validar_mapa.py (ambos completos
           en el plan) y ejecútalos.
         - Los layouts ASCII MAPA2 y MAPA3 del plan YA ESTÁN VALIDADOS
           (20x15, simetría rotacional 180°, sin zonas aisladas, barro al 16.8%).
           Cópialos exactamente. Si los modificas, el validador te lo dirá.
         - Corrige las rutas en level2.js y level3.js
         - Corrige el nombre del tileset en addTilesetImage: debe ser
           "spritesheet-tiles-default" con los parámetros 64, 64, 0, 1.
           El spacing=1 es obligatorio; sin él los tiles salen desalineados.

CRITERIOS DE ACEPTACIÓN
- grep -rn "labs.phaser.io" --include=*.js .   -> sin resultados
- python tools/validar_mapa.py                 -> los 2 mapas APTOS
- Los 3 niveles muestran suelo y paredes
- En consola: window.game.cache.tilemap.getKeys()
  -> ["mapa_nivel1","mapa_nivel2","mapa_nivel3"]
- El juego funciona con el WiFi apagado (salvo el <script> de Phaser del CDN)

Al terminar, dime qué criterios pasaron y cuáles no.
````

---

# SESIÓN 4 — `F0-D`: higiene y cierre de Fase 0

````
CONTEXTO DEL PROYECTO
Juego: "Laberinto de Acero", duelo de tanques 2D en Phaser 3.60.
Carpeta de trabajo: D:\Repositorios-Github\ProyectoB2JuegosInteractivos\Proyecto_1B
Repositorio: https://github.com/Eddy-Castro/Proyecto_2B_JuegosInteractivos

FUENTE DE VERDAD
PLAN_PROYECTO_FINAL.md. LÉELO antes de tocar nada.

REGLAS INNEGOCIABLES
1. Ejecuta SOLO las tareas que te pido.
2. Verifica de verdad ejecutando el juego.
3. Si un criterio NO pasa, dilo claramente.
4. Servidor local: python -m http.server 8777

TAREAS DE ESTA SESIÓN: F0.7, F0.9 y F0.10

  F0.7 — Centrar menú y Game Over
         El canvas es 1280x960 pero todos los textos están en x=400, así que el
         menú vive en el cuadrante superior izquierdo. Usa this.scale.width/2.
         La tabla de posiciones nuevas está en el plan.

  F0.9 — Higiene de assets y repositorio
         - git mv "resources/img/tanqueVerde - copia.png" resources/img/tanqueVerde.png
         - borrar resources/img/tanqueRojoAntiguo.png (sin referencias)
         - optimizar los 3 PNG de tanques con tools/optimizar_sprites.py
           (se dibujan a 64x50 pero pesan ~1 MB en total)
         - crear .gitignore y .nojekyll
         - descomentar el grupo de cajas destructibles en level1.js
           (hay 4 colliders apuntando a this.cajas, que está comentado)
         - SRI de Phaser en index.html: OJO, el hash del plan es de ejemplo y NO
           está verificado. Genera el real con el comando que indica el plan. Si
           no puedes generarlo, OMITE el atributo integrity: es preferible sin
           SRI que con un SRI incorrecto (el navegador bloquearía el script y el
           juego no cargaría).

  F0.10 — Verificación completa de Fase 0
         Ejecuta la checklist de 9 puntos del plan, una por una, y repórtame el
         resultado de cada una.

Además, crea tools/verificar_rutas.py (está completo en el plan) y ejecútalo:
detecta referencias a assets con mayúsculas incorrectas o espacios, que es el
fallo que rompe GitHub Pages sin dar la cara en Windows.

CRITERIOS DE ACEPTACIÓN
- Los 9 puntos de la checklist F0.10 pasan
- python tools/verificar_rutas.py  -> 0 problemas
- Peso total de resources/ < 300 KB
- git status limpio tras los renombrados

CUANDO TODO PASE: prepárame el commit (pero NO hagas push todavía, dímelo y yo
decido).
````

---

# SESIÓN 5 — Playtesting

**Esta sesión no lleva IA.** Eres tú jugando.

1. Levanta el juego: `python -m http.server 8777`
2. Juega el juego completo (Nivel 1 → 2 → 3) **3 veces seguidas**.
3. Anota todo en `docs/bitacora_eddy.md` usando la plantilla del plan (Fase 1).
4. Pásale a David y Gabriel el enlace de Pages y la plantilla:
   `https://eddy-castro.github.io/Proyecto_2B_JuegosInteractivos/`
   (necesitan haber hecho push de la Fase 0 antes, para que jueguen la versión arreglada)

> No corrijas nada mientras juegas. Primero las 3 corridas, después se arregla.

---

# SESIÓN 6 — `F2`: consolidar bitácoras

````
CONTEXTO DEL PROYECTO
Juego: "Laberinto de Acero", Phaser 3.60.
Carpeta: D:\Repositorios-Github\ProyectoB2JuegosInteractivos\Proyecto_1B

FUENTE DE VERDAD
PLAN_PROYECTO_FINAL.md, sección "FASE 2 — Consolidación".

TAREA: consolidar las bitácoras de playtesting

En docs/ están las bitácoras de las 3 personas. Necesito que:

1. Las leas todas y produzcas docs/hallazgos_consolidados.md con una tabla
   unificada, sin duplicados, con una columna "reportado por N de 3".
   Lo reportado por los 3 es lo más crítico.

2. Contrastes esos hallazgos con los 12 hallazgos técnicos (A-L) de la sección
   "Hallazgos candidatos" del plan. Marca explícitamente:
   - los que coinciden (detectados técnicamente Y percibidos jugando)
   - los detectados solo técnicamente (sin impacto perceptible)
   - los percibidos jugando que yo no había detectado en la auditoría

3. Revises si las 9 mejoras propuestas en la Fase 3 del plan siguen siendo las
   correctas a la luz del playtesting real. Si algún hallazgo pesa más que una
   mejora ya prevista, PROPÓN el cambio, respetando:
   - 3 mejoras por integrante
   - las 6 categorías del rubro cubiertas (Game Feel, Level Design, Música,
     SFX, Animaciones, UI/UX): ninguna puede quedar vacía
   - dónde encajaría en el orden de ejecución

NO modifiques el plan por tu cuenta. Propón y espera mi decisión.
````

---

# SESIONES 7–15 — Las 9 mejoras

> ⚠️ **Una mejora por sesión, en este orden exacto.** No es el orden alfabético: hay dependencias reales entre ellas.

| Sesión | Prompt | ID | Mejora |
|:--:|:--:|:--:|---|
| 7 | `M1` | **E1** | Pool de balas + game feel de combate |
| 8 | `M2` | **G1** | Minas y barro perceptibles |
| 9 | `M3` | **D2** | Nivel 2 jugable a 2 jugadores |
| 10 | `M4` | **G2** | Diseño del mapa del Nivel 3 |
| 11 | `M5` | **D1** | Diseño del mapa del Nivel 2 |
| 12 | `M6` | **E2** | HUD, cooldowns y condición de victoria |
| 13 | `M7` | **E3** | Sistema de SFX |
| 14 | `M8` | `G3` | Sistema de música persistente |
| 15 | `M9` | **D3** | VFX y animaciones |

## Prompt plantilla (sustituye `<<ID>>` y `<<NOMBRE>>`)

````
CONTEXTO DEL PROYECTO
Juego: "Laberinto de Acero", duelo de tanques 2D en Phaser 3.60 (JS plano, sin build).
Carpeta de trabajo: D:\Repositorios-Github\ProyectoB2JuegosInteractivos\Proyecto_1B
Repositorio: https://github.com/Eddy-Castro/Proyecto_2B_JuegosInteractivos (rama main)
Desplegado en: https://eddy-castro.github.io/Proyecto_2B_JuegosInteractivos/

FUENTE DE VERDAD
PLAN_PROYECTO_FINAL.md contiene la especificación completa de esta mejora, con
código concreto, archivos exactos y criterios de aceptación. LÉELA ENTERA antes
de tocar nada. El código del plan está pensado para este proyecto: cópialo y
adáptalo, no lo reinventes.

REGLAS INNEGOCIABLES
1. Implementa SOLO la mejora <<ID>>. No adelantes otras mejoras.
2. Verifica de verdad: levanta el servidor y comprueba CADA criterio de
   aceptación jugando. No declares "listo" lo que no has comprobado.
3. Si un criterio NO pasa, dilo claramente y explica por qué.
4. NO hagas git push salvo que te lo pida.
5. Servidor local: python -m http.server 8777  ->  http://localhost:8777
6. Rutas relativas, nunca empezando por "/". Nombres de archivo sin espacios
   ni tildes, mayúsculas consistentes (GitHub Pages corre en Linux).

TAREA DE ESTA SESIÓN: mejora <<ID>> — <<NOMBRE>>

Lee la sección "<<ID>> —" del plan e impleméntala completa.

ANTES DE EMPEZAR, dime:
- qué archivos vas a crear y cuáles vas a modificar
- si detectas algún conflicto con lo ya implementado en mejoras anteriores
- si alguna parte de la especificación del plan te parece incorrecta o
  incompleta a la vista del código real (esto puede pasar: el plan se escribió
  antes de implementar las mejoras previas)

Luego implementa.

CÓMO VERIFICAR
El objeto del juego está en window.game. Si la pestaña del navegador no se está
renderizando, requestAnimationFrame se pausa y el juego no avanza solo; hazlo
avanzar a mano desde la consola:

    let t = 0;
    for (let i = 0; i < 120; i++) { t += 16.7; window.game.step(t, 16.7); }

Otras comprobaciones útiles desde consola:
    window.game.scene.scenes.filter(s => s.scene.isActive()).map(s => s.scene.key)
    window.game.loop.actualFps        // debe mantenerse >= 55
    Object.keys(window.game.textures.list)

AL TERMINAR
Repórtame los criterios de aceptación uno por uno, indicando cuáles pasaron y
cuáles no. Luego prepara el commit con este formato (pero NO hagas push):

    [<<ID>>] descripción corta

    Closes #N
````

## Notas específicas por mejora

Añade estas líneas al final del prompt correspondiente:

**`M1` (E1)** — la más delicada: reescribe `Bala.js` y `Tanque.js`, que son la base de todo.
```
NOTA: al cambiar this.bala por this.balas (grupo), hay que actualizar TODAS las
referencias en los colliders de level1.js. Búscalas antes con:
    grep -n "\.bala" src/levels/*.js src/tanks/*.js
Son unas 8. Si dejas una sin actualizar, el juego falla en silencio.
Añade también this.velocidadMaximaBase a las 3 subclases de tanque: las mejoras
G1 y G2 lo necesitan para restaurar la velocidad correctamente.
```

**`M2` (G1)** — depende de M1.
```
NOTA: esta mejora necesita this.velocidadMaximaBase, que introdujo la mejora E1.
Verifica que exista en TanqueRojo, TanqueAzul y TanqueVerde antes de empezar.
El código original de MinaOxido.detonar() tenía dos bugs: llamaba this.destroy()
antes de usar jugador.scene, y hardcodeaba la velocidad a 350. El plan los corrige.
```

**`M3` (D2)** — crea utilidad compartida.
```
NOTA: extrae obtenerPuntoSpawnValido y obtenerPuntoSpawnValidoLejos a
src/utils/spawn.js (archivo nuevo) y añádelo a index.html. Las mejoras G2 y el
propio level1.js lo van a reutilizar: no lo dupliques dentro de level2.js.
Añade también la colisión tanque-tanque en los 3 niveles (hoy se atraviesan).
```

**`M4` (G2)** y **`M5` (D1)** — diseño de mapas.
```
NOTA: tras editar cualquier layout ASCII, ejecuta SIEMPRE:
    python tools/validar_mapa.py
Comprueba dimensiones, simetría rotacional 180°, conectividad, callejones sin
salida y (en el mapa 3) que el barro esté entre 15% y 25% y que exista siempre
una ruta alternativa sin barro. Si no pasa, corrige el layout antes de seguir.
```

**`M7` (E3)** y **`M8` (G3)** — audio.
```
NOTA: hacen falta archivos de sonido reales en resources/audio/. Descárgalos de
kenney.nl (licencia CC0) con los nombres EXACTOS que indica el plan. Si aún no
los tengo descargados, dímelo y para: implementa el sistema pero avísame de qué
archivos faltan, no inventes rutas ni generes audio sintético sin avisar.
Teclas: P = silenciar SFX, O = silenciar música.
NO uses M para audio: M ya es el disparo del tanque azul.
```

**`M9` (D3)** — la última, mucho VFX.
```
NOTA: vigila el rendimiento. Comprueba window.game.loop.actualFps con los 2
tanques moviéndose y 6 balas en pantalla: debe mantenerse >= 55. Si las estelas
degradan el FPS, limita su generación como indica el plan.
Cuidado con setScale sobre los tanques: usan setDisplaySize(64,50), que ya
modifica la escala internamente. Usa la propiedad escalaBase que define el plan.
```

---

# SESIÓN 16 — `F4`: GDD

````
CONTEXTO DEL PROYECTO
Juego: "Laberinto de Acero", duelo de tanques 2D en Phaser 3.60.
Carpeta: D:\Repositorios-Github\ProyectoB2JuegosInteractivos\Proyecto_1B
Repositorio: https://github.com/Eddy-Castro/Proyecto_2B_JuegosInteractivos
Desplegado: https://eddy-castro.github.io/Proyecto_2B_JuegosInteractivos/
Equipo (atribución del entregable): Eddy, David, Gabriel

FUENTE DE VERDAD
PLAN_PROYECTO_FINAL.md, sección "FASE 4 — Game Design Document (GDD)".
Ahí está la estructura obligatoria de 7 secciones que exige el rubro.

TAREA: redactar el GDD en docs/GDD.md

Las 9 mejoras ya están implementadas. Necesito el documento completo.

INSTRUCCIONES CRÍTICAS
1. La sección 3 (Personajes) lleva una tabla con los valores REALES del código
   (velocidad máxima, aceleración, drag, rotación, cooldowns, controles). NO los
   copies del plan: LÉELOS del código actual en src/tanks/Tanque.js, porque
   pueden haber cambiado durante las mejoras. El profesor puede contrastarlos.

2. La sección 6.4 (Matriz de asignación) es la que califica el examen. Sácala
   del historial real de git:
       git log --oneline --grep="\[E1\]\|\[E2\]\|\[E3\]"
       git log --oneline --grep="\[D1\]\|\[D2\]\|\[D3\]"
       git log --oneline --grep="\[G1\]\|\[G2\]\|\[G3\]"
   Rellena la columna "Commit" con los hashes reales.

3. La sección 6.2 (Bitácoras individuales) transcribe docs/bitacora_*.md SIN
   editar ni "limpiar". El valor está en que sea el registro crudo.

4. Para la sección 5 (Diseño de Niveles), incluye los layouts ASCII de
   tools/generar_mapa.py: son un recurso visual excelente y demuestran el
   proceso de diseño.

5. Sección 7: créditos y licencias de TODO asset de terceros (Phaser MIT,
   Kenney CC0, música con su licencia). Si la música es CC-BY, la atribución es
   obligatoria.

NO INVENTES NADA. Si te falta un dato (nombre del docente, fecha de entrega,
enlace del vídeo, licencia concreta de la música), déjalo como
[PENDIENTE: descripción] y hazme al final la lista de lo que falta.

Empieza leyendo el código y el historial de git, no el plan.
````

---

# SESIÓN 17 — `F6`: verificación final

````
CONTEXTO DEL PROYECTO
Juego: "Laberinto de Acero", Phaser 3.60.
Carpeta: D:\Repositorios-Github\ProyectoB2JuegosInteractivos\Proyecto_1B
Repositorio: https://github.com/Eddy-Castro/Proyecto_2B_JuegosInteractivos
Desplegado: https://eddy-castro.github.io/Proyecto_2B_JuegosInteractivos/

FUENTE DE VERDAD
PLAN_PROYECTO_FINAL.md, sección "FASE 6" y "Checklist final de entrega".

TAREA: verificación final antes de entregar

GitHub Pages YA está activo (rama main, carpeta raíz) y se reconstruye en cada
push. No hay que activarlo; hay que VERIFICAR que lo desplegado funciona.

Ejecuta y repórtame el resultado de cada punto:

1. Verificaciones locales:
       python tools/verificar_rutas.py     -> debe dar 0 problemas
       python tools/validar_mapa.py        -> los 2 mapas APTOS
       grep -rn "labs.phaser.io" --include=*.js .          -> sin resultados
       grep -rn 'src="/\|src='"'"'/\|"/resources' --include=*.js --include=*.html .   -> sin resultados

2. Estado del despliegue:
       gh api repos/Eddy-Castro/Proyecto_2B_JuegosInteractivos/pages/builds/latest --jq '{estado: .status, error: .error.message}'
   Debe dar "built" y error null.

   NOTA: si "gh" no se encuentra, está instalado pero fuera del PATH de la
   terminal. Usa la ruta completa:
       "C:\Program Files\GitHub CLI\gh.exe"
   o cierra y reabre la terminal.

3. Verificación en producción (la URL en vivo, no localhost):
   - la página carga sin pantalla negra
   - consola: 0 errores rojos, 0 peticiones 404
   - los 3 niveles arrancan y son jugables
   - se escuchan música y efectos
   - sprites y tilemaps se ven correctamente
   - ESC vuelve al menú

4. Crea el README.md de la raíz con la plantilla del plan (enlace de juego bien
   visible, controles, documentación, créditos).

5. Repasa la "Checklist final de entrega" completa del plan y dime qué falta.

IMPORTANTE: la verificación del punto 3 debe hacerse contra la URL de GitHub
Pages, NO contra localhost. Los fallos por mayúsculas/minúsculas solo aparecen
en producción porque Windows no distingue mayúsculas y Linux sí.
````

---

# Prompt de cierre (al final de cada sesión)

````
Antes de cerrar esta sesión:

1. Resume en 5 líneas qué quedó hecho y qué quedó pendiente.
2. Dime si algún criterio de aceptación NO pasó y por qué.
3. Indica si detectaste algo que contradiga el plan y que deba corregirse en
   PLAN_PROYECTO_FINAL.md antes de la siguiente sesión.
4. Deja el árbol de git limpio: o commiteas, o me dices qué hay sin commitear.
5. Si toca hacer push, dímelo y espera mi confirmación. No hagas push por tu
   cuenta: GitHub Pages sirve main tal cual, y un push a medias deja el juego
   caído hasta el siguiente.
````

---

# Prompt de recuperación (si algo se rompe)

````
CONTEXTO
Juego: "Laberinto de Acero", Phaser 3.60.
Carpeta: D:\Repositorios-Github\ProyectoB2JuegosInteractivos\Proyecto_1B
Plan completo en PLAN_PROYECTO_FINAL.md

PROBLEMA
<<describe qué falla: mensaje de error exacto, en qué nivel, qué estabas haciendo>>

QUÉ NECESITO
1. Reproduce el fallo tú mismo antes de proponer nada. Levanta el servidor
   (python -m http.server 8777) y llega hasta el error.
2. Diagnostica la causa raíz. No parchees el síntoma.
3. Dime si es un bug de una mejora recién implementada o algo preexistente.
4. Propón el arreglo y espera mi visto bueno antes de aplicarlo.

Para inspeccionar el estado del juego desde la consola del navegador:
    window.game
    window.game.scene.scenes.filter(s => s.scene.isActive()).map(s => s.scene.key)
    let t = 0; for (let i = 0; i < 120; i++) { t += 16.7; window.game.step(t, 16.7); }

Si necesitas volver atrás:
    git log --oneline -10
    git revert HEAD          (si ya está pusheado)
    git reset --hard HEAD~1  (SOLO si NO está pusheado)
````

---

## Recordatorios finales

- **Empieza la cinemática de IA durante las sesiones 7–15**, no al final. Runway/Kling/Luma tienen colas de renderizado y créditos limitados: es lo único cuyo tiempo no controlas.
- **Haz push al terminar cada mejora.** Pages se actualiza solo; así los fallos de producción salen de uno en uno.
- **Si Sonnet 5 dice "listo" sin haber ejecutado el juego, no le creas.** Pídele que te enseñe la comprobación concreta.
