import { Component, OnInit } from '@angular/core';
import { SettingService } from '../../../services/setting.service';
import { ExtractDataBlockTypeByKey } from '../../../../../app/utils/save-data';

@Component({
  selector: 'app-general-setting',
  templateUrl: './general-setting.component.html',
  styleUrls: ['./general-setting.component.scss'],
})
export class GeneralSettingComponent implements OnInit {
  setting: ExtractDataBlockTypeByKey<'configData.app-config'> | undefined;

  constructor(private settingService: SettingService) {}

  ngOnInit(): void {
    this.settingService
      .readSetting$('configData.app-config')
      .subscribe((setting) => {
        this.setting = setting as any;
      });
  }

  saveSetting() {
    if (!this.setting) {
      return;
    }
    this.settingService.saveSetting$(this.setting).subscribe();
  }
}
