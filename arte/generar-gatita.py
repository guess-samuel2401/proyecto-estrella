# Genera arte/fuentes/gatita.json: la protagonista.
# Tres cuadros base dibujados a mano (de frente, de lado mirando a la derecha y de espaldas) y el resto sale de
# ellos: parpadeo, respirar (agachada), pasos, oreja gacha, alegria con los bracitos arriba y la colita que se mueve.
#   cabeza grande y redonda (pelo con luz arriba a la izquierda y sombra abajo), estrella en la frente, mancha en la
#   oreja derecha y un mechoncito; ojos de 2x2 con brillo; mofletes suaves; naricita y boquita de gato;
#   panuelo anudado (letra 'l' = capa 'bufanda', que el juego tine con el color de la bufanda tejida);
#   jersey de punto menta con canale, puntos de lana y nudo; bracitos; botitas; cola con la punta rosa.
# La cabeza queda donde estaba (pelo desde la fila 2, orejas en la 0) para que el gorro y el lazo sigan encajando,
# y "agachada" y los pasos bajan todo 1 pixel menos las botas, como antes (BAJA en juego.js).
# Uso: python arte/generar-gatita.py  y luego  powershell -ExecutionPolicy Bypass -File arte/generar-sprites.ps1
import json, os

RAIZ = os.path.dirname(os.path.abspath(__file__))
C = {
    'o': '#4A3347',                                   # contorno ciruela
    'c': '#FFE3EA', 'h': '#FFF6F8', 's': '#F7C9D4',   # pelo: base, luz, sombra
    'p': '#F28CA0', 'k': '#F7A6B4', 'b': '#FFB0BF',   # dentro de las orejas y naricita / mancha y punta de la cola / mofletes
    'y': '#FFE08A', 'w': '#FFFFFF',                   # estrella de la frente, brillo de los ojos
    'l': '#E6A8D7',                                   # panuelo (capa 'bufanda')
    'j': '#9ED9C5', 'g': '#76BCA6', 'v': '#C4EADC',   # jersey de punto menta: base, canale, puntos de lana
    'r': '#C98F6B',                                   # botitas (y agujas de tejer)
    'a': '#A9D8E8', 'n': '#6FA9D8',                   # regadera y agua
    'z': '#B9AFC4', 'd': '#9C6B4E',
    'x': '#F5CB8E',                                   # agujas de tejer (madera clarita, con bolita rosa)
    'f': '#F28CA0', 'u': '#FFE08A', 'm': '#FFF4E0',   # patines: chasis fresa, ruedas mantequilla (brillo w), bota crema
    'e': '#DCD5E3', 'q': '#8E8299',                   # acero del hacha: luz y sombra                   # hoja de la pala (capa 'pala', se tine segun la pala) y tierra
}

