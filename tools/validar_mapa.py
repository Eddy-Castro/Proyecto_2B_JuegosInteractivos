# tools/validar_mapa.py — comprueba dimensiones, simetría, conectividad y % de barro
from collections import deque
import sys

def validar(M, nombre, exigir_simetria=True, rango_barro=None):
    H, W = len(M), len(M[0])
    ok = True
    print(f"\n=== {nombre} ({W}x{H}) ===")

    malas = [i for i, f in enumerate(M) if len(f) != W]
    if malas: print(f"  ✗ Filas con longitud incorrecta: {malas}"); ok = False
    else:     print(f"  ✓ Todas las filas miden {W}")

    if exigir_simetria:
        asim = [(x, y) for y in range(H) for x in range(W) if M[y][x] != M[H-1-y][W-1-x]]
        if asim: print(f"  ✗ Simetría 180° rota en {len(asim)} celdas, ej. {asim[:5]}"); ok = False
        else:    print("  ✓ Simetría rotacional 180° correcta")

    libres = sum(1 for f in M for c in f if c in ".~")
    def flood(trans):
        ini = next((y, x) for y in range(H) for x in range(W) if trans(M[y][x]))
        vis, q = {ini}, deque([ini])
        while q:
            y, x = q.popleft()
            for dy, dx in ((1,0), (-1,0), (0,1), (0,-1)):
                ny, nx = y+dy, x+dx
                if 0 <= ny < H and 0 <= nx < W and (ny,nx) not in vis and trans(M[ny][nx]):
                    vis.add((ny,nx)); q.append((ny,nx))
        return len(vis)

    alc = flood(lambda c: c in ".~")
    if alc != libres: print(f"  ✗ {libres-alc} tiles aislados (inalcanzables)"); ok = False
    else:             print(f"  ✓ Los {libres} tiles libres están conectados")

    call = [(x,y) for y in range(1,H-1) for x in range(1,W-1) if M[y][x] in ".~"
            and sum(1 for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)) if M[y+dy][x+dx] in ".~") < 2]
    print(f"  {'✓' if not call else '⚠'} Callejones sin salida: {len(call)} {call[:5]}")

    if rango_barro:
        barro = sum(1 for f in M for c in f if c == "~")
        pct = barro / libres * 100
        lo, hi = rango_barro
        if lo <= pct <= hi: print(f"  ✓ Barro: {barro} tiles ({pct:.1f}%), dentro de {lo}-{hi}%")
        else:               print(f"  ✗ Barro: {pct:.1f}%, fuera del rango {lo}-{hi}%"); ok = False
        seco = sum(1 for f in M for c in f if c == ".")
        if flood(lambda c: c == ".") != seco:
            print("  ✗ Las zonas secas están fragmentadas: hay rutas donde el barro es obligatorio"); ok = False
        else:
            print("  ✓ Existe siempre una ruta alternativa sin barro")

    print(f"  → {nombre}: {'APTO' if ok else 'CORREGIR'}")
    return ok

def verificar_puntos(M, puntos, etiqueta):
    """Comprueba que ninguna coordenada de tile (col, fila) caiga en una pared."""
    print(f"\n--- {etiqueta} ---")
    for col, fila in puntos:
        libre = M[fila][col] in ".~"
        print(f"  tile ({col},{fila}) -> px ({col*64+32},{fila*64+32}) : "
              f"{'LIBRE ✓' if libre else 'DENTRO DE PARED ✗'}")

if __name__ == "__main__":
    from generar_mapa import MAPA2, MAPA3
    a = validar(MAPA2, "MAPA2 (Nivel 2)")
    verificar_puntos(MAPA2, [(1,1), (18,13), (18,1), (1,13)], "Portales del Nivel 2")
    b = validar(MAPA3, "MAPA3 (Nivel 3)", rango_barro=(15, 25))
    sys.exit(0 if (a and b) else 1)
