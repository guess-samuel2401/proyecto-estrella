# Genera arte/fuentes/vecinos.json: los vecinos, rechonchos como la gatita pero cada uno con su silueta.
#   Cuadros de 16x24 con el pie abajo (fila 23). Cada vecino tiene una tira de 4 cuadros de reposo:
#     oso      Miel: grande y abrazable (ocupa todo el ancho), delantal de panadera con harina y corazon;
#              reposo = se toma un te humeante (taza en el pecho, sorbe con los ojos cerrados, sonrie ^^)
#     conejo   Copito: delgadito y alto por las orejas, peto lila de jardinero con tierra y botas de agua;
#              reposo = riega su plantita (inclina la regadera, caen gotas y el brote se estira)
#     rana     Nenufar: bajita y ancha, chubasquero y gorro de pescadora amarillos, botas coral;
#              reposo = cabecea de sueno (ojos que se cierran, cabezada y pompita en la nariz)
#     pinguina Brisa: pequena y redonda como un huevo, bufanda de rayas; reposo = saluda con la aleta
#   tiles: retrato de 16x16 de cada uno (recorte del cuadro 0) en el orden de VECINOS (dialogo, diario, tarjeta).
# Cada vecino se dibuja con sus propias letras (PALETAS) y aqui se pasan a letras globales sin choques.
# Este script es el unico que escribe vecinos.json (antes generar-mar.py anadia a Brisa).
# Uso: python arte/generar-vecinos.py  y luego  powershell -ExecutionPolicy Bypass -File arte/generar-sprites.ps1
import json, os

RAIZ = os.path.dirname(os.path.abspath(__file__))
COMUN = {'o': '#4A3347', 'w': '#FFFFFF', 'b': '#FFB0BF', 'v': '#F4F0F6'}   # contorno, brillo, mofletes, vaho y pompas
PALETAS = {
    'oso':      {'c': '#E0A872', 'h': '#F2C894', 's': '#C08550', 'm': '#FBE3C4', 'a': '#FFF4E0', 'x': '#F2DFD0',
                 'f': '#F28CA0', 'r': '#F7A6B4', 't': '#C98F6B'},
    'conejo':   {'c': '#FFF6EC', 'h': '#FFFFFF', 's': '#EADBD0', 'p': '#F7A6B4', 'l': '#C9A7D8', 'k': '#B48FC6',
                 'd': '#9C6B4E', 'g': '#8FC98A', 'z': '#5E9E6E', 'u': '#A9D8E8', 'n': '#6FA9D8', 't': '#E8936A', 'e': '#C9744F'},
    'rana':     {'c': '#A8D89A', 'h': '#C8E8B8', 's': '#7FBF8E', 'y': '#FFE08A', 'q': '#E8B84F', 'l': '#FFF1B8',
                 'k': '#F5B78E', 'e': '#E89F74'},
    'pinguina': {'c': '#6F8FC0', 'h': '#8FAAD4', 's': '#55709E', 'a': '#FFF4E0', 'x': '#EADFD3', 'k': '#E8A85C',
                 'm': '#C4EADC'},
}

# ---------------------------------------------------------------- Miel, la osa panadera (te humeante)
MIEL = [
    "................",
    "................",
    ".ooo........ooo.",
    "ohsco.oooo.ocsho",
    "ocsoohhccccoosco",
    ".oohhcccccccsoo.",
    "ohhccccccccccsso",
    "ohcwoccccccwocso",
    "ohcooccccccoocso",
    "obbcmmmoommmcbbo",
    "ocscmmmommmmcsso",
    ".osccmmmmmmccso.",
    "..oossssssssoo..",
    ".ohccoaaaaaocco.",
    "ohhcoaaaaaaaocso",
    "ohcoaooooooaocso",
    "ohocoorrfrroosso",
    "ohcchorrrrroocso",
    "ohcchoorrrroocso",
    "ohooaxooooooxoso",
    ".oaaaawaaaaaaao.",
    ".oxaaaaaaawaaxo.",
    "..oosoooooosoo..",
    "...ooo....ooo...",
]
def miel(fase):
    p = [list(r) for r in MIEL]
    sube = {1: 3, 2: 5}.get(fase, 0)
    if sube:                                            # sube la taza hasta el hocico
        taza = [list(MIEL[y][4:12]) for y in range(15, 19)]
        for y in range(15, 19): p[y][4:12] = list('aaaaaaaa')
        for j, fila in enumerate(taza): p[15 - sube + j][4:12] = fila
    if fase == 2:                                       # sorbe: ojos cerrados
        p[7][3:5] = list('cc'); p[7][11:13] = list('cc')
    if fase == 3:                                       # contenta: ojos ^^
        p[7][3:6] = list('coc'); p[8][3:6] = list('oco'); p[7][10:13] = list('coc'); p[8][10:13] = list('oco')
    vaho = {0: [(7, 13), (8, 12), (7, 11)], 1: [(8, 10), (7, 9)], 3: [(8, 13), (7, 12), (8, 11), (7, 10)]}.get(fase, [])
    for x, y in vaho: p[y][x] = 'v'
    return p

