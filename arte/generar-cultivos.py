# Genera arte/fuentes/cultivos.json (no editarlo a mano): las plantas del huerto en 4 etapas (brote, joven, con
# capullo o fruto verde, madura), 16x16 con el pie abajo en el centro, encima del tile de tierra. Usa las mismas figuras,
# materiales con cambio de matiz y contorno selectivo que los iconos (arte/generar-iconos.py), para que la cosecha
# del huerto y su icono se parezcan. Nada simetrico: tallos inclinados, hojas de tamanos distintos, flores giradas.
# Uso: python arte/generar-cultivos.py  y luego  powershell -ExecutionPolicy Bypass -File arte/generar-sprites.ps1
import importlib.util, json, math, os

RAIZ = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('iconos', os.path.join(RAIZ, 'generar-iconos.py'))
I = importlib.util.module_from_spec(spec); spec.loader.exec_module(I)
elipse, tallo, pintar, interior, a_json, L = I.elipse, I.tallo, I.pintar, I.interior, I.a_json, I.L
HOJA, AMARILLO, ROJO, NARANJA, ROSA, CORAL, LILA, BLANCO, CACAO = I.HOJA, I.AMARILLO, I.ROJO, I.NARANJA, I.ROSA, I.CORAL, I.LILA, I.BLANCO, I.CACAO
# En el huerto las hojas van un punto mas claras que en los iconos: sobre la tierra marron el verde oscuro se come la hoja.
HOJA   = ['#3A6A5C', '#4E8A6C', '#6FAE7E', '#96D08A', '#C2E694', '#E8F6B0']
SALVIA = ['#3E5E5E', '#557A72', '#7A9E8E', '#9FC2A8', '#C4DEC0', '#E6F2DC']     # hojas grisaceas (lavanda, clavel)
VERDE  = ['#3F6A3E', '#5A8A48', '#7FB25A', '#A8D272', '#D0EC98', '#F0FAC8']     # calabaza sin madurar
TIERRA = ['#5E3A30', '#6E4436', '#7E503C', '#93603F', '#A8724E', '#C08A60']     # montoncito al pie


def hoja(x, y, largo, ancho, ang, mat=HOJA):
    return elipse(x, y, largo, ancho, mat, ang=ang, punta=1.4)


def monton(): return elipse(8.0, 16.2, 3.4, 1.6, TIERRA)


def flor(cx, cy, n, dist, rx, ry, mat, giro=0, aplasta=1.0):
    out = []
    for k in range(n):
        a = math.radians(360 / n * k + giro)
        out.append(elipse(cx + math.cos(a) * dist, cy + math.sin(a) * dist * aplasta, rx, ry, mat, ang=math.degrees(a), punta=1.6))
    return out


BROTE = [monton(), tallo(8.0, 15.6, 8.4, 11.6, 0.7, HOJA), hoja(6.4, 11.6, 2.1, 1.0, -155), hoja(10.3, 11.0, 2.4, 1.1, -28)]


def roseta(escala=1.0, mat=HOJA):
    e = escala
    return [monton(), hoja(8.0 - 3.0 * e, 13.0, 3.2 * e, 1.7 * e, -160, mat), hoja(8.0 + 3.2 * e, 12.6, 3.4 * e, 1.8 * e, -22, mat),
            hoja(7.6, 12.0 - 1.6 * e, 2.8 * e, 1.6 * e, -100, mat), hoja(9.6, 13.8, 2.4 * e, 1.3 * e, 30, mat)]


