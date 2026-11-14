// Proyecto Estrella - prototipo: caminar, cultivar, pescar, tejer, decorar y coleccionar.
'use strict';

const T = 16;                       // tamano de un tile en pixeles
const VELOCIDAD = 48;               // pixeles por segundo
const CORRER = 1.75;                // multiplica la velocidad mientras se mantiene Mayus
const TIEMPO_PARA_ATRAPAR = 2;      // segundos para pulsar Espacio cuando pica un pez
const ACIERTOS_PESCA = 4;           // aciertos en la barra para sacar la criatura
// Minijuegos con cuenta atras (se puede quitar en Ajustes): equivocarse resta un poquito de tiempo.
const TIEMPO_PESCA = 8;             // segundos para sacar la criatura con la barra
const TIEMPO_TEJER_BASE = 3;        // segundos de margen al tejer...
const TIEMPO_PUNTO = 1.1;           // ...mas estos por cada punto
const CASTIGO_FALLO = 1.5;          // segundos que se restan al equivocarse
const CLAVE_RETO = 'proyecto-estrella-reto';
let conTiempo = (() => { try { return localStorage.getItem(CLAVE_RETO) !== 'no'; } catch (e) { return true; } })();
const PUNTOS_BUFANDA = 8;           // puntos (flechas) para tejer una bufanda
const RUTA = '../arte/sprites/';

const COLOR = { cacao: '#8A5A44', cielo: '#A9D8E8', ciruela: '#4A3347', crema: '#FFF4E0', rosa: '#F7A6B4', mantequilla: '#FFE08A', algodon: '#FFE3EA', salvia: '#7FBF8E' };

// ---------- Colecciones: rarezas, fauna marina y cultivos ----------

// "peso" es la probabilidad base de cada rareza al pescar (sobre 100).
const RAREZAS = [
  { nombre: 'Común',      color: '#7FBF8E', peso: 60 },
  { nombre: 'Poco común', color: '#8CC4DC', peso: 25 },
  { nombre: 'Raro',       color: '#B49AE0', peso: 10 },
  { nombre: 'Épico',      color: '#F28CA0', peso: 4 },
  { nombre: 'Legendario', color: '#E8A85C', peso: 1 },
];
const MEJORA_POR_PERFECTO = 0.5;    // cada acierto en el centro sube un 50 % las rarezas altas
const BRILLO_PESCA = 0.02;          // probabilidad base de que una criatura salga brillante
const BRILLO_POR_PERFECTO = 0.03;   // ...mas esto por cada acierto en el centro
const BRILLO_CULTIVO = 0.06;        // probabilidad de cosecha brillante

// Cada agua del valle es una zona con sus criaturas. Las casillas de agua saben su zona (se reparte al crear el mundo).
const ZONAS = { estanque: 'el estanque del jardín', lago: 'el lago del muelle', rio: 'el río', escondido: 'el estanque escondido', laguna: 'la laguna del sur',
  mar: 'la orilla del mar', alta: 'alta mar (pescando desde la barca)', poza: 'las pozas de marea de la playa' };
const zonaAgua = {};
const zonaDe = (c, f) => zonaAgua[c + ',' + f] || 'estanque';

// El orden es el de la tira fauna_tiles.png. r = rareza (indice en RAREZAS).
const FAUNA = [
  { id: 'pezRosa',          nombre: 'Pez rosado',                r: 0, zonas: ['estanque', 'lago', 'laguna', 'escondido'] },
  { id: 'pezPayaso',        nombre: 'Pez payaso',                r: 0, zonas: ['estanque', 'lago', 'laguna', 'mar'] },
  { id: 'cangrejo',         nombre: 'Cangrejo',                  r: 0, zonas: ['estanque', 'laguna', 'rio', 'mar', 'poza'] },
  { id: 'estrellaMar',      nombre: 'Estrella de mar',           r: 0, zonas: ['lago', 'laguna', 'mar', 'poza'] },
  { id: 'pezGlobo',         nombre: 'Pez globo',                 r: 1, zonas: ['estanque', 'lago', 'laguna', 'mar'] },
  { id: 'medusa',           nombre: 'Medusa',                    r: 1, zonas: ['lago', 'mar'] },
  { id: 'caballito',        nombre: 'Caballito de mar',          r: 1, zonas: ['estanque', 'laguna'] },
  { id: 'pulpo',            nombre: 'Pulpo',                     r: 2, zonas: ['lago', 'laguna', 'mar', 'poza'] },
  { id: 'tortuga',          nombre: 'Tortuga marina',            r: 2, zonas: ['estanque', 'laguna'] },
  { id: 'caballitoExotico', nombre: 'Caballito de mar exótico',  r: 3, zonas: ['laguna'] },
  { id: 'tiburon',          nombre: 'Tiburoncito',               r: 3, zonas: ['lago'] },
  { id: 'ballena',          nombre: 'Ballena',                   r: 4, zonas: ['lago', 'alta'] },
  { id: 'camaron',          nombre: 'Camarón',                   r: 0, zonas: ['estanque', 'laguna', 'rio', 'mar'] },
  { id: 'caracola',         nombre: 'Caracola',                  r: 0, zonas: ['estanque', 'lago', 'laguna', 'escondido', 'mar'] },
  { id: 'pezAngel',         nombre: 'Pez ángel',                 r: 1, zonas: ['lago', 'laguna'] },
  { id: 'anguila',          nombre: 'Anguila',                   r: 1, zonas: ['estanque', 'lago', 'rio', 'escondido'] },
  { id: 'mantarraya',       nombre: 'Mantarraya',                r: 2, zonas: ['lago', 'alta'] },
  { id: 'langosta',         nombre: 'Langosta',                  r: 2, zonas: ['estanque', 'laguna', 'mar'] },
  { id: 'delfin',           nombre: 'Delfín',                    r: 3, zonas: ['lago', 'laguna', 'mar', 'alta'] },
  { id: 'narval',           nombre: 'Narval',                    r: 4, zonas: ['laguna', 'alta'] },
  // Solo salen los dias de lluvia.
  { id: 'pezGota',          nombre: 'Pez gota',                  r: 1, zonas: ['estanque', 'lago', 'laguna', 'rio', 'escondido'], lluvia: true },
  { id: 'ajolote',          nombre: 'Ajolote',                   r: 2, zonas: ['estanque', 'laguna', 'escondido'], lluvia: true },
  { id: 'pezArcoiris',      nombre: 'Pez arcoíris',              r: 3, zonas: ['lago', 'laguna', 'rio'], lluvia: true },
  // Agua dulce: el rio y el estanque escondido tienen criaturas que no salen en ningun otro sitio.
  { id: 'pececillo',        nombre: 'Pececillo plateado',        r: 0, zonas: ['rio'] },
  { id: 'trucha',           nombre: 'Trucha moteada',            r: 1, zonas: ['rio'] },
  { id: 'koi',              nombre: 'Carpa koi',                 r: 2, zonas: ['escondido'] },
  { id: 'pezLuna',          nombre: 'Pez luna',                  r: 3, zonas: ['escondido'] },
  { id: 'dragoncito',       nombre: 'Dragoncito de estanque',    r: 4, zonas: ['escondido'] },
  { id: 'nutria',           nombre: 'Nutria',                    r: 2, zonas: ['rio'] },
  // El mar del sur: en la orilla se pesca desde la playa o el embarcadero; en alta mar, solo desde la barca.
  { id: 'erizoMar',         nombre: 'Erizo de mar',              r: 0, zonas: ['mar'] },
  { id: 'cangrejoErmitano', nombre: 'Cangrejo ermitaño',         r: 1, zonas: ['mar', 'poza'] },
  { id: 'sardina',          nombre: 'Sardina plateada',          r: 0, zonas: ['alta'] },
  { id: 'pezVolador',       nombre: 'Pez volador',               r: 0, zonas: ['alta'] },
  { id: 'atun',             nombre: 'Atún',                      r: 1, zonas: ['alta'] },
  { id: 'pezLinterna',      nombre: 'Pez linterna',              r: 1, zonas: ['alta'] },
  { id: 'calamar',          nombre: 'Calamar',                   r: 1, zonas: ['alta'] },
  { id: 'pezEspada',        nombre: 'Pez espada',                r: 2, zonas: ['alta'] },
  { id: 'tiburonMartillo',  nombre: 'Tiburón martillo',          r: 2, zonas: ['alta'] },
  { id: 'rape',             nombre: 'Rape abisal',               r: 2, zonas: ['alta'] },
  { id: 'granTiburon',      nombre: 'Gran tiburón blanco',       r: 3, zonas: ['alta'] },
  { id: 'pulpoDumbo',       nombre: 'Pulpo dumbo',               r: 3, zonas: ['alta'] },
  { id: 'calamarGigante',   nombre: 'Calamar gigante',           r: 4, zonas: ['alta'] },
  { id: 'tiburonBallena',   nombre: 'Tiburón ballena',           r: 4, zonas: ['alta'] },
  // Pozas de marea de la playa: no se pescan; se encuentran asomandose a una poza (una vez al dia cada una).
  { id: 'anemona',          nombre: 'Anémona',                   r: 0, zonas: ['poza'] },
  { id: 'bigaro',           nombre: 'Bígaro',                    r: 0, zonas: ['poza'] },
  { id: 'blenio',           nombre: 'Blenio de poza',            r: 1, zonas: ['poza'] },
  { id: 'nudibranquio',     nombre: 'Nudibranquio',              r: 2, zonas: ['poza'] },
];
// seg = segundos que tarda en crecer una etapa estando regado.
const CULTIVOS = [
  { id: 'estrella',  nombre: 'Flor estrella', seg: 6 },
  { id: 'fresa',     nombre: 'Fresa',         seg: 6 },
  { id: 'zanahoria', nombre: 'Zanahoria',     seg: 4 },
  { id: 'calabaza',  nombre: 'Calabaza',      seg: 9 },
  { id: 'tulipan',   nombre: 'Tulipán',       seg: 5 },
  { id: 'girasol',   nombre: 'Girasol',       seg: 7 },
  { id: 'lavanda',   nombre: 'Lavanda',       seg: 6 },
  { id: 'clavel',    nombre: 'Clavel',        seg: 5 },
  { id: 'margarita', nombre: 'Margarita',     seg: 4 },
];

// Aguacate malvado: a veces pica en vez de una criatura (en cualquier agua, con lluvia o sin ella).
// No es una criatura: sirve de abono y hace crecer de golpe una etapa lo que esta plantado y regado.
const AGUACATE = { id: 'aguacate', nombre: 'Aguacate malvado', zonas: Object.keys(ZONAS) };
const PROB_AGUACATE = 0.08;
// Fosiles del mar: ademas de cavar en la playa, a veces se enganchan al anzuelo pescando en el mar.
const FOSILES_MAR = ['amonites', 'pezPiedra', 'caballitoFosil'], PROB_FOSIL = 0.05;
// Cebo brillante (se compra en la tiendecita): al lanzar la cana se gasta uno; pica antes y cuenta como
// CEBO.perfectos aciertos en el centro mas (criaturas mas raras y mas brillantes).
const CEBO = { id: 'cebo', nombre: 'Cebo brillante', perfectos: 2 };
// Madera: la dan los arboles al talarlos con el hacha y con ella se construyen los muebles de madera.
const TRONQUITO = { id: 'tronquito', nombre: 'Tronquitos de madera', n: 26 };
const TRONQUITOS_POR_ARBOL = [2, 3];      // minimo y maximo que suelta un arbol
// Tesoros del mar: no son criaturas (no van en peceras ni se pescan). n = cuadro de mar_tiles, r = rareza.
// Salen en la orilla cada manana, en las ostras del fondo, en cofres y como regalo de los animalitos rescatados.
const TESOROS_MAR = [
  { id: 'conchaRosa',      nombre: 'Concha rosada',     r: 0, n: 0, texto: 'La marea la deja en la orilla casi todas las mañanas.', pista: 'Dicen que la marea deja conchas en la orilla de la playa cada mañana.' },
  { id: 'estrellaArena',   nombre: 'Estrella de arena', r: 0, n: 3, texto: 'Una estrellita seca y dorada que aparece en la arena de la playa.', pista: 'Busca por la arena de la playa del sur, sobre todo por la mañana.' },
  { id: 'caracolaEspiral', nombre: 'Caracola espiral',  r: 1, n: 1, texto: 'Si te la acercas a la oreja, suena el mar. A veces la deja la marea donde hubo un castillo de arena.', pista: 'La marea a veces la deja en la orilla… sobre todo donde hubo un castillo de arena muy bonito.' },
  { id: 'cristalMar',      nombre: 'Cristal de mar',    r: 1, n: 2, texto: 'Trocitos de cristal que el mar ha pulido durante muchos años.', pista: 'Aparece de vez en cuando en la orilla de la playa, brillando al sol.' },
  { id: 'fragmentoCoral',  nombre: 'Ramita de coral',   r: 1, n: 7, texto: 'Se planta en el jardín de coral del fondo del mar.', pista: 'Sale en las ostras del fondo del mar y, muy de vez en cuando, en la orilla.' },
  { id: 'monedaAntigua',   nombre: 'Moneda antigua',    r: 2, n: 6, texto: 'Una moneda de un barco de hace muchísimo tiempo.', pista: 'Dicen que hay tesoros enterrados: las botellas con mensaje traen mapas.' },
  { id: 'perla',           nombre: 'Perla',             r: 3, n: 4, texto: 'Redondita y suave. Queda preciosa en una vitrina.', pista: 'Las ostras del fondo del mar a veces guardan una.' },
  { id: 'perlaNegra',      nombre: 'Perla negra',       r: 4, n: 5, texto: 'Rarísima: brilla con reflejos azules.', pista: 'Muy, muy de vez en cuando aparece dentro de una ostra del fondo.' },
];
// Tesoros de la tierra: se desentierran con la pala en los montoncitos del valle (n = cuadro de excavar_tiles).
// Tambien son 'tesoro': se venden a Bellota y los raros se lucen en la vitrina. Pagina 'Tesoros y fosiles' del diario.
const TESOROS_TIERRA = [
  { id: 'fosilHoja',       nombre: 'Hoja fosilizada',     r: 0, n: 5,  texto: 'Una hojita que se quedó dormida en la piedra hace muchísimo tiempo.', pista: 'Sale cavando en los montoncitos de tierra, sobre todo en el bosque.' },
  { id: 'piedraCorazon',   nombre: 'Piedra corazón',      r: 0, n: 6,  texto: 'El río la ha ido puliendo hasta dejarla con forma de corazón.', pista: 'Aparece al cavar en cualquier montoncito del valle.' },
  { id: 'maderaAntigua',   nombre: 'Madera antigua',      r: 0, n: 7,  texto: 'Tablillas oscuras que huelen a barco viejo. Dan un tinte cacao precioso.', pista: 'Sale al cavar, sobre todo en el bosque.' },
  { id: 'amonites',        nombre: 'Caracola de piedra',  r: 1, n: 8,  texto: 'Un fósil en espiral: una caracola de cuando el valle era mar.', pista: 'Se esconde bajo la arena de la playa y en los montoncitos del prado.' },
  { id: 'cuarzoRosa',      nombre: 'Cuarzo rosa',         r: 1, n: 9,  texto: 'Cristalitos rosados que brillan con el sol de la tarde.', pista: 'Sale al cavar en cualquier parte del valle.' },
  { id: 'semillaOlvidada', nombre: 'Semilla olvidada',    r: 1, n: 10, texto: 'Alguien la plantó hace siglos y nunca brotó. En una maceta despierta y brilla de noche.', pista: 'Sale cavando en el bosque y en el prado.' },
  { id: 'pezPiedra',       nombre: 'Pez de piedra',       r: 2, n: 11, texto: 'El esqueleto de un pececito antiquísimo, dormido en una losa.', pista: 'Se esconde bajo la arena de la playa.' },
  { id: 'jadeMenta',       nombre: 'Jade menta',          r: 2, n: 12, texto: 'Una gema verde menta. Molida, tiñe la lana de color menta.', pista: 'Sale al cavar, mejor con una pala buena.' },
  { id: 'planoPirata',     nombre: 'Plano pirata',        r: 2, n: 13, texto: 'Instrucciones dibujadas a mano para construir un baúl pirata.', pista: 'Los piratas escondían cosas en la arena de la playa…' },
  { id: 'topacioCielo',    nombre: 'Topacio cielo',       r: 3, n: 14, texto: 'Una gema del color del cielo de las mañanas de verano.', pista: 'Muy de vez en cuando, al cavar. Acertar en el centro dorado ayuda.' },
  { id: 'huevoDragoncito', nombre: 'Huevo de dragoncito', r: 3, n: 15, texto: 'Un huevo de piedra con motitas. Dicen que dentro duerme un dragoncito.', pista: 'Los tesoros que encuentra Pipí, el radar, suelen ser de los buenos.' },
  { id: 'caballitoFosil',  nombre: 'Caballito de mar antiguo', r: 3, n: 24, texto: 'Un caballito de mar de cuando el valle era océano, dormido en una losa rosada. Brilla como el nácar.', pista: 'Bajo la arena de la playa… o enganchado al anzuelo pescando en el mar.' },
  { id: 'estrellaCaida',   nombre: 'Estrella caída',      r: 4, n: 16, texto: 'Una estrellita que se cayó del cielo una noche y se quedó a vivir aquí.', pista: 'Rarísima: quizá la encuentres con la pala de estrella o con Pipí.' },
];
const EXCAVAR = { radar: 4, sitioPrado: 18, sitioBosque: 19, sitioPlaya: 20, sitioLluvia: 21, hoyo: 22 };   // otros cuadros de excavar_tiles
const MAR_TILES = { estrella: 3, botella: 8, gafas: 9, cubo: 10, carta: 11, foca: 12, ostra: 13 };   // otros dibujos de mar_tiles

// Un objeto del inventario es el id de su especie; con '*' al final es su version brillante y con '~', la
// luminiscente (solo criaturas, de noche: cuerpo oscuro con motitas de neon, ver luminosa()).
const esBrillante = id => id.endsWith('*');
const esLuminoso = id => id.endsWith('~');
const esVariante = id => esBrillante(id) || esLuminoso(id);
const especie = id => id.replace(/[*~]$/, '');
// Los vecinos no piden lo que solo se pesca desde la barca (no todo el mundo tiene una).
const sinBarca = a => a.zonas.some(z => z !== 'alta');
const PROB_LUMINOSO = 0.15;         // de noche, probabilidad de que la criatura salga luminiscente
const LUMINOSO_POR_PERFECTO = 0.04;
function ficha(id) {
  const base = especie(id);
  const nF = FAUNA.findIndex(a => a.id === base);
  if (nF >= 0) return { ...FAUNA[nF], tipo: 'fauna', img: 'fauna_tiles', n: nF };
  const cu = CULTIVOS.find(a => a.id === base);
  if (cu) return { ...cu, tipo: 'cultivo', img: 'iconos_cultivos', n: CULTIVOS.indexOf(cu), r: -1 };
  if (base === AGUACATE.id) return { ...AGUACATE, tipo: 'abono', img: 'aguacate_tiles', n: 0, r: -1 };
  if (base === CEBO.id) return { ...CEBO, tipo: 'cebo', img: 'tienda_tiles', n: 0, r: -1 };
  if (base === TRONQUITO.id) return { ...TRONQUITO, tipo: 'material', img: 'excavar_tiles', r: -1 };
  const te = TESOROS_MAR.find(a => a.id === base);
  if (te) return { ...te, tipo: 'tesoro', img: 'mar_tiles' };
  const tt = TESOROS_TIERRA.find(a => a.id === base);
  if (tt) return { ...tt, tipo: 'tesoro', img: 'excavar_tiles' };
  const prenda = PRENDAS.find(a => a.id === base);
  return { id: base, nombre: prenda ? prenda.nombre : base, tipo: 'otro', r: -1 };
}
const nombreDe = id => ficha(id).nombre + (esBrillante(id) ? ' brillante' : esLuminoso(id) ? ' luminiscente' : '');

// Sorteo de la criatura que pica, segun la zona y los aciertos perfectos en la barra.
function sortearCriatura(zona, perfectos) {
  const pesos = RAREZAS.map((r, i) => r.peso * (i >= 2 ? 1 + MEJORA_POR_PERFECTO * perfectos : 1));
  let x = Math.random() * pesos.reduce((a, b) => a + b, 0), nivel = 0;
  while (nivel < pesos.length - 1 && x >= pesos[nivel]) { x -= pesos[nivel]; nivel++; }
  // Si en esta zona no vive nada de esa rareza, sale algo de la rareza inferior.
  for (; nivel >= 0; nivel--) {
    let candidatas = FAUNA.filter(a => a.r === nivel && a.zonas.includes(zona) && (!a.lluvia || llueve()));
    // Con lluvia, la mitad de las veces sale una criatura de lluvia si hay alguna de esa rareza.
    const deLluvia = candidatas.filter(a => a.lluvia);
    if (deLluvia.length && Math.random() < 0.5) candidatas = deLluvia;
    if (candidatas.length) {
      const elegida = candidatas[Math.floor(Math.random() * candidatas.length)].id;
      // La cana de la suerte dobla la probabilidad de brillante.
      const brilla = Math.random() < (BRILLO_PESCA + BRILLO_POR_PERFECTO * perfectos) * (estado.herramientas.cana ? 2 : 1);
      // De noche algunas criaturas brillan en la oscuridad, con motitas de colores.
      const luce = !brilla && oscuridad(estado.hora) > 0.5 && Math.random() < PROB_LUMINOSO + LUMINOSO_POR_PERFECTO * perfectos;
      return elegida + (brilla ? '*' : luce ? '~' : '');
    }
  }
  return 'pezRosa';
}

// ---------- Recetas: tintes y muebles ----------
// Un coste es { id, n? } (n de ese objeto exacto, 1 si no se dice), { grupo: 'criatura' } (cualquier criatura marina normal)
// o { grupo: 'tesoro' } (algo brillante, epico o legendario).

function buscar(coste) {
  if (coste.tienda) return null;      // eso no se construye: se compra en la tiendecita
  const inv = estado.inv;
  if (coste.id) return inv[coste.id] >= (coste.n || 1) ? coste.id : null;
  const mios = Object.keys(inv).filter(id => inv[id] > 0);
  if (coste.grupo === 'criatura') {
    return mios.filter(id => !esVariante(id) && ficha(id).tipo === 'fauna').sort((a, b) => ficha(a).r - ficha(b).r)[0] || null;
  }
  // tesoro: primero lo menos valioso (cultivo brillante, luego criatura brillante, luego epico/legendario)
  const valor = id => (esVariante(id) ? 0 : 10) + Math.max(0, ficha(id).r);
  return mios.filter(id => esVariante(id) || ficha(id).r >= 3).sort((a, b) => valor(a) - valor(b))[0] || null;
}

const TINTES = [
  { coste: { id: 'estrella' },      color: '#FFE08A', texto: 'flor estrella (amarilla)' },
  { coste: { id: 'fresa' },         color: '#E87F86', texto: 'fresa (coral)' },
  { coste: { id: 'zanahoria' },     color: '#F2A65A', texto: 'zanahoria (naranja)' },
  { coste: { id: 'calabaza' },      color: '#7FBF8E', texto: 'calabaza (verde)' },
  { coste: { grupo: 'criatura' },   color: '#A9D8E8', texto: 'criatura marina (azul)' },
  { coste: { id: 'lavanda' },       color: '#C5B4E3', texto: 'lavanda (lila)' },
  { coste: { id: 'clavel' },        color: '#F7A6B4', texto: 'clavel (rosa)' },
  { coste: { id: 'margarita' },     color: '#FFF4E0', texto: 'margarita (blanco)' },
  { coste: { id: 'maderaAntigua' }, color: '#B98A6E', texto: 'madera antigua (cacao)' },
  { coste: { id: 'jadeMenta' },     color: '#9ED9C5', texto: 'jade menta (menta)' },
];
const MUEBLES = [
  { id: 'maceta', nombre: 'Maceta de flor estrella', coste: { id: 'estrella' },    texto: '1 flor estrella' },
  { id: 'valla',  nombre: 'Valla',                   coste: { id: 'tronquito', n: 2 }, texto: '2 tronquitos de madera' },
  { id: 'banco',  nombre: 'Banco',                   coste: { id: 'tronquito', n: 2 }, texto: '2 tronquitos de madera' },
  { id: 'cojin',  nombre: 'Cojín',                   coste: { id: 'bufanda' },     texto: '1 bufanda' },
  { id: 'farol',  nombre: 'Farol estrella',          coste: { grupo: 'tesoro' },   texto: 'algo brillante, épico o legendario' },
  { id: 'mesa',           nombre: 'Mesa',            coste: { id: 'tronquito', n: 2 }, texto: '2 tronquitos de madera' },
  { id: 'espantapajaros', nombre: 'Espantapájaros',  coste: { id: 'calabaza' },  texto: '1 calabaza' },
  { id: 'jarron',         nombre: 'Jarrón de tulipanes', coste: { id: 'tulipan' }, texto: '1 tulipán' },
  { id: 'molinillo',      nombre: 'Molinillo de viento', coste: { id: 'girasol' }, texto: '1 girasol' },
  { id: 'pecera',         nombre: 'Pecera',          coste: { grupo: 'criatura' }, texto: '1 criatura marina, que vivirá dentro', expone: 'fauna' },
  // De aqui en adelante: ancho/alto en casillas (1 si no se dice), capa 'suelo' = se pisa y admite un mueble encima,
  // grande = cuadro en muebles_grandes_tiles (32x32), icono = cuadro en muebles_tiles para paneles y bolsa.
  // luz = altura en pixeles (desde lo alto de su casilla) del punto que brilla de noche.
  { id: 'alfombra',       nombre: 'Alfombra rosa',   coste: { id: 'lazo' }, texto: '1 lazo tejido', ancho: 2, alto: 2, capa: 'suelo', grande: 0, icono: 11 },
  { id: 'alfombraRayas',  nombre: 'Alfombra de rayas', coste: { id: 'bufanda' }, texto: '1 bufanda tejida', ancho: 2, alto: 2, capa: 'suelo', grande: 1, icono: 12 },
  { id: 'lavandaMaceta',  nombre: 'Lavanda en maceta', coste: { id: 'lavanda' }, texto: '1 lavanda', icono: 13 },
  { id: 'margaritas',     nombre: 'Jarrón de margaritas', coste: { id: 'margarita' }, texto: '1 margarita', grande: 2, icono: 14 },
  { id: 'lampara',        nombre: 'Lámpara de pie',  coste: { id: 'gorro' }, texto: '1 gorro tejido (será la pantalla)', grande: 3, icono: 15, luz: -2 },
  { id: 'calabazaLuz',    nombre: 'Farolillo de calabaza', coste: { id: 'calabaza' }, texto: '1 calabaza', icono: 16, luz: 11 },
  { id: 'puf',            nombre: 'Puf de lana',     coste: { id: 'gorro' },   texto: '1 gorro tejido', icono: 17 },
  { id: 'sillon',         nombre: 'Sillón de lectura', coste: { id: 'lavanda' }, texto: '1 lavanda (para el tapizado)', icono: 18 },
  { id: 'camaMascota',    nombre: 'Camita para mascota', coste: { id: 'bufanda' }, texto: '1 bufanda tejida', icono: 19 },
  // capa 'pared': se cuelgan en la fila de abajo de la pared de casa (no en las ventanas).
  { id: 'cuadro',         nombre: 'Cuadro del valle', coste: { id: 'estrella' }, texto: '1 flor estrella', icono: 20, capa: 'pared' },
  { id: 'estante',        nombre: 'Estante con cositas', coste: { id: 'tronquito' }, texto: '1 tronquito de madera', icono: 21, capa: 'pared' },
  { id: 'guirnalda',      nombre: 'Guirnalda de estrellas', coste: { id: 'girasol' }, texto: '1 girasol', icono: 22, capa: 'pared', luz: 5 },
  { id: 'relojPared',     nombre: 'Reloj de pared',  coste: { id: 'tulipan' }, texto: '1 tulipán', icono: 23, capa: 'pared' },
  // Expositores: expone = que se pone dentro ('fauna' o 'tesoro'), huecos = cuantos caben, cristal = cuadro que va
  // por delante y hueco = rectangulo (dentro del cuadro 32x32) donde se ve lo de dentro.
  { id: 'peceraGrande',   nombre: 'Pecera grande',   coste: { grupo: 'criatura' }, texto: '1 criatura marina (caben tres)', ancho: 2, grande: 4, cristal: 5, icono: 24,
    expone: 'fauna', huecos: 3, hueco: { x: 1, y: 12, w: 30, h: 14 } },
  { id: 'vitrina',        nombre: 'Vitrina',         coste: { grupo: 'tesoro' }, texto: 'algo brillante, épico o legendario, que se lucirá dentro', grande: 6, cristal: 7, icono: 25,
    expone: 'tesoro', hueco: { x: 11, y: 12, w: 10, h: 11 } },
  // Solo se compran en la tiendecita del pueblo (coste.tienda: no se construyen).
  { id: 'osito',          nombre: 'Osito de peluche', coste: { tienda: true }, texto: 'comprarlo en la tiendecita del pueblo', icono: 26 },
  { id: 'teterita',       nombre: 'Teterita de flores', coste: { tienda: true }, texto: 'comprarla en la tiendecita del pueblo', icono: 27 },
  { id: 'lamparaSeta',    nombre: 'Lámpara de seta', coste: { tienda: true }, texto: 'comprarla en la tiendecita del pueblo', icono: 28, luz: 4 },
  // Mas cositas para el hogar.
  { id: 'silla',          nombre: 'Silla con cojín',   coste: { id: 'tronquito' }, texto: '1 tronquito de madera', icono: 29 },
  { id: 'comoda',         nombre: 'Cómoda',            coste: { id: 'tronquito', n: 3 }, texto: '3 tronquitos de madera', icono: 30 },
  { id: 'mesilla',        nombre: 'Mesita de noche',   coste: { id: 'tronquito' }, texto: '1 tronquito de madera', icono: 31 },
  { id: 'manta',          nombre: 'Mantas de cuadros', coste: { id: 'bufanda' },   texto: '1 bufanda tejida', icono: 32 },
  { id: 'cestoOvillos',   nombre: 'Cesto de ovillos',  coste: { id: 'lazo' },      texto: '1 lazo tejido', icono: 33 },
  { id: 'espejo',         nombre: 'Espejo redondo',    coste: { id: 'caracola' },  texto: '1 caracola (para el marco)', icono: 34, capa: 'pared' },
  { id: 'plantaColgante', nombre: 'Planta colgante',   coste: { id: 'lavanda' },   texto: '1 lavanda', icono: 35, capa: 'pared' },
  { id: 'cactus',         nombre: 'Cactus en flor',    coste: { id: 'girasol' },   texto: '1 girasol', icono: 36 },
  { id: 'helecho',        nombre: 'Helecho grande',    coste: { id: 'clavel' },    texto: '1 clavel', icono: 37 },
  { id: 'velas',          nombre: 'Velitas',           coste: { id: 'tulipan' },   texto: '1 tulipán', icono: 38, luz: 4 },
  // Jardin y exterior: hoja 'jardin' = icono en jardin_tiles y grande en jardin_grandes. fuera = solo fuera de casa.
  // asiento = la gatita se puede sentar (como en los bancos del pueblo); chorro = fuente con gotas animadas; pajaros = los visitan de dia.
  { id: 'arbusto',        nombre: 'Arbusto redondo',   coste: { id: 'margarita' }, texto: '1 margarita', hoja: 'jardin', icono: 0, fuera: true },
  { id: 'arbustoCorazon', nombre: 'Arbusto corazón',   coste: { id: 'fresa' },     texto: '1 fresa', hoja: 'jardin', icono: 1, fuera: true },
  { id: 'hortensia',      nombre: 'Hortensias',        coste: { id: 'lavanda' },   texto: '1 lavanda', hoja: 'jardin', icono: 2, fuera: true },
  { id: 'macizo',         nombre: 'Macizo de flores',  coste: { id: 'tulipan' },   texto: '1 tulipán', hoja: 'jardin', icono: 3, fuera: true },
  { id: 'caminoPiedras',  nombre: 'Piedras de camino', coste: { tienda: true }, texto: 'comprarlas en la tiendecita del pueblo', hoja: 'jardin', icono: 4, fuera: true, capa: 'suelo' },
  { id: 'farolJardin',    nombre: 'Farolillo de jardín', coste: { id: 'girasol' }, texto: '1 girasol (guarda la luz del sol)', hoja: 'jardin', icono: 5, fuera: true, luz: 4 },
  { id: 'casitaPajaros',  nombre: 'Casita de pájaros', coste: { id: 'tronquito' }, texto: '1 tronquito de madera', hoja: 'jardin', icono: 6, fuera: true, pajaros: true },
  { id: 'bebedero',       nombre: 'Bebedero de pájaros', coste: { id: 'caracola' }, texto: '1 caracola', hoja: 'jardin', icono: 7, fuera: true, pajaros: true },
  { id: 'conejoPiedra',   nombre: 'Conejito de piedra', coste: { tienda: true }, texto: 'comprarlo en la tiendecita del pueblo', hoja: 'jardin', icono: 8, fuera: true },
  { id: 'setaJardin',     nombre: 'Seta de jardín',    coste: { id: 'clavel' },    texto: '1 clavel', hoja: 'jardin', icono: 9, fuera: true },
  { id: 'fuenteJardin',   nombre: 'Fuente de piedra',  coste: { tienda: true }, texto: 'comprarla en la tiendecita del pueblo', hoja: 'jardin', icono: 10, grande: 0, ancho: 2, alto: 2, fuera: true, chorro: true },
  { id: 'bancaJardin',    nombre: 'Banca de jardín',   coste: { id: 'tronquito', n: 3 }, texto: '3 tronquitos de madera', hoja: 'jardin', icono: 11, grande: 1, ancho: 2, fuera: true, asiento: true },
  { id: 'pozo',           nombre: 'Pozo de los deseos', coste: { tienda: true }, texto: 'comprarlo en la tiendecita del pueblo', hoja: 'jardin', icono: 12, grande: 2, ancho: 2, fuera: true },
  { id: 'mesaPicnic',     nombre: 'Mesa de picnic',    coste: { id: 'tronquito', n: 3 }, texto: '3 tronquitos de madera', hoja: 'jardin', icono: 13, grande: 3, ancho: 2, fuera: true },
  // Flores y plantas. mece = fila del dibujo por encima de la cual se mece con el viento (la maceta se queda quieta);
  // flores = vienen mariposas de dia; petalos = sueltan algun petalo; lluvia/noche = cuadro que se usa con lluvia o de noche.
  { id: 'rosal',          nombre: 'Rosal',             coste: { id: 'clavel' },    texto: '1 clavel', hoja: 'jardin', icono: 14, fuera: true, mece: 9, flores: true },
  { id: 'nomeolvides',    nombre: 'Nomeolvides',       coste: { id: 'margarita' }, texto: '1 margarita', hoja: 'jardin', icono: 15, fuera: true, mece: 10, flores: true },
  { id: 'lirios',         nombre: 'Lirios',            coste: { id: 'estrella' },  texto: '1 flor estrella', hoja: 'jardin', icono: 16, fuera: true, mece: 8, flores: true },
  { id: 'tulipanesMaceta', nombre: 'Tulipanes en maceta', coste: { id: 'tulipan' }, texto: '1 tulipán (se cierran de noche)', hoja: 'jardin', icono: 17, fuera: true, mece: 9, flores: true, noche: 18, lluvia: 18 },
  { id: 'lavandaJardinera', nombre: 'Jardinera de lavanda', coste: { id: 'lavanda' }, texto: '1 lavanda', hoja: 'jardin', icono: 19, fuera: true, mece: 9, flores: true },
  { id: 'bonsai',         nombre: 'Bonsái',            coste: { tienda: true }, texto: 'comprarlo en la tiendecita del pueblo', hoja: 'jardin', icono: 20, fuera: true, mece: 7 },
  { id: 'cerezoMaceta',   nombre: 'Cerezo en maceta',  coste: { tienda: true }, texto: 'comprarlo en la tiendecita del pueblo', hoja: 'jardin', icono: 21, fuera: true, mece: 10, petalos: true },
  { id: 'monstera',       nombre: 'Planta de hojas grandes', coste: { tienda: true }, texto: 'comprarla en la tiendecita del pueblo', hoja: 'jardin', icono: 22, fuera: true, mece: 11 },
  { id: 'brote',          nombre: 'Brotecito',         coste: { id: 'zanahoria' }, texto: '1 zanahoria', hoja: 'jardin', icono: 23, fuera: true, mece: 11 },
  { id: 'regadera',       nombre: 'Regadera rosa',     coste: { tienda: true }, texto: 'comprarla en la tiendecita del pueblo', hoja: 'jardin', icono: 24, fuera: true },
  { id: 'girasoles',      nombre: 'Girasoles',         coste: { id: 'girasol' },   texto: '1 girasol (agachan la cabeza de noche y con lluvia)', hoja: 'jardin', icono: 25, grande: 4, fuera: true, mece: 22, flores: true, noche: 5, lluvia: 5 },
  { id: 'celosia',        nombre: 'Celosía con rosas', coste: { id: 'fresa' },     texto: '1 fresa', hoja: 'jardin', icono: 26, grande: 6, ancho: 2, fuera: true, flores: true },
  { id: 'sombrilla',      nombre: 'Mesita con sombrilla', coste: { tienda: true }, texto: 'comprarla en la tiendecita del pueblo (se cierra si llueve)', hoja: 'jardin', icono: 27, grande: 7, ancho: 2, fuera: true, lluvia: 8 },
  // Lo que sale de cavar (dibujos en excavar_tiles).
  { id: 'baulPirata',     nombre: 'Baúl pirata',     coste: { id: 'planoPirata' },     texto: '1 plano pirata', hoja: 'excavar', icono: 17 },
  { id: 'macetaOlvidada', nombre: 'Maceta olvidada', coste: { id: 'semillaOlvidada' }, texto: '1 semilla olvidada', hoja: 'excavar', icono: 23, luz: 3 },
];
// Las primeras plantas de jardin tambien se mecen.
for (const [id, fila] of [['arbusto', 9], ['arbustoCorazon', 10], ['hortensia', 9], ['macizo', 9]]) MUEBLES.find(m => m.id === id).mece = fila;
for (const id of ['hortensia', 'macizo']) MUEBLES.find(m => m.id === id).flores = true;
// Peceras: la criatura que vive en cada una se dibuja nadando entre el cuadro de la pecera y su cristal.
const PECERA = MUEBLES.findIndex(m => m.id === 'pecera'), CRISTAL = 10;   // cuadros en muebles_tiles

// Reformas de la casa: suelos (casa_suelos_tiles) y papeles pintados (casa_papeles_tiles, 16x32), en el orden de su tira.
// tinte = son neutros y se tinen con multiply del color elegido; los colores son los de TINTES ya descubiertos.
const SUELOS = [
  { id: 'madera',   nombre: 'Madera miel' },
  { id: 'parquet',  nombre: 'Parqué' },
  { id: 'baldosas', nombre: 'Baldosas', tinte: true },
  { id: 'tablas',   nombre: 'Tablas pintadas', tinte: true },
];
const PAPELES = [
  { id: 'rayas', nombre: 'Rayas' }, { id: 'lunares', nombre: 'Lunares' }, { id: 'florecitas', nombre: 'Florecitas' },
  { id: 'cuadritos', nombre: 'Cuadritos' }, { id: 'lisa', nombre: 'Lisa' },
];
const NATURAL = { pared: '#FFF4E0', suelo: '#F2D8C0' };   // color sin tinte
const MEZCLA_SUELO = '#DDB896';                           // la pared siempre mas clara que el suelo
const iconoMueble = n => MUEBLES[n].icono ?? n;
// Tiras de dibujos de un mueble: los de jardin tienen las suyas.
const tiraMueble = n => MUEBLES[n].hoja === 'jardin' ? 'jardin_tiles' : MUEBLES[n].hoja === 'excavar' ? 'excavar_tiles' : 'muebles_tiles';
const tiraGrande = n => MUEBLES[n].hoja === 'jardin' ? 'jardin_grandes' : 'muebles_grandes_tiles';
// Lo que hay dentro de un expositor (estado.peceras guarda un id, null o, si caben varios, una lista).
const contenidoDe = valor => [].concat(valor || []).filter(Boolean);
function devolverContenido(valor) {
  const ids = contenidoDe(valor);
  for (const id of ids) estado.inv[id] = (estado.inv[id] || 0) + 1;
  if (ids.length) avisar(ids.length === 1 ? nombreDe(ids[0]) + ' ha vuelto a la bolsa' : ids.length + ' cosas han vuelto a la bolsa', ids[0]);
}
const tamanoMueble = n => ({ ancho: MUEBLES[n].ancho || 1, alto: MUEBLES[n].alto || 1 });
const esDeSuelo = n => MUEBLES[n].capa === 'suelo';
const esDePared = n => MUEBLES[n].capa === 'pared';
// Prendas que se tejen en la cesta de casa. n = dibujo en ropa_tiles.png (la bufanda va en los dibujos de la gatita).
const PRENDAS = [
  { id: 'bufanda', nombre: 'Bufanda', puntos: 8 },
  { id: 'gorro',   nombre: 'Gorro',   puntos: 10, n: 0 },
  { id: 'lazo',    nombre: 'Lazo',    puntos: 6,  n: 1 },
];

// Vecinos: viven en el pueblo y esto es lo que suelen pedir. El orden es el de la tira vecinos_tiles.png.
// Casillas del pueblo (columna y fila dentro de el): hogar = su casita (3x2), casa = donde esperan junto a su puerta
// por la manana y de noche, plaza = donde pasean por la tarde. Su sitio de ahora esta en c y f (ver situarVecinos).
const VECINOS = [
  { id: 'conejo', nombre: 'Copito', quien: 'Conejito · Pueblo Algodón',  hogar: { c: 22, f: 3 }, casa: { c: 24, f: 5 }, plaza: { c: 28, f: 19 }, tejado: ['#C9A7D8', '#B48FC6'], simbolo: 'zanahoria', flores: '#F28CA0',
    pide: () => ({ id: alAzar(CULTIVOS).id, n: 2 + Math.floor(Math.random() * 2) }) },
  { id: 'rana',   nombre: 'Nenúfar', quien: 'Ranita · Pueblo Algodón', hogar: { c: 38, f: 5 }, casa: { c: 40, f: 7 }, plaza: { c: 14, f: 29 }, tejado: ['#F5B78E', '#E89F74'], simbolo: 'gota', flores: '#C9A7D8',
    pide: () => ({ id: alAzar(FAUNA.filter(a => a.r <= 1 && sinBarca(a))).id, n: 1 + Math.floor(Math.random() * 2) }) },
  { id: 'oso',    nombre: 'Miel', quien: 'Osito · Pueblo Algodón',    hogar: { c: 6, f: 5 },  casa: { c: 8, f: 7 },  plaza: { c: 20, f: 19 }, tejado: ['#FFD27A', '#E8A85C'], simbolo: 'corazon', flores: '#FFE08A',
    pide: () => Math.random() < 0.5 ? { id: alAzar(FAUNA.filter(a => a.r === 2 && sinBarca(a))).id, n: 1 } : { id: alAzar(CULTIVOS).id, n: 3 } },
  // Brisa, la pinguina, vive en el valle (valle: true: sus casillas son del valle), en su caseta de la playa del sur.
  { id: 'pinguina', nombre: 'Brisa', quien: 'Pingüina · la playa', valle: true, hogar: { c: 43, f: 44 }, casa: { c: 45, f: 46 }, plaza: { c: 50, f: 46 }, tejado: ['#A9D8E8', '#7C9CC9'], simbolo: 'gota', flores: '#A9D8E8',
    pide: () => Math.random() < 0.5 ? { id: alAzar(TESOROS_MAR.filter(t => t.r <= 1)).id, n: 1 + Math.floor(Math.random() * 2) }
      : { id: alAzar(FAUNA.filter(a => a.r <= 1 && a.zonas.some(z => z === 'mar' || z === 'poza'))).id, n: 1 } },
];
// Herramientas: regalo especial de cada vecino al llegar a CORAZONES_HERRAMIENTA corazones.
const HERRAMIENTAS = {
  regadera: { nombre: 'Regadera grande',   texto: 'Riega también las casillas de alrededor', vecino: 'conejo' },
  cana:     { nombre: 'Caña de la suerte', texto: 'Pican antes y salen más criaturas brillantes', vecino: 'rana' },
  mapa:     { nombre: 'Mapa del valle',    texto: 'Pulsa N para ver el mapa', vecino: 'oso' },
  // Se compran en la tiendecita (tienda: true); icono = cuadro de tienda_tiles.
  flotador: { nombre: 'Flotador rosa',     texto: 'Con él puedes meterte en el agua y nadar', tienda: true, icono: 2 },
  barca:    { nombre: 'Barquita',          texto: 'Te espera amarrada en el embarcadero de la playa: con ella se pesca en alta mar y se llega a los islotes', tienda: true, icono: 3 },
  cubo:     { nombre: 'Cubo de playa',     texto: 'Los castillos de arena crecen el doble de rápido y en las pozas aparecen criaturas más raras', vecino: 'pinguina' },
  // img: tira del icono si no es tienda_tiles.
  gafas:    { nombre: 'Gafas de bucear',   texto: 'Donde salen burbujas en el mar puedes sumergirte hasta el fondo', tienda: true, icono: MAR_TILES.gafas, img: 'mar_tiles' },
  // Palas (cada una mejora la anterior; ver MEJORAS_PALA) y Pipi, el radar de tesoros escondidos.
  palaMadera:   { nombre: 'Pala de madera',      texto: 'Con ella se cava en los montoncitos de tierra que brillan por el valle', tienda: true, icono: 0, img: 'excavar_tiles' },
  palaCobre:    { nombre: 'Pala de cobre',       texto: 'Pesa menos y cansa menos: la tierra blanda del minijuego es más ancha', tienda: true, icono: 1, img: 'excavar_tiles' },
  palaRosa:     { nombre: 'Pala de cuarzo rosa', texto: 'Corta la tierra como si fuera mantequilla: hay una capa menos que cavar', tienda: true, icono: 2, img: 'excavar_tiles' },
  palaEstrella: { nombre: 'Pala de estrella',    texto: 'Desentierra tesoros más raros y, a veces, ¡dos de golpe!', tienda: true, icono: 3, img: 'excavar_tiles' },
  hacha:        { nombre: 'Hacha de leñadora',   texto: 'Tala los árboles del valle para hacer sitio en tu jardín', tienda: true, icono: 25, img: 'excavar_tiles' },
  radar:        { nombre: 'Pipí, el radar',      texto: 'Pita cuando hay un tesoro escondido sin marca cerca: cuanto más rosa, más caliente', tienda: true, icono: EXCAVAR.radar, img: 'excavar_tiles' },
};
const iconoHerramienta = h => ({ tira: img[h.img || 'tienda_tiles'], n: h.icono });
const CORAZONES_HERRAMIENTA = 2;
const alAzar = lista => lista[Math.floor(Math.random() * lista.length)];
const ENTREGAS_POR_CORAZON = 2, MAX_CORAZONES = 5;

// Dia y noche: un dia completo dura CICLO segundos. hora va de 0 (amanecer) a 1.
const CICLO = 480;
const suave = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const oscuridad = h => suave(0.60, 0.70, h) - suave(0.93, 1, h);                    // 0 de dia, 1 de noche
const calidez = h => Math.max(0, 1 - Math.abs(h - 0.61) / 0.08, 1 - Math.abs(h - 0.975) / 0.04);   // atardecer y amanecer
const momento = h => h >= 0.95 ? 'Amanecer' : h >= 0.68 ? 'Noche' : h >= 0.55 ? 'Atardecer' : 'Día';

// Clima: cada dia nuevo se sortea si llueve. La lluvia riega sola, trae criaturas propias,
// cambia la musica y hace que tejer en casa cueste la mitad de puntos.
const PROB_LLUVIA = 0.25;
const llueve = () => estado.clima === 'lluvia';
function nuevoDia() {
  const antes = estado.clima;
  estado.clima = Math.random() < PROB_LLUVIA ? 'lluvia' : 'sol';
  Sonido.lluvia(llueve());
  if (llueve() && antes !== 'lluvia') avisar('Hoy amanece lloviendo: el huerto se riega solo y quizá piquen criaturas nuevas');
  else if (!llueve() && antes === 'lluvia') avisar('Ha parado de llover. ¡Qué bien huele el valle!');
  estado.dia++;
  prepararMar();
  prepararExcavar();
}

const FLECHAS = { ArrowUp: 0, KeyW: 0, ArrowRight: 1, KeyD: 1, ArrowDown: 2, KeyS: 2, ArrowLeft: 3, KeyA: 3 };
const NUMEROS = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'];   // el 0 es la opcion 10

// ---------- El mundo ----------
// Tiles: G cesped, F cesped con flores, T tierra de cultivo, W agua, C camino, M muelle y B puente (se pisan, sobre el agua).
// El mapa se construye con formas sencillas y un "azar" fijo, asi siempre sale igual.
// El valle mide 80x56: el jardin de siempre esta en el centro, con el lago del muelle al oeste,
// el bosque y su estanque escondido al norte, el rio al este (con su puente) y la laguna al sur.
const ANCHO = 80, ALTO = 56;
const INICIO = { c: 32, f: 23 };    // donde empieza la gatita
const CASA = { c: 31, f: 20, puerta: { c: 32, f: 21 } };   // la casita ocupa 3x2 casillas; la puerta esta abajo en el centro
// El interior de la casa vive en el mismo mapa, debajo del valle (desde la fila f0).
// La pared mide 2 filas: la de arriba queda debajo del reloj y los iconos del HUD, sin tapar nada del suelo.
const F_CASA = ALTO + 2;
const INTERIOR = { f0: F_CASA, ancho: 15, alto: 10, pared: 2, salida: { c: 7, f: F_CASA + 9 }, cama: { c: 2, f: F_CASA + 2 }, armario: { c: 12, f: F_CASA + 2 }, ventanas: [5, 10] };
const CESTAS = [{ c: 4, f: F_CASA + 2 }];          // la cesta de lana: solo dentro de casa, junto a la cama (ahi se teje)
const esCesta = (c, f) => CESTAS.some(k => k.c === c && k.f === f);
// Sitios del valle (en casillas).
const LAGO = { c: 14, f: 12, muelle: { c: 14, f0: 13, f1: 18 } };   // el muelle sale de la orilla sur hacia el centro del lago
const ESCONDIDO = { c: 38, f: 5 };                                   // estanque del claro del bosque
const BANCAL = { c0: 59, f0: 36, c1: 63, f1: 39 };                   // bancales junto al rio: se riegan solos
const enBancal = (c, f) => c >= BANCAL.c0 && c <= BANCAL.c1 && f >= BANCAL.f0 && f <= BANCAL.f1;
// El mar del sur: costaEn(c) = primera fila de agua de esa columna (la orilla ondula). Encima hay playa (Y).
// Del camino sale el embarcadero (muelle M) y la barca se amarra en AMARRE, junto a su punta.
const ondaCosta = u => Math.sin(u * 0.35) * 0.8 + Math.sin(u * 0.13 + 1) * 1.2;
const costaEn = c => 48 + Math.round(ondaCosta(c));
// La misma orilla, pero continua y en pixeles (para dibujarla sin escalones): fila y de la orilla en la columna px.
const curvaCosta = px => Math.round((48 + ondaCosta(px / T - 0.5)) * T);
const EMBARCADERO = { c: 40, punta: 52 };
const AMARRE = { c: EMBARCADERO.c + 1, f: EMBARCADERO.punta };
const enMar = (c, f) => zonaAgua[c + ',' + f] === 'mar';
const rioEn = f => 57 + Math.round(3 * Math.sin(f / 7));            // columna central del rio en cada fila
const RIO = new Set();              // casillas del cauce (el agua corre hacia abajo)
const PUENTE_F = 30;                // fila del puente que cruza el rio hacia el este
const PROFUNDO = new Set();         // agua honda del lago (mas oscura)
const nenufares = [];               // { x, y, flor } sobre el estanque del jardin y el escondido
const juncos = [];                  // { x, y } en la orilla de la laguna y del lago
// Islotes del mar del sur (arena en medio del agua, con forma de elipse dentro de su rectangulo): el del faro y el
// de la palmera (con su cofre). Se llega en barca (se puede bajar en cualquier orilla) o nadando con el flotador.
const ISLOTES = [
  { id: 'faro', nombre: 'el islote del faro', c: 10, f: 52, ancho: 5, alto: 3 },
  { id: 'palmera', nombre: 'el islote de la palmera', c: 63, f: 52, ancho: 6, alto: 3 },
];
const isloteEn = (c, f) => ISLOTES.find(i => (((c + 0.5) - (i.c + i.ancho / 2)) / (i.ancho / 2)) ** 2 + (((f + 0.5) - (i.f + i.alto / 2)) / (i.alto / 2)) ** 2 <= 1);
const ROCAS_FOCAS = { c: 26, f: 53 };                              // rocas (2x1) donde toman el sol las focas
const SITIOS_BUCEO = [{ c: 33, f: 54 }, { c: 52, f: 53 }];         // burbujas en el mar: ahi se puede bucear
const COFRE = { c: 0, f: 0 };                                     // cofre del islote de la palmera (lo coloca adornosMar)
const POZAS = [], OSTRAS = [], PARCELAS_CORAL = [];               // pozas de marea (2x1), ostras y parcelas de coral del fondo

// ---------- El pueblo ----------
// Pueblo Algodon: otro mapa, en sus propias filas debajo de la casa. Se llega por el camino del este:
// cruza el puente, sube hacia el norte y pasa bajo el arco de flores (ARCO). Se vuelve por el arco de abajo.
// Todo lo del pueblo se escribe en casillas del pueblo y se pasa al MAPA con enPuebloA(c, f).
const PUEBLO = { f0: F_CASA + 12, ancho: 48, alto: 36, nombre: 'Pueblo Algodón' };
const enPuebloA = (c, f) => ({ c, f: PUEBLO.f0 + f });
const ARCO = { c: 70, f: 3 };                       // al pisar esta fila del camino del valle se va al pueblo (el arco esta justo debajo)
const LLEGADA_PUEBLO = enPuebloA(24, 32);           // donde aparece la gatita en el pueblo
const SALIDA_PUEBLO = enPuebloA(24, PUEBLO.alto - 1);   // al pisar esta fila del pueblo se vuelve al valle
const LLEGADA_VALLE = { c: ARCO.c, f: ARCO.f + 3 };
// El fondo del mar: otra parte del mapa, debajo del pueblo. Se baja buceando (con las gafas) donde salen burbujas.
// U arena del fondo, R roca (no se pisa), Q parcela del jardin de coral.
const FONDO = { f0: PUEBLO.f0 + PUEBLO.alto + 2, ancho: 30, alto: 18, nombre: 'el fondo del mar' };
const enFondoA = (c, f) => ({ c, f: FONDO.f0 + f });
const LLEGADA_FONDO = enFondoA(14, 3);
// Partes del mapa: cada una tiene su camara y sus reglas (dentro de casa no llueve, en el pueblo no hay huerto...).
const REGIONES = [
  { id: 'valle', f0: 0, ancho: ANCHO, alto: ALTO },
  { id: 'casa', f0: INTERIOR.f0, ancho: INTERIOR.ancho, alto: INTERIOR.alto },
  { id: 'pueblo', f0: PUEBLO.f0, ancho: PUEBLO.ancho, alto: PUEBLO.alto },
  { id: 'fondo', f0: FONDO.f0, ancho: FONDO.ancho, alto: FONDO.alto },
];
const regionDe = f => REGIONES.find(r => f >= r.f0 && f < r.f0 + r.alto) || REGIONES[0];
const bajoAgua = f => regionDe(f).id === 'fondo';
const enPueblo = f => regionDe(f).id === 'pueblo';
// Cosas fijas del pueblo (y del camino): se dibujan ordenadas por su fila de abajo (pie) y algunas no se pueden pisar.
// { c, f, ancho, alto, bloquea, pie, dibujar(x, y) } en casillas del MAPA. BLOQUEADAS = "c,f" que ocupan.
const ADORNOS = [], BLOQUEADAS = new Set();
const PALOMAS = [];                 // palomas de la plaza: { hx, hy (su sitio), x, y, vuela, t, mira } en pixeles
const CEREZOS = new Set();          // arboles que siempre son cerezo (el parque del pueblo)
const caminoArco = f => ARCO.c + Math.round(Math.sin((f - ARCO.f - 2) / (28 - ARCO.f) * Math.PI));   // columna del camino que sube al arco
// sombra = [dx, dy, ancho, alto, alta]: ovalo bajo el adorno (si es alta, se desplaza con la hora del dia).
function adorno(c, f, dibujar, { ancho = 1, alto = 1, bloquea = true, luz = null, sombra = null } = {}) {
  const a = { c, f, ancho, alto, pie: f + alto - 1, dibujar, luz, sombra };
  ADORNOS.push(a);
  if (bloquea) for (let j = 0; j < alto; j++) for (let i = 0; i < ancho; i++) BLOQUEADAS.add((c + i) + ',' + (f + j));
  return a;
}
const FUENTE = enPuebloA(23, 17);                   // 3x3 en el centro de la plaza
const TABLON = enPuebloA(33, 17);                   // tablon de pedidos, al este de la plaza
const esTablon = (c, f) => c === TABLON.c && f === TABLON.f;
// La tiendecita de Bellota (una eriza): puesto con toldo de 4x2 al oeste de la plaza. Se le venden cosechas
// y criaturas por conchitas, y vende abono, cebos y muebles que no se pueden construir.
const TIENDA = enPuebloA(11, 15);
const esTienda = (c, f) => c >= TIENDA.c && c < TIENDA.c + 4 && f >= TIENDA.f && f < TIENDA.f + 2;
const PRECIO_FAUNA = [2, 3, 5, 10, 20];    // conchitas por criatura de cada rareza (las brillantes valen x4)
const precioVenta = id => {
  const fi = ficha(id);
  const base = fi.tipo === 'fauna' || fi.tipo === 'tesoro' ? PRECIO_FAUNA[fi.r] : fi.tipo === 'cultivo' || fi.tipo === 'abono' || fi.tipo === 'material' ? 1 : 0;
  return base * (esBrillante(id) ? 4 : esLuminoso(id) ? 3 : 1);
};
const conchitas = n => n === 1 ? 'conchita' : 'conchitas';
// Lo que vende Bellota: objetos para la bolsa (id) o muebles (mueble) que se guardan para colocarlos con B.
const CATALOGO = [
  { id: 'aguacate', precio: 5, texto: 'Abono gruñón: sobre una planta regada, la hace crecer una etapa de golpe.' },
  { id: 'cebo', precio: 8, texto: 'Se pone solo al lanzar la caña: pica antes y sale algo más raro o brillante.' },
  { mueble: 'osito', precio: 20, texto: 'Blandito y achuchable. Queda precioso en la cama o en un sillón.' },
  { mueble: 'teterita', precio: 15, texto: 'Para las tardes de lluvia. Va genial encima de una mesa.' },
  { mueble: 'lamparaSeta', precio: 25, texto: 'Una seta que se enciende sola cuando anochece.' },
  { herramienta: 'flotador', precio: 25, texto: 'Con el flotador puedes meterte en cualquier agua y nadar a tu aire.' },
  { mueble: 'caminoPiedras', precio: 2, texto: 'Piedras planas para hacer caminitos por tu jardín. Se pueden pisar.' },
  { mueble: 'conejoPiedra', precio: 18, texto: 'Un conejito de piedra que vigila las flores con mucha calma.' },
  { mueble: 'pozo', precio: 40, texto: 'Dicen que si pides un deseo en voz bajita, el valle te escucha.' },
  { mueble: 'regadera', precio: 8, texto: 'De adorno, rosa y brillante. Queda monísima junto a las flores.' },
  { mueble: 'monstera', precio: 15, texto: 'Hojas grandotas con agujeritos. Se mece con la brisa.' },
  { mueble: 'cerezoMaceta', precio: 25, texto: 'Un cerezo chiquitín que suelta algún pétalo de vez en cuando.' },
  { mueble: 'bonsai', precio: 30, texto: 'Un pino diminuto y muy paciente.' },
  { mueble: 'sombrilla', precio: 30, texto: 'Mesita con sombrilla de rayas. Si llueve, se cierra sola.' },
  { mueble: 'fuenteJardin', precio: 45, texto: 'Una fuente de piedra con su chorrito. Suena a tarde tranquila.' },
  { herramienta: 'barca', precio: 60, texto: 'Te espera en el embarcadero de la playa del sur. Desde ella pican criaturas de alta mar.' },
  { herramienta: 'gafas', precio: 35, texto: 'Gafas y tubo para bucear: sumérgete donde salen burbujas en el mar.' },
  // requiere: solo sale cuando ya tienes esa herramienta (las palas se mejoran de una en una).
  { herramienta: 'hacha', precio: 30, texto: 'Para talar árboles del valle y hacer sitio a tus muebles de jardín y a tus caminitos.' },
  { herramienta: 'palaMadera', precio: 12, texto: 'Donde veas un montoncito de tierra con un brillito, ¡hay algo enterrado!' },
  { herramienta: 'palaCobre', precio: 35, requiere: 'palaMadera', texto: 'Ligerita: la tierra blanda es más ancha y se cava sin esfuerzo.' },
  { herramienta: 'palaRosa', precio: 70, requiere: 'palaCobre', texto: 'De cuarzo rosa: hay una capa de tierra menos que cavar.' },
  { herramienta: 'palaEstrella', precio: 140, requiere: 'palaRosa', texto: 'La mejor de todas: tesoros más raros y, a veces, dos de golpe.' },
  { herramienta: 'radar', precio: 40, requiere: 'palaMadera', texto: 'Pipí pita cuando pasas cerca de un tesoro escondido sin marca. ¡Sigue los pitidos!' },
];
// Bancos donde sentarse (el tiempo pasa mas deprisa mientras descansas) y vallitas blancas de los jardines.
const BANCOS = [];                  // { c, f, mira } en casillas del MAPA
const bancoEn = (c, f) => BANCOS.find(b => b.c === c && b.f === f) || asientoEn(c, f);
// Una banca colocada (mueble con asiento): cualquiera de sus casillas sirve para sentarse.
function asientoEn(c, f) {
  const m = estado.decorar ? null : muebleEn(c, f);
  return m && MUEBLES[m.n].asiento ? { c, f, mira: 1 } : null;
}
const VALLAS = new Set();           // "c,f" con un trozo de valla (se une sola con las de los lados)
const SENTARSE_RAPIDO = 8;          // sentada, el dia corre 8 veces mas rapido
// Donde estan los vecinos ahora: por la manana, de noche y con lluvia, junto a su puerta; por la tarde, de paseo.
const enSuSitio = (v, s) => v.valle ? { c: s.c, f: s.f } : enPuebloA(s.c, s.f);
const sitioVecino = v => {
  const deCasa = estado.hora < 0.3 || oscuridad(estado.hora) > 0.5 || llueve();
  return enSuSitio(v, deCasa ? v.casa : v.plaza);
};
for (const v of VECINOS) Object.assign(v, enSuSitio(v, v.casa));
const DESCANSO = 60;                // segundos entre una siesta y la siguiente
const MAPA = [];
const fijos = {};                   // "col,fila" -> 0 arbol, 1 roca (bloquean el paso)
const detalles = [];                // adornos del suelo: { x, y, n (cuadro de detalles_tiles), viento }
const sueltas = [];                 // adoquines sueltos en el cesped junto a las calles del pueblo: { x, y, color, k }
const charcos = [];                 // sitios del camino donde se forma un charco cuando llueve
// Especie de cada arbol (copa y tronco en arboles_tiles): redondo (a veces con frutas), cerezo o pino.
function arbolEn(c, f) {
  if (CEREZOS.has(c + ',' + f)) return { copa: 2, tronco: 4 };
  const r = azar(c, f, 9);
  if (r < 0.5) return { copa: azar(c, f, 10) < 0.15 ? 1 : 0, tronco: 4 };
  return r < 0.75 ? { copa: 2, tronco: 4 } : { copa: 3, tronco: 5 };
}

const azar = (c, f, n = 0) => { const s = Math.sin(c * 127.1 + f * 311.7 + n * 74.7) * 43758.5453; return s - Math.floor(s); };

(function crearMundo() {
  const g = Array.from({ length: ALTO }, (_, f) => Array.from({ length: ANCHO }, (_, c) => azar(c, f) < 0.08 ? 'F' : 'G'));
  const rect = (c0, f0, c1, f1, t) => { for (let f = f0; f <= f1; f++) for (let c = c0; c <= c1; c++) g[f][c] = t; };
  const elipse = (cc, cf, rc, rf, t) => {
    for (let f = 0; f < ALTO; f++) for (let c = 0; c < ANCHO; c++) {
      if (((c - cc) / rc) ** 2 + ((f - cf) / rf) ** 2 <= 1) g[f][c] = t;
    }
  };
  // Prados de flores: el de siempre junto al jardin y dos mas para pasear.
  const prado = (c0, f0, c1, f1) => { for (let f = f0; f <= f1; f++) for (let c = c0; c <= c1; c++) if (azar(c, f, 1) < 0.55) g[f][c] = 'F'; };
  prado(41, 28, 48, 32); prado(64, 42, 73, 48); prado(6, 40, 15, 47);
  // Caminos: del jardin al este, bajada al sur y vuelta al oeste. Cada tramo serpentea hasta una casilla
  // y vuelve a su sitio en los extremos, para que los tramos se sigan uniendo.
  const tramo = (desde, hasta, fijo, horizontal, vueltas) => {
    let antes = null;
    for (let i = desde; i <= hasta; i++) {
      const otro = fijo + Math.round(Math.sin((i - desde) / (hasta - desde) * Math.PI * vueltas));
      const [c, f] = horizontal ? [i, otro] : [otro, i];
      g[f][c] = 'C';
      // Al cambiar de fila (o columna) se rellena el escalon para que el camino no quede en diagonal.
      if (antes !== null && antes !== otro) { if (horizontal) g[antes][i] = 'C'; else g[i][antes] = 'C'; }
      antes = otro;
    }
  };
  // Agua. El rio baja de norte a sur por el este y se ensancha en un remanso; el lago grande queda al oeste.
  for (let f = 0; f < ALTO; f++) for (let c = rioEn(f) - 1; c <= rioEn(f) + 1; c++) { g[f][c] = 'W'; RIO.add(c + ',' + f); }
  elipse(54, 20, 3.6, 2.7, 'W');                                         // remanso del rio, junto a Miel
  elipse(38.5, 18.5, 2.8, 1.9, 'W');                                     // estanque del jardin
  elipse(LAGO.c, LAGO.f, 9, 6, 'W'); elipse(20, 9, 5, 4, 'W');           // lago del muelle
  elipse(ESCONDIDO.c, ESCONDIDO.f, 3.2, 2.2, 'W');                       // estanque escondido
  elipse(27, 38, 3.8, 1.9, 'W'); elipse(23, 39, 3, 2, 'W');              // laguna del sur
  // Caminos: los del jardin de siempre, el que lleva al muelle y el que cruza el rio hacia el este.
  // Cada tramo serpentea y vuelve a su sitio en los extremos, para que los tramos se sigan uniendo.
  tramo(31, 50, 25, true, 2); tramo(25, 35, 50, false, 1); tramo(28, 50, 35, true, 2);
  tramo(14, 31, 25, true, 1); rect(LAGO.muelle.c, LAGO.muelle.f1 + 1, LAGO.muelle.c, 25, 'C');
  // Camino del pueblo: cruza el rio y sube hacia el norte hasta el arco de flores.
  tramo(50, ARCO.c, 30, true, 1); tramo(ARCO.f + 2, 30, ARCO.c, false, 1); rect(ARCO.c, 0, ARCO.c, ARCO.f + 2, 'C'); rect(61, 31, 61, 35, 'C');
  rect(rioEn(PUENTE_F) - 3, PUENTE_F, rioEn(PUENTE_F) + 3, PUENTE_F, 'C');
  // El camino cruza el rio en linea recta por un puente; el muelle se adentra en el lago.
  for (const k of RIO) { const [c, f] = k.split(',').map(Number); if (g[f][c] === 'C') g[f][c] = f === PUENTE_F ? 'B' : 'W'; }
  for (let f = LAGO.muelle.f0; f <= LAGO.muelle.f1; f++) g[f][LAGO.muelle.c] = 'M';
  // Tierra: el huerto del sur y los bancales del rio (el huerto de casa lo pone colocarHogar, donde se elija).
  rect(34, 29, 39, 32, 'T'); rect(BANCAL.c0, BANCAL.f0, BANCAL.c1, BANCAL.f1, 'T');
  // El mar al sur: agua desde la costa hasta el borde, dos filas de arena (Y) encima (el rio la cruza hasta el mar),
  // un camino que baja hasta la playa y el embarcadero de madera donde se amarra la barca.
  for (let c = 0; c < ANCHO; c++) {
    for (let f = costaEn(c) - 2; f < ALTO; f++) {
      if (f >= costaEn(c)) { g[f][c] = 'W'; RIO.delete(c + ',' + f); }
      else if (g[f][c] !== 'W') g[f][c] = 'Y';
    }
  }
  tramo(36, costaEn(EMBARCADERO.c) - 3, EMBARCADERO.c, false, 1);
  for (let f = costaEn(EMBARCADERO.c); f <= EMBARCADERO.punta; f++) g[f][EMBARCADERO.c] = 'M';
  for (let f = 0; f < ALTO; f++) for (let c = 0; c < ANCHO; c++) if (isloteEn(c, f)) g[f][c] = 'Y';   // islotes
  for (const fila of g) MAPA.push(fila.join(''));

  // Zonas de pesca: el mar (todo lo que hay bajo la costa, mas honda lejos de la orilla) y luego cada charca
  // de agua conectada, que se reconoce por un punto que esta dentro.
  for (let c = 0; c < ANCHO; c++) for (let f = costaEn(c); f < ALTO; f++) {
    if (g[f][c] === 'Y') continue;                                // la arena de los islotes
    zonaAgua[c + ',' + f] = 'mar';
    if (f >= costaEn(c) + 3) PROFUNDO.add(c + ',' + f);
  }
  const semillas = [['lago', LAGO.c, LAGO.f], ['estanque', 38, 18], ['escondido', ESCONDIDO.c, ESCONDIDO.f], ['laguna', 27, 38]];
  const inundar = (c0, f0, zona) => {
    const pila = [[c0, f0]];
    while (pila.length) {
      const [c, f] = pila.pop(), k = c + ',' + f;
      if (!g[f] || g[f][c] !== 'W' || zonaAgua[k]) continue;
      zonaAgua[k] = zona;
      pila.push([c + 1, f], [c - 1, f], [c, f + 1], [c, f - 1]);
    }
  };
  for (const [zona, c, f] of semillas) inundar(c, f, zona);
  for (let f = 0; f < ALTO; f++) for (let c = 0; c < ANCHO; c++) if (g[f][c] === 'W' && !zonaAgua[c + ',' + f]) inundar(c, f, 'rio');
  // Agua honda: casillas del lago rodeadas de agua en dos casillas a la redonda.
  for (const [k, zona] of Object.entries(zonaAgua)) {
    if (zona !== 'lago') continue;
    const [c, f] = k.split(',').map(Number);
    let honda = true;
    for (let df = -2; df <= 2 && honda; df++) for (let dc = -2; dc <= 2; dc++) if (!g[f + df] || !'WM'.includes(g[f + df][c + dc])) { honda = false; break; }
    if (honda) PROFUNDO.add(k);
  }
  // Nenufares en los estanques (muchos en el escondido) y juncos en la orilla de la laguna y del lago.
  for (const [k, zona] of Object.entries(zonaAgua)) {
    const [c, f] = k.split(',').map(Number), prob = { escondido: 0.4, estanque: 0.22 }[zona] || 0;
    if (azar(c, f, 50) < prob) nenufares.push({ x: c * T + 2 + Math.floor(azar(c, f, 51) * 6), y: f * T + 4 + Math.floor(azar(c, f, 52) * 7), flor: azar(c, f, 53) < 0.35 });
  }

  // Arboles en el borde y sueltos por el cesped; alguna roca. Nunca pegados a agua, tierra o camino.
  const cesped = (c, f) => g[f] && (g[f][c] === 'G' || g[f][c] === 'F');
  for (let f = 0; f < ALTO; f++) for (let c = 0; c < ANCHO; c++) {
    if (!cesped(c, f)) continue;
    const borde = c === 0 || f === 0 || c === ANCHO - 1 || f === ALTO - 1;
    const despejado = [[0, -1], [1, 0], [0, 1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]].every(([dc, df]) => !g[f + df] || !g[f + df][c + dc] || cesped(c + dc, f + df));
    const cercaInicio = Math.abs(c - INICIO.c) < 4 && Math.abs(f - INICIO.f) < 3;
    const juntoCasa = c >= CASA.c - 1 && c <= CASA.c + 3 && f >= CASA.f - 2 && f <= CASA.f + 2;
    const juntoVecino = VECINOS.some(v => Math.abs(v.c - c) <= 1 && Math.abs(v.f - f) <= 1);
    // El bosque del norte esconde un estanque: solo se llega por una senda sin arboles que sale del jardin.
    const bosque = f <= 12 && c >= 24 && c <= 52;
    const senda = sendaEscondida(c, f);
    const claro = ((c - ESCONDIDO.c) / 5.5) ** 2 + ((f - ESCONDIDO.f) / 4) ** 2 <= 1;
    const orillaRio = Math.abs(c - rioEn(f)) <= 4;
    const densidad = bosque ? 0.42 : f >= 50 || c <= 3 ? 0.2 : 0.06;
    if (borde) fijos[c + ',' + f] = 0;
    else if (juntoCasa || juntoVecino || senda || claro) continue;
    else if (despejado && !cercaInicio && azar(c, f, 2) < densidad) fijos[c + ',' + f] = 0;
    else if (despejado && !cercaInicio && azar(c, f, 3) < (orillaRio ? 0.08 : 0.012)) fijos[c + ',' + f] = 1;   // piedras junto al rio
  }

  // El interior de la casita vive en el mismo mapa, debajo del mundo y separado por filas vacias.
  // P pared, S suelo de madera, ' ' vacio. Mide justo una pantalla, asi la camara no se mueve dentro.
  while (MAPA.length < INTERIOR.f0) MAPA.push(' '.repeat(ANCHO));
  for (let f = 0; f < INTERIOR.alto; f++) MAPA.push((f < INTERIOR.pared ? 'P' : 'S').repeat(INTERIOR.ancho) + ' '.repeat(ANCHO - INTERIOR.ancho));
  crearPueblo();
  adornosAgua();
  crearFondo();
  adornosMar();

  // Detalles del suelo del valle y del pueblo (se leen del MAPA ya hecho).
  const filas = [...Array(ALTO).keys(), ...Array.from({ length: PUEBLO.alto }, (_, i) => PUEBLO.f0 + i)];
  for (const f of filas) for (let c = 0; c < ANCHO; c++) detallesCasilla(c, f);
  detalles.sort((a, b) => a.y - b.y);
})();

// Detalles del suelo de una casilla: mechones, flores, setas, charcos y juncos, con un desplazamiento al azar
// para romper la cuadricula. Cada uno recuerda su casilla (k) para poder rehacerlos si cambia el terreno.
// Un ruido suave decide donde hay praderas floridas y donde cesped limpio.
function ruidoPradera(c, f) {
  const suave = t => t * t * (3 - 2 * t), v = (a, b) => azar(a, b, 11);
  const gc = c / 6, gf = f / 6, c0 = Math.floor(gc), f0 = Math.floor(gf), tc = suave(gc - c0), tf = suave(gf - f0);
  const arriba = v(c0, f0) + (v(c0 + 1, f0) - v(c0, f0)) * tc, abajo = v(c0, f0 + 1) + (v(c0 + 1, f0 + 1) - v(c0, f0 + 1)) * tc;
  return arriba + (abajo - arriba) * tf;
}
function sueloOcupado(c, f) {
  return (c + ',' + f) in fijos || (c >= CASA.c && c <= CASA.c + 2 && f >= CASA.f && f <= CASA.f + 1)
    || VECINOS.some(v => v.c === c && v.f === f) || BLOQUEADAS.has(c + ',' + f);
}
function detallesCasilla(c, f) {
  const m = (cc, ff) => (MAPA[ff] && MAPA[ff][cc]) || null;
  const k = c + ',' + f, x0 = c * T, y0 = f * T, mueve = n => Math.round((azar(c, f, n) - 0.5) * 8);
  if (m(c, f) === 'Y') {             // playa: algun guijarro suelto
    if (m(c, f + 1) === 'Y' && azar(c, f, 16) < 0.12) detalles.push({ x: x0 + mueve(17), y: y0 + mueve(18), n: 10, k });
    return;
  }
  if (m(c, f) === 'C' || m(c, f) === 'A') {
    if (azar(c, f, 16) < 0.18) detalles.push({ x: x0 + mueve(17), y: y0 + mueve(18), n: 10, k });
    if (azar(c, f, 19) < 0.22) charcos.push({ x: x0 + mueve(20), y: y0 + mueve(21), k });
    return;
  }
  if ((m(c, f) !== 'G' && m(c, f) !== 'F') || sueloOcupado(c, f)) return;
  if ([[0, -1], [1, 0], [0, 1], [-1, 0]].some(([dc, df]) => m(c + dc, f + df) === 'A') && azar(c, f, 57) < 0.4) {
    const color = ['#F3E3CC', '#EBD5B5', '#F2D6CC'][Math.floor(azar(c, f, 58) * 3)];
    sueltas.push({ x: x0 + 2 + Math.floor(azar(c, f, 59) * 10), y: y0 + 3 + Math.floor(azar(c, f, 61) * 10), color, k });
  }
  // Juncos en la orilla de la laguna y del lago.
  const orilla = [[0, -1], [1, 0], [0, 1], [-1, 0]].some(([dc, df]) => ['laguna', 'lago'].includes(zonaAgua[(c + dc) + ',' + (f + df)]));
  if (orilla && azar(c, f, 54) < 0.45) juncos.push({ x: x0 + 3 + Math.floor(azar(c, f, 55) * 8), y: y0 + 10 + Math.floor(azar(c, f, 56) * 4), k });
  // Mechones encima de la costura con caminos y tierra (tapan la linea recta de la cuadricula).
  [[0, -1, 0, -13], [1, 0, 8, -6], [0, 1, 0, 2], [-1, 0, -8, -6]].forEach(([dc, df, dx, dy], i) => {
    const t = m(c + dc, f + df);
    if ((t === 'C' || t === 'T' || t === 'A' || t === 'Y') && azar(c, f, 30 + i) < 0.5) {
      detalles.push({ x: x0 + dx + (dc ? 0 : mueve(34 + i)), y: y0 + dy + (df ? 0 : mueve(38 + i)), n: 0, viento: true, k });
    }
  });
  const pradera = ruidoPradera(c, f) > 0.58 || m(c, f) === 'F';
  if (azar(c, f, 12) < (pradera ? 0.6 : 0.2)) {
    const opciones = pradera ? [5, 6, 7, 8, 8, 0, 6] : [0, 0, 0, 2, 3, 4, 2];
    const n = opciones[Math.floor(azar(c, f, 13) * opciones.length)];
    detalles.push({ x: x0 + mueve(14), y: y0 + mueve(15), n, viento: n === 0, k });
  }
}
// Vuelve a sembrar los detalles de un rectangulo de casillas del valle.
function rehacerDetalles(c0, f0, c1, f1) {
  [c0, f0, c1, f1] = [Math.max(0, c0), Math.max(0, f0), Math.min(ANCHO - 1, c1), Math.min(ALTO - 1, f1)];
  const fuera = o => { const [c, f] = o.k.split(',').map(Number); return c < c0 || c > c1 || f < f0 || f > f1; };
  for (const lista of [detalles, charcos, juncos, sueltas]) { const quedan = lista.filter(fuera); lista.length = 0; lista.push(...quedan); }
  for (let f = f0; f <= f1; f++) for (let c = c0; c <= c1; c++) detallesCasilla(c, f);
  detalles.sort((a, b) => a.y - b.y);
}

// ---------- El hogar ----------
// La casita y el primer huerto se eligen al empezar una partida nueva (estado.hogar = { casa, huerto }, sus
// casillas de arriba a la izquierda). Las partidas de antes conservan el sitio de siempre.
// El sitio donde aparece la gatita va con la casa; los arboles de alrededor se apartan.
const HOGAR_DE_SIEMPRE = { casa: { c: 31, f: 20 }, huerto: { c: 25, f: 18 } };
const HUERTO = { ancho: 6, alto: 5 };
const SOLAR = { ancho: 4, alto: 4 };      // lo que pide la casa: ella (3x2), el portal y un poco de sitio alrededor
function sendaEscondida(c, f) { return f >= 7 && f <= 16 && Math.abs(c - (ESCONDIDO.c + Math.round(Math.sin(f * 0.9)))) <= 1; }
let hogarPuesto = { tiles: [], fijos: {}, zona: null };   // lo que se cambio al ponerlo, para poder quitarlo
function ponerTile(c, f, t) { MAPA[f] = MAPA[f].slice(0, c) + t + MAPA[f].slice(c + 1); }
// Deja el valle como estaba antes de poner la casa y el huerto (la casa se va fuera del mapa).
function quitarHogar() {
  for (const { c, f, t } of hogarPuesto.tiles.reverse()) ponerTile(c, f, t);
  Object.assign(fijos, hogarPuesto.fijos);
  const zona = hogarPuesto.zona;
  hogarPuesto = { tiles: [], fijos: {}, zona: null };
  Object.assign(CASA, { c: -99, f: -99 }); Object.assign(CASA.puerta, { c: -99, f: -99 });
  if (zona) rehacerDetalles(...zona);
  terrenoMapa = null;
}
// Pone la casa (y el huerto, si lo hay) en su sitio, con un caminito de la puerta al camino mas cercano.
function colocarHogar({ casa, huerto }) {
  quitarHogar();
  const cambiar = (c, f, t) => { hogarPuesto.tiles.push({ c, f, t: tile(c, f) }); ponerTile(c, f, t); };
  const apartar = (c, f) => { const k = c + ',' + f; if (k in fijos && c > 0 && f > 0 && c < ANCHO - 1 && f < ALTO - 1) { hogarPuesto.fijos[k] = fijos[k]; delete fijos[k]; } };
  Object.assign(CASA, casa); Object.assign(CASA.puerta, { c: casa.c + 1, f: casa.f + 1 });
  Object.assign(INICIO, { c: casa.c + 1, f: casa.f + 3 });
  for (let f = casa.f - 1; f <= casa.f + SOLAR.alto; f++) for (let c = casa.c - 1; c <= casa.c + SOLAR.ancho; c++) apartar(c, f);
  if (huerto) for (let f = huerto.f; f < huerto.f + HUERTO.alto; f++) for (let c = huerto.c; c < huerto.c + HUERTO.ancho; c++) { apartar(c, f); cambiar(c, f, 'T'); }
  const pasos = [], pc = casa.c + 1;
  for (let f = casa.f + 2; f <= casa.f + 10; f++) {
    const t = tile(pc, f);
    if (t && 'CABM'.includes(t)) { for (const p of pasos) cambiar(pc, p, 'C'); break; }
    if (!esCesped(pc, f) || (pc + ',' + f) in fijos) break;
    pasos.push(f);
  }
  const h = huerto || casa;
  hogarPuesto.zona = [Math.min(casa.c, h.c) - 2, Math.min(casa.f, h.f) - 2, Math.max(casa.c + SOLAR.ancho, h.c + HUERTO.ancho) + 1, Math.max(casa.f + 11, h.f + HUERTO.alto) + 1];
  rehacerDetalles(...hogarPuesto.zona);
  terrenoMapa = null;
}
// Por que no se puede poner la casa o el huerto donde esta el cursor (null si se puede).
function problemaHogar(e) {
  const casa = e.paso === 'casa', { ancho, alto } = casa ? SOLAR : HUERTO;
  for (let j = 0; j < alto; j++) for (let i = 0; i < ancho; i++) {
    const c = e.c + i, f = e.f + j, t = tile(c, f);
    if (c < 2 || f < 2 || c > ANCHO - 3 || f > ALTO - 3) return 'Un poquito más hacia dentro del valle.';
    if (t === 'W' || t === 'M' || t === 'B') return 'Ahí hay agua: busca tierra firme.';
    if (t === 'C') return 'Por ahí pasa un camino: mejor a un ladito.';
    if (t === 'T') return casa ? 'Ahí ya hay tierra de cultivo.' : 'Ahí ya hay un huerto.';
    if (!esCesped(c, f) || BLOQUEADAS.has(c + ',' + f)) return 'Ese sitio no está libre.';
    if (casa && sendaEscondida(c, f)) return 'Por ahí se va al estanque escondido: déjalo libre.';
    if (!casa && c >= CASA.c && c < CASA.c + SOLAR.ancho && f >= CASA.f && f < CASA.f + SOLAR.alto) return 'Ahí está tu casita: ponlo a un lado.';
  }
  return null;
}

// Pueblo Algodon (48x36): una plaza redonda con fuente en el centro; las tres casitas al norte, en fila, con su
// jardin y un caminito hasta la calle; al sur la avenida hasta el arco de salida, el estanque de Nenufar al oeste
// y el parque de cerezos al este. A: adoquines crema (se pisan), W: agua.
function crearPueblo() {
  const P = PUEBLO;
  const q = Array.from({ length: P.alto }, (_, f) => Array.from({ length: P.ancho }, (_, c) => azar(c, f + P.f0) < 0.05 ? 'F' : 'G'));
  const rect = (c0, f0, c1, f1, t) => { for (let f = f0; f <= f1; f++) for (let c = c0; c <= c1; c++) q[f][c] = t; };
  const elipse = (cc, cf, rc, rf, t) => { for (let f = 0; f < P.alto; f++) for (let c = 0; c < P.ancho; c++) if (((c - cc) / rc) ** 2 + ((f - cf) / rf) ** 2 <= 1) q[f][c] = t; };
  const flores = (c0, f0, c1, f1) => { for (let f = f0; f <= f1; f++) for (let c = c0; c <= c1; c++) if (azar(c, f + P.f0, 1) < 0.6) q[f][c] = 'F'; };
  flores(3, 13, 12, 22); flores(35, 24, 45, 33); flores(15, 30, 20, 33);
  rect(4, 9, 43, 10, 'A');                                    // calle de las casitas
  const DEL_PUEBLO = VECINOS.filter(v => !v.valle);
  for (const v of DEL_PUEBLO) rect(v.hogar.c + 1, v.hogar.f + 2, v.hogar.c + 1, 8, 'A');   // de cada puerta a la calle
  // Plaza: un ovalo con el borde ondulado (no un circulo perfecto) para que parezca hecha a mano.
  for (let f = 0; f < P.alto; f++) for (let c = 0; c < P.ancho; c++) {
    const dx = (c - 24) / 8.5, df = (f - 18) / 5.5, ang = Math.atan2(df, dx);
    if (Math.hypot(dx, df) <= 1 + 0.1 * Math.sin(3 * ang + 0.7) + 0.07 * Math.sin(5 * ang + 2.1)) q[f][c] = 'A';
  }
  rect(23, 10, 25, 13, 'A');                                  // de la calle a la plaza
  rect(23, 23, 25, P.alto - 1, 'A');                          // avenida hasta el arco
  rect(14, 27, 40, 27, 'A');                                  // paseo del estanque al parque
  rect(10, 17, 16, 18, 'A');                                  // delante de la tiendecita
  elipse(9, 29, 4, 2.5, 'W');                                 // estanque de Nenufar
  while (MAPA.length < P.f0) MAPA.push(' '.repeat(ANCHO));    // filas vacias entre la casa y el pueblo
  for (let f = 0; f < P.alto; f++) MAPA.push(q[f].join('') + ' '.repeat(ANCHO - P.ancho));
  // El estanque es zona de 'estanque' para pescar, con sus nenufares.
  for (let f = 0; f < P.alto; f++) for (let c = 0; c < P.ancho; c++) {
    if (q[f][c] !== 'W') continue;
    const g = enPuebloA(c, f);
    zonaAgua[g.c + ',' + g.f] = 'estanque';
    if (azar(g.c, g.f, 50) < 0.3) nenufares.push({ x: g.c * T + 2 + Math.floor(azar(g.c, g.f, 51) * 6), y: g.f * T + 4 + Math.floor(azar(g.c, g.f, 52) * 7), flor: azar(g.c, g.f, 53) < 0.4 });
  }

  // Lo que no se mueve: casitas, fuente, bancos, farolas, tablon, plantas de los jardines y los arcos.
  const A = (c, f, dibujar, op) => { const g = enPuebloA(c, f); return adorno(g.c, g.f, dibujar, op); };
  DEL_PUEBLO.forEach((v, i) => A(v.hogar.c, v.hogar.f, (x, y) => { dibujarCasita(x, y, v); dibujarPajarito(x + 20 + i * 6, y - 21, i); }, { ancho: 3, alto: 2, luz: [[9, 15], [38, 15]] }));
  A(FUENTE.c, FUENTE.f - P.f0, dibujarFuente, { ancho: 3, alto: 3 });
  // Bancos con cojin, puestos sin simetria: uno de frente a la fuente, otro a la sombra del cerezo.
  for (const [c, f, mira, cojin] of [[20, 15, 1, '#F7C6D0'], [27, 14, 0, '#C4EADC'], [30, 20, -1, '#FFE08A'], [17, 21, 1, '#C9B6E4'], [37, 30, 1, '#F7C6D0'], [42, 30, -1, '#C4EADC'], [15, 25, 1, '#FFE08A']]) {
    A(c, f, (x, y) => dibujarBanco(x, y, mira, cojin), { sombra: [8, 14, 14, 3] });
    BANCOS.push({ ...enPuebloA(c, f), mira });
  }
  // Alrededor de la fuente: maceteros redondos con flores; por la plaza, arbustos con bayas, el carrito de flores,
  // la caja de libros compartidos y una bandada de palomas picoteando migas.
  [[21, 16], [27, 16], [22, 21], [26, 21]].forEach(([c, f], i) => A(c, f, (x, y) => dibujarMacetero(x, y, i), { sombra: [8, 14, 15, 3] }));
  [[16, 14], [31, 13], [33, 20], [19, 23]].forEach(([c, f], i) => A(c, f, (x, y) => dibujarArbustoBayas(x, y, i), { sombra: [8, 15, 16, 4, true] }));
  A(17, 16, dibujarCarrito, { ancho: 2, sombra: [16, 15, 30, 4, true] });
  A(31, 16, dibujarLibros, { sombra: [8, 15, 14, 3, true] });
  A(22, 22, dibujarBandada, { ancho: 3, bloquea: false });
  PALOMAS.length = 0;
  for (const [dc, df] of [[6, 10], [16, 12], [27, 9], [36, 13], [44, 10]]) {
    const g = enPuebloA(22, 22), hx = g.c * T + dc, hy = g.f * T + df;
    PALOMAS.push({ hx, hy, x: hx, y: hy, vuela: 0, t: 0, mira: dc % 2 ? 1 : -1 });
  }
  // Jardincito de cada casa: vallita blanca delante (con hueco en el caminito), buzon y jardineras.
  for (const v of DEL_PUEBLO) {
    const { c, f } = v.hogar;
    for (let i = c - 4; i <= c + 6; i++) if (i !== c + 1) { const g = enPuebloA(i, f + 3); VALLAS.add(g.c + ',' + g.f); A(i, f + 3, dibujarValla); }
    A(c, f + 2, (x, y) => dibujarBuzon(x, y, v.tejado[0]));
  }
  for (const c of [4, 10]) A(c, 7, dibujarColmena);            // colmenas en el jardin de Miel
  // Parque: glorieta, columpio y gatitos dormidos al sol.
  A(40, 22, dibujarGlorieta, { ancho: 3, alto: 3, luz: [[24, 17]] });
  A(39, 32, dibujarColumpio, { ancho: 2, alto: 2 });
  for (const [c, f, color] of [[13, 12, '#F5B78E'], [30, 25, '#B9AFC4'], [44, 26, '#FFF4E0']]) A(c, f, (x, y) => dibujarGatito(x, y, color));
  for (const [c, f] of [[22, 25], [26, 25], [22, 31], [26, 31], [15, 13], [33, 22], [4, 11], [43, 11], [29, 17], [20, 22]]) A(c, f, dibujarFarola, { luz: [[8, -14]], sombra: [8, 15, 10, 3, true] });
  A(TABLON.c, TABLON.f - P.f0, dibujarTablon, { sombra: [8, 15, 22, 4, true] });
  A(TIENDA.c, TIENDA.f - P.f0, dibujarTienda, { ancho: 4, alto: 2, luz: [[64, 0]], sombra: [32, 31, 74, 7, true] });
  A(TIENDA.c - 1, TIENDA.f + 1 - P.f0, dibujarBarril, { sombra: [8, 15, 14, 4, true] });           // a los lados del puesto
  A(TIENDA.c + 4, TIENDA.f + 1 - P.f0, dibujarCajas, { sombra: [8, 15, 17, 4, true] });
  A(22, 33, (x, y) => dibujarArco(x, y, 5), { ancho: 5, bloquea: false });
  for (const c of [22, 26]) A(c, 33, () => {});             // los pies del arco no se pisan
  const plantas = { oso: ['girasol', [[4, 5], [4, 6], [10, 5], [10, 6]]], conejo: ['zanahoria', [[19, 4], [20, 4], [26, 4], [27, 4]]], rana: ['lavanda', [[36, 5], [36, 6], [42, 5], [42, 6]]] };
  for (const [id, [cultivo, sitios]] of Object.entries(plantas)) for (const [c, f] of sitios) A(c, f, (x, y) => cuadro('cultivos_' + cultivo, 3, x, y - 2), { bloquea: false });
  for (const [c, f] of [[15, 15], [16, 22], [32, 22], [21, 24], [27, 24]]) A(c, f, (x, y) => cuadro('cultivos_tulipan', 3, x, y - 2), { bloquea: false });
  // Arco de flores del valle: al final del camino, en el borde norte.
  adorno(ARCO.c - 2, ARCO.f + 1, (x, y) => dibujarArco(x, y, 5), { ancho: 5, bloquea: false });
  for (const c of [ARCO.c - 2, ARCO.c + 2]) adorno(c, ARCO.f + 1, () => {});
  for (const [f, lado] of [[11, -1], [17, 1], [23, -1]]) adorno(caminoArco(f) + lado, f, dibujarFarolillo, { luz: [[8, -10]] });
  adorno(ARCO.c + 1, 29, dibujarPoste);                        // poste que indica el pueblo
  for (const k of BLOQUEADAS) delete fijos[k];                 // ningun arbol del valle encima de lo de aqui
  for (const [c, f, cerezo] of [[16, 20, true], [34, 15, false], [31, 23, false]]) {
    const g = enPuebloA(c, f), k = g.c + ',' + g.f;
    fijos[k] = 0; BLOQUEADAS.add(k); if (cerezo) CEREZOS.add(k);
  }

  // Arboles: un borde de bosque (con hueco para el arco) y cerezos en el parque.
  for (let f = 0; f < P.alto; f++) for (let c = 0; c < P.ancho; c++) {
    if (q[f][c] !== 'G' && q[f][c] !== 'F') continue;
    const g = enPuebloA(c, f), k = g.c + ',' + g.f;
    if (BLOQUEADAS.has(k) || DEL_PUEBLO.some(v => Math.abs(v.casa.c - c) <= 1 && Math.abs(v.casa.f - f) <= 1 || Math.abs(v.plaza.c - c) <= 1 && Math.abs(v.plaza.f - f) <= 1)) continue;
    const borde = c === 0 || f === 0 || c === P.ancho - 1 || f === P.alto - 1 || (f >= P.alto - 3 && (c <= 1 || c >= P.ancho - 2));
    const despejado = [[0, -1], [1, 0], [0, 1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]].every(([dc, df]) => { const t = q[f + df] && q[f + df][c + dc]; return !t || t === 'G' || t === 'F'; })
      && ![[0, -1], [1, 0], [0, 1], [-1, 0], [0, 1]].some(([dc, df]) => BLOQUEADAS.has((g.c + dc) + ',' + (g.f + df)));
    const parque = c >= 34 && f >= 26 && f <= 34;
    if (borde) { fijos[k] = 0; continue; }
    if (despejado && azar(g.c, g.f, 2) < (parque ? 0.3 : f <= 2 || c <= 2 || c >= P.ancho - 3 ? 0.35 : 0.02)) { fijos[k] = 0; if (parque) CEREZOS.add(k); }
  }
}

const esCasa = (c, f) => c >= CASA.c && c <= CASA.c + 2 && f >= CASA.f && f <= CASA.f + 1;
const esCama = (c, f) => c === INTERIOR.cama.c && (f === INTERIOR.cama.f || f === INTERIOR.cama.f + 1);   // ocupa 1x2
const esSalida = (c, f) => c === INTERIOR.salida.c && f === INTERIOR.salida.f;
const esArmario = (c, f) => c === INTERIOR.armario.c && f === INTERIOR.armario.f;
const vecinoEn = (c, f) => VECINOS.find(v => v.c === c && v.f === f);
const estaDentro = f => regionDe(f).id === 'casa';

// Camara: la parte del mundo que se ve. Sigue a la gatita (o al cursor de decorar).
const cam = { x: 0, y: 0, lista: false };
function enfocar(dt) {
  const g = estado.gata, d = estado.decorar, e = estado.elegir;
  const [ox, oy] = d ? [d.c * T + 8, d.f * T + 8] : [g.x + 8, g.y + 8];
  // La camara no sale de la parte del mapa donde esta (valle, casa o pueblo); la casa mide justo una pantalla.
  const r = regionDe(e ? 0 : Math.floor(oy / T));
  const y0 = r.f0 * T, y1 = (r.f0 + r.alto) * T, x1 = r.ancho * T;
  let cx = ox - lienzo.width / 2, cy = oy - lienzo.height / 2;
  if (e) {
    // Al elegir el sitio, la camara solo se mueve cuando el fantasma se acerca al borde (asi el raton no la arrastra).
    // Abajo se deja sitio para la tarjeta y arriba para el tejado.
    const { ancho, alto } = medidaElegir(e), M = 24;
    cx = Math.min(Math.max(cam.x, (e.c + ancho) * T + M - lienzo.width), e.c * T - M);
    cy = Math.min(Math.max(cam.y, (e.f + alto) * T + 44 - lienzo.height), e.f * T - 20 - (e.paso === 'casa' ? 34 : 0));   // sitio para el tejado y el humo
  }
  // Si la region es mas estrecha que la pantalla (la casa, en pantallas anchas), queda centrada.
  const tx = x1 < lienzo.width ? (x1 - lienzo.width) / 2 : Math.max(0, Math.min(x1 - lienzo.width, cx));
  const ty = Math.max(y0, Math.min(y1 - lienzo.height, cy));
  const k = cam.lista ? Math.min(1, dt * 8) : 1;
  cam.x += (tx - cam.x) * k;
  cam.y += (ty - cam.y) * k;
  cam.lista = true;
}

const ANIM = {
  reposo:  { img: 'gatita_reposo',  cuadros: 16, fps: 4 },
  caminar: { img: 'gatita_caminar', cuadros: 4,  fps: 8 },
  alegria: { img: 'gatita_alegria', cuadros: 7,  fps: 8 },
  reposoLado:  { img: 'gatita_reposoLado',  cuadros: 8, fps: 4 },
  caminarLado: { img: 'gatita_caminarLado', cuadros: 4, fps: 8 },
  reposoEsp:   { img: 'gatita_reposoEsp',   cuadros: 4, fps: 4 },
  caminarEsp:  { img: 'gatita_caminarEsp',  cuadros: 4, fps: 8 },
  // Poses de las actividades (arte/generar-gatita.py)
  pescar:     { img: 'gatita_pescar',     cuadros: 8, fps: 3 },
  pescarLado: { img: 'gatita_pescarLado', cuadros: 8, fps: 3 },
  pescarEsp:  { img: 'gatita_pescarEsp',  cuadros: 4, fps: 3 },
  tirar:      { img: 'gatita_tirar',      cuadros: 2, fps: 8 },
  tirarLado:  { img: 'gatita_tirarLado',  cuadros: 2, fps: 8 },
  tirarEsp:   { img: 'gatita_tirarEsp',   cuadros: 2, fps: 8 },
  tejer:      { img: 'gatita_tejer',      cuadros: 8, fps: 5 },
  tejerSentarse: { img: 'gatita_tejerSentarse', cuadros: 5, fps: 8 },
  tejerBien:  { img: 'gatita_tejerBien',  cuadros: 2, fps: 6 },
  regar:      { img: 'gatita_regar',      cuadros: 5, fps: 6 },
  cultivar:   { img: 'gatita_cultivar',   cuadros: 4, fps: 6 },
  sueno:      { img: 'gatita_sueno',      cuadros: 8, fps: 2 },
  cavar:      { img: 'gatita_cavar',      cuadros: 4, fps: 5 },
  talar:      { img: 'gatita_talar',      cuadros: 4, fps: 6 },
  // Al correr (Mayus) se pone los patines: zancadas de patinaje con las ruedas girando
  patinar:     { img: 'gatita_patinar',     cuadros: 4, fps: 6 },
  patinarLado: { img: 'gatita_patinarLado', cuadros: 4, fps: 6 },
  patinarEsp:  { img: 'gatita_patinarEsp',  cuadros: 4, fps: 6 },
};
// Animaciones que se ven una vez enteras y luego vuelve al reposo (mientras, no se mueve).
const UNA_VEZ = new Set(['alegria', 'regar', 'cultivar', 'talar']);
// De noche, si se queda quieta mirando al frente, le entra sueno (parpados caidos, cabeceo y bostezo).
const tieneSueno = g => g.anim === 'reposo' && g.mira === 'frente' && oscuridad(estado.hora) > 0.6 && !estado.sentada
  && !estado.navegando && !nadando() && !bajoAgua(casillaActual().f) && !estado.inicio;
// Animacion segun lo que hace la gatita y hacia donde mira ('frente', 'lado' o 'espalda').
// Ponerse o quitarse los patines: clic de las hebillas y una nubecita en los pies.
function ponerPatines(g, puestos) {
  if (puestos) sonar('patines');
  chispas(g.x + 8, g.y + 15, COLOR.crema, 5, { fuerza: 14, gravedad: -4, vida: 0.4 });
  if (puestos) chispas(g.x + 8, g.y + 15, '#FFE08A', 2, { fuerza: 10, gravedad: 10, vida: 0.4, arriba: 6 });
}
function animActual(g) {
  if (UNA_VEZ.has(g.anim)) return ANIM[g.anim];
  const vista = { frente: '', lado: 'Lado', espalda: 'Esp' }[g.mira];
  const pe = estado.pesca;
  if (pe && g.anim === 'reposo') return ANIM[(pe.fase === 'tirar' || pe.fase === 'pica' ? 'tirar' : 'pescar') + vista];
  const tj = estado.tejer;   // sentandose en el cojin, tejiendo o contenta tras un punto (al rematar se levanta)
  if (tj && g.anim === 'reposo' && tj.fase !== 'rematar') return tj.sentar < DURACION_SENTARSE ? ANIM.tejerSentarse : tj.contenta > 0 ? ANIM.tejerBien : ANIM.tejer;
  if (estado.cavar && g.anim === 'reposo') return ANIM.cavar;
  if (tieneSueno(g)) return ANIM.sueno;
  return ANIM[g.anim + vista];
}

const sonar = (nombre, n) => Sonido.tocar(nombre, n);   // efectos de sonido (ver sonido.js)

const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');
ctx.imageSmoothingEnabled = false;

const img = {};
function cargar(nombre) {
  return new Promise((ok, mal) => {
    const i = new Image();
    i.onload = () => { img[nombre] = i; ok(); };
    i.onerror = () => mal(new Error('No se pudo cargar ' + nombre));
    i.src = RUTA + nombre + '.png';
  });
}

const estado = {
  gata: { x: INICIO.c * T, y: INICIO.f * T - 6, anim: 'reposo', t: 0, mira: 'frente', espejo: false },   // espejo: mira a la izquierda
  parcelas: {},                     // "col,fila" -> { regada, cultivo: { tipo, etapa, t } }
  semilla: 0,                       // indice en CULTIVOS
  saquito: false,                   // saquito de semillas abierto (no se guarda)
  saquitoT: 0,                      // 0 = guardado, 1 = del todo fuera (animacion)
  inv: {},                          // inventario: id de objeto -> cuantos tienes
  vistos: {},                       // enciclopedia: id de objeto -> cuantos has conseguido en total
  ropa: { bufanda: null, gorro: null, lazo: null },   // color de cada prenda puesta (null = no la lleva; bufanda null = la original)
  armario: [],                      // prendas tejidas: { tipo, color }
  vestidor: null,                   // { fila } si el armario esta abierto
  vecinos: {},                      // id -> { entregas, pedido: { id, n } }
  herramientas: { regadera: false, cana: false, mapa: false, flotador: false, barca: false },   // regalos especiales de los vecinos
  mapaVisible: false,               // si el minimapa esta abierto
  bolsa: false,                     // si la bolsa esta abierta
  ajustes: false,                   // si el menu de ajustes esta abierto (el juego espera)
  dialogo: null,                    // { vecino, paginas: [{ texto, pista }], i } conversacion en curso
  hora: 0.1,                        // momento del dia, de 0 (amanecer) a 1
  clima: 'sol',                     // 'sol' o 'lluvia'; se sortea al empezar cada dia
  lluvia: 0,                        // intensidad que se ve y se oye, de 0 a 1 (sube y baja poco a poco)
  inicio: true,                     // pantalla de inicio visible (el juego espera)
  nombre: '',                       // como se llama quien juega (se pide en el inicio)
  tutorial: null,                   // { paso, t, x0, y0, bien } tutorial en curso
  tutorialHecho: false,             // la primera partida lo muestra; despues solo si se pide en ajustes
  pasoTutorial: 0,                  // paso por el que iba si se cerro el juego a mitad
  ayuda: false,                     // guia de controles abierta
  pesca: null,                      // { fase: 'lanza' | 'espera' | 'pica' | 'tirar' | 'escapo', t, bx, by (flotador), lado, ... }
  tejer: null,                      // { fase: 'prenda' | 'elegir' } o { fase: 'tejiendo', prenda, tinte, patron, i, fallo }
  muebles: Object.fromEntries(MUEBLES.map(m => [m.id, 0])),   // construidos y guardados, sin colocar
  colocados: {},                    // "col,fila" (casilla de arriba a la izquierda) -> indice en MUEBLES
  casa: { suelo: 'madera', colorSuelo: -1, pared: 'rayas', colorPared: -1 },   // reformas; color = indice en TINTES o -1 (natural)
  paredes: {},                      // igual, para lo que se cuelga en la pared de casa
  suelos: {},                       // igual, pero la capa de suelo (alfombras): se pisan y pueden tener muebles encima
  peceras: {},                      // "col,fila" -> id de la criatura que vive en esa pecera (o null si esta vacia)
  pecera: null,                     // { clave, opciones } si se esta eligiendo quien vive en una pecera
  decorar: null,                    // { c, f, sel, fallo } cursor del modo decorar
  enciclopedia: false,              // si la enciclopedia esta abierta
  fundido: null,                    // { t, hecho, accion } transicion en iris al entrar, salir, dormir o viajar
  lugar: null,                      // { nombre, t } cartel con el nombre del sitio al que se acaba de llegar
  sentada: null,                    // { c, f, vuelta: { x, y } } si la gatita descansa en un banco (no se guarda)
  navegando: false,                 // en la barquita, por el mar (no se guarda: al cargar vuelve al embarcadero)
  conchitas: 0,                     // lo que se cobra en la tiendecita de Bellota
  dia: 0,                           // dias que han pasado (cada dia la marea cambia la playa)
  playa: null,                      // lo del mar de hoy (ver prepararMar)
  castillos: {},                    // "col,fila" -> etapa (0-3) de cada castillo de arena; la marea se los lleva cada noche
  cartas: [],                       // indices de CARTAS ya leidas (en orden)
  tesoroX: null,                    // { c, f } cruz de un mapa: ahi hay algo enterrado
  talados: [],                      // "c,f" de los arboles del valle que se han talado con el hacha
  talar: null,                      // { k, c, f, golpes, sacude } arbol que se esta talando (no se guarda)
  excavar: null,                    // { dia, sitios: [{ c, f, cavado }], oculto: { c, f, cavado } } montoncitos de hoy
  cavar: null,                      // minijuego de cavar (no se guarda)
  radarT: 0,                        // tiempo hasta el proximo pitido de Pipi (no se guarda)
  recuerdos: {},                    // veces que se ha visto o hecho algo del mar (ballena, rescate_foca, castillo...)
  corales: {},                      // "col,fila" -> { etapa } corales plantados en el jardin del fondo
  barcaEn: null,                    // { c, f } si la barca esta amarrada en otra orilla (null = en el embarcadero)
  buceo: null,                      // { vuelta: { x, y }, navegando } bajo el agua (no se guarda)
  avistamiento: null,               // { tipo, x, y, t, lado } lo que se esta viendo desde la barca (no se guarda)
  esperaAvistamiento: 8,            // segundos hasta el siguiente intento de avistamiento
  tienda: null,                     // { pestana: 'comprar' | 'vender' } si la tiendecita esta abierta
  hogar: null,                      // { casa: { c, f }, huerto: { c, f } } donde se eligio vivir (null = aun por elegir)
  elegir: null,                     // { paso: 'casa' | 'huerto', c, f, casa, fallo, espera } eligiendo ese sitio (no se guarda)
  descanso: 0,                      // segundos que faltan para poder dormir otra vez
  premio: null,                     // { t, id } objeto que se muestra sobre la gatita al conseguirlo
  consejos: {},                     // acciones cuyo consejo de controles ya se ha visto (solo se explica la primera vez)
  consejo: null,                    // { clave, t } consejo que se esta mostrando bajo el juego
  ultimoUso: 0,                     // reloj de la ultima tecla o clic que no era moverse (el HUD se aparta si no se usa)
  alfaHud: 1,
  reloj: 0,
};
window.__juego = estado;            // para inspeccionar el juego desde la consola

// Anade un objeto al inventario y a la enciclopedia. Devuelve true si es la primera vez.
function dar(id) {
  estado.inv[id] = (estado.inv[id] || 0) + 1;
  const nuevo = !estado.vistos[id];
  estado.vistos[id] = (estado.vistos[id] || 0) + 1;
  return nuevo;
}
const quitar = id => { estado.inv[id]--; };
// Aviso: una tarjetita con el dibujo del objeto (si lo hay) que entra por la izquierda y se va sola.
// grupo: un aviso nuevo del mismo grupo sustituye al anterior (p. ej. al ir cambiando el suelo).
function avisar(texto, id, grupo) {
  const caja = document.getElementById('avisos');
  if (!caja) return;
  if (grupo) for (const viejo of caja.querySelectorAll('[data-grupo="' + grupo + '"]')) viejo.remove();
  const div = document.createElement('div');
  div.className = 'aviso';
  if (grupo) div.dataset.grupo = grupo;
  const d = id && dibujoDe(id);
  if (d) {
    const icono = document.createElement('canvas');
    icono.width = icono.height = T;
    icono.getContext('2d').drawImage(d.tira, d.n * T, 0, T, T, 0, 0, T, T);
    div.appendChild(icono);
    if (esVariante(id) || ficha(id).r >= 3) div.classList.add('especial');
  }
  const txt = document.createElement('span');
  txt.innerHTML = marcarTexto(escaparHtml(texto));
  div.appendChild(txt);
  caja.appendChild(div);
  while (caja.children.length > 3) caja.firstChild.remove();
  setTimeout(() => div.classList.add('sale'), 4200);
  setTimeout(() => div.remove(), 4800);
}

const teclas = new Set();
addEventListener('keydown', e => {
  const escribiendo = e.target.tagName === 'INPUT';
  if (!escribiendo && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  if (estado.decorar && (e.code === 'Tab' || e.code === 'Backspace' || (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)))) e.preventDefault();
  if (e.repeat) return;
  teclas.add(e.code);
  if (!(e.code in FLECHAS)) estado.ultimoUso = estado.reloj;
  // En el inicio, Enter empieza; Espacio tambien, salvo mientras se escribe el nombre.
  if (estado.ayuda) { e.preventDefault(); teclaAyuda(e.code); return; }   // va antes del inicio: la ayuda se abre tambien desde ahi
  if (estado.inicio) { if (e.code === 'Enter' || (e.code === 'Space' && !escribiendo)) { e.preventDefault(); empezar(); } return; }
  if (estado.ajustes) { if (e.code === 'Escape') abrirAjustes(false); return; }
  if (estado.fundido) return;
  if (estado.elegir) { teclaElegir(e.code); return; }
  if (estado.dialogo) {
    if (['Space', 'Enter', 'KeyE'].includes(e.code)) avanzarDialogo();
    else if (e.code === 'Escape') cerrarDialogo();
    return;
  }
  if (estado.bolsa) { teclaBolsa(e.code, e); return; }
  if (estado.tienda) {
    if (['Escape', 'KeyE', 'Space'].includes(e.code)) abrirTienda(false);
    else if (['Tab', 'KeyQ', 'KeyR', 'ArrowLeft', 'ArrowRight'].includes(e.code)) { e.preventDefault(); cambiarPestanaTienda(); }
    return;
  }
  if (estado.vestidor) { teclaVestidor(e.code); return; }
  if (estado.enciclopedia) { teclaDiario(e.code, e); return; }
  if (estado.tejer) { teclaTejer(e.code); return; }
  if (estado.pecera) { teclaPecera(e.code); return; }
  if (estado.decorar) { teclaDecorar(e.code, e); return; }
  if (e.code === 'Escape' && estado.pesca) { estado.pesca = null; return; }
  if (e.code === 'Escape' && estado.cavar) { estado.cavar = null; sonar('recoger'); return; }
  if (e.code === 'KeyM') { Sonido.alternar('musica'); return; }
  const libre = !estado.pesca && !estado.cavar && estado.gata.anim !== 'alegria';
  if (e.code === 'KeyC' && libre) { abrirEnciclopedia(true); return; }
  if (e.code === 'KeyH' && libre) { abrirAyuda(true); return; }
  if (e.code === 'KeyI' && libre) { abrirBolsa(true); return; }
  if (e.code === 'Escape' && estado.saquito) { alternarSaquito(); return; }
  if (e.code === 'Escape' && libre) { abrirAjustes(true); return; }
  if (e.code === 'KeyG') { alternarSaquito(); return; }
  if (e.code === 'KeyN') {
    if (estado.herramientas.mapa) { estado.mapaVisible = !estado.mapaVisible; sonar(estado.mapaVisible ? 'abrir' : 'recoger'); }
    else avisar('Aún no tienes mapa. Quizá algún vecino te regale uno si os hacéis amigos…');
    return;
  }
  if (e.code === 'KeyB' && libre) {
    if (enPueblo(casillaActual().f)) avisar('El pueblo es de todos: decora tu casita o tu valle.');
    else if (bajoAgua(casillaActual().f)) avisar('Bajo el agua no se decora… ¡pero puedes plantar coral!');
    else abrirDecorar();
    return;
  }
  if ((e.code === 'KeyQ' || e.code === 'KeyR') && estado.saquito) { cambiarSemilla(e.code === 'KeyQ' ? -1 : 1); return; }
  if (e.code === 'Space' || e.code === 'KeyE') actuar();
  const numero = NUMEROS.indexOf(e.code);
  if (numero >= 0 && numero < CULTIVOS.length) { estado.semilla = numero; sonar('elegir'); }
});

// Saquito de semillas: solo se ve al abrirlo con G o con su boton del HUD.
function alternarSaquito() {
  if (!estado.saquito && (!barraVisible() || !nadaAbierto() || estado.bolsa || estado.enciclopedia || estado.ajustes)) {
    if (!estado.inicio && regionDe(casillaActual().f).id !== 'valle') avisar('Las semillas se plantan en la tierra del huerto de tu valle.');
    return;
  }
  estado.saquito = !estado.saquito;
  sonar(estado.saquito ? 'abrir' : 'recoger');
}
// Con el saquito abierto, Q y R (o la rueda del raton) pasan a la semilla anterior o a la siguiente.
function cambiarSemilla(paso) {
  estado.semilla = (estado.semilla + paso + CULTIVOS.length) % CULTIVOS.length;
  sonar('cursor');
}
// Raton sobre el lienzo: la rueda cambia de semilla y un clic en la barra la elige.
const aLienzo = e => [e.offsetX / lienzo.clientWidth * lienzo.width, e.offsetY / lienzo.clientHeight * lienzo.height];
lienzo.addEventListener('wheel', e => {
  if (!nadaAbierto() || estado.bolsa || estado.ajustes || estado.enciclopedia) return;
  e.preventDefault();
  estado.ultimoUso = estado.reloj;
  if (estado.decorar) { pasarOpcion(estado.decorar, e.deltaY > 0 ? 1 : -1); return; }
  if (estado.saquito) cambiarSemilla(e.deltaY > 0 ? 1 : -1);
}, { passive: false });
lienzo.addEventListener('pointerdown', e => {
  estado.ultimoUso = estado.reloj;
  const [x, y] = aLienzo(e);
  if (estado.elegir && !estado.inicio && !estado.ajustes && !estado.ayuda) { if (e.button === 0) { ratonElegir(x, y); confirmarElegir(); } return; }
  if (estado.decorar && !estado.inicio && !estado.ajustes && !estado.ayuda) { clicDecorar(x, y, e.button); return; }
  const n = casillaBarra(x, y);
  if (n >= 0 && nadaAbierto()) { estado.semilla = n; sonar('elegir'); }
});
lienzo.addEventListener('contextmenu', e => { if (estado.decorar) e.preventDefault(); });
lienzo.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || estado.inicio) return;
  if (estado.elegir) ratonElegir(...aLienzo(e));
  else if (estado.decorar) ratonDecorar(...aLienzo(e));
});
addEventListener('pointermove', () => { estado.ultimoUso = estado.reloj; });
addEventListener('keyup', e => teclas.delete(e.code));
addEventListener('blur', () => teclas.clear());

const tile = (c, f) => (MAPA[f] && MAPA[f][c]) || null;
const esCesped = (c, f) => tile(c, f) === 'G' || tile(c, f) === 'F';

// Casilla sobre la que estan los pies de la gatita.
function casillaActual() {
  const g = estado.gata;
  return { c: Math.floor((g.x + 8) / T), f: Math.floor((g.y + 14) / T) };
}

// Primera casilla pegada a la gatita (arriba, derecha, abajo, izquierda) que cumple la prueba.
function vecina(prueba) {
  const { c, f } = casillaActual();
  for (const [dc, df] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
    if (prueba(c + dc, f + df)) return { c: c + dc, f: f + df };
  }
  return null;
}
const aguaCercana = () => vecina((c, f) => tile(c, f) === 'W');
// Con los vecinos basta con estar al lado, tambien en diagonal.
function vecinoCercano() {
  const pegado = vecina((c, f) => !!vecinoEn(c, f));
  if (pegado) return pegado;
  const { c, f } = casillaActual();
  for (const [dc, df] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) if (vecinoEn(c + dc, f + df)) return { c: c + dc, f: f + df };
  return null;
}
const cestaCercana = () => vecina(esCesta);
// Dia de lluvia tejiendo en casa: las prendas necesitan la mitad de puntos.
const tejerEnCasaConLluvia = () => llueve() && estaDentro(casillaActual().f);
const hayTinte = () => TINTES.some(t => buscar(t.coste));
// Expositor (pecera, pecera grande o vitrina) en una casilla, aunque ocupe varias.
const expositorEn = (c, f) => { const m = muebleEn(c, f); return m && MUEBLES[m.n].expone ? m : null; };
const peceraCercana = () => { const v = vecina((c, f) => !!expositorEn(c, f)); return v && expositorEn(v.c, v.f); };

// Que se puede hacer ahora: 'plantar', 'regar', 'cosechar', 'tejer', 'sinTinte', 'pescar',
// 'recoger' (la cana), 'atrapar' (lo que pica), 'tirar' (barra de pesca) o null.
function accionPosible() {
  if (estado.cavar) return 'golpe';
  if (estado.pesca) {
    return { lanza: 'recoger', espera: 'recoger', pica: 'atrapar', tirar: 'tirar' }[estado.pesca.fase] || null;
  }
  if (estado.sentada) return 'levantarse';
  // Desde la barca se pesca en cualquier sitio; junto a una orilla se puede bajar (y la barca se queda alli).
  if (estado.navegando) return enAmarre() ? 'desembarcar' : accionEnAgua() || (orillaCercana() ? 'desembarcar' : 'pescar');
  if (nadando()) return accionEnAgua();
  const { c, f } = casillaActual();
  if (bajoAgua(f)) return accionMar();
  if (tile(c, f) === 'T') {
    const p = estado.parcelas[c + ',' + f];
    if (!p || !p.cultivo) return 'plantar';
    if (p.cultivo.etapa >= 3) return 'cosechar';
    if (!p.regada) return 'regar';
    return estado.inv[AGUACATE.id] > 0 ? 'abonar' : null;     // ya regada: si llevas aguacate, se puede abonar
  }
  if (esSalida(c, f)) return 'salir';
  if (vecina(esArmario)) return 'armario';
  if (vecinoCercano()) return 'vecino';
  if (vecina(esTablon)) return 'tablon';
  if (vecina(esTienda)) return 'tienda';
  if (vecina(bancoEn)) return 'sentarse';
  if (vecina(esCama)) return estado.descanso > 0 ? 'sinSueno' : 'dormir';
  const expositor = peceraCercana();
  if (expositor) return MUEBLES[expositor.n].expone === 'tesoro' ? 'vitrina' : 'pecera';
  if (vecina((vc, vf) => vc === CASA.puerta.c && vf === CASA.puerta.f)) return 'entrar';
  if (cestaCercana()) return hayTinte() ? 'tejer' : 'sinTinte';
  if (sitioCercano()) return nivelPala() ? 'excavar' : 'sinPala';
  const mar = accionMar();
  if (mar) return mar;
  const b = estado.barcaEn;
  if (b && estado.herramientas.barca && vecina((vc, vf) => vc === b.c && vf === b.f)) return 'barca';
  if (!b && tile(c, f) === 'M' && vecina((vc, vf) => vc === AMARRE.c && vf === AMARRE.f)) return estado.herramientas.barca ? 'barca' : 'sinBarca';
  if (aguaCercana()) return 'pescar';
  if (estado.herramientas.hacha && vecina(arbolTalable)) return 'talar';
  return castilloPosible() ? 'castillo' : null;
}
// Nadando con el flotador: los pies estan en el agua.
const nadando = () => !estado.navegando && tile(casillaActual().c, casillaActual().f) === 'W';
const enAmarre = () => { const { c, f } = casillaActual(); return c === AMARRE.c && f === AMARRE.f; };
// Zona de la que pica lo que se pesca: desde la barca, alta mar; si no, el agua donde cae el anzuelo.
const zonaPesca = sitio => estado.navegando ? 'alta' : zonaDe(sitio.c, sitio.f);
// Subir a la barca (desde la punta del embarcadero) y bajar de ella (volviendo al amarre).
function embarcar() {
  const s = sitioBarca();
  estado.navegando = true;
  estado.barcaEn = null;
  llevarGata(s.c, s.f, 'frente');
  if (s === AMARRE) estado.gata.x += 6;   // un poco hacia el mar, para que la barca no pise el muelle
  cam.lista = true;
  chispas(s.c * T + 8, s.f * T + 12, COLOR.crema, 8, { fuerza: 16, gravedad: 40, vida: 0.5 });
  sonar('abrir');
}
// Bajar de la barca: en el amarre, al embarcadero; en cualquier otra orilla (playa, islotes...), la barca se queda alli.
function desembarcar() {
  if (enAmarre()) {
    estado.navegando = false;
    llevarGata(EMBARCADERO.c, EMBARCADERO.punta, 'espalda');
  } else {
    const t = orillaCercana(), aqui = casillaActual();
    estado.navegando = false;
    estado.barcaEn = aqui;
    llevarGata(t.c, t.f, t.c !== aqui.c ? 'lado' : t.f < aqui.f ? 'espalda' : 'frente');
    estado.gata.espejo = t.c < aqui.c;
    const isla = isloteEn(t.c, t.f);
    if (isla) estado.lugar = { antes: '~ has llegado a ~', nombre: isla.nombre, t: 0 };
  }
  cam.lista = true;
  sonar('recoger');
}

// Bajo el arco del valle se va al pueblo, y por el arco de abajo del pueblo se vuelve. Al llegar sale el nombre del sitio.
function viajar() {
  if (estado.fundido || estado.decorar) return;
  const { c, f } = casillaActual(), r = regionDe(f).id;
  if (r === 'valle' && f <= ARCO.f && Math.abs(c - ARCO.c) <= 1) irA(LLEGADA_PUEBLO, 'espalda', '~ has llegado a ~', PUEBLO.nombre);
  else if (r === 'pueblo' && f >= SALIDA_PUEBLO.f) irA(LLEGADA_VALLE, 'frente', '~ de vuelta en ~', 'tu valle');
}
function irA(destino, mira, antes, nombre) {
  estado.pesca = null;
  sonar('abrir');
  fundir(() => { llevarGata(destino.c, destino.f, mira); estado.lugar = { antes, nombre, t: 0 }; });
}
// Los vecinos cambian de sitio (su puerta o su paseo) segun la hora, pero nunca delante de ti:
// solo cuando no se les ve.
function moverVecinos() {
  if (estado.dialogo) return;
  for (const v of VECINOS) {
    const s = sitioVecino(v);
    if (s.c === v.c && s.f === v.f) continue;
    const visto = (x, y) => regionDe(casillaActual().f) === regionDe(y) && enVista(x * T, y * T, cam.x, cam.y, 24);
    const aqui = casillaActual();
    if (visto(v.c, v.f) || visto(s.c, s.f) || (aqui.c === s.c && aqui.f === s.f)) continue;
    v.c = s.c; v.f = s.f;
  }
}

// Sentarse en un banco: la gatita se sube al asiento mirando hacia donde mira el banco y el dia pasa
// mas deprisa (para esperar a que llegue la tarde o la noche). Moverse o Espacio la levantan donde estaba.
function sentarse(b) {
  const g = estado.gata;
  estado.sentada = { c: b.c, f: b.f, vuelta: { x: g.x, y: g.y } };
  g.x = b.c * T; g.y = b.f * T - (b.muelle ? 4 : b.mira === 0 ? 5 : 10); g.mira = b.muelle || b.mira === 0 ? 'frente' : 'lado'; g.espejo = b.mira < 0; g.anim = 'reposo'; g.t = 0;
  chispas(g.x + 8, g.y + 4, '#F7A6B4', 6, { fuerza: 14, gravedad: -10, vida: 0.8 });
  sonar('recoger');
  avisar(b.muelle ? 'Te sientas en la punta del embarcadero, con las patitas colgando sobre el mar… El tiempo pasa más deprisa'
    : 'Te sientas un ratito… Qué a gusto se está. El tiempo pasa más deprisa mientras descansas');
}
function levantarse() {
  const s = estado.sentada;
  if (!s) return;
  estado.sentada = null;
  Object.assign(estado.gata, s.vuelta, { anim: 'reposo', t: 0 });
}

// Oscurece la pantalla, hace algo a mitad (cambiar de sitio, dormir) y vuelve a aclarar.
function fundir(accion) { estado.fundido = { t: 0, hecho: false, accion }; }
const DURACION_FUNDIDO = 1;         // segundos de la transicion en iris (ver dibujarIris)
function llevarGata(c, f, mira) {
  const g = estado.gata;
  g.x = c * T; g.y = f * T - 6; g.mira = mira; g.anim = 'reposo'; g.t = 0;
  cam.lista = false;                // la camara salta de golpe, sin deslizarse
}

// Gira a la gatita hacia una casilla vecina (para pescar o tejer mirando a lo que usa).
function mirarHacia(c, f) {
  const g = estado.gata, aqui = casillaActual();
  if (c !== aqui.c) { g.mira = 'lado'; g.espejo = c < aqui.c; }
  else g.mira = f < aqui.f ? 'espalda' : 'frente';
  g.t = 0;
}

// Particulas: puntitos de colores que salen al regar, cosechar, colocar... Solo adorno.
const particulas = [];
function chispas(x, y, color, cuantas, { fuerza = 20, gravedad = 60, vida = 0.6, arriba = 0 } = {}) {
  for (let i = 0; i < cuantas; i++) {
    const angulo = Math.random() * Math.PI * 2, v = fuerza * (0.4 + Math.random() * 0.6);
    particulas.push({ x, y, vx: Math.cos(angulo) * v, vy: Math.sin(angulo) * v - arriba, gravedad, color, t: 0, vida: vida * (0.6 + Math.random() * 0.4) });
  }
}
const sobreGata = () => [estado.gata.x + 8, estado.gata.y + 4];

// La gatita celebra. Si se pasa un objeto, se muestra sobre su cabeza.
function celebrar(id) {
  chispas(...sobreGata(), id && esLuminoso(id) ? '#7DF9FF' : COLOR.mantequilla, id && esVariante(id) ? 26 : 12, { fuerza: 34, vida: 0.8, arriba: 20 });
  estado.premio = id ? { t: 0, id } : null;
  estado.gata.anim = 'alegria';
  estado.gata.t = 0;
}

// Entrega un objeto recien conseguido: inventario, enciclopedia, aviso, sonido y celebracion.
function conseguir(id, verbo) {
  const nuevo = dar(id);
  const fi = ficha(id);
  const rareza = fi.r >= 0 ? ' · ' + RAREZAS[fi.r].nombre : '';
  avisar(verbo + ': ' + nombreDe(id) + rareza + (nuevo ? ' · ¡nueva en la enciclopedia!' : ''), id);
  celebrar(id);
  const especial = esVariante(id) || fi.r >= 3;
  sonar(especial ? 'dorado' : fi.tipo === 'fauna' ? 'pez' : 'cosechar');
}

// Reloj de los minijuegos: { tiempo, tiempoMax, menos } dentro de estado.pesca o estado.tejer.
function relojNuevo(segundos) { return conTiempo ? { tiempo: segundos, tiempoMax: segundos, menos: 0 } : { tiempo: null }; }
function restarTiempo(o) {
  if (o.tiempo == null) return;
  o.tiempo = Math.max(0, o.tiempo - CASTIGO_FALLO);
  o.menos = 0.6;                    // la barra del reloj parpadea y tiembla un momento
}
// Descuenta el tiempo; devuelve true cuando se acaba.
function correReloj(o, dt) {
  if (!o || o.tiempo == null) return false;
  o.menos = Math.max(0, o.menos - dt);
  o.tiempo = Math.max(0, o.tiempo - dt);
  return o.tiempo <= 0;
}
function seAcaboPesca() {
  const p = estado.pesca;
  p.fase = 'escapo'; p.t = 0;
  sonar('escapo');
  avisar('¡Se acabó el tiempo y se ha escapado! No pasa nada' + (p.cebo ? ', el cebo no se gasta' : '') + ': ¡prueba otra vez!');
}
function seAcaboTejer() {
  const tj = estado.tejer;
  estado.tejer = { fase: 'elegir', prenda: tj.prenda, sentar: tj.sentar };   // se vuelve a elegir tinte; el tinte no se ha gastado
  sonar('escapo');
  avisar('¡Uy, se ha enredado la lana! El tinte no se gasta: elige otra vez y vuelve a intentarlo.');
}
function cambiarConTiempo() {
  conTiempo = !conTiempo;
  try { localStorage.setItem(CLAVE_RETO, conTiempo ? 'si' : 'no'); } catch (e) { }
  pintarBotonReto();
  sonar('elegir');
}
function pintarBotonReto() {
  const b = document.getElementById('botonReto');
  if (b) b.textContent = 'Minijuegos con tiempo: ' + (conTiempo ? 'sí' : 'no');
}

function nuevaZona() { return 6 + Math.random() * (BARRA.ancho - BARRA.zona - 12); }

function actuar() {
  const g = estado.gata;
  if (UNA_VEZ.has(g.anim)) return;
  const accion = accionPosible();
  const pe = estado.pesca;
  if (actuarMar(accion) || actuarCavar(accion)) return;
  if (accion === 'pescar') {
    // Pican entre 2 y 5 segundos despues de lanzar (entre 1 y 2,5 con la cana de la suerte).
    // Con un cebo brillante en la bolsa pican el doble de rapido (el cebo solo se gasta si pescas algo).
    const cebo = (estado.inv[CEBO.id] || 0) > 0;
    const limite = (2 + Math.random() * 3) * (estado.herramientas.cana ? 0.5 : 1) * (cebo ? 0.5 : 1);
    const sitio = aguaCercana() || casillaActual();
    estado.pesca = { fase: 'lanza', t: 0, limite, cebo, ...sitio, ...destinoFlotador(sitio), donde: zonaPesca(sitio), giro: Math.random() * 6 };
    mirarHacia(estado.pesca.c, estado.pesca.f);
    sonar('lanzar');
  } else if (accion === 'recoger') {
    estado.pesca = null;
    sonar('recoger');
  } else if (accion === 'atrapar') {
    sonar('abrir');
    // Empieza la barra: hay que acertar varias veces en la zona verde.
    Object.assign(pe, { fase: 'tirar', t: 0, pos: 0, dir: 1, zona: nuevaZona(), aciertos: 0, perfectos: 0, destello: 0, fallo: 0, ...relojNuevo(TIEMPO_PESCA) });
  } else if (accion === 'tirar') {
    const centro = pe.pos + 1 - (pe.zona + BARRA.zona / 2);
    if (Math.abs(centro) <= BARRA.zona / 2) {
      pe.aciertos++;
      if (Math.abs(centro) <= BARRA.centro / 2) pe.perfectos++;
      pe.destello = 0.25;
      pe.zona = nuevaZona();
      sonar('acierto', pe.aciertos);
      if (pe.aciertos >= ACIERTOS_PESCA) {
        // Los aciertos en el centro mejoran las probabilidades de algo raro o brillante.
        estado.pesca = null;
        const conCebo = pe.cebo && estado.inv[CEBO.id] > 0;
        if (conCebo) quitar(CEBO.id);
        if (!conCebo && Math.random() < PROB_AGUACATE) conseguir(AGUACATE.id, '¡Uy! Ha picado algo que refunfuña');
        else if ((pe.donde === 'mar' || pe.donde === 'alta') && Math.random() < PROB_FOSIL) conseguir(alAzar(FOSILES_MAR), 'Algo pesado se ha enganchado al anzuelo… ¡es un fósil! Has pescado');
        else conseguir(sortearCriatura(pe.donde, pe.perfectos + (conCebo ? CEBO.perfectos : 0)), conCebo ? 'Ha picado gracias al cebo' : 'Has pescado');
        if (estado.premio) estado.premio.desde = { x: pe.bx, y: pe.by };      // sale del agua dando un saltito hasta la gatita
        chispas(pe.bx, pe.by, '#FFFBF3', 10, { fuerza: 34, arriba: 26, vida: 0.6 });
        chispas(pe.bx, pe.by, '#A9D8E8', 8, { fuerza: 28, arriba: 20, vida: 0.6 });
      }
    } else {
      pe.fallo = 0.25;              // fallar no quita nada de la bolsa: solo un poquito de tiempo
      restarTiempo(pe);
      sonar('fallo');
    }
  } else if (accion === 'vecino') {
    const lugar = vecinoCercano();
    mirarHacia(lugar.c, lugar.f);
    hablar(vecinoEn(lugar.c, lugar.f));
  } else if (accion === 'tablon') {
    mirarHacia(TABLON.c, TABLON.f);
    leerTablon();
  } else if (accion === 'tienda') {
    mirarHacia(...Object.values(vecina(esTienda)));
    abrirTienda(true);
  } else if (accion === 'sentarse') {
    sentarse(bancoEn(...Object.values(vecina(bancoEn))));
  } else if (accion === 'levantarse') {
    levantarse();
  } else if (accion === 'barca') {
    embarcar();
  } else if (accion === 'desembarcar') {
    desembarcar();
  } else if (accion === 'sinBarca') {
    sonar('fallo');
    avisar('Aquí se amarra una barca. Bellota vende una en su tiendecita del pueblo.');
  } else if (accion === 'armario') {
    mirarHacia(INTERIOR.armario.c, INTERIOR.armario.f);
    abrirVestidor(true);
  } else if (accion === 'entrar') {
    sonar('abrir');
    fundir(() => {
      llevarGata(INTERIOR.salida.c, INTERIOR.salida.f - 1, 'espalda');
      // Al entrar, el boton del sillon invita a decorar durante unos segundos (y el HUD se deja ver).
      estado.invitaDecorar = estado.reloj;
      estado.ultimoUso = estado.reloj;
    });
  } else if (accion === 'salir') {
    sonar('recoger');
    fundir(() => llevarGata(CASA.puerta.c, CASA.puerta.f + 1, 'frente'));
  } else if (accion === 'dormir') {
    sonar('dormir');
    fundir(() => {
      // Una siesta: todo lo plantado crece una etapa, este regado o no.
      let crecidos = 0;
      for (const p of Object.values(estado.parcelas)) {
        if (p.cultivo && p.cultivo.etapa < 3) { p.cultivo.etapa++; p.cultivo.t = 0; p.regada = false; crecidos++; }
      }
      estado.descanso = DESCANSO;
      if (oscuridad(estado.hora) > 0.5) { estado.hora = 0.02; nuevoDia(); }   // si era de noche, amanece un dia nuevo
      avisar((crecidos ? 'Has dormido una siesta: ' + crecidos + (crecidos === 1 ? ' cultivo ha crecido' : ' cultivos han crecido') : 'Has dormido una siesta. ¡Qué bien se descansa en casa!')
        + (llueve() ? ' · Fuera está lloviendo: buen día para tejer en casa' : ''));
    });
  } else if (accion === 'pecera' || accion === 'vitrina') {
    const { c, f, clave, n } = peceraCercana();
    mirarHacia(c, f);
    abrirPecera(clave, n);
  } else if (accion === 'tejer') {
    g.mira = 'frente'; g.espejo = false; g.t = 0;
    estado.tejer = { fase: 'prenda', sentar: 0 };
    cojinTejer = { x: g.x, y: g.y, t: 0, fuera: false };
    chispas(g.x + 8, g.y + 15, COLOR.algodon, 8, { fuerza: 18, gravedad: 10, vida: 0.5 });
    sonar('cojin');
  } else if (accion === 'abonar') {
    // El aguacate refunfuna, se deshace en la tierra y la planta crece una etapa de golpe (sigue regada).
    const { c, f } = casillaActual(), p = estado.parcelas[c + ',' + f];
    quitar(AGUACATE.id);
    g.anim = 'cultivar'; g.t = 0;
    p.cultivo.etapa++;
    p.cultivo.t = 0;
    chispas(c * T + 8, f * T + 8, '#7FBF8E', 10, { fuerza: 20, gravedad: -12, vida: 0.7 });
    chispas(c * T + 8, f * T + 10, '#C08A63', 6, { fuerza: 14, vida: 0.5, arriba: 10 });
    sonar('crecer');
    avisar(p.cultivo.etapa >= 3 ? 'El aguacate malvado refunfuña… ¡y tu planta ya está lista para cosechar!'
      : 'El aguacate malvado refunfuña… ¡y tu planta pega un estirón!', AGUACATE.id);
  } else if (accion === 'plantar' || accion === 'regar' || accion === 'cosechar') {
    const { c, f } = casillaActual();
    const clave = c + ',' + f;
    const p = estado.parcelas[clave] || (estado.parcelas[clave] = { regada: false, cultivo: null });
    const cx = c * T + 8, cy = f * T + 9;
    if (accion === 'plantar' || accion === 'regar') { g.anim = accion === 'regar' ? 'regar' : 'cultivar'; g.t = 0; }
    if (accion === 'plantar') {
      p.cultivo = { tipo: CULTIVOS[estado.semilla].id, etapa: 0, t: 0 };
      chispas(cx, cy + 3, COLOR.cacao, 5, { fuerza: 16, vida: 0.4, arriba: 14 });
      sonar('plantar');
    }
    if (accion === 'regar') {
      p.regada = true;
      chispas(cx, cy - 6, COLOR.cielo, 9, { fuerza: 14, gravedad: 120, vida: 0.5 });
      if (estado.herramientas.regadera) {
        // La regadera grande moja tambien lo plantado en las ocho casillas de alrededor.
        for (let df = -1; df <= 1; df++) for (let dc = -1; dc <= 1; dc++) {
          const otra = estado.parcelas[(c + dc) + ',' + (f + df)];
          if (!otra || !otra.cultivo || otra.regada || otra.cultivo.etapa >= 3) continue;
          otra.regada = true;
          chispas((c + dc) * T + 8, (f + df) * T + 3, COLOR.cielo, 5, { fuerza: 12, gravedad: 120, vida: 0.5 });
        }
      }
      sonar('regar');
    }
    if (accion === 'cosechar') {
      const id = p.cultivo.tipo + (Math.random() < BRILLO_CULTIVO ? '*' : '');
      p.cultivo = null;
      p.regada = false;
      conseguir(id, 'Has cosechado');
    }
  }
}

// Teclas mientras se teje: elegir prenda, elegir tinte y luego la flecha del boton de costura que brilla.
function teclaTejer(codigo) {
  const tj = estado.tejer;
  if (tj.fase === 'rematar') return;
  if (codigo === 'Escape') { estado.tejer = null; sonar('recoger'); return; }
  if (tj.fase === 'prenda') {
    const prenda = PRENDAS[NUMEROS.indexOf(codigo)];
    if (!prenda) return;
    Object.assign(tj, { fase: 'elegir', prenda });
    sonar('elegir');
  } else if (tj.fase === 'elegir') {
    const tinte = TINTES[NUMEROS.indexOf(codigo)];
    if (!tinte) return;
    if (!buscar(tinte.coste)) { sonar('fallo'); return; }
    const puntos = tejerEnCasaConLluvia() ? Math.ceil(tj.prenda.puntos / 2) : tj.prenda.puntos;
    const patron = Array.from({ length: puntos }, () => Math.floor(Math.random() * 4));
    Object.assign(tj, { fase: 'tejiendo', tinte, patron, i: 0, fallo: 0, racha: 0, calor: 0, contenta: 0, golpe: 1, mostrados: 0, flash: null, efectos: [],
      ...relojNuevo(TIEMPO_TEJER_BASE + puntos * TIEMPO_PUNTO) });
    sonar('elegir');
  } else if (codigo in FLECHAS && tj.sentar >= DURACION_SENTARSE) {
    // Equivocarse no deshace puntos: el boton tiembla, se enreda un poquito la lana, se enfria la racha y resta tiempo.
    if (FLECHAS[codigo] !== tj.patron[tj.i]) { tj.fallo = 0.35; tj.racha = 0; restarTiempo(tj); sonar('enredo'); return; }
    puntoTejido(tj);
  }
}
function puntoTejido(tj) {
  const geo = geometriaTejer(tj), molde = celdasMolde(tj.prenda.id), antes = objetivoMolde(tj, molde);
  brotesTejer(tj, geo, tj.i);
  tj.i++; tj.racha++;
  tj.contenta = 0.3; tj.golpe = 0;
  tj.flash = { desde: antes, hasta: objetivoMolde(tj, molde), t: 0 };
  const g = estado.gata;
  chispas(g.x + 8, g.y + 13, mezclarColor(tj.tinte.color, '#FFF6D6', 0.5), 2, { fuerza: 8, gravedad: -14, vida: 1.1 });   // pelusas
  sonar('punto', tj.i - 1);
  if (tj.racha >= 3 && tj.racha % 3 === 0) {
    sonar('racha', tj.racha);
    const b = geo.botones[tj.i - 1];
    for (let k = 0; k < 3; k++) tj.efectos.push(notaTejer(b.x + 4 + (k - 1) * 6, b.y - 4, BOTONES_TEJER[(b.dir + k) % 4].sombra));
  }
  if (tj.i >= tj.patron.length) rematarTejer(tj, geo);
}
// Ultimo punto: se gasta el tinte, la prenda va al armario y se la pone, se levanta del cojin de un salto y la
// prenda sube brillando sobre su cabeza (fase 'rematar', DURACION_REMATAR); luego se cierra el panel.
function rematarTejer(tj, geo) {
  const gastado = buscar(tj.tinte.coste);   // el tinte solo se gasta al terminar
  if (gastado) quitar(gastado);
  dar(tj.prenda.id);
  estado.armario.push({ tipo: tj.prenda.id, color: tj.tinte.color });
  estado.ropa[tj.prenda.id] = tj.tinte.color;
  Object.assign(tj, { fase: 'rematar', t: 0 });
  const { cx, cy } = geo.aro;
  for (let k = 0; k < 10; k++) {
    const a = k / 10 * Math.PI * 2;
    tj.efectos.push({ tipo: 'estrella', x: cx, y: cy, vx: Math.cos(a) * 34, vy: Math.sin(a) * 34 - 8, t: 0, vida: 0.8, roce: 3, color: k % 2 ? COLOR.mantequilla : mezclarColor(tj.tinte.color, '#FFF6D6', 0.3) });
  }
  for (let k = 0; k < 4; k++) tj.efectos.push(notaTejer(cx - 12 + k * 8, cy - 14, BOTONES_TEJER[k].sombra));
  celebrar(null);
  sonar('bufanda');
}

// Elegir que va dentro de un expositor: de la bolsa, primero lo mas especial (hasta 10).
// En las peceras, criaturas; en la vitrina, lo brillante, epico o legendario (criaturas o cosechas).
function criaturasParaPecera(tipo = 'fauna') {
  const valor = id => (esVariante(id) ? 10 : 0) + ficha(id).r;
  const vale = tipo === 'tesoro' ? id => esVariante(id) || ficha(id).r >= 3 : id => ficha(id).tipo === 'fauna';
  return Object.keys(estado.inv).filter(id => estado.inv[id] > 0 && vale(id))
    .sort((a, b) => valor(b) - valor(a)).slice(0, NUMEROS.length);
}
function abrirPecera(clave, n) {
  const tipo = MUEBLES[n].expone, opciones = criaturasParaPecera(tipo);
  if (!opciones.length) {
    avisar(tipo === 'tesoro' ? 'No llevas nada brillante, épico ni legendario. ¡Cuando encuentres algo así, lúcelo aquí!'
      : 'No llevas ninguna criatura en la bolsa. ¡Pesca alguna y tráela a vivir aquí!');
    sonar('fallo');
    return;
  }
  estado.pecera = { clave, n, opciones };
  sonar('abrir');
}
function teclaPecera(codigo) {
  const pe = estado.pecera;
  if (codigo === 'Escape' || codigo === 'Space' || codigo === 'KeyE') { estado.pecera = null; sonar('recoger'); return; }
  const id = pe.opciones[NUMEROS.indexOf(codigo)];
  if (!id) return;
  // Si ya esta lleno, el que lleva mas tiempo dentro vuelve a la bolsa; el nuevo sale de ella.
  const m = MUEBLES[pe.n], huecos = m.huecos || 1, dentro = contenidoDe(estado.peceras[pe.clave]);
  const sale = dentro.length >= huecos ? dentro.shift() : null;
  if (sale) estado.inv[sale] = (estado.inv[sale] || 0) + 1;
  quitar(id);
  dentro.push(id);
  estado.peceras[pe.clave] = huecos === 1 ? dentro[0] : dentro;
  estado.pecera = null;
  const [c, f] = pe.clave.split(',').map(Number);
  chispas(c * T + (m.ancho || 1) * 8, f * T + 4, m.expone === 'tesoro' ? COLOR.mantequilla : COLOR.cielo, 10, { fuerza: 16, gravedad: 40, vida: 0.6, arriba: 10 });
  sonar(esVariante(id) || ficha(id).r >= 3 ? 'dorado' : 'pez');
  const donde = m.expone === 'tesoro' ? ' se luce ahora en tu vitrina' : ' vive ahora en tu ' + m.nombre.toLowerCase();
  avisar(nombreDe(id) + donde + (sale ? ' · ' + nombreDe(sale).toLowerCase() + ' ha vuelto a la bolsa' : ''), id);
}

// ---------- El mar: playa, pozas, castillos, botellas, islotes, buceo y rescates ----------
// Cada dia nuevo (nuevoDia -> prepararMar) la marea deja tesoros en la orilla, a veces una botella con mensaje y
// algun animalito que necesita ayuda; las pozas, las ostras y el cofre del islote se rellenan, los corales del fondo
// crecen y los castillos de arena desaparecen (dejando una concha donde estaban). Lo de hoy vive en estado.playa:
// { dia, cosas: [{ c, f, id }], pozas: [], ostras: [], corales: {}, cofre, botella: { c, f }, rescate, estrellas, plancton, vistos }.
const PROB_BOTELLA = 0.6, PROB_RESCATE = 0.5, PROB_ESTRELLAS = 0.35, PROB_PLANCTON = 0.4;
const MAX_CASTILLOS = 8;
const DURA_RESCATE = 2.6;           // segundos que tarda el animalito rescatado en volver al mar
const TONOS_CORAL = ['#F28CA0', '#F2A65A', '#C5B4E3', '#E87F86', '#8FCFA0', '#FFE08A'];
const nFauna = id => FAUNA.findIndex(a => a.id === id);
const sitioBarca = () => estado.barcaEn || AMARRE;      // donde esta amarrada la barca (si no se navega)

// Animalitos que a veces aparecen en apuros en la playa.
const RESCATES = {
  tortuga: { nombre: 'Tortuguita patas arriba', gracias: 'La tortuguita se da la vuelta, te mira muy contenta y se va nadando. ¡Te ha dejado algo en la arena!' },
  pulpito: { nombre: 'Pulpito perdido', gracias: 'Llevas al pulpito hasta el agua y te dice adiós con sus ocho bracitos. ¡Te ha dejado un regalito!' },
  foca:    { nombre: 'Foquita enredada', gracias: 'Desenredas la red con muchísimo cuidado. La foquita da palmas y vuelve al mar. ¡Te ha dejado algo!' },
};
// Lo que se puede ver en el mar: desde la barca (ballena, delfines, tortuga), junto a las rocas de las focas y de noche.
const AVISTAMIENTOS = {
  ballena:   { nombre: 'Ballena soplando',    texto: '¡Una ballena ha soplado cerquita de tu barca!', pista: 'Sal con la barca a alta mar y mira a tu alrededor con calma.' },
  delfines:  { nombre: 'Delfines saltando',   texto: '¡Unos delfines saltan junto a la barca!', pista: 'Les encanta jugar alrededor de las barcas que navegan.' },
  tortuga:   { nombre: 'Tortuga marina',      texto: 'Una tortuga marina asoma la cabecita para saludarte.', pista: 'A veces sale a respirar cerca de las barcas.' },
  focas:     { nombre: 'Focas al sol',        texto: 'Las focas de las rocas te miran con sus ojazos.', pista: 'Toman el sol en unas rocas en medio del mar.' },
  estrellas: { nombre: 'Lluvia de estrellas', texto: '¡Esta noche hay lluvia de estrellas sobre el mar!', pista: 'Algunas noches caen estrellas sobre el mar. Se ven muy bien desde la playa o la punta del embarcadero.' },
  plancton:  { nombre: 'Plancton luminoso',   texto: 'El mar brilla de azul: hay plancton luminoso esta noche.', pista: 'Algunas noches el agua de la orilla se ilumina sola.' },
};
const DURA_AVISTAMIENTO = { ballena: 6, delfines: 4.5, tortuga: 6 };
// Cartas que llegan en botellas, en orden. mapa = donde esta la cruz del tesoro que dibujan.
const CARTAS = [
  { texto: 'Querida persona que encuentre esto: hoy he visto el amanecer más rosa de mi vida. Ojalá tú también lo veas algún día. — Una marinera' },
  { texto: 'Si estás leyendo esto, sonríe un poquito. Alguien al otro lado del mar está pensando cosas bonitas para ti.' },
  { texto: 'Escondí mi tesoro bajo la arena de una playa del sur, donde la marea casi no llega. Te dejo un mapita: busca la cruz. — Capitana Bigotes', mapa: 'playa' },
  { texto: 'Receta de mi abuela para los días grises: lluvia en la ventana, una manta, un ovillo y una taza de algo calentito. Funciona siempre.' },
  { texto: 'Hoy no he pescado nada, pero he visto delfines saltar al atardecer. Ha sido un día buenísimo igualmente.' },
  { texto: 'En el islote de la palmera hay un cofre que el mar rellena cada mañana… y algo más enterrado junto a ella. Mira el mapa.', mapa: 'palmera' },
  { texto: 'Gracias por cuidar del valle. Las flores, los peces y yo te lo agradecemos mucho. — El viento del sur' },
  { texto: 'He perdido un calcetín de rayas. Si lo ves, no me lo devuelvas: seguro que ahora es muy feliz siendo de un pez.' },
  { texto: 'La farera escondía sus perlas favoritas junto al faro del islote. Shhh, no se lo digas a nadie.', mapa: 'faro' },
  { texto: 'Esta es la última botella de mi colección. Si las has encontrado todas, eres la persona más paciente del mundo. ¡Enhorabuena!' },
];
const LUGARES_MAPA = { playa: 'la arena de la playa', palmera: 'el islote de la palmera', faro: 'el islote del faro' };
const CARA_BOTELLA = { nombre: 'Mensaje en una botella', cara: c => c.drawImage(img.mar_tiles, MAR_TILES.botella * T, 0, T, T, 0, 0, T, T) };
// Recuerdos del mar (pagina "Playa y mar" del diario): cartas, lo que se ha visto, los rescates y el castillo.
const RECUERDOS = [
  ...CARTAS.map((_, i) => ({ clase: 'carta', i })),
  ...Object.keys(AVISTAMIENTOS).map(id => ({ clase: 'avistamiento', id })),
  ...Object.keys(RESCATES).map(id => ({ clase: 'rescate', id })),
  { clase: 'castillo' },
];

// Suma uno a un recuerdo (estado.recuerdos) y dice si es la primera vez.
function recordar(clave) {
  const nuevo = !estado.recuerdos[clave];
  estado.recuerdos[clave] = (estado.recuerdos[clave] || 0) + 1;
  return nuevo;
}
// Tesoro al azar: lo normal de la orilla o, si es rico (cofres, regalos), algo mas especial.
function sortearTesoro(rico = false) {
  const pesos = rico ? { caracolaEspiral: 20, cristalMar: 20, monedaAntigua: 30, perla: 22, perlaNegra: 8 }
    : { conchaRosa: 40, estrellaArena: 28, caracolaEspiral: 14, cristalMar: 12, fragmentoCoral: 3, monedaAntigua: 3 };
  let x = Math.random() * Object.values(pesos).reduce((a, b) => a + b, 0);
  for (const [id, p] of Object.entries(pesos)) if ((x -= p) < 0) return id;
  return 'conchaRosa';
}
const cosaPlayaEn = (c, f) => estado.playa && estado.playa.cosas.find(o => o.c === c && o.f === f);
const esTesoroX = (c, f) => !!estado.tesoroX && estado.tesoroX.c === c && estado.tesoroX.f === f;
const botellaEn = (c, f) => { const b = estado.playa && estado.playa.botella; return !!b && b.c === c && b.f === f; };
const rescateEn = (c, f) => { const r = estado.playa && estado.playa.rescate; return !!r && r.t < 0 && r.c === c && r.f === f; };
const pozaEn = (c, f) => POZAS.findIndex(p => f === p.f && (c === p.c || c === p.c + 1));
const ostraEn = (c, f) => OSTRAS.findIndex(o => o.c === c && o.f === f);
const esParcelaCoral = (c, f) => PARCELAS_CORAL.some(p => p.c === c && p.f === f);
const esCofre = (c, f) => c === COFRE.c && f === COFRE.f;
const sitioBuceoEn = (c, f) => SITIOS_BUCEO.some(s => Math.abs(s.c - c) <= 1 && Math.abs(s.f - f) <= 1);
// Lo que esta en la casilla de la gatita o en una pegada a ella.
const aquiOCerca = prueba => { const { c, f } = casillaActual(); return prueba(c, f) ? { c, f } : vecina(prueba); };
// Donde se puede bajar de la barca: arena, cesped, camino o muelle libres.
const pisable = (c, f) => ['Y', 'G', 'F', 'C', 'M'].includes(tile(c, f)) && !BLOQUEADAS.has(c + ',' + f) && !((c + ',' + f) in fijos)
  && !muebleEn(c, f) && estado.castillos[c + ',' + f] === undefined && !vecinoEn(c, f);
const orillaCercana = () => vecina(pisable);

// Casillas de arena de la playa grande (no de los islotes) donde no hay nada.
function arenaLibre() {
  const libres = [];
  for (let c = 1; c < ANCHO - 1; c++) for (const f of [costaEn(c) - 2, costaEn(c) - 1]) {
    const k = c + ',' + f;
    if (tile(c, f) !== 'Y' || BLOQUEADAS.has(k) || muebleEn(c, f) || estado.castillos[k] !== undefined || cosaPlayaEn(c, f) || esTesoroX(c, f) || vecinoEn(c, f)) continue;
    if (VECINOS.some(v => v.valle && [v.casa, v.plaza].some(s => s.c === c && s.f === f))) continue;
    libres.push([c, f]);
  }
  return libres;
}
// Un dia nuevo en el mar. crecer = false al empezar o cargar una partida (los corales no crecen).
function prepararMar(crecer = true) {
  const p = estado.playa = { dia: estado.dia, cosas: [], pozas: [], ostras: [], corales: {}, cofre: false, botella: null, rescate: null,
    estrellas: Math.random() < PROB_ESTRELLAS, plancton: Math.random() < PROB_PLANCTON, vistos: {} };
  // La marea se lleva los castillos de arena; los grandes dejan una concha (o una caracola) donde estaban.
  const castillos = estado.castillos;
  estado.castillos = {};
  for (const [k, etapa] of Object.entries(castillos)) {
    if (etapa < 2) continue;
    const [c, f] = k.split(',').map(Number);
    p.cosas.push({ c, f, id: etapa >= 3 ? 'caracolaEspiral' : 'conchaRosa' });
  }
  const libres = arenaLibre(), sacar = () => libres.splice(Math.floor(Math.random() * libres.length), 1)[0];
  for (let n = 4 + Math.floor(Math.random() * 3); n > 0 && libres.length; n--) { const [c, f] = sacar(); p.cosas.push({ c, f, id: sortearTesoro() }); }
  // Una botella flotando junto a la orilla (se coge desde la arena).
  for (let i = 0; i < 30 && !p.botella && Math.random() < PROB_BOTELLA; i++) {
    const c = 3 + Math.floor(Math.random() * (ANCHO - 6)), f = costaEn(c);
    if (tile(c, f) === 'W' && enMar(c, f) && Math.abs(c - EMBARCADERO.c) > 2 && tile(c, f - 1) === 'Y') p.botella = { c, f };
  }
  if (Math.random() < PROB_RESCATE && libres.length) {
    const [c, f] = sacar();
    p.rescate = { tipo: alAzar(Object.keys(RESCATES)), c, f, t: -1 };   // t >= 0: ya rescatado, volviendo al mar
  }
  if (crecer) for (const co of Object.values(estado.corales)) co.etapa = Math.min(3, co.etapa + 1);
}

// Lo que se puede hacer con el mar desde tierra o en el fondo (antes que pescar); null si nada.
function accionMar() {
  const p = estado.playa;
  if (!p) return null;
  const { c, f } = casillaActual();
  if (bajoAgua(f)) {
    const o = vecina((vc, vf) => ostraEn(vc, vf) >= 0);
    if (o) return p.ostras[ostraEn(o.c, o.f)] ? 'ostraVista' : 'ostra';
    if (esParcelaCoral(c, f)) {
      const co = estado.corales[c + ',' + f];
      if (!co) return estado.inv.fragmentoCoral > 0 ? 'plantarCoral' : 'sinCoral';
      return co.etapa >= 3 && !p.corales[c + ',' + f] ? 'cuidarCoral' : 'coralCrece';
    }
    // Se sube por la cuerda por la que se bajo
    return Math.abs(c - LLEGADA_FONDO.c) <= 1 && Math.abs(f - LLEGADA_FONDO.f) <= 1 ? 'subir' : null;
  }
  if (aquiOCerca(rescateEn)) return 'rescatar';
  if (aquiOCerca(cosaPlayaEn)) return 'concha';
  if (aquiOCerca(esTesoroX)) return 'cavar';
  if (aquiOCerca(botellaEn)) return 'botella';
  const poza = vecina((vc, vf) => pozaEn(vc, vf) >= 0);
  if (poza) return p.pozas[pozaEn(poza.c, poza.f)] ? 'pozaVista' : 'poza';
  if (vecina(esCofre)) return p.cofre ? 'cofreVacio' : 'cofre';
  return null;
}
// En el agua (nadando o en la barca): coger botellas y bucear donde salen burbujas.
function accionEnAgua() {
  if (!estado.playa) return null;
  if (aquiOCerca(botellaEn)) return 'botella';
  const { c, f } = casillaActual();
  if (sitioBuceoEn(c, f)) return estado.herramientas.gafas ? 'bucear' : 'sinGafas';
  return null;
}
// Casilla de delante de la gatita (hacia donde mira).
function casillaDelante() {
  const g = estado.gata, { c, f } = casillaActual();
  if (g.mira === 'lado') return { c: c + (g.espejo ? -1 : 1), f };
  return { c, f: f + (g.mira === 'espalda' ? -1 : 1) };
}
// Castillo de arena: en la casilla de arena de delante (si esta libre y no la pisa la gatita), desde la arena.
function castilloPosible() {
  const g = estado.gata, aqui = casillaActual(), d = casillaDelante(), k = d.c + ',' + d.f, etapa = estado.castillos[k];
  if (tile(aqui.c, aqui.f) !== 'Y' || regionDe(aqui.f).id !== 'valle') return null;
  if (etapa !== undefined) return etapa < 3 ? d : null;
  if (tile(d.c, d.f) !== 'Y' || Object.keys(estado.castillos).length >= MAX_CASTILLOS) return null;
  if (BLOQUEADAS.has(k) || muebleEn(d.c, d.f) || cosaPlayaEn(d.c, d.f) || esTesoroX(d.c, d.f) || rescateEn(d.c, d.f) || vecinoEn(d.c, d.f)) return null;
  return casillasPies(g.x, g.y).some(([pc, pf]) => pc === d.c && pf === d.f) ? null : d;
}

// Hace lo del mar que toque. Devuelve true si la accion era del mar.
function actuarMar(accion) {
  const p = estado.playa;
  switch (accion) {
    case 'concha': {
      const o = aquiOCerca(cosaPlayaEn), cosa = cosaPlayaEn(o.c, o.f);
      p.cosas.splice(p.cosas.indexOf(cosa), 1);
      mirarHacia(o.c, o.f);
      conseguir(cosa.id, 'Has encontrado en la orilla');
      return true;
    }
    case 'poza': {
      const o = vecina((c, f) => pozaEn(c, f) >= 0);
      p.pozas[pozaEn(o.c, o.f)] = true;
      mirarHacia(o.c, o.f);
      chispas(o.c * T + 8, o.f * T + 8, COLOR.cielo, 8, { fuerza: 14, gravedad: 60, vida: 0.5, arriba: 10 });
      conseguir(sortearCriatura('poza', estado.herramientas.cubo ? 2 : 0), 'Te asomas a la poza y encuentras');
      return true;
    }
    case 'castillo': {
      const d = castilloPosible(), k = d.c + ',' + d.f;
      const etapa = Math.min(3, (estado.castillos[k] ?? -1) + (estado.herramientas.cubo ? 2 : 1));
      estado.castillos[k] = etapa;
      mirarHacia(d.c, d.f);
      chispas(d.c * T + 8, d.f * T + 11, '#E9C98A', 9, { fuerza: 18, vida: 0.5, arriba: 12 });
      if (etapa < 3) { sonar('plantar'); return true; }
      const nuevo = recordar('castillo');
      celebrar(null);
      sonar('dorado');
      avisar('¡Qué castillo de arena tan bonito! Esta noche la marea se lo llevará… y dejará algo a cambio' + (nuevo ? ' · ¡apuntado en tu diario!' : ''));
      return true;
    }
    case 'botella': {
      const o = aquiOCerca(botellaEn);
      p.botella = null;
      mirarHacia(o.c, o.f);
      chispas(o.c * T + 8, o.f * T + 8, COLOR.crema, 8, { fuerza: 14, gravedad: 60, vida: 0.5, arriba: 10 });
      leerBotella();
      return true;
    }
    case 'cavar': {
      const o = aquiOCerca(esTesoroX);
      estado.tesoroX = null;
      mirarHacia(o.c, o.f);
      chispas(o.c * T + 8, o.f * T + 10, '#D9B47E', 14, { fuerza: 24, vida: 0.6, arriba: 16 });
      estado.conchitas += 15;
      dar('monedaAntigua');
      conseguir(sortearTesoro(true), '¡Un cofrecito enterrado! Dentro hay 15 conchitas, una moneda antigua y');
      return true;
    }
    case 'rescatar': {
      const r = p.rescate;
      r.t = 0;
      mirarHacia(r.c, r.f);
      const nuevo = recordar('rescate_' + r.tipo);
      celebrar(null);
      sonar('dorado');
      avisar(RESCATES[r.tipo].gracias + (nuevo ? ' · ¡apuntado en tu diario!' : ''));
      return true;
    }
    case 'cofre':
      p.cofre = true;
      mirarHacia(COFRE.c, COFRE.f);
      conseguir(sortearTesoro(true), 'Abres el cofre de la palmera y encuentras');
      return true;
    case 'bucear': bucear(); return true;
    case 'subir': subir(); return true;
    case 'ostra': {
      const o = vecina((c, f) => ostraEn(c, f) >= 0), x = Math.random();
      p.ostras[ostraEn(o.c, o.f)] = true;
      mirarHacia(o.c, o.f);
      conseguir(x < 0.06 ? 'perlaNegra' : x < 0.36 ? 'perla' : x < 0.72 ? 'fragmentoCoral' : 'conchaRosa', 'Abres la ostra con cuidado y encuentras');
      return true;
    }
    case 'plantarCoral': {
      const { c, f } = casillaActual();
      quitar('fragmentoCoral');
      estado.corales[c + ',' + f] = { etapa: 0 };
      chispas(c * T + 8, f * T + 10, '#F28CA0', 8, { fuerza: 12, gravedad: -10, vida: 0.8 });
      sonar('plantar');
      avisar('Has plantado una ramita de coral. Crecerá un poquito cada día y atraerá a más peces', 'fragmentoCoral');
      return true;
    }
    case 'cuidarCoral': {
      const { c, f } = casillaActual();
      p.corales[c + ',' + f] = true;
      conseguir(Math.random() < 0.12 ? 'perla' : 'fragmentoCoral', 'Cuidas tu coral y te regala');
      return true;
    }
  }
  return false;
}

// Botella con mensaje: las cartas salen en orden; las que traen mapa marcan una cruz donde cavar.
// Cuando ya se han leido todas, dentro hay un tesorito.
function leerBotella() {
  sonar('abrir');
  const i = estado.cartas.length;
  if (i >= CARTAS.length) { conseguir(sortearTesoro(), 'Dentro de la botella había'); return; }
  const carta = CARTAS[i];
  estado.cartas.push(i);
  let extra = '';
  if (carta.mapa) {
    estado.tesoroX = sitioTesoro(carta.mapa);
    extra = ' <b>Detrás hay un mapita con una cruz en ' + LUGARES_MAPA[carta.mapa] + '.</b>';
  }
  abrirDialogo(CARA_BOTELLA, [{ texto: '«' + carta.texto + '»' + extra, pista: carta.mapa ? 'Busca la cruz en la arena y cava con Espacio. La carta queda guardada en tu diario.' : 'La carta queda guardada en tu diario (C), en la página Playa y mar.' }]);
}
// Casilla de arena libre donde esta la cruz del mapa: en la playa grande o en uno de los islotes.
function sitioTesoro(lugar) {
  let sitios;
  if (lugar === 'playa') sitios = arenaLibre().filter(([c, f]) => f === costaEn(c) - 2);
  else {
    const isla = ISLOTES.find(i => i.id === lugar);
    sitios = [];
    for (let f = isla.f; f < isla.f + isla.alto; f++) for (let c = isla.c; c < isla.c + isla.ancho; c++) {
      if (isloteEn(c, f) === isla && !BLOQUEADAS.has(c + ',' + f) && !esCofre(c, f)) sitios.push([c, f]);
    }
  }
  const [c, f] = alAzar(sitios.length ? sitios : arenaLibre());
  return { c, f };
}

// Bucear: se baja al fondo del mar (otra parte del mapa) y al subir se vuelve justo donde se estaba.
function bucear() {
  const g = estado.gata;
  estado.buceo = { vuelta: { x: g.x, y: g.y }, navegando: estado.navegando };
  estado.pesca = null;
  sonar('abrir');
  fundir(() => {
    estado.navegando = false;
    llevarGata(LLEGADA_FONDO.c, LLEGADA_FONDO.f, 'frente');
    crearPeces();
    estado.lugar = { antes: '~ te sumerges en ~', nombre: FONDO.nombre, t: 0 };
    avisar('Para volver arriba, ve a la cuerda y pulsa Espacio.');
  });
}
function subir() {
  const b = estado.buceo;
  sonar('recoger');
  fundir(() => {
    estado.buceo = null;
    if (!b) { llevarGata(EMBARCADERO.c, EMBARCADERO.punta, 'espalda'); return; }
    Object.assign(estado.gata, b.vuelta, { anim: 'reposo', t: 0, mira: 'frente' });
    estado.navegando = b.navegando;
    cam.lista = false;
  });
}
// Peces que nadan por el fondo: mas cuantos mas corales hayan crecido (y esos, cerca del jardin de coral).
const peces = [];
function crearPeces() {
  peces.length = 0;
  const quietos = ['cangrejo', 'cangrejoErmitano', 'erizoMar', 'langosta', 'estrellaMar', 'caracola', 'camaron'];
  const especies = FAUNA.filter(a => a.r <= 3 && a.zonas.some(z => z === 'mar' || z === 'alta') && !quietos.includes(a.id));
  const crecidos = Object.values(estado.corales).filter(co => co.etapa >= 3).length, jardin = PARCELAS_CORAL[0];
  for (let i = 0; i < 5 + crecidos * 3; i++) {
    const cerca = i >= 5;
    peces.push({
      n: nFauna(alAzar(especies).id),
      x: cerca ? (jardin.c - 2 + Math.random() * 8) * T : Math.random() * (FONDO.ancho - 2) * T,
      y: cerca ? (jardin.f - 2 + Math.random() * 4) * T : (FONDO.f0 + 2 + Math.random() * (FONDO.alto - 5)) * T,
      v: (7 + Math.random() * 9) * (Math.random() < 0.5 ? -1 : 1), fase: Math.random() * 6, x0: cerca ? (jardin.c - 3) * T : 8, x1: cerca ? (jardin.c + 7) * T : (FONDO.ancho - 2) * T,
    });
  }
}
// Lo que se ve desde la barca o de noche, una vez al dia (unaVez) o cada vez que aparece.
function avistar(tipo, unaVez) {
  const p = estado.playa;
  if (unaVez && p.vistos[tipo]) return;
  p.vistos[tipo] = true;
  const nuevo = recordar(tipo);
  avisar(AVISTAMIENTOS[tipo].texto + (nuevo ? ' · ¡apuntado en tu diario!' : ''));
  sonar(nuevo ? 'dorado' : 'elegir');
}

function actualizarMar(dt) {
  const p = estado.playa;
  if (!p) return;
  const g = estado.gata, { c, f } = casillaActual();
  // El animalito rescatado vuelve al mar y deja un regalito donde estaba.
  const r = p.rescate;
  if (r && r.t >= 0 && !r.fin) {
    r.t += dt;
    if (r.t >= DURA_RESCATE) {
      r.fin = true;
      p.cosas.push({ c: r.c, f: r.f, id: sortearTesoro(true) });
      chispas(r.c * T + 8, (costaEn(r.c) + 0.4) * T, COLOR.crema, 10, { fuerza: 20, gravedad: 60, vida: 0.6, arriba: 14 });
    }
  }
  if (bajoAgua(f)) {
    for (const pz of peces) {
      pz.x += pz.v * dt;
      if (pz.x < pz.x0 || pz.x > pz.x1) { pz.v = -pz.v; pz.x = Math.max(pz.x0, Math.min(pz.x1, pz.x)); }
    }
    if (Math.random() < dt * 1.5) chispas(g.x + 8 + (Math.random() - 0.5) * 4, g.y + 3, '#E4F4FA', 1, { fuerza: 3, gravedad: -30, vida: 1.4 });
  }
  // Desde la barca, de vez en cuando se ve algo bonito.
  if (estado.navegando) {
    const av = estado.avistamiento;
    if (av) { av.t += dt; if (av.t >= DURA_AVISTAMIENTO[av.tipo]) estado.avistamiento = null; }
    else if ((estado.esperaAvistamiento -= dt) <= 0) {
      estado.esperaAvistamiento = 14 + Math.random() * 18;
      const tipo = alAzar(['ballena', 'delfines', 'delfines', 'tortuga']), lado = Math.random() < 0.5 ? -1 : 1;
      const x = g.x + lado * (46 + Math.random() * 26), y = g.y + 6 + (Math.random() - 0.4) * 24;
      const ac = Math.floor((x + 8) / T), af = Math.floor((y + 10) / T);
      if (tile(ac, af) === 'W' && enMar(ac, af) && af >= costaEn(ac) + 1) { estado.avistamiento = { tipo, x, y, t: 0, lado }; avistar(tipo); }
    }
  } else estado.avistamiento = null;
  if ((estado.navegando || nadando()) && Math.abs(c - ROCAS_FOCAS.c) <= 4 && Math.abs(f - ROCAS_FOCAS.f) <= 3) avistar('focas', true);
  if (oscuridad(estado.hora) > 0.6 && regionDe(f).id === 'valle' && f >= 42) {
    if (p.estrellas) avistar('estrellas', true);
    if (p.plancton) avistar('plancton', true);
  }
}

// ---------- Excavar: palas, montoncitos, minijuego de cavar y Pipi el radar ----------
// Cada manana prepararExcavar() pone SITIOS_DIA montoncitos con un brillito por el valle (cesped, flores o arena; su
// aspecto cambia con el bioma y con la lluvia) y un tesoro escondido sin marca que solo encuentra Pipi, el radar.
// Con una pala, Espacio junto a un montoncito empieza el minijuego: la palita va y viene por la tablilla y hay que
// pulsar cuando pasa por la tierra blanda; cada acierto quita una capa (MEJORAS_PALA) y al llegar abajo, "pop".
const PALAS = ['palaMadera', 'palaCobre', 'palaRosa', 'palaEstrella'];
const nivelPala = () => PALAS.reduce((n, id, i) => estado.herramientas[id] ? i + 1 : n, 0);
// Por nivel de pala (0 = sin pala): capas de tierra, ancho de la tierra blanda, color de la hoja,
// probabilidad de un segundo tesoro y aciertos perfectos de regalo.
const MEJORAS_PALA = [
  null,
  { capas: 3, zona: 20, color: '#DDA77F' },
  { capas: 3, zona: 28, color: '#E39A6B' },
  { capas: 2, zona: 28, color: '#F7C6D9' },
  { capas: 2, zona: 32, color: '#FFE08A', doble: 0.25, perfectos: 1 },
];
const SITIOS_DIA = 5, TIEMPO_CAVAR = 10;
const RADIO_RADAR = 12, PITA_RADAR = 8;     // Pipi se ve a RADIO_RADAR casillas del tesoro y pita a PITA_RADAR
const TABLA_CAVAR = { x: 44, y: 118, w: 152, h: 38 };
const BARRA_CAVAR = { x: 84, y: 134, ancho: 104, centro: 6 };
const TIERRA = { prado: ['#B5865F', '#9C6B4E', '#7A5240'], playa: ['#F3DDB0', '#E3C48F', '#CFA874'] };

const enValle = f => regionDe(f).id === 'valle';
function lejosDelHogar(c, f) {
  const h = estado.hogar || HOGAR_DE_SIEMPRE;
  const cerca = (x, y, w, alto) => c >= x - 2 && c <= x + w + 1 && f >= y - 2 && f <= y + alto + 1;
  return !cerca(h.casa.c, h.casa.f, 3, 2) && !cerca(h.huerto.c, h.huerto.f, 6, 5);
}
// Casilla donde puede salir un montoncito: cesped, flores (o arena), libre y lejos de casa.
function sitioLibre(c, f, conArena) {
  const t = tile(c, f), k = c + ',' + f;
  if (!(t === 'G' || t === 'F' || (conArena && t === 'Y'))) return false;
  return c > 1 && c < ANCHO - 2 && f > 1 && enValle(f) && !BLOQUEADAS.has(k) && !(k in fijos) && !muebleEn(c, f) && !vecinoEn(c, f)
    && estado.castillos[k] === undefined && !cosaPlayaEn(c, f) && !esTesoroX(c, f) && lejosDelHogar(c, f);
}
function prepararExcavar() {
  const ex = estado.excavar = { dia: estado.dia, sitios: [], oculto: null };
  const separado = (c, f) => ex.sitios.every(s => Math.abs(s.c - c) + Math.abs(s.f - f) >= 6);
  const sortear = (prueba, intentos) => {
    for (let i = 0; i < intentos; i++) {
      const c = Math.floor(Math.random() * ANCHO), f = Math.floor(Math.random() * ALTO);
      if (prueba(c, f) && separado(c, f)) return { c, f, cavado: false };
    }
    return null;
  };
  const playa = sortear((c, f) => tile(c, f) === 'Y' && sitioLibre(c, f, true), 800);    // siempre uno en la playa
  if (playa) ex.sitios.push(playa);
  while (ex.sitios.length < SITIOS_DIA) {
    const s = sortear((c, f) => sitioLibre(c, f, true), 400);
    if (!s) break;
    ex.sitios.push(s);
  }
  ex.oculto = sortear((c, f) => sitioLibre(c, f, false), 800);
}
// Montoncito sin cavar en una casilla (el escondido solo cuenta si tienes a Pipi).
function sitioEn(c, f) {
  const ex = estado.excavar;
  if (!ex) return null;
  const s = ex.sitios.find(o => !o.cavado && o.c === c && o.f === f);
  if (s) return s;
  const o = ex.oculto;
  return o && !o.cavado && estado.herramientas.radar && o.c === c && o.f === f ? o : null;
}
const sitioCercano = () => aquiOCerca((c, f) => !!sitioEn(c, f));
function biomaSitio(s) {
  if (tile(s.c, s.f) === 'Y') return 'playa';
  let arboles = 0;
  for (let dc = -2; dc <= 2; dc++) for (let df = -2; df <= 2; df++) if (fijos[(s.c + dc) + ',' + (s.f + df)] === 0) arboles++;
  return arboles >= 3 ? 'bosque' : 'prado';
}

// Lo que se ordena por filas con la gatita: montoncitos (con su brillito) y los hoyos de hoy.
function dibujarExcavaciones(desde, hasta) {
  const ex = estado.excavar;
  if (!ex) return;
  for (const s of [...ex.sitios, ex.oculto]) {
    if (!s || s.f < desde || s.f > hasta || !enVista(s.c * T, s.f * T, cam.x, cam.y, 16)) continue;
    const x = s.c * T, y = s.f * T;
    if (s.cavado) { cuadro('excavar_tiles', EXCAVAR.hoyo, x, y); continue; }
    if (s === ex.oculto) continue;                  // el escondido no tiene marca: solo lo encuentra Pipi
    const bioma = biomaSitio(s);
    cuadro('excavar_tiles', bioma === 'playa' ? EXCAVAR.sitioPlaya : llueve() ? EXCAVAR.sitioLluvia
      : bioma === 'bosque' ? EXCAVAR.sitioBosque : EXCAVAR.sitioPrado, x, y);
    const k = Math.sin(estado.reloj * 2.5 + azar(s.c, s.f, 3) * 6);   // brillito que parpadea, cada uno a su ritmo
    if (k > 0.2) {
      const bx = x + 10 + Math.round(azar(s.c, s.f, 4) * 3), by = y + 6;
      ctx.fillStyle = k > 0.75 ? '#FFFFFF' : COLOR.mantequilla;
      ctx.fillRect(bx, by - 1, 1, 3); ctx.fillRect(bx - 1, by, 3, 1);
    }
  }
}

// ---------- Minijuego de cavar
function empezarCavar(s) {
  const m = MEJORAS_PALA[nivelPala()];
  mirarHacia(s.c, s.f);
  estado.saquito = false;
  estado.cavar = { s, oculto: s === estado.excavar.oculto, bioma: biomaSitio(s), capas: m.capas, capa: 0, zonaAncho: m.zona,
    pos: 0, dir: 1, zona: 0, perfectos: m.perfectos || 0, destello: 0, fallo: 0, golpe: 0, ...relojNuevo(TIEMPO_CAVAR) };
  estado.cavar.zona = nuevaZonaCavar();
  sonar('abrir');
}
const nuevaZonaCavar = () => Math.floor(Math.random() * (BARRA_CAVAR.ancho - estado.cavar.zonaAncho));
// Lo de cavar que hace Espacio: empezar, dar un golpe de pala o avisar de que hace falta una pala.
// ---------- Talar: con el hacha de la tienda se quitan arboles del valle (no los del borde ni los del pueblo)
// para tener mas sitio donde decorar. Tres hachazos: el arbol tiembla y suelta hojas, y al tercero cae.
const GOLPES_TALAR = 3;
const caidos = [];                  // arboles cayendo: { c, f, copa, tronco, t } (solo adorno)
function arbolTalable(c, f) {
  const k = c + ',' + f;
  return fijos[k] === 0 && enValle(f) && c > 0 && f > 0 && c < ANCHO - 1 && f < ALTO - 1 && !BLOQUEADAS.has(k);
}
function talar() {
  const a = vecina(arbolTalable), g = estado.gata, aqui = casillaActual(), k = a.c + ',' + a.f;
  if (!estado.talar || estado.talar.k !== k) estado.talar = { k, c: a.c, f: a.f, golpes: 0, sacude: 0 };
  const t = estado.talar;
  g.anim = 'talar'; g.t = 0;
  g.mira = a.f < aqui.f && a.c === aqui.c ? 'espalda' : 'frente';
  g.espejo = a.c < aqui.c;
  t.golpes++;
  t.sacude = 0.35;
  const x = a.c * T + 8, y = a.f * T + 10, hoja = arbolEn(a.c, a.f).copa === 2 ? '#F7C6D9' : '#8FC98A';
  sonar('pala', t.golpes);
  chispas(x, y + 2, '#C98F6B', 6, { fuerza: 26, vida: 0.5, arriba: 18 });             // astillas
  chispas(x, y - 14, hoja, 5, { fuerza: 14, gravedad: 22, vida: 1.1 });                // hojitas que caen
  if (t.golpes < GOLPES_TALAR) return;
  const especie = arbolEn(a.c, a.f);
  delete fijos[k];
  estado.talados.push(k);
  estado.talar = null;
  caidos.push({ c: a.c, f: a.f, ...especie, t: 0, lado: g.espejo ? -1 : 1 });
  chispas(x, y - 10, hoja, 18, { fuerza: 30, gravedad: 30, vida: 1.2, arriba: 10 });
  chispas(x, y + 4, '#E8D9C4', 10, { fuerza: 20, vida: 0.6 });
  const [min, max] = TRONQUITOS_POR_ARBOL, madera = min + Math.floor(Math.random() * (max - min + 1));
  for (let i = 0; i < madera; i++) dar(TRONQUITO.id);
  celebrar(TRONQUITO.id);
  if (estado.premio) estado.premio.desde = { x: a.c * T + 8, y: a.f * T + 4 };   // el tronquito salta del arbol a la gatita
  sonar('pop');
  avisar('+' + madera + ' tronquitos de madera', TRONQUITO.id);
  if (!estado.consejos.talado) {
    estado.consejos.talado = true;
    avisar('¡Has despejado un sitio! Con la madera se construyen muebles: pulsa B.');
  }
}
// El arbol talado se inclina, cae y se desvanece. El que se esta talando tiembla tras cada hachazo.
function actualizarTalar(dt) {
  if (estado.talar) {
    estado.talar.sacude = Math.max(0, estado.talar.sacude - dt);
    if (!vecina((c, f) => c === estado.talar.c && f === estado.talar.f)) estado.talar = null;   // si te vas, vuelve a empezar
  }
  for (const k of caidos) k.t += dt;
  while (caidos.length && caidos[0].t > 0.9) caidos.shift();
}
const sacudidaArbol = (c, f) => {
  const t = estado.talar;
  return t && t.c === c && t.f === f && t.sacude > 0 ? Math.round(Math.sin(t.sacude * 60) * t.sacude * 6) : 0;
};
function dibujarCaidos(desdeFila, hastaFila) {
  for (const k of caidos) {
    if (k.f < desdeFila || k.f > hastaFila) continue;
    const x = k.c * T + 8, y = k.f * T + 15, giro = Math.min(1, k.t / 0.55) ** 2 * (Math.PI / 2.4) * k.lado;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - Math.max(0, k.t - 0.5) / 0.4);
    ctx.translate(x, y); ctx.rotate(giro); ctx.translate(-x, -y);
    cuadroGrande('arboles_tiles', k.tronco, k.c * T - 8, k.f * T - 16, 32);
    cuadroGrande('arboles_tiles', k.copa, k.c * T - 8, k.f * T - 16, 32);
    ctx.restore();
  }
}

function actuarCavar(accion) {
  if (accion === 'talar') { talar(); return true; }
  if (accion === 'excavar') { empezarCavar(sitioEn(...Object.values(sitioCercano()))); return true; }
  if (accion === 'sinPala') {
    const s = sitioCercano();
    mirarHacia(s.c, s.f);
    sonar('cursor');
    avisar('Aquí hay algo enterrado… Bellota vende palas en su tiendecita del pueblo');
    return true;
  }
  if (accion === 'golpe') { golpePala(); return true; }
  return false;
}
function golpePala() {
  const k = estado.cavar, b = BARRA_CAVAR;
  const centro = k.pos + 1 - (k.zona + k.zonaAncho / 2);
  const x = k.s.c * T + 8, y = k.s.f * T + 12;
  if (Math.abs(centro) > k.zonaAncho / 2) {
    k.fallo = 0.25;                 // fallar no quita nada: solo un poquito de tiempo
    restarTiempo(k);
    sonar('fallo');
    return;
  }
  if (Math.abs(centro) <= b.centro / 2) k.perfectos++;
  k.capa++;
  k.destello = 0.25; k.golpe = 0.3;
  sonar('pala', k.capa);
  chispas(x, y, (TIERRA[k.bioma] || TIERRA.prado)[0], 10, { fuerza: 30, vida: 0.6, arriba: 26 });
  chispas(x, y, (TIERRA[k.bioma] || TIERRA.prado)[2], 5, { fuerza: 22, vida: 0.5, arriba: 20 });
  if (k.capa >= k.capas) desenterrar(k);
  else k.zona = nuevaZonaCavar();
}
function seAcaboCavar() {
  estado.cavar = null;
  sonar('escapo');
  avisar('¡Uf, qué tierra más durita! No pasa nada: el montoncito sigue ahí, prueba otra vez');
}
// Que sale: se sortea la rareza (los aciertos en el centro y el tesoro de Pipi ayudan) y cada bioma tiene sus favoritos.
function sortearTierra(k) {
  if (k.bioma === 'playa' && Math.random() < 0.3) return sortearTesoro(true);      // en la arena, a veces algo del mar
  const pesos = RAREZAS.map((r, i) => r.peso * (i >= 2 ? (1 + 0.6 * k.perfectos) * (k.oculto ? 3 : 1) : 1));
  let x = Math.random() * pesos.reduce((a, b) => a + b, 0), nivel = 0;
  while (nivel < pesos.length - 1 && x >= pesos[nivel]) { x -= pesos[nivel]; nivel++; }
  let lista = TESOROS_TIERRA.filter(t => t.r === nivel);
  while (!lista.length && nivel > 0) lista = TESOROS_TIERRA.filter(t => t.r === --nivel);
  const fav = { bosque: ['fosilHoja', 'maderaAntigua', 'semillaOlvidada'], playa: ['amonites', 'pezPiedra', 'caballitoFosil', 'planoPirata'],
    prado: ['piedraCorazon', 'cuarzoRosa', 'amonites', 'semillaOlvidada'] }[k.bioma] || [];
  const peso = t => fav.includes(t.id) ? 3 : 1;
  let y = Math.random() * lista.reduce((a, t) => a + peso(t), 0);
  for (const t of lista) if ((y -= peso(t)) < 0) return t.id;
  return lista[0].id;
}
function desenterrar(k) {
  estado.cavar = null;
  k.s.cavado = true;
  estado.recuerdos.cavados = (estado.recuerdos.cavados || 0) + 1;
  const x = k.s.c * T + 8, y = k.s.f * T + 8, m = MEJORAS_PALA[nivelPala()];
  sonar('pop');
  chispas(x, y, COLOR.mantequilla, 14, { fuerza: 36, arriba: 30, vida: 0.7 });
  chispas(x, y + 4, (TIERRA[k.bioma] || TIERRA.prado)[1], 12, { fuerza: 30, arriba: 24, vida: 0.6 });
  conseguir(sortearTierra(k), k.oculto ? '¡Pipí tenía razón! Desentierras' : '¡Pop! Desentierras');
  if (estado.premio) estado.premio.desde = { x, y };        // sale del hoyo dando un saltito hasta la gatita
  if (m.doble && Math.random() < m.doble) {
    const otro = sortearTierra(k);
    dar(otro);
    avisar('¡Y debajo había otro! ' + nombreDe(otro), otro);
  }
  if (Math.random() < 0.3) {
    const n = 3 + Math.floor(Math.random() * 6);
    estado.conchitas += n;
    avisar('Entre la tierra había ' + n + ' ' + conchitas(n));
  }
}
function actualizarCavar(dt) {
  const k = estado.cavar;
  if (!k) return;
  // La palita va y viene por la tablilla, un poco mas rapido con cada capa.
  k.pos += k.dir * (60 + 16 * k.capa) * dt;
  if (k.pos <= 0) { k.pos = 0; k.dir = 1; }
  if (k.pos >= BARRA_CAVAR.ancho - 2) { k.pos = BARRA_CAVAR.ancho - 2; k.dir = -1; }
  k.destello = Math.max(0, k.destello - dt);
  k.fallo = Math.max(0, k.fallo - dt);
  k.golpe = Math.max(0, k.golpe - dt);
  if (Math.random() < dt * 3) chispas(k.s.c * T + 4 + Math.random() * 8, k.s.f * T + 12, (TIERRA[k.bioma] || TIERRA.prado)[1], 1, { fuerza: 8, arriba: 10, vida: 0.4 });
  if (correReloj(k, dt)) seAcaboCavar();
}

// Tablilla del minijuego: a la izquierda, el corte de la tierra (hierba, las capas que quedan y el tesoro esperando
// abajo); a la derecha, la barra de tierra con la tierra blanda (y su centro dorado) y la palita que va y viene.
function dibujarTablaCavar(k) {
  const { x, y, w, h } = TABLA_CAVAR, b = BARRA_CAVAR;
  tablaMadera(x, y, w, h);
  const colores = TIERRA[k.bioma] || TIERRA.prado;
  const tiembla = k.golpe ? Math.round(Math.sin(k.golpe * 70)) : 0;
  const vx = x + 6 + tiembla, vy = y + 5, vw = 26, vh = 28;
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(vx - 1, vy - 1, vw + 2, vh + 2);
  ctx.fillStyle = '#5A3E35'; ctx.fillRect(vx, vy, vw, vh);                 // lo ya cavado: hoyo oscuro
  const alto = Math.floor((vh - 12) / k.capas);
  for (let i = k.capa; i < k.capas; i++) {
    const cy = vy + 3 + i * alto;
    ctx.fillStyle = colores[Math.min(2, i)]; ctx.fillRect(vx, cy, vw, i === k.capas - 1 ? vh - 9 - cy + vy : alto);
    ctx.fillStyle = 'rgba(74,51,71,0.25)';
    for (let j = 0; j < 5; j++) ctx.fillRect(vx + 2 + ((j * 7 + i * 3) % (vw - 3)), cy + 1 + (j % 2) * 2, 1, 1);   // piedrecitas
  }
  // Abajo, la tierra mas honda con el tesoro esperando (silueta con un destello)
  ctx.fillStyle = colores[2]; ctx.fillRect(vx, vy + vh - 9, vw, 9);
  mapaBits(ICONOS.estrella, vx + 10, vy + vh - 8, k.capa >= k.capas - 1 ? COLOR.mantequilla : '#6E4A3A');
  if (Math.sin(estado.reloj * 5) > 0.5) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(vx + 18, vy + vh - 7, 1, 1); }
  // Hierba de arriba: entera hasta que se cava la primera capa
  ctx.fillStyle = k.bioma === 'playa' ? '#FFF4C2' : COLOR.salvia;
  if (!k.capa) ctx.fillRect(vx, vy, vw, 3);
  else { ctx.fillRect(vx, vy, 4, 3); ctx.fillRect(vx + vw - 4, vy, 4, 3); }
  // Capas que faltan: puntitos encima de la barra
  for (let i = 0; i < k.capas; i++) mapaBits(BITS.estrella, b.x + b.ancho - 7 - i * 8, y + 4, i < k.capa ? COLOR.mantequilla : '#A87358');
  // La barra de tierra
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(b.x - 1, b.y - 1, b.ancho + 2, 11);
  ctx.fillStyle = colores[1]; ctx.fillRect(b.x, b.y, b.ancho, 9);
  ctx.fillStyle = colores[2];
  for (let i = 0; i < b.ancho; i += 6) ctx.fillRect(b.x + i + (i / 6 % 2) * 2, b.y + 2 + (i / 6 % 3) * 2, 2, 1);
  const zx = b.x + Math.round(k.zona);
  ctx.fillStyle = k.destello ? '#FFFBF3' : '#E3C48F'; ctx.fillRect(zx, b.y, k.zonaAncho, 9);         // tierra blanda
  ctx.fillStyle = k.destello ? '#FFFBF3' : '#F3DDB0'; ctx.fillRect(zx, b.y, k.zonaAncho, 1);
  ctx.fillStyle = '#CFA874';
  for (let i = 3; i < k.zonaAncho - 2; i += 5) ctx.fillRect(zx + i, b.y + 3 + (i % 2) * 2, 1, 1);    // migas
  ctx.fillStyle = colores[2]; ctx.fillRect(zx, b.y, 1, 9); ctx.fillRect(zx + k.zonaAncho - 1, b.y, 1, 9);
  const cx = zx + Math.round((k.zonaAncho - b.centro) / 2);
  ctx.fillStyle = COLOR.mantequilla; ctx.fillRect(cx, b.y, b.centro, 9);
  ctx.fillStyle = '#E8A85C'; ctx.fillRect(cx, b.y, 1, 9); ctx.fillRect(cx + b.centro - 1, b.y, 1, 9);
  // La palita (tiembla en fresa al fallar)
  const mx = b.x + Math.round(k.pos) + (k.fallo ? Math.round(Math.sin(k.fallo * 80)) : 0);
  const color = k.fallo ? '#E8606E' : MEJORAS_PALA[Math.max(1, nivelPala())].color;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) mapaBits(ICONOS.pala, mx - 3 + dx, b.y - 9 + dy, COLOR.ciruela);
  mapaBits(ICONOS.pala, mx - 3, b.y - 9, color);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(mx, b.y + 11, 2, 1);
  if (k.tiempo != null) dibujarCuentaAtras(k, b.x, y + h - 7, b.ancho);
}

// ---------- Pipi, el radar: pita mas deprisa y se pone mas rosa cuanto mas cerca estas del tesoro escondido
function distanciaRadar() {
  const o = estado.excavar && estado.excavar.oculto;
  if (!o || o.cavado || !estado.herramientas.radar || estado.navegando || nadando()) return null;
  const { c, f } = casillaActual();
  return enValle(f) ? Math.hypot(o.c - c, o.f - f) : null;
}
function actualizarRadar(dt) {
  const d = distanciaRadar();
  if (d == null || d > PITA_RADAR || estado.cavar || !nadaAbierto()) return;
  estado.radarT -= dt;
  if (estado.radarT <= 0) {
    estado.radarT = 0.22 + 1.3 * (d / PITA_RADAR);
    sonar('pip', Math.max(0, 4 - Math.round(d / 2)));
  }
}
const calorRadar = d => d <= 1.5 ? '#E8606E' : d <= 4 ? COLOR.rosa : d <= PITA_RADAR ? COLOR.mantequilla : '#A9D8E8';
function dibujarRadar() {
  const d = distanciaRadar();
  if (d == null || d > RADIO_RADAR || estado.cavar || !nadaAbierto()) return;
  const g = estado.gata, x = Math.round(g.x - 14), y = Math.round(g.y - 4 + Math.sin(estado.reloj * 4));
  panel(x, y, 13, 11);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + 13, y + 5, 1, 1); ctx.fillRect(x + 14, y + 6, 1, 1);   // piquito hacia la gatita
  const late = d > PITA_RADAR || Math.sin(estado.reloj * (5 + (PITA_RADAR - d) * 2.5)) > -0.2;
  mapaBits(ICONOS.radar, x + 3, y + 2, late ? calorRadar(d) : COLOR.ciruela);
  if (d <= 1.5) {                   // ¡aqui! dos signos que botan
    const by = y - 7 + Math.round(Math.sin(estado.reloj * 10));
    ctx.fillStyle = '#E8606E';
    for (const bx of [x + 4, x + 7]) { ctx.fillRect(bx, by, 2, 3); ctx.fillRect(bx, by + 4, 2, 1); }
  } else if (d <= PITA_RADAR && late) {
    ctx.fillStyle = calorRadar(d);  // ondas de sonido
    ctx.fillRect(x - 2, y + 3, 1, 5); ctx.fillRect(x - 4, y + 2, 1, 7);
  }
}

// ---------- Dibujo del mar ----------
// Elipse rellena de pixeles (centro y radios enteros).
function elipsePx(cx, cy, rx, ry, color) {
  ctx.fillStyle = color;
  for (let j = -ry; j <= ry; j++) {
    const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (j / (ry + 0.5)) ** 2)));
    if (w > 0) ctx.fillRect(Math.round(cx - w), Math.round(cy + j), w * 2, 1);
  }
}
// Lo del mar que se ordena por filas con la gatita: tesoros en la arena, castillos, la cruz, la botella,
// el animalito en apuros y los corales del jardin del fondo.
function dibujarCosasMar(desde, hasta) {
  const p = estado.playa;
  if (!p) return;
  const fila = f => f >= desde && f <= hasta;
  for (const o of p.cosas) if (fila(o.f)) dibujarTesoroArena(o);
  for (const [k, etapa] of Object.entries(estado.castillos)) { const [c, f] = k.split(',').map(Number); if (fila(f)) dibujarCastillo(c * T, f * T, etapa); }
  if (estado.tesoroX && fila(estado.tesoroX.f)) dibujarCruz(estado.tesoroX.c * T, estado.tesoroX.f * T);
  if (p.botella && fila(p.botella.f)) dibujarBotella(p.botella.c * T, p.botella.f * T);
  const r = p.rescate;
  if (r && !r.fin) { const y = posRescate(r); if (fila(Math.floor((y + 10) / T))) dibujarRescate(r, r.c * T, y); }
  Object.entries(estado.corales).forEach(([k, co]) => {
    const [c, f] = k.split(',').map(Number);
    if (fila(f)) dibujarCoral(c * T, f * T, co.etapa, PARCELAS_CORAL.findIndex(q => q.c === c && q.f === f));
  });
}
function dibujarTesoroArena(o) {
  const x = o.c * T, y = o.f * T;
  ctx.globalAlpha = 0.25; ctx.fillStyle = '#9C6B48'; ctx.fillRect(x + 4, y + 13, 8, 1); ctx.globalAlpha = 1;
  cuadro('mar_tiles', ficha(o.id).n, x, y);
  if ((estado.reloj * 0.7 + azar(o.c, o.f, 5) * 7) % 3 < 0.3) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 11, y + 2, 1, 3); ctx.fillRect(x + 10, y + 3, 3, 1);
  }
}
// Castillo de arena en 4 etapas: montoncito, torre, castillo de dos torres y castillo con banderita y conchas.
function dibujarCastillo(x, y, etapa) {
  const o = COLOR.ciruela, arena = '#EBCB8B', luz = '#F8E2AE', hueco = '#C99A5B';
  const r = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(x + rx, y + ry, w, h); };
  const bloque = (rx, ry, w, h) => { r(o, rx, ry, w, h); r(arena, rx + 1, ry + 1, w - 2, h - 2); r(luz, rx + 1, ry + 1, w - 2, 1); };
  sombra(x + 8, y + 15, 15, 3);
  if (etapa === 0) { bloque(3, 10, 10, 6); r(o, 2, 12, 1, 3); r(o, 13, 12, 1, 3); return; }
  bloque(1, 11, 14, 5);
  if (etapa === 1) { bloque(5, 4, 6, 8); bloque(4, 2, 3, 3); bloque(9, 2, 3, 3); r(hueco, 7, 8, 2, 3); return; }
  bloque(1, 5, 5, 8); bloque(10, 5, 5, 8); bloque(5, 8, 6, 5);
  bloque(1, 3, 3, 3); bloque(12, 3, 3, 3); bloque(6, 6, 2, 3); bloque(9, 6, 2, 3);
  r(o, 7, 10, 2, 3); r(hueco, 2, 8, 2, 2); r(hueco, 12, 8, 2, 2);
  if (etapa >= 3) {
    const v = viento(x, y, 3);
    r(o, 2, -4, 1, 8);
    r(o, 3, -4, 5 + v, 4); r('#F28CA0', 3, -3, 4 + v, 2);
    r('#F7A6B4', 5, 13, 2, 1); r(COLOR.crema, 6, 13, 1, 1); r('#F7A6B4', 11, 14, 2, 1); r('#E8A85C', 3, 14, 1, 1);
  }
}
function dibujarCruz(x, y) {
  ctx.fillStyle = '#9C6B48';
  for (let i = 0; i < 8; i++) { ctx.fillRect(x + 4 + i, y + 5 + i, 2, 1); ctx.fillRect(x + 10 - i, y + 5 + i, 2, 1); }
  if (Math.sin(estado.reloj * 3) > 0.6) { ctx.fillStyle = COLOR.mantequilla; ctx.fillRect(x + 7, y + 2, 2, 2); }
}
// Botella que flota en el agua, medio hundida, con ondas a los lados.
function dibujarBotella(x, y) {
  const b = Math.round(Math.sin(estado.reloj * 2 + x) * 1.5);
  ctx.save(); ctx.beginPath(); ctx.rect(x - 2, y - 6, 20, 17 + b); ctx.clip();
  cuadro('mar_tiles', MAR_TILES.botella, x, y - 3 + b);
  ctx.restore();
  ctx.globalAlpha = 0.7; ctx.fillStyle = COLOR.crema;
  const onda = Math.floor(estado.reloj * 2) % 2;
  ctx.fillRect(x + 1 - onda, y + 11 + b, 4, 1); ctx.fillRect(x + 11 + onda, y + 11 + b, 4, 1);
  ctx.globalAlpha = 1;
}
// Animalito en apuros (con un "!" que asoma) y, una vez rescatado, de camino al agua.
function posRescate(r) {
  if (r.t < 0) return r.f * T;
  const y1 = (costaEn(r.c) + 0.2) * T;
  return r.f * T + (y1 - r.f * T) * Math.min(1, r.t / (DURA_RESCATE - 0.6));
}
function dibujarRescate(r, x, y) {
  const espera = r.t < 0;
  const meneo = espera && Math.sin(estado.reloj * 1.5) > 0 ? Math.round(Math.sin(estado.reloj * 9)) : 0;
  ctx.globalAlpha = espera ? 1 : Math.max(0, Math.min(1, (DURA_RESCATE - r.t) / 0.6));
  if (r.tipo === 'tortuga') {
    if (espera) {
      ctx.save(); ctx.translate(x + meneo, y + T); ctx.scale(1, -1);
      ctx.drawImage(img.fauna_tiles, nFauna('tortuga') * T, 0, T, T, 0, 0, T, T);
      ctx.restore();
    } else cuadro('fauna_tiles', nFauna('tortuga'), x, y + Math.round(Math.sin(r.t * 12)));
  } else if (r.tipo === 'pulpito') {
    if (espera) { ctx.globalAlpha = 0.35; elipsePx(x + 8, y + 14, 6, 1, '#6FA9D8'); ctx.globalAlpha = 1; }
    cuadro('fauna_tiles', nFauna('pulpo'), x + meneo, y + (espera ? 0 : -Math.round(Math.abs(Math.sin(r.t * 8)) * 2)));
  } else {
    cuadro('mar_tiles', MAR_TILES.foca, x + meneo, y);
    if (espera) {
      ctx.fillStyle = '#B98A5A';
      for (let i = 0; i < 4; i++) { ctx.fillRect(x + 2 + i * 4 + meneo, y + 8, 1, 7); }
      for (let j = 0; j < 2; j++) ctx.fillRect(x + 1 + meneo, y + 10 + j * 3, 14, 1);
    }
  }
  ctx.globalAlpha = 1;
  if (espera && Math.sin(estado.reloj * 2) > -0.3) {
    const by = y - 13 + Math.round(Math.sin(estado.reloj * 4));
    panel(x + 4, by, 8, 10);
    mapaBits(['#', '#', '#', '#', '.', '#'], x + 7, by + 2, '#E87F86');
  }
}
// Coral del jardin del fondo segun su etapa (0 brotito ... 3 coral grande con poliperos que brillan).
function dibujarCoral(x, y, etapa, k) {
  const color = TONOS_CORAL[(k + 6) % 6], alto = [3, 6, 9, 13][etapa];
  const ramas = [[7, 1], [4, 0.7], [10, 0.8], [2, 0.45], [12, 0.55]].slice(0, etapa + 2);
  const mece = Math.round(Math.sin(estado.reloj * 1.2 + k) * 0.6);
  for (const pase of [0, 1]) for (const [rx, h] of ramas) {
    const hh = Math.max(2, Math.round(alto * h)), top = y + 14 - hh;
    if (pase === 0) { ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + rx - 1 + mece, top - 1, 4, hh + 2); }
    else { ctx.fillStyle = color; ctx.fillRect(x + rx + mece, top, 2, hh); ctx.fillStyle = COLOR.crema; ctx.fillRect(x + rx + mece, top, 1, 1); }
  }
  if (etapa >= 2) { ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + 3, y + 13, 10, 2); ctx.fillStyle = color; ctx.fillRect(x + 4, y + 13, 8, 1); }
  if (etapa >= 3 && Math.sin(estado.reloj * 2 + k) > 0.5) { ctx.fillStyle = COLOR.mantequilla; ctx.fillRect(x + 7 + mece, y + 1, 1, 1); ctx.fillRect(x + 11 + mece, y + 5, 1, 1); }
}
// Corales de adorno del fondo: 0 de ramas, 1 cerebro, 2 abanico.
function dibujarCoralAdorno(x, y, tipo, i) {
  if (tipo === 0) { dibujarCoral(x, y, 3, i + 1); return; }
  if (tipo === 1) {
    elipsePx(x + 8, y + 11, 7, 4, COLOR.ciruela); elipsePx(x + 8, y + 11, 6, 3, '#C5B4E3');
    ctx.fillStyle = '#9F8BC9';
    for (let j = 0; j < 3; j++) for (let i2 = 0; i2 < 4; i2++) ctx.fillRect(x + 3 + i2 * 3 + (j % 2), y + 9 + j * 2, 2, 1);
    ctx.fillStyle = '#E6DDF5'; ctx.fillRect(x + 5, y + 8, 3, 1);
    return;
  }
  const v = Math.round(Math.sin(estado.reloj * 1.1 + i) * 0.7);
  for (let j = 0; j < 12; j++) {
    const w = Math.min(6, 1 + Math.floor(j * 0.6)), cx = x + 8 + Math.round(v * j / 12);
    ctx.fillStyle = COLOR.ciruela; ctx.fillRect(cx - w - 1, y + 15 - j, w * 2 + 2, 1);
    ctx.fillStyle = (j + w) % 2 ? '#E6A8D7' : '#F28CA0'; ctx.fillRect(cx - w, y + 15 - j, w * 2, 1);
  }
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + 7 + v, y + 3, 4, 1);
}
// Alga larga que se mece con la corriente (tres tiras de distinta altura).
function dibujarAlga(x, y, i) {
  const altos = [22, 30, 18];
  [3, 7, 11].forEach((bx, s) => {
    const h = altos[(s + i) % 3];
    for (let j = 0; j < h; j++) {
      const px = x + bx + Math.round(Math.sin(estado.reloj * 1.4 + j * 0.25 + i + s) * (j / h) * 3);
      ctx.fillStyle = COLOR.ciruela; ctx.fillRect(px - 1, y + 15 - j, 4, 1);
      ctx.fillStyle = j % 6 < 3 ? '#5FA373' : '#7FBF8E'; ctx.fillRect(px, y + 15 - j, 2, 1);
    }
  });
}
function dibujarOstra(x, y, i) {
  const abierta = estado.playa && estado.playa.ostras[i];
  cuadro('mar_tiles', MAR_TILES.ostra, x, y);
  if (abierta) { ctx.fillStyle = COLOR.crema; ctx.fillRect(x + 3, y + 11, 10, 1); }
  else if ((estado.reloj + i * 1.3) % 3 < 0.3) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 11, y + 6, 1, 3); ctx.fillRect(x + 10, y + 7, 3, 1); }
}
// Barco hundido (3x2) inclinado sobre la arena, con el mastil roto y algas.
function dibujarBarcoHundido(x, y) {
  const o = COLOR.ciruela;
  for (let i = 0; i < 46; i++) {
    const arriba = y + 15 + Math.round(i * 0.12), redondo = Math.round(Math.max(0, Math.abs(i - 23) - 15) ** 1.4 * 0.5);
    const abajo = y + 30 - redondo;
    ctx.fillStyle = o; ctx.fillRect(x + 1 + i, arriba, 1, abajo - arriba + 1);
    if (i === 0 || i === 45) continue;
    for (let yy = arriba + 1; yy < abajo; yy++) { ctx.fillStyle = (yy - arriba) % 4 === 0 ? '#7A4E3C' : '#9C6B48'; ctx.fillRect(x + 1 + i, yy, 1, 1); }
    if (i % 5 === 2) { ctx.fillStyle = '#7FBF8E'; ctx.fillRect(x + 1 + i, arriba + 1, 1, 2 + (i % 3)); }
  }
  elipsePx(x + 14, y + 22, 2, 2, o); elipsePx(x + 14, y + 22, 1, 1, '#2E4E7A');
  elipsePx(x + 28, y + 24, 2, 2, o); elipsePx(x + 28, y + 24, 1, 1, '#2E4E7A');
  for (let j = 0; j < 20; j++) { ctx.fillStyle = o; ctx.fillRect(x + 22 + Math.round(j * 0.45), y + 17 - j, 3, 1); ctx.fillStyle = '#A9714F'; ctx.fillRect(x + 23 + Math.round(j * 0.45), y + 17 - j, 1, 1); }
}
// Cuerda con ancla por donde se baja al fondo (y se vuelve a subir).
function dibujarCuerdaFondo(x, y) {
  const top = FONDO.f0 * T;
  for (let yy = top; yy < y + 10; yy++) {
    const dx = Math.round(Math.sin(yy * 0.08 + estado.reloj) * 1);
    ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + 7 + dx, yy, 3, 1);
    ctx.fillStyle = (yy % 4) < 2 ? '#E8D2A8' : '#D9B47E'; ctx.fillRect(x + 8 + dx, yy, 1, 1);
  }
  const o = COLOR.ciruela, h = '#9A90AB';
  ctx.fillStyle = o; ctx.fillRect(x + 7, y + 9, 3, 7); ctx.fillRect(x + 3, y + 13, 11, 3); ctx.fillRect(x + 2, y + 11, 3, 3); ctx.fillRect(x + 12, y + 11, 3, 3);
  ctx.fillStyle = h; ctx.fillRect(x + 8, y + 10, 1, 5); ctx.fillRect(x + 4, y + 14, 9, 1); ctx.fillRect(x + 3, y + 12, 1, 2); ctx.fillRect(x + 13, y + 12, 1, 2);
}
// Suelo del fondo: arena clarita con olitas; las parcelas de coral llevan un corro de piedrecitas.
function dibujarFondoArena(c, f, parcela) {
  const x = c * T, y = f * T;
  ctx.fillStyle = '#C4E4E4'; ctx.fillRect(x, y, T, T);
  ctx.fillStyle = '#DDF3F0';
  for (let i = 0; i < 2; i++) {
    const ox = Math.floor(azar(c, f, 80 + i) * 10), oy = 2 + Math.floor(azar(c, f, 82 + i) * 12);
    ctx.fillRect(x + ox, y + oy, 5, 1); ctx.fillRect(x + ox + 1, y + oy - 1, 3, 1);
  }
  ctx.fillStyle = '#9FCBD0';
  for (let i = 0; i < 3; i++) ctx.fillRect(x + Math.floor(azar(c, f, 85 + i) * 15), y + Math.floor(azar(c, f, 88 + i) * 15), 1, 1);
  if (!parcela) return;
  elipsePx(x + 8, y + 10, 7, 4, '#B9AFC4'); elipsePx(x + 8, y + 10, 6, 3, '#E9DAB4');
  ctx.fillStyle = '#9A90AB';
  for (let i = 0; i < 6; i++) ctx.fillRect(x + 2 + i * 2 + (i % 2), y + (i % 2 ? 13 : 6), 2, 1);
}
// Roca del fondo: arena debajo y una roca redondeada (esquinas recortadas donde acaba), con bultos y musgo.
function dibujarRocaFondo(c, f) {
  const x = c * T, y = f * T, es = (dc, df) => tile(c + dc, f + df) === 'R' || tile(c + dc, f + df) === ' ';
  dibujarFondoArena(c, f);
  const ar = es(0, -1), ab = es(0, 1), iz = es(-1, 0), de = es(1, 0);
  // Silueta: rectangulo con las esquinas libres redondeadas (4 px)
  const R = 4, filas = [];
  for (let j = 0; j < T; j++) {
    let a = 0, b = T;
    const d0 = j < R && !ar ? R - j : j >= T - R && !ab ? j - (T - R - 1) : 0;
    if (d0) { const m = Math.round(R - Math.sqrt(Math.max(0, R * R - (R - d0) * (R - d0)))) ; if (!iz) a = m; if (!de) b = T - m; }
    filas.push([a, b]);
  }
  ctx.fillStyle = COLOR.ciruela;
  filas.forEach(([a, b], j) => ctx.fillRect(x + a, y + j, b - a, 1));
  ctx.fillStyle = '#8A7FA6';
  filas.forEach(([a, b], j) => {
    const top = !ar && j === 0, bot = !ab && j >= T - 2;
    if (top || bot) return;
    const a2 = a + (iz ? 0 : 1), b2 = b - (de ? 0 : 1);
    ctx.fillRect(x + a2, y + j, b2 - a2, 1);
  });
  // Sombra abajo y bultos
  ctx.fillStyle = '#6F6690';
  if (!ab) ctx.fillRect(x + (iz ? 0 : 3), y + T - 5, T - (iz ? 0 : 3) - (de ? 0 : 3), 3);
  for (let i = 0; i < 2; i++) {
    const bx = x + 2 + Math.floor(azar(c, f, 90 + i) * 9), by = y + 4 + Math.floor(azar(c, f, 93 + i) * 6);
    ctx.fillRect(bx, by + 2, 4, 1); ctx.fillStyle = '#A59BBE'; ctx.fillRect(bx, by, 3, 1); ctx.fillStyle = '#6F6690';
  }
  if (!ar) {
    ctx.fillStyle = '#B3A9C9'; ctx.fillRect(x + (iz ? 1 : 3), y + 2, T - (iz ? 1 : 3) - (de ? 1 : 3), 1);
    if (azar(c, f, 96) < 0.55) { ctx.fillStyle = '#7FBF8E'; const mx = x + 3 + Math.floor(azar(c, f, 97) * 8); ctx.fillRect(mx, y + 1, 4, 1); ctx.fillRect(mx + 1, y + 2, 2, 1); }
  }
}
// Luz del fondo (encima de todo lo del mundo): agua azul, mas oscura hacia abajo, rayos de sol y destellos.
function dibujarLuzFondo() {
  const w = lienzo.width, h = lienzo.height;
  ctx.globalAlpha = 0.1; ctx.fillStyle = '#5FC2DE'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#1E3F73';
  for (let j = 0; j < h; j += 4) { ctx.globalAlpha = 0.1 * j / h; ctx.fillRect(0, j, w, 4); }
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = '#A9D8E8';
  for (let i = 0; i < 4; i++) {
    const x0 = ((i * 83 + estado.reloj * 5 - cam.x * 0.3) % (w + 90) + w + 90) % (w + 90) - 60;
    ctx.globalAlpha = 0.05 + 0.025 * Math.sin(estado.reloj * 0.8 + i * 2);
    for (let j = 0; j < h; j += 2) ctx.fillRect(Math.round(x0 + j * 0.35), j, 9 + i * 3, 2);
  }
  ctx.fillStyle = '#E4F4FA';
  for (let k = 0; k < 24; k++) {
    const px = Math.floor(azar(k, 1, 100) * w), py = Math.floor(azar(k, 2, 101) * h);
    const brillo = Math.sin(estado.reloj * 1.7 + k * 1.3);
    if (brillo < 0.4) continue;
    ctx.globalAlpha = 0.18 * brillo; ctx.fillRect(px + Math.round(Math.sin(estado.reloj + k) * 3), py, 4, 1);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}
function dibujarPeces() {
  for (const pz of peces) {
    if (!enVista(pz.x, pz.y, cam.x, cam.y)) continue;
    cuadro('fauna_tiles', pz.n, pz.x, pz.y + Math.round(Math.sin(estado.reloj * 1.5 + pz.fase) * 2), pz.v > 0);
  }
}
// Pozas de marea: corro de piedras con agua, una anemona, una estrellita y, si aun no se ha mirado hoy,
// algo que se mueve dentro.
function dibujarPoza(x, y, i) {
  const cx = x + 16, cy = y + 9, mirada = estado.playa && estado.playa.pozas[i];
  elipsePx(cx, cy + 1, 15, 6, COLOR.ciruela);
  elipsePx(cx, cy, 14, 5, '#B9AFC4');
  for (let k = 0; k < 10; k++) {
    const a = k / 10 * Math.PI * 2 + azar(i, k, 3);
    ctx.fillStyle = k % 2 ? '#9A90AB' : '#D3CBDD';
    ctx.fillRect(Math.round(cx + Math.cos(a) * 12) - 1, Math.round(cy + Math.sin(a) * 4), 3, 1);
  }
  elipsePx(cx, cy, 11, 3, '#4F86C6');
  elipsePx(cx - 1, cy - 1, 8, 2, '#6FA9D8');
  ctx.fillStyle = '#F28CA0'; ctx.fillRect(cx + 6, cy, 2, 2); ctx.fillStyle = '#F7A6B4'; ctx.fillRect(cx + 6, cy - 1, 1, 1);
  ctx.fillStyle = '#E8A85C'; ctx.fillRect(cx - 8, cy + 1, 2, 1); ctx.fillRect(cx - 7, cy, 1, 3);
  ctx.fillStyle = '#E4F4FA';
  if (Math.sin(estado.reloj * 2 + i) > 0.2) ctx.fillRect(cx - 4 + Math.round(Math.sin(estado.reloj + i) * 2), cy - 2, 3, 1);
  if (!mirada) {
    ctx.globalAlpha = 0.7; ctx.fillStyle = '#2E4E7A';
    ctx.fillRect(Math.round(cx + Math.sin(estado.reloj * 1.3 + i * 2) * 5) - 1, cy + 1, 3, 1);
    ctx.globalAlpha = 1;
    if ((estado.reloj + i) % 2.5 < 0.25) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(cx + 2, cy - 4, 1, 3); ctx.fillRect(cx + 1, cy - 3, 3, 1); }
  }
}
// Faro del islote (1x2): torre a rayas crema y rosa, galeria, linterna que se enciende de noche y tejadito.
function dibujarFaro(x, y) {
  const o = COLOR.ciruela, base = y + 30, noche = oscuridad(estado.hora) > 0.4;
  const r = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(x + rx, ry, w, h); };
  sombra(x + 8, base + 1, 20, 4);
  for (let j = 0; j < 34; j++) {
    const hw = 6 - Math.floor(j / 10), yy = base - j;
    r(o, 7 - hw, yy, hw * 2 + 2, 1);
    r(Math.floor(j / 6) % 2 ? '#F28CA0' : COLOR.crema, 8 - hw, yy, hw * 2, 1);
    r(Math.floor(j / 6) % 2 ? '#E87F86' : '#F1DCC8', 8 + hw - 2, yy, 2, 1);
  }
  r(o, 6, base - 6, 4, 7); r('#8A5A44', 7, base - 5, 2, 6);
  r(o, 7, base - 21, 2, 4); r(noche ? COLOR.mantequilla : '#A9D8E8', 7, base - 20, 2, 2);
  r(o, 1, base - 35, 14, 2); r('#E8A85C', 2, base - 35, 12, 1);
  const parpadeo = noche && Math.sin(estado.reloj * 3) > -0.6;
  r(o, 3, base - 43, 10, 8);
  r(parpadeo ? COLOR.mantequilla : noche ? '#FFF6C8' : '#E4F4FA', 4, base - 42, 8, 6);
  r(o, 7, base - 42, 2, 6);
  for (let j = 0; j < 5; j++) { const w = 12 - j * 2; r(o, 8 - w / 2 - 1, base - 44 - j, w + 2, 1); r(j % 2 ? '#E87F86' : '#F28CA0', 8 - w / 2, base - 44 - j, w, 1); }
  r(o, 7, base - 50, 2, 2);
}
// Palmera del islote (1x2): tronco curvado con anillos, hojas que se mecen y cocos.
function dibujarPalmera(x, y) {
  const base = y + 30, v = viento(x, y, 1.2);
  sombra(x + 12, base + 1, 22, 5);
  let tx = 0;
  for (let j = 0; j < 30; j++) {
    tx = x + 5 + Math.round((j / 29) ** 2 * 6) + (j > 20 ? v : 0);
    ctx.fillStyle = COLOR.ciruela; ctx.fillRect(tx - 1, base - j, 5, 1);
    ctx.fillStyle = j % 4 === 0 ? '#A9714F' : '#C98F6B'; ctx.fillRect(tx, base - j, 3, 1);
  }
  const cx = tx + 1, cy = base - 30;
  const hojas = [[-1, -0.35, 13], [1, -0.35, 13], [-1, 0.15, 11], [1, 0.2, 12], [0.25, -1, 7], [-0.4, -0.9, 8]];
  for (const pase of [0, 1]) for (const [dx, dy, largo] of hojas) {
    for (let k = 0; k < largo; k++) {
      const lx = Math.round(cx + dx * k + v * k / largo), ly = Math.round(cy + dy * k + k * k / 16);
      if (pase === 0) { ctx.fillStyle = COLOR.ciruela; ctx.fillRect(lx - 1, ly - 1, 3, 3); }
      else { ctx.fillStyle = k % 3 === 0 ? '#5FA373' : '#7FBF8E'; ctx.fillRect(lx, ly, 1, 1); if (k < largo - 2) ctx.fillRect(lx, ly - 1, 1, 1); }
    }
  }
  for (const [ox, oy] of [[-2, 2], [2, 3]]) { elipsePx(cx + ox, cy + oy, 2, 2, COLOR.ciruela); elipsePx(cx + ox, cy + oy, 1, 1, '#8A5A44'); }
}
function dibujarCofre(x, y, abierto) {
  const o = COLOR.ciruela, r = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(x + rx, y + ry, w, h); };
  sombra(x + 8, y + 15, 14, 3);
  r(o, 2, 7, 12, 8); r('#A9714F', 3, 8, 10, 6); r('#C98F6B', 3, 8, 10, 1);
  r('#E8A85C', 5, 8, 1, 6); r('#E8A85C', 10, 8, 1, 6);
  if (abierto) { r(o, 2, 2, 12, 5); r('#8A5A44', 3, 3, 10, 3); r('#E8A85C', 5, 3, 1, 3); r('#E8A85C', 10, 3, 1, 3); return; }
  r(o, 2, 3, 12, 5); r('#C98F6B', 3, 4, 10, 3); r('#E0A877', 3, 4, 10, 1);
  r('#E8A85C', 5, 4, 1, 3); r('#E8A85C', 10, 4, 1, 3); r(o, 7, 6, 2, 3); r(COLOR.mantequilla, 7, 7, 2, 1);
  if ((estado.reloj % 3) < 0.3) { r('#FFFFFF', 12, 1, 1, 3); r('#FFFFFF', 11, 2, 3, 1); }
}
// Rocas de las focas (2x1, en el agua): dos piedras con espuma y dos focas tumbadas al sol.
function dibujarRocasFocas(x, y) {
  ctx.globalAlpha = 0.6; ctx.fillStyle = COLOR.crema;
  const ola = Math.floor(estado.reloj * 2) % 2;
  ctx.fillRect(x - 2 - ola, y + 13, 6, 1); ctx.fillRect(x + 28 + ola, y + 14, 6, 1); ctx.fillRect(x + 12, y + 16, 8, 1);
  ctx.globalAlpha = 1;
  elipsePx(x + 10, y + 11, 10, 4, COLOR.ciruela); elipsePx(x + 10, y + 10, 9, 3, '#9A90AB'); elipsePx(x + 8, y + 9, 5, 1, '#B9AFC4');
  elipsePx(x + 25, y + 12, 7, 3, COLOR.ciruela); elipsePx(x + 25, y + 11, 6, 2, '#9A90AB'); elipsePx(x + 24, y + 10, 3, 1, '#B9AFC4');
  const cabeza = Math.sin(estado.reloj * 0.9) > 0.6 ? -1 : 0;
  cuadro('mar_tiles', MAR_TILES.foca, x + 2, y - 4 + cabeza);
  cuadro('mar_tiles', MAR_TILES.foca, x + 17, y - 2, true);
}
// Sitio de buceo: un circulo de agua mas honda con burbujas que suben.
function dibujarBurbujas(x, y) {
  ctx.globalAlpha = 0.22; elipsePx(x + 8, y + 9, 7, 3, '#2E4E7A');
  ctx.fillStyle = COLOR.crema;
  for (let i = 0; i < 4; i++) {
    const t = (estado.reloj * 0.7 + i * 0.27) % 1, bx = Math.round(x + 4 + (i * 5) % 9 + Math.sin(t * 6 + i)), by = Math.round(y + 11 - t * 12);
    ctx.globalAlpha = 0.9 * (1 - t);
    ctx.fillRect(bx, by, 2, 1); ctx.fillRect(bx - 1, by + 1, 1, 1); ctx.fillRect(bx + 2, by + 1, 1, 1); ctx.fillRect(bx, by + 2, 2, 1);
  }
  ctx.globalAlpha = 1;
}
// Caseta de playa de Brisa (2x2): paredes de rayas, tejado rosa, ojo de buey, salvavidas y tabla de surf.
function dibujarCaseta(x, y) {
  const o = COLOR.ciruela, noche = oscuridad(estado.hora) > 0.4;
  const r = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(x + rx, y + ry, w, h); };
  sombra(x + 16, y + 31, 32, 5);
  r(o, 3, 11, 26, 20);
  for (let i = 4; i < 28; i += 4) { r(COLOR.crema, i, 12, 2, 18); r('#A9D8E8', i + 2, 12, 2, 18); }
  for (let j = 0; j < 7; j++) { const w = 6 + j * 4; r(o, 16 - w / 2 - 1, 3 + j, w + 2, 1); r(j % 3 === 2 ? '#E87F86' : '#F28CA0', 16 - w / 2, 3 + j, w, 1); }
  r(o, 0, 10, 32, 2); r('#E87F86', 1, 10, 30, 1);
  const v = viento(x, y, 2.4);
  r(o, 15, -4, 1, 8); r(o, 16, -4, 5 + v, 4); r('#A9D8E8', 16, -3, 4 + v, 2);
  r(o, 13, 18, 7, 13); r('#7C9CC9', 14, 19, 5, 12); r(COLOR.mantequilla, 17, 25, 1, 1);
  elipsePx(x + 8, y + 19, 3, 3, o); elipsePx(x + 8, y + 19, 2, 2, noche ? COLOR.mantequilla : '#E4F4FA');
  elipsePx(x + 25, y + 21, 3, 3, o); elipsePx(x + 25, y + 21, 2, 2, '#F28CA0'); r(o, 24, 20, 2, 2);
  r(COLOR.crema, 22, 21, 1, 1); r(COLOR.crema, 27, 21, 1, 1);
  r(o, 29, 8, 4, 23); r('#FFE08A', 30, 9, 2, 21); r('#F28CA0', 30, 17, 2, 3);
}
// Lo que se ve desde la barca: el lomo de una ballena que sopla, delfines que saltan o una tortuga.
function dibujarAvistamiento() {
  const av = estado.avistamiento;
  if (!av) return;
  const d = DURA_AVISTAMIENTO[av.tipo], p = av.t / d, o = COLOR.ciruela;
  ctx.globalAlpha = Math.max(0, Math.min(1, av.t * 2, (d - av.t) * 2));
  if (av.tipo === 'ballena') {
    const x = av.x - av.lado * av.t * 5, y = av.y + 10, sube = Math.sin(Math.min(1, p * 1.25) * Math.PI);
    const alto = Math.round(4 * sube);
    if (alto > 0) { elipsePx(x + 8, y, 14, alto + 1, o); elipsePx(x + 8, y, 13, alto, '#3E5F8A'); elipsePx(x + 5, y - alto + 1, 6, 1, '#5E7FB0'); }
    ctx.fillStyle = COLOR.crema; ctx.fillRect(x - 6, y + alto, 28, 1);
    if (p > 0.15 && p < 0.6) {
      const h = Math.round(Math.sin((p - 0.15) / 0.45 * Math.PI) * 16);
      ctx.fillStyle = '#E4F4FA';
      for (let j = 0; j < h; j++) ctx.fillRect(x + 7 + Math.round(Math.sin(j) * 0.5), y - alto - j, 2, 1);
      for (let k = 0; k < 6; k++) ctx.fillRect(x + 8 + Math.round(Math.cos(k) * (3 + k)), y - alto - h + Math.round(Math.abs(Math.sin(k)) * 3) + k % 2, 1, 1);
    }
    if (p > 0.72) {
      const cola = Math.round(Math.sin((p - 0.72) / 0.28 * Math.PI) * 7), cx = x + 8 + av.lado * 12;
      ctx.fillStyle = o; ctx.fillRect(cx - 1, y - cola, 3, cola); ctx.fillRect(cx - 5, y - cola - 2, 11, 3);
      ctx.fillStyle = '#3E5F8A'; ctx.fillRect(cx - 4, y - cola - 1, 9, 1);
    }
  } else if (av.tipo === 'delfines') {
    for (let i = 0; i < 2; i++) {
      const q = av.t * 0.75 - i * 0.3;
      if (q < 0 || q > 1) continue;
      const x = av.x + av.lado * (q * 44 + i * 8) - 22 * av.lado, y = av.y - Math.round(Math.sin(q * Math.PI) * 16);
      cuadro('fauna_tiles', nFauna('delfin'), x, y, av.lado > 0);
      if (q < 0.12 || q > 0.88) { ctx.fillStyle = COLOR.crema; ctx.fillRect(Math.round(x + 4), av.y + 12, 8, 1); ctx.fillRect(Math.round(x + 6), av.y + 10, 1, 2); ctx.fillRect(Math.round(x + 10), av.y + 9, 1, 2); }
    }
  } else {
    const x = av.x + av.lado * av.t * 4, y = av.y + 2;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 4, y - 8, 24, 18); ctx.clip();
    cuadro('fauna_tiles', nFauna('tortuga'), x, y + Math.round(Math.sin(av.t * 2)), av.lado > 0);
    ctx.restore();
    ctx.fillStyle = COLOR.crema; ctx.fillRect(Math.round(x), y + 10, 16, 1);
  }
  ctx.globalAlpha = 1;
}
// De noche en el mar: el plancton luminoso de la orilla (algunas noches) y el haz del faro que gira.
function dibujarNocheMar(noche) {
  const p = estado.playa;
  if (!p || noche < 0.2) return;
  ctx.globalCompositeOperation = 'lighter';
  if (p.plancton) {
    const c0 = Math.floor(cam.x / T), f0 = Math.floor(cam.y / T), g = estado.gata;
    for (let f = f0; f <= f0 + lienzo.height / T + 1; f++) for (let c = c0; c <= c0 + lienzo.width / T + 1; c++) {
      if (!enMar(c, f) || f > costaEn(c) + 5) continue;
      for (let i = 0; i < 3; i++) {
        const px = c * T + Math.floor(azar(c, f, 120 + i) * 16), py = f * T + Math.floor(azar(c, f, 123 + i) * 16);
        const brillo = 0.5 + 0.5 * Math.sin(estado.reloj * (1 + azar(c, f, 126 + i)) * 2 + azar(c, f, 129 + i) * 6);
        const cerca = Math.hypot(px - g.x - 8, py - g.y - 12) < 26;
        ctx.globalAlpha = Math.min(1, 0.65 * noche * brillo * (cerca ? 1.6 : 1));
        ctx.fillStyle = i ? '#7DF9FF' : '#B6FF8A';
        ctx.fillRect(px, py, cerca ? 2 : 1, 1);
      }
    }
  }
  const faro = ISLOTES[0], lx = (faro.c + 2) * T + 8, ly = (faro.f + 2) * T - 9;
  if (enVista(lx, ly, cam.x, cam.y, 120)) {
    const a = estado.reloj * 0.7;
    ctx.fillStyle = COLOR.mantequilla;
    for (let dd = 6; dd < 96; dd += 2) {
      const hw = Math.round(dd * 0.16), px = lx + Math.cos(a) * dd, py = ly + Math.sin(a) * dd * 0.5;
      ctx.globalAlpha = 0.09 * noche * (1 - dd / 96);
      ctx.fillRect(Math.round(px - hw), Math.round(py - hw / 2), hw * 2, Math.max(1, hw));
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}
// Estrellas fugaces (en la pantalla, sobre la oscuridad) las noches de lluvia de estrellas, cerca del mar.
function dibujarEstrellasFugaces(noche) {
  const periodo = 2.3, k = Math.floor(estado.reloj / periodo), t = (estado.reloj / periodo) % 1;
  if (t > 0.45) return;
  const p = t / 0.45, x0 = 50 + azar(k, 3, 90) * (lienzo.width - 30), y0 = 4 + azar(k, 4, 91) * 44;
  for (let i = 0; i < 24; i++) {
    const q = p - i * 0.018;
    if (q < 0) break;
    ctx.globalAlpha = noche * (1 - i / 24) * (p < 0.85 ? 1 : (1 - p) / 0.15);
    ctx.fillStyle = i < 3 ? '#FFFFFF' : COLOR.mantequilla;
    ctx.fillRect(Math.round(x0 - q * 90), Math.round(y0 + q * 40), i < 3 ? 2 : 1, i < 2 ? 2 : 1);
  }
  ctx.globalAlpha = 1;
}

// Adornos fijos del mar (se llaman al crear el mundo): pozas, islotes, focas, burbujas, la caseta de Brisa
// y el asiento de la punta del embarcadero.
function adornosMar() {
  const t = (c, f) => (MAPA[f] && MAPA[f][c]) || null;
  for (const c of [6, 19, 31, 73]) {
    const f = Math.max(costaEn(c), costaEn(c + 1)) - 2;
    if (t(c, f) !== 'Y' || t(c + 1, f) !== 'Y') continue;
    const i = POZAS.length;
    POZAS.push({ c, f });
    adorno(c, f, (x, y) => dibujarPoza(x, y, i), { ancho: 2 });
    for (let j = f - 2; j <= f + 1; j++) for (let k = c - 1; k <= c + 2; k++) delete fijos[k + ',' + j];
  }
  const faro = ISLOTES[0], palma = ISLOTES[1];
  adorno(faro.c + 2, faro.f, dibujarFaro, { alto: 2, luz: [[8, -9]] });
  adorno(palma.c + 2, palma.f, dibujarPalmera, { alto: 2 });
  Object.assign(COFRE, { c: palma.c + 4, f: palma.f + 1 });
  adorno(COFRE.c, COFRE.f, (x, y) => dibujarCofre(x, y, estado.playa && estado.playa.cofre));
  adorno(ROCAS_FOCAS.c, ROCAS_FOCAS.f, dibujarRocasFocas, { ancho: 2 });
  for (const s of SITIOS_BUCEO) adorno(s.c, s.f, dibujarBurbujas, { bloquea: false });
  const brisa = VECINOS.find(v => v.valle), h = brisa.hogar;
  adorno(h.c, h.f, dibujarCaseta, { ancho: 2, alto: 2, luz: [[8, 19]] });
  for (let j = h.f - 1; j <= h.f + 3; j++) for (let k = h.c - 1; k <= h.c + 3; k++) delete fijos[k + ',' + j];
  for (const s of [brisa.casa, brisa.plaza]) delete fijos[s.c + ',' + s.f];
  BANCOS.push({ c: EMBARCADERO.c, f: EMBARCADERO.punta, mira: 1, muelle: true });
  for (const k of BLOQUEADAS) delete fijos[k];
}
// El fondo del mar (30x18, debajo del pueblo): bordes de roca, jardin de coral, ostras, un barco hundido,
// algas y corales. Se llega por la cuerda de LLEGADA_FONDO.
function crearFondo() {
  const F = FONDO;
  const q = Array.from({ length: F.alto }, (_, f) => Array.from({ length: F.ancho }, (_, c) => {
    const borde = Math.min(c, f, F.ancho - 1 - c, F.alto - 1 - f);
    return borde === 0 || (borde === 1 && azar(c, f + F.f0, 7) < 0.45) ? 'R' : 'U';
  }));
  for (const [c, f] of [[4, 5], [5, 5], [4, 6], [20, 4], [24, 9], [25, 9], [25, 10], [6, 14], [27, 13], [16, 15]]) q[f][c] = 'R';
  for (let f = 0; f <= 4; f++) for (let c = 12; c <= 16; c++) if (f > 0 || c === 14) q[f][c] = 'U';
  const ostras = [[5, 12], [23, 6], [26, 15]], barco = [18, 12];
  for (const [c, f] of ostras) q[f][c] = 'U';
  for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) q[barco[1] + j][barco[0] + i] = 'U';
  for (const [c, f] of [[8, 9], [10, 9], [12, 9], [8, 11], [10, 11], [12, 11]]) { q[f][c] = 'Q'; PARCELAS_CORAL.push(enFondoA(c, f)); }
  while (MAPA.length < F.f0) MAPA.push(' '.repeat(ANCHO));
  for (let f = 0; f < F.alto; f++) MAPA.push(q[f].join('') + ' '.repeat(ANCHO - F.ancho));
  const A = (c, f, dibujar, op) => { const g = enFondoA(c, f); return adorno(g.c, g.f, dibujar, op); };
  ostras.forEach(([c, f], i) => { OSTRAS.push(enFondoA(c, f)); A(c, f, (x, y) => dibujarOstra(x, y, i)); });
  A(barco[0], barco[1], dibujarBarcoHundido, { ancho: 3, alto: 2 });
  A(LLEGADA_FONDO.c, LLEGADA_FONDO.f - F.f0 - 2, dibujarCuerdaFondo, { bloquea: false });
  [[3, 3], [7, 2], [21, 2], [26, 4], [2, 9], [16, 8], [27, 8], [4, 15], [14, 15], [22, 15]].forEach(([c, f], i) => A(c, f, (x, y) => dibujarAlga(x, y, i), { bloquea: false }));
  [[6, 7, 0], [17, 6, 1], [20, 15, 2], [9, 15, 0], [23, 11, 2], [2, 13, 1], [27, 3, 0], [15, 11, 1]].forEach(([c, f, tipo], i) => A(c, f, (x, y) => dibujarCoralAdorno(x, y, tipo, i), { bloquea: false }));
}

// ---------- Diario: pagina Playa y mar ----------
const recuerdoVisto = e => e.clase === 'carta' ? estado.cartas.includes(e.i) : !!estado.recuerdos[e.clase === 'rescate' ? 'rescate_' + e.id : e.clase === 'castillo' ? 'castillo' : e.id];
const vecesRecuerdo = e => estado.recuerdos[e.clase === 'rescate' ? 'rescate_' + e.id : e.clase === 'castillo' ? 'castillo' : e.id] || 0;
function iconoRecuerdo(e) {
  if (e.clase === 'carta') return { nombre: 'mar_tiles', n: MAR_TILES.carta };
  if (e.clase === 'castillo') return { nombre: 'mar_tiles', n: MAR_TILES.cubo };
  const foca = { nombre: 'mar_tiles', n: MAR_TILES.foca };
  if (e.clase === 'rescate') return e.id === 'foca' ? foca : { nombre: 'fauna_tiles', n: nFauna(e.id === 'pulpito' ? 'pulpo' : 'tortuga') };
  return { ballena: { nombre: 'fauna_tiles', n: nFauna('ballena') }, delfines: { nombre: 'fauna_tiles', n: nFauna('delfin') },
    tortuga: { nombre: 'fauna_tiles', n: nFauna('tortuga') }, focas: foca, estrellas: { nombre: 'mar_tiles', n: MAR_TILES.estrella },
    plancton: { nombre: 'fauna_tiles', n: nFauna('medusa'), luz: true } }[e.id];
}
function dibujoRecuerdo(e) {
  const d = iconoRecuerdo(e);
  if (!recuerdoVisto(e)) return lienzoDe(img[d.nombre], d.n, () => tintada(d.nombre, '#C5B4E3'));
  return lienzoDe(img[d.nombre], d.n, d.luz ? () => luminosa(d.nombre) : null);
}
const nombreRecuerdo = e => e.clase === 'carta' ? 'Carta en una botella nº ' + (e.i + 1) : e.clase === 'castillo' ? 'Castillo de arena'
  : e.clase === 'rescate' ? RESCATES[e.id].nombre : AVISTAMIENTOS[e.id].nombre;
function textoRecuerdo(e) {
  const visto = recuerdoVisto(e), n = vecesRecuerdo(e);
  if (e.clase === 'carta') return visto ? '<p>«' + CARTAS[e.i].texto + '»</p>' : '<p class="nota">Algunas mañanas llega una botella flotando a la orilla de la playa.</p>';
  if (e.clase === 'castillo') return visto ? '<p class="nota">Has terminado ' + n + (n === 1 ? ' castillo' : ' castillos') + '. La marea se los lleva cada noche y deja una concha a cambio.</p>'
    : '<p class="nota">Mira hacia la arena de la playa y pulsa Espacio varias veces.</p>';
  if (e.clase === 'rescate') return visto ? '<p class="nota">Has ayudado ' + n + (n === 1 ? ' vez' : ' veces') + '. ¡Qué buen corazón!</p>'
    : '<p class="nota">A veces, por la mañana, algún animalito necesita ayuda en la playa.</p>';
  const a = AVISTAMIENTOS[e.id];
  return visto ? '<p class="nota">' + a.texto + ' Lo has visto ' + n + (n === 1 ? ' vez.' : ' veces.') + '</p>' : '<p class="nota">' + a.pista + '</p>';
}

// ---------- Vecinos ----------

function datosVecino(v) {
  return estado.vecinos[v.id] || (estado.vecinos[v.id] = { entregas: 0, pedido: v.pide() });
}
const corazones = v => Math.min(MAX_CORAZONES, Math.floor(datosVecino(v).entregas / ENTREGAS_POR_CORAZON));
const textoPedido = p => p.n + ' × ' + nombreDe(p.id).toLowerCase();

// Hablar con un vecino: si tienes lo que pide se lo das y te hace un regalo; si no, te lo recuerda.
function hablar(v) {
  const d = datosVecino(v), p = d.pedido;
  const tengo = estado.inv[p.id] || 0;
  if (tengo < p.n) {
    abrirDialogo(v, [{
      texto: saludo(v) + ' ¿Me traerías <b>' + textoPedido(p) + '</b>? Me haría muchísima ilusión.' + (tengo ? ' Veo que ya llevas ' + tengo + '.' : ''),
      pista: pistaDe(p.id),
    }]);
    return;
  }
  estado.inv[p.id] -= p.n;
  d.entregas++;
  d.pedido = v.pide();
  // Al llegar a cierta amistad, el regalo es su herramienta especial (una sola vez).
  const idHerramienta = Object.keys(HERRAMIENTAS).find(h => HERRAMIENTAS[h].vecino === v.id);
  if (corazones(v) >= CORAZONES_HERRAMIENTA && !estado.herramientas[idHerramienta]) {
    estado.herramientas[idHerramienta] = true;
    const h = HERRAMIENTAS[idHerramienta];
    celebrar(null);
    sonar('dorado');
    abrirDialogo(v, [
      { texto: '¡Lo has traído! ¿Sabes qué? Ya somos amigos de verdad, y quiero regalarte algo especial: <b>' + h.nombre.toLowerCase() + '</b>. ' + h.texto + '.' },
      paginaPedido(d.pedido),
    ]);
    return;
  }
  // Regalo: casi siempre un cultivo brillante; a veces una criatura rara o epica.
  const x = Math.random();
  const regalo = x < 0.5 ? alAzar(CULTIVOS).id + '*' : alAzar(FAUNA.filter(a => a.r === (x < 0.85 ? 2 : 3))).id;
  const nuevo = dar(regalo);
  celebrar(regalo);
  sonar('dorado');
  abrirDialogo(v, [
    { texto: '¡Lo has traído! Muchas gracias. Toma, esto es para ti: <b>' + nombreDe(regalo).toLowerCase() + '</b>.' + (nuevo ? ' ¡Es nueva en tu enciclopedia!' : '') },
    paginaPedido(d.pedido),
  ]);
}

// Cada vecino saluda a su manera.
const SALUDOS = {
  conejo: ['¡Hola, {nombre}!', '¡Qué alegría verte por aquí, {nombre}!', '¡Uy, hola! Justo estaba pensando en ti.'],
  pinguina: ['¡Hola, {nombre}! ¿Has visto qué olas tan bonitas hoy?', 'Uy, ¡hola! Estaba contando conchitas.', '¡{nombre}! Justo pensaba en ir a nadar un ratito.'],
  rana:   ['Croac… hola, {nombre}.', '¡Buenas! El agua está fresquita hoy.', 'Croac, ¡cuánto tiempo sin verte, {nombre}!'],
  oso:    ['Hooola… qué sueñecito tengo.', '¡Hola, {nombre}! Me alegra verte.', 'Mmm, huele a miel… ah, ¡hola, {nombre}!'],
};
// El nombre va dentro de HTML (dialogos, tutorial): se escapa para que se vea tal cual.
const escaparHtml = s => s.replace(/[&<>"']/g, ch => '&#' + ch.charCodeAt(0) + ';');
const saludo = v => alAzar(SALUDOS[v.id]).replace('{nombre}', escaparHtml(estado.nombre || 'vecina'));

// Pista suave de como conseguir algo: no da la receta exacta, pero orienta.
function pistaDe(id) {
  const fi = ficha(id);
  if (fi.tipo === 'cultivo') {
    return 'Dicen que brota en la tierra del huerto si plantas su semilla y no te olvidas de regarla.' +
      (fi.seg >= 7 ? ' Es de las que crecen sin prisa.' : fi.seg <= 4 ? ' Y crece enseguida.' : '');
  }
  if (fi.tipo === 'tesoro') return fi.pista;
  if (fi.zonas.every(z => z === 'poza')) return 'Dicen que se esconde en las pozas de marea de la playa: asómate a mirar cada mañana.' + (fi.r >= 2 ? ' Es tímida: con un cubo de playa se encuentra más fácil.' : '');
  const donde = fi.zonas.length === Object.keys(ZONAS).length ? 'cualquier rincón con agua del valle' : fi.zonas.map(z => ZONAS[z]).join(' o en ');
  return 'He oído que se deja ver en ' + donde + ', con una caña y un poco de paciencia.' +
    (fi.lluvia ? ' Pero solo cuando llueve: le encanta el sonido de las gotas.' : '') +
    (fi.r >= 2 ? ' Es tímida: cuentan que se acerca más a quien acierta en el centro amarillo.' : '');
}
// Tablon de pedidos de la plaza: de un vistazo, que le haria ilusion a cada vecino (y si ya lo llevas).
const CARA_TABLON = { nombre: 'Tablón de pedidos', cara: c => { c.fillStyle = '#4A3347'; c.fillRect(2, 2, 12, 12); c.fillStyle = '#E8A85C'; c.fillRect(3, 3, 10, 10);
  c.fillStyle = '#FFF4E0'; c.fillRect(4, 4, 4, 5); c.fillStyle = '#FFE3EA'; c.fillRect(9, 5, 3, 5); c.fillStyle = '#E87F86'; c.fillRect(5, 4, 2, 1); c.fillRect(10, 5, 1, 1); } };
function leerTablon() {
  const lineas = VECINOS.map(v => {
    const p = datosVecino(v).pedido, listo = (estado.inv[p.id] || 0) >= p.n;
    return '<b>' + v.nombre + '</b> busca ' + textoPedido(p) + (listo ? ' · <b>¡ya lo tienes!</b>' : '');
  });
  abrirDialogo(CARA_TABLON, [{ texto: lineas.join('<br>'), pista: 'Por la mañana suelen estar en su puerta; por la tarde salen a pasear por la plaza y el estanque.' }]);
}
const paginaPedido = p => ({ texto: 'Y si algún día te viene bien… ¿me traerías <b>' + textoPedido(p) + '</b>?', pista: pistaDe(p.id) });

// ---------- Dialogos ----------
// Caja de conversacion en la parte de abajo del juego. Espacio pasa de pagina o la cierra.

function abrirDialogo(v, paginas) {
  estado.dialogo = { vecino: v, paginas, i: 0 };
  const cara = el('dialogoCara').getContext('2d');
  cara.clearRect(0, 0, T, T);
  if (v.cara) v.cara(cara);
  else cara.drawImage(img.vecinos_tiles, VECINOS.indexOf(v) * T, 0, T, T, 0, 0, T, T);
  el('dialogoRetrato').style.setProperty('--fondoCara', v.tejado ? v.tejado[0] : 'var(--fieltro)');
  el('dialogoNombre').textContent = v.nombre;
  el('dialogo').hidden = false;
  pintarDialogo();
  sonar('elegir');
}
function pintarDialogo() {
  const dg = estado.dialogo, pagina = dg.paginas[dg.i];
  el('dialogoTexto').innerHTML = marcarTexto(pagina.texto);
  el('dialogoPista').hidden = !pagina.pista;
  el('dialogoPista').innerHTML = pagina.pista ? 'Pista: ' + marcarTexto(escaparHtml(pagina.pista)) : '';
  // Abajo a la derecha bota una flechita (hay mas) o una huellita (se cierra).
  const sigue = dg.i < dg.paginas.length - 1;
  el('dialogoPie').innerHTML = (sigue ? 'seguir' : 'cerrar') + ' <kbd>Espacio</kbd><i style="--a:' + (sigue ? 1 : 0) + '"></i>';
  // El retrato se mece un momento, como si hablara.
  const r = el('dialogoRetrato');
  r.classList.remove('habla'); void r.offsetWidth; r.classList.add('habla');
}
function avanzarDialogo() {
  const dg = estado.dialogo;
  if (dg.i < dg.paginas.length - 1) { dg.i++; pintarDialogo(); sonar('cursor'); }
  else cerrarDialogo();
}
function cerrarDialogo() {
  estado.dialogo = null;
  el('dialogo').hidden = true;
  sonar('recoger');
}

// ---------- Armario ----------
// Una fila por tipo de prenda; izquierda/derecha cambia entre "sin poner" y las que has tejido.

const opcionesDe = tipo => [null, ...new Set(estado.armario.filter(p => p.tipo === tipo).map(p => p.color))];

function abrirVestidor(abrir) {
  estado.vestidor = abrir ? { fila: 0 } : null;
  el('vestidor').hidden = !abrir;
  sonar(abrir ? 'abrir' : 'recoger');
  if (abrir) pintarVestidor();
}

function pintarVestidor() {
  const filas = PRENDAS.map((pr, i) => {
    const ops = opcionesDe(pr.id), puesta = estado.ropa[pr.id];
    const muestras = ops.map(color =>
      '<span class="muestra' + (color === puesta ? ' puesta' : '') + '" style="background:' + (color || 'transparent') + '">' + (color ? '' : '✕') + '</span>').join('');
    return '<div class="filaRopa' + (i === estado.vestidor.fila ? ' activa' : '') + '"><b>' + pr.nombre + '</b>' +
      (ops.length > 1 ? muestras : '<small>Aún no has tejido ninguno</small>') + '</div>';
  });
  el('vestidorFilas').innerHTML = filas.join('');
}

function teclaVestidor(codigo) {
  const ve = estado.vestidor;
  if (codigo === 'Escape' || codigo === 'Space' || codigo === 'KeyE') { abrirVestidor(false); return; }
  if (!(codigo in FLECHAS)) return;
  const dir = FLECHAS[codigo];
  if (dir === 0 || dir === 2) ve.fila = (ve.fila + (dir === 2 ? 1 : PRENDAS.length - 1)) % PRENDAS.length;
  else {
    const tipo = PRENDAS[ve.fila].id, ops = opcionesDe(tipo);
    const i = ops.indexOf(estado.ropa[tipo]);
    estado.ropa[tipo] = ops[(Math.max(0, i) + (dir === 1 ? 1 : ops.length - 1)) % ops.length];
  }
  sonar('cursor');
  pintarVestidor();
}

// Casillas que tocan los pies de la gatita en la posicion (x, y).
function casillasPies(x, y) {
  return [[x + 4, y + 12], [x + 11, y + 12], [x + 4, y + 15], [x + 11, y + 15]]
    .map(([px, py]) => [Math.floor(px / T), Math.floor(py / T)]);
}

// La gatita no puede pisar el agua (salvo con el flotador), la cesta, los muebles ni los arboles, ni salir del mapa.
// En la barca, al reves: solo navega por el mar.
function puedeEstar(x, y) {
  for (const [c, f] of casillasPies(x, y)) {
    const t = tile(c, f);
    const clave = c + ',' + f;
    if (estado.navegando) { if (t !== 'W' || !enMar(c, f) || BLOQUEADAS.has(clave)) return false; continue; }
    if (t === 'W' && (!estado.herramientas.flotador || (estado.herramientas.barca && c === sitioBarca().c && f === sitioBarca().f))) return false;
    if (estado.castillos[clave] !== undefined) return false;
    if (!t || t === 'P' || t === ' ' || t === 'R' || esCasa(c, f) || esCama(c, f) || esArmario(c, f) || vecinoEn(c, f)) return false;
    if (esCesta(c, f) || muebleEn(c, f) || clave in fijos || BLOQUEADAS.has(clave)) return false;
  }
  return true;
}

// Mueble de una capa que ocupa la casilla (c, f), aunque su casilla de arriba a la izquierda sea otra.
function muebleEn(c, f, capa = estado.colocados) {
  for (const [clave, n] of Object.entries(capa)) {
    const [mc, mf] = clave.split(',').map(Number), { ancho, alto } = tamanoMueble(n);
    if (c >= mc && c < mc + ancho && f >= mf && f < mf + alto) return { clave, n, c: mc, f: mf };
  }
  return null;
}
const capaDe = n => esDeSuelo(n) ? estado.suelos : esDePared(n) ? estado.paredes : estado.colocados;
// Se cuelga en la fila de abajo de la pared, donde no haya ventana ni otra cosa colgada.
function puedeColgar(c, f, n) {
  const { ancho } = tamanoMueble(n);
  for (let i = 0; i < ancho; i++) {
    if (tile(c + i, f) !== 'P' || f !== INTERIOR.f0 + INTERIOR.pared - 1 || INTERIOR.ventanas.includes(c + i)) return false;
    if (muebleEn(c + i, f, estado.paredes)) return false;
  }
  return true;
}

// Se puede colocar el mueble n con su esquina en (c, f) si todas sus casillas son cesped libre o suelo de la casa.
// Las alfombras se pueden poner bajo muebles y bajo la gatita; el resto, no.
function puedeColocar(c, f, n) {
  if (esDePared(n)) return puedeColgar(c, f, n);
  const { ancho, alto } = tamanoMueble(n), deSuelo = esDeSuelo(n);
  const pies = casillasPies(estado.gata.x, estado.gata.y);
  for (let i = 0; i < ancho; i++) for (let j = 0; j < alto; j++) {
    const cc = c + i, ff = f + j;
    const suelo = tile(cc, ff) === 'S' && !esCama(cc, ff) && !esArmario(cc, ff) && !esSalida(cc, ff) && !esSalida(cc, ff + 1);
    if (MUEBLES[n].fuera && (suelo || estaDentro(ff))) return false;
    if (!(esCesped(cc, ff) || tile(cc, ff) === 'Y' || suelo) || esCasa(cc, ff) || vecinoEn(cc, ff) || esCesta(cc, ff) || (cc + ',' + ff) in fijos) return false;
    if (muebleEn(cc, ff, capaDe(n))) return false;
    if (!deSuelo && pies.some(([pc, pf]) => pc === cc && pf === ff)) return false;
  }
  return true;
}

const muebleDisponible = n => estado.muebles[MUEBLES[n].id] > 0 || !!buscar(MUEBLES[n].coste);

// ----- Modo decorar -----
// Categorias del cajon. Un mueble nuevo que no este en ninguna lista va a parar a 'muebles'.
const CATEGORIAS = [
  { id: 'muebles',   nombre: 'Muebles',   ids: ['banco', 'mesa', 'sillon', 'silla', 'comoda', 'mesilla', 'teterita', 'baulPirata'] },
  { id: 'textiles',  nombre: 'Textiles',  ids: ['cojin', 'puf', 'camaMascota', 'manta', 'cestoOvillos', 'osito'] },
  { id: 'pared',     nombre: 'Pared',     ids: ['cuadro', 'estante', 'guirnalda', 'relojPared', 'espejo', 'plantaColgante'], soloDentro: true },
  { id: 'plantas',   nombre: 'Plantas',   ids: ['maceta', 'jarron', 'lavandaMaceta', 'margaritas', 'cactus', 'helecho', 'macetaOlvidada'] },
  { id: 'luces',     nombre: 'Luces',     ids: ['farol', 'lampara', 'calabazaLuz', 'velas', 'lamparaSeta'] },
  { id: 'alfombras', nombre: 'Alfombras', ids: ['alfombra', 'alfombraRayas'] },
  { id: 'flores',    nombre: 'Flores',    ids: ['rosal', 'nomeolvides', 'lirios', 'tulipanesMaceta', 'lavandaJardinera', 'girasoles', 'celosia', 'hortensia', 'macizo', 'brote'], soloFuera: true },
  { id: 'jardin',    nombre: 'Jardín',    ids: ['arbusto', 'arbustoCorazon', 'bonsai', 'cerezoMaceta', 'monstera', 'setaJardin', 'caminoPiedras', 'regadera', 'valla', 'espantapajaros', 'molinillo'], soloFuera: true },
  { id: 'exterior',  nombre: 'Exterior',  ids: ['fuenteJardin', 'bancaJardin', 'mesaPicnic', 'sombrilla', 'pozo', 'farolJardin', 'bebedero', 'casitaPajaros', 'conejoPiedra'], soloFuera: true },
  { id: 'coleccion', nombre: 'Colección', ids: ['pecera', 'peceraGrande', 'vitrina'] },
  { id: 'reformas',  nombre: 'Reformas',  soloDentro: true },
];
for (const k of CATEGORIAS) k.lista = (k.ids || []).map(id => MUEBLES.findIndex(m => m.id === id)).filter(i => i >= 0);
MUEBLES.forEach((m, i) => { if (!CATEGORIAS.some(k => k.lista.includes(i))) CATEGORIAS[0].lista.push(i); });
const REFORMAS = CATEGORIAS.findIndex(k => k.id === 'reformas');
// Opciones de la pestana de reformas: primero los suelos y luego los papeles.
const OPCIONES_REFORMA = [...SUELOS.map(s => ({ parte: 'suelo', id: s.id })), ...PAPELES.map(p => ({ parte: 'pared', id: p.id }))];

const enReformas = d => d.cat === REFORMAS;
const parteReforma = d => OPCIONES_REFORMA[d.ref].parte;
const enMano = d => d.mano ? d.mano.n : d.sel;
const pestanasVisibles = d => CATEGORIAS.map((k, i) => i).filter(i => estaDentro(d.f) ? !CATEGORIAS[i].soloFuera : !CATEGORIAS[i].soloDentro);
const coloresConocidos = () => [-1, ...TINTES.map((t, i) => i).filter(i => tinteConocido(TINTES[i]))];

// Lo que se ve en las casillas del cajon: muebles de la categoria o suelos y papeles.
function opcionesCajon(d) {
  if (enReformas(d)) {
    return OPCIONES_REFORMA.map((o, j) => {
      const suelo = o.parte === 'suelo', i = (suelo ? SUELOS : PAPELES).findIndex(x => x.id === o.id);
      return {
        disponible: true, elegida: j === d.ref, puesto: estado.casa[o.parte] === o.id,
        dibujar: (x, y) => {
          if (suelo) cuadro(SUELOS[i].tinte ? tintada('casa_suelos_tiles', colorCasa('suelo'), 'multiply') : 'casa_suelos_tiles', i, x, y);
          else ctx.drawImage(tintada('casa_papeles_tiles', colorCasa('pared'), 'multiply'), i * T, 8, T, T, x, y, T, T);
        },
      };
    });
  }
  return CATEGORIAS[d.cat].lista.map(n => ({
    n, elegida: n === d.sel, disponible: muebleDisponible(n), cuantos: estado.muebles[MUEBLES[n].id],
    construible: !!buscar(MUEBLES[n].coste), dibujar: (x, y) => cuadro(tiraMueble(n), iconoMueble(n), x, y),
  }));
}

// Deshacer: antes de cada cambio se guarda una copia de lo que el modo decorar puede tocar.
function guardarPaso(d) {
  const { colocados, suelos, paredes, peceras, muebles, inv, casa } = estado;
  d.pasos.push(JSON.stringify({ colocados, suelos, paredes, peceras, muebles, inv, casa }));
  if (d.pasos.length > 30) d.pasos.shift();
}
function deshacer(d) {
  const paso = d.pasos.pop();
  if (!paso) { sonar('fallo'); return; }
  Object.assign(estado, JSON.parse(paso));
  d.mano = null;
  sonar('recoger');
}

function abrirDecorar() {
  // Se vuelve a la ultima pestana usada en el mismo sitio; al cambiar de casa a jardin, se empieza por la de ese sitio.
  const aqui = casillaActual(), dentro = estaDentro(aqui.f), u = estado.ultimoDecorar;
  const inicial = dentro ? 0 : CATEGORIAS.findIndex(k => k.id === 'jardin');
  const previo = u && (u.dentro === undefined || u.dentro === dentro) ? u : { cat: inicial, sel: CATEGORIAS[inicial].lista[0], ref: u ? u.ref : 0 };
  const d = estado.decorar = { ...aqui, cat: previo.cat, sel: previo.sel, ref: previo.ref, fallo: 0, mano: null, pasos: [] };
  if (!pestanasVisibles(d).includes(d.cat)) d.cat = inicial;
  if (!enReformas(d) && !CATEGORIAS[d.cat].lista.includes(d.sel)) d.sel = CATEGORIAS[d.cat].lista[0];
  ajustarFila(d);
  sonar('abrir');
}
function cerrarDecorar() {
  const d = estado.decorar;
  if (d.mano) devolverMano(d);
  estado.ultimoDecorar = { cat: d.cat, sel: d.sel, ref: d.ref, dentro: estaDentro(d.f) };
  estado.decorar = null;
  sonar('recoger');
}

// Teclas del modo decorar. Tab: pestana · Q/R o 1-9: elegir · Espacio: poner o coger para mover ·
// Supr: guardar en la bolsa · Ctrl+Z: deshacer · B/Esc: salir (o devolver lo que llevas).
function teclaDecorar(codigo, e = {}) {
  const d = estado.decorar;
  if (codigo === 'KeyZ' && (e.ctrlKey || e.metaKey)) { deshacer(d); return; }
  if (codigo === 'Escape' || codigo === 'KeyB') {
    if (d.mano) { devolverMano(d); sonar('recoger'); return; }
    cerrarDecorar();
    return;
  }
  if (codigo in FLECHAS && !enReformas(d)) {
    const [dc, df] = [[0, -1], [1, 0], [0, 1], [-1, 0]][FLECHAS[codigo]];
    moverCursor(d, d.c + dc, d.f + df);
    sonar('cursor');
    return;
  }
  if (codigo === 'Tab') { cambiarPestana(d, e.shiftKey ? -1 : 1); return; }
  const numero = NUMEROS.indexOf(codigo);
  if (numero >= 0) { elegirOpcion(d, numero); return; }
  if (codigo === 'KeyQ' || codigo === 'KeyR') { pasarOpcion(d, codigo === 'KeyR' ? 1 : -1); return; }
  if (enReformas(d)) {
    if (codigo === 'Space' || codigo === 'KeyE' || codigo === 'KeyC') pintar(d, null);
    return;
  }
  if (codigo === 'Delete' || codigo === 'Backspace') { guardarEnBolsa(d); return; }
  if (codigo === 'Space' || codigo === 'KeyE' || codigo === 'KeyX') usarCursor(d);
}

// El cursor no sale de donde esta la gatita: el mundo o la habitacion. Lo de pared va solo por su fila;
// lo demas, por el suelo.
const FILA_PARED = INTERIOR.f0 + INTERIOR.pared - 1;
function moverCursor(d, c, f) {
  const dentro = estaDentro(d.f), pared = dentro && esDePared(enMano(d));
  d.c = Math.max(0, Math.min((dentro ? INTERIOR.ancho : ANCHO) - 1, c));
  d.f = pared ? FILA_PARED : Math.max(dentro ? INTERIOR.f0 + INTERIOR.pared : 0, Math.min((dentro ? INTERIOR.f0 + INTERIOR.alto : ALTO) - 1, f));
}
// Al cambiar de mueble, el cursor sube a la pared o baja al suelo segun lo que se va a poner.
function ajustarFila(d) {
  if (!estaDentro(d.f) || enReformas(d)) return;
  if (esDePared(enMano(d))) d.f = FILA_PARED;
  else if (d.f === FILA_PARED) d.f = FILA_PARED + 1;
}
function cambiarPestana(d, paso) {
  if (d.mano) return;                                  // con algo en la mano no se cambia de pestana
  const vis = pestanasVisibles(d);
  ponerPestana(d, vis[(vis.indexOf(d.cat) + paso + vis.length) % vis.length]);
}
function ponerPestana(d, k) {
  if (d.mano || k === d.cat) return;
  d.cat = k;
  if (!enReformas(d)) d.sel = CATEGORIAS[d.cat].lista[0];
  ajustarFila(d);
  sonar('elegir');
}
function elegirOpcion(d, j) {
  if (d.mano) return;
  if (enReformas(d)) { if (j < OPCIONES_REFORMA.length) { d.ref = j; ponerReforma(d); } return; }
  const lista = CATEGORIAS[d.cat].lista;
  if (j < lista.length) { d.sel = lista[j]; ajustarFila(d); sonar('elegir'); }
}
function pasarOpcion(d, paso) {
  if (d.mano) return;
  if (enReformas(d)) { d.ref = (d.ref + paso + OPCIONES_REFORMA.length) % OPCIONES_REFORMA.length; ponerReforma(d); return; }
  const lista = CATEGORIAS[d.cat].lista;
  d.sel = lista[(lista.indexOf(d.sel) + paso + lista.length) % lista.length];
  ajustarFila(d);
  sonar('elegir');
}

// Espacio sobre el mapa: dejar lo que llevas, coger un mueble para moverlo o poner el elegido.
function usarCursor(d) {
  if (d.mano) { dejarMano(d); return; }
  const encima = recogible(d);
  if (encima) {
    guardarPaso(d);
    delete capaDe(encima.n)[encima.clave];
    d.mano = { n: encima.n, clave: encima.clave, pez: estado.peceras[encima.clave] || null };
    delete estado.peceras[encima.clave];
    sonar('elegir');
    return;
  }
  const m = MUEBLES[d.sel], clave = d.c + ',' + d.f;
  if (!puedeColocar(d.c, d.f, d.sel)) { d.fallo = 0.25; sonar('fallo'); return; }
  const material = buscar(m.coste);
  if (!(estado.muebles[m.id] > 0) && !material) { d.fallo = 0.25; sonar('fallo'); return; }
  guardarPaso(d);
  let construido = null;
  if (estado.muebles[m.id] > 0) estado.muebles[m.id]--;   // usar uno ya construido
  else { for (let i = 0; i < (m.coste.n || 1); i++) quitar(material); construido = material; }   // o construirlo ahora
  // Un expositor recien construido se estrena con lo que se uso para hacerlo; uno guardado sale vacio.
  if (m.expone) estado.peceras[clave] = construido;
  ponerEn(d.c, d.f, d.sel);
}
function ponerEn(c, f, n) {
  capaDe(n)[c + ',' + f] = n;
  sonar('colocar');
  const { ancho, alto } = tamanoMueble(n);
  chispas(c * T + ancho * 8, (f + alto) * T - 3, COLOR.crema, 6 * ancho, { fuerza: 18, gravedad: 20, vida: 0.35 });
}
function dejarMano(d) {
  const { n, pez } = d.mano;
  if (!puedeColocar(d.c, d.f, n)) { d.fallo = 0.25; sonar('fallo'); return; }
  if (MUEBLES[n].expone) estado.peceras[d.c + ',' + d.f] = pez;
  ponerEn(d.c, d.f, n);
  d.mano = null;
}
function devolverMano(d) {
  const { n, clave, pez } = d.mano;
  capaDe(n)[clave] = n;
  if (MUEBLES[n].expone) estado.peceras[clave] = pez;
  d.mano = null;
}
// Supr o clic derecho: lo que llevas o lo que hay bajo el cursor vuelve a los muebles guardados (y su pez a la bolsa).
function guardarEnBolsa(d) {
  let n, pez;
  if (d.mano) { ({ n, pez } = d.mano); d.mano = null; }
  else {
    const encima = muebleEn(d.c, d.f, estado.paredes) || muebleEn(d.c, d.f) || muebleEn(d.c, d.f, estado.suelos);
    if (!encima) { sonar('fallo'); return; }
    guardarPaso(d);
    n = encima.n; pez = estado.peceras[encima.clave];
    delete capaDe(n)[encima.clave];
    delete estado.peceras[encima.clave];
  }
  estado.muebles[MUEBLES[n].id]++;
  devolverContenido(pez);
  sonar('recoger');
}

// ----- Reformas: suelo y papel pintado -----
// Color de la casa para 'suelo' o 'pared': el tinte elegido aclarado, o el natural.
function colorCasa(parte) {
  const i = parte === 'suelo' ? estado.casa.colorSuelo : estado.casa.colorPared;
  if (i < 0 || !TINTES[i]) return NATURAL[parte];
  // La pared se mezcla con blanco (clara); el suelo con un beis tostado (tono medio, por debajo de los muebles).
  const [base, k] = parte === 'suelo' ? [MEZCLA_SUELO, 0.5] : ['#FFFFFF', 0.55];
  const n = parseInt(TINTES[i].color.slice(1), 16), b = parseInt(base.slice(1), 16);
  const mezcla = desp => Math.round(((n >> desp) & 255) * (1 - k) + ((b >> desp) & 255) * k);
  return 'rgb(' + mezcla(16) + ',' + mezcla(8) + ',' + mezcla(0) + ')';
}
// Un color se puede usar en casa cuando ya has encontrado aquello con lo que se hace el tinte (no se gasta).
const tinteConocido = t => t.coste.id ? !!estado.vistos[t.coste.id] : FAUNA.some(a => estado.vistos[a.id]);
const nombreColor = i => i < 0 ? 'natural' : TINTES[i].texto.match(/\((.*)\)/)[1];
// Elegir un suelo o papel lo pone al momento (con Ctrl+Z se vuelve atras).
function ponerReforma(d) {
  const o = OPCIONES_REFORMA[d.ref];
  if (estado.casa[o.parte] !== o.id) { guardarPaso(d); estado.casa[o.parte] = o.id; }
  avisarReforma(o.parte);
  sonar('elegir');
}
// Cambiar el color de la parte elegida: al siguiente conocido, o al que se toque con el raton.
function pintar(d, ci) {
  const parte = parteReforma(d), campo = parte === 'suelo' ? 'colorSuelo' : 'colorPared';
  const opciones = coloresConocidos();
  const nuevo = ci === null ? opciones[(opciones.indexOf(estado.casa[campo]) + 1) % opciones.length] : ci;
  guardarPaso(d);
  estado.casa[campo] = nuevo;
  // La madera y el parque no se tinen: al pintar el suelo pasa a uno que si.
  if (parte === 'suelo' && nuevo >= 0 && !SUELOS.find(s => s.id === estado.casa.suelo).tinte) {
    estado.casa.suelo = SUELOS.find(s => s.tinte).id;
    d.ref = OPCIONES_REFORMA.findIndex(o => o.id === estado.casa.suelo);
  }
  avisarReforma(parte);
  sonar('elegir');
}
function avisarReforma(parte) {
  const k = estado.casa;
  if (parte === 'suelo') {
    const s = SUELOS.find(x => x.id === k.suelo);
    avisar('Suelo: ' + s.nombre + (s.tinte ? ' · ' + nombreColor(k.colorSuelo) : ''), null, 'reforma');
  } else avisar('Pared: ' + PAPELES.find(p => p.id === k.pared).nombre + ' · ' + nombreColor(k.colorPared), null, 'reforma');
}

// Lo que se cogeria con el cursor en su casilla: el mueble de encima o, si no hay, la alfombra.
// Si el mueble elegido cabe ahi (p. ej. una mesa sobre una alfombra), se coloca en vez de coger la alfombra.
function recogible(d) {
  if (d.mano || enReformas(d)) return null;
  const colgado = muebleEn(d.c, d.f, estado.paredes);
  if (colgado) return colgado;
  const arriba = muebleEn(d.c, d.f);
  if (arriba) return arriba;
  const abajo = muebleEn(d.c, d.f, estado.suelos);
  if (!abajo || (!esDeSuelo(d.sel) && puedeColocar(d.c, d.f, d.sel) && muebleDisponible(d.sel))) return null;
  return abajo;
}

// Raton en el modo decorar: mover el cursor, clic para poner o coger, clic derecho para guardar,
// clic en el cajon para elegir pestana, mueble, suelo, papel o color.
function clicDecorar(x, y, boton) {
  const d = estado.decorar, g = geometriaCajon(d);
  const toca = r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
  if (toca({ x: g.x0, y: g.y0, w: g.w, h: g.h })) {
    const p = g.pestanas.find(toca);
    if (p) { ponerPestana(d, p.k); return; }
    const j = g.casillas.findIndex(toca);
    if (j >= 0) { elegirOpcion(d, j); return; }
    const s = g.colores.find(toca);
    if (s) pintar(d, s.ci);
    return;
  }
  if (enReformas(d)) return;
  ratonDecorar(x, y);
  if (boton === 2) guardarEnBolsa(d);
  else usarCursor(d);
}
function ratonDecorar(x, y) {
  const d = estado.decorar, g = geometriaCajon(d);
  if (enReformas(d) || (y >= g.y0 && y < g.y0 + g.h)) return;
  moverCursor(d, Math.floor((x + Math.round(cam.x)) / T), Math.floor((y + Math.round(cam.y)) / T));
}

function actualizar(dt) {
  estado.reloj += dt;
  const g = estado.gata;
  g.t += dt;
  if (estado.tutorial) actualizarTutorial(dt);
  const pe = estado.pesca, tj = estado.tejer;
  const horaAntes = estado.hora;
  estado.hora = (estado.hora + dt * (estado.sentada ? SENTARSE_RAPIDO : 1) / CICLO) % 1;
  if (estado.hora < horaAntes) nuevoDia();
  estado.lluvia += Math.max(-dt / 3, Math.min(dt / 3, (llueve() ? 1 : 0) - estado.lluvia));   // tres segundos de transicion
  if (llueve()) {
    // La lluvia riega todo lo plantado que aun crece.
    for (const p of Object.values(estado.parcelas)) if (p.cultivo && p.cultivo.etapa < 3) p.regada = true;
  }
  // De noche salen luciernagas por el cesped (solo fuera de casa).
  if (!estaDentro(casillaActual().f) && !bajoAgua(casillaActual().f) && oscuridad(estado.hora) > 0.5 && Math.random() < dt * 5) {
    chispas(cam.x + Math.random() * lienzo.width, cam.y + Math.random() * lienzo.height, COLOR.mantequilla, 1, { fuerza: 5, gravedad: -3, vida: 2.5 });
  }
  actualizarPalomas(dt);
  // En el pueblo caen petalos de los cerezos del parque.
  if (enPueblo(casillaActual().f) && CEREZOS.size && Math.random() < dt * 4) {
    const [c, f] = alAzar([...CEREZOS]).split(',').map(Number);
    if (enVista(c * T, f * T, cam.x, cam.y)) chispas(c * T + 8 + (Math.random() - 0.5) * 22, f * T - 14 + Math.random() * 8, Math.random() < 0.5 ? '#F7C6D0' : '#FFE3EA', 1, { fuerza: 6, gravedad: 5, vida: 3 });
  }
  const fu = estado.fundido;
  if (fu) {
    fu.t += dt;
    if (!fu.hecho && fu.t >= DURACION_FUNDIDO / 2) { fu.hecho = true; fu.accion(); }
    if (fu.t >= DURACION_FUNDIDO) estado.fundido = null;
  }
  estado.descanso = Math.max(0, estado.descanso - dt);
  if (estado.elegir) actualizarElegir(dt);
  const ocupada = estado.cavar || tj || fu || estado.elegir || estado.decorar || estado.pecera || estado.enciclopedia || estado.vestidor || estado.bolsa || estado.tienda || estado.dialogo || (pe && pe.fase === 'tirar');
  if (estado.decorar && estado.decorar.fallo) estado.decorar.fallo = Math.max(0, estado.decorar.fallo - dt);
  if (estado.consejo && (estado.consejo.t -= dt) <= 0) estado.consejo = null;
  // Si no se usa el HUD durante un rato, se aparta un poco para dejar ver el valle.
  viajar();
  moverVecinos();
  actualizarTalar(dt);
  if (estado.lugar) estado.lugar.t += dt;
  if (estado.saquito && !barraVisible()) estado.saquito = false;   // al entrar en casa, pescar o hablar se guarda solo
  estado.saquitoT += ((estado.saquito ? 1 : 0) - estado.saquitoT) * Math.min(1, dt * 12);
  estado.alfaHud += ((estado.reloj - estado.ultimoUso > 4 ? 0.45 : 1) - estado.alfaHud) * Math.min(1, dt * 3);

  if (UNA_VEZ.has(g.anim)) {
    if (g.t >= ANIM[g.anim].cuadros / ANIM[g.anim].fps) { if (g.anim === 'alegria') estado.premio = null; g.anim = 'reposo'; g.t = 0; }
  } else {
    let dx = 0, dy = 0;
    if (!ocupada) {
      if (teclas.has('ArrowLeft') || teclas.has('KeyA')) dx--;
      if (teclas.has('ArrowRight') || teclas.has('KeyD')) dx++;
      if (teclas.has('ArrowUp') || teclas.has('KeyW')) dy--;
      if (teclas.has('ArrowDown') || teclas.has('KeyS')) dy++;
    }
    if ((dx || dy) && estado.pesca) estado.pesca = null;   // moverse recoge la cana
    if ((dx || dy) && estado.sentada) levantarse();         // y tambien levanta del banco
    const antes = g.mira + g.espejo;
    if (dx) { g.mira = 'lado'; g.espejo = dx < 0; }
    else if (dy) g.mira = dy < 0 ? 'espalda' : 'frente';
    if (g.mira + g.espejo !== antes) g.t = 0;
    if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
    // Con Mayus pulsada la gatita corre: se pone los patines (en tierra) y va mas rapido levantando polvito.
    const corre = (dx || dy) && (teclas.has('ShiftLeft') || teclas.has('ShiftRight'));
    const agua = nadando(), patina = corre && !agua && !estado.navegando && !bajoAgua(casillaActual().f);
    const rapidez = VELOCIDAD * (corre ? CORRER : 1) * (agua ? 0.6 : estado.navegando ? 1.15 : 1);
    if ((agua || estado.navegando) && (dx || dy) && Math.random() < dt * 6) chispas(g.x + 8, g.y + 14, COLOR.crema, 1, { fuerza: 6, gravedad: 10, vida: 0.5 });
    if (corre) {
      if (!patina) g.t += dt * 0.7;
      if (Math.random() < dt * 9) chispas(g.x + 8, g.y + 15, COLOR.crema, 1, { fuerza: 8, gravedad: -6, vida: 0.35 });
    }
    const nx = g.x + dx * rapidez * dt, ny = g.y + dy * rapidez * dt;
    if (dx && puedeEstar(nx, g.y)) g.x = nx;
    if (dy && puedeEstar(g.x, ny)) g.y = ny;
    const nueva = patina ? 'patinar' : dx || dy ? 'caminar' : 'reposo';
    if ((nueva === 'patinar') !== (g.anim === 'patinar')) ponerPatines(g, nueva === 'patinar');
    if (nueva !== g.anim) { g.anim = nueva; g.t = 0; }
  }

  if (estado.premio) estado.premio.t += dt;
  if (tj && tj.fallo) tj.fallo = Math.max(0, tj.fallo - dt);
  actualizarTejer(dt);
  if (tj && tj.fase === 'tejiendo' && tj.sentar >= DURACION_SENTARSE && correReloj(tj, dt)) seAcaboTejer();
  if (estado.pesca) {
    const p = estado.pesca;
    p.t += dt;
    if (p.fase === 'lanza' && p.t >= LANZAR) {
      p.fase = 'espera'; p.t = 0;
      chispas(p.bx, p.by, '#FFFBF3', 6, { fuerza: 18, arriba: 14, vida: 0.45 });
    } else if (p.fase === 'espera' && p.t >= p.limite) { p.fase = 'pica'; p.t = 0; sonar('pica'); }
    else if (p.fase === 'pica' && Math.random() < dt * 8) chispas(p.bx + Math.random() * 6 - 3, p.by, '#E9F7FB', 1, { fuerza: 4, gravedad: -30, vida: 0.5 });
    else if (p.fase === 'pica' && p.t >= TIEMPO_PARA_ATRAPAR) { p.fase = 'escapo'; p.t = 0; sonar('escapo'); }
    else if (p.fase === 'escapo' && p.t >= 1.5) estado.pesca = null;
    else if (p.fase === 'tirar') {
      // La marca va y viene por la barra, un poco mas rapido con cada acierto.
      p.pos += p.dir * (65 + 18 * p.aciertos) * dt;
      if (p.pos <= 0) { p.pos = 0; p.dir = 1; }
      if (p.pos >= BARRA.ancho - 2) { p.pos = BARRA.ancho - 2; p.dir = -1; }
      p.destello = Math.max(0, p.destello - dt);
      p.fallo = Math.max(0, p.fallo - dt);
      if (Math.random() < dt * 10) chispas(p.bx + Math.random() * 8 - 4, p.by, Math.random() < 0.5 ? '#FFFBF3' : '#A9D8E8', 2, { fuerza: 16, arriba: 18, vida: 0.4 });
      if (correReloj(p, dt)) seAcaboPesca();
    }
  }

  actualizarMar(dt);
  actualizarCavar(dt);
  actualizarRadar(dt);
  actualizarSombrasPeces(dt);
  for (const [clave, p] of Object.entries(estado.parcelas)) {
    const cu = p.cultivo;
    if (!cu) continue;
    const [c, f] = clave.split(',').map(Number);
    if (cu.etapa >= 3) {
      // Los cultivos listos brillan de vez en cuando para avisar de que se pueden cosechar.
      if (Math.random() < dt * 1.2) chispas(c * T + 3 + Math.random() * 10, f * T + Math.random() * 8, COLOR.mantequilla, 1, { fuerza: 3, gravedad: -14, vida: 0.9 });
      continue;
    }
    if (!p.regada && enBancal(c, f)) p.regada = true;      // los bancales beben del rio
    if (!p.regada) continue;
    cu.t += dt;
    if (cu.t >= ficha(cu.tipo).seg) {
      cu.t = 0; cu.etapa++; p.regada = false;
      sonar('crecer');
      chispas(c * T + 8, f * T + 6, COLOR.salvia, 6, { fuerza: 16, gravedad: -10, vida: 0.5 });
    }
  }

  for (let i = particulas.length - 1; i >= 0; i--) {
    const q = particulas[i];
    q.t += dt;
    if (q.t >= q.vida) { particulas.splice(i, 1); continue; }
    q.vy += q.gravedad * dt;
    q.x += q.vx * dt;
    q.y += q.vy * dt;
  }
}

// ---------- Dibujo ----------

function cuadro(nombre, n, x, y, espejo = false) {
  const origen = typeof nombre === 'string' ? img[nombre] : nombre;   // nombre de imagen o lienzo ya preparado
  x = Math.round(x); y = Math.round(y);
  if (!espejo) { ctx.drawImage(origen, n * T, 0, T, T, x, y, T, T); return; }
  ctx.save();
  ctx.translate(x + T, y);
  ctx.scale(-1, 1);
  ctx.drawImage(origen, n * T, 0, T, T, 0, 0, T, T);
  ctx.restore();
}

// Copia de una tira con un color aplicado. modo 'source-in' pinta toda la silueta (bufanda, sombras);
// 'source-atop' con un color translucido la bana de ese tono (brillantes). Se guarda para reutilizarla.
const tintadas = {};
function tintada(nombre, color, modo = 'source-in') {
  const clave = nombre + color + modo;
  if (!tintadas[clave]) {
    const c = document.createElement('canvas');
    c.width = img[nombre].width; c.height = img[nombre].height;
    const x = c.getContext('2d');
    x.drawImage(img[nombre], 0, 0);
    x.globalCompositeOperation = modo;
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    tintadas[clave] = c;
  }
  return tintadas[clave];
}
const DORADO = 'rgba(255, 214, 92, 0.62)';
// Contorno selectivo (sel-out) para los iconos de la interfaz: el contorno ciruela que da al vacio toma el color de lo
// que tiene al lado mezclado con ciruela (mas claro en el lado de la luz, arriba a la izquierda), asi el icono no
// parece un recorte pegado. Las lineas de dentro (ojos, detalles) se quedan ciruela. Los pixeles de otro cuadro de la
// tira (de lado x lado) cuentan como vacio. Se guarda una copia por tira.
const suavizadas = new WeakMap();
function contornoSuave(tira, lado = T) {
  if (!tira || !tira.width) return tira;
  if (suavizadas.has(tira)) return suavizadas.get(tira);
  const c = document.createElement('canvas');
  c.width = tira.width; c.height = tira.height;
  const x = c.getContext('2d');
  x.drawImage(tira, 0, 0);
  const datos = x.getImageData(0, 0, c.width, c.height), d = datos.data, w = c.width, h = c.height, o = new Uint8ClampedArray(d);
  const dentro = (px, py, ox, oy) => px >= 0 && py >= 0 && px < w && py < h && Math.floor(px / lado) === Math.floor(ox / lado) && Math.floor(py / lado) === Math.floor(oy / lado);
  const opaco = (px, py) => o[(py * w + px) * 4 + 3] > 128;
  const ciruela = i => o[i] === 0x4A && o[i + 1] === 0x33 && o[i + 2] === 0x47;
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
    const i = (py * w + px) * 4;
    if (o[i + 3] < 128 || !ciruela(i)) continue;
    const vacios = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => !dentro(px + dx, py + dy, px, py) || !opaco(px + dx, py + dy));
    if (!vacios.length) continue;
    let r = 0, g = 0, b = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dentro(px + dx, py + dy, px, py) || !opaco(px + dx, py + dy)) continue;
      const j = ((py + dy) * w + px + dx) * 4;
      if (ciruela(j)) continue;
      r += o[j]; g += o[j + 1]; b += o[j + 2]; n++;
    }
    if (!n) continue;
    const k = vacios.every(([dx, dy]) => dx < 0 || dy < 0) ? 0.42 : 0.6;     // cuanto ciruela lleva
    d[i] = Math.round(r / n * (1 - k) + 0x4A * k); d[i + 1] = Math.round(g / n * (1 - k) + 0x33 * k); d[i + 2] = Math.round(b / n * (1 - k) + 0x47 * k);
  }
  x.putImageData(datos, 0, 0);
  suavizadas.set(tira, c);
  return c;
}
// Version luminiscente de una tira, como una criatura bajo luz negra: cuerpo morado muy oscuro y motitas de
// neon (cian, lima, rosa, amarillo y blanco) repartidas siempre igual. Se guarda junto a las tintadas.
const NEON = ['#7DF9FF', '#B6FF8A', '#FF8AF0', '#FFF6A8', '#FFFFFF', '#7DF9FF'];
function luminosa(nombre) {
  const clave = nombre + '~luminosa';
  if (tintadas[clave]) return tintadas[clave];
  const o = img[nombre], c = document.createElement('canvas');
  c.width = o.width; c.height = o.height;
  const x = c.getContext('2d');
  x.drawImage(o, 0, 0);
  const datos = x.getImageData(0, 0, c.width, c.height), p = datos.data;
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  for (let i = 0; i < p.length; i += 4) {
    if (!p[i + 3]) continue;
    const px = (i / 4) % c.width, py = Math.floor(i / 4 / c.width), luz = (p[i] + p[i + 1] + p[i + 2]) / 765;
    const color = luz < 0.32 ? '#140E2E'                                          // contorno
      : azar(px, py, 77) < 0.22 ? NEON[Math.floor(azar(px, py, 78) * NEON.length)] // motita de neon
      : luz > 0.78 ? '#4B3A9A' : '#2E2266';                                        // cuerpo
    [p[i], p[i + 1], p[i + 2]] = rgb(color);
  }
  x.putImageData(datos, 0, 0);
  return (tintadas[clave] = c);
}
// Halo que late alrededor de una criatura luminiscente (en la pecera o al pescarla).
function halo(x, y) {
  const k = 0.75 + Math.sin(estado.reloj * 2.5 + x) * 0.25;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = '#5FD8E8';
  for (const [r, a] of [[11, 0.08], [8, 0.1], [5, 0.12]]) { ctx.globalAlpha = a * k; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

// Tira e indice del dibujo de un objeto (dorado si es brillante), o null si no tiene dibujo.
function dibujoDe(id) {
  const fi = ficha(id);
  if (!fi.img) return null;
  return { tira: esBrillante(id) ? tintada(fi.img, DORADO, 'source-atop') : esLuminoso(id) ? luminosa(fi.img) : img[fi.img], n: fi.n };
}

// Dibujos pequenos hechos con '#': flechas, numeros y estrellitas de los paneles.
function mapaBits(filas, x, y, color, giro = 0) {
  const n = filas.length - 1;
  ctx.fillStyle = color;
  filas.forEach((fila, j) => [...fila].forEach((ch, i) => {
    if (ch !== '#') return;
    const [px, py] = [[i, j], [n - j, i], [i, n - j], [j, i]][giro];   // arriba, derecha, abajo, izquierda
    ctx.fillRect(x + px, y + py, 1, 1);
  }));
}
const BITS = {
  flecha: ['...#...', '..###..', '.#####.', '#######', '..###..', '..###..', '..###..'],
  estrella: ['..#..', '.###.', '#####', '.###.', '.#.#.'],
  0: ['###', '#.#', '#.#', '#.#', '###'],
  1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['##.', '..#', '.#.', '#..', '###'],
  3: ['##.', '..#', '.#.', '..#', '##.'],
  4: ['#.#', '#.#', '###', '..#', '..#'],
  5: ['###', '#..', '##.', '..#', '##.'],
  6: ['.##', '#..', '###', '#.#', '###'],
  7: ['###', '..#', '.#.', '.#.', '.#.'],
  8: ['###', '#.#', '###', '#.#', '###'],
  9: ['###', '#.#', '###', '..#', '##.'],
};

// Parche de fieltro (mismo material que los paneles HTML): contorno ciruela con esquinas redondeadas,
// brillo arriba, sombra abajo, un pixel de "suelo" y, si es grande, una puntada discontinua.
const FIELTRO = { brillo: '#FFFBF3', sombra: '#F2DFD0', puntada: '#E3BFC6' };
function panel(x, y, ancho, alto) {
  ctx.fillStyle = COLOR.ciruela;
  ctx.fillRect(x + 1, y, ancho - 2, alto);
  ctx.fillRect(x, y + 1, ancho, alto - 2);
  ctx.fillRect(x + 2, y + alto, ancho - 4, 1);
  ctx.fillStyle = COLOR.crema;
  ctx.fillRect(x + 1, y + 1, ancho - 2, alto - 2);
  ctx.fillStyle = FIELTRO.brillo; ctx.fillRect(x + 2, y + 1, ancho - 4, 1);
  ctx.fillStyle = FIELTRO.sombra; ctx.fillRect(x + 2, y + alto - 2, ancho - 4, 1);
  if (ancho >= 24 && alto >= 18) {
    ctx.fillStyle = FIELTRO.puntada;
    for (let i = 4; i < ancho - 4; i += 4) { ctx.fillRect(x + i, y + 3, 2, 1); ctx.fillRect(x + i, y + alto - 4, 2, 1); }
    for (let j = 5; j < alto - 5; j += 4) { ctx.fillRect(x + 3, y + j, 1, 2); ctx.fillRect(x + ancho - 4, y + j, 1, 2); }
  }
}

// Orillas de cesped encima de un tile de agua, tierra o camino, segun sus vecinos.
function bordes(nombre, c, f) {
  const N = esCesped(c, f - 1), E = esCesped(c + 1, f), S = esCesped(c, f + 1), O = esCesped(c - 1, f);
  const m = (N ? 1 : 0) | (E ? 2 : 0) | (S ? 4 : 0) | (O ? 8 : 0);
  // La mitad de las casillas usa la orilla irregular (cuadros 19 a 33), para que no se vea la cuadricula.
  if (m) cuadro(nombre, azar(c, f, 6) < 0.5 ? 18 + m : m - 1, c * T, f * T);
  if (!N && !E && esCesped(c + 1, f - 1)) cuadro(nombre, 15, c * T, f * T);
  if (!S && !E && esCesped(c + 1, f + 1)) cuadro(nombre, 16, c * T, f * T);
  if (!S && !O && esCesped(c - 1, f + 1)) cuadro(nombre, 17, c * T, f * T);
  if (!N && !O && esCesped(c - 1, f - 1)) cuadro(nombre, 18, c * T, f * T);
}

const CESPEDES = [0, 7, 8];          // variantes del cesped en terreno_tiles (la flor ahora son detalles sueltos)
const enVista = (x, y, cx, cy, margen = 32) => x > cx - margen && x < cx + lienzo.width + margen && y > cy - margen && y < cy + lienzo.height + margen;

// Como cuadro(), pero para tiras de cuadros mas grandes (los arboles miden 32x32).
function cuadroGrande(nombre, n, x, y, lado) {
  ctx.drawImage(img[nombre], n * lado, 0, lado, lado, Math.round(x), Math.round(y), lado, lado);
}

// Un mueble con su casilla de arriba a la izquierda en (x, y): los grandes salen de muebles_grandes_tiles
// (32x32) con el pie del dibujo en el pie de lo que ocupan.
function dibujarMueble(n, x, y) {
  const m = MUEBLES[n], grande = m.grande !== undefined, lado = grande ? 32 : T;
  const { ancho, alto } = tamanoMueble(n);
  const dx = grande ? x + ancho * 8 - 16 : x, dy = grande ? y + alto * T - 32 : y;   // los grandes, centrados y con el pie abajo
  const tira = img[grande ? tiraGrande(n) : tiraMueble(n)], k = cuadroSegunTiempo(m, grande ? m.grande : iconoMueble(n));
  if (m.mece) {
    // Lo de arriba se mece con el viento (mas deprisa con lluvia); la maceta o el pie se quedan quietos.
    const v = viento(dx, dy, llueve() ? 2.8 : 1.6);
    ctx.drawImage(tira, k * lado, 0, lado, m.mece, Math.round(dx + v), Math.round(dy), lado, m.mece);
    ctx.drawImage(tira, k * lado, m.mece, lado, lado - m.mece, Math.round(dx), Math.round(dy + m.mece), lado, lado - m.mece);
  } else ctx.drawImage(tira, k * lado, 0, lado, lado, Math.round(dx), Math.round(dy), lado, lado);
  if (m.chorro) dibujarChorro(dx, dy);
  if (m.pajaros) dibujarPajarito(x, y, m.id === 'bebedero' ? 4 : 1);
  if (m.fuera && !estado.decorar) {
    if (llueve()) dibujarGotas(dx, dy, lado, m);
    else if (m.flores) dibujarMariposa(x + ancho * 8, grande ? dy + 8 : y + 2);
    if (m.petalos && !llueve()) dibujarPetalo(x, y);
  }
}
// Algunas cosas cambian con el tiempo: los tulipanes se cierran de noche, los girasoles agachan la cabeza
// y la sombrilla se pliega si llueve.
function cuadroSegunTiempo(m, normal) {
  if (m.lluvia !== undefined && llueve()) return m.lluvia;
  if (m.noche !== undefined && oscuridad(estado.hora) > 0.5) return m.noche;
  return normal;
}
// Con lluvia, gotitas que resbalan de las hojas y caen al suelo (y ondas en el agua de fuentes y bebederos).
function dibujarGotas(dx, dy, lado, m) {
  ctx.fillStyle = '#D5EEF6';
  for (let i = 0; i < 2; i++) {
    const fase = (estado.reloj * 0.9 + azar(dx, dy, 80 + i)) % 1;
    const gx = dx + Math.floor(lado * 0.25 + azar(dx, dy, 82 + i) * lado * 0.5), gy = dy + lado * 0.3 + fase * lado * 0.6;
    ctx.globalAlpha = 0.85 * (1 - fase * 0.5);
    ctx.fillRect(gx, Math.round(gy), 1, 2);
  }
  if (m.id === 'bebedero' || m.chorro) {
    const r = Math.floor((estado.reloj * 3) % 4), cx = dx + lado / 2, cy = dy + (m.chorro ? 22 : 5);
    ctx.globalAlpha = 0.7 - r * 0.15; ctx.fillStyle = '#FFF4E0';
    ctx.fillRect(cx - 1 - r, cy, 2 + r * 2, 1);
  }
  ctx.globalAlpha = 1;
}
// De dia, una mariposa revolotea a ratos sobre las flores (cada mata a su aire y de su color).
const COLORES_MARIPOSA = ['#F7A6B4', '#FFE08A', '#C5B4E3', '#A9D8E8', '#FFFFFF'];
function dibujarMariposa(cx, cy) {
  if (oscuridad(estado.hora) > 0.4) return;
  const t = estado.reloj + azar(cx, cy, 90) * 40, ciclo = t % 24;
  if (ciclo > 9) return;
  const x = Math.round(cx + Math.sin(t * 0.8) * 7 + Math.sin(t * 2.1) * 2), y = Math.round(cy - 4 + Math.sin(t * 1.3) * 3 - Math.min(ciclo, 9 - ciclo, 1) * 0);
  const abierta = Math.floor(t * 9) % 2 === 0, color = COLORES_MARIPOSA[Math.floor(azar(cx, cy, 91) * COLORES_MARIPOSA.length)];
  ctx.fillStyle = color;
  if (abierta) { ctx.fillRect(x - 2, y - 1, 2, 2); ctx.fillRect(x + 1, y - 1, 2, 2); ctx.fillRect(x - 1, y + 1, 1, 1); ctx.fillRect(x + 1, y + 1, 1, 1); }
  else { ctx.fillRect(x - 1, y - 1, 1, 2); ctx.fillRect(x + 1, y - 1, 1, 2); }
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x, y - 1, 1, 3);
}
// El cerezo en maceta suelta de vez en cuando un petalo que cae meciendose.
function dibujarPetalo(x, y) {
  const fase = (estado.reloj * 0.25 + azar(x, y, 92)) % 1;
  if (fase > 0.7) return;
  const px = x + 4 + Math.round(azar(x, y, 93) * 8 + Math.sin(fase * 14) * 2), py = y + 4 + Math.round(fase * 16);
  ctx.globalAlpha = 1 - fase; ctx.fillStyle = '#FFC9D3'; ctx.fillRect(px, py, 2, 1);
  ctx.globalAlpha = 1;
}
// Fuente de piedra: gotas que caen del chorrito al platillo y del platillo a la pila, con ondas en el agua.
function dibujarChorro(fx, fy) {
  const t = estado.reloj;
  ctx.fillStyle = '#D5EEF6';
  for (let i = 0; i < 6; i++) {
    const lado = i % 2 ? 1 : -1, fase = (t * 1.4 + i * 0.37) % 1;
    if (i < 2) ctx.fillRect(fx + 16 + lado * (2 + Math.round(fase * 3)) - (lado < 0 ? 1 : 0), fy + 4 + Math.round(fase * fase * 6), 1, 1);
    else ctx.fillRect(fx + 16 + lado * (7 + (i > 3 ? 1 : 0)) - (lado < 0 ? 1 : 0), fy + 11 + Math.round(fase * fase * 9), 1, 2);
  }
  ctx.fillStyle = '#FFF4E0';
  for (let i = 0; i < 3; i++) {
    const o = (t * 0.8 + i / 3) % 1;
    ctx.globalAlpha = 1 - o;
    ctx.fillRect(fx + 8 + i * 7 + Math.round(o * 3), fy + 21 + (i % 2), 2 + Math.round(o * 2), 1);
  }
  ctx.globalAlpha = 1;
}
// De dia, un pajarito viene a ratos a la casita o al bebedero, da saltitos y se va.
function dibujarPajarito(x, y, alto) {
  if (oscuridad(estado.hora) > 0.4 || llueve()) return;
  const ciclo = (estado.reloj + (x * 7 + y * 3) % 17) % 17;
  if (ciclo > 7) return;
  const salto = Math.abs(Math.sin(ciclo * 5)) < 0.3 ? 1 : 0, mira = Math.sin(ciclo * 1.3) > 0 ? 1 : -1;
  const px = x + 7 + Math.round(Math.sin(ciclo * 0.9) * 2), py = y + alto - salto;
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(px - 1, py - 1, 5, 4);
  ctx.fillStyle = '#A9D8E8'; ctx.fillRect(px, py, 3, 2);
  ctx.fillStyle = '#F7A6B4'; ctx.fillRect(px + (mira > 0 ? 1 : 0), py + 1, 2, 1);
  ctx.fillStyle = '#E8A85C'; ctx.fillRect(mira > 0 ? px + 3 : px - 2, py, 1, 1);
}
// Capa de suelo (alfombras): se dibuja justo encima del suelo, debajo de sombras y muebles.
function dibujarAlfombras(cx, cy) {
  for (const [clave, n] of Object.entries(estado.suelos)) {
    const [c, f] = clave.split(',').map(Number);
    if (enVista(c * T, f * T, cx, cy)) dibujarMueble(n, c * T, f * T);
  }
}

// Muebles altos del interior (16x40): el pie del dibujo coincide con el pie de la casilla (c, f)
// y lo que sobra sube por la pared.
const ALTOS = { cama: 0, armario: 1, cesta: 2 }, ALTO_MUEBLE = 40;
function cuadroAlto(n, c, f) {
  ctx.drawImage(img.casa_altos_tiles, n * T, 0, T, ALTO_MUEBLE, c * T, (f + 1) * T - ALTO_MUEBLE, T, ALTO_MUEBLE);
}

// Viento: un vaiven de 1 pixel que recorre el valle como una ola (cada sitio va un poco desfasado).
const viento = (x, y, rapidez = 1.6) => Math.round(Math.sin(estado.reloj * rapidez + x * 0.045 + y * 0.02) * 0.8);

// Arbol de 2x2 casillas: el tronco en su casilla y la copa por encima, meciendose.
function dibujarArbol(c, f) {
  const a = arbolEn(c, f), x = c * T - 8 + sacudidaArbol(c, f), y = f * T - 16;
  cuadroGrande('arboles_tiles', a.tronco, x, y, 32);
  cuadroGrande('arboles_tiles', a.copa, x + viento(x, y), y, 32);
}

// Cada agua con su caracter: el rio corre (rayitas que bajan), el lago es hondo en el centro
// y el estanque escondido tiene un tono verde turquesa.
function dibujarAgua(c, f) {
  const k = c + ',' + f, x = c * T, y = f * T;
  if (PROFUNDO.has(k) && zonaAgua[k] !== 'mar') hondoSuave(c, f, '#6FA9D8', 0.3);
  if (zonaAgua[k] === 'escondido') { ctx.globalAlpha = 0.32; ctx.fillStyle = '#7FD1B9'; ctx.fillRect(x, y, T, T); }
  if (zonaAgua[k] === 'mar') dibujarMar(c, f);
  if (RIO.has(k)) {
    ctx.globalAlpha = 0.75; ctx.fillStyle = '#E4F4FA';
    for (let i = 0; i < 2; i++) {
      const oy = Math.floor((estado.reloj * 14 + azar(c, f, 40 + i) * 16) % 16), ox = 2 + Math.floor(azar(c, f, 42 + i) * 11);
      ctx.fillRect(x + ox, y + oy, 1, Math.min(3, 16 - oy));
    }
  }
  ctx.globalAlpha = 1;
}
// Agua honda sin bordes cuadrados: el tinte se desvanece en franjas de 2 px hacia las casillas que no son hondas
// (por los lados y en las esquinas), asi la mancha oscura del lago queda redondeada.
function hondoSuave(c, f, color, alfa) {
  const x = c * T, y = f * T, hondo = (dc, df) => PROFUNDO.has((c + dc) + ',' + (f + df));
  const n = !hondo(0, -1), s = !hondo(0, 1), o = !hondo(-1, 0), e = !hondo(1, 0);
  const no = !n && !o && !hondo(-1, -1), ne = !n && !e && !hondo(1, -1), so = !s && !o && !hondo(-1, 1), se = !s && !e && !hondo(1, 1);
  ctx.fillStyle = color;
  for (let j = 0; j < T; j += 2) for (let i = 0; i < T; i += 2) {
    let d = 8;                                         // distancia (en px) al borde mas cercano que se desvanece
    if (n) d = Math.min(d, j); if (s) d = Math.min(d, T - 2 - j);
    if (o) d = Math.min(d, i); if (e) d = Math.min(d, T - 2 - i);
    if (no) d = Math.min(d, Math.hypot(i, j) - 2); if (ne) d = Math.min(d, Math.hypot(T - 2 - i, j) - 2);
    if (so) d = Math.min(d, Math.hypot(i, T - 2 - j) - 2); if (se) d = Math.min(d, Math.hypot(T - 2 - i, T - 2 - j) - 2);
    ctx.globalAlpha = alfa * Math.max(0, Math.min(1, (d + 1) / 8));
    ctx.fillRect(x + i, y + j, 2, 2);
  }
  ctx.globalAlpha = 1;
}
// El mar: azul mas intenso cuanto mas lejos de la orilla (en franjas de 2 px, sin escalones entre casillas)
// y olitas que van y vienen. Tambien lo usa dibujarCosta para el agua que sube sobre la arena.
function dibujarMar(c, f) {
  const x = c * T, y = f * T, orilla = curvaCosta(x + 8);
  ctx.fillStyle = '#4F86C6';
  for (let j = 0; j < T; j += 2) {
    const hondo = Math.max(0, Math.min(1, (y + j - orilla) / (T * 5)));
    ctx.globalAlpha = 0.16 + 0.16 * hondo * hondo * (3 - 2 * hondo);
    ctx.fillRect(x, y + j, T, 2);
  }
  ctx.globalAlpha = 0.7; ctx.fillStyle = '#E4F4FA';
  const ola = Math.sin(estado.reloj * 1.5 + c * 0.9 + f * 1.7);
  if (ola > 0.6) ctx.fillRect(x + 3 + Math.floor(azar(c, f, 44) * 6), y + 4 + Math.floor(azar(c, f, 45) * 8), 3, 1);
  ctx.globalAlpha = 1;
}
// Orilla del mar sin escalones: en cada columna de la playa se repinta la casilla de arena de la orilla y la primera
// de agua, y el agua sube o baja hasta curvaCosta pixel a pixel, con arena mojada y espuma que va y viene.
// (Se pisa igual que antes, por casillas: esto es solo el dibujo.)
function dibujarCosta(cx, cy, aguaN) {
  const c0 = Math.floor(cx / T);
  for (let c = c0; c <= c0 + lienzo.width / T; c++) {
    const costa = costaEn(c), x = c * T, y0 = (costa - 1) * T, y1 = (costa + 1) * T;
    const muelle = tile(c, costa) === 'M';         // en el embarcadero se repinta la orilla y luego su tabla
    if ((tile(c, costa) !== 'W' && !muelle) || tile(c, costa - 1) !== 'Y' || (!muelle && zonaAgua[c + ',' + costa] !== 'mar')) continue;
    if (y1 < cy || y0 > cy + lienzo.height) continue;
    const curva = [];
    for (let i = 0; i < T; i++) curva.push(Math.max(y0 + 1, Math.min(y1 - 1, curvaCosta(x + i))));
    // Arena en las dos casillas (la de abajo con otro dibujo de granitos)...
    for (const f of [costa - 1, costa]) {
      cuadro('terreno_tiles', 6, x, f * T);
      ctx.save(); ctx.translate(0, (f - (costa - 1)) * -4 * T); dibujarArena(c, f + (f - (costa - 1)) * 4); ctx.restore();
    }
    // ...arena mojada justo encima del agua...
    ctx.globalAlpha = 0.3; ctx.fillStyle = '#D9B47E';
    for (let i = 0; i < T; i++) ctx.fillRect(x + i, curva[i] - 4, 1, 4);
    ctx.globalAlpha = 1;
    // ...y el agua por debajo de la curva.
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x, y1);
    for (let i = 0; i < T; i++) { ctx.lineTo(x + i, curva[i]); ctx.lineTo(x + i + 1, curva[i]); }
    ctx.lineTo(x + T, y1); ctx.closePath(); ctx.clip();
    for (const f of [costa - 1, costa]) { cuadro('terreno_tiles', 4 + aguaN, x, f * T); dibujarMar(c, f); }
    ctx.restore();
    // Espuma: una linea que sube y baja con la marea, siguiendo la orilla.
    ctx.fillStyle = COLOR.crema;
    for (let i = 0; i < T; i++) {
      const marea = Math.round(1.5 + Math.sin(estado.reloj * 1.2 + (x + i) * 0.03) * 1.5);
      ctx.globalAlpha = 0.85; ctx.fillRect(x + i, curva[i] + marea, 1, 2);
      if ((x + i) % 11 < 5) { ctx.globalAlpha = 0.5; ctx.fillRect(x + i, curva[i] + marea + 3, 1, 1); }
    }
    ctx.globalAlpha = 1;
  }
}
// Flotador rosa con rayas crema a la altura de la cintura, y ondas en el agua a los lados.
// (x, y) = esquina del dibujo de la gatita.
function dibujarFlotador(x, y) {
  const r = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(x + rx, y + ry, w, h); };
  ctx.globalAlpha = 0.6;
  const onda = Math.floor(estado.reloj * 2) % 2;
  r(COLOR.crema, -4 - onda, 13, 4, 1); r(COLOR.crema, 16 + onda, 13, 4, 1);
  ctx.globalAlpha = 1;
  r(COLOR.ciruela, 0, 8, 16, 6); r(COLOR.ciruela, -1, 9, 18, 4);
  r('#F7A6B4', 0, 9, 16, 4); r('#FFE3EA', 1, 9, 14, 1);
  r(COLOR.crema, 3, 9, 2, 4); r(COLOR.crema, 11, 9, 2, 4);
  r('#E87F86', 1, 12, 14, 1);
}
// Barquita de madera vista en 3/4: por dentro (tablas, una cesta con pescado y una manta rosa) y el costado
// azul con franja coral, la proa levantada y un farolito colgado en la popa. Se dibuja en dos partes para que la
// gatita quede dentro: 'detras' (sombra, farol, borde de atras e interior) antes que ella y 'delante' (el costado)
// despues. (x, y) = esquina del dibujo de la gatita; mira = 1 con la proa a la derecha, -1 a la izquierda.
function dibujarBarca(x, y, parte, mira = 1) {
  const hx = x + 8 - 15;
  const r = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(mira > 0 ? hx + rx : hx + 30 - rx - w, y + ry, w, h); };
  const o = COLOR.ciruela, azul = '#7C9CC9';
  if (parte === 'detras') {
    ctx.globalAlpha = 0.25; r('#2E4E7A', 2, 16, 28, 2); r('#2E4E7A', 6, 18, 20, 1); ctx.globalAlpha = 1;   // sombra en el agua
    r(o, 2, -7, 3, 18); r(MADERA.junta, 3, -6, 1, 16);                     // palo del farol, en la popa
    r(o, 2, -8, 8, 3); r(MADERA.junta, 3, -7, 6, 1);
    r(o, 6, -5, 4, 6); r('#FFE08A', 7, -4, 2, 4); r(COLOR.crema, 7, -4, 1, 1);
    r(o, 3, 5, 25, 2); r(COLOR.crema, 4, 6, 23, 1);                        // borde de atras
    r(o, 2, 7, 27, 4); r('#C98F6B', 3, 7, 25, 3);                          // fondo de tablas
    for (let i = 7; i < 27; i += 5) r('#B47A58', i, 7, 1, 3);
    r(o, 4, 6, 6, 5); r(MADERA.tabla, 5, 7, 4, 3); r('#C98F6B', 5, 8, 4, 1);   // cesta con un pescado asomando
    r('#8CC4DC', 6, 5, 3, 2); r(o, 9, 5, 1, 1);
    r(o, 19, 6, 7, 5); r('#F7A6B4', 20, 7, 5, 3); r('#FFE3EA', 21, 7, 1, 3); r('#FFE3EA', 23, 7, 1, 3);   // manta doblada
    return;
  }
  r(o, 1, 10, 29, 1);                                                       // costado de delante
  r(o, 1, 11, 1, 2); r(COLOR.crema, 2, 11, 27, 1);
  r(azul, 2, 12, 27, 1); r('#A9D8E8', 4, 12, 3, 1);
  r(o, 2, 13, 1, 1); r('#E87F86', 3, 13, 25, 1); r(o, 28, 13, 1, 1);
  r(o, 3, 14, 1, 1); r(azul, 4, 14, 23, 1); r(o, 27, 14, 1, 1);
  r(o, 4, 15, 23, 1);
  r(o, 29, 7, 2, 1); r(o, 30, 8, 1, 5); r(COLOR.crema, 29, 8, 1, 3); r(azul, 29, 11, 1, 2); r(o, 29, 13, 1, 1);   // proa levantada
  const ola = Math.floor(estado.reloj * 3) % 3;                              // espuma en la linea del agua
  ctx.globalAlpha = 0.75; r(COLOR.crema, -2 - ola, 15, 3, 1); r(COLOR.crema, 31 + ola, 13, 3, 1);
  ctx.globalAlpha = 0.4; r(COLOR.crema, 8 + ola * 2, 16, 5, 1); r(COLOR.crema, 18 - ola, 17, 4, 1);
  ctx.globalAlpha = 1;
}
// Donde brilla de noche el farolito de la barca (para las luces).
const farolBarca = (x, y, mira = 1) => [x + 8 - mira * 7, y - 2];
const miraBarca = () => estado.gata.espejo ? -1 : 1;
// Arena de la playa: el camino mas dorado, con granitos y alguna conchita rosa.
function dibujarArena(c, f) {
  const x = c * T, y = f * T;
  ctx.globalAlpha = 0.45; ctx.fillStyle = '#FBE3A6'; ctx.fillRect(x, y, T, T);
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#D9B47E';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + Math.floor(azar(c, f, 60 + i) * 15), y + Math.floor(azar(c, f, 64 + i) * 15), 1, 1);
  ctx.globalAlpha = 1;
  if (azar(c, f, 68) < 0.12) {
    const cx = x + 3 + Math.floor(azar(c, f, 69) * 9), cy = y + 3 + Math.floor(azar(c, f, 70) * 9);
    ctx.fillStyle = '#F7A6B4'; ctx.fillRect(cx, cy, 3, 2); ctx.fillStyle = COLOR.crema; ctx.fillRect(cx + 1, cy, 1, 1);
  }
}
// Tablas de madera color miel con sus juntas (en el sentido en que se camina).
const MADERA = { tabla: '#E8A85C', junta: '#C98F6B', brillo: '#FFD3B0', poste: '#A9714F' };
const TONOS_TABLA = ['#F0B46A', '#E8A85C', '#DDA055'];
const SOMBRA_AGUA = '#2E4E7A';
// Poste de madera que sale del agua: la parte de abajo se ve hundida (azulada) y con una espuma que va y viene.
function poste(px, py, alto, semilla) {
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(px, py, 3, alto);
  ctx.fillStyle = MADERA.poste; ctx.fillRect(px + 1, py + 1, 1, alto - 1);
  ctx.fillStyle = MADERA.brillo; ctx.fillRect(px + 1, py + 1, 1, 1);
  const agua = py + alto - 4;
  ctx.globalAlpha = 0.35; ctx.fillStyle = SOMBRA_AGUA; ctx.fillRect(px, agua, 3, 4);
  const o = Math.round(Math.sin(estado.reloj * 2 + semilla) + 1);
  ctx.globalAlpha = 0.8; ctx.fillStyle = COLOR.crema;
  ctx.fillRect(px - 1 - o, agua, 1 + o, 1); ctx.fillRect(px + 3, agua, 1 + o, 1);
  ctx.globalAlpha = 0.45; ctx.fillRect(px - 1, agua + 1, 5, 1);
  ctx.globalAlpha = 1;
}
// Rollo de cuerda sobre las tablas.
function rollo(x, y) {
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x, y, 5, 4);
  ctx.fillStyle = '#E8D2A8'; ctx.fillRect(x + 1, y + 1, 3, 2);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + 2, y + 1, 1, 1);
  ctx.fillStyle = MADERA.brillo; ctx.fillRect(x + 1, y + 1, 1, 1);
}
// Muelle (de norte a sur): sale de la orilla (las tablas se meten un poco en la tierra), postes a los lados con
// espuma, sombra sobre el agua a la derecha y bajo la punta, tablas de largo y tono distintos con sus clavos y,
// si la punta mira al sur, el canto de madera que le da grosor. Se pinta despues del suelo (dibujarEstructuras).
function dibujarMuelle(c, f) {
  const x = c * T, y = f * T, arriba = tile(c, f - 1), abajo = tile(c, f + 1);
  const puntaArriba = arriba === 'W', puntaAbajo = abajo === 'W';
  const tierraArriba = !puntaArriba && arriba !== 'M', tierraAbajo = !puntaAbajo && abajo !== 'M';
  const y0 = y - (tierraArriba ? 6 : 0) + (puntaArriba ? 2 : 0);
  const y1 = y + T + (tierraAbajo ? 6 : 0) - (puntaAbajo ? 4 : 0);
  const enTierra = !!muelleEnTierra(c, f);
  ctx.globalAlpha = enTierra ? 0.14 : 0.22; ctx.fillStyle = SOMBRA_AGUA;
  ctx.fillRect(x + 15, y + (puntaArriba ? 4 : 0), enTierra ? 1 : 3, T - (puntaArriba ? 4 : 0) + (puntaAbajo ? 3 : 0));
  if (puntaAbajo) ctx.fillRect(x + 3, y + T, 12, 3);
  ctx.globalAlpha = 1;
  if (!enTierra && (f % 2 === 0 || puntaArriba || puntaAbajo)) for (const px of [x - 1, x + 14]) poste(px, y + (puntaArriba ? 3 : 4), puntaAbajo ? 13 : 11, c + f + px);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + 1, y0 - 1, 14, y1 - y0 + 1);
  ctx.fillStyle = MADERA.junta; ctx.fillRect(x + 2, y0, 12, y1 - y0);
  for (let py = y0; py < y1; py += 4) {
    const k = Math.floor(py / 4), l = azar(c, k, 70) < 0.3 ? 1 : 0, r = azar(c, k, 71) < 0.3 ? 1 : 0;
    const h = Math.min(3, y1 - py);
    ctx.fillStyle = TONOS_TABLA[Math.floor(azar(c, k, 72) * 3)]; ctx.fillRect(x + 2 + l, py, 12 - l - r, h);
    ctx.fillStyle = COLOR.ciruela; if (l) ctx.fillRect(x + 2, py, 1, h); if (r) ctx.fillRect(x + 13, py, 1, h);
    ctx.globalAlpha = 0.6; ctx.fillStyle = MADERA.brillo; ctx.fillRect(x + 2 + l, py, 12 - l - r, 1);
    ctx.globalAlpha = 0.5; ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + 3 + l, py + 1, 1, 1); ctx.fillRect(x + 12 - r, py + 1, 1, 1);
    ctx.globalAlpha = 1;
  }
  if (puntaAbajo) {                                   // canto de la punta: el grosor de las tablas
    ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + 1, y1, 14, 4);
    ctx.fillStyle = MADERA.junta; ctx.fillRect(x + 2, y1, 12, 2);
    ctx.fillStyle = MADERA.poste; ctx.fillRect(x + 2, y1 + 2, 12, 1);
  }
  if (puntaAbajo || puntaArriba) rollo(x + 8, puntaAbajo ? y + 3 : y + 7);
}
// Un tramo de muelle que pasa por tierra (sin agua a los lados): devuelve la casilla de los lados ('G', 'Y'...) o null.
function muelleEnTierra(c, f) {
  if (tile(c, f) !== 'M') return null;
  const i = tile(c - 1, f), d = tile(c + 1, f);
  return i !== 'W' && d !== 'W' ? (i === 'Y' || d === 'Y' ? 'Y' : i || d) : null;
}
// Farolillo en la punta de cada muelle (brilla de noche: es un adorno con luz).
function farolMuelle(x, y) {
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + 2, y - 6, 3, 13); ctx.fillRect(x + 1, y - 10, 5, 5); ctx.fillRect(x + 2, y - 11, 3, 1);
  ctx.fillStyle = MADERA.poste; ctx.fillRect(x + 3, y - 5, 1, 11);
  ctx.fillStyle = '#FFE08A'; ctx.fillRect(x + 2, y - 9, 3, 3);
  ctx.fillStyle = COLOR.crema; ctx.fillRect(x + 2, y - 9, 1, 1);
}
// Una gaviota que descansa en el poste de la punta del embarcadero (de dia y sin lluvia). Si te acercas, se va.
function gaviota(x, y) {
  if (oscuridad(estado.hora) > 0.4 || llueve()) return;
  const g = estado.gata;
  if (Math.abs(g.x + 8 - x) < 28 && Math.abs(g.y + 8 - y) < 28) return;
  if ((estado.reloj % 40) > 30) return;
  const mira = Math.sin(estado.reloj * 0.7) > 0 ? 1 : -1, sx = mira > 0 ? x : x + 1;
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(sx - 2, y - 4, 6, 5); ctx.fillRect(sx + (mira > 0 ? 3 : -3), y - 6, 3, 3);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(sx - 1, y - 3, 4, 3); ctx.fillRect(sx + (mira > 0 ? 3 : -2), y - 5, 1, 2);
  ctx.fillStyle = '#C9C2D6'; ctx.fillRect(mira > 0 ? sx - 1 : sx + 1, y - 3, 2, 2);
  ctx.fillStyle = '#FFE08A'; ctx.fillRect(mira > 0 ? sx + 5 : sx - 4, y - 5, 1, 1);
  ctx.fillStyle = '#E8A85C'; ctx.fillRect(sx, y + 1, 1, 1); ctx.fillRect(sx + 2, y + 1, 1, 1);
}
// Puente sobre el rio (de oeste a este): tablas en vertical que se meten un poco en el camino, sombra en el
// agua, pilares con espuma por delante y barandilla de atras. La de delante es un adorno para que tape a la gatita.
function dibujarPuente(c, f) {
  const x = c * T, y = f * T, x0 = x - (tile(c - 1, f) !== 'B' ? 5 : 0), x1 = x + T + (tile(c + 1, f) !== 'B' ? 5 : 0);
  ctx.globalAlpha = 0.22; ctx.fillStyle = SOMBRA_AGUA; ctx.fillRect(x, y + 15, T, 3); ctx.globalAlpha = 1;
  poste(x + 6, y + 9, 10, c * 3);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x0, y + 1, x1 - x0, 14);
  ctx.fillStyle = MADERA.junta; ctx.fillRect(x0 + 1, y + 3, x1 - x0 - 2, 9);
  for (let px = x0 + 1; px < x1 - 1; px += 4) {
    const k = Math.floor(px / 4), w = Math.min(3, x1 - 1 - px);
    ctx.fillStyle = TONOS_TABLA[Math.floor(azar(k, f, 73) * 3)]; ctx.fillRect(px, y + 3 + (azar(k, f, 74) < 0.3 ? 1 : 0), w, 8);
    ctx.globalAlpha = 0.6; ctx.fillStyle = MADERA.brillo; ctx.fillRect(px, y + 3, 1, 8); ctx.globalAlpha = 1;
  }
  ctx.fillStyle = MADERA.poste; ctx.fillRect(x0 + 1, y + 12, x1 - x0 - 2, 2);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x0, y - 1, x1 - x0, 3);
  ctx.fillStyle = MADERA.brillo; ctx.fillRect(x0, y, x1 - x0, 1);
  for (const px of [x0, x1 - 3]) if (px === x0 ? x0 < x : x1 > x + T) { ctx.fillStyle = COLOR.ciruela; ctx.fillRect(px, y - 5, 3, 5); ctx.fillStyle = MADERA.brillo; ctx.fillRect(px + 1, y - 4, 1, 3); }
  if (c % 2 === 0) { ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + 7, y - 5, 3, 5); ctx.fillStyle = MADERA.brillo; ctx.fillRect(x + 8, y - 4, 1, 3); }
}
// Barandilla de delante del puente (por delante de la gatita cuando cruza).
function barandaPuente(c, f) {
  const x = c * T, y = f * T, x0 = x - (tile(c - 1, f) !== 'B' ? 5 : 0), x1 = x + T + (tile(c + 1, f) !== 'B' ? 5 : 0);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x0, y + 11, x1 - x0, 3);
  ctx.fillStyle = MADERA.tabla; ctx.fillRect(x0, y + 12, x1 - x0, 1);
  const postes = [x0 < x ? x0 : null, x1 > x + T ? x1 - 3 : null, c % 2 === 0 ? x + 7 : null].filter(v => v !== null);
  for (const px of postes) { ctx.fillStyle = COLOR.ciruela; ctx.fillRect(px, y + 7, 3, 6); ctx.fillStyle = MADERA.brillo; ctx.fillRect(px + 1, y + 8, 1, 3); }
}
// Muelles y puente, despues del suelo (asi sus tablas pueden meterse en la tierra de la orilla).
function dibujarEstructuras(cx, cy) {
  const c0 = Math.floor(cx / T) - 1, f0 = Math.floor(cy / T) - 1;
  for (let f = f0; f <= f0 + lienzo.height / T + 2; f++) for (let c = c0; c <= c0 + lienzo.width / T + 2; c++) {
    const t = tile(c, f);
    if (t === 'M') dibujarMuelle(c, f);
    else if (t === 'B') dibujarPuente(c, f);
  }
}
// Adornos del agua: farolillos en la punta de los muelles, la gaviota del embarcadero y la barandilla del puente.
function adornosAgua() {
  const t = (c, f) => (MAPA[f] && MAPA[f][c]) || null;
  adorno(EMBARCADERO.c, EMBARCADERO.punta, (x, y) => farolMuelle(x, y + 4), { bloquea: false, luz: [[3, -4]] });
  adorno(LAGO.muelle.c, LAGO.muelle.f0, (x, y) => farolMuelle(x, y + 9), { bloquea: false, luz: [[3, 1]] });
  adorno(EMBARCADERO.c, EMBARCADERO.punta - 2, (x, y) => gaviota(x, y + 4), { bloquea: false });   // en un poste del lado oeste
  for (let c = 0; c < ANCHO; c++) if (t(c, PUENTE_F) === 'B') adorno(c, PUENTE_F, (x, y) => barandaPuente(x / T, y / T), { alto: 2, bloquea: false });
}
// Hoja de nenufar// Hoja de nenufar (a veces con su flor), meciendose un poquito sobre el agua.
function nenufar(n) {
  const x = n.x, y = n.y + (viento(n.x, n.y, 1.2) > 0 ? 1 : 0);
  ctx.globalAlpha = 0.22; ctx.fillStyle = SOMBRA_AGUA; ctx.fillRect(x + 1, n.y + 4, 6, 1);    // sombra en el agua
  const onda = (estado.reloj * 0.4 + azar(n.x, n.y, 75)) % 1;                                  // onda que se abre a ratos
  if (onda < 0.5) {
    ctx.globalAlpha = 0.6 * (1 - onda * 2); ctx.fillStyle = COLOR.crema;
    const r = Math.round(onda * 6);
    ctx.fillRect(x - 1 - r, n.y + 2, 2, 1); ctx.fillRect(x + 6 + r, n.y + 2, 2, 1);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + 1, y, 5, 1); ctx.fillRect(x, y + 1, 7, 2); ctx.fillRect(x + 1, y + 3, 5, 1);
  ctx.fillStyle = '#7FBF8E'; ctx.fillRect(x + 1, y + 1, 5, 2);
  ctx.fillStyle = '#A8D89A'; ctx.fillRect(x + 2, y + 1, 2, 1);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + 4, y + 1, 1, 1);         // la muesca de la hoja
  if (n.flor) { ctx.fillStyle = '#F7A6B4'; ctx.fillRect(x + 2, y - 1, 3, 2); ctx.fillStyle = COLOR.mantequilla; ctx.fillRect(x + 3, y - 1, 1, 1); }
}
// Junco de orilla: dos tallos que se mecen y una espiga marron.
function junco(j) {
  const v = viento(j.x, j.y, 1.8);
  if (tile(Math.floor(j.x / T), Math.floor(j.y / T)) === 'W') {                                 // en el agua: ondas al pie
    ctx.globalAlpha = 0.5; ctx.fillStyle = COLOR.crema;
    const o = Math.round(Math.sin(estado.reloj * 1.6 + j.x) + 1);
    ctx.fillRect(j.x - 2 - o, j.y + 1, 2, 1); ctx.fillRect(j.x + 3 + o, j.y + 1, 2, 1);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = '#4F7F57';
  ctx.fillRect(j.x, j.y - 4, 1, 5); ctx.fillRect(j.x + v, j.y - 8, 1, 4);
  ctx.fillRect(j.x + 2, j.y - 3, 1, 4); ctx.fillRect(j.x + 2 + v, j.y - 6, 1, 3);
  ctx.fillStyle = COLOR.cacao; ctx.fillRect(j.x + v, j.y - 11, 2, 3);
}
// Marco de madera de los bancales del rio.
function dibujarBancal() {
  const x0 = BANCAL.c0 * T - 2, y0 = BANCAL.f0 * T - 2, w = (BANCAL.c1 - BANCAL.c0 + 1) * T + 4, h = (BANCAL.f1 - BANCAL.f0 + 1) * T + 4;
  ctx.fillStyle = COLOR.ciruela;
  ctx.fillRect(x0 - 1, y0 - 1, w + 2, 4); ctx.fillRect(x0 - 1, y0 + h - 3, w + 2, 4);
  ctx.fillRect(x0 - 1, y0 - 1, 4, h + 2); ctx.fillRect(x0 + w - 3, y0 - 1, 4, h + 2);
  ctx.fillStyle = MADERA.tabla;
  ctx.fillRect(x0, y0, w, 2); ctx.fillRect(x0, y0 + h - 2, w, 2); ctx.fillRect(x0, y0, 2, h); ctx.fillRect(x0 + w - 2, y0, 2, h);
  ctx.fillStyle = MADERA.junta;
  for (let i = 12; i < w - 4; i += 16) { ctx.fillRect(x0 + i, y0, 1, 2); ctx.fillRect(x0 + i, y0 + h - 2, 1, 2); }
}

// Suelo: detalles sueltos (los mechones alternan dos cuadros con el viento) y charcos si llueve.
function dibujarSuelo(cx, cy) {
  if (enVista(BANCAL.c0 * T, BANCAL.f0 * T, cx, cy, 120)) dibujarBancal();
  if (enVista(FUENTE.c * T, FUENTE.f * T, cx, cy, 80)) dibujarRoseta();
  for (const n of nenufares) if (enVista(n.x, n.y, cx, cy)) nenufar(n);
  for (const j of juncos) if (enVista(j.x, j.y, cx, cy)) junco(j);
  dibujarSueltas(cx, cy);
  if (enVista(TIENDA.c * T, TIENDA.f * T, cx, cy, 80)) dibujarPisadoTienda();
  if (estado.lluvia > 0) {
    ctx.globalAlpha = estado.lluvia * 0.85;
    for (const k of charcos) if (enVista(k.x, k.y, cx, cy)) cuadro('detalles_tiles', 9, k.x, k.y);
    ctx.globalAlpha = 1;
  }
  for (const d of detalles) {
    if (!enVista(d.x, d.y, cx, cy)) continue;
    cuadro('detalles_tiles', d.viento ? (viento(d.x, d.y, 2.2) > 0 ? 1 : 0) : d.n, d.x, d.y);
  }
}

// Sombras ovaladas en el suelo bajo todo lo que tiene volumen. Se guardan ya dibujadas por tamano.
const sombras = {};
function sombra(x, y, ancho, alto) {
  const clave = ancho + 'x' + alto;
  if (!sombras[clave]) {
    const s = document.createElement('canvas');
    s.width = ancho; s.height = alto;
    const sc = s.getContext('2d');
    sc.fillStyle = COLOR.ciruela;
    for (let j = 0; j < alto; j++) {   // ovalo pixelado: cada fila es una linea centrada
      const dy = (j + 0.5) / alto * 2 - 1, media = Math.round(ancho / 2 * Math.sqrt(1 - dy * dy));
      sc.fillRect(ancho / 2 - media, j, media * 2, 1);
    }
    sombras[clave] = s;
  }
  ctx.drawImage(sombras[clave], Math.round(x - ancho / 2), Math.round(y - alto / 2));
}
function dibujarSombras(cx, cy) {
  ctx.globalAlpha = 0.2;
  const desvio = desvioSombra();
  for (const [clave, n] of Object.entries(fijos)) {
    const [c, f] = clave.split(',').map(Number);
    if (!enVista(c * T, f * T, cx, cy)) continue;
    if (n === 0) sombra(c * T + 8 + desvio + viento(c * T - 8, f * T - 16), f * T + 15, 24 + Math.abs(desvio) * 2, 6);
    else sombra(c * T + 8, f * T + 14, 14, 4);
  }
  for (const v of VECINOS) sombra(v.c * T + 8, v.f * T + 14, 12, 3);
  for (const k of CESTAS) sombra(k.c * T + 8, k.f * T + 14, 13, 3);
  for (const [clave, n] of Object.entries(estado.colocados)) {
    const [c, f] = clave.split(',').map(Number), { ancho, alto } = tamanoMueble(n);
    sombra(c * T + ancho * 8, (f + alto) * T - 1, ancho * 13, 3);
  }
  sombra(CASA.c * T + 26 + desvio, (CASA.f + 2) * T, 58 + Math.abs(desvio) * 2, 6);   // la casa (se mueve con la hora)
  for (const v of VECINOS) { if (v.valle) continue; const h = enPuebloA(v.hogar.c, v.hogar.f); sombra(h.c * T + 24, (h.f + 2) * T, 54, 5); }
  sombra(FUENTE.c * T + 24 + desvio, FUENTE.f * T + 45, 52 + Math.abs(desvio) * 2, 7);
  for (const a of ADORNOS) {
    if (!a.sombra || !enVista(a.c * T, a.f * T, cx, cy)) continue;
    const [dx, dy, w, h, alta] = a.sombra;
    sombra(a.c * T + dx + (alta ? desvio : 0), a.f * T + dy, w + (alta ? Math.abs(desvio) : 0), h);
  }
  sombra(INTERIOR.cama.c * T + 8, (INTERIOR.cama.f + 1) * T + 15, 15, 3);
  sombra(INTERIOR.armario.c * T + 8, INTERIOR.armario.f * T + 15, 15, 3);
  const g = estado.gata;
  if (!nadando() && !estado.navegando) sombra(g.x + 8, g.y + 15, 10, 3);
  ctx.globalAlpha = 1;
}

// Interior, sobre el suelo: luz de las ventanas (se inclina con la hora) y sombra de contacto bajo la pared.
function dibujarLuzCuarto() {
  const y0 = (INTERIOR.f0 + INTERIOR.pared) * T, ancho = INTERIOR.ancho * T;
  const dia = (1 - oscuridad(estado.hora)) * (1 - 0.6 * estado.lluvia);
  if (dia > 0.05) {
    const inclina = (estado.hora - 0.4) * 1.6;            // por la manana hacia un lado, por la tarde hacia el otro
    ctx.fillStyle = '#FFF4E0';
    for (const c of INTERIOR.ventanas) {
      for (let j = 0; j < 26; j++) {
        ctx.globalAlpha = 0.34 * dia * (1 - j / 30);
        const x = c * T + 3 + Math.round(j * inclina);
        ctx.fillRect(x, y0 + j, 5, 1);
        ctx.fillRect(x + 6, y0 + j, 5, 1);
      }
    }
  }
  ctx.fillStyle = COLOR.ciruela;
  ctx.globalAlpha = 0.22; ctx.fillRect(0, y0, ancho, 2);
  ctx.globalAlpha = 0.1; ctx.fillRect(0, y0 + 2, ancho, 2);
  // Junto a los muros de los lados, una sombra finita en vertical.
  ctx.fillRect(PARED_CORTE + 1, y0, 2, INTERIOR.alto * T);
  ctx.fillRect(ancho - PARED_CORTE - 3, y0, 2, INTERIOR.alto * T);
  ctx.globalAlpha = 1;
}

// Muros de los lados y de abajo vistos "en corte": solo su canto, para encerrar el cuarto sin tapar nada.
const PARED_CORTE = 4;
function dibujarParedesCorte() {
  const g = PARED_CORTE, x1 = INTERIOR.ancho * T, y0 = INTERIOR.f0 * T, y1 = (INTERIOR.f0 + INTERIOR.alto) * T;
  const puerta = INTERIOR.salida.c * T, alto = y1 - y0;
  ctx.fillStyle = COLOR.ciruela;
  ctx.fillRect(0, y0, g + 1, alto);
  ctx.fillRect(x1 - g - 1, y0, g + 1, alto);
  ctx.fillRect(0, y1 - g - 1, puerta, g + 1);
  ctx.fillRect(puerta + T, y1 - g - 1, x1 - puerta - T, g + 1);
  ctx.fillStyle = '#FFF4E0';
  ctx.fillRect(0, y0, g, alto);
  ctx.fillRect(x1 - g, y0, g, alto);
  ctx.fillRect(0, y1 - g, puerta - 1, g);
  ctx.fillRect(puerta + T + 1, y1 - g, x1 - puerta - T - 1, g);
  // Una linea rosa por el centro del canto, como la moldura de la pared de arriba.
  ctx.fillStyle = '#FFC9D3';
  ctx.fillRect(1, y0 + 3, 1, alto - 3);
  ctx.fillRect(x1 - 2, y0 + 3, 1, alto - 3);
  ctx.fillRect(1, y1 - 2, puerta - 2, 1);
  ctx.fillRect(puerta + T + 1, y1 - 2, x1 - puerta - T - 2, 1);
}

// Sombras de nubes: manchas grandes y suaves que cruzan el valle despacio.
let nube = null;
function dibujarNubes() {
  if (!nube) {
    nube = document.createElement('canvas');
    nube.width = 90; nube.height = 36;
    const n = nube.getContext('2d');
    n.fillStyle = '#4A3F6B';
    for (const [x, y, rx, ry] of [[30, 20, 26, 12], [52, 15, 24, 13], [68, 22, 20, 10], [45, 25, 30, 9]]) {
      for (let j = -ry; j < ry; j++) {
        const media = Math.round(rx * Math.sqrt(1 - ((j + 0.5) / ry) ** 2));
        n.fillRect(x - media, y + j, media * 2, 1);
      }
    }
  }
  const r = regionDe(casillaActual().f), ancho = r.ancho * T + 200, nubes = Math.ceil(14 * r.ancho * r.alto / (ANCHO * ALTO));
  ctx.globalAlpha = 0.07 + 0.05 * estado.lluvia;
  for (let i = 0; i < nubes; i++) {
    const x = ((i * 263 + estado.reloj * (4 + i)) % ancho) - 100, y = r.f0 * T + (i * 113 + 30) % (r.alto * T - 40);
    ctx.drawImage(nube, Math.round(x), Math.round(y));
  }
  ctx.globalAlpha = 1;
}

// Cultivos, cesta, muebles y arboles de un rango de filas (para dibujarlos detras o delante de la gatita).
function dibujarObjetos(desdeFila, hastaFila) {
  for (const [clave, p] of Object.entries(estado.parcelas)) {
    if (!p.cultivo) continue;
    const [c, f] = clave.split(',').map(Number);
    if (f < desdeFila || f > hastaFila) continue;
    cuadro('cultivos_' + p.cultivo.tipo, p.cultivo.etapa, c * T, f * T - 2);
  }
  for (const k of CESTAS) {
    if (k.f < desdeFila || k.f > hastaFila) continue;
    if (estaDentro(k.f)) cuadroAlto(ALTOS.cesta, k.c, k.f);
  }
  for (const [clave, n] of Object.entries(estado.colocados)) {
    const [c, f] = clave.split(',').map(Number), pie = f + tamanoMueble(n).alto - 1;   // se ordena por su fila de abajo
    if (pie < desdeFila || pie > hastaFila) continue;
    if (MUEBLES[n].expone) dibujarExpositor(c, f, n);
    else dibujarMueble(n, c * T, f * T);
  }
  for (const [clave, n] of Object.entries(fijos)) {
    const [c, f] = clave.split(',').map(Number);
    if (f < desdeFila || f > hastaFila) continue;
    if (n === 0) dibujarArbol(c, f);
    else cuadro('naturaleza_tiles', n, c * T, f * T);
  }
  dibujarCaidos(desdeFila, hastaFila);
  if (CASA.f + 1 >= desdeFila && CASA.f + 1 <= hastaFila) dibujarCasa();
  // La barquita amarrada junto a la punta del embarcadero (si es tuya y no estas navegando), con su cuerda.
  const amarre = sitioBarca();
  if (estado.herramientas.barca && !estado.navegando && amarre.f >= desdeFila && amarre.f <= hastaFila) {
    const bx = amarre.c * T + (estado.barcaEn ? 0 : 7), by = amarre.f * T - 6 + Math.round(Math.sin(estado.reloj * 2));
    dibujarBarca(bx, by, 'detras');
    dibujarBarca(bx, by, 'delante');
  }
  if (estado.herramientas.barca && !estado.navegando && !estado.barcaEn && AMARRE.f >= desdeFila && AMARRE.f <= hastaFila) {
    const bx = AMARRE.c * T + 7, by = AMARRE.f * T - 6 + Math.round(Math.sin(estado.reloj * 2));
    const nx = AMARRE.c * T - 6, ny = AMARRE.f * T + 1;                    // noray en el borde del muelle
    ctx.fillStyle = COLOR.ciruela; ctx.fillRect(nx, ny, 4, 4); ctx.fillStyle = MADERA.poste; ctx.fillRect(nx + 1, ny + 1, 2, 2);
    ctx.fillStyle = '#E8D2A8';
    for (let i = 0; i <= 8; i++) { const t = i / 8; ctx.fillRect(Math.round(nx + 3 + t * (bx - nx - 3)), Math.round(ny + 2 + t * (by + 8 - ny - 2) + Math.sin(t * Math.PI) * 2), 1, 1); }
  }
  for (const a of ADORNOS) if (a.pie >= desdeFila && a.pie <= hastaFila && enVista(a.c * T, a.f * T, cam.x, cam.y, 64)) a.dibujar(a.c * T, a.f * T);
  const pieCama = INTERIOR.cama.f + 1;
  if (pieCama >= desdeFila && pieCama <= hastaFila) cuadroAlto(ALTOS.cama, INTERIOR.cama.c, pieCama);
  if (INTERIOR.armario.f >= desdeFila && INTERIOR.armario.f <= hastaFila) cuadroAlto(ALTOS.armario, INTERIOR.armario.c, INTERIOR.armario.f);
  VECINOS.forEach((v, n) => {
    if (v.f < desdeFila || v.f > hastaFila) return;
    dibujarVecino(v, n);
  });
  dibujarCosasMar(desdeFila, hastaFila);
  dibujarExcavaciones(desdeFila, hastaFila);
}

// Vecinos en reposo: cada uno repite su micro-animacion de 4 cuadros (arte/generar-vecinos.py) con pausas entre
// medias. orden = cuadros que se ven, uno por paso a fps pasos por segundo; cada vecino va desfasado.
const ALTO_VECINO = 24;
const REPOSO_VECINO = {
  oso:      { fps: 3, orden: [0, 0, 0, 0, 1, 2, 2, 2, 1, 3, 3, 3, 0, 0] },        // un sorbito de te
  conejo:   { fps: 4, orden: [0, 0, 0, 0, 0, 1, 2, 1, 2, 1, 2, 0, 3, 3, 3, 0] }, // riega su plantita
  rana:     { fps: 2, orden: [0, 0, 0, 1, 1, 2, 3, 3, 2, 3, 3, 1, 0, 0] },       // cabecea de sueno
  pinguina: { fps: 5, orden: [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 3, 2, 1, 0, 0] },  // saluda con la aleta
};
function dibujarVecino(v, n) {
  const r = REPOSO_VECINO[v.id], paso = Math.floor(estado.reloj * r.fps + n * 5) % r.orden.length;
  ctx.drawImage(img['vecinos_' + v.id], r.orden[paso] * T, 0, T, ALTO_VECINO, v.c * T, v.f * T + T - ALTO_VECINO - 2, T, ALTO_VECINO);
}

// Pecera: fondo, la criatura nadando de lado a lado (recortada al agua) y el cristal por delante.
function dibujarPecera(c, f) {
  const x = c * T, y = f * T, id = estado.peceras[c + ',' + f];
  cuadro('muebles_tiles', PECERA, x, y);
  const d = id && dibujoDe(id);
  if (d) {
    const fase = estado.reloj * 1.3 + c * 1.7 + f;    // cada pecera nada a su ritmo
    ctx.save();
    ctx.beginPath(); ctx.rect(x + 1, y + 2, 14, 10); ctx.clip();
    // Las criaturas miran a la izquierda en su dibujo: se giran cuando nadan hacia la derecha.
    cuadro(d.tira, d.n, x + Math.round(Math.sin(fase) * 2), y - 2 + Math.round(Math.sin(fase * 1.7)), Math.cos(fase) > 0);
    ctx.restore();
  }
  cuadro('muebles_tiles', CRISTAL, x, y);
}

// Expositores grandes (32x32): fondo, lo de dentro recortado a su hueco y el cristal por delante.
// En la pecera grande nadan hasta tres criaturas por todo el ancho; en la vitrina, el tesoro flota y brilla.
function dibujarExpositor(c, f, n) {
  const m = MUEBLES[n];
  if (m.grande === undefined) { dibujarPecera(c, f); return; }
  const { ancho, alto } = tamanoMueble(n);
  const fx = c * T + ancho * 8 - 16, fy = (f + alto) * T - 32, h = m.hueco;
  cuadroGrande('muebles_grandes_tiles', m.grande, fx, fy, 32);
  const dentro = contenidoDe(estado.peceras[c + ',' + f]);
  ctx.save();
  ctx.beginPath(); ctx.rect(fx + h.x, fy + h.y, h.w, h.h); ctx.clip();
  dentro.forEach((id, i) => {
    const d = dibujoDe(id);
    if (!d) return;
    if (m.expone === 'tesoro') {
      const flota = Math.round(Math.sin(estado.reloj * 1.6 + c) * 1);
      if (esLuminoso(id)) halo(fx + h.x + h.w / 2, fy + h.y + h.h / 2 - 1 + flota);
      cuadro(d.tira, d.n, fx + h.x + h.w / 2 - 8, fy + h.y + h.h / 2 - 9 + flota);
    } else {
      // Cada criatura cruza la pecera a su ritmo y a su altura; mira hacia donde nada.
      const fase = estado.reloj * (0.5 + i * 0.17) + i * 2.1 + c;
      const x = fx + h.x + (h.w - T) / 2 + Math.sin(fase) * (h.w - T) / 2;
      // Carriles repartidos por la altura del agua para que no se amontonen en el centro.
      const carril = (i - (dentro.length - 1) / 2) * 4;
      const y = fy + h.y + h.h / 2 - 9 + Math.round(carril + Math.sin(fase * 2.3) * 1);
      if (esLuminoso(id)) halo(x + 8, y + 8);
      cuadro(d.tira, d.n, x, y, Math.cos(fase) > 0);
    }
  });
  ctx.restore();
  cuadroGrande('muebles_grandes_tiles', m.cristal, fx, fy, 32);
  // Destellos de la vitrina: un pixel que se enciende aqui y alla sobre el cristal.
  if (m.expone === 'tesoro' && dentro.length) {
    const t = Math.floor(estado.reloj * 3 + c * 5);
    ctx.fillStyle = COLOR.mantequilla;
    ctx.fillRect(fx + h.x + (t * 7) % h.w, fy + h.y + (t * 5) % h.h, 1, 1);
  }
}

// Bocadillo sobre un vecino cercano con lo que pide; se pone amarillo si ya lo tienes.
// En el pueblo se ve desde lejos (flotando despacito), para saber de un vistazo que quiere cada uno.
function dibujarPedidos() {
  const aqui = casillaActual(), pueblo = enPueblo(aqui.f);
  for (const v of VECINOS) {
    const cerca = Math.abs(v.c - aqui.c) <= 4 && Math.abs(v.f - aqui.f) <= 3;
    if (!cerca && !(pueblo && enPueblo(v.f) && enVista(v.c * T, v.f * T, cam.x, cam.y))) continue;
    const p = datosVecino(v).pedido, d = dibujoDe(p.id);
    const x = v.c * T - 2, y = v.f * T - 23 - (cerca ? 0 : Math.round(Math.sin(estado.reloj * 2 + v.c) * 1.5));
    panel(x, y, 20, 19);
    if ((estado.inv[p.id] || 0) >= p.n) { ctx.fillStyle = COLOR.mantequilla; ctx.fillRect(x + 1, y + 1, 18, 17); }
    cuadro(d.tira, d.n, x + 2, y + 1);
    ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + 8, y + 19, 4, 1); ctx.fillRect(x + 9, y + 20, 2, 1);
  }
}

// Prendas tejidas encima de la gatita. En los cuadros en que ella baja 1 pixel, la ropa baja tambien.
const BAJA = {
  gatita_reposo: [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1], gatita_caminar: [0, 1, 0, 1], gatita_alegria: [1, 0, 0, 0, 0, 0, 1],
  gatita_reposoLado: [0, 0, 1, 1, 0, 0, 1, 1], gatita_caminarLado: [0, 1, 0, 1], gatita_reposoEsp: [0, 0, 1, 1], gatita_caminarEsp: [0, 1, 0, 1],
  gatita_pescar: [0, 0, 1, 1, 0, 0, 1, 1], gatita_pescarLado: [0, 0, 1, 1, 0, 0, 1, 1], gatita_pescarEsp: [0, 0, 1, 1],
  gatita_tirar: [0, 1], gatita_tirarLado: [0, 1], gatita_tirarEsp: [0, 1], gatita_tejer: [1, 1, 1, 1, 1, 1, 1, 1], gatita_tejerSentarse: [1, 1, 1, 1, 1], gatita_tejerBien: [1, 1], gatita_regar: [0, 0, 0, 0, 0],
  gatita_cultivar: [1, 1, 1, 1], gatita_sueno: [0, 0, 1, 1, 1, 1, 0, 0], gatita_cavar: [0, 1, 1, 0], gatita_talar: [0, 0, 1, 1],
  gatita_patinar: [0, 0, 0, 0], gatita_patinarLado: [0, 0, 0, 0], gatita_patinarEsp: [0, 0, 0, 0],
};
function dibujarRopa(a, n, x, y, espejo) {
  if (estado.ropa.bufanda) cuadro(tintada(a.img + '_bufanda', estado.ropa.bufanda), n, x, y, espejo);
  for (const pr of PRENDAS) {
    const color = estado.ropa[pr.id];
    if (pr.n === undefined || !color) continue;
    const py = y + BAJA[a.img][n];
    cuadro('ropa_tiles', pr.n, x, py, espejo);
    cuadro(tintada('ropa_tiles_tinte', color), pr.n, x, py, espejo);
  }
}

// La casita por fuera, dibujada con rectangulos: tejado, paredes, puerta y dos ventanas (que se encienden de noche).
// Tu casa tiene el tejado coral y la estrella; la de cada vecino, su color y su simbolo.
const SIMBOLOS = {
  estrella: BITS.estrella,
  corazon: ['.#.#.', '#####', '#####', '.###.', '..#..'],
  gota: ['..#..', '.###.', '#####', '#####', '.###.'],
  zanahoria: ['.#.#.', '..#..', '.###.', '.###.', '..#..'],
};
// Casas en 3/4 (la de la gatita y las de los vecinos; ocupan 3x2 casillas y el tejado y la chimenea suben por encima
// hasta y - 30): tejado de tejas redondeadas al tresbolillo visto desde arriba, con cumbrera, canto y alero de madera;
// la pared del lado derecho asoma en sombra para dar volumen, sombra del alero y zocalo de piedras. Cada casa sale de un
// estilo (ESTILOS_CASA): colores del tejado (tejado[0] base, tejado[1] sombra; las luces y sombras se mezclan solas),
// pared ('estuco' con manchitas, 'tablas' pintadas o 'piedra'), ventanas de izquierda a derecha ('redonda' u
// 'postigo', con una contraventana y jardinera), chimenea (columna o null) con humo, buhardilla (columna o null),
// encima de la puerta un toldito de rayas o un tejadillo de tejas, el simbolo del vecino tallado en la puerta (la gatita lleva vitral), y extras delante (regadera,
// salvavidas, sacos de harina). Todas llevan puerta de madera en arco con vitral y pomo, felpudo, piedritas, matojos y
// arbustos en las esquinas.
const CASA_PINTA = {
  estuco: '#FFF1DC', estucoMancha: '#F7E3CA', estucoLuz: '#FFF9EE', estucoSombra: '#EBD3B9', lado: '#E8CBB0', ladoSombra: '#D6B49A',
  piedra: '#E2D3C8', piedraLuz: '#F3E9E0', piedraSombra: '#C4B0A6',
  madera: '#C98A63', maderaLuz: '#DFA67C', maderaSombra: '#A86C4E', veta: '#8E5940',
  ladrillo: '#E39F88', ladrilloSombra: '#C47C6C', mortero: '#F5DCCD', musgo: '#A9CF8E',
  hoja: '#8FC98A', hojaLuz: '#C4E8A8', hojaSombra: '#5E9E6E', vidrio: '#A9D8E8', vidrioLuz: '#E4F4FA', noche: '#FFE08A', nocheLuz: '#FFF6D6',
  laton: '#E8B84F', felpudo: '#E8B07A', tierra: '#D9BE9C',
};
const FLORES_CASA = ['#F7A6B4', '#FFE08A', '#FFFFFF', '#F28CA0', '#C9A7D8'];
// Mezcla dos colores #rrggbb (k = cuanto del segundo).
function mezclarColor(a, b, k) {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  const m = d => Math.round(((x >> d) & 255) * (1 - k) + ((y >> d) & 255) * k);
  return '#' + ((1 << 24) + (m(16) << 16) + (m(8) << 8) + m(0)).toString(16).slice(1);
}
const ESTILOS_CASA = {
  mia:    { tejado: ['#F4A38E', '#DB7F72'], pared: 'estuco', color: '#FFF1DC', ventanas: ['redonda', 'postigo'], postigo: '#9ED9C5',
            chimenea: 36, buhardilla: 9, encima: 'toldo', toldo: '#F7A6B4', hiedra: true, farol: true, semilla: 7 },
  // Copito, el jardinero: casita de tablas color nata, contraventana mantequilla, regadera junto a la puerta y hiedra.
  conejo: { pared: 'tablas', color: '#FBEFE2', ventanas: ['postigo', 'redonda'], postigo: '#FFE08A',
            chimenea: null, buhardilla: 33, encima: 'tejadillo', hiedra: true, extra: 'regadera', semilla: 3 },
  // Nenufar, la pescadora: casita de piedra con dos ojos de buey, salvavidas en la esquina, tejadillo y chimenea a la izquierda.
  rana:   { pared: 'piedra', ventanas: ['redonda', 'redonda'], chimenea: 6, buhardilla: null, encima: 'tejadillo', extra: 'salvavidas', semilla: 5 },
  // Miel, la panadera: estuco rosado, dos ventanas con contraventanas fresa, chimenea del horno que echa mucho humo y sacos de harina.
  oso:    { pared: 'estuco', color: '#FFE6DA', ventanas: ['postigo', 'postigo'], postigo: '#F7A6B4',
            chimenea: 37, horno: true, buhardilla: null, encima: 'toldo', toldo: '#FFE08A', farol: true, extra: 'sacos', semilla: 9 },
};
function dibujarCasa() { dibujarCasaMia(CASA.c * T, CASA.f * T); }
function dibujarCasaMia(x, y) { dibujarCasaBonita(x, y, ESTILOS_CASA.mia); }
function dibujarCasita(x, y, v) {
  dibujarCasaBonita(x, y, { ...ESTILOS_CASA[v.id], tejado: v.tejado, flores: [v.flores, '#FFFFFF', v.flores, '#FFE08A', '#F7A6B4'], simbolo: v.simbolo });
}

function dibujarCasaBonita(x, y, e) {
  const P = CASA_PINTA, o = COLOR.ciruela, t = estado.reloj, noche = oscuridad(estado.hora) > 0.4, a0 = ctx.globalAlpha;
  const p = (color, rx, ry, w = 1, h = 1) => { ctx.fillStyle = color; ctx.fillRect(x + rx, y + ry, w, h); };
  const tenue = (k, dibujo) => { ctx.globalAlpha = a0 * k; dibujo(); ctx.globalAlpha = a0; };
  const az = n => azar(11, e.semilla, 300 + n);         // siempre igual para cada casa, este donde este
  const B = 32, W = 7, R = -20;                          // suelo, primera fila de pared bajo el alero, cumbrera
  const [base, sombra] = e.tejado, flores = e.flores || FLORES_CASA, cristal = noche ? P.noche : P.vidrio, brillo = noche ? P.nocheLuz : P.vidrioLuz;
  const teja = { base, sombra, luz: mezclarColor(base, '#FFFFFF', 0.42), clara: mezclarColor(base, '#FFFFFF', 0.18),
    oscura: mezclarColor(base, sombra, 0.5), honda: mezclarColor(sombra, o, 0.3) };

  // Suelo: tierra pisada delante de la puerta (se funde con el caminito)
  tenue(0.55, () => ovalo(x + 24, y + B + 2, 11, 3, P.tierra));

  // Pared del lado derecho, en sombra (se ve un poquito porque la casa esta girada)
  const colorPared = e.pared === 'piedra' ? P.piedra : e.color;
  p(o, 45, W - 1, 6, B - W + 1);
  p(mezclarColor(colorPared, '#B08E74', 0.3), 46, W, 4, B - W - 1);
  p(mezclarColor(colorPared, '#B08E74', 0.45), 46, W, 4, 4);
  p(P.piedraSombra, 46, B - 5, 4, 4); p(P.piedra, 46, B - 5, 4, 1);

  // Pared de delante
  p(o, 0, W - 1, 46, B - W + 1);
  p(colorPared, 1, W, 44, B - W - 1);
  const piedras = (y0, filas, alto) => {                 // hileras de piedras irregulares que no coinciden
    for (let fila = 0; fila < filas; fila++) {
      let sx = 1 - (fila % 2) * 2, k = 0;
      while (sx < 45) {
        const w = 3 + Math.floor(az(80 + fila * 20 + k) * 4), a = Math.max(1, sx), b = Math.min(45, sx + w - 1), r = az(120 + fila * 20 + k);
        if (b > a) {
          p(r < 0.25 ? P.piedraLuz : r > 0.85 ? '#E8D4D0' : P.piedra, a, y0 + fila * (alto + 1), b - a, alto);
          p(P.piedraLuz, a, y0 + fila * (alto + 1), Math.min(2, b - a), 1);
          if (az(160 + fila * 20 + k) < 0.12) p(P.musgo, a, y0 + fila * (alto + 1) + alto - 1, 2, 1);
        }
        sx += w; k++;
      }
    }
  };
  if (e.pared === 'estuco') {
    const mancha = mezclarColor(e.color, '#E9C9A8', 0.35), luz = mezclarColor(e.color, '#FFFFFF', 0.6), raya = mezclarColor(e.color, '#C9A68A', 0.4);
    for (let i = 0; i < 10; i++) {
      const mx = 2 + Math.floor(az(i) * 40), my = W + 4 + Math.floor(az(i + 20) * 15);
      p(az(i + 40) < 0.55 ? mancha : luz, mx, my, 2 + Math.floor(az(i + 60) * 3), 1);
    }
    p(raya, 16, W + 17); p(raya, 15, W + 18, 1, 2); p(raya, 16, W + 20);
  } else if (e.pared === 'tablas') {
    const junta = mezclarColor(e.color, '#B08E74', 0.4), luz = mezclarColor(e.color, '#FFFFFF', 0.6);
    for (let j = W + 2; j < B - 6; j += 3) { p(junta, 1, j + 2, 44, 1); p(luz, 1, j, 44, 1); }
    for (let i = 0; i < 4; i++) p(junta, 3 + Math.floor(az(i + 70) * 38), W + 3 + Math.floor(az(i + 75) * 6) * 3, 1, 1);   // nudos
  } else {
    p('#B8A39A', 1, W, 44, B - W - 6);                    // argamasa entre las piedras
    piedras(W + 1, 5, 3);
  }
  const sombraAlero = e.pared === 'piedra' ? P.piedraSombra : mezclarColor(colorPared, '#B08E74', 0.35);
  p(sombraAlero, 1, W, 44, 2); tenue(0.5, () => p(sombraAlero, 1, W + 2, 44, 1));
  // Zocalo de piedras
  p(sombraAlero, 1, B - 6, 44, 1); p(P.piedraSombra, 1, B - 5, 44, 4);
  piedras(B - 5, 2, 1);

  // Hiedra que trepa por la esquina izquierda (las hojas se mecen)
  if (e.hiedra) for (let j = B - 3, k = 0; j > W + 1; j -= 2, k++) {
    const vx = 1 + (k % 2), lado = k % 2 ? 1 : -1, m = viento(x, y + j, 1.3);
    p(P.hojaSombra, vx, j, 1, 2);
    if (vx + lado >= 0) { p(P.hoja, vx + lado + (lado > 0 ? m : 0), j, 2, 1); p(P.hojaLuz, vx + lado + (lado > 0 ? m : 0), j, 1, 1); }
  }

  // Jardinera con flores y tallitos que cuelgan
  const jardinera = (bx, by, w) => {
    for (let k = 0; k < w - 2; k += 2) { p(P.hojaSombra, bx + 1 + k, by - 1, 2, 1); p(P.hoja, bx + 1 + k + (k % 4 ? 1 : 0), by - 2, 1, 1); }
    for (let k = 1; k < w - 1; k += 2) p(flores[(k + bx) % 5], bx + k, by - 2 - (k % 3 === 0 ? 1 : 0), 1, 1);
    p(o, bx, by, w, 4); p(P.madera, bx + 1, by + 1, w - 2, 2); p(P.maderaLuz, bx + 1, by + 1, w - 2, 1);
    for (const k of [1, Math.floor(w / 2), w - 2]) {
      const largo = 2 + ((k + bx) % 3), m = viento(x + bx + k, y + by, 1.1);
      p(P.hojaSombra, bx + k, by + 4, 1, largo);
      p(flores[(k * 3 + bx) % 5], bx + k + m, by + 4 + largo, 1, 1);
    }
  };
  // Ventana redonda (ojo de buey) con su jardinera
  const redonda = cx => {
    const vf = W + 8;
    ovalo(x + cx, y + vf, 6, 6, o); ovalo(x + cx, y + vf, 5, 5, P.madera); ovalo(x + cx, y + vf, 4, 4, o);
    ovalo(x + cx, y + vf, 3, 3, cristal);
    p(o, cx - 3, vf, 6, 1); p(o, cx, vf - 3, 1, 6);
    p(brillo, cx - 2, vf - 2); p(brillo, cx - 1, vf - 3);
    p(P.maderaLuz, cx - 4, vf - 3, 1, 2);
    jardinera(cx - 6, vf + 6, 13);
  };
  // Ventana cuadrada con una sola contraventana abierta (por fuera, hacia el lado de fuera), cortinitas y jardinera
  const postigo = (vx, izquierda) => {
    const sx = izquierda ? vx : vx + 9, cw = izquierda ? vx + 3 : vx;
    p(o, sx, W + 4, 4, 10); p(e.postigo, sx + 1, W + 5, 2, 8); p(mezclarColor(e.postigo, o, 0.25), sx + (izquierda ? 2 : 1), W + 5, 1, 8); p(o, sx + 1, W + 8, 2, 1);
    p(o, cw, W + 4, 9, 10); p(P.madera, cw + 1, W + 5, 7, 8); p(cristal, cw + 2, W + 6, 5, 6);
    p(P.madera, cw + 4, W + 6, 1, 6); p(P.madera, cw + 2, W + 8, 5, 1);
    const cortina = noche ? '#F2B95E' : mezclarColor(e.postigo, '#F7A6B4', 0.5);
    p(cortina, cw + 2, W + 6, 1, 3); p(cortina, cw + 6, W + 6, 1, 3);
    p(brillo, cw + 3, W + 9);
    jardinera(vx + 1, W + 14, 11);
  };
  const [vi, vd] = e.ventanas;
  if (vi === 'redonda') redonda(9); else postigo(3, true);
  if (vd === 'redonda') redonda(38); else postigo(33, false);

  // Puerta de madera en arco: tablas, vetas curvas, vitral redondo y pomo redondo
  ovalo(x + 24, y + W + 10, 6, 5, o); p(o, 18, W + 10, 12, B - W - 10);
  ovalo(x + 24, y + W + 10, 5, 4, P.madera); p(P.madera, 19, W + 10, 10, B - W - 11);
  p(P.maderaSombra, 21, W + 7, 1, B - W - 8); p(P.maderaSombra, 24, W + 6, 1, B - W - 7); p(P.maderaSombra, 27, W + 7, 1, B - W - 8);
  p(P.maderaLuz, 19, W + 9, 1, B - W - 11);
  p(P.veta, 22, W + 15); p(P.veta, 23, W + 16, 1, 2); p(P.veta, 22, W + 18);
  p(P.veta, 26, W + 19); p(P.veta, 25, W + 20, 1, 2); p(P.veta, 26, W + 22);
  if (e.simbolo) {                                       // el simbolo del vecino tallado en una placa redonda
    ovalo(x + 24, y + W + 11, 4, 4, o); ovalo(x + 24, y + W + 11, 3, 3, P.maderaSombra);
    mapaBits(SIMBOLOS[e.simbolo], x + 22, y + W + 9, COLOR.mantequilla);
  } else {                                               // vitral redondo de cuatro colores
    ovalo(x + 24, y + W + 11, 3, 3, o);
    p('#F7A6B4', 22, W + 9, 2, 2); p('#FFE08A', 24, W + 9, 2, 2); p('#9ED9C5', 22, W + 11, 2, 2); p('#C9A7D8', 24, W + 11, 2, 2);
    p(o, 22, W + 9); p(o, 25, W + 9); p(o, 22, W + 12); p(o, 25, W + 12);
    if (noche) tenue(0.5, () => p('#FFFFFF', 23, W + 10, 2, 2));
  }
  p(o, 26, W + 17, 3, 3); p(P.laton, 26, W + 17, 2, 2); p('#FFF3B0', 26, W + 17);
  if (e.encima === 'toldo') {                            // toldito de rayas con el borde ondulado
    p(o, 16, W + 1, 16, 3);
    for (let k = 0; k < 14; k++) p(k % 4 < 2 ? e.toldo : '#FFF4E0', 17 + k, W + 2, 1, 1);
    for (let k = 0; k < 5; k++) { p(o, 16 + k * 3, W + 4, 3, 1); p(k % 2 ? '#FFF4E0' : e.toldo, 17 + k * 3, W + 3, 2, 1); p(o, 16 + k * 3, W + 3); }
    p(o, 31, W + 3);
    tenue(0.35, () => p(o, 19, W + 5, 10, 1));
  } else {                                               // tejadillo de tejas sobre la puerta, con dos escuadras
    p(o, 16, W + 1, 16, 4);
    for (let k = 0; k < 14; k += 2) { p(teja.base, 17 + k, W + 2, 2, 1); p(teja.luz, 17 + k, W + 2); p(teja.sombra, 17 + k, W + 3, 2, 1); }
    p(o, 17, W + 5, 1, 2); p(o, 30, W + 5, 1, 2); p(o, 18, W + 5); p(o, 29, W + 5);
    tenue(0.35, () => p(o, 19, W + 5, 10, 1));
  }
  if (e.farol) {                                         // farolillo colgado junto a la puerta
    p(o, 30, W + 6, 3, 1); p(o, 31, W + 7);
    p(o, 30, W + 8, 3, 5); p(noche ? P.nocheLuz : '#FFE9B0', 31, W + 9, 1, 3); p(o, 29, W + 8, 5, 1);
  }

  // Tejado: tejas redondeadas en hileras al tresbolillo (variadas, con algo de musgo), cumbrera, canto y alero
  p(o, -2, R, 53, 1); p(o, -3, R + 1, 55, W - R - 2);
  for (let j = 0; j < 5; j++) {
    const y0 = R + 4 + j * 4, desfase = (j % 2) * 2;
    for (let tx = -2 - desfase, n = 0; tx < 51; tx += 4, n++) {
      const a = Math.max(-2, tx), b = Math.min(50, tx + 4), w = b - a;
      if (w <= 0) continue;
      const r = az(200 + j * 20 + n);
      p(r < 0.12 ? teja.clara : r < 0.24 ? teja.oscura : teja.base, a, y0, w, 3);
      p(teja.sombra, a, y0 + 3, w, 1);
      if (tx >= -2) { p(teja.honda, tx, y0 + 3); p(teja.sombra, tx, y0, 1, 3); }
      if (tx + 1 >= -2 && tx + 2 <= 50) p(teja.luz, tx + 1, y0, 2, 1);
      if (r > 0.975) { p(P.musgo, a + 1, y0 + 2, 2, 1); p(P.hojaSombra, a + 1, y0 + 3); }
    }
  }
  p(teja.honda, -2, R + 1, 53, 3);                                                     // cumbrera
  for (let k = 0; k < 13; k++) { p(teja.sombra, -1 + k * 4, R + 1, 3, 2); p(teja.luz, -1 + k * 4, R + 1); }
  p(teja.honda, 49, R + 4, 2, W - R - 7);                                              // canto del tejado
  p(P.madera, -2, W - 3, 53, 1); p(P.maderaSombra, -2, W - 2, 53, 1);                  // alero
  for (let k = 0; k < 13; k++) p(P.maderaLuz, k * 4, W - 3, 2, 1);

  // Buhardilla con su ventanita redonda (bx = su columna central)
  if (e.buhardilla !== null) {
    const bx = e.buhardilla;
    for (let j = 0; j < 7; j++) {
      const w = 2 * j + 2, izq = bx - j;
      p(o, izq, R + 2 + j, w, 1);
      if (j > 0) p(j % 2 ? teja.sombra : teja.base, izq + 1, R + 2 + j, w - 2, 1);
    }
    p(o, bx - 6, R + 8, 14, 1); p(o, bx - 5, R + 9, 12, 7); p(e.pared === 'piedra' ? P.piedra : e.color, bx - 4, R + 9, 10, 6);
    ovalo(x + bx + 1, y + R + 12, 3, 3, o); ovalo(x + bx + 1, y + R + 12, 2, 2, cristal);
    p(brillo, bx, R + 10);
    p(teja.honda, bx - 5, R + 16, 12, 1);
  }

  // Chimenea de ladrillos irregulares, con su sombra sobre las tejas y humo
  if (e.chimenea !== null) {
    const cx = e.chimenea;
    tenue(0.35, () => { p(teja.honda, cx + 8, R + 3, 3, 7); p(teja.honda, cx + 11, R + 6, 2, 4); });
    p(o, cx, R - 7, 8, 16); p(P.mortero, cx + 1, R - 6, 6, 14);
    for (let m = 0; m < 5; m++) {
      const by = R - 5 + m * 3;
      for (let bx = cx + 1 - (m % 2) * 2, n = 0; bx < cx + 7; bx += 4, n++) {
        const a = Math.max(cx + 1, bx), b = Math.min(cx + 7, bx + 3);
        if (b > a) p(az(400 + m * 5 + n) < 0.35 ? P.ladrilloSombra : P.ladrillo, a, by, b - a, 2);
      }
    }
    tenue(0.22, () => p(o, cx + 5, R - 6, 2, 14));
    p(o, cx - 1, R - 9, 10, 3); p(P.ladrilloSombra, cx, R - 8, 8, 1); p('#6E5268', cx + 1, R - 9, 6, 1);
    const bolitas = e.horno ? 7 : 5;                     // el horno de Miel echa mas humo
    for (let i = 0; i < bolitas; i++) {
      const k = (t * (e.horno ? 0.3 : 0.2) + i / bolitas) % 1, r = 1 + Math.round(k * (e.horno ? 4 : 3));
      const sx = x + cx + 4 + Math.round(Math.sin(k * 5 + i) * 1.5 + k * 8), sy = y + R - 11 - Math.round(k * 26);
      tenue((1 - k) * 0.85, () => { ovalo(sx, sy, r + 1, r + 1, '#D9C6E8'); ovalo(sx, sy - 1, r, r, '#FFFFFF'); });
    }
  }

  // Delante: extras de cada casa, felpudo, piedritas, matojos y arbustos en las esquinas
  if (e.extra === 'regadera') {                          // regadera de Copito junto a la puerta
    p(o, 31, B - 7, 7, 6); p('#A9D8E8', 32, B - 6, 5, 4); p('#E4F4FA', 32, B - 6, 2, 1);
    p(o, 37, B - 9, 1, 3); p(o, 38, B - 10, 2, 1); p(o, 33, B - 9, 3, 1); p(o, 32, B - 8); p(o, 36, B - 8);
  } else if (e.extra === 'salvavidas') {                 // salvavidas apoyado en la esquina de Nenufar
    ovalo(x + 41, y + B - 3, 5, 5, o); ovalo(x + 41, y + B - 3, 4, 4, '#FFFFFF');
    p('#F28CA0', 37, B - 4, 2, 2); p('#F28CA0', 43, B - 4, 2, 2); p('#F28CA0', 40, B - 7, 2, 2); p('#F28CA0', 40, B - 1, 2, 2);
    ovalo(x + 41, y + B - 3, 2, 2, o); ovalo(x + 41, y + B - 3, 1, 1, P.piedraSombra);
  } else if (e.extra === 'sacos') {                      // sacos de harina de Miel
    for (const [sx, sy] of [[31, 0], [36, 1]]) {
      p(o, sx, B - 8 + sy, 6, 7 - sy); p('#F3E3CC', sx + 1, B - 7 + sy, 4, 5 - sy); p('#FFF8EA', sx + 1, B - 7 + sy, 2, 1);
      p(o, sx + 2, B - 9 + sy, 2, 1); p('#E8A85C', sx + 2, B - 5 + sy, 2, 1);
    }
  }
  p(o, 18, B, 12, 4); p(P.felpudo, 19, B + 1, 10, 2); p(mezclarColor(base, '#F28CA0', 0.5), 21, B + 1, 1, 2); p(mezclarColor(base, '#F28CA0', 0.5), 26, B + 1, 1, 2);
  for (const [px, py] of [[13, 1], [33, 0], [41, 1], [6, 2]]) { p(P.piedraSombra, px, B + py, 3, 2); p(P.piedraLuz, px, B + py, 2, 1); }
  for (const gx of [5, 12, 34, 39, 44]) { p(P.hoja, gx, B - 2, 1, 2); p(P.hojaSombra, gx + 1, B - 1); p(P.hoja, gx - 1, B - 1); }
  const arbusto = (cx, cy, r, flor) => {
    ovalo(x + cx, y + cy, r + 1, r, o); ovalo(x + cx, y + cy, r, r - 1, P.hojaSombra); ovalo(x + cx - 1, y + cy - 1, r - 1, r - 2, P.hoja);
    p(P.hojaLuz, cx - 2, cy - r + 2, 2, 1);
    p(flor, cx + 1, cy - 2); p(flor, cx - 3, cy); p(flor, cx + 2, cy + 1);
  };
  arbusto(-1, B - 2, 5, flores[0]);
  arbusto(50, B - 1, 4, '#FFFFFF');
}

// Ovalo pixelado relleno (fila a fila), para la fuente.
function ovalo(cx, cy, rx, ry, color) {
  ctx.fillStyle = color;
  for (let j = -ry; j < ry; j++) {
    const media = Math.round(rx * Math.sqrt(1 - ((j + 0.5) / ry) ** 2));
    ctx.fillRect(Math.round(cx - media), Math.round(cy + j), media * 2, 1);
  }
}
// Adoquines del pueblo: piedras de ancho variable en hileras de 4 px. Las juntas horizontales siguen de una casilla a
// otra y las verticales no, asi no se ve la cuadricula. Hay VARIANTES_ADOQUIN cuadros sorteados por casilla, con
// piedras de otros tonos (arena, rosada, lila), alguna rota y hierba en las juntas; junto al cesped la plaza se gasta
// (asoma la tierra y crecen brotes) y en las zonas mas pisadas (ruidoPradera) la piedra es un poco mas oscura.
const PIEDRA = { luz: '#FFF8EA', base: '#F3E3CC', arena: '#EBD5B5', rosa: '#F2D6CC', lila: '#E6DCE6', junta: '#E0CAB4', borde: '#E6D1BC', sombra: '#CDB49F', honda: '#B89C8C', tierra: '#D9BE9C' };
const VARIANTES_ADOQUIN = 8;
const adoquines = [];
function piedraAdoquin(a, x, y, w, color, rota) {
  a.fillStyle = color; a.fillRect(x, y, w, 3);
  a.fillStyle = PIEDRA.luz; a.fillRect(x + 1, y, Math.min(2, w - 2), 1);          // brillito arriba a la izquierda
  a.fillStyle = PIEDRA.borde; a.fillRect(x + w - 2, y + 2, 2, 1);                // sombra suave abajo a la derecha
  a.fillStyle = PIEDRA.junta; a.fillRect(x, y, 1, 1); a.fillRect(x + w - 1, y + 2, 1, 1);   // esquinas redondeadas
  if (rota) { a.fillStyle = PIEDRA.honda; a.fillRect(x + 2, y, 1, 1); a.fillRect(x + 3, y + 1, 1, 1); a.fillRect(x + 3, y + 2, 1, 1); }
}
function cuadroAdoquin(n) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = T;
  const a = cv.getContext('2d'), rnd = i => azar(n * 7 + 3, i, 90 + n);
  a.fillStyle = PIEDRA.junta; a.fillRect(0, 0, T, T);
  for (let j = 0; j < 4; j++) {
    let x = -Math.floor(rnd(j * 20) * 6), i = 0;
    while (x < T) {
      const w = 4 + Math.floor(rnd(j * 20 + i + 1) * 4), r = rnd(j * 20 + i + 50);
      const color = r < 0.58 ? PIEDRA.base : r < 0.74 ? PIEDRA.arena : r < 0.88 ? PIEDRA.rosa : PIEDRA.lila;
      piedraAdoquin(a, x, j * 4, w, color, rnd(j * 20 + i + 80) < 0.08);
      x += w + 1; i++;
    }
  }
  if (n % 3 === 0) {                                // brotes de hierba entre las juntas
    a.fillStyle = '#9CC98A';
    for (let k = 0; k < 3; k++) { const hx = Math.floor(rnd(200 + k) * 14) + 1, hy = Math.floor(rnd(210 + k) * 4) * 4 + 3; a.fillRect(hx, hy, 2, 1); a.fillRect(hx + (k % 2), hy - 1, 1, 1); }
  }
  return cv;
}
function dibujarAdoquin(c, f) {
  if (!adoquines.length) for (let n = 0; n < VARIANTES_ADOQUIN; n++) adoquines.push(cuadroAdoquin(n));
  const x = c * T, y = f * T;
  ctx.drawImage(adoquines[Math.floor(azar(c, f, 60) * VARIANTES_ADOQUIN)], x, y);
  const pisado = ruidoPradera(c, f);
  if (pisado > 0.6) { ctx.globalAlpha = Math.min(0.16, (pisado - 0.6) * 0.8); ctx.fillStyle = '#B08E74'; ctx.fillRect(x, y, T, T); ctx.globalAlpha = 1; }
  // Junto al cesped, la plaza se gasta: faltan piedras, asoma la tierra y crece la hierba.
  [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dc, df], i) => {
    const t = tile(c + dc, f + df);
    if (t !== 'G' && t !== 'F') return;
    for (let k = 0; k < 2; k++) {
      if (azar(c, f, 70 + i * 4 + k) < 0.35) continue;
      const a = 2 + Math.floor(azar(c, f, 80 + i * 4 + k) * 10), w = 3 + Math.floor(azar(c, f, 90 + i + k) * 3);
      const [px, py] = [[a, 1], [T - 4, a], [a, T - 4], [1, a]][i];
      ctx.fillStyle = PIEDRA.tierra; ctx.fillRect(x + px, y + py, dc ? 3 : w, dc ? w : 3);
      ctx.fillStyle = '#9CC98A'; ctx.fillRect(x + px + (dc ? 1 : 1), y + py + (dc ? 1 : 1), 1, 1);
    }
  });
}
// Adoquines sueltos en el cesped que rodea la plaza (como si el camino se deshiciera poco a poco).
function dibujarSueltas(cx, cy) {
  for (const s of sueltas) {
    if (!enVista(s.x, s.y, cx, cy)) continue;
    ctx.fillStyle = PIEDRA.sombra; ctx.fillRect(s.x, s.y + 1, 5, 3);
    ctx.fillStyle = s.color; ctx.fillRect(s.x, s.y, 5, 3);
    ctx.fillStyle = PIEDRA.luz; ctx.fillRect(s.x + 1, s.y, 3, 1);
  }
}

// Fuente de la plaza (3x3) con volumen: pila grande de bloques de piedra con musgo en la base, pedestal tallado,
// taza de en medio de la que cae una cortina de agua, tacita de arriba con su surtidor y un pajarito en el borde.
function dibujarFuente(x, y) {
  const cx = x + 24, t = estado.reloj, P = PIEDRA;
  // Pila grande: silueta, cara delantera alta (con bloques) y borde de arriba
  ovalo(cx, y + 34, 24, 10, COLOR.ciruela);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(cx - 24, y + 34, 48, 9); ovalo(cx, y + 43, 24, 5, COLOR.ciruela);
  ovalo(cx, y + 42, 23, 4, P.sombra); ctx.fillStyle = P.sombra; ctx.fillRect(cx - 23, y + 34, 46, 8);
  ctx.fillStyle = P.base; ctx.fillRect(cx - 23, y + 34, 46, 3);
  ctx.fillStyle = P.honda;                                         // juntas de los bloques (mas juntas hacia los lados)
  for (const a of [-0.85, -0.55, -0.2, 0.2, 0.55, 0.85]) { const bx = Math.round(cx + Math.sin(a * Math.PI / 2) * 23); ctx.fillRect(bx, y + 37, 1, 5); }
  ctx.fillRect(cx - 23, y + 37, 46, 1);
  ctx.fillStyle = '#8FC98A';                                       // musgo en la base
  for (const [mx, w] of [[-21, 6], [-9, 4], [6, 5], [17, 5]]) { ctx.fillRect(cx + mx, y + 43, w, 1); ctx.fillRect(cx + mx + 1, y + 42, w - 2, 1); }
  ctx.fillStyle = '#5E9E6E'; for (const mx of [-19, -8, 8, 19]) ctx.fillRect(cx + mx, y + 44, 2, 1);
  ovalo(cx, y + 33, 23, 9, P.base); ovalo(cx, y + 32, 22, 8, P.luz); ovalo(cx, y + 33, 21, 7, P.base);
  // El agua: mas honda al fondo, ondas que se abren desde la cortina y destellos
  ovalo(cx, y + 34, 19, 6, COLOR.ciruela); ovalo(cx, y + 34, 18, 5, '#8CC7DE'); ovalo(cx, y + 35, 17, 4, COLOR.cielo);
  ctx.fillStyle = '#E4F4FA';
  for (let i = 0; i < 2; i++) {
    const k = (t * 0.5 + i / 2) % 1, rx = Math.round(10 + k * 7), ry = Math.round(2 + k * 2);
    ctx.globalAlpha = 1 - k;
    ctx.fillRect(cx - rx, y + 35, 2, 1); ctx.fillRect(cx + rx - 2, y + 35, 2, 1); ctx.fillRect(cx - 3, y + 35 + ry, 6, 1);
  }
  ctx.globalAlpha = 1;
  if (Math.sin(t * 3) > 0.6) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(cx + 12, y + 33, 1, 1); ctx.fillRect(cx - 14, y + 37, 1, 1); }
  // Pedestal tallado y taza de en medio (con su cara delantera)
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(cx - 5, y + 17, 10, 18);
  ctx.fillStyle = P.base; ctx.fillRect(cx - 4, y + 18, 8, 17); ctx.fillStyle = P.sombra; ctx.fillRect(cx + 2, y + 18, 2, 17);
  ctx.fillStyle = P.honda; ctx.fillRect(cx - 4, y + 27, 8, 1); ctx.fillStyle = P.luz; ctx.fillRect(cx - 4, y + 26, 8, 1);
  ovalo(cx, y + 18, 15, 5, COLOR.ciruela); ctx.fillStyle = COLOR.ciruela; ctx.fillRect(cx - 15, y + 18, 30, 3); ovalo(cx, y + 21, 14, 3, COLOR.ciruela);
  ctx.fillStyle = P.sombra; ctx.fillRect(cx - 14, y + 18, 28, 3); ovalo(cx, y + 21, 13, 2, P.sombra);
  ovalo(cx, y + 17, 14, 4, P.base); ovalo(cx, y + 17, 11, 3, COLOR.ciruela); ovalo(cx, y + 17, 10, 2, COLOR.cielo);
  // Cortina de agua que rebosa por delante de la taza hasta la pila, con brillos que bajan y espuma abajo
  for (let i = -12; i <= 12; i++) {
    for (let j = 0; j < 12; j++) {
      const brillo = (j + Math.floor(t * 14) + Math.abs(i) * 2) % 7 === 0;
      ctx.globalAlpha = brillo ? 0.85 : 0.35;
      ctx.fillStyle = brillo ? '#FFFFFF' : '#CDEBF5';
      ctx.fillRect(cx + i, y + 21 + j + (Math.abs(i) > 10 ? 1 : 0), 1, 1);
    }
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#FFFFFF';
  for (let i = -12; i <= 12; i += 3) if ((Math.floor(t * 8) + i) % 2) ctx.fillRect(cx + i, y + 32 + ((i + Math.floor(t * 6)) % 2), 2, 1);
  // Columna y tacita de arriba con el surtidor
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(cx - 3, y + 7, 6, 11); ctx.fillStyle = P.base; ctx.fillRect(cx - 2, y + 8, 4, 10); ctx.fillStyle = P.sombra; ctx.fillRect(cx + 1, y + 8, 1, 10);
  ovalo(cx, y + 7, 8, 3, COLOR.ciruela); ovalo(cx, y + 6, 7, 2, P.base); ovalo(cx, y + 6, 5, 1, COLOR.cielo);
  ctx.fillStyle = '#E4F4FA';
  const sube = Math.round(Math.sin(t * 6));
  ctx.fillRect(cx - 1, y - 2 + sube, 2, 8); ctx.fillRect(cx - 2, y - 2 + sube, 4, 1);
  for (let i = 0; i < 6; i++) {                                    // gotitas del surtidor a la taza
    const p = (t * 1.3 + i / 6) % 1, lado = i % 2 ? 1 : -1;
    ctx.fillRect(Math.round(cx + lado * (2 + p * 7)), Math.round(y - 1 + p * p * 16 - Math.sin(p * Math.PI) * 4), 1, 1);
  }
  dibujarPajarito(cx - 20, y + 31, 1);                             // un pajarito bebiendo en el borde
}
// Anillo de azulejos alrededor de la fuente (en vez de la roseta plana): dos hileras de azulejos pastel con su
// junta, luz arriba y sombra abajo, para que tengan relieve.
function dibujarRoseta() {
  const cx = FUENTE.c * T + 24, cy = FUENTE.f * T + 36;
  const hileras = [[36, 52, ['#F7C6D0', '#FFF4E0']], [42, 60, ['#C4EADC', '#FFE9B0', '#CDE6F2', '#FFE9B0']]];
  for (const [r, n, colores] of hileras) {
    for (let a = 0; a < n; a++) {
      const ang = a / n * Math.PI * 2, x = Math.round(cx + Math.cos(ang) * r) - 2, y = Math.round(cy + Math.sin(ang) * r * 0.7) - 1;
      ctx.fillStyle = PIEDRA.sombra; ctx.fillRect(x - 1, y - 1, 6, 5);
      ctx.fillStyle = colores[a % colores.length]; ctx.fillRect(x, y, 4, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(x, y, 3, 1);
      ctx.fillStyle = 'rgba(74,51,71,0.18)'; ctx.fillRect(x + 1, y + 2, 3, 1);
    }
  }
}
// Macetero redondo de piedra con flores que se mecen (rodean la fuente).
function dibujarMacetero(x, y, i) {
  const v = viento(x, y, 1.8), flores = [['#F7A6B4', '#FFE08A'], ['#C9B6E4', '#FFF4E0'], ['#FFE08A', '#F28CA0'], ['#A9D8E8', '#F7C6D0']][i % 4];
  ovalo(x + 8, y + 13, 8, 3, COLOR.ciruela); ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x, y + 8, 16, 5); ovalo(x + 8, y + 8, 8, 3, COLOR.ciruela);
  ctx.fillStyle = PIEDRA.sombra; ctx.fillRect(x + 1, y + 8, 14, 5); ovalo(x + 8, y + 13, 7, 2, PIEDRA.sombra);
  ctx.fillStyle = PIEDRA.base; ctx.fillRect(x + 1, y + 8, 14, 2); ctx.fillStyle = PIEDRA.luz; ctx.fillRect(x + 2, y + 8, 5, 1);
  ovalo(x + 8, y + 7, 7, 2, '#7A5240');                           // tierra
  ctx.fillStyle = '#5E9E6E'; for (const hx of [3, 7, 11]) ctx.fillRect(x + hx + v, y + 1, 1, 6);
  ctx.fillStyle = '#8FC98A'; ctx.fillRect(x + 2 + v, y + 4, 3, 2); ctx.fillRect(x + 10 + v, y + 3, 3, 2);
  for (const [fx, fy, k] of [[2, 0, 0], [6, -2, 1], [10, 0, 0], [8, 2, 1], [4, 3, 1]]) {
    ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + fx + v - 1, y + fy - 1, 4, 4);
    ctx.fillStyle = flores[k]; ctx.fillRect(x + fx + v, y + fy, 2, 2);
  }
}
// Banco con cojin: de lado (mira 1 o -1, respaldo curvo de hierro con voluta) o de frente (mira 0, respaldo de madera
// tallada con la parte de arriba en arco). cojin = color pastel.
function dibujarBanco(x, y, mira, cojin = '#F7C6D0') {
  const r = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(x + rx, y + ry, w, h); };
  if (mira === 0) {
    r(COLOR.ciruela, 1, -1, 14, 10); r(COLOR.ciruela, 3, -3, 10, 2); r(COLOR.ciruela, 5, -4, 6, 1);   // respaldo en arco
    r(MADERA.tabla, 2, 0, 12, 8); r(MADERA.tabla, 4, -2, 8, 2); r(MADERA.brillo, 4, -2, 8, 1);
    r(MADERA.junta, 5, 0, 1, 8); r(MADERA.junta, 10, 0, 1, 8); r(COLOR.mantequilla, 7, 1, 2, 2);    // tallado: corazoncito
    r(COLOR.ciruela, 0, 8, 16, 5); r(MADERA.tabla, 1, 9, 14, 3); r(MADERA.brillo, 1, 9, 14, 1);       // asiento
    r(COLOR.ciruela, 3, 5, 10, 4); r(cojin, 4, 6, 8, 2); r('#FFFFFF', 4, 6, 3, 1);                   // cojin
    r(COLOR.ciruela, 1, 13, 2, 3); r(COLOR.ciruela, 13, 13, 2, 3);
    return;
  }
  const m = rx => mira > 0 ? rx : 15 - rx;                                // dibujado mirando a la derecha y en espejo
  const p = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(x + (mira > 0 ? rx : 16 - rx - w), y + ry, w, h); };
  p(COLOR.ciruela, 1, 7, 14, 5); p(MADERA.tabla, 2, 8, 12, 3); p(MADERA.brillo, 2, 8, 12, 1); p(MADERA.junta, 2, 10, 12, 1);   // asiento
  p(COLOR.ciruela, 4, 4, 9, 4); p(cojin, 5, 5, 7, 2); p('#FFFFFF', 5, 5, 2, 1);                                                // cojin
  p(COLOR.ciruela, 2, 12, 2, 3); p(COLOR.ciruela, 12, 12, 2, 3); p(COLOR.ciruela, 1, 14, 1, 1); p(COLOR.ciruela, 14, 14, 1, 1); // patas curvas
  p(COLOR.ciruela, 1, -1, 2, 9);                                                                                                // respaldo de hierro
  for (const [vx, vy] of [[2, -3], [3, -3], [4, -2], [4, -1], [3, 0], [3, -1]]) p(COLOR.ciruela, vx, vy, 1, 1);                // voluta
  p(COLOR.ciruela, 3, 3, 2, 1); p(COLOR.ciruela, 4, 2, 1, 1);
  void m;
}
// Tablon de pedidos vivo: tejadito, corcho con papelitos de colores superpuestos y chinchetas, uno que se mueve con
// la brisa y una enredadera que baja por el poste.
function dibujarTablon(x, y) {
  const r = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 0, -4, 3, 20); r(COLOR.ciruela, 13, -4, 3, 20); r(MADERA.tabla, 1, -3, 1, 18); r(MADERA.tabla, 14, -3, 1, 18);
  r(COLOR.ciruela, -3, -15, 22, 13); r('#D9A877', -2, -14, 20, 11);                       // corcho
  r('#C49163', -2, -14, 20, 1); for (const [cx, cy] of [[1, -12], [8, -8], [15, -11], [4, -5]]) r('#C49163', cx, cy, 1, 1);
  r(COLOR.ciruela, -5, -19, 26, 4); r('#E87F86', -4, -18, 24, 2); r('#F7A6B4', -4, -18, 24, 1);   // tejadito
  r(COLOR.ciruela, -1, -21, 18, 2); r('#E87F86', 0, -20, 16, 1);
  const v = viento(x, y, 2.4) > 0 ? 1 : 0;
  const notas = [[-1, -13, '#FFF4E0', '#F28CA0'], [4, -12, '#FFE3EA', '#9ED9C5'], [10, -13, '#E3F0D9', '#FFE08A'], [13, -9, '#FFF1B8', '#F28CA0'], [1, -8, '#DDEBF7', '#C9B6E4'], [7, -7, '#FFE3EA', '#A9D8E8']];
  notas.forEach(([nx, ny, color, chincheta], i) => {
    const mueve = i === 3 ? v : 0;
    r(COLOR.ciruela, nx, ny, 6, 7); r(color, nx + 1, ny + 1, 4, 5 + mueve);
    r('#B9AFC4', nx + 1, ny + 3, 3, 1); if (i % 2) r('#B9AFC4', nx + 1, ny + 5, 2, 1);
    r(chincheta, nx + 2, ny, 2, 1);
  });
  const hojas = [[-1, -4], [1, -1], [-1, 2], [1, 5], [-1, 8], [1, 11]];   // enredadera por el poste de la izquierda
  hojas.forEach(([hx, hy], i) => {
    const s = viento(x + i * 3, y + hy, 2) > 0 && i % 2 ? 1 : 0;
    r(i % 3 ? '#8FC98A' : '#5E9E6E', hx + s, hy, 2, 2);
  });
  r('#5E9E6E', 1, -6, 1, 18); r('#F7A6B4', -1, 0, 1, 1); r('#FFE08A', 2, 6, 1, 1);
}
// Arbusto redondo con bayas que se mece un poquito.
function dibujarArbustoBayas(x, y, i) {
  const v = viento(x, y, 1.5);
  ovalo(x + 8 + v, y + 9, 8, 7, COLOR.ciruela); ovalo(x + 8 + v, y + 9, 7, 6, '#5E9E6E'); ovalo(x + 7 + v, y + 8, 6, 5, '#7FBF8E'); ovalo(x + 6 + v, y + 6, 3, 2, '#A8D8A0');
  const baya = i % 2 ? '#E8606E' : '#C9B6E4';
  for (const [bx, by] of [[4, 9], [9, 6], [11, 11], [6, 13], [12, 8]]) { ctx.fillStyle = baya; ctx.fillRect(x + bx + v, y + by, 2, 2); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + bx + v, y + by, 1, 1); }
}
// Carrito de flores (2x1) con toldo de rayas, cubos de flores y ruedas.
function dibujarCarrito(x, y) {
  const r = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 4, -14, 2, 22); r(COLOR.ciruela, 26, -14, 2, 22);                                // palos del toldo
  for (let i = 0; i < 30; i++) {                                                                    // toldo de rayas con ondas
    const yy = -18 + (i % 6 < 3 ? 0 : 0);
    r(COLOR.ciruela, 1 + i, yy - 1, 1, 6); r(Math.floor(i / 5) % 2 ? '#FFF4E0' : '#F28CA0', 1 + i, yy, 1, 4);
    if (i % 5 === 2) r(COLOR.ciruela, 1 + i, yy + 5, 1, 1);
  }
  r(COLOR.ciruela, 0, -3, 32, 13); r(MADERA.tabla, 1, -2, 30, 11); r(MADERA.brillo, 1, -2, 30, 1);   // caja del carrito
  for (const jx of [8, 16, 24]) r(MADERA.junta, jx, -2, 1, 11);
  r(COLOR.mantequilla, 14, 2, 4, 3); r('#F28CA0', 15, 3, 2, 1);                                      // cartelito con corazon
  const v = viento(x, y, 2);
  [[3, '#F7A6B4'], [10, '#FFE08A'], [19, '#C9B6E4'], [25, '#FFF4E0']].forEach(([bx, color], i) => {  // cubos con flores
    r(COLOR.ciruela, bx, -8, 6, 6); r(i % 2 ? '#B9AFC4' : '#A9D8E8', bx + 1, -7, 4, 4);
    r('#5E9E6E', bx + 2 + v, -11, 1, 4);
    for (const [fx, fy] of [[0, -12], [3, -11], [1, -14]]) { r(COLOR.ciruela, bx + fx + v, -2 + fy - 1 + 3, 3, 3); r(color, bx + fx + v + 1, fy + 1, 1, 1); }
  });
  for (const wx of [6, 24]) { ovalo(x + wx, y + 12, 4, 4, COLOR.ciruela); ovalo(x + wx, y + 12, 3, 3, MADERA.tabla); r(COLOR.ciruela, wx, 12, 1, 1); }
}
// Caja de libros compartidos: casita de madera sobre un poste, con puerta de cristal y los lomos de colores.
function dibujarLibros(x, y) {
  const r = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 6, 0, 4, 16); r(MADERA.junta, 7, 1, 2, 14);
  for (let i = 0; i < 9; i++) { r(COLOR.ciruela, 8 - i, -19 + i, 1, 2); r(COLOR.ciruela, 7 + i, -19 + i, 1, 2); r('#9ED9C5', 8 - i + 1, -18 + i, Math.max(0, 2 * i - 1), 1); }
  r(COLOR.ciruela, 1, -11, 14, 12); r(MADERA.tabla, 2, -10, 12, 10);
  r(COLOR.ciruela, 3, -9, 10, 8); r('#E4F4FA', 4, -8, 8, 6);
  ['#F28CA0', '#FFE08A', '#A9D8E8', '#C9B6E4', '#9ED9C5', '#F7A6B4'].forEach((color, i) => r(color, 4 + i + (i > 2 ? 1 : 0), -8 + (i % 2), 1, 6 - (i % 2)));
  r('#FFFFFF', 4, -8, 1, 2);
  r('#F28CA0', 7, -14, 2, 1); r('#F28CA0', 6, -15, 1, 1); r('#F28CA0', 9, -15, 1, 1);                // corazon sobre la puerta
}
// Palomas que picotean migas en la plaza. Si la gatita se acerca, echan a volar y vuelven al rato.
function actualizarPalomas(dt) {
  if (!PALOMAS.length || !enPueblo(casillaActual().f)) return;
  const g = estado.gata;
  for (const p of PALOMAS) {
    p.t += dt;
    if (!p.vuela && Math.hypot(g.x + 8 - p.x, g.y + 12 - p.y) < 26) {
      p.vuela = 1; p.t = 0; p.mira = p.x > g.x + 8 ? 1 : -1; sonar('recoger');
    }
    if (p.vuela === 1) {                      // se van volando hacia arriba
      p.x += p.mira * 50 * dt; p.y -= 60 * dt;
      if (p.t > 4 + (p.hx % 3)) { p.vuela = 2; p.t = 0; p.x = p.hx - p.mira * 80; p.y = p.hy - 90; }
    } else if (p.vuela === 2) {               // y vuelven planeando a su sitio
      p.x += (p.hx - p.x) * Math.min(1, dt * 2); p.y += (p.hy - p.y) * Math.min(1, dt * 2);
      if (Math.hypot(p.x - p.hx, p.y - p.hy) < 1) { p.vuela = 0; p.x = p.hx; p.y = p.hy; }
    } else if (Math.random() < dt * 0.3) p.mira = -p.mira;
  }
}
function dibujarPaloma(p, i) {
  const x = Math.round(p.x), y = Math.round(p.y), d = p.mira;
  const r = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(d > 0 ? x + rx : x - rx - w + 1, y + ry, w, h); };
  if (p.vuela) {
    const ala = Math.floor(estado.reloj * 12 + i) % 2 ? -2 : 1;
    r(COLOR.ciruela, -3, -2, 7, 4); r('#D6CEE0', -2, -1, 5, 2); r(COLOR.ciruela, -1, -2 + ala, 4, 2); r('#B9AFC4', 0, -2 + ala, 2, 1);
    return;
  }
  const pica = Math.sin(estado.reloj * 3 + i * 2) > 0.6 ? 2 : 0;          // agacha la cabeza a picotear
  r(COLOR.ciruela, -3, -4, 7, 5); r('#D6CEE0', -2, -3, 5, 3); r('#B9AFC4', -2, -3, 3, 1);   // cuerpo y ala
  r(COLOR.ciruela, -5, -3, 2, 2);                                                            // colita
  r(COLOR.ciruela, 3, -6 + pica, 3, 3); r('#C9C0D3', 4, -5 + pica, 1, 1); r('#9ED9C5', 3, -4 + pica, 1, 1);   // cabeza y cuello brillante
  r('#E8A85C', 6, -5 + pica, 1, 1); r('#E8A85C', 0, 1, 1, 1); r('#E8A85C', 2, 1, 1, 1);                    // pico y patitas
}
function dibujarBandada(x0, y0) {
  if (oscuridad(estado.hora) > 0.5 || llueve()) return;
  ctx.fillStyle = '#E8C48A';                                                  // migas
  for (let k = 0; k < 8; k++) ctx.fillRect(x0 + 6 + Math.floor(azar(k, 3, 7) * 36), y0 + 8 + Math.floor(azar(k, 4, 7) * 6), 1, 1);
  PALOMAS.forEach((p, i) => { if (!p.vuela) dibujarPaloma(p, i); });
}
function dibujarPalomasVolando() {
  if (oscuridad(estado.hora) > 0.5 || llueve()) return;
  PALOMAS.forEach((p, i) => { if (p.vuela) dibujarPaloma(p, i); });
}
// Las sombras se alargan hacia un lado u otro segun la hora: por la manana hacia el oeste, por la tarde hacia el este.
const desvioSombra = () => oscuridad(estado.hora) > 0.5 ? 0 : Math.round(Math.max(-4, Math.min(4, (estado.hora - 0.32) * 14)));
// Farola del pueblo: poste ciruela con un farolillo mantequilla arriba.
function dibujarFarola(x, y) {
  const r = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 6, -10, 4, 25); r('#8E7A8C', 7, -9, 2, 23);
  r(COLOR.ciruela, 4, -19, 8, 10); r(oscuridad(estado.hora) > 0.4 ? COLOR.mantequilla : '#FFF4E0', 5, -18, 6, 8);
  r(COLOR.ciruela, 5, -21, 6, 2); r(COLOR.ciruela, 4, 14, 8, 2);
}
// Farolillo de papel colgado de un palo, junto al camino del pueblo.
function dibujarFarolillo(x, y) {
  const r = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(x + rx, y + ry, w, h); };
  const v = viento(x, y, 1.4);
  r(COLOR.ciruela, 7, -8, 2, 22); r(COLOR.ciruela, 7, -8, 6, 2);
  r(COLOR.ciruela, 9 + v, -6, 6, 9); r(oscuridad(estado.hora) > 0.4 ? COLOR.mantequilla : '#F7C6D0', 10 + v, -5, 4, 7);
  r('#F28CA0', 10 + v, -3, 4, 1);
}
// Arco de flores sobre el camino (ancho en casillas, con un poste en cada punta) y banderitas colgando.
function dibujarArco(x, y, ancho) {
  const w = ancho * T, r = (color, rx, ry, ww, h) => { ctx.fillStyle = color; ctx.fillRect(x + rx, y + ry, ww, h); };
  for (const px of [4, w - 12]) { r(COLOR.ciruela, px, -26, 8, 41); r(MADERA.tabla, px + 1, -25, 6, 39); r(MADERA.brillo, px + 1, -25, 1, 39); }
  for (let i = 0; i < w - 8; i++) {                                     // la curva de arriba
    const yy = -30 - Math.round(Math.sin(i / (w - 8) * Math.PI) * 8);
    r(COLOR.ciruela, 4 + i, yy - 1, 1, 6); r(MADERA.tabla, 4 + i, yy, 1, 4);
    if (i % 5 === 2) { r(i % 10 === 2 ? '#F7A6B4' : '#FFE08A', 4 + i - 1, yy - 2, 3, 3); r(COLOR.crema, 4 + i, yy - 1, 1, 1); }
  }
  const colores = ['#F7A6B4', '#FFE08A', '#C9A7D8', '#A9D8E8'];            // banderitas
  for (let i = 0; i < 7; i++) {
    const bx = 12 + i * (w - 24) / 6, by = -24 + Math.round(Math.sin(i / 6 * Math.PI) * 3) + (viento(x + bx, y, 2) > 0 ? 1 : 0);
    ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + bx - 2, y + by, 5, 1); ctx.fillRect(x + bx - 1, y + by + 4, 3, 1); ctx.fillRect(x + bx, y + by + 5, 1, 1);
    ctx.fillStyle = colores[i % 4]; ctx.fillRect(x + bx - 1, y + by + 1, 3, 3);
  }
}
// Poste indicador: tabla con una casita y una flecha hacia el pueblo.
function dibujarPoste(x, y) {
  const r = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 6, -4, 4, 19); r(MADERA.junta, 7, -3, 2, 17);
  r(COLOR.ciruela, 0, -14, 16, 11); r(MADERA.tabla, 1, -13, 14, 9);
  mapaBits(['..#..', '.###.', '#####', '.#.#.', '.###.'], x + 2, y - 11, '#E87F86');   // casita
  mapaBits(['..#..', '.###.', '#.#.#', '..#..', '..#..'], x + 9, y - 11, COLOR.ciruela);  // flecha hacia arriba
}
// Trozo de vallita blanca: dos travesanos que se unen con los trozos de al lado y tres tablillas con punta.
function dibujarValla(x, y) {
  const c = x / T, f = y / T, hay = dc => VALLAS.has((c + dc) + ',' + f);
  const r = (color, rx, ry, w, h) => { ctx.fillStyle = color; ctx.fillRect(x + rx, y + ry, w, h); };
  const blanco = '#FFF4E0', sombra = '#E6D3C0', x0 = hay(-1) ? 0 : 2, x1 = hay(1) ? 16 : 14;
  for (const ry of [6, 10]) { r(COLOR.ciruela, x0, ry, x1 - x0, 3); r(blanco, x0, ry + 1, x1 - x0, 1); }
  for (const px of [2, 7, 12]) { r(COLOR.ciruela, px - 1, 2, 4, 13); r(blanco, px, 3, 2, 11); r(sombra, px + 1, 5, 1, 9); r(COLOR.ciruela, px, 1, 2, 1); }
}
// La tiendecita (4x2) vista en 3/4: techo de tela a rayas visto desde arriba (se ensancha hacia delante, con un parche
// cosido y pliegues), faldon de ondas que se mece, cartel de madera con una bellota colgado de un travesano, pared y
// estantes del fondo en la sombra del toldo, Bellota detras del mostrador (parpadea) y el mostrador al sol con la
// tabla de arriba a la vista, balanza, cesta de manzanas y campanilla. Hiedra por el poste izquierdo y un farolillo.
const PINO = { luz: '#FCE9CC', tabla: '#F3D6AE', veta: '#E6C094', canto: '#D4A577', oscuro: '#B98A6E', hondo: '#8E6450' };
function dibujarTienda(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  const O = COLOR.ciruela, t = estado.reloj, noche = oscuridad(estado.hora) > 0.4;
  // Postes de atras (mas cortos y oscuros: estan mas lejos) y pared de tablas del fondo
  r(O, 4, -12, 56, 26);
  for (let i = 0; i < 7; i++) { r(PINO.tabla, 5 + i * 8, -11, 7, 24); r(PINO.veta, 5 + i * 8, -11, 1, 24); }
  for (const px of [5, 56]) { r(O, px - 1, -12, 5, 26); r(PINO.oscuro, px, -11, 3, 24); }
  // Estantes con cositas (en el hueco del centro, Bellota)
  for (const sy of [1, 9]) { r(O, 5, sy, 54, 3); r(PINO.canto, 5, sy, 54, 1); r(PINO.oscuro, 5, sy + 1, 54, 1); }
  tarroMiel(x + 7, y + 1); saquitoEstante(x + 15, y + 1); macetaBrote(x + 43, y + 1); tarroMermelada(x + 51, y + 1);
  cestitaMimbre(x + 6, y + 9); ovilloLana(x + 15, y + 9); regaderita(x + 43, y + 9); botellaConcha(x + 52, y + 9);
  const guino = (t % 4) < 0.15 ? 1 : 0;
  ctx.drawImage(img.tienda_tendera, guino * T, 0, T, T, x + 24, y + 1, T, T);                   // Bellota
  // Sombra del toldo sobre todo lo de dentro (mas fuerte arriba, pegada a la tela)
  ctx.fillStyle = 'rgba(74, 51, 71, 0.16)'; ctx.fillRect(x + 4, y - 12, 56, 26);
  ctx.fillStyle = 'rgba(74, 51, 71, 0.12)'; ctx.fillRect(x + 4, y - 12, 56, 8);
  // Mostrador al sol: tabla de arriba vista desde arriba (con su canto) y frente de tablas con un panel pintado
  r(O, -1, 11, 66, 21);
  r(PINO.luz, 0, 12, 64, 1); r(PINO.tabla, 0, 13, 64, 4); r(PINO.veta, 9, 14, 6, 1); r(PINO.veta, 40, 15, 8, 1);
  r(PINO.canto, 0, 17, 64, 1); r(O, 0, 18, 64, 1);
  r(PINO.tabla, 0, 19, 64, 11); for (let i = 7; i < 64; i += 8) r(PINO.veta, i, 19, 1, 11);
  r(PINO.oscuro, 0, 29, 64, 2);
  r(O, 14, 20, 36, 8); r('#F7C6D0', 15, 21, 34, 6); r('#FFE3EA', 15, 21, 34, 1); r('#E8A0AE', 15, 26, 34, 1);   // panel rosa
  mapaBits(['.#.#.', '#####', '.###.', '..#..'], x + 30, y + 22, '#F28CA0');                                   // corazon tallado
  // Postes de delante, por delante del mostrador, con la hiedra subiendo por el de la izquierda
  for (const px of [-1, 61]) { r(O, px, -8, 4, 40); r(PINO.tabla, px + 1, -7, 2, 38); r(PINO.luz, px + 1, -7, 1, 38); }
  hiedraPoste(x + 1, y + 30);
  // Encima del mostrador: balanza, cesta de manzanas y campanilla
  balanzaPuesto(x + 4, y + 13); cestaManzanas(x + 44, y + 13); campanilla(x + 56, y + 13);
  // Techo de tela visto desde arriba: el borde de atras es mas estrecho que el de delante (perspectiva)
  const filas = 16, y0 = -28;
  for (let j = 0; j < filas; j++) {
    const k = j / (filas - 1), izq = Math.round(6 - k * 10), der = Math.round(58 + k * 10), ancho = der - izq;
    r(O, izq - 1, y0 + j, ancho + 2, 1);
    for (let i = 0; i < ancho; i++) {
      const raya = Math.floor(i / ancho * 8), borde = (i / ancho * 8) % 1;
      let c = raya % 2 ? '#FFF4E0' : '#F28CA0';
      if (borde > 0.85) c = raya % 2 ? '#F2DFD0' : '#E0607E';                                 // pliegue entre rayas
      if (j < 2) c = raya % 2 ? '#FFFBF3' : '#F7A6B4';                                        // el sol en lo alto
      ctx.fillStyle = c; ctx.fillRect(x + izq + i, y + y0 + j, 1, 1);
    }
  }
  r(O, 4, y0 - 1, 56, 1);
  // Parche cosido en una raya del techo
  r(O, 12, -22, 8, 6); r(COLOR.mantequilla, 13, -21, 6, 4); r('#FFF1B8', 13, -21, 6, 1);
  for (const [px, py] of [[13, -22], [16, -22], [19, -20], [13, -17], [17, -17], [12, -19]]) r('#C27A2E', px, py, 1, 1);
  // Faldon de delante: ondas con pliegue (luz a la izquierda, sombra a la derecha) que se mecen con la brisa
  for (let i = 0; i < 8; i++) {
    const sx = -4 + Math.round(i * 72 / 8), w = Math.round((i + 1) * 72 / 8) - Math.round(i * 72 / 8), mece = viento(x + i * 9, y, 2.2) * (i % 2 ? 1 : -1);
    const c = i % 2 ? ['#FFF4E0', '#FFFBF3', '#F2DFD0'] : ['#F28CA0', '#F7A6B4', '#E0607E'];
    r(O, sx, -12, w + 1, 6 + Math.max(0, mece)); r(c[0], sx + 1, -12, w - 1, 4 + Math.max(0, mece));
    r(c[1], sx + 1, -12, 2, 3); r(c[2], sx + w - 2, -12, 1, 4);
    r(O, sx + 2, -7 + Math.max(0, mece), w - 3, 2); r(c[0], sx + 2, -8 + Math.max(0, mece), w - 3, 2);   // la onda de abajo
  }
  r(O, -5, -13, 74, 1);
  // Farolillo colgado de la esquina del toldo (brilla de noche)
  const v = viento(x + 64, y, 1.4);
  r(O, 64, -8, 1, 4); r(O, 62 + v, -4, 5, 7); r(noche ? COLOR.mantequilla : '#FFE3EA', 63 + v, -3, 3, 5); r(O, 63 + v, 3, 3, 1);
  if (noche) r('#FFFBF3', 63 + v, -3, 1, 2);
  // Cartel de madera con una bellota, colgado con cuerdas de un travesano sobre el techo; se balancea
  r(O, 19, -38, 2, 12); r(O, 43, -38, 2, 12); r(O, 17, -39, 30, 3); r(PINO.canto, 18, -38, 28, 1);
  const b = viento(x + 32, y - 40, 1.6);
  r('#C98F6B', 23, -36, 1, 4 + b); r('#C98F6B', 40, -36, 1, 4 - b);
  r(O, 20 + b, -32, 24, 13); r(PINO.tabla, 21 + b, -31, 22, 11); r(PINO.luz, 21 + b, -31, 22, 1); r(PINO.canto, 21 + b, -22, 22, 2);
  mapaBits(['..##..', '.####.', '######', '#.#.##'], x + 29 + b, y - 31, PINO.hondo);                     // gorrito de la bellota
  mapaBits(['.####.', '######', '.####.', '..##..'], x + 29 + b, y - 27, '#E8A85C');                       // la bellota
  r('#FFE08A', 30 + b, -26, 1, 2); r(O, 31 + b, -33, 1, 2);
}
// Cositas de los estantes (x, y = pie del objeto sobre la tabla)
function tarroMiel(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 0, -7, 7, 7); r('#F5C25B', 1, -5, 5, 4); r('#FFF1B8', 1, -5, 1, 2); r(COLOR.crema, 2, -3, 3, 1);
  r(COLOR.ciruela, -1, -8, 9, 3); r('#F7A6B4', 0, -7, 7, 1); r('#FFFBF3', 1, -7, 1, 1); r('#FFFBF3', 4, -7, 1, 1);   // tapita de tela
}
function saquitoEstante(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 0, -6, 7, 6); r(COLOR.ciruela, 1, -8, 5, 2); r('#E3C9A1', 1, -5, 5, 4); r('#F3DDBA', 1, -5, 2, 2);
  r('#C98F6B', 2, -7, 3, 1); r('#E87F86', 3, -8, 1, 1); r('#8FC98A', 3, -3, 1, 1);           // cordel con lazo y una hojita pintada
}
function macetaBrote(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 0, -5, 7, 5); r('#E8936A', 1, -4, 5, 3); r('#F5B48E', 1, -4, 1, 2); r(COLOR.ciruela, -1, -6, 9, 2); r('#E8936A', 0, -6, 7, 1);
  const v = viento(x, y, 2);
  r('#5E9E6E', 3 + v, -9, 1, 3); r('#8FC98A', 1 + v, -10, 2, 2); r('#8FC98A', 4 + v, -11, 2, 2);
}
function tarroMermelada(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 0, -6, 6, 6); r('#E87F86', 1, -5, 4, 4); r('#FFC9D1', 1, -5, 1, 2);
  r(COLOR.ciruela, 0, -7, 6, 1); r('#FFF4E0', 1, -7, 4, 1);
}
function cestitaMimbre(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 1, -10, 1, 4); r(COLOR.ciruela, 7, -10, 1, 4); r(COLOR.ciruela, 2, -11, 5, 1);   // asa
  r(COLOR.ciruela, 0, -6, 9, 6); r('#E2B67A', 1, -5, 7, 4);
  for (let i = 1; i < 8; i += 2) r('#C9955A', i, -5, 1, 4);
  r('#FFF4E0', 2, -7, 2, 1); r('#F7A6B4', 5, -7, 2, 1);                                          // panecillos
}
function ovilloLana(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 1, -6, 5, 6); r(COLOR.ciruela, 0, -5, 7, 4); r('#C5B4E3', 1, -5, 5, 4); r('#E3D6F2', 2, -5, 2, 1);
  r('#9E8BC2', 2, -3, 3, 1); r('#9E8BC2', 4, -4, 1, 2); r('#C5B4E3', 7, -1, 2, 1);               // vueltas y la hebra suelta
}
function regaderita(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 1, -6, 6, 6); r('#A9D8E8', 2, -5, 4, 4); r('#E4F4FA', 2, -5, 1, 2);
  r(COLOR.ciruela, 7, -6, 1, 1); r(COLOR.ciruela, 8, -7, 1, 1); r(COLOR.ciruela, 9, -8, 2, 1);   // pitorro
  r(COLOR.ciruela, 0, -5, 1, 3); r(COLOR.ciruela, 2, -8, 4, 1); r(COLOR.ciruela, 2, -7, 1, 1); r(COLOR.ciruela, 5, -7, 1, 1);
}
function botellaConcha(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 0, -6, 5, 6); r(COLOR.ciruela, 1, -9, 3, 3); r('#BFE3D6', 1, -5, 3, 4); r('#E4F4FA', 1, -5, 1, 3);
  r('#C98F6B', 2, -9, 1, 2); r('#F7A6B4', 2, -3, 2, 2);                                         // tapon y una conchita dentro
}
// Encima del mostrador
function balanzaPuesto(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  const inclina = Math.round(Math.sin(estado.reloj * 0.8));
  r(COLOR.ciruela, 5, -9, 2, 9); r(COLOR.ciruela, 3, 0, 6, 2); r('#E8B84F', 6, -8, 1, 7);      // pie
  r(COLOR.ciruela, 0, -9 + inclina, 12, 1); r(COLOR.ciruela, 0, -9 - inclina + inclina, 1, 1);
  for (const [px, d] of [[-1, inclina], [8, -inclina]]) {                                       // platillos
    r(COLOR.ciruela, px + 1, -8 + d, 1, 3); r(COLOR.ciruela, px + 3, -8 + d, 1, 3);
    r(COLOR.ciruela, px, -5 + d, 6, 2); r('#FFE08A', px + 1, -5 + d, 4, 1);
  }
  r('#E87F86', 9, -7 - inclina, 2, 2);                                                          // una cereza pesandose
}
function cestaManzanas(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  for (const [ax, ay, c] of [[1, -8, '#E87F86'], [5, -9, '#F2A65A'], [8, -8, '#E87F86'], [3, -10, '#BFE3B4']]) {
    r(COLOR.ciruela, ax, ay, 4, 4); r(c, ax + 1, ay + 1, 2, 2); r('#FFFFFF', ax + 1, ay + 1, 1, 1);
  }
  r(COLOR.ciruela, 0, -5, 12, 5); r('#E2B67A', 1, -4, 10, 3); for (let i = 2; i < 11; i += 3) r('#C9955A', i, -4, 1, 3);
}
function campanilla(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 2, -6, 3, 1); r(COLOR.ciruela, 1, -5, 5, 4); r('#FFE08A', 2, -5, 3, 3); r('#FFF1B8', 2, -5, 1, 2);
  r(COLOR.ciruela, 0, -1, 7, 1); r(COLOR.ciruela, 3, -7, 1, 1);
}
// Hiedra que sube por un poste: hojitas alternas que se mecen un poco (x, y = pie del poste)
function hiedraPoste(x, y) {
  ctx.fillStyle = '#5E9E6E'; ctx.fillRect(x, y - 30, 1, 30);
  for (let i = 0; i < 9; i++) {
    const hy = y - 2 - i * 4, lado = i % 2 ? 1 : -2, s = viento(x, hy, 2) > 0 && i % 3 === 0 ? 1 : 0;
    ctx.fillStyle = i % 3 ? '#8FC98A' : '#5E9E6E'; ctx.fillRect(x + lado + s, hy, 2, 2);
  }
  ctx.fillStyle = '#F7A6B4'; ctx.fillRect(x + 1, y - 13, 1, 1); ctx.fillRect(x - 2, y - 25, 1, 1);
}
// Alrededor del puesto: un barril con escobas y una cana, y cajas de madera apiladas con verduras.
function dibujarBarril(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  r('#C98F6B', 4, -10, 1, 12); r('#E8A85C', 3, -13, 3, 4);                                      // escoba
  r(COLOR.ciruela, 10, -14, 1, 16); r('#F28CA0', 9, -15, 3, 1);                                 // cana de pescar
  r(COLOR.ciruela, 2, 0, 12, 15); r(COLOR.ciruela, 1, 3, 14, 9);
  r(PINO.canto, 3, 1, 10, 13); r(PINO.canto, 2, 4, 12, 7); r(PINO.veta, 4, 1, 2, 13); r(PINO.oscuro, 11, 1, 2, 13);
  for (const hy of [3, 10]) { r('#8E7A8C', 2, hy, 12, 1); r('#B9AFC4', 3, hy, 4, 1); }
  ovalo(x + 8, y + 1, 6, 2, COLOR.ciruela); ovalo(x + 8, y + 1, 5, 1, PINO.hondo);              // boca del barril
}
function dibujarCajas(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  const caja = (cx, cy, w, h, verdura) => {
    for (let i = 0; i < 3; i++) verdura(cx + 2 + i * Math.floor((w - 4) / 3), cy - 2);
    r(COLOR.ciruela, cx, cy, w, h); r(PINO.tabla, cx + 1, cy + 1, w - 2, h - 2);
    r(PINO.veta, cx + 1, cy + Math.floor(h / 2), w - 2, 1); r(PINO.luz, cx + 1, cy + 1, w - 2, 1);
    r(COLOR.ciruela, cx + 2, cy + 2, 1, 1); r(COLOR.ciruela, cx + w - 3, cy + 2, 1, 1);
  };
  const zanahoria = (vx, vy) => { r('#8FC98A', vx + 1, vy - 3, 1, 2); r(COLOR.ciruela, vx, vy - 1, 3, 3); r('#F2A65A', vx + 1, vy, 1, 2); };
  const nabo = (vx, vy) => { r('#8FC98A', vx + 1, vy - 3, 1, 2); r(COLOR.ciruela, vx, vy - 1, 4, 3); r('#E3D6F2', vx + 1, vy - 1, 2, 2); r('#C5B4E3', vx + 1, vy, 2, 1); };
  caja(0, 4, 16, 11, zanahoria);
  caja(3, -5, 11, 9, nabo);
}
// Tierra pisada delante del mostrador (donde se paran los clientes), sobre los adoquines.
function dibujarPisadoTienda() {
  const cx = TIENDA.c * T + 32, cy = (TIENDA.f + 2) * T + 6;
  ctx.globalAlpha = 0.45; ovalo(cx, cy, 24, 5, '#D9BE9C'); ovalo(cx - 4, cy, 14, 3, '#CDAE8A'); ctx.globalAlpha = 1;
  ctx.fillStyle = '#C49C78';
  for (const [hx, hy] of [[-10, -1], [-6, 1], [4, -2], [8, 0], [15, 1]]) ctx.fillRect(cx + hx, cy + hy, 2, 1);   // huellitas
}
// Buzon junto a la puerta, del color del tejado, con su banderita.
function dibujarBuzon(x, y, color) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 6, 4, 4, 11); r(MADERA.tabla, 7, 5, 2, 9);
  r(COLOR.ciruela, 2, -4, 12, 9); r(color, 3, -3, 10, 7); r('#FFF4E0', 4, -3, 8, 1);
  r(COLOR.ciruela, 4, 0, 6, 1);                                   // ranura
  r(COLOR.ciruela, 12, -9, 1, 6); r('#E87F86', 13, -9, 3, 3);      // banderita
}
// Colmena del jardin de Miel con dos abejitas dando vueltas.
function dibujarColmena(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 2, 0, 12, 15);
  for (const [ry, h] of [[1, 4], [6, 4], [11, 3]]) { r('#FFD27A', 3, ry, 10, h); r('#E8A85C', 3, ry + h, 10, 1); }
  r(COLOR.ciruela, 1, -2, 14, 3); r(MADERA.tabla, 2, -1, 12, 1);   // tejadito
  r(COLOR.ciruela, 7, 11, 2, 2);                                   // entrada
  if (oscuridad(estado.hora) > 0.5 || llueve()) return;            // de noche y con lluvia las abejas duermen
  for (let i = 0; i < 2; i++) {
    const t = estado.reloj * 2.2 + i * 3.1, bx = Math.round(x + 8 + Math.cos(t) * 9), by = Math.round(y + 1 + Math.sin(t * 1.6) * 5);
    ctx.fillStyle = COLOR.ciruela; ctx.fillRect(bx, by, 2, 2);
    ctx.fillStyle = COLOR.mantequilla; ctx.fillRect(bx, by, 1, 1);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx + (i ? -1 : 1), by - 1, 1, 1);
  }
}
// Glorieta del parque (3x3): suelo de piedra, dos postes, cupula a rayas rosas y un farolillo colgando.
function dibujarGlorieta(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  r(COLOR.ciruela, 1, 32, 46, 14); r('#F3E3CC', 2, 33, 44, 10); r('#DCC3AE', 2, 42, 44, 3);   // suelo
  for (const px of [4, 39]) { r(COLOR.ciruela, px, 6, 5, 28); r(COLOR.crema, px + 1, 7, 3, 26); r('#E6D3C0', px + 3, 7, 1, 26); }
  r(COLOR.ciruela, 23, 8, 2, 6); r(COLOR.ciruela, 20, 13, 8, 8);
  r(oscuridad(estado.hora) > 0.4 ? COLOR.mantequilla : '#FFE3EA', 21, 14, 6, 6); r('#F28CA0', 21, 16, 6, 1);
  for (let j = 0; j < 18; j++) {                                    // cupula
    const entra = Math.max(0, 12 - j);
    r(COLOR.ciruela, -2 + entra, -10 + j, 52 - 2 * entra, 1);
    if (j > 0 && j < 17) r(j % 4 === 3 ? '#F7A6B4' : '#FFE3EA', -1 + entra, -10 + j, 50 - 2 * entra, 1);
  }
  for (let i = 0; i < 6; i++) { r(COLOR.ciruela, i * 8, 7, 8, 4); r('#F7A6B4', i * 8 + 1, 7, 6, 2); }   // festón
  r(COLOR.ciruela, 22, -16, 4, 7); r(COLOR.mantequilla, 23, -15, 2, 5);
}
// Columpio (2x2) que se mece solo un poquito, como si alguien acabara de bajarse.
function dibujarColumpio(x, y) {
  const r = (c, rx, ry, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
  for (const px of [1, 27]) { r(COLOR.ciruela, px, -8, 4, 40); r(MADERA.tabla, px + 1, -7, 2, 38); }
  r(COLOR.ciruela, 0, -11, 32, 4); r(MADERA.tabla, 1, -10, 30, 2);
  const a = Math.sin(estado.reloj * 1.8) * 0.25;
  ctx.fillStyle = COLOR.ciruela;
  for (let k = 0; k < 26; k++) for (const rx of [10, 21]) ctx.fillRect(Math.round(x + rx + Math.sin(a) * k), y - 7 + k, 1, 1);
  const dx = Math.round(Math.sin(a) * 26);
  r(COLOR.ciruela, 8 + dx, 18, 16, 4); r('#F28CA0', 9 + dx, 19, 14, 2);
}
// Gatito que duerme al sol hecho una bolita, con sus zetas.
function dibujarGatito(x, y, color) {
  const respira = Math.sin(estado.reloj * 2 + x) > 0.5 ? 1 : 0;
  ovalo(x + 9, y + 12 - respira, 6, 4, COLOR.ciruela); ovalo(x + 9, y + 12 - respira, 5, 3, color);
  ovalo(x + 4, y + 11, 4, 3, COLOR.ciruela); ovalo(x + 4, y + 11, 3, 2, color);
  ctx.fillStyle = COLOR.ciruela;
  ctx.fillRect(x + 1, y + 7, 2, 2); ctx.fillRect(x + 5, y + 7, 2, 2);        // orejas
  ctx.fillRect(x + 2, y + 11, 2, 1);                                           // ojito cerrado
  ctx.fillRect(x + 9, y + 15, 6, 1);                                           // cola
  ctx.fillStyle = '#F7A6B4'; ctx.fillRect(x + 1, y + 12, 1, 1);
  const k = (estado.reloj * 0.5 + x * 0.1) % 1;
  ctx.globalAlpha = 1 - k;
  mapaBits(['###', '..#', '.#.', '#..', '###'], x + 8 + Math.round(k * 4), y + 2 - Math.round(k * 8), COLOR.ciruela);
  ctx.globalAlpha = 1;
}
// Pajarito en el tejado de una casita: da saltitos y se gira de vez en cuando. De noche se va a dormir.
function dibujarPajarito(x, y, i) {
  if (oscuridad(estado.hora) > 0.5 || llueve()) return;
  const fase = (estado.reloj * 0.6 + i * 1.3) % 4, salto = fase < 0.3 ? -Math.round(Math.sin(fase / 0.3 * Math.PI) * 3) : 0;
  const mira = Math.floor(estado.reloj * 0.25 + i) % 2 ? 1 : -1, yy = y + salto;
  const color = ['#A9D8E8', '#F7A6B4', '#FFE08A'][i % 3];
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x, yy - 5, 6, 5); ctx.fillRect(x + (mira > 0 ? -2 : 6), yy - 4, 2, 2);   // cuerpo y colita
  ctx.fillStyle = color; ctx.fillRect(x + 1, yy - 4, 4, 3);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + (mira > 0 ? 4 : 1), yy - 4, 1, 1);                                  // ojito
  ctx.fillStyle = '#E8A85C'; ctx.fillRect(x + (mira > 0 ? 6 : -1), yy - 3, 1, 1);                                       // pico
}

// Modo decorar: cursor sobre el mapa (se dibuja dentro del mundo). En la pestana de reformas no hay cursor.
function dibujarCursorDecorar(d) {
  if (enReformas(d)) return;
  const x = d.c * T + (d.fallo ? 1 : 0), y = d.f * T;
  // Sobre algo que se moveria, el marco abarca ese mueble; si no, lo que ocuparia el que se va a poner.
  const sobre = recogible(d), n = enMano(d);
  const { ancho, alto } = tamanoMueble(sobre ? sobre.n : n);
  const mx = sobre ? sobre.c * T : x, my = sobre ? sobre.f * T : y, w = ancho * T, h = alto * T;
  if (!sobre) {
    const cabe = puedeColocar(d.c, d.f, n) && (d.mano || muebleDisponible(n));
    // Huella: menta si cabe, coral si no (nunca un rojo fuerte).
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = cabe ? '#A8DDB5' : '#F2A28C';
    ctx.fillRect(x, y, w, h);
    if (cabe || d.mano) { ctx.globalAlpha = cabe ? 0.65 : 0.35; dibujarMueble(n, x, y); }
    ctx.globalAlpha = 1;
  }
  // Marco del cursor: solo las esquinas, parpadeando entre dos colores.
  ctx.fillStyle = Math.floor(estado.reloj * 3) % 2 ? COLOR.crema : COLOR.ciruela;
  for (const [ex, ey] of [[0, 0], [w - 4, 0], [0, h - 1], [w - 4, h - 1]]) ctx.fillRect(mx + ex, my + ey, 4, 1);
  for (const [ex, ey] of [[0, 0], [w - 1, 0], [0, h - 4], [w - 1, h - 4]]) ctx.fillRect(mx + ex, my + ey, 1, 4);
}

// Rejilla del modo decorar: un puntito en cada esquina de las casillas donde se puede poner algo.
function dibujarRejilla(cx, cy) {
  ctx.fillStyle = COLOR.ciruela;
  ctx.globalAlpha = 0.18;
  const c0 = Math.floor(cx / T), f0 = Math.floor(cy / T);
  for (let f = f0; f <= f0 + lienzo.height / T + 1; f++) {
    for (let c = c0; c <= c0 + lienzo.width / T + 1; c++) {
      if (tile(c, f) === 'S' || esCesped(c, f)) ctx.fillRect(c * T, f * T, 1, 1);
    }
  }
  ctx.globalAlpha = 1;
}

// Fila de casillas numeradas con un dibujo cada una (panel de muebles y de tintes).
function panelOpciones(py, opciones, elegida) {
  // Caben 10; con mas, se ve una ventana de 10 que sigue a la elegida, con flechitas a los lados.
  const VISIBLES = 10, desde = Math.max(0, Math.min(opciones.length - VISIBLES, elegida - 4));
  const vistas = opciones.slice(desde, desde + VISIBLES);
  const paso = vistas.length > 9 ? 22 : 24;
  const ancho = vistas.length * paso + 4, px = Math.round((lienzo.width - ancho) / 2);
  panel(px, py, ancho, 22);
  if (desde > 0) mapaBits(BITS.flecha, px - 8, py + 7, COLOR.ciruela, 3);
  if (desde + VISIBLES < opciones.length) mapaBits(BITS.flecha, px + ancho + 1, py + 7, COLOR.ciruela, 1);
  vistas.forEach((op, j) => {
    const i = desde + j, mx = px + 3 + j * paso;
    if (i === elegida) { ctx.fillStyle = COLOR.mantequilla; ctx.fillRect(mx - 1, py + 2, paso, 18); }
    ctx.globalAlpha = op.disponible ? 1 : 0.3;
    if (i < 10) mapaBits(BITS[(i + 1) % 10], mx, py + 4, COLOR.ciruela);   // del 11 en adelante, con Q/R
    cuadro(op.tira, op.n, mx + 5, py + 3);
    ctx.globalAlpha = 1;
  });
}

// Cajon del modo decorar (fijo en pantalla): pestanas por categoria arriba y casillas de la categoria abajo.
// Se pone abajo, o arriba si el cursor esta en la mitad de abajo, para no taparlo nunca.
function geometriaCajon(d) {
  const arriba = !enReformas(d) && d.f * T - Math.round(cam.y) >= lienzo.height / 2 - 8;
  const x0 = 2, y0 = arriba ? 2 : lienzo.height - 44, w = lienzo.width - 4, h = 42;
  const pestanas = pestanasVisibles(d).map((k, i) => ({ k, x: x0 + 3 + i * 20, y: y0 + 2, w: 18, h: 18 }));
  const casillas = opcionesCajon(d).map((op, j) => ({ ...op, x: x0 + 3 + j * 20, y: y0 + 22, w: 18, h: 18 }));
  const colores = [];
  if (enReformas(d)) {
    coloresConocidos().forEach((ci, i) => colores.push({ ci, x: x0 + w - 48 + (i % 5) * 9, y: y0 + 22 + Math.floor(i / 5) * 9, w: 8, h: 8 }));
  }
  return { arriba, x0, y0, w, h, pestanas, casillas, colores };
}
// Cuaderno de bocetos: papel cuadriculado con espiral en el borde que da al cuarto, pestanas de cinta washi
// y lo que aun no tienes dibujado "a lapiz" (gris y suave).
const WASHI = ['#F7C6D0', '#FFD3B0', '#DCD0F0', '#FFE08A', '#F2C6E7', '#FFE3EA', '#E8D5C4', '#F7A6B4', '#C5B4E3'];
function papelCuadriculado(x, y, w, h) {
  panel(x, y, w, h);
  ctx.fillStyle = '#F4E4D6';
  for (let i = x + 4; i < x + w - 1; i += 4) ctx.fillRect(i, y + 1, 1, h - 2);
  for (let j = y + 4; j < y + h - 1; j += 4) ctx.fillRect(x + 1, j, w - 2, 1);
}
function espiral(x, y, w) {
  for (let i = x + 6; i < x + w - 4; i += 8) {
    ctx.fillStyle = COLOR.ciruela; ctx.fillRect(i, y - 2, 3, 5);
    ctx.fillStyle = '#D8D0E0'; ctx.fillRect(i + 1, y - 1, 1, 3);
  }
}
function cintaWashi(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y, w - 2, h);
  for (let j = 0; j < h; j += 2) { ctx.fillRect(x, y + j, 1, 1); ctx.fillRect(x + w - 1, y + j + 1, 1, 1); }   // bordes en zigzag
  ctx.globalAlpha *= 0.35; ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < w + h; i += 4) for (let j = 0; j < h; j++) { const px = i - j; if (px >= 1 && px < w - 1) ctx.fillRect(x + px, y + j, 1, 1); }
  ctx.globalAlpha /= 0.35;
}
function aLapiz(dibujar) {
  ctx.save();
  ctx.filter = 'grayscale(1)';
  ctx.globalAlpha *= 0.45;
  dibujar();
  ctx.restore();
}
function dibujarCajon(d) {
  const g = geometriaCajon(d);
  papelCuadriculado(g.x0, g.y0, g.w, g.h);
  espiral(g.x0, g.arriba ? g.y0 + g.h : g.y0, g.w);
  // Lo elegido lleva un aro amarillo por fuera (los dibujos llenan la casilla entera).
  const aro = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x - 1, y, w + 2, h); ctx.fillRect(x, y - 1, w, h + 2); };
  const respira = Math.floor(estado.reloj * 2) % 2 ? COLOR.mantequilla : '#E8A85C';
  g.pestanas.forEach((p, i) => {
    const activa = p.k === d.cat, alza = activa ? 1 : 0;
    cintaWashi(p.x - 1, p.y - alza, p.w + 2, p.h + alza, WASHI[i % WASHI.length]);
    if (activa) { ctx.fillStyle = COLOR.ciruela; ctx.fillRect(p.x + 3, p.y + p.h, p.w - 6, 1); }   // subrayado de la pestana activa
    if (activa) dibujarIconoCategoria(CATEGORIAS[p.k], p.x + 1, p.y + 1 - alza);
    else aLapiz(() => dibujarIconoCategoria(CATEGORIAS[p.k], p.x + 1, p.y + 1));
  });
  g.casillas.forEach((op, j) => {
    const { x, y } = op;
    if (op.elegida) aro(x, y, op.w, op.h, respira);
    panel(x, y, op.w, op.h);
    if (op.disponible) op.dibujar(x + 1, y + 1);
    else aLapiz(() => op.dibujar(x + 1, y + 1));
    if (op.puesto) {                                                   // el suelo o papel que hay ahora
      ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + op.w - 7, y + 1, 6, 6);
      mapaBits(BITS.estrella, x + op.w - 7, y + 1, COLOR.mantequilla);
    }
    if (op.cuantos > 0) {                                              // cuantos tienes guardados
      ctx.fillStyle = COLOR.crema; ctx.fillRect(x + op.w - 6, y + op.h - 8, 5, 7);
      mapaBits(BITS[Math.min(op.cuantos, 9)], x + op.w - 5, y + op.h - 7, COLOR.ciruela);
    } else if (op.construible) {                                       // se puede hacer con lo que llevas
      ctx.fillStyle = COLOR.salvia; ctx.fillRect(x + op.w - 5, y + op.h - 6, 3, 1); ctx.fillRect(x + op.w - 4, y + op.h - 7, 1, 3);
    }
    if (j < 9 && !enReformas(d)) mapaBits(BITS[j + 1], x + 2, y + 2, COLOR.ciruela);
  });
  if (g.colores.length) {
    const actual = parteReforma(d) === 'suelo' ? estado.casa.colorSuelo : estado.casa.colorPared;
    for (const s of g.colores) {
      ctx.fillStyle = s.ci === actual ? COLOR.ciruela : '#B9A6B5';
      ctx.fillRect(s.x - 1, s.y - 1, s.w + 2, s.h + 2);
      ctx.fillStyle = s.ci < 0 ? NATURAL[parteReforma(d)] : TINTES[s.ci].color;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      if (s.ci === actual) { ctx.fillStyle = COLOR.crema; ctx.fillRect(s.x + 3, s.y + 3, 2, 2); }
    }
  }
}
// Icono de una pestana: el primer mueble de la categoria, o un trocito de pared y suelo para reformas.
function dibujarIconoCategoria(k, x, y) {
  if (k.id !== 'reformas') { cuadro(tiraMueble(k.lista[0]), iconoMueble(k.lista[0]), x, y); return; }
  const p = PAPELES.findIndex(q => q.id === estado.casa.pared), s = SUELOS.findIndex(q => q.id === estado.casa.suelo);
  ctx.drawImage(tintada('casa_papeles_tiles', colorCasa('pared'), 'multiply'), p * T, 8, T, 8, x, y, T, 8);
  const suelos = SUELOS[s].tinte ? tintada('casa_suelos_tiles', colorCasa('suelo'), 'multiply') : img.casa_suelos_tiles;
  ctx.drawImage(suelos, s * T, 0, T, 8, x, y + 8, T, 8);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x, y + 7, T, 1);
}

// Hilo de pescar: una linea de pixeles sueltos entre dos puntos.
function hilo(x0, y0, x1, y1) {
  const pasos = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  ctx.fillStyle = COLOR.crema;
  for (let i = 0; i <= pasos; i++) {
    ctx.fillRect(Math.round(x0 + (x1 - x0) * i / pasos), Math.round(y0 + (y1 - y0) * i / pasos), 1, 1);
  }
}

// Barra de pesca: el pececito va y viene por el agua; hay que pulsar cuando pasa por la zona verde.
const BARRA = { x: 60, y: 138, ancho: 120, zona: 26, centro: 8 };
function dibujarBarraPesca(pe) {
  const { x, y, ancho, zona, centro } = BARRA;
  const reloj = pe.tiempo != null;
  tablaMadera(x - 5, y - 13, ancho + 10, reloj ? 34 : 27);
  if (reloj) dibujarCuentaAtras(pe, x, y + 14, ancho);
  for (let i = 0; i < ACIERTOS_PESCA; i++) {
    mapaBits(BITS.estrella, x + ancho / 2 - 11 + i * 8, y - 10, i < pe.aciertos ? COLOR.mantequilla : '#A87358');
  }
  // El agua, con olitas que corren
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x - 1, y - 1, ancho + 2, 11);
  ctx.fillStyle = '#A9D8E8'; ctx.fillRect(x, y, ancho, 9);
  ctx.fillStyle = '#D5EEF5';
  for (let i = 0; i < ancho; i += 7) ctx.fillRect(x + (i + Math.floor(estado.reloj * 10)) % (ancho - 2), y + 2 + (i / 7 % 2) * 4, 2, 1);
  // Zona segura en verde y el centro dorado (atrae rarezas); al acertar destella
  const zx = x + Math.round(pe.zona);
  ctx.fillStyle = pe.destello ? '#FFFBF3' : '#8FC98A'; ctx.fillRect(zx, y, zona, 9);
  ctx.fillStyle = pe.destello ? '#FFFBF3' : '#B5E0A8'; ctx.fillRect(zx, y, zona, 1);
  ctx.fillStyle = '#5E9E6E'; ctx.fillRect(zx, y, 1, 9); ctx.fillRect(zx + zona - 1, y, 1, 9);
  const cx = x + Math.round(pe.zona + (zona - centro) / 2);
  ctx.fillStyle = COLOR.mantequilla; ctx.fillRect(cx, y, centro, 9);
  ctx.fillStyle = '#E8A85C'; ctx.fillRect(cx, y, 1, 9); ctx.fillRect(cx + centro - 1, y, 1, 9);
  // La marca: un pececito que nada de lado a lado (tiembla en fresa al fallar)
  const mx = x + Math.round(pe.pos) + (pe.fallo ? Math.round(Math.sin(pe.fallo * 80)) : 0);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(mx, y - 3, 2, 1); ctx.fillRect(mx, y + 11, 2, 1);
  pezMarcador(mx + 1, y + 4, pe.dir, pe.fallo ? '#E8606E' : '#F28CA0');
}
// Tablilla de madera con hojitas en las puntas (fondo de la barra de pesca).
function tablaMadera(x, y, w, h) {
  ctx.fillStyle = COLOR.ciruela;
  ctx.fillRect(x + 2, y, w - 4, h); ctx.fillRect(x + 1, y + 1, w - 2, h - 2); ctx.fillRect(x, y + 2, w, h - 4);
  ctx.fillStyle = '#C98F6B'; ctx.fillRect(x + 2, y + 1, w - 4, h - 2); ctx.fillRect(x + 1, y + 2, w - 2, h - 4);
  ctx.fillStyle = '#DDA77F'; ctx.fillRect(x + 2, y + 1, w - 4, 1);
  ctx.fillStyle = '#A87358'; ctx.fillRect(x + 2, y + h - 3, w - 4, 2);
  ctx.fillStyle = '#B57C5C';                                   // vetas
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 6 + ((i * 37) % (w - 20)), y + 4 + (i % 3) * 6, 8 + (i % 2) * 5, 1);
  if (img.nota_adornos) {
    ctx.drawImage(img.nota_adornos, 0, 0, 12, 12, x - 5, y - 5, 12, 12);
    ctx.save(); ctx.scale(-1, 1); ctx.drawImage(img.nota_adornos, 0, 0, 12, 12, -(x + w + 5), y - 5, 12, 12); ctx.restore();
  }
}
// Pececito de 7x4 con contorno ciruela, centrado en (x, y), mirando hacia dir (1 = derecha).
const PEZ_MARCA = ['..###.#', '.######', '#.#####', '.######', '..###.#'];
function pezMarcador(x, y, dir, color) {
  const ancho = PEZ_MARCA[0].length;
  const pinta = (dx, dy, c) => {
    ctx.fillStyle = c;
    PEZ_MARCA.forEach((fila, j) => [...fila].forEach((ch, i) => {
      if (ch === '.') return;
      const px = dir > 0 ? ancho - 1 - i : i;
      ctx.fillRect(x - 3 + px + dx, y - 2 + j + dy, 1, 1);
    }));
  };
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) pinta(dx, dy, COLOR.ciruela);
  pinta(0, 0, color);
  ctx.fillStyle = COLOR.ciruela;
  PEZ_MARCA.forEach((fila, j) => [...fila].forEach((ch, i) => {   // el ojo
    if (ch !== '.' || j !== 2) return;
    ctx.fillRect(x - 3 + (dir > 0 ? ancho - 1 - i : i), y - 2 + j, 1, 1);
  }));
}

// ---------- Pesca (dibujo) ----------
// Lanzamiento (la gatita echa la cana atras y el flotador vuela en arco), espera (el flotador sube y baja con ondas y
// la sombra de un pez se acerca dando vueltas), picada (se hunde a tirones, burbujas y un gran "¡!") y tirar (la cana
// se dobla, la gatita se echa atras y salpica). Todo sale de estado.pesca: bx, by = centro del flotador; lado = hacia
// donde queda el agua (-1 izquierda, 1 derecha).
const LANZAR = 0.6, SALTO_PREMIO = 0.5;
function destinoFlotador(sitio) {
  const g = casillaActual();
  let dc = sitio.c - g.c, df = sitio.f - g.f;
  if (!dc && !df) {                       // desde la barca: hacia donde mira
    const m = estado.gata.mira;
    if (m === 'lado') dc = estado.gata.espejo ? -1 : 1; else df = m === 'espalda' ? -1 : 1;
  }
  // Si detras sigue habiendo agua, el flotador cae un poco mas lejos.
  const lejos = tile(sitio.c + dc, sitio.f + df) === 'W' ? 0.6 : 0;
  const c = sitio.c + dc * lejos + (dc || df ? 0 : 1), f = sitio.f + df * lejos;
  return { bx: Math.round(c * T + 8 + (Math.random() * 4 - 2)), by: Math.round(f * T + 9 + (Math.random() * 2 - 1)), lado: dc < 0 ? -1 : 1 };
}
// Al tirar, la gatita se echa un pixel hacia atras (y tiembla un poco).
function inclinaPesca() {
  const pe = estado.pesca;
  if (!pe) return 0;
  if (pe.fase === 'tirar') return -pe.lado * (1 + (Math.sin(estado.reloj * 30) > 0.6 ? 1 : 0));
  if (pe.fase === 'lanza' && pe.t / LANZAR > 0.35 && pe.t / LANZAR < 0.7) return pe.lado;
  return 0;
}
const bits = (filas, x, y, colores) => filas.forEach((fila, j) => [...fila].forEach((ch, i) => {
  if (ch === '.') return;
  ctx.fillStyle = colores[ch]; ctx.fillRect(x + i, y + j, 1, 1);
}));
// Anillo de agua en pixeles (elipse aplastada).
function ondaAgua(x, y, r, alfa, color = '#E9F7FB') {
  if (alfa <= 0) return;
  ctx.globalAlpha = alfa; ctx.fillStyle = color;
  const pasos = Math.max(10, Math.round(r * 6));
  for (let i = 0; i < pasos; i++) {
    const a = i / pasos * Math.PI * 2;
    ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * 0.45), 1, 1);
  }
  ctx.globalAlpha = 1;
}
// Sombra de pez bajo el agua (solo se pinta encima de casillas de agua).
function sombraPez(x, y, dir, alfa, largo = 7) {
  if (alfa <= 0 || tile(Math.floor(x / T), Math.floor(y / T)) !== 'W') return;
  ctx.globalAlpha = alfa; ctx.fillStyle = '#2E4A6B';
  const m = Math.floor(largo / 2);
  for (let i = -m; i <= m; i++) {
    const alto = Math.abs(i) < m - 1 ? 3 : 1;
    ctx.fillRect(Math.round(x + i), Math.round(y - (alto >> 1)), 1, alto);
  }
  const cola = Math.round(x - dir * (m + 1));
  ctx.fillRect(cola, Math.round(y - 2), 1, 1); ctx.fillRect(cola, Math.round(y + 1), 1, 1); ctx.fillRect(Math.round(x - dir * (m + 2)), Math.round(y - 2), 1, 4);
  ctx.globalAlpha = 1;
}
// Cana de madera desde las patitas; devuelve la punta. ang = inclinacion desde la vertical hacia el agua.
function dibujarCanaPesca(pe, g) {
  const lado = pe.lado, L = 12, t = pe.t;
  const x0 = g.x + 8 + inclinaPesca() + lado * 3, y0 = g.y + 11;
  let ang = 0.75 + Math.sin(estado.reloj * 1.5) * 0.05, doblez = 0;
  if (pe.fase === 'lanza') {
    const k = t / LANZAR;
    ang = k < 0.35 ? 0.6 - 1.6 * (k / 0.35) : -1 + 2 * Math.min(1, (k - 0.35) / 0.2);
  } else if (pe.fase === 'pica') ang = 0.95 + (Math.sin(t * 22) > 0 ? 0.12 : 0);
  else if (pe.fase === 'tirar') { ang = 1.05 + Math.sin(estado.reloj * 26) * 0.07; doblez = 4; }
  else if (pe.fase === 'escapo') ang = 0.5;
  const tx = x0 + lado * Math.sin(ang) * L, ty = y0 - Math.cos(ang) * L + doblez;
  const mx = x0 + lado * Math.sin(ang) * L * 0.55, my = y0 - Math.cos(ang) * L * 0.55 - doblez * 0.2;
  const puntos = [];
  for (let i = 0; i <= 14; i++) {
    const s = i / 14, a = (1 - s) * (1 - s), b = 2 * (1 - s) * s, c = s * s;
    puntos.push([Math.round(a * x0 + b * mx + c * tx), Math.round(a * y0 + b * my + c * ty)]);
  }
  ctx.fillStyle = COLOR.ciruela;
  for (const [x, y] of puntos) ctx.fillRect(x - 1, y - 1, 3, 3);
  puntos.forEach(([x, y], i) => { ctx.fillStyle = i < 5 ? '#8A5A44' : '#D9A06B'; ctx.fillRect(x, y, 1, 1); });
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x0 - lado * 2 - 1, y0, 3, 3);       // carrete
  ctx.fillStyle = '#FFE08A'; ctx.fillRect(x0 - lado * 2, y0 + 1, 1, 1);
  return { x: puntos[14][0], y: puntos[14][1] };
}
function dibujarPesca(pe, g) {
  const r = estado.reloj, t = pe.t;
  let fx = pe.bx, fy = pe.by, hundido = false;
  // Debajo del agua: ondas y la sombra del pez
  if (pe.fase === 'espera') {
    for (let i = 0; i < 2; i++) { const q = (r * 0.6 + i * 0.5) % 1; ondaAgua(fx, fy + 1, 2 + q * 7, (1 - q) * 0.8); }
    const k = Math.min(1, t / pe.limite), radio = 3 + 11 * (1 - k), a = t * (1.2 + k) + pe.giro;
    sombraPez(fx + Math.cos(a) * radio, fy + 3 + Math.sin(a) * radio * 0.45, -Math.sin(a) >= 0 ? 1 : -1, 0.15 + 0.15 * k);
    fy += Math.round(Math.sin(r * 3));
  } else if (pe.fase === 'pica' || pe.fase === 'tirar') {
    const rapido = pe.fase === 'tirar' ? 2.4 : 1.4;
    for (let i = 0; i < 3; i++) { const q = (r * rapido + i / 3) % 1; ondaAgua(fx, fy + 1, 3 + q * 9, (1 - q) * 0.9, '#FFFBF3'); }
    sombraPez(fx + Math.round(Math.sin(r * 9) * 2), fy + 4, Math.sin(r * 4) > 0 ? 1 : -1, 0.35);
    hundido = pe.fase === 'tirar' || Math.sin(t * 16) > -0.2;       // a tirones
    fx += pe.fase === 'tirar' ? Math.round(Math.sin(r * 21) * 1.5) : 0;
  } else if (pe.fase === 'escapo') {
    ondaAgua(fx, fy + 1, 3 + t * 8, 1 - t / 1.5);
    sombraPez(fx + pe.lado * t * 26, fy + 3, pe.lado, 0.3 * (1 - t / 1.5));
  }
  const punta = dibujarCanaPesca(pe, g);
  // El flotador: en el lanzamiento vuela en arco desde la punta de la cana
  if (pe.fase === 'lanza') {
    const k = Math.max(0, (t / LANZAR - 0.45) / 0.55);
    if (k <= 0) { hilo(punta.x, punta.y, punta.x, punta.y + 3); cuadro('objetos_pesca', 0, punta.x - 8, punta.y - 4); return; }
    fx = Math.round(punta.x + (pe.bx - punta.x) * k); fy = Math.round(punta.y + (pe.by - punta.y) * k - Math.sin(Math.PI * k) * 14);
  }
  // Sedal: cuelga un poco mientras espera; tenso y vibrando al tirar
  const ay = fy + (hundido ? 0 : -3);
  if (pe.fase === 'tirar') hilo(punta.x, punta.y, fx, ay);
  else {
    const caida = pe.fase === 'lanza' ? 2 : 5;
    const mx = (punta.x + fx) / 2, my = Math.max(punta.y, ay) + caida;
    let px = punta.x, py = punta.y;
    for (let i = 1; i <= 6; i++) {
      const s = i / 6, nx = (1 - s) * (1 - s) * punta.x + 2 * (1 - s) * s * mx + s * s * fx, ny = (1 - s) * (1 - s) * punta.y + 2 * (1 - s) * s * my + s * s * ay;
      hilo(Math.round(px), Math.round(py), Math.round(nx), Math.round(ny)); px = nx; py = ny;
    }
  }
  cuadro('objetos_pesca', hundido ? 1 : 0, fx - 8, fy - (hundido ? 9 : 8));
  // ¡Pica!: dos exclamaciones que saltan sobre la cabeza
  if (pe.fase === 'pica') {
    const sube = t < 0.12 ? 3 : Math.round(Math.abs(Math.sin(t * 10)));
    const y = g.y - 16 - sube, x = g.x + 8;
    const EXCLAMA = ['.ooo.', 'oyyyo', 'oyyyo', 'oyyyo', '.oyo.', '.oyo.', '..o..', '.....', '.ooo.', 'oyyyo', '.ooo.'];
    bits(EXCLAMA, x - 6, y, { o: COLOR.ciruela, y: COLOR.mantequilla });
    bits(EXCLAMA, x + 1, y - 2, { o: COLOR.ciruela, y: COLOR.mantequilla });
    ctx.fillStyle = COLOR.mantequilla;                                 // rayitas de emocion
    ctx.fillRect(x - 9, y + 1, 2, 1); ctx.fillRect(x + 7, y - 1, 2, 1); ctx.fillRect(x - 8, y - 2, 1, 1); ctx.fillRect(x + 7, y - 4, 1, 1);
  }
}

// Sombras de pececitos que pasan de vez en cuando bajo el agua cerca de la gatita (para saber donde lanzar).
const sombrasPeces = [];
function actualizarSombrasPeces(dt) {
  for (const s of sombrasPeces) {
    s.t += dt; s.x += s.vx * dt; s.y += Math.sin(s.t * 2 + s.fase) * 2 * dt;
    if (tile(Math.floor((s.x + Math.sign(s.vx) * 5) / T), Math.floor(s.y / T)) !== 'W') { s.vx = -s.vx; }
  }
  for (let i = sombrasPeces.length - 1; i >= 0; i--) if (sombrasPeces[i].t > sombrasPeces[i].vida) sombrasPeces.splice(i, 1);
  if (estado.inicio || bajoAgua(casillaActual().f) || sombrasPeces.length >= 3 || Math.random() > dt * 0.6) return;
  const g = casillaActual(), c = g.c + Math.floor(Math.random() * 15) - 7, f = g.f + Math.floor(Math.random() * 11) - 5;
  if (tile(c, f) !== 'W' || tile(c + 1, f) !== 'W' || tile(c - 1, f) !== 'W') return;
  sombrasPeces.push({ x: c * T + 8, y: f * T + 8, vx: (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 6), t: 0, vida: 4 + Math.random() * 3, fase: Math.random() * 6, largo: Math.random() < 0.3 ? 9 : 7 });
}
function dibujarSombrasPeces() {
  for (const s of sombrasPeces) sombraPez(s.x, s.y, Math.sign(s.vx), 0.2 * Math.min(1, s.t / 0.8, (s.vida - s.t) / 0.8), s.largo);
}

// Reloj de arena de los minijuegos: icono y barrita que se vacia (mantequilla -> rosa -> fresa).
// Al equivocarse parpadea en fresa y tiembla.
function dibujarCuentaAtras(o, x, y, ancho) {
  if (!o || o.tiempo == null) return;
  const k = o.tiempo / o.tiempoMax, poco = k < 0.3;
  const temblor = o.menos > 0 ? Math.round(Math.sin(o.menos * 60)) : 0;
  x += temblor;
  mapaBits(ICONOS.arena, x, y - 2, poco && Math.sin(estado.reloj * 14) > 0 ? '#E8606E' : COLOR.ciruela);
  const bx = x + 9, bw = ancho - 9;
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(bx - 1, y - 1, bw + 2, 5);
  ctx.fillStyle = COLOR.algodon; ctx.fillRect(bx, y, bw, 3);
  const lleno = Math.round(bw * k);
  ctx.fillStyle = o.menos > 0 && Math.sin(o.menos * 40) > 0 ? '#E8606E' : poco ? '#E8606E' : k < 0.6 ? COLOR.rosa : COLOR.mantequilla;
  ctx.fillRect(bx, y, lleno, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(bx, y, lleno, 1);
}

// ---------- Tejer: cojin, ovillos, bastidor de madera y botones de costura ----------
// Al abrir la cesta de casa sale un cojin mullido (pop) y la gatita se sienta con las piernas cruzadas y saca las
// agujas (tejerSentarse, DURACION_SENTARSE). Para elegir prenda y tinte se usa panelOpciones; al tejer, el panel es un
// bastidor de madera (la prenda crece en el, fila a fila de abajo arriba y en zigzag, como de verdad) con una tira de
// lino donde van cosidos los botones del patron: cada flecha es un boton de su color, que brilla al pulso de la
// musica (Sonido.pulso); al acertar se convierte en un punto de lana. La racha (aciertos seguidos) calienta la luz
// de la casa (dibujarCalorTejer) y hace brillar la lana; fallar solo la enfria. El reloj es un ovillo que se deshace.
const DURACION_SENTARSE = 5 / 8, DURACION_REMATAR = 1.5;
let cojinTejer = null;              // { x, y, t, fuera } el cojin bajo la gatita (solo adorno, no se guarda)
const BOTONES_TEJER = [             // arriba, derecha, abajo, izquierda: rosa, mantequilla, celeste y lila
  { base: '#F7A6B4', sombra: '#E07C92', luz: '#FFD8E0' },
  { base: '#FFE08A', sombra: '#E2AE4E', luz: '#FFF4C8' },
  { base: '#A9D8E8', sombra: '#74B0CF', luz: '#E0F4FA' },
  { base: '#C9B4E8', sombra: '#9C86C8', luz: '#EEE6FA' },
];
const LINO = { tela: '#FFF8EE', punto: '#EBDCCB', hilvan: '#F5C9D2' };
const ARO = { luz: '#F5CB8E', base: '#E2A866', sombra: '#B7794A', laton: '#E8B84F', latonLuz: '#FFE08A' };
const COJIN = { luz: '#FFD8E0', base: '#F7A6B4', sombra: '#E07C92', borla: '#FFE08A' };
const FLECHA_BOTON = ['..#..', '.###.', '#.#.#', '..#..', '..#..'];
const NOTA_MUSICA = ['..##', '..#.', '..#.', '.##.', '###.', '.#..'];
const PUNTO_LANA = ['##...##', '.##.##.', '..###..', '...#...'];   // una "V" de punto de media
// Patron de cada prenda en el bastidor: cada letra es un punto de 2x2 px. # lana, = lana mas oscura (canale),
// * lana clarita (rayas y pompon).
const MOLDES_TEJER = {
  bufanda: ['#####', '#####', '*****', '#####', '#####', '*****', '#####', '#####', '*****', '#####', '#####', '#.#.#'],
  gorro: ['...**...', '..****..', '...**...', '..####..', '.######.', '########', '########', '########', '========', '========'],
  lazo: ['##.....##', '###...###', '####=####', '#########', '####=####', '###...###', '##.#.#.##', '..##.##..'],
};
const moldes = {};
function celdasMolde(tipo) {
  if (moldes[tipo]) return moldes[tipo];
  const filas = MOLDES_TEJER[tipo], celdas = [];
  for (let k = 0; k < filas.length; k++) {                   // de abajo arriba, en zigzag
    const r = filas.length - 1 - k, fila = [...filas[r]].map((ch, c) => ({ c, r, ch })).filter(o => o.ch !== '.');
    celdas.push(...(k % 2 ? fila.reverse() : fila));
  }
  return (moldes[tipo] = { ancho: filas[0].length, alto: filas.length, celdas });
}
const objetivoMolde = (tj, m) => Math.round(m.celdas.length * tj.i / tj.patron.length);
function geometriaTejer(tj) {
  const n = tj.patron.length, paso = 13, reloj = tj.tiempo != null, r = 19;
  const anchoTira = n * paso + 14, total = 2 * r + anchoTira + (reloj ? 22 : 2);
  const x0 = Math.round((lienzo.width - total) / 2), y0 = lienzo.height - 47;
  const aro = { cx: x0 + r, cy: y0 + r + 2, r };
  const tira = { x: aro.cx + r - 6, y: aro.cy - 10, w: anchoTira, h: 21 };
  const botones = tj.patron.map((dir, i) => ({ dir, x: tira.x + 10 + i * paso, y: tira.y + 5 }));
  return { aro, tira, botones, ovillo: reloj ? { x: tira.x + tira.w + 12, y: aro.cy + 4 } : null };
}
const notaTejer = (x, y, color) => ({ tipo: 'nota', x, y, vx: (Math.random() - 0.5) * 8, vy: -18, t: 0, vida: 1.1, color });
// Al acertar: una nota de musica sale del boton, estrellitas de hilo de lo recien tejido y pelusas que flotan.
function brotesTejer(tj, geo, i) {
  const b = geo.botones[i], c = BOTONES_TEJER[b.dir], p = puntoAro(tj, geo.aro, objetivoMolde({ ...tj, i: i + 1 }, celdasMolde(tj.prenda.id)) - 1);
  tj.efectos.push(notaTejer(b.x + 4, b.y - 3, c.sombra));
  for (let k = 0; k < 3; k++) {
    const a = Math.random() * Math.PI * 2;
    tj.efectos.push({ tipo: 'estrella', x: p.x, y: p.y, vx: Math.cos(a) * 22, vy: Math.sin(a) * 22 - 6, t: 0, vida: 0.6, roce: 3,
      color: k ? mezclarColor(tj.tinte.color, '#FFF6D6', 0.35) : COLOR.mantequilla });
  }
  for (let k = 0; k < 2; k++) {
    tj.efectos.push({ tipo: 'pelusa', x: b.x + 5 + (Math.random() - 0.5) * 8, y: b.y + 4, vx: (Math.random() - 0.5) * 5, vy: -5 - Math.random() * 5,
      t: 0, vida: 1.6, color: k ? '#FFFFFF' : LINO.punto });
  }
}
function puntoAro(tj, aro, indice) {
  const m = celdasMolde(tj.prenda.id), o = m.celdas[Math.max(0, Math.min(m.celdas.length - 1, indice))];
  return { x: aro.cx - m.ancho + o.c * 2 + 1, y: aro.cy - m.alto + o.r * 2 + 1 };
}
function actualizarTejer(dt) {
  if (cojinTejer) {
    cojinTejer.t += dt;
    if (!cojinTejer.fuera && (!estado.tejer || estado.tejer.fase === 'rematar')) { cojinTejer.fuera = true; cojinTejer.t = 0; }
    if (cojinTejer.fuera && cojinTejer.t > 0.3) cojinTejer = null;
  }
  const tj = estado.tejer;
  if (!tj) return;
  tj.sentar = (tj.sentar || 0) + dt;
  if (tj.efectos) {
    for (const e of tj.efectos) {
      e.t += dt; e.x += e.vx * dt; e.y += e.vy * dt;
      if (e.roce) { e.vx *= Math.max(0, 1 - e.roce * dt); e.vy *= Math.max(0, 1 - e.roce * dt); }
    }
    tj.efectos = tj.efectos.filter(e => e.t < e.vida);
  }
  if (tj.fase === 'tejiendo' || tj.fase === 'rematar') {
    tj.contenta = Math.max(0, tj.contenta - dt);
    tj.golpe += dt;
    if (tj.flash) tj.flash.t += dt;
    const m = celdasMolde(tj.prenda.id), meta = objetivoMolde(tj, m);
    tj.mostrados = Math.min(meta, tj.mostrados + dt * m.celdas.length * 1.5);   // la prenda crece poco a poco, no de golpe
    tj.calor += ((tj.fase === 'tejiendo' ? Math.min(1, tj.racha / 6) : 0) - tj.calor) * Math.min(1, dt * 2);
    if (tj.fase === 'tejiendo' && tj.sentar >= DURACION_SENTARSE && Math.random() < dt * 0.7) {   // alguna pelusa suelta
      const g = estado.gata;
      chispas(g.x + 8, g.y + 13, '#FFFFFF', 1, { fuerza: 6, gravedad: -10, vida: 1.2 });
    }
  }
  if (tj.fase === 'rematar') {
    tj.t += dt;
    if (tj.t >= DURACION_REMATAR) {
      estado.tejer = null;
      avisar('Has tejido: ' + tj.prenda.nombre.toLowerCase() + ' · puedes cambiarte en el armario de casa');
    }
  }
}

// --- en el mundo
function disco(cx, cy, r) { for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy)); ctx.fillRect(cx - w, cy + dy, 2 * w + 1, 1); } }
function dibujarOvillo(cx, cy, r, color, giro = 0) {
  const luz = mezclarColor(color, '#FFF6D6', 0.5), sombra = mezclarColor(color, '#5B3F7A', 0.35), borde = mezclarColor(color, '#3A2840', 0.62);
  cx = Math.round(cx); cy = Math.round(cy);
  for (let dy = -r - 1; dy <= r + 1; dy++) for (let dx = -r - 1; dx <= r + 1; dx++) {
    const d = Math.hypot(dx, dy);
    if (d > r + 0.5) continue;
    let c = borde;
    if (d <= r - 0.5) {
      const hebra = Math.abs(Math.sin(dx * 0.9 + dy * 0.45 + giro)) < 0.24;     // vueltas de la lana
      const l = (-dx - dy) / (r * 1.4);
      c = hebra ? sombra : l > 0.35 ? luz : l < -0.3 ? sombra : color;
    }
    ctx.fillStyle = c; ctx.fillRect(cx + dx, cy + dy, 1, 1);
  }
}
// Hilo de (x0, y0) a (x1, y1) con su comba (negativa = hacia arriba).
function hilo(x0, y0, x1, y1, comba, color) {
  const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  ctx.fillStyle = color;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    ctx.fillRect(Math.round(x0 + (x1 - x0) * k), Math.round(y0 + (y1 - y0) * k + Math.sin(Math.PI * k) * comba), 1, 1);
  }
}
const salirRebotando = t => { const c1 = 1.70158, c3 = c1 + 1, k = t - 1; return 1 + c3 * k * k * k + c1 * k * k; };
function dibujarCojin(k) {
  const s = k.fuera ? Math.max(0, 1 - k.t / 0.3) : k.t >= 0.3 ? 1 : salirRebotando(k.t / 0.3);
  const rx = Math.round(11 * s), ry = Math.round(4 * s), cx = k.x + 8, cy = k.y + 14;
  if (rx < 1 || ry < 1) return;
  for (let dy = -ry; dy <= ry; dy++) for (let dx = -rx; dx <= rx; dx++) {
    const d = (dx / (rx + 0.5)) ** 2 + (dy / (ry + 0.5)) ** 2;
    if (d > 1) continue;
    const borde = (dx / (rx - 0.5)) ** 2 + (dy / (ry - 0.5)) ** 2 > 1;
    ctx.fillStyle = borde ? COLOR.ciruela : dy < -ry / 3 ? COJIN.luz : dy >= ry - 1 ? COJIN.sombra : COJIN.base;
    ctx.fillRect(cx + dx, cy + dy, 1, 1);
  }
  if (s > 0.6) {                                     // borlas de las esquinas
    ctx.fillStyle = COJIN.borla;
    ctx.fillRect(cx - rx - 1, cy, 1, 2); ctx.fillRect(cx + rx + 1, cy, 1, 2);
    ctx.fillStyle = COJIN.sombra; ctx.fillRect(cx - rx + 2, cy + 1, 1, 1); ctx.fillRect(cx + rx - 2, cy + 1, 1, 1);
  }
}
// Dos ovillos junto al cojin: el del tinte elegido (con el hilo que va al regazo) bota en cada punto; el otro rueda.
function dibujarOvillosTejer(tj, g) {
  const color = tj.tinte ? tj.tinte.color : '#F7A6B4', bote = tj.golpe < 0.3 ? Math.round(Math.sin(tj.golpe / 0.3 * Math.PI) * 3) : 0;
  const lx = g.x - 5, ly = g.y + 13 - bote + Math.round(Math.sin(estado.reloj * 2.2));
  const rx = g.x + 22 + Math.round(Math.sin(estado.reloj * 0.8) * 2), ry = g.y + 14;
  if (tj.fase !== 'rematar') hilo(lx + 2, ly - 1, g.x + 7, g.y + 13, 2, mezclarColor(color, '#3A2840', 0.3));
  dibujarOvillo(lx, ly, 3, color, estado.reloj * 0.5);
  dibujarOvillo(rx, ry, 2, color === '#A9D8E8' ? '#FFE08A' : '#A9D8E8', estado.reloj * 1.6);
}
// El trocito de prenda que cuelga de las agujas: crece con cada punto.
function dibujarLabor(tj, xg, yg) {
  if (tj.fase !== 'tejiendo' || tj.sentar < DURACION_SENTARSE) return;
  const h = 1 + Math.round(3 * tj.i / tj.patron.length), c = tj.tinte.color;
  const luz = mezclarColor(c, '#FFF6D6', 0.45), sombra = mezclarColor(c, '#5B3F7A', 0.3);
  for (let j = 0; j < h; j++) for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i === 0 ? luz : i === 3 || (i + j) % 2 ? sombra : c;
    ctx.fillRect(xg + 6 + i, yg + 12 + j, 1, 1);
  }
  ctx.fillStyle = mezclarColor(c, '#3A2840', 0.6); ctx.fillRect(xg + 6, yg + 12 + h, 4, 1);
}
function dibujarPrendaRematada(tj, g, salto) {
  const k = Math.min(1, tj.t / 0.4), x = g.x, y = Math.round(g.y - salto - 6 - 12 * k);
  if (Math.sin(estado.reloj * 10) > 0) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 2, y + 2, 1, 1); ctx.fillRect(x + 17, y + 6, 1, 1); }
  cuadro(iconoPrendaTejer(tj.prenda.id, tj.tinte.color), 0, x, y);
}
const iconosPrenda = {};
function iconoPrendaTejer(tipo, color) {
  const clave = tipo + color;
  if (iconosPrenda[clave]) return iconosPrenda[clave];
  const c = document.createElement('canvas');
  c.width = c.height = T;
  dibujoPrenda({ tipo, color })(c.getContext('2d'));
  return (iconosPrenda[clave] = c);
}
// Luz de la racha: con aciertos seguidos el cuarto se vuelve calentito alrededor de la gatita y se apagan un poco
// los bordes, como si se encendiera una lamparita. Al fallar se va enfriando despacio.
function dibujarCalorTejer(tj, gx, gy) {
  const k = tj.calor || 0;
  if (k < 0.02) return;
  // Los bordes se apagan un poquito (sin tocar a la gatita)...
  const v = ctx.createRadialGradient(gx, gy, 40, gx, gy, 170);
  v.addColorStop(0, 'rgba(74, 51, 71, 0)');
  v.addColorStop(1, 'rgba(74, 51, 71, ' + (0.32 * k) + ')');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, lienzo.width, lienzo.height);
  // ...y alrededor de ella la luz se vuelve de miel (luz suave: tine sin desvair los colores).
  const l = ctx.createRadialGradient(gx, gy, 4, gx, gy, 90);
  l.addColorStop(0, 'rgba(255, 190, 110, ' + (0.55 * k) + ')');
  l.addColorStop(1, 'rgba(255, 190, 110, 0)');
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = l;
  ctx.fillRect(0, 0, lienzo.width, lienzo.height);
  ctx.restore();
}

// --- el panel
const iconoTinte = t => { const fi = t.coste.id && ficha(t.coste.id); return !fi ? { tira: 'fauna_tiles', n: 0 } : { tira: fi.img, n: fi.n }; };
function dibujarPanelTejer(tj) {
  if (tj.fase === 'prenda') {
    panelOpciones(lienzo.height - 24, PRENDAS.map(pr => ({ tira: iconoPrendaTejer(pr.id, '#F7A6B4'), n: 0, disponible: true })), -1);
    return;
  }
  if (tj.fase === 'elegir') {
    panelOpciones(lienzo.height - 24, TINTES.map(t => ({ ...iconoTinte(t), disponible: !!buscar(t.coste) })), -1);
    return;
  }
  const geo = geometriaTejer(tj);
  ctx.globalAlpha = tj.fase === 'rematar' ? Math.max(0, 1 - Math.max(0, tj.t - 0.8) / 0.6) : 1;
  dibujarTiraTejer(tj, geo);
  dibujarAroTejer(tj, geo.aro);
  if (tj.fase === 'tejiendo') dibujarAgujaTejer(tj, geo);
  if (geo.ovillo && tj.fase === 'tejiendo') dibujarOvilloReloj(tj, geo);
  ctx.globalAlpha = 1;
  dibujarEfectosTejer(tj);
}
function dibujarTiraTejer(tj, geo) {
  const { x, y, w, h } = geo.tira;
  ctx.fillStyle = 'rgba(74, 51, 71, 0.25)'; ctx.fillRect(x + 1, y + 2, w, h);
  ctx.fillStyle = LINO.tela; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = LINO.punto;                                               // trama de punto de cruz
  for (let j = y + 2; j < y + h - 1; j += 3) for (let i = x + 2; i < x + w - 1; i += 3) ctx.fillRect(i, j, 1, 1);
  ctx.fillStyle = LINO.hilvan;                                              // hilvan rosa arriba y abajo
  for (let i = x + 8; i < x + w - 3; i += 4) { ctx.fillRect(i, y + 2, 2, 1); ctx.fillRect(i, y + h - 3, 2, 1); }
  ctx.fillStyle = COLOR.ciruela;                                            // bordes cortados con tijeras de zigzag
  for (let i = x; i <= x + w; i++) { const z = (i - x) % 2; ctx.fillRect(i, y - 1 + z, 1, 1); ctx.fillRect(i, y + h - z, 1, 1); }
  for (let j = y; j < y + h; j++) ctx.fillRect(x + w - ((j - y) % 2), j, 1, 1);
  const pulso = Sonido.pulso(), brillo = 1 - pulso;
  geo.botones.forEach((b, i) => {
    if (i < tj.i) { puntoDeLana(tj, b, i === tj.i - 1 && tj.golpe < 0.25 ? 1 - tj.golpe / 0.25 : 0); return; }
    const actual = i === tj.i, tiembla = actual && tj.fallo > 0 ? Math.round(Math.sin(tj.fallo * 70)) : 0;
    const by = b.y - (actual && pulso < 0.18 ? 1 : 0);
    dibujarBoton(b.x + tiembla, by, b.dir, actual ? brillo : brillo * 0.25, actual, tj.calor);
    if (actual && tj.fallo > 0) {                                           // un ricito de lana enredada (sin drama)
      ctx.fillStyle = mezclarColor(tj.tinte.color, '#3A2840', 0.3);
      for (let a = 0; a < 6.2; a += 0.6) ctx.fillRect(Math.round(b.x + 9 + Math.cos(a) * 2), Math.round(b.y - 2 + Math.sin(a) * 2), 1, 1);
    }
  });
}
// Boton de costura de 11x11: borde levantado con luz arriba a la izquierda, centro hundido y la flecha cosida.
function dibujarBoton(x, y, dir, brillo, actual, calor) {
  const c = BOTONES_TEJER[dir];
  if (actual) {                                                             // halo que late al pulso de la musica
    ctx.save(); ctx.globalAlpha *= 0.35 + 0.45 * brillo;
    ctx.fillStyle = c.luz; disco(x + 5, y + 5, 7 + (calor > 0.5 ? 1 : 0));
    ctx.restore();
  }
  for (let dy = 0; dy < 11; dy++) for (let dx = 0; dx < 11; dx++) {
    const ex = dx - 5, ey = dy - 5, d = Math.hypot(ex, ey);
    if (d > 5.5) continue;
    const l = (-ex - ey) / 7;
    ctx.fillStyle = d > 4.6 ? COLOR.ciruela : d > 3.4 ? (l > 0.15 ? c.luz : l < -0.2 ? c.sombra : c.base) : (l > 0.3 ? c.base : mezclarColor(c.base, c.sombra, 0.35));
    ctx.fillRect(x + dx, y + dy, 1, 1);
  }
  if (brillo > 0) {                                                         // se ilumina en cada pulso
    ctx.save(); ctx.globalAlpha *= brillo * 0.5;
    ctx.fillStyle = '#FFFFFF'; disco(x + 5, y + 5, 3);
    ctx.restore();
  }
  mapaBits(FLECHA_BOTON, x + 3, y + 3, COLOR.ciruela, dir);
  if (actual) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 2, y + 2, 1, 1); }
}
// Un boton ya tejido: dos "V" de punto de media en el color de la lana (pop al aparecer).
function puntoDeLana(tj, b, pop) {
  const c = tj.tinte.color, borde = mezclarColor(c, '#3A2840', 0.55), luz = mezclarColor(c, '#FFF6D6', 0.45);
  for (const oy of [1, 5]) {
    mapaBits(PUNTO_LANA, b.x + 2, b.y + oy + 1, borde);
    mapaBits(PUNTO_LANA, b.x + 2, b.y + oy, c);
    ctx.fillStyle = luz; ctx.fillRect(b.x + 2, b.y + oy, 1, 1); ctx.fillRect(b.x + 6, b.y + oy, 1, 1);
  }
  if (pop > 0) {                                                            // anillo que se abre
    ctx.save(); ctx.globalAlpha *= pop;
    ctx.fillStyle = '#FFFFFF';
    const r = Math.round(4 + (1 - pop) * 4);
    for (let a = 0; a < 6.28; a += 0.4) ctx.fillRect(Math.round(b.x + 5 + Math.cos(a) * r), Math.round(b.y + 5 + Math.sin(a) * r), 1, 1);
    ctx.restore();
  }
}
// Bastidor redondo: aro de madera con su tornillo de laton y, dentro, el lino con el patron de la prenda a lapiz;
// los puntos ya tejidos se ven de lana (con relieve), los nuevos destellan y en racha pasa un brillo por la lana.
let lienzoAro = null;
function aroVacio(r) {
  if (lienzoAro && lienzoAro.r === r) return lienzoAro.c;
  const c = document.createElement('canvas'), L = 2 * r + 8;
  c.width = c.height = L;
  const x = c.getContext('2d'), m = L / 2;
  for (let py = 0; py < L; py++) for (let px = 0; px < L; px++) {
    const dx = px + 0.5 - m, dy = py + 0.5 - m, d = Math.hypot(dx, dy);
    let col = null;
    if (d <= r + 1.5 && d > r + 0.5) col = COLOR.ciruela;
    else if (d <= r + 0.5 && d > r - 3) { const l = (-dx - dy) / d; col = l > 0.45 ? ARO.luz : l < -0.45 ? ARO.sombra : ARO.base; }
    else if (d <= r - 3 && d > r - 4) col = COLOR.ciruela;
    else if (d <= r - 4) col = (px % 3 === 1 && py % 3 === 1) ? LINO.punto : d > r - 5.5 && dy < 0 ? '#EFE2D2' : LINO.tela;   // sombrita del aro
    if (col) { x.fillStyle = col; x.fillRect(px, py, 1, 1); }
  }
  lienzoAro = { r, c };
  return c;
}
function dibujarAroTejer(tj, aro) {
  const { cx, cy, r } = aro, m = celdasMolde(tj.prenda.id), ox = cx - m.ancho, oy = cy - m.alto;
  const bote = tj.golpe < 0.15 ? 1 : 0;
  ctx.fillStyle = 'rgba(74, 51, 71, 0.25)'; disco(cx + 1, cy + 2, r + 1);
  if (tj.calor > 0.3) { ctx.save(); ctx.globalAlpha *= tj.calor * 0.6; ctx.fillStyle = COLOR.mantequilla; disco(cx, cy - bote, r + 3); ctx.restore(); }
  const L = 2 * r + 8;
  ctx.drawImage(aroVacio(r), cx - L / 2, cy - L / 2 - bote);
  // tornillo de laton arriba
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(cx - 3, cy - r - 4 - bote, 7, 5); ctx.fillRect(cx - 1, cy - r - 6 - bote, 3, 2);
  ctx.fillStyle = ARO.laton; ctx.fillRect(cx - 2, cy - r - 3 - bote, 5, 3);
  ctx.fillStyle = ARO.latonLuz; ctx.fillRect(cx - 2, cy - r - 3 - bote, 5, 1);
  const c = tj.tinte.color;
  const tonos = { '#': c, '=': mezclarColor(c, '#5B3F7A', 0.18), '*': mezclarColor(c, '#FFF6D6', 0.6) };
  const hechos = Math.floor(tj.mostrados), f = tj.flash;
  m.celdas.forEach((o, i) => {
    const x = ox + o.c * 2, y = oy + o.r * 2 - bote;
    if (i >= hechos) { ctx.fillStyle = '#E3CDBB'; ctx.fillRect(x, y, 1, 1); return; }   // el patron, a lapiz
    const base = tonos[o.ch];
    ctx.fillStyle = mezclarColor(base, '#FFF6D6', 0.45); ctx.fillRect(x, y, 1, 1);
    ctx.fillStyle = base; ctx.fillRect(x + 1, y, 1, 1); ctx.fillRect(x, y + 1, 1, 1);
    ctx.fillStyle = mezclarColor(base, '#5B3F7A', 0.3); ctx.fillRect(x + 1, y + 1, 1, 1);
    const destello = f && f.t < 0.3 && i >= f.desde && i < f.hasta;
    const brilla = tj.calor > 0.25 && ((o.c + o.r - estado.reloj * 10) % 12 + 12) % 12 < 1.5;
    if (destello || brilla) {
      ctx.save(); ctx.globalAlpha *= destello ? 1 - f.t / 0.3 : tj.calor * 0.6;
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, 2, 2);
      ctx.restore();
    }
  });
}
// La aguja de coser sobre el boton que toca, con el hilo que viene del bastidor.
function dibujarAgujaTejer(tj, geo) {
  const b = geo.botones[tj.i];
  if (!b) return;
  const pulso = Sonido.pulso(), nx = b.x + 5, ny = b.y - 9 + (pulso < 0.18 ? 1 : 0);
  hilo(geo.aro.cx + geo.aro.r - 3, geo.aro.cy - 8, nx, ny + 1, -3, tj.tinte.color);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(nx - 1, ny - 1, 3, 8);
  ctx.fillStyle = '#DCD5E3'; ctx.fillRect(nx, ny, 1, 6);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(nx, ny + 1, 1, 1);           // ojo de la aguja
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(nx, ny + 3, 1, 1);
}
// El reloj de tejer: un ovillo que se va deshaciendo (mas pequeno cuanto menos tiempo queda). Tiembla al fallar.
function dibujarOvilloReloj(tj, geo) {
  const k = tj.tiempo / tj.tiempoMax, r = Math.max(1, Math.round(2 + 7 * k));
  const tiembla = tj.menos > 0 ? Math.round(Math.sin(tj.menos * 50) * 1.5) : k < 0.25 ? Math.round(Math.sin(estado.reloj * 9)) : 0;
  const x = geo.ovillo.x + tiembla, y = geo.ovillo.y + 9 - r;
  hilo(geo.tira.x + geo.tira.w, geo.tira.y + 12, x - r + 1, y + r - 1, 2, tj.tinte.color);
  ctx.fillStyle = 'rgba(74, 51, 71, 0.25)'; ctx.fillRect(x - r, y + r + 1, 2 * r + 1, 1);
  dibujarOvillo(x, y, r, tj.tinte.color, -estado.reloj * 2);
}
function dibujarEfectosTejer(tj) {
  for (const e of tj.efectos || []) {
    const a = Math.max(0, 1 - (e.t / e.vida) ** 2), x = Math.round(e.x + (e.tipo === 'nota' ? Math.sin(e.t * 6) * 1.5 : e.tipo === 'pelusa' ? Math.sin(e.t * 3) * 2 : 0)), y = Math.round(e.y);
    ctx.globalAlpha = a;
    if (e.tipo === 'nota') mapaBits(NOTA_MUSICA, x, y, e.color);
    else if (e.tipo === 'estrella') {
      ctx.fillStyle = e.color; ctx.fillRect(x, y, 1, 1);
      if (e.t < e.vida * 0.55) { ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); }
    } else { ctx.globalAlpha = a * 0.8; ctx.fillStyle = e.color; ctx.fillRect(x, y, 2, 2); }
  }
  ctx.globalAlpha = 1;
}

// ---------- HUD dibujado en el lienzo: bocadillo de accion, reloj del dia y barra de semillas ----------

// Iconos de 7x7 para el bocadillo (y sol, luna y nube para el reloj).
const ICONOS = {
  gota:    ['...#...', '..###..', '.#####.', '.#####.', '#######', '#######', '.#####.'],
  semilla: ['...##..', '..####.', '.######', '.######', '..####.', '...##..', '.......'],
  corazon: ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...', '.......'],
  anzuelo: ['....#..', '....#..', '....#..', '#...#..', '#...#..', '.#.#...', '..#....'],
  ovillo:  ['..###..', '.#...#.', '#.#.#.#', '#..#..#', '#.#.#.#', '.#...#.', '..###..'],
  casa:    ['...#...', '..###..', '.#####.', '#######', '.##.##.', '.##.##.', '.##.##.'],
  zzz:     ['####...', '..#....', '.#.....', '####...', '....###', '.....#.', '....###'],
  camisa:  ['##...##', '#######', '.#####.', '.#####.', '.#####.', '.#####.', '.......'],
  pez:     ['.......', '.###..#', '#####.#', '#.#####', '#####.#', '.###..#', '.......'],
  banco:   ['#......', '#......', '#......', '#######', '#######', '.#...#.', '.#...#.'],
  barca:   ['...#...', '...##..', '...###.', '...#...', '#######', '.#####.', '..###..'],
  concha:  ['.#####.', '#.#.#.#', '#.#.#.#', '#######', '.#####.', '..###..', '...#...'],
  estrella: ['...#...', '..###..', '#######', '.#####.', '..###..', '.##.##.', '.#...#.'],
  sol:     ['..###..', '.#####.', '#######', '#######', '#######', '.#####.', '..###..'],
  luna:    ['..###..', '.##....', '##.....', '##.....', '##.....', '.##....', '..###..'],
  nube:    ['...###.....', '..#####.##.', '.##########', '###########', '.#########.'],
  aguacate: ['..###..', '.#####.', '.##.##.', '###.###', '#######', '#######', '.#####.'],
  nota:     ['#######', '#.....#', '#.###.#', '#.....#', '#.##..#', '#.....#', '#######'],
  castillo: ['#.#.#.#', '#######', '.#####.', '.#.#.#.', '.#####.', '.##.##.', '#######'],
  pala:     ['....##.', '....##.', '.....#.', '....#..', '.##....', '###....', '.#.....'],
  burbuja:  ['.###...', '#..##..', '#...#..', '.###...', '....##.', '...#..#', '....##.'],
  arena:    ['#######', '.#...#.', '..#.#..', '...#...', '..#.#..', '.#####.', '#######'],
  hacha:    ['....##.', '...####', '....###', '...#.#.', '..#....', '.#.....', '#......'],
  radar:    ['#.....#', '.#...#.', '#######', '#.....#', '#.#.#.#', '#.....#', '#######'],
};
const GRIS = '#B9AFC4';
const ICONO_ACCION = {
  plantar: ['semilla', '#C98F6B'], regar: ['gota', '#6FA9D8'], cosechar: ['estrella', '#E8A85C'], pescar: ['anzuelo', COLOR.ciruela],
  tejer: ['ovillo', '#F28CA0'], sinTinte: ['ovillo', GRIS], vecino: ['corazon', '#F28CA0'], dormir: ['zzz', '#9F8BC9'],
  sinSueno: ['zzz', GRIS], armario: ['camisa', '#9F8BC9'], entrar: ['casa', '#E87F86'], salir: ['casa', '#E87F86'], pecera: ['pez', '#6FA9D8'], vitrina: ['estrella', '#E8A85C'],
  abonar: ['aguacate', '#4F7F57'], tablon: ['nota', '#E8A85C'], sentarse: ['banco', '#E8A85C'],
  tienda: ['concha', '#F28CA0'], barca: ['barca', '#6FA9D8'], desembarcar: ['barca', '#E8A85C'], sinBarca: ['barca', GRIS],
  concha: ['concha', '#F28CA0'], poza: ['pez', '#6FA9D8'], pozaVista: ['pez', GRIS], castillo: ['castillo', '#E8A85C'], botella: ['nota', '#6FA9D8'],
  talar: ['hacha', '#9C6B4E'], cavar: ['pala', '#C98F6B'], excavar: ['pala', '#C98F6B'], sinPala: ['pala', GRIS], rescatar: ['corazon', '#F28CA0'], cofre: ['estrella', '#E8A85C'], cofreVacio: ['estrella', GRIS],
  bucear: ['burbuja', '#6FA9D8'], sinGafas: ['burbuja', GRIS], subir: ['burbuja', '#E8A85C'], ostra: ['concha', '#C5B4E3'], ostraVista: ['concha', GRIS],
  plantarCoral: ['semilla', '#E87F86'], sinCoral: ['semilla', GRIS], coralCrece: ['semilla', GRIS], cuidarCoral: ['corazon', '#E87F86'],
};

// Casilla sobre la que actua cada accion (donde flota el bocadillo). null = sobre la gatita.
function objetivoDe(accion) {
  switch (accion) {
    case 'pescar': return aguaCercana();
    case 'tejer': case 'sinTinte': return cestaCercana();
    case 'vecino': return vecinoCercano();
    case 'dormir': case 'sinSueno': return vecina(esCama) || INTERIOR.cama;   // la casilla de la cama que tiene al lado
    case 'armario': return INTERIOR.armario;
    case 'tablon': return TABLON;
    case 'sentarse': return vecina(bancoEn);
    case 'tienda': return vecina(esTienda);
    case 'barca': case 'sinBarca': return sitioBarca();
    case 'desembarcar': return enAmarre() ? { c: EMBARCADERO.c, f: EMBARCADERO.punta } : orillaCercana();
    case 'concha': return aquiOCerca(cosaPlayaEn);
    case 'cavar': return aquiOCerca(esTesoroX);
    case 'excavar': case 'sinPala': return sitioCercano();
    case 'talar': return vecina(arbolTalable);
    case 'botella': return aquiOCerca(botellaEn);
    case 'rescatar': return aquiOCerca(rescateEn);
    case 'poza': case 'pozaVista': return vecina((c, f) => pozaEn(c, f) >= 0);
    case 'cofre': case 'cofreVacio': return COFRE;
    case 'ostra': case 'ostraVista': return vecina((c, f) => ostraEn(c, f) >= 0);
    case 'castillo': return castilloPosible();
    case 'entrar': return CASA.puerta;
    case 'salir': return INTERIOR.salida;
    case 'pecera': case 'vitrina': return peceraCercana();
    default: return null;
  }
}

// Bocadillo: la tecla Espacio y el icono de lo que pasara. Si no se puede (sin tinte, sin sueno), solo el icono en gris.
function dibujarBocadillo() {
  if (!nadaAbierto() || estado.bolsa || estado.ajustes || estado.enciclopedia) return;
  const accion = accionPosible(), icono = ICONO_ACCION[accion];
  if (!icono) return;
  const o = objetivoDe(accion), g = estado.gata, bloqueada = icono[1] === GRIS;
  const ancho = bloqueada ? 11 : 21, alto = 11;
  let x, y;
  if (!o) { x = g.x + 8 - ancho / 2; y = g.y - 10; }
  else if (accion === 'vecino') { x = o.c * T + 15; y = o.f * T - 4; }   // al lado, para no tapar su pedido
  else { x = o.c * T + 8 - ancho / 2; y = o.f * T - 13; }
  x = Math.round(x); y = Math.round(y + Math.sin(estado.reloj * 3));
  panel(x, y, ancho, alto);
  ctx.fillStyle = COLOR.ciruela;
  ctx.fillRect(x + Math.floor(ancho / 2) - 1, y + alto, 3, 1);
  ctx.fillRect(x + Math.floor(ancho / 2), y + alto + 1, 1, 1);
  if (bloqueada) { mapaBits(ICONOS[icono[0]], x + 2, y + 2, GRIS); return; }
  // Tecla Espacio: una teclita con el simbolo de espacio.
  ctx.fillRect(x + 2, y + 2, 9, 7);
  ctx.fillStyle = COLOR.algodon; ctx.fillRect(x + 3, y + 3, 7, 4);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + 4, y + 5, 5, 1); ctx.fillRect(x + 4, y + 4, 1, 1); ctx.fillRect(x + 8, y + 4, 1, 1);
  mapaBits(ICONOS[icono[0]], x + 12, y + 2, icono[1]);
}

// ---------- Reloj del dia: un arco de madera tallada con su cielo dentro
// Capas, de atras hacia delante: cielo (degradado por bandas, cambia con la hora) -> estrellas -> camino del astro,
// resplandor y sol o luna -> nubes -> colinas con la casita -> lluvia; todo eso se recorta con la mascara del arco.
// Encima, el marco (cacheado) y los adornos que se mueven: pajarito de dia o buho de noche y el pendulo de bellota.
// El sol sale por la izquierda (hora 0) y se pone por la derecha (0.65); la luna hace lo mismo de noche.
const RELOJ = { w: 36, h: 39, cx: 18, base: 23, cielo: 11, madera: 14.3, borde: 15.3 };
const CIELOS_RELOJ = {
  manana:   { alto: '#F6B3A6', medio: '#FFD3B0', bajo: '#FFF0B8', lejos: '#CFE6A8', cerca: '#A6D48E', nube: '#FFF8EE' },
  mediodia: { alto: '#79BDE8', medio: '#A9D8E8', bajo: '#DDF3F0', lejos: '#BFE3B4', cerca: '#8FC98A', nube: '#FFFFFF' },
  tarde:    { alto: '#8E6FB8', medio: '#E890A8', bajo: '#FFB070', lejos: '#C99AA8', cerca: '#A27792', nube: '#FFD0C0' },
  noche:    { alto: '#232650', medio: '#343A6E', bajo: '#4E4F8A', lejos: '#3D4E74', cerca: '#2E3A5E', nube: '#5A5F8E' },
  lluvia:   { alto: '#8E98B4', medio: '#AEB8CE', bajo: '#C9D0DE', lejos: '#9DB8A4', cerca: '#7E9E8A', nube: '#D6DBE6' },
};
// Momentos clave del cielo: entre dos se mezcla poco a poco.
const HORAS_CIELO = [[0, 'manana'], [0.1, 'manana'], [0.2, 'mediodia'], [0.5, 'mediodia'], [0.58, 'tarde'], [0.64, 'tarde'],
  [0.72, 'noche'], [0.92, 'noche'], [0.98, 'manana'], [1, 'manana']];
const mezclarCielo = (a, b, k) => Object.fromEntries(Object.keys(a).map(n => [n, mezclarColor(a[n], b[n], k)]));
function cieloReloj(hora, lluvia) {
  let i = 0;
  while (i < HORAS_CIELO.length - 2 && hora >= HORAS_CIELO[i + 1][0]) i++;
  const [h0, a] = HORAS_CIELO[i], [h1, b] = HORAS_CIELO[i + 1];
  const cielo = mezclarCielo(CIELOS_RELOJ[a], CIELOS_RELOJ[b], suave(h0, h1, hora));
  return mezclarCielo(cielo, CIELOS_RELOJ.lluvia, lluvia * 0.65 * (1 - oscuridad(hora) * 0.7));
}
const SOL_RELOJ = { borde: '#E0803A', sombra: '#F5B04F', base: '#FFD86A', luz: '#FFF3B8' };
const LUNA_RELOJ = { borde: '#9C8BB0', sombra: '#E3D3B5', base: '#FFF4DC', luz: '#FFFFFF' };
const MADERA_RELOJ = { ...ARO, veta: '#D19858', hondo: '#8E6450' };
const PAJARITO_RELOJ = ['.bbb..', 'bbbeb.', 'bwwbbk', '.bbbb.', '..f.f.'];
const BUHO_RELOJ = ['h.....h', 'hhhhhhh', 'hyyhyyh', 'hyphyph', 'hffkffh', '.hfffh.', '..g.g..'];
const BELLOTA_RELOJ = ['..s..', '.cCc.', 'ccccc', '.lnn.', '.nnd.', '..d..'];
const NUBE_RELOJ = ['..##...', '.####.#', '#######'];
const TINTAS_PAJARITO = { b: '#A9D8E8', e: COLOR.ciruela, w: '#6FA9D8', k: '#E8A85C', f: '#E8A85C' };
const TINTAS_BUHO = { h: '#B98A6E', y: '#FFE08A', p: COLOR.ciruela, f: '#F3D6AE', k: '#E8A85C', g: '#E8A85C' };
const TINTAS_BELLOTA = { s: '#8A5A44', c: '#B98A6E', C: '#8E6450', l: '#F5CB8E', n: '#E2A866', d: '#C98F4E' };
const TINTAS_HIEDRA = { h: COLOR.salvia, l: '#BFE3B4', r: '#F7A6B4', y: '#FFE08A' };

const lienzoReloj = () => Object.assign(document.createElement('canvas'), { width: RELOJ.w, height: RELOJ.h });
const distReloj = (x, y) => Math.hypot(x + 0.5 - RELOJ.cx, y + 0.5 - RELOJ.base);
const anguloReloj = (x, y) => Math.atan2(RELOJ.base - y - 0.5, x + 0.5 - RELOJ.cx);    // 0 a la derecha, PI a la izquierda
const dentroReloj = (x, y) => y < RELOJ.base && distReloj(x, y) <= RELOJ.cielo;
function pixelReloj(k, x, y, color) { k.fillStyle = color; k.fillRect(x, y, 1, 1); }
// Mapa de letras con contorno ciruela alrededor (menos las letras de "sueltas", como las patitas).
function bitsReloj(k, bits, tintas, x, y, sueltas = '') {
  k.fillStyle = COLOR.ciruela;
  bits.forEach((fila, j) => [...fila].forEach((l, i) => {
    if (l !== '.' && !sueltas.includes(l)) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) k.fillRect(x + i + dx, y + j + dy, 1, 1);
  }));
  bits.forEach((fila, j) => [...fila].forEach((l, i) => { if (l !== '.') pixelReloj(k, x + i, y + j, tintas[l]); }));
}

// Mascara: solo se ve el cielo que queda dentro del arco.
function mascaraReloj() {
  const c = lienzoReloj(), k = c.getContext('2d');
  k.fillStyle = '#000';
  for (let y = 0; y < RELOJ.base; y++) for (let x = 0; x < RELOJ.w; x++) if (dentroReloj(x, y)) k.fillRect(x, y, 1, 1);
  return c;
}
// Marco: arco de dovelas talladas (surco oscuro y bisel claro entre piezas), luz arriba a la izquierda,
// tachuelas de laton al amanecer, al mediodia y al anochecer, hiedra con una florecita y la repisa de abajo.
function marcoReloj() {
  const c = lienzoReloj(), k = c.getContext('2d'), M = MADERA_RELOJ, { cx, base } = RELOJ, PIEZA = Math.PI / 7;
  for (let y = 0; y < base; y++) for (let x = 0; x < RELOJ.w; x++) {
    const d = distReloj(x, y), a = anguloReloj(x, y);
    if (d > RELOJ.borde || d <= RELOJ.cielo) continue;
    if (d > RELOJ.madera) { pixelReloj(k, x, y, COLOR.ciruela); continue; }
    if (d <= RELOJ.cielo + 1) { pixelReloj(k, x, y, M.hondo); continue; }       // sombra del canto de dentro
    const s = a / PIEZA, n = Math.round(s), lejos = (s - n) * d * PIEZA;         // pixeles hasta el surco mas cercano
    if (n > 0 && n < 7 && Math.abs(lejos) < 0.6) { pixelReloj(k, x, y, M.sombra); continue; }
    if (n > 0 && n < 7 && lejos > 0 && lejos < 1.6) { pixelReloj(k, x, y, M.luz); continue; }
    const luz = (d - RELOJ.cielo - 1) / 2.3 + Math.cos(a - 2.3) * 0.45;
    pixelReloj(k, x, y, luz > 1 ? M.luz : luz > 0.35 ? ((x * 7 + y * 3) % 13 ? M.base : M.veta) : M.sombra);
  }
  for (const grados of [180, 90, 0]) {                                           // tachuelas de laton
    const a = grados * Math.PI / 180, x = Math.round(cx + 12.9 * Math.cos(a)) - 1, y = Math.round(base - 12.9 * Math.sin(a)) - 1;
    pixelReloj(k, x, y, M.latonLuz); pixelReloj(k, x + 1, y, M.laton); pixelReloj(k, x, y + 1, M.laton); pixelReloj(k, x + 1, y + 1, M.sombra);
  }
  // Repisa de pino con dos clavitos
  for (let x = 2; x < RELOJ.w - 2; x++) {
    pixelReloj(k, x, base, COLOR.ciruela); pixelReloj(k, x, base + 4, COLOR.ciruela);
    pixelReloj(k, x, base + 1, M.luz); pixelReloj(k, x, base + 2, x % 7 === 3 ? M.veta : M.base); pixelReloj(k, x, base + 3, M.sombra);
  }
  for (let y = base + 1; y < base + 4; y++) { pixelReloj(k, 1, y, COLOR.ciruela); pixelReloj(k, RELOJ.w - 2, y, COLOR.ciruela); }
  pixelReloj(k, 4, base + 2, M.laton); pixelReloj(k, RELOJ.w - 5, base + 2, M.laton);
  // Hiedra que trepa por la izquierda, con una florecita, y dos hojas a la derecha
  const hoja = [['.lh', 'hh.'], ['hl.', '.hh']], flor = ['.r.', 'ryr', '.r.'];
  for (const [grados, dibujo] of [[170, hoja[0]], [157, hoja[1]], [144, hoja[0]], [129, flor], [24, hoja[1]], [11, hoja[0]]]) {
    const a = grados * Math.PI / 180;
    bitsReloj(k, dibujo, TINTAS_HIEDRA, Math.round(cx + 14.8 * Math.cos(a)) - 1, Math.round(base - 14.8 * Math.sin(a)) - 1);
  }
  return c;
}
// Cielo por bandas con tramado en los cambios, y las colinas con la casita (su ventana se enciende de noche).
function pintarFondoReloj(p, hora, lluvia) {
  const cielo = p.cielo = cieloReloj(hora, lluvia), { cx, base } = RELOJ, arriba = base - RELOJ.cielo;
  const k = p.fondo.getContext('2d'), kc = p.colinas.getContext('2d');
  k.clearRect(0, 0, RELOJ.w, RELOJ.h); kc.clearRect(0, 0, RELOJ.w, RELOJ.h);
  const tono = t => t < 0.5 ? mezclarColor(cielo.alto, cielo.medio, t * 2) : mezclarColor(cielo.medio, cielo.bajo, (t - 0.5) * 2);
  const bandas = [0, 1, 2, 3, 4].map(b => tono(b / 4));
  for (let y = arriba; y < base; y++) for (let x = cx - RELOJ.cielo - 1; x <= cx + RELOJ.cielo; x++) {
    const t = (y - arriba) / (base - arriba - 1), b = Math.floor(t * 4 + ((x + y) % 2 ? 0.2 : -0.2) + 0.5);
    pixelReloj(k, x, y, bandas[Math.max(0, Math.min(4, b))]);
  }
  const lejos = x => base - 4 + Math.round(Math.sin(x * 0.45 + 1)), cerca = x => base - 2 + Math.round(Math.sin(x * 0.3 + 3) * 0.8);
  const brillo = mezclarColor(cielo.cerca, '#FFFFFF', 0.2);
  for (let x = 0; x < RELOJ.w; x++) {
    kc.fillStyle = cielo.lejos; kc.fillRect(x, lejos(x), 1, base - lejos(x));
    kc.fillStyle = cielo.cerca; kc.fillRect(x, cerca(x), 1, base - cerca(x));
    pixelReloj(kc, x, cerca(x), brillo);
  }
  const osc = oscuridad(hora), hx = cx + 4, hy = cerca(cx + 6) - 3, oscura = c => mezclarColor(c, cielo.cerca, 0.15 + osc * 0.45);
  kc.fillStyle = oscura('#E87F86'); kc.fillRect(hx + 1, hy - 1, 3, 1); kc.fillRect(hx, hy, 5, 1);          // tejadito
  kc.fillStyle = oscura('#FFF4E0'); kc.fillRect(hx + 1, hy + 1, 3, 2);                                  // pared
  pixelReloj(kc, hx + 2, hy + 1, osc > 0.5 ? '#FFE08A' : oscura('#A9D8E8'));                            // ventanita
}
// Estrellas que titilan: unas pocas en sitios fijos dentro del arco.
const ESTRELLAS_RELOJ = Array.from({ length: 40 }, (_, i) => [7 + (i * 7) % 22, 12 + (i * 5) % 7])
  .filter(([x, y]) => distReloj(x, y) < RELOJ.cielo - 1.5 && y < RELOJ.base - 5).slice(0, 9);
function estrellasReloj(k, osc, lluvia, t) {
  const alfa = osc * (1 - lluvia * 0.8);
  if (alfa < 0.05) return;
  ESTRELLAS_RELOJ.forEach(([x, y], i) => {
    const b = 0.5 + 0.5 * Math.sin(t * 2.2 + i * 1.7);
    k.globalAlpha = alfa * (0.35 + b * 0.65);
    if (b > 0.95) { k.fillStyle = '#9E9AD6'; k.fillRect(x - 1, y, 3, 1); k.fillRect(x, y - 1, 1, 3); }   // destello en cruz
    pixelReloj(k, x, y, '#FFFFFF');
  });
  k.globalAlpha = 1;
}
// Disco sombreado de 7x7: luz arriba a la izquierda, sombra calida hacia abajo a la derecha.
function discoReloj(tintas) {
  const c = Object.assign(document.createElement('canvas'), { width: 7, height: 7 }), k = c.getContext('2d');
  for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
    const dx = x - 3, dy = y - 3, d = Math.hypot(dx, dy);
    if (d > 3.6) continue;
    const s = d + (dx + dy) * 0.4;
    pixelReloj(k, x, y, d > 3.1 ? tintas.borde : s < 1.2 ? tintas.luz : s < 3.3 ? tintas.base : tintas.sombra);
  }
  return c;
}
let piezasDelReloj = null;
function piezasReloj() {
  return piezasDelReloj || (piezasDelReloj = { fondo: lienzoReloj(), colinas: lienzoReloj(), capa: lienzoReloj(),
    mascara: mascaraReloj(), marco: marcoReloj(), sol: discoReloj(SOL_RELOJ), luna: discoReloj(LUNA_RELOJ), clave: '' });
}
// Camino del astro: un medio ovalo que nace y muere detras de las colinas.
const caminoReloj = p => ({ x: RELOJ.cx - 8 * Math.cos(p * Math.PI), y: RELOJ.base + 1 - 7.5 * Math.sin(p * Math.PI) });
function astroReloj(k, p, hora, t) {
  const dia = hora < 0.65, q = dia ? hora / 0.65 : (hora - 0.65) / 0.35, a = caminoReloj(q);
  const x = Math.round(a.x), y = Math.round(a.y);
  // Puntitos del camino que le queda: cuanto mas corto, menos falta para que cambie.
  k.fillStyle = dia ? '#FFFFFF' : '#FFF4DC'; k.globalAlpha = 0.45;
  for (let r = q + 0.1; r < 1; r += 0.1) { const b = caminoReloj(r); k.fillRect(Math.round(b.x), Math.round(b.y), 1, 1); }
  // Resplandor tramado alrededor (el del sol late despacio)
  const halo = dia ? 6 + Math.sin(t * 2) * 0.5 : 5;
  k.fillStyle = dia ? '#FFF6C9' : '#D9D2F5';
  for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
    const d = Math.hypot(dx, dy);
    if (d < 3.6 || d > halo || (dx + dy + 40) % 2) continue;
    k.globalAlpha = (dia ? 0.55 : 0.3) * (1 - (d - 3.6) / (halo - 3.6));
    k.fillRect(x + dx, y + dy, 1, 1);
  }
  k.globalAlpha = 1;
  if (dia) {
    for (let i = 0; i < 8; i++) {                                                // rayitos que giran despacio
      const g = i * Math.PI / 4 + t * 0.5, largo = i % 2 ? 1 : 1 + (Math.sin(t * 3) > 0 ? 1 : 0);
      for (let r = 0; r < largo; r++) pixelReloj(k, Math.round(x + Math.cos(g) * (4.8 + r)), Math.round(y + Math.sin(g) * (4.8 + r)), '#FFE08A');
    }
    k.drawImage(p.sol, x - 3, y - 3);
    pixelReloj(k, x - 1, y, COLOR.ciruela); pixelReloj(k, x + 1, y, COLOR.ciruela); pixelReloj(k, x, y + 1, COLOR.ciruela);
    pixelReloj(k, x - 2, y + 1, '#F28CA0'); pixelReloj(k, x + 2, y + 1, '#F28CA0');
  } else {
    // Luna llena dormilona: ojitos cerrados, mofletes, gorrito de dormir y, de vez en cuando, un bostezo.
    k.drawImage(p.luna, x - 3, y - 3);
    pixelReloj(k, x + 2, y - 2, LUNA_RELOJ.sombra); pixelReloj(k, x + 1, y + 2, LUNA_RELOJ.sombra);   // crateres
    k.fillStyle = COLOR.ciruela; k.fillRect(x - 2, y, 2, 1); k.fillRect(x + 1, y, 2, 1);
    const bosteza = t % 9 > 7.6;
    k.fillRect(x, y + 1, 1, bosteza ? 2 : 1);
    pixelReloj(k, x - 2, y + 1, '#F7A6B4'); pixelReloj(k, x + 2, y + 1, '#F7A6B4');
    k.fillStyle = COLOR.rosa; k.fillRect(x - 2, y - 3, 4, 1); k.fillRect(x - 1, y - 4, 3, 1); k.fillRect(x + 1, y - 5, 2, 1);
    pixelReloj(k, x + 3, y - 5, COLOR.crema);
  }
}
function nubesReloj(k, cielo, osc, lluvia, t) {
  const cuantas = lluvia > 0.4 ? 3 : 2, baja = mezclarColor(cielo.nube, cielo.alto, 0.35);
  k.globalAlpha = Math.min(1, 1 - osc * 0.55 + lluvia * 0.3);
  for (let i = 0; i < cuantas; i++) {
    const x = Math.round(((t * 1.2 + i * 17) % 40) - 8), y = 13 + i * 3;
    NUBE_RELOJ.forEach((fila, j) => [...fila].forEach((l, n) => { if (l === '#') pixelReloj(k, x + n, y + j, j === 2 ? baja : cielo.nube); }));
  }
  k.globalAlpha = 1;
}
function gotasReloj(k, lluvia, t) {
  k.fillStyle = '#8FB8E0';
  for (let i = 0; i < Math.round(lluvia * 7); i++) k.fillRect(7 + (i * 5) % 22, 12 + Math.floor((t * 14 + i * 3.7) % 11), 1, 2);
}
// Inquilino del arco: un pajarito de dia (da saltitos y parpadea; con lluvia se resguarda) y un buho de noche.
function inquilinoReloj(k, x, y, osc, lluvia, t) {
  if (osc > 0.5) {
    const parpadea = t % 4 < 0.2;
    const bits = parpadea ? BUHO_RELOJ.map((f, j) => j === 2 ? 'hhhhhhh' : j === 3 ? 'hpphpph' : f) : BUHO_RELOJ;
    bitsReloj(k, bits, TINTAS_BUHO, x + RELOJ.cx - 3, y + 1, 'g');
  } else if (lluvia < 0.5) {
    const salta = t % 5 < 0.15 ? 1 : 0, parpadea = t % 3.3 < 0.15;
    bitsReloj(k, parpadea ? PAJARITO_RELOJ.map(f => f.replace('e', 'b')) : PAJARITO_RELOJ, TINTAS_PAJARITO, x + RELOJ.cx + 1, y + 3 - salta, 'f');
  }
}
// Pendulo de bellota colgado de la repisa: se mece de lado a lado.
function penduloReloj(k, x, y, t) {
  const gancho = RELOJ.base + 5, dx = Math.round(Math.sin(t * 2.4) * 1.5);
  for (let r = 0; r < 3; r++) pixelReloj(k, x + RELOJ.cx + Math.round(dx * (r + 1) / 4), y + gancho + r, MADERA_RELOJ.hondo);
  bitsReloj(k, BELLOTA_RELOJ, TINTAS_BELLOTA, x + RELOJ.cx - 2 + dx, y + gancho + 3);
}
function pintarReloj(destino, x, y, hora, lluvia, t) {
  const p = piezasReloj(), k = p.capa.getContext('2d'), osc = oscuridad(hora);
  const clave = Math.round(hora * 400) + '_' + Math.round(lluvia * 20);
  if (clave !== p.clave) { p.clave = clave; pintarFondoReloj(p, hora, lluvia); }
  k.clearRect(0, 0, RELOJ.w, RELOJ.h);
  k.drawImage(p.fondo, 0, 0);
  estrellasReloj(k, osc, lluvia, t);
  astroReloj(k, p, hora, t);
  nubesReloj(k, p.cielo, osc, lluvia, t);
  k.drawImage(p.colinas, 0, 0);
  if (lluvia > 0.3) gotasReloj(k, lluvia, t);
  k.globalCompositeOperation = 'destination-in'; k.drawImage(p.mascara, 0, 0); k.globalCompositeOperation = 'source-over';
  destino.drawImage(p.capa, x, y);
  destino.drawImage(p.marco, x, y);
  inquilinoReloj(destino, x, y, osc, lluvia, t);
  penduloReloj(destino, x, y, t);
}
function dibujarReloj() { pintarReloj(ctx, 1, 0, estado.hora, estado.lluvia, estado.reloj); }

// Saquito de semillas: abierto, asoma por abajo en el centro con todas las semillas dentro; la elegida sube y brilla.
const BARRA_SEMILLAS = { casillas: Math.min(9, CULTIVOS.length), lado: 18, hueco: 2 };
function geometriaBarra() {
  const { casillas, lado, hueco } = BARRA_SEMILLAS;
  const ancho = casillas * lado + (casillas - 1) * hueco;
  const inicio = Math.max(0, Math.min(CULTIVOS.length - casillas, estado.semilla - 2));
  const baja = Math.round((1 - estado.saquitoT) * (lado + 16));   // sube desde abajo al abrirlo
  return { x0: Math.round((lienzo.width - ancho) / 2), y0: lienzo.height - lado - 3 + baja, ancho, inicio };
}
// Dentro de casa no hay tierra donde plantar: el saquito se guarda y deja libre la salida.
const barraVisible = () => !estado.inicio && regionDe(casillaActual().f).id === 'valle' && !estado.tejer && !estado.decorar && !estado.pecera && !estado.dialogo && !(estado.pesca && estado.pesca.fase === 'tirar');
function casillaBarra(x, y) {
  if (!estado.saquito || !barraVisible()) return -1;
  const { lado, hueco, casillas } = BARRA_SEMILLAS, { x0, y0, inicio } = geometriaBarra();
  if (y < y0 - 2 || y > y0 + lado) return -1;
  const i = Math.floor((x - x0) / (lado + hueco));
  return i >= 0 && i < casillas && (x - x0) % (lado + hueco) < lado ? inicio + i : -1;
}
const LETRAS = { Q: ['###', '#.#', '#.#', '###', '..#'], R: ['##.', '#.#', '##.', '#.#', '#.#'] };
function teclita(x, y, letra, activa) {
  ctx.globalAlpha *= activa ? 1 : 0.5;
  panel(x, y, 9, 9);
  mapaBits(LETRAS[letra], x + 3, y + 2, COLOR.ciruela);
  ctx.globalAlpha /= activa ? 1 : 0.5;
}
// Saquito de arpillera abierto: boca doblada con un cordon rosa y lazo, tela con trama, y el fondo sale del lienzo.
const ARPILLERA = { tela: '#FFD3B0', trama: '#F2BE95', doblez: '#E8A85C' };
function saquitoSemillas(x, y, ancho) {
  // La boca es mas estrecha (fruncida por el cordon) y la tela se abomba hacia los lados al bajar.
  const metido = j => Math.max(0, 8 - j);
  for (let j = 0; y + j < lienzo.height; j++) {
    const m = metido(j);
    ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + m, y + j, ancho - 2 * m, 1);
    ctx.fillStyle = j < 6 ? ARPILLERA.doblez : ARPILLERA.tela; ctx.fillRect(x + m + 1, y + j, ancho - 2 * m - 2, 1);
  }
  // Borde de arriba ondulado: la tela fruncida hace bultitos.
  for (let i = x + 9; i < x + ancho - 9; i++) {
    ctx.fillStyle = COLOR.ciruela; ctx.fillRect(i, y - (i % 6 < 3 ? 1 : 0), 1, 1);
    if (i % 6 < 3) { ctx.fillStyle = ARPILLERA.doblez; ctx.fillRect(i, y, 1, 1); }
  }
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x + 7, y + 6, ancho - 14, 1);    // donde la boca se dobla
  ctx.fillStyle = ARPILLERA.trama;                                  // pliegues que bajan desde el frunce
  for (let i = x + 12; i < x + ancho - 12; i += 6) ctx.fillRect(i, y + 1, 1, 4);
  for (let j = y + 9; j < lienzo.height; j += 3)                    // trama de la tela: puntitos al tresbolillo
    for (let i = x + 3 + (j % 2) * 2; i < x + ancho - 2; i += 4) ctx.fillRect(i, j, 1, 1);
  ctx.fillStyle = '#F28CA0';                                        // cordon rosa con puntadas
  for (let i = x + 10; i < x + ancho - 10; i += 4) ctx.fillRect(i, y + 3, 2, 1);
  lacito(x + 6, y + 2);
}
// Lacito rosa en la esquina del saquito.
function lacito(x, y) {
  ctx.fillStyle = COLOR.ciruela;
  ctx.fillRect(x - 3, y - 2, 4, 5); ctx.fillRect(x + 2, y - 2, 4, 5); ctx.fillRect(x, y + 2, 3, 4);
  ctx.fillStyle = '#F7A6B4';
  ctx.fillRect(x - 2, y - 1, 2, 3); ctx.fillRect(x + 3, y - 1, 2, 3); ctx.fillRect(x + 1, y + 3, 1, 2);
  ctx.fillStyle = '#E87F86'; ctx.fillRect(x + 1, y, 1, 2);
}
// Alfiler de cabeza rosa clavado en la semilla elegida.
function alfiler(x, y) {
  ctx.fillStyle = '#B9AFC4'; ctx.fillRect(x, y, 1, 4);
  ctx.fillStyle = COLOR.ciruela; ctx.fillRect(x - 1, y - 4, 3, 3); ctx.fillRect(x - 2, y - 3, 5, 1);
  ctx.fillStyle = '#F28CA0'; ctx.fillRect(x - 1, y - 3, 3, 1); ctx.fillRect(x, y - 4, 1, 3);
  ctx.fillStyle = COLOR.crema; ctx.fillRect(x - 1, y - 3, 1, 1);
}
function dibujarBarraSemillas() {
  const { lado, hueco, casillas } = BARRA_SEMILLAS, { x0, y0, ancho, inicio } = geometriaBarra();
  saquitoSemillas(x0 - 16, y0 - 9, ancho + 32);
  for (let i = 0; i < casillas; i++) {
    const n = inicio + i, elegida = n === estado.semilla;
    const x = x0 + i * (lado + hueco), y = y0 - (elegida ? 2 : 0);
    panel(x, y, lado, lado);
    if (elegida) {
      ctx.fillStyle = COLOR.mantequilla; ctx.fillRect(x + 1, y + 1, lado - 2, lado - 2);
      ctx.fillStyle = Math.floor(estado.reloj * 2) % 2 ? COLOR.crema : '#E8A85C';   // borde que respira
      ctx.fillRect(x + 1, y + 1, lado - 2, 1); ctx.fillRect(x + 1, y + lado - 2, lado - 2, 1);
    }
    cuadro('iconos_cultivos', n, x + 1, y + 1);
    mapaBits(BITS[(n + 1) % 10], x + lado - 5, y + lado - 7, COLOR.ciruela);
    if (elegida) alfiler(x + lado - 4, y - 1);
  }
  teclita(x0 - 12, y0 + 4, 'Q', true);
  teclita(x0 + ancho + 3, y0 + 4, 'R', true);
}

function dibujarHud() {
  if (estado.inicio) return;
  if (estado.decorar) return;               // al decorar, el cajon ocupa el sitio del HUD
  ctx.globalAlpha = estado.alfaHud;
  dibujarReloj();
  if (barraVisible() && estado.saquitoT > 0.02) dibujarBarraSemillas();
  ctx.globalAlpha = 1;
}

// Minimapa: el valle entero a 2 pixeles por casilla, con la casa, los vecinos y la gatita.
let terrenoMapa = null;
function dibujarMapa() {
  const E = 1;
  if (!terrenoMapa) {
    terrenoMapa = document.createElement('canvas');
    terrenoMapa.width = ANCHO * E; terrenoMapa.height = ALTO * E;
    const x = terrenoMapa.getContext('2d');
    const tono = { G: '#BFE3B4', F: '#F7C6CE', T: '#C98F6B', W: '#A9D8E8', C: '#F3D9B1', M: '#E8A85C', B: '#E8A85C', Y: '#F8E6B8' };
    for (let f = 0; f < ALTO; f++) for (let c = 0; c < ANCHO; c++) {
      x.fillStyle = (c + ',' + f) in fijos ? COLOR.salvia : tono[tile(c, f)];
      x.fillRect(c * E, f * E, E, E);
    }
    x.fillStyle = '#E87F86';
    x.fillRect(CASA.c * E, CASA.f * E, 3 * E, 2 * E);
  }
  const mx = lienzo.width - ANCHO * E - 5, my = 28;   // debajo de los botones de arriba
  panel(mx - 2, my - 2, ANCHO * E + 4, ALTO * E + 4);
  ctx.drawImage(terrenoMapa, mx, my);
  ctx.fillStyle = '#F28CA0';
  for (const v of VECINOS) ctx.fillRect(mx + v.c * E, my + v.f * E, E, E);
  const aqui = casillaActual();
  ctx.fillStyle = Math.floor(estado.reloj * 3) % 2 ? COLOR.ciruela : COLOR.crema;   // la gatita parpadea
  ctx.fillRect(mx + aqui.c * E - 1, my + aqui.f * E - 1, E + 2, E + 2);
}

// Lluvia: un velo gris azulado y gotas que caen en diagonal (dentro de casa solo se nota el velo).
function dibujarLluvia(dentro) {
  const w = lienzo.width, h = lienzo.height, r = estado.reloj, k = estado.lluvia;
  ctx.globalAlpha = (dentro ? 0.08 : 0.16) * k;
  ctx.fillStyle = '#5E6F9E';
  ctx.fillRect(0, 0, w, h);
  if (!dentro) {
    ctx.fillStyle = '#E4F1F8';
    ctx.globalAlpha = 0.55 * k;
    for (let i = 0; i < 70; i++) {
      const vel = 150 + (i % 5) * 18;
      const y = ((i * 53.7 + r * vel) % (h + 20)) - 10;
      const x = ((i * 97.3 + r * vel * 0.25 - y * 0.25) % (w + 20) + w + 20) % (w + 20) - 10;
      ctx.fillRect(Math.round(x), Math.round(y), 1, 3);
    }
    // Salpicaduras pequenitas en el suelo.
    ctx.globalAlpha = 0.5 * k;
    for (let i = 0; i < 10; i++) {
      const t = (r * 2 + i * 0.37) % 1;
      if (t > 0.3) continue;
      const x = Math.round((i * 71.9 + Math.floor(r * 2 + i * 0.37) * 37.3) % w), y = Math.round((i * 43.1 + Math.floor(r * 2 + i * 0.37) * 59.7) % h);
      ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1); ctx.fillRect(x, y - 1, 1, 1);
    }
  }
  ctx.globalAlpha = 1;
}

function dibujar() {
  if (estado.inicio) { dibujarPortada(); return; }      // en el inicio se ve el paisaje de portada alrededor del diario
  const aguaN = Math.floor(estado.reloj * 2) % 2;
  const cx = Math.round(cam.x), cy = Math.round(cam.y);
  ctx.save();
  ctx.translate(-cx, -cy);            // todo lo del mundo se dibuja desplazado por la camara
  const c0 = Math.floor(cx / T), f0 = Math.floor(cy / T);
  for (let f = f0; f <= f0 + lienzo.height / T; f++) {
    for (let c = c0; c <= c0 + lienzo.width / T; c++) {
      const t = tile(c, f);
      if (t === 'S') {
        const s = SUELOS.findIndex(x => x.id === estado.casa.suelo);
        cuadro(SUELOS[s].tinte ? tintada('casa_suelos_tiles', colorCasa('suelo'), 'multiply') : 'casa_suelos_tiles', s, c * T, f * T);
        if (esSalida(c, f)) cuadro('casa_tiles', 3, c * T, f * T);
      }
      if (t === 'P') {
        const alta = f === INTERIOR.f0;            // fila de arriba: moldura; fila de abajo: zocalo y ventanas
        const p = PAPELES.findIndex(x => x.id === estado.casa.pared);
        ctx.drawImage(tintada('casa_papeles_tiles', colorCasa('pared'), 'multiply'), p * T, alta ? 0 : T, T, T, c * T, f * T, T, T);
        cuadro('casa_tiles', alta ? 6 : 1, c * T, f * T);
        if (alta) { ctx.globalAlpha = 0.12; ctx.fillStyle = COLOR.ciruela; ctx.fillRect(c * T, f * T + 3, T, 1); ctx.globalAlpha = 1; }
        if (!alta && INTERIOR.ventanas.includes(c)) cuadro('casa_tiles', 4, c * T, f * T);
      }
      if (t === 'G' || t === 'F') cuadro('terreno_tiles', CESPEDES[Math.floor(azar(c, f, 5) * CESPEDES.length)], c * T, f * T);
      if (t === 'C') {
        cuadro('terreno_tiles', 6, c * T, f * T);
        bordes('bordes_camino_tiles', c, f);
      }
      if (t === 'A') {
        dibujarAdoquin(c, f);
        bordes('bordes_camino_tiles', c, f);
      }
      if (t === 'Y') {
        cuadro('terreno_tiles', 6, c * T, f * T);
        dibujarArena(c, f);
        bordes('bordes_camino_tiles', c, f);
      }
      if (t === 'T') {
        const p = estado.parcelas[c + ',' + f];
        cuadro('terreno_tiles', p && p.regada ? 3 : 2, c * T, f * T);
        bordes('bordes_tierra_tiles', c, f);
      }
      if (t === 'W') {
        cuadro('terreno_tiles', 4 + aguaN, c * T, f * T);
        dibujarAgua(c, f);
        bordes('bordes_agua_tiles', c, f);
      }
      if (t === 'U' || t === 'Q') dibujarFondoArena(c, f, t === 'Q');
      if (t === 'R') dibujarRocaFondo(c, f);
      if (t === 'M' || t === 'B') {
        // Bajo el tramo de muelle que aun va por tierra, la hierba o la arena de los lados; si no, agua.
        const lado = muelleEnTierra(c, f);
        if (lado === 'Y') { cuadro('terreno_tiles', 6, c * T, f * T); dibujarArena(c, f); }
        else if (lado) cuadro('terreno_tiles', CESPEDES[Math.floor(azar(c, f, 5) * CESPEDES.length)], c * T, f * T);
        else { cuadro('terreno_tiles', 4 + aguaN, c * T, f * T); dibujarAgua(c, f); }
      }
    }
  }

  dibujarCosta(cx, cy, aguaN);
  dibujarEstructuras(cx, cy);
  const g = estado.gata;
  dibujarSuelo(cx, cy);
  const enCasa = estaDentro(casillaActual().f);
  dibujarAlfombras(cx, cy);
  for (const [clave, n] of Object.entries(estado.paredes)) {   // lo colgado en la pared, detras de todo lo demas
    const [c, f] = clave.split(',').map(Number);
    dibujarMueble(n, c * T, f * T);
  }
  if (enCasa) dibujarLuzCuarto();
  if (estado.decorar) dibujarRejilla(cx, cy);
  dibujarSombras(cx, cy);
  dibujarSombrasPeces();

  // Lo que esta en filas por debajo de los pies se dibuja delante de la gatita.
  const filaPies = casillaActual().f;
  dibujarObjetos(0, filaPies);
  const a = animActual(g);
  const n = Math.floor(g.t * a.fps) % a.cuadros;
  const espejo = g.espejo && (g.mira === 'lado' || g.anim === 'talar') && g.anim !== 'alegria';
  let salto = 0;
  if (g.anim === 'alegria') salto = Math.sin(Math.PI * g.t / (a.cuadros / a.fps)) * 5;
  if (!estado.elegir) {                 // mientras se elige el sitio del hogar, la gatita aun no ha llegado
    // Nadando o en la barca se mece con las olas y solo asoma de la cintura para arriba.
    const agua = nadando(), barca = estado.navegando, mece = agua || barca ? Math.round(Math.sin(estado.reloj * 3)) : bajoAgua(filaPies) ? Math.round(Math.sin(estado.reloj * 2) * 1.5) : 0;
    const yg = g.y - salto + mece;
    if (barca) dibujarBarca(g.x, g.y + mece, 'detras', miraBarca());
    if (agua || barca) { ctx.save(); ctx.beginPath(); ctx.rect(g.x - 8, yg - 24, 32, 24 + (agua ? 10 : 11) + salto); ctx.clip(); }
    const xg = g.x + inclinaPesca();
    if (cojinTejer) dibujarCojin(cojinTejer);
    if (estado.tejer) dibujarOvillosTejer(estado.tejer, g);
    cuadro(a.img, n, xg, yg, espejo);
    if (a === ANIM.cavar) cuadro(tintada('gatita_cavar_pala', MEJORAS_PALA[Math.max(1, nivelPala())].color), n, xg, yg, espejo);   // la hoja de su pala
    dibujarRopa(a, n, xg, yg, espejo);
    if (estado.tejer) dibujarLabor(estado.tejer, xg, yg);
    if (agua || barca) ctx.restore();
    if (agua) dibujarFlotador(g.x, g.y + mece);
    if (barca) dibujarBarca(g.x, g.y + mece, 'delante', miraBarca());
  }
  dibujarObjetos(filaPies + 1, MAPA.length);
  dibujarPalomasVolando();
  dibujarAvistamiento();
  if (bajoAgua(filaPies)) dibujarPeces();
  dibujarPedidos();

  if (enCasa) dibujarParedesCorte();
  else if (!bajoAgua(filaPies)) dibujarNubes();

  const pe = estado.pesca;
  if (pe) dibujarPesca(pe, g);
  const region = regionDe(f0), finRegion = region.ancho * T;   // a los lados de una region estrecha (la casa), nada del mapa
  if (cx < 0 || cx + lienzo.width > finRegion) {
    ctx.fillStyle = COLOR.ciruela;
    ctx.fillRect(cx, cy, -cx, lienzo.height);
    ctx.fillRect(finRegion, cy, cx + lienzo.width - finRegion, lienzo.height);
  }
  ctx.restore();

  // Luz del dia: tono calido al atardecer y al amanecer, azul oscuro de noche (mas suave dentro de casa).
  const dentro = estaDentro(filaPies);
  const noche = oscuridad(estado.hora) * (dentro ? 0.35 : 1), calido = calidez(estado.hora) * (dentro ? 0.4 : 1);
  if (bajoAgua(filaPies)) dibujarLuzFondo();
  if (calido > 0) { ctx.globalAlpha = 0.2 * calido; ctx.fillStyle = '#F2A65A'; ctx.fillRect(0, 0, lienzo.width, lienzo.height); }
  if (estado.lluvia > 0 && !bajoAgua(filaPies)) dibujarLluvia(dentro);
  if (noche > 0) { ctx.globalAlpha = 0.5 * noche; ctx.fillStyle = '#2E2A5E'; ctx.fillRect(0, 0, lienzo.width, lienzo.height); }
  ctx.globalAlpha = 1;

  // Lo que brilla se dibuja despues de la oscuridad: luces, chispas y avisos.
  ctx.save();
  ctx.translate(-cx, -cy);
  if (noche > 0.05) {
    const luces = [...Object.entries(estado.colocados), ...Object.entries(estado.paredes)].filter(([, n]) => MUEBLES[n].id === 'farol' || MUEBLES[n].luz !== undefined).map(([clave, n]) => {
      const [c, f] = clave.split(',').map(Number);
      return [c * T + 8, f * T + (MUEBLES[n].luz ?? 4)];
    });
    luces.push([CASA.c * T + 9, CASA.f * T + 15], [CASA.c * T + 40, CASA.f * T + 16], [CASA.c * T + 31, CASA.f * T + 17], [CASA.c * T + 10, CASA.f * T - 8]);   // ventanas, farolillo y buhardilla de la casa
    if (estado.herramientas.barca) luces.push(estado.navegando ? farolBarca(g.x, g.y, miraBarca()) : farolBarca(sitioBarca().c * T + (estado.barcaEn ? 0 : 7), sitioBarca().f * T - 6));
    for (const a of ADORNOS) if (a.luz) for (const [lx, ly] of a.luz) luces.push([a.c * T + lx, a.f * T + ly]);   // farolas y ventanas del pueblo
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = COLOR.mantequilla;
    for (const [lx, ly] of luces) {
      for (const radio of [26, 17, 9]) {
        ctx.globalAlpha = 0.11 * noche;
        ctx.beginPath(); ctx.arc(lx, ly, radio, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    if (regionDe(filaPies).id === 'valle') dibujarNocheMar(noche);
  }
  for (const q of particulas) {
    ctx.fillStyle = q.color;
    const lado = q.t < q.vida * 0.6 ? 2 : 1;      // se hacen pequenas antes de desaparecer
    ctx.fillRect(Math.round(q.x), Math.round(q.y), lado, lado);
  }
  if (estado.premio) {
    const d = dibujoDe(estado.premio.id), de = estado.premio.desde, k = de ? Math.min(1, estado.premio.t / SALTO_PREMIO) : 1;
    let px = g.x, py = g.y - salto - 12 - Math.min(estado.premio.t * 12, 4);
    if (k < 1) { px = Math.round(de.x - 8 + (px - de.x + 8) * k); py = Math.round(de.y - 8 + (py - de.y + 8) * k - Math.sin(Math.PI * k) * 20); }
    if (d && esLuminoso(estado.premio.id)) halo(px + 8, py + 8);
    if (d) cuadro(d.tira, d.n, px, py);
  }
  if (estado.tejer && estado.tejer.fase === 'rematar') dibujarPrendaRematada(estado.tejer, g, salto);
  if (!estado.elegir && animActual(g) === ANIM.sueno) {
    const k = (estado.reloj * 0.7) % 1;                                  // zzz que sube y se desvanece
    ctx.globalAlpha = Math.min(1, (1 - k) * 2);
    mapaBits(ICONOS.zzz, Math.round(g.x + 12 + k * 4), Math.round(g.y - 4 - k * 8), '#9F8BC9');
    ctx.globalAlpha = 1;
  }
  if (!estado.elegir) dibujarRadar();
  if (estado.decorar) dibujarCursorDecorar(estado.decorar);
  if (estado.elegir) dibujarElegir(estado.elegir);
  dibujarBocadillo();
  ctx.restore();
  if (noche > 0.5 && estado.playa && estado.playa.estrellas && regionDe(filaPies).id === 'valle' && filaPies >= 40) dibujarEstrellasFugaces(noche);
  dibujarGuiaTutorial(cx, cy);

  // Paneles: fijos en pantalla, por encima del mundo.
  if (pe && pe.fase === 'tirar') dibujarBarraPesca(pe);
  if (estado.tejer) { dibujarCalorTejer(estado.tejer, g.x + 8 - cx, g.y + 8 - cy); dibujarPanelTejer(estado.tejer); }
  if (estado.cavar) dibujarTablaCavar(estado.cavar);
  if (estado.pecera) panelOpciones(lienzo.height - 24, estado.pecera.opciones.map(id => ({ ...dibujoDe(id), disponible: true })), -1);
  if (estado.decorar) dibujarCajon(estado.decorar);
  if (estado.mapaVisible && regionDe(filaPies).id === 'valle' && !estado.decorar) dibujarMapa();
  dibujarHud();
  if (estado.fundido) dibujarIris(estado.fundido.t / DURACION_FUNDIDO);
}

// Transicion en iris: un circulo se cierra sobre la gatita, la pantalla queda ciruela con una huellita
// y se vuelve a abrir donde llega. Se dibuja fila a fila para que el borde salga pixelado.
function dibujarIris(p) {
  const w = lienzo.width, h = lienzo.height, g = estado.gata;
  const abre = Math.max(0, (Math.abs(1 - p * 2) - 0.15) / 0.85);          // 1 -> 0 (cerrado un ratito) -> 1
  const radio = Math.hypot(w, h) * abre * abre;
  const x = Math.round(g.x + 8 - cam.x), y = Math.round(g.y + 6 - cam.y);
  ctx.fillStyle = COLOR.ciruela;
  for (let j = 0; j < h; j++) {
    const dy = j + 0.5 - y, media = radio > Math.abs(dy) ? Math.round(Math.sqrt(radio * radio - dy * dy)) : 0;
    if (!media) { ctx.fillRect(0, j, w, 1); continue; }
    ctx.fillRect(0, j, Math.max(0, x - media), 1);
    ctx.fillRect(x + media, j, Math.max(0, w - x - media), 1);
  }
  if (abre === 0) mapaBits(['.#.#.', '#.#.#', '.....', '.###.', '#####', '.###.'], w / 2 - 2, h / 2 - 3, COLOR.rosa);   // huellita
}

// ---------- Enciclopedia ----------
// Diario de campo (la enciclopedia). Una ficha por especie: se desbloquea al conseguirla por primera vez; la estrella, al conseguirla brillante.

const el = id => document.getElementById(id);
// Una especie cuenta como vista si se ha conseguido normal, brillante o luminiscente.
const VARIANTES = ['', '*', '~'];
const vistaAlgunaVez = id => VARIANTES.some(v => estado.vistos[id + v]);
const sumaVariantes = (de, id) => VARIANTES.reduce((n, v) => n + (de[id + v] || 0), 0);
const ENTRADAS = [...FAUNA.map(a => a.id), ...CULTIVOS.map(a => a.id)];
const progreso = () => ({
  especies: ENTRADAS.filter(id => vistaAlgunaVez(id)).length,
  brillantes: ENTRADAS.filter(id => estado.vistos[id + '*']).length,
  luminosos: ENTRADAS.filter(id => estado.vistos[id + '~']).length,
});

// El diario de campo: pestanas de tela (fauna, cultivos, vecinos, herramientas), sellos en la pagina
// izquierda y la ficha del sello elegido en la derecha. Q/R o Tab cambian de pestana; las flechas eligen.
const diario = { pestana: 0, sel: 0 };
// Los sellos se reparten en tantas columnas como quepan en la pagina; arriba/abajo saltan una fila.
const columnasDiario = () => getComputedStyle(el('enciSellos')).gridTemplateColumns.split(' ').length || 1;
const lienzoDe = (tira, n, filtro) => {
  const c = document.createElement('canvas');
  c.width = c.height = T;
  if (tira) c.getContext('2d').drawImage(contornoSuave(filtro ? filtro(tira) : tira), n * T, 0, T, T, 0, 0, T, T);
  return c;
};
// De lo mas comun a lo mas raro.
const porRareza = lista => [...lista].sort((a, b) => (a.r || 0) - (b.r || 0));
const PAGINAS_DIARIO = [
  // El aguacate malvado tambien sale del agua: su sello va al final de la fauna (no cuenta como especie).
  { titulo: 'Fauna marina', marco: 'Rosa', entradas: () => [...porRareza(FAUNA), AGUACATE].map(a => ({ tipo: 'especie', id: a.id })), icono: () => lienzoDe(img.fauna_tiles, 0) },
  { titulo: 'Cultivos', marco: 'Durazno', entradas: () => porRareza(CULTIVOS).map(a => ({ tipo: 'especie', id: a.id })), icono: () => lienzoDe(img.iconos_cultivos, 0) },
  { titulo: 'Vecinos', marco: 'Lavanda', entradas: () => VECINOS.map((v, n) => ({ tipo: 'vecino', v, n })), icono: () => lienzoDe(img.vecinos_tiles, 0) },
  { titulo: 'Herramientas', marco: 'Mantequilla', entradas: () => Object.keys(HERRAMIENTAS).map(id => ({ tipo: 'herramienta', id })), icono: null },
  // Tesoros del mar y recuerdos: cartas de las botellas, lo que se ha visto en el mar, los rescates y el castillo.
  { titulo: 'Playa y mar', marco: 'Durazno', entradas: () => [...porRareza(TESOROS_MAR).map(t => ({ tipo: 'especie', id: t.id })), ...RECUERDOS.map(r => ({ tipo: 'recuerdo', ...r }))],
    icono: () => lienzoDe(img.mar_tiles, 0),
    resumen: () => TESOROS_MAR.filter(t => vistaAlgunaVez(t.id)).length + '/' + TESOROS_MAR.length + ' tesoros · ' + RECUERDOS.filter(recuerdoVisto).length + '/' + RECUERDOS.length + ' recuerdos' },
  // Lo desenterrado con la pala: los sellos son pegatinas que se pegan un poco torcidas.
  { titulo: 'Tesoros y fósiles', marco: 'Mantequilla', pegatinas: true, entradas: () => porRareza(TESOROS_TIERRA).map(t => ({ tipo: 'especie', id: t.id })),
    icono: () => lienzoDe(img.excavar_tiles, 8),
    resumen: () => TESOROS_TIERRA.filter(t => vistaAlgunaVez(t.id)).length + '/' + TESOROS_TIERRA.length + ' pegatinas · ' + (estado.recuerdos.cavados || 0) + ' hoyitos cavados' },
];

// Dibujo de un sello: la especie (silueta si no se ha visto, dorada si solo se tiene la brillante), la cara del vecino...
function dibujoEntrada(e) {
  if (e.tipo === 'especie') {
    const fi = ficha(e.id), visto = !!estado.vistos[e.id], brillo = !!estado.vistos[e.id + '*'];
    if (!vistaAlgunaVez(e.id)) return lienzoDe(img[fi.img], fi.n, t => tintada(fi.img, '#C5B4E3'));
    if (visto) return lienzoDe(img[fi.img], fi.n);
    return lienzoDe(img[fi.img], fi.n, brillo ? () => tintada(fi.img, DORADO, 'source-atop') : () => luminosa(fi.img));
  }
  if (e.tipo === 'vecino') return lienzoDe(img.vecinos_tiles, e.n);
  if (e.tipo === 'recuerdo') return dibujoRecuerdo(e);
  const he = HERRAMIENTAS[e.id], tira = he.img || 'tienda_tiles';
  if (he.tienda) return lienzoDe(img[tira], he.icono, estado.herramientas[e.id] ? null : () => tintada(tira, '#C5B4E3'));
  const quien = VECINOS.findIndex(v => v.id === HERRAMIENTAS[e.id].vecino);
  return estado.herramientas[e.id] ? lienzoDe(img.vecinos_tiles, quien) : lienzoDe(img.vecinos_tiles, quien, () => tintada('vecinos_tiles', '#C5B4E3'));
}

function fichaEntrada(e) {
  const caja = document.createElement('div');
  caja.className = 'ficha-diario';
  const foto = document.createElement('div');
  foto.className = 'polaroid washi';
  foto.appendChild(dibujoEntrada(e));
  const pie = document.createElement('span');
  pie.className = 'pie';
  foto.appendChild(pie);
  caja.appendChild(foto);
  let html = '';
  if (e.tipo === 'especie') {
    const fi = ficha(e.id), brillo = !!estado.vistos[e.id + '*'], luz = !!estado.vistos[e.id + '~'], descubierta = vistaAlgunaVez(e.id);
    const rareza = fi.r >= 0 ? RAREZAS[fi.r] : null;
    const donde = fi.tipo === 'tesoro' ? (descubierta ? fi.texto : fi.pista || fi.texto) :fi.tipo === 'abono' ? 'A veces pica en cualquier agua del valle. Tiene muy mal genio, pero de abono es buenísimo: hace crecer una etapa de golpe lo que ya está regado.'
      : fi.tipo === 'fauna' ? 'Vive en ' + fi.zonas.map(z => ZONAS[z]).join(', ') + (fi.lluvia ? ', solo con lluvia' : '') + (fi.zonas.every(z => z === 'poza') ? '.' : '. De noche, a veces sale luminiscente.') : 'Se cultiva en la tierra del huerto.';
    pie.textContent = !descubierta ? 'sin descubrir' : brillo && luz ? '★ brillante y luminiscente' : brillo ? '★ ¡también brillante!' : luz ? '★ ¡también luminiscente!' : 'visto';
    html = '<h1>' + (descubierta ? fi.nombre : '???') + '</h1>' +
      (rareza ? '<span class="tampon" style="color:' + rareza.color + ';border-color:' + rareza.color + '"><span style="color:#4A3347">' + rareza.nombre + '</span></span>' : '') +
      '<p class="nota">' + donde + '</p>' +
      (descubierta ? '<p>Tienes ' + sumaVariantes(estado.inv, e.id) + ' · conseguidas ' + sumaVariantes(estado.vistos, e.id) + '</p>'
        : '<p class="nota">Aún no la has encontrado. ¡Sigue buscando sin prisa!</p>');
  } else if (e.tipo === 'recuerdo') {
    const visto = recuerdoVisto(e);
    pie.textContent = visto ? (e.clase === 'carta' ? 'carta guardada' : 'recuerdo') : 'sin descubrir';
    html = '<h1>' + (visto ? nombreRecuerdo(e) : '???') + '</h1>' + textoRecuerdo(e);
  } else if (e.tipo === 'vecino') {
    const d = datosVecino(e.v), co = corazones(e.v);
    pie.textContent = 'amistad';
    html = '<h1>' + e.v.nombre + '</h1><p style="text-align:center">' + corazonesHtml(co) + '</p>' +
      '<p>Ahora pide <b>' + textoPedido(d.pedido) + '</b>.</p><p class="nota">' + d.entregas + ' pedidos cumplidos.</p>';
  } else {
    const h = HERRAMIENTAS[e.id], tengo = estado.herramientas[e.id];
    if (h.tienda) {
      pie.textContent = tengo ? 'de la tiendecita' : '???';
      html = '<h1>' + (tengo ? h.nombre : '???') + '</h1><p class="nota">' +
        (tengo ? h.texto + '. Comprado en la tiendecita de Bellota.' : 'Bellota la vende en su tiendecita del pueblo.') + '</p>';
    } else {
      const quien = VECINOS.find(v => v.id === h.vecino).nombre;
      pie.textContent = tengo ? 'regalo de ' + quien : '???';
      html = '<h1>' + (tengo ? h.nombre : '???') + '</h1><p class="nota">' +
        (tengo ? h.texto + '. Regalo de ' + quien + '.' : 'Regalo de ' + quien + ' al llegar a ' + CORAZONES_HERRAMIENTA + ' corazones de amistad.') + '</p>';
    }
  }
  const texto = document.createElement('div');
  texto.className = 'ficha-diario';
  texto.innerHTML = html;
  caja.appendChild(texto);
  return caja;
}

function pintarDiario() {
  const pag = PAGINAS_DIARIO[diario.pestana], entradas = pag.entradas();
  diario.sel = Math.max(0, Math.min(entradas.length - 1, diario.sel));
  el('enciTitulo').textContent = pag.titulo;
  const p = progreso();
  el('enciResumen').textContent = pag.resumen ? pag.resumen() : diario.pestana < 2 ? p.especies + '/' + ENTRADAS.length + ' especies · ★ ' + p.brillantes + ' brillantes · ' + p.luminosos + ' luminiscentes'
    : diario.pestana === 2 ? VECINOS.length + ' vecinos' : Object.values(estado.herramientas).filter(Boolean).length + '/' + Object.keys(HERRAMIENTAS).length + ' conseguidas';
  el('enciSellos').replaceChildren(...entradas.map((e, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    const oculto = e.tipo === 'especie' ? !vistaAlgunaVez(e.id) : e.tipo === 'recuerdo' ? !recuerdoVisto(e) : e.tipo === 'herramienta' && !estado.herramientas[e.id];
    b.className = 'sello' + (oculto ? ' oculto' : '') + (i === diario.sel ? ' elegido' : '') + (pag.pegatinas ? ' pegatina' : '');
    if (pag.pegatinas) b.style.setProperty('--giro', ((i * 37) % 9 - 4) + 'deg');
    b.title = oculto ? '???' : e.tipo === 'especie' ? ficha(e.id).nombre : e.tipo === 'recuerdo' ? nombreRecuerdo(e) : e.tipo === 'vecino' ? e.v.nombre : HERRAMIENTAS[e.id].nombre;
    b.appendChild(dibujoEntrada(e));
    // Marquitas en la esquina: estrella dorada si la tienes brillante, de neon si luminiscente.
    for (const [v, clase] of [['*', 'brillo'], ['~', 'brillo luz']]) {
      if (e.tipo !== 'especie' || !estado.vistos[e.id + v]) continue;
      const s = document.createElement('span');
      s.className = clase;
      s.textContent = '★';
      b.appendChild(s);
    }
    b.addEventListener('click', () => { b.blur(); diario.sel = i; sonar('cursor'); pintarDiario(); });
    return b;
  }));
  el('enciFicha').replaceChildren(fichaEntrada(entradas[diario.sel]));
  el('enciPestanas').replaceChildren(...PAGINAS_DIARIO.map((pg, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pestana' + (i === diario.pestana ? ' activa' : '');
    b.title = pg.titulo;
    b.style.borderImageSource = 'url(../arte/sprites/ui_pestana' + pg.marco + '.png)';
    if (pg.icono) b.appendChild(pg.icono()); else b.textContent = '★';
    b.addEventListener('click', () => { b.blur(); cambiarPaginaDiario(i - diario.pestana); });
    return b;
  }));
}
function cambiarPaginaDiario(paso) {
  if (!paso) return;
  diario.pestana = (diario.pestana + paso + PAGINAS_DIARIO.length) % PAGINAS_DIARIO.length;
  diario.sel = 0;
  sonar('elegir');
  pintarDiario();
}
function teclaDiario(codigo, e) {
  if (codigo === 'KeyC' || codigo === 'Escape') { abrirEnciclopedia(false); return; }
  if (codigo === 'KeyQ' || codigo === 'KeyR' || codigo === 'Tab') { e.preventDefault(); cambiarPaginaDiario(codigo === 'KeyQ' || e.shiftKey ? -1 : 1); return; }
  const cols = columnasDiario();
  const paso = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols, KeyA: -1, KeyD: 1, KeyW: -cols, KeyS: cols }[codigo];
  if (!paso) return;
  const total = PAGINAS_DIARIO[diario.pestana].entradas().length, nuevo = diario.sel + paso;
  if (nuevo < 0 || nuevo >= total) return;
  diario.sel = nuevo;
  sonar('cursor');
  pintarDiario();
}

function abrirEnciclopedia(abrir) {
  estado.enciclopedia = abrir;
  el('enciclopedia').hidden = !abrir;
  sonar(abrir ? 'abrir' : 'recoger');
  if (abrir) pintarDiario();
}
el('botonEnci').addEventListener('click', () => {
  el('botonEnci').blur();
  if (estado.enciclopedia) abrirEnciclopedia(false);
  else if (nadaAbierto() && !estado.bolsa && !estado.ajustes) abrirEnciclopedia(true);
});
el('enciCerrar').addEventListener('click', () => abrirEnciclopedia(false));

// ---------- Pantalla de inicio y ayuda ----------

// El nombre se pide en el inicio. Sin nombre no se empieza: el campo se mece y lo recuerda con carino.
function empezar() {
  const campo = el('nombre'), nombre = campo.value.trim().replace(/\s+/g, ' ');
  if (!nombre) {
    el('nombreAviso').textContent = 'Escribe tu nombre para que los vecinos sepan cómo llamarte';
    campo.classList.remove('falta');
    void campo.offsetWidth;            // reinicia la animacion
    campo.classList.add('falta');
    campo.focus();
    sonar('cursor');
    return;
  }
  estado.nombre = nombre;
  campo.blur();
  estado.inicio = false;
  el('inicio').hidden = true;
  sonar('abrir');
  if (!estado.hogar) { empezarElegir(); return; }      // partida nueva: primero se elige donde vivir
  if (!estado.tutorialHecho) empezarTutorial(estado.pasoTutorial);
}

// ---------- Elegir el sitio del hogar ----------
// En una partida nueva se elige donde va la casita y despues el primer huerto. Un fantasma sigue al cursor
// (flechas o raton): menta si cabe, coral si no, y la tarjeta dice por que. Espacio o clic lo pone ahi.
// estado.elegir = { paso: 'casa' | 'huerto', c, f, casa, fallo, espera }
const medidaElegir = e => e.paso === 'casa' ? SOLAR : HUERTO;
function empezarElegir() {
  quitarHogar();
  const { c, f } = HOGAR_DE_SIEMPRE.casa;
  estado.elegir = { paso: 'casa', c, f, casa: null, fallo: 0, espera: 0 };
  pintarElegir();
}
// Primer sitio libre junto a la casa para el huerto: a la izquierda, a la derecha, debajo o encima.
function sitioHuerto(casa) {
  const opciones = [[-6, -2], [SOLAR.ancho, -2], [-1, SOLAR.alto], [-1, -HUERTO.alto - 1], [-6, 0], [SOLAR.ancho, 0]];
  const libre = opciones.map(([dc, df]) => ({ paso: 'huerto', c: casa.c + dc, f: casa.f + df })).find(e => !problemaHogar(e));
  return libre || { c: casa.c - 6, f: casa.f - 2 };
}
function moverElegir(e, c, f) {
  const { ancho, alto } = medidaElegir(e);
  e.c = Math.max(0, Math.min(ANCHO - ancho, c));
  e.f = Math.max(0, Math.min(ALTO - alto, f));
}
function teclaElegir(codigo) {
  const e = estado.elegir;
  if (codigo in FLECHAS) {
    const [dc, df] = [[0, -1], [1, 0], [0, 1], [-1, 0]][FLECHAS[codigo]];
    moverElegir(e, e.c + dc, e.f + df);
    e.espera = 0.28;                       // si se mantiene pulsada, sigue andando (actualizarElegir)
    sonar('cursor');
  } else if (['Space', 'Enter', 'KeyE'].includes(codigo)) confirmarElegir();
  else if (['Escape', 'Backspace'].includes(codigo)) volverACasa();
  else if (codigo === 'KeyM') Sonido.alternar('musica');
}
// Con una flecha mantenida, el cursor avanza solo.
function actualizarElegir(dt) {
  const e = estado.elegir, tecla = [...teclas].find(k => k in FLECHAS);
  e.fallo = Math.max(0, e.fallo - dt);
  if (!tecla) return;
  if ((e.espera -= dt) > 0) return;
  const [dc, df] = [[0, -1], [1, 0], [0, 1], [-1, 0]][FLECHAS[tecla]];
  moverElegir(e, e.c + dc, e.f + df);
  e.espera = 0.07;
}
// El raton lleva el fantasma centrado bajo el puntero.
function ratonElegir(x, y) {
  const e = estado.elegir, { ancho, alto } = medidaElegir(e);
  moverElegir(e, Math.floor((x + Math.round(cam.x)) / T) - Math.floor((ancho - 1) / 2), Math.floor((y + Math.round(cam.y)) / T) - Math.floor((alto - 1) / 2));
}
function confirmarElegir() {
  const e = estado.elegir;
  if (problemaHogar(e)) { e.fallo = 0.3; sonar('fallo'); return; }
  if (e.paso === 'casa') {
    e.casa = { c: e.c, f: e.f };
    colocarHogar({ casa: e.casa, huerto: null });
    sonar('colocar');
    chispas(e.c * T + 24, e.f * T + 20, COLOR.rosa, 14);
    Object.assign(e, { paso: 'huerto' }, sitioHuerto(e.casa));
  } else {
    estado.hogar = { casa: e.casa, huerto: { c: e.c, f: e.f } };
    colocarHogar(estado.hogar);
    estado.elegir = null;
    const g = estado.gata;
    Object.assign(g, { x: INICIO.c * T, y: INICIO.f * T - 6, mira: 'frente', anim: 'alegria', t: 0 });
    sonar('cosechar');
    chispas(g.x + 8, g.y + 4, COLOR.mantequilla, 16);
    avisar('¡Ya tienes tu hogar en el valle!');
    guardar();
    if (!estado.tutorialHecho) empezarTutorial(estado.pasoTutorial);
  }
  pintarElegir();
}
// Con el huerto en la mano, Esc (o el boton) devuelve la casa al cursor para cambiarla de sitio.
function volverACasa() {
  const e = estado.elegir;
  if (e.paso !== 'huerto') return;
  quitarHogar();
  Object.assign(e, { paso: 'casa' }, e.casa);
  sonar('recoger');
  pintarElegir();
}
function pintarElegir() {
  const e = estado.elegir;
  el('elegirHogar').hidden = !e;
  if (!e) return;
  const casa = e.paso === 'casa';
  el('elegirPaso').textContent = 'TU HOGAR · ' + (casa ? 1 : 2) + ' DE 2';
  el('elegirTexto').textContent = casa ? '¿Dónde quieres vivir? Elige el sitio de tu casita.' : '¡Qué bonita! Ahora, el sitio de tu primer huerto.';
  el('elegirTeclas').textContent = 'Flechas o ratón: mover · Espacio o clic: ponerlo aquí' + (casa ? '' : ' · Esc: mover la casa');
  el('elegirVolver').hidden = casa;
}
el('elegirVolver').addEventListener('click', () => { el('elegirVolver').blur(); volverACasa(); });

// Fantasma de la casa o del huerto bajo el cursor, sobre una huella menta o coral.
function dibujarElegir(e) {
  const { ancho, alto } = medidaElegir(e), cabe = !problemaHogar(e);
  const x = e.c * T + (e.fallo ? Math.round(Math.sin(estado.reloj * 60)) : 0), y = e.f * T, w = ancho * T, h = alto * T;
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = cabe ? '#A8DDB5' : '#F2A28C';
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = cabe ? 0.75 : 0.4;
  if (e.paso === 'casa') dibujarCasaMia(x, y);
  else for (let j = 0; j < alto; j++) for (let i = 0; i < ancho; i++) cuadro('terreno_tiles', 2, x + i * T, y + j * T);
  ctx.globalAlpha = 1;
  ctx.fillStyle = Math.floor(estado.reloj * 3) % 2 ? COLOR.crema : COLOR.ciruela;
  for (const [ex, ey] of [[0, 0], [w - 4, 0], [0, h - 1], [w - 4, h - 1]]) ctx.fillRect(x + ex, y + ey, 4, 1);
  for (const [ex, ey] of [[0, 0], [w - 1, 0], [0, h - 4], [w - 1, h - 4]]) ctx.fillRect(x + ex, y + ey, 1, 4);
}
el('formNombre').addEventListener('submit', e => e.preventDefault());
el('nombre').addEventListener('input', () => { el('nombreAviso').textContent = ''; });

// Pantalla de inicio segun haya partida o no: con partida saluda por su nombre y ofrece continuar.
function prepararInicio() {
  const hayPartida = Object.keys(estado.vistos).length || Object.keys(estado.parcelas).length || estado.nombre;
  el('botonJugar').textContent = hayPartida ? 'Continuar' : 'Jugar';
  el('nombre').value = estado.nombre;
  el('nombreTitulo').textContent = estado.nombre ? '¡Hola de nuevo! Tu nombre:' : '¿Cómo te llamas?';
  if (!estado.nombre) el('nombre').focus();
  requestAnimationFrame(encajarDiario);
}

// ---------- Portada (paisaje de la pantalla de inicio) ----------
// Lo que se ve alrededor del diario de inicio: cielo pastel, nubes esponjosas, el mar con olas que rompen en la
// arena, el muelle con su barquita, una colina con un arbol que se mece, flores y pajaritos.
// Se dibuja en pantalla (sin camara) mientras estado.inicio esta abierto. Medidas en pixeles del lienzo (240x160).
const PORTADA = {
  horizonte: 70,
  cielo: ['#BFE6F2', '#C9EAF2', '#D5EEF1', '#E2F1EC', '#EFF0E2', '#FAEEDB'],
  mar: ['#BFE4EE', '#ACDAE9', '#9BD0E4', '#8CC4DC', '#82BBD6'],
  flores: ['#F7A6B4', '#FFE08A', '#FFF4E0', '#C5B4E3', '#F28CA0'],
};
const costaPortada = x => 100 + x * 0.3 + 2 * Math.sin(x / 13);                        // donde empieza la arena
const colinaPortada = x => { const k = (x - 236) / 72; return k * k >= 1 ? 999 : 158 - 94 * Math.sqrt(1 - k * k); };
function px(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h); }

function dibujarPortada() {
  const t = performance.now() / 1000, W = lienzo.width, H = lienzo.height, hz = PORTADA.horizonte;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  portadaCielo(t, W, hz);
  portadaMar(t, W, H, hz);
  portadaColina(t, W, H);
  portadaArbol(t);
  portadaPlaya(t, W, H);
  portadaMuelle(t);
  portadaFlores(t);
  portadaPajaros(t, W);
  ctx.restore();
}

function portadaCielo(t, W, hz) {
  const bandas = PORTADA.cielo, alto = hz / bandas.length;
  bandas.forEach((col, i) => px(0, Math.floor(i * alto), W, Math.ceil(alto) + 1, col));
  // tramado de un pixel entre bandas para que el degradado no tenga escalones duros
  for (let i = 1; i < bandas.length; i++) {
    ctx.fillStyle = bandas[i];
    const y = Math.floor(i * alto) - 1;
    for (let x = i % 2; x < W; x += 2) ctx.fillRect(x, y, 1, 1);
  }
  // sol tibio con su halo
  const sx = 214, sy = 18;
  ctx.globalAlpha = 0.35; elipsePx(sx, sy, 15, 15, '#FFF7DA'); ctx.globalAlpha = 1;
  elipsePx(sx, sy, 9, 9, '#FFE9A8'); elipsePx(sx - 1, sy - 1, 7, 7, '#FFF3C4');
  // nubes esponjosas que pasan despacio
  [[0, 14, 1], [1, 34, 0.7], [2, 8, 0.5], [3, 46, 0.85]].forEach(([i, y, v]) => {
    const x = ((i * 83 + t * 3 * v) % (W + 70)) - 50;
    nubePortada(x, y + Math.round(Math.sin(t * 0.4 + i) * 0.6), i % 2 ? 0.8 : 1);
  });
}
function nubePortada(x, y, k) {
  const bultos = [[0, 6, 9, 5], [9, 2, 9, 7], [19, 4, 8, 6], [27, 7, 7, 4]].map(([dx, dy, rx, ry]) => [x + dx * k, y + dy * k, Math.round(rx * k), Math.round(ry * k)]);
  for (const [cx, cy, rx, ry] of bultos) elipsePx(cx, cy + 1, rx + 1, ry + 1, '#CFE3EE');      // borde suave
  for (const [cx, cy, rx, ry] of bultos) elipsePx(cx, cy, rx, ry, '#F4FAFC');
  for (const [cx, cy, rx, ry] of bultos) elipsePx(cx - 1, cy - 1, Math.max(1, rx - 3), Math.max(1, ry - 2), '#FFFFFF');
  px(x - 8 * k, y + 9 * k, Math.round(42 * k), 2, '#E3EEF5');                                // panza en sombra
}

function portadaMar(t, W, H, hz) {
  const bandas = PORTADA.mar;
  const alturas = [3, 6, 10, 16, 60];
  let y = hz;
  bandas.forEach((col, i) => { px(0, y, W, alturas[i], col); y += alturas[i]; });
  px(0, hz, W, 1, '#E6F4F7');                                                                 // linea del horizonte
  // destellos que titilan
  for (let k = 0; k < 26; k++) {
    const x = Math.floor(azar(k, 3, 400) * W), yy = hz + 3 + Math.floor(azar(k, 4, 401) * 40);
    const b = Math.sin(t * 1.6 + k * 1.7);
    if (b < 0.3 || yy > costaPortada(x) - 6) continue;
    ctx.globalAlpha = 0.5 * b; px(x + Math.round(Math.sin(t * 0.7 + k) * 2), yy, 2 + (yy - hz > 20 ? 2 : 0), 1, '#FFFFFF');
  }
  ctx.globalAlpha = 1;
  // una islita lejana con su arbolito
  elipsePx(30, hz + 1, 10, 2, '#9CCFB0'); px(28, hz - 5, 1, 4, '#8A6A86'); elipsePx(28, hz - 6, 3, 2, '#9CCFB0');
}

function portadaColina(t, W, H) {
  // colina de detras, mas clarita
  for (let x = 150; x < W; x++) {
    const k = (x - 205) / 62;
    if (k * k >= 1) continue;
    const y = Math.round(150 - 72 * Math.sqrt(1 - k * k));
    px(x, y, 1, H - y, '#C3E6BC');
  }
  // colina de delante: borde verde oscuro, brillo arriba y rayitas de hierba
  for (let x = 160; x < W; x++) {
    const y = Math.round(colinaPortada(x));
    if (y > H) continue;
    px(x, y, 1, H - y, '#A8D89A');
    px(x, y, 1, 1, '#6FAE7E');
    px(x, y + 1, 1, 2, '#C6EBB4');
    if (azar(x, 9, 402) < 0.35) px(x, y + 6 + Math.floor(azar(x, 9, 403) * 50), 1, 2, '#8FCB8E');
  }
  // matitas de hierba en el borde que se mecen
  for (let x = 166; x < W; x += 7) {
    const y = Math.round(colinaPortada(x)), m = Math.round(Math.sin(t * 1.5 + x) * 0.8);
    px(x + m, y - 2, 1, 2, '#6FAE7E'); px(x + 2 + m, y - 3, 1, 3, '#6FAE7E');
  }
}

function portadaArbol(t) {
  const bx = 222, base = Math.round(colinaPortada(bx)) + 1;
  // tronco
  px(bx - 3, base - 20, 6, 20, COLOR.ciruela); px(bx - 2, base - 20, 4, 19, '#B47A58'); px(bx - 2, base - 20, 1, 19, '#C98F6B');
  px(bx - 5, base - 1, 10, 1, COLOR.ciruela);
  // copa: racimos que se mecen con el viento (mas arriba, mas se mueven)
  const racimos = [[0, -30, 12, 10], [-10, -24, 8, 7], [10, -24, 8, 7], [-5, -38, 8, 6], [6, -37, 8, 6]];
  const mece = (dy) => Math.round(Math.sin(t * 1.3) * (1 + (-dy - 20) / 12));
  const pos = racimos.map(([dx, dy, rx, ry]) => [bx + dx + mece(dy), base + dy, rx, ry]);
  for (const [cx, cy, rx, ry] of pos) elipsePx(cx, cy, rx + 1, ry + 1, COLOR.ciruela);
  for (const [cx, cy, rx, ry] of pos) elipsePx(cx, cy, rx, ry, '#7FBF8E');
  for (const [cx, cy, rx, ry] of pos) elipsePx(cx - 1, cy - 2, rx - 2, ry - 2, '#9FD39A');
  for (const [cx, cy, rx, ry] of pos) elipsePx(cx - 3, cy - 4, Math.max(1, rx - 6), Math.max(1, ry - 5), '#C6EBB4');
  // florecitas rosas en la copa
  for (let k = 0; k < 9; k++) {
    const [cx, cy, rx, ry] = pos[k % pos.length];
    const fx = cx + Math.round((azar(k, 1, 404) - 0.5) * rx * 1.4), fy = cy + Math.round((azar(k, 2, 405) - 0.5) * ry * 1.4);
    px(fx, fy, 2, 2, '#F7A6B4'); px(fx, fy, 1, 1, '#FFE3EA');
  }
  // petalos que se lleva el viento hacia la izquierda
  for (let k = 0; k < 4; k++) {
    const vida = (t * 0.18 + k * 0.25) % 1;
    const x = bx - vida * 90 + Math.sin(t * 2 + k) * 3, y = base - 30 + vida * 50 + Math.sin(t * 3 + k * 2) * 2;
    ctx.globalAlpha = Math.min(1, (1 - vida) * 3);
    px(x, y, 2, 1, '#F7A6B4'); px(x + 1, y + 1, 1, 1, '#E87F86');
  }
  ctx.globalAlpha = 1;
}

function portadaPlaya(t, W, H) {
  for (let x = 0; x < W; x++) {
    const c = costaPortada(x), colina = colinaPortada(x);
    const agua = c + 1.6 * Math.sin(t * 1.1 + x * 0.015);                               // el agua sube y baja
    const y0 = Math.round(c) - 3;
    if (y0 >= Math.min(H, colina)) continue;
    const fin = Math.min(H, Math.round(colina));
    px(x, y0, 1, fin - y0, '#F7E3B5');                                                         // arena seca
    px(x, y0, 1, 6, '#EBCF98');                                                                // arena mojada
    if (azar(x, 5, 406) < 0.18) px(x, y0 + 8 + Math.floor(azar(x, 6, 407) * 20), 1, 1, '#E3C48E');
    const ya = Math.round(agua);
    if (ya > y0) px(x, y0, 1, ya - y0, '#A9DCEB');                                             // el agua que lame la arena
    ctx.globalAlpha = 0.9; px(x, ya, 1, 1, '#FFFFFF');                                         // espuma
    if ((x + Math.floor(t * 4)) % 3) px(x, ya - 1, 1, 1, '#E8F7FB');
    ctx.globalAlpha = 1;
    // ola que llega desde mar adentro y se deshace
    const fase = (t * 0.45 + x * 0.004) % 1, yo = Math.round(agua - 12 + fase * 10);
    ctx.globalAlpha = 0.6 * Math.sin(fase * Math.PI);
    if ((x >> 1) % 3) px(x, yo, 1, 1, '#F2FAFC');
    ctx.globalAlpha = 1;
  }
  // conchitas y una estrella de mar
  [[70, 2, '#F7A6B4'], [118, 5, '#FFF4E0'], [150, 3, '#F7A6B4']].forEach(([x, dy, col]) => {
    const y = Math.round(costaPortada(x)) + dy + 3;
    px(x, y, 3, 2, col); px(x + 1, y - 1, 1, 1, col); px(x, y + 2, 3, 1, '#E3C48E');
  });
}

function portadaMuelle(t) {
  const o = COLOR.ciruela, yd = 90;
  // postes que se meten en el agua (con su reflejo)
  for (const x of [4, 18, 32]) {
    px(x, yd + 3, 3, 14, o); px(x + 1, yd + 3, 1, 13, '#B47A58');
    ctx.globalAlpha = 0.25; px(x, yd + 17, 3, 3, '#4F7FA8'); ctx.globalAlpha = 1;
  }
  // tablas
  px(0, yd - 1, 40, 5, o); px(0, yd, 39, 3, '#E2B07E'); px(0, yd, 39, 1, '#F0C99A');
  for (let x = 5; x < 39; x += 6) px(x, yd, 1, 3, '#C98F6B');
  // farolillo en la punta
  px(35, yd - 13, 1, 12, o);
  px(33, yd - 17, 5, 5, o); px(34, yd - 16, 3, 3, '#FFE08A');
  ctx.globalAlpha = 0.25 + 0.1 * Math.sin(t * 2); elipsePx(35, yd - 15, 5, 5, '#FFF0BF'); ctx.globalAlpha = 1;
  // barquita amarrada que se mece
  const by = yd + 9 + Math.round(Math.sin(t * 1.8) * 1), bx = 44, inc = Math.sin(t * 1.8 + 0.6) > 0.5 ? 1 : 0;
  hilo(37, yd + 2, bx + 2, by + 1);
  px(bx + 12, by - 15 + inc, 1, 15, o);                                                       // mastil con banderita
  px(bx + 13, by - 15 + inc, 5, 2, '#F28CA0'); px(bx + 13, by - 13 + inc, 3, 1, '#F28CA0');
  const casco = [[0, 26], [1, 24], [2, 22], [3, 20], [4, 18]];
  casco.forEach(([dy, w]) => px(bx + (26 - w) / 2, by + dy + inc * (dy > 2 ? 0 : 0), w, 1, o));
  casco.slice(0, 4).forEach(([dy, w]) => px(bx + (26 - w) / 2 + 1, by + dy, w - 2, 1, dy === 0 ? '#FFF4E0' : dy === 1 ? '#F28CA0' : '#F7A6B4'));
  ctx.globalAlpha = 0.3; px(bx + 4, by + 5, 18, 1, '#4F7FA8'); ctx.globalAlpha = 1;
  ctx.globalAlpha = 0.5; px(bx - 2 + Math.round(Math.sin(t * 1.8) * 2), by + 5, 2, 1, '#FFFFFF'); px(bx + 26, by + 4, 2, 1, '#FFFFFF'); ctx.globalAlpha = 1;
}

function portadaFlores(t) {
  for (let k = 0; k < 26; k++) {
    const x = 166 + Math.floor(azar(k, 7, 408) * 72);
    const arriba = colinaPortada(x) + 4;
    if (arriba > 156) continue;
    const y = Math.round(arriba + azar(k, 8, 409) * (158 - arriba));
    const m = Math.round(Math.sin(t * 1.6 + k) * 0.7), col = PORTADA.flores[k % PORTADA.flores.length];
    px(x, y, 1, 3, '#6FAE7E');
    px(x - 1 + m, y - 2, 3, 1, col); px(x + m, y - 3, 1, 3, col); px(x + m, y - 2, 1, 1, '#FFE08A');
  }
}

function portadaPajaros(t, W) {
  for (let k = 0; k < 3; k++) {
    const x = ((t * (10 + k * 3) + k * 110) % (W + 40)) - 20, y = 24 + k * 9 + Math.round(Math.sin(t * 1.5 + k) * 3);
    const ala = Math.sin(t * 9 + k * 2) > 0;
    ctx.fillStyle = '#7A5A76';
    if (ala) { ctx.fillRect(Math.round(x) - 2, Math.round(y) - 1, 2, 1); ctx.fillRect(Math.round(x) + 1, Math.round(y) - 1, 2, 1); ctx.fillRect(Math.round(x), Math.round(y), 1, 1); }
    else { ctx.fillRect(Math.round(x) - 2, Math.round(y), 5, 1); ctx.fillRect(Math.round(x), Math.round(y) - 1, 1, 1); }
  }
}

// ---------- Libro de ayuda: pestanas y vinetas animadas ----------
// Cada seccion del libro "Como se juega" lleva una vineta de 48x32 pintada con los sprites del juego
// (canvas.vineta[data-v] en index.html). Se animan solas mientras el libro esta abierto (actualizarHud).
const PESTANAS_AYUDA = 5;
let pestanaAyuda = 0;
function cambiarPestanaAyuda(n) {
  pestanaAyuda = (n + PESTANAS_AYUDA) % PESTANAS_AYUDA;
  document.querySelectorAll('#ayuda .pliego').forEach(p => p.classList.toggle('activo', +p.dataset.p === pestanaAyuda));
  document.querySelectorAll('#ayudaPestanas .pestanaLibro').forEach(b => b.classList.toggle('activa', +b.dataset.p === pestanaAyuda));
  document.querySelectorAll('#ayuda .pagina').forEach(p => { p.scrollTop = 0; });
  sonar('elegir');
}
function teclaAyuda(codigo) {
  if (codigo === 'KeyH' || codigo === 'Escape') { abrirAyuda(false); return; }
  if (codigo === 'Tab' || codigo === 'KeyR' || codigo === 'ArrowRight') cambiarPestanaAyuda(pestanaAyuda + 1);
  else if (codigo === 'KeyQ' || codigo === 'ArrowLeft') cambiarPestanaAyuda(pestanaAyuda - 1);
  else if (NUMEROS.indexOf(codigo) >= 0 && NUMEROS.indexOf(codigo) < PESTANAS_AYUDA) cambiarPestanaAyuda(NUMEROS.indexOf(codigo));
}

// Ayudantes de dibujo sobre el contexto de cada vineta (no usan ctx del mundo).
function vTile(v, nombre, n, x, y, espejo) {
  const i = img[nombre];
  if (!i) return;
  x = Math.round(x); y = Math.round(y);
  if (!espejo) { v.drawImage(i, n * T, 0, T, T, x, y, T, T); return; }
  v.save(); v.translate(x + T, y); v.scale(-1, 1); v.drawImage(i, n * T, 0, T, T, 0, 0, T, T); v.restore();
}
const vRect = (v, x, y, w, h, c) => { v.fillStyle = c; v.fillRect(Math.round(x), Math.round(y), w, h); };
function vSuelo(v, n, filas = [0, 1]) { for (const f of filas) for (let x = 0; x < 48; x += T) vTile(v, 'terreno_tiles', n, x, f * T); }
function vGata(v, anim, x, y, t, espejo, rapidez = 1) { const a = ANIM[anim]; vTile(v, a.img, Math.floor(t * a.fps * rapidez) % a.cuadros, x, y, espejo); }
function vBits(v, bits, x, y, c) {
  v.fillStyle = c;
  bits.forEach((fila, j) => { for (let i = 0; i < fila.length; i++) if (fila[i] === '#') v.fillRect(Math.round(x) + i, Math.round(y) + j, 1, 1); });
}
function vBocadillo(v, x, y, icono, color) {
  vRect(v, x, y, 11, 10, COLOR.ciruela); vRect(v, x + 1, y + 1, 9, 8, '#FFFBF3');
  vRect(v, x + 4, y + 10, 3, 1, COLOR.ciruela); vRect(v, x + 5, y + 11, 1, 1, COLOR.ciruela);
  vBits(v, ICONOS[icono], x + 2, y + 2, color);
}
const vAgua = (v, t) => 4 + (Math.floor(t * 2) % 2);

const VINETAS = {
  talar(v, t) {
    vSuelo(v, 0);
    const k = t % 3.2, cae = k >= 2;               // tres hachazos y el arbol cae; luego, sitio libre
    const arbol = (n, dx) => v.drawImage(img.arboles_tiles, n * 32, 0, 32, 32, 18 + dx, -6, 32, 32);
    if (!cae) { const s = Math.round(Math.sin(k * 40) * Math.max(0, 0.3 - (k % (2 / 3))) * 6); arbol(4, s); arbol(0, s); }
    else if (k < 2.5) { v.save(); v.globalAlpha = 1 - (k - 2) * 2; v.translate(34, 26); v.rotate((k - 2) * 2.4); v.translate(-34, -26); arbol(4, 0); arbol(0, 0); v.restore(); }
    vGata(v, cae ? 'alegria' : 'talar', 6, 12, cae ? k - 2 : k % (2 / 3), false);
  },
  cavar(v, t) {
    vSuelo(v, 0);
    const k = t % 3, sale = k >= 2.2;              // cava un rato y sale una caracola de piedra dando un saltito
    vTile(v, 'excavar_tiles', sale ? EXCAVAR.hoyo : EXCAVAR.sitioPrado, 24, 14);
    vGata(v, sale ? 'alegria' : 'cavar', 10, 12, t);
    if (sale) vTile(v, 'excavar_tiles', 8, 24, 10 - Math.sin(Math.min(1, (k - 2.2) * 2) * Math.PI / 2) * 10);
    else if (Math.sin(t * 4) > 0.3) { vRect(v, 35, 18, 1, 3, '#FFFFFF'); vRect(v, 34, 19, 3, 1, '#FFFFFF'); }
  },
  caminar(v, t) {
    vSuelo(v, 0); for (let x = 0; x < 48; x += T) vTile(v, 'terreno_tiles', 6, x, 16);
    vGata(v, 'caminarLado', ((t * 18) % 70) - 18, 9, t);
  },
  correr(v, t) {
    vSuelo(v, 0); for (let x = 0; x < 48; x += T) vTile(v, 'terreno_tiles', 6, x, 16);
    const x = ((t * 40) % 80) - 20;
    for (let k = 1; k <= 3; k++) { v.globalAlpha = 0.7 - k * 0.18; vRect(v, x + 4 - k * 4, 22 + (k % 2), 2, 2, COLOR.crema); }
    v.globalAlpha = 1;
    vGata(v, 'patinarLado', x, 9, t, false, 1.4);
  },
  hud(v, t) {
    vRect(v, 0, 0, 48, 32, '#FFF4E0');
    pintarReloj(v, 6, -1, (t / 16) % 1, 0, t);          // el reloj pasando un dia entero en 16 s
  },
  mapa(v, t) {
    vRect(v, 0, 0, 48, 32, '#BFE3B4');
    for (let j = 0; j < 7; j++) vRect(v, 6 + Math.round(Math.sin(j) * 1), 6 + j, 10 - Math.abs(j - 3) * 2, 1, '#8CC4DC');
    for (let x = 14; x < 44; x++) vRect(v, x, 18 + Math.round(Math.sin(x / 4)), 1, 2, '#E8D2A8');
    vRect(v, 30, 8, 7, 5, COLOR.ciruela); vRect(v, 31, 9, 5, 3, '#E87F86');
    for (let x = 0; x < 48; x += 4) vRect(v, x, 29, 4, 3, '#8CC4DC');
    if (Math.floor(t * 3) % 2) { vRect(v, 22, 16, 3, 3, COLOR.ciruela); vRect(v, 23, 17, 1, 1, '#F7A6B4'); }
  },
  bocadillo(v, t) {
    vSuelo(v, 0); vTile(v, 'terreno_tiles', 2, 26, 16);
    vGata(v, 'reposo', 6, 14, t);
    const salta = Math.round(Math.abs(Math.sin(t * 3)));
    vBocadillo(v, 28, 2 - salta, 'semilla', '#C98F6B');
  },
  cultivar(v, t) {
    vSuelo(v, 0);
    const fase = Math.floor(t / 1.2) % 5, etapa = Math.min(3, fase);
    for (const x of [16, 32]) vTile(v, 'terreno_tiles', fase > 0 && fase < 4 ? 3 : 2, x, 16);
    vTile(v, 'cultivos_fresa', etapa, 32, 13);
    vTile(v, 'cultivos_tulipan', Math.max(0, etapa - 1), 16, 13);
    vGata(v, 'reposoLado', 2, 13, t);
    if (fase > 0 && fase < 4 && (t % 1.2) < 0.6) for (let k = 0; k < 4; k++) vRect(v, 34 + k * 3, 8 + ((t * 30 + k * 4) % 8), 1, 2, '#6FA9D8');
    if (etapa === 3 && Math.floor(t * 4) % 2) vBits(v, ['.#.', '###', '.#.'], 44, 10, '#FFE08A');
  },
  pescar(v, t) {
    vSuelo(v, vAgua(v, t)); vTile(v, 'terreno_tiles', 0, 0, 0); vTile(v, 'terreno_tiles', 0, 0, 16);
    vGata(v, 'reposoLado', 1, 9, t);
    const fase = t % 4, pica = fase > 2.6, by = 15 + (pica ? 2 : Math.round(Math.sin(t * 3)));
    for (let i = 0; i <= 7; i++) { v.fillStyle = COLOR.ciruela; v.fillRect(11 + i - 1, 21 - Math.round(i * 10 / 7) - 1, 3, 3); }   // la cana
    for (let i = 0; i <= 7; i++) { v.fillStyle = i < 3 ? '#8A5A44' : '#D9A06B'; v.fillRect(11 + i, 21 - Math.round(i * 10 / 7), 1, 1); }
    v.fillStyle = COLOR.crema;
    for (let i = 0; i <= 16; i++) v.fillRect(Math.round(18 + i * 0.95), Math.round(11 + (by + 5 - 11) * i / 16 + Math.sin(Math.PI * i / 16) * 2), 1, 1);
    vTile(v, 'objetos_pesca', pica ? 1 : 0, 26, by - 3);
    if (pica) vTile(v, 'objetos_pesca', 2, 1, -6 - Math.round(Math.abs(Math.sin(t * 10))));
  },
  tejer(v, t) {
    for (let x = 0; x < 48; x += T) { vTile(v, 'casa_suelos_tiles', 0, x, 0); vTile(v, 'casa_suelos_tiles', 0, x, 16); }
    vRect(v, 3, 23, 22, 6, COLOR.ciruela); vRect(v, 4, 24, 20, 4, COJIN.base); vRect(v, 4, 24, 20, 1, COJIN.luz);   // cojin
    vGata(v, 'tejer', 6, 12, t);
    const k = (t * 0.5) % 1, h = 1 + Math.floor(k * 4);                       // la labor crece en el regazo
    vRect(v, 12, 24, 4, h, '#F28CA0'); vRect(v, 12, 24 + h, 4, 1, '#B8566E');
    const by = 22 - Math.round(Math.abs(Math.sin(t * 3)) * 2);                // ovillo que bota
    vRect(v, 27, by, 5, 5, '#B8566E'); vRect(v, 28, by + 1, 3, 3, '#F28CA0'); vRect(v, 28, by + 1, 1, 1, '#FFD8E0');
    const b = BOTONES_TEJER[Math.floor(t * 1.5) % 4], late = Sonido.pulso() < 0.3;   // boton de costura que brilla
    vRect(v, 36, 9, 9, 9, COLOR.ciruela); vRect(v, 37, 10, 7, 7, late ? b.luz : b.base); vRect(v, 38, 11, 1, 1, '#FFFFFF');
  },
  reloj(v, t) {
    vRect(v, 0, 0, 48, 32, '#FFF4E0');
    const k = 1 - (t % 5) / 5, fallo = (t % 5) > 2 && (t % 5) < 2.4;
    vBits(v, ICONOS.arena, 4 + (fallo ? Math.round(Math.sin(t * 60)) : 0), 12, k < 0.3 && Math.floor(t * 8) % 2 ? '#E8606E' : COLOR.ciruela);
    vRect(v, 13, 13, 31, 5, COLOR.ciruela); vRect(v, 14, 14, 29, 3, '#FFE3EA');
    vRect(v, 14, 14, Math.round(29 * k), 3, fallo || k < 0.3 ? '#E8606E' : k < 0.6 ? '#F7A6B4' : '#FFE08A');
    if (fallo) vBits(v, ['#.#', '.#.', '#.#'], 40, 6, '#E8606E');
  },
  bolsa(v, t) {
    vRect(v, 0, 0, 48, 32, '#F6DDB8');
    vTile(v, 'hud_tiles', 0, 16, 14 - Math.round(Math.abs(Math.sin(t * 2))));
    const sale = (t % 3) / 3;
    v.globalAlpha = 1 - sale;
    vTile(v, 'cultivos_fresa', 3, 2 + sale * -2, 8 - sale * 8);
    vTile(v, 'fauna_tiles', 0, 30 + sale * 2, 6 - sale * 8);
    v.globalAlpha = 1;
  },
  semillas(v, t) {
    vRect(v, 0, 0, 48, 32, '#FFF4E0');
    vTile(v, 'hud_tiles', 3, 0, 8);
    const elegida = Math.floor(t) % 2;
    ['fresa', 'zanahoria'].forEach((id, i) => {
      const x = 17 + i * 15;
      vRect(v, x - 1, 7, 16, 18, i === elegida ? '#F28CA0' : COLOR.ciruela); vRect(v, x, 8, 14, 16, i === elegida ? '#FFE08A' : '#FFFBF3');
      vTile(v, 'cultivos_' + id, 3, x - 1, 8);
    });
  },
  vecinos(v, t) {
    vSuelo(v, 0);
    const turno = Math.floor(t * 1.2) % VECINOS.length;
    VECINOS.forEach((_, n) => vTile(v, 'vecinos_tiles', n, -2 + n * 12, 14 - (n === turno ? Math.round(Math.abs(Math.sin(t * 6))) * 2 : 0)));
    vBits(v, ICONOS.corazon, 2 + turno * 12, 3 - Math.round((t * 1.2 % 1) * 2), '#F28CA0');
  },
  tienda(v, t) {
    vRect(v, 0, 0, 48, 32, '#F3E3C3'); for (let x = 0; x < 48; x += 6) vRect(v, x, 0, 3, 5, x % 12 ? '#FFF4E0' : '#F7A6B4');
    vRect(v, 0, 5, 48, 1, COLOR.ciruela);
    vTile(v, 'tienda_tendera', 0, 4, 13);
    vTile(v, 'mar_tiles', 0, 26, 10 - Math.round(Math.abs(Math.sin(t * 2.5)) * 2));
    if (Math.floor(t * 4) % 3 === 0) vBits(v, ['.#.', '###', '.#.'], 40, 9, '#FFE08A');
  },
  diario(v, t) {
    vRect(v, 0, 0, 48, 32, '#FFF4E0');
    vTile(v, 'hud_tiles', 1, 2, 8);
    const n = Math.floor(t / 1.5) % 3;
    [[22, 2], [30, 14], [20, 18]].forEach(([x, y], i) => {
      vRect(v, x - 1, y - 1, 18, 18, i === n ? '#F28CA0' : '#E3C9BC'); vRect(v, x, y, 16, 16, '#FFFBF3');
      vTile(v, 'fauna_tiles', i, x, y);
    });
  },
  decorar(v, t) {
    for (let x = 0; x < 48; x += T) { vTile(v, 'casa_suelos_tiles', 1, x, 0); vTile(v, 'casa_suelos_tiles', 1, x, 16); }
    vTile(v, 'muebles_tiles', 0, 4, 14);
    const enMano = (t % 4) < 2, cx = enMano ? 22 + Math.round((t % 2) * 6) : 34;
    vTile(v, 'muebles_tiles', 2, cx, enMano ? 10 : 14);
    if (Math.floor(t * 3) % 2) { v.strokeStyle = '#F28CA0'; v.lineWidth = 1; v.strokeRect(cx - 0.5, 13.5, 17, 17); }
  },
  casa(v, t) {
    for (let x = 0; x < 48; x += T) { vTile(v, 'casa_suelos_tiles', 0, x, 0); vTile(v, 'casa_suelos_tiles', 0, x, 16); }
    vRect(v, 4, 14, 22, 14, COLOR.ciruela); vRect(v, 5, 15, 20, 12, '#F7A6B4'); vRect(v, 5, 15, 7, 5, '#FFFBF3');
    vGata(v, 'reposo', 8, 9, 0);
    for (let k = 0; k < 2; k++) { const s = ((t * 0.6 + k * 0.5) % 1); v.globalAlpha = 1 - s; vBits(v, ICONOS.zzz, 26 + s * 8, 10 - s * 10, '#9F8BC9'); }
    v.globalAlpha = 1;
  },
  jardin(v, t) {
    vSuelo(v, 0);
    ['tulipan', 'girasol', 'margarita'].forEach((id, i) => vTile(v, 'cultivos_' + id, 3, i * 15 + Math.round(Math.sin(t * 1.6 + i)), 14));
    const mx = 24 + Math.sin(t * 0.9) * 16, my = 6 + Math.sin(t * 2.3) * 3, ala = Math.floor(t * 8) % 2;
    vRect(v, mx, my, 1, 2, COLOR.ciruela); vRect(v, mx - 2, my - (ala ? 1 : 0), 2, 2, '#F7A6B4'); vRect(v, mx + 1, my - (ala ? 1 : 0), 2, 2, '#F7A6B4');
  },
  playa(v, t) {
    vTile(v, 'terreno_tiles', vAgua(v, t), 0, 0); vTile(v, 'terreno_tiles', vAgua(v, t), 16, 0); vTile(v, 'terreno_tiles', vAgua(v, t), 32, 0);
    vRect(v, 0, 12, 48, 20, '#F7E3B5');
    for (let x = 0; x < 48; x++) { const y = 12 + Math.round(Math.sin(t * 1.4 + x * 0.12) * 1.5); vRect(v, x, y, 1, 1, '#FFFFFF'); vRect(v, x, y + 1, 1, 2, '#EBCF98'); }
    vTile(v, 'mar_tiles', 0, 4, 15); vTile(v, 'mar_tiles', 3, 28, 16);
  },
  nadar(v, t) {
    vSuelo(v, vAgua(v, t));
    const y = 7 + Math.round(Math.sin(t * 2.4));
    vGata(v, 'reposoLado', 16, y, t);
    vRect(v, 17, y + 11, 14, 4, COLOR.ciruela); vRect(v, 18, y + 12, 12, 2, '#F28CA0'); vRect(v, 20, y + 12, 2, 2, '#FFF4E0'); vRect(v, 26, y + 12, 2, 2, '#FFF4E0');
    for (let k = 0; k < 3; k++) { v.globalAlpha = 0.6; vRect(v, 14 - k * 3, y + 14, 2, 1, '#FFFFFF'); }
    v.globalAlpha = 1;
  },
  barca(v, t) {
    vSuelo(v, vAgua(v, t));
    const y = 16 + Math.round(Math.sin(t * 1.8));
    vGata(v, 'reposo', 10, y - 12, t);
    vRect(v, 3, y, 28, 2, COLOR.ciruela); vRect(v, 4, y + 2, 26, 4, COLOR.ciruela); vRect(v, 5, y + 1, 24, 1, '#FFF4E0'); vRect(v, 6, y + 2, 22, 3, '#F7A6B4');
    const s = t % 4;
    if (s > 1.5) {
      vRect(v, 34, 22, 13, 4, '#4F6E9E'); vRect(v, 35, 21, 10, 1, '#4F6E9E');
      const alto = Math.min(8, Math.round((s - 1.5) * 10));
      if (s < 3) for (let j = 0; j < alto; j++) vRect(v, 40 + (j > 4 ? (j % 2 ? -1 : 1) : 0), 20 - j, 1, 1, '#FFFFFF');
    }
  },
  bucear(v, t) {
    vRect(v, 0, 0, 48, 32, '#9FD6E4'); vRect(v, 0, 24, 48, 8, '#C4E4E4'); vRect(v, 0, 24, 48, 1, '#DDF3F0');
    vTile(v, 'mar_tiles', 7, 30, 12);
    vTile(v, 'mar_tiles', 13, 2, 16);
    vGata(v, 'reposo', 14, 6 + Math.round(Math.sin(t * 2)), t);
    for (let k = 0; k < 3; k++) { const y = 18 - ((t * 10 + k * 7) % 20); vRect(v, 22 + k * 2, y, 2, 2, '#FFFFFF'); }
    v.globalAlpha = 0.25; for (let k = 0; k < 3; k++) vRect(v, ((t * 6 + k * 18) % 60) - 8, 0, 5, 32, '#FFFFFF'); v.globalAlpha = 1;
  },
  lluvia(v, t) {
    vSuelo(v, 0);
    ['girasol', 'tulipan', 'girasol'].forEach((id, i) => vTile(v, 'cultivos_' + id, 3, i * 15 + 1, 14 + (id === 'girasol' ? 1 : 0)));
    v.globalAlpha = 0.25; vRect(v, 0, 0, 48, 32, '#6E7FA8'); v.globalAlpha = 1;
    for (let k = 0; k < 14; k++) { const x = (k * 11 + Math.floor(t * 30)) % 52 - 2, y = (k * 7 + Math.floor(t * 60)) % 34 - 2; vRect(v, x, y, 1, 3, '#CFE6F5'); }
  },
  noche(v, t) {
    vRect(v, 0, 0, 48, 32, '#2E2A4F'); vRect(v, 0, 22, 48, 10, '#27406A');
    for (let k = 0; k < 12; k++) if (Math.sin(t * 2 + k * 1.7) > -0.2) vRect(v, (k * 17) % 48, (k * 7) % 18, 1, 1, '#FFF4E0');
    const s = (t % 3) / 3;
    if (s < 0.5) for (let j = 0; j < 6; j++) { v.globalAlpha = 1 - j / 6; vRect(v, 40 - s * 40 + j, 3 + s * 14 - j * 0.4, 1, 1, '#FFE08A'); }
    v.globalAlpha = 1;
    for (let k = 0; k < 8; k++) if (Math.sin(t * 3 + k * 2.1) > 0.3) vRect(v, (k * 13 + 5) % 48, 24 + (k * 5) % 7, 1, 1, '#7FF0E8');
    vRect(v, 0, 20, 20, 3, '#C98F6B'); vRect(v, 0, 20, 20, 1, '#E2B07E'); vRect(v, 4, 23, 2, 6, '#8A5A44'); vRect(v, 14, 23, 2, 6, '#8A5A44');
    vGata(v, 'reposo', 6, 6, t);
  },
};
function pintarVinetas() {
  const t = performance.now() / 1000;
  for (const c of document.querySelectorAll('#ayuda .pliego.activo canvas.vineta')) {
    const v = c.getContext('2d');
    v.imageSmoothingEnabled = false;
    v.clearRect(0, 0, c.width, c.height);
    const f = VINETAS[c.dataset.v];
    if (f) f(v, t);
  }
}
// Iconos de las pestanas del libro, pintados con los sprites del juego.
function pintarIconosAyuda() {
  for (const c of document.querySelectorAll('#ayudaPestanas canvas')) {
    const [nombre, n] = c.dataset.ico.split(':');
    const v = c.getContext('2d');
    v.imageSmoothingEnabled = false;
    v.clearRect(0, 0, T, T);
    vTile(v, nombre, +n, 0, 0);
  }
}

// ---------- Tutorial ----------
// Solo en la primera partida (o si se pide en ajustes). Cada paso explica una cosa, senala donde hacerla
// con una flecha y avanza en cuanto la haces. Se puede saltar cuando quieras.

const tecla = t => '<b>' + t + '</b>';
const TUTORIAL = [
  { texto: n => '¡Hola, ' + n + '! Este valle es tuyo. Muévete con ' + tecla('flechas') + ' o ' + tecla('WASD') + '; con ' + tecla('Mayús') + ' corres.',
    hecho: t => Math.hypot(estado.gata.x - t.x0, estado.gata.y - t.y0) > 28 },
  { texto: () => 'Ve a la tierra marrón del huerto y pulsa ' + tecla('Espacio') + ' para plantar una semilla.',
    donde: () => masCercana((c, f) => tile(c, f) === 'T' && !(estado.parcelas[c + ',' + f] || {}).cultivo),
    hecho: () => Object.values(estado.parcelas).some(p => p.cultivo) },
  { texto: () => '¡Qué bien! Ahora riégala con ' + tecla('Espacio') + '. Cuando brille, podrás cosecharla.',
    donde: () => { const k = Object.keys(estado.parcelas).find(k => estado.parcelas[k].cultivo && !estado.parcelas[k].regada); return k && aCasilla(k); },
    hecho: () => Object.values(estado.parcelas).some(p => p.cultivo && (p.regada || p.cultivo.etapa > 0)) },
  { texto: () => 'Pulsa ' + tecla('I') + ' para abrir tu bolsa: ahí guardas todo lo que consigues.',
    hecho: () => estado.bolsa },
  { texto: () => 'Acércate a la orilla del agua y pulsa ' + tecla('Espacio') + ' para lanzar la caña.',
    donde: () => masCercana((c, f) => tile(c, f) === 'W' && [[0, -1], [1, 0], [0, 1], [-1, 0]].some(([dc, df]) => puedeEstar((c + dc) * T, (f + df) * T - 6))),
    hecho: () => !!estado.pesca },
  { texto: () => enPueblo(casillaActual().f) ? '¡Ya estás en el pueblo! Habla con un vecino pulsando ' + tecla('Espacio') + ' a su lado: te contará qué le haría ilusión.'
      : 'Tus vecinos viven en el pueblo. Sigue el camino del este, cruza el puente y pasa bajo el arco de flores.',
    donde: () => VECINOS.reduce((a, v) => distancia(v) < distancia(a) ? v : a),
    hecho: () => !!estado.dialogo },
  { texto: () => 'Vuelve a tu casita y entra por la puerta con ' + tecla('Espacio') + '.',
    donde: () => CASA.puerta,
    hecho: () => estaDentro(casillaActual().f) },
  { texto: () => 'Este es tu cuarto. Pulsa ' + tecla('B') + ' para decorarlo a tu gusto.',
    hecho: () => !!estado.decorar },
  { texto: n => '¡Ya sabes lo básico, ' + n + '! Si olvidas algo, pulsa ' + tecla('H') + '. Aquí no hay prisa: disfruta.',
    final: true },
];
const aCasilla = k => { const [c, f] = k.split(',').map(Number); return { c, f }; };
const distancia = o => { const a = casillaActual(); return Math.hypot(o.c - a.c, o.f - a.f); };
// Casilla del exterior mas cercana a la gatita que cumple la prueba.
function masCercana(prueba) {
  let mejor = null, d = Infinity;
  for (let f = 0; f < INTERIOR.f0; f++) {
    for (let c = 0; c < (MAPA[f] || '').length; c++) {
      if (!prueba(c, f)) continue;
      const dd = distancia({ c, f });
      if (dd < d) { d = dd; mejor = { c, f }; }
    }
  }
  return mejor;
}

function empezarTutorial(paso = 0) {
  estado.tutorialHecho = false;
  estado.tutorial = { paso: Math.min(paso, TUTORIAL.length - 1), t: 0, x0: estado.gata.x, y0: estado.gata.y, bien: 0 };
  pintarTutorial();
}
function terminarTutorial() {
  estado.tutorial = null;
  estado.tutorialHecho = true;
  estado.pasoTutorial = 0;
  estado.consejos.inicio = true;       // los controles ya se han explicado
  el('tutorial').hidden = true;
}
function pintarTutorial() {
  const tu = estado.tutorial, p = TUTORIAL[tu.paso];
  el('tutorialPaso').textContent = p.final ? '¡TUTORIAL COMPLETADO!' : 'TUTORIAL · ' + (tu.paso + 1) + ' DE ' + (TUTORIAL.length - 1);
  el('tutorialTexto').innerHTML = marcarTexto(p.texto(escaparHtml(estado.nombre || 'vecina')));
  el('tutorialSaltar').textContent = p.final ? '¡A jugar!' : 'Saltar tutorial';
  el('tutorial').hidden = false;
}
function actualizarTutorial(dt) {
  const tu = estado.tutorial, p = TUTORIAL[tu.paso];
  tu.t += dt;
  tu.bien = Math.max(0, tu.bien - dt);
  const zona = regionDe(casillaActual().f).id;            // algunos pasos dicen otra cosa segun donde estes
  if (tu.zona !== zona) { tu.zona = zona; pintarTutorial(); }
  if (p.final) { if (tu.t > 9) terminarTutorial(); return; }
  if (tu.t < 0.6 || !p.hecho(tu)) return;
  // Paso conseguido: chispitas, un sonido alegre y el siguiente.
  tu.paso++;
  tu.t = 0;
  tu.bien = 0.8;
  estado.pasoTutorial = tu.paso;
  chispas(...sobreGata(), COLOR.mantequilla, 10, { fuerza: 26, vida: 0.7, arriba: 16 });
  sonar(TUTORIAL[tu.paso].final ? 'dorado' : 'acierto', tu.paso);
  pintarTutorial();
}
// Al decorar, la tarjeta se aparta de la cinta y del cajon; brilla un momento al acertar.
function cartelTutorial() {
  const tu = estado.tutorial, t = el('tutorial');
  if (!tu) return;
  t.hidden = !!(estado.inicio || estado.ayuda || estado.ajustes || estado.bolsa && !TUTORIAL[tu.paso].final || estado.enciclopedia);
  // Decorando, va pegada al cajon por dentro: el cursor siempre esta en el otro lado de la pantalla.
  const g = estado.decorar && geometriaCajon(estado.decorar);
  t.style.top = !g ? '' : g.arriba ? 'calc(' + (g.y0 + g.h + 3) + ' * var(--px))' : 'auto';
  t.style.bottom = g && !g.arriba ? 'calc(' + (lienzo.height - g.y0 + 3) + ' * var(--px))' : '';
  t.classList.toggle('bien', tu.bien > 0 || !!TUTORIAL[tu.paso].final);
}
el('tutorialSaltar').addEventListener('click', () => { el('tutorialSaltar').blur(); terminarTutorial(); sonar('recoger'); });
el('botonTutorial').addEventListener('click', () => {
  abrirAjustes(false);
  estado.gata.anim = 'reposo';
  empezarTutorial(0);
});

// Flecha que senala donde hacer el paso: rebota encima del sitio o, si no se ve, apunta desde el borde.
function dibujarGuiaTutorial(cx, cy) {
  const tu = estado.tutorial;
  if (!tu || estado.decorar || estado.dialogo || estado.pesca || !nadaAbierto() || estado.bolsa) return;
  const p = TUTORIAL[tu.paso];
  let o = p.donde && p.donde();
  if (!o) return;
  // Si esta en otra parte del mapa, la flecha lleva a la salida que toca: la puerta, el arco del valle o el del pueblo.
  const aqui = regionDe(casillaActual().f).id, alla = regionDe(o.f).id;
  if (aqui !== alla) o = aqui === 'casa' ? INTERIOR.salida : aqui === 'pueblo' ? SALIDA_PUEBLO : alla === 'pueblo' ? ARCO : CASA.puerta;
  const x = o.c * T + 8 - cx, y = o.f * T - cy, m = 14;
  const rebote = Math.round(Math.abs(Math.sin(estado.reloj * 4)) * 3);
  if (x > m && x < lienzo.width - m && y > m + 10 && y < lienzo.height - m) {
    flechaTutorial(x, y - 6 - rebote, Math.PI / 2);
    return;
  }
  // Fuera de la pantalla: una flecha en el borde que apunta hacia alla.
  const g = estado.gata, gx = g.x + 8 - cx, gy = g.y + 8 - cy;
  const ang = Math.atan2(y - gy, x - gx);
  const ex = Math.max(m, Math.min(lienzo.width - m, gx + Math.cos(ang) * 400));
  const ey = Math.max(m + 18, Math.min(lienzo.height - m - 16, gy + Math.sin(ang) * 400));
  flechaTutorial(ex - Math.cos(ang) * rebote, ey - Math.sin(ang) * rebote, ang);
}
// Flecha de pixel art (ciruela con relleno mantequilla) con la punta en (x, y) mirando hacia 'ang'.
function flechaTutorial(x, y, ang) {
  const forma = [[0, 0], [-6, -6], [-6, -3], [-13, -3], [-13, 3], [-6, 3], [-6, 6]];
  const punto = ([a, b]) => [x + a * Math.cos(ang) - b * Math.sin(ang), y + a * Math.sin(ang) + b * Math.cos(ang)];
  ctx.beginPath();
  forma.map(punto).forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
  ctx.closePath();
  ctx.fillStyle = COLOR.mantequilla;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = COLOR.ciruela;
  ctx.stroke();
}
function abrirAyuda(abrir) {
  estado.ayuda = abrir;
  el('ayuda').hidden = !abrir;
  if (abrir) { pintarIconosAyuda(); cambiarPestanaAyuda(pestanaAyuda); }
  sonar(abrir ? 'abrir' : 'recoger');
}
el('botonJugar').addEventListener('click', empezar);
el('botonComoSeJuega').addEventListener('click', () => abrirAyuda(true));
el('ayudaCerrar').addEventListener('click', () => abrirAyuda(false));
document.querySelectorAll('#ayudaPestanas .pestanaLibro').forEach(b => b.addEventListener('click', () => { b.blur(); cambiarPestanaAyuda(+b.dataset.p); }));
el('botonAyuda').addEventListener('click', () => { abrirAjustes(false); abrirAyuda(true); });

// ---------- Ajustes ----------
// Menu pequeno arriba a la derecha: musica, sonidos, ayuda y nueva partida. El juego espera mientras esta abierto.

function abrirAjustes(abrir) {
  estado.ajustes = abrir;
  el('ajustes').hidden = !abrir;
  sonar(abrir ? 'abrir' : 'recoger');
}
// Los botones de arriba solo responden cuando no hay otra cosa abierta.
const nadaAbierto = () => !estado.inicio && !estado.elegir && !estado.ayuda && !estado.fundido && !estado.dialogo && !estado.tejer && !estado.decorar && !estado.tienda
  && !estado.vestidor && !estado.pesca && !estado.pecera && estado.gata.anim !== 'alegria';
function alPulsar(id, accion) {
  el(id).addEventListener('click', () => { el(id).blur(); accion(); });
}
alPulsar('botonAjustes', () => { if (estado.ajustes) abrirAjustes(false); else if (nadaAbierto() && !estado.bolsa && !estado.enciclopedia) abrirAjustes(true); });
alPulsar('ajustesCerrar', () => abrirAjustes(false));
alPulsar('botonReto', cambiarConTiempo);
pintarBotonReto();

// ---------- Bolsa ----------
// Todo lo que tienes, dentro del juego. Tocar una semilla la elige, una prenda te la pone o quita,
// y cualquier otra cosa explica para que sirve.

const esPrenda = id => PRENDAS.some(pr => pr.id === id);
const totalBolsa = () => Object.entries(estado.inv).reduce((s, [id, n]) => s + (esPrenda(id) ? 0 : n), 0);

// Para que sirve un objeto: tintes, muebles y vecinos que lo piden.
function usosDe(id) {
  const fi = ficha(id), usos = [];
  const vale = coste => coste.tienda ? false : coste.id ? coste.id === id
    : coste.grupo === 'criatura' ? fi.tipo === 'fauna' && !esVariante(id)
    : esVariante(id) || fi.r >= 3;
  TINTES.filter(t => vale(t.coste)).forEach(t => usos.push('teñir lana'));
  MUEBLES.filter(m => vale(m.coste)).forEach(m => usos.push('construir ' + m.nombre.toLowerCase()));
  if (fi.tipo === 'fauna') usos.push('vivir en una pecera (constrúyela con el modo decorar, B)');
  if (id === 'fragmentoCoral') usos.push('plantarlo en el jardín de coral del fondo del mar');
  if (fi.tipo === 'tesoro' && fi.r >= 3) usos.push('lucirse en una vitrina');
  if (id === 'semillaOlvidada') usos.push('plantarla en una maceta olvidada (modo decorar, B): brilla de noche');
  if (fi.tipo === 'cebo') usos.push('pescar: se pone solo al lanzar la caña; pica antes y sale algo más raro o brillante');
  if (precioVenta(id)) usos.push('vendérselo a Bellota por ' + precioVenta(id) + ' ' + conchitas(precioVenta(id)) + ' en la tiendecita del pueblo');
  if (fi.tipo === 'abono') usos.push('abonar: ponte sobre una planta ya regada y pulsa Espacio; refunfuña, pero la hace crecer una etapa de golpe');
  VECINOS.filter(v => datosVecino(v).pedido.id === id).forEach(v => usos.push('dárselo a ' + v.nombre + ', que lo está pidiendo'));
  return usos.length ? 'Sirve para ' + [...new Set(usos)].join(' · ') + '.' : 'De momento es para tu colección.';
}

function ponerLista(id, tarjetas, vacio) {
  if (tarjetas.length) { el(id).replaceChildren(...tarjetas); return; }
  const p = document.createElement('p');
  p.className = 'vacio';
  p.textContent = vacio;
  el(id).replaceChildren(p);
}

// ---------- Bolsa: una mochila con bolsillos (pestanas), ranuras y la ficha de lo elegido
// PESTANAS_BOLSA: icono = cuadro de bolsa_iconos. cosasBolsa(id) da lo que hay en cada bolsillo como
// { dibujo, nombre, cuantos?, r?, texto, accion?, tecla?, lana?, usada?, usar? }; dibujo es { tira, n } o una funcion
// que pinta en un contexto de 16x16. bolsaVista (bolsillo y ranura elegidos) no se guarda.
const PESTANAS_BOLSA = [
  { id: 'semillas',     nombre: 'Semillas',     icono: 0, vacio: 'Aún no tienes semillas.' },
  { id: 'cosas',        nombre: 'Cosas',        icono: 1, vacio: 'Todavía no llevas nada. Cultiva, pesca o cava algo y aparecerá aquí.' },
  { id: 'ropa',         nombre: 'Ropa',         icono: 2, vacio: 'Aún no has tejido nada. Prueba en la cesta de lana de tu casa.' },
  { id: 'muebles',      nombre: 'Muebles',      icono: 3, vacio: 'No tienes muebles guardados. Los que recojas con el modo decorar (B) se guardan aquí.' },
  { id: 'herramientas', nombre: 'Herramientas', icono: 4, vacio: 'Aún no tienes herramientas. Los vecinos regalan una cuando os hacéis amigos, y Bellota vende alguna.' },
];
const bolsaVista = { pestana: 0, sel: 0 };
const vistosBolsa = {};                       // ultimo numero de cada contador, para que salte al cambiar
// Herramientas regaladas por los vecinos: no tienen dibujo propio, usan uno parecido.
const ICONO_REGALO = { regadera: ['objetos_iconos', 0], cana: ['objetos_iconos', 1], mapa: ['hud_tiles', 1], cubo: ['mar_tiles', MAR_TILES.cubo] };

// Icono de una prenda (iconos_ropa_tiles: bufanda, gorro, lazo): la lana se tine del color de la prenda y encima van
// la sombra (tirando a morado), la luz (tirando a mantequilla) y el contorno (el color oscurecido, no ciruela puro).
const ICONO_PRENDA = { bufanda: 0, gorro: 1, lazo: 2 };
function dibujoPrenda(pr) {
  const n = ICONO_PRENDA[pr.tipo], c = pr.color;
  return x => {
    const capa = (tira, color) => x.drawImage(color ? tintada(tira, color) : img[tira], n * T, 0, T, T, 0, 0, T, T);
    capa('iconos_ropa_tiles');
    capa('iconos_ropa_tiles_lana', c);
    capa('iconos_ropa_tiles_sombra', mezclarColor(c, '#5B3F7A', 0.42));
    capa('iconos_ropa_tiles_luz', mezclarColor(c, '#FFF6D6', 0.55));
    capa('iconos_ropa_tiles_borde', mezclarColor(c, '#3A2840', 0.62));
  };
}

function cosasBolsa(id) {
  if (id === 'semillas') return CULTIVOS.map((cu, i) => ({
    dibujo: { tira: img.iconos_cultivos, n: i }, nombre: cu.nombre, tecla: String(i + 1), usada: i === estado.semilla,
    texto: 'Semilla de ' + cu.nombre.toLowerCase() + '. No se gasta nunca: plántala en la tierra del huerto con Espacio.',
    accion: i === estado.semilla ? 'La llevas en la mano.' : 'Espacio: llevar esta.',
    usar: () => { estado.semilla = i; sonar('elegir'); },
  }));
  if (id === 'cosas') return Object.keys(estado.inv).filter(k => estado.inv[k] > 0 && !esPrenda(k))
    .sort((a, b) => (ficha(a).tipo === 'fauna') - (ficha(b).tipo === 'fauna') || ficha(a).r - ficha(b).r)
    .map(k => ({ dibujo: dibujoDe(k), nombre: nombreDe(k), cuantos: estado.inv[k], r: ficha(k).r, texto: usosDe(k) }));
  if (id === 'ropa') return estado.armario.map(pr => {
    const prenda = PRENDAS.find(a => a.id === pr.tipo), puesta = estado.ropa[pr.tipo] === pr.color;
    const tinte = TINTES.find(t => t.color === pr.color);
    return {
      dibujo: dibujoPrenda(pr), nombre: prenda.nombre, lana: pr.color, usada: puesta,
      texto: 'Tejida por ti' + (tinte ? ' con lana teñida de ' + tinte.texto : '') + '.',
      accion: puesta ? 'La llevas puesta. Espacio: quitártela.' : 'Espacio: ponértela.',
      usar: () => { estado.ropa[pr.tipo] = puesta ? null : pr.color; sonar('elegir'); },
    };
  });
  if (id === 'muebles') return MUEBLES.map((m, i) => ({ m, i })).filter(({ m }) => estado.muebles[m.id] > 0).map(({ m, i }) => ({
    dibujo: { tira: img[tiraMueble(i)], n: iconoMueble(i) }, nombre: m.nombre, cuantos: estado.muebles[m.id],
    texto: 'Colócalo donde quieras con el modo decorar (B' + (i < 10 ? ', número ' + ((i + 1) % 10) : ', Q/R para buscarlo') + ').',
  }));
  return Object.entries(HERRAMIENTAS).filter(([k]) => estado.herramientas[k]).map(([k, h]) => {
    const regalo = h.vecino && VECINOS.find(v => v.id === h.vecino), otro = ICONO_REGALO[k];
    return {
      dibujo: h.tienda ? iconoHerramienta(h) : otro ? { tira: img[otro[0]], n: otro[1] } : null, nombre: h.nombre,
      texto: h.texto + '.', accion: (regalo ? 'Regalo de ' + regalo.nombre + '. ' : 'De la tiendecita de Bellota. ') + 'Funciona sola, no hay que equiparla.',
    };
  });
}

function iconoEn(lienzoIcono, dibujo) {
  lienzoIcono.width = lienzoIcono.height = T;
  const x = lienzoIcono.getContext('2d');
  if (typeof dibujo === 'function') dibujo(x);
  else if (dibujo) x.drawImage(contornoSuave(dibujo.tira), dibujo.n * T, 0, T, T, 0, 0, T, T);
}

function ranuraBolsa(c, i) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'ranura' + (i === bolsaVista.sel ? ' elegida' : '') + (c.usada ? ' usada' : '');
  b.setAttribute('aria-label', c.nombre + (c.cuantos ? ' × ' + c.cuantos : ''));
  const icono = document.createElement('canvas');
  iconoEn(icono, c.dibujo);
  b.appendChild(icono);
  const extra = (clase, texto) => { const s = document.createElement('span'); s.className = clase; if (texto) s.textContent = texto; b.appendChild(s); return s; };
  if (c.cuantos > 1) extra('cuantos', c.cuantos);
  if (c.tecla) extra('tecla', c.tecla);
  if (c.lana) extra('lana').style.background = c.lana;
  if (c.usada) extra('marca');
  b.addEventListener('click', () => { b.blur(); elegirRanura(i, true); });
  return b;
}
function ranuraVacia() {
  const b = document.createElement('div');
  b.className = 'ranura vacia';
  return b;
}
// Cuantas ranuras caben por fila: las columnas que ha puesto el grid.
const columnasBolsa = () => Math.max(1, getComputedStyle(el('bolsaRejilla')).gridTemplateColumns.split(' ').filter(Boolean).length);

function contarBolsa(id, n) {
  const caja = el(id);
  caja.querySelector('b').textContent = n;
  if (vistosBolsa[id] !== undefined && vistosBolsa[id] !== n) { caja.classList.remove('sube'); void caja.offsetWidth; caja.classList.add('sube'); }
  vistosBolsa[id] = n;
}

function pintarBolsa() {
  contarBolsa('bolsaCuentaObjetos', totalBolsa());
  contarBolsa('bolsaCuentaRopa', estado.armario.length);
  contarBolsa('bolsaCuentaConchitas', estado.conchitas);
  el('bolsaPestanas').replaceChildren(...PESTANAS_BOLSA.map((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    if (i === bolsaVista.pestana) b.className = 'elegida';
    b.innerHTML = '<i style="--n:' + p.icono + '"></i>' + p.nombre;
    b.addEventListener('click', () => { b.blur(); cambiarBolsillo(i - bolsaVista.pestana); });
    return b;
  }));
  const p = PESTANAS_BOLSA[bolsaVista.pestana], cosas = cosasBolsa(p.id), rejilla = el('bolsaRejilla');
  bolsaVista.sel = Math.max(0, Math.min(bolsaVista.sel, cosas.length - 1));
  rejilla.replaceChildren(...cosas.map(ranuraBolsa));
  // Se rellena con huecos vacios hasta completar las filas (y al menos tres), para que se vea la mochila entera.
  const cols = columnasBolsa(), total = Math.max(cols * 3, Math.ceil(cosas.length / cols) * cols);
  for (let i = cosas.length; i < total; i++) rejilla.appendChild(ranuraVacia());
  pintarFichaBolsa(cosas[bolsaVista.sel], p);
}

function pintarFichaBolsa(c, p) {
  const f = el('bolsaFicha');
  if (!c) { f.innerHTML = '<div class="plato"></div><h2>Bolsillo vacío</h2><p class="uso">' + marcarTexto(p.vacio) + '</p>'; return; }
  const que = [];
  if (c.r >= 0) que.push('<span class="rareza" style="border-color:' + RAREZAS[c.r].color + '">' + RAREZAS[c.r].nombre + '</span>');
  if (c.cuantos) que.push('<span>× ' + c.cuantos + '</span>');
  if (c.tecla) que.push('<span>Tecla <kbd>' + c.tecla + '</kbd></span>');
  f.innerHTML = '<div class="plato"><canvas></canvas></div><h2>' + escaparHtml(c.nombre) + '</h2>'
    + (que.length ? '<div class="que">' + que.join('') + '</div>' : '')
    + '<p class="uso">' + marcarTexto(c.texto) + '</p>' + (c.accion ? '<p>' + marcarTexto(c.accion) + '</p>' : '');
  iconoEn(f.querySelector('canvas'), c.dibujo);
}

// Elige una ranura; con usar (clic, Espacio) ademas la usa si se puede (semilla en la mano, prenda puesta).
function elegirRanura(i, usar) {
  const cosas = cosasBolsa(PESTANAS_BOLSA[bolsaVista.pestana].id);
  if (!cosas.length) return;
  i = Math.max(0, Math.min(i, cosas.length - 1));
  const otra = i !== bolsaVista.sel;
  bolsaVista.sel = i;
  if (usar && cosas[i].usar) cosas[i].usar();
  else if (otra || usar) sonar('cursor');
  pintarBolsa();
  const r = el('bolsaRejilla').children[i];
  if (usar) r.classList.add('pop');
  r.scrollIntoView({ block: 'nearest' });
}

function cambiarBolsillo(d) {
  if (!d) return;
  const n = PESTANAS_BOLSA.length;
  bolsaVista.pestana = (bolsaVista.pestana + d + n) % n;
  bolsaVista.sel = PESTANAS_BOLSA[bolsaVista.pestana].id === 'semillas' ? estado.semilla : 0;
  sonar('cursor');
  pintarBolsa();
  el('bolsa').querySelector('.forro').scrollTop = 0;
}

function teclaBolsa(codigo, e) {
  const n = NUMEROS.indexOf(codigo), cols = columnasBolsa();
  if (codigo === 'KeyI' || codigo === 'Escape') abrirBolsa(false);
  else if (codigo === 'Tab' || codigo === 'KeyQ' || codigo === 'KeyR') { e.preventDefault(); cambiarBolsillo(codigo === 'KeyQ' || e.shiftKey ? -1 : 1); }
  else if (codigo === 'ArrowLeft') elegirRanura(bolsaVista.sel - 1);
  else if (codigo === 'ArrowRight') elegirRanura(bolsaVista.sel + 1);
  else if (codigo === 'ArrowUp' && bolsaVista.sel >= cols) elegirRanura(bolsaVista.sel - cols);
  else if (codigo === 'ArrowDown') elegirRanura(bolsaVista.sel + cols);
  else if (['Space', 'Enter', 'KeyE'].includes(codigo)) { e.preventDefault(); elegirRanura(bolsaVista.sel, true); }
  else if (n >= 0 && n < CULTIVOS.length) {
    estado.semilla = n;
    if (PESTANAS_BOLSA[bolsaVista.pestana].id === 'semillas') bolsaVista.sel = n;
    sonar('elegir');
    pintarBolsa();
  }
}

function abrirBolsa(abrir) {
  estado.bolsa = abrir;
  el('bolsa').hidden = !abrir;
  sonar(abrir ? 'abrir' : 'recoger');
  if (abrir) {
    if (PESTANAS_BOLSA[bolsaVista.pestana].id === 'semillas') bolsaVista.sel = estado.semilla;
    pintarBolsa();
  }
}
const alternarBolsa = () => { if (estado.bolsa) abrirBolsa(false); else if (nadaAbierto() && !estado.ajustes && !estado.enciclopedia) abrirBolsa(true); };
alPulsar('botonBolsa', alternarBolsa);
alPulsar('botonSemillas', () => { estado.ultimoUso = estado.reloj; alternarSaquito(); });
// Boton del sillon (solo en casa): empieza a decorar, como la tecla B.
const INVITAR_DECORAR = 6;          // segundos que el sillon da saltitos al entrar en casa
alPulsar('botonDecorar', () => {
  estado.invitaDecorar = undefined;
  if (!estado.decorar && nadaAbierto() && !estado.bolsa && !estado.enciclopedia && !estado.ajustes) abrirDecorar();
});
// --px: tamano en pantalla de un pixel del lienzo, para que los iconos HTML crezcan con el juego.
// --u: pixel de la letra y de los marcos de la interfaz, siempre entero (2, 3...) para que se vean nitidos;
// --t: texto normal (12 pixeles de letra); --tc / --uc: lo mismo para el texto compacto (un punto menos).
// El lienzo ocupa toda la ventana, sin bordes ni franjas: siempre mide 160 pixeles de alto y su ancho sigue la
// forma de la pantalla (240 en 3:2, unos 284 en 16:9). Al cambiarlo se reinicia el contexto, asi que se vuelve a
// pedir pixel nitido.
function medirLienzo() {
  const ancho = Math.max(200, Math.min(400, Math.round(lienzo.height * innerWidth / Math.max(1, innerHeight))));
  if (lienzo.width === ancho) return;
  lienzo.width = ancho;
  ctx.imageSmoothingEnabled = false;
  // Las barras de pesca y de cavar se pensaron para 240 de ancho: se mueven para seguir centradas.
  const d = Math.round((ancho - 240) / 2);
  BARRA.x = 60 + d; TABLA_CAVAR.x = 44 + d; BARRA_CAVAR.x = 84 + d;
  if (cam) cam.lista = false;
}
function ajustarEscala() {
  medirLienzo();
  const px = lienzo.clientWidth / lienzo.width;
  const u = Math.max(2, Math.round(px * 0.45)), uc = Math.max(1, u - 1);
  const raiz = document.documentElement.style;
  raiz.setProperty('--px', px + 'px');
  raiz.setProperty('--u', u + 'px');
  raiz.setProperty('--uc', uc + 'px');
  raiz.setProperty('--t', 12 * u + 'px');
  raiz.setProperty('--tc', 12 * uc + 'px');
  encajarDiario();
  if (estado.bolsa) pintarBolsa();          // las columnas de ranuras cambian con el ancho
}
// En ventanas pequenas el diario de portada se encoge para caber entero dentro del lienzo.
function encajarDiario() {
  const hoja = document.querySelector('#inicio .hoja');
  if (!hoja || !hoja.offsetHeight) return;
  hoja.style.scale = '';
  const cabe = lienzo.clientHeight * 0.9;
  if (hoja.offsetHeight > cabe) hoja.style.scale = (cabe / hoja.offsetHeight).toFixed(3);
}
addEventListener('resize', ajustarEscala);
ajustarEscala();
alPulsar('bolsaCerrar', () => abrirBolsa(false));

// ---------- Tiendecita ----------
// Panel de Bellota: en "Comprar" esta el CATALOGO (lo que no llega a pagarse sale mas clarito) y en "Vender"
// lo que llevas en la bolsa que se puede vender. Lo que dice Bellota va arriba, en su bocadillo.
const SALUDOS_TIENDA = [
  '¡Hola, {nombre}! Pasa, pasa. Te cambio lo que cultivas o pescas por conchitas.',
  '¡Qué alegría verte, {nombre}! Hoy tengo la tienda preciosa, ¿verdad?',
  'Mmm, ¿traes algo de pesca? Las criaturas raras valen muchas conchitas.',
];
// Bellota habla: el texto va a su bocadillo y el retrato da unos saltitos.
function decirTienda(texto) {
  el('tiendaDetalle').innerHTML = texto;
  const r = el('tiendaRetrato');
  r.classList.remove('habla'); void r.offsetWidth; r.classList.add('habla');
}
function abrirTienda(abrir) {
  estado.tienda = abrir ? { pestana: 'comprar' } : null;
  el('tienda').hidden = !abrir;
  sonar(abrir ? 'abrir' : 'recoger');
  if (!abrir) return;
  conchitasVistas = estado.conchitas;
  decirTienda(escaparHtml(alAzar(SALUDOS_TIENDA).replace('{nombre}', estado.nombre)));
  pintarTienda();
}
function cambiarPestanaTienda(pestana) {
  const t = estado.tienda;
  t.pestana = pestana || (t.pestana === 'comprar' ? 'vender' : 'comprar');
  sonar('cursor');
  decirTienda(t.pestana === 'comprar' ? 'Toca lo que quieras llevarte.' : 'Toca lo que quieras venderme: te doy conchitas por cada uno.');
  pintarTienda();
}
const articuloMueble = a => a.mueble ? MUEBLES.findIndex(m => m.id === a.mueble) : -1;
// Precio con su conchita dibujada al lado (en vez de la palabra).
const precioHtml = (n, extra = '') => '<span class="precio">' + n + '<i class="concha"></i>' + (extra ? '<small>' + extra + '</small>' : '') + '</span>';
// Platito de color detras del icono: 0 menta (herramientas), 1 rosa (criaturas), 2 mantequilla (cosechas y objetos), 3 lila (muebles y tesoros).
const DISCO_TIENDA = { herramienta: 0, fauna: 1, cultivo: 2, abono: 2, cebo: 2, mueble: 3, tesoro: 3 };
// Etiqueta kraft de un articulo: platito con el icono, nombre, precio y, si hace falta, cuantos llevas.
function articuloTienda({ dibujo, titulo, precio, nota, disco = 2, cuantos, clase = '', alTocar }) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'articulo ' + clase;
  const plato = document.createElement('span');
  plato.className = 'disco';
  plato.style.setProperty('--d', disco);
  if (dibujo) {
    const icono = document.createElement('canvas');
    icono.width = icono.height = T;
    icono.getContext('2d').drawImage(contornoSuave(dibujo.tira), dibujo.n * T, 0, T, T, 0, 0, T, T);
    plato.appendChild(icono);
  }
  b.appendChild(plato);
  const texto = document.createElement('div');
  texto.innerHTML = '<b>' + escaparHtml(titulo) + '</b>' + precio + (nota ? '<small>' + nota + '</small>' : '');
  b.appendChild(texto);
  if (cuantos > 1) { const g = document.createElement('span'); g.className = 'globo'; g.textContent = '×' + cuantos; b.appendChild(g); }
  b.addEventListener('click', () => { b.blur(); alTocar(); });
  return b;
}
// La bolsita de conchitas de la esquina: el numero da un saltito cuando cambia.
let conchitasVistas = 0;
function pintarConchitas() {
  const caja = el('tiendaConchitas');
  caja.querySelector('b').innerHTML = estado.conchitas + '<i class="concha"></i>';
  caja.title = 'Tienes ' + estado.conchitas + ' ' + conchitas(estado.conchitas);
  if (estado.conchitas !== conchitasVistas) { caja.classList.remove('sube'); void caja.offsetWidth; caja.classList.add('sube'); }
  conchitasVistas = estado.conchitas;
}
function pintarTienda() {
  const t = estado.tienda;
  pintarConchitas();
  el('tiendaComprar').classList.toggle('elegida', t.pestana === 'comprar');
  el('tiendaVender').classList.toggle('elegida', t.pestana === 'vender');
  if (t.pestana === 'comprar') {
    ponerLista('tiendaLista', CATALOGO.filter(a => !a.requiere || estado.herramientas[a.requiere]).map(a => {
      const n = articuloMueble(a), he = a.herramienta && HERRAMIENTAS[a.herramienta];
      const nombre = he ? he.nombre : n >= 0 ? MUEBLES[n].nombre : nombreDe(a.id);
      const tengo = he ? 0 : n >= 0 ? estado.muebles[a.mueble] : estado.inv[a.id] || 0, mia = he && estado.herramientas[a.herramienta];
      const b = articuloTienda({
        dibujo: he ? iconoHerramienta(he) : n >= 0 ? { tira: img[tiraMueble(n)], n: iconoMueble(n) } : dibujoDe(a.id), titulo: nombre,
        precio: mia ? '<span class="precio">¡Ya es tuyo!</span>' : precioHtml(a.precio), nota: tengo ? 'tienes ' + tengo : '',
        disco: he ? DISCO_TIENDA.herramienta : n >= 0 ? DISCO_TIENDA.mueble : DISCO_TIENDA[ficha(a.id).tipo] ?? 2,
        clase: mia ? 'tuyo' : estado.conchitas < a.precio ? 'caro' : '', alTocar: () => comprar(a, nombre),
      });
      b.title = a.texto;
      return b;
    }), '');
    return;
  }
  const mios = Object.keys(estado.inv).filter(id => estado.inv[id] > 0 && precioVenta(id) > 0)
    .sort((a, b) => (ficha(a).tipo === 'fauna') - (ficha(b).tipo === 'fauna') || ficha(a).r - ficha(b).r);
  ponerLista('tiendaLista', mios.map(id => articuloTienda({
    dibujo: dibujoDe(id), titulo: nombreDe(id), precio: precioHtml(precioVenta(id), 'cada uno'), cuantos: estado.inv[id],
    disco: DISCO_TIENDA[ficha(id).tipo] ?? 2, alTocar: () => vender(id),
  })), 'No llevas nada que vender. Bellota compra cosechas, criaturas y tesoros.');
}
function comprar(a, nombre) {
  if (a.herramienta && estado.herramientas[a.herramienta]) {
    sonar('cursor');
    decirTienda('¡Ese ya es tuyo! ' + a.texto);
    return;
  }
  if (estado.conchitas < a.precio) {
    const faltan = a.precio - estado.conchitas;
    sonar('fallo');
    decirTienda('Te faltan <b>' + faltan + ' ' + conchitas(faltan) + '</b>. ¡Sin prisa! Tráeme cosechas o algo que hayas pescado y te las cambio.');
    return;
  }
  estado.conchitas -= a.precio;
  if (a.herramienta) estado.herramientas[a.herramienta] = true;
  else if (a.mueble) estado.muebles[a.mueble]++;
  else dar(a.id);
  sonar('cosechar');
  decirTienda('¡Aquí tienes: <b>' + nombre.toLowerCase() + '</b>! ' + (a.mueble ? 'Lo encontrarás en la bolsa; colócalo con el modo decorar (B).'
    : a.herramienta === 'barca' ? 'Ya está amarrada en el embarcadero de la playa, al sur del valle.'
    : a.herramienta === 'palaMadera' ? 'Busca por el valle <b>montoncitos de tierra con un brillito</b>: ponte al lado y pulsa Espacio.'
    : a.herramienta === 'radar' ? 'Cada día hay un tesoro escondido sin marca en el valle: Pipí pita más deprisa cuanto más cerca estés.' : 'Ya está en tu bolsa.') + ' ' + a.texto);
  pintarTienda();
}
function vender(id) {
  if (!(estado.inv[id] > 0)) return;
  const precio = precioVenta(id);
  quitar(id);
  estado.conchitas += precio;
  sonar('elegir');
  // Si un vecino lo estaba pidiendo y te quedas sin bastantes, Bellota te lo recuerda (sin impedirlo).
  const quien = VECINOS.find(v => datosVecino(v).pedido.id === id && (estado.inv[id] || 0) < datosVecino(v).pedido.n);
  decirTienda('¡Gracias! Aquí tienes <b>' + precio + ' ' + conchitas(precio) + '</b> por ' + (esVariante(id) ? '¡algo tan especial! ' : 'tu ' + nombreDe(id).toLowerCase() + '.')
    + (quien ? ' Por cierto, creo que ' + quien.nombre + ' andaba buscando uno de estos…' : ''));
  pintarTienda();
}
alPulsar('tiendaCerrar', () => abrirTienda(false));
alPulsar('tiendaComprar', () => cambiarPestanaTienda('comprar'));
alPulsar('tiendaVender', () => cambiarPestanaTienda('vender'));

// ---------- Textos ----------

const PISTAS = {
  plantar: 'Espacio: plantar',
  regar: 'Espacio: regar',
  abonar: 'Espacio: abonar con un aguacate malvado · la planta crece una etapa de golpe',
  tablon: 'Espacio: leer el tablón de pedidos de los vecinos',
  sentarse: 'Espacio: sentarte un ratito en el banco (el tiempo pasa más deprisa)',
  tienda: 'Espacio: entrar en la tiendecita de Bellota (compra y vende por conchitas)',
  levantarse: 'Descansando en el banco… el tiempo pasa más deprisa · Espacio o moverte: levantarte',
  cosechar: 'Espacio: ¡cosechar!',
  pescar: 'Espacio: lanzar la caña',
  barca: 'Espacio: subir a tu barquita y salir al mar',
  desembarcar: 'Espacio: bajar de la barca a tierra (la barca te espera donde la dejes)',
  concha: 'Espacio: recoger lo que ha dejado la marea',
  poza: 'Espacio: asomarte a la poza de marea a ver quién vive dentro',
  pozaVista: 'Ya has mirado en esta poza hoy: mañana la marea traerá a alguien nuevo',
  castillo: 'Espacio: hacer un castillo de arena (pulsa varias veces para que crezca)',
  botella: 'Espacio: ¡una botella con un mensaje dentro! Cógela y léelo',
  cavar: 'Espacio: cavar donde marca la cruz del mapa',
  excavar: 'Espacio: cavar en el montoncito con tu pala',
  talar: 'Espacio: dar un hachazo al árbol (con tres, cae)',
  sinPala: 'Aquí hay algo enterrado… Bellota vende palas en su tiendecita del pueblo',
  golpe: 'Espacio cuando la palita pase por la tierra blanda · cada acierto quita una capa · el centro dorado atrae rarezas · Esc: dejarlo',
  rescatar: 'Espacio: ¡ayudar al animalito!',
  cofre: 'Espacio: abrir el cofre de la palmera',
  cofreVacio: 'El cofre está vacío por hoy: el mar lo vuelve a llenar cada mañana',
  bucear: 'Espacio: ponerte las gafas y bucear hasta el fondo',
  sinGafas: 'Aquí salen burbujas del fondo… Con unas gafas de bucear (en la tiendecita de Bellota) podrías sumergirte',
  subir: 'Espacio: volver a la superficie · aquí abajo puedes abrir ostras y plantar coral',
  ostra: 'Espacio: abrir la ostra con mucho cuidado',
  ostraVista: 'Ya has abierto esta ostra hoy: vuelve mañana',
  plantarCoral: 'Espacio: plantar una ramita de coral',
  sinCoral: 'Aquí se planta coral: necesitas una ramita de coral (sale en las ostras y a veces en la orilla)',
  coralCrece: 'Tu coral crece un poquito cada día; cuando esté grande, ven a cuidarlo cada mañana',
  cuidarCoral: 'Espacio: cuidar tu coral (te regala una ramita, y a veces algo más)',
  sinBarca: 'Aquí se amarra una barca: Bellota vende una en su tiendecita del pueblo',
  recoger: 'Esperando a que piquen… (Espacio o moverte: recoger la caña)',
  atrapar: '¡Pica! ¡Pulsa Espacio!',
  tirar: 'Espacio cuando el pececito pase por lo verde · el centro dorado atrae rarezas · fallar resta tiempo',
  entrar: 'Espacio: entrar en casa',
  salir: 'Espacio: salir de casa',
  dormir: 'Espacio: dormir una siesta (los cultivos crecen mientras duermes)',
  sinSueno: 'Aún no tienes sueño; vuelve dentro de un ratito',
  tejer: 'Espacio: tejer ropa',
  armario: 'Espacio: abrir el armario y cambiarte de ropa',
  prenda: 'Elige qué tejer · ' + PRENDAS.map((p, i) => (i + 1) + ': ' + p.nombre.toLowerCase()).join(' · ') + ' · Esc: salir',
  sinTinte: 'Para tejer necesitas un tinte: algo que hayas cultivado o pescado',
  elegir: 'Elige el tinte · ' + TINTES.map((t, i) => (i + 1) + ': ' + t.texto).join(' · ') + ' · Esc: salir',
  tejiendo: 'Pulsa la flecha del botón que brilla para cada punto · equivocarte resta tiempo · Esc: salir',
  pecera: 'Espacio: elegir quién vive en la pecera',
  eligiendoPecera: 'Elige qué poner dentro (con su número); si está lleno, el que lleva más tiempo vuelve a la bolsa · Esc: salir',
  vitrina: 'Espacio: elegir qué tesoro se luce en la vitrina',
  inicio: 'Flechas o WASD: moverte · Mayús: correr · Espacio: hacer lo del bocadillo · G: semillas · I: bolsa · B: decorar · H: ayuda',
};
// Modos en los que el texto de abajo se muestra siempre (explica los controles del minijuego o del panel).
const SIEMPRE = new Set(['golpe', 'sinBarca', 'prenda', 'elegir', 'tejiendo', 'eligiendoPecera', 'recoger', 'atrapar', 'tirar', 'sinTinte', 'sinSueno', 'levantarse',
  'pozaVista', 'cofreVacio', 'sinGafas', 'ostraVista', 'sinCoral', 'coralCrece']);

function actualizarHud() {
  const p = progreso();
  el('botonEnci').title = 'Enciclopedia (C) · ' + p.especies + '/' + ENTRADAS.length + ' · ★' + p.brillantes;
  const total = totalBolsa();
  el('bolsaGlobo').hidden = !total;
  el('bolsaGlobo').textContent = total;
  el('botonBolsa').title = 'Bolsa (I) · ' + total + ' objetos';
  el('botonSemillas').title = 'Semillas (G) · ' + CULTIVOS[estado.semilla].nombre;
  el('botonSemillas').classList.toggle('abierto', estado.saquito);
  el('botonSemillas').hidden = !barraVisible() && !estado.saquito;
  const enCasa = estaDentro(casillaActual().f) && !estado.inicio;
  const invita = enCasa && estado.invitaDecorar !== undefined && estado.reloj - estado.invitaDecorar < INVITAR_DECORAR;
  // El sillon de decorar sale en casa y en el valle (para el jardin); en el pueblo y en la barca, no.
  el('botonDecorar').hidden = estado.inicio || enPueblo(casillaActual().f) || estado.navegando || bajoAgua(casillaActual().f);
  el('botonDecorar').classList.toggle('invita', invita);
  el('decorarInvita').hidden = !invita;
  el('botonAjustes').title = 'Ajustes (Esc) · ' + momento(estado.hora) + (llueve() ? ', lloviendo' : '');
  el('hud').hidden = estado.inicio || !!estado.elegir;
  if (estado.elegir) {
    const problema = problemaHogar(estado.elegir) || '';
    if (el('elegirAviso').textContent !== problema) el('elegirAviso').textContent = problema;
  }
  el('hud').style.opacity = estado.fundido ? 0 : estado.alfaHud;     // durante el iris no se ven los botones
  const lugar = estado.lugar && estado.lugar.t < 3 && !estado.inicio;
  if (lugar && el('lugar').hidden) { el('lugarNombre').textContent = estado.lugar.nombre; el('lugarAntes').textContent = estado.lugar.antes; }
  el('lugar').hidden = !lugar;
  let clave = estado.tejer ? estado.tejer.fase : estado.pecera ? 'eligiendoPecera' : accionPosible();
  // Fuera de los minijuegos, el bocadillo ya dice que hara Espacio: el texto solo sale la primera vez (consejo).
  cartelTutorial();
  if (!estado.inicio && !estado.elegir && !estado.tutorial && !estado.consejos.inicio) { estado.consejos.inicio = true; estado.consejo = { clave: 'inicio', t: 12 }; }
  if (clave && !SIEMPRE.has(clave) && !estado.consejos[clave] && nadaAbierto()) { estado.consejos[clave] = true; estado.consejo = { clave, t: 7 }; }
  const aconsejar = estado.consejo && (estado.consejo.clave === clave || estado.consejo.clave === 'inicio');
  if (!SIEMPRE.has(clave) && !aconsejar) clave = null;
  if (!clave && aconsejar) clave = estado.consejo.clave;
  let texto = PISTAS[clave] || '';
  if (clave === 'vecino') {
    const lugar = vecinoCercano(), v = vecinoEn(lugar.c, lugar.f), p = datosVecino(v).pedido;
    const tengo = estado.inv[p.id] || 0;
    texto = 'Espacio: ' + (tengo >= p.n ? 'darle a ' + v.nombre + ' lo que te pidió' : 'hablar con ' + v.nombre);
  }
  if (estado.dialogo) texto = '';
  if (estado.vestidor) texto = 'Arriba/abajo: elegir prenda · izquierda/derecha: cambiar color o quitarla · Espacio: cerrar';
  if (clave === 'plantar') texto += ' ' + CULTIVOS[estado.semilla].nombre.toLowerCase() + ' · G: abrir el saquito para cambiar de semilla';
  if (clave === 'pescar') texto += ' en ' + ZONAS[zonaPesca(aguaCercana() || casillaActual())] + (llueve() ? ' · con lluvia pican criaturas especiales' : '');
  if ((clave === 'tejer' || clave === 'prenda' || clave === 'elegir' || clave === 'tejiendo') && tejerEnCasaConLluvia()) texto += ' · Día de lluvia en casa: ¡la mitad de puntos!';
  if (estado.pesca && estado.pesca.fase === 'escapo') texto = 'Se escapó… no pasa nada, ¡prueba otra vez!';
  if (estado.decorar) texto = pistaDecorar(estado.decorar);
  if (estado.elegir) texto = '';          // al elegir el hogar, las teclas van en su tarjeta
  pintarPista(texto, clave);
  el('pista').style.setProperty('--pb', bordePista());
  carteles();
  etiquetaVecino();
  if (estado.ayuda) pintarVinetas();
}

// ---------- Notas de consejo ----------
// Palabras clave que salen de color en los textos (consejos, avisos, dialogos y tutorial): rosa para tejer y los
// vecinos, miel para tintes y tesoros, verde para el huerto y la pesca, azul para el mar.
const PALABRAS_COLOR = [
  ['rosa', 'tejer|tejiendo|teje|ropa|prendas?|lana|puntos?|vecin[oa]s?|corazon(es)?|corazón|rosa'],
  ['miel', 'tintes?|cultivad[oa]s?|semillas?|cosechar|conchitas|cebo|tesoros?|cofre|rarezas|amarillo|brillantes?|estrellas?'],
  ['verde', 'pescad[oa]s?|pescar|caña|plantar|regar|abonar|planta|cultivos|huerto|coral|aguacate'],
  ['mar', 'mar|barca|barquita|bucear|nadar|marea|poza|ostras?|burbujas|superficie|playa'],
];
const REGEX_COLOR = PALABRAS_COLOR.map(([c, p]) => [c, new RegExp('(?<![\\p{L}])(' + p + ')(?![\\p{L}])', 'giu')]);
// Teclas que salen como teclas retro: Espacio, Esc, Mayús, Enter, Tab, las flechas y las letras o numeros seguidos de ':'.
const REGEX_TECLA = /(?<![\p{L}])(Espacio|Esc|Mayús|Enter|Tab|Ctrl\+Z|WASD|Q\/R|[A-Z0-9](?=:))(?![\p{L}])/gu;
// Marca un texto ya en HTML: solo toca el texto de fuera de las etiquetas y no lo que ya esta resaltado con <b>.
function marcarTexto(html) {
  let dentroB = 0;
  return html.split(/(<[^>]+>)/).map(trozo => {
    if (trozo.startsWith('<')) { if (/^<b\b/i.test(trozo)) dentroB++; else if (/^<\/b>/i.test(trozo)) dentroB--; return trozo; }
    if (dentroB > 0) return trozo;
    let t = trozo;
    for (const [c, re] of REGEX_COLOR) t = t.replace(re, '<span class="c-' + c + '">$1</span>');
    return t.split(/(<[^>]+>)/).map(s => s.startsWith('<') ? s : s.replace(REGEX_TECLA, '<kbd>$1</kbd>')).join('');
  }).join('');
}
// Icono del consejo: el dibujo de lo que va a pasar (un sprite del juego) o, si no hay, el del bocadillo.
const ICONO_NOTA = {
  pescar: ['objetos_iconos', 1], recoger: ['objetos_iconos', 1], atrapar: ['objetos_iconos', 1], tirar: ['objetos_iconos', 1], escapo: ['objetos_iconos', 1],
  tejer: ['hud_tiles', 2], sinTinte: ['hud_tiles', 2], prenda: ['hud_tiles', 2], elegir: ['hud_tiles', 2], tejiendo: ['hud_tiles', 2],
  plantar: ['hud_tiles', 3], cosechar: ['hud_tiles', 3], regar: ['objetos_iconos', 0], abonar: ['aguacate_tiles', 0], inicio: ['hud_tiles', 1],
  decorar: ['hud_tiles', 4], tienda: ['mar_tiles', 0], concha: ['mar_tiles', 0], botella: ['mar_tiles', 8], bucear: ['mar_tiles', 9], sinGafas: ['mar_tiles', 9],
  subir: ['mar_tiles', 9], ostra: ['mar_tiles', 13], ostraVista: ['mar_tiles', 13], plantarCoral: ['mar_tiles', 7], sinCoral: ['mar_tiles', 7],
  coralCrece: ['mar_tiles', 7], cuidarCoral: ['mar_tiles', 7], excavar: ['excavar_tiles', 0], talar: ['excavar_tiles', 25], sinPala: ['excavar_tiles', 0], golpe: ['excavar_tiles', 0], cofre: ['mar_tiles', 6], cofreVacio: ['mar_tiles', 6], cavar: ['mar_tiles', 6],
  castillo: ['mar_tiles', 10], rescatar: ['mar_tiles', 12], poza: ['mar_tiles', 3], pozaVista: ['mar_tiles', 3], eligiendoPecera: ['objetos_iconos', 1],
};
function pintarIconoNota(lienzoIcono, clave) {
  const c = lienzoIcono.getContext('2d');
  c.clearRect(0, 0, T, T);
  c.imageSmoothingEnabled = false;
  if (clave === 'vecino') {
    const lugar = vecinoCercano(), v = lugar && vecinoEn(lugar.c, lugar.f);
    if (v) { c.drawImage(img.vecinos_tiles, VECINOS.indexOf(v) * T, 0, T, T, 0, 0, T, T); return; }
  }
  const s = ICONO_NOTA[clave];
  if (s && img[s[0]]) { c.drawImage(img[s[0]], s[1] * T, 0, T, T, 0, 0, T, T); return; }
  const b = ICONOS[(ICONO_ACCION[clave] || ['estrella'])[0]], color = (ICONO_ACCION[clave] || [, '#E8A85C'])[1];
  c.fillStyle = color;                     // icono de 7x7 del bocadillo, al doble
  b.forEach((fila, j) => [...fila].forEach((ch, i) => { if (ch === '#') c.fillRect(1 + i * 2, 1 + j * 2, 2, 2); }));
}
let pistaAntes = null;
function pintarPista(texto, clave) {
  if (texto === pistaAntes) return;
  pistaAntes = texto;
  const p = el('pista');
  p.hidden = !texto;
  if (!texto) return;
  const icono = estado.decorar ? 'decorar' : estado.pesca && estado.pesca.fase === 'escapo' ? 'escapo' : clave;
  pintarIconoNota(p.querySelector('canvas'), icono);
  p.querySelector('.txt').innerHTML = marcarTexto(escaparHtml(texto));
  p.classList.remove('entra'); void p.offsetWidth; p.classList.add('entra');
}

// Altura (en pixeles del lienzo, desde abajo) a la que va el texto de ayuda: encima de lo que haya abajo
// (cajon de decorar, barra de pesca, paneles de tejer y pecera, saquito de semillas).
function bordePista() {
  const pe = estado.pesca, d = estado.decorar;
  if (estado.cavar) return lienzo.height - TABLA_CAVAR.y + 8;
  if (d) return geometriaCajon(d).y0 > 2 ? lienzo.height - geometriaCajon(d).y0 + 3 : 4;
  if (pe && pe.fase === 'tirar') return lienzo.height - BARRA.y + 16;
  if (estado.tejer && (estado.tejer.fase === 'tejiendo' || estado.tejer.fase === 'rematar')) return 50;   // el bastidor es alto
  if (estado.tejer || estado.pecera) return 27;
  if (barraVisible() && estado.saquitoT > 0.02) return lienzo.height - geometriaBarra().y0 + 10;
  return 4;
}
// Texto de teclas en el modo decorar (lo de cada mueble va en la tarjeta junto al cursor).
function pistaDecorar(d) {
  const fin = ' · Tab: pestaña · Ctrl+Z: deshacer · B: salir';
  if (enReformas(d)) return 'Q/R, 1-9 o clic: suelo o papel (se pone al momento) · Espacio, C o clic en un color: pintar' + fin;
  if (d.mano) return 'Flechas o ratón: llevarlo · Espacio o clic: dejarlo aquí · Supr: guardarlo · B: devolverlo a su sitio';
  if (recogible(d)) return 'Espacio o clic: coger para moverlo · Supr o clic derecho: guardarlo en la bolsa · Q/R: elegir otro' + fin;
  return 'Flechas o ratón: mover · Q/R, 1-9 o rueda: elegir · Espacio o clic: colocar' + fin;
}

// Carteles HTML del modo decorar: la cinta de arriba con la pestana y la tarjeta del mueble junto al cursor.
// Solo se tocan cuando cambia algo.
let cartelAntes = '';
// Corazones de amistad en pixel art (arte/sprites/tarjeta_corazones.png): llenos en fresa, vacios sombreados.
const corazonesHtml = co => '<span class="corazonesPx" title="' + co + ' de ' + MAX_CORAZONES + ' corazones">'
  + '<i class="co"></i>'.repeat(co) + '<i class="co vacio"></i>'.repeat(MAX_CORAZONES - co) + '</span>';
// Retrato del vecino en su medallon de madera, sobre el color de su tejado.
const retratoHtml = v => '<span class="retrato" style="--n:' + VECINOS.indexOf(v) + ';--nv:' + VECINOS.length + ';--fondo:' + v.tejado[0] + '">'
  + '<i class="ventana"></i><i class="aro"></i></span>';
// Tarjeta del vecino que tienes al lado (debajo de sus pies): retazo de tela cosido con retrato, nombre,
// quien es y corazones, y adornos en las esquinas (esquina doblada, florecita y huella).
let etiquetaAntes = '';
function etiquetaVecino() {
  const aqui = casillaActual();
  const v = nadaAbierto() && !estado.dialogo && !estado.decorar && !estado.fundido
    && VECINOS.find(v => Math.abs(v.c - aqui.c) <= 2 && Math.abs(v.f - aqui.f) <= 2);
  const e = el('etiquetaVecino');
  if (!v) { if (etiquetaAntes) { e.hidden = true; etiquetaAntes = ''; } return; }
  const co = corazones(v), x = v.c * T + 8 - Math.round(cam.x), y = (v.f + 1) * T - Math.round(cam.y);
  const clave = [v.id, co, x, y].join('|');
  if (clave === etiquetaAntes) return;
  etiquetaAntes = clave;
  e.hidden = false;
  e.innerHTML = retratoHtml(v) + '<span class="datos"><b>' + v.nombre + '</b><small>' + v.quien + '</small>' + corazonesHtml(co) + '</span>'
    + '<i class="adorno" style="--a:0;top:calc(-7 * var(--u));right:calc(-7 * var(--u))"></i>'
    + '<i class="adorno" style="--a:2;top:calc(-7 * var(--u));left:calc(-7 * var(--u))"></i>'
    + '<i class="adorno" style="--a:1;bottom:calc(-5 * var(--u));right:calc(-4 * var(--u))"></i>';
  e.style.left = 'calc(' + x + ' * var(--px))';
  e.style.top = 'calc(' + y + ' * var(--px))';
}
function carteles() {
  const d = estado.decorar;
  el('hud').style.visibility = d ? 'hidden' : '';
  let cinta = '', tarjeta = '', tx = 0, ty = 0, izquierda = false;
  if (d) {
    const g = geometriaCajon(d);
    cinta = 'Decorar · ' + CATEGORIAS[d.cat].nombre;
    if (enReformas(d)) {
      const o = OPCIONES_REFORMA[d.ref], k = estado.casa;
      cinta += ' · ' + (o.parte === 'suelo' ? 'Suelo: ' + SUELOS.find(s => s.id === k.suelo).nombre + ' · ' + nombreColor(k.colorSuelo)
        : 'Pared: ' + PAPELES.find(p => p.id === k.pared).nombre + ' · ' + nombreColor(k.colorPared));
    } else {
      const sobre = recogible(d), n = sobre ? sobre.n : enMano(d), m = MUEBLES[n], hay = estado.muebles[m.id];
      const linea = d.mano ? 'Llevándolo…' : sobre ? 'Espacio: mover · Supr: guardar'
        : hay ? 'Tienes ' + hay + ' guardado' + (hay > 1 ? 's' : '')
        : buscar(m.coste) ? 'Se hace con ' + m.texto : 'Necesitas ' + m.texto;
      tarjeta = '<b>' + m.nombre + '</b>' + linea + (esDeSuelo(n) && !sobre && !d.mano ? '<i>Se pisa y admite muebles encima</i>' : '');
      const { ancho } = tamanoMueble(n), cx = Math.round(cam.x), cy = Math.round(cam.y);
      const bx = (sobre ? sobre.c : d.c) * T - cx, by = (sobre ? sobre.f : d.f) * T - cy;
      izquierda = bx + ancho * T > lienzo.width - 70;
      tx = izquierda ? bx - 3 : bx + ancho * T + 3;
      ty = Math.max(2, Math.min(by, lienzo.height - 60));
      if (!g.arriba && ty > g.y0 - 22) ty = g.y0 - 22;              // nunca encima del cajon
      if (g.arriba && ty < g.y0 + g.h + 2) ty = g.y0 + g.h + 2;
    }
    if (g.arriba) cinta = '';                                       // con el cajon arriba, la cinta sobra
  }
  const clave = [cinta, tarjeta, tx, ty, izquierda].join('|');
  if (clave === cartelAntes) return;
  cartelAntes = clave;
  el('cintaDecorar').hidden = !cinta;
  el('cintaDecorar').textContent = cinta;
  const t = el('tarjetaDecorar');
  t.hidden = !tarjeta;
  t.innerHTML = tarjeta;
  t.style.left = 'calc(' + tx + ' * var(--px) + 4px)';
  t.style.top = 'calc(' + ty + ' * var(--px) + 4px)';
  t.classList.toggle('izquierda', izquierda);
}

// ---------- Guardado ----------
// La partida se guarda sola en este equipo cada pocos segundos y al cerrar.

const CLAVE_PARTIDA = 'proyecto-estrella-partida';
const VERSION_PARTIDA = 4;          // v3: inventario por especies y enciclopedia; v4: valle de 80x56
const GUARDAR_CADA = 2;             // segundos
let sinGuardar = 0, borrando = false;

function guardar() {
  if (borrando) return;
  const { gata, parcelas, semilla, inv, vistos, ropa, armario, vecinos, herramientas, hora, clima, muebles, casa, consejos, conchitas } = estado;
  const { dia, playa, castillos, cartas, tesoroX, recuerdos, corales, barcaEn, excavar, talados } = estado;
  // Si se cierra navegando o bajo el agua, se vuelve al embarcadero (o a donde se buceo).
  const enMuelle = { x: EMBARCADERO.c * T, y: EMBARCADERO.punta * T - 6 }, bu = estado.buceo;
  const sitioGata = estado.sentada ? { ...estado.sentada.vuelta } : bu ? (bu.navegando ? enMuelle : { ...bu.vuelta }) : estado.navegando ? enMuelle : { x: gata.x, y: gata.y };
  let { colocados, suelos, paredes, peceras } = estado;
  // Lo que se lleva en la mano al decorar se guarda en su sitio de antes, para no perderlo si se cierra el juego.
  const mano = estado.decorar && estado.decorar.mano;
  if (mano) {
    if (esDeSuelo(mano.n)) suelos = { ...suelos, [mano.clave]: mano.n };
    else if (esDePared(mano.n)) paredes = { ...paredes, [mano.clave]: mano.n };
    else colocados = { ...colocados, [mano.clave]: mano.n };
    if (MUEBLES[mano.n].expone) peceras ={ ...peceras, [mano.clave]: mano.pez };
  }
  try {
    localStorage.setItem(CLAVE_PARTIDA, JSON.stringify({
      v: VERSION_PARTIDA, gata: sitioGata, dia, playa, castillos, cartas, tesoroX, excavar, talados, recuerdos, corales, barcaEn, parcelas, semilla, inv, vistos, ropa, armario, vecinos, herramientas, hora, clima, muebles, colocados, suelos, paredes, casa, peceras, consejos, conchitas,
      hogar: estado.hogar, nombre: estado.nombre, tutorial: estado.tutorialHecho ? -1 : estado.pasoTutorial,   // -1: tutorial ya hecho o saltado
    }));
  } catch (e) { /* sin almacenamiento disponible: se juega sin guardar */ }
}

// v3 -> v4: el valle crecio de 40x28 a 80x56 y lo de antes quedo en el centro (20 columnas y 14 filas mas alla);
// el interior de la casa, que empezaba en la fila 30, baja hasta INTERIOR.f0.
const VALLE_V3 = { c: 20, f: 14, interior: 30 };
function moverDesdeV3(c, f) {
  return f >= VALLE_V3.interior ? [c, f - VALLE_V3.interior + INTERIOR.f0] : [c + VALLE_V3.c, f + VALLE_V3.f];
}
function migrarV3(d) {
  for (const capa of ['parcelas', 'colocados', 'suelos', 'paredes', 'peceras']) {
    if (!d[capa]) continue;
    d[capa] = Object.fromEntries(Object.entries(d[capa]).map(([clave, v]) => [moverDesdeV3(...clave.split(',').map(Number)).join(','), v]));
  }
  if (d.gata) {
    const [c, f] = moverDesdeV3(Math.floor((d.gata.x + 8) / T), Math.floor((d.gata.y + 14) / T));
    d.gata = { x: d.gata.x + (c - Math.floor((d.gata.x + 8) / T)) * T, y: d.gata.y + (f - Math.floor((d.gata.y + 14) / T)) * T };
  }
  d.v = 4;
}

function cargarPartida() {
  let d;
  try { d = JSON.parse(localStorage.getItem(CLAVE_PARTIDA)); } catch (e) { return; }
  if (d && d.v === 3) migrarV3(d);
  if (!d || d.v !== VERSION_PARTIDA) return;
  estado.inv = d.inv || {};
  estado.vistos = d.vistos || {};
  Object.assign(estado.muebles, d.muebles);
  estado.parcelas = d.parcelas || {};
  estado.colocados = d.colocados || {};
  estado.suelos = d.suelos || {};          // partidas de antes de las alfombras: ninguna
  estado.paredes = d.paredes || {};        // partidas de antes de colgar cosas: nada colgado
  Object.assign(estado.casa, d.casa);      // partidas de antes de las reformas: madera y rayas
  if (!SUELOS.some(s => s.id === estado.casa.suelo)) estado.casa.suelo = 'madera';
  if (!PAPELES.some(p => p.id === estado.casa.pared)) estado.casa.pared = 'rayas';
  estado.peceras = d.peceras || {};       // partidas de antes de las peceras: ninguna
  estado.conchitas = d.conchitas || 0;    // partidas de antes de la tiendecita: ninguna
  // Partidas de antes de las actividades del mar: playa nueva y nada hecho todavia.
  estado.dia = d.dia || 0;
  estado.castillos = d.castillos || {};
  estado.cartas = d.cartas || [];
  estado.tesoroX = d.tesoroX || null;
  estado.excavar = d.excavar || null;
  estado.recuerdos = d.recuerdos || {};
  estado.corales = d.corales || {};
  estado.barcaEn = d.barcaEn || null;
  estado.playa = d.playa && d.playa.cosas ? d.playa : null;
  estado.semilla = d.semilla >= 0 && d.semilla < CULTIVOS.length ? d.semilla : 0;
  Object.assign(estado.ropa, d.ropa);
  estado.armario = d.armario || [];
  estado.vecinos = d.vecinos || {};
  Object.assign(estado.herramientas, d.herramientas);
  if (typeof d.hora === 'number') estado.hora = d.hora;
  if (d.clima === 'lluvia') { estado.clima = 'lluvia'; estado.lluvia = 1; Sonido.lluvia(true); }
  estado.consejos = d.consejos || {};
  estado.nombre = typeof d.nombre === 'string' ? d.nombre.slice(0, 14) : '';   // partidas de antes del nombre: se pide al continuar
  // Partidas de antes del tutorial: ya saben jugar, no se les muestra.
  const paso = typeof d.tutorial === 'number' ? d.tutorial : -1;
  estado.tutorialHecho = paso < 0;
  estado.pasoTutorial = Math.max(0, paso);
  // Partidas de antes de la pared alta: lo colocado en la fila que ahora es pared baja una fila,
  // o vuelve a los muebles guardados (y su pez a la bolsa) si ese sitio esta ocupado.
  const filaVieja = INTERIOR.f0 + 1;
  for (const clave of Object.keys(estado.colocados)) {
    const [c, f] = clave.split(',').map(Number);
    if (f !== filaVieja) continue;
    const n = estado.colocados[clave], pez = estado.peceras[clave];
    delete estado.colocados[clave];
    delete estado.peceras[clave];
    if (puedeColocar(c, f + 1, n)) {
      estado.colocados[c + ',' + (f + 1)] = n;
      if (MUEBLES[n].expone) estado.peceras[c + ',' + (f + 1)] = pez || null;
    } else {
      estado.muebles[MUEBLES[n].id]++;
      if (pez) estado.inv[pez] = (estado.inv[pez] || 0) + 1;
    }
  }
  // Partidas de antes de la cama de 1x2: lo que estaba a los pies de la cama vuelve a los muebles guardados.
  const piesCama = INTERIOR.cama.c + ',' + (INTERIOR.cama.f + 1);
  if (piesCama in estado.colocados) {
    const n = estado.colocados[piesCama], pez = estado.peceras[piesCama];
    delete estado.colocados[piesCama];
    delete estado.peceras[piesCama];
    estado.muebles[MUEBLES[n].id]++;
    if (pez) estado.inv[pez] = (estado.inv[pez] || 0) + 1;
  }
  // Partidas de antes del armario: la bufanda que llevaba puesta pasa a ser su primera prenda.
  if (d.bufanda && !d.armario) { estado.ropa.bufanda = d.bufanda; estado.armario.push({ tipo: 'bufanda', color: d.bufanda }); }
  // Partidas de antes de elegir el hogar: la casa y el huerto de siempre. null = se cerro el juego a mitad de elegir.
  const h = d.hogar;
  estado.hogar = !('hogar' in d) ? HOGAR_DE_SIEMPRE : h && h.casa && h.huerto ? { casa: { c: h.casa.c, f: h.casa.f }, huerto: { c: h.huerto.c, f: h.huerto.f } } : null;
  // Partidas de antes del mar del sur: si el hogar quedo en la playa o en el agua, vuelve al sitio de siempre,
  // y lo que estaba colocado en el valle donde ahora hay mar vuelve a los muebles guardados.
  const alMar = (o, { ancho, alto }) => { for (let j = 0; j < alto; j++) for (let i = 0; i < ancho; i++) if (o.f + j >= costaEn(o.c + i) - 2) return true; return false; };
  if (estado.hogar && (alMar(estado.hogar.casa, SOLAR) || alMar(estado.hogar.huerto, HUERTO))) estado.hogar = HOGAR_DE_SIEMPRE;
  for (const capa of [estado.colocados, estado.suelos]) {
    for (const [clave, n] of Object.entries(capa)) {
      const [c, f] = clave.split(',').map(Number);
      if (tile(c, f) !== 'W' && !BLOQUEADAS.has(clave)) continue;    // en el agua o bajo un adorno nuevo (pozas, caseta...)
      delete capa[clave];
      estado.muebles[MUEBLES[n].id]++;
      devolverContenido(estado.peceras[clave]);
      delete estado.peceras[clave];
    }
  }
  colocarHogar(estado.hogar || HOGAR_DE_SIEMPRE);
  // Arboles talados con el hacha (partidas de antes del hacha: ninguno).
  estado.talados = Array.isArray(d.talados) ? d.talados.filter(k => typeof k === 'string') : [];
  for (const k of estado.talados) if (fijos[k] === 0) delete fijos[k];
  if (!estado.playa) prepararMar(false);
  if (!estado.excavar || estado.excavar.dia !== estado.dia) prepararExcavar();
  if (!estado.hogar) { estado.gata.x = INICIO.c * T; estado.gata.y = INICIO.f * T - 6; }
  else if (d.gata && puedeEstar(d.gata.x, d.gata.y)) { estado.gata.x = d.gata.x; estado.gata.y = d.gata.y; }
}

addEventListener('pagehide', guardar);

// "Nueva partida" pide una segunda pulsacion para no borrar nada por accidente.
const botonNueva = el('nueva');
let confirmando = null;
botonNueva.addEventListener('click', () => {
  botonNueva.blur();
  if (!confirmando) {
    botonNueva.textContent = '¿Borrar todo? Pulsa otra vez';
    confirmando = setTimeout(() => { confirmando = null; botonNueva.textContent = 'Nueva partida'; }, 4000);
    return;
  }
  borrando = true;
  try { localStorage.removeItem(CLAVE_PARTIDA); } catch (e) { /* nada que borrar */ }
  location.reload();
});

// En el .exe (Electron) hay un boton para salir: guarda y cierra la ventana.
if (window.escritorio) {
  el('salirJuego').hidden = false;
  el('salirJuego').addEventListener('click', () => { guardar(); window.escritorio.salir(); });
}

let anterior = 0;
function bucle(ahora) {
  const dt = Math.min((ahora - anterior) / 1000, 0.1);
  anterior = ahora;
  sinGuardar += dt;
  if (sinGuardar >= GUARDAR_CADA) { sinGuardar = 0; guardar(); }
  if (!estado.inicio && !estado.ayuda && !estado.ajustes) actualizar(dt);   // en el inicio, la ayuda y los ajustes el juego espera
  enfocar(dt);
  dibujar();
  actualizarHud();
  requestAnimationFrame(bucle);
}

Promise.all([
  'terreno_tiles', 'bordes_agua_tiles', 'bordes_tierra_tiles', 'bordes_camino_tiles',
  'gatita_reposo', 'gatita_caminar', 'gatita_alegria',
  'gatita_reposo_bufanda', 'gatita_caminar_bufanda', 'gatita_alegria_bufanda',
  'gatita_reposoLado', 'gatita_caminarLado', 'gatita_reposoEsp', 'gatita_caminarEsp',
  'gatita_reposoLado_bufanda', 'gatita_caminarLado_bufanda', 'gatita_reposoEsp_bufanda', 'gatita_caminarEsp_bufanda',
  ...['pescar', 'pescarLado', 'pescarEsp', 'tirar', 'tirarLado', 'tirarEsp', 'tejer', 'tejerSentarse', 'tejerBien', 'regar', 'cultivar', 'sueno', 'cavar', 'talar', 'patinar', 'patinarLado', 'patinarEsp'].flatMap(a => ['gatita_' + a, 'gatita_' + a + '_bufanda']),
  'gatita_cavar_pala', 'excavar_tiles',
  ...CULTIVOS.map(c => 'cultivos_' + c.id),
  'casa_tiles', 'casa_altos_tiles', 'casa_suelos_tiles', 'casa_papeles_tiles', 'fauna_tiles', 'objetos_pesca', 'objetos_mundo', 'muebles_tiles', 'muebles_grandes_tiles', 'jardin_tiles', 'jardin_grandes', 'naturaleza_tiles',
  'objetos_iconos', 'hud_tiles', 'nota_adornos', 'aguacate_tiles', 'tienda_tendera', 'tienda_tiles', 'iconos_cultivos', 'iconos_ropa_tiles', 'iconos_ropa_tiles_lana', 'iconos_ropa_tiles_sombra', 'iconos_ropa_tiles_luz', 'iconos_ropa_tiles_borde', 'vecinos_tiles', 'vecinos_conejo', 'vecinos_rana', 'vecinos_oso', 'vecinos_pinguina', 'ropa_tiles', 'ropa_tiles_tinte', 'arboles_tiles', 'detalles_tiles', 'mar_tiles',
].map(cargar)).then(() => {
  // Los marcos de la interfaz (CSS) se cargan ya, para que los paneles no salgan sin marco la primera vez.
  for (const m of ['papel', 'fieltro', 'mimbre', 'tapa', 'pestanaRosa', 'pestanaDurazno', 'pestanaLavanda', 'pestanaMantequilla',
    'botonRosa', 'botonMantequilla', 'botonPapel', 'hud', 'cinta', 'sello']) new Image().src = RUTA + 'ui_' + m + '.png';
  cargarPartida();
  if (!estado.hogar) colocarHogar(HOGAR_DE_SIEMPRE);   // detras del inicio se ve el valle de siempre (luego se elige)
  if (!estado.playa) prepararMar(false);
  if (!estado.excavar || estado.excavar.dia !== estado.dia) prepararExcavar();
  prepararInicio();                 // si ya habia partida, el inicio saluda y ofrece continuarla
  anterior = performance.now();
  requestAnimationFrame(bucle);
}).catch(e => { el('pista').hidden = false; el('pista').querySelector('.txt').textContent = e.message; });
