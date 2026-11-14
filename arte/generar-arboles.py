# Genera arte/fuentes/arboles.json: copas y troncos de 32x32 para tres especies de arbol.
# Las copas se hacen con racimos (circulos) sombreados con la luz arriba a la izquierda:
#   contorno ciruela solo por fuera, y por dentro los racimos de delante se separan con el tono de sombra.
# Uso: python arte/generar-arboles.py
import json, math, os

N = 32
RAIZ = os.path.dirname(os.path.abspath(__file__))


def copa_racimos(circulos, salpicar=None):
    """circulos: lista (cx, cy, r) de atras hacia delante. salpicar: (letra, probabilidad) para flores o frutas."""
    duenio = [[-1] * N for _ in range(N)]
    for y in range(N):
        for x in range(N):
            for i, (cx, cy, r) in enumerate(circulos):
                if (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r:
                    duenio[y][x] = i          # el ultimo que lo contiene es el de delante
    return pintar(duenio, lambda x, y, i: luz_circulo(x, y, circulos[i]), salpicar)


def luz_circulo(x, y, c):
    cx, cy, r = c
    nx, ny = (x + 0.5 - cx) / r, (y + 0.5 - cy) / r
    d = -0.7 * nx - 0.7 * ny                  # hacia la luz (arriba a la izquierda)
    return 'l' if d > 0.52 else 's' if d < -0.3 else 'g'


def copa_pino(pisos):
    """pisos: lista (y0, y1, ancho_base) de abajo (atras) hacia arriba (delante)."""
    duenio = [[-1] * N for _ in range(N)]
    for i, (y0, y1, w) in enumerate(pisos):
        for y in range(y0, y1 + 1):
            media = 1 + w * (y - y0) / max(1, y1 - y0)
            for x in range(N):
                # el borde de abajo de cada piso es en dientes de sierra, como ramas
                if abs(x + 0.5 - 16) <= media and not (y == y1 and x % 4 < 2):
                    duenio[y][x] = i

    def luz(x, y, i):
        y0, y1, w = pisos[i]
        media = 1 + w * (y - y0) / max(1, y1 - y0)
        t = (x + 0.5 - 16) / media
        return 's' if t > 0.3 else 'l' if t < -0.45 else 'g'
    return pintar(duenio, luz)


def pintar(duenio, luz, salpicar=None):
    filas = []
    for y in range(N):
        fila = ''
        for x in range(N):
            i = duenio[y][x]
            if i < 0:
                fila += '.'
                continue
            vecinos = [duenio[y + dy][x + dx] if 0 <= y + dy < N and 0 <= x + dx < N else -1
                       for dx, dy in ((0, -1), (1, 0), (0, 1), (-1, 0))]
            if -1 in vecinos:
                fila += 'o'                    # contorno solo por fuera
            elif any(v > i for v in vecinos):
                fila += 's'                    # borde de un racimo de delante
            else:
                ch = luz(x, y, i)
                if salpicar and ch != 's':
                    h = math.sin(x * 12.9898 + y * 78.233) * 43758.5453
                    if h - math.floor(h) < salpicar[1]:
                        ch = salpicar[0]
                fila += ch
        filas.append(fila)
    return filas


def tronco(desde):
    """Tronco centrado (columnas 13-18) desde la fila 'desde' hasta abajo, con dos raices."""
    filas = [['.'] * N for _ in range(N)]
    for y in range(desde, N - 1):
        for x in range(13, 19):
            filas[y][x] = 'o' if x in (13, 18) else 'k' if x == 14 else 't' if x == 17 else 'h'
    # raices que se abren
    filas[N - 3][12] = 'o'; filas[N - 3][19] = 'o'
    filas[N - 2][11] = 'o'; filas[N - 2][12] = 'h'; filas[N - 2][13] = 'h'
    filas[N - 2][18] = 't'; filas[N - 2][19] = 't'; filas[N - 2][20] = 'o'
    for x in range(11, 21):
        filas[N - 1][x] = 'o'
    return [''.join(f) for f in filas]


REDONDO = [(16, 10, 8.5), (8.5, 14, 6.5), (23.5, 14, 6.5), (12, 18, 6), (20.5, 18.5, 6)]
CEREZO = [(16, 9, 8), (9, 13, 6.5), (23, 12.5, 6.5), (11.5, 18, 6.5), (21, 18, 6.5)]
PINO = [(11, 25, 11), (6, 19, 9.5), (1, 12, 7)]

doc = {
    'nombre': 'arboles',
    'descripcion': 'Arboles de 32x32 (2x2 casillas): copas que se mecen con el viento y troncos fijos. '
                   'Generado por generar-arboles.py; no editar a mano.',
    'colores': {
        'o': '#4A3347',
        # verde del arbol redondo y del pino: luz hacia amarillo, sombra hacia azul
        'l': '#B8E0A0', 'g': '#7FBF8E', 's': '#5C9C90',
        # cerezo
        'L': '#FFE1E8', 'G': '#F7B3C2', 'S': '#D98FB4',
        # flores y frutas
        'w': '#FFF4E0', 'r': '#E87F86',
        # tronco: luz, base y sombra
        'k': '#B07A5A', 'h': '#8A5A44', 't': '#6E4636',
    },
    'animaciones': {
        'tiles': {'fps': 0, 'cuadros': ['redondo', 'redondoFrutas', 'cerezo', 'pino', 'tronco', 'troncoPino']},
    },
    'cuadros': {},
}
c = doc['cuadros']
c['redondo'] = copa_racimos(REDONDO)
c['redondoFrutas'] = copa_racimos(REDONDO, ('r', 0.05))
cerezo = copa_racimos(CEREZO, ('w', 0.07))
c['cerezo'] = [f.replace('l', 'L').replace('g', 'G').replace('s', 'S') for f in cerezo]
c['pino'] = copa_pino(PINO)
c['tronco'] = tronco(18)
c['troncoPino'] = tronco(23)

# El generador de PNG no distingue mayusculas: las letras del cerezo se renombran a otras libres.
cambio = {'L': 'a', 'G': 'b', 'S': 'c'}
for k in ('L', 'G', 'S'):
    doc['colores'][cambio[k]] = doc['colores'].pop(k)
c['cerezo'] = [''.join(cambio.get(ch, ch) for ch in f) for f in c['cerezo']]

with open(os.path.join(RAIZ, 'fuentes', 'arboles.json'), 'w', encoding='utf-8') as f:
    json.dump(doc, f, ensure_ascii=False, indent=2)
print('Generado: arboles.json')