FRENTE = [
    "..oo........oo..",
    ".opco..o...okko.",
    ".oppcoohooockko.",
    ".ochhhcyyccckko.",
    "ohhccccccccccko.",
    "occcwoccccwoccco",
    "occcoocppcooccco",
    "obbcccoccocccbbo",
    ".osscccoocccsso.",
    "..oooooooooooo..",
    "..ollllllllllo..",
    ".ocojjjjjlljoco.",
    ".ocovjvjvjljoco.",
    "..ooggggggggoo..",
    "...orroooorro...",
    "....oo....oo....",
]
LADO = [
    "....oo....oo....",
    "...opco.okko....",
    "...oppcoohkko...",
    "..ochhhcyyccko..",
    ".ohhcccccccccoo.",
    ".occcccccccwocco",
    ".occcccccccoocpo",
    ".occcccccbbcccco",
    "..ossscccccccso.",
    "...oooooooooooo.",
    "..olllllllllo...",
    ".ollojjjjocjo...",
    ".olovjvjvocjo...",
    "..ooggggggoo....",
    "...orroorro.....",
    "....oo..oo......",
]
ESPALDA = [
    "..oo........oo..",
    ".ocpo......okko.",
    ".occcoooooockko.",
    ".ochhhccccccko..",
    "ohhcccccccccccko",
    "occcccccccccccco",
    "occcccccccccccco",
    "occcccccccccccco",
    ".osssssssssssso.",
    "..oooooooooooo..",
    "..olllllllllll..",
    ".ocojjjllljjoco.",
    ".ocovjvjvjvjoco.",
    "..ooggggggggoo..",
    "...orroooorro...",
    "....oo....oo....",
]
# Colas: dos posturas por vista (se alternan al respirar y al andar). (x, y, letra), en el cuadro sin bajar.
COLAS = {
    'frente': [[(14, 8, 'o'), (15, 9, 'o'), (14, 9, 'k'), (14, 10, 'c'), (15, 10, 'o')],
               [(14, 9, 'o'), (15, 10, 'o'), (14, 10, 'k')]],
    'lado': [[(1, 8, 'o'), (0, 9, 'o'), (2, 9, 'o'), (1, 9, 'k'), (1, 10, 'c'), (0, 10, 'o')],
             [(1, 9, 'o'), (0, 10, 'o'), (2, 10, 'o'), (1, 10, 'k')]],
    'espalda': [[(9, 12, 'c'), (10, 12, 'c'), (11, 11, 'c'), (11, 10, 'k'), (8, 12, 'o'), (9, 11, 'o'), (10, 11, 'o'),
                 (12, 11, 'o'), (12, 10, 'o'), (11, 9, 'o'), (10, 10, 'o'), (9, 13, 'o'), (10, 13, 'o'), (11, 12, 'o')],
                [(9, 12, 'c'), (10, 12, 'c'), (11, 12, 'k'), (12, 12, 'o'), (8, 12, 'o'), (9, 11, 'o'), (10, 11, 'o'),
                 (11, 11, 'o'), (9, 13, 'o'), (10, 13, 'o'), (11, 13, 'o')]],
}
OJOS = {'frente': (4, 10), 'lado': (11,), 'espalda': ()}
BOTAS = {'frente': (4, 10), 'lado': (4, 7), 'espalda': (4, 10)}


def copia(b): return [list(r) for r in b]


def pon(p, x, y, letra):
    if 0 <= x < 16 and 0 <= y < 16: p[y][x] = letra


def con_cola(p, vista, postura):
    for x, y, letra in COLAS[vista][postura]:
        # la cola va detras: solo se pinta en lo vacio (y en el jersey, de espaldas)
        if p[y][x] == '.' or vista == 'espalda' or letra != 'o' and p[y][x] == 'o': pon(p, x, y, letra)
    return p


def bajar(p):
    # Respira: todo baja 1 pixel menos las botas (se pierde la fila de abajo del jersey).
    return [['.'] * 16] + p[0:13] + p[14:16]


def levantar_pie(p, vista, cual):
    x = BOTAS[vista][cual]
    p[14][x] = p[14][x + 1] = 'o'                                              # el pie se esconde bajo el jersey
    p[15][x] = p[15][x + 1] = '.'
    return p


def cerrar_ojos(p, vista, b=0):
    for x in OJOS[vista]: p[5 + b][x] = p[5 + b][x + 1] = 'c'
    return p


def feliz(p, brillo=()):
    for x in (4, 10):                                                           # ojitos ^ ^
        p[5][x] = p[5][x + 1] = 'o'
        p[6][x] = p[6][x + 1] = 'c'
        p[6][x - 1] = 'o'; p[6][x + 2] = 'o'
    p[6][3] = 'o'; p[6][6] = 'o'; p[6][9] = 'o'; p[6][12] = 'o'
    p[6][7] = p[6][8] = 'p'                                                     # la naricita sigue
    p[7][7] = p[7][8] = 'p'                                                     # boca abierta
    for y in (11, 12): p[y][1] = p[y][2] = '.'; p[y][13] = p[y][14] = '.'      # los bracitos suben
    p[13][2] = p[13][13] = '.'
    p[11][3] = 'o'; p[11][12] = 'o'
    for x, xo in ((1, 0), (14, 15)):
        p[9][x] = p[10][x] = 'c'; p[9][xo] = p[10][xo] = 'o'; p[11][x] = 'o'
    for x, y in brillo: pon(p, x, y, 'y')
    return p


