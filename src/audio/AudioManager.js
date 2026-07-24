class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.volumen = 0.5;
    this.silenciado = false;
    this.ultimaVez = {}; // anti-spam por clave
    this.intervaloMin = 60; // ms mínimos entre dos sonidos iguales
  }

  reproducir(clave, config = {}) {
    if (this.silenciado) return;
    if (!this.scene.cache.audio.exists(clave)) {
      console.warn("[AudioManager] Sonido no encontrado:", clave);
      return;
    }
    const ahora = this.scene.time.now;
    if (this.ultimaVez[clave] && ahora - this.ultimaVez[clave] < this.intervaloMin) return;
    this.ultimaVez[clave] = ahora;

    this.scene.sound.play(clave, {
      volume: (config.volume ?? 1) * this.volumen,
      detune: config.detune ?? Phaser.Math.Between(-150, 150), // variación de tono
    });
  }

  alternarSilencio() {
    // No toca scene.sound.mute: ese flag es global al SoundManager del juego
    // y silenciaría también la música de MusicManager (P y O deben ser independientes).
    this.silenciado = !this.silenciado;
    return this.silenciado;
  }
}
