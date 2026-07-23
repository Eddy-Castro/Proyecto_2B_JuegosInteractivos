# Plan de Implementación — Examen Práctico y Proyecto Final
**Materia:** Juegos Interactivos · **Juego:** Laberinto de Acero (Phaser 3.60)
**Entregable del grupo:** Eddy · David · Gabriel → **9 mejoras (3 atribuidas a cada integrante)**
**Quién ejecuta:** Eddy + asistente de IA, en solitario y de forma secuencial.
**Repositorio:** `https://github.com/Eddy-Castro/Proyecto_2B_JuegosInteractivos` · rama `main`
**URL en vivo:** `https://eddy-castro.github.io/Proyecto_2B_JuegosInteractivos/` — ✅ **Pages ya activado y verificado**

---

## 0. Cómo usar este documento

Este plan lo ejecuta **una sola persona (Eddy) junto a un agente de IA**, tarea por tarea y en orden. No hay reparto de trabajo entre varios desarrolladores ni ramas paralelas.

Los identificadores `E1…E3`, `D1…D3`, `G1…G3` **no son asignaciones de trabajo**: son las **etiquetas de atribución** que exige el rubro (3 mejoras por integrante) y que van a la matriz del GDD. Todo el código lo escribimos nosotros; los IDs solo organizan el entregable.

### Reglas de oro para el agente ejecutor

1. **Una tarea a la vez, en el orden indicado.** Cada tarea tiene un ID (`F0.1`, `E1`, `D2`…). Ejecuta solo la tarea pedida. No adelantes trabajo de otras tareas.
2. **No inventes rutas ni nombres de archivo.** Todas las rutas están escritas explícitamente aquí. Si una ruta no existe, créala; no la "adivines".
3. **Verifica antes de decir que terminaste.** Cada tarea tiene un bloque `✅ Criterios de aceptación`. Debes comprobarlos realmente (ejecutando el juego en un servidor local), no asumirlos.
4. **Servidor local obligatorio.** El juego usa `fetch` para el tilemap; abrir `index.html` con doble clic (`file://`) **no funciona**. Usa siempre:
   ```bash
   python -m http.server 8777
   ```
   y abre `http://localhost:8777`.
5. **Rutas relativas siempre.** Nunca uses rutas que empiecen con `/` (rompen GitHub Pages, que sirve desde el subdirectorio `/Proyecto_2B_JuegosInteractivos/`).
6. **Nombres de archivo sin espacios, sin tildes, sin mayúsculas inconsistentes.** GitHub Pages corre sobre Linux y **distingue mayúsculas de minúsculas**; Windows no. Un `Tanque.png` referenciado como `tanque.png` funciona en local y da 404 en producción.
7. **Respeta las dependencias entre tareas.** Algunas mejoras tocan los mismos archivos y deben hacerse en orden (ver *Orden de ejecución* abajo). No reordenes por tu cuenta.
8. **Commits pequeños y con el ID de la tarea:**
   ```
   [E1] Pool de balas: elimina crash al disparar tras un impacto
   ```
9. **Al terminar cada mejora, hacer push.** Pages se actualiza solo, así que cada push es una oportunidad de detectar fallos de producción temprano en vez de todos juntos el último día.

### Orden de ejecución (reemplaza al reparto por personas)

Trabajando en solitario no hay conflictos de merge, pero **sí hay dependencias reales**: varias mejoras modifican los mismos archivos y una hecha fuera de orden obliga a rehacer la anterior.

```
FASE 0  (F0.1 → F0.10)   Estabilización. Bloquea todo lo demás.
   │
   ├─ F0.1 separar main.js       ← primero SIEMPRE: mueve todos los archivos
   └─ resto de F0 en orden numérico

FASE 1-2  Playtesting y consolidación de la bitácora

FASE 3  Las 9 mejoras, EN ESTE ORDEN:

  1. E1  Pool de balas + game feel        ← toca Bala.js y Tanque.js (base de todo)
  2. G1  TanqueVerde + minas + barro      ← necesita velocidadMaximaBase de E1
  3. D2  Nivel 2 a 2 jugadores            ← crea utils/spawn.js que usa G2
  4. G2  Diseño del mapa 3                ← usa utils/spawn.js de D2
  5. D1  Diseño del mapa 2                ← independiente, pero tras D2
  6. E2  HUD, cooldowns y victoria        ← lee los cooldowns definidos en E1/G1
  7. E3  Sistema de SFX                   ← inserta llamadas en TODOS los niveles
  8. G3  Sistema de música                ← comparte BootScene con E3
  9. D3  VFX y animaciones                ← capa final sobre todo lo anterior

FASE 4-5  GDD y trailer (el trailer se graba con el juego YA terminado)
FASE 6    Verificación final del despliegue
```

**Por qué este orden:** E1 reescribe `Bala.js` y `Tanque.js`, que son la base de casi todo. G1 depende de una propiedad que introduce E1. D2 crea la utilidad de spawn que G2 reutiliza. E2 necesita conocer los cooldowns finales. E3 y G3 tocan `BootScene` (carga de audio) y conviene hacerlas seguidas. D3 va al final porque los efectos visuales se montan sobre mecánicas ya estables.

---

## 0.1 Herramientas: GitHub CLI (`gh`)

**Estado verificado:** `gh` **v2.96.0** está instalado en `C:\Program Files\GitHub CLI\gh.exe` y autenticado como **`Eddy-Castro`** (scopes: `gist`, `read:org`, `repo`, `workflow` — suficientes para todo lo que pide este plan).

### ⚠️ Primero: arreglar el PATH

`gh` se instaló pero **no está en el PATH de las terminales ya abiertas**. Si escribes `gh` y sale `command not found`:

**Solución: cierra y vuelve a abrir la terminal** (PowerShell, Git Bash o VS Code). El instalador ya añadió la ruta; solo hace falta que la sesión la recargue.

Comprobación:
```bash
gh --version
gh auth status
```

### ⚠️ Segundo: el repositorio fue renombrado

El repo se llama ahora **`Proyecto_2B_JuegosInteractivos`**, pero el remoto local todavía apunta a `Proyecto_1B.git`. GitHub redirige, así que `git push` funciona — pero **la URL de GitHub Pages usará el nombre nuevo**. Arréglalo ahora, es un segundo:

```bash
git remote set-url origin https://github.com/Eddy-Castro/Proyecto_2B_JuegosInteractivos.git
git remote -v
```

La carpeta local puede seguir llamándose `Proyecto_1B`; eso no afecta a nada.

Si aun así falla, usa la ruta completa o crea un alias:
```powershell
# PowerShell — solo para la sesión actual
Set-Alias gh "C:\Program Files\GitHub CLI\gh.exe"
```
```bash
# Git Bash — solo para la sesión actual
alias gh="/c/Program Files/GitHub CLI/gh.exe"
```

### Para qué sirve en este proyecto

| Tarea del plan | Sin `gh` | Con `gh` |
|---|---|---|
| Activar GitHub Pages | Navegar por Settings | 1 comando — ✅ **ya hecho y verificado** |
| Comprobar que Pages compiló tras cada push | Recargar la web a ciegas | `gh api .../pages/builds/latest --jq .status` |
| Seguimiento de las 9 mejoras | Tabla suelta en un documento | 9 issues cerrables desde los commits |
| Abrir el juego desplegado | Copiar la URL a mano | `gh browse` |

> **No hace falta invitar colaboradores.** Todo el trabajo se hace desde esta máquina con tu cuenta. David y Gabriel figuran en la **atribución del entregable** (GDD), no en los permisos del repositorio.

### Crear los 9 issues de las mejoras (opcional pero recomendado)

Sirve para dos cosas: llevar el avance sin depender de la memoria, y dejar un rastro verificable que respalde la matriz del GDD (cada commit cierra su issue con `Closes #N`).

Crea `tools/crear_issues.sh` y ejecútalo **una sola vez**:

```bash
#!/usr/bin/env bash
# Crea los 9 issues de las mejoras. Ejecutar UNA sola vez.
set -e
REPO="Eddy-Castro/Proyecto_2B_JuegosInteractivos"

# Etiquetas por categoría del rubro (ignora el error si ya existen)
gh label create "game-feel"    --repo "$REPO" --color "d73a4a" 2>/dev/null || true
gh label create "level-design" --repo "$REPO" --color "0e8a16" 2>/dev/null || true
gh label create "ui-ux"        --repo "$REPO" --color "1d76db" 2>/dev/null || true
gh label create "sfx"          --repo "$REPO" --color "fbca04" 2>/dev/null || true
gh label create "musica"       --repo "$REPO" --color "c5def5" 2>/dev/null || true
gh label create "animaciones"  --repo "$REPO" --color "5319e7" 2>/dev/null || true

crear() {  # $1=ID  $2=etiqueta  $3=atribucion  $4=titulo
  gh issue create --repo "$REPO" \
    --title "[$1] $4" \
    --label "$2" \
    --body "Mejora **$1** del examen práctico. Atribuida en el GDD a: **$3**.

La especificación completa (problema, implementación y criterios de aceptación)
está en \`PLAN_PROYECTO_FINAL.md\`, sección \`$1\`.

Cerrar solo cuando **todos** los criterios de aceptación pasen."
}

# El orden aqui es el ORDEN DE EJECUCION, no el alfabetico
crear E1 game-feel    Eddy    "Combate con peso: retroceso, screen shake, munición múltiple"
crear G1 game-feel    Gabriel "Mecánica de minas y barro perceptible"
crear D2 game-feel    David   "Nivel 2 jugable a 2 jugadores"
crear G2 level-design Gabriel "Diseño real del Nivel 3 con zonas de barro legibles"
crear D1 level-design David   "Diseño real del Nivel 2 con portales integrados"
crear E2 ui-ux        Eddy    "HUD completo: cooldowns, condición de victoria, controles"
crear E3 sfx          Eddy    "Sistema de efectos de sonido"
crear G3 musica       Gabriel "Sistema de música persistente con fade"
crear D3 animaciones  David   "VFX de teletransporte y estelas de oruga"

echo "Listo. Ver: gh issue list --repo $REPO"
```

> Sin `--assignee`: el repositorio tiene un solo colaborador, así que asignar no aporta nada. La atribución va en el cuerpo del issue y en el GDD, que es donde el rubro la pide.

Ver el avance en cualquier momento:
```bash
gh issue list --repo Eddy-Castro/Proyecto_2B_JuegosInteractivos --state all
```

### Comandos útiles del día a día

```bash
gh repo view --web    # abrir el repo en el navegador
gh browse             # abrir el juego desplegado
gh issue list         # ver qué mejoras quedan
gh api repos/Eddy-Castro/Proyecto_2B_JuegosInteractivos/pages/builds/latest --jq '.status, .error.message'
```

---

## 1. Estado actual del proyecto (auditoría previa)

Se auditó el código y se **ejecutó el juego** para verificar cada punto. Resumen:

| Estado | Detalle |
|---|---|
| ✅ Nivel 1 | Funcional y bastante completo (2 jugadores, tilemap correcto, rondas, habilidades) |
| ❌ Nivel 2 | Carga pero el mapa no existe (`ruta/mapa2.json` → 404). Es un vacío negro con 2 portales |
| ❌ Nivel 3 | **Lanza excepción en cada frame.** `TanqueVerde` nunca define `this.teclas` |
| ❌ Crash en Nivel 1 | Disparar después de matar a alguien tira `Cannot read properties of undefined (reading 'setVelocity')` |
| ⚠️ Menú | Descentrado: textos en `x=400` sobre un canvas de 1280×960 |
| ⚠️ HUD de puntos | El listener existe pero el objeto de texto está comentado → lanza error al cambiar la puntuación |
| ⚠️ Assets | ~1 MB de PNG sobredimensionados; 2 archivos huérfanos; 7 assets cargados desde `labs.phaser.io` (dependencia externa) |
| ⚠️ Arquitectura | `main.js` tiene 295 líneas con 3 clases de escena + 3 de entidades + el bootstrap |

**Consecuencia para el examen:** *no se puede hacer el playtesting de "3 corridas del juego completo" porque 2 de los 3 niveles no son jugables.* Por eso existe la **Fase 0**.

---

## 2. Fases y calendario

Todo lo ejecuta la misma persona en secuencia. Las duraciones asumen trabajo con asistencia de IA.

| Fase | Qué es | Duración | Estado |
|---|---|---|---|
| **Fase 0** | Estabilización: dejar el juego jugable de punta a punta | 1 día | Pendiente |
| **Fase 1** | Playtesting: 3 corridas completas anotando todo | 1–2 h | Pendiente |
| **Fase 2** | Consolidación de la bitácora y cierre de las 9 mejoras | 30 min | Pendiente |
| **Fase 3** | Implementación de las 9 mejoras (en el orden dado) | 3–5 días | Pendiente |
| **Fase 4** | GDD en PDF | 1–2 días | Pendiente |
| **Fase 5** | Trailer (gameplay + cinemática IA) | 1–2 días | Pendiente |
| **Fase 6** | Verificación final del despliegue | 1 h | ✅ Pages ya activo |

> ⚠️ **Empieza la cinemática de IA durante la Fase 3, no al final.** Runway/Kling/Luma tienen colas de renderizado y créditos limitados; es el único punto del plan cuyo tiempo no depende de ti.

> 💡 **Pages ya está activo y se actualiza en cada `git push` a `main`.** Aprovéchalo: haz push al terminar cada mejora y revisa la URL en vivo. Así los fallos que solo aparecen en producción (mayúsculas, rutas) salen de uno en uno y no todos juntos la última noche.

---

# FASE 0 — Estabilización (pre-requisito del examen)

**Objetivo:** que los 3 niveles arranquen, se puedan jugar y se pueda salir de ellos, para que las 3 corridas de playtesting sean posibles y honestas.

> Estas correcciones **no cuentan** como las "3 mejoras por integrante". Son la línea base. En el GDD se documentan como *"corrección de estabilidad previa al playtesting"*.

---

### F0.1 — Separar `main.js` en módulos

**Por qué primero:** si no se hace ahora, los 3 integrantes van a editar `main.js` simultáneamente durante la Fase 3 y cada push será un conflicto.

**Acción:** mover el contenido de `main.js` a estos archivos nuevos, **sin cambiar la lógica todavía**:

| Clase actual en `main.js` | Archivo destino |
|---|---|
| `Teletransportador` | `src/entities/Teletransportador.js` (nuevo) |
| `MinaOxido` | `src/entities/MinaOxido.js` (nuevo) |
| `Level2` | `src/levels/level2.js` (nuevo) |
| `TanqueVerde` | `src/tanks/Tanque.js` (añadir al final, junto a `TanqueRojo` y `TanqueAzul`) |
| `Level3` | `src/levels/level3.js` (nuevo) |
| `UIScene` | `src/ui/UIScene.js` (nuevo) |
| `config` + `new Phaser.Game(config)` | se queda en `main.js` |

`main.js` debe quedar **solo así**:

```js
const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 960,
  },
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [BootScene, MenuScene, Level1, Level2, Level3, UIScene, GameOverScene],
};

const game = new Phaser.Game(config);
window.game = game; // útil para depurar desde la consola del navegador
```

**Actualizar `index.html`.** El orden importa: las clases base deben cargarse antes que las hijas.

```html
<body>
  <div id="game-container"></div>

  <!-- 1. Entidades base -->
  <script src="src/tanks/Bala.js"></script>
  <script src="src/entities/MuroTrinchera.js"></script>
  <script src="src/entities/Teletransportador.js"></script>
  <script src="src/entities/MinaOxido.js"></script>

  <!-- 2. Tanques (TanqueBase primero, luego las subclases: todo va en Tanque.js) -->
  <script src="src/tanks/Tanque.js"></script>

  <!-- 3. Sistemas -->
  <script src="src/audio/AudioManager.js"></script>

  <!-- 4. Escenas -->
  <script src="src/BootScene.js"></script>
  <script src="src/menu.js"></script>
  <script src="src/levels/level1.js"></script>
  <script src="src/levels/level2.js"></script>
  <script src="src/levels/level3.js"></script>
  <script src="src/ui/UIScene.js"></script>
  <script src="src/GameOver.js"></script>

  <!-- 5. Arranque (siempre al final) -->
  <script src="main.js"></script>
</body>
```

