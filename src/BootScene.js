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

    ["disparo", "rebote", "explosion", "habilidad", "portal", "mina", "ronda"].forEach((k) =>
      this.load.audio(k, `resources/audio/${k}.ogg`),
    );

    ["musica_menu", "musica_nivel1", "musica_nivel2", "musica_nivel3"].forEach((k) =>
      this.load.audio(k, `resources/audio/${k}.ogg`),
    );
  }

  create() {
    this.game.musica = new MusicManager(this.game);
    this.scene.start("MenuScene");
  }
}
