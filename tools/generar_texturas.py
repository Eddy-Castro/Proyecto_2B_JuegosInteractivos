# tools/generar_texturas.py
# Genera los sprites que hoy se descargan de labs.phaser.io.
# Requisito: pip install pillow
from PIL import Image, ImageDraw
import os

DEST = "resources/img"
os.makedirs(DEST, exist_ok=True)

def guardar(nombre, size, dibujar):
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    dibujar(ImageDraw.Draw(img), size)
    img.save(os.path.join(DEST, nombre))
    print("OK ->", nombre)

# Bala: círculo amarillo con borde oscuro
guardar("bala.png", (8, 8), lambda d, s: d.ellipse([0, 0, 7, 7], fill=(255, 214, 64, 255), outline=(40, 30, 0, 255)))

# Caja destructible: cajón marrón con aspas
def caja(d, s):
    d.rectangle([0, 0, s[0]-1, s[1]-1], fill=(140, 94, 52, 255), outline=(70, 45, 22, 255), width=3)
    d.line([0, 0, s[0], s[1]], fill=(70, 45, 22, 255), width=3)
    d.line([s[0], 0, 0, s[1]], fill=(70, 45, 22, 255), width=3)
guardar("caja.png", (32, 32), caja)

# Muro de trinchera: barra gris metálica (se escala en el juego)
guardar("muro.png", (500, 64), lambda d, s: d.rectangle([0, 0, s[0]-1, s[1]-1], fill=(150, 150, 160, 255), outline=(60, 60, 70, 255), width=6))

# Portal: anillo azul brillante
def portal(d, s):
    d.ellipse([0, 0, s[0]-1, s[1]-1], fill=(40, 160, 255, 255))
    d.ellipse([8, 8, s[0]-9, s[1]-9], fill=(180, 235, 255, 255))
guardar("portal.png", (48, 48), portal)

# Mina de óxido: círculo rojizo con púas
def mina(d, s):
    cx, cy = s[0] // 2, s[1] // 2
    for ang in range(0, 360, 45):
        import math
        x = cx + math.cos(math.radians(ang)) * (cx - 2)
        y = cy + math.sin(math.radians(ang)) * (cy - 2)
        d.line([cx, cy, x, y], fill=(90, 50, 30, 255), width=5)
    d.ellipse([6, 6, s[0]-7, s[1]-7], fill=(170, 70, 40, 255), outline=(60, 25, 10, 255), width=3)
guardar("mina.png", (32, 32), mina)