**Nota:** renombrar `src/tanks/skills.js` → `src/entities/MuroTrinchera.js` (su contenido es solo la clase `MuroTrinchera`; el nombre `skills.js` es engañoso). `src/audio/AudioManager.js` se crea vacío en F0.1 y se llena en la mejora `E3`; por ahora basta con:
```js
// src/audio/AudioManager.js — se implementa en la mejora E3
class AudioManager {}
```

✅ **Criterios de aceptación**
- `main.js` tiene ≤ 25 líneas.
- El juego arranca sin errores nuevos en consola.
- Ningún archivo `.js` define dos escenas distintas.

---

### F0.2 — Corregir el 404 de `BootScene`

**Archivo:** `src/BootScene.js` línea 11.
**Problema verificado:** `GET http://localhost:8777/tanqueRojo.png → 404 File not found`.

La textura `dummy_tank` **no se usa en ninguna parte**. Bórrala. `BootScene` debe quedar:

```js
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // Barra de carga simple (evita pantalla negra si la conexión es lenta)
    const barra = this.add.graphics();
    this.load.on("progress", (v) => {
      barra.clear().fillStyle(0xffffff, 1).fillRect(340, 470, 600 * v, 20);
    });

    // Aviso en consola si algún asset falla (clave para depurar en GitHub Pages)
    this.load.on("loaderror", (file) => {
      console.error("[BootScene] Falló la carga:", file.key, "->", file.url);
    });

    this.load.image("bala", "resources/img/bala.png");
  }

  create() {
    this.scene.start("MenuScene");
  }
}
```

✅ **Criterios de aceptación**
- Cero peticiones `404` en la pestaña *Network* del navegador al cargar el juego.

---

### F0.3 — Eliminar la dependencia de `labs.phaser.io`

**Problema:** 7 assets se descargan del servidor de demos de Phaser (bala, caja, muro, portal, mina, tiles). Si ese servidor cae o no hay internet, el juego se rompe — incluida **la bala**, que es esencial.

**Solución (recomendada): generar las texturas localmente una sola vez con un script.**

Crea `tools/generar_texturas.py` y ejecútalo:

```python
# tools/generar_texturas.py
# Genera los sprites que hoy se descargan de labs.phaser.io.
# Requisito: pip install pillow
from PIL import Image, ImageDraw
import os

DEST = "resources/img"
os.makedirs(DEST, exist_ok=True)

def guardar(nombre, size, dibujar):
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    dibujar(ImageDraw.Draw(img), size)
    img.save(os.path.join(DEST, nombre))
    print("OK ->", nombre)

# Bala: círculo amarillo con borde oscuro
guardar("bala.png", (8, 8), lambda d, s: d.ellipse([0, 0, 7, 7], fill=(255, 214, 64, 255), outline=(40, 30, 0, 255)))

# Caja destructible: cajón marrón con aspas
def caja(d, s):
    d.rectangle([0, 0, s[0]-1, s[1]-1], fill=(140, 94, 52, 255), outline=(70, 45, 22, 255), width=3)
    d.line([0, 0, s[0], s[1]], fill=(70, 45, 22, 255), width=3)
    d.line([s[0], 0, 0, s[1]], fill=(70, 45, 22, 255), width=3)
guardar("caja.png", (32, 32), caja)

# Muro de trinchera: barra gris metálica (se escala en el juego)
guardar("muro.png", (500, 64), lambda d, s: d.rectangle([0, 0, s[0]-1, s[1]-1], fill=(150, 150, 160, 255), outline=(60, 60, 70, 255), width=6))

# Portal: anillo azul brillante
def portal(d, s):
    d.ellipse([0, 0, s[0]-1, s[1]-1], fill=(40, 160, 255, 255))
    d.ellipse([8, 8, s[0]-9, s[1]-9], fill=(180, 235, 255, 255))
guardar("portal.png", (48, 48), portal)

# Mina de óxido: círculo rojizo con púas
def mina(d, s):
    cx, cy = s[0] // 2, s[1] // 2
    for ang in range(0, 360, 45):
        import math
        x = cx + math.cos(math.radians(ang)) * (cx - 2)
        y = cy + math.sin(math.radians(ang)) * (cy - 2)
        d.line([cx, cy, x, y], fill=(90, 50, 30, 255), width=5)
    d.ellipse([6, 6, s[0]-7, s[1]-7], fill=(170, 70, 40, 255), outline=(60, 25, 10, 255), width=3)
guardar("mina.png", (32, 32), mina)
```

Ejecutar:
```bash
python tools/generar_texturas.py
```

Luego **reemplaza todas las URLs externas** en el proyecto:

| Antes | Después |
|---|---|
| `https://labs.phaser.io/assets/sprites/bullet.png` | `resources/img/bala.png` |
| `https://labs.phaser.io/assets/sprites/block.png` | `resources/img/caja.png` |
| `https://labs.phaser.io/assets/sprites/platform.png` | `resources/img/muro.png` |
| `https://labs.phaser.io/assets/sprites/orb-blue.png` | `resources/img/portal.png` |
| `https://labs.phaser.io/assets/sprites/bomb.png` | `resources/img/mina.png` |
| `https://labs.phaser.io/assets/tilemaps/tiles/gridtiles.png` | `resources/img/spritesheet-tiles-default.png` |
| `https://labs.phaser.io/assets/sprites/space-baddie.png` | `resources/img/tanqueAzul.png` / `tanqueVerde.png` |

**Alternativa si no hay Pillow:** descargar los archivos a mano desde el navegador y guardarlos en `resources/img/` con esos nombres.

✅ **Criterios de aceptación**
- `grep -rn "labs.phaser.io" --include=*.js .` no devuelve **ningún** resultado.
- El juego funciona con el WiFi apagado (salvo el `<script>` de Phaser, ver F0.9).

---

### F0.4 — Corregir el crash de la bala destruida

**Problema verificado en ejecución:**
```
balaAfterImpact: {active: false, body: false, scene: false}
reshoot: THREW: Cannot read properties of undefined (reading 'setVelocity')
```
Cada tanque tiene **una sola** bala reutilizable (`this.bala`). `impactoJugador()` la destruye con `bala.destroy()`, pero `intentarDisparo()` solo comprueba `!this.bala.active` — que sigue siendo `false` tras el `destroy()`. Al siguiente disparo, `this.bala.body` es `null` y explota.

**Solución:** nunca destruir la bala; solo desactivarla. Y blindar `desactivar()`.

`src/tanks/Bala.js` completo:

```js
class Bala extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBounce(1);
    this.setCollideWorldBounds(true);

    this.tiempoVida = null;
    this.desactivar();
  }

  disparar(x, y, angulo) {
    if (!this.body) return; // blindaje: nunca operar sobre un cuerpo destruido

    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.setScale(2);

    this.scene.physics.velocityFromRotation(angulo, 300, this.body.velocity);

    if (this.tiempoVida) this.tiempoVida.remove();
    this.tiempoVida = this.scene.time.delayedCall(15000, () => this.desactivar());
  }

  desactivar() {
    if (!this.body) return; // blindaje

    this.setActive(false);
    this.setVisible(false);
    this.body.stop();

    if (this.tiempoVida) {
      this.tiempoVida.remove();
      this.tiempoVida = null;
    }
  }
}
```

En `src/levels/level1.js`, **borra las 2 llamadas a `bala.destroy()`** (líneas ~243 y ~255). Deben quedar solo `bala.desactivar();`.

✅ **Criterios de aceptación**
- Jugar Nivel 1, matar al oponente, y **durante los 3 segundos previos al reinicio pulsar disparo repetidamente**: cero errores en consola.

---

### F0.5 — Dar teclas al `TanqueVerde` (Nivel 3)

**Problema verificado:** `STEP: Cannot read properties of undefined (reading 'izquierda')` **en cada frame**. `TanqueBase.actualizar()` lee `this.teclas`, que `TanqueVerde` nunca define.

En `src/tanks/Tanque.js`, dentro del constructor de `TanqueVerde`, añade **antes** de los listeners:

```js
this.teclas = scene.input.keyboard.addKeys({
  arriba: Phaser.Input.Keyboard.KeyCodes.W,
  abajo: Phaser.Input.Keyboard.KeyCodes.S,
  izquierda: Phaser.Input.Keyboard.KeyCodes.A,
  derecha: Phaser.Input.Keyboard.KeyCodes.D,
  disparo: Phaser.Input.Keyboard.KeyCodes.SPACE,
});

scene.input.keyboard.on("keydown-SPACE", this.intentarDisparo, this);
```

**Blindaje adicional** en `TanqueBase.actualizar()` (`src/tanks/Tanque.js`), primera línea del método:

```js
actualizar() {
  if (!this.teclas || !this.body) return;
  // ...resto igual
}
```

✅ **Criterios de aceptación**
- Entrar al Nivel 3: cero errores en consola tras 30 segundos jugando.
- El tanque verde se mueve con WASD y dispara con `ESPACIO`.

---

### F0.6 — Crear mapas base para los niveles 2 y 3

**Problema verificado:** `this.load.tilemapTiledJSON("mapa_nivel2", "ruta/mapa2.json")` — `"ruta/"` es un placeholder que nunca se reemplazó. El loader reporta el fallo y el nivel queda como un vacío negro.

**Solución:** generar los mapas desde texto ASCII, sin necesidad de instalar Tiled.

Crea `tools/generar_mapa.py`:

```python
# tools/generar_mapa.py
# Convierte un layout ASCII en un tilemap JSON compatible con Tiled + Phaser.
# Uso: python tools/generar_mapa.py
import json, os

# GIDs verificados del tileset spritesheet-tiles-default.png
GID_SUELO       = 143  # baldosa de suelo
GID_PARED       = 21   # muro tipo A
GID_PARED_ALT   = 28   # muro tipo B (variación visual)

SIMBOLOS = {".": 0, "#": GID_PARED, "=": GID_PARED_ALT}

TILESET = {
    "columns": 18, "firstgid": 1,
    "image": "spritesheet-tiles-default.png",
    "imageheight": 1169, "imagewidth": 1169,
    "margin": 0, "name": "spritesheet-tiles-default",
    "spacing": 1, "tilecount": 324,
    "tileheight": 64, "tilewidth": 64,
}

def capa(id_, nombre, data, w, h):
    return {"data": data, "height": h, "id": id_, "name": nombre,
            "opacity": 1, "type": "tilelayer", "visible": True,
            "width": w, "x": 0, "y": 0}

def generar(ruta_salida, filas, capas_extra=None):
    """filas: lista de strings de igual longitud. '.'=libre '#'/'='=pared"""
    h, w = len(filas), len(filas[0])
    assert all(len(f) == w for f in filas), "Todas las filas deben medir lo mismo"

    suelo = [GID_SUELO] * (w * h)
    paredes = [SIMBOLOS[c] for fila in filas for c in fila]

    layers = [capa(1, "Suelo", suelo, w, h), capa(2, "Paredes", paredes, w, h)]
    next_id = 3
    for nombre, simbolo, gid in (capas_extra or []):
        data = [gid if c == simbolo else 0 for fila in filas for c in fila]
        layers.append(capa(next_id, nombre, data, w, h))
        next_id += 1

    mapa = {
        "compressionlevel": -1, "height": h, "infinite": False,
        "layers": layers, "nextlayerid": next_id, "nextobjectid": 1,
        "orientation": "orthogonal", "renderorder": "right-down",
        "tiledversion": "1.12.1", "tileheight": 64,
        "tilesets": [TILESET], "tilewidth": 64,
        "type": "map", "version": "1.10", "width": w,
    }
    os.makedirs(os.path.dirname(ruta_salida), exist_ok=True)
    with open(ruta_salida, "w", encoding="utf-8") as f:
        json.dump(mapa, f, indent=1)
    libres = paredes.count(0)
    print(f"OK -> {ruta_salida}  ({w}x{h}, {libres} tiles libres)")


# ---------- NIVEL 2: "Sindicato de Neón" — cámaras separadas por bandas de muros ----------
# VALIDADO: 20x15 · simetría rotacional 180° · 174 tiles libres · 0 zonas aisladas · 0 callejones
MAPA2 = [
    "####################",
    "#..................#",
    "#.##..==....==..##.#",
    "#.##..==....==..##.#",
    "#..................#",
    "#...#####..#####...#",
    "#..................#",
    "#....####..####....#",
    "#..................#",
    "#...#####..#####...#",
    "#..................#",
    "#.##..==....==..##.#",
    "#.##..==....==..##.#",
    "#..................#",
    "####################",
]

# ---------- NIVEL 3: "Hijos del Páramo" — campo abierto con coberturas y barro ----------
# VALIDADO: 20x15 · simetría 180° · 202 libres · 34 de barro (16.8%) · conectado ·
#           las 168 casillas secas forman una única región (siempre hay ruta sin barro)
MAPA3 = [
    "####################",
    "#..................#",
    "#..##....~~~~....###",
    "#..##....~~~~....###",
    "#........~~~~......#",
    "#.===.....~~.....==#",
    "#..................#",
    "#...###~~~~~~###...#",
    "#..................#",
    "#==.....~~.....===.#",
    "#......~~~~........#",
    "###....~~~~....##..#",
    "###....~~~~....##..#",
    "#..................#",
    "####################",
]

if __name__ == "__main__":
    generar("resources/maps/mapa2.json", MAPA2)
    # El nivel 3 añade una capa "Barro" que Phaser lee para frenar al tanque.
    # '~' no es pared, así que hay que mapearlo a libre en la capa Paredes:
    MAPA3_LIMPIO = [f.replace("~", ".") for f in MAPA3]
    SIMBOLOS_BARRO = [("Barro", "~", GID_SUELO)]
    # generamos con paredes limpias pero usando el layout original para el barro
    h, w = len(MAPA3), len(MAPA3[0])
    suelo = [GID_SUELO] * (w * h)
    paredes = [SIMBOLOS[c] for fila in MAPA3_LIMPIO for c in fila]
    barro = [GID_SUELO if c == "~" else 0 for fila in MAPA3 for c in fila]
    mapa3 = {
        "compressionlevel": -1, "height": h, "infinite": False,
        "layers": [capa(1, "Suelo", suelo, w, h),
                   capa(2, "Barro", barro, w, h),
                   capa(3, "Paredes", paredes, w, h)],
        "nextlayerid": 4, "nextobjectid": 1,
        "orientation": "orthogonal", "renderorder": "right-down",
        "tiledversion": "1.12.1", "tileheight": 64,
        "tilesets": [TILESET], "tilewidth": 64,
        "type": "map", "version": "1.10", "width": w,
    }
    with open("resources/maps/mapa3.json", "w", encoding="utf-8") as f:
        json.dump(mapa3, f, indent=1)
    print("OK -> resources/maps/mapa3.json")
```

⚠️ **Cuidado:** en `MAPA2` y `MAPA3` todas las filas deben tener **exactamente 20 caracteres** y debe haber **15 filas**. El script falla con un `assert` si no es así — cuenta bien antes de ejecutar.

Ejecutar:
```bash
python tools/generar_mapa.py
```

**Validador de mapas** — úsalo cada vez que edites un layout ASCII (crea `tools/validar_mapa.py`):

