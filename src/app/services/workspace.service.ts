/* eslint-disable @typescript-eslint/member-ordering */
import { HostListener, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Subject,
  debounceTime,
  filter,
  first,
  map,
  tap,
} from 'rxjs';
import { ElectronService } from './electron/electron.service';
import {
  SHELL_MANAGER_CHANNEL,
  WORKSPACE_MANAGER_CHANNEL,
} from '../../../app/shared/constants/channel';
import { WorkspaceManagerInfo } from '../../../app/shared/workspace';
import { RequestWorkspaceAdd } from '../../../app/shared/chunk';
import { isNotNullOrUndefined } from '../utils/null-guard';

export interface Pain {
  id: string;
  cwd: string;
  history: string[];
  workspaceId: string;
}

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  pains: Pain[] = [];

  activePainIndex$ = new BehaviorSubject<number>(0);

  private readonly requestUpdateWorkspaceManagerInfoSubject$ =
    new Subject<void>();

  constructor(private readonly electronService: ElectronService) {
    this.requestUpdateWorkspaceManagerInfoSubject$
      .pipe(debounceTime(50))
      .subscribe(() => {
        this.requestUpdateWorkspaceManagerInfo();
      });
  }

  /**
   * ワークスペースマネージャーの情報を取得する
   * サブスクライブ時に一度、メインプロセス側から任意のタイミングで値が流れる
   */
  get workspaceManagerInfo$() {
    // リクエストのタイミングをハンドラ登録よりも後にするためにちょっと待つ
    this.requestUpdateWorkspaceManagerInfoSubject$.next();

    return this.electronService.on$(WORKSPACE_MANAGER_CHANNEL).pipe(
      map((data) => data.workspaceManagerInfo),
      isNotNullOrUndefined()
    );
  }

  get activeWorkspace$() {
    return this.workspaceManagerInfo$.pipe(
      map((info) => info.workspaces.find((w) => w.status === 'ACTIVE')),
      map((workspace) => {
        if (!workspace) {
          return null;
        }
        const pains = this.pains.filter((p) => p.workspaceId === workspace.id);

        if (pains.length === 0) {
          pains.push({
            id: Math.random().toString(32).substring(2),
            cwd: workspace.cwd,
            history: [],
            workspaceId: workspace.id,
          });
          this.pains.push(pains[0]);
        }

        return {
          ...workspace,
          pains,
        };
      })
    );
  }

  createPain$(workspaceId: string) {
    this.requestUpdateWorkspaceManagerInfo();
    return this.workspaceManagerInfo$.pipe(
      first(),
      map((info) => {
        const workspace = info.workspaces.find((w) => w.id === workspaceId);
        if (!workspace) {
          return;
        }

        const pain: Pain = {
          id: Math.random().toString(32).substring(2),
          cwd: workspace.cwd,
          history: [],
          workspaceId,
        };
        this.pains.push(pain);
        return pain;
      }),
      tap(() => {
        this.requestUpdateWorkspaceManagerInfo();
      })
    );
  }

  requestUpdateWorkspaceManagerInfo() {
    this.electronService.send(WORKSPACE_MANAGER_CHANNEL, {
      requestWorkspaceManagerInfo: true,
    });
  }

  switchWorkspace(workspaceId: string) {
    this.electronService.send(WORKSPACE_MANAGER_CHANNEL, {
      requestWorkspaceSwitch: workspaceId,
    });
  }

  createWorkspace(v: RequestWorkspaceAdd) {
    this.electronService.send(WORKSPACE_MANAGER_CHANNEL, {
      requestWorkspaceAdd: v,
    });
  }

  workspacePains(workspaceId: string) {
    return this.pains.filter((p) => p.workspaceId === workspaceId);
  }

  pain(id: string): Pain | undefined {
    return this.pains.find((p) => p.id === id);
  }

  destroyAllPain() {
    this.pains.forEach((p) => {
      this.destroyPain(p.id);
    });
  }

  destroyPain(id: string) {
    const index = this.pains.findIndex((p) => p.id === id);
    if (index === -1) {
      return;
    }
    const pain = this.pains[index];
    this.electronService.send(SHELL_MANAGER_CHANNEL, {
      requestPainRemove: pain.id,
    });
    this.pains.splice(index, 1);
  }
}
