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
    this.input.keyboard.once("keydown-ESC", () => {
      this.scene.stop("UIScene");
      this.scene.start("MenuScene");
    });

    this.mapa = this.make.tilemap({ key: "mapa_nivel3" });

    let capaParedes = null;
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
      capaParedes = this.mapa.createLayer("Paredes", tileset, 0, 0);

      if (capaParedes) {
        capaParedes.setCollisionByExclusion([-1]);
      }
    }

    this.minas = this.physics.add.group();
    this.jugador = new TanqueVerde(this, 100, 100, "tanque_verde");

    this.physics.world.setBounds(0, 0, 800, 600);
    this.cameras.main.setBounds(0, 0, 800, 600);
    this.cameras.main.startFollow(this.jugador);

    if (capaParedes) {
      this.physics.add.collider(this.jugador, capaParedes);
      this.physics.add.collider(this.jugador.balas, capaParedes);
    }

    this.physics.add.overlap(
      this.jugador,
      this.minas,
      this.pisarMina,
      null,
      this,
    );
  }

  update() {
    this.jugador.actualizar();
    this.gestionarBarro();
  }

  pisarMina(jugador, mina) {
    mina.detonar(jugador);
  }

  gestionarBarro() {
    if (this.capaBarro) {
      const tile = this.capaBarro.getTileAtWorldXY(
        this.jugador.x,
        this.jugador.y,
      );
      if (tile && tile.index !== -1) {
        this.jugador.setDrag(800);
      } else {
        this.jugador.setDrag(50);
      }
    }
  }
}
