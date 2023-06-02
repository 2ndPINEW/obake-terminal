import { Subject, Subscription, filter, map } from 'rxjs';
import {
  Chunk,
  RequestWorkspaceAdd,
  chunkToString,
  stringToChunk,
} from '../shared/chunk';
import { BrowserWindow, IpcMainEvent, ipcMain } from 'electron';
import { WORKSPACE_MANAGER_CHANNEL } from '../shared/constants/channel';
import {
  WorkspaceManagerInfo,
  WorkspaceManagerMode,
} from '../shared/workspace';

export class WorkspaceManageService {
  private electronWindow: BrowserWindow;

  private subscription = new Subscription();

  private ipcMainRawEvent$ = new Subject<{
    event: IpcMainEvent;
    arg: string;
  }>();

  private mode: WorkspaceManagerMode = 'MANAGED';

  private ipcMainEvent$ = this.ipcMainRawEvent$.pipe(
    map(({ event, arg }) => ({ event, arg: stringToChunk(arg) }))
  );

  private ipcMainRequestWorkspaceManagerInfo$ = this.ipcMainEvent$.pipe(
    filter(({ arg }) => !!arg.requestWorkspaceManagerInfo)
  );

  private ipcMainWorkspaceManagerModeChanged$ = this.ipcMainEvent$.pipe(
    filter(({ arg }) => !!arg.workspaceManagerModeChanged),
    map(({ arg }) => arg.workspaceManagerModeChanged as WorkspaceManagerMode)
  );

  private ipcMainWorkspaceSwitchRequest$ = this.ipcMainEvent$.pipe(
    filter(({ arg }) => !!arg.requestWorkspaceSwitch),
    map(({ arg }) => arg.requestWorkspaceSwitch as string)
  );

  private ipcMainWorkspaceAddRequest$ = this.ipcMainEvent$.pipe(
    filter(({ arg }) => !!arg.requestWorkspaceAdd),
    map(({ arg }) => arg.requestWorkspaceAdd as RequestWorkspaceAdd)
  );

  constructor(electronWindow: BrowserWindow) {
    this.electronWindow = electronWindow;

    ipcMain.on(WORKSPACE_MANAGER_CHANNEL, (event, data) => {
      this.ipcMainRawEvent$.next({ event, arg: data });
    });

    this.subscription.add(
      this.ipcMainRequestWorkspaceManagerInfo$.subscribe(() => {
        this.sendElectronWindowWorkspaceManagerInfo();
      })
    );

    this.subscription.add(
      this.ipcMainWorkspaceManagerModeChanged$.subscribe((mode) => {
        this.mode = mode;
        this.sendElectronWindowWorkspaceManagerInfo();
      })
    );

    this.subscription.add(
      this.ipcMainWorkspaceSwitchRequest$.subscribe((workspaceId) => {
        console.log('WorkspaceSwitchRequest', workspaceId);
        this.sendElectronWindowWorkspaceManagerInfo();
      })
    );

    this.subscription.add(
      this.ipcMainWorkspaceAddRequest$.subscribe((workspace) => {
        console.log('WorkspaceAddRequest', workspace);
        this.sendElectronWindowWorkspaceManagerInfo();
      })
    );
  }

  getWorkspaceManagerInfo(): WorkspaceManagerInfo {
    return {
      mode: this.mode,
      workspaces: [
        {
          name: 'obake-terminal',
          cwd: '/Users/takaseeito/dev/github.com/2ndPINEW/obake-terminal',
          status: 'ACTIVE',
          color: '#5f930b',
          id: 'obake-terminal',
        },
        {
          name: 'obake-terminal2',
          cwd: '/Users/takaseeito/dev/github.com/2ndPINEW/obake-terminal',
          status: 'INACTIVE',
          color: '#8d3c8d',
          id: 'obake-terminal2',
        },
        {
          name: 'obake-terminal3',
          cwd: '/Users/takaseeito/dev/github.com/2ndPINEW/obake-terminal',
          status: 'INACTIVE',
          color: '#78d5c3',
          id: 'obake-terminal3',
        },
      ],
    };
  }

  sendElectronWindowWorkspaceManagerInfo() {
    this.sendElectronWindowChunk({
      workspaceManagerInfo: this.getWorkspaceManagerInfo(),
    });
  }

  sendElectronWindowChunk(data: Chunk) {
    const json = chunkToString(data);
    this.electronWindow.webContents.send(WORKSPACE_MANAGER_CHANNEL, json);
  }

  beforeDestroy() {
    this.subscription.unsubscribe();
  }
}
