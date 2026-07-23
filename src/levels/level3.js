/* ESCENA NIVEL 3 */

class Level3 extends Phaser.Scene {
  constructor() {
    super({ key: "Level3" });
  }

  preload() {
    this.load.image(
      "tiles_nivel3",
      "resources/img/spritesheet-tiles-default.png",
    );
    this.load.tilemapTiledJSON("mapa_nivel3", "resources/maps/mapa3.json");
    this.load.image("tanque_verde", "resources/img/tanqueVerde.png");
    this.load.image("mina", "resources/img/mina.png");
  }

  create() {
    // --- ESTADOS DE LA RONDA ---
    this.isResetting = false;
    this.muerto1 = false;
    this.muerto2 = false;

    this.input.keyboard.once("keydown-ESC", () => {
      this.scene.stop("UIScene");
      this.scene.start("MenuScene");
    });

    // --- CONSTRUCCIÓN DEL MAPA ---
    this.mapa = this.make.tilemap({ key: "mapa_nivel3" });

    this.capaParedes = null;
    this.capaBarro = null;

    if (this.mapa.tilesets.length > 0) {
      const tileset = this.mapa.addTilesetImage(
        "spritesheet-tiles-default",
        "tiles_nivel3",
        64,
        64,
        0,
        1,
      );
      this.mapa.createLayer("Suelo", tileset, 0, 0);
      this.capaBarro = this.mapa.createLayer("Barro", tileset, 0, 0);
      this.capaParedes = this.mapa.createLayer("Paredes", tileset, 0, 0);

      if (this.capaParedes) {
        this.capaParedes.setCollisionByExclusion([-1]);
      }

      // El barro comparte GID con el suelo: sin esto es invisible (G1/#5).
      if (this.capaBarro) {
        this.capaBarro.setTint(0x7a5c38);
        this.capaBarro.setAlpha(0.85);
        this.capaBarro.setDepth(0.5);
      }
    }

    this.minas = this.physics.add.staticGroup();

    // --- JUGADOR 1 y JUGADOR 2 (misma facción: Hijos del Páramo) ---
    const spawnA = obtenerPuntoSpawnValido(this.mapa, this.capaParedes);
    const spawnB = obtenerPuntoSpawnValidoLejos(
      this.mapa,
      this.capaParedes,
      spawnA,
      400,
    );
    this.jugador = new TanqueVerde(this, spawnA.x, spawnA.y, "tanque_verde", "wasd");
    this.jugador1 = new TanqueVerde(this, spawnB.x, spawnB.y, "tanque_verde", "flechas");

    // Los tanques son idénticos (misma facción): un anillo de color bajo
    // cada uno los distingue sin tocar setTint(), que ya usan el barro y
    // las minas para señalizar su propio estado (ver nota de G2 al respecto).
    this.marcador1 = this.add.circle(spawnA.x, spawnA.y, 24, 0x2ecc71, 0)
      .setStrokeStyle(3, 0x2ecc71, 1)
      .setDepth(1);
    this.marcador2 = this.add.circle(spawnB.x, spawnB.y, 24, 0xffaa33, 0)
      .setStrokeStyle(3, 0xffaa33, 1)
      .setDepth(1);

    // --- CÁMARA Y LÍMITES (usar el tamaño real del mapa, no un valor fijo) ---
    this.physics.world.setBounds(0, 0, this.mapa.widthInPixels, this.mapa.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.mapa.widthInPixels, this.mapa.heightInPixels);
    this.cameras.main.startFollow(this.jugador);

    // --- SISTEMA DE COLISIONES ---
    this.configurarColisiones();

    // --- HUD DE PUNTUACIÓN ---
    const scoreVerde1 = this.registry.get("scoreVerde1") || 0;
    const scoreVerde2 = this.registry.get("scoreVerde2") || 0;
    const anchoPantalla = this.cameras.main.width;

    this.add
      .image(60, 60, "tanque_verde")
      .setScale(0.15)
      .setAngle(-90)
      .setTint(0x2ecc71)
      .setScrollFactor(0)
      .setDepth(100);
    this.add
      .text(120, 35, `${scoreVerde1}`, {
        fontSize: "48px",
        fill: "#2ecc71",
        fontFamily: "Arial Black",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.add
      .image(anchoPantalla - 60, 60, "tanque_verde")
      .setScale(0.15)
      .setAngle(90)
      .setTint(0xffaa33)
      .setScrollFactor(0)
      .setDepth(100);
    this.add
      .text(anchoPantalla - 150, 35, `${scoreVerde2}`, {
        fontSize: "48px",
        fill: "#ffaa33",
        fontFamily: "Arial Black",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  update() {
    if (this.jugador && this.jugador.active) {
      this.jugador.actualizar();
      this.marcador1.setPosition(this.jugador.x, this.jugador.y);
    }
    if (this.jugador1 && this.jugador1.active) {
      this.jugador1.actualizar();
      this.marcador2.setPosition(this.jugador1.x, this.jugador1.y);
    }
    this.gestionarBarro();
  }

  configurarColisiones() {
    if (this.capaParedes) {
      this.physics.add.collider(this.jugador, this.capaParedes);
      this.physics.add.collider(this.jugador1, this.capaParedes);
      this.physics.add.collider(this.jugador.balas, this.capaParedes, (a, b) => {
        const bala = a.registrarRebote ? a : b;
        bala.registrarRebote();
        if (this.audio) this.audio.reproducir("rebote");
      });
      this.physics.add.collider(this.jugador1.balas, this.capaParedes, (a, b) => {
        const bala = a.registrarRebote ? a : b;
        bala.registrarRebote();
        if (this.audio) this.audio.reproducir("rebote");
      });
    }

    // Colisión tanque↔tanque: ya no se atraviesan
    this.physics.add.collider(this.jugador, this.jugador1);

    // Minas: cualquiera de los dos puede pisarlas (el propietario es inmune,
    // lo resuelve MinaOxido.detonar())
    this.physics.add.overlap(this.jugador, this.minas, this.pisarMina, null, this);
    this.physics.add.overlap(this.jugador1, this.minas, this.pisarMina, null, this);

    // Fuego cruzado
    this.physics.add.collider(
      this.jugador.balas,
      this.jugador1,
      this.impactoJugador,
      null,
      this,
    );
    this.physics.add.collider(
      this.jugador1.balas,
      this.jugador,
      this.impactoJugador,
      null,
      this,
    );

    // Fuego propio (balas rebotadas)
    this.physics.add.collider(
      this.jugador.balas,
      this.jugador,
      this.impactoJugador,
      null,
      this,
    );
    this.physics.add.collider(
      this.jugador1.balas,
      this.jugador1,
      this.impactoJugador,
      null,
      this,
    );
  }

  pisarMina(jugador, mina) {
    mina.detonar(jugador);
  }

  impactoJugador(a, b) {
    const bala = a.disparar ? a : b;
    const victima = a.disparar ? b : a;
    if (victima.esInvulnerable) {
      bala.desactivar();
      return;
    }

    this.cameras.main.shake(250, 0.012);
    this.cameras.main.flash(120, 255, 80, 80);
    victima.disableBody(true, true);
    bala.desactivar();

    if (victima === this.jugador) this.muerto1 = true;
    if (victima === this.jugador1) this.muerto2 = true;

    if (!this.isResetting) {
      this.isResetting = true;
      this.cameras.main.stopFollow();

      this.time.delayedCall(3000, () => {
        this.evaluarRonda();
      });
    }
  }

  evaluarRonda() {
    let scoreVerde1 = this.registry.get("scoreVerde1") || 0;
    let scoreVerde2 = this.registry.get("scoreVerde2") || 0;

    if (this.muerto1 && this.muerto2) {
      console.log("¡Empate! Ambos fueron destruidos.");
    } else if (this.muerto1) {
      this.registry.set("scoreVerde2", scoreVerde2 + 1);
    } else if (this.muerto2) {
      this.registry.set("scoreVerde1", scoreVerde1 + 1);
    }

    this.scene.restart();
  }

  gestionarBarro() {
    if (!this.capaBarro) return;

    [this.jugador, this.jugador1].forEach((t) => {
      if (!t || !t.active || !t.body) return;
      const tile = this.capaBarro.getTileAtWorldXY(t.x, t.y);
      const enBarro = tile && tile.index !== -1;

      if (enBarro && !t.estabaEnBarro) {
        t.setDrag(800);
        t.setMaxVelocity((t.velocidadMaximaBase || 350) * 0.45);
        t.setTint(0x8a6a44); // el tanque se ve embarrado
        t.estabaEnBarro = true;
      } else if (!enBarro && t.estabaEnBarro) {
        t.setDrag(50);
        t.setMaxVelocity(t.velocidadMaximaBase || 350);
        t.clearTint();
        t.estabaEnBarro = false;
      }

      // Salpicaduras mientras avanza por el barro
      if (enBarro && t.body.velocity.length() > 40 && this.time.now > (t.proximaSalpicadura || 0)) {
        t.proximaSalpicadura = this.time.now + 120;
        const gota = this.add.circle(
          t.x + Phaser.Math.Between(-18, 18),
          t.y + Phaser.Math.Between(-18, 18),
          Phaser.Math.Between(3, 6), 0x6b4f2a, 0.7
        ).setDepth(2);
        this.tweens.add({ targets: gota, alpha: 0, duration: 800, onComplete: () => gota.destroy() });
      }
    });
  }
}