def oreja_gacha(p):
    p[0][12] = p[0][13] = '.'
    p[1][11:15] = list('.oo.')
    p[1][14] = 'o'; p[2][15] = 'o'
    return p


def frente(postura=0, b=0): return con_cola(copia(FRENTE), 'frente', postura)
def lado(postura=0): return con_cola(copia(LADO), 'lado', postura)
def espalda(postura=0): return con_cola(copia(ESPALDA), 'espalda', postura)


# ---------------------------------------------------------------- poses de las actividades
def pata(p, x, y):
    """Patita suelta: pelo con contorno ciruela alrededor (solo donde no hay nada)."""
    pon(p, x, y, 'c')
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        if 0 <= x + dx < 16 and 0 <= y + dy < 16 and p[y + dy][x + dx] == '.': p[y + dy][x + dx] = 'o'
    return p


def quitar_brazos(p, b=0):
    # Los bracitos de los lados se van (van por delante, sujetando algo).
    for y in (11 + b, 12 + b):
        if y < 16:
            for x in (1, 2, 13, 14): p[y][x] = '.'
    if 13 + b < 16: p[13 + b][2] = p[13 + b][13] = '.'
    for y in (11 + b, 12 + b): p[y][3] = p[y][12] = 'o'
    return p


def oreja_gacha_izq(p):
    p[0][2] = p[0][3] = '.'
    p[1][1:5] = list('.oo.')
    p[1][1] = 'o'; p[2][0] = 'o'
    return p


def ojos_esfuerzo(p, vista, b=0):
    # Ojos apretados de esfuerzo: > <
    xs = (4, 10) if vista == 'frente' else (11,) if vista == 'lado' else ()
    for i, x in enumerate(xs):
        p[5 + b][x] = p[5 + b][x + 1] = 'c'; p[6 + b][x] = p[6 + b][x + 1] = 'c'
        if vista == 'frente' and i == 0: p[5 + b][x] = 'o'; p[6 + b][x + 1] = 'o'
        else: p[5 + b][x + 1] = 'o'; p[6 + b][x] = 'o'
    if vista == 'frente':                                                      # boquita en "o" de hacer fuerza
        p[7 + b][6] = p[7 + b][9] = 'c'
        p[7 + b][7] = p[7 + b][8] = 'o'
        p[8 + b][7] = p[8 + b][8] = 'p'
        p[3 + b][15] = 'a'; p[4 + b][15] = 'n'                                 # gotita de esfuerzo
    return p


def ojos_sueno(p, b=0):
    for x in (4, 10): p[5 + b][x] = p[5 + b][x + 1] = 'o'; p[6 + b][x] = p[6 + b][x + 1] = 'c'   # parpados caidos
    return p


def pescar(vista, b=0, tension=False):
    """Sujetando la cana con las dos patitas por delante (la cana la dibuja el juego)."""
    if vista == 'frente':
        p = con_cola(copia(FRENTE), 'frente', 0 if tension else 1)
        if b: p = bajar(p)
        quitar_brazos(p, b)
        y = 11 + b                                                            # las dos patitas juntas por delante
        p[y][5] = p[y][10] = 'o'
        for x in range(6, 10): p[y][x] = 'c'; p[y + 1][x] = 'o' if y + 1 < 14 + b else p[y + 1][x]
        p[y][7] = 'h'
        if tension: ojos_esfuerzo(p, 'frente', b)
    elif vista == 'lado':
        p = con_cola(copia(LADO), 'lado', 0 if tension else 1)
        if b: p = bajar(p)
        p[11 + b][9] = 'j'; p[11 + b][10] = 'j'
        if 12 + b < 16: p[12 + b][9] = 'v'; p[12 + b][10] = 'j'
        p[11 + b][12] = 'c'; pata(p, 13, 11 + b)                             # la patita estirada hacia delante
        if tension: ojos_esfuerzo(p, 'lado', b)
    else:
        p = con_cola(copia(ESPALDA), 'espalda', 0 if tension else 1)
        if b: p = bajar(p)
        quitar_brazos(p, b)
    return p


