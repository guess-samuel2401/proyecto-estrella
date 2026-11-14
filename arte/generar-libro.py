# Genera arte/fuentes/libro.json: piezas del libro de ayuda ("Como se juega").
#   tapa      24x24, se corta a 8: tapa de cuero cacao con costura crema (el libro abierto va encima)
#   tecla     12x12, se corta a 4: tecla de teclado retro, crema con canto de 2 px (relieve)
#   anilla    20x8: anilla de alambre que cruza el lomo entre las dos paginas
#   cerrar    16x16: boton de costura fresa con cuatro agujeros y el hilo cosido en X
#   clip      8x16: clip de metal para la esquina de la pagina
# Uso: python arte/generar-libro.py  y luego  powershell -ExecutionPolicy Bypass -File arte/generar-sprites.ps1
import json, math, os

RAIZ = os.path.dirname(os.path.abspath(__file__))
C = {
    'o': '#4A3347',
    'c': '#C98F6B', 'k': '#DDA77F', 'd': '#A87358', 'n': '#8A5A44', 'w': '#FFF4E0',
    'b': '#FFFBF3', 'e': '#F2DFD0', 'h': '#E3C9BC', 'g': '#C9AE9F',
    'i': '#E6ECF5', 'm': '#A7B3C9', 'j': '#6E6A8C',
    'p': '#F28CA0', 'l': '#FFB3C1', 'r': '#D9607E',
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
            p[y][x] = 'o' if borde else pintar(x, y, alto)
    if suelo:
        for x in range(w):
            if p[alto - 1][x] == 'o': p[alto][x] = 'o'
    return p

def tapa():
    def pintar(x, y, alto):
        if y <= 1 or x <= 1: return 'k'
        if y >= alto - 3 or x >= 21: return 'd' if (y < alto - 2 and x < 22) else 'n'
        if (x * 3 + y * 5) % 11 == 0: return 'd'                       # granito del cuero
        return 'c'
    p = caja(24, 24, [3, 1, 1], pintar)
    for x in range(4, 20):
        if x % 3: p[3][x] = 'w'; p[19][x] = 'w'
    for y in range(4, 20):
        if y % 3: p[y][3] = 'w'; p[y][20] = 'w'
    return filas(p)

def tecla():
    def pintar(x, y, alto):
        if y >= alto - 3: return 'h' if y == alto - 3 else 'g'          # canto de la tecla
        if y == 1 or x == 1: return 'b'
        if x == 10: return 'e'
        return 'w'
    return filas(caja(12, 12, [2, 1], pintar))

anilla = [
    "....................",
    ".oo..............oo.",
    "oiio.oooooooooo.oiio",
    "oiimoiiiiiiiiiimoimo",
    "omjomjmmmmmmmmjomjjo",
    ".oo..oooooooooo..oo.",
    "....................",
    "....................",
]

def cerrar():
    w = h = 16
    cx, cy = 7.5, 7.5
    p = vacio(w, h)
    for y in range(h):
        for x in range(w):
            d = math.hypot(x - cx, y - cy)
            if d > 7.6: continue
            if d > 6.7: p[y][x] = 'o'
            elif d > 5.4: p[y][x] = 'l' if (x - cx) + (y - cy) < -3 else 'r' if (x - cx) + (y - cy) > 3 else 'p'
            elif d > 4.6 and (x - cx) + (y - cy) > 1: p[y][x] = 'r'                       # el borde hundido del boton
            else: p[y][x] = 'p'
    antes = [r[:] for r in p]
    for y in range(h):
        for x in range(w):
            if antes[y][x] != '.' and any(not (0 <= x + dx < w and 0 <= y + dy < h) or antes[y + dy][x + dx] == '.' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                p[y][x] = 'o'
    # cuatro agujeros y el hilo crema cosido en X entre ellos
    for (x, y) in ((5, 5), (10, 5), (5, 10), (10, 10)):
        p[y][x] = 'o'
    for i in range(6, 10):
        p[i][i] = 'w'; p[i][15 - i] = 'w'
    return filas(p)

clip = [
    "..oooo..",
    ".oimmio.",
    "oio..omo",
    "oio..omo",
    "oio.oimo",
    "oiooimmo",
    "oiooiomo",
    "oiooiomo",
    "oiooiomo",
    "oioo.omo",
    "oio..omo",
    "oio..omo",
    "oiooooio",
    ".oimmio.",
    "..oooo..",
    "........",
]

cuadros = {'tapa': tapa(), 'tecla': tecla(), 'anilla': anilla, 'cerrar': cerrar(), 'clip': clip}
for k, v in cuadros.items():
    assert len(set(map(len, v))) == 1, ('filas de distinto largo', k)
    assert all(ch in C or ch == '.' for r in v for ch in r), ('color sin definir', k)
json.dump({'nombre': 'libro', 'descripcion': 'Libro de ayuda (lo genera arte/generar-libro.py; no editar a mano).',
           'colores': C, 'animaciones': {k: {'fps': 0, 'cuadros': [k]} for k in cuadros}, 'cuadros': cuadros},
          open(os.path.join(RAIZ, 'fuentes', 'libro.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
for k in cuadros:
    print(k); print('\n'.join(cuadros[k]))
