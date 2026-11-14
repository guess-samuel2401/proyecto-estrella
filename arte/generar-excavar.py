# Genera arte/fuentes/excavar.json: todo lo de cavar.
#   palas     palaMadera, palaCobre, palaRosa, palaEstrella (iconos 16x16 en diagonal, pala abajo a la izquierda)
#   radar     Pipi, el radar de juguete (tele redondita con antenas y carita en la pantalla)
#   tesoros   fosiles (losa de arenisca rosada con la marca en azul perlado), gemas, madera antigua, semilla olvidada, plano pirata, huevo de dragoncito, estrella caida
#   caballitoFosil  el tercer fosil del mar (va al final: cuadro 24)
#   hacha     el hacha de la tienda, para talar arboles (cuadro 25)
#   tronquitos  la madera que dan los arboles al talarlos (cuadro 26)
#   baul      el baul pirata (mueble que se construye con el plano y madera antigua)
#   sitios    puntos de excavacion: montoncito del prado, hojas en X del bosque, remolino de arena de la playa,
#             tierra humeda con charquito (lluvia) y el hoyo que queda al cavar
# Se dibuja solo el relleno y contorno() pone el ciruela alrededor. Lo nuevo, siempre al final de cada lista.
# Uso: python arte/generar-excavar.py  y luego  powershell -ExecutionPolicy Bypass -File arte/generar-sprites.ps1
import json, os

RAIZ = os.path.dirname(os.path.abspath(__file__))
C = {
    'o': '#4A3347', 'w': '#FFFFFF',
    'm': '#C98F6B', 'n': '#A87358', 'l': '#DDA77F',          # madera
    'c': '#E39A6B', 'k': '#B8704A', 'i': '#F5C7A0',          # cobre
    'p': '#F28CA0', 'r': '#F7C6D9', 'q': '#D9607A',          # rosa
    'y': '#FFE08A', 'g': '#E8A85C', 'u': '#FFF4C2',          # oro y arena clara
    's': '#B9AFC4', 'd': '#8E8299', 'e': '#DCD5E3',          # piedra
    't': '#9ED9C5', 'v': '#5FAE95', 'x': '#D4F2E7',          # menta
    'a': '#A9D8E8', 'b': '#6FA9D8',                          # cielo
    'f': '#9C6B4E', 'j': '#6E4A3A',                          # tierra
    'h': '#8FC98A', 'z': '#5E9E6E',                          # hojas
}


def rejilla(filas):
    filas = filas + ['.' * 16] * (16 - len(filas))
    assert len(filas) == 16 and all(len(r) == 16 for r in filas), filas
    return [list(r) for r in filas]


def contorno(p, diagonal=False):
    """Pone ciruela alrededor de todo lo pintado (en las casillas vacias que tocan)."""
    vecinos = [(1, 0), (-1, 0), (0, 1), (0, -1)] + ([(1, 1), (-1, 1), (1, -1), (-1, -1)] if diagonal else [])
    marcar = set()
    for y in range(16):
        for x in range(16):
            if p[y][x] in '.o': continue
            for dx, dy in vecinos:
                if 0 <= x + dx < 16 and 0 <= y + dy < 16 and p[y + dy][x + dx] == '.': marcar.add((x + dx, y + dy))
    for x, y in marcar: p[y][x] = 'o'
    return p


def dibujo(filas, extra=(), diagonal=False):
    p = contorno(rejilla(filas), diagonal)
    for x, y, l in extra: p[y][x] = l          # destellos y detalles que van sin contorno
    return [''.join(r) for r in p]


