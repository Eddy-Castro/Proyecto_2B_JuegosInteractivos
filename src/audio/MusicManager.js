class MusicManager {
  constructor(game) {
    this.game = game;
    this.pistaActual = null;
    this.claveActual = null;
    this.volumen = 0.35;
  }

  /**
   * Cambia de pista con fade. Si ya suena la misma, NO hace nada
   * (esto es lo que evita el corte al reiniciar el nivel).
   */
  reproducir(clave, { fadeMs = 800 } = {}) {
    if (this.claveActual === clave && this.pistaActual?.isPlaying) return;

    const sound = this.game.sound;
    if (!sound.get(clave) && !this.game.cache.audio.exists(clave)) {
      console.warn("[MusicManager] Pista no encontrada:", clave);
      return;
    }

    const anterior = this.pistaActual;
    if (anterior && anterior.isPlaying) {
      this._fade(anterior, anterior.volume, 0, fadeMs, () => anterior.stop());
    }

    const nueva = sound.add(clave, { loop: true, volume: 0 });
    nueva.play();
    this._fade(nueva, 0, this.volumen, fadeMs);

    this.pistaActual = nueva;
    this.claveActual = clave;
  }

  detener({ fadeMs = 600 } = {}) {
    if (!this.pistaActual) return;
    const p = this.pistaActual;
    this._fade(p, p.volume, 0, fadeMs, () => p.stop());
    this.pistaActual = null;
    this.claveActual = null;
  }

  // Tween manual sobre el volumen; usa la escena activa como host del tween
  _fade(sonido, desde, hasta, duracion, alTerminar) {
    const escena = this.game.scene.getScenes(true)[0];
    if (!escena) {
      sonido.setVolume(hasta);
      alTerminar?.();
      return;
    }
    sonido.setVolume(desde);
    escena.tweens.add({
      targets: sonido,
      volume: hasta,
      duration: duracion,
      onComplete: () => alTerminar?.(),
    });
  }
}
