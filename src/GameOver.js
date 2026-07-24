class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  create() {
    const A = this.scale.width;
    const H = this.scale.height;
    const cx = A / 2;

    this.game.musica?.reproducir("musica_menu");
    this.input.keyboard.on("keydown-O", () => {
      const m = this.game.musica;
      if (!m) return;
      m.volumen = m.volumen > 0 ? 0 : 0.35;
      m.pistaActual?.setVolume(m.volumen);
    });

    // Fondo
    this.add.rectangle(0, 0, A, H, 0x070a0f).setOrigin(0, 0);
    const rejilla = this.add.graphics().setAlpha(0.1);
    rejilla.lineStyle(1, 0x3d4756, 1);
    for (let gx = 0; gx <= A; gx += 64) rejilla.lineBetween(gx, 0, gx, H);
    for (let gy = 0; gy <= H; gy += 64) rejilla.lineBetween(0, gy, A, gy);

    // Cada nivel deja aquí su resultado; si falta, se cae a los valores del Nivel 1.
    const res = this.registry.get("resultado") || {
      ganador: this.registry.get("ganador"),
      colorGanador: "#ff8c1a",
      jugadores: [
        { nombre: "ROJO", score: this.registry.get("scoreRojo") || 0, css: "#ff5a4f", textura: "tanque_rojo" },
        { nombre: "AZUL", score: this.registry.get("scoreAzul") || 0, css: "#5aa0ff", textura: "tanque_azul" },
      ],
    };

    this.add.ellipse(cx, 250, 900, 240, 0xff8c1a, 0.06);

    this.add
      .text(cx, 170, res.ganador ? "VICTORIA" : "FIN DE LA PARTIDA", {
        fontSize: "26px",
        fontFamily: "monospace",
        color: "#8b949e",
      })
      .setOrigin(0.5);

    const titulo = this.add
      .text(cx, 240, res.ganador ? `GANA ${res.ganador}` : "SIN GANADOR", {
        fontSize: "72px",
        fontFamily: "Arial Black",
        color: res.colorGanador || "#e6edf3",
        stroke: "#000000",
        strokeThickness: 10,
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: titulo,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });

    // --- MARCADOR FINAL ---
    this.panelMarcador(cx, 380, res.jugadores);

    // --- BOTÓN ---
    this.boton(cx, 720, "VOLVER AL MENÚ", () => this.scene.start("MenuScene"));

    this.add
      .text(cx, H - 40, "O silenciar música", {
        fontSize: "14px",
        fontFamily: "monospace",
        color: "#6e7681",
      })
      .setOrigin(0.5);
  }

  panelMarcador(cx, y, jugadores) {
    const ANCHO = 760;
    const ALTO = 250;

    this.add
      .rectangle(cx, y, ANCHO, ALTO, 0x0d1117, 0.8)
      .setOrigin(0.5, 0)
      .setStrokeStyle(2, 0x2f3947);

    this.add
      .text(cx, y + 18, "M A R C A D O R   F I N A L", {
        fontSize: "14px",
        fontFamily: "monospace",
        color: "#8b949e",
      })
      .setOrigin(0.5, 0);

    jugadores.slice(0, 2).forEach((j, i) => {
      const jx = cx + (i === 0 ? -170 : 170);

      if (j.textura && this.textures.exists(j.textura)) {
        this.add
          .image(jx, y + 90, j.textura)
          .setDisplaySize(96, 72)
          .setAngle(i === 0 ? -90 : 90);
      }

      this.add
        .text(jx, y + 140, String(j.score), {
          fontSize: "64px",
          fontFamily: "Arial Black",
          color: j.css,
          stroke: "#000000",
          strokeThickness: 6,
        })
        .setOrigin(0.5, 0);

      this.add
        .text(jx, y + 210, j.nombre, {
          fontSize: "16px",
          fontFamily: "monospace",
          color: "#8b949e",
        })
        .setOrigin(0.5, 0);
    });

    this.add
      .text(cx, y + 118, "—", {
        fontSize: "40px",
        fontFamily: "Arial Black",
        color: "#3d4756",
      })
      .setOrigin(0.5);
  }

  boton(x, y, texto, alPulsar) {
    const ANCHO = 320;
    const ALTO = 60;

    const fondo = this.add
      .rectangle(x, y, ANCHO, ALTO, 0x0d1117, 0.9)
      .setStrokeStyle(2, 0xff8c1a, 0.7);
    const etiqueta = this.add
      .text(x, y, texto, {
        fontSize: "20px",
        fontFamily: "Arial Black",
        color: "#e6edf3",
      })
      .setOrigin(0.5);

    const zona = this.add
      .rectangle(x, y, ANCHO, ALTO, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });

    zona.on("pointerover", () => {
      fondo.setStrokeStyle(3, 0xff8c1a, 1);
      fondo.setFillStyle(0x1a212b, 0.95);
      etiqueta.setColor("#ffb020");
    });
    zona.on("pointerout", () => {
      fondo.setStrokeStyle(2, 0xff8c1a, 0.7);
      fondo.setFillStyle(0x0d1117, 0.9);
      etiqueta.setColor("#e6edf3");
    });
    zona.on("pointerdown", () => {
      this.cameras.main.flash(160, 255, 140, 26);
      this.time.delayedCall(110, alPulsar);
    });
  }
}