# ---------------------------------------------------------------- palas
def pala(hoja, sombra, luz, mango, mango2, extra=()):
    """Pala en diagonal: el mango sube hacia arriba a la derecha y la hoja (con punta) baja a la izquierda.
    u = x - y avanza a lo largo del mango; v = x + y va de lado a lado."""
    filas = []
    for y in range(16):
        fila = ''
        for x in range(16):
            u, v = x - y, x + y
            l = '.'
            if -11 <= u <= -3:
                ancho = min(3.2, (u + 11) * 0.55)
                if abs(v - 14.5) <= ancho: l = luz if v - 14.5 < -1.2 else sombra if v - 14.5 > 0.8 else hoja
            elif -2 <= u <= 8 and v in (14, 15): l = mango if v == 14 else mango2
            elif 9 <= u <= 10 and 13 <= v <= 16: l = mango if u == 9 else mango2
            fila += l
        filas.append(fila)
    return dibujo(filas, extra)


DESTELLOS = [(14, 8, 'w'), (13, 9, 'y'), (15, 9, 'y'), (14, 10, 'y'), (12, 12, 'w')]
palas = {
    'palaMadera': pala('l', 'm', 'u', 'm', 'n'),
    'palaCobre': pala('c', 'k', 'i', 'n', 'j'),
    'palaRosa': pala('r', 'p', 'w', 'u', 'l'),
    'palaEstrella': pala('y', 'g', 'u', 'p', 'q', DESTELLOS),
}
# Estrellita en la hoja de la pala de estrella
pe = [list(r) for r in palas['palaEstrella']]
for x, y in ((4, 10), (3, 11), (4, 11), (5, 11), (4, 12)): pe[y][x] = 'w'
palas['palaEstrella'] = [''.join(r) for r in pe]

radar = dibujo([
    "................",
    "...p........p...",
    "...n........n...",
    "....n......n....",
    "....pppppppp....",
    "...pppppppppp...",
    "..pptttttttxpp..",
    "..pptttttttxpp..",
    "..pptttttttttp..",
    "..pptttttttttp..",
    "..pptttttttttp..",
    "..ppttttttttpp..",
    "...pqqqqqqqqp...",
    "....qqyqqyqq....",
], [(5, 8, 'o'), (6, 8, 'o'), (10, 8, 'o'), (9, 8, 'o'), (7, 10, 'o'), (8, 10, 'o'), (4, 9, 'r'), (11, 9, 'r'),
    (5, 4, 'r'), (6, 4, 'r')])

