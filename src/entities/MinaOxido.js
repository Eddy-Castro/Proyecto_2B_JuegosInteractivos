/* ENTIDADES NIVEL 3 */

class MinaOxido extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "mina");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setImmovable(true);
  }

  detonar(jugador) {
    this.destroy();

    const maxVelOriginal = 350;
    jugador.setMaxVelocity(maxVelOriginal * 0.2);

    jugador.scene.time.delayedCall(3000, () => {
      jugador.setMaxVelocity(maxVelOriginal);
    });
  }
}
