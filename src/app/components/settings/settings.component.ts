import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FontSettingComponent } from './font-setting/font-setting.component';
import { GeneralSettingComponent } from './general-setting/general-setting.component';
import { ShortcutSettingComponent } from './shortcut-setting/shortcut-setting.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements AfterViewInit {
  @ViewChild('settingArea', { read: ViewContainerRef })
  settingAreaVcr!: ViewContainerRef;

  activeSetting = 'general';

  readonly settings = [
    {
      id: 'general',
      name: '一般',
      component: GeneralSettingComponent,
    },
    {
      id: 'shortcut',
      name: 'ショートカット',
      component: ShortcutSettingComponent,
    },
    {
      id: 'font',
      name: 'フォント',
      component: FontSettingComponent,
    },
  ];

  ngAfterViewInit() {
    this.switchSetting(this.settings[0].id);
  }

  switchSetting(settingId: string) {
    this.activeSetting = settingId;
    this.settingAreaVcr.clear();
    const component = this.settings.find((s) => s.id === settingId)?.component;
    if (!component) {
      return;
    }
    this.settingAreaVcr.createComponent(component);
  }
}
