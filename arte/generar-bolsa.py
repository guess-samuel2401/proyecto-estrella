# Genera arte/fuentes/bolsa.json: piezas del panel de la bolsa (una mochila de cuero por dentro).
#   cuero          24x24, se corta a 8: cuero caramelo con costura crema a 3 px del borde (el marco del panel)
#   forro          24x24, se corta a 8: el forro de lino del bolsillo donde van las ranuras, con pespunte fresa
#   ficha          24x24, se corta a 8: retazo de lona crema cosido (el inspector de la derecha)
#   ranura         20x20: hueco hundido en el lino (sombra arriba a la izquierda, luz abajo a la derecha)
#   ranuraElegida  20x20: el mismo hueco, mantequilla y con pespunte fresa alrededor
#   pestana, pestanaElegida  16x16, se cortan a 5: etiquetas de tela de las pestanas (lino / fresa)
#   broche         16x16: lengueta de cuero con broche de laton (cerrar)
#   plato          20x20: platito de fieltro hundido para el icono grande del inspector
#   iconos         12x12: saquito, pez, camiseta, sillon, pala (pestanas) y hojita (contador); la concha es mostrador_concha
# Uso: python arte/generar-bolsa.py  y luego  powershell -ExecutionPolicy Bypass -File arte/generar-sprites.ps1
# Salen arte/sprites/bolsa_<nombre>.png. Las letras de color no distinguen mayusculas.
import json, math, os

RAIZ = os.path.dirname(os.path.abspath(__file__))
C = {
    'o': '#4A3347', 'w': '#FFFFFF',
    # cuero caramelo
    'a': '#D9A27A', 'b': '#E8BC94', 'c': '#B8805C', 'd': '#9C6B4E', 'e': '#FFF4E0',
    # lino del forro y de las ranuras
    'l': '#F6E3D6', 'm': '#EBD3C2', 'n': '#D2B19C', 'p': '#FFF8F0', 'q': '#B08470', 'f': '#F28CA0',
    # mantequilla
    'y': '#FFE9B0', 'u': '#FFF6D6', 'z': '#E8C77A',
    # fresa de la pestana elegida
    'r': '#F7A6B4', 's': '#FFD3DC', 't': '#E0607E',
    # laton
    'g': '#E8B84F', 'h': '#FFE08A', 'k': '#B8862E',
    # iconos
    'i': '#8FC98A', 'j': '#5E9E6E', 'v': '#A9D8E8', 'x': '#C9A7D8',
}


def vacio(w, h): return [['.'] * w for _ in range(h)]
def filas(p): return [''.join(r) for r in p]


def redondo(w, h, esquinas):
    def dentro(x, y):
        if not (0 <= x < w and 0 <= y < h): return False
        for i, c in enumerate(esquinas):
            if (y == i or y == h - 1 - i) and (x < c or x > w - 1 - c): return False
        return True
    return dentro


