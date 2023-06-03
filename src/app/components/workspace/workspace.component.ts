import { Component } from '@angular/core';
import { WorkspaceService } from '../../services/workspace.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent {
  readonly workspaceManagerInfo$ = this.workspaceService.workspaceManagerInfo$;
  readonly activeWorkspace$ = this.workspaceService.activeWorkspace$;

  activePainIndex$ = new BehaviorSubject<number>(0);

  constructor(private readonly workspaceService: WorkspaceService) {}
}