```python
# tools/validar_mapa.py — comprueba dimensiones, simetría, conectividad y % de barro
from collections import deque
import sys

def validar(M, nombre, exigir_simetria=True, rango_barro=None):
    H, W = len(M), len(M[0])
    ok = True
    print(f"\n=== {nombre} ({W}x{H}) ===")

    malas = [i for i, f in enumerate(M) if len(f) != W]
    if malas: print(f"  ✗ Filas con longitud incorrecta: {malas}"); ok = False
    else:     print(f"  ✓ Todas las filas miden {W}")

    if exigir_simetria:
        asim = [(x, y) for y in range(H) for x in range(W) if M[y][x] != M[H-1-y][W-1-x]]
        if asim: print(f"  ✗ Simetría 180° rota en {len(asim)} celdas, ej. {asim[:5]}"); ok = False
        else:    print("  ✓ Simetría rotacional 180° correcta")

    libres = sum(1 for f in M for c in f if c in ".~")
    def flood(trans):
        ini = next((y, x) for y in range(H) for x in range(W) if trans(M[y][x]))
        vis, q = {ini}, deque([ini])
        while q:
            y, x = q.popleft()
            for dy, dx in ((1,0), (-1,0), (0,1), (0,-1)):
                ny, nx = y+dy, x+dx
                if 0 <= ny < H and 0 <= nx < W and (ny,nx) not in vis and trans(M[ny][nx]):
                    vis.add((ny,nx)); q.append((ny,nx))
        return len(vis)

    alc = flood(lambda c: c in ".~")
    if alc != libres: print(f"  ✗ {libres-alc} tiles aislados (inalcanzables)"); ok = False
    else:             print(f"  ✓ Los {libres} tiles libres están conectados")

    call = [(x,y) for y in range(1,H-1) for x in range(1,W-1) if M[y][x] in ".~"
            and sum(1 for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)) if M[y+dy][x+dx] in ".~") < 2]
    print(f"  {'✓' if not call else '⚠'} Callejones sin salida: {len(call)} {call[:5]}")

    if rango_barro:
        barro = sum(1 for f in M for c in f if c == "~")
        pct = barro / libres * 100
        lo, hi = rango_barro
        if lo <= pct <= hi: print(f"  ✓ Barro: {barro} tiles ({pct:.1f}%), dentro de {lo}-{hi}%")
        else:               print(f"  ✗ Barro: {pct:.1f}%, fuera del rango {lo}-{hi}%"); ok = False
        seco = sum(1 for f in M for c in f if c == ".")
        if flood(lambda c: c == ".") != seco:
            print("  ✗ Las zonas secas están fragmentadas: hay rutas donde el barro es obligatorio"); ok = False
        else:
            print("  ✓ Existe siempre una ruta alternativa sin barro")

    print(f"  → {nombre}: {'APTO' if ok else 'CORREGIR'}")
    return ok

def verificar_puntos(M, puntos, etiqueta):
    """Comprueba que ninguna coordenada de tile (col, fila) caiga en una pared."""
    print(f"\n--- {etiqueta} ---")
    for col, fila in puntos:
        libre = M[fila][col] in ".~"
        print(f"  tile ({col},{fila}) -> px ({col*64+32},{fila*64+32}) : "
              f"{'LIBRE ✓' if libre else 'DENTRO DE PARED ✗'}")

if __name__ == "__main__":
    from generar_mapa import MAPA2, MAPA3
    a = validar(MAPA2, "MAPA2 (Nivel 2)")
    verificar_puntos(MAPA2, [(1,1), (18,13), (18,1), (1,13)], "Portales del Nivel 2")
    b = validar(MAPA3, "MAPA3 (Nivel 3)", rango_barro=(15, 25))
    sys.exit(0 if (a and b) else 1)
```

Ejecutar tras cada edición de un mapa:
```bash
python tools/validar_mapa.py
```

> Los dos mapas incluidos arriba **ya pasan todas las validaciones**. Si los rediseñan (mejoras D1 y G2), vuelvan a ejecutar el validador antes de hacer commit.

Después, corregir las rutas en el código:
- `src/levels/level2.js`: `"ruta/mapa2.json"` → `"resources/maps/mapa2.json"`
- `src/levels/level3.js`: `"ruta/mapa3.json"` → `"resources/maps/mapa3.json"`

Y corregir el **nombre del tileset** en `addTilesetImage`, que debe coincidir exactamente con el campo `name` del JSON:
- `level2.js`: `mapa.addTilesetImage("Suelo", "tiles_nivel2")` → `mapa.addTilesetImage("spritesheet-tiles-default", "tiles_nivel2", 64, 64, 0, 1)`
- `level3.js`: `mapa.addTilesetImage("nombre_en_tiled", "tiles_nivel3")` → `mapa.addTilesetImage("spritesheet-tiles-default", "tiles_nivel3", 64, 64, 0, 1)`

> Los parámetros `64, 64, 0, 1` son `tileWidth, tileHeight, margin, spacing`. **El `spacing: 1` es obligatorio** en este tileset (1169 = 18×64 + 17×1); sin él los tiles salen desalineados.

✅ **Criterios de aceptación**
- Los 3 niveles muestran suelo y paredes.
- `game.cache.tilemap.getKeys()` en consola devuelve `["mapa_nivel1","mapa_nivel2","mapa_nivel3"]`.

---

### F0.7 — Centrar menú y pantalla de Game Over

**Problema verificado:** `gameSize: [1280, 960]` pero todos los textos en `x: 400`. Todo el menú vive en el cuadrante superior izquierdo.

En `src/menu.js` y `src/GameOver.js`, reemplaza los literales por el centro real. Al inicio de `create()`:

```js
const cx = this.scale.width / 2;   // 640
const cy = this.scale.height / 2;  // 480
```

Y sustituye las posiciones:

| Archivo | Antes | Después |
|---|---|---|
| `menu.js` | `(400, 100, "LABERINTO DE ACERO")` | `(cx, cy - 280, ...)` |
| `menu.js` | `(400, 250, "Jugar Nivel 1...")` | `(cx, cy - 80, ...)` |
| `menu.js` | `(400, 320, "Jugar Nivel 2...")` | `(cx, cy, ...)` |
| `menu.js` | `(400, 390, "Jugar Nivel 3...")` | `(cx, cy + 80, ...)` |
| `GameOver.js` | `(400, 200, "FIN DE LA PARTIDA")` | `(cx, cy - 180, ...)` |
| `GameOver.js` | `(400, 300, "Puntaje Total...")` | `(cx, cy - 60, ...)` |
| `GameOver.js` | `(400, 450, "[ VOLVER AL MENÚ ]")` | `(cx, cy + 120, ...)` |

✅ **Criterios de aceptación**
- Capturar el menú y verificar que el título está centrado horizontalmente.

---

### F0.8 — Arreglar el HUD de puntuación roto

**Problema verificado:** `Cannot read properties of undefined (reading 'setText')`. En `UIScene`, el objeto `this.textoPuntuacion` está comentado pero el listener que lo usa sigue vivo.

**Decisión:** el Nivel 1 ya tiene su propio marcador (`scoreRojo`/`scoreAzul`) dibujado dentro de la escena. `UIScene` es redundante y su sistema `puntuacion` no se incrementa en ninguna parte.

**Acción:** descomentar el texto para que la escena sea coherente:

```js
class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    this.registry.set("puntuacion", 0);

    this.textoPuntuacion = this.add.text(20, 20, "PUNTOS: 0", {
      fontSize: "24px",
      fill: "#ffffff",
      fontFamily: "monospace",
    });

    const alCambiar = (parent, valor) => {
      if (this.textoPuntuacion) this.textoPuntuacion.setText("PUNTOS: " + valor);
    };
    this.registry.events.on("changedata-puntuacion", alCambiar);

    // Limpieza obligatoria: el registry es global y sobrevive al cierre de la escena
    this.events.once("shutdown", () => {
      this.registry.events.off("changedata-puntuacion", alCambiar);
    });
  }
}
```

✅ **Criterios de aceptación**
- Ejecutar en consola `game.registry.set("puntuacion", 99)`: no lanza error.

---

### F0.9 — Higiene de assets y repositorio

1. **Renombrar** `resources/img/tanqueVerde - copia.png` → `resources/img/tanqueVerde.png`
   (los espacios en nombres de archivo causan problemas de URL en GitHub Pages).
   ```bash
   git mv "resources/img/tanqueVerde - copia.png" resources/img/tanqueVerde.png
   ```
2. **Borrar** `resources/img/tanqueRojoAntiguo.png` (verificado: cero referencias en el código).
3. **Optimizar los PNG de los tanques.** Se dibujan a 64×50 px pero los archivos son enormes:

   | Archivo | Real | Se usa a | Peso |
   |---|---|---|---|
   | `tanqueRojo.png` | 583×377 | 64×50 | 313 KB |
   | `tanqueAzul.png` | 588×374 | 64×50 | 327 KB |
   | `tanqueVerde.png` | 672×427 | 64×50 | 392 KB |

   Redimensionar a 128×96 (el doble del tamaño de uso, para pantallas HiDPI):
   ```python
   # tools/optimizar_sprites.py
   from PIL import Image
   for n in ["tanqueRojo", "tanqueAzul", "tanqueVerde"]:
       p = f"resources/img/{n}.png"
       img = Image.open(p).convert("RGBA")
       img.thumbnail((128, 96), Image.LANCZOS)
       img.save(p, optimize=True)
       print(n, "->", img.size)
   ```
   Esto baja ~1 MB a ~40 KB. **Importante:** después de esto, `setDisplaySize(64, 50)` sigue funcionando igual.

4. **Crear `.gitignore`:**
   ```gitignore
   node_modules/
   .DS_Store
   Thumbs.db
   *.log
   .vscode/
   .idea/
   ```
5. **Crear `.nojekyll`** (archivo vacío en la raíz). Evita que GitHub Pages procese el sitio con Jekyll e ignore carpetas que empiecen con `_`.
   ```bash
   touch .nojekyll
   ```
6. **Fijar Phaser con SRI** en `index.html` (buena práctica de seguridad; el script viene de un CDN de terceros):
   ```html
   <script
     src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"
     integrity="sha384-VJ+bLFo3wUJ0Zt/0nKHmMi9nrRDlrTuKt3l0PBFHDMsGxUC/DaWZDlGXW5j0z1t3"
     crossorigin="anonymous"
     referrerpolicy="no-referrer"></script>
   ```
   ⚠️ **Verifica el hash antes de usarlo.** Genera el correcto con:
   ```bash
   curl -sL https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js | openssl dgst -sha384 -binary | openssl base64 -A
   ```
   Si el hash no coincide, el navegador bloquea el script y el juego no carga. Si no puedes generarlo, **omite el atributo `integrity`** — es preferible sin SRI que con un SRI incorrecto.

7. **Limpiar los colliders muertos.** En `src/levels/level1.js`, `this.cajas` está comentado pero se usa en 4 colliders (verificado: `dead_colliders: 4`). O descomentas el grupo de cajas, o borras esos 4 colliders y el método `golpearCaja()`. **Recomendación:** descomentarlo — las cajas destructibles son buena cobertura táctica y ya está el arte (`resources/img/caja.png` de F0.3).

✅ **Criterios de aceptación**
- `git status` limpio tras los renombrados.
- Peso total de `resources/` < 300 KB.
- Cero warnings de assets faltantes en consola.

---

### F0.10 — Verificación de Fase 0

Antes de pasar a la Fase 1, **una persona** debe correr esta checklist completa:

```
[ ] python -m http.server 8777  → el juego carga en http://localhost:8777
[ ] Consola del navegador: 0 errores rojos, 0 peticiones 404
[ ] Menú centrado, los 3 botones responden al clic
[ ] Nivel 1: ambos tanques se mueven, disparan, mueren y la ronda reinicia
[ ] Nivel 1: disparar spam durante los 3s post-muerte → sin errores
[ ] Nivel 2: se ve el mapa, el tanque se mueve, los portales teletransportan
[ ] Nivel 3: se ve el mapa, el tanque verde se mueve con WASD y dispara
[ ] ESC devuelve al menú desde los 3 niveles
[ ] grep -rn "labs.phaser.io" --include=*.js .  → sin resultados
```

**Solo cuando los 9 puntos pasen, avisar al grupo que empieza la Fase 1.**

---

# FASE 1 — Playtesting (el examen)

> ⚠️ **Esta fase la juega una persona, no la IA.** Yo puedo instrumentar el juego, leer su estado y reproducir bugs, pero no puedo *sentir* que el tanque va pesado ni que un nivel aburre. Eso solo sale jugando.

## Tu parte (obligatoria)

1. Juega **el juego completo (Nivel 1 → 2 → 3) 3 veces consecutivas**.
2. Durante cada corrida anota **todo**: bugs, fricciones, cosas feas, cosas confusas.
3. No corrijas nada mientras juegas. Primero las 3 corridas, después se arregla.

Son unos 60–90 minutos en total y es la materia prima de las 9 mejoras. Hacerlo de verdad hace que el informe se escriba solo.

## Las bitácoras de David y Gabriel

El rubro pide 3 corridas **por integrante** y bitácoras individuales. Tú y yo escribimos el código, pero **jugar 3 partidas no requiere saber programar**: son ~20 minutos por persona.

**Recomendación:** pásales el enlace de GitHub Pages, que ya está activo —

```
https://eddy-castro.github.io/Proyecto_2B_JuegosInteractivos/
```

— y la plantilla de abajo. No necesitan instalar nada ni clonar el repo; abren el enlace y juegan. Con eso las tres bitácoras del GDD son reales y el informe de playtesting se sostiene solo.

Si al final no participan, esa es tu decisión y la del grupo; solo ten presente que el informe de playtesting es la sección que el rubro evalúa como examen, y unas bitácoras inventadas son fáciles de detectar cuando las tres suenan igual.

## Plantilla de bitácora

Crea un archivo por persona: `docs/bitacora_eddy.md`, `docs/bitacora_david.md`, `docs/bitacora_gabriel.md`.

```markdown
# Bitácora de Playtesting — [NOMBRE]
**Fecha:** __/__/____  ·  **Versión jugada (commit):** ________
**Equipo:** Windows 11 / Chrome 1xx / teclado ________

## Corrida 1
**Hora inicio:** __:__  ·  **Hora fin:** __:__  ·  **Duración total:** __ min

| # | Nivel | Categoría | Qué pasó (observación cruda) | Gravedad | Propuesta de mejora |
|---|-------|-----------|------------------------------|----------|---------------------|
| 1 | 1 | Game Feel | | Alta/Media/Baja | |
| 2 | | | | | |
| 3 | | | | | |

**Sensación general de la corrida (2-3 frases):**
> ...

## Corrida 2
_(misma tabla)_

## Corrida 3
_(misma tabla)_

## Top 5 problemas que más me molestaron
1.
2.
3.
4.
5.
```

**Categorías válidas** (las 6 del rubro): `Game Feel` · `Level Design` · `Música` · `SFX` · `Animaciones` · `UI/UX`

## Guía de observación (qué mirar, sin condicionar la respuesta)

Durante cada corrida, presta atención a:

- **Game Feel:** ¿el tanque responde rápido o se siente pesado? ¿frena bien? ¿disparar se siente potente o "flojo"? ¿la bala va muy lenta/rápida?
- **Level Design:** ¿hay zonas donde te quedas atascado? ¿esquinas donde no pasa el tanque? ¿el mapa es demasiado abierto o demasiado laberíntico? ¿los spawns son justos?
- **Música:** *(actualmente no hay ninguna)* — ¿el silencio afecta la experiencia?
- **SFX:** *(actualmente no hay ninguno)* — ¿te enteras de que disparaste? ¿de que te dieron?
- **Animaciones:** ¿el tanque se desliza raro? ¿la muerte es un simple "desaparece"? ¿los portales/minas tienen algún efecto?
- **UI/UX:** ¿sabes cuánto llevas de marcador? ¿sabes cuándo tu habilidad está lista? ¿sabes qué teclas usar? ¿sabes cuándo termina la partida?

## Hallazgos candidatos (de la auditoría técnica)

Estos ya están **verificados técnicamente** y sirven como respaldo del informe, pero **cada integrante debe confirmarlos jugando** y añadir los suyos propios:

