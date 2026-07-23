/* UTILIDADES DE SPAWN — compartidas por Level1, Level2 y Level3 (G2) */

function obtenerPuntoSpawnValido(mapa, capaParedes) {
  const puntos = [];
  for (let y = 0; y < mapa.height; y++) {
    for (let x = 0; x < mapa.width; x++) {
      const tile = capaParedes.getTileAt(x, y);
      if (!tile || tile.index === -1) {
        puntos.push({
          x: x * mapa.tileWidth + mapa.tileWidth / 2,
          y: y * mapa.tileHeight + mapa.tileHeight / 2,
        });
      }
    }
  }
  return Phaser.Utils.Array.GetRandom(puntos);
}

// Garantiza distancia mínima respecto a otro punto
function obtenerPuntoSpawnValidoLejos(mapa, capaParedes, otro, distanciaMin) {
  for (let intento = 0; intento < 60; intento++) {
    const p = obtenerPuntoSpawnValido(mapa, capaParedes);
    if (Phaser.Math.Distance.Between(p.x, p.y, otro.x, otro.y) >= distanciaMin) {
      return p;
    }
  }
  // Fallback: si el mapa es muy pequeño, devuelve el más lejano que encuentre
  return obtenerPuntoSpawnValido(mapa, capaParedes);
}
