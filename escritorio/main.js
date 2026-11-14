// Ventana del juego para el .exe: pantalla completa, sin menus. F11 cambia entre ventana y pantalla completa.
// La partida se guarda en localStorage, que Electron deja en la carpeta de datos del usuario (AppData).
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');   // la musica suena sin esperar un clic
if (!app.requestSingleInstanceLock()) app.quit();                             // una sola ventana: dos pisarian la partida

let ventana = null;
function crearVentana() {
  ventana = new BrowserWindow({
    width: 1280, height: 800, fullscreen: true, autoHideMenuBar: true,
    backgroundColor: '#F7E6DA', title: 'Proyecto Estrella', icon: path.join(__dirname, 'icono.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  ventana.loadFile(path.join(__dirname, 'app', 'juego', 'index.html'));
  ventana.webContents.on('before-input-event', (e, tecla) => {
    if (tecla.type === 'keyDown' && tecla.key === 'F11') { ventana.setFullScreen(!ventana.isFullScreen()); e.preventDefault(); }
  });
}

Menu.setApplicationMenu(null);
ipcMain.on('salir', () => app.quit());
app.on('second-instance', () => { if (ventana) { if (ventana.isMinimized()) ventana.restore(); ventana.focus(); } });
app.whenReady().then(crearVentana);
app.on('window-all-closed', () => app.quit());