def cultivo(id):
    """Las tres etapas propias (la primera es el brote comun)."""
    if id == 'estrella':
        return [roseta(0.9),
                roseta(1.0) + [tallo(8.0, 13, 8.8, 6.8, 0.8, HOJA), elipse(8.9, 5.8, 2.2, 1.5, AMARILLO, ang=-80, punta=1.6), hoja(8.6, 7.4, 1.4, 0.8, 160)],
                roseta(1.0) + [tallo(8.0, 13, 8.6, 7.6, 0.8, HOJA)] + flor(8.8, 5.6, 5, 2.9, 2.4, 1.6, AMARILLO, giro=-76) + [elipse(8.8, 5.7, 1.4, 1.3, CORAL)]]
    if id == 'fresa':
        hojas = [monton(), hoja(4.6, 11.6, 3.0, 1.6, -150), hoja(11.4, 11.2, 3.2, 1.7, -25), hoja(8.0, 9.4, 2.8, 1.6, -95),
                 hoja(6.0, 13.6, 2.4, 1.3, 160), hoja(10.6, 13.8, 2.6, 1.3, 20)]
        return [roseta(0.95),
                hojas + flor(10.8, 8.4, 5, 1.2, 1.2, 0.8, BLANCO) + [elipse(10.8, 8.4, 0.8, 0.8, AMARILLO)],
                hojas + [elipse(5.0, 13.0, 2.8, 2.4, ROJO, ang=100, conico=0.3), elipse(11.2, 12.6, 2.6, 2.2, ROJO, ang=80, conico=0.3),
                         hoja(5.4, 10.6, 1.2, 0.7, -90), hoja(11.0, 10.4, 1.2, 0.7, -70)]]
    if id == 'zanahoria':
        def plumas(n, alto):
            out = [monton()]
            for k in range(n):
                a = math.radians(-90 + (k - (n - 1) / 2) * (34 if n < 4 else 24) + 6)
                x1, y1 = 8.2 + math.cos(a) * alto, 14.4 + math.sin(a) * alto
                out += [tallo(8.2, 14.4, x1, y1, 0.55, HOJA), elipse(x1, y1, 1.6, 1.0, HOJA, ang=math.degrees(a), punta=1.5)]
            return out
        return [plumas(3, 4.5), plumas(5, 6.5) + [elipse(8.2, 15.4, 2.2, 1.2, NARANJA)],
                plumas(6, 8.0) + [elipse(8.3, 14.8, 2.8, 1.9, NARANJA)]]
    if id == 'calabaza':
        redonda = lambda x, y, r, ang: elipse(x, y, r, r * 0.85, HOJA, ang=ang)
        return [[monton(), tallo(8, 15.6, 8.4, 12.5, 0.7, HOJA), redonda(5.8, 11.4, 2.6, -20), redonda(10.6, 11.0, 2.8, 15)],
                [monton(), redonda(4.6, 10.2, 3.0, -20), redonda(11.6, 9.8, 3.1, 15), redonda(8.0, 8.0, 2.6, 0),
                 elipse(9.0, 13.0, 2.7, 2.3, VERDE)] + flor(5.2, 13.2, 5, 1.1, 1.2, 0.8, AMARILLO) + [elipse(5.2, 13.2, 0.7, 0.7, NARANJA)],
                [redonda(3.4, 8.6, 2.8, -20), redonda(12.8, 8.2, 2.8, 15), elipse(4.9, 12.4, 3.0, 3.2, NARANJA), elipse(11.1, 12.2, 3.0, 3.2, NARANJA),
                 elipse(8.1, 12.6, 2.9, 3.4, NARANJA), tallo(8.0, 9.4, 9.2, 7.0, 1.0, CACAO)]]
    if id == 'tulipan':
        hojas = lambda e: [monton(), elipse(6.2, 12.0, 4.4 * e, 1.5, HOJA, ang=-70, punta=1.3, conico=0.4), elipse(10.2, 12.4, 3.8 * e, 1.4, HOJA, ang=-115, punta=1.3, conico=0.4)]
        return [hojas(0.8),
                hojas(1.0) + [tallo(8.2, 14, 8.6, 6.6, 0.7, HOJA), elipse(8.7, 5.4, 2.6, 1.6, ROSA, ang=-84, punta=1.6)],
                hojas(1.0) + [tallo(8.2, 14, 8.6, 7.4, 0.7, HOJA), elipse(8.9, 4.6, 3.4, 2.7, ROSA, ang=-80, punta=1.7),
                              elipse(7.4, 5.4, 3.0, 1.8, ROSA, ang=-86, punta=1.5), elipse(10.2, 5.5, 2.8, 1.7, ROSA, ang=-68, punta=1.5)]]
    if id == 'girasol':
        bajas = [monton(), hoja(5.2, 12.6, 3.0, 1.5, -160), hoja(11.0, 13.0, 3.0, 1.4, -20)]
        return [roseta(1.05),
                bajas + [tallo(8.0, 15, 8.4, 5.0, 0.9, HOJA), hoja(10.6, 9.0, 2.6, 1.3, -30), hoja(5.8, 7.6, 2.4, 1.2, -150),
                         elipse(8.5, 4.2, 2.2, 1.8, VERDE)],
                bajas + [tallo(8.0, 15, 8.0, 7.0, 0.9, HOJA), hoja(10.8, 10.4, 2.6, 1.3, -30), hoja(5.4, 9.0, 2.4, 1.2, -150)]
                + flor(8.6, 4.4, 10, 3.2, 1.9, 1.1, AMARILLO, giro=8, aplasta=0.85) + [elipse(8.6, 4.4, 2.4, 2.1, CACAO, ang=-15)]]
    if id == 'lavanda':
        def matas(ramas, florecida):
            out = [monton()] + [tallo(*r, 0.55, SALVIA) for r in ramas]
            for (x0, y0, x1, y1) in ramas:
                for k in range(4 if florecida else 2):
                    t = 1 - k * 0.11
                    out.append(elipse(x0 + (x1 - x0) * t + (0.5 if k % 2 else -0.5), y0 + (y1 - y0) * t, 1.05, 0.9, LILA if florecida else SALVIA))
            return out
        return [[monton(), hoja(5.8, 12.4, 3.0, 0.9, -125, SALVIA), hoja(10.6, 12.2, 3.2, 0.9, -52, SALVIA), hoja(8.2, 11.0, 3.4, 0.9, -88, SALVIA)],
                matas(((7.0, 15.4, 5.0, 8.0), (8.4, 15.4, 8.8, 6.6), (9.4, 15.4, 11.6, 8.4)), False),
                matas(((6.8, 15.4, 3.8, 5.6), (8.2, 15.4, 8.6, 3.4), (9.4, 15.4, 12.8, 6.0), (7.6, 15.4, 6.2, 8.6)), True)]
    if id == 'clavel':
        hierba = [monton(), hoja(5.6, 12.6, 3.2, 0.9, -128, SALVIA), hoja(10.8, 12.8, 3.0, 0.9, -48, SALVIA), hoja(8.6, 11.4, 3.4, 0.9, -84, SALVIA)]
        return [hierba,
                hierba + [tallo(8.2, 14, 8.8, 6.4, 0.6, SALVIA), elipse(8.9, 5.4, 2.0, 1.2, SALVIA, ang=-84, conico=0.6), elipse(9.0, 3.8, 1.0, 1.0, CORAL)],
                hierba + [tallo(8.2, 14, 8.8, 7.2, 0.6, SALVIA), elipse(8.9, 6.8, 1.6, 1.2, SALVIA, ang=90, conico=0.5),
                          elipse(9.0, 4.6, 3.8, 2.6, CORAL, ang=-8), elipse(9.3, 4.4, 2.4, 1.7, CORAL, ang=-8)]]
    if id == 'margarita':
        base = roseta(0.85)
        return [roseta(0.75),
                base + [tallo(8.0, 13, 8.8, 6.8, 0.6, HOJA), elipse(8.9, 6.0, 1.4, 1.3, BLANCO), tallo(8.4, 13, 5.6, 9.6, 0.5, HOJA), elipse(5.4, 9.0, 1.0, 1.0, BLANCO)]
                + [],
                base + [tallo(8.0, 13, 9.0, 7.6, 0.6, HOJA), tallo(8.4, 13, 5.2, 9.8, 0.5, HOJA)]
                + flor(9.2, 5.8, 10, 2.5, 1.9, 0.8, BLANCO, giro=10, aplasta=0.85) + [elipse(9.2, 5.8, 1.5, 1.4, AMARILLO)]
                + flor(5.0, 9.0, 6, 1.4, 1.2, 0.6, BLANCO, giro=20) + [elipse(5.0, 9.0, 0.9, 0.9, AMARILLO)]]
    raise KeyError(id)


