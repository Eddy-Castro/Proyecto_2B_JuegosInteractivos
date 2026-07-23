/* ENTIDADES NIVEL 2 */

class Teletransportador extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, destinoX, destinoY) {
    super(scene, x, y, "portal");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.destinoX = destinoX;
    this.destinoY = destinoY;
    this.enCooldown = false;
  }

  teletransportar(jugador) {
    if (!this.enCooldown) {
      jugador.setPosition(this.destinoX, this.destinoY);
      this.enCooldown = true;

      this.scene.time.delayedCall(1000, () => {
        this.enCooldown = false;
      });
    }
  }
}
