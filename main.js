const path = require('path');
const url = require('url');
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { ipcRenderer } = require('electron');

require('electron-reload')(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`)
});

let mainWindow;

app.on('ready', () => {
  console.log("App worked...");

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: true,       // Node.js entegrasyonunu etkinleştir
      contextIsolation: false      // Bağlam izolasyonunu devre dışı bırak
  }

  });

  mainWindow.setMenu(null); // Menüyü tamamen kaldırır

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  mainWindow.webContents.openDevTools(); // DevTools'u aç

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('show-alert', (event, message) => {
  dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Uyarı',
      message: message,
      buttons: ['Tamam']
  });
});

