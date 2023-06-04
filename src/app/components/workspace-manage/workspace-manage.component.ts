import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { WorkspaceListComponent } from './workspace-list/workspace-list.component';
import { WorkspaceCreateComponent } from './workspace-create/workspace-create.component';

@Component({
  selector: 'app-workspace-manage',
  templateUrl: './workspace-manage.component.html',
  styleUrls: ['./workspace-manage.component.scss', '../modal/modal-inner.scss'],
})
export class WorkspaceManageComponent implements AfterViewInit {
  @ViewChild('settingArea', { read: ViewContainerRef })
  settingAreaVcr!: ViewContainerRef;

  activeTab = 'list';

  readonly tabs = [
    {
      id: 'list',
      name: '一覧',
      component: WorkspaceListComponent,
    },
    {
      id: 'create',
      name: '作成',
      component: WorkspaceCreateComponent,
    },
  ];

  ngAfterViewInit() {
    this.switchSetting(this.tabs[0].id);
  }

  switchSetting(tabId: string) {
    this.activeTab = tabId;
    this.settingAreaVcr.clear();
    const component = this.tabs.find((s) => s.id === tabId)?.component;
    if (!component) {
      return;
    }
    this.settingAreaVcr.createComponent(component);
  }
}
