class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  create() {
    const cx = this.scale.width / 2; // 640
    const cy = this.scale.height / 2; // 480

    const ganador = this.registry.get("ganador");
    const r = this.registry.get("scoreRojo") || 0;
    const a = this.registry.get("scoreAzul") || 0;

    this.add
      .text(
        cx,
        cy - 180,
        ganador ? `¡GANA EL TANQUE ${ganador}!` : "FIN DE LA PARTIDA",
        {
          fontSize: "56px",
          fill: ganador === "ROJO" ? "#ff3333" : ganador === "AZUL" ? "#3366ff" : "#ff0000",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 8,
        },
      )
      .setOrigin(0.5);

    this.add
      .text(cx, cy - 60, `ROJO ${r}  —  ${a} AZUL`, {
        fontSize: "40px",
        fill: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    const btnMenu = this.add
      .text(cx, cy + 120, "[ VOLVER AL MENÚ ]", {
        fontSize: "24px",
        fill: "#ffff00",
      })
      .setOrigin(0.5)
      .setInteractive();

    btnMenu.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });
  }
}
