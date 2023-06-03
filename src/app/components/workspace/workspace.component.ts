import { Component, HostListener } from '@angular/core';
import { WorkspaceService } from '../../services/workspace.service';
import { ModalService } from '../../services/modal.service';
import { SettingsComponent } from '../settings/settings.component';

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
    if (event.code === 'KeyS' && event.metaKey) {
      if (this.modalService.isOpen$.value) {
        this.modalService.close();
      } else {
        this.modalService.open(SettingsComponent);
      }
    }
  }
}
