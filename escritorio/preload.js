// Lo unico que el juego puede pedirle a la ventana: cerrarse (boton "Salir del juego" de los ajustes).
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('escritorio', { salir: () => ipcRenderer.send('salir') });