# ---------------------------------------------------------------- Copito, el conejo jardinero (riega)
COPITO = [
    "...oo.....oo....",
    "..ocpo...ocpo...",
    "..ocpo...ocpo...",
    "..ocpo...ocpo...",
    "..ohpo...ohpo...",
    "..ohpo..ohpo....",
    "..ohco..occo....",
    "..oocoooocoo....",
    ".ohhccccccccso..",
    "ohhccccccccccso.",
    "ohcwoccccwocsso.",
    "ohcooccccoocsso.",
    "obbccpppcccbbso.",
    ".ocsccoocccsso..",
    "..oossssssoo....",
    "..oloooooolo....",
    ".ocolllllloco...",
    ".ocollkllloco...",
    "..olldllllo.....",
    "..olllllldo.....",
    "..oklllllko.....",
    "...ooggooggo....",
    "...ogzoogzo.....",
    "...oooooooo.....",
]
REGADERA = [  # (x, y, letra) de la regadera en cada fase: recta, inclinandose, regando
    [(12, 13, 'o'), (13, 13, 'o'), (14, 13, 'o'), (12, 14, 'u'), (13, 14, 'u'), (14, 14, 'o'), (12, 15, 'n'), (13, 15, 'u'), (14, 15, 'o'),
     (12, 16, 'o'), (13, 16, 'o'), (14, 16, 'o'), (15, 14, 'o'), (15, 13, 'o')],
    [(12, 13, 'o'), (13, 13, 'o'), (14, 13, 'o'), (12, 14, 'u'), (13, 14, 'u'), (14, 14, 'o'), (12, 15, 'n'), (13, 15, 'u'), (14, 15, 'o'),
     (12, 16, 'o'), (13, 16, 'o'), (14, 16, 'o'), (15, 15, 'o'), (15, 16, 'o')],
    [(12, 14, 'o'), (13, 14, 'o'), (14, 14, 'o'), (12, 15, 'u'), (13, 15, 'u'), (14, 15, 'o'), (12, 16, 'n'), (13, 16, 'u'), (14, 16, 'o'),
     (12, 17, 'o'), (13, 17, 'o'), (14, 17, 'o'), (15, 16, 'o'), (15, 17, 'o')],
]
def copito(fase):
    p = [list(r) for r in COPITO]
    for x, y, l in [(12, 20, 'o'), (13, 20, 'o'), (14, 20, 'o'), (15, 20, 'o'), (12, 21, 'o'), (13, 21, 't'), (14, 21, 't'), (15, 21, 'o'),
                    (12, 22, 'o'), (13, 22, 'e'), (14, 22, 't'), (15, 22, 'o'), (12, 23, 'o'), (13, 23, 'o'), (14, 23, 'o'), (15, 23, 'o')]:
        p[y][x] = l                                                       # maceta de barro
    brote = [1, 1, 2, 3][fase]
    for k in range(brote): p[19 - k][13] = 'z'
    p[19 - brote][12] = 'g'; p[19 - brote][14] = 'g'                      # hojitas arriba del brote
    for x, y, l in REGADERA[min(fase, 2) if fase < 3 else 0]: p[y][x] = l
    for x, y in {1: [(15, 18)], 2: [(15, 18), (14, 19), (15, 19)]}.get(fase, []):
        if p[y][x] == '.': p[y][x] = 'n'
    if fase == 3:                                       # contento: ojos ^^
        p[10][2:5] = list('coc'); p[11][2:5] = list('oco'); p[10][8:11] = list('coc'); p[11][8:11] = list('oco')
    return p

