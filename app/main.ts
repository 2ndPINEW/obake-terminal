import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { loadData, saveData } from './utils/save-data';

let window: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve');

function createWindow(): BrowserWindow {
  const { x, y, width, height, isFullScreen } = loadData(
    'userData.restore-window-state'
  );

  // Create the browser window.
  window = new BrowserWindow({
    x: x,
    y: y,
    width: width,
    height: height,
    fullscreen: isFullScreen,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve,
      contextIsolation: false, // false if you want to run e2e test with Spectron
    },
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    window.loadURL('http://localhost:4200');

    window.webContents.openDevTools();
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    window.loadURL(url.href);
  }

  window.on('close', () => {
    if (!window) {
      return;
    }
    saveData({
      key: 'userData.restore-window-state',
      data: {
        x: window.getPosition()[0],
        y: window.getPosition()[1],
        width: window.getSize()[0],
        height: window.getSize()[1],
        isFullScreen: window.isFullScreen(),
      },
    });
  });

  // Emitted when the window is closed.
  window.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    window = null;
  });

  return window;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
app.on('ready', () => setTimeout(createWindow, 400));

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (window === null) {
    createWindow();
  }
});
