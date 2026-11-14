// Graba el trailer con gameplay real, fotograma a fotograma (asi sale fluido aunque la pestana este oculta).
// Uso, en la pestana del juego con la partida ya empezada y  python trailer/recibir.py trailer/cuadros  escuchando:
//   const s = document.createElement('script'); s.src = '/trailer/grabar.js'; document.head.append(s);
//   grabarTrailer()   -> sube cuadros/f00000.png... y cuadros/audio.wav; luego se montan con ffmpeg.
// El juego avanza 1/30 s por cuadro (su bucle se para y performance.now() se finge). Las escenas usan las acciones
// de verdad (plantar, regar, pescar, tejer, talar, navegar...) con un "piloto" que pulsa las teclas a tiempo.
// La musica y los efectos se generan despues en un OfflineAudioContext con una copia de sonido.js, al mismo tiempo
// que el video. borrando = true: nada de lo que pase aqui se guarda en la partida (recarga para volver).
'use strict';

async function grabarTrailer() {
  const FPS = 30, ESC = 6, W = lienzo.width, H = lienzo.height;
  const grande = Object.assign(document.createElement('canvas'), { width: W * ESC, height: H * ESC });
  const k = grande.getContext('2d');
  k.imageSmoothingEnabled = false;

  // ---- Tiempo fingido: el juego solo avanza cuando pintamos un cuadro.
  window.bucle = () => {};
  const relojReal = performance.now.bind(performance), inicioReal = relojReal();
  let cuadro = 0;
  const tiempo = () => cuadro / FPS;
  performance.now = () => inicioReal + tiempo() * 1000;
  const sonidos = [];
  const tocarReal = Sonido.tocar;
  Sonido.tocar = (nombre, n) => { sonidos.push({ t: tiempo(), nombre, n }); };

  // ---- Subida de cuadros (varias a la vez)
  const enVuelo = new Set();
  async function subir(nombre, cuerpo) {
    const p = fetch('http://127.0.0.1:8124/' + nombre, { method: 'PUT', body: cuerpo }).finally(() => enVuelo.delete(p));
    enVuelo.add(p);
    if (enVuelo.size >= 8) await Promise.race(enVuelo);
  }

  // ---- Rotulos: texto de la fuente del juego con contorno ciruela, entra y sale deslizandose.
  let rotulo = null, velo = 1, objetivoVelo = 1;
  const decir = (titulo, sub, centro = false) => { rotulo = { titulo, sub, centro, t0: tiempo(), fuera: null }; };
  const callar = () => { if (rotulo) rotulo.fuera = tiempo(); };
  function letras(s, x, y, tam, fuente, color, alinea) {
    k.font = `${tam}px '${fuente}'`; k.textAlign = alinea; k.textBaseline = 'alphabetic';
    k.fillStyle = COLOR.ciruela;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 2; dy++) if (dx || dy) k.fillText(s, x + dx * ESC, y + dy * ESC);
    k.fillStyle = color; k.fillText(s, x, y);
  }
  function pintarRotulo() {
    if (!rotulo) return;
    const t = tiempo();
    let a = Math.min(1, (t - rotulo.t0) / 0.35);
    if (rotulo.fuera !== null) a = Math.min(a, 1 - (t - rotulo.fuera) / 0.3);
    if (a <= 0) { if (rotulo.fuera !== null) rotulo = null; return; }
    const sube = Math.round((1 - a) * 8) * ESC;
    k.save(); k.globalAlpha = a;
    if (rotulo.centro) {
      letras(rotulo.titulo, grande.width / 2, grande.height * 0.44 + sube, 24 * ESC, 'Estrella Gordita', '#FFE08A', 'center');
      if (rotulo.sub) letras(rotulo.sub, grande.width / 2, grande.height * 0.44 + 22 * ESC + sube, 12 * ESC, 'Estrella', '#FFF4E0', 'center');
    } else {
      const x = 10 * ESC, y = grande.height - 24 * ESC + sube;
      letras(rotulo.titulo, x, y, 18 * ESC, 'Estrella Gordita', '#FFE08A', 'left');
      if (rotulo.sub) letras(rotulo.sub, x, y + 13 * ESC, 12 * ESC, 'Estrella', '#FFF4E0', 'left');
    }
    k.restore();
  }

  // ---- Piloto: acierta en la barra de pesca y teje el punto que toca.
  const abajo = c => dispatchEvent(new KeyboardEvent('keydown', { code: c }));
  const arriba = c => dispatchEvent(new KeyboardEvent('keyup', { code: c }));
  let ultimoPunto = -1;
  function piloto() {
    const pe = estado.pesca, tj = estado.tejer;
    if (pe && pe.fase === 'pica' && pe.t > 0.35) actuar();
    else if (pe && pe.fase === 'tirar' && pe.t > 0.4 && Math.abs(pe.pos + 1 - (pe.zona + BARRA.zona / 2)) < 2) actuar();
    if (tj && tj.fase === 'tejiendo' && tj.sentar >= DURACION_SENTARSE && tiempo() - ultimoPunto > 0.3) {
      ultimoPunto = tiempo();
      const tecla = Object.keys(FLECHAS).find(c => c.startsWith('Arrow') && FLECHAS[c] === tj.patron[tj.i]);
      abajo(tecla); arriba(tecla);
    }
  }

  // ---- Un cuadro: el juego avanza, se dibuja, se amplia, rotulo y velo, y se sube.
  async function paso() {
    piloto();
    if (!estado.inicio) actualizar(1 / FPS);    // lo mismo que hace bucle() en cada cuadro
    enfocar(1 / FPS);
    dibujar();
    actualizarHud();
    k.drawImage(lienzo, 0, 0, W * ESC, H * ESC);
    pintarRotulo();
    velo += (objetivoVelo - velo) * 0.25;
    if (velo > 0.01) { k.fillStyle = `rgba(255, 244, 224, ${velo})`; k.fillRect(0, 0, grande.width, grande.height); }
    const png = grande.toDataURL('image/png');   // sincrono: toBlob va a 1 cuadro por segundo con la pestana oculta
    await subir('f' + String(cuadro).padStart(5, '0') + '.png', png);
    cuadro++;
  }
  const espera = async s => { for (let i = Math.round(s * FPS); i > 0; i--) await paso(); };
  const pulsa = async c => { abajo(c); await paso(); await paso(); arriba(c); };
  const soltarTodo = () => ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ShiftLeft'].forEach(arriba);
  const ir = (c, f, mira) => { llevarGata(c, f, mira); for (let i = 0; i < 3; i++) enfocar(1); };
  const hora = h => { estado.hora = h; };
  const fundido = async () => { objetivoVelo = 1; await espera(0.3); };
  const aclarar = () => { objetivoVelo = 0; };

  // ---- Preparacion: nada se guarda, buen tiempo y lo necesario en la bolsa (solo para el video).
  borrando = true;
  Object.assign(estado, { clima: 'sol', lluvia: 0, saquito: false, consejo: null, alfaHud: 1 });
  estado.herramientas.barca = estado.herramientas.hacha = true;
  for (const c of CULTIVOS) estado.inv[c.id] = Math.max(estado.inv[c.id] || 0, 5);

  try {
    // 1. Portada con el titulo
    estado.inicio = true; aclarar();
    await espera(0.6);
    decir('Proyecto Estrella', 'un rinconcito tranquilo, a tu ritmo', true);
    await espera(4); callar(); await espera(0.3); await fundido();

    // 2. El valle por la manana, patinando
    estado.inicio = false; hora(0.1);
    ir(INICIO.c, INICIO.f + 1, 'lado'); aclarar();
    decir('Tu propio valle', 'pasea, patina y respira hondo');
    abajo('ShiftLeft'); abajo('ArrowRight'); await espera(1.6); arriba('ArrowRight');
    abajo('ArrowDown'); await espera(0.9); arriba('ArrowDown'); arriba('ShiftLeft');
    abajo('ArrowRight'); await espera(0.9); soltarTodo();
    await espera(0.8); callar(); await fundido();

    // 3. El huerto: plantar, regar y cosechar
    hora(0.22);
    const h = (estado.hogar || HOGAR_DE_SIEMPRE).huerto, tipos = CULTIVOS.map(c => c.id);
    for (let dc = 0; dc < HUERTO.ancho; dc++) for (let df = 0; df < HUERTO.alto; df++) {
      if (tile(h.c + dc, h.f + df) !== 'T') continue;
      estado.parcelas[(h.c + dc) + ',' + (h.f + df)] = dc === 1 && df === 2 ? { regada: false, cultivo: null }
        : { regada: true, cultivo: { tipo: tipos[(dc + df * 2) % tipos.length], etapa: dc === 2 && df === 2 ? 3 : 1 + (dc + df) % 3, t: 0 } };
    }
    ir(h.c + 1, h.f + 2, 'frente'); aclarar();
    decir('Cultiva', 'nueve plantitas que crecen día a día');
    await espera(0.6); await pulsa('Space'); await espera(1.0);
    await pulsa('Space'); await espera(1.1);
    estado.gata.x += T; estado.gata.mira = 'frente';
    await espera(0.3); await pulsa('Space'); await espera(1.6);
    callar(); await fundido(); estado.premio = null;

    // 4. Pescar en el muelle del lago
    hora(0.4);
    ir(LAGO.muelle.c, LAGO.muelle.f0 + 1, 'espalda'); aclarar();
    decir('Pesca', 'más de cuarenta criaturas que descubrir');
    await espera(0.4); await pulsa('Space');
    if (estado.pesca) estado.pesca.limite = 1.1;
    for (let i = 0; i < 300 && estado.pesca; i++) await paso();
    await espera(1.5); callar(); await fundido(); estado.premio = null; estado.pesca = null;

    // 5. Tejer en casa
    hora(0.52);
    const cesta = CESTAS[0];
    ir(cesta.c, cesta.f + 1, 'espalda'); aclarar();
    decir('Teje', 'bufandas, gorros y lazos de colores');
    await espera(0.4); await pulsa('Space'); await espera(0.5);
    await pulsa('Digit1'); await espera(0.5);
    let n = TINTES.findIndex((t, i) => i > 0 && buscar(t.coste));
    if (n < 0) { n = 1; estado.inv[TINTES[1].coste.id] = 1; }
    await pulsa(NUMEROS[n]);
    for (let i = 0; i < 300 && estado.tejer; i++) await paso();
    await espera(1.0); callar(); await fundido(); estado.tejer = null; estado.premio = null;

    // 6. Talar un arbol para hacer sitio
    hora(0.3);
    const lejos = ([c, f]) => Math.abs(c - INICIO.c) + Math.abs(f - INICIO.f);
    const arbol = Object.keys(fijos).map(x => x.split(',').map(Number))
      .filter(([c, f]) => arbolTalable(c, f) && puedeEstar((c - 1) * T, f * T - 6) && lejos([c, f]) < 25)
      .sort((a, b) => lejos(a) - lejos(b))[0];
    if (arbol) {
      ir(arbol[0] - 1, arbol[1], 'lado'); estado.gata.espejo = false; aclarar();
      decir('Haz sitio', 'tala árboles y construye con su madera');
      for (let i = 0; i < 3; i++) { await espera(0.45); await pulsa('Space'); await espera(0.35); }
      await espera(1.6); callar(); await fundido(); estado.premio = null;
    }

    // 7. Pueblo Algodon al atardecer
    hora(0.585);
    ir(FUENTE.c + 4, FUENTE.f + 4, 'lado'); estado.gata.espejo = true; aclarar();
    decir('Pueblo Algodón', 'vecinos adorables que te esperan');
    abajo('ArrowLeft'); await espera(2.2); arriba('ArrowLeft');
    abajo('ArrowUp'); await espera(0.6); arriba('ArrowUp');
    await espera(1.2); callar(); await fundido();

    // 8. En barca de noche
    hora(0.78);
    estado.barcaEn = null;
    ir(EMBARCADERO.c, EMBARCADERO.punta, 'frente'); embarcar(); for (let i = 0; i < 3; i++) enfocar(1); aclarar();
    decir('Navega', 'el mar guarda islotes, cartas y secretos');
    abajo('ArrowDown'); await espera(1.4); abajo('ArrowRight'); await espera(1.8); soltarTodo();
    await espera(1.0); callar(); await fundido();
    estado.navegando = false;

    // 9. El fondo del mar
    hora(0.35);
    estado.buceo = { vuelta: { x: estado.gata.x, y: estado.gata.y }, navegando: false };
    ir(LLEGADA_FONDO.c, LLEGADA_FONDO.f + 2, 'frente'); crearPeces(); estado.lugar = null; aclarar();
    decir('Bucea', 'corales, ostras y peces de colores');
    abajo('ArrowDown'); await espera(1.0); arriba('ArrowDown'); abajo('ArrowRight'); await espera(1.6); soltarTodo();
    await espera(1.0); callar(); await fundido();
    estado.buceo = null;

    // 10. Cierre
    estado.inicio = true; aclarar();
    await espera(0.4);
    decir('Proyecto Estrella', 'cultiva · pesca · teje · decora', true);
    await espera(4.2); callar(); await espera(0.5); await fundido(); await espera(0.4);
  } finally {
    soltarTodo();
    await Promise.all(enVuelo);
    performance.now = relojReal;
    Sonido.tocar = tocarReal;
  }

  const wav = await audioTrailer(tiempo() + 0.5, sonidos);
  await fetch('http://127.0.0.1:8124/audio.wav', { method: 'PUT', body: wav });
  return { cuadros: cuadro, segundos: tiempo(), sonidos: sonidos.length };
}

