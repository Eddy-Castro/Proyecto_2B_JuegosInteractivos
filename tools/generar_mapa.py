# tools/generar_mapa.py
# Convierte un layout ASCII en un tilemap JSON compatible con Tiled + Phaser.
# Uso: python tools/generar_mapa.py
import json, os

# GIDs verificados del tileset spritesheet-tiles-default.png
GID_SUELO       = 143  # baldosa de suelo
GID_PARED       = 21   # muro tipo A
GID_PARED_ALT   = 28   # muro tipo B (variación visual)

SIMBOLOS = {".": 0, "#": GID_PARED, "=": GID_PARED_ALT}

TILESET = {
    "columns": 18, "firstgid": 1,
    "image": "spritesheet-tiles-default.png",
    "imageheight": 1169, "imagewidth": 1169,
    "margin": 0, "name": "spritesheet-tiles-default",
    "spacing": 1, "tilecount": 324,
    "tileheight": 64, "tilewidth": 64,
}

def capa(id_, nombre, data, w, h):
    return {"data": data, "height": h, "id": id_, "name": nombre,
            "opacity": 1, "type": "tilelayer", "visible": True,
            "width": w, "x": 0, "y": 0}

def generar(ruta_salida, filas, capas_extra=None):
    """filas: lista de strings de igual longitud. '.'=libre '#'/'='=pared"""
    h, w = len(filas), len(filas[0])
    assert all(len(f) == w for f in filas), "Todas las filas deben medir lo mismo"

    suelo = [GID_SUELO] * (w * h)
    paredes = [SIMBOLOS[c] for fila in filas for c in fila]

    layers = [capa(1, "Suelo", suelo, w, h), capa(2, "Paredes", paredes, w, h)]
    next_id = 3
    for nombre, simbolo, gid in (capas_extra or []):
        data = [gid if c == simbolo else 0 for fila in filas for c in fila]
        layers.append(capa(next_id, nombre, data, w, h))
        next_id += 1

    mapa = {
        "compressionlevel": -1, "height": h, "infinite": False,
        "layers": layers, "nextlayerid": next_id, "nextobjectid": 1,
        "orientation": "orthogonal", "renderorder": "right-down",
        "tiledversion": "1.12.1", "tileheight": 64,
        "tilesets": [TILESET], "tilewidth": 64,
        "type": "map", "version": "1.10", "width": w,
    }
    os.makedirs(os.path.dirname(ruta_salida), exist_ok=True)
    with open(ruta_salida, "w", encoding="utf-8") as f:
        json.dump(mapa, f, indent=1)
    libres = paredes.count(0)
    print(f"OK -> {ruta_salida}  ({w}x{h}, {libres} tiles libres)")


# ---------- NIVEL 2: "Sindicato de Neón" — cámaras separadas por bandas de muros ----------
# VALIDADO: 20x15 · simetría rotacional 180° · 174 tiles libres · 0 zonas aisladas · 0 callejones
MAPA2 = [
    "####################",
    "#..................#",
    "#.##..==....==..##.#",
    "#.##..==....==..##.#",
    "#..................#",
    "#...#####..#####...#",
    "#..................#",
    "#....####..####....#",
    "#..................#",
    "#...#####..#####...#",
    "#..................#",
    "#.##..==....==..##.#",
    "#.##..==....==..##.#",
    "#..................#",
    "####################",
]

# ---------- NIVEL 3: "Hijos del Páramo" — campo abierto con coberturas y barro ----------
# VALIDADO: 20x15 · simetría 180° · 202 libres · 34 de barro (16.8%) · conectado ·
#           las 168 casillas secas forman una única región (siempre hay ruta sin barro)
MAPA3 = [
    "####################",
    "#..................#",
    "#..##....~~~~....###",
    "#..##....~~~~....###",
    "#........~~~~......#",
    "#.===.....~~.....==#",
    "#..................#",
    "#...###~~~~~~###...#",
    "#..................#",
    "#==.....~~.....===.#",
    "#......~~~~........#",
    "###....~~~~....##..#",
    "###....~~~~....##..#",
    "#..................#",
    "####################",
]

if __name__ == "__main__":
    generar("resources/maps/mapa2.json", MAPA2)
    # El nivel 3 añade una capa "Barro" que Phaser lee para frenar al tanque.
    # '~' no es pared, así que hay que mapearlo a libre en la capa Paredes:
    MAPA3_LIMPIO = [f.replace("~", ".") for f in MAPA3]
    SIMBOLOS_BARRO = [("Barro", "~", GID_SUELO)]
    # generamos con paredes limpias pero usando el layout original para el barro
    h, w = len(MAPA3), len(MAPA3[0])
    suelo = [GID_SUELO] * (w * h)
    paredes = [SIMBOLOS[c] for fila in MAPA3_LIMPIO for c in fila]
    barro = [GID_SUELO if c == "~" else 0 for fila in MAPA3 for c in fila]
    mapa3 = {
        "compressionlevel": -1, "height": h, "infinite": False,
        "layers": [capa(1, "Suelo", suelo, w, h),
                   capa(2, "Barro", barro, w, h),
                   capa(3, "Paredes", paredes, w, h)],
        "nextlayerid": 4, "nextobjectid": 1,
        "orientation": "orthogonal", "renderorder": "right-down",
        "tiledversion": "1.12.1", "tileheight": 64,
        "tilesets": [TILESET], "tilewidth": 64,
        "type": "map", "version": "1.10", "width": w,
    }
    with open("resources/maps/mapa3.json", "w", encoding="utf-8") as f:
        json.dump(mapa3, f, indent=1)
    print("OK -> resources/maps/mapa3.json")