# ---------------------------------------------------------------- tejer, sentadita en su cojin
# Sentada con las piernitas cruzadas: todo baja 1 pixel (BAJA = 1) y abajo asoman las piernas cruzadas con las
# botitas a los lados. El cojin, el trocito de tela que crece en el regazo y los ovillos los dibuja el juego.
PIERNAS = ["orrcccccsscccrro", ".oooooooooooooo."]


def sentada(postura=0):
    f = con_cola(copia(FRENTE), 'frente', postura)
    return [['.'] * 16] + f[0:13] + [list(r) for r in PIERNAS]


def sin_brazos_sentada(p):
    for y in (12, 13):
        for x in (1, 2, 13, 14): p[y][x] = '.'
        p[y][3] = p[y][12] = 'o'
    return p


# Agujas de madera (r): las dos patitas en el regazo y las puntas que se cruzan; en 1 y 2 sube una de las dos.
AGUJAS = [
    [(2, 9, 'p'), (3, 10, 'x'), (4, 11, 'x'), (13, 9, 'p'), (12, 10, 'x'), (11, 11, 'x')],
    [(3, 8, 'p'), (4, 9, 'x'), (4, 10, 'x'), (5, 11, 'x'), (13, 9, 'p'), (12, 10, 'x'), (11, 11, 'x')],
    [(2, 9, 'p'), (3, 10, 'x'), (4, 11, 'x'), (12, 8, 'p'), (11, 9, 'x'), (11, 10, 'x'), (10, 11, 'x')],
]


def con_agujas(p, fase):
    sin_brazos_sentada(p)
    for x, y, l in AGUJAS[fase]: p[y][x] = l
    pata(p, 5, 12); pata(p, 10, 12)
    return p


def cara(p, gesto):
    """Gestos de la cara sentada (todo 1 pixel mas abajo que en FRENTE)."""
    if gesto in ('cerrados', 'lengua'): cerrar_ojos(p, 'frente', 1)        # ojitos cerrados, disfrutando
    if gesto == 'lengua': p[9][8] = 'p'; p[10][8] = 'p'                      # la puntita de la lengua, concentrada
    if gesto == 'feliz':                                                      # ojitos ^ ^ y boquita abierta
        for x in (4, 10):
            p[6][x] = p[6][x + 1] = 'o'
            p[7][x] = p[7][x + 1] = 'c'
            p[7][x - 1] = 'o'; p[7][x + 2] = 'o'
        p[8][7] = p[8][8] = 'p'
    return p


def tejer(fase, gesto='abiertos', postura=1):
    return cara(con_agujas(sentada(postura), fase), gesto)


def sentarse(paso):
    """Se pone comoda: se agacha (0), se sienta en el cojin (1 y 2) y saca las agujas contenta (3)."""
    if paso == 0: return bajar(frente(1))
    if paso == 1: return cerrar_ojos(sentada(1), 'frente', 1)
    if paso == 2: return sentada(0)
    return tejer(0, 'feliz')


def regar(fase):
    """Con la regadera en la patita derecha: la levanta, la inclina y cae el agua."""
    p = con_cola(copia(FRENTE), 'frente', 1)
    for y in (11, 12): p[y][13] = p[y][14] = '.'
    p[13][13] = '.'; p[11][12] = p[12][12] = 'o'
    lata = [{(12, 10): 'o', (13, 10): 'o', (14, 10): 'o', (12, 11): 'o', (13, 11): 'a', (14, 11): 'a', (15, 11): 'o',
             (12, 12): 'o', (13, 12): 'n', (14, 12): 'n', (15, 12): 'o', (13, 13): 'o', (14, 13): 'o', (15, 10): 'o'},
            {(13, 10): 'o', (14, 10): 'o', (12, 11): 'o', (13, 11): 'a', (14, 11): 'a', (15, 11): 'o', (12, 12): 'o',
             (13, 12): 'n', (14, 12): 'a', (15, 12): 'o', (13, 13): 'o', (14, 13): 'n', (15, 13): 'o', (14, 14): 'o', (15, 14): 'a'},
            {(13, 10): 'o', (14, 10): 'o', (12, 11): 'o', (13, 11): 'a', (14, 11): 'a', (15, 11): 'o', (12, 12): 'o',
             (13, 12): 'n', (14, 12): 'a', (15, 12): 'o', (13, 13): 'o', (14, 13): 'n', (15, 13): 'o', (14, 14): 'o', (15, 15): 'a'}][fase]
    for (x, y), l in lata.items(): p[y][x] = l
    return p


