# Genera los iconos "jugosos" de los objetos (no editar a mano los JSON que salen):
#   arte/fuentes/iconos.json       -> iconos_cultivos.png: las 9 cosechas (y semillas) de la bolsa, la tienda y el diario
#   arte/fuentes/iconos_ropa.json  -> iconos_ropa_tiles.png (bufanda, gorro, lazo) + capas lana/sombra/luz/borde que el
#                                     juego tine con el color de la lana (sombra y luz con cambio de matiz)
# Cada icono se compone de figuras (elipses, gotas y tallos) de atras hacia delante. Cada figura tiene un material: una
# rampa de 6 colores con cambio de matiz (contorno, oscuro, sombra, base, luz, brillo: las sombras tiran a morado o
# azul y las luces a amarillo). El sombreado sale de la normal de la figura con la luz arriba a la izquierda, el
# contorno es del color oscuro de su propio material (sel-out: nada de ciruela puro; en el lado iluminado se aclara),
# lo que queda delante de otra figura lleva una linea suave y lo que queda detras, sombra de contacto.
# Uso: python arte/generar-iconos.py  y luego  powershell -ExecutionPolicy Bypass -File arte/generar-sprites.ps1
import json, math, os

RAIZ = os.path.dirname(os.path.abspath(__file__))
L = (-0.55, -0.65, 0.53)
n = math.sqrt(sum(c * c for c in L)); L = tuple(c / n for c in L)

#            contorno   oscuro     sombra     base       luz        brillo
HOJA     = ['#2F5E57', '#3F7A66', '#5C9E78', '#86C47F', '#B8DE8A', '#E2F2A8']
AMARILLO = ['#A0523E', '#D17A45', '#F0A04E', '#FFD15E', '#FFE98F', '#FFFBD6']
ROJO     = ['#7A2E52', '#A63A5C', '#D4506A', '#EF6F78', '#FF9A8E', '#FFE0D2']
NARANJA  = ['#83403F', '#B5543F', '#DE7347', '#F59A50', '#FFC46B', '#FFEBB0']
ROSA     = ['#7E345A', '#B04A72', '#DE6F92', '#F59AB0', '#FFC4CF', '#FFEAF0']
CORAL    = ['#7E345A', '#B5486A', '#E06A80', '#F7909C', '#FFBFC0', '#FFE6E2']
LILA     = ['#5A4282', '#7A5CAA', '#9D80CC', '#BFA8E8', '#DCCDF7', '#F4EEFF']
BLANCO   = ['#8A76A0', '#B4A4C6', '#E0D6EA', '#F8F4FA', '#FFFFFF', '#FFFFFF']
CACAO    = ['#4A2E2E', '#6B4232', '#8A5A40', '#A8724E', '#C99468', '#E8BE8C']
CREMA    = ['#8A6A6A', '#B89A8E', '#E8D2C2', '#FFF4E0', '#FFFFFF', '#FFFFFF']
# La lana usa letras fijas (q contorno, s sombra, l base, h luz) para que el juego la tina; los colores son de muestra.
LANA     = ['q', 's', 's', 'l', 'h', 'h']
LETRAS_LANA = {'q': '#8E3B5A', 's': '#D9607E', 'l': '#F59AB0', 'h': '#FFC4CF'}


def rotar(x, y, a):
    c, s = math.cos(a), math.sin(a)
    return x * c - y * s, x * s + y * c


def elipse(cx, cy, rx, ry, mat, ang=0, punta=2.0, conico=0.0, corte=None):
    """rx = semieje largo (a lo largo de ang). punta < 2 afila las puntas; conico > 0 la estrecha hacia +x;
    corte = fila a partir de la cual se corta (gorro)."""
    a = math.radians(ang)
    def f(px, py):
        if corte is not None and py > corte: return None
        lx, ly = rotar(px - cx, py - cy, -a)
        u = lx / rx
        ancho = ry * max(0.15, 1 - conico * u)
        v = ly / ancho
        if abs(u) ** punta + v * v > 1: return None
        z = math.sqrt(max(0.0, 1 - u * u - v * v))
        nx, ny = rotar(u, v, a)
        return (nx, ny, z)
    return (f, mat)


def tallo(x0, y0, x1, y1, r, mat):
    def f(px, py):
        dx, dy = x1 - x0, y1 - y0
        t = max(0, min(1, ((px - x0) * dx + (py - y0) * dy) / (dx * dx + dy * dy)))
        ex, ey = px - (x0 + t * dx), py - (y0 + t * dy)
        d = math.hypot(ex, ey)
        if d > r: return None
        k = d / r
        if d == 0: return (0, 0, 1)
        return (ex / d * k, ey / d * k, math.sqrt(max(0, 1 - k * k)))
    return (f, mat)


