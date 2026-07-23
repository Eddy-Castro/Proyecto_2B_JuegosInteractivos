class TanqueBase extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);

    this.setDisplaySize(64, 50);

    this.velocidadRotacion = 0;
    this.aceleracion = 0;

    this.balas = scene.physics.add.group({
      classType: Bala,
      maxSize: 3,
      runChildUpdate: false,
    });
    for (let i = 0; i < 3; i++) {
      const b = new Bala(scene, 0, 0, "bala");
      this.balas.add(b, true);
      b.desactivar();
    }
    this.tiempoUltimoDisparo = 0;
    this.cadenciaMs = 400;
  }

  actualizar() {
    if (!this.teclas || !this.body) return;

    if (this.teclas.izquierda.isDown) {
      this.setAngularVelocity(-this.velocidadRotacion);
    } else if (this.teclas.derecha.isDown) {
      this.setAngularVelocity(this.velocidadRotacion);
    } else {
      this.setAngularVelocity(0);
    }

    if (this.teclas.arriba.isDown) {
      this.scene.physics.velocityFromRotation(
        this.rotation,
        this.aceleracion,
        this.body.acceleration,
      );
    } else if (this.teclas.abajo.isDown) {
      this.scene.physics.velocityFromRotation(
        this.rotation,
        -this.aceleracion / 2,
        this.body.acceleration,
      );
    } else {
      this.setAcceleration(0);
    }
  }

  intentarDisparo() {
    const ahora = this.scene.time.now;
    if (ahora < this.tiempoUltimoDisparo + this.cadenciaMs) return;

    const bala = this.balas.getChildren().find((b) => !b.active);
    if (!bala) return; // las 3 balas están en vuelo

    this.tiempoUltimoDisparo = ahora;

    const distancia = 35;
    const balaX = this.x + Math.cos(this.rotation) * distancia;
    const balaY = this.y + Math.sin(this.rotation) * distancia;
    bala.disparar(balaX, balaY, this.rotation);

    // RETROCESO: empuja el tanque hacia atrás
    const retroceso = 120;
    this.scene.physics.velocityFromRotation(
      this.rotation + Math.PI,
      retroceso,
      this.body.velocity,
    );

    // SCREEN SHAKE corto
    this.scene.cameras.main.shake(80, 0.004);

    // FOGONAZO: destello que se desvanece
    const flash = this.scene.add
      .circle(balaX, balaY, 14, 0xffdd55, 0.9)
      .setDepth(50);
    this.scene.tweens.add({
      targets: flash,
      scale: 0,
      alpha: 0,
      duration: 120,
      onComplete: () => flash.destroy(),
    });

    if (this.scene.audio) this.scene.audio.reproducir("disparo");
  }
}

/* Tanque Rojo*/
class TanqueRojo extends TanqueBase {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    this.setMaxVelocity(100);
    this.setDrag(800);
    this.velocidadRotacion = 150;
    this.aceleracion = 300;
    this.velocidadMaximaBase = 100;

    this.teclas = scene.input.keyboard.addKeys({
      arriba: Phaser.Input.Keyboard.KeyCodes.W,
      abajo: Phaser.Input.Keyboard.KeyCodes.S,
      izquierda: Phaser.Input.Keyboard.KeyCodes.A,
      derecha: Phaser.Input.Keyboard.KeyCodes.D,
      disparo: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.tiempoHabilidad = 0;
    scene.input.keyboard.on("keydown-E", this.activarMuro, this);
    scene.input.keyboard.on("keydown-SPACE", this.intentarDisparo, this);
  }

  activarMuro() {
    if (this.scene.time.now > this.tiempoHabilidad) {
      const distancia = 65;
      const muroX = this.x + Math.cos(this.rotation) * distancia;
      const muroY = this.y + Math.sin(this.rotation) * distancia;

      const muro = new MuroTrinchera(this.scene, muroX, muroY);

      const escalaLargo = 0.5;
      const escalaGrosor = 0.1;
      muro.setScale(escalaLargo, escalaGrosor);

      let anguloObjetivo = this.rotation + Math.PI / 2;
      muro.rotation = Phaser.Math.Snap.To(anguloObjetivo, Math.PI / 2);

      this.scene.muros.add(muro);

      // Calculamos cuánto mide la imagen realmente en píxeles
      const anchoEscalado = muro.width * escalaLargo;
      const altoEscalado = muro.height * escalaGrosor;

      const esVertical = Math.abs(Math.cos(muro.rotation)) < 0.1;

      if (esVertical) {
        muro.body.width = altoEscalado;
        muro.body.height = anchoEscalado;
      } else {
        muro.body.width = anchoEscalado;
        muro.body.height = altoEscalado;
      }

      muro.body.x = muroX - muro.body.width / 2;
      muro.body.y = muroY - muro.body.height / 2;

      this.tiempoHabilidad = this.scene.time.now + 10000;
    }
  }
}

class TanqueAzul extends TanqueBase {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    this.setMaxVelocity(250);
    this.setDrag(200);
    this.velocidadRotacion = 300;
    this.aceleracion = 150;
    this.velocidadMaximaBase = 250;

    this.teclas = scene.input.keyboard.addKeys({
      arriba: Phaser.Input.Keyboard.KeyCodes.UP,
      abajo: Phaser.Input.Keyboard.KeyCodes.DOWN,
      izquierda: Phaser.Input.Keyboard.KeyCodes.LEFT,
      derecha: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      disparo: Phaser.Input.Keyboard.KeyCodes.M,
    });

    this.tiempoHabilidad = 0;
    this.esInvulnerable = false;

    scene.input.keyboard.on("keydown-N", this.activarDash, this);
    scene.input.keyboard.on("keydown-M", this.intentarDisparo, this);
  }

  activarDash() {
    if (this.scene.time.now > this.tiempoHabilidad) {
      this.esInvulnerable = true;
      this.scene.physics.velocityFromRotation(
        this.rotation,
        600,
        this.body.velocity,
      );
      this.scene.time.delayedCall(300, () => {
        this.esInvulnerable = false;
      });
      this.tiempoHabilidad = this.scene.time.now + 3000;
    }
  }
}

class TanqueVerde extends TanqueBase {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    this.setMaxVelocity(350);
    this.velocidadMaximaBase = 350;
    this.setDrag(50);
    this.velocidadRotacion = 250;
    this.aceleracion = 400;

    this.teclas = scene.input.keyboard.addKeys({
      arriba: Phaser.Input.Keyboard.KeyCodes.W,
      abajo: Phaser.Input.Keyboard.KeyCodes.S,
      izquierda: Phaser.Input.Keyboard.KeyCodes.A,
      derecha: Phaser.Input.Keyboard.KeyCodes.D,
      disparo: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.tiempoHabilidad = 0;
    this.cooldownMina = 8000;

    scene.input.keyboard.on("keydown-E", this.colocarMina, this);
    scene.input.keyboard.on("keydown-SPACE", this.intentarDisparo, this);
  }

  colocarMina() {
    if (this.scene.time.now < this.tiempoHabilidad) return;
    if (!this.active || !this.body) return;

    const mina = new MinaOxido(this.scene, this.x, this.y, this);
    this.scene.minas.add(mina);
    this.scene.audio?.reproducir("habilidad");
    this.tiempoHabilidad = this.scene.time.now + this.cooldownMina;
  }
}
