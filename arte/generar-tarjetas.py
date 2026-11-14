# Genera arte/fuentes/tarjeta.json: piezas de la tarjeta de los vecinos (la etiqueta que sale al acercarte).
#   retazo     24x24, se corta a 8: retazo de tela crema con costura rosa y canto de doble grosor (relieve)
#   aro        22x22: medallon de madera para el retrato (el hueco de dentro es transparente)
#   corazones  9x8: lleno (fresa con brillo) y vacio (sombreado)
#   adornos    8x8: esquina doblada, huella, florecita y hojita
# Uso: python arte/generar-tarjetas.py  y luego  powershell -ExecutionPolicy Bypass -File arte/generar-sprites.ps1
# Salen arte/sprites/tarjeta_<nombre>.png. Las letras de color no distinguen mayusculas.
import json, math, os

RAIZ = os.path.dirname(os.path.abspath(__file__))
C = {
    'o': '#4A3347', 'w': '#FFF4E0', 'b': '#FFFBF3', 'e': '#F2DFD0', 'h': '#E3C9BC',
    'p': '#F28CA0', 'l': '#FFB3C1', 'r': '#E0607E', 'd': '#B8456A',
    'v': '#EADBE0', 's': '#D2BCC6', 'g': '#BBA3B0',
    'm': '#F0C99A', 'k': '#FFE6C4', 'c': '#C98F6B', 'n': '#A87358',
    'y': '#FFE08A', 'f': '#F7A6B4', 'a': '#A8D89A', 'z': '#6FAE7E', 'q': '#B58AA8',
}

def vacio(w, h): return [['.'] * w for _ in range(h)]
def filas(p): return [''.join(r) for r in p]

def retazo():
    # Tela crema: contorno, brillo arriba-izquierda, canto de 2 px abajo y a la derecha, trama y costura rosa.
    w = h = 24
    def dentro(x, y):
        if not (0 <= x < w and 0 <= y < h): return False
        for i, c in enumerate([3, 1, 1]):
            if (y == i or y == h - 1 - i) and (x < c or x > w - 1 - c): return False
        return True
    p = vacio(w, h)
    for y in range(h):
        for x in range(w):
            if not dentro(x, y): continue
            if not all(dentro(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): p[y][x] = 'o'
            elif y >= h - 3 or x >= w - 3: p[y][x] = 'h' if (y >= h - 2 or x >= w - 2) else 'e'   # canto doble
            elif y <= 1 or x <= 1: p[y][x] = 'b'
            elif (x + y) % 4 == 0 and x % 2 == 0: p[y][x] = 'e'                                   # trama de la tela
            else: p[y][x] = 'w'
    for x in range(4, w - 4):                                                                     # costura
        if x % 3 != 0: p[3][x] = 'p'; p[h - 5][x] = 'p'
    for y in range(4, h - 4):
        if y % 3 != 0: p[y][3] = 'p'; p[y][w - 5] = 'p'
    return filas(p)

def aro():
    w = h = 22
    cx = cy = 10.5
    p = vacio(w, h)
    for y in range(h):
        for x in range(w):
            d = math.hypot(x - cx, y - cy)
            if d > 10.6: continue
            if d > 9.6: p[y][x] = 'o'
            elif d > 7.4:
                s = (x - cx) + (y - cy)
                p[y][x] = 'k' if s < -6 else 'c' if s > 6 else 'm'
                if d > 8.7 and s > 9: p[y][x] = 'n'
            elif d > 6.5: p[y][x] = 'o'
    return filas(p)

corazon_forma = [
    ".oo...oo.",
    "o..o.o..o",
    "o...o...o",
    "o.......o",
    ".o.....o.",
    "..o...o..",
    "...o.o...",
    "....o....",
]
def corazon(lleno):
    p = [list(r) for r in corazon_forma]
    for y in range(8):
        dentro = False
        xs = [x for x in range(9) if p[y][x] == 'o']
        if len(xs) < 2: continue
        for x in range(xs[0] + 1, xs[-1]):
            if p[y][x] != '.': continue
            # solo lo que queda entre contornos (no el hueco de arriba entre los lobulos)
            izq = any(p[y][i] == 'o' for i in range(x)); der = any(p[y][i] == 'o' for i in range(x + 1, 9))
            if not (izq and der): continue
            if y == 0: continue
            if y == 1 and x == 4: continue
            if lleno:
                p[y][x] = 'l' if (y <= 2 and x in (2, 6)) or (y == 2 and x == 1) else ('r' if (y >= 4 and x >= 4) or x >= 7 else 'p')
            else:
                p[y][x] = 's' if (y >= 4 and x >= 4) or x >= 7 else 'v'
    if lleno: p[1][2] = 'b'
    return filas(p)

doblez = [
    "oooooooo",
    ".ohhhhho",
    "..oeeeho",
    "...oeeho",
    "....oeho",
    ".....oho",
    "......oo",
    ".......o",
]
huella = [
    "..q..q..",
    ".qq..qq.",
    "q......q",
    "qq.qq.qq",
    "..qqqq..",
    ".qqqqqq.",
    ".qqqqqq.",
    "..q..q..",
]
florecita = [
    "...ff...",
    "..fllf..",
    ".fffyfff",
    "fllyyylf",
    ".fffyfff",
    "..fllf..",
    "...ff...",
    "........",
]
hojita = [
    "......aa",
    "....aaza",
    "...aaz.a",
    "..aaz.aa",
    ".aza.aa.",
    ".z.aaa..",
    "z.......",
    "........",
]

cuadros = {
    'retazo': retazo(), 'aro': aro(),
    'corazonLleno': corazon(True), 'corazonVacio': corazon(False),
    'doblez': doblez, 'huella': huella, 'florecita': florecita, 'hojita': hojita,
}
for k, v in cuadros.items():
    assert len(set(map(len, v))) == 1, ('filas de distinto largo', k)
    assert all(ch in C or ch == '.' for r in v for ch in r), ('color sin definir', k)
anims = {'retazo': {'fps': 0, 'cuadros': ['retazo']}, 'aro': {'fps': 0, 'cuadros': ['aro']},
         'corazones': {'fps': 0, 'cuadros': ['corazonLleno', 'corazonVacio']},
         'adornos': {'fps': 0, 'cuadros': ['doblez', 'huella', 'florecita', 'hojita']}}
json.dump({'nombre': 'tarjeta', 'descripcion': 'Tarjeta de los vecinos (la genera arte/generar-tarjetas.py; no editar a mano).',
           'colores': C, 'animaciones': anims, 'cuadros': cuadros},
          open(os.path.join(RAIZ, 'fuentes', 'tarjeta.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
for k in ('retazo', 'aro', 'corazonLleno', 'corazonVacio'):
    print(k); print('\n'.join(cuadros[k]))