def forma(w, h, dentro, pintar):
    p = vacio(w, h)
    for y in range(h):
        for x in range(w):
            if not dentro(x, y): continue
            borde = not all(dentro(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            p[y][x] = 'o' if borde else pintar(x, y)
    return p


def costura(p, d, letra, paso=3):
    """Pespunte de rayitas a d pixeles del borde."""
    w, h = len(p[0]), len(p)
    for x in range(d + 1, w - d - 1):
        if x % paso != 0: p[d][x] = letra; p[h - 1 - d][x] = letra
    for y in range(d + 1, h - d - 1):
        if y % paso != 0: p[y][d] = letra; p[y][w - 1 - d] = letra


def cuero():
    w = h = 24
    def pintar(x, y):
        if y >= h - 3 or x >= w - 3: return 'd' if (y >= h - 2 or x >= w - 2) else 'c'
        if y <= 1 or x <= 1: return 'b'
        return 'c' if ((x * 7 + y * 13) % 17 == 0) else 'a'          # poros del cuero
    p = forma(w, h, redondo(w, h, [3, 1, 1]), pintar)
    costura(p, 4, 'e')
    return filas(p)


def forro():
    w = h = 24
    def pintar(x, y):
        if y <= 2 or x <= 2: return 'n'                               # el forro se mete por dentro del cuero
        return 'm' if (x + y) % 4 == 0 and x % 2 == 0 else 'l'        # trama del lino
    p = forma(w, h, redondo(w, h, [2, 1]), pintar)
    costura(p, 4, 'f')
    return filas(p)


def ficha():
    w = h = 24
    def pintar(x, y):
        if y >= h - 3 or x >= w - 3: return 'n' if (y >= h - 2 or x >= w - 2) else 'm'
        if y <= 1 or x <= 1: return 'p'
        return 'm' if (x * 3 + y * 5) % 11 == 0 else 'e'
    p = forma(w, h, redondo(w, h, [3, 1, 1]), pintar)
    costura(p, 3, 'q', 4)
    return filas(p)


def ranura(base, luz, sombra, borde, puntada=None):
    w = h = 20
    def pintar(x, y):
        if x <= 2 or y <= 2: return sombra if x + y > 3 else borde    # hundido: sombra arriba a la izquierda
        if x >= w - 3 or y >= h - 3: return luz
        return base
    p = forma(w, h, redondo(w, h, [3, 1, 1]), pintar)
    for y in range(h):
        for x in range(w):
            if p[y][x] == 'o': p[y][x] = borde
    if puntada: costura(p, 1, puntada, 2)
    else:                                                             # bolsillo cosido: pespunte suave por dentro
        costura(p, 3, sombra, 3)
        for x in range(4, w - 4): p[3][x] = sombra if x % 3 else p[3][x]   # el labio de arriba del bolsillo
    return filas(p)


def pestana(base, luz, sombra, puntada):
    w = h = 16
    def pintar(x, y):
        if y >= h - 3: return sombra
        if y <= 1 or x <= 1: return luz
        return base
    p = forma(w, h, redondo(w, h, [3, 1, 1]), pintar)
    costura(p, 3, puntada, 3)
    return filas(p)


def broche():
    w = h = 16
    p = forma(w, h, redondo(w, h, [4, 2, 1, 1]), lambda x, y: 'd' if y >= 13 else 'b' if y <= 2 else 'a')
    costura(p, 2, 'e', 3)
    for y in range(h):
        for x in range(w):
            d = math.hypot(x - 7.5, y - 7.5)
            if d <= 4.6: p[y][x] = 'o' if d > 3.7 else 'k' if (x - 7.5) + (y - 7.5) > 2 else 'h' if (x - 7.5) + (y - 7.5) < -2 else 'g'
    p[6][6] = 'w'
    return filas(p)


def plato():
    w = h = 20
    def pintar(x, y):
        d = math.hypot(x - 9.5, y - 9.5)
        if d > 8.0 and (x + y) < 19: return 'n'                       # canto hundido
        if d > 8.0: return 'p'
        return 'l'
    p = forma(w, h, lambda x, y: math.hypot(x - 9.5, y - 9.5) <= 9.6, pintar)
    for y in range(h):
        for x in range(w):
            if p[y][x] == 'o': p[y][x] = 'q'
    return filas(p)


ICONOS = {
    'saquito': [
        "....o..o....",
        "...ofoof....",
        "....oggo....",
        "...oaaaao...",
        "..oabbaaao..",
        ".oabaaaaaco.",
        ".oaaaiaaaco.",
        ".oaaijaaaco.",
        ".oaaaaaacco.",
        "..occcccco..",
        "...oooooo...",
        "............",
    ],
    'pez': [
        "............",
        "....oooo....",
        "..oovvvvo.o.",
        ".ovvvvvvvoo.",
        "ovowvvvvvvvo",
        "ovvvvvvvvvvo",
        ".ovfvvvvvoo.",
        "..oovvvvo.o.",
        "....oooo....",
        "............",
        "............",
        "............",
    ],
    'camiseta': [
        "............",
        "..ooo..ooo..",
        ".orrroorrro.",
        "orrrrrrrrrro",
        "orroresrrrro",
        ".oorrrrrroo.",
        "...orrrrro..",
        "...orsrrro..",
        "...orrrrro..",
        "...otttttro.",
        "....ooooo...",
        "............",
    ],
    'sillon': [
        "............",
        "...oooooo...",
        "..oxxxxxxo..",
        ".ooxxxxxxoo.",
        "oxoxxxxxxoxo",
        "oxooooooooxo",
        "oxxxxxxxxxxo",
        "oxxxxxxxxxxo",
        ".oooooooooo.",
        ".od......do.",
        ".oo......oo.",
        "............",
    ],
    'pala': [
        "........ooo.",
        ".......odbo.",
        "......odbo..",
        ".....odbo...",
        "....odbo....",
        "..oood.o....",
        ".ohhgoo.....",
        "ohhggko.....",
        "ohgggko.....",
        "oggkko......",
        ".okko.......",
        "..oo........",
    ],
    'hoja': [
        "........ooo.",
        "......ooiio.",
        "....ooiiiio.",
        "...oiiijiio.",
        "..oiiijiiio.",
        "..oiijiiio..",
        ".oiijiiio...",
        ".oijiiio....",
        ".ojoooo.....",
        "oj..........",
        "o...........",
        "............",
    ],
}

cuadros = {
    'cuero': cuero(), 'forro': forro(), 'ficha': ficha(),
    'ranura': ranura('m', 'p', 'n', 'q'), 'ranuraElegida': ranura('y', 'u', 'z', 't', 'f'),
    'pestana': pestana('l', 'p', 'n', 'q'), 'pestanaElegida': pestana('r', 's', 't', 'e'),
    'broche': broche(), 'plato': plato(), **ICONOS,
}
for k, v in cuadros.items():
    assert len(set(map(len, v))) == 1, ('filas de distinto largo', k, [len(r) for r in v])
    assert all(ch in C or ch == '.' for r in v for ch in r), ('color sin definir', k)
uno = lambda n: {'fps': 0, 'cuadros': [n]}
anims = {n: uno(n) for n in ('cuero', 'forro', 'ficha', 'ranura', 'ranuraElegida', 'pestana', 'pestanaElegida', 'broche', 'plato')}
anims['iconos'] = {'fps': 0, 'cuadros': list(ICONOS)}
json.dump({'nombre': 'bolsa', 'descripcion': 'Panel de la bolsa (lo genera arte/generar-bolsa.py; no editar a mano).',
           'colores': C, 'animaciones': anims, 'cuadros': cuadros},
          open(os.path.join(RAIZ, 'fuentes', 'bolsa.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
print('ok', len(cuadros), 'cuadros')
