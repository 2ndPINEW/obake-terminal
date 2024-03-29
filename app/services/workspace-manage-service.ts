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
import {
  addWorkspaceStep0ParseUrl,
  addWorkspaceStep1Clone,
  addWorkspaceStep2CreateCodeWorkspace,
  listWorkspace,
} from '../utils/workspace';
import { Logger } from '../utils/logger';
import { isNotNullOrUndefined } from '../utils/null-guard';

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
    map(({ arg }) => arg.workspaceManagerModeChanged),
    isNotNullOrUndefined()
  );

  private ipcMainWorkspaceSwitchRequest$ = this.ipcMainEvent$.pipe(
    map(({ arg }) => arg.requestWorkspaceSwitch),
    isNotNullOrUndefined()
  );

  private ipcMainWorkspaceAddRequest$ = this.ipcMainEvent$.pipe(
    map(({ arg }) => arg.requestWorkspaceAdd),
    isNotNullOrUndefined()
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
      this.ipcMainWorkspaceAddRequest$.subscribe(async (workspace) => {
        Logger.debug('WorkspaceAddRequest', workspace);
        await this.addWorkspace(workspace);
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

  addWorkspace = async (data: RequestWorkspaceAdd) => {
    try {
      this.sendElectronWindowChunk({
        workspaceAddProgress: {
          step: 0,
          message: 'Checking url and name',
        },
      });

      const { host, user, repoName, error, localRepositoryPath } =
        addWorkspaceStep0ParseUrl(data);

      if (error || !host || !user || !repoName || !localRepositoryPath) {
        Logger.debug('Check error', error);
        this.sendElectronWindowChunk({
          workspaceAddProgress: {
            step: 0,
            message: `Check error: ${error}`,
            failed: true,
          },
        });
        return;
      }
      this.sendElectronWindowChunk({
        workspaceAddProgress: {
          step: 0,
          message: `Check success: ${host}/${user}/${repoName}`,
        },
      });

      this.sendElectronWindowChunk({
        workspaceAddProgress: {
          step: 1,
          message: `Cloning from ${data.url} to ${localRepositoryPath}`,
        },
      });

      const { result } = await addWorkspaceStep1Clone({
        gitUrl: data.url,
        localRepositoryPath,
      });

      this.sendElectronWindowChunk({
        workspaceAddProgress: {
          step: 1,
          message: `Clone ${result}`,
          failed: result === 'failure',
        },
      });

      this.sendElectronWindowChunk({
        workspaceAddProgress: {
          step: 2,
          message: 'Creating code workspace',
        },
      });

      const { filePath } = addWorkspaceStep2CreateCodeWorkspace({
        localRepositoryPath,
        name: data.name,
      });

      this.sendElectronWindowChunk({
        workspaceAddProgress: {
          step: 2,
          message: 'Create code workspace success',
        },
      });

      this.sendElectronWindowChunk({
        workspaceAddProgress: {
          step: 3,
          message: 'Switching workspace',
        },
      });

      this.updateWorkspaceList();
      this.switchWorkspace(filePath);

      this.sendElectronWindowChunk({
        workspaceAddProgress: {
          step: 3,
          message: 'Switch workspace success',
        },
      });
    } catch (error) {
      this.sendElectronWindowChunk({
        workspaceAddProgress: {
          step: 100,
          message: `Unhandled error: ${error}`,
          failed: true,
        },
      });
    }
  };

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
