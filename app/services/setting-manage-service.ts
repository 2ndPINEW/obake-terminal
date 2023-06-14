import { Subject, Subscription, map } from 'rxjs';
import { Chunk, chunkToString, stringToChunk } from '../shared/chunk';
import { BrowserWindow, IpcMainEvent, ipcMain } from 'electron';
import { SETTING_MANAGER_CHANNEL } from '../shared/constants/channel';
import { saveData } from '../utils/save-data';
import { loadData } from '../utils/save-data';
import { Logger } from '../utils/logger';
import { isNotNullOrUndefined } from '../../src/app/utils/null-guard';

export class SettingManageService {
  private electronWindow: BrowserWindow;

  private subscription = new Subscription();

  private ipcMainRawEvent$ = new Subject<{
    event: IpcMainEvent;
    arg: string;
  }>();

  private ipcMainEvent$ = this.ipcMainRawEvent$.pipe(
    map(({ event, arg }) => ({ event, arg: stringToChunk(arg) }))
  );

  private ipcMainRequestSettingRead$ = this.ipcMainEvent$.pipe(
    map(({ arg }) => arg.requestSettingRead),
    isNotNullOrUndefined()
  );

  private ipcMainRequestSettingWrite$ = this.ipcMainEvent$.pipe(
    map(({ arg }) => arg.requestSettingWrite),
    isNotNullOrUndefined()
  );

  constructor(electronWindow: BrowserWindow) {
    this.electronWindow = electronWindow;

    ipcMain.on(SETTING_MANAGER_CHANNEL, (event, data) => {
      this.ipcMainRawEvent$.next({ event, arg: data });
    });

    this.subscription.add(
      this.ipcMainRequestSettingRead$.subscribe((key) => {
        const data = loadData(key);
        this.sendData({
          setting: {
            key: key as any,
            data: data as any,
          },
        });
      })
    );

    this.subscription.add(
      this.ipcMainRequestSettingWrite$.subscribe((data) => {
        try {
          saveData(data);
          this.sendData({
            settingWriteStatus: {
              requestId: data.requestId,
              status: 'success',
            },
          });
        } catch (e) {
          Logger.error('error', e);
          this.sendData({
            settingWriteStatus: {
              requestId: data.requestId,
              status: 'error',
            },
          });
        }
      })
    );
  }

  sendData(data: Chunk) {
    this.electronWindow.webContents.send(
      SETTING_MANAGER_CHANNEL,
      chunkToString(data)
    );
  }

  beforeDestroy() {
    this.subscription.unsubscribe();
  }
}