def anillo(cx, cy, rx, ry, r, mat):
    """Rosquilla vista de lado (la bufanda enrollada): tubo de radio r alrededor de una elipse."""
    def f(px, py):
        t = math.atan2((py - cy) / ry, (px - cx) / rx)
        ex, ey = px - (cx + rx * math.cos(t)), py - (cy + ry * math.sin(t))
        d = math.hypot(ex, ey)
        if d > r: return None
        k = d / r
        if d == 0: return (0, 0, 1)
        return (ex / d * k, ey / d * k, math.sqrt(max(0, 1 - k * k)))
    return (f, mat)


def pintar(figuras, extra=None, tam=16):
    quien = [[None] * tam for _ in range(tam)]
    normal = [[None] * tam for _ in range(tam)]
    for i, (f, mat) in enumerate(figuras):
        for y in range(tam):
            for x in range(tam):
                nn = f(x + 0.5, y + 0.5)
                if nn: quien[y][x] = i; normal[y][x] = nn
    def de(x, y): return quien[y][x] if 0 <= x < tam and 0 <= y < tam else None
    out = [['.'] * tam for _ in range(tam)]
    for y in range(tam):
        for x in range(tam):
            i = quien[y][x]
            if i is None: continue
            mat = figuras[i][1]
            nx, ny, nz = normal[y][x]
            d = nx * L[0] + ny * L[1] + nz * L[2]
            paso = 5 if d > 0.93 else 4 if d > 0.62 else 3 if d > 0.18 else 2 if d > -0.25 else 1
            vecinos = {(dx, dy): de(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))}
            fuera = [k for k, v in vecinos.items() if v is None]
            if fuera:
                # sel-out: contorno de su color; en el lado iluminado (solo da al vacio por arriba o la izquierda) se aclara
                paso = 1 if all(k in ((-1, 0), (0, -1)) for k in fuera) and d > 0.3 else 0
            elif any(v is not None and v < i for v in vecinos.values()):
                paso = min(paso, 1)                                   # linea suave donde tapa a otra figura
            elif any(de(x + dx, y + dy) is not None and de(x + dx, y + dy) > i for dx, dy in ((-1, 0), (0, -1), (-1, -1))):
                paso = max(1, paso - 1)                               # sombra de contacto bajo lo que tiene delante
            out[y][x] = mat[paso]
    if extra: extra(out, quien, normal)
    return out


def interior(out, quien, x, y, i):
    return quien[y][x] == i and all(0 <= x + dx < 16 and 0 <= y + dy < 16 and quien[y + dy][x + dx] == i for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))


# ------------------------------------------------------------------ cosechas
def estrella():
    fig = [tallo(8.2, 9, 5.2, 15.2, 1.1, HOJA), elipse(4.4, 12.2, 3.1, 1.5, HOJA, ang=-35, punta=1.4)]
    for k in range(5):
        a = math.radians(-90 + 14 + 72 * k)
        fig.append(elipse(8.6 + math.cos(a) * 3.4, 6.6 + math.sin(a) * 3.2, 3.0, 2.0, AMARILLO, ang=math.degrees(a), punta=1.6))
    fig.append(elipse(8.6, 6.7, 1.9, 1.8, CORAL))
    return pintar(fig)


def fresa():
    fig = [elipse(8.2, 9.8, 5.6, 5.2, ROJO, ang=100, conico=0.32),
           elipse(5.6, 4.6, 2.6, 1.2, HOJA, ang=-160, punta=1.4), elipse(10.6, 4.4, 2.8, 1.2, HOJA, ang=-15, punta=1.4),
           elipse(7.4, 3.9, 2.2, 1.1, HOJA, ang=-115, punta=1.4), elipse(9.4, 5.2, 2.0, 1.0, HOJA, ang=40, punta=1.4),
           tallo(8.6, 4.2, 9.8, 0.8, 0.8, HOJA)]
    def semillas(out, quien, normal):
        for y in range(16):
            for x in range(16):
                if interior(out, quien, x, y, 0) and (x * 5 + y * 3) % 7 == 0 and (x + y) % 2 == 0:
                    nx, ny, nz = normal[y][x]
                    out[y][x] = '#FFF0A8' if nx * L[0] + ny * L[1] + nz * L[2] > 0.4 else '#E8B84F'
    return pintar(fig, semillas)


