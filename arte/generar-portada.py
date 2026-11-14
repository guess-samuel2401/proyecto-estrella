# Genera arte/fuentes/portada.json: piezas de la pantalla de inicio (el diario de portada).
#   botonMadera, botonTela  14x14, se cortan a 5 (border-image-slice: 5): madera tallada y tela cosida con relieve
#   cartel                  24x24, se corta a 8: cartelito de madera clara con clavos (casilla del nombre)
#   espiral                 12x8: una anilla de alambre; se repite en vertical a la izquierda del diario
#   cinta                   32x10: cinta washi con rayas, puntitos, brillo y sombra
#   stickers                16x16: flor, ovillo, pez, ancla, hojas, estrella con carita (titulo) y garabatos a lapiz
# Uso: python arte/generar-portada.py  y luego  powershell -ExecutionPolicy Bypass -File arte/generar-sprites.ps1
# Salen arte/sprites/portada_<nombre>.png. Las letras de color no distinguen mayusculas: aqui todas son distintas.
import json, math, os

RAIZ = os.path.dirname(os.path.abspath(__file__))

C = {
    'o': '#4A3347', 'w': '#FFFFFF', 'c': '#FFF4E0', '7': '#FFFBF3',
    # madera tallada (miel clarita)
    'm': '#F7D48A', 'l': '#FFF0BF', 'k': '#E8B868', 'd': '#C98F5B', 'b': '#A86F4C',
    # tela rosa
    'p': '#F7B8C4', 'r': '#FFD9E0', 's': '#E08FA2', 't': '#C9708A',
    # cartel de madera clara
    'a': '#F3DDB3', 'e': '#FFF1D6', 'g': '#DDBB86', 'n': '#B98A5E',
    # alambre
    'h': '#A7B3C9', 'i': '#E6ECF5', 'j': '#6E6A8C',
    # cinta y calidos
    'u': '#FFD3B0', 'f': '#F28CA0', 'v': '#E8B49A', 'y': '#FFE08A', 'z': '#F4B860', 'x': '#E8925A',
    # stickers
    'q': '#C5B4E3', '5': '#9F8BC9', '1': '#8CC4DC', '2': '#6FA9D8', '3': '#A8D89A', '4': '#6FAE7E', '6': '#B58AA8',
}

def vacio(w, h): return [['.'] * w for _ in range(h)]
def filas(p): return [''.join(r) for r in p]

def contorno(p):
    # Los pixeles pintados que tocan el vacio (o el borde) pasan a ser contorno ciruela.
    h, w = len(p), len(p[0])
    antes = [r[:] for r in p]
    for y in range(h):
        for x in range(w):
            if antes[y][x] == '.': continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if not (0 <= xx < w and 0 <= yy < h) or antes[yy][xx] == '.':
                    p[y][x] = 'o'; break
    return p

def troquel(p):
    # Borde blanco de pegatina alrededor de todo (8 vecinos).
    h, w = len(p), len(p[0])
    antes = [r[:] for r in p]
    for y in range(h):
        for x in range(w):
            if antes[y][x] != '.': continue
            if any(0 <= x + dx < w and 0 <= y + dy < h and antes[y + dy][x + dx] != '.' for dx in (-1, 0, 1) for dy in (-1, 0, 1)):
                p[y][x] = 'w'
    return p

def forma(w, h, pintar):
    p = vacio(w, h)
    for y in range(h):
        for x in range(w):
            col = pintar(x, y)
            if col: p[y][x] = col
    return p

