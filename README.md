# Proyecto Estrella

Un juego de escritorio 2D en pixel art, tierno y relajante: una gatita rosa cultiva, pesca, teje ropa, construye muebles, decora su casa y ayuda a sus vecinos en un valle junto al mar. Sin prisas ni castigos.

## Jugar
- **Windows:** descarga `Proyecto Estrella.exe` de la ultima [Release](../../releases) y abrelo (no hace falta instalar nada).
- **Navegador:** desde la carpeta del proyecto, `python -m http.server 8123` y abre http://localhost:8123/juego/

Teclas: flechas o WASD para moverse, Mayus para patinar, Espacio/E para actuar, H para la ayuda.

## Estructura
- `juego/`: el juego (HTML + JavaScript sin dependencias, sonido sintetizado con WebAudio).
- `arte/`: paleta, disenos de sprites como texto y los scripts que generan los PNG.
- `escritorio/`: empaquetado con Electron (`npm install` y `npm run exe`).
- `trailer/`: script que graba el trailer con gameplay real.
