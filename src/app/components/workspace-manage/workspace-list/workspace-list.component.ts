import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Workspace } from '../../../../../app/shared/workspace';
import { WorkspaceService } from '../../../services/workspace.service';
import { first } from 'rxjs';
import { ElectronService } from '../../../services/electron/electron.service';
import { WORKSPACE_MANAGER_CHANNEL } from '../../../../../app/shared/constants/channel';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-workspace-list',
  templateUrl: './workspace-list.component.html',
  styleUrls: ['./workspace-list.component.scss'],
})
export class WorkspaceListComponent implements OnInit, AfterViewInit {
  @ViewChild('inputArea') inputAreaRef!: ElementRef<HTMLInputElement>;

  inputValue = '';

  activeIndex = 0;

  displayWorkspaces: Workspace[] = [];

  private workspaces: Workspace[] = [];

  constructor(
    private workspaceService: WorkspaceService,
    private cdRef: ChangeDetectorRef,
    private electronService: ElectronService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.workspaceService.workspaceManagerInfo$
      .pipe(first())
      .subscribe((info) => {
        this.workspaces = info.workspaces;
        this.updateShowList();
        this.cdRef.detectChanges();
      });
  }

  ngAfterViewInit(): void {
    this.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      this.activeIndex = Math.max(0, this.activeIndex - 1);
      return;
    }
    if (event.key === 'ArrowDown') {
      this.activeIndex = Math.min(
        this.workspaces.length - 1,
        this.activeIndex + 1
      );
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit();
      return;
    }
    setTimeout(() => {
      this.updateShowList();
    });
  }

  onBlur(): void {
    this.focus();
  }

  submit(): void {
    const workspace = this.displayWorkspaces[this.activeIndex];
    if (workspace) {
      this.electronService.send(WORKSPACE_MANAGER_CHANNEL, {
        requestWorkspaceSwitch: workspace.id,
      });
      this.modalService.close();
    }
  }

  focus(): void {
    this.inputAreaRef.nativeElement.focus();
  }

  updateShowList(): void {
    this.displayWorkspaces = this.workspaces.filter((workspace) =>
      workspace.name.includes(this.inputValue)
    );
  }
}