# ---------- Botones con relieve (14x14, corte 5) ----------
def boton(base, luz, veta, labio, borde_labio, cosido=None):
    w = h = 14
    cuerpo = h - 1                       # la ultima fila es el pixel de suelo
    def dentro(x, y):
        if not (0 <= x < w and 0 <= y < cuerpo): return False
        esq = [2, 1]                     # esquinas redondeadas
        for i, c in enumerate(esq):
            if (y == i or y == cuerpo - 1 - i) and (x < c or x > w - 1 - c): return False
        return True
    p = vacio(w, h)
    for y in range(cuerpo):
        for x in range(w):
            if not dentro(x, y): continue
            if not all(dentro(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): p[y][x] = 'o'
            elif y >= cuerpo - 3: p[y][x] = borde_labio if y == cuerpo - 2 else labio   # canto de abajo: relieve
            elif y == 1 or (x == 1 and y < cuerpo - 3): p[y][x] = luz
            elif x == w - 2: p[y][x] = labio
            else: p[y][x] = base
    for x in range(w):
        if p[cuerpo - 1][x] == 'o': p[cuerpo][x] = 'o'
    if veta:                             # vetas de madera: lineas finas que se repiten cada 4 pixeles
        for y in range(3, cuerpo - 3):
            for x in range(2, w - 2):
                if p[y][x] == base and ((y == 3 and x % 4 in (1, 2)) or (y == 6 and x % 4 in (0, 3)) or (y == 8 and x % 4 == 2)):
                    p[y][x] = veta
    if cosido:                           # puntada de hilo a 2 pixeles del borde, a trozos de 1 y 1
        for x in range(3, w - 3):
            if x % 2: p[2][x] = cosido; p[cuerpo - 4][x] = cosido
        for y in range(3, cuerpo - 4):
            if y % 2: p[y][2] = cosido; p[y][w - 3] = cosido
    return filas(p)

# ---------- Cartel de madera clara (24x24, corte 8) ----------
def cartel():
    w = h = 24
    cuerpo = h - 1
    def dentro(x, y):
        if not (0 <= x < w and 0 <= y < cuerpo): return False
        for i, c in enumerate([2, 1]):
            if (y == i or y == cuerpo - 1 - i) and (x < c or x > w - 1 - c): return False
        return True
    p = vacio(w, h)
    for y in range(cuerpo):
        for x in range(w):
            if not dentro(x, y): continue
            if not all(dentro(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): p[y][x] = 'o'
            elif y >= cuerpo - 2 or x >= w - 2: p[y][x] = 'g'
            elif y <= 1 or x <= 1: p[y][x] = 'e'
            elif y % 8 == 7: p[y][x] = 'g'                       # juntas de las tablas
            elif y % 8 == 0 and x % 6 == 3: p[y][x] = 'e'
            else: p[y][x] = 'a'
    for x in range(w):
        if p[cuerpo - 1][x] == 'o': p[cuerpo][x] = 'o'
    for (x, y) in ((4, 4), (19, 4), (4, 18), (19, 18)):           # clavitos
        p[y][x] = 'n'; p[y][x + 1] = 'n'; p[y - 1][x] = 'e'
    return filas(p)

# ---------- Anilla de la espiral (12x8) ----------
espiral = [
    "............",
    ".oooooooo...",
    "oiiiiiiiho..",
    "ohhhhhhhjo.o",
    "ojjjjjjjjo.o",
    ".oooooooo...",
    "............",
    "............",
]

# ---------- Cinta washi (32x10) ----------
def cinta():
    w, h = 32, 10
    p = vacio(w, h)
    for y in range(h):
        for x in range(w):
            if (x == 0 and y % 2) or (x == w - 1 and not y % 2): continue   # extremos rasgados en zigzag
            if y == 0: p[y][x] = '7'
            elif y == h - 1: p[y][x] = 'v'
            elif (x + y) % 6 in (0, 1): p[y][x] = 'f'                       # rayas en diagonal
            elif (x % 6 == 3 and y % 4 == 2) or (x % 6 == 0 and y % 4 == 0 and y): p[y][x] = 'c'   # puntitos
            else: p[y][x] = 'u'
    return filas(p)

# ---------- Pegatinas (16x16, motivo de 12x12 con troquel blanco) ----------
def pegatina(pintar, contornear=True):
    p = forma(16, 16, lambda x, y: pintar(x - 2, y - 2) if 2 <= x < 14 and 2 <= y < 14 else None)
    return filas(troquel(contorno(p) if contornear else p))

def flor(x, y):
    cx = cy = 5.5
    d = math.hypot(x - cx, y - cy)
    if d <= 1.8: return 'y' if x + y < 12 else 'z'
    for k in range(5):
        a = -math.pi / 2 + k * 2 * math.pi / 5
        px, py = cx + 3.4 * math.cos(a), cy + 3.4 * math.sin(a)
        if math.hypot(x - px, y - py) <= 2.4:
            return 'r' if (x - px) + (y - py) < -1 else 'p'
    return None

def ovillo(x, y):
    cx, cy = 5.5, 5.8
    d = math.hypot(x - cx, y - cy)
    if d <= 5.4:
        if d > 3.6 and x + y < 9: return '7'
        if (x - y) % 4 == 0 or (x + 2 * y) % 7 == 0: return '5'          # hebras
        return 'q'
    if (x, y) in ((10, 10), (11, 11), (11, 9)): return '5'               # hilo suelto
    return None

def pez(x, y):
    # cuerpo de lado mirando a la izquierda, cola a la derecha
    if 1 <= x <= 8 and ((x - 4.5) / 4.2) ** 2 + ((y - 5.5) / 3.6) ** 2 <= 1:
        if (x, y) == (3, 4): return 'o'
        if (x, y) == (3, 6): return 'p'
        if y >= 7: return '7'
        if y <= 3 and x >= 4: return '2'
        return '1'
    if 8 <= x <= 11 and abs(y - 5.5) <= (x - 7.5) * 1.1 + 0.2: return '2' if x == 11 else '1'
    return None

# Ancla dibujada con trazo grueso de dos tonos (sin contorno automatico: el trazo ya es el dibujo).
ancla = [
    "....5555....",
    "...5q..q5...",
    "...5q..q5...",
    "....5qq5....",
    "..55qqqq55..",
    ".....qq.....",
    ".....qq.....",
    "5....qq....5",
    "q5...qq...5q",
    ".q5..qq..5q.",
    "..qq5qq5qq..",
    "....5555....",
]
def ancla_px(x, y):
    ch = ancla[y][x]
    return None if ch == '.' else ch

def hojas(x, y):
    # una hoja grande en diagonal con su nervio y el rabito abajo a la izquierda
    if (x, y) in ((1, 10), (2, 9)): return '4'
    cx, cy = 6.5, 5.0
    u = ((x - cx) - (y - cy)) / math.sqrt(2)
    v = ((x - cx) + (y - cy)) / math.sqrt(2)
    if (u / 6.0) ** 2 + (v / 3.2) ** 2 <= 1:
        if abs(v) < 0.6: return '4'
        if v < -1.6 and u < 1: return '7'
        return '3'
    return None

def estrella():
    # Estrella gordita con volumen y carita: brillo arriba a la izquierda, sombra abajo a la derecha.
    w = h = 16
    cx, cy, R, r = 7.5, 8.3, 7.6, 4.3
    puntos = []
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5
        rad = R if k % 2 == 0 else r
        puntos.append((cx + rad * math.cos(a), cy + rad * math.sin(a)))
    def dentro(px, py):
        ok = False
        for i in range(10):
            x1, y1 = puntos[i]; x2, y2 = puntos[(i + 1) % 10]
            if (y1 > py) != (y2 > py) and px < (x2 - x1) * (py - y1) / (y2 - y1) + x1: ok = not ok
        return ok
    p = forma(w, h, lambda x, y: 'y' if dentro(x + 0.5, y + 0.5) else None)
    for y in range(h):
        for x in range(w):
            if p[y][x] != 'y': continue
            s = (x - cx) * 0.8 + (y - cy)
            if s < -4.2: p[y][x] = '7'
            elif s < -2.2: p[y][x] = 'l'
            elif s > 4.0: p[y][x] = 'x'
            elif s > 2.2: p[y][x] = 'z'
    p = contorno(p)
    for (x, y, col) in ((6, 8, 'o'), (9, 8, 'o'), (5, 9, 'p'), (10, 9, 'p'), (7, 10, 'o'), (8, 10, 'o')):
        p[y][x] = col
    return filas(p)

def garabato(filas_txt):
    p = [list(r.ljust(16, '.')) for r in filas_txt] + [['.'] * 16 for _ in range(16 - len(filas_txt))]
    return filas([[('6' if ch == '#' else '.') for ch in r] for r in p])

corazon = garabato([
    "................",
    "................",
    "................",
    "....##...##.....",
    "...#..#.#..#....",
    "..#....#....#...",
    "..#.........#...",
    "...#.......#....",
    "....#.....#.....",
    ".....#...#......",
    "......#.#.......",
    ".......#........",
])
remolino = garabato([
    "................",
    "................",
    "................",
    ".....####.......",
    "....#....#......",
    "...#..##..#.....",
    "...#.#..#.#.....",
    "...#.#.#..#.....",
    "...#..#..#......",
    "....#...#.......",
    ".....###.....#..",
    "............#...",
])
estrellita = garabato([
    "................",
    "................",
    "................",
    "................",
    ".......#........",
    ".......#........",
    "....#######.....",
    ".....#...#......",
    "......#.#.......",
    ".....#.#.#......",
    "....#.....#.....",
])

STICKERS = [
    ('flor', pegatina(flor)), ('ovillo', pegatina(ovillo)), ('pez', pegatina(pez)), ('ancla', pegatina(ancla_px, False)),
    ('hojas', pegatina(hojas)), ('estrella', estrella()), ('corazon', corazon), ('remolino', remolino), ('estrellita', estrellita),
]

cuadros = {
    'botonMadera': boton('m', 'l', 'k', 'd', 'b'),
    'botonTela': boton('p', 'r', None, 's', 't', cosido='c'),
    'cartel': cartel(),
    'espiral': espiral,
    'cinta': cinta(),
}
for n, d in STICKERS: cuadros[n] = d
for k, v in cuadros.items():
    assert len(set(map(len, v))) == 1, ('filas de distinto largo', k)
    assert all(ch in C or ch == '.' for r in v for ch in r), ('color sin definir', k)

anims = {k: {'fps': 0, 'cuadros': [k]} for k in ('botonMadera', 'botonTela', 'cartel', 'espiral', 'cinta')}
anims['stickers'] = {'fps': 0, 'cuadros': [n for n, _ in STICKERS]}
datos = {
    'nombre': 'portada',
    'descripcion': 'Piezas de la pantalla de inicio (las genera arte/generar-portada.py; no editar a mano).',
    'colores': C, 'animaciones': anims, 'cuadros': cuadros,
}
json.dump(datos, open(os.path.join(RAIZ, 'fuentes', 'portada.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
print('portada:', ', '.join(cuadros))
for k in ('botonMadera', 'botonTela', 'estrella', 'flor', 'pez', 'ovillo', 'hojas', 'ancla'):
    print(k); print('\n'.join(cuadros[k]))
