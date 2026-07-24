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
    this.silenciado = !this.silenciado;
    this.scene.sound.mute = this.silenciado;
    return this.silenciado;
  }
}
