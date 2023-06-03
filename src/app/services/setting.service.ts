import { Injectable } from '@angular/core';
import { ElectronService } from './electron/electron.service';
import { SETTING_MANAGER_CHANNEL } from '../../../app/shared/constants/channel';
import { Observable, filter, first, map } from 'rxjs';
import { DataBlock } from '../../../app/utils/save-data';

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  constructor(private readonly electronService: ElectronService) {}

  readSetting$<T extends DataBlock['key']>(
    key: T
  ): Observable<Extract<DataBlock, { key: T }>> {
    this.electronService.send(SETTING_MANAGER_CHANNEL, {
      requestSettingRead: key,
    });

    return this.electronService.on$(SETTING_MANAGER_CHANNEL).pipe(
      filter((data) => !!data.setting),
      first(),
      map((data) => data.setting as DataBlock)
    ) as Observable<any>;
  }

  saveSetting$(setting: DataBlock) {
    const requestId = Math.random().toString(36).slice(2);
    this.electronService.send(SETTING_MANAGER_CHANNEL, {
      requestSettingWrite: {
        requestId,
        ...setting,
      },
    });

    return this.electronService.on$(SETTING_MANAGER_CHANNEL).pipe(
      filter(
        (data) =>
          !!data.settingWriteStatus &&
          data.settingWriteStatus.requestId === requestId
      ),
      first(),
      map((data) => data.settingWriteStatus?.status ?? 'error')
    );
  }
}
