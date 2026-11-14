# Convierte arte/letra.json (fuera de arte/fuentes para que no la lea el script de sprites) en las fuentes del juego:
#   juego/fuentes/estrella.ttf          (trazo de 1 pixel, para el texto)
#   juego/fuentes/estrella-gordita.ttf  (trazo de 2 pixeles, para los titulos)
# Uso: python arte/generar-fuente.py
# Un pixel = 100 unidades y el eme mide 12 pixeles: a 12px (o 24, 36...) cada pixel cae justo en pixeles de pantalla.
import json, os
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

RAIZ = os.path.dirname(os.path.abspath(__file__))
U = 100                  # unidades por pixel
FILA_BASE = 7            # la linea base queda bajo la fila 6
ASC, DESC = 10 * U, 2 * U

datos = json.load(open(os.path.join(RAIZ, 'letra.json'), encoding='utf-8-sig'))
filas = lambda s: s.split('/')

def comprobar(nombre, f):
    assert len(set(map(len, f))) == 1, 'filas de distinto ancho en ' + repr(nombre)
    assert set(''.join(f)) <= set('.#'), 'caracter raro en ' + repr(nombre)

# Glifo = (lista de pixeles (x, fila), ancho). La fila puede ser negativa (acentos de las mayusculas).
glifos = {}
for ch, s in datos['glifos'].items():
    f = filas(s)
    comprobar(ch, f)
    glifos[ch] = ([(x, y) for y, r in enumerate(f) for x, c in enumerate(r) if c == '#'], len(f[0]))

for ch, (base, acento) in datos['compuestos'].items():
    pix, ancho = glifos[base]
    a = filas(datos['acentos'][acento])
    comprobar(acento, a)
    aw = len(a[0])
    total = max(ancho, aw)
    dx_base, dx_acento = (total - ancho) // 2, (total - aw + 1) // 2
    # Minusculas: acento en las filas -1..0 (un pixel de aire sobre la x). Mayusculas: -3..-2.
    arriba = (-3 if ch.isupper() else -1) + (2 - len(a))
    pix2 = [(x + dx_base, y) for x, y in pix] + [(x + dx_acento, arriba + j) for j, r in enumerate(a) for x, c in enumerate(r) if c == '#']
    glifos[ch] = (pix2, total)

for ch, igual in datos['iguales'].items():
    glifos[ch] = glifos[igual]

def construir(nombre, archivo, gordita):
    orden = ['.notdef'] + ['u%04X' % ord(ch) for ch in glifos]
    cmap = {ord(ch): 'u%04X' % ord(ch) for ch in glifos}
    contornos, metricas = {}, {}
    pen = TTGlyphPen(None)                                          # .notdef: una cajita
    pen.moveTo((U, 0)); pen.lineTo((U, 7 * U)); pen.lineTo((5 * U, 7 * U)); pen.lineTo((5 * U, 0)); pen.closePath()
    contornos['.notdef'] = pen.glyph(); metricas['.notdef'] = (6 * U, U)
    for ch, (pix, ancho) in glifos.items():
        if gordita:
            pix = sorted(set(pix) | {(x + 1, y) for x, y in pix})
            ancho += 1
        pen = TTGlyphPen(None)
        # Tramos horizontales de pixeles seguidos: menos contornos y sin costuras.
        por_fila = {}
        for x, y in pix: por_fila.setdefault(y, []).append(x)
        for y, xs in por_fila.items():
            xs.sort()
            ini = prev = xs[0]
            for x in xs[1:] + [None]:
                if x is not None and x == prev + 1: prev = x; continue
                x0, x1, y1 = ini * U, (prev + 1) * U, (FILA_BASE - y) * U
                pen.moveTo((x0, y1 - U)); pen.lineTo((x0, y1)); pen.lineTo((x1, y1)); pen.lineTo((x1, y1 - U)); pen.closePath()
                if x is not None: ini = prev = x
        nombre_glifo = 'u%04X' % ord(ch)
        contornos[nombre_glifo] = pen.glyph()
        izq = min((x for x, _ in pix), default=0) * U
        metricas[nombre_glifo] = ((ancho + 1) * U, izq)          # un pixel de aire entre letras
    fb = FontBuilder(12 * U, isTTF=True)
    fb.setupGlyphOrder(orden)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(contornos)
    fb.setupHorizontalMetrics(metricas)
    fb.setupHorizontalHeader(ascent=ASC, descent=-DESC)
    fb.setupNameTable({'familyName': nombre, 'styleName': 'Regular'})
    fb.setupOS2(sTypoAscender=ASC, sTypoDescender=-DESC, sTypoLineGap=0, usWinAscent=ASC, usWinDescent=DESC,
                sxHeight=5 * U, sCapHeight=7 * U, achVendID='ESTR')
    fb.setupPost()
    destino = os.path.join(RAIZ, '..', 'juego', 'fuentes', archivo)
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    fb.save(destino)
    print('ok', archivo, len(glifos), 'glifos')

construir('Estrella', 'estrella.ttf', False)
construir('Estrella Gordita', 'estrella-gordita.ttf', True)
