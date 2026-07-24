class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: "Level1" });
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

    this.game.musica?.reproducir("musica_nivel1");

    this.input.keyboard.on("keydown-O", () => {
      const m = this.game.musica;
      if (!m) return;
      m.volumen = m.volumen > 0 ? 0 : 0.35;
      m.pistaActual?.setVolume(m.volumen);
      console.log(m.volumen > 0 ? "Música activada" : "Música silenciada");
    });

    // --- CONSTRUCCIÓN DEL MAPA ---
    const mapa = this.make.tilemap({ key: "mapa_nivel1" });
    const tileset = mapa.addTilesetImage(
      "spritesheet-tiles-default",
      "tiles",
      64,
      64,
      0,
      1,
    );

    mapa.createLayer("Suelo", tileset, 0, 0);
    this.capaParedes = mapa.createLayer("Paredes", tileset, 0, 0);

    if (this.capaParedes) {
      this.capaParedes.setCollisionByExclusion([-1]);
    }

    // --- OBJETOS DE ESCENA ---
    this.muros = this.physics.add.staticGroup();
    this.cajas = this.physics.add.staticGroup();

    // --- JUGADOR 1 (ROJO) ---
    const puntoSpawnRojo = obtenerPuntoSpawnValido(mapa, this.capaParedes);
    this.jugador = new TanqueRojo(
      this,
      puntoSpawnRojo.x,
      puntoSpawnRojo.y,
      "tanque_rojo",
    );

    // --- JUGADOR 2 (AZUL), a ≥400px del jugador 1 ---
    const puntoSpawnAzul = obtenerPuntoSpawnValidoLejos(
      mapa,
      this.capaParedes,
      puntoSpawnRojo,
      400,
    );
    this.jugador1 = new TanqueAzul(
      this,
      puntoSpawnAzul.x,
      puntoSpawnAzul.y,
      "tanque_azul",
    );

    // --- COBERTURA DESTRUCTIBLE ---
    // Se colocan sobre tiles LIBRES verificados y separadas de ambos spawns.
    // (Antes eran coordenadas fijas y una caía dentro de una pared.)
    obtenerPuntosLibresDispersos(
      mapa,
      this.capaParedes,
      4,
      [puntoSpawnRojo, puntoSpawnAzul],
      150,
    ).forEach((p) => {
      this.cajas.create(p.x, p.y, "caja_destructible").setDisplaySize(48, 48).refreshBody();
    });

    // --- CÁMARA Y LÍMITES ---
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.startFollow(this.jugador);

    // --- SISTEMA DE COLISIONES LIMPIO ---
    this.configurarColisiones();

    // --- INTERFAZ DE USUARIO (HUD) ---
    const anchoPantalla = this.cameras.main.width;

    this.panelRojo = new PanelJugador(this, {
      x: 18,
      y: 18,
      color: 0xff3b30,
      textura: "tanque_rojo",
      nombre: "JUGADOR 1 · MURO",
      alineacion: "izquierda",
    });
    this.panelAzul = new PanelJugador(this, {
      x: anchoPantalla - 18,
      y: 18,
      color: 0x3d8bff,
      textura: "tanque_azul",
      nombre: "DASH · JUGADOR 2",
      alineacion: "derecha",
    });

    this.panelRojo.setMarcador(this.registry.get("scoreRojo") || 0);
    this.panelAzul.setMarcador(this.registry.get("scoreAzul") || 0);

    // Marcador de rondas para ganar, centrado arriba
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
    // 1. COLISIONES TANQUE ROJO (Físicas Normales)
    if (this.capaParedes) {
      this.physics.add.collider(this.jugador, this.capaParedes);
      this.physics.add.collider(this.jugador.balas, this.capaParedes, (a, b) => {
        const bala = a.registrarRebote ? a : b;
        bala.registrarRebote();
        if (this.audio) this.audio.reproducir("rebote");
      });
    }
    this.physics.add.collider(this.jugador, this.cajas);
    this.physics.add.collider(
      this.jugador.balas,
      this.cajas,
      this.golpearCaja,
      null,
      this,
    );
    this.physics.add.collider(this.jugador, this.muros);
    this.physics.add.collider(this.jugador.balas, this.muros);

    // 2. COLISIONES TANQUE AZUL (Con filtro de Dash Fantasma)
    if (this.capaParedes) {
      this.physics.add.collider(this.jugador1.balas, this.capaParedes, (a, b) => {
        const bala = a.registrarRebote ? a : b;
        bala.registrarRebote();
        if (this.audio) this.audio.reproducir("rebote");
      }); // Su bala choca normal
      this.physics.add.collider(
        this.jugador1,
        this.capaParedes,
        null,
        (jugador, tile) => {
          if (!jugador.esInvulnerable) return true;
          // Evitar que salga del mapa durante el dash
          return (
            tile.x === 0 ||
            tile.x === this.capaParedes.tilemap.width - 1 ||
            tile.y === 0 ||
            tile.y === this.capaParedes.tilemap.height - 1
          );
        },
        this,
      );
    }
    this.physics.add.collider(
      this.jugador1,
      this.cajas,
      null,
      () => !this.jugador1.esInvulnerable,
      this,
    );
    this.physics.add.collider(
      this.jugador1.balas,
      this.cajas,
      this.golpearCaja,
      null,
      this,
    );
    this.physics.add.collider(
      this.jugador1,
      this.muros,
      null,
      () => !this.jugador1.esInvulnerable,
      this,
    );
    this.physics.add.collider(this.jugador1.balas, this.muros);

    // Colisión tanque↔tanque: ya no se atraviesan
    this.physics.add.collider(this.jugador, this.jugador1);

    // Fuego Cruzado
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

    // Fuego Amigo / Suicidio (Opcional, pero recomendado si rebotan las balas)
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

  golpearCaja(a, b) {
    // Al colisionar un Group (balas) con otro objeto, Phaser no siempre
    // respeta el orden de argumentos pasado a physics.add.collider();
    // se identifica la bala por duck-typing en vez de por posición.
    const bala = a.disparar ? a : b;
    const caja = a.disparar ? b : a;
    // Ya no da puntos ni termina el juego, solo funciona como cobertura destructible
    caja.destroy();
    bala.desactivar();
  }

  impactoJugador(a, b) {
    const bala = a.disparar ? a : b;
    const victima = a.disparar ? b : a;
    // Si la víctima esquivó con Dash, ignorar impacto
    if (victima.esInvulnerable) {
      bala.desactivar();
      return;
    }

    // Efectos de destrucción
    this.cameras.main.shake(250, 0.012);
    this.cameras.main.flash(120, 255, 80, 80);
    this.audio?.reproducir("explosion");
    this.explosionMuerte(victima.x, victima.y);
    victima.disableBody(true, true);
    bala.desactivar();

    // Registrar quién fue destruido
    if (victima === this.jugador) this.rojoMuerto = true;
    if (victima === this.jugador1) this.azulMuerto = true;

    // Iniciar la ventana de 3 segundos solo una vez por ronda
    if (!this.isResetting) {
      this.isResetting = true;
      this.cameras.main.stopFollow();

      // Pequeño margen para que un posible doble impacto en el mismo frame
      // (empate) termine de marcar ambas banderas antes de anunciar al ganador.
      this.time.delayedCall(100, () => {
        let mensaje = "¡EMPATE!";
        if (this.rojoMuerto && !this.azulMuerto) mensaje = "¡RONDA PARA AZUL!";
        else if (this.azulMuerto && !this.rojoMuerto) mensaje = "¡RONDA PARA ROJO!";

        this.add
          .text(this.cameras.main.width / 2, this.cameras.main.height / 2, mensaje, {
            fontSize: "48px",
            fill: "#ffffff",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 8,
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(200);
      });

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
      // Empate: Nadie suma puntos (o puedes sumar a ambos si lo prefieres)
      console.log("¡Empate! Ambos fueron destruidos.");
    } else if (this.rojoMuerto) {
      // Azul gana la ronda
      scoreAzul += 1;
      this.registry.set("scoreAzul", scoreAzul);
    } else if (this.azulMuerto) {
      // Rojo gana la ronda
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

    // Reinicia la escena: limpia las balas, recarga las cajas y lanza a
    // los tanques en nuevos puntos aleatorios automáticamente.
    this.scene.restart();
  }
}
