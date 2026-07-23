/* ESCENA NIVEL 2 */

class Level2 extends Phaser.Scene {
  constructor() {
    super({ key: "Level2" });
  }

  preload() {
    this.load.image(
      "tiles_nivel2",
      "resources/img/spritesheet-tiles-default.png",
    );
    this.load.tilemapTiledJSON("mapa_nivel2", "resources/maps/mapa2.json");
    this.load.image("tanque_azul", "resources/img/tanqueAzul.png");
    this.load.image("portal", "resources/img/portal.png");
  }

  create() {
    this.input.keyboard.once("keydown-ESC", () => {
      this.scene.stop("UIScene");
      this.scene.start("MenuScene");
    });

    const mapa = this.make.tilemap({ key: "mapa_nivel2" });

    let capaParedes = null;
    if (mapa.tilesets.length > 0) {
      const tileset = mapa.addTilesetImage(
        "spritesheet-tiles-default",
        "tiles_nivel2",
        64,
        64,
        0,
        1,
      );
      mapa.createLayer("Suelo", tileset, 0, 0);
      capaParedes = mapa.createLayer("Paredes", tileset, 0, 0);
      if (capaParedes) {
        capaParedes.setCollisionByExclusion([-1]);
      }
    }

    this.portales = this.physics.add.staticGroup();

    const portalA = new Teletransportador(this, 150, 450, 650, 150);
    const portalB = new Teletransportador(this, 650, 150, 150, 450);

    this.portales.add(portalA);
    this.portales.add(portalB);

    this.jugador = new TanqueAzul(this, 100, 100, "tanque_azul");

    this.physics.world.setBounds(0, 0, 800, 600);
    this.cameras.main.setBounds(0, 0, 800, 600);
    this.cameras.main.startFollow(this.jugador);

    if (capaParedes) {
      this.physics.add.collider(this.jugador, capaParedes);
      this.physics.add.collider(this.jugador.balas, capaParedes);
    }

    this.physics.add.overlap(
      this.jugador,
      this.portales,
      this.usarPortal,
      null,
      this,
    );
    this.physics.add.collider(
      this.jugador.balas,
      this.jugador,
      this.recibirDano,
      null,
      this,
    );
  }

  update() {
    this.jugador.actualizar();
  }

  usarPortal(jugador, portal) {
    portal.teletransportar(jugador);
  }

  recibirDano(a, b) {
    const bala = a.disparar ? a : b;
    const jugador = a.disparar ? b : a;
    if (!jugador.esInvulnerable) {
      bala.desactivar();
      this.scene.stop("UIScene");
      this.scene.start("GameOverScene");
    }
  }
}
