// Proyecto Estrella - sonido y musica. Todo se genera al vuelo (sin archivos de audio).
'use strict';

const Sonido = (() => {
  const CLAVE = 'proyecto-estrella-ajustes';
  const ajustes = { musica: true, efectos: true, volMusica: 1, volEfectos: 1 };   // los volumenes van de 0 a 1
  try { Object.assign(ajustes, JSON.parse(localStorage.getItem(CLAVE))); } catch (e) { /* ajustes por defecto */ }

  let ctx = null, canalMusica, canalEfectos;
  // Lluvia: la musica pasa por un filtro que la apaga (estilo lo-fi), va mas lenta y suena la lluvia de fondo.
  let enLluvia = false, filtroMusica, sonidoLluvia;

  // El navegador solo deja sonar tras la primera tecla o clic del jugador.
  function iniciar() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    canalMusica = ctx.createGain();
    canalEfectos = ctx.createGain();
    filtroMusica = ctx.createBiquadFilter();
    filtroMusica.type = 'lowpass';
    filtroMusica.frequency.value = 18000;
    canalMusica.connect(filtroMusica);
    filtroMusica.connect(ctx.destination);
    canalEfectos.connect(ctx.destination);
    // Ruido de lluvia: dos segundos de ruido que se repiten, suavizados con un filtro.
    const n = ctx.sampleRate * 2, buf = ctx.createBuffer(1, n, ctx.sampleRate), datos = buf.getChannelData(0);
    for (let i = 0; i < n; i++) datos[i] = Math.random() * 2 - 1;
    const fuente = ctx.createBufferSource(), filtro = ctx.createBiquadFilter();
    fuente.buffer = buf;
    fuente.loop = true;
    filtro.type = 'lowpass';
    filtro.frequency.value = 1400;
    sonidoLluvia = ctx.createGain();
    sonidoLluvia.gain.value = 0;
    fuente.connect(filtro);
    filtro.connect(sonidoLluvia);
    sonidoLluvia.connect(canalEfectos);
    fuente.start();
    aplicar();
    aplicarLluvia();
    siguiente = ctx.currentTime + 0.2;
    setInterval(programarMusica, 100);
  }

  function aplicar() {
    if (ctx) {
      canalMusica.gain.value = ajustes.musica ? 0.45 * ajustes.volMusica : 0;
      canalEfectos.gain.value = ajustes.efectos ? 0.8 * ajustes.volEfectos : 0;
    }
    try { localStorage.setItem(CLAVE, JSON.stringify(ajustes)); } catch (e) { /* sin almacenamiento */ }
    for (const [id, nombre, clave] of [['botonMusica', 'Música', 'musica'], ['botonEfectos', 'Sonidos', 'efectos']]) {
      const b = document.getElementById(id);
      if (b) b.textContent = nombre + ': ' + (ajustes[clave] ? 'sí' : 'no');
    }
  }

  function aplicarLluvia() {
    if (!ctx) return;
    const t = ctx.currentTime;
    filtroMusica.frequency.setTargetAtTime(enLluvia ? 850 : 18000, t, 1.2);
    sonidoLluvia.gain.setTargetAtTime(enLluvia ? 0.18 : 0, t, 1.2);
  }
  function lluvia(si) { if (enLluvia !== si) { enLluvia = si; aplicarLluvia(); } }

  function alternar(clave) { ajustes[clave] = !ajustes[clave]; aplicar(); }
  function volumen(clave, valor) { ajustes[clave] = Math.max(0, Math.min(1, valor)); aplicar(); }

  // 'C4', 'A#3'... -> frecuencia en Hz
  function hz(nombre) {
    const semitono = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[nombre[0]] + (nombre[1] === '#' ? 1 : 0);
    const octava = Number(nombre[nombre.length - 1]);
    return 440 * Math.pow(2, (semitono - 9 + (octava - 4) * 12) / 12);
  }

  // Una nota suave: sube rapido, se apaga despacio. "hasta" desliza el tono.
  function nota(canal, frec, cuando, dur, vol, tipo = 'triangle', hasta = 0) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(frec, cuando);
    if (hasta) o.frequency.exponentialRampToValueAtTime(hasta, cuando + dur);
    g.gain.setValueAtTime(0.0001, cuando);
    g.gain.linearRampToValueAtTime(vol, cuando + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, cuando + dur);
    o.connect(g);
    g.connect(canal);
    o.start(cuando);
    o.stop(cuando + dur + 0.05);
  }

  // Soplo de ruido filtrado: agua, hojas, madera.
  function ruido(cuando, dur, vol, frecFiltro) {
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const datos = buf.getChannelData(0);
    for (let i = 0; i < n; i++) datos[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const fuente = ctx.createBufferSource(), filtro = ctx.createBiquadFilter(), g = ctx.createGain();
    fuente.buffer = buf;
    filtro.type = 'bandpass';
    filtro.frequency.value = frecFiltro;
    g.gain.value = vol;
    fuente.connect(filtro);
    filtro.connect(g);
    g.connect(canalEfectos);
    fuente.start(cuando);
  }

  function arpegio(t, notas, paso, vol = 0.22) {
    notas.forEach((n, i) => nota(canalEfectos, hz(n), t + i * paso, 0.22, vol));
  }

  const PENTA = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6'];
  // Cada efecto recibe la hora de inicio y un numero opcional (p. ej. cuantos aciertos llevas).
  const EFECTOS = {
    plantar:  t => nota(canalEfectos, 300, t, 0.12, 0.25, 'sine', 460),
    regar:    t => { ruido(t, 0.35, 0.35, 1800); nota(canalEfectos, 620, t, 0.2, 0.08, 'sine', 320); },
    crecer:   t => nota(canalEfectos, 780, t, 0.1, 0.06, 'sine', 1040),
    cosechar: t => arpegio(t, ['C5', 'E5', 'G5', 'C6'], 0.07),
    lanzar:   t => { nota(canalEfectos, 700, t, 0.25, 0.15, 'sine', 260); ruido(t + 0.2, 0.15, 0.25, 2500); },
    pica:     t => { nota(canalEfectos, 880, t, 0.08, 0.22); nota(canalEfectos, 1175, t + 0.1, 0.14, 0.22); },
    acierto:  (t, n) => { nota(canalEfectos, 587 + 110 * n, t, 0.18, 0.22); nota(canalEfectos, (587 + 110 * n) * 2, t, 0.18, 0.08); },
    fallo:    t => nota(canalEfectos, 190, t, 0.12, 0.14, 'sine', 150),
    escapo:   t => nota(canalEfectos, 420, t, 0.3, 0.12, 'sine', 240),
    pez:      t => arpegio(t, ['G4', 'C5', 'E5', 'G5'], 0.07),
    dorado:   t => arpegio(t, ['C5', 'E5', 'G5', 'B5', 'D6', 'G6'], 0.08),
    // Tejer: cada punto es una nota de la escala pentatonica (suena a melodia, nunca desafina) y con racha
    // se le suma un tintineo; enredarse es un "boing" suave; el cojin sale con un soplido mullido.
    punto:    (t, n) => { const f = hz(PENTA[n % PENTA.length]); nota(canalEfectos, f, t, 0.16, 0.2); nota(canalEfectos, f * 2, t, 0.1, 0.05, 'sine'); },
    racha:    (t, n) => arpegio(t + 0.05, n >= 6 ? ['E6', 'G6', 'C7'] : ['G6', 'C7'], 0.05, 0.07),
    enredo:   t => { nota(canalEfectos, 330, t, 0.1, 0.1, 'sine', 300); nota(canalEfectos, 262, t + 0.09, 0.14, 0.09, 'sine', 247); },
    patines:  t => { nota(canalEfectos, 520, t, 0.05, 0.12, 'square', 520); nota(canalEfectos, 780, t + 0.06, 0.08, 0.1, 'square', 1040); },   // clic-clac de las hebillas
    cojin:    t => { ruido(t, 0.18, 0.25, 600); nota(canalEfectos, 180, t, 0.16, 0.12, 'sine', 260); },
    bufanda:  t => arpegio(t, ['E5', 'G5', 'B5', 'E6'], 0.08),
    colocar:  t => { nota(canalEfectos, 210, t, 0.1, 0.3, 'triangle', 120); ruido(t, 0.05, 0.2, 900); },
    recoger:  t => nota(canalEfectos, 300, t, 0.1, 0.2, 'sine', 540),
    dormir:   t => arpegio(t, ['G5', 'E5', 'C5', 'G4'], 0.16, 0.14),
    cursor:   t => nota(canalEfectos, 700, t, 0.04, 0.07, 'sine'),
    elegir:   t => nota(canalEfectos, 520, t, 0.06, 0.15),
    abrir:    t => { nota(canalEfectos, 520, t, 0.07, 0.15); nota(canalEfectos, 700, t + 0.07, 0.09, 0.15); },
    // Cavar: golpe de pala en la tierra (mas agudo con cada capa), el "pop" del tesoro y el pitido de Pipi
    pala:     (t, n) => { ruido(t, 0.14, 0.4, 420 + 90 * n); nota(canalEfectos, 150 + 30 * n, t, 0.12, 0.22, 'triangle', 90); },
    pop:      t => { nota(canalEfectos, 260, t, 0.09, 0.3, 'sine', 980); arpegio(t + 0.09, ['E5', 'G5', 'C6'], 0.06, 0.16); },
    pip:      (t, n) => nota(canalEfectos, 1320 + 160 * n, t, 0.05, 0.05, 'sine'),
  };

  function tocar(nombre, n = 0) {
    if (!ctx || !ajustes.efectos || !EFECTOS[nombre]) return;
    EFECTOS[nombre](ctx.currentTime + 0.01, n);
  }

  // Musica: una melodia original de 8 compases que se repite, con un bajo muy sencillo.
  // Cada compas tiene 8 pasos; '.' es silencio.
  const TEMPO = 84, TEMPO_LLUVIA = 68;
  const MELODIA = [
    'E4 . G4 . C5 . G4 .',
    'A4 . C5 . E5 . C5 A4',
    'F4 . A4 . C5 . A4 .',
    'G4 . B4 . D5 . . .',
    'E5 . D5 C5 G4 . E4 .',
    'A4 . . C5 E5 . D5 .',
    'C5 . A4 . F4 . A4 .',
    'G4 . . . D5 . B4 .',
  ].map(compas => compas.split(' '));
  const BAJO = [['C3', 'G3'], ['A2', 'E3'], ['F2', 'C3'], ['G2', 'D3']];
  let siguiente = 0, paso = 0;
  // Fase (0 a 1) dentro del pulso de la musica (una negra = 2 pasos): para que lo de la pantalla brille a su ritmo.
  // Sin musica sonando, sigue el mismo tempo con el reloj del navegador.
  function pulso() {
    const PASO = 60 / (enLluvia ? TEMPO_LLUVIA : TEMPO) / 2;
    if (!ctx || !ajustes.musica) return (performance.now() / 1000 / (PASO * 2)) % 1;
    const t = ctx.currentTime - (siguiente - paso * PASO);
    return ((t / (PASO * 2)) % 1 + 1) % 1;
  }

  function programarMusica() {
    if (!ajustes.musica) { siguiente = ctx.currentTime + 0.2; return; }
    const PASO = 60 / (enLluvia ? TEMPO_LLUVIA : TEMPO) / 2;
    while (siguiente < ctx.currentTime + 0.3) {
      const compas = Math.floor(paso / 8) % MELODIA.length, p = paso % 8;
      const n = MELODIA[compas][p];
      if (n !== '.') nota(canalMusica, hz(n), siguiente, PASO * 2.2, 0.16, 'triangle');
      if (p === 0) nota(canalMusica, hz(BAJO[compas % 4][0]), siguiente, PASO * 3.5, 0.2, 'sine');
      if (p === 4) nota(canalMusica, hz(BAJO[compas % 4][1]), siguiente, PASO * 3.5, 0.14, 'sine');
      siguiente += PASO;
      paso++;
    }
  }

  addEventListener('keydown', iniciar);
  addEventListener('pointerdown', iniciar);
  addEventListener('DOMContentLoaded', () => {
    for (const [id, clave] of [['botonMusica', 'musica'], ['botonEfectos', 'efectos']]) {
      const b = document.getElementById(id);
      if (b) b.addEventListener('click', () => { b.blur(); alternar(clave); });
    }
    for (const clave of ['volMusica', 'volEfectos']) {
      const barra = document.getElementById(clave);
      if (!barra) continue;
      barra.value = Math.round(ajustes[clave] * 100);
      barra.addEventListener('input', () => volumen(clave, barra.value / 100));
      barra.addEventListener('change', () => { barra.blur(); if (clave === 'volEfectos') tocar('elegir'); });
    }
    aplicar();
  });

  return { tocar, alternar, volumen, lluvia, pulso, ajustes };
})();
