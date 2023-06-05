import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { loadData, saveData } from './utils/save-data';
import { ShellManageService } from './services/shell-manage-service';
import { Logger } from './utils/logger';
import { WorkspaceManageService } from './services/workspace-manage-service';
import { SettingManageService } from './services/setting-manage-service';
import { ApiService } from './services/api-service';

let window: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve');

let workspaceManageServiceInstance: WorkspaceManageService | null = null;
let shellManageServiceInstance: ShellManageService | null = null;
let settingManageServiceInstance: SettingManageService | null = null;

const server = new ApiService();

function createWindow(): BrowserWindow {
  const { x, y, width, height, isFullScreen } = loadData(
    'userData.restore-window-state'
  );

  const screenWidth = screen.getPrimaryDisplay().size.width;
  const screenHeight = screen.getPrimaryDisplay().size.height;

  const windowX = x > screenWidth || x < 0 ? 0 : x;
  const windowY = y > screenHeight || y < 0 ? 0 : y;
  const windowWidth = width > screenWidth ? screenWidth : width;
  const windowHeight = height > screenHeight ? screenHeight : height;

  Logger.info('windowX', windowX);
  Logger.info('windowY', windowY);
  Logger.info('windowWidth', windowWidth);
  Logger.info('windowHeight', windowHeight);

  // Create the browser window.
  window = new BrowserWindow({
    x: 0,
    y: 0,
    width: 1280,
    height: 720,
    fullscreen: isFullScreen,
    fullscreenable: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve,
      contextIsolation: false, // false if you want to run e2e test with Spectron
    },
  });

  shellManageServiceInstance = new ShellManageService(window);
  settingManageServiceInstance = new SettingManageService(window);
  workspaceManageServiceInstance = new WorkspaceManageService(window);
  server.updateWorkspaceManageService(workspaceManageServiceInstance);

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    window.loadURL('http://localhost:4200');

    setTimeout(() => {
      window?.webContents.openDevTools();
    }, 100);
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
    const position = window.getPosition();
    const size = window.getSize();
    saveData({
      key: 'userData.restore-window-state',
      data: {
        x: position[0],
        y: position[1],
        width: size[0],
        height: size[1],
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
  shellManageServiceInstance?.beforeDestroy();
  shellManageServiceInstance?.beforeDestroy();
  settingManageServiceInstance?.beforeDestroy();
  workspaceManageServiceInstance?.beforeDestroy();
  server.beforeQuit();

  // MEMO: 本来は Mac OS ではQuitしないけど、状態がわからんから消しちゃう
  app.quit();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (window === null) {
    createWindow();
  }
});
