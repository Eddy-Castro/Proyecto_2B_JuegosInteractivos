class Bala extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBounce(1);
    this.setCollideWorldBounds(true);

    this.tiempoVida = null;
  }

  disparar(x, y, angulo) {
    if (!this.body) return; // blindaje: nunca operar sobre un cuerpo destruido

    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.setScale(2);

    this.scene.physics.velocityFromRotation(angulo, 300, this.body.velocity);

    this.rebotes = 0;
    this.maxRebotes = 4;

    if (this.tiempoVida) {
      this.tiempoVida.remove();
    }

    this.tiempoVida = this.scene.time.delayedCall(6000, () => {
      this.desactivar();
    });
  }

  registrarRebote() {
    this.rebotes++;
    if (this.rebotes > this.maxRebotes) this.desactivar();
  }

  desactivar() {
    if (!this.body) return; // blindaje

    this.setActive(false);
    this.setVisible(false);
    this.body.stop();

    if (this.tiempoVida) {
      this.tiempoVida.remove();
      this.tiempoVida = null;
    }
  }
}