| # | Nivel | Categoría | Hallazgo verificado |
|---|-------|-----------|---------------------|
| A | Todos | UI/UX | No hay condición de victoria: las rondas se repiten infinitamente |
| B | Todos | UI/UX | El marcador nunca se reinicia al volver al menú (una partida nueva arranca con puntos viejos) |
| C | Todos | UI/UX | Ninguna pantalla explica los controles |
| D | 1 | Game Feel | Los dos tanques se atraviesan entre sí (no hay colisión tanque↔tanque) |
| E | 1 | Level Design | Los spawns pueden coincidir: simulado en 2000 rondas → 11 en el mismo tile (0,55%) y 73 adyacentes (3,7%) |
| F | 1 | Game Feel | Solo se puede tener 1 bala en pantalla y dura 15 s rebotando; el ritmo se traba |
| G | 1 | UI/UX | El cooldown de las habilidades (10 s muro / 3 s dash) es invisible |
| H | Todos | SFX / Música | Ausencia total de audio |
| I | Todos | Animaciones | Morir = el sprite desaparece de golpe, sin explosión |
| J | 2 | Game Feel | El jugador muere con su propia bala y no hay oponente: única forma de terminar |
| K | 2 | Animaciones | El teletransporte es instantáneo, sin feedback visual |
| L | 3 | Game Feel | La mecánica de barro y minas no es perceptible para el jugador |

---

# FASE 2 — Consolidación

Media hora de trabajo, tú solo:

1. Junta tu bitácora con las de David y Gabriel (si las hicieron) en `docs/hallazgos_consolidados.md`, eliminando duplicados.
2. Añade una columna **"reportado por N de 3"**: lo que aparece en las tres bitácoras es lo más crítico y lo que mejor argumenta el informe.
3. Contrasta con los 12 hallazgos técnicos (A–L) de la Fase 1. Si algo que verifiqué en el código **no** te molestó jugando, dilo en el informe: "detectado técnicamente, sin impacto perceptible" es una observación válida y demuestra criterio.
4. Cierra la lista de las 9 mejoras y confirma que **las 6 categorías del rubro están cubiertas** (ninguna puede quedar vacía).

> 📌 La Fase 3 ya trae las 9 mejoras definidas y balanceadas: 3 por integrante, 6 categorías cubiertas, y ordenadas por dependencia técnica. Puedes cambiar cuáles son —de hecho **deberías**, si tu playtesting encontró algo que pesa más— pero mantén esas dos restricciones.

**Si sustituyes una mejora por otra**, comprueba antes:
- ¿Sigue habiendo 3 por integrante?
- ¿Sigue cubierta la categoría que dejas vacía? (si quitas la única de "Música", el rubro te penaliza)
- ¿Dónde encaja en el orden de ejecución? Si toca `Bala.js` o `Tanque.js`, va temprano.

---

# FASE 3 — Las 9 mejoras

**Cobertura de categorías:** Game Feel ✅ · Level Design ✅ · Música ✅ · SFX ✅ · Animaciones ✅ · UI/UX ✅

| Orden | ID | Atribución (GDD) | Categoría | Mejora |
|:---:|----|------------------|-----------|--------|
| 1 | **E1** | Eddy | Game Feel | Combate con peso: retroceso, screen shake, munición múltiple |
| 2 | **G1** | Gabriel | Game Feel | Mecánica de minas y barro perceptible y balanceada |
| 3 | **D2** | David | Game Feel | Nivel 2 jugable a 2 jugadores |
| 4 | **G2** | Gabriel | Level Design | Diseño real del Nivel 3 con zonas de barro legibles |
| 5 | **D1** | David | Level Design | Diseño real del Nivel 2 con portales integrados |
| 6 | **E2** | Eddy | UI/UX | HUD completo: cooldowns, condición de victoria, pantalla de controles |
| 7 | **E3** | Eddy | SFX | Sistema de efectos de sonido |
| 8 | **G3** | Gabriel | Música | Sistema de música persistente con fade |
| 9 | **D3** | David | Animaciones | VFX de teletransporte y estelas de oruga |

⚠️ **Impleméntalas en la columna "Orden", no en orden alfabético.** Las secciones de abajo están agrupadas por atribución (E, D, G) porque así se leen mejor y así van al GDD — pero el orden de ejecución es el de esta tabla. Saltárselo obliga a rehacer trabajo (ver *Orden de ejecución* en la sección 0).

---

## 👤 EDDY

### E1 — Game Feel: combate con peso

**Problema observado:** disparar no se siente potente; solo se puede tener 1 bala en pantalla y dura 15 s rebotando, lo que traba el ritmo del duelo.

**Archivos:** `src/tanks/Bala.js`, `src/tanks/Tanque.js`, `src/levels/level1.js`, `src/levels/level2.js`, `src/levels/level3.js`

> ⚠️ **`level2.js` y `level3.js` también hay que tocarlos.** El cambio de `this.bala` (sprite único) a `this.balas` (grupo) rompe todos los colliders que referencian `.bala`, y esos dos niveles también los tienen. No basta con `level1.js`.

**Implementación:**

**1. Pool de balas (3 por tanque en vez de 1).** En `TanqueBase`, reemplaza `this.bala` por un grupo:

```js
// En el constructor de TanqueBase, sustituye las 2 líneas de this.bala:
this.balas = scene.physics.add.group({
  classType: Bala,
  maxSize: 3,
  runChildUpdate: false,
});
for (let i = 0; i < 3; i++) {
  const b = new Bala(scene, 0, 0, "bala");
  this.balas.add(b, true);
  b.desactivar();
}
this.tiempoUltimoDisparo = 0;
this.cadenciaMs = 400; // cooldown entre disparos
```

**1b. Velocidad base para las mejoras G1 y G2.** En **cada subclase** de tanque (`TanqueRojo`, `TanqueAzul`, `TanqueVerde`), justo después de su `setMaxVelocity(N)`, guarda ese valor en una propiedad:

```js
this.setMaxVelocity(100);      // el N de cada tanque: 100 / 250 / 350
this.velocidadMaximaBase = 100; // misma N — la leen las minas (G1) y el barro (G2/G3)
```

> Por qué aquí: G1 (minas) y G2/G3 (barro) restauran la velocidad tras penalizarla. Sin esta propiedad recurren a un `350` hardcodeado que es incorrecto para el rojo (100) y el azul (250). E1 es quien la introduce porque es la primera mejora que toca `Tanque.js`.

**2. `intentarDisparo()` con cadencia y retroceso:**

```js
intentarDisparo() {
  const ahora = this.scene.time.now;
  if (ahora < this.tiempoUltimoDisparo + this.cadenciaMs) return;

  const bala = this.balas.getChildren().find((b) => !b.active);
  if (!bala) return; // las 3 balas están en vuelo

  this.tiempoUltimoDisparo = ahora;

  const distancia = 35;
  const balaX = this.x + Math.cos(this.rotation) * distancia;
  const balaY = this.y + Math.sin(this.rotation) * distancia;
  bala.disparar(balaX, balaY, this.rotation);

  // RETROCESO: empuja el tanque hacia atrás
  const retroceso = 120;
  this.scene.physics.velocityFromRotation(
    this.rotation + Math.PI, retroceso, this.body.velocity
  );

  // SCREEN SHAKE corto
  this.scene.cameras.main.shake(80, 0.004);

  // FOGONAZO: destello que se desvanece
  const flash = this.scene.add.circle(balaX, balaY, 14, 0xffdd55, 0.9).setDepth(50);
  this.scene.tweens.add({
    targets: flash, scale: 0, alpha: 0, duration: 120,
    onComplete: () => flash.destroy(),
  });

  if (this.scene.audio) this.scene.audio.reproducir("disparo");
}
```

**3. Límite de rebotes.** En `Bala.js` añade contador y en el nivel registra los rebotes contra paredes:

```js
// En Bala.disparar(), tras setScale(2):
this.rebotes = 0;
this.maxRebotes = 4;

// Método nuevo en Bala:
registrarRebote() {
  this.rebotes++;
  if (this.rebotes > this.maxRebotes) this.desactivar();
}
```
```js
// En level1.js configurarColisiones(), cambia el collider bala-pared:
this.physics.add.collider(this.jugador.balas, this.capaParedes, (bala) => {
  bala.registrarRebote();
  if (this.audio) this.audio.reproducir("rebote");
});
```
Baja el `delayedCall` de vida de la bala de `15000` a `6000` ms.

**4. Impacto con peso.** En `impactoJugador()`, antes de `disableBody`:
```js
this.cameras.main.shake(250, 0.012);
this.cameras.main.flash(120, 255, 80, 80);
```

⚠️ **Ojo:** al cambiar `this.bala` por `this.balas`, **hay que actualizar todos los colliders** que referencian `.bala` — no solo en `level1.js` (`configurarColisiones()`, ~8 referencias), también en `level2.js` y `level3.js`. Búscalas TODAS con:
```bash
grep -rn "\.bala" src/levels/ src/tanks/
```
Un `.bala` sin migrar a `.balas` deja un collider apuntando a `undefined`, que Phaser tolera en silencio: no verás un error, pero esa colisión simplemente no ocurrirá.

✅ **Criterios de aceptación**
- Se pueden tener 3 balas simultáneas por tanque.
- Al disparar: el tanque retrocede visiblemente, la cámara tiembla, aparece un fogonazo.
- Las balas desaparecen tras 4 rebotes o 6 segundos.
- Cero errores en consola tras 3 minutos de juego intenso.

---

### E2 — UI/UX: HUD completo y condición de victoria

**Problema observado:** el jugador no sabe cuándo su habilidad está lista, no sabe qué teclas usar, y la partida no termina nunca.

**Archivos:** `src/ui/HUD.js` (nuevo), `src/levels/level1.js`, `src/menu.js`, `src/GameOver.js`

**Implementación:**

**1. Pantalla de controles en el menú.** En `src/menu.js`, tras los botones de nivel:

```js
this.add.text(cx, cy + 200,
  "CONTROLES\n" +
  "ROJO:  W A S D  ·  ESPACIO disparar  ·  E muro\n" +
  "AZUL:  ↑ ← ↓ →  ·  M disparar  ·  N dash\n" +
  "ESC: volver al menú",
  { fontSize: "20px", fill: "#aaaaaa", align: "center", lineSpacing: 8 }
).setOrigin(0.5);
```

**2. Barras de cooldown.** Crea `src/ui/HUD.js`:

```js
class BarraCooldown {
  constructor(scene, x, y, color, ancho = 120, alto = 10) {
    this.scene = scene;
    this.x = x; this.y = y;
    this.ancho = ancho; this.alto = alto; this.color = color;

    this.fondo = scene.add.rectangle(x, y, ancho, alto, 0x222222)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.relleno = scene.add.rectangle(x, y, ancho, alto, color)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.etiqueta = scene.add.text(x, y - 18, "HABILIDAD", {
      fontSize: "14px", fill: "#ffffff", fontFamily: "monospace",
    }).setScrollFactor(0).setDepth(101);
  }

  // progreso: 0 = recién usada, 1 = lista
  actualizar(progreso) {
    const p = Phaser.Math.Clamp(progreso, 0, 1);
    this.relleno.width = this.ancho * p;
    this.relleno.fillColor = p >= 1 ? this.color : 0x666666;
    this.etiqueta.setText(p >= 1 ? "HABILIDAD LISTA" : "RECARGANDO...");
  }
}
```

En `level1.js` `create()`, tras crear los tanques:
```js
this.barraRojo = new BarraCooldown(this, 30, 110, 0xff3333);
this.barraAzul = new BarraCooldown(this, this.cameras.main.width - 150, 110, 0x3366ff);
```
En `level1.js` `update()`:
```js
const progreso = (tanque, duracionMs) => {
  const restante = tanque.tiempoHabilidad - this.time.now;
  return restante <= 0 ? 1 : 1 - restante / duracionMs;
};
if (this.jugador?.active)  this.barraRojo.actualizar(progreso(this.jugador, 10000));
if (this.jugador1?.active) this.barraAzul.actualizar(progreso(this.jugador1, 3000));
```

**3. Condición de victoria (primero a 5 rondas).** En `evaluarRonda()` de `level1.js`, antes del `this.scene.restart()`:

```js
const META = 5;
const nuevoRojo = this.registry.get("scoreRojo") || 0;
const nuevoAzul = this.registry.get("scoreAzul") || 0;

if (nuevoRojo >= META || nuevoAzul >= META) {
  this.registry.set("ganador", nuevoRojo >= META ? "ROJO" : "AZUL");
  this.scene.stop("UIScene");
  this.scene.start("GameOverScene");
  return;
}
this.scene.restart();
```

**4. Reinicio del marcador.** El marcador vive en el registry global y nunca se limpia. Añade en `MenuScene.iniciarNivel()`, como primera línea:
```js
this.registry.set("scoreRojo", 0);
this.registry.set("scoreAzul", 0);
this.registry.set("ganador", null);
```

**5. Pantalla de Game Over con ganador.** En `src/GameOver.js`:
```js
const ganador = this.registry.get("ganador");
const r = this.registry.get("scoreRojo") || 0;
const a = this.registry.get("scoreAzul") || 0;

this.add.text(cx, cy - 180, ganador ? `¡GANA EL TANQUE ${ganador}!` : "FIN DE LA PARTIDA", {
  fontSize: "56px",
  fill: ganador === "ROJO" ? "#ff3333" : "#3366ff",
  fontStyle: "bold", stroke: "#000000", strokeThickness: 8,
}).setOrigin(0.5);

this.add.text(cx, cy - 60, `ROJO ${r}  —  ${a} AZUL`, {
  fontSize: "40px", fill: "#ffffff", fontFamily: "monospace",
}).setOrigin(0.5);
```

⚠️ Añade también un texto grande en pantalla al ganar cada ronda ("¡RONDA PARA ROJO!") durante los 3 s de espera — hoy no hay ningún aviso.

✅ **Criterios de aceptación**
- Las barras de cooldown se vacían al usar la habilidad y se llenan progresivamente.
- La partida termina a las 5 rondas y muestra el ganador correcto.
- Volver al menú y empezar otra partida arranca en 0–0.
- Los controles son visibles en el menú.

---

### E3 — SFX: sistema de efectos de sonido

**Problema observado:** silencio total; no hay retroalimentación auditiva de ninguna acción.

**Archivos:** `src/audio/AudioManager.js`, `src/BootScene.js`, `resources/audio/`

**Obtener los sonidos:** descarga de **Kenney.nl** (licencia CC0, uso libre sin atribución):
- https://kenney.nl/assets/impact-sounds
- https://kenney.nl/assets/sci-fi-sounds

Guarda en `resources/audio/` con estos nombres exactos (formato `.ogg` o `.mp3`):

| Archivo | Cuándo suena |
|---|---|
| `disparo.ogg` | Al disparar |
| `rebote.ogg` | Bala contra pared |
| `explosion.ogg` | Tanque destruido |
| `habilidad.ogg` | Muro / dash / mina |
| `portal.ogg` | Teletransporte (Nivel 2) |
| `mina.ogg` | Detonación de mina (Nivel 3) |
| `ronda.ogg` | Fin de ronda |

**Implementación de `src/audio/AudioManager.js`:**

```js
class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.volumen = 0.5;
    this.silenciado = false;
    this.ultimaVez = {};      // anti-spam por clave
    this.intervaloMin = 60;   // ms mínimos entre dos sonidos iguales
  }

  reproducir(clave, config = {}) {
    if (this.silenciado) return;
    if (!this.scene.cache.audio.exists(clave)) {
      console.warn("[AudioManager] Sonido no encontrado:", clave);
      return;
    }
    const ahora = this.scene.time.now;
    if (this.ultimaVez[clave] && ahora - this.ultimaVez[clave] < this.intervaloMin) return;
    this.ultimaVez[clave] = ahora;

    this.scene.sound.play(clave, {
      volume: (config.volume ?? 1) * this.volumen,
      detune: config.detune ?? Phaser.Math.Between(-150, 150), // variación de tono
    });
  }

  alternarSilencio() {
    this.silenciado = !this.silenciado;
    this.scene.sound.mute = this.silenciado;
    return this.silenciado;
  }
}
```

**Cargar en `BootScene.preload()`:**
```js
["disparo", "rebote", "explosion", "habilidad", "portal", "mina", "ronda"]
  .forEach((k) => this.load.audio(k, `resources/audio/${k}.ogg`));
```

**Instanciar en cada nivel**, primera línea de `create()`:
```js
this.audio = new AudioManager(this);
```

