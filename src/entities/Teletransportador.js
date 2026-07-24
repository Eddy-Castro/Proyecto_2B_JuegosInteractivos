/* ENTIDADES NIVEL 2 */

class Teletransportador extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, destinoX, destinoY) {
    super(scene, x, y, "portal");
    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.destinoX = destinoX;
    this.destinoY = destinoY;
    this.cooldownPorJugador = new Map(); // jugador -> timestamp

    this.setDepth(5);
    scene.tweens.add({
      targets: this,
      scale: { from: 0.9, to: 1.15 },
      alpha: { from: 0.75, to: 1 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
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
