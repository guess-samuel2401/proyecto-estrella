# Genera arte/fuentes/mostrador.json: piezas del panel de la tiendecita de Bellota.
#   madera     24x24, se corta a 8: mostrador de pino con tablas, clavitos en las esquinas y canto de 2 px
#   toldo      16x18, se repite en horizontal: toldo de rayas fresa y crema con el borde en ondas
#   kraft      24x24, se corta a 8: etiqueta de papel kraft con las esquinas de arriba cortadas (tarjetas de articulos)
#   hilo       12x10: cordel rojo y blanco con el ojal de la etiqueta (asoma por arriba de cada tarjeta)
#   discos     20x20: platito redondo detras del icono (menta, rosa, mantequilla, lila)
#   letrero, letreroElegido  16x16, se cortan a 5: letrero de madera (pestana sin elegir) y pintado de mantequilla (elegida)
#   cuerda     4x8, se repite en vertical: cuerda de la que cuelgan los letreros
#   bocadillo  24x24, se corta a 8: bocadillo de Bellota (crema, esquinas redondas, sombra abajo)
#   pico       10x10: piquito del bocadillo, apunta a la izquierda (al retrato)
#   marco      56x56: medallon de madera del retrato (el hueco de dentro es transparente)
#   bolsita    20x20: saquito de tela con un corazon bordado (marcador de conchitas)
#   concha     9x8: conchita pequena para los precios
# Uso: python arte/generar-mostrador.py  y luego  powershell -ExecutionPolicy Bypass -File arte/generar-sprites.ps1
# Salen arte/sprites/mostrador_<nombre>.png. Las letras de color no distinguen mayusculas.
import json, math, os

RAIZ = os.path.dirname(os.path.abspath(__file__))
C = {
    'o': '#4A3347',
    # pino
    'a': '#F3D6AE', 'b': '#FCE9CC', 'c': '#E6C094', 'd': '#D4A577', 'e': '#B98A6E',
    # kraft
    'k': '#EBCB9F', 'l': '#F6DFBC', 'm': '#D9B07E', 'n': '#C99A6A',
    # crema, fresa, mantequilla
    'w': '#FFF4E0', 'x': '#FFFBF3', 'y': '#F2DFD0', 'f': '#F28CA0', 'g': '#F7C6D0', 'h': '#FFE3EA', 'r': '#E0607E',
    'u': '#FFE08A', 'v': '#FFF1B8', 'z': '#E8B84F',
    # platitos
    '1': '#C4EADC', '2': '#9ED1BE', '3': '#FFD3DC', '4': '#F2AEBE', '5': '#FFEDB0', '6': '#F2D27E', '7': '#E3D6F2', '8': '#C5B4E3',
    # saquito
    'p': '#E89AAE', 's': '#E8A85C',
}

def vacio(w, h): return [['.'] * w for _ in range(h)]
def filas(p): return [''.join(r) for r in p]

