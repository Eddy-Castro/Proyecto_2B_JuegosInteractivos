class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create() {
    const A = this.scale.width; // 1280
    const H = this.scale.height; // 960
    const cx = A / 2;

    // Los navegadores bloquean el audio hasta la primera interacción del usuario
    this.input.once("pointerdown", () => {
      if (this.sound.context.state === "suspended") this.sound.context.resume();
    });

    this.game.musica?.reproducir("musica_menu");
    this.registrarTeclaMusica();

    this.fondo();

    // --- TÍTULO ---
    this.add
      .text(cx, 150, "LABERINTO DE ACERO", {
        fontSize: "68px",
        fontFamily: "Arial Black",
        color: "#e6edf3",
        stroke: "#000000",
        strokeThickness: 10,
      })
      .setOrigin(0.5)
      .setShadow(0, 6, "#ff8c1a", 18, false, true);

    this.add
      .rectangle(cx, 205, 520, 3, 0xff8c1a, 0.9).setOrigin(0.5);

    this.add
      .text(cx, 236, "D U E L O   D E   T A N Q U E S   ·   2   J U G A D O R E S", {
        fontSize: "17px",
        fontFamily: "monospace",
        color: "#8b949e",
      })
      .setOrigin(0.5);

    // --- TARJETAS DE NIVEL ---
    const tarjetas = [
      {
        nivel: "NIVEL 1",
        nombre: "IMPERIO DE HIERRO",
        lema: "Blindaje pesado · Muro de trinchera",
        textura: "tanque_rojo",
        color: 0xff3b30,
        css: "#ff5a4f",
        escena: "Level1",
      },
      {
        nivel: "NIVEL 2",
        nombre: "SINDICATO DE NEÓN",
        lema: "Veloz y evasivo · Portales",
        textura: "tanque_azul",
        color: 0x3d8bff,
        css: "#5aa0ff",
        escena: "Level2",
      },
      {
        nivel: "NIVEL 3",
        nombre: "HIJOS DEL PÁRAMO",
        lema: "Emboscada · Minas y barro",
        textura: "tanque_verde",
        color: 0x2ecc71,
        css: "#4ade80",
        escena: "Level3",
      },
    ];

    const ANCHO = 356;
    const SEP = 30;
    const total = tarjetas.length * ANCHO + (tarjetas.length - 1) * SEP;
    let x = cx - total / 2;

    tarjetas.forEach((t) => {
      this.crearTarjeta(x, 320, ANCHO, 300, t);
      x += ANCHO + SEP;
    });

    // --- CONTROLES ---
    this.panelControles(cx, 700);

    this.add
      .text(cx, H - 34, "ESC volver al menú   ·   P silenciar efectos   ·   O silenciar música", {
        fontSize: "15px",
        fontFamily: "monospace",
        color: "#6e7681",
      })
      .setOrigin(0.5);
  }

  /** Fondo oscuro con rejilla y partículas lentas de ceniza. */
  fondo() {
    const A = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(0, 0, A, H, 0x070a0f).setOrigin(0, 0);

    const rejilla = this.add.graphics().setAlpha(0.13);
    rejilla.lineStyle(1, 0x3d4756, 1);
    for (let gx = 0; gx <= A; gx += 64) rejilla.lineBetween(gx, 0, gx, H);
    for (let gy = 0; gy <= H; gy += 64) rejilla.lineBetween(0, gy, A, gy);

    // Resplandor cálido detrás del título
    this.add.ellipse(A / 2, 150, 900, 260, 0xff8c1a, 0.05);

    // Ceniza a la deriva
    for (let i = 0; i < 26; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(0, A),
        Phaser.Math.Between(0, H),
        Phaser.Math.Between(1, 3),
        0xff8c1a,
        Phaser.Math.FloatBetween(0.12, 0.4),
      );
      this.tweens.add({
        targets: p,
        y: p.y - Phaser.Math.Between(120, 320),
        x: p.x + Phaser.Math.Between(-40, 40),
        alpha: 0,
        duration: Phaser.Math.Between(6000, 13000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 4000),
        onRepeat: () => {
          p.y = H + 10;
          p.x = Phaser.Math.Between(0, A);
          p.alpha = Phaser.Math.FloatBetween(0.12, 0.4);
        },
      });
    }
  }

  crearTarjeta(x, y, ancho, alto, t) {
    const cxT = x + ancho / 2;

    const fondo = this.add
      .rectangle(x, y, ancho, alto, 0x0d1117, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, t.color, 0.55);

    // Franja superior de acento
    const franja = this.add
      .rectangle(x, y, ancho, 5, t.color)
      .setOrigin(0, 0);

    const icono = this.add
      .image(cxT, y + 106, t.textura)
      .setDisplaySize(150, 114)
      .setAngle(-90);

    const nivel = this.add
      .text(cxT, y + 182, t.nivel, {
        fontSize: "14px",
        fontFamily: "monospace",
        color: "#8b949e",
      })
      .setOrigin(0.5);

    const nombre = this.add
      .text(cxT, y + 212, t.nombre, {
        fontSize: "23px",
        fontFamily: "Arial Black",
        color: t.css,
      })
      .setOrigin(0.5);

    const lema = this.add
      .text(cxT, y + 246, t.lema, {
        fontSize: "13px",
        fontFamily: "monospace",
        color: "#6e7681",
        align: "center",
      })
      .setOrigin(0.5);

    const jugar = this.add
      .text(cxT, y + 274, "▶  JUGAR", {
        fontSize: "15px",
        fontFamily: "Arial Black",
        color: "#e6edf3",
      })
      .setOrigin(0.5)
      .setAlpha(0.45);

    // Zona interactiva sobre toda la tarjeta
    const zona = this.add
      .rectangle(x, y, ancho, alto, 0xffffff, 0)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    zona.on("pointerover", () => {
      fondo.setStrokeStyle(3, t.color, 1);
      fondo.setFillStyle(0x141b24, 0.95);
      jugar.setAlpha(1);
      this.tweens.add({ targets: icono, scaleX: icono.scaleX * 1.08, scaleY: icono.scaleY * 1.08, duration: 160 });
      this.tweens.add({ targets: [franja], alpha: 1, duration: 160 });
    });

    zona.on("pointerout", () => {
      fondo.setStrokeStyle(2, t.color, 0.55);
      fondo.setFillStyle(0x0d1117, 0.9);
      jugar.setAlpha(0.45);
      this.tweens.add({ targets: icono, scaleX: icono.scaleX / 1.08, scaleY: icono.scaleY / 1.08, duration: 160 });
    });

    zona.on("pointerdown", () => {
      this.cameras.main.flash(180, 255, 140, 26);
      this.time.delayedCall(120, () => this.iniciarNivel(t.escena));
    });

    // Latido sutil de la franja
    this.tweens.add({
      targets: franja,
      alpha: { from: 0.55, to: 1 },
      duration: 1600,
      yoyo: true,
      repeat: -1,
    });
  }

  panelControles(cx, y) {
    const ANCHO = 1100;
    const ALTO = 172;

    this.add
      .rectangle(cx, y, ANCHO, ALTO, 0x0d1117, 0.72)
      .setOrigin(0.5, 0)
      .setStrokeStyle(1, 0x2f3947);

    this.add
      .text(cx, y + 16, "C O N T R O L E S", {
        fontSize: "15px",
        fontFamily: "monospace",
        color: "#8b949e",
      })
      .setOrigin(0.5, 0);

    const columnas = [
      {
        titulo: "JUGADOR 1",
        css: "#ff5a4f",
        filas: [
          ["Mover", "W  A  S  D"],
          ["Disparar", "ESPACIO"],
          ["Habilidad", "E"],
        ],
      },
      {
        titulo: "JUGADOR 2",
        css: "#5aa0ff",
        filas: [
          ["Mover", "↑  ←  ↓  →"],
          ["Disparar", "M"],
          ["Habilidad", "N"],
        ],
      },
    ];

    const anchoCol = 420;
    columnas.forEach((col, i) => {
      const colX = cx + (i === 0 ? -anchoCol / 2 - 60 : anchoCol / 2 + 60);

      this.add
        .text(colX, y + 52, col.titulo, {
          fontSize: "18px",
          fontFamily: "Arial Black",
          color: col.css,
        })
        .setOrigin(0.5, 0);

      col.filas.forEach((f, j) => {
        const fy = y + 86 + j * 26;
        this.add
          .text(colX - 130, fy, f[0], {
            fontSize: "14px",
            fontFamily: "monospace",
            color: "#8b949e",
          })
          .setOrigin(0, 0);
        this.add
          .text(colX + 130, fy, f[1], {
            fontSize: "14px",
            fontFamily: "monospace",
            color: "#e6edf3",
          })
          .setOrigin(1, 0);
      });
    });

    // Separador vertical entre columnas
    this.add.rectangle(cx, y + 50, 1, 100, 0x2f3947).setOrigin(0.5, 0);
  }

  registrarTeclaMusica() {
    this.input.keyboard.on("keydown-O", () => {
      const m = this.game.musica;
      if (!m) return;
      m.volumen = m.volumen > 0 ? 0 : 0.35;
      m.pistaActual?.setVolume(m.volumen);
      console.log(m.volumen > 0 ? "Música activada" : "Música silenciada");
    });
  }

  iniciarNivel(nivelKey) {
    this.registry.set("scoreRojo", 0);
    this.registry.set("scoreAzul", 0);
    this.registry.set("scoreVerde1", 0);
    this.registry.set("scoreVerde2", 0);
    this.registry.set("ganador", null);

    this.scene.start(nivelKey);
  }
}
