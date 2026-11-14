import json, os
from PIL import Image

DESTINO = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fuentes', 'jardin.json')
AQUI = os.path.dirname(os.path.abspath(__file__))

COLORES = {
  'o': '#4A3347', 'w': '#FFF4E0', 'c': '#FFE3EA', 'l': '#FFC9D3', 'f': '#F7A6B4', 'p': '#F28CA0', 's': '#E58FA3',
  'r': '#E87F86', 'g': '#7FBF8E', 'm': '#BFE3B4', 'd': '#62A87C', 'y': '#FFE08A', 'k': '#E8A85C', 'h': '#8A5A44',
  'b': '#A9D8E8', 'i': '#D5EEF6', 'x': '#8CC4DC', 'e': '#E4DEEC', 'q': '#C9C2D6', 'z': '#A79FBA', 'v': '#C5B4E3',
  'u': '#9F8BC9', 'n': '#D9606E', 'a': '#F2A65A', 't': '#6E4636', 'j': '#8FCFA0',
}
V = '.' * 16

def f(*filas, arriba=0):
    filas = [V] * arriba + list(filas)
    return filas + [V] * (16 - len(filas))

# ----- Cosas pequenas, dibujadas a mano (16x16) -----
pequenos = {
  'arbusto': f(
    "......oooo......",
    "....oommggoo....",
    "...ommmgggggo...",
    "..ommgggggggdo..",
    "..omggggmgggdo..",
    ".omggggmmggggdo.",
    ".oggmggggggdgdo.",
    ".ogggggggggggdo.",
    ".odggggggdgggdo.",
    "..oddgggggdddo..",
    "...ooddddddoo...",
    ".....oooooo.....", arriba=3),
  'arbustoCorazon': f(
    "..oooo....oooo..",
    ".ommggo..ommggo.",
    ".omggggoomgggdo.",
    ".oggmgpgggggpdo.",
    ".ogggggggggggdo.",
    "..ogggpgggggdo..",
    "...ogggggggdo...",
    "....oggggddo....",
    ".....oggddo.....",
    "......oooo......",
    "......ohho......",
    "......ohho......",
    "....ommmmmmo....",
    ".....oooooo.....", arriba=2),
  'hortensia': f(
    "......oooo......",
    "....oofflvvoo...",
    "...offlfvvuvo...",
    "..ofpffgvvuvgo..",
    "..oggggmgflffo..",
    ".ofllfgggfpfgdo.",
    ".ofppfggvvuvgdo.",
    ".ogffgggvuvvgdo.",
    ".odggggggdgggdo.",
    "..oddgggggdddo..",
    "...ooddddddoo...",
    ".....oooooo.....", arriba=3),
  'macizo': f(
    "..oo...oo...oo..",
    ".opfo.oyko.oflo.",
    ".offo.okko.ollo.",
    "..oo.g.oo.g.oo..",
    "..g.gmg..gmg.g..",
    "oooooooooooooooo",
    "okggmgggmggggmko",
    "okkkkkkkkkkkkkko",
    "ohhhhhhhhhhhhhho",
    "oooooooooooooooo", arriba=5),
  'caminoPiedras': f(
    "..oooo..........",
    ".oeeqqo....ooo..",
    ".oeqqqo...oeqqo.",
    ".oqqqzo...oqqzo.",
    "..ozzo....ozzzo.",
    "...oo......ooo..",
    "................",
    "......oooo......",
    ".....oeeqqo.....",
    "....oeqqqqzo....",
    "....oqqqqzzo....",
    ".....ozzzzo.....",
    "......oooo......", arriba=1),
  'farolJardin': f(
    "......oooo......",
    ".....okkkko.....",
    "....oooooooo....",
    ".....oywyyo.....",
    ".....oyyyyo.....",
    ".....oyyyyo.....",
    "....oooooooo....",
    "......ohho......",
    "......ohho......",
    "......ohho......",
    "......ohho......",
    "......ohho......",
    "......ohho......",
    ".....ohhhho.....",
    "....oooooooo...."),
  'casitaPajaros': f(
    ".......oo.......",
    "......orro......",
    ".....orrrro.....",
    "....orrrrrro....",
    "...oooooooooo...",
    "....okkkkkko....",
    "....okkookko....",
    "....okkookko....",
    "....okkkkkko....",
    "....oooooooo....",
    "......ohho......",
    "......ohho......",
    "......ohho......",
    "......ohho......",
    ".....oommoo.....",
    ".....oooooo....."),
  'bebedero': f(
    "..oooooooooooo..",
    ".oeeibbbbbbieeo.",
    ".oqqqqqqqqqqqqo.",
    "..ozzzzzzzzzzo..",
    "...oooooooooo...",
    "......oqqo......",
    "......oqzo......",
    "......oqzo......",
    ".....oqqzzo.....",
    "....oeqqqzzo....",
    "....oooooooo....", arriba=4),
  'conejoPiedra': f(
    "....oo...oo.....",
    "...oeqo.oeqo....",
    "...oeqo.oeqo....",
    "...oeqo.oeqo....",
    "...oeqooooqo....",
    "..oeeeeeeeqqo...",
    "..oeoeeeeoeqo...",
    "..oeeeefeeeqo...",
    "...oeeeeeeqo....",
    "..oeeeeeeqqqo...",
    ".oeeqeeeeqqqzo..",
    ".oeeqeeeqqqzzo..",
    "..ooooooooooo...",
    "..ozzzzzzzzzo...",
    "..ooooooooooo..."),
  'setaJardin': f(
    ".....oooooo.....",
    "...oopfppwpoo...",
    "..opwpppppfppo..",
    ".opppfpwppppwpo.",
    ".ospppppppppsso.",
    ".oooooooooooooo.",
    "....oewwwweo....",
    "....owwwwwco....",
    "....owwwwwco....",
    "....owwwwwco....",
    "...owwwwwwwco...",
    "...oooooooooo...", arriba=3),
}