// Musica y efectos sin tiempo real: una copia de sonido.js dentro de un OfflineAudioContext con un reloj fingido.
async function audioTrailer(duracion, sonidos) {
  const FREC = 48000, offline = new OfflineAudioContext(2, Math.ceil(duracion * FREC), FREC);
  const reloj = { t: 0 };
  const ctx = new Proxy(offline, {
    get: (o, p) => p === 'currentTime' ? reloj.t : typeof o[p] === 'function' ? o[p].bind(o) : o[p],
  });
  let programar = null, iniciar = null;
  const falsos = {
    window: { AudioContext: function () { return ctx; } },
    setInterval: f => { programar = f; },
    addEventListener: (tipo, f) => { if (tipo === 'keydown') iniciar = f; },
    localStorage: { getItem: c => localStorage.getItem(c), setItem: () => {} },
    document: { getElementById: () => null },
    performance,
  };
  const fuente = await (await fetch('/juego/sonido.js', { cache: 'reload' })).text();
  const copia = new Function(...Object.keys(falsos), fuente + '\nreturn Sonido;')(...Object.values(falsos));
  iniciar();
  let i = 0;
  for (let t = 0; t <= duracion; t += 0.05) {
    while (i < sonidos.length && sonidos[i].t <= t) { reloj.t = sonidos[i].t; copia.tocar(sonidos[i].nombre, sonidos[i].n); i++; }
    reloj.t = t; programar();
  }
  return wavDe(await offline.startRendering());
}
function wavDe(buf) {
  const canales = buf.numberOfChannels, n = buf.length, datos = new DataView(new ArrayBuffer(44 + n * canales * 2));
  const texto = (o, s) => [...s].forEach((c, i) => datos.setUint8(o + i, c.charCodeAt(0)));
  texto(0, 'RIFF'); datos.setUint32(4, 36 + n * canales * 2, true); texto(8, 'WAVEfmt ');
  datos.setUint32(16, 16, true); datos.setUint16(20, 1, true); datos.setUint16(22, canales, true);
  datos.setUint32(24, buf.sampleRate, true); datos.setUint32(28, buf.sampleRate * canales * 2, true);
  datos.setUint16(32, canales * 2, true); datos.setUint16(34, 16, true); texto(36, 'data'); datos.setUint32(40, n * canales * 2, true);
  const c = [...Array(canales)].map((_, j) => buf.getChannelData(j));
  for (let s = 0, o = 44; s < n; s++) for (let j = 0; j < canales; j++, o += 2) datos.setInt16(o, Math.max(-1, Math.min(1, c[j][s])) * 32767, true);
  return new Blob([datos.buffer], { type: 'audio/wav' });
}
