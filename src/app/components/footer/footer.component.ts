import { Component } from '@angular/core';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  readonly activeWorkspace$ = this.workspaceService.activeWorkspace$;

  constructor(private readonly workspaceService: WorkspaceService) {}
}
