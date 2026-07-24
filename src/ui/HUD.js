/* HUD del jugador: panel con icono, marcador y barra de habilidad.
   Lo usan los tres niveles para que la interfaz sea idéntica en todos. */

const HUD_PROFUNDIDAD = 100;

class BarraCooldown {
  /**
   * Barra de recarga de habilidad.
   * @param {number} x,y   esquina/centro vertical de la barra
   * @param {number} color color de acento cuando está lista
   * @param {boolean} haciaIzquierda  si true la barra se llena de derecha a izquierda
   */
  constructor(scene, x, y, color, ancho = 222, alto = 14, haciaIzquierda = false) {
    this.scene = scene;
    this.ancho = ancho;
    this.color = color;
    this.lista = null; // estado anterior, para no recrear tweens cada frame

    const ox = haciaIzquierda ? 1 : 0;
    this.haciaIzquierda = haciaIzquierda;

    this.pista = scene.add
      .rectangle(x, y, ancho, alto, 0x11151c, 0.95)
      .setOrigin(ox, 0.5)
      .setScrollFactor(0)
      .setDepth(HUD_PROFUNDIDAD + 1)
      .setStrokeStyle(1, 0x2f3947);

    this.relleno = scene.add
      .rectangle(x, y, ancho, alto - 4, color)
      .setOrigin(ox, 0.5)
      .setScrollFactor(0)
      .setDepth(HUD_PROFUNDIDAD + 2);

    this.etiqueta = scene.add
      .text(haciaIzquierda ? x - ancho / 2 : x + ancho / 2, y, "", {
        fontSize: "11px",
        fontFamily: "monospace",
        color: "#e6edf3",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(HUD_PROFUNDIDAD + 3);
  }

  /** progreso: 0 = recién usada · 1 = lista */
  actualizar(progreso) {
    const p = Phaser.Math.Clamp(progreso, 0, 1);
    this.relleno.width = this.ancho * p;

    const lista = p >= 1;
    if (lista === this.lista) return; // sin cambio de estado: nada que hacer
    this.lista = lista;

    if (lista) {
      this.relleno.fillColor = this.color;
      this.etiqueta.setText("LISTA");
      this.pulso = this.scene.tweens.add({
        targets: this.relleno,
        alpha: { from: 1, to: 0.55 },
        duration: 620,
        yoyo: true,
        repeat: -1,
      });
    } else {
      if (this.pulso) {
        this.pulso.stop();
        this.pulso = null;
      }
      this.relleno.alpha = 1;
      this.relleno.fillColor = 0x4a5568; // gris apagado mientras recarga
      this.etiqueta.setText("RECARGANDO");
    }
  }

  destruir() {
    if (this.pulso) this.pulso.stop();
    [this.pista, this.relleno, this.etiqueta].forEach((o) => o && o.destroy());
  }
}

class PanelJugador {
  /**
   * @param {object} o
   *   x, y          esquina superior del panel (y del borde exterior)
   *   color         color de acento (0xff3333)
   *   textura       clave de textura del tanque
   *   nombre        etiqueta corta ("ROJO")
   *   alineacion    "izquierda" | "derecha"
   *   anguloIcono   rotación del icono en grados
   */
  constructor(scene, o) {
    const ANCHO = 250;
    const ALTO = 100;
    const derecha = o.alineacion === "derecha";
    const px = derecha ? o.x - ANCHO : o.x;
    const D = HUD_PROFUNDIDAD;

    this.scene = scene;
    this.elementos = [];

    const reg = (obj) => {
      this.elementos.push(obj);
      return obj;
    };

    // Fondo y borde
    reg(
      scene.add
        .rectangle(px, o.y, ANCHO, ALTO, 0x0d1117, 0.74)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(D)
        .setStrokeStyle(2, o.color, 0.85),
    );
    // Franja de acento en el borde exterior
    reg(
      scene.add
        .rectangle(derecha ? px + ANCHO - 5 : px, o.y, 5, ALTO, o.color)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(D + 1),
    );

    // Icono del tanque
    const iconoX = derecha ? px + ANCHO - 46 : px + 46;
    reg(
      scene.add
        .image(iconoX, o.y + 34, o.textura)
        .setDisplaySize(58, 44)
        .setAngle(o.anguloIcono ?? (derecha ? 90 : -90))
        .setScrollFactor(0)
        .setDepth(D + 2),
    );

    // Marcador
    const textoX = derecha ? px + ANCHO - 92 : px + 92;
    const origenX = derecha ? 1 : 0;
    this.marcador = reg(
      scene.add
        .text(textoX, o.y + 6, "0", {
          fontSize: "40px",
          fontFamily: "Arial Black",
          color: Phaser.Display.Color.IntegerToColor(o.color).rgba,
          stroke: "#000000",
          strokeThickness: 5,
        })
        .setOrigin(origenX, 0)
        .setScrollFactor(0)
        .setDepth(D + 2),
    );

    // Nombre del jugador
    reg(
      scene.add
        .text(textoX, o.y + 52, o.nombre, {
          fontSize: "13px",
          fontFamily: "monospace",
          color: "#8b949e",
        })
        .setOrigin(origenX, 0)
        .setScrollFactor(0)
        .setDepth(D + 2),
    );

    // Barra de habilidad
    this.barra = new BarraCooldown(
      scene,
      derecha ? px + ANCHO - 14 : px + 14,
      o.y + 80,
      o.color,
      222,
      14,
      derecha,
    );
  }

  setMarcador(valor) {
    this.marcador.setText(String(valor));
  }

  /** progreso: 0 = recién usada · 1 = lista */
  actualizarCooldown(progreso) {
    this.barra.actualizar(progreso);
  }

  destruir() {
    this.barra.destruir();
    this.elementos.forEach((o) => o && o.destroy());
  }
}