# ---------------------------------------------------------------- tesoros
tesoros = {
    'fosilHoja': dibujo([
        "................",
        "................",
        "....eeeeeee.....",
        "...essssssse....",
        "..essssssdsse...",
        "..essdsssdssse..",
        "..esssdsdsdsss..",
        "..essssdddssss..",
        "..esssdsdssdss..",
        "..essdssdssssd..",
        "..esssssssddss..",
        "...ssssssdssss..",
        "....sssssssss...",
        "......dddddd....",
    ]),
    'piedraCorazon': dibujo([
        "................",
        "................",
        "................",
        "...eee....sss...",
        "..eewes..sssss..",
        "..ewessssssssd..",
        "..eesssssssssd..",
        "..esssssssssdd..",
        "...sssssssssd...",
        "....sssssssdd...",
        ".....sssssdd....",
        "......sssdd.....",
        ".......sdd......",
        "........d.......",
    ]),
    'maderaAntigua': dibujo([
        "................",
        "................",
        "................",
        "..lll...........",
        ".lmmml..........",
        ".lmnml.mmmmmmmm.",
        ".lmmml.nmmnmmmm.",
        "..lll.nnnnnnnnn.",
        "...lll..........",
        "..lmmml.........",
        "..lmnml.mmmmmmmm",
        "..lmmml.mmnmmmnm",
        "...lll..nnnnnnnn",
        "................",
    ], [(12, 6, 'h'), (13, 6, 'z')]),
    'amonites': dibujo([
        "................",
        "................",
        "......llll......",
        "....lluuuull....",
        "...luummmmull...",
        "..luml...mmull..",
        "..lum.lll.mmul..",
        "..lum.lnl..mul..",
        "..lum..nl..mul..",
        "..lumm....mmul..",
        "...lummmmmmul...",
        "....lluuuull....",
        "......llnn......",
    ]),
    'cuarzoRosa': dibujo([
        "................",
        "................",
        "......w.........",
        ".....rp.....r...",
        ".....rp....rp...",
        "....rrpq...rpq..",
        "....rwpq..rrpq..",
        "..r.rrpq..rwpq..",
        ".rp.rrpq.rrppq..",
        ".rpqrrppqrrppq..",
        ".rwqrrppqrpppq..",
        "..sssssssssssd..",
        "..sssddsssddsd..",
        "....dddddddd....",
    ]),
    'semillaOlvidada': dibujo([
        "................",
        "........hh......",
        ".......hzzh.....",
        "......h.zh......",
        ".........z......",
        ".....yyyyy......",
        "....yuuyygg.....",
        "...yuyyyyygg....",
        "...yyyyyyyggg...",
        "...yyyyyygggg...",
        "....yyyygggg....",
        ".....gggggg.....",
        "......ggg.......",
    ], [(2, 4, 'u'), (13, 6, 'y'), (12, 11, 'u')]),
    'pezPiedra': dibujo([
        "................",
        "................",
        "..eeeeeeeeeeee..",
        "..esssssssssss..",
        "..esssssddddss..",
        "..eddssdsdsdds..",
        "..esdddddddwds..",
        "..eddssdsdsdds..",
        "..esssssddddss..",
        "..esssssssssss..",
        "..esssssssssss..",
        "..ssssssssssss..",
        "..sddddddddddd..",
    ]),
    'jadeMenta': dibujo([
        "................",
        "................",
        "................",
        ".....xxxxxx.....",
        "....xtwxxxtt....",
        "...xtwttttttv...",
        "..xxxxxxxxxxvv..",
        "..tttttttttvvv..",
        "...ttwtttttvv...",
        "....tttttvvv....",
        ".....tttvvv.....",
        "......tvvv......",
        ".......vv.......",
    ], [(2, 3, 'w'), (13, 3, 'x')]),
    'planoPirata': dibujo([
        "................",
        "................",
        "..lll...........",
        ".luuul..........",
        ".luuuuuuuuuuu...",
        ".luuuuuuuuuuul..",
        ".lluuqquuuuuul..",
        ".lluuuqqbbuuul..",
        ".lluuqquubuuul..",
        ".lluuuuuubuqul..",
        ".lluuuuuuubuqq..",
        ".lluuuuuuuuuul..",
        "..lllllllllll...",
        "....pp..........",
        "....qp..........",
    ]),
    'topacioCielo': dibujo([
        "................",
        "................",
        ".......w........",
        "......aab.......",
        ".....awabb......",
        "....aawabbb.....",
        "...aaaaabbbb....",
        "...bbbbbbbbb....",
        "....abbbbbb.....",
        ".....abbbb......",
        "......abb.......",
        ".......b........",
    ], [(3, 3, 'w'), (12, 5, 'a')]),
    'huevoDragoncito': dibujo([
        "................",
        "................",
        "......rrrr......",
        ".....rwrrrr.....",
        "....rwrrtrrp....",
        "....rrrrrrrp....",
        "...rrtrrrrrpp...",
        "...rrrrrqrrpp...",
        "...rrrrqrqrtp...",
        "...rrtrrrrrpp...",
        "....rrrrrrpp....",
        "....pppppppp....",
        ".....dssssd.....",
        "......dddd......",
    ]),
    'estrellaCaida': dibujo([
        "................",
        ".......y........",
        "......yyg.......",
        "......yug.......",
        ".yyyyyyuyyyyg...",
        "..yuuuuuuuygg...",
        "...yuyyyyugg....",
        "....yyyyygg.....",
        "....yyyggygg....",
        "...yyygg.yggg...",
        "...ygg....ggg...",
        "...g........g...",
    ], [(5, 6, 'o'), (9, 6, 'o'), (6, 8, 'p'), (9, 8, 'p'), (13, 1, 'w'), (2, 2, 'u'), (14, 10, 'u')], diagonal=False),
}