# ---------------------------------------------------------------- Nenufar, la rana pescadora (cabecea)
NENUFAR = [
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "......oooo......",
    ".ooo.oyllyo.ooo.",
    "ohhcoyyyyyyochco",
    "owocoyyyyyyocwoo",
    "ooocoqqqqqqocooo",
    ".occcooooooccco.",
    "ohcccccccccccsco",
    "obbcccccccccbbso",
    "ohccoccccccocsso",
    ".occcoooooocsso.",
    "..ocssssssssso..",
    "..oyoooooooooy..",
    ".oylyyyoyyyyyqo.",
    ".oyyyyyyyyyyyqo.",
    ".oyyyyyoyyyyqqo.",
    "..oqqyyyyyyqqo..",
    "..okkeo..okkeo..",
    "..oooooo.oooooo.",
]
def nenufar(fase):
    p = [list(r) for r in NENUFAR]
    if fase >= 1:                                       # los ojos se cierran (queda la rayita de abajo)
        p[9][1:3] = list('hc'); p[9][13:15] = list('ch')
    if fase >= 2:                                       # cabezada: la cabeza baja un pixel sobre el chubasquero
        cabeza = [r[:] for r in p[6:17]]
        cuello = p[17][:]
        p[6] = list('.' * 16)
        for j, r in enumerate(cabeza): p[7 + j] = r
        p[17] = [a if a != '.' else b for a, b in zip(cabeza[-1], cuello)]
    if fase == 2: p[15][12] = 'v'                       # pompita que empieza
    if fase == 3:
        for x, y in [(12, 14), (13, 14), (12, 15), (13, 15)]: p[y][x] = 'v'
        p[14][12] = 'w'
        for x, y in [(13, 3), (14, 3), (14, 4), (13, 5), (14, 5)]: p[y][x] = 'o'     # una zeta
    return p

# ---------------------------------------------------------------- Brisa, la pinguina (saluda con la aleta)
BRISA = [
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "......oooo......",
    "....oohhccoo....",
    "...ohhccccccoo..",
    "...ohaaaaaacco..",
    "..ohaaoaaoaacco.",
    "..ocabaakkabaco.",
    "..occaaakaaacco.",
    "..omamamamamamo.",
    ".oocaaaaaamaco..",
    "ochocaaaaamacoo.",
    "ocsocaaaaamaco..",
    ".oo.ocaaaaacso..",
    "....ocsxxxxsco..",
    "....okkooookko..",
    "....oooo..oooo..",
]
ALETAS = [  # aleta derecha: colgando, a media altura, arriba saludando
    [(14, 17, 'o'), (14, 18, 'c'), (15, 18, 'o'), (14, 19, 's'), (15, 19, 'o'), (14, 20, 'o')],
    [(14, 14, 'o'), (15, 14, 'o'), (14, 15, 'c'), (15, 15, 'o'), (14, 16, 's'), (15, 16, 'o'), (14, 17, 'o')],
    [(14, 10, 'o'), (14, 11, 'c'), (15, 11, 'o'), (14, 12, 'c'), (15, 12, 'o'), (14, 13, 's'), (15, 13, 'o'), (14, 14, 'o')],
    [(14, 13, 'o'), (15, 13, 'o'), (14, 14, 'c'), (15, 14, 'o'), (14, 15, 's'), (15, 15, 'o'), (14, 16, 'o')],
]
def brisa(fase):
    p = [list(r) for r in BRISA]
    for x, y, l in ALETAS[fase]: p[y][x] = l
    if fase == 2:                                       # contenta: ojos ^^
        p[13][6] = 'a'; p[13][9] = 'a'; p[12][6] = 'o'; p[12][9] = 'o'
        p[13][5] = 'o'; p[13][7] = 'o'; p[13][8] = 'o'; p[13][10] = 'o'
    return p


VECINOS = [('conejo', copito, 6), ('rana', nenufar, 6), ('oso', miel, 2), ('pinguina', brisa, 8)]   # (id, dibujo, fila de arriba del retrato)
LETRAS = iter('ACDEFGHIJKLMNPQRSTUXYZ0123456789@%&*+=!?<>~^')
C, cuadros, anims, retratos = dict(COMUN), {}, {}, []
for vid, fn, arriba in VECINOS:
    mapa = {}
    for l, color in PALETAS[vid].items():
        g = next(LETRAS)
        while g.lower() in C or g in C: g = next(LETRAS)          # el script de sprites no distingue mayusculas
        mapa[l] = g; C[g] = color
    nombres = []
    for f in range(4):
        p = fn(f)
        assert len(p) == 24 and all(len(r) == 16 for r in p), (vid, f, [len(r) for r in p])
        fila = [''.join(l if l in '.' or l in COMUN else mapa[l] for l in r) for r in p]
        cuadros[f'{vid}{f}'] = fila
        nombres.append(f'{vid}{f}')
    anims[vid] = {'fps': 0, 'cuadros': nombres}
    cuadros[vid] = cuadros[f'{vid}0'][arriba:arriba + 16]
    retratos.append(vid)
anims['tiles'] = {'fps': 0, 'cuadros': retratos}
for k, v in cuadros.items():
    assert all(ch in C or ch == '.' for r in v for ch in r), (k, {ch for r in v for ch in r if ch not in C and ch != '.'})
json.dump({'nombre': 'vecinos', 'descripcion': 'Vecinos del pueblo (lo genera arte/generar-vecinos.py; no editar a mano).',
           'colores': C, 'animaciones': anims, 'cuadros': cuadros},
          open(os.path.join(RAIZ, 'fuentes', 'vecinos.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
print('ok', len(cuadros), 'cuadros')