def cultivar(fase):
    """Agachadita, con las patitas en la tierra (plantar y abonar)."""
    p = bajar(con_cola(copia(FRENTE), 'frente', fase))
    quitar_brazos(p, 1)
    for x in [(5, 10), (6, 9)][fase]:
        p[13][x] = 'c'
        if p[14][x] == '.': p[14][x] = 'o'
    if fase: p[15][3] = 'r'; p[15][12] = 'r'                                   # tierrita que salta
    return p


def sueno(fase):
    """De noche, si se queda quieta, le entra sueno: parpados caidos, cabeceo y bostezo."""
    if fase == 0: return ojos_sueno(frente(0))
    p = oreja_gacha(oreja_gacha_izq(bajar(frente(1))))
    p = cerrar_ojos(p, 'frente', 1)
    for x in (4, 10): p[7][x] = p[7][x + 1] = 'o'
    if fase == 2: p[8][7] = p[8][8] = 'p'; p[9][7] = p[9][8] = 'p'             # bostezo
    return p


def cavar(fase):
    """Con la pala a la derecha: la levanta (0), la clava en la tierra (1) y echa la tierra por encima (2).
    El mango (r) va en vertical por la columna 14 y la hoja (z) de 4x3 queda abajo."""
    b = 1 if fase == 1 else 0
    p = con_cola(copia(FRENTE), 'frente', fase % 2)
    if b: p = bajar(p)
    for y in (11 + b, 12 + b):
        if y < 16: p[y][13] = p[y][14] = '.'; p[y][12] = 'o'
    if 13 + b < 16: p[13 + b][13] = '.'
    arriba = {0: 10, 1: 12, 2: 9}[fase]                                      # fila de arriba de la hoja
    for y in range(arriba - 5, arriba):                                       # mango, con su contorno (bajo la cabeza)
        p[y][14] = 'r'
        if p[y][15] == '.' or y >= 9 + b: p[y][15] = 'o'
        if p[y][13] == '.' or y >= 9 + b: p[y][13] = 'o'
    p[arriba - 6][14] = 'o'
    hoja = ['ozzzo', 'ozzzo', 'ozzzo', '.ooo.']
    for j, fila in enumerate(hoja):
        for i, l in enumerate(fila):
            if arriba + j < 16 and 11 + i < 16 and l != '.': p[arriba + j][11 + i] = l
    pata(p, 13, arriba - 3)                                                   # la patita en el mango
    p = cerrar_ojos(p, 'frente', b)
    if fase == 1: p[15][11] = 'd'; p[15][15] = 'd'                           # tierra que salta al clavar
    if fase == 2: p[8][15] = 'd'; p[7][13] = 'd'; p[9][12] = 'd'             # tierra que vuela
    return p