baul = dibujo([
    "................",
    "................",
    "................",
    "....mmmmmmmm....",
    "...mllllllllm...",
    "..mlmmmmmmmmlm..",
    "..mgmmmmmmmmgm..",
    "..ggggggggggggg.",
    "..mgmmmyymmmgm..",
    "..mgmmyggymmgm..",
    "..mgmmmyymmmgm..",
    "..mgmmmmmmmmgm..",
    "..ngnnnnnnnngn..",
], [(2, 7, 'g')])
b = [list(r) for r in baul]
b[7][15] = 'o'; b[7][2] = 'g'
baul = [''.join(r) for r in b]

# ---------------------------------------------------------------- puntos de excavacion (casillas del suelo)
sitios = {
    'sitioPrado': dibujo([
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "......fff.......",
        "....fflffff.....",
        "...flffffffj....",
        "..fffffeffjjj...",
        "..jffffffjjjj...",
        "...jjjjjjjjj....",
    ]),
    'sitioBosque': dibujo([
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "...hh......gg...",
        "....hzh..ggm....",
        ".....hzhgmg.....",
        "......jzgj......",
        ".....gmjhz......",
        "....mgg..hzh....",
        "...gg......hh...",
    ]),
    'sitioPlaya': dibujo([
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]),
    'sitioLluvia': dibujo([
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        ".....jjjj.......",
        "...jjfjjjjj.....",
        "..jfjjjjjjjj....",
        "..jjjjjjjjjjaab.",
        "...jjjjjjjjabbb.",
        "..........abbb..",
    ]),
    'hoyo': dibujo([
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        ".....ffff.......",
        "...ffjjjjff.....",
        "..fjjjjjjjjf....",
        "..fjjjjjjjjf....",
        "...ffjjjjff.....",
        ".....ffff.......",
    ], [(1, 9, 'f'), (13, 11, 'f'), (12, 14, 'j')]),
}
# El remolino de la playa: sin contorno (es un dibujo en la arena), con una conchita asomando
sp = [list('.' * 16) for _ in range(16)]
for x, y in ((6, 9), (7, 9), (8, 9), (9, 9), (10, 10), (10, 11), (9, 12), (8, 12), (7, 12), (6, 11), (6, 10), (7, 10), (8, 10),
             (8, 11), (4, 11), (4, 12), (5, 13), (6, 14), (7, 14), (8, 14), (9, 14), (10, 13), (11, 12), (12, 11), (12, 10), (11, 9)):
    sp[y][x] = 'g'
for x, y, l in ((12, 13, 'o'), (13, 13, 'o'), (14, 13, 'o'), (12, 12, 'o'), (13, 12, 'p'), (14, 12, 'o'), (13, 11, 'o')):
    sp[y][x] = l
sitios['sitioPlaya'] = [''.join(r) for r in sp]

# Maceta olvidada: lo que sale al plantar la semilla olvidada (una flor estrella que brilla de noche)
maceta = dibujo([
    "................",
    "......rrr.......",
    ".....rryrr......",
    "....rryuyrr.....",
    ".....rryrr......",
    "......rzr.......",
    "...hh..z........",
    "....hhzz........",
    "......z.........",
    "....jjjjjj......",
    "...mmmmmmmm.....",
    "...mllmmmmn.....",
    "....mlmmmn......",
    "....mmmmnn......",
    ".....nnnn.......",
], [(10, 1, 'u'), (2, 3, 'y'), (12, 5, 'w')])
# ---------------------------------------------------------------- fosiles del mar
# Tesoros de exposicion, no piedras grises: losa de arenisca rosada o arcilla calida (luz arriba a la izquierda,
# canto oscuro abajo, motitas y destellos incrustados) y la marca del fosil en azul perlado con brillos de nacar.
import math
C.update({
    '1': '#F2C9B0', '2': '#E3A98C', '3': '#FBE3D2', '4': '#C98670',   # arenisca rosada: base, sombra, luz, canto
    '5': '#DDEFF7', '6': '#A9D2E8', '7': '#7FB0CF', '8': '#FFF6FB',   # fosil perlado: luz, base, linea, nacar
    '9': '#E6D6F2',                                                   # lila perlado
})


