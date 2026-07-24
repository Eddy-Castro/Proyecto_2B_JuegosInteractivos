class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: "Level1" });
  }

  preload() {
    this.load.image(
      "tiles_nivel1",
      "resources/img/spritesheet-tiles-default.png",
    );
    this.load.tilemapTiledJSON("mapa_nivel1", "resources/maps/mapa_nuevo.json");
    this.load.image("tanque_rojo", "resources/img/tanqueRojo.png");
    this.load.image("tanque_azul", "resources/img/tanqueAzul.png");
    this.load.image("caja_destructible", "resources/img/caja.png");
    this.load.image("muro_habilidad", "resources/img/muro.png");
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
      "tiles_nivel1",
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
    this.cajas.create(300, 300, "caja_destructible");
    this.cajas.create(500, 200, "caja_destructible");

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

    // --- CÁMARA Y LÍMITES ---
    this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.startFollow(this.jugador);

    // --- SISTEMA DE COLISIONES LIMPIO ---
    this.configurarColisiones();

    // ==========================================
    // --- INTERFAZ DE USUARIO (HUD) ---
    // ==========================================

    // 1. Leemos el score actual del registro global
    const scoreRojo = this.registry.get("scoreRojo") || 0;
    const scoreAzul = this.registry.get("scoreAzul") || 0;

    // 2. Obtenemos el ancho visible de la cámara para alinear el HUD azul a la derecha
    const anchoPantalla = this.cameras.main.width;

    // --- MARCADOR ROJO (Izquierda) ---
    this.add
      .image(60, 60, "tanque_rojo")
      .setScale(0.15) // Hacemos el tanque más pequeño para que sea un ícono
      .setAngle(-90) // (Opcional) Lo rotamos para que apunte hacia el texto
      .setScrollFactor(0) // ¡LA CLAVE! Lo ancla a la cámara
      .setDepth(100); // Lo pone por encima de las balas y paredes

    this.add
      .text(120, 35, `${scoreRojo}`, {
        fontSize: "48px",
        fill: "#ff3333",
        fontFamily: "Arial Black",
        stroke: "#000000", // Borde negro para que resalte sobre el mapa
        strokeThickness: 6,
      })
      .setScrollFactor(0)
      .setDepth(100);

    // --- MARCADOR AZUL (Derecha) ---
    this.add
      .image(anchoPantalla - 60, 60, "tanque_azul")
      .setScale(0.15)
      .setAngle(90)
      .setScrollFactor(0)
      .setDepth(100);

    // En el texto azul restamos un poco más de 'X' para que el número no tape al ícono
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

    // --- BARRAS DE COOLDOWN ---
    this.barraRojo = new BarraCooldown(this, 30, 110, 0xff3333);
    this.barraAzul = new BarraCooldown(
      this,
      this.cameras.main.width - 150,
      110,
      0x3366ff,
    );
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
    if (this.jugador?.active) this.barraRojo.actualizar(progreso(this.jugador, 10000));
    if (this.jugador1?.active) this.barraAzul.actualizar(progreso(this.jugador1, 3000));
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
      this.registry.set("ganador", scoreRojo >= META ? "ROJO" : "AZUL");
      this.scene.stop("UIScene");
      this.scene.start("GameOverScene");
      return;
    }

    // Reinicia la escena: limpia las balas, recarga las cajas y lanza a
    // los tanques en nuevos puntos aleatorios automáticamente.
    this.scene.restart();
  }
}