**Puntos de llamada** (búscalos e insértalos):

| Archivo | Dónde | Llamada |
|---|---|---|
| `Tanque.js` | `intentarDisparo()` | `this.scene.audio?.reproducir("disparo")` |
| `Tanque.js` | `activarMuro()` / `activarDash()` | `this.scene.audio?.reproducir("habilidad")` |
| `level1.js` | collider bala↔pared | `this.audio?.reproducir("rebote", {volume: 0.4})` |
| `level1.js` | `impactoJugador()` | `this.audio?.reproducir("explosion")` |
| `level1.js` | `evaluarRonda()` | `this.audio?.reproducir("ronda")` |
| `level2.js` | `usarPortal()` | `this.audio?.reproducir("portal")` |
| `level3.js` | `pisarMina()` | `this.audio?.reproducir("mina")` |

**Tecla de silencio.** En cada nivel, dentro de `create()`:
```js
this.input.keyboard.on("keydown-P", () => {
  const s = this.audio.alternarSilencio();
  console.log(s ? "Audio silenciado" : "Audio activado");
});
```

⚠️ **Los navegadores bloquean el audio hasta la primera interacción del usuario.** Como se entra a los niveles con un clic en el menú, esto ya está resuelto. Si aparece el warning `The AudioContext was not allowed to start`, añade en `MenuScene.create()`:
```js
this.input.once("pointerdown", () => {
  if (this.sound.context.state === "suspended") this.sound.context.resume();
});
```

✅ **Criterios de aceptación**
- Cada acción (disparo, rebote, explosión, habilidad) produce un sonido distinto.
- Disparo continuo no satura el audio (el anti-spam funciona).
- `P` silencia y reactiva.
- Cero warnings de `AudioContext` en consola.

---

## 👤 DAVID

### D1 — Level Design: diseño real del Nivel 2

**Problema observado:** el Nivel 2 es un vacío negro; el mapa nunca existió (`ruta/mapa2.json`).

**Archivos:** `resources/maps/mapa2.json`, `tools/generar_mapa.py`, `src/levels/level2.js`

**Nota:** la Fase 0 (`F0.6`) ya generó un mapa base **funcional pero genérico**: una arena simétrica con pilares y bandas de muro. Cumple las validaciones técnicas, pero no tiene intención de diseño. **Esta mejora es rediseñarlo de verdad.**

**Concepto: "Sindicato de Neón"** — mapa de pasillos estrechos y cámaras cerradas, donde los portales son la única forma rápida de cruzar de un lado al otro. Debe contrastar con el Nivel 1 (más abierto): si al jugarlo se siente igual que el Nivel 1, el rediseño no cumplió su objetivo.

**Reglas de diseño a cumplir:**
1. **Simetría rotacional de 180°**: lo que hay arriba-izquierda debe estar abajo-derecha. Garantiza que ningún jugador tenga ventaja de spawn.
2. **Mínimo 2 rutas** entre cualquier par de zonas (evita callejones sin salida donde te acorralan).
3. **Pasillos de mínimo 2 tiles de ancho** en las rutas principales (el tanque mide 64 px = 1 tile; con 1 tile de ancho es imposible girar).
4. **4 portales** en pares (A↔B, C↔D), colocados en esquinas opuestas.
5. **Zonas de spawn** protegidas: al menos 3 tiles libres alrededor.

Edita `MAPA2` en `tools/generar_mapa.py` y regenera. Documenta el diseño con un diagrama para el GDD.

**Colocar los portales por coordenada de tile** (más mantenible que píxeles sueltos). En `level2.js` `create()`:

```js
// Portales definidos en coordenadas de TILE (col, fila), no en píxeles
const T = 64, MITAD = 32;
const aMundo = (col, fila) => ({ x: col * T + MITAD, y: fila * T + MITAD });

// VERIFICADO contra MAPA2: los 4 tiles están libres
const PARES_PORTAL = [
  [{ col: 1,  fila: 1  }, { col: 18, fila: 13 }],  // Par A: esquina sup-izq <-> inf-der
  [{ col: 18, fila: 1  }, { col: 1,  fila: 13 }],  // Par B: esquina sup-der <-> inf-izq
];

this.portales = this.physics.add.staticGroup();
PARES_PORTAL.forEach(([a, b]) => {
  const pa = aMundo(a.col, a.fila), pb = aMundo(b.col, b.fila);
  this.portales.add(new Teletransportador(this, pa.x, pa.y, pb.x, pb.y));
  this.portales.add(new Teletransportador(this, pb.x, pb.y, pa.x, pa.y));
});
```

⚠️ **Verifica que ningún portal caiga sobre una pared.** Añade este chequeo temporal en `create()`:
```js
this.portales.getChildren().forEach((p) => {
  const t = capaParedes?.getTileAtWorldXY(p.x, p.y);
  if (t && t.index !== -1) console.error("¡Portal dentro de una pared!", p.x, p.y);
});
```

✅ **Criterios de aceptación**
- El mapa es visiblemente distinto al del Nivel 1 (pasillos, no campo abierto).
- Simetría rotacional verificable a ojo.
- Ningún portal está dentro de una pared.
- Se puede recorrer todo el mapa sin quedarse atascado (probar 3 minutos).

---

### D2 — Game Feel: Nivel 2 jugable de verdad

**Problema observado:** el Nivel 2 tiene un solo tanque, sin oponente, y el jugador muere con su propia bala. No es un nivel, es una demo rota.

**Archivos:** `src/levels/level2.js`, `src/entities/Teletransportador.js`, `src/utils/spawn.js` (nuevo), `src/levels/level1.js`, `index.html`

> 📝 **Notas de ejecución (verificadas tras implementar):**
> - **La utilidad de spawn se extrajo como funciones sueltas, no métodos.** El código de abajo las muestra como `this.obtenerPuntoSpawnValido(...)`, pero en la práctica se sacaron a `src/utils/spawn.js` como funciones globales (`obtenerPuntoSpawnValido(mapa, capa)`, sin `this.`) y se añadió `<script src="src/utils/spawn.js">` **como primer script** de `index.html`. Level1, Level2 y Level3 las comparten. Si dejas ese `<script>` fuera, los tres niveles crashean con `obtenerPuntoSpawnValido is not defined`.
> - **Bug de límites del mundo corregido de paso (hallazgo C2 del playtesting).** El `level2.js` de la Fase 0 fijaba `physics.world.setBounds(0,0,800,600)` sobre un mapa de 1280×960, dejando el 61 % inaccesible. Se cambió a `mapa.widthInPixels/heightInPixels`, como el Nivel 1. Lo mismo aplica al Nivel 3 (lo corrige G2).
> - **La colisión tanque↔tanque del Nivel 3 queda escrita pero inactiva hasta G2.** D2 solo puede activarla en Nivel 1 y 2, porque el 2.º jugador del Nivel 3 lo añade **G2**. No intentes "cerrar" ese punto en D2: déjalo condicionado (`if (this.jugador1) ...`) y que G2 lo complete.

**Implementación:**

**1. Dos jugadores, igual que el Nivel 1.** Reemplaza el único `this.jugador` por:
```js
const spawnA = this.obtenerPuntoSpawnValido(mapa, capaParedes);
const spawnB = this.obtenerPuntoSpawnValidoLejos(mapa, capaParedes, spawnA, 400);
this.jugador  = new TanqueRojo(this, spawnA.x, spawnA.y, "tanque_rojo");
this.jugador1 = new TanqueAzul(this, spawnB.x, spawnB.y, "tanque_azul");
```

**2. Spawns que no se solapan** (resuelve el hallazgo E de la bitácora: 0,55 % de partidas con spawn idéntico). Añade a `level2.js` (y compártelo con Eddy para `level1.js`):

```js
obtenerPuntoSpawnValido(mapa, capaParedes) {
  const puntos = [];
  for (let y = 0; y < mapa.height; y++) {
    for (let x = 0; x < mapa.width; x++) {
      const tile = capaParedes.getTileAt(x, y);
      if (!tile || tile.index === -1) {
        puntos.push({
          x: x * mapa.tileWidth + mapa.tileWidth / 2,
          y: y * mapa.tileHeight + mapa.tileHeight / 2,
        });
      }
    }
  }
  return Phaser.Utils.Array.GetRandom(puntos);
}

// Garantiza distancia mínima respecto a otro punto
obtenerPuntoSpawnValidoLejos(mapa, capaParedes, otro, distanciaMin) {
  for (let intento = 0; intento < 60; intento++) {
    const p = this.obtenerPuntoSpawnValido(mapa, capaParedes);
    if (Phaser.Math.Distance.Between(p.x, p.y, otro.x, otro.y) >= distanciaMin) return p;
  }
  // Fallback: si el mapa es muy pequeño, devuelve el más lejano que encuentre
  return this.obtenerPuntoSpawnValido(mapa, capaParedes);
}
```

**3. Cooldown de portal por jugador, no global.** El `Teletransportador` actual usa un flag único (`this.enCooldown`), así que si un jugador usa el portal, **el otro no puede usarlo durante 1 segundo**. Además hay un bug de rebote: al aparecer en el portal destino, ese portal te devuelve. Reescribe `src/entities/Teletransportador.js`:

```js
class Teletransportador extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, destinoX, destinoY) {
    super(scene, x, y, "portal");
    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.destinoX = destinoX;
    this.destinoY = destinoY;
    this.cooldownPorJugador = new Map(); // jugador -> timestamp
  }

  teletransportar(jugador) {
    const ahora = this.scene.time.now;
    const listo = this.cooldownPorJugador.get(jugador) || 0;
    if (ahora < listo) return;

    // Bloquea AMBOS extremos para este jugador (evita el rebote infinito)
    const BLOQUEO = 1200;
    this.scene.portales.getChildren().forEach((p) => {
      p.cooldownPorJugador.set(jugador, ahora + BLOQUEO);
    });

    jugador.setPosition(this.destinoX, this.destinoY);
    this.scene.audio?.reproducir("portal");
    if (this.scene.efectoTeletransporte) this.scene.efectoTeletransporte(jugador);
  }
}
```

**4. Colisiones completas.** Copia el bloque `configurarColisiones()` del Nivel 1 adaptado, y **elimina el collider suicida** `bala ↔ jugador propio` que hoy manda directo a `GameOverScene`. El Nivel 2 debe usar el mismo sistema de rondas que el Nivel 1.

**5. Colisión tanque↔tanque** (resuelve el hallazgo D):
```js
this.physics.add.collider(this.jugador, this.jugador1);
```
Añádelo también en `level1.js` y `level3.js` — coordínalo con Eddy y Gabriel.

✅ **Criterios de aceptación**
- Dos jugadores controlables simultáneamente en el Nivel 2.
- Los dos pueden usar el mismo portal sin bloquearse.
- Entrar a un portal **no** provoca rebote infinito de ida y vuelta.
- Los tanques ya no se atraviesan.
- Los spawns siempre están a ≥ 400 px de distancia (probar 20 reinicios).

---

### D3 — Animaciones: VFX de teletransporte y estelas

**Problema observado:** el teletransporte es un salto instantáneo sin ningún aviso; no se entiende qué pasó.

**Archivos:** `src/levels/level2.js`, `src/entities/Teletransportador.js`

**Implementación:**

**1. Animación de teletransporte (encoger → aparecer → expandir).** Añade a `Level2`:

```js
efectoTeletransporte(jugador) {
  // Onda expansiva en el origen
  const onda = this.add.circle(jugador.x, jugador.y, 10, 0x40a0ff, 0.7).setDepth(60);
  this.tweens.add({
    targets: onda, radius: 80, alpha: 0, duration: 350,
    onComplete: () => onda.destroy(),
  });

  // El tanque se encoge y vuelve a su tamaño
  jugador.setScale(0.2);
  this.tweens.add({
    targets: jugador, scaleX: 1, scaleY: 1,
    duration: 250, ease: "Back.easeOut",
  });

  // Destello de cámara
  this.cameras.main.flash(120, 60, 160, 255);
}
```

⚠️ **Cuidado con `setScale` sobre un sprite que usa `setDisplaySize(64, 50)`.** `setDisplaySize` ya modifica la escala internamente. Guarda la escala original en `TanqueBase` y restáurala:
```js
// En el constructor de TanqueBase, tras setDisplaySize(64, 50):
this.escalaBase = { x: this.scaleX, y: this.scaleY };
```
y en el tween usa `scaleX: jugador.escalaBase.x, scaleY: jugador.escalaBase.y`.

**2. Portales animados** (pulso continuo). En el constructor de `Teletransportador`:
```js
this.setDepth(5);
scene.tweens.add({
  targets: this, scale: { from: 0.9, to: 1.15 }, alpha: { from: 0.75, to: 1 },
  duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut",
});
```

**3. Estela de orugas.** Marca de rodadura que se desvanece detrás del tanque. En `TanqueBase`, método nuevo:

```js
dejarEstela() {
  if (!this.body) return;
  const vel = this.body.velocity.length();
  if (vel < 30) return; // solo si se mueve
  if (this.scene.time.now < (this.proximaEstela || 0)) return;
  this.proximaEstela = this.scene.time.now + 70;

  const marca = this.scene.add.rectangle(this.x, this.y, 30, 8, 0x000000, 0.28)
    .setRotation(this.rotation).setDepth(1);
  this.scene.tweens.add({
    targets: marca, alpha: 0, duration: 1500,
    onComplete: () => marca.destroy(),
  });
}
```
Llámalo desde `actualizar()`, al final: `this.dejarEstela();`

**4. Explosión al morir** (resuelve el hallazgo I). En `impactoJugador()` de cada nivel:
```js
const explosion = this.add.circle(victima.x, victima.y, 15, 0xff8800, 1).setDepth(70);
this.tweens.add({
  targets: explosion, radius: 90, alpha: 0, duration: 450, ease: "Cubic.easeOut",
  onComplete: () => explosion.destroy(),
});
for (let i = 0; i < 12; i++) {
  const ang = (Math.PI * 2 * i) / 12;
  const frag = this.add.rectangle(victima.x, victima.y, 6, 6, 0xffaa33).setDepth(70);
  this.tweens.add({
    targets: frag,
    x: victima.x + Math.cos(ang) * Phaser.Math.Between(60, 140),
    y: victima.y + Math.sin(ang) * Phaser.Math.Between(60, 140),
    alpha: 0, duration: 600, onComplete: () => frag.destroy(),
  });
}
```

⚠️ **Rendimiento:** limita las estelas. Si `this.children.list.length > 300`, deja de generarlas. Comprueba con el contador de FPS (`game.loop.actualFps` en consola) que no baje de 55.

✅ **Criterios de aceptación**
- El teletransporte tiene onda, cambio de escala y flash.
- Los portales pulsan continuamente.
- Los tanques dejan huella visible al moverse, que se desvanece.
- Morir produce explosión con fragmentos.
- FPS ≥ 55 con los 2 tanques moviéndose y 6 balas en pantalla.

---

## 👤 GABRIEL

### G1 — Game Feel: minas y barro perceptibles

**Problema observado:** el Nivel 3 no arrancaba (crash por `teclas`), y sus dos mecánicas propias (minas, barro) no se comunican al jugador: no se ve, no se oye, no se entiende.

**Archivos:** `src/entities/MinaOxido.js`, `src/tanks/Tanque.js` (`TanqueVerde`), `src/levels/level3.js`

**Implementación:**

**1. Minas visibles con fase de armado.** Reescribe `src/entities/MinaOxido.js`:

