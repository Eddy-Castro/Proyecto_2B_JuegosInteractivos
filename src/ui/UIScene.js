/* INTERFAZ DE USUARIO Y PUNTUACIÓN */

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
