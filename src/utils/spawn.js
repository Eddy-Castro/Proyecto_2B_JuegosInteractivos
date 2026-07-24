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

/**
 * Devuelve `cantidad` puntos sobre tiles LIBRES, separados entre sí y de los
 * puntos de `evitar` al menos `distanciaMin` píxeles.
 * Se usa para colocar cobertura (cajas) sin que caigan dentro de una pared ni
 * encima de un punto de aparición.
 */
function obtenerPuntosLibresDispersos(
  mapa,
  capaParedes,
  cantidad,
  evitar = [],
  distanciaMin = 130,
) {
  const puntos = [];
  const maxIntentos = cantidad * 60;
  for (let i = 0; i < maxIntentos && puntos.length < cantidad; i++) {
    const p = obtenerPuntoSpawnValido(mapa, capaParedes);
    const separado = [...evitar, ...puntos].every(
      (q) => Phaser.Math.Distance.Between(p.x, p.y, q.x, q.y) >= distanciaMin,
    );
    if (separado) puntos.push(p);
  }
  return puntos;
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