def talar(fase):
    """Con el hacha a la derecha: la levanta junto a la carita (0) y la baja de golpe hacia el arbol (1).
    Mango r, cabeza de acero z (sin capa: el hacha no cambia de color) y astillas d."""
    b = 1 if fase == 1 else 0
    p = con_cola(copia(FRENTE), 'frente', fase)
    if b: p = bajar(p)
    for y in (11 + b, 12 + b):                                                # el bracito derecho se va al mango
        if y < 16: p[y][13] = p[y][14] = '.'; p[y][12] = 'o'
    if 13 + b < 16: p[13 + b][13] = '.'
    if fase == 0:
        mango = [(14, y) for y in range(4, 12)]
        cabeza = [(13, 1), (14, 1), (14, 2), (14, 3), (15, 1), (15, 2), (15, 3), (15, 4), (15, 0)]
        pata_en = (13, 9)
    else:
        mango = [(12, 11), (13, 12), (14, 13), (13, 13), (12, 12)]
        cabeza = [(14, 14), (15, 14), (15, 13), (14, 15), (15, 15), (15, 12)]
        pata_en = (12, 11)
    fuera = set(mango) | set(cabeza)
    for x, y in fuera:                                                         # contorno solo donde no hay otra cosa nuestra
        for ex, ey in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            if (x + ex, y + ey) not in fuera: pon(p, x + ex, y + ey, 'o')
    for x, y in mango: pon(p, x, y, 'r')
    for x, y in cabeza: pon(p, x, y, 'e')
    if fase == 0: pon(p, 15, 3, 'w'); pon(p, 13, 1, 'q'); pon(p, 14, 3, 'q')
    else: pon(p, 15, 15, 'w'); pon(p, 14, 14, 'q')
    pata(p, *pata_en)
    p = cerrar_ojos(p, 'frente', b) if fase == 1 else p
    if fase == 1:
        for x, y in ((11, 15), (9, 14), (10, 13)): pon(p, x, y, 'd')          # astillas que saltan
    return p


# ---------------------------------------------------------------- patinar (al correr con Mayus)
# Se pone unos patines: las piernitas se doblan un poco (se pierde el canale del jersey), las botitas quedan en la
# fila 13 como botas de patinar crema (m), debajo va el chasis fresa (f) y las ruedas (u, con brillo w que gira).
# En cada zancada un patin se despega del suelo (no se le ven las ruedas).
PATINES = {
    'frente':  ["...ommoooommo...", "...offo..offo...", "...ouuo..ouuo..."],
    'espalda': ["...ommoooommo...", "...offo..offo...", "...ouuo..ouuo..."],
    'lado':    ["...ommoommo.....", "..offffffffffo..", "..ouo.ouo.ouo..."],
}
PIES = {'frente': ((3, 7), (9, 13)), 'espalda': ((3, 7), (9, 13)), 'lado': ((2, 9), (9, 13))}


def patines(p, vista, gira=0, levanta=None):
    filas = [list(r) for r in PATINES[vista]]
    if gira:                                                                    # el brillo de las ruedas da vueltas
        for x, l in enumerate(filas[2]):
            if l == 'u' and (x + gira) % 2: filas[2][x] = 'w'
    if levanta is not None:                                                     # ese patin se despega: sin ruedas en el suelo
        a, b = PIES[vista][levanta]
        for x in range(a, b): filas[2][x] = '.'
    return p[0:13] + filas


def patinar(vista, paso):
    """Zancada de patinaje: 0 y 2 deslizando con los dos patines, 1 y 3 empujando con uno."""
    base = {'frente': frente, 'lado': lado, 'espalda': espalda}[vista](paso % 2)
    levanta = None if paso % 2 == 0 else (0 if paso == 1 else 1)
    p = patines(base, vista, paso, levanta)
    return p


