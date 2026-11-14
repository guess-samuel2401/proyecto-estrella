# Genera arte/fuentes/mar.json (tesoros de la playa, herramientas del mar y animalitos que se rescatan)
# y anade al final de fauna.json las criaturas de las pozas de marea (Brisa, la pinguina, esta en generar-vecinos.py).
# Uso: python arte/generar-mar.py  y luego  powershell -ExecutionPolicy Bypass -File arte/generar-sprites.ps1
# Los dibujos simetricos se escriben como media fila (8 caracteres) y se reflejan.
import json, os

AQUI = os.path.dirname(os.path.abspath(__file__))
FUENTES = os.path.join(AQUI, 'fuentes')


def sim(filas):
    """Media fila izquierda (8) -> fila completa simetrica (16)."""
    salida = []
    for f in filas:
        assert len(f) == 8, ('media fila de', len(f), f)
        salida.append(f + f[::-1])
    return rellenar(salida)


def rellenar(filas):
    """Completa hasta 16 filas de 16 caracteres (rellena por la derecha y por abajo)."""
    salida = []
    for f in filas:
        assert len(f) <= 16, ('fila larga', len(f), f)
        salida.append(f.ljust(16, '.'))
    while len(salida) < 16:
        salida.append('.' * 16)
    assert len(salida) == 16, len(salida)
    return salida


VACIA = '........'

# ---------- Tesoros y objetos del mar (mar_tiles) ----------
COLORES_MAR = {
    'o': '#4A3347', 'w': '#FFF4E0', 'f': '#F7A6B4', 'p': '#F28CA0', 'r': '#E87F86', 'y': '#FFE08A',
    'k': '#E8A85C', 'b': '#A9D8E8', 'd': '#8CC4DC', 's': '#DCE3EE', 'h': '#A7B3C9', 'v': '#C5B4E3',
    'l': '#E6A8D7', 'm': '#BFE3B4', 'g': '#7FBF8E', 'c': '#C98F6B', 'e': '#F5DCC0', 'i': '#3A2E6E',
    'a': '#5E7FB0', 'n': '#7C9CC9',
}

conchaRosa = sim([VACIA, VACIA, VACIA,
    '......oo',
    '....oowf',
    '...ofpfp',
    '..ofpfpf',
    '..ofpfpf',
    '..opfpfp',
    '...opfpf',
    '....opfp',
    '.....oow',
    '......ow',
    '.......o'])

caracolaEspiral = rellenar([
    '................',
    '................',
    '.........oo.....',
    '........oeko....',
    '.......oeeko....',
    '......oekkeo....',
    '.....oeekeeko...',
    '....oekeekeeeo..',
    '...oeeeekeekeeo.',
    '..offeeeeekeeeo.',
    '..offfeeeeeeko..',
    '...offffeeeoo...',
    '....ooffffo.....',
    '......oooo......',
])

cristalMar = rellenar([
    '................',
    '................',
    '................',
    '.....ooo........',
    '....ommmoo......',
    '...omwmmmgo.....',
    '...ommmmmggo....',
    '....ommmgggo....',
    '.....oggggo.ooo.',
    '......oooo.obsbo',
    '..........obbbdo',
    '...........obdo.',
    '............oo..',
])

estrellaArena = rellenar(sim([
    VACIA,
    '.......o',
    '......ok',
    '......ok',
    'ooooooky',
    '.okkkkkk',
    '..okkwky',
    '...okkkk',
    '....okkk',
    '....okkk',
    '...okkko',
    '...okko.',
    '..okko..',
    '..ooo...']))

perla = sim([VACIA, VACIA, VACIA, VACIA,
    '......oo',
    '.....oww',
    '....owwy',
    '....owws',
    '....owss',
    '.oo..oss',
    '.ovooooo',
    '.ovlvvvv',
    '..ovvlvv',
    '...ooooo'])
# La perla negra: el mismo dibujo con la perla oscura y un brillo azulado.
perlaNegra = [f[:16] for f in perla]
for j in range(4, 10):
    perlaNegra[j] = perlaNegra[j].replace('w', 'a').replace('s', 'i').replace('y', 'n')

monedaAntigua = sim([VACIA, VACIA,
    '.....ooo',
    '...ookyy',
    '..okywyy',
    '..okyykk',
    '.okyykyy',
    '.okyykyy',
    '.okyykyy',
    '..okyykk',
    '..okyyyy',
    '...ookyy',
    '.....ooo'])

fragmentoCoral = rellenar([
    '................',
    '................',
    '...o.....o......',
    '..ofo...ofo..o..',
    '..oro...oro.ofo.',
    '...oro.oro..oro.',
    '....orooro.oro..',
    '.o...orrro.oro..',
    'ofo..orrrooro...',
    '.oro.orfrrro....',
    '..oroorrrro.....',
    '...orrrrro......',
    '....orrro.......',
    '....orrro.......',
    '....ooooo.......',
])

botella = rellenar([
    '................',
    '..........oo....',
    '.........occo...',
    '.........oco....',
    '........obbo....',
    '.......obsbbo...',
    '......obwwsbo...',
    '.....obwwwwbo...',
    '....obswwwbo....',
    '...obbswwbo.....',
    '..obbbsbbo......',
    '..obbbbbo.......',
    '...obbbo........',
    '....ooo.........',
])

