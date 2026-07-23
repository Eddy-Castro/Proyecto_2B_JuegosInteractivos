/* HUD: barras de cooldown de habilidad */

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
