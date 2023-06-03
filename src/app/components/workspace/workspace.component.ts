import { Component, HostListener } from '@angular/core';
import { WorkspaceService } from '../../services/workspace.service';
import { ModalService } from '../../services/modal.service';
import { SettingsComponent } from '../settings/settings.component';
import { WorkspaceManageComponent } from '../workspace-manage/workspace-manage.component';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent {
  readonly workspaceManagerInfo$ = this.workspaceService.workspaceManagerInfo$;
  readonly activeWorkspace$ = this.workspaceService.activeWorkspace$;

  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly modalService: ModalService
  ) {}

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    console.log('workspace.component.ts', event);
    if (event.code === 'KeyS' && event.metaKey) {
      this.modalService.openOrClose(SettingsComponent);
    }
    if (event.code === 'Quote' && event.metaKey) {
      this.modalService.openOrClose(WorkspaceManageComponent);
    }
  }
}
