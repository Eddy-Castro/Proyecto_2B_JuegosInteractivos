/* ESCENA NIVEL 3 */

class Level3 extends Phaser.Scene {
  constructor() {
    super({ key: "Level3" });
  }

  // Sin preload(): todos los assets se cargan una sola vez en BootScene.

  create() {
    this.audio = new AudioManager(this);

    // --- ESTADOS DE LA RONDA ---
    this.isResetting = false;
    this.muerto1 = false;
    this.muerto2 = false;

    this.input.keyboard.once("keydown-ESC", () => {
      this.scene.start("MenuScene");
    });

    this.input.keyboard.on("keydown-P", () => {
      const s = this.audio.alternarSilencio();
      console.log(s ? "Audio silenciado" : "Audio activado");
    });

    this.game.musica?.reproducir("musica_nivel3");

    this.input.keyboard.on("keydown-O", () => {
      const m = this.game.musica;
      if (!m) return;
      m.volumen = m.volumen > 0 ? 0 : 0.35;
      m.pistaActual?.setVolume(m.volumen);
      console.log(m.volumen > 0 ? "Música activada" : "Música silenciada");
    });

    // --- CONSTRUCCIÓN DEL MAPA ---
    this.mapa = this.make.tilemap({ key: "mapa_nivel3" });

    this.capaParedes = null;
    this.capaBarro = null;

    if (this.mapa.tilesets.length > 0) {
      const tileset = this.mapa.addTilesetImage(
        "spritesheet-tiles-default",
        "tiles",
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

    // Los dos tanques son idénticos (misma facción), así que hace falta algo
    // que los distinga. No se puede usar setTint(): el barro y las minas ya lo
    // usan para señalizar su estado y se pisarían. Se usa un pequeño triángulo
    // flotando POR ENCIMA del tanque, que no tapa el sprite.
    this.marcador1 = this.crearMarcador(0x2ecc71);
    this.marcador2 = this.crearMarcador(0xffc266);

    // --- CÁMARA Y LÍMITES (usar el tamaño real del mapa, no un valor fijo) ---
    this.physics.world.setBounds(0, 0, this.mapa.widthInPixels, this.mapa.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.mapa.widthInPixels, this.mapa.heightInPixels);
    this.cameras.main.startFollow(this.jugador);

    // --- SISTEMA DE COLISIONES ---
    this.configurarColisiones();

    // --- HUD DE PUNTUACIÓN ---
    const anchoPantalla = this.cameras.main.width;

    this.panel1 = new PanelJugador(this, {
      x: 18,
      y: 18,
      color: 0x2ecc71,
      textura: "tanque_verde",
      nombre: "JUGADOR 1 · MINA",
      alineacion: "izquierda",
    });
    this.panel2 = new PanelJugador(this, {
      x: anchoPantalla - 18,
      y: 18,
      color: 0xffaa33,
      textura: "tanque_verde",
      nombre: "MINA · JUGADOR 2",
      alineacion: "derecha",
    });

    this.panel1.setMarcador(this.registry.get("scoreVerde1") || 0);
    this.panel2.setMarcador(this.registry.get("scoreVerde2") || 0);

    crearRotuloSuperior(this, "PRIMERO A 5 RONDAS");
  }

  update() {
    if (this.jugador && this.jugador.active) {
      this.jugador.actualizar();
      this.situarMarcador(this.marcador1, this.jugador);
    }
    if (this.jugador1 && this.jugador1.active) {
      this.jugador1.actualizar();
      this.situarMarcador(this.marcador2, this.jugador1);
    }
    // Ocultar el indicador de un tanque destruido
    this.marcador1.setVisible(!!this.jugador?.active);
    this.marcador2.setVisible(!!this.jugador1?.active);
    this.gestionarBarro();

    const progreso = (t) => {
      const restante = t.tiempoHabilidad - this.time.now;
      return restante <= 0 ? 1 : 1 - restante / t.cooldownMina;
    };
    if (this.jugador?.active) this.panel1.actualizarCooldown(progreso(this.jugador));
    if (this.jugador1?.active) this.panel2.actualizarCooldown(progreso(this.jugador1));
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

  /** Triángulo indicador que flota sobre un tanque para identificar al jugador. */
  crearMarcador(color) {
    return this.add
      .triangle(0, 0, 0, 0, 15, 0, 7.5, 12, color)
      .setOrigin(0.5, 0.5)
      .setDepth(60)
      .setStrokeStyle(2, 0x0d1117, 0.9);
  }

  /** Sitúa el indicador sobre el tanque, con un vaivén suave. */
  situarMarcador(marcador, tanque) {
    marcador.x = tanque.x;
    marcador.y = tanque.y - 42 + Math.sin(this.time.now / 260) * 3;
  }

  pisarMina(jugador, mina) {
    mina.detonar(jugador);
  }

  explosionMuerte(x, y) {
    const explosion = this.add.circle(x, y, 15, 0xff8800, 1).setDepth(70);
    this.tweens.add({
      targets: explosion,
      radius: 90,
      alpha: 0,
      duration: 450,
      ease: "Cubic.easeOut",
      onComplete: () => explosion.destroy(),
    });
    for (let i = 0; i < 12; i++) {
      const ang = (Math.PI * 2 * i) / 12;
      const frag = this.add.rectangle(x, y, 6, 6, 0xffaa33).setDepth(70);
      this.tweens.add({
        targets: frag,
        x: x + Math.cos(ang) * Phaser.Math.Between(60, 140),
        y: y + Math.sin(ang) * Phaser.Math.Between(60, 140),
        alpha: 0,
        duration: 600,
        onComplete: () => frag.destroy(),
      });
    }
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
    this.explosionMuerte(victima.x, victima.y);
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
    this.audio?.reproducir("ronda");
    let scoreVerde1 = this.registry.get("scoreVerde1") || 0;
    let scoreVerde2 = this.registry.get("scoreVerde2") || 0;

    if (this.muerto1 && this.muerto2) {
      console.log("¡Empate! Ambos fueron destruidos.");
    } else if (this.muerto1) {
      scoreVerde2 += 1;
      this.registry.set("scoreVerde2", scoreVerde2);
    } else if (this.muerto2) {
      scoreVerde1 += 1;
      this.registry.set("scoreVerde1", scoreVerde1);
    }

    const META = 5;
    if (scoreVerde1 >= META || scoreVerde2 >= META) {
      const gana1 = scoreVerde1 >= META;
      this.registry.set("ganador", gana1 ? "JUGADOR 1" : "JUGADOR 2");
      this.registry.set("resultado", {
        ganador: gana1 ? "JUGADOR 1" : "JUGADOR 2",
        colorGanador: gana1 ? "#4ade80" : "#ffc266",
        jugadores: [
          { nombre: "JUGADOR 1 · WASD", score: scoreVerde1, css: "#4ade80", textura: "tanque_verde" },
          { nombre: "JUGADOR 2 · FLECHAS", score: scoreVerde2, css: "#ffc266", textura: "tanque_verde" },
        ],
      });
      this.scene.start("GameOverScene");
      return;
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
        t.enBarro = true;
        t.aplicarModificadores(); // compone con la mina si está activa
        t.estabaEnBarro = true;
      } else if (!enBarro && t.estabaEnBarro) {
        t.setDrag(50);
        t.enBarro = false;
        t.aplicarModificadores(); // no cancela la mina: recalcula con sus flags
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
