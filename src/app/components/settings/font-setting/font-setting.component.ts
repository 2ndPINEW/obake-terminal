import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FontFamily,
  LocalFontService,
} from '../../../services/local-font.service';
import { map, of, switchMap } from 'rxjs';
import { SettingService } from '../../../services/setting.service';

@Component({
  selector: 'app-font-setting',
  templateUrl: './font-setting.component.html',
  styleUrls: ['./font-setting.component.scss'],
})
export class FontSettingComponent implements OnInit {
  fontFamilies: FontFamily[] = [];

  queryValue = '';

  currentFontFamily$ = this.localFontService.currentFontFamily$;

  constructor(
    private localFontService: LocalFontService,
    private settingService: SettingService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateList();
  }

  updateList(): void {
    this.localFontService
      .fontFamilies$()
      .pipe(
        map((families) =>
          families.filter((family) =>
            family.query
              .toLocaleLowerCase()
              .includes(this.queryValue.toLocaleLowerCase())
          )
        )
      )
      .subscribe((families) => {
        this.fontFamilies = families;
      });
  }

  handleClick(family: string): void {
    const key = 'configData.app-config';
    this.settingService
      .readSetting$(key)
      .pipe(
        switchMap((setting) =>
          this.settingService.saveSetting$({
            key,
            data: {
              ...setting.data,
              fontFamily: family,
            },
          })
        ),
        switchMap((status) => {
          if (status === 'success') {
            return this.localFontService.switchFontFamily$(family);
          }
          return of();
        })
      )
      .subscribe(() => {
        this.cdRef.detectChanges();
      });
  }

  onValueChange(): void {
    this.updateList();
  }
}
