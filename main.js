const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 960,
  },
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [BootScene, MenuScene, Level1, Level2, Level3, UIScene, GameOverScene],
};

const game = new Phaser.Game(config);
window.game = game; // útil para depurar desde la consola del navegador
