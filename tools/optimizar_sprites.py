# tools/optimizar_sprites.py
from PIL import Image
for n in ["tanqueRojo", "tanqueAzul", "tanqueVerde"]:
    p = f"resources/img/{n}.png"
    img = Image.open(p).convert("RGBA")
    img.thumbnail((128, 96), Image.LANCZOS)
    img.save(p, optimize=True)
    print(n, "->", img.size)
