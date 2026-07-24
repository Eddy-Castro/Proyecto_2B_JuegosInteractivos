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
    this.setScale(2);

    // Reactivar el cuerpo (desactivar() lo apaga) y recolocarlo: body.reset()
    // mueve cuerpo y sprite a la vez y deja la velocidad a cero.
    this.body.enable = true;
    this.body.reset(x, y);

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

    // CLAVE: apagar también el cuerpo físico. Si solo se oculta el sprite, el
    // body sigue vivo y aparcado donde impactó, así que cualquier tanque que
    // pase por ahí choca con una bala invisible y muere sin motivo aparente.
    this.body.enable = false;

    if (this.tiempoVida) {
      this.tiempoVida.remove();
      this.tiempoVida = null;
    }
  }
}