def zanahoria():
    fig = [elipse(10.8, 3.6, 3.2, 1.2, HOJA, ang=-70, punta=1.4), elipse(12.6, 4.6, 2.9, 1.1, HOJA, ang=-25, punta=1.4),
           elipse(9.0, 4.2, 2.6, 1.0, HOJA, ang=-115, punta=1.4),
           elipse(7.4, 9.4, 6.6, 2.9, NARANJA, ang=125, conico=0.75)]
    def rayas(out, quien, normal):
        for x, y in ((8, 8), (6, 11), (9, 10), (5, 13)):
            if interior(out, quien, x, y, 3): out[y][x] = NARANJA[1]
    return pintar(fig, rayas)


def calabaza():
    fig = [elipse(4.9, 10.2, 3.6, 4.3, NARANJA), elipse(11.2, 10.0, 3.6, 4.2, NARANJA),
           elipse(8.1, 10.4, 3.4, 4.6, NARANJA),
           tallo(8.0, 6.4, 9.6, 2.6, 1.2, CACAO), elipse(12.0, 3.8, 2.6, 1.3, HOJA, ang=-20, punta=1.4)]
    def zarcillo(out, quien, normal):
        for x, y in ((6, 4), (5, 3), (5, 2), (6, 1)):
            if quien[y][x] is None: out[y][x] = HOJA[2]
    return pintar(fig, zarcillo)


def tulipan():
    fig = [elipse(5.6, 11.0, 5.0, 1.7, HOJA, ang=-58, punta=1.3, conico=0.4),
           tallo(8.4, 9, 8.0, 15.6, 0.9, HOJA),
           elipse(8.8, 5.4, 4.4, 3.4, ROSA, ang=-80, punta=1.7),
           elipse(6.9, 6.5, 3.8, 2.2, ROSA, ang=-86, punta=1.5), elipse(10.4, 6.6, 3.6, 2.1, ROSA, ang=-68, punta=1.5)]
    return pintar(fig)


def girasol():
    fig = [tallo(8.0, 10, 6.4, 15.6, 1.0, HOJA), elipse(10.8, 12.6, 3.3, 1.5, HOJA, ang=28, punta=1.4)]
    for k in range(11):
        a = math.radians(360 / 11 * k + 8)
        fig.append(elipse(8.4 + math.cos(a) * 4.2, 6.4 + math.sin(a) * 3.6, 2.4, 1.3, AMARILLO, ang=math.degrees(a), punta=1.5))
    fig.append(elipse(8.4, 6.4, 3.4, 2.9, CACAO, ang=-15))
    cara = len(fig) - 1
    def pipas(out, quien, normal):
        for y in range(16):
            for x in range(16):
                if interior(out, quien, x, y, cara) and (x + y) % 2 == 0: out[y][x] = CACAO[1] if out[y][x] in (CACAO[2], CACAO[3]) else CACAO[3]
    return pintar(fig, pipas)


def lavanda():
    ramas = ((6.8, 15.6, 3.6, 5.4), (8.2, 15.6, 8.6, 2.4), (9.4, 15.6, 12.8, 6.2))
    fig = [tallo(*r, 0.6, HOJA) for r in ramas]
    for (x0, y0, x1, y1) in ramas:
        for k in range(5):
            t = 1 - k * 0.09
            fx, fy = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            fig.append(elipse(fx + (0.6 if k % 2 else -0.6), fy, 1.15, 0.95, LILA))
    fig.append(tallo(6.2, 12.2, 10.2, 12.0, 0.9, ROSA))
    return pintar(fig)


def clavel():
    fig = [tallo(8.2, 10, 8.8, 15.6, 0.9, HOJA), elipse(11.0, 13.2, 3.0, 0.9, HOJA, ang=-30, punta=1.3),
           elipse(8.0, 10.2, 2.4, 1.7, HOJA, ang=90, conico=0.5),
           elipse(8.2, 6.0, 5.4, 3.6, CORAL, ang=-8), elipse(8.6, 5.8, 3.4, 2.4, CORAL, ang=-8)]
    def flecos(out, quien, normal):                                   # borde de arriba dentado, como un clavel
        for x in range(16):
            for y in range(16):
                if quien[y][x] in (3, 4):
                    if x % 2 == 0: out[y][x] = '.'
                    break
    return pintar(fig, flecos)


def margarita():
    fig = [tallo(7.6, 10, 9.2, 15.6, 0.9, HOJA), elipse(5.8, 13.0, 2.9, 1.2, HOJA, ang=-35, punta=1.4)]
    for k in range(12):
        a = math.radians(30 * k + 10)
        fig.append(elipse(8.0 + math.cos(a) * 3.6, 6.8 + math.sin(a) * 3.0, 2.5, 1.05, BLANCO, ang=math.degrees(a), punta=1.6))
    fig.append(elipse(8.0, 6.8, 2.2, 2.0, AMARILLO))
    return pintar(fig)


