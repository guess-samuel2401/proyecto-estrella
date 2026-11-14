# Genera arte/fuentes/nota.json: piezas de las notas de consejo y del dialogo.
#   nota      24x24, se corta a 8: pergamino crema con doble contorno (ciruela y canela) y sombra abajo
#   marco     20x20: marquito de madera para el icono del consejo (el icono de 16x16 va dentro, a 2 px)
#   adornos   12x12: hojitas, estrellita, chincheta y florecita para las esquinas
#   avanzar   8x8: huellita y flechita que botan en la esquina del dialogo (Espacio para seguir)
# Uso: python arte/generar-notas.py  y luego  powershell -ExecutionPolicy Bypass -File arte/generar-sprites.ps1
import json, os

RAIZ = os.path.dirname(os.path.abspath(__file__))
C = {
    'o': '#4A3347', 'n': '#C98F6B', 'd': '#A87358', 'k': '#DDA77F',
    'w': '#FFF4E0', 'b': '#FFFBF3', 'e': '#F2DFD0', 'h': '#E3C9BC',
    'v': '#8FC98A', 'g': '#5E9E6E', 'y': '#FFE08A', 'm': '#E8A85C',
    'p': '#F28CA0', 'r': '#D9607E', 'l': '#FFB3C1',
}

def vacio(w, h): return [['.'] * w for _ in range(h)]
def filas(p): return [''.join(r) for r in p]

def caja(w, h, esquinas, pintar, suelo=True):
    alto = h - 1 if suelo else h
    def dentro(x, y):
        if not (0 <= x < w and 0 <= y < alto): return False
        for i, c in enumerate(esquinas):
            if (y == i or y == alto - 1 - i) and (x < c or x > w - 1 - c): return False
        return True
    p = vacio(w, h)
    for y in range(alto):
        for x in range(w):
            if not dentro(x, y): continue
            borde = not all(dentro(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            p[y][x] = 'o' if borde else pintar(x, y, alto, w)
    if suelo:
        for x in range(w):
            if p[alto - 1][x] == 'o': p[alto][x] = 'o'
    return p

def nota():
    # Pergamino: brillo arriba, sombra de dos filas abajo y un segundo contorno canela a 2 px del borde.
    def pintar(x, y, alto, w):
        if y >= alto - 3: return 'h' if y == alto - 2 else 'e'
        if y == 1: return 'b'
        if (x == 2 or x == w - 3) and 2 <= y <= alto - 4: return 'n'
        if (y == 2 or y == alto - 4) and 2 <= x <= w - 3: return 'n'
        if (x * 7 + y * 3) % 13 == 0 and 3 < x < w - 4 and 3 < y < alto - 4: return 'e'    # fibras del papel
        return 'w'
    return filas(caja(24, 24, [3, 1, 1], pintar))

def marco():
    def pintar(x, y, alto, w):
        if 2 <= x <= w - 3 and 2 <= y <= alto - 3: return 'b' if y < 4 else 'w'
        if y <= 1 or x <= 1: return 'k'
        return 'd' if y >= alto - 2 else 'n'
    return filas(caja(20, 20, [2, 1], pintar))

hojas = [
    "............",
    ".......ooo..",
    "......ovvvo.",
    ".....ovvvgo.",
    ".oo..ovvggo.",
    "ovvo.ovggo..",
    "ovvvoogoo...",
    "ovvgggo.....",
    ".oggoo......",
    "..oo.o......",
    ".....o......",
    "............",
]
estrella = [
    "............",
    ".....oo.....",
    ".....oyo....",
    "....oyyo....",
    "ooooyyyoooo.",
    "oyyyyyyyyyo.",
    ".oyyoyyoyo..",
    "..oyyyyymo..",
    "..oyymmymo..",
    ".oymoo.omyo.",
    ".ooo....ooo.",
    "............",
]
chincheta = [
    "............",
    "....oooo....",
    "...olbppo...",
    "...olpppo...",
    "...oppprro..",
    "....orrro...",
    "...oooooo...",
    "...orrrro...",
    "....oooo....",
    "......o.....",
    "......o.....",
    "............",
]
flor = [
    "............",
    "....oo.oo...",
    "...ollolpo..",
    "...olpopro..",
    ".oooooyoooo.",
    "olpoyyyyolpo",
    "oppoyyyypppo",
    ".oooooyoooo.",
    "...olporpo..",
    "...oppoppo..",
    "....oo.oo...",
    "............",
]
huella = [
    "........",
    ".o.o.o..",
    "opopopo.",
    ".o.o.o..",
    "..ooo...",
    ".ollpo..",
    ".opppo..",
    "..ooo...",
]
flecha = [
    "........",
    "ooooooo.",
    "oyyyyyo.",
    ".oyyyo..",
    ".oymyo..",
    "..omo...",
    "..oo....",
    "........",
]

def tira(*cuadros):
    return [''.join(c[y] for c in cuadros) for y in range(len(cuadros[0]))]

cuadros = {'nota': nota(), 'marco': marco(), 'adornos': tira(hojas, estrella, chincheta, flor), 'avanzar': tira(huella, flecha)}
for k, v in cuadros.items():
    assert len(set(map(len, v))) == 1, ('filas de distinto largo', k)
    assert all(ch in C or ch == '.' for r in v for ch in r), ('color sin definir', k)
json.dump({'nombre': 'nota', 'descripcion': 'Notas de consejo y dialogo (lo genera arte/generar-notas.py; no editar a mano).',
           'colores': C, 'animaciones': {k: {'fps': 0, 'cuadros': [k]} for k in cuadros}, 'cuadros': cuadros},
          open(os.path.join(RAIZ, 'fuentes', 'nota.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
for k in cuadros:
    print(k); print('\n'.join(cuadros[k]))
