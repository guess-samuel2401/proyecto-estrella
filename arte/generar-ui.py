# Genera arte/fuentes/ui.json: marcos 9-slice de la interfaz (fieltro cosido, papel, mimbre, tela de tapa,
# pestanas de colores), el boton redondo del HUD, la cinta washi y el sello dentado.
# Tambien redibuja los iconos de arte/fuentes/hud.json (morral, diario con huella y ovillo).
# Uso: python arte/generar-ui.py  y luego  powershell -ExecutionPolicy Bypass -File arte/generar-sprites.ps1
# Los marcos de 24x24 se cortan a 8 px (border-image-slice: 8); los pequenos de 12x12, a 4 px.
import json, math, os

RAIZ = os.path.dirname(os.path.abspath(__file__))

def lienzo(w, h): return [['.'] * w for _ in range(h)]
def filas(p): return [''.join(r) for r in p]

def mascara_redonda(w, h, cortes):
    # cortes[i] = pixeles que se quitan en la fila i desde cada esquina (arriba y abajo, simetrico)
    m = [[True] * w for _ in range(h)]
    for i, c in enumerate(cortes):
        for x in range(c):
            for y in (i, h - 1 - i):
                m[y][x] = m[y][w - 1 - x] = False
    return m

def marco(w, h, cortes, relleno, luz, sombra, puntada=None, inset=3, periodo=4, sombra_suelo=True, mella=None):
    # Contorno ciruela, brillo arriba-izquierda, sombra abajo-derecha, puntada discontinua y un pixel de suelo.
    alto = h - 1 if sombra_suelo else h
    m = mascara_redonda(w, alto, cortes)
    if mella:                                   # bordes de papel: mellas de 1 px repetidas cada 8
        for x in range(w):
            if x % 8 == mella and 3 < x < w - 4: m[0][x] = False
        for y in range(alto):
            if y % 8 == (mella + 3) % 8 and 3 < y < alto - 4: m[y][0] = False
    p = lienzo(w, h)
    dentro = lambda x, y: 0 <= x < w and 0 <= y < alto and m[y][x]
    for y in range(alto):
        for x in range(w):
            if not m[y][x]: continue
            if not all(dentro(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): p[y][x] = 'o'
            elif not dentro(x, y - 2) or not dentro(x - 2, y): p[y][x] = luz
            elif not dentro(x, y + 2) or not dentro(x + 2, y): p[y][x] = sombra
            else: p[y][x] = relleno
    if sombra_suelo:
        for x in range(w):
            if m[alto - 1][x] and p[alto - 1][x] == 'o': p[alto][x] = 'o'
    if puntada:
        x0, y0, x1, y1 = inset, inset, w - 1 - inset, alto - 1 - inset
        for x in range(x0 + 1, x1):
            if x % periodo < periodo // 2: p[y0][x] = p[y1][x] = puntada
        for y in range(y0 + 1, y1):
            if y % periodo < periodo // 2: p[y][x0] = p[y][x1] = puntada
    return filas(p)

def mimbre():
    w = h = 24
    m = mascara_redonda(w, h - 1, [4, 2, 1, 1])
    p = lienzo(w, h)
    for y in range(h - 1):
        for x in range(w):
            if not m[y][x]: continue
            borde = not all(0 <= x + dx < w and 0 <= y + dy < h - 1 and m[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            banda = min(x, y, w - 1 - x, h - 2 - y) < 6
            if borde: p[y][x] = 'o'
            elif banda:
                # Trenzado: cuadritos de 2x2 alternos, con una linea de sombra entre hileras.
                p[y][x] = 'k' if ((x // 2) + (y // 2)) % 2 else 'm'
                if min(x, w - 1 - x) >= 6 and y % 4 == 3: p[y][x] = 'h'
                if min(y, h - 2 - y) >= 6 and x % 4 == 3: p[y][x] = 'h'
            elif min(x, y, w - 1 - x, h - 2 - y) == 6: p[y][x] = 'o'
            else: p[y][x] = 'w'
    for x in range(w):
        if p[h - 2][x] == 'o': p[h - 1][x] = 'o'
    return filas(p)

def boton():
    # Parche redondo de fieltro para los iconos del HUD, con una puntada en circulo.
    w = h = 20
    p = lienzo(w, h)
    c, r = 9.5, 9.6
    for y in range(h - 1):
        for x in range(w):
            d = math.hypot(x - c, y - 9)
            if d <= r: p[y][x] = 'f'
    antes = [r[:] for r in p]
    fuera = lambda xx, yy: not (0 <= xx < w and 0 <= yy < h - 1) or antes[yy][xx] == '.'
    for y in range(h - 1):
        for x in range(w):
            if antes[y][x] != 'f': continue
            d = math.hypot(x - c, y - 9)
            if any(fuera(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): p[y][x] = 'o'
            elif d > 7.6 and x + y < 18: p[y][x] = 'l'                    # brillo arriba a la izquierda
            elif d > 7.6 and x + y > 20: p[y][x] = 'd'                    # sombra abajo a la derecha
            elif 5.6 < d <= 6.6 and int((math.atan2(y - 9, x - c) + math.pi) * 16 / math.pi) % 2: p[y][x] = 'p'
    for x in range(w):                                                    # un pixel de suelo bajo el boton
        if antes[h - 2][x] == 'f': p[h - 1][x] = 'o'
    return filas(p)

def cinta():
    # Cinta washi de 16x6 con los extremos en zigzag.
    p = lienzo(16, 6)
    for y in range(6):
        for x in range(16):
            if (x == 0 and y % 2) or (x == 15 and not y % 2): continue
            p[y][x] = 'r' if (x + y) % 4 < 2 else 'y'
    return filas(p)

def sello():
    # 12x12 con borde dentado (un pixel si, uno no) para los sellos del diario.
    p = lienzo(12, 12)
    for y in range(12):
        for x in range(12):
            borde = x in (0, 11) or y in (0, 11)
            if borde and (x + y) % 2: continue
            if borde: p[y][x] = 'w'
            elif x in (1, 10) or y in (1, 10): p[y][x] = 'w'
            elif x in (2, 9) or y in (2, 9): p[y][x] = 'd'
            else: p[y][x] = 'w'
    return filas(p)

C = {
    'o': '#4A3347',
    # fieltro rosa clarito (paneles y botones)
    'f': '#FFE3EA', 'l': '#FFF3F6', 'd': '#EFCBD3', 'p': '#D98FA3',
    # papel
    'w': '#FFF4E0', 'b': '#FFFBF3', 'e': '#F2DFD0',
    # mimbre
    'm': '#F0C08A', 'k': '#D99A5B', 'h': '#B9806E',
    # tapa de tela (orquidea) y su hilo
    'v': '#E6A8D7', 'g': '#F2C6E7', 'n': '#CC8DBF', 'i': '#FFE3EA',
    # pestanas: durazno, lavanda, mantequilla
    'u': '#FFD3B0', 'a': '#FFE6CF', 'z': '#E8A85C',
    'q': '#C5B4E3', 'c': '#DDD1F0', 'j': '#9F8BC9',
    'y': '#FFE08A', 'x': '#FFF0BF', 'r': '#F7C873',
    # sello: el dentado se ve sobre el papel gracias a su sombra
    's': '#E3BFC6',
}
R24 = [3, 1, 1]
cuadros = {
    'fieltro': marco(24, 24, R24, 'f', 'l', 'd', 'p'),
    'papel': marco(24, 24, [2, 1], 'w', 'b', 'e', None, mella=5),
    'tapa': marco(24, 24, R24, 'v', 'g', 'n', 'i'),
    'mimbre': mimbre(),
    'pestanaRosa': marco(24, 24, R24, 'f', 'l', 'd', 'p'),
    'pestanaDurazno': marco(24, 24, R24, 'u', 'a', 'z', 'z'),
    'pestanaLavanda': marco(24, 24, R24, 'q', 'c', 'j', 'j'),
    'pestanaMantequilla': marco(24, 24, R24, 'y', 'x', 'r', 'z'),
    'botonRosa': marco(12, 12, [2, 1], 'f', 'l', 'd', None),
    'botonMantequilla': marco(12, 12, [2, 1], 'y', 'x', 'r', None),
    'botonPapel': marco(12, 12, [2, 1], 'w', 'b', 'e', None),
    'hud': boton(),
    'cinta': cinta(),
    'sello': sello(),
}
for k, v in cuadros.items():
    assert len(set(map(len, v))) == 1, k
ui = {
    'nombre': 'ui',
    'descripcion': 'Materiales de la interfaz (los genera arte/generar-ui.py; no editar a mano). Marcos 9-slice de 24x24 (corte 8) y de 12x12 (corte 4).',
    'colores': C,
    'animaciones': {k: {'fps': 0, 'cuadros': [k]} for k in cuadros},
    'cuadros': cuadros,
}
json.dump(ui, open(os.path.join(RAIZ, 'fuentes', 'ui.json'), 'w', encoding='utf8'), indent=2, ensure_ascii=False)

# ---- Iconos del HUD (16x16): morral, diario con huella y ovillo con agujas.
morral = [
    "................",
    ".....oooooo.....",
    "....oo....oo....",
    "...oo......oo...",
    "..oooooooooooo..",
    ".ollllllllllllo.",
    ".offffyyfyyfffo.",
    ".offffyyyyyfffo.",
    ".osffffyyyfffso.",
    ".osfffffyffffso.",
    ".oooooooooooooo.",
    ".okkkkkkkkkkkmo.",
    ".okkkkkkkkkkkmo.",
    ".ommmmmmmmmmmmo.",
    "..oooooooooooo..",
    "................",
]
diario = [
    "................",
    "..ooooooooooo...",
    "..opvvvvvvvvo...",
    "..opvvvvvvvvo...",
    "..opvvlvlvlvo...",
    "..opvvvvvvvvo...",
    "..opvvvlllvvo...",
    "..opvvlllllvo...",
    "..opvvvlllvvo...",
    "..opvvvvvvvvo...",
    "..opvvvvvvvvo...",
    "..opwwwwwwwwo...",
    "..ooooooooooo...",
    "........oyo.....",
    "........oyo.....",
    ".........o......",
]
def ovillo():
    p = lienzo(16, 16)
    # Agujas por detras, cruzadas, con la cabeza redonda.
    for i in range(12):
        for (x, y) in ((2 + i, 13 - i), (13 - i, 13 - i)):
            if 0 <= x < 16 and 0 <= y < 16: p[y][x] = 'k'
    for (x, y) in ((1, 14), (14, 14)):
        p[y][x] = 'y'
    cx, cy, r = 7.5, 8.5, 5.4
    for y in range(16):
        for x in range(16):
            d = math.hypot(x - cx, y - cy)
            if d <= r: p[y][x] = 'f'
    antes = [r[:] for r in p]
    for y in range(16):
        for x in range(16):
            if antes[y][x] != 'f': continue
            if any(not (0 <= x + dx < 16 and 0 <= y + dy < 16) or antes[y + dy][x + dx] != 'f' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                p[y][x] = 'o'
    # Hebras: tres curvas en el tono oscuro y un brillo.
    for (x, y) in ((5, 6), (6, 5), (7, 5), (4, 8), (5, 7), (6, 9), (7, 8), (8, 7), (9, 6), (7, 11), (8, 10), (9, 9), (10, 8), (11, 7), (9, 12), (10, 11), (11, 10)):
        if p[y][x] == 'f': p[y][x] = 's'
    for (x, y) in ((5, 4), (4, 5)):
        if p[y][x] == 'f': p[y][x] = 'l'
    # Hilo suelto que sale por abajo a la derecha.
    for (x, y) in ((12, 12), (13, 13), (14, 13)):
        if p[y][x] == '.': p[y][x] = 's'
    return filas(p)

# Saquito de arpillera atado con un lazo rosa, semillas asomando y una etiqueta con corazon.
saquito = [
    "................",
    ".....oooooo.....",
    "....okcckcko....",
    ".....okkkko.....",
    "....osffffso....",
    "...fokkkkkkof...",
    "...okkkkkkkko...",
    "..okkkkkkkkkko..",
    "..okwwwwwwwwko..",
    "..okwwfwwfwwko..",
    "..okwwffffwwko..",
    "..okwwwffwwwko..",
    "..okkkkkkkkkko..",
    "..ommkkkkkkmmo..",
    "...ommmmmmmmo...",
    "....oooooooo....",
]
# Sillon rosa con un corazon en el respaldo: boton para decorar la casa.
sillon = [
    "................",
    "................",
    "....oooooooo....",
    "...offffffffo...",
    "...ofllllllfo...",
    "...oflsllslfo...",
    ".oooflsssslfooo.",
    "offfoflsslfofffo",
    "offfofllllfofffo",
    "offfoooooooofffo",
    "offfowwwwwwofffo",
    "offffffffffffffo",
    "osssssssssssssso",
    ".oooooooooooooo.",
    "..om........mo..",
    "..oo........oo..",
]
hud = json.load(open(os.path.join(RAIZ, 'fuentes', 'hud.json'), encoding='utf-8-sig'))
hud['descripcion'] = 'Iconos de 16x16 para los botones de arriba a la derecha: morral (bolsa), diario con huella (enciclopedia), ovillo con agujas (ajustes), saquito de semillas y sillon (decorar). Los dibuja arte/generar-ui.py.'
hud['colores'].update({'k': '#E8A85C', 'm': '#E8A85C', 'y': '#FFE08A', 'v': '#E6A8D7', 'p': '#C98BBE', 'w': '#FFF4E0', 'l': '#FFE3EA', 'f': '#F7A6B4', 's': '#E87F86', 'o': '#4A3347'})
hud['colores']['k'] = '#FFD3B0'
icono_ovillo = ovillo()
# En el ovillo, las agujas usan la miel: se pinta con letra propia.
icono_ovillo = [r.replace('k', 'n') for r in icono_ovillo]
hud['colores']['n'] = '#E8A85C'
hud['colores']['c'] = '#8A5A44'
hud['cuadros'] = {'bolsa': morral, 'libro': diario, 'ovillo': icono_ovillo, 'saquito': saquito, 'sillon': sillon}
hud['animaciones'] = {'tiles': {'fps': 0, 'cuadros': ['bolsa', 'libro', 'ovillo', 'saquito', 'sillon']}}
for k, v in hud['cuadros'].items():
    assert len(v) == 16 and all(len(r) == 16 for r in v), k
json.dump(hud, open(os.path.join(RAIZ, 'fuentes', 'hud.json'), 'w', encoding='utf8'), indent=2, ensure_ascii=False)
print('ui:', ', '.join(cuadros))
for k in ('fieltro', 'papel', 'mimbre', 'hud', 'sello'):
    print(k); print('\n'.join(cuadros[k]))
print('ovillo'); print('\n'.join(icono_ovillo))
