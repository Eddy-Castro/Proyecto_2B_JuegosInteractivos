/* ENTIDADES NIVEL 3 */

class MinaOxido extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, propietario) {
    super(scene, x, y, "mina");
    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.propietario = propietario;
    this.armada = false;
    this.setDepth(3);
    this.setScale(0.6);

    // Fase de armado: 1.5 s parpadeando en rojo, aún inofensiva
    this.setTint(0x884444);
    const parpadeo = scene.tweens.add({
      targets: this, alpha: { from: 1, to: 0.35 },
      duration: 200, yoyo: true, repeat: -1,
    });

    scene.time.delayedCall(1500, () => {
      if (!this.active) return;
      parpadeo.stop();
      this.armada = true;
      this.setAlpha(1);
      this.clearTint();
      // Pulso lento = está lista
      scene.tweens.add({
        targets: this, scale: { from: 0.6, to: 0.72 },
        duration: 700, yoyo: true, repeat: -1,
      });
    });

    // Autodestrucción a los 20 s para no llenar el mapa
    scene.time.delayedCall(20000, () => { if (this.active) this.destroy(); });
  }

  detonar(jugador) {
    if (!this.armada) return;
    if (jugador === this.propietario) return; // no te matan tus propias minas

    const escena = jugador.scene;
    escena.audio?.reproducir("mina");
    escena.cameras.main.shake(300, 0.015);

    // VFX de detonación
    const humo = escena.add.circle(this.x, this.y, 12, 0x996644, 0.85).setDepth(60);
    escena.tweens.add({
      targets: humo, radius: 100, alpha: 0, duration: 600,
      onComplete: () => humo.destroy(),
    });

    // EFECTO: ralentiza al enemigo 3 segundos. Componemos con el barro (flag +
    // aplicarModificadores) en vez de sobrescribir maxVelocity, que se cancelaba
    // con gestionarBarro() del Nivel 3.
    jugador.ralentizadoMina = true;
    jugador.aplicarModificadores();

    escena.time.delayedCall(3000, () => {
      if (!jugador.active || !jugador.body) return;
      jugador.ralentizadoMina = false;
      jugador.aplicarModificadores();
    });

    this.destroy();
  }
}
