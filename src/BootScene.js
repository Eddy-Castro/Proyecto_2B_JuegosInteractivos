class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    this.mostrarBarraDeCarga();

    // Aviso en consola si algún asset falla (clave para depurar en GitHub Pages)
    this.load.on("loaderror", (file) => {
      console.error("[BootScene] Falló la carga:", file.key, "->", file.url);
    });

    // --- TILESET Y MAPAS ---
    this.load.image("tiles", "resources/img/spritesheet-tiles-default.png");
    this.load.tilemapTiledJSON("mapa_nivel1", "resources/maps/mapa_nuevo.json");
    this.load.tilemapTiledJSON("mapa_nivel2", "resources/maps/mapa2.json");
    this.load.tilemapTiledJSON("mapa_nivel3", "resources/maps/mapa3.json");

    // --- SPRITES ---
    // Se cargan aquí, y no en cada nivel, para tener un único punto de carga:
    // evita el warning "Texture key already in use" al saltar entre niveles que
    // compartían claves, y deja los tanques disponibles para el menú.
    this.load.image("tanque_rojo", "resources/img/tanqueRojo.png");
    this.load.image("tanque_azul", "resources/img/tanqueAzul.png");
    this.load.image("tanque_verde", "resources/img/tanqueVerde.png");
    this.load.image("bala", "resources/img/bala.png");
    this.load.image("caja_destructible", "resources/img/caja.png");
    this.load.image("muro_habilidad", "resources/img/muro.png");
    this.load.image("portal", "resources/img/portal.png");
    this.load.image("mina", "resources/img/mina.png");

    // --- SFX (E3) ---
    ["disparo", "rebote", "explosion", "habilidad", "portal", "mina", "ronda"].forEach((k) =>
      this.load.audio(k, `resources/audio/${k}.ogg`),
    );

    // --- MÚSICA (G3) ---
    ["musica_menu", "musica_nivel1", "musica_nivel2", "musica_nivel3"].forEach((k) =>
      this.load.audio(k, `resources/audio/${k}.ogg`),
    );
  }

  create() {
    // El gestor de música vive en el objeto game, no en una escena, para
    // sobrevivir a scene.restart() y a los cambios de escena (G3).
    this.game.musica = new MusicManager(this.game);
    this.scene.start("MenuScene");
  }

  mostrarBarraDeCarga() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add
      .text(cx, cy - 70, "LABERINTO DE ACERO", {
        fontSize: "34px",
        fontFamily: "Arial Black",
        color: "#e6edf3",
      })
      .setOrigin(0.5);

    const ANCHO = 460;
    const marco = this.add
      .rectangle(cx, cy, ANCHO, 22, 0x000000, 0)
      .setStrokeStyle(2, 0x3d4756);
    const relleno = this.add
      .rectangle(cx - ANCHO / 2 + 3, cy, 0, 14, 0xffb020)
      .setOrigin(0, 0.5);
    const pct = this.add
      .text(cx, cy + 34, "0 %", {
        fontSize: "16px",
        fontFamily: "monospace",
        color: "#8b949e",
      })
      .setOrigin(0.5);

    this.load.on("progress", (v) => {
      relleno.width = (ANCHO - 6) * v;
      pct.setText(Math.round(v * 100) + " %");
    });
    this.load.on("complete", () => {
      marco.destroy();
      relleno.destroy();
      pct.destroy();
    });
  }
}