cuadros = {
    'reposo': frente(0),
    'agachada': bajar(frente(1)),
    'parpadeo': cerrar_ojos(frente(0), 'frente'),
    'pasoIzq': levantar_pie(bajar(frente(1)), 'frente', 0),
    'pasoDer': levantar_pie(bajar(frente(0)), 'frente', 1),
    'lado': lado(0),
    'ladoAgachada': bajar(lado(1)),
    'ladoParpadeo': cerrar_ojos(lado(0), 'lado'),
    'ladoPasoA': levantar_pie(bajar(lado(1)), 'lado', 0),
    'ladoPasoB': levantar_pie(bajar(lado(0)), 'lado', 1),
    'espalda': espalda(0),
    'espAgachada': bajar(espalda(1)),
    'espPasoA': levantar_pie(bajar(espalda(1)), 'espalda', 0),
    'espPasoB': levantar_pie(bajar(espalda(0)), 'espalda', 1),
    'orejaBaja': oreja_gacha(frente(1)),
    'feliz': feliz(copia(FRENTE)),
    'felizBrillo': feliz(copia(FRENTE), [(1, 0), (14, 13), (15, 12)]),
    'felizBrillo2': feliz(copia(FRENTE), [(14, 0), (1, 13), (0, 12)]),
    'pesca': pescar('frente'), 'pescaB': pescar('frente', 1), 'pescaParpadeo': cerrar_ojos(pescar('frente'), 'frente'),
    'pescaLado': pescar('lado'), 'pescaLadoB': pescar('lado', 1), 'pescaLadoParpadeo': cerrar_ojos(pescar('lado'), 'lado'),
    'pescaEsp': pescar('espalda'), 'pescaEspB': pescar('espalda', 1),
    'tira': pescar('frente', 0, True), 'tiraB': pescar('frente', 1, True),
    'tiraLado': pescar('lado', 0, True), 'tiraLadoB': pescar('lado', 1, True),
    'tiraEsp': pescar('espalda', 0, True), 'tiraEspB': pescar('espalda', 1, True),
    'sienta0': sentarse(0), 'sienta1': sentarse(1), 'sienta2': sentarse(2), 'sienta3': sentarse(3),
    'teje': tejer(0), 'tejeB': tejer(1), 'tejeCerr': tejer(0, 'cerrados', 0), 'tejeLengua': tejer(2, 'lengua'),
    'tejeLengua2': tejer(0, 'lengua', 0), 'tejeCerrB': tejer(1, 'cerrados'), 'tejeC': tejer(2),
    'tejeBien': tejer(0, 'feliz'), 'tejeBien2': tejer(1, 'feliz', 0),
    'riega': regar(0), 'riegaB': regar(1), 'riegaC': regar(2),
    'cava': cultivar(0), 'cavaB': cultivar(1),
    'sueno': sueno(0), 'suenoB': sueno(1), 'suenoC': sueno(2),
    'palaAlza': cavar(0), 'palaClava': cavar(1), 'palaEcha': cavar(2),
    'hachaAlza': talar(0), 'hachaGolpe': talar(1),
    **{'patin' + v + str(i): patinar(vista, i) for v, vista in (('', 'frente'), ('Lado', 'lado'), ('Esp', 'espalda')) for i in range(4)},
}
cuadros = {k: [''.join(r) for r in v] for k, v in cuadros.items()}
for k, v in cuadros.items():
    assert len(v) == 16 and all(len(r) == 16 for r in v), k
    assert all(ch in C or ch == '.' for r in v for ch in r), k