```js
class MinaOxido extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, propietario) {
    super(scene, x, y, "mina");
    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.propietario = propietario;
    this.armada = false;
    this.setDepth(3);
    this.setScale(0.6);

    // Fase de armado: 1.5 s parpadeando en rojo, aún inofensiva
    this.setTint(0x884444);
    const parpadeo = scene.tweens.add({
      targets: this, alpha: { from: 1, to: 0.35 },
      duration: 200, yoyo: true, repeat: -1,
    });

    scene.time.delayedCall(1500, () => {
      parpadeo.stop();
      this.armada = true;
      this.setAlpha(1);
      this.clearTint();
      // Pulso lento = está lista
      scene.tweens.add({
        targets: this, scale: { from: 0.6, to: 0.72 },
        duration: 700, yoyo: true, repeat: -1,
      });
    });

    // Autodestrucción a los 20 s para no llenar el mapa
    scene.time.delayedCall(20000, () => { if (this.active) this.destroy(); });

    // El cuerpo estático NO sigue al setScale/tween anteriores: refresca su
    // hitbox para que coincida con el tamaño visual (opcional pero recomendado).
    this.refreshBody();
  }

  detonar(jugador) {
    if (!this.armada) return;
    if (jugador === this.propietario) return; // no te matan tus propias minas

    const escena = jugador.scene;
    escena.audio?.reproducir("mina");
    escena.cameras.main.shake(300, 0.015);

    // VFX de detonación
    const humo = escena.add.circle(this.x, this.y, 12, 0x996644, 0.85).setDepth(60);
    escena.tweens.add({
      targets: humo, radius: 100, alpha: 0, duration: 600,
      onComplete: () => humo.destroy(),
    });

    // EFECTO: ralentiza al enemigo 3 segundos
    const velNormal = jugador.velocidadMaximaBase || 350;
    jugador.setMaxVelocity(velNormal * 0.2);
    jugador.setTint(0x996644);

    escena.time.delayedCall(3000, () => {
      if (!jugador.active || !jugador.body) return;
      jugador.setMaxVelocity(velNormal);
      jugador.clearTint();
    });

    this.destroy();
  }
}
```

⚠️ **Bug de la versión original:** `detonar()` hacía `this.destroy()` **antes** de usar `jugador.scene`, y hardcodeaba `maxVelOriginal = 350` en vez de leer el valor real del tanque. Guarda la velocidad base en `TanqueBase`:
```js
// En cada subclase, junto a setMaxVelocity(N):
this.velocidadMaximaBase = N;
```

🛑 **CRÍTICO — el grupo de minas DEBE ser estático.** `MinaOxido` crea un cuerpo **estático** (`scene.physics.add.existing(this, true)`), así que en `level3.js` el grupo tiene que ser:
```js
this.minas = this.physics.add.staticGroup();   // ✅ NO uses this.physics.add.group()
```
Añadir un sprite con cuerpo estático a un grupo **dinámico** (`physics.add.group()`) **crashea al colocar la primera mina**. Verificado en Phaser 3.60.0:

| Cuerpo de la mina | Grupo `this.minas` | Resultado |
|---|---|---|
| estático (`existing(this, true)`) | `staticGroup()` | ✅ funciona |
| estático (`existing(this, true)`) | `group()` | ❌ `TypeError: e[i] is not a function` al hacer `minas.add(mina)` |

El `level3.js` de la Fase 0 ya trae `staticGroup()`, así que si no lo tocas, funciona. El riesgo real está en **G2**, que reescribe `level3.js`: allí es fácil volver a poner `physics.add.group()` por costumbre y reintroducir el crash. (Alternativa válida si algún día quieres un grupo dinámico: cambia la mina a cuerpo dinámico `existing(this)` + `setImmovable(true)`; pero el diseño estático es el correcto para una mina que no se mueve.)

**2. `TanqueVerde` completo.** Debe quedar así:

```js
class TanqueVerde extends TanqueBase {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    this.setMaxVelocity(350);
    this.velocidadMaximaBase = 350;
    this.setDrag(50);
    this.velocidadRotacion = 250;
    this.aceleracion = 400;

    this.teclas = scene.input.keyboard.addKeys({
      arriba: Phaser.Input.Keyboard.KeyCodes.W,
      abajo: Phaser.Input.Keyboard.KeyCodes.S,
      izquierda: Phaser.Input.Keyboard.KeyCodes.A,
      derecha: Phaser.Input.Keyboard.KeyCodes.D,
      disparo: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.tiempoHabilidad = 0;
    this.cooldownMina = 8000;

    scene.input.keyboard.on("keydown-E", this.colocarMina, this);
    scene.input.keyboard.on("keydown-SPACE", this.intentarDisparo, this);
  }

  colocarMina() {
    if (this.scene.time.now < this.tiempoHabilidad) return;
    if (!this.active || !this.body) return;

    const mina = new MinaOxido(this.scene, this.x, this.y, this);
    this.scene.minas.add(mina);
    this.scene.audio?.reproducir("habilidad");
    this.tiempoHabilidad = this.scene.time.now + this.cooldownMina;
  }
}
```

**3. Barro perceptible.** El `gestionarBarro()` actual funciona pero es invisible. Añade feedback:

```js
gestionarBarro() {
  if (!this.capaBarro) return;

  [this.jugador, this.jugador1].forEach((t) => {
    if (!t || !t.active || !t.body) return;
    const tile = this.capaBarro.getTileAtWorldXY(t.x, t.y);
    const enBarro = tile && tile.index !== -1;

    if (enBarro && !t.estabaEnBarro) {
      t.setDrag(800);
      t.setMaxVelocity((t.velocidadMaximaBase || 350) * 0.45);
      t.setTint(0x8a6a44);        // el tanque se ve embarrado
      t.estabaEnBarro = true;
    } else if (!enBarro && t.estabaEnBarro) {
      t.setDrag(50);
      t.setMaxVelocity(t.velocidadMaximaBase || 350);
      t.clearTint();
      t.estabaEnBarro = false;
    }

    // Salpicaduras mientras avanza por el barro
    if (enBarro && t.body.velocity.length() > 40 && this.time.now > (t.proximaSalpicadura || 0)) {
      t.proximaSalpicadura = this.time.now + 120;
      const gota = this.add.circle(
        t.x + Phaser.Math.Between(-18, 18),
        t.y + Phaser.Math.Between(-18, 18),
        Phaser.Math.Between(3, 6), 0x6b4f2a, 0.7
      ).setDepth(2);
      this.tweens.add({ targets: gota, alpha: 0, duration: 800, onComplete: () => gota.destroy() });
    }
  });
}
```

⚠️ **El código original llamaba `setDrag(800)` en cada frame**, lo cual es innecesario. El flag `estabaEnBarro` hace que solo se aplique al entrar y al salir.

✅ **Criterios de aceptación**
- Las minas parpadean 1,5 s antes de armarse y luego pulsan.
- Pisar tu propia mina no te afecta; pisar la del rival sí.
- Al entrar al barro el tanque cambia de color y frena visiblemente; al salir vuelve a la normalidad.
- Se ven salpicaduras al avanzar por el barro.
- Cero errores en consola tras 3 minutos de juego.

---

### G2 — Level Design: diseño real del Nivel 3

**Problema observado:** el Nivel 3 solo instanciaba un jugador y no tenía duelo. El mapa (`mapa3.json`) y su capa `Barro` ya existían desde la Fase 0 (F0.6) y pasaban `validar_mapa.py`, así que el trabajo de G2 fue **hacerlo jugable a dos** y darle intención de diseño, no crear el mapa desde cero.

**Archivos:** `resources/maps/mapa3.json`, `tools/generar_mapa.py`, `src/levels/level3.js`, **`src/tanks/Tanque.js`**

> 📝 **Decisiones de ejecución (verificadas tras implementar):**
> - **`Tanque.js` es imprescindible en G2**, aunque no estuviera en la lista original. `TanqueVerde` tenía un único esquema de teclas; para que dos instancias convivan hubo que añadirle un 4.º parámetro `esquema` (`"wasd"` / `"flechas"`). Sin eso, los dos jugadores comparten teclado.
> - **El duelo del Nivel 3 es entre dos `TanqueVerde`** (misma facción, distinto set de teclas: WASD+E+ESPACIO vs Flechas+N+M), **no** Rojo vs Azul. Motivo: si se reusaran Rojo/Azul, la mina (habilidad exclusiva del verde, G1) quedaría sin uso en partida. **No lo cambies sin querer**: es una decisión de diseño deliberada.
> - **Identificación visual con anillos, no con tinte.** Ver el gotcha del tinte más abajo.

**Concepto: "Hijos del Páramo"** — campo abierto con pocas paredes pero grandes zonas de barro que funcionan como "paredes blandas": no bloquean, penalizan. El jugador debe decidir entre la ruta corta (barro, lento y vulnerable) o la larga (rápida pero expuesta).

**Reglas de diseño a cumplir:**
1. **Simetría rotacional de 180°** (mismo criterio que D1).
2. **El barro debe ocupar entre el 15 % y el 25 %** de los tiles libres. Menos y no se nota; más y el nivel se vuelve tedioso.
3. **Ninguna zona de barro debe ser obligatoria**: siempre debe existir una ruta alternativa sin barro entre cualquier par de zonas. Verifícalo trazando las rutas sobre el ASCII antes de generar.
4. **Coberturas dispersas** (bloques de 2×2) para poder esquivar balas, pero sin crear laberinto.
5. **Barro visualmente distinto.** El generador usa el mismo GID de suelo para el barro, así que **no se distingue a la vista**. Solución: en `level3.js`, tras crear la capa, tíñela:
   ```js
   this.capaBarro = this.mapa.createLayer("Barro", tileset, 0, 0);
   if (this.capaBarro) {
     this.capaBarro.setTint(0x7a5c38);  // marrón barro
     this.capaBarro.setAlpha(0.85);
     this.capaBarro.setDepth(0.5);      // encima del suelo, debajo de todo lo demás
   }
   ```

Edita `MAPA3` en `tools/generar_mapa.py`, regenera y verifica el porcentaje:
```bash
python -c "
import json
d = json.load(open('resources/maps/mapa3.json'))
capas = {l['name']: l['data'] for l in d['layers']}
libres = sum(1 for v in capas['Paredes'] if v == 0)
barro  = sum(1 for v in capas['Barro'] if v != 0)
print(f'Tiles libres: {libres}  ·  Barro: {barro}  ·  {barro/libres*100:.1f}%')
"
```
Debe dar entre 15 % y 25 %.

⚠️ **El Nivel 3 también necesita 2 jugadores** (hoy solo instancia uno). Copia el patrón de D2: dos tanques, spawns lejanos, sistema de rondas y colisión tanque↔tanque. Reutiliza `obtenerPuntoSpawnValidoLejos` desde `src/utils/spawn.js` (creado en D2) en vez de duplicarlo.

🛑 **Al reescribir `level3.js`, conserva `this.minas = this.physics.add.staticGroup()`.** No lo cambies a `physics.add.group()`: la mina de G1 usa cuerpo estático y un grupo dinámico crashea al colocar la primera mina (ver el recuadro de G1). Es el error más fácil de reintroducir en esta reescritura.

🎨 **Gotcha del tinte: `setTint()`/`clearTint()` no se pueden usar para identificar al jugador.** El barro (`setTint(0x8a6a44)` al entrar/`clearTint()` al salir) y las minas (`setTint(0x996644)` mientras ralentizan) ya usan el tinte del tanque para señalizar su propio estado. Si además tiñes el sprite para distinguir facción/jugador, ambos usos se pisan. Por eso el Nivel 3 identifica a cada jugador con **un anillo de color que sigue al tanque** (`this.add.circle(...).setStrokeStyle(...)`), no tiñéndolo. Si en el futuro alguien quiere teñir un tanque para otra cosa (daño, power-up), chocará con esto.

⚠️ **Verificado en auditoría: `MAPA3` genera 4 callejones sin salida** (`validar_mapa.py` los marca con ⚠, no ✗ — no bloquea, no es criterio de aceptación). No rompen nada, pero en una próxima pasada de nivel-design conviene suavizarlos.

✅ **Criterios de aceptación**
- El barro se distingue visualmente del suelo normal.
- El porcentaje de barro está entre 15 % y 25 % (verificado con el comando de arriba).
- Existe al menos una ruta sin barro entre las dos zonas de spawn.
- El mapa es visiblemente distinto a los niveles 1 y 2.
- **Dos jugadores controlables** (dos `TanqueVerde`, WASD+E+ESPACIO vs Flechas+N+M).

> 🐞 **BUG CONOCIDO detectado en auditoría (G1↔G2, sin corregir aún): el barro cancela la ralentización de la mina.** `gestionarBarro()` y `MinaOxido.detonar()` **ambos escriben `maxVelocity` de forma incondicional**, así que se pisan. Reproducido en el juego real:
> - Un tanque ralentizado por mina (maxVel 70) que **sale del barro** → `gestionarBarro` lo resetea a 350: la mina queda cancelada por completo.
> - Un tanque ralentizado por mina que **entra al barro** → maxVel pasa a 158 (barro), perdiendo el efecto de la mina.
>
> No es un crash y el caso común (mina en suelo seco, víctima que no toca barro) funciona; pero con el 16,8 % del mapa embarrado, la interacción ocurrirá. **Arreglo recomendado:** que ambos sistemas compongan en vez de sobrescribir. Dar a cada tanque dos factores y recalcular:
> ```js
> // helper en la escena o el tanque
> function recalcularVelocidad(t) {
>   const fb = t.enBarro ? 0.45 : 1;
>   const fm = t.ralentizadoMina ? 0.2 : 1;
>   t.setMaxVelocity(t.velocidadMaximaBase * fb * fm);
> }
> // gestionarBarro(): set t.enBarro = enBarro; recalcularVelocidad(t);   (en vez de setMaxVelocity directo)
> // MinaOxido.detonar(): jugador.ralentizadoMina = true; recalcularVelocidad(jugador);
> //   y tras 3 s: jugador.ralentizadoMina = false; recalcularVelocidad(jugador);
> ```

---

### G3 — Música: sistema de audio persistente con fade

**Problema observado:** no hay música. Y si se añadiera ingenuamente, se cortaría de golpe en cada `scene.restart()` del Nivel 1 (que ocurre cada ronda).

**Archivos:** `src/audio/MusicManager.js` (nuevo), `src/BootScene.js`, `main.js`, todos los niveles

**Obtener la música:** usa pistas con licencia libre de:
- https://opengameart.org (filtrar por CC0)
- https://incompetech.com (Kevin MacLeod, CC-BY — **requiere atribución en el GDD y en los créditos del juego**)

Guarda en `resources/audio/` (formato `.ogg`, ideal < 2 MB cada una):

| Archivo | Dónde suena |
|---|---|
| `musica_menu.ogg` | Menú y Game Over |
| `musica_nivel1.ogg` | Nivel 1 |
| `musica_nivel2.ogg` | Nivel 2 |
| `musica_nivel3.ogg` | Nivel 3 |

**Implementación de `src/audio/MusicManager.js`:**

> **Clave del diseño:** el gestor vive en el objeto `game`, **no en una escena**. Así sobrevive a `scene.restart()` y a los cambios de escena. Este es exactamente el problema del rubro *"la música se corta abruptamente al reiniciar el nivel"*.

```js
class MusicManager {
  constructor(game) {
    this.game = game;
    this.pistaActual = null;
    this.claveActual = null;
    this.volumen = 0.35;
  }

  /**
   * Cambia de pista con fade. Si ya suena la misma, NO hace nada
   * (esto es lo que evita el corte al reiniciar el nivel).
   */
  reproducir(clave, { fadeMs = 800 } = {}) {
    if (this.claveActual === clave && this.pistaActual?.isPlaying) return;

    const sound = this.game.sound;
    if (!sound.get(clave) && !this.game.cache.audio.exists(clave)) {
      console.warn("[MusicManager] Pista no encontrada:", clave);
      return;
    }

    const anterior = this.pistaActual;
    if (anterior && anterior.isPlaying) {
      this._fade(anterior, anterior.volume, 0, fadeMs, () => anterior.stop());
    }

    const nueva = sound.add(clave, { loop: true, volume: 0 });
    nueva.play();
    this._fade(nueva, 0, this.volumen, fadeMs);

    this.pistaActual = nueva;
    this.claveActual = clave;
  }

  detener({ fadeMs = 600 } = {}) {
    if (!this.pistaActual) return;
    const p = this.pistaActual;
    this._fade(p, p.volume, 0, fadeMs, () => p.stop());
    this.pistaActual = null;
    this.claveActual = null;
  }

  // Tween manual sobre el volumen; usa la escena activa como host del tween
  _fade(sonido, desde, hasta, duracion, alTerminar) {
    const escena = this.game.scene.getScenes(true)[0];
    if (!escena) { sonido.setVolume(hasta); alTerminar?.(); return; }
    sonido.setVolume(desde);
    escena.tweens.add({
      targets: sonido, volume: hasta, duration: duracion,
      onComplete: () => alTerminar?.(),
    });
  }
}
```

