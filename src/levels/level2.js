/* ESCENA NIVEL 2 */

class Level2 extends Phaser.Scene {
  constructor() {
    super({ key: "Level2" });
  }

  // Sin preload(): todos los assets se cargan una sola vez en BootScene.

  create() {
    this.audio = new AudioManager(this);

    // --- ESTADOS DE LA RONDA ---
    this.isResetting = false;
    this.rojoMuerto = false;
    this.azulMuerto = false;

    this.input.keyboard.once("keydown-ESC", () => {
      this.scene.start("MenuScene");
    });

    this.input.keyboard.on("keydown-P", () => {
      const s = this.audio.alternarSilencio();
      console.log(s ? "Audio silenciado" : "Audio activado");
    });

    this.game.musica?.reproducir("musica_nivel2");

    this.input.keyboard.on("keydown-O", () => {
      const m = this.game.musica;
      if (!m) return;
      m.volumen = m.volumen > 0 ? 0 : 0.35;
      m.pistaActual?.setVolume(m.volumen);
      console.log(m.volumen > 0 ? "Música activada" : "Música silenciada");
    });

    const mapa = this.make.tilemap({ key: "mapa_nivel2" });

    let capaParedes = null;
    if (mapa.tilesets.length > 0) {
      const tileset = mapa.addTilesetImage(
        "spritesheet-tiles-default",
        "tiles",
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

    // --- HUD DE PUNTUACIÓN ---
    const anchoPantalla = this.cameras.main.width;

    this.panelRojo = new PanelJugador(this, {
      x: 18, y: 18, color: 0xff3b30, textura: "tanque_rojo",
      nombre: "JUGADOR 1 · MURO", alineacion: "izquierda",
    });
    this.panelAzul = new PanelJugador(this, {
      x: anchoPantalla - 18, y: 18, color: 0x3d8bff, textura: "tanque_azul",
      nombre: "DASH · JUGADOR 2", alineacion: "derecha",
    });
    this.panelRojo.setMarcador(this.registry.get("scoreRojo") || 0);
    this.panelAzul.setMarcador(this.registry.get("scoreAzul") || 0);

    crearRotuloSuperior(this, "PRIMERO A 5 RONDAS");
  }

  update() {
    if (this.jugador && this.jugador.active) {
      this.jugador.actualizar();
    }
    if (this.jugador1 && this.jugador1.active) {
      this.jugador1.actualizar();
    }

    const progreso = (tanque, duracionMs) => {
      const restante = tanque.tiempoHabilidad - this.time.now;
      return restante <= 0 ? 1 : 1 - restante / duracionMs;
    };
    if (this.jugador?.active) this.panelRojo.actualizarCooldown(progreso(this.jugador, 10000));
    if (this.jugador1?.active) this.panelAzul.actualizarCooldown(progreso(this.jugador1, 3000));
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

  efectoTeletransporte(jugador) {
    // Onda expansiva en el origen
    const onda = this.add.circle(jugador.x, jugador.y, 10, 0x40a0ff, 0.7).setDepth(60);
    this.tweens.add({
      targets: onda,
      radius: 80,
      alpha: 0,
      duration: 350,
      onComplete: () => onda.destroy(),
    });

    // El tanque se encoge y vuelve a su escala real (no 1,1: usa setDisplaySize)
    jugador.setScale(0.2);
    this.tweens.add({
      targets: jugador,
      scaleX: jugador.escalaBase.x,
      scaleY: jugador.escalaBase.y,
      duration: 250,
      ease: "Back.easeOut",
    });

    // Destello de cámara
    this.cameras.main.flash(120, 60, 160, 255);
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
      scoreAzul += 1;
      this.registry.set("scoreAzul", scoreAzul);
    } else if (this.azulMuerto) {
      scoreRojo += 1;
      this.registry.set("scoreRojo", scoreRojo);
    }

    const META = 5;
    if (scoreRojo >= META || scoreAzul >= META) {
      const ganaRojo = scoreRojo >= META;
      this.registry.set("ganador", ganaRojo ? "ROJO" : "AZUL");
      this.registry.set("resultado", {
        ganador: ganaRojo ? "IMPERIO DE HIERRO" : "SINDICATO DE NEÓN",
        colorGanador: ganaRojo ? "#ff5a4f" : "#5aa0ff",
        jugadores: [
          { nombre: "JUGADOR 1 · ROJO", score: scoreRojo, css: "#ff5a4f", textura: "tanque_rojo" },
          { nombre: "JUGADOR 2 · AZUL", score: scoreAzul, css: "#5aa0ff", textura: "tanque_azul" },
        ],
      });
      this.scene.start("GameOverScene");
      return;
    }

    this.scene.restart();
  }
}