ANIMACIONES = {
    'reposo': {'fps': 4, 'cuadros': ['reposo', 'reposo', 'agachada', 'agachada', 'reposo', 'parpadeo', 'agachada', 'agachada', 'reposo', 'reposo', 'agachada', 'agachada', 'orejaBaja', 'reposo', 'agachada', 'agachada']},
    'caminar': {'fps': 8, 'cuadros': ['reposo', 'pasoIzq', 'reposo', 'pasoDer']},
    'reposoLado': {'fps': 4, 'cuadros': ['lado', 'lado', 'ladoAgachada', 'ladoAgachada', 'lado', 'ladoParpadeo', 'ladoAgachada', 'ladoAgachada']},
    'caminarLado': {'fps': 8, 'cuadros': ['lado', 'ladoPasoA', 'lado', 'ladoPasoB']},
    'reposoEsp': {'fps': 4, 'cuadros': ['espalda', 'espalda', 'espAgachada', 'espAgachada']},
    'caminarEsp': {'fps': 8, 'cuadros': ['espalda', 'espPasoA', 'espalda', 'espPasoB']},
    'alegria': {'fps': 8, 'cuadros': ['agachada', 'feliz', 'felizBrillo', 'feliz', 'felizBrillo2', 'feliz', 'agachada']},
    # Actividades (BAJA en juego.js tiene que coincidir: 1 en los cuadros que bajan; lo imprime este script)
    'pescar': {'fps': 3, 'cuadros': ['pesca', 'pesca', 'pescaB', 'pescaB', 'pesca', 'pescaParpadeo', 'pescaB', 'pescaB']},
    'pescarLado': {'fps': 3, 'cuadros': ['pescaLado', 'pescaLado', 'pescaLadoB', 'pescaLadoB', 'pescaLado', 'pescaLadoParpadeo', 'pescaLadoB', 'pescaLadoB']},
    'pescarEsp': {'fps': 3, 'cuadros': ['pescaEsp', 'pescaEsp', 'pescaEspB', 'pescaEspB']},
    'tirar': {'fps': 8, 'cuadros': ['tira', 'tiraB']},
    'tirarLado': {'fps': 8, 'cuadros': ['tiraLado', 'tiraLadoB']},
    'tirarEsp': {'fps': 8, 'cuadros': ['tiraEsp', 'tiraEspB']},
    'tejer': {'fps': 5, 'cuadros': ['teje', 'tejeB', 'tejeCerr', 'tejeLengua', 'tejeLengua2', 'tejeCerrB', 'teje', 'tejeC']},
    'tejerSentarse': {'fps': 8, 'cuadros': ['sienta0', 'sienta1', 'sienta2', 'sienta3', 'teje']},
    'tejerBien': {'fps': 6, 'cuadros': ['tejeBien', 'tejeBien2']},
    'regar': {'fps': 6, 'cuadros': ['riega', 'riegaB', 'riegaC', 'riegaB', 'riegaC']},
    'cultivar': {'fps': 6, 'cuadros': ['cava', 'cavaB', 'cava', 'cavaB']},
    'cavar': {'fps': 5, 'cuadros': ['palaAlza', 'palaClava', 'palaClava', 'palaEcha']},
    'talar': {'fps': 6, 'cuadros': ['hachaAlza', 'hachaAlza', 'hachaGolpe', 'hachaGolpe']},
    'patinar': {'fps': 6, 'cuadros': ['patin0', 'patin1', 'patin2', 'patin3']},
    'patinarLado': {'fps': 6, 'cuadros': ['patinLado0', 'patinLado1', 'patinLado2', 'patinLado3']},
    'patinarEsp': {'fps': 6, 'cuadros': ['patinEsp0', 'patinEsp1', 'patinEsp2', 'patinEsp3']},
    'sueno': {'fps': 2, 'cuadros': ['sueno', 'sueno', 'suenoB', 'suenoB', 'suenoC', 'suenoB', 'sueno', 'sueno']},
}
BAJAN = {'agachada', 'pasoIzq', 'pasoDer', 'ladoAgachada', 'ladoPasoA', 'ladoPasoB', 'espAgachada', 'espPasoA', 'espPasoB',
         'pescaB', 'pescaLadoB', 'pescaEspB', 'tiraB', 'tiraLadoB', 'tiraEspB', 'teje', 'tejeB', 'tejeCerr', 'tejeLengua', 'tejeLengua2', 'tejeCerrB', 'tejeC', 'tejeBien', 'tejeBien2', 'sienta0', 'sienta1', 'sienta2', 'sienta3', 'cava', 'cavaB', 'suenoB', 'suenoC', 'palaClava', 'hachaGolpe'}
print('BAJA:', {'gatita_' + k: [1 if c in BAJAN else 0 for c in v['cuadros']] for k, v in ANIMACIONES.items()})

ruta = os.path.join(RAIZ, 'fuentes', 'gatita.json')
json.dump({'nombre': 'gatita',
           'descripcion': 'Protagonista: gatita rosa con estrella en la frente, mancha en la oreja, panuelo, jersey de punto y botitas (lo genera arte/generar-gatita.py; no editar a mano).',
           'colores': C, 'capas': {'bufanda': ['l'], 'pala': ['z']}, 'animaciones': ANIMACIONES, 'cuadros': cuadros},
          open(ruta, 'w', encoding='utf8'), indent=1, ensure_ascii=False)
print('ok', len(cuadros), 'cuadros')