def forma(w, h, dentro):
    """Rellena con None lo de dentro y pone contorno 'o' en el borde de la forma."""
    p = vacio(w, h)
    for y in range(h):
        for x in range(w):
            if not dentro(x, y): continue
            borde = not all(0 <= x + dx < w and 0 <= y + dy < h and dentro(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            p[y][x] = 'o' if borde else None
    return p

def redondo(w, h, esquinas):
    def dentro(x, y):
        for i, c in enumerate(esquinas):
            if (y == i or y == h - 1 - i) and (x < c or x > w - 1 - c): return False
        return True
    return dentro

def madera():
    w = h = 24
    p = forma(w, h, redondo(w, h, [2, 1]))
    for y in range(h):
        for x in range(w):
            if p[y][x] is not None: continue
            if y >= h - 3 or x >= w - 3: p[y][x] = 'e' if (y >= h - 2 or x >= w - 2) else 'd'   # canto
            elif y <= 1 or x <= 1: p[y][x] = 'b'
            elif y % 8 == 7: p[y][x] = 'c'                                                 # junta entre tablas
            elif (x * 3 + y * 7) % 11 == 0 and y % 8 not in (0, 6): p[y][x] = 'c'          # vetas
            else: p[y][x] = 'a'
    for cx, cy in ((4, 4), (w - 6, 4), (4, h - 6), (w - 6, h - 6)):                     # clavitos
        p[cy][cx] = 'e'; p[cy][cx + 1] = 'd'; p[cy - 1][cx] = 'b'
    return filas(p)

def toldo():
    w, h = 16, 18
    def dentro(x, y):
        if y < 13: return True
        cx = 3.5 if x < 8 else 11.5
        return (x - cx) ** 2 / 16 + (y - 12.5) ** 2 / 20 <= 1
    p = forma(w, h, dentro)
    for y in range(h):
        for x in range(w):
            if p[y][x] is not None: continue
            raya = 'f' if x < 8 else 'w'
            if y == 1: raya = 'g' if x < 8 else 'x'
            elif y >= 10 and (y >= 14 or x in (1, 6, 9, 14)): raya = 'r' if x < 8 else 'y'
            p[y][x] = raya
    return filas(p)

def kraft():
    w = h = 24
    def dentro(x, y):
        if y < 4 and (x < 4 - y or x > w - 5 + y): return False     # esquinas de arriba cortadas
        if y == h - 1 and (x < 1 or x > w - 2): return False
        return True
    p = forma(w, h, dentro)
    for y in range(h):
        for x in range(w):
            if p[y][x] is not None: continue
            if y >= h - 3 or x >= w - 3: p[y][x] = 'n' if (y >= h - 2 or x >= w - 2) else 'm'
            elif y <= 1 + max(0, 3 - x) or x <= 1: p[y][x] = 'l'
            elif ((x * 73856093) ^ (y * 19349663)) % 17 == 0: p[y][x] = 'm'    # fibras sueltas
            else: p[y][x] = 'k'
    return filas(p)

hilo = [
    "..o......o..",
    ".oro....oro.",
    "..oxo..oxo..",
    "...oro.ro...",
    "....oxrxo...",
    "....olllo...",
    "...olooolo..",
    "...olo.olo..",
    "...olooolo..",
    "....olllo...",
]

def disco(luz, base, aro):
    w = h = 20
    p = forma(w, h, lambda x, y: math.hypot(x - 9.5, y - 9.5) <= 9.6)
    for y in range(h):
        for x in range(w):
            if p[y][x] is not None: continue
            d = math.hypot(x - 9.5, y - 8.5)
            if y >= 15 or (math.hypot(x - 9.5, y - 9.5) > 7.6 and y > 11): p[y][x] = aro
            elif d > 6.8 and x + y < 16: p[y][x] = luz
            else: p[y][x] = base
    return filas(p)

def letrero(luz, base, canto):
    w = h = 16
    p = forma(w, h, redondo(w, h, [2, 1]))
    for y in range(h):
        for x in range(w):
            if p[y][x] is not None: continue
            if y >= h - 3: p[y][x] = canto
            elif y <= 1 or x <= 1: p[y][x] = luz
            else: p[y][x] = base
    for cx in (3, w - 4):                                                   # clavitos de la cuerda
        p[3][cx] = 'e'
    return filas(p)

cuerda = [
    ".dc.",
    ".cd.",
    ".dc.",
    ".cb.",
    ".dc.",
    ".cd.",
    ".dc.",
    ".bc.",
]

def bocadillo():
    w = h = 24
    p = forma(w, h, redondo(w, h, [4, 2, 1, 1]))
    for y in range(h):
        for x in range(w):
            if p[y][x] is not None: continue
            p[y][x] = 'y' if y >= h - 3 else 'w'
    return filas(p)

pico = [
    "......oooo",
    ".....owwww",
    "....owwwww",
    "...owwwwww",
    "..owwwwwww",
    "oowwwwwwww",
    "..oowwwwww",
    "....oowwww",
    "......oooo",
    "..........",
]

def marco():
    w = h = 56
    cx = cy = 27.5
    p = vacio(w, h)
    for y in range(h):
        for x in range(w):
            d = math.hypot(x - cx, y - cy)
            if d > 27.6: continue
            if d > 26.6: p[y][x] = 'o'
            elif d > 23.0:
                s = (x - cx) + (y - cy)
                p[y][x] = 'b' if s < -16 else 'd' if s > 16 else 'a'
                if d > 25.6 and s > 22: p[y][x] = 'e'
                if 24.4 < d < 25.1 and (int(math.degrees(math.atan2(y - cy, x - cx))) // 10) % 2 == 0: p[y][x] = 'c'   # vetas en circulo
            elif d > 22.0: p[y][x] = 'o'
    return filas(p)

bolsita = [
    "....................",
    "......o.o..o.o......",
    ".....ogoghhgogo.....",
    "......ogggggpo......",
    ".......osssso.......",
    "......ossoosso......",
    ".....oggghggggo.....",
    "....oggghhgggpgo....",
    "...ogghhggggggppo...",
    "..ogghgggggggggppo..",
    "..oghgggggggggggpo..",
    ".ogghgggfgfgggggppo.",
    ".oghgggfffffggggppo.",
    ".oggggggfffgggggppo.",
    ".ogggggggfggggggppo.",
    ".ogggggggggggggggpo.",
    "..oggggggggggggppo..",
    "..oppgggggggggpppo..",
    "...ooppppppppppoo...",
    ".....oooooooooo.....",
]

concha = [
    "..ooooo..",
    ".ohhfhho.",
    "ohfhfhfho",
    "ofhfhfhfo",
    "ohfhfhfho",
    ".oofffoo.",
    "...ofo...",
    "...ooo...",
]

cuadros = {
    'madera': madera(), 'toldo': toldo(), 'kraft': kraft(), 'hilo': hilo,
    'discoMenta': disco('x', '1', '2'), 'discoRosa': disco('x', '3', '4'), 'discoMantequilla': disco('x', '5', '6'), 'discoLila': disco('x', '7', '8'),
    'letreroMadera': letrero('b', 'c', 'd'), 'letreroPintado': letrero('v', 'u', 'z'),
    'cuerda': cuerda, 'bocadillo': bocadillo(), 'pico': pico, 'marco': marco(), 'bolsita': bolsita, 'concha': concha,
}
for k, v in cuadros.items():
    assert len(set(map(len, v))) == 1, ('filas de distinto largo', k)
    assert all(ch in C or ch == '.' for r in v for ch in r), ('color sin definir', k)
uno = lambda n: {'fps': 0, 'cuadros': [n]}
anims = {n: uno(n) for n in ('madera', 'toldo', 'kraft', 'hilo', 'cuerda', 'bocadillo', 'pico', 'marco', 'bolsita', 'concha')}
anims['discos'] = {'fps': 0, 'cuadros': ['discoMenta', 'discoRosa', 'discoMantequilla', 'discoLila']}
anims['letrero'] = uno('letreroMadera')
anims['letreroElegido'] = uno('letreroPintado')     # aparte: border-image no puede elegir un cuadro de una tira
json.dump({'nombre': 'mostrador', 'descripcion': 'Panel de la tiendecita (lo genera arte/generar-mostrador.py; no editar a mano).',
           'colores': C, 'animaciones': anims, 'cuadros': cuadros},
          open(os.path.join(RAIZ, 'fuentes', 'mostrador.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
for k in ('madera', 'toldo', 'kraft', 'discoMenta', 'letreroPintado', 'bocadillo', 'marco'):
    print(k); print('\n'.join(cuadros[k]))
