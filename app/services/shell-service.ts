import * as os from 'node:os';
import { IPty, spawn } from 'node-pty';
import { BrowserWindow, ipcMain } from 'electron';
import { Subject, Subscription, filter, map } from 'rxjs';
import { IpcMainEvent } from 'electron';
import { chunkToString, stringToChunk } from '../shared/chunk';

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'zsh';

export class ShellService {
  private _id: string;

  private electronWindow: BrowserWindow;

  private ptyProcess: IPty;

  private subscription = new Subscription();

  private ptyProcessData$ = new Subject<string>();

  private ptyProcessExit$ = new Subject<
    Parameters<Parameters<IPty['onExit']>[0]>[0]
  >();

  private ipcMainRawEvent$ = new Subject<{
    event: IpcMainEvent;
    arg: string;
  }>();

  private ipcMainEvent$ = this.ipcMainRawEvent$.pipe(
    map(({ event, arg }) => ({ event, arg: stringToChunk(arg) }))
  );

  private ipcMainInputEventData$ = this.ipcMainEvent$.pipe(
    filter(({ arg }) => !!arg.input),
    map(({ arg }) => arg.input ?? '')
  );

  private ipcMainResizeEvent$ = this.ipcMainEvent$.pipe(
    filter(({ arg }) => !!arg.resize),
    map(({ arg }) => arg.resize ?? { cols: 0, rows: 0 })
  );

  constructor({
    id,
    size,
    cwd,
    electronWindow,
  }: {
    id: string;
    size: { cols: number; rows: number };
    cwd: string;
    electronWindow: BrowserWindow;
  }) {
    this._id = id;
    this.electronWindow = electronWindow;

    this.ptyProcess = spawn(shell, [], {
      name: 'xterm-256color',
      cols: size.cols,
      rows: size.rows,
      cwd: cwd,
    });

    this.ptyProcess.onData((data) => {
      this.ptyProcessData$.next(data);
    });

    this.ptyProcess.onExit((exitCode) => {
      this.ptyProcessExit$.next(exitCode);
    });

    ipcMain.on(this.id, (event, arg) => {
      this.ipcMainRawEvent$.next({ event, arg });
    });

    this.subscription.add(
      this.ptyProcessData$.subscribe((data) => {
        this.sendToPain(data);
      })
    );

    this.subscription.add(
      this.ptyProcessExit$.subscribe((exitCode) => {
        this.sendToPain(`\r\nPain exited with code ${exitCode}`);
        this.beforeDestroy();
      })
    );

    this.subscription.add(
      this.ipcMainInputEventData$.subscribe((input) => {
        this.ptyProcess.write(input);
      })
    );

    this.subscription.add(
      this.ptyProcessData$.subscribe((data) => {
        this.sendToPain(data);
      })
    );

    this.subscription.add(
      this.ipcMainResizeEvent$.subscribe(({ cols, rows }) => {
        this.resize(cols, rows);
      })
    );
  }

  sendToPain = (data: string) => {
    this.electronWindow.webContents.send(
      this.id,
      chunkToString({
        output: data,
      })
    );
  };

  resize(cols: number, rows: number) {
    this.ptyProcess.resize(cols, rows);
  }

  beforeDestroy() {
    this.ptyProcess.kill();
    this.subscription.unsubscribe();
  }

  get id(): string {
    return this._id;
  }
}
