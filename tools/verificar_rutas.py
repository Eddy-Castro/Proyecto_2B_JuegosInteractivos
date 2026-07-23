# tools/verificar_rutas.py
# Comprueba que cada asset referenciado en el codigo exista con EXACTAMENTE esa grafia.
import os, re, sys

referencias = set()
for raiz, _, ficheros in os.walk("."):
    if any(p in raiz for p in (".git", "node_modules", "tools")): continue
    for f in ficheros:
        if not f.endswith((".js", ".html")): continue
        texto = open(os.path.join(raiz, f), encoding="utf-8", errors="ignore").read()
        for m in re.findall(r'["\']((?:resources|src)/[^"\']+\.(?:png|jpg|json|ogg|mp3|js))["\']', texto):
            referencias.add(m)

fallos = 0
for ref in sorted(referencias):
    if os.path.exists(ref):
        # existe, pero ¿coincide la grafia exacta? (Windows no distingue, Linux si)
        carpeta, nombre = os.path.split(ref)
        reales = os.listdir(carpeta) if os.path.isdir(carpeta) else []
        if nombre not in reales:
            real = next((r for r in reales if r.lower() == nombre.lower()), "?")
            print(f"✗ MAYUSCULAS: el codigo dice '{nombre}' pero el archivo es '{real}'  ({ref})")
            fallos += 1
        elif " " in ref:
            print(f"⚠ ESPACIO en el nombre: {ref}")
            fallos += 1
    else:
        print(f"✗ NO EXISTE: {ref}")
        fallos += 1

print(f"\n{len(referencias)} referencias revisadas · {fallos} problemas")
sys.exit(1 if fallos else 0)
