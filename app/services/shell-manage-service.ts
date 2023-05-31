import { Subject, Subscription, filter, map, tap } from 'rxjs';
import { app } from 'electron';
import {
  Chunk,
  CreatePainChunk,
  chunkToString,
  stringToChunk,
} from '../../shared/chunk';
import { SHELL_MANAGER_CHANNEL } from '../../shared/constants/channel';
import { ShellService } from './shell-service';
import { IpcMainEvent, ipcMain } from 'electron';
import { Logger } from '../utils/logger';

export class ShellManageService {
  shellServices: ShellService[] = [];

  electronWindow: Electron.BrowserWindow;

  private subscription = new Subscription();

  private ipcMainRawEvent$ = new Subject<{
    event: IpcMainEvent;
    arg: string;
  }>();

  private ipcMainEvent$ = this.ipcMainRawEvent$.pipe(
    tap(({ event, arg }) => {
      Logger.debug('ipcMainEvent$', arg);
    }),
    map(({ event, arg }) => ({ event, arg: stringToChunk(arg) }))
  );

  private ipcMainCreatePainEventData$ = this.ipcMainEvent$.pipe(
    filter(({ arg }) => !!arg.createPain),
    map(({ arg }) => arg.createPain as CreatePainChunk)
  );

  constructor(electronWindow: Electron.BrowserWindow) {
    this.electronWindow = electronWindow;

    ipcMain.on(SHELL_MANAGER_CHANNEL, (event, data) => {
      this.ipcMainRawEvent$.next({ event, arg: data });
    });

    this.subscription.add(
      this.ipcMainCreatePainEventData$.subscribe((data) => {
        this.createShell(data);
      })
    );

    this.electronWindow.once('close', () => {
      this.beforeQuit();
    });

    app.on('before-quit', () => {
      this.beforeQuit();
    });
  }

  createShell({ id, size, cwd }: CreatePainChunk) {
    if (this.shellServices.some((shell) => shell.id === id)) {
      this.sendElectronWindowChunk(id, {
        createPainError: { id: id, message: 'Already exists' },
      });
      console.log(`Already exists: ${id}`);
      return;
    }

    const shellService = new ShellService({
      id: id,
      size: size,
      cwd: cwd,
      electronWindow: this.electronWindow,
    });

    this.shellServices.push(shellService);
  }

  removeShell({ id }: { id: string }) {
    const shellService = this.shellServices.find(
      (shellService) => shellService.id === id
    );
    this.shellServices = this.shellServices.filter(
      (shellService) => shellService.id !== id
    );
    shellService?.beforeDestroy();
  }

  sendElectronWindowChunk(id: string, data: Chunk) {
    const json = chunkToString(data);
    this.electronWindow.webContents.send(id, json);
  }

  beforeDestroy() {
    this.subscription.unsubscribe();
  }

  beforeQuit() {
    this.shellServices.forEach((shellService) => shellService.beforeDestroy());
  }
}