gafas = rellenar([
    '.............oo.',
    '............oyo.',
    '............oyo.',
    '............oyo.',
    '..oooooooooooyo.',
    '.oppppppppppoyo.',
    '.opbsbbppbsbbpoo',
    '.opbbbbppbbbbpo.',
    '.opbbbbppbbbbpo.',
    '..opbbo..obbpo..',
    '...ooo....ooo...',
])

cubo = sim([VACIA, VACIA,
    '....oooo',
    '...o....',
    '..o.....',
    '.ooooooo',
    '.owppppp',
    '..ofpppp',
    '..ofpppp',
    '..ofppyy',
    '..ofppyy',
    '...ofppp',
    '...ofppp',
    '...ooooo'])

carta = sim([VACIA, VACIA, VACIA, VACIA,
    '.ooooooo',
    '.owwwwww',
    '.oowwwww',
    '.owoowww',
    '.owwwoow',
    '.owwwwpr',
    '.owwwwwp',
    '.owwwwww',
    '.ooooooo'])

foca = rellenar([
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '....ooo.........',
    '...ossso........',
    '..osossso.......',
    '..ossssssoooo...',
    '.oofssssssssoo..',
    '.osssssssssssso.',
    '..oossssssssooso',
    '....ooohsssohso.',
    '.......oooooooo.',
])

ostra = sim([VACIA, VACIA, VACIA, VACIA, VACIA, VACIA, VACIA,
    '....oooo',
    '..oovhvh',
    '.ovhvvhv',
    '.ohvvvvv',
    'oooooooo',
    '.ovvvvvv',
    '..oooooo'])

MAR = [
    ('conchaRosa', conchaRosa), ('caracolaEspiral', caracolaEspiral), ('cristalMar', cristalMar),
    ('estrellaArena', estrellaArena), ('perla', perla), ('perlaNegra', perlaNegra),
    ('monedaAntigua', monedaAntigua), ('fragmentoCoral', fragmentoCoral), ('botella', botella),
    ('gafas', gafas), ('cubo', cubo), ('carta', carta), ('foca', foca), ('ostra', ostra),
]

# ---------- Criaturas de las pozas de marea (al final de fauna.json, miran a la izquierda) ----------
anemona = sim([VACIA, VACIA, VACIA,
    '..o..o..',
    '.ofo.ofo',
    '.ofoofpo',
    '..ofpfpo',
    '..offppp',
    '...opppp',
    '...orrrr',
    '...orwrr',
    '..orrrrr',
    '..oooooo'])

bigaro = rellenar([
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '........ooo.....',
    '......oonnnoo...',
    '.o...onaaannno..',
    '.so..onannanno..',
    '..so.onaanaano..',
    '..osooonnnnnoo..',
    '..osssssssssso..',
    '...ooooooooooo..',
])

blenio = rellenar([
    '................',
    '................',
    '................',
    '................',
    '................',
    '.....o.o.o.o....',
    '....ooooooooo...',
    '...okekkekkeko.o',
    '..owoekkkkkkkoko',
    '..ooekekkekekkko',
    '.okkkkkkkkkkkoko',
    '..oeeeeeeeeeoo.o',
    '...ooooooooo....',
])

nudibranquio = rellenar([
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '..k.k.......k.k.',
    '..okok...okokok.',
    '.ovvvvoooovvvvo.',
    'ovwovvvvvvvvvvvo',
    '.ovvvvvvvvvvvvo.',
    '..ollllllllllo..',
    '...oooooooooo...',
])
FAUNA_POZA = [('anemona', anemona), ('bigaro', bigaro), ('blenio', blenio), ('nudibranquio', nudibranquio)]

# ---------- Brisa, la pinguina (dibujo antiguo, ya no se usa: ahora la dibuja generar-vecinos.py) ----------
pinguina = sim([
    VACIA,
    '.....ooo',
    '....oaaa',
    '...oaaaa',
    '...oawww',
    '..oawoww',
    '..oawfwk',
    '..oaawww',
    '..obbbbb',
    '.oaabdbb',
    '.oaawwww',
    'oaaowwww',
    'oao.owww',
    '....owww',
    '...okkoo',
    '...ooo..'])


def main():
    # mar.json
    mar = {
        'nombre': 'mar',
        'colores': COLORES_MAR,
        'animaciones': {'tiles': {'fps': 0, 'cuadros': [n for n, _ in MAR]}},
        'cuadros': {n: d for n, d in MAR},
    }
    with open(os.path.join(FUENTES, 'mar.json'), 'w', encoding='utf-8') as f:
        json.dump(mar, f, ensure_ascii=False, indent=1)

    # fauna.json: anade (o actualiza) las criaturas de las pozas al final de la tira.
    ruta = os.path.join(FUENTES, 'fauna.json')
    fauna = json.load(open(ruta, encoding='utf-8'))
    lista = fauna['animaciones']['tiles']['cuadros']
    for n, d in FAUNA_POZA:
        fauna['cuadros'][n] = d
        if n not in lista:
            lista.append(n)
    json.dump(fauna, open(ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    print('ok:', len(MAR), 'objetos del mar y', len(FAUNA_POZA), 'criaturas de poza (Brisa la dibuja generar-vecinos.py)')


if __name__ == '__main__':
    main()