# ------------------------------------------------------------------ ropa (se tine)
def gorro():
    fig = [elipse(8.0, 9.4, 6.0, 6.6, LANA, ang=-90, corte=10.4),
           tallo(2.6, 11.4, 13.4, 10.6, 1.9, LANA),
           elipse(9.8, 3.0, 2.3, 2.2, CREMA)]
    def punto(out, quien, normal):                                    # puntos de la lana en la copa y el elastico
        for y in range(16):
            for x in range(16):
                if quien[y][x] == 0 and interior(out, quien, x, y, 0) and x % 3 == 1 and y % 2 == 0: out[y][x] = 's'
                if quien[y][x] == 1 and interior(out, quien, x, y, 1) and x % 2 == 0: out[y][x] = 's'
    return pintar(fig, punto)


def lazo():
    fig = [tallo(7.2, 9, 4.8, 14.2, 1.3, LANA), tallo(8.8, 9, 11.6, 13.6, 1.3, LANA),
           elipse(4.4, 7.2, 3.8, 2.9, LANA, ang=-15), elipse(11.6, 6.6, 3.6, 2.7, LANA, ang=18),
           elipse(8.0, 7.6, 1.8, 1.9, LANA)]
    def huecos(out, quien, normal):
        for x, y in ((4, 7), (3, 7), (11, 6), (12, 6)): out[y][x] = 's'
    return pintar(fig, huecos)


def bufanda():
    # Bufanda enrollada como si acabaras de quitartela, con una punta que cae por delante (rayas crema y flecos).
    fig = [anillo(7.6, 6.4, 5.2, 3.0, 1.9, LANA), tallo(10.6, 7.6, 11.4, 13.4, 1.8, LANA)]
    def rayas(out, quien, normal):
        for y in range(16):
            for x in range(16):
                if quien[y][x] == 1 and out[y][x] in ('l', 'h') and y % 3 == 1 and y > 8: out[y][x] = CREMA[3]
        for x0, y0 in ((10, 15), (12, 15)):                           # flecos
            if out[y0][x0] == '.': out[y0][x0] = 'q'
    return pintar(fig, rayas)


def a_json(cuadros, base_letras=None):
    """Cambia los colores #hex por letras (las de la lana se quedan) y devuelve (colores, cuadros)."""
    reserva = set((base_letras or {}).keys())
    pool = [c for c in 'abcdefgijkmnoprtuvwxyz0123456789!$%&*+-=?@^~:;<>[]{}|/_' if c not in reserva]
    colores, letra = dict(base_letras or {}), {}
    salida = {}
    for nombre, filas in cuadros.items():
        nuevas = []
        for fila in filas:
            r = ''
            for ch in fila:
                if ch == '.' or ch in reserva: r += ch; continue
                if ch not in letra:
                    letra[ch] = pool.pop(0); colores[letra[ch]] = ch
                r += letra[ch]
            nuevas.append(r)
        assert len(nuevas) == 16 and all(len(x) == 16 for x in nuevas), nombre
        salida[nombre] = nuevas
    return colores, salida


if __name__ == '__main__':                                    # generar-cultivos.py importa las figuras de aqui
    cult = {k: f() for k, f in (('estrella', estrella), ('fresa', fresa), ('zanahoria', zanahoria), ('calabaza', calabaza),
                                ('tulipan', tulipan), ('girasol', girasol), ('lavanda', lavanda), ('clavel', clavel), ('margarita', margarita))}
    colores, cuadros = a_json(cult)
    json.dump({'nombre': 'iconos', 'descripcion': 'Iconos de las cosechas (lo genera arte/generar-iconos.py; no editar a mano).',
               'colores': colores, 'animaciones': {'cultivos': {'fps': 0, 'cuadros': list(cuadros)}}, 'cuadros': cuadros},
              open(os.path.join(RAIZ, 'fuentes', 'iconos.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)

    ropa = {'bufanda': bufanda(), 'gorro': gorro(), 'lazo': lazo()}
    colores, cuadros = a_json(ropa, LETRAS_LANA)
    json.dump({'nombre': 'iconos_ropa', 'descripcion': 'Iconos de las prendas (lo genera arte/generar-iconos.py; no editar a mano). La lana (q, s, l, h) la tine el juego.',
               'colores': colores, 'capas': {'lana': ['q', 's', 'l', 'h'], 'sombra': ['s'], 'luz': ['h'], 'borde': ['q']},
               'animaciones': {'tiles': {'fps': 0, 'cuadros': list(cuadros)}}, 'cuadros': cuadros},
              open(os.path.join(RAIZ, 'fuentes', 'iconos_ropa.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
    print('ok')