def detalles(id, etapa):
    """Retoques a mano tras pintar: semillas de la fresa, pipas del girasol y flecos del clavel."""
    def f(out, quien, normal):
        if id == 'fresa' and etapa == 3:
            for y in range(16):
                for x in range(16):
                    if out[y][x] in ROJO[2:] and interior(out, quien, x, y, quien[y][x]) and (x + y * 2) % 3 == 0:
                        out[y][x] = '#FFF0A8'
        if id == 'girasol' and etapa == 3:
            cara = max(i for row in quien for i in row if i is not None)
            for y in range(16):
                for x in range(16):
                    if interior(out, quien, x, y, cara) and (x + y) % 2 == 0: out[y][x] = CACAO[1]
        if id == 'clavel' and etapa == 3:
            for x in range(16):
                for y in range(16):
                    if quien[y][x] is not None and out[y][x] in CORAL:
                        if x % 2 == 0: out[y][x] = '.'
                        break
    return f


CULTIVOS = ['estrella', 'fresa', 'zanahoria', 'calabaza', 'tulipan', 'girasol', 'lavanda', 'clavel', 'margarita']
cuadros = {'brote': pintar(BROTE)}
for id in CULTIVOS:
    for etapa, figs in enumerate(cultivo(id), start=1):
        cuadros[id + str(etapa + 1)] = pintar(figs, detalles(id, etapa))
colores, cuadros = a_json(cuadros)
json.dump({'nombre': 'cultivos', 'descripcion': 'Cultivos del huerto en 4 etapas (lo genera arte/generar-cultivos.py; no editar a mano). La etapa 1 (brote) es comun.',
           'colores': colores, 'animaciones': {id: {'fps': 0, 'cuadros': ['brote'] + [id + str(k) for k in (2, 3, 4)]} for id in CULTIVOS},
           'cuadros': cuadros},
          open(os.path.join(RAIZ, 'fuentes', 'cultivos.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
print('ok', len(cuadros), 'cuadros')
