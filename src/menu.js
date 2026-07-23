class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create() {
    const cx = this.scale.width / 2; // 640
    const cy = this.scale.height / 2; // 480

    this.add
      .text(cx, cy - 280, "LABERINTO DE ACERO", {
        fontSize: "40px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    const btnNivel1 = this.add
      .text(cx, cy - 80, "Jugar Nivel 1 - Imperio de Hierro", {
        fontSize: "24px",
        fill: "#ff0000",
      })
      .setOrigin(0.5)
      .setInteractive();
    const btnNivel2 = this.add
      .text(cx, cy, "Jugar Nivel 2 - Sindicato de Neón", {
        fontSize: "24px",
        fill: "#0088ff",
      })
      .setOrigin(0.5)
      .setInteractive();
    const btnNivel3 = this.add
      .text(cx, cy + 80, "Jugar Nivel 3 - Hijos del Páramo", {
        fontSize: "24px",
        fill: "#00ff00",
      })
      .setOrigin(0.5)
      .setInteractive();

    btnNivel1.on("pointerdown", () => this.iniciarNivel("Level1"));
    btnNivel2.on("pointerdown", () => this.iniciarNivel("Level2"));
    btnNivel3.on("pointerdown", () => this.iniciarNivel("Level3"));
  }

  iniciarNivel(nivelKey) {
    this.scene.start(nivelKey);
    this.scene.launch("UIScene");
  }
}
