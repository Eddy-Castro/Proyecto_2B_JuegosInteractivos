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

    this.minas = this.physics.add.staticGroup();
    this.jugador = new TanqueVerde(this, 100, 100, "tanque_verde");

    this.physics.world.setBounds(0, 0, 800, 600);
    this.cameras.main.setBounds(0, 0, 800, 600);
    this.cameras.main.startFollow(this.jugador);

    if (capaParedes) {
      this.physics.add.collider(this.jugador, capaParedes);
      this.physics.add.collider(this.jugador.balas, capaParedes);
    }

    // Colisión tanque↔tanque: preparada para cuando G2 añada el 2º jugador
    if (this.jugador1) {
      this.physics.add.collider(this.jugador, this.jugador1);
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