**Cargar en `BootScene.preload()`:**
```js
["musica_menu", "musica_nivel1", "musica_nivel2", "musica_nivel3"]
  .forEach((k) => this.load.audio(k, `resources/audio/${k}.ogg`));
```

**Instanciar una sola vez en `BootScene.create()`:**
```js
this.game.musica = new MusicManager(this.game);
this.scene.start("MenuScene");
```

**Llamar en cada escena**, dentro de `create()`:
```js
this.game.musica?.reproducir("musica_nivel1");  // ajusta la clave por nivel
```
En `MenuScene` y `GameOverScene`: `this.game.musica?.reproducir("musica_menu");`

**Por qué no se corta al reiniciar:** cuando el Nivel 1 hace `scene.restart()`, `create()` vuelve a llamar `reproducir("musica_nivel1")`, pero como `this.claveActual` ya es `"musica_nivel1"` y la pista sigue sonando, el método **retorna inmediatamente sin tocar nada**. La música continúa sin interrupción.

**Control de volumen.** Añade en `MenuScene`:
```js
this.input.keyboard.on("keydown-M", () => {
  const m = this.game.musica;
  m.volumen = m.volumen > 0 ? 0 : 0.35;
  m.pistaActual?.setVolume(m.volumen);
});
```
⚠️ **`M` ya es la tecla de disparo del tanque azul.** Usa otra tecla — se sugiere `O` para música y `P` para SFX (que definió Eddy en E3). **Coordínalo con Eddy antes de implementar.**

✅ **Criterios de aceptación**
- Suena música en menú y en los 3 niveles, con pistas distintas.
- Al terminar una ronda del Nivel 1 y reiniciar, **la música NO se corta ni se reinicia**.
- Al cambiar de nivel, la pista anterior se desvanece y la nueva entra suavemente (sin silencio brusco ni solapamiento).
- La tecla de silencio de música funciona y no interfiere con los controles de los tanques.

---

## Puntos de contacto entre mejoras (¡leer antes de empezar la Fase 3!)

Trabajando en solitario no hay conflictos de merge, pero **sí hay piezas compartidas**. Estas cuatro son las que rompen cosas si se hacen fuera de orden:

| Pieza compartida | Se crea en | La consumen | Consecuencia si se invierte el orden |
|---|---|---|---|
| `velocidadMaximaBase` en las 3 subclases de tanque | **E1** | G1 (minas), G2 (barro) | Las minas y el barro restauran una velocidad incorrecta (hardcodeada a 350) |
| `src/utils/spawn.js` (`obtenerPuntoSpawnValidoLejos`) | **D2** | G2, y se retro-aplica a `level1.js` | Se escribe la misma función dos veces y divergen |
| Colisión tanque↔tanque | **D2** | Se replica en `level1.js` y `level3.js` | Los tanques se atraviesan en los niveles donde falte |
| Teclas de audio: `P` = SFX, `O` = música | **E3** / **G3** | — | ⚠️ `M` **ya es el disparo del tanque azul**: no la uses para audio |

### 🧨 Gotcha transversal de Phaser: orden de argumentos en colisiones Grupo↔Sprite

Afecta a **cualquier mejora que convierta un Sprite en un Group** (E1 pasa `bala`→`balas`; G1 agrupa minas; y le puede pasar a cualquier mejora futura que agrupe algo). No da error: falla en silencio o al revés.

**La regla (verificada en Phaser 3.60.0):** en un `collider`/`overlap` entre un **Group** y un **Sprite** suelto, el callback **siempre** recibe primero el sprite suelto y después el miembro del grupo, **sin importar en qué orden los pasaste** a `.collider()`:

```js
// Ambas formas invocan el callback como (sprite, miembroDelGrupo):
this.physics.add.collider(grupoDeBalas, tanque, cb);  // cb(tanque, bala)  ← ¡invertido!
this.physics.add.collider(tanque, grupoDeBalas, cb);  // cb(tanque, bala)
```

Es decir: si tu handler estaba escrito como `impactoJugador(bala, victima)` pensando en dos sprites, al volver `bala` un grupo **los parámetros se te dan la vuelta** y `bala` pasa a ser el tanque.

**Solución robusta (no dependas de la posición):** detecta cada objeto por lo que es, no por dónde llega. Es lo que ya hace `level2.js`:
```js
recibirDano(a, b) {
  const bala = a.disparar ? a : b;      // el que sabe "disparar" es la bala
  const jugador = a.disparar ? b : a;
  // ...
}
```
Así el handler funciona igual pases lo que pases, y sobrevive a que en el futuro alguien reordene el `collider` o agrupe el otro objeto.

**Flujo de trabajo con Git + `gh`:**

Sin revisores no hacen falta ramas ni Pull Requests. Commits directos a `main`, uno por mejora:

```bash
# 1. Trabajar y probar en local
python -m http.server 8777      # verificar los criterios de aceptación

# 2. Verificaciones automáticas antes de subir
python tools/verificar_rutas.py
python tools/validar_mapa.py

# 3. Commit con el ID de la mejora
git add -A
git commit -m "[E1] Pool de balas, retroceso y screen shake

Closes #1"

# 4. Push -> GitHub Pages se reconstruye solo
git push origin main

# 5. Confirmar que el despliegue compiló (30-60 s despues)
gh api repos/Eddy-Castro/Proyecto_2B_JuegosInteractivos/pages/builds/latest --jq '.status, .error.message'
gh browse    # abrir el juego en vivo y comprobar la mejora en produccion
```

> 💡 **`Closes #N` cierra el issue automáticamente al hacer push a `main`.** Eso deja el historial listo para la columna "Commit" de la matriz del GDD, sin trabajo extra.

> ⚠️ **Si una mejora deja el juego roto a medias, no hagas push.** Pages sirve `main` tal cual: un push roto deja el juego caído hasta el siguiente. Termina la mejora, verifica sus criterios de aceptación, y entonces sube.

**Recuperar los commits por atribución para el GDD** (útil en la Fase 4):
```bash
git log --oneline --grep="\[E1\]\|\[E2\]\|\[E3\]"   # los atribuidos a Eddy
git log --oneline --grep="\[D1\]\|\[D2\]\|\[D3\]"   # los atribuidos a David
git log --oneline --grep="\[G1\]\|\[G2\]\|\[G3\]"   # los atribuidos a Gabriel
```

---

# FASE 4 — Game Design Document (GDD)

**Entregable:** un PDF bien maquetado. Trabájenlo en Google Docs (colaborativo) y exporten a PDF al final.

**Archivo fuente sugerido:** `docs/GDD.md` en el repo (para versionar el contenido), y el maquetado final en Docs/Word.

## Estructura obligatoria (según el rubro)

### 1. Portada y Datos Generales
- Título: **Laberinto de Acero**
- Logotipo del juego (pueden generarlo con IA; formato PNG con fondo transparente)
- Integrantes: Eddy, David, Gabriel
- Materia, docente, fecha, período académico
- Enlace al repositorio y a GitHub Pages

### 2. Historia y Narrativa
Desarrollar el lore ya insinuado por los nombres de los niveles del menú:
- **Imperio de Hierro** (Nivel 1 — facción roja): militaristas, tanques pesados y blindados. Su habilidad, el **muro de trinchera**, refleja su doctrina defensiva.
- **Sindicato de Neón** (Nivel 2 — facción azul): tecnócratas urbanos, veloces, con tecnología de teletransporte. Su **dash fantasma** los deja atravesar materia.
- **Hijos del Páramo** (Nivel 3 — facción verde): supervivientes del yermo, guerrilla, trampas. Sus **minas de óxido** y el terreno embarrado son su arma.
- Conflicto principal: qué se disputan (¿el último yacimiento de combustible? ¿el control del laberinto?)
- Objetivo del protagonista / condición de victoria narrativa

### 3. Personajes (fichas técnicas)
Una tabla por facción con los datos **reales del código** (esto demuestra rigor):

| Atributo | Tanque Rojo | Tanque Azul | Tanque Verde |
|---|---|---|---|
| Facción | Imperio de Hierro | Sindicato de Neón | Hijos del Páramo |
| Velocidad máxima | 100 | 250 | 350 |
| Aceleración | 300 | 150 | 400 |
| Rozamiento (drag) | 800 | 200 | 50 |
| Velocidad de rotación | 150 | 300 | 250 |
| Habilidad | Muro de trinchera | Dash fantasma | Mina de óxido |
| Cooldown | 10 s | 3 s | 8 s |
| Controles | `W A S D` + `ESPACIO` + `E` | `↑ ← ↓ →` + `M` + `N` | `W A S D` + `ESPACIO` + `E` |
| Rol táctico | Tanque lento, control de zona | Escaramuceador evasivo | Emboscador móvil |

> ⚠️ Si cambian algún valor durante la Fase 3, **actualicen esta tabla**. El profesor puede contrastarla con el código.

Incluir el sprite de cada tanque y una descripción visual.

### 4. Mecánicas de Juego
- **Movimiento:** aceleración direccional según la rotación del sprite (`velocityFromRotation`), con rozamiento (drag) que simula inercia. Rotación independiente del avance (control tipo "tanque").
- **Disparo:** proyectil con rebote elástico (`bounce = 1`) contra paredes y límites del mundo. Cadencia y número máximo de balas simultáneas (documentar los valores finales tras E1).
- **Colisiones:** capa `Paredes` del tilemap con `setCollisionByExclusion([-1])`; colisión tanque↔tanque; colisión bala↔tanque (impacto).
- **Habilidades:** describir las 3, con su cooldown y su contrapartida táctica.
- **Condición de victoria:** primero en ganar 5 rondas (tras E2).
- **Sistema de puntaje:** marcador por rondas ganadas, persistido en el `registry` global de Phaser.

### 5. Diseño de Niveles (Level Design)
Por cada nivel:
- **Captura del mapa completo** (usar la tecla de captura con `debug: true` en la config de physics para mostrar los hitboxes: queda muy profesional).
- **Diagrama del layout** — pueden pegar directamente el ASCII de `tools/generar_mapa.py`, es un excelente recurso visual y demuestra el proceso.
- **Intención de diseño:** qué se buscaba (Nivel 1 = duelo abierto; Nivel 2 = pasillos + portales; Nivel 3 = campo abierto + terreno penalizante).
- **Flujo de dificultad:** por qué el orden 1 → 2 → 3.
- **Distribución de elementos:** dónde están los portales, el barro, las coberturas y por qué.

### 6. ⭐ Sección Especial: Bitácora e Informe de Playtesting

Esta es la sección que evalúa el **examen**. Debe contener:

**6.1 Metodología**
Describir el protocolo: playtesting cruzado en solitario, 3 corridas por integrante, aislamiento total, consolidación posterior. Incluir fechas y duración de cada sesión.

**6.2 Bitácoras individuales**
Transcribir las 3 tablas de cada integrante (`docs/bitacora_*.md`). Sin editar ni "limpiar" — el valor está en que sea el registro crudo.

**6.3 Hallazgos consolidados**
Tabla unificada de todos los problemas encontrados, con una columna de "cuántos integrantes lo reportaron" (los reportados por los 3 son los más críticos).

**6.4 Matriz de asignación** ← **lo que califica tu nota individual**

| Integrante | ID | Categoría | Problema detectado | Solución técnica implementada | Archivos modificados | Commit |
|---|---|---|---|---|---|---|
| Eddy | E1 | Game Feel | Disparar no se siente potente; solo 1 bala en pantalla traba el ritmo | Pool de 3 balas por tanque, retroceso del chasis, screen shake de 80 ms, fogonazo con tween, límite de 4 rebotes | `Bala.js`, `Tanque.js`, `level1.js` | `abc1234` |
| Eddy | E2 | UI/UX | Cooldowns invisibles, sin condición de victoria, controles no documentados | Barras de cooldown ancladas a cámara, victoria a 5 rondas, pantalla de controles en el menú, reinicio del marcador | `ui/HUD.js`, `level1.js`, `menu.js`, `GameOver.js` | |
| Eddy | E3 | SFX | Ausencia total de retroalimentación auditiva | `AudioManager` con anti-spam y variación de tono; 7 SFX conectados a los eventos del juego | `audio/AudioManager.js`, `BootScene.js`, niveles | |
| David | D1 | Level Design | El Nivel 2 no tenía mapa (ruta placeholder `ruta/mapa2.json`) | Mapa de pasillos con simetría rotacional 180°, 4 portales en pares, generado desde ASCII | `mapa2.json`, `generar_mapa.py`, `level2.js` | |
| David | D2 | Game Feel | Un solo jugador, sin oponente; muerte por bala propia; portales con rebote infinito | Dos jugadores, spawns con distancia mínima de 400 px, cooldown de portal por jugador, colisión tanque↔tanque | `level2.js`, `Teletransportador.js`, `utils/spawn.js` | |
| David | D3 | Animaciones | Teletransporte instantáneo sin feedback; muerte sin efecto visual | Onda expansiva + tween de escala + flash de cámara; portales pulsantes; estelas de oruga; explosión con 12 fragmentos | `level2.js`, `Teletransportador.js`, `Tanque.js` | |
| Gabriel | G1 | Game Feel | Nivel 3 con crash por frame; minas y barro imperceptibles | Fase de armado de 1,5 s con parpadeo, inmunidad a minas propias, tinte y salpicaduras en el barro, corrección de la velocidad base | `MinaOxido.js`, `Tanque.js`, `level3.js` | |
| Gabriel | G2 | Level Design | El Nivel 3 no tenía mapa ni capa de barro | Campo abierto simétrico con 15–25 % de barro, capa teñida para distinguirla, rutas alternativas garantizadas | `mapa3.json`, `generar_mapa.py`, `level3.js` | |
| Gabriel | G3 | Música | Sin música; y una implementación ingenua se cortaría en cada reinicio de ronda | `MusicManager` alojado en `game` (sobrevive a `scene.restart()`), crossfade entre pistas, no reinicia si la pista ya suena | `audio/MusicManager.js`, `BootScene.js`, todas las escenas | |

**6.5 Antes / Después**
Capturas comparativas de al menos 4 mejoras. Es lo que más comunica el trabajo hecho.

### 7. Créditos y Licencias
Lista de todos los assets de terceros con su licencia:
- Phaser 3.60 — MIT
- Sprites de tiles / SFX (Kenney.nl) — CC0
- Música (fuente + licencia; **si es CC-BY, la atribución es obligatoria**)
- Cinemática generada con [herramienta de IA usada]

---

# FASE 5 — Video Introductorio (Trailer)

**Duración:** 1 a 2 minutos. **Obligatorio combinar gameplay real + cinemática de IA.**

## Estructura sugerida (90 segundos)

| Tiempo | Contenido | Fuente |
|---|---|---|
| 0:00–0:20 | **Cinemática IA:** el páramo devastado, las 3 facciones, el conflicto | Runway / Kling / Luma |
| 0:20–0:30 | Título del juego con el logo | Editor de video |
| 0:30–0:50 | **Gameplay Nivel 1:** duelo rojo vs azul, muro de trinchera, dash | Captura de pantalla real |
| 0:50–1:05 | **Gameplay Nivel 2:** persecución por pasillos, teletransporte | Captura real |
| 1:05–1:20 | **Gameplay Nivel 3:** minas, barro, emboscada | Captura real |
| 1:20–1:30 | Cierre: logo + URL de GitHub Pages + nombres del equipo | Editor |

## Cómo grabar el gameplay

