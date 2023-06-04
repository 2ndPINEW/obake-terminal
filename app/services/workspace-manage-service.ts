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
  Workspace,
  WorkspaceManagerInfo,
  WorkspaceManagerMode,
} from '../shared/workspace';
import { listWorkspace } from '../utils/workspace';

export class WorkspaceManageService {
  private electronWindow: BrowserWindow;

  private subscription = new Subscription();

  private ipcMainRawEvent$ = new Subject<{
    event: IpcMainEvent;
    arg: string;
  }>();

  private mode: WorkspaceManagerMode = 'MANAGED';

  private workspaces: Workspace[] = [];

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
        this.switchWorkspace(workspaceId);
      })
    );

    this.subscription.add(
      this.ipcMainWorkspaceAddRequest$.subscribe((workspace) => {
        console.log('WorkspaceAddRequest', workspace);
        // this.addWorkspace(workspace);
      })
    );
  }

  updateWorkspaceList() {
    this.workspaces = listWorkspace().map((workspace) => {
      const current = this.workspaces.find((w) => w.id === workspace.id);
      return {
        ...workspace,
        status: current?.status || workspace.status,
        color: current?.color || workspace.color,
      };
    });
  }

  getWorkspaceManagerInfo(): WorkspaceManagerInfo {
    this.updateWorkspaceList();
    return {
      mode: this.mode,
      workspaces: this.workspaces,
    };
  }

  addWorkspace(data: RequestWorkspaceAdd) {
    // this.workspaces = this.workspaces.map((workspace) => {
    //   return {
    //     ...workspace,
    //     status: workspace.status === 'ACTIVE' ? 'BACKGROUND' : workspace.status,
    //   };
    // });
    // const workspace: Workspace = {
    //   id: workspaceId,
    //   name: workspaceId,
    //   cwd: '/',
    //   color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    //   status: 'ACTIVE',
    // };
    // this.workspaces.push(workspace);
    // this.sendElectronWindowWorkspaceManagerInfo();
  }

  switchWorkspace(workspaceId: string) {
    this.workspaces = this.workspaces.map((workspace) => {
      if (workspace.id === workspaceId) {
        return {
          ...workspace,
          status: 'ACTIVE',
        };
      } else {
        return {
          ...workspace,
          status: workspace.status === 'ACTIVE' ? 'BACKGROUND' : 'INACTIVE',
        };
      }
    });
    this.sendElectronWindowWorkspaceManagerInfo();
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
