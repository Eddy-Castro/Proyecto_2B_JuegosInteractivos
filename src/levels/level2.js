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
    this.load.image("tanque_rojo", "resources/img/tanqueRojo.png");
    this.load.image("tanque_azul", "resources/img/tanqueAzul.png");
    this.load.image("portal", "resources/img/portal.png");
  }

  create() {
    this.audio = new AudioManager(this);

    // --- ESTADOS DE LA RONDA ---
    this.isResetting = false;
    this.rojoMuerto = false;
    this.azulMuerto = false;

    this.input.keyboard.once("keydown-ESC", () => {
      this.scene.stop("UIScene");
      this.scene.start("MenuScene");
    });

    this.input.keyboard.on("keydown-P", () => {
      const s = this.audio.alternarSilencio();
      console.log(s ? "Audio silenciado" : "Audio activado");
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
    this.capaParedes = capaParedes;

    // --- PORTALES ---
    // Coordenadas de TILE (col, fila), no en píxeles: más mantenible y fácil
    // de verificar contra el ASCII de MAPA2 en tools/generar_mapa.py.
    const T = 64;
    const MITAD = 32;
    const aMundo = (col, fila) => ({ x: col * T + MITAD, y: fila * T + MITAD });

    // VERIFICADO contra MAPA2 con tools/validar_mapa.py: los 4 tiles están libres
    const PARES_PORTAL = [
      [{ col: 1, fila: 1 }, { col: 18, fila: 13 }], // Par A: esquina sup-izq <-> inf-der
      [{ col: 18, fila: 1 }, { col: 1, fila: 13 }], // Par B: esquina sup-der <-> inf-izq
    ];

    this.portales = this.physics.add.staticGroup();
    PARES_PORTAL.forEach(([a, b]) => {
      const pa = aMundo(a.col, a.fila);
      const pb = aMundo(b.col, b.fila);
      this.portales.add(new Teletransportador(this, pa.x, pa.y, pb.x, pb.y));
      this.portales.add(new Teletransportador(this, pb.x, pb.y, pa.x, pa.y));
    });

    // --- JUGADOR 1 (ROJO) y JUGADOR 2 (AZUL) ---
    const spawnA = obtenerPuntoSpawnValido(mapa, capaParedes);
    const spawnB = obtenerPuntoSpawnValidoLejos(mapa, capaParedes, spawnA, 400);
    this.jugador = new TanqueRojo(this, spawnA.x, spawnA.y, "tanque_rojo");
    this.jugador1 = new TanqueAzul(this, spawnB.x, spawnB.y, "tanque_azul");

    // --- CÁMARA Y LÍMITES ---
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.startFollow(this.jugador);

    // --- SISTEMA DE COLISIONES ---
    this.configurarColisiones();

    // --- HUD DE PUNTUACIÓN (mismo patrón que el Nivel 1) ---
    const scoreRojo = this.registry.get("scoreRojo") || 0;
    const scoreAzul = this.registry.get("scoreAzul") || 0;
    const anchoPantalla = this.cameras.main.width;

    this.add
      .image(60, 60, "tanque_rojo")
      .setScale(0.15)
      .setAngle(-90)
      .setScrollFactor(0)
      .setDepth(100);
    this.add
      .text(120, 35, `${scoreRojo}`, {
        fontSize: "48px",
        fill: "#ff3333",
        fontFamily: "Arial Black",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.add
      .image(anchoPantalla - 60, 60, "tanque_azul")
      .setScale(0.15)
      .setAngle(90)
      .setScrollFactor(0)
      .setDepth(100);
    this.add
      .text(anchoPantalla - 150, 35, `${scoreAzul}`, {
        fontSize: "48px",
        fill: "#3366ff",
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
    }
    if (this.jugador1 && this.jugador1.active) {
      this.jugador1.actualizar();
    }
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

    // Portales: ambos jugadores pueden usarlos, cada uno con su propio cooldown
    this.physics.add.overlap(
      this.jugador,
      this.portales,
      this.usarPortal,
      null,
      this,
    );
    this.physics.add.overlap(
      this.jugador1,
      this.portales,
      this.usarPortal,
      null,
      this,
    );

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

    // Fuego propio (balas rebotadas): pasa por el sistema de rondas, ya no
    // manda directo a GameOverScene
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

  usarPortal(jugador, portal) {
    portal.teletransportar(jugador);
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
    this.audio?.reproducir("explosion");
    victima.disableBody(true, true);
    bala.desactivar();

    if (victima === this.jugador) this.rojoMuerto = true;
    if (victima === this.jugador1) this.azulMuerto = true;

    if (!this.isResetting) {
      this.isResetting = true;
      this.cameras.main.stopFollow();

      this.time.delayedCall(3000, () => {
        this.evaluarRonda();
      });
    }
  }

  evaluarRonda() {
    this.audio?.reproducir("ronda");
    let scoreRojo = this.registry.get("scoreRojo") || 0;
    let scoreAzul = this.registry.get("scoreAzul") || 0;

    if (this.rojoMuerto && this.azulMuerto) {
      console.log("¡Empate! Ambos fueron destruidos.");
    } else if (this.rojoMuerto) {
      this.registry.set("scoreAzul", scoreAzul + 1);
    } else if (this.azulMuerto) {
      this.registry.set("scoreRojo", scoreRojo + 1);
    }

    this.scene.restart();
  }
}