def losa(dentro, motas=()):
    """Rellena la forma con arenisca sombreada y devuelve la rejilla (sin contorno todavia)."""
    p = [['.'] * 16 for _ in range(16)]
    for y in range(16):
        for x in range(16):
            if not dentro(x, y): continue
            if not dentro(x, y + 1) or not dentro(x + 1, y + 1): p[y][x] = '4'        # canto de abajo
            elif not dentro(x - 1, y - 1) or not dentro(x, y - 1): p[y][x] = '3'      # luz de arriba
            elif not dentro(x + 1, y) or not dentro(x, y + 2): p[y][x] = '2'          # sombra
            else: p[y][x] = '1'
    for x, y, l in motas: p[y][x] = l
    return p


def acabar(p, extra=()):
    p = contorno(p)
    for x, y, l in extra: p[y][x] = l
    return [''.join(r) for r in p]


def poner(p, x0, y0, filas):
    for j, fila in enumerate(filas):
        for i, l in enumerate(fila):
            if l != '.': p[y0 + j][x0 + i] = l


# Pez gordito dormido en una losa ovalada: costillas en abanico, espina, colita y ojito.
pez = losa(lambda x, y: ((x - 7.5) / 7.2) ** 2 + ((y - 8.5) / 5.4) ** 2 <= 1, [(3, 11, '2'), (12, 5, '3'), (10, 12, '2')])
poner(pez, 2, 5, [
    "...6666.....",
    "..655556..6.",
    ".65766756.66",
    ".65555555665",
    ".65766756.66",
    "..655556..6.",
    "...6666.....",
])
pezPiedraNuevo = acabar(pez, [(4, 7, '7'), (4, 6, '8'), (2, 4, 'w'), (13, 12, '8'), (11, 4, 'w')])

# Caracola en espiral de arcilla calida con la espiral perlada (las camaras alternan dos azules).
amon = losa(lambda x, y: math.hypot(x - 7.5, y - 7.5) <= 6.6)
for y in range(16):
    for x in range(16):
        d = math.hypot(x - 7.5, y - 7.5)
        if d > 5.6 or amon[y][x] == '.': continue
        a = (math.atan2(y - 7.5, x - 7.5) + math.pi) / (2 * math.pi)
        vuelta = (d / 1.9 - a) % 1                         # espiral de Arquimedes
        if vuelta < 0.28: amon[y][x] = '7' if d > 1.5 else '6'
        elif d < 4.2: amon[y][x] = '5' if int(a * 10) % 2 else '6'
amonitesNueva = acabar(amon, [(7, 7, '8'), (4, 4, '8'), (11, 3, 'w'), (2, 9, 'w')])

# Caballito de mar antiguo en una losa alta de esquinas redondeadas, con brillos lila y nacar.
cab = losa(lambda x, y: 3 <= x <= 12 and 1 <= y <= 14 and not ((x in (3, 12)) and (y in (1, 14))), [(4, 12, '2'), (11, 3, '3')])
poner(cab, 5, 2, [
    "..66....",
    ".6556666",
    ".65566.7",
    "..656...",
    "..6556..",
    ".69556..",
    ".69556..",
    "..6556..",
    "...656..",
    "...66...",
    "..6.6...",
    "...66...",
])
caballitoFosil = acabar(cab, [(8, 4, '7'), (7, 3, '8'), (4, 2, 'w'), (11, 13, '8'), (10, 8, 'w')])

# La hoja fosilizada, con la misma piedra calida y nervios perlados.
fosilHojaNueva = [r.replace('s', '1').replace('e', '3').replace('d', '6') for r in tesoros['fosilHoja']]
fosilHojaNueva = [r[:12] + ('w' if i == 4 else r[12]) + r[13:] for i, r in enumerate(fosilHojaNueva)]