- **OBS Studio** (gratis) o la Xbox Game Bar de Windows (`Win + G`).
- Grabar a **1920×1080, 60 fps**. El juego corre a 1280×960 (relación 4:3), así que quedará con bandas negras a los lados — **rellénenlas con arte o un marco**, no las dejen negras.
- Graben **partidas de verdad, jugadas bien**. Nada de un tanque dando vueltas sin rumbo: muestren impactos, habilidades, momentos de tensión.
- Graben **mucho más material del que necesitan** (10–15 min) para poder elegir los mejores clips.
- ⚠️ Verifiquen que el **audio del juego se está grabando** (SFX + música). Es la prueba de las mejoras E3 y G3.

## Cinemática de IA

**Herramientas aceptadas:** Runway Gen-3, Kling, Luma Dream Machine, Pika.

**Consejos de prompt** (generen 3–4 clips de 5–10 s cada uno):
1. *"Cinematic wide shot of a rusted steel labyrinth in a post-apocalyptic wasteland, dust storm, dramatic orange sunset lighting, no people, film grain"*
2. *"Close-up of a heavy red armored tank emerging from smoke, industrial military aesthetic, volumetric light"*
3. *"Neon-lit narrow corridors with glowing blue portals, cyberpunk, cold blue lighting, atmospheric fog"*
4. *"Green scavenger tank crossing a muddy wasteland field, rust and improvised armor, gritty realism"*

⚠️ **Mantengan coherencia visual entre clips**: mismo estilo, misma paleta, misma relación de aspecto. Un trailer con 4 estéticas distintas se ve amateur. Usen la misma herramienta y prompts con vocabulario de estilo compartido.

## Edición

- **Editores gratuitos:** DaVinci Resolve, CapCut, Shotcut.
- Música de fondo con licencia libre (pueden usar la misma del juego → refuerza la identidad).
- Cortes al ritmo de la música.
- Texto en pantalla mínimo y legible.

**Entrega:** subir a YouTube (visibilidad **"No listado"** o **"Público"**, nunca privado) y verificar el enlace desde una ventana de incógnito.

---

# FASE 6 — Despliegue en GitHub Pages

## ✅ Estado: YA DESPLEGADO Y VERIFICADO

**GitHub Pages está activo y sirviendo el juego.** Comprobado end-to-end:

| Dato | Valor |
|---|---|
| Nombre canónico del repo | **`Proyecto_2B_JuegosInteractivos`** |
| Visibilidad | Pública ✅ |
| Origen de Pages | rama `main`, carpeta `/` (raíz) |
| Estado del build | `built` ✅ (sin errores) |
| HTTPS forzado | Sí |
| **URL en vivo** | **https://eddy-castro.github.io/Proyecto_2B_JuegosInteractivos/** |

**Verificación real hecha en producción** (no asumida):
- La página responde `200` y los 8 archivos `.js` se sirven correctamente.
- Phaser 3.60 arranca desde el CDN sobre HTTPS (sin *mixed content*).
- El juego llega a `MenuScene` con las 7 escenas registradas y canvas 1280×960.
- Se reproduce el 404 conocido de `/tanqueRojo.png` (bug de `BootScene`, tarea **F0.2**) — exactamente el mismo que en local.

> ⚠️ **Lo que hay ahora en la URL es el juego SIN la Fase 0**: menú descentrado, niveles 2 y 3 rotos. Eso es correcto y esperado — Pages sirve lo que haya en `main`. **Se actualizará solo en cada push.** El pipeline ya está validado; lo que falta es el contenido.

A partir de aquí, esta fase deja de ser "desplegar" y pasa a ser **verificar en cada push**.

> ⚠️ **El repositorio fue renombrado de `Proyecto_1B` a `Proyecto_2B_JuegosInteractivos`.**
> El remoto local sigue apuntando a la URL vieja. GitHub redirige automáticamente, así que `git push` **funciona igual**, pero la URL de Pages usará el **nombre nuevo**. Actualiza el remoto para evitar sorpresas:
> ```bash
> git remote set-url origin https://github.com/Eddy-Castro/Proyecto_2B_JuegosInteractivos.git
> git remote -v
> ```
> La carpeta local puede seguir llamándose `Proyecto_1B`; eso no afecta a nada.

## Ciclo de despliegue (repetir tras cada mejora)

```bash
# 1. Verificaciones locales
python tools/verificar_rutas.py && python tools/validar_mapa.py

# 2. Subir
git add -A && git commit -m "[ID] descripción" && git push origin main

# 3. Esperar ~40 s y comprobar que compiló
gh api repos/Eddy-Castro/Proyecto_2B_JuegosInteractivos/pages/builds/latest --jq '{estado: .status, error: .error.message}'

# 4. Abrir y probar en vivo
gh browse
```

El paso 3 debe devolver `"estado": "built"` y `"error": null`. Si dice `"building"`, espera y repite; si dice `"errored"`, el mensaje indica la causa.

<details>
<summary>Cómo se activó Pages (referencia — ya ejecutado, no hace falta repetirlo)</summary>

```bash
gh api -X POST repos/Eddy-Castro/Proyecto_2B_JuegosInteractivos/pages \
  -f "source[branch]=main" -f "source[path]=/"
```

Respuesta: `html_url: https://eddy-castro.github.io/Proyecto_2B_JuegosInteractivos/`, `build_type: legacy`, `https_enforced: true`.

⚠️ **Nota sobre PowerShell:** la variante con cuerpo JSON por tubería (`echo '{...}' | gh api --input -`) **falla en PowerShell 5.1** con `HTTP 400 Problems parsing JSON`, porque PowerShell reescribe la codificación del texto en el pipe. La sintaxis `-f "source[branch]=main"` funciona en cualquier shell — usa siempre esa.

Si alguna vez hay que rehacerlo y `gh` devuelve `HTTP 409`, significa que Pages ya estaba activo (no es un error). Si devuelve `HTTP 403`, hazlo por la web en
`https://github.com/Eddy-Castro/Proyecto_2B_JuegosInteractivos/settings/pages` → *Deploy from a branch* → `main` / `/ (root)`.

</details>

## ⚠️ Errores típicos que rompen el despliegue

Estos funcionan en local (Windows) y fallan en producción (Linux). **Verifíquenlos uno por uno:**

| Problema | Cómo detectarlo | Solución |
|---|---|---|
| **Mayúsculas/minúsculas** | El servidor de GitHub distingue `tanqueRojo.png` de `tanquerojo.png`; Windows no | Comprobar que cada `load.image()` coincide **exactamente** con el nombre real del archivo |
| **Espacios en nombres** | `tanqueVerde - copia.png` da 404 o se codifica como `%20` | Ya resuelto en F0.9; verificar que no quedó ninguno |
| **Rutas absolutas** | Una ruta como `/resources/img/x.png` busca en `eddy-castro.github.io/resources/`, no en `/Proyecto_2B_JuegosInteractivos/resources/` | Todas las rutas deben ser relativas, **sin `/` inicial** |
| **Assets externos** | Si quedó algún `labs.phaser.io`, puede fallar o ser lento | Ya resuelto en F0.3; verificar con `grep` |
| **Jekyll ignora carpetas** | Carpetas que empiezan con `_` desaparecen | Ya resuelto con `.nojekyll` en F0.9 |
| **Caché del navegador** | Subes un cambio y no se ve | Recargar con `Ctrl + Shift + R` |

**Comando de verificación antes de subir:**
```bash
grep -rn "labs.phaser.io\|src=\"/\|src='/\|\"/resources" --include=*.js --include=*.html .
```
No debe devolver nada.

**Detector de errores de mayúsculas/minúsculas** (el fallo más traicionero: funciona en Windows, rompe en Pages). Crea `tools/verificar_rutas.py`:

```python
# tools/verificar_rutas.py
# Comprueba que cada asset referenciado en el codigo exista con EXACTAMENTE esa grafia.
import os, re, sys

referencias = set()
for raiz, _, ficheros in os.walk("."):
    if any(p in raiz for p in (".git", "node_modules", "tools")): continue
    for f in ficheros:
        if not f.endswith((".js", ".html")): continue
        texto = open(os.path.join(raiz, f), encoding="utf-8", errors="ignore").read()
        for m in re.findall(r'["\']((?:resources|src)/[^"\']+\.(?:png|jpg|json|ogg|mp3|js))["\']', texto):
            referencias.add(m)

fallos = 0
for ref in sorted(referencias):
    if os.path.exists(ref):
        # existe, pero ¿coincide la grafia exacta? (Windows no distingue, Linux si)
        carpeta, nombre = os.path.split(ref)
        reales = os.listdir(carpeta) if os.path.isdir(carpeta) else []
        if nombre not in reales:
            real = next((r for r in reales if r.lower() == nombre.lower()), "?")
            print(f"✗ MAYUSCULAS: el codigo dice '{nombre}' pero el archivo es '{real}'  ({ref})")
            fallos += 1
        elif " " in ref:
            print(f"⚠ ESPACIO en el nombre: {ref}")
            fallos += 1
    else:
        print(f"✗ NO EXISTE: {ref}")
        fallos += 1

print(f"\n{len(referencias)} referencias revisadas · {fallos} problemas")
sys.exit(1 if fallos else 0)
```

```bash
python tools/verificar_rutas.py
```
Debe terminar con `0 problemas`. **Ejecútalo antes de cada `git push`.**

**6. Verificación final en producción (obligatoria):**

Comprobar primero desde la terminal que Pages compiló:
```bash
gh api repos/Eddy-Castro/Proyecto_2B_JuegosInteractivos/pages --jq '{estado: .status, url: .html_url}'
```

Luego abrir `https://eddy-castro.github.io/Proyecto_2B_JuegosInteractivos/` **en una ventana de incógnito** y en **otro dispositivo** (celular o la computadora de un compañero):

```
[ ] El juego carga sin pantalla negra
[ ] Consola (F12): 0 errores rojos, 0 peticiones 404
[ ] Los 3 niveles arrancan y son jugables
[ ] Se escuchan música y efectos de sonido
[ ] Los sprites y los tilemaps se ven correctamente
[ ] ESC vuelve al menú
[ ] Funciona en Chrome y en Firefox
```

> ⚠️ **El incógnito importa.** Tu navegador tiene el juego cacheado de las pruebas locales; el del profesor no. Más de un proyecto "funciona en mi máquina" y aparece en negro en la revisión.

**7. Añadir un `README.md`** en la raíz (lo primero que ve el profesor al abrir el repo):

````markdown
# 🎮 Laberinto de Acero

Juego de duelo de tanques 2D desarrollado con Phaser 3.60.

## ▶️ Jugar ahora
**https://eddy-castro.github.io/Proyecto_2B_JuegosInteractivos/**

## 👥 Equipo
Eddy · David · Gabriel

## 🕹️ Controles
| Acción | Tanque Rojo | Tanque Azul |
|---|---|---|
| Mover | `W` `A` `S` `D` | `↑` `←` `↓` `→` |
| Disparar | `ESPACIO` | `M` |
| Habilidad | `E` (Muro) | `N` (Dash) |
| Volver al menú | `ESC` | `ESC` |
| Silenciar SFX / Música | `P` / `O` | |

## 📁 Documentación
- [Game Design Document (PDF)](docs/GDD.pdf)
- [Bitácoras de playtesting](docs/)
- [Video introductorio](ENLACE_AQUI)

## 🛠️ Ejecutar en local
```bash
python -m http.server 8777
```
Abrir `http://localhost:8777`
(No abrir `index.html` con doble clic: el tilemap se carga vía `fetch` y `file://` lo bloquea.)

## 📜 Créditos
- [Phaser 3](https://phaser.io) — MIT
- Sprites y SFX: [Kenney.nl](https://kenney.nl) — CC0
- Música: _(fuente y licencia)_
````

---

# Checklist final de entrega

## Examen práctico
```
[ ] Hiciste tus 3 corridas completas anotando en la bitácora
[ ] Existen las 3 bitácoras en docs/ (la tuya + las de David y Gabriel)
[ ] Hay un docs/hallazgos_consolidados.md
[ ] Las 9 mejoras están implementadas y funcionan EN LA VERSIÓN DESPLEGADA
[ ] Cada mejora tiene un commit identificable con su ID ([E1], [D2]...)
[ ] La matriz de asignación está en el GDD, con 3 mejoras por integrante
[ ] Las 6 categorías del rubro están cubiertas
```

## Proyecto final
```
[ ] GDD en PDF, bien maquetado, con las 7 secciones
[ ] Enlace del video (YouTube/Vimeo/Drive) con acceso abierto y verificado en incógnito
[ ] Video de 1-2 min con gameplay real Y cinemática de IA
[x] GitHub Pages activo, público y funcional  <- YA HECHO
[ ] Verificado en un segundo dispositivo y en 2 navegadores
[ ] README.md con el enlace de juego bien visible
[ ] Créditos y licencias de todos los assets de terceros
```

## Verificación técnica final
```
[ ] 0 errores en la consola del navegador (producción, en incógnito)
[ ] 0 peticiones 404
[ ] FPS >= 55 en juego intenso
[ ] Peso total del repo < 15 MB
[ ] grep de "labs.phaser.io" sin resultados
[ ] grep de rutas absolutas sin resultados
[ ] python tools/verificar_rutas.py  -> 0 problemas
[ ] python tools/validar_mapa.py     -> los 2 mapas APTOS
[ ] git remote -v apunta a Proyecto_2B_JuegosInteractivos
[ ] gh api .../pages --jq .status    -> "built"
[ ] gh issue list --state open       -> 0 mejoras sin cerrar
```

**Comando único de verificación previa a la entrega:**
```bash
python tools/verificar_rutas.py && python tools/validar_mapa.py && gh api repos/Eddy-Castro/Proyecto_2B_JuegosInteractivos/pages --jq .status
```

---

## Riesgos conocidos y planes de contingencia

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| La cinemática de IA agota créditos gratuitos o tarda demasiado | **Alta** | Empezar durante la Fase 3, no al final. Es el único punto cuyo tiempo no depende de ti. Alternativa: intro con imágenes fijas generadas por IA + efecto Ken Burns en el editor |
| Hacer 9 mejoras seguidas sin probar en producción | **Alta** | Push tras cada mejora. Pages se actualiza solo; un fallo detectado en la mejora 3 cuesta minutos, detectado en la 9 cuesta una noche |
| Implementar las mejoras fuera de orden | Media | Seguir la columna "Orden" de la tabla, no el alfabético. E1 antes que G1; D2 antes que G2 |
| Las bitácoras de David y Gabriel no se hacen | Media | Son 20 min por persona con el enlace de Pages ya activo. Pedirlas al inicio de la Fase 1, no el día de la entrega |
| El audio no suena en GitHub Pages | Media | Los navegadores bloquean audio sin interacción previa; resuelto con el clic del menú. Verificar en incógnito |
| Los mapas ASCII quedan mal dimensionados | Media | `tools/validar_mapa.py` lo detecta. Ejecutarlo tras cada edición de layout |
| Un push deja el juego roto en producción | Media | Verificar los criterios de aceptación **antes** del push. Si algo se rompe: `git revert HEAD && git push` |
| Los PNG optimizados se ven borrosos | Baja | Regenerar desde el original a 128×96 con LANCZOS; guardar copias de los originales fuera del repo antes de optimizar |

---

## Resumen ejecutivo

1. **Fase 0 es innegociable.** Hoy 2 de 3 niveles no son jugables; sin arreglarlos no hay playtesting posible ni examen que presentar.
2. **El orden de las 9 mejoras importa.** No son independientes: E1 introduce una propiedad que G1 y G2 necesitan, y D2 crea una utilidad que G2 reutiliza. Sigue la columna "Orden".
3. **El playtesting lo juega una persona, no la IA.** Yo puedo reproducir bugs y leer el estado del juego, pero no puedo evaluar si algo se siente bien. Las 3 corridas son tuyas.
4. **GitHub Pages ya está activo y verificado** en `https://eddy-castro.github.io/Proyecto_2B_JuegosInteractivos/`. Se actualiza en cada push: úsalo como red de seguridad continua, no como último paso.
5. **Empieza el trailer temprano.** La generación de vídeo con IA es el único cuello de botella que no puedes acelerar.