# ----- Ayudas para dibujar con figuras (los grandes y sus iconos) -----
def lienzo(lado):
    return [['.'] * lado for _ in range(lado)]

def pon(L, x, y, col):
    if 0 <= y < len(L) and 0 <= x < len(L[0]):
        L[y][x] = col

def elipse(L, cx, cy, rx, ry, col, borde=True):
    if borde:
        elipse(L, cx, cy, rx + 1, ry + 1, 'o', False)
    for y in range(len(L)):
        for x in range(len(L[0])):
            if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1:
                L[y][x] = col

def rect(L, x0, y0, x1, y1, col, borde=True):
    if borde:
        rect(L, x0 - 1, y0 - 1, x1 + 1, y1 + 1, 'o', False)
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            pon(L, x, y, col)

def tejado(L, cx, y0, y1, ancho0, crece, col, raya):
    # Triangulo con contorno: cada fila un poco mas ancha.
    for paso, (c, extra) in enumerate((('o', 1), (col, 0))):
        for y in range(y0 - (1 - paso), y1 + 1 + (1 - paso)):
            hw = ancho0 + (y - y0) * crece + extra
            for x in range(len(L[0])):
                if abs(x + 0.5 - cx) <= hw:
                    L[y][x] = c
    for y in range(y0 + 1, y1 + 1, 2):
        hw = ancho0 + (y - y0) * crece
        for x in range(len(L[0])):
            if abs(x + 0.5 - cx) <= hw - 0.5:
                L[y][x] = raya