tesoros['amonites'] = amonitesNueva
tesoros['pezPiedra'] = pezPiedraNuevo
tesoros['fosilHoja'] = fosilHojaNueva

# Hacha de lenadora (cuadro 25): mango de madera en diagonal con un lazo rosa en el puno y la cabeza de acero
# arriba a la derecha; el filo curvo mira hacia abajo a la derecha y lleva un brillo blanco.
def hacha():
    import math
    hx, hy = 10.6, 4.4                        # donde el mango entra en la cabeza
    dx, dy = 0.7071, -0.7071                  # a lo largo del mango (hacia arriba a la derecha)
    nx, ny = 0.7071, 0.7071                   # de lado (hacia el filo)
    filas = []
    for y in range(16):
        fila = ''
        for x in range(16):
            px, py = x + 0.5 - hx, y + 0.5 - hy
            a, b = px * dx + py * dy, px * nx + py * ny
            l = '.'
            if -11.5 <= a <= 1.6 and abs(b) <= 0.8:
                l = 'p' if -9.6 <= a <= -7.6 else ('l' if b < 0 else 'm')
                if a < -10.4: l = 'n'
            if 0 <= b <= 4.4 and abs(a) <= 1.4 + 0.42 * b:
                l = 'w' if b > 3.5 and a < -0.4 else 'e' if b > 3.5 or a < -0.9 else 's' if a < 0.9 else 'd'
            elif -1.8 <= b < 0 and abs(a) <= 1.2:
                l = 'd' if a > 0 else 's'
            fila += l
        filas.append(fila)
    return dibujo(filas)


# Tronquitos de madera (cuadro 26): tres troncos cortados vistos de punta, con anillos y una hojita que brota.
def tronquitos():
    import math
    filas = [['.'] * 16 for _ in range(16)]
    for cx, cy in ((4.5, 11.0), (11.0, 11.0), (7.8, 5.8)):
        for y in range(16):
            for x in range(16):
                d = math.hypot(x + 0.5 - cx, (y + 0.5 - cy) * 1.08)
                if d > 3.4: continue
                if d > 2.5: l = 'j' if x + 0.5 - cx + y + 0.5 - cy > 1 else 'n'      # corteza
                elif 1.2 < d <= 1.9: l = 'm'                                        # anillo
                elif d <= 0.6: l = 'm'                                              # corazon
                else: l = 'u' if (x + 0.5 - cx) + (y + 0.5 - cy) < -0.8 else 'i'
                filas[y][x] = l
    for x, y in ((10, 1), (11, 0), (11, 1), (12, 0), (9, 2)): filas[y][x] = 'h'      # hojita que brota
    filas[2][10] = 'z'
    return dibujo([''.join(r) for r in filas])


cuadros = {**palas, 'radar': radar, **tesoros, 'baulPirata': baul, **sitios, 'macetaOlvidada': maceta, 'caballitoFosil': caballitoFosil, 'hacha': hacha(), 'tronquitos': tronquitos()}
for k, v in cuadros.items():
    assert len(v) == 16 and all(len(r) == 16 for r in v), k
    assert all(ch in C or ch == '.' for r in v for ch in r), k

ORDEN = list(cuadros)
print({k: i for i, k in enumerate(ORDEN)})
ruta = os.path.join(RAIZ, 'fuentes', 'excavar.json')
json.dump({'nombre': 'excavar',
           'descripcion': 'Palas, radar Pipi, tesoros enterrados, baul pirata y puntos de excavacion (lo genera arte/generar-excavar.py; no editar a mano).',
           'colores': C, 'animaciones': {'tiles': {'fps': 0, 'cuadros': ORDEN}}, 'cuadros': cuadros},
          open(ruta, 'w', encoding='utf8'), indent=1, ensure_ascii=False)
print('ok', len(cuadros), 'cuadros')
