import { Component } from '@angular/core';
import { ElectronService } from '../../../services/electron/electron.service';
import { gitUrlRegex } from '../../../../../app/shared/constants/workspace';
import { WORKSPACE_MANAGER_CHANNEL } from '../../../../../app/shared/constants/channel';
import { filter, map, tap } from 'rxjs';

@Component({
  selector: 'app-workspace-create',
  templateUrl: './workspace-create.component.html',
  styleUrls: ['./workspace-create.component.scss'],
})
export class WorkspaceCreateComponent {
  name = '';
  url = '';

  isFailed = false;
  logs: string[][] = [];

  constructor(private electronService: ElectronService) {
    this.electronService
      .on$(WORKSPACE_MANAGER_CHANNEL)
      .pipe(
        filter((v) => !!v.workspaceAddProgress),
        map((v) => v.workspaceAddProgress),
        tap((v) => {
          if (v?.failed) {
            this.isFailed = true;
          }
        })
      )
      .subscribe((event) => {
        if (!event) {
          return;
        }
        if (this.logs.length <= event.step) {
          this.logs.push([]);
        }
        this.logs[event.step].push(event.message);
      });
  }

  create() {
    this.logs = [];
    if (!this.name) {
      this.logs.push(['invalid name']);
      console.log('invalid name');
      return;
    }
    if (!this.url.match(gitUrlRegex)) {
      this.logs.push(['invalid url']);
      console.log('invalid url');
      return;
    }
    this.electronService.send(WORKSPACE_MANAGER_CHANNEL, {
      requestWorkspaceAdd: {
        name: this.name,
        url: this.url as any,
      },
    });
  }
}