def cuadros(L, x0, y0, x1, y1, a, b, t=2):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            L[y][x] = a if ((x - x0) // t + (y - y0) // t) % 2 == 0 else b

def filas(L):
    return [''.join(r) for r in L]

# Fuente de piedra: pila grande abajo, pie, platillo arriba y un chorrito (las gotas se animan en el juego).
def fuente():
    L = lienzo(32)
    rect(L, 1, 21, 30, 29, 'q')
    rect(L, 2, 27, 29, 29, 'z', False)
    for x in range(4, 29, 6):
        pon(L, x, 24, 'z'); pon(L, x + 3, 27, 'e')
    pon(L, 0, 30, '.'); pon(L, 31, 30, '.')
    elipse(L, 16, 21, 15, 4.5, 'e')
    elipse(L, 16, 21.4, 13, 3.2, 'q', False)
    elipse(L, 16, 21.8, 12, 2.6, 'b', False)
    for x, y in ((6, 21), (7, 21), (23, 22), (24, 22), (11, 23)):
        pon(L, x, y, 'i')
    rect(L, 14, 11, 17, 21, 'q')
    rect(L, 17, 11, 17, 21, 'z', False)
    rect(L, 12, 10, 19, 11, 'q')
    elipse(L, 16, 9.5, 7, 2.2, 'e')
    elipse(L, 16, 9.8, 5, 1.2, 'b', False)
    for x, y, c in ((15, 2, 'i'), (16, 2, 'i'), (15, 3, 'i'), (16, 3, 'b'), (15, 4, 'b'), (16, 4, 'b'), (15, 5, 'b'),
                    (16, 5, 'i'), (15, 6, 'b'), (16, 6, 'b'), (13, 4, 'b'), (12, 5, 'b'), (18, 4, 'b'), (19, 5, 'b')):
        pon(L, x, y, c)
    return filas(L)

# Banca blanca con respaldo en arco, cojin rosa y un corazon calado.
def banca():
    L = lienzo(32)
    rect(L, 3, 24, 4, 30, 'w'); rect(L, 27, 24, 28, 30, 'w')
    elipse(L, 16, 10, 13, 3.5, 'w')
    rect(L, 3, 10, 28, 18, 'w')
    for y in (12, 15):
        rect(L, 3, y, 28, y, 'c', False)
    for x, y in ((14, 11), (15, 11), (17, 11), (18, 11), (13, 12), (14, 12), (15, 12), (16, 12), (17, 12), (18, 12), (19, 12),
                 (14, 13), (15, 13), (16, 13), (17, 13), (18, 13), (15, 14), (16, 14), (17, 14), (16, 15)):
        pon(L, x - 0 if x < 16 else x, y, 'p')
    rect(L, 1, 19, 30, 22, 'w')
    rect(L, 2, 19, 29, 20, 'f', False)
    rect(L, 3, 19, 28, 19, 'l', False)
    rect(L, 1, 22, 30, 22, 'c', False)
    rect(L, 3, 24, 4, 24, 'c', False); rect(L, 27, 24, 28, 24, 'c', False)
    return filas(L)

# Pozo de los deseos: muro de piedra, tejadito rosa, cubo y agua oscura.
def pozo():
    L = lienzo(32)
    rect(L, 5, 9, 6, 22, 'h'); rect(L, 25, 9, 26, 22, 'h')
    rect(L, 7, 12, 24, 12, 'h')
    rect(L, 3, 22, 28, 29, 'q')
    for y, d in ((24, 0), (27, 3)):
        for x in range(4 + d, 28, 6):
            pon(L, x, y, 'z'); pon(L, x + 1, y, 'z')
        rect(L, 3, y + 1, 28, y + 1, 'e', False)
    rect(L, 3, 29, 28, 29, 'z', False)
    elipse(L, 16, 22, 13.5, 3, 'e')
    elipse(L, 16, 22.3, 10.5, 1.8, 'x', False)
    pon(L, 12, 22, 'b'); pon(L, 13, 22, 'b')
    rect(L, 16, 13, 16, 16, 'k', False)
    rect(L, 14, 17, 17, 19, 'k')
    rect(L, 14, 17, 17, 17, 'y', False)
    tejado(L, 16, 2, 9, 2, 1.8, 'r', 'p')
    return filas(L)

# Mesa de picnic con mantel de cuadros rosas, una cesta y una tetera.
def picnic():
    L = lienzo(32)
    rect(L, 4, 25, 5, 30, 'h'); rect(L, 26, 25, 27, 30, 'h')
    rect(L, 2, 15, 29, 22, 'w')
    cuadros(L, 2, 15, 29, 22, 'f', 'w')
    rect(L, 2, 23, 29, 25, 'p')
    for x in range(2, 30, 3):
        pon(L, x, 26, 'o'); pon(L, x + 1, 26, 'o')
    for x in range(1, 31):
        if L[26][x] != 'o' and L[25][x] == 'p':
            pon(L, x, 26, '.')
    rect(L, 1, 26, 30, 26, '.', False)
    for x in range(2, 30):
        pon(L, x, 26, 'o' if x % 3 != 1 else '.')
        if x % 3 == 1:
            pon(L, x, 25, 'o')
    rect(L, 4, 26, 5, 30, 'h', False); rect(L, 26, 26, 27, 30, 'h', False)
    rect(L, 6, 12, 12, 16, 'k')
    rect(L, 6, 12, 12, 12, 'y', False)
    elipse(L, 9.5, 11, 3.5, 3.2, '.', False)
    for x, y in ((6, 11), (6, 10), (7, 9), (8, 8), (9, 8), (10, 8), (11, 9), (12, 10), (12, 11)):
        pon(L, x, y, 'o')
    elipse(L, 22, 14, 3.5, 3, 'i')
    rect(L, 21, 10, 22, 10, 'p')
    pon(L, 26, 13, 'o'); pon(L, 27, 12, 'o')
    return filas(L)

# Iconos de los grandes (16x16) para el cajon, la bolsa y la tienda.
def fuenteIcono():
    L = lienzo(16)
    rect(L, 1, 10, 14, 14, 'q')
    rect(L, 1, 14, 14, 14, 'z', False)
    elipse(L, 8, 10, 7, 2.5, 'e')
    elipse(L, 8, 10.4, 5.5, 1.3, 'b', False)
    rect(L, 7, 5, 8, 9, 'q')
    elipse(L, 8, 4.5, 3.5, 1.2, 'e')
    for x, y, c in ((7, 0, 'i'), (8, 0, 'i'), (7, 1, 'b'), (8, 1, 'b'), (5, 2, 'b'), (10, 2, 'b')):
        pon(L, x, y, c)
    return filas(L)

def bancaIcono():
    L = lienzo(16)
    rect(L, 2, 12, 2, 14, 'w'); rect(L, 13, 12, 13, 14, 'w')
    rect(L, 2, 4, 13, 8, 'w')
    rect(L, 2, 6, 13, 6, 'c', False)
    pon(L, 7, 5, 'p'); pon(L, 8, 5, 'p')
    rect(L, 1, 9, 14, 11, 'w')
    rect(L, 1, 9, 14, 9, 'f', False)
    rect(L, 1, 11, 14, 11, 'c', False)
    return filas(L)

def pozoIcono():
    L = lienzo(16)
    rect(L, 2, 5, 2, 10, 'h'); rect(L, 13, 5, 13, 10, 'h')
    rect(L, 2, 10, 13, 14, 'q')
    rect(L, 2, 12, 13, 12, 'e', False)
    rect(L, 2, 14, 13, 14, 'z', False)
    elipse(L, 8, 10, 6.5, 1.6, 'e')
    elipse(L, 8, 10.2, 4.5, 0.9, 'x', False)
    tejado(L, 8, 1, 4, 1, 1.6, 'r', 'p')
    return filas(L)

def picnicIcono():
    L = lienzo(16)
    rect(L, 2, 12, 2, 14, 'h'); rect(L, 13, 12, 13, 14, 'h')
    rect(L, 1, 6, 14, 10, 'w')
    cuadros(L, 1, 6, 14, 10, 'f', 'w', 1)
    rect(L, 1, 11, 14, 11, 'p')
    rect(L, 5, 3, 8, 5, 'k')
    rect(L, 5, 3, 8, 3, 'y', False)
    return filas(L)

grandes = {'fuente': fuente(), 'banca': banca(), 'pozo': pozo(), 'picnic': picnic()}
pequenos.update({'fuenteIcono': fuenteIcono(), 'bancaIcono': bancaIcono(), 'pozoIcono': pozoIcono(), 'picnicIcono': picnicIcono()})

# ----- Flores y plantas (segunda tanda). Se anaden al final de cada tira para no mover los indices de antes. -----
def sello(L, x, y, patron):
    for j, fila in enumerate(patron):
        for i, ch in enumerate(fila):
            if ch != '.':
                pon(L, x + i, y + j, ch)

FLOR = [".ooo.", "obibo", "oiyio", "obibo", ".ooo."]
IRIS = [".ovo.", "ovuvo", "ouyuo", ".ouo."]
TULIPAN = ["opopo", "orppo", ".ooo."]
CAPULLO = ["..o..", ".opo.", ".oro."]
ROSA = [".oo.", "orpo", "onno", ".oo."]

def mata(L, cx=8, cy=12.5, rx=6.5, ry=2.5):
    # Matojo de hojas en el suelo, con sombra abajo y brillos arriba.
    elipse(L, cx, cy, rx, ry, 'g')
    elipse(L, cx, cy + ry * 0.55, rx - 0.8, ry * 0.5, 'd', False)
    for dx in (-4, -1, 3):
        pon(L, int(cx) + dx, int(cy - ry + 1), 'm')

rosal = f(
    "......oooo......",
    "....oogrrgoo....",
    "...omgrpnggdo...",
    "..omggnnggrrdo..",
    "..orrgggggrpno..",
    ".orpngmgggnngdo.",
    ".onnggrrggggdgo.",
    ".ogggmrpnggrrdo.",
    ".odggggnngdnndo.",
    "..oddgggggdddo..",
    "...ooddddddoo...",
    ".....oooooo.....", arriba=3)

def nomeolvides():
    L = lienzo(16)
    for x, y0 in ((3, 6), (12, 7), (7, 9)):
        rect(L, x, y0, x, 10, 'g', False)
    mata(L)
    sello(L, 1, 1, FLOR); sello(L, 10, 2, FLOR); sello(L, 5, 5, FLOR)
    return filas(L)

def lirios():
    L = lienzo(16)
    for x, y0 in ((3, 4), (8, 3), (12, 5)):
        rect(L, x, y0, x, 10, 'g', False)
    for x, y0 in ((1, 7), (5, 6), (10, 7), (14, 6)):
        rect(L, x, y0, x, 10, 'd', False)
    mata(L)
    sello(L, 1, 1, IRIS); sello(L, 6, 0, IRIS); sello(L, 10, 2, IRIS)
    return filas(L)

def tulipanes(cerrados=False):
    L = lienzo(16)
    for x, y0 in ((3, 3), (8, 2), (12, 4)):
        rect(L, x, y0, x, 9, 'g', False)
    for x, y in ((4, 7), (5, 6), (7, 7), (9, 6), (11, 7), (10, 8), (2, 8), (13, 8)):
        pon(L, x, y, 'd')
    rect(L, 3, 11, 12, 13, 'b')
    rect(L, 12, 11, 12, 13, 'x', False)
    rect(L, 2, 9, 13, 9, 'i')
    pon(L, 2, 14, '.'); pon(L, 13, 14, '.')
    cabeza = CAPULLO if cerrados else TULIPAN
    sello(L, 1, 1, cabeza); sello(L, 6, 0, cabeza); sello(L, 10, 2, cabeza)
    return filas(L)

def lavandaJardinera():
    L = lienzo(16)
    for i, x in enumerate((2, 4, 6, 8, 10, 12, 13)):
        tope = 1 + (i * 2) % 4
        pon(L, x, tope - 1, 'o')
        for y in range(tope, 8):
            pon(L, x, y, 'v' if (y + i) % 2 else 'u')
    rect(L, 2, 8, 13, 9, 'g', False)
    for x in (3, 7, 11):
        pon(L, x, 9, 'd')
    rect(L, 1, 11, 14, 13, 'k')
    rect(L, 1, 13, 14, 13, 'a', False)
    rect(L, 1, 10, 14, 10, 'y')
    return filas(L)

def bonsai():
    L = lienzo(16)
    rect(L, 7, 7, 8, 10, 'h')
    rect(L, 5, 6, 6, 7, 'h')
    copas = ((5, 5, 3.5), (10.5, 4, 3.5), (8, 2, 3))
    for cx, cy, rx in copas:
        elipse(L, cx, cy, rx, 1.6, 'g')
    for cx, cy, rx in copas:
        elipse(L, cx, cy + 0.9, rx - 0.6, 0.7, 'd', False)
        pon(L, int(cx) - 1, int(cy) - 1, 'm')
    rect(L, 3, 12, 12, 13, 'q')
    rect(L, 3, 13, 12, 13, 'z', False)
    rect(L, 2, 11, 13, 11, 'e')
    return filas(L)

def cerezoMaceta():
    L = lienzo(16)
    rect(L, 7, 7, 8, 10, 'h')
    elipse(L, 8, 5, 6.5, 4, 'f')
    elipse(L, 8, 6.4, 5.6, 2.2, 's', False)
    elipse(L, 7, 4, 4, 2, 'f', False)
    for x, y in ((4, 3), (6, 2), (9, 3), (11, 5), (5, 6), (10, 7), (12, 4)):
        pon(L, x, y, 'l')
    for x, y in ((3, 5), (8, 1), (13, 6), (7, 7)):
        pon(L, x, y, 'w')
    rect(L, 5, 12, 10, 13, 'k')
    rect(L, 5, 13, 10, 13, 'a', False)
    rect(L, 4, 11, 11, 11, 'y')
    return filas(L)

def monstera():
    L = lienzo(16)
    for x, y in ((6, 9), (7, 10), (9, 9), (8, 10), (8, 8), (8, 7)):
        pon(L, x, y, 'd')
    for cx, cy, rx, ry in ((4.5, 7, 3.5, 2.5), (11.5, 6, 3.5, 2.5), (8, 3.5, 3, 2.5)):
        elipse(L, cx, cy, rx, ry, 'g')
        rect(L, int(cx) - 1, int(cy), int(cx) + 1, int(cy), 'd', False)
        pon(L, int(cx) - 1, int(cy) - 1, 'm')
    pon(L, 2, 7, 'o'); pon(L, 13, 6, 'o'); pon(L, 8, 2, 'o')
    rect(L, 4, 12, 11, 13, 'w')
    rect(L, 4, 13, 11, 13, 'c', False)
    rect(L, 3, 11, 12, 11, 'c')
    return filas(L)

def brote():
    L = lienzo(16)
    rect(L, 7, 8, 8, 11, 'g')
    elipse(L, 5, 6.5, 2.6, 1.5, 'g'); pon(L, 4, 6, 'm')
    elipse(L, 11, 5.5, 2.6, 1.5, 'g'); pon(L, 10, 5, 'm')
    rect(L, 7, 8, 8, 8, 'g', False)
    elipse(L, 8, 13, 5.5, 1.8, 'h')
    for x, y in ((5, 13), (9, 12), (11, 13)):
        pon(L, x, y, 't')
    return filas(L)

def regadera():
    L = lienzo(16)
    rect(L, 7, 4, 10, 4, 'o', False)
    for x, y in ((6, 5), (11, 5), (6, 6), (11, 6)):
        pon(L, x, y, 'o')
    for x, y in ((3, 10), (2, 9), (1, 8)):
        pon(L, x, y - 1, 'o'); pon(L, x, y + 1, 'o')
    rect(L, 5, 7, 12, 12, 'p')
    rect(L, 12, 8, 12, 12, 's', False)
    rect(L, 6, 8, 6, 11, 'l', False)
    rect(L, 5, 9, 12, 9, 'f', False)
    for x, y in ((3, 10), (2, 9), (1, 8), (4, 10)):
        pon(L, x, y, 'p')
    for y in (6, 7, 8, 9):
        pon(L, 0, y, 'o')
    pon(L, 1, 7, 'f'); pon(L, 1, 6, 'o'); pon(L, 1, 9, 'o')
    return filas(L)

# Grandes (32x32): girasoles (de pie o con la cabeza gacha), celosia con rosas y sombrilla (abierta o cerrada).
def girasoles(caidos=False):
    L = lienzo(32)
    tallos = ((10, 9), (16, 5), (22, 11))
    for x, y in tallos:
        rect(L, x, y + 3, x + 1, 29, 'g')
    for x, y, lado in ((10, 19, -1), (16, 14, 1), (22, 21, 1), (16, 22, -1)):
        elipse(L, x + 0.5 + lado * 3, y, 2.5, 1.2, 'g')
        pon(L, x + lado * 3, y, 'd')
    elipse(L, 16, 30, 10, 1.6, 'g')
    rect(L, 8, 30, 24, 30, 'd', False)
    for x, y in tallos:
        if caidos:
            # Con lluvia o de noche agachan la cabeza: se ven de lado, mirando al suelo.
            pon(L, x + 2, y + 3, 'g'); pon(L, x + 2, y + 4, 'g')
            elipse(L, x + 3.5, y + 6, 2.2, 3, 'y')
            elipse(L, x + 4.4, y + 6.4, 0.9, 2.2, 'h', False)
            rect(L, x + 2, y + 9, x + 4, y + 9, 'k', False)
        else:
            elipse(L, x + 1, y + 1, 4, 4, 'k')
            elipse(L, x + 1, y + 0.6, 3.2, 3.2, 'y', False)
            elipse(L, x + 1, y + 1, 1.8, 1.8, 'h', False)
            pon(L, x, y, 't'); pon(L, x + 1, y + 1, 't')
    return filas(L)

def celosia():
    import random
    L = lienzo(32)
    rect(L, 2, 6, 3, 27, 'k'); rect(L, 28, 6, 29, 27, 'k')
    rect(L, 2, 4, 29, 5, 'k')
    for y in range(7, 27):
        for x in range(4, 28):
            if (x + y) % 6 == 0 or (x - y) % 6 == 0:
                L[y][x] = 'h' if (x + y) % 12 == 0 else 'k'
    rnd = random.Random(7)
    for _ in range(60):
        x, y = rnd.randint(4, 27), rnd.randint(7, 26)
        if L[y][x] != '.':
            L[y][x] = rnd.choice('gdg')
    for x, y in ((5, 8), (13, 6), (22, 9), (8, 15), (18, 13), (24, 17), (11, 21), (20, 22), (5, 22)):
        sello(L, x, y, ROSA)
    rect(L, 1, 27, 30, 30, 'k')
    rect(L, 1, 29, 30, 30, 'a', False)
    rect(L, 1, 27, 30, 27, 'y', False)
    for x in range(3, 29, 4):
        pon(L, x, 26, 'g'); pon(L, x + 1, 25, 'd')
    return filas(L)

def sombrilla(cerrada=False):
    L = lienzo(32)
    if cerrada:
        rect(L, 15, 6, 16, 21, 'w')
        rect(L, 14, 3, 17, 13, 'p')
        for y in (5, 8, 11):
            rect(L, 14, y, 17, y, 'w', False)
        pon(L, 15, 1, 'o'); pon(L, 16, 1, 'o')
    else:
        rect(L, 15, 6, 16, 21, 'w')
        for y in range(1, 13):
            for x in range(32):
                d = ((x + 0.5 - 16) / 15) ** 2 + ((y + 0.5 - 12.5) / 11) ** 2
                if d <= 1:
                    L[y][x] = 'o' if d > 0.86 or y == 12 else ('p' if ((x - 16) // 4) % 2 else 'w')
        for x in range(1, 31):
            if x % 4 == 2:
                pon(L, x, 13, 'o')
        rect(L, 15, 3, 16, 3, 'f', False)
    rect(L, 15, 23, 16, 28, 'w')
    rect(L, 12, 29, 19, 29, 'w')
    elipse(L, 16, 22, 7, 2, 'w')
    elipse(L, 16, 22, 5, 1, 'c', False)
    for cx in (4, 28):
        rect(L, cx - 1, 27, cx, 29, 'w')
        elipse(L, cx, 26, 3, 1.3, 'p')
    return filas(L)

def girasolesIcono():
    L = lienzo(16)
    rect(L, 7, 8, 8, 14, 'g')
    elipse(L, 4.5, 11, 2.5, 1.2, 'g'); elipse(L, 11.5, 10, 2.5, 1.2, 'g')
    elipse(L, 8, 5, 4.5, 4.5, 'k')
    elipse(L, 8, 4.6, 3.6, 3.6, 'y', False)
    elipse(L, 8, 5, 2, 2, 'h', False)
    return filas(L)

def celosiaIcono():
    L = lienzo(16)
    rect(L, 1, 3, 1, 13, 'k'); rect(L, 14, 3, 14, 13, 'k'); rect(L, 1, 2, 14, 2, 'k')
    for y in range(4, 13):
        for x in range(2, 14):
            if (x + y) % 4 == 0 or (x - y) % 4 == 0:
                L[y][x] = 'k'
    for x, y in ((2, 4), (9, 3), (5, 8), (10, 9)):
        sello(L, x, y, ROSA)
    rect(L, 1, 13, 14, 14, 'k')
    return filas(L)

def sombrillaIcono():
    L = lienzo(16)
    rect(L, 7, 6, 8, 12, 'w')
    for y in range(1, 7):
        for x in range(16):
            d = ((x + 0.5 - 8) / 7.5) ** 2 + ((y + 0.5 - 6.5) / 5.5) ** 2
            if d <= 1:
                L[y][x] = 'o' if d > 0.8 or y == 6 else ('p' if ((x - 8) // 2) % 2 else 'w')
    elipse(L, 8, 12, 4.5, 1.2, 'w')
    rect(L, 7, 13, 8, 14, 'w')
    return filas(L)

pequenos.update({
    'rosal': rosal, 'nomeolvides': nomeolvides(), 'lirios': lirios(), 'tulipanes': tulipanes(), 'tulipanesCerrados': tulipanes(True),
    'lavandaJardinera': lavandaJardinera(), 'bonsai': bonsai(), 'cerezoMaceta': cerezoMaceta(), 'monstera': monstera(),
    'brote': brote(), 'regadera': regadera(),
    'girasolesIcono': girasolesIcono(), 'celosiaIcono': celosiaIcono(), 'sombrillaIcono': sombrillaIcono(),
})
grandes.update({
    'girasoles': girasoles(), 'girasolesCaidos': girasoles(True), 'celosia': celosia(),
    'sombrilla': sombrilla(), 'sombrillaCerrada': sombrilla(True),
})


def revisar(nombre, fs, lado):
    assert len(fs) == lado, (nombre, len(fs))
    for i, fila in enumerate(fs):
        assert len(fila) == lado, (nombre, i, len(fila), fila)
        for ch in fila:
            assert ch == '.' or ch in COLORES, (nombre, i, ch)

for k, v in pequenos.items(): revisar(k, v, 16)
for k, v in grandes.items(): revisar(k, v, 32)

datos = {
  'nombre': 'jardin',
  'colores': COLORES,
  'animaciones': {
    'tiles': {'fps': 1, 'cuadros': list(pequenos)},
    'grandes': {'fps': 1, 'cuadros': list(grandes)},
  },
  'cuadros': {**pequenos, **grandes},
}
json.dump(datos, open(DESTINO, 'w', encoding='utf8'), indent=2, ensure_ascii=False)
print('tiles', {k: i for i, k in enumerate(pequenos)})
print('grandes', {k: i for i, k in enumerate(grandes)})

# Vista previa ampliada para revisar a ojo.
def pintar(fs):
    lado = len(fs)
    im = Image.new('RGBA', (lado, lado), (190, 227, 180, 255))
    for y, fila in enumerate(fs):
        for x, ch in enumerate(fila):
            if ch != '.':
                c = COLORES[ch]
                im.putpixel((x, y), tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
    return im
hoja = Image.new('RGBA', (34 * len(grandes) + 18 * len(pequenos), 34), (255, 255, 255, 255))
x = 0
for v in grandes.values():
    hoja.paste(pintar(v), (x, 0)); x += 34
for v in pequenos.values():
    hoja.paste(pintar(v), (x, 9)); x += 18
hoja.resize((hoja.width * 4, hoja.height * 4), Image.NEAREST).save(os.path.join(AQUI, 'sprites', 'jardin_prev.png'))
