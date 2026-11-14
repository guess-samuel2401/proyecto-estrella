// Copia el juego a escritorio/app con la misma forma que en el proyecto (juego/ y arte/sprites/ juntos),
// sin los PNG ampliados _x8 (solo sirven para revisar a ojo).
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..'), app = path.join(__dirname, 'app');
fs.rmSync(app, { recursive: true, force: true });
fs.cpSync(path.join(raiz, 'juego'), path.join(app, 'juego'), { recursive: true });
fs.cpSync(path.join(raiz, 'arte', 'sprites'), path.join(app, 'arte', 'sprites'), {
  recursive: true, filter: f => !f.endsWith('_x8.png'),
});
console.log('Juego copiado en', app);
